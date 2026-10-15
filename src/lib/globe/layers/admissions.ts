// src/lib/globe/layers/admissions.ts — the countries EM-DAT and UCDP admitted late into their own
// past, at those countries' centroids.
//
// /admissions holds every released version of two registers at once and keeps the account of what
// each keeper quietly changed about its own history: a year gaining a disaster or a conflict long
// after the fact, an entry taken out, a magnitude revised. This layer draws the geography of that
// account — one mark per country per register, its value the number of admitted entries the
// register counts there — read from the two committed watch files, never from a clock: neither
// file is a dated archive with a day axis of its own, so this is the first STATIC layer of the
// globe (`days: []`, `static` carries the one frame), and its marks stand on every day the OTHER
// layers define, the same set every time.
//
// ONE RECORD PER (FILE, COUNTRY), NOT PER (COUNTRY) ACROSS BOTH FILES — a decision, not an
// oversight. Most of the countries here appear in both registers (a disaster admission and a
// conflict admission are not the same kind of event), and summing their counts into one number
// would report a total that is true of neither register. So a country in both gets two marks, one
// per register, each pointing at a real row of the file its own count came from.
//
// TWO RESOLUTIONS THIS LAYER OWNS, BOTH EXPLICIT AND BOTH TESTED AGAINST EVERY ROW OF BOTH FILES:
//   · EM-DAT's key carries the country as an ISO-3-like suffix ("1903-0008-CYM"), and 150 of the
//     154 distinct codes in the file resolve straight through the crosswalk's `byIso3`. Four are
//     EM-DAT's own historical or sub-national labels — codes the modern ISO 3166-1 table this
//     house's crosswalk is built from does not carry a country for — and are aliased below, by
//     hand, to the country the admitted event's own fields say it actually stands in.
//   · UCDP's `where` is a country NAME, not a code, and is matched against the crosswalk's own
//     Wikidata spelling. Two of the eleven distinct names in the file carry a historical
//     parenthetical the crosswalk's spelling does not, and are aliased below the same way.
// A code or a name neither the crosswalk nor these tables can place throws, naming it, rather than
// dropping the country it names — the same rule every adapter on this globe keeps.
import { byIso3, centroidOfIso3, countries, nameOf, type CrosswalkCountry } from '../crosswalk'
import { readJson } from './archive'
import type { GlobeLayer, LayerFrame, LayerRecord } from './types'

const EMDAT_FILE = 'src/data/admissions/emdat.json'
const UCDP_FILE = 'src/data/admissions/ucdp-brd.json'

const nf = new Intl.NumberFormat('en-GB')

interface AdmittedRow {
  key: Array<string | number>
  label: string
  where: string | null
}

interface AdmissionsFile {
  source: { id: string; name: string; keeper: string; licence_notice: string }
  generated: string
  pairs: Array<{ admitted: AdmittedRow[] }>
}

const READOUT = {
  mark: '{country} · {n} admitted entries',
  place: 'the centroid of the country the register names — nothing was measured there',
  caution:
    'a country admitted to both registers carries two marks, one per register: a disaster and a war are not one measure, and this layer never adds their counts together',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their admissions are counted here and drawn nowhere.',
}

/** EM-DAT's own ISO-3-like suffix that this house's crosswalk — built from the current ISO 3166-1
 *  table — does not carry a country for, aliased by hand to the country the admitted event's own
 *  fields (its label, its `where`) say it actually stands in:
 *    · DFR "Germany Federal Republic" (a 1983 storm) — West Germany, before 1990 reunification
 *    · SCG "Serbia Montenegro" (a 2001 flood, "Kolubarska oblast, Mačvanska oblast") — Serbian regions
 *    · SPI "Canary Islands" (2024 storm and flood rows) — Spanish territory, EM-DAT's own regional code
 *    · SUN "Soviet Union" (a 1923 earthquake, "Kamchatka (Russian Federation)") — Russian territory today
 *  A fifth such code throws, naming itself, at `byIso3` below. */
const EMDAT_ISO3_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  DFR: 'DEU',
  SCG: 'SRB',
  SPI: 'ESP',
  SUN: 'RUS',
})

/** UCDP writes a `where` this crosswalk's Wikidata spelling does not carry verbatim, both with a
 *  historical parenthetical the crosswalk's current name drops. A `where` neither this table nor
 *  the crosswalk's own name column can match throws, naming it, at `resolveUcdpCountry` below. */
const UCDP_NAME_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  'DR Congo (Zaire)': 'COD',
  'Yemen (North Yemen)': 'YEM',
})

const BY_WIKIDATA_NAME: ReadonlyMap<string, string> = new Map(countries().map((c) => [c.names.wikidata, c.iso3]))

/** The ISO-3 the last dash-segment of an EM-DAT key names — throws, naming the raw code, where
 *  neither the crosswalk nor `EMDAT_ISO3_ALIASES` can place it. */
export function resolveEmdatIso3(key: string): CrosswalkCountry {
  const raw = key.slice(key.lastIndexOf('-') + 1)
  return byIso3(EMDAT_ISO3_ALIASES[raw] ?? raw)
}

/** The country a UCDP `where` names — throws, naming the place, where neither the crosswalk's own
 *  Wikidata spelling nor `UCDP_NAME_ALIASES` can place it. */
export function resolveUcdpCountry(where: string): CrosswalkCountry {
  const iso3 = BY_WIKIDATA_NAME.get(where) ?? UCDP_NAME_ALIASES[where]
  if (!iso3) {
    throw new Error(
      `admissions/ucdp: no country for UCDP place "${where}" — add it to UCDP_NAME_ALIASES in src/lib/globe/layers/admissions.ts`,
    )
  }
  return byIso3(iso3)
}

interface CountryTally {
  country: CrosswalkCountry
  count: number
  representative: AdmittedRow
  pairIndex: number
  rowIndex: number
}

/** Every admitted row of a file, grouped by the country it resolves to — the first row a country
 *  is seen at becomes the representative the receipt's locator names, so the choice is
 *  deterministic across builds. */
function tally(file: AdmissionsFile, resolve: (row: AdmittedRow) => CrosswalkCountry): Map<string, CountryTally> {
  const byIso3Code = new Map<string, CountryTally>()
  file.pairs.forEach((pair, pairIndex) => {
    pair.admitted.forEach((row, rowIndex) => {
      const country = resolve(row)
      const held = byIso3Code.get(country.iso3)
      if (held) held.count += 1
      else byIso3Code.set(country.iso3, { country, count: 1, representative: row, pairIndex, rowIndex })
    })
  })
  return byIso3Code
}

function recordsOf(
  file: AdmissionsFile,
  filePath: string,
  registerLabel: string,
  resolve: (row: AdmittedRow) => CrosswalkCountry,
  start: number,
  unplaced: string[],
): LayerRecord[] {
  const grouped = [...tally(file, resolve).values()].sort((a, b) => a.country.iso3.localeCompare(b.country.iso3))
  const records: LayerRecord[] = []
  grouped.forEach((entry, n) => {
    const centroid = centroidOfIso3(entry.country.iso3)
    if (!centroid) {
      if (!unplaced.includes(nameOf(entry.country))) unplaced.push(nameOf(entry.country))
      return
    }
    records.push({
      key: `admissions:static:${start + n}`,
      at: { iso3: entry.country.iso3, name: nameOf(entry.country), centroid },
      value: entry.count,
      labelKind: 'centroid',
      receipt: {
        file: filePath,
        locator: `pairs[${entry.pairIndex}].admitted[${entry.rowIndex}] · ${entry.representative.key.join('-')}`,
        words:
          `${nameOf(entry.country)} · ${nf.format(entry.count)} admission${entry.count === 1 ? '' : 's'} to ${registerLabel}, ` +
          `including “${entry.representative.label}”`,
      },
    })
  })
  return records
}

const emdat = readJson<AdmissionsFile>(EMDAT_FILE)
const ucdp = readJson<AdmissionsFile>(UCDP_FILE)
const ASOF = [emdat.generated, ucdp.generated].sort().at(-1)!

function buildStaticFrame(): LayerFrame {
  const unplaced: string[] = []
  const emdatRecords = recordsOf(
    emdat,
    EMDAT_FILE,
    'the EM-DAT disaster register',
    (row) => resolveEmdatIso3(String(row.key[0])),
    0,
    unplaced,
  )
  const ucdpRecords = recordsOf(
    ucdp,
    UCDP_FILE,
    'the UCDP conflict register',
    (row) => resolveUcdpCountry(row.where!),
    emdatRecords.length,
    unplaced,
  )
  const records = [...emdatRecords, ...ucdpRecords]
  const note = unplaced.length > 0 ? READOUT.unplaced.replace('{countries}', unplaced.join(', ')) : undefined
  return note === undefined ? { day: ASOF, records } : { day: ASOF, records, note }
}

const STATIC_FRAME = buildStaticFrame()

export const admissionsLayer: GlobeLayer = {
  id: 'admissions',
  title: 'Admissions',
  kind: 'points',
  owner: { line: 'counter-measurement' },
  asOf: ASOF,
  source: {
    file: `${EMDAT_FILE}, ${UCDP_FILE}`,
    name:
      `${emdat.source.name} and ${ucdp.source.name} — one mark per country per register, its value the number ` +
      'of admitted entries the register counts there; a country in both registers carries two marks, one per ' +
      'register, never one summed mark',
    url: 'https://frankbueltge.de/admissions',
    license: `EM-DAT: “${emdat.source.licence_notice}” — UCDP: “${ucdp.source.licence_notice}”`,
  },
  days: [],
  frame: () => STATIC_FRAME,
  static: STATIC_FRAME,
  readout: READOUT,
}

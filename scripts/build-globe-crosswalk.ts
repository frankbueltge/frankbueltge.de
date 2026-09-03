// Builds src/data/globe/crosswalk.json — the one table that lets the living globe put a record
// on the earth when the record names a country instead of a place.
//
// Why it has to exist: this house writes countries in three code systems at once. GDELT (Balance,
// Invoked Past, the protocol's conflict count) speaks FIPS 10-4, where Germany is `GM` and the
// United Kingdom is `UK`; Natural Earth's polygons carry ISO 3166-1 numeric; EM-DAT keys carry
// ISO 3166-1 alpha-3; the registers and the world chamber count hosts by ccTLD. Reading `UK` as
// Ukraine, or `GM` as Gambia, is a one-character mistake that would silently move a mark two
// thousand kilometres, and no test downstream would notice. So the join is made once, committed,
// and checked.
//
// Nothing here reaches the network. The inputs are four committed files; running the script twice
// on the same commit writes the same bytes, and `--check` fails when the committed file and a
// fresh build disagree.
//
//   npx tsx scripts/build-globe-crosswalk.ts          writes the file
//   npx tsx scripts/build-globe-crosswalk.ts --check  exits non-zero on drift, writes nothing
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = 'src/data/globe/iso-fips.csv'
const ATLAS = 'src/data/globe/countries-110m.json'
const GDELT = 'pipelines/balance/sources_by_country.csv'
const EMDAT = 'src/data/admissions/emdat.json'
const UCDP = 'src/data/admissions/ucdp-brd.json'
const OUT = 'src/data/globe/crosswalk.json'

/** UCDP writes a country's history into its name ("DR Congo (Zaire)", "Yemen (North Yemen)").
 *  The parenthetical is stripped, the remainder matched against every spelling already known —
 *  and whatever still does not match is listed in `unmatched`, never dropped. */
const UCDP_ALIASES: Record<string, string> = {
  'dr congo': 'COD',
  'yemen': 'YEM',
}

/** FIPS codes GDELT's own source list uses that the base table does not carry as a country's
 *  primary code. Both are stated rather than guessed, and both are visible in the built file:
 *   · `RB` — FIPS 10-4 assigns RB to Serbia; Wikidata records `RI` for the same country, and the
 *     GDELT snapshot spells both "Serbia". One country, two codes in one source.
 *   · `WE` — GDELT files "West Bank" as a country. ISO 3166-1 has no code for the West Bank
 *     alone, only `PSE` for Palestine, which is broader. Reading it as Palestine is the closest
 *     honest join and is wider than the source's own unit; the method sheet says so.
 *  What is deliberately NOT aliased: `KV` (Kosovo — ISO has assigned it no code, and the 1:110m
 *  topology draws it without an id, so there is nothing to resolve to) and `OS` ("Oceans" — not
 *  a country at all). Both stay in `unmapped`, where a reader can see them. */
const FIPS_ALIASES: Record<string, string> = {
  RB: 'SRB',
  WE: 'PSE',
}

interface Names {
  atlas?: string
  wikidata: string
  gdelt?: string
  emdat?: string
  ucdp?: string
}

interface CrosswalkCountry {
  iso3: string
  iso2: string
  num: string
  fips: string | null
  cctld: string | null
  names: Names
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bthe\b|\bof\b|\band\b|[^a-z0-9]/g, '')

// ── the base table: ISO codes, FIPS 10-4 and the ccTLD ────────────────────────────────────────
function readBase(): CrosswalkCountry[] {
  const lines = readFileSync(BASE, 'utf8').split('\n').filter((l) => l && !l.startsWith('#'))
  const header = lines.shift()
  if (header !== 'alpha2,alpha3,numeric,fips,cctld,wikidata_label') {
    throw new Error(`${BASE}: unexpected header "${header}"`)
  }
  return lines.map((line) => {
    const [iso2, iso3, num, fips, cctld, label] = line.split(',')
    return {
      iso3,
      iso2,
      num,
      fips: fips || null,
      cctld: cctld || null,
      names: { wikidata: label } as Names,
    }
  })
}

// ── Natural Earth's own spellings, by ISO numeric ─────────────────────────────────────────────
function readAtlasNames(): Map<string, string> {
  const topology = JSON.parse(readFileSync(ATLAS, 'utf8')) as {
    objects: { countries: { geometries: Array<{ id?: string; properties?: { name?: string } }> } }
  }
  const names = new Map<string, string>()
  for (const geometry of topology.objects.countries.geometries) {
    if (geometry.id && geometry.properties?.name) names.set(String(geometry.id).padStart(3, '0'), geometry.properties.name)
  }
  return names
}

// ── GDELT's own spellings, by FIPS 10-4 ───────────────────────────────────────────────────────
function readGdeltNames(): Map<string, string> {
  const lines = readFileSync(GDELT, 'utf8').split('\n')
  const header = lines.shift()
  if (header?.trim() !== 'Domain,FIPS,CountryName') throw new Error(`${GDELT}: unexpected header "${header}"`)
  const names = new Map<string, string>()
  for (const line of lines) {
    const [, fips, ...rest] = line.split(',')
    const name = rest.join(',').trim()
    if (fips && name && !names.has(fips)) names.set(fips, name)
  }
  return names
}

// ── EM-DAT's own spellings, out of the keys the admissions register holds ──────────────────────
interface AdmissionsFile {
  pairs: Array<{ admitted: Array<{ key: Array<string | number>; label: string; where: string | null }> }>
}

function readEmdatNames(): Map<string, string> {
  const file = JSON.parse(readFileSync(EMDAT, 'utf8')) as AdmissionsFile
  const names = new Map<string, string>()
  for (const pair of file.pairs) {
    for (const row of pair.admitted) {
      const key = String(row.key[0])
      const iso3 = key.slice(key.lastIndexOf('-') + 1)
      const name = row.label.includes(' vs ') ? row.label.split(' vs ')[1].trim() : ''
      if (/^[A-Z]{3}$/.test(iso3) && name && !names.has(iso3)) names.set(iso3, name)
    }
  }
  return names
}

function readUcdpPlaces(): string[] {
  const file = JSON.parse(readFileSync(UCDP, 'utf8')) as AdmissionsFile
  const places = new Set<string>()
  for (const pair of file.pairs) for (const row of pair.admitted) if (row.where) places.add(row.where)
  return [...places].sort()
}

// ── the join ──────────────────────────────────────────────────────────────────────────────────
function build(): string {
  const countries = readBase()
  const atlas = readAtlasNames()
  const gdelt = readGdeltNames()
  const emdat = readEmdatNames()

  const byName = new Map<string, string>()
  const remember = (name: string | undefined, iso3: string) => {
    if (name) byName.set(norm(name), iso3)
  }

  for (const country of countries) {
    country.names.atlas = atlas.get(country.num)
    if (country.fips) country.names.gdelt = gdelt.get(country.fips)
    country.names.emdat = emdat.get(country.iso3)
    remember(country.names.wikidata, country.iso3)
    remember(country.names.atlas, country.iso3)
    remember(country.names.gdelt, country.iso3)
    remember(country.names.emdat, country.iso3)
  }

  const byIso3 = new Map(countries.map((c) => [c.iso3, c]))
  const unmatchedPlaces: string[] = []
  for (const place of readUcdpPlaces()) {
    const bare = place.replace(/\s*\(.*\)\s*$/, '').trim()
    const iso3 = byName.get(norm(bare)) ?? UCDP_ALIASES[bare.toLowerCase()]
    const country = iso3 ? byIso3.get(iso3) : undefined
    if (!country) {
      unmatchedPlaces.push(place)
      continue
    }
    if (!country.names.ucdp) country.names.ucdp = place
  }

  // Every FIPS code the GDELT snapshot carries that this table cannot place. Listed, never
  // dropped: a code that vanishes without a word is how a country goes missing from a globe.
  const known = new Set(countries.map((c) => c.fips).filter(Boolean) as string[])
  for (const alias of Object.keys(FIPS_ALIASES)) {
    if (!byIso3.has(FIPS_ALIASES[alias])) throw new Error(`crosswalk: alias ${alias} points at unknown ${FIPS_ALIASES[alias]}`)
    known.add(alias)
  }
  const unmappedFips = [...gdelt.entries()]
    .filter(([code]) => !known.has(code))
    .map(([code, name]) => ({ code, gdelt_name: name }))
    .sort((a, b) => a.code.localeCompare(b.code))

  const file = {
    _:
      'Country-code crosswalk for the living globe — FIPS 10-4 (GDELT) ↔ ISO 3166-1 alpha-3 / ' +
      'numeric / alpha-2 ↔ ccTLD, with the country name as Wikidata, Natural Earth, GDELT, EM-DAT ' +
      'and UCDP each spell it. Derived, never hand-edited: correct a code in src/data/globe/iso-fips.csv ' +
      'and rebuild.',
    derivation:
      `${BASE} (ISO codes, FIPS 10-4, ccTLD) joined with ${ATLAS} by ISO numeric, with ${GDELT} by ` +
      `FIPS 10-4, with ${EMDAT} by the ISO 3166-1 alpha-3 suffix of its keys, and with ${UCDP} by ` +
      'country name after stripping a historical parenthetical.',
    regenerate: 'npx tsx scripts/build-globe-crosswalk.ts (--check fails on drift, writes nothing)',
    sources: [
      { file: BASE, name: 'Wikidata, ISO 3166-1 and FIPS 10-4 properties', license: 'CC0' },
      { file: ATLAS, name: 'world-atlas 2.0.2 (Natural Earth 4.1.0)', license: 'ISC / public domain' },
      { file: GDELT, name: 'GDELT source list by country', license: 'GDELT: free use with attribution' },
      { file: EMDAT, name: 'EM-DAT admissions register (derived identifiers only)', license: 'CC BY-NC-ND 4.0' },
      { file: UCDP, name: 'UCDP admissions register (derived identifiers only)', license: 'UCDP terms' },
    ],
    counts: {
      countries: countries.length,
      with_fips: countries.filter((c) => c.fips).length,
      with_atlas_polygon: countries.filter((c) => c.names.atlas).length,
      with_gdelt_name: countries.filter((c) => c.names.gdelt).length,
      with_emdat_name: countries.filter((c) => c.names.emdat).length,
      with_ucdp_name: countries.filter((c) => c.names.ucdp).length,
    },
    fips_aliases: FIPS_ALIASES,
    countries,
    unmapped: {
      _:
        'What the join could not place, kept in view rather than dropped. KV is Kosovo, which ISO ' +
        'has given no code and the 1:110m topology draws without an id; OS is GDELT’s "Oceans", ' +
        'which is not a country.',
      fips: unmappedFips,
      ucdp_places: unmatchedPlaces,
    },
  }

  return `${JSON.stringify(file, null, 2)}\n`
}

const text = build()
if (process.argv.includes('--check')) {
  const committed = readFileSync(OUT, 'utf8')
  if (committed !== text) {
    console.error(`✗ ${OUT} is not the derivation of its sources — run: npx tsx scripts/build-globe-crosswalk.ts`)
    process.exit(1)
  }
  console.log(`${OUT}: in step with its sources`)
} else {
  writeFileSync(OUT, text, 'utf8')
  const parsed = JSON.parse(text) as { counts: Record<string, number>; unmapped: { fips: unknown[] } }
  console.log(
    `${OUT}: ${parsed.counts.countries} countries, ${parsed.counts.with_fips} with a FIPS code, ` +
      `${parsed.unmapped.fips.length} GDELT codes unplaced`,
  )
}

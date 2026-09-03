// src/lib/globe/layers/attention-warnings.ts — the countries a mirrored warning of Machine
// Attention's Foreknown names in its own heading, at those countries' centroids.
//
// Machine Attention is another house, run under its own constitution, and this layer draws none of
// its own coordinates: its GDACS-derived positions were asked for through its own channel on
// 2026-09-03 and the answer is still pending, so nothing from that source's own geometry crosses
// into this globe. What this layer reads instead is the 250 pages this site already mirrors at
// `public/attention/future/*.html` — pages this house already publishes under its own domain — and
// the ONLY thing it draws is the country the mirror's own `<h1>` names, placed at THIS HOUSE's own
// country centroids, the same crosswalk every other layer here resolves through. The practice's own
// coordinates are not drawn; only the country the mirror's own words already say out loud.
//
// THE `<h1>`, NEVER THE `<title>`. A page's `<title>` is truncated with "…" wherever the heading
// runs long (2 of 250), and its `<h1>` is always the complete heading — so this layer parses the
// `<h1>` and never the `<title>`.
//
// A HEADING NAMES NO COUNTRY AT ALL FOR MOST OF THESE 250 PAGES, AND THAT IS A FACT ABOUT THE
// MIRROR, NOT A PARSING GAP. Only GDACS's drought, earthquake, flood and forest-fire pages carry a
// heading of the form "<Hazard> in <Country>, <Country>, …" (92 of 250); GDACS's own tropical
// cyclones are named after the storm ("Tropical Cyclone PODUL-25") and every NHC- and NWS-sourced
// page is named after its own warning type or storm name ("Severe Thunderstorm Warning", "Cristobal
// (TS)") — 158 of 250 name no country in their heading at all. The inherited rule this house keeps
// everywhere else applies here without exception: a countryless thing is counted in words, never
// placed, and the frame's own note says how many.
//
// A country name that DOES appear resolves through the crosswalk's own Wikidata spelling, with an
// explicit alias table for the handful this mirror spells its own way; a name neither can place
// throws, naming it — proven by a test that parses every one of the 250 files.
import { readFileSync, readdirSync } from 'node:fs'
import attentionExport from '@/data/attention/export.json'
import { byIso3, centroidOfIso3, countries, nameOf, type CrosswalkCountry } from '../crosswalk'
import type { GlobeLayer, LayerFrame, LayerRecord } from './types'

const DIR = 'public/attention/future'

const nf = new Intl.NumberFormat('en-GB')

interface AttentionFigure {
  as_of: string
  key: string
  value: number
}

const READOUT = {
  mark: '{country} · {n} mirrored warnings',
  place: 'the centroid of the country the mirrored heading names — the house’s own centroid, never a coordinate the practice itself publishes',
  caution:
    'the coordinates on this mark are this house’s own country centroids, resolved from the words the mirrored heading already publishes — Machine Attention’s own GDACS positions are asked for and not yet answered, and none of its geometry crosses into this globe',
  countryless:
    '{n} of {of} mirrored warnings name no country in their own heading at all — a named storm or a local US warning is counted here and drawn nowhere.',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their mirrored warnings are counted here and drawn nowhere.',
}

/** Names the mirror spells its own way, matched against the crosswalk's own Wikidata spelling
 *  after every run of whitespace is collapsed to one space — the mirror's own heading writes
 *  "Bosnia  and  Herzegovina" with a doubled space, which collapses to a name that already
 *  matches, so nothing needs aliasing for it. What genuinely does not match:
 *    · "China" — the crosswalk's own Wikidata name is "People's Republic of China"
 *    · "Democratic Republic of Congo" — the crosswalk's own Wikidata name has "of THE Congo"
 *    · "Türkiye" — the crosswalk's own Wikidata name is "Turkey"
 *  A name neither this table nor the crosswalk's own spelling can place throws, naming it. */
const COUNTRY_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  China: 'CHN',
  'Democratic Republic of Congo': 'COD',
  Türkiye: 'TUR',
})

const BY_WIKIDATA_NAME: ReadonlyMap<string, string> = new Map(countries().map((c) => [c.names.wikidata, c.iso3]))

/** The country a mirrored heading names — throws, naming it, where neither the crosswalk's own
 *  spelling nor `COUNTRY_ALIASES` can place it. */
export function resolveMirroredCountry(name: string): CrosswalkCountry {
  const iso3 = BY_WIKIDATA_NAME.get(name) ?? COUNTRY_ALIASES[name]
  if (!iso3) {
    throw new Error(
      `attention-warnings: no country for mirrored name "${name}" — add it to COUNTRY_ALIASES in ` +
        'src/lib/globe/layers/attention-warnings.ts',
    )
  }
  return byIso3(iso3)
}

/** The `<h1>`'s own country list — "<Hazard> in <Country>, <Country>, …" — or null where the
 *  heading names no country at all (a named storm, a local US warning type): the honest and
 *  common case for most of this archive, never an error. Whitespace inside a segment is
 *  collapsed to one space (the mirror writes at least one heading with a doubled space) and an
 *  empty segment — the mirror also writes one trailing ", ," — is dropped rather than resolved. */
export function countriesInHeading(h1: string): string[] | null {
  const match = /^(.+?) in (.+)$/.exec(h1)
  if (!match) return null
  return match[2]
    .split(',')
    .map((segment) => segment.replace(/\s+/g, ' ').trim())
    .filter((segment) => segment.length > 0)
}

interface MirroredPage {
  slug: string
  h1: string
  kicker: string
}

/** Every mirrored page, read once per build. A page without an `<h1>` or a kicker line is a
 *  malformed mirror and stops the build naming the file, rather than silently skipping it. */
export function readMirroredPages(dir = DIR): MirroredPage[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .sort()
    .map((file) => {
      const html = readFileSync(`${dir}/${file}`, 'utf8')
      const h1 = /<h1>([\s\S]*?)<\/h1>/.exec(html)?.[1]
      const kicker = /<p class="kicker">([\s\S]*?)<\/p>/.exec(html)?.[1]
      if (h1 === undefined) throw new Error(`attention-warnings: ${file} carries no <h1>`)
      if (kicker === undefined) throw new Error(`attention-warnings: ${file} carries no kicker line`)
      return { slug: file.replace(/\.html$/, ''), h1, kicker }
    })
}

interface CountryTally {
  country: CrosswalkCountry
  count: number
  representative: MirroredPage
}

/** Every mirrored page's heading, grouped by the countries it names — the first page a country is
 *  named on becomes the representative the receipt points at, so the choice is deterministic
 *  across builds. Returns the count of pages that name no country at all alongside the groups, so
 *  neither number can drift from the other. */
export function groupByCountry(pages: readonly MirroredPage[]): { placed: CountryTally[]; countryless: number } {
  const byIso3Code = new Map<string, CountryTally>()
  let countryless = 0
  for (const page of pages) {
    const names = countriesInHeading(page.h1)
    if (names === null) {
      countryless += 1
      continue
    }
    for (const name of names) {
      const country = resolveMirroredCountry(name)
      const held = byIso3Code.get(country.iso3)
      if (held) held.count += 1
      else byIso3Code.set(country.iso3, { country, count: 1, representative: page })
    }
  }
  return { placed: [...byIso3Code.values()].sort((a, b) => a.country.iso3.localeCompare(b.country.iso3)), countryless }
}

const pages = readMirroredPages()
const figures = (attentionExport as { figures?: AttentionFigure[] }).figures ?? []
const ASOF = figures.map((f) => f.as_of).sort().at(-1) ?? new Date(0).toISOString().slice(0, 10)

function buildStaticFrame(): LayerFrame {
  const { placed, countryless } = groupByCountry(pages)
  const records: LayerRecord[] = []
  const unplaced: string[] = []

  placed.forEach((entry, n) => {
    const centroid = centroidOfIso3(entry.country.iso3)
    if (!centroid) {
      if (!unplaced.includes(nameOf(entry.country))) unplaced.push(nameOf(entry.country))
      return
    }
    records.push({
      key: `attention-warnings:static:${n}`,
      at: { iso3: entry.country.iso3, name: nameOf(entry.country), centroid },
      value: entry.count,
      labelKind: 'centroid',
      receipt: {
        file: `${DIR}/${entry.representative.slug}.html`,
        locator: `<h1> · ${entry.representative.slug}`,
        words: `${nameOf(entry.country)} · ${nf.format(entry.count)} of ${nf.format(pages.length)} mirrored warnings name it, including “${entry.representative.kicker}”`,
        url: `/attention/future/${entry.representative.slug}.html`,
      },
    })
  })

  const notes: string[] = []
  if (countryless > 0) {
    notes.push(READOUT.countryless.replace('{n}', nf.format(countryless)).replace('{of}', nf.format(pages.length)))
  }
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{countries}', unplaced.join(', ')))
  return notes.length === 0 ? { day: ASOF, records } : { day: ASOF, records, note: notes.join(' ') }
}

const STATIC_FRAME = buildStaticFrame()

export const attentionWarningsLayer: GlobeLayer = {
  id: 'attention-warnings',
  title: 'The Foreknown, by country',
  kind: 'points',
  owner: { voice: 'machine-attention' },
  asOf: ASOF,
  source: {
    file: `${DIR}/*.html`,
    name:
      'the countries named in the heading of Machine Attention’s own mirrored warning pages — a page whose ' +
      'heading names no country (a named storm, a local US warning) is counted and drawn nowhere; the ' +
      'coordinates are this house’s own country centroids, never Machine Attention’s own GDACS positions',
    url: 'https://frankbueltge.de/attention',
    license:
      'Machine Attention mirrors GDACS, NOAA/NHC and NOAA/NWS warnings under its own constitution; this layer ' +
      'redistributes none of their content beyond the country names and alert words its own mirror already ' +
      'publishes on this site',
  },
  days: [],
  frame: () => STATIC_FRAME,
  static: STATIC_FRAME,
  readout: READOUT,
}

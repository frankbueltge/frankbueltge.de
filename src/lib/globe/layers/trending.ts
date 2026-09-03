// src/lib/globe/layers/trending.ts — the Common Ground signals that carry a country, at those
// countries' centroids.
//
// /trending reads what the web is searching, reading and posting about every morning and keeps what
// converges across independent platforms. Most of its sources are global and say nothing about
// where anybody was: Hacker News has no country, arXiv has no country, a package index has no
// country. A few DO — Google's daily search trends are published per country, and so is an app
// store's chart — and those are the only signals this layer draws: one mark per country per day, its
// value the number of signals the day recorded for that country, with the sources named in the
// receipt's own words.
//
// A LANGUAGE IS NOT A COUNTRY, and this layer is where that has to be said out loud. Wikipedia's
// most-read pages are published per WIKI, and a wiki is a language: the German-language Wikipedia is
// read in Germany, Austria, Switzerland and everywhere else German is read, and the English one is
// the whole world's. The day file writes those in the same `geo` field as the countries — but it
// writes them the way the archive writes a language, in lower case, and each such signal carries
// `meta.lang` equal to its own `geo`, which is the record calling it a language in its own hand. So
// they are COUNTED and stated in the frame's note, and placed nowhere at all.
//
// The two shapes are told apart by a rule, not by a list of source names: a `geo` of two UPPERCASE
// letters is an ISO 3166-1 alpha-2 country code and MUST resolve through the committed crosswalk or
// the build stops naming it; a `geo` the record itself names as a language, or writes in the lower
// case the archive reserves for a language tag, is a language. Anything else stops the build too,
// because a third shape of `geo` is a change in this house's own pipeline and must be seen rather
// than guessed at.
//
// Days come from the archive's own filenames, and there are very few of them yet — the instrument
// started on 2026-09-02. Nothing here assumes a count.
import type { TrendingDay, TrendingSignal } from '@/lib/trending/types'
import { byIso2, centroidOfIso3 } from '../crosswalk'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/trending'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const nf = new Intl.NumberFormat('en-GB')

const READOUT = {
  mark: '{country} · {signals} of the day’s signals',
  place: 'the centroid of the country a signal was published for — nothing was measured there',
  caution:
    'the count is of signals a source publishes per country, never of people: a search trend for a country is a ranking that source computed, and the mark stands at the middle of a polygon',
  none: 'On this day no source published a signal for any country at all.',
  languages:
    '{signals} signals carry a language rather than a country ({langs}) and are counted here and drawn nowhere: a wiki is read wherever its language is read.',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their signals are counted and drawn nowhere.',
}

export type GeoKind =
  | { kind: 'none' }
  | { kind: 'country'; iso2: string }
  | { kind: 'language'; code: string }

/** What a signal's `geo` IS. Pure, so the rule that separates a country from a language is a test
 *  and not a paragraph — and a shape neither branch recognises throws, naming the source and the
 *  code, because a new kind of `geo` is a change in this house's own pipeline. */
export function geoKindOf(signal: Pick<TrendingSignal, 'geo' | 'source' | 'meta'>): GeoKind {
  const geo = signal.geo
  if (geo === null || geo.trim() === '') return { kind: 'none' }
  if (/^[A-Z]{2}$/.test(geo)) return { kind: 'country', iso2: geo }
  // the record naming it a language in its own hand, and the lower case the archive writes a
  // language tag in — either is enough, and neither is a guess about the code itself
  const lang = typeof signal.meta?.lang === 'string' ? signal.meta.lang : null
  if (lang === geo || /^[a-z]{2,3}(-[a-z]{2,8})*$/.test(geo)) return { kind: 'language', code: geo }
  throw new Error(
    `globe trending: the source "${signal.source}" carries a geo "${geo}" that is neither an ISO 3166-1 ` +
      'alpha-2 country code (two upper-case letters) nor a language tag. Decide which it is in ' +
      'src/lib/globe/layers/trending.ts before it is drawn anywhere.',
  )
}

export interface CountryGroup {
  iso2: string
  iso3: string
  name: string
  signals: number
  sources: string[]
}

/** The day's signals grouped by the country they were published for, ascending by alpha-3 so two
 *  builds count them in the same order — plus the language tags, which are counted and never
 *  placed, and the sources each country's signals came from, named. */
export function groupByGeo(signals: readonly TrendingSignal[]): { countries: CountryGroup[]; languages: string[]; languageSignals: number } {
  const byIso3 = new Map<string, CountryGroup>()
  const languages: string[] = []
  let languageSignals = 0

  for (const signal of signals) {
    const geo = geoKindOf(signal)
    if (geo.kind === 'none') continue
    if (geo.kind === 'language') {
      languageSignals += 1
      if (!languages.includes(geo.code)) languages.push(geo.code)
      continue
    }
    // an alpha-2 the crosswalk cannot place throws here, in the build, naming the code
    const country = byIso2(geo.iso2)
    const group = byIso3.get(country.iso3)
    if (group) {
      group.signals += 1
      if (!group.sources.includes(signal.source)) group.sources.push(signal.source)
    } else {
      byIso3.set(country.iso3, {
        iso2: geo.iso2,
        iso3: country.iso3,
        name: country.names.wikidata,
        signals: 1,
        sources: [signal.source],
      })
    }
  }

  for (const group of byIso3.values()) group.sources.sort()
  return {
    countries: [...byIso3.values()].sort((a, b) => a.iso3.localeCompare(b.iso3)),
    languages: [...languages].sort(),
    languageSignals,
  }
}

function frameOf(day: string): LayerFrame {
  const data = readDay<TrendingDay>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const file = dayPath(DIR, day)
  // the day file keys its signals by source; the layer reads every source there is, so a source
  // that starts publishing a country is drawn the night it does, without an edit here
  const sources = Object.keys(data.signals).sort()
  const named = new Map(data.sources.map((report) => [report.id, report.name]))
  const signals = sources.flatMap((id) => data.signals[id] ?? [])
  const { countries, languages, languageSignals } = groupByGeo(signals)

  const records: LayerRecord[] = []
  const unplaced: string[] = []

  for (const group of countries) {
    const centroid = centroidOfIso3(group.iso3)
    if (!centroid) {
      if (!unplaced.includes(group.name)) unplaced.push(group.name)
      continue
    }
    const from = group.sources.map((id) => named.get(id) ?? id).join(', ')
    records.push({
      key: `trending:${day}:${group.iso3}`,
      // the centroid travels with the code (G3, third evening), so the island can draw the point
      // without holding a crosswalk of its own — the name already did, since the second evening
      at: { iso3: group.iso3, name: group.name, centroid },
      value: group.signals,
      labelKind: 'centroid',
      receipt: {
        file,
        locator: `signals · the entries whose geo is ${group.iso2} (${group.sources.join(', ')})`,
        words: `${group.name} · ${nf.format(group.signals)} of the day’s signals · from ${from}`,
      },
    })
  }

  const notes: string[] = []
  if (records.length === 0 && countries.length === 0) notes.push(READOUT.none)
  if (languageSignals > 0) {
    notes.push(
      READOUT.languages.replace('{signals}', nf.format(languageSignals)).replace('{langs}', languages.join(', ')),
    )
  }
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{countries}', unplaced.join(', ')))
  return notes.length === 0 ? { day, records } : { day, records, note: notes.join(' ') }
}

const newest = readJson<TrendingDay>(dayPath(DIR, NEWEST))

export const trendingLayer: GlobeLayer = {
  id: 'trending',
  title: 'Common Ground, by country',
  kind: 'points',
  owner: { line: 'ledger' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name:
      'the morning’s own sources, one report per source in the day file — only the ones that publish per ' +
      'country are drawn, and a signal published per language is counted and placed nowhere, because a wiki ' +
      'is read wherever its language is read',
    url: 'https://frankbueltge.de/trending',
    license: 'per source; the licence of each source stands in the day file',
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}

// src/lib/globe/layers/invoked.ts — who invoked the day's most-invoked year, at their countries'
// centroids.
//
// /invoked-past counts the years the world's press reaches back to, and publishes two figures side
// by side: the STANDOUT year (the one that most exceeds the median of the years around it) and the
// RAW MAXIMUM — the year with the most mentions outright, which usually sits against the source's
// own inherited ceiling. This layer draws the raw maximum's invoking countries, because that is the
// figure the record carries a country breakdown for on every day it has ever written: the six
// countries whose press invoked that year most, with their FIPS codes and their mention counts,
// inside the `top_years` row for the year `most_invoked` names.
//
// The mark is a point at the centroid of the country's polygon, and `labelKind: 'centroid'` is not
// decoration: nothing was measured at those coordinates. What was measured is a count of mentions
// in articles whose source domain GDELT maps to that country, and the country's polygon reduced to
// one point is the only honest place to put such a count on a sphere. The card says "centroid of",
// the table says it, the plate's own <title> says it.
//
// A day whose fetch failed carries no maximum at all; it draws nothing and says so, rather than
// reaching for the day before it.
import type { InvokedCountry, InvokedData } from '@/lib/invoked/types'
import { byFips, centroidOfIso3, nameOf } from '../crosswalk'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/invoked'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const nf = new Intl.NumberFormat('en-GB')

const READOUT = {
  mark: '{country} · {mentions} mentions of {year}',
  place: 'the centroid of the country whose press invoked the year — nothing was measured there',
  caution:
    'the count is of mentions in articles whose source domain the stream maps to that country, not of anything that happened at that point',
  missing: 'On this day the source named no most-invoked year at all, so nothing is drawn.',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their mentions are stated in the table and drawn nowhere.',
}

/** The row of `top_years` for the year `most_invoked` names — the day's raw maximum, with its own
 *  country breakdown. Null on a day the record holds no maximum, or holds one the ranked years do
 *  not carry countries for; both are stated rather than patched. */
export function maximumOf(data: InvokedData): { year: number; countries: InvokedCountry[] } | null {
  const year = data.most_invoked?.year
  if (year === undefined) return null
  const row = data.top_years.find((entry) => entry.year === year)
  if (!row) return null
  return { year, countries: row.invoked_by }
}

function frameOf(day: string): LayerFrame {
  const data = readDay<InvokedData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const file = dayPath(DIR, day)
  const maximum = maximumOf(data)
  if (!maximum) return EMPTY_FRAME(day, READOUT.missing)

  const index = data.top_years.findIndex((entry) => entry.year === maximum.year)
  const records: LayerRecord[] = []
  const unplaced: string[] = []

  maximum.countries.forEach((country, n) => {
    // an unresolvable FIPS code throws here, in the build, naming the code — never drops a country
    const resolved = byFips(country.fips)
    const centroid = centroidOfIso3(resolved.iso3)
    if (!centroid) {
      if (!unplaced.includes(country.name)) unplaced.push(country.name)
      return
    }
    records.push({
      key: `invoked:${day}:${n}`,
      // the name and the centroid both travel with the code (G3, third evening): the card can
      // say "centroid of X", and the island can draw the point without holding a crosswalk
      at: { iso3: resolved.iso3, name: nameOf(resolved), centroid },
      value: country.mentions,
      labelKind: 'centroid',
      receipt: {
        file,
        locator: `top_years[${index}] · ${maximum.year} · invoked_by[${n}] · ${country.fips}`,
        words: `${country.name} · ${nf.format(country.mentions)} mentions of ${maximum.year}, the day's raw maximum`,
        url: data.source.url,
      },
    })
  })

  return unplaced.length === 0
    ? { day, records }
    : { day, records, note: READOUT.unplaced.replace('{countries}', unplaced.join(', ')) }
}

const newest = readJson<InvokedData>(dayPath(DIR, NEWEST))

export const invokedLayer: GlobeLayer = {
  id: 'invoked',
  title: 'Invoked Past',
  kind: 'points',
  owner: { line: 'memory' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name: `${newest.source.name} — the countries whose press invoked the day's most-invoked year, with their mention counts`,
    url: 'https://frankbueltge.de/invoked-past',
    license: newest.source.license,
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}

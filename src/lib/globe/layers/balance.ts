// src/lib/globe/layers/balance.ts — the world's press about itself and about the world, country
// by country, as country fills.
//
// The measure is the one /balance headlines and the one its ledger sorts by: the TONE GAP, the
// tone of a country's own press about itself minus the tone of everyone else's press about it
// (GDELT V1.5TONE, document level, −100…+100). Nothing else on that page is a headline, and this
// layer takes no second measure of its own — the five other dimensions the day file carries
// (valence, happiness, anxiety, anger, sadness) stay on their own page, because a fill can carry
// one number and a globe that quietly picked a different one than the page would be a globe
// arguing with its own house.
//
// A country is NOT a place, and this layer is the first on the globe that has to mean it. The
// record names a country — `at: { iso3 }`, resolved from GDELT's FIPS 10-4 through the committed
// crosswalk, where a code the table cannot place stops the build instead of vanishing — and the
// drawing fills that country's polygon, toned by where its gap falls inside the day's own range.
// Every record is a `centroid` all the same, because the plate, the card and the tables all place
// a country at the middle of its polygon and say so.
//
// Two kinds of country are counted rather than drawn, and the frame says which: one whose day file
// withholds the tone dimension (too little material in one of the two pools — the page withholds
// it too, and never estimates it), and one the 1:110m atlas draws no polygon for at all (Bahrain,
// Barbados, Bermuda, Malta, Singapore). A hole with a reason beside it is the honest shape here;
// a fill guessed from a neighbouring country would not be.
import { ciLabel, signed } from '@/lib/balance/format'
import type { BalanceCountry, BalanceData } from '@/lib/balance/types'
import { byFips, centroidOfIso3, nameOf } from '../crosswalk'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/balance'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const READOUT = {
  mark: '{country} · gap {gap} in tone',
  place: 'the country whose press the two pools are about — filled as a polygon, said as its centroid',
  caution:
    'the gap is a fact about the language of newsrooms, never a score for a country: a bright self-image and a dark foreign image only mean the two pools wrote in different registers that day',
  withheld:
    'On this day {withheld} country or countries had too little material in one of the two pools; their tone is withheld by the record, counted here and not drawn.',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their gap is stated in the table and drawn nowhere.',
}

/** The gap the page headlines: the tone of a country's own press minus the tone of the world's. */
export function toneGap(country: BalanceCountry): number | null {
  const tone = country.dims.tone
  return tone ? tone.self - tone.foreign : null
}

function frameOf(day: string): LayerFrame {
  const data = readDay<BalanceData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const file = dayPath(DIR, day)
  const records: LayerRecord[] = []
  const unplaced: string[] = []
  let withheld = 0

  data.countries.forEach((country, index) => {
    const tone = country.dims.tone
    const gap = toneGap(country)
    if (!tone || gap === null) {
      withheld += 1
      return
    }
    // an unresolvable FIPS code throws here, in the build, naming the code — never drops a country
    const resolved = byFips(country.fips)
    if (!centroidOfIso3(resolved.iso3)) {
      if (!unplaced.includes(country.name)) unplaced.push(country.name)
      return
    }
    records.push({
      key: `balance:${day}:${index}`,
      // the name travels with the code, so the card can say "centroid of Qatar" without the island
      // ever holding a crosswalk of its own (G3, second evening)
      at: { iso3: resolved.iso3, name: nameOf(resolved) },
      value: gap,
      labelKind: 'centroid',
      receipt: {
        file,
        locator: `countries[${index}] · ${country.fips}`,
        words:
          `${country.name} · tone of its own press ${signed(tone.self)} · tone of the world's press ` +
          `${signed(tone.foreign)} · gap ${signed(gap)} ${ciLabel(tone.gap_ci95)}${tone.significant ? '' : ' · n.s.'}`,
        url: data.source.url,
      },
    })
  })

  const notes: string[] = []
  if (withheld > 0) notes.push(READOUT.withheld.replace('{withheld}', String(withheld)))
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{countries}', unplaced.join(', ')))
  return notes.length === 0 ? { day, records } : { day, records, note: notes.join(' ') }
}

const newest = readJson<BalanceData>(dayPath(DIR, NEWEST))

export const balanceLayer: GlobeLayer = {
  id: 'balance',
  title: 'Balance',
  kind: 'countries',
  owner: { line: 'counter-measurement' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name:
      `${newest.source.name} — the fill is the tone gap the page headlines: the tone of a country's own ` +
      "press about it minus the tone of the world's press about it",
    url: 'https://frankbueltge.de/balance',
    license: newest.source.license,
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}

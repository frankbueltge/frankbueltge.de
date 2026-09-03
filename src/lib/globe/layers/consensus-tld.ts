// src/lib/globe/layers/consensus-tld.ts — where the day's most-echoed sentence was published,
// counted by the top-level domain of the mastheads that ran it.
//
// /consensus finds the phrase the widest set of newsrooms ran on one day and lists the mastheads
// that carried it. This layer counts those mastheads by the last label of their domain and puts
// each country-code group at its country's centroid, one mark per country, its value the number of
// mastheads counted there.
//
// THE HONESTY RULE OF THIS LAYER, and the reason it is the smallest of the three: a top-level
// domain is a REGISTRATION, not a location. `.uk` is bought from a British registry and `.tv` from
// Tuvalu's, and neither says where a newsroom sits, where its reporter stood or where its server
// runs; a local station in Alabama can and does hold a `.tv` domain. So the count is a count of
// registrations, said in those words in the source block, in the layer's own caution and on the
// method sheet — and a domain with no country in it is never placed anywhere. The generic domains
// (`com`, `org`, `net`, and every other label that is not a country code this house's crosswalk
// records) are COUNTED and STATED — "N of M mastheads carry no country" — and drawn nowhere at
// all. On many days that is most of them, and on some it is all of them: the newest day of this
// archive places nothing and says so, which is the correct picture of an American wire story.
//
// Only the headline phrase is read, never the runner-up: the day's finding is one phrase, and
// mixing two stories' mastheads into one count per country would be a number about neither.
import { cleanTitle } from '@/lib/consensus/format'
import type { ConsensusData } from '@/lib/consensus/types'
import { centroidOfIso3, tryCctld } from '../crosswalk'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/consensus'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const READOUT = {
  mark: '{country} · {domains} of {mastheads} mastheads',
  place: 'the centroid of the country a top-level domain is registered in — not where the newsroom sits',
  caution:
    'a top-level domain is a registration and not a location: a domain bought from one country’s registry says nothing about where the newsroom, the reporter or the server is',
  none: 'On this day no phrase crossed the threshold, so there is no set of mastheads to count.',
  noCountry: '{unplaced} of {mastheads} mastheads carry no country: their top-level domain is generic or belongs to none ({tlds}).',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their mastheads are counted and drawn nowhere.',
}

export interface TldGroup {
  iso3: string
  name: string
  cctld: string
  domains: string[]
}

/** What a domain's last label is: the label itself, lowercased, or null for a bare host with no
 *  dot in it at all. Pure, so the counting rule is a test and not a comment. */
export function tldOf(domain: string): string | null {
  const parts = domain.trim().toLowerCase().split('.')
  const last = parts.length > 1 ? parts[parts.length - 1] : null
  return last && last.length > 0 ? last : null
}

/** The mastheads grouped by the country their top-level domain is registered in, ascending by
 *  alpha-3 so two builds count them in the same order, plus every label that belongs to no
 *  country — kept as a list rather than a number, because the layer states them by name. */
export function groupByCountry(domains: readonly string[]): { placed: TldGroup[]; countryless: string[] } {
  const byIso3 = new Map<string, TldGroup>()
  const countryless: string[] = []
  for (const domain of domains) {
    const tld = tldOf(domain)
    const country = tld ? tryCctld(tld) : null
    if (!tld || !country) {
      const label = tld ?? domain.trim().toLowerCase()
      if (!countryless.includes(label)) countryless.push(label)
      continue
    }
    const group = byIso3.get(country.iso3)
    if (group) group.domains.push(domain)
    else byIso3.set(country.iso3, { iso3: country.iso3, name: country.names.wikidata, cctld: tld, domains: [domain] })
  }
  return {
    placed: [...byIso3.values()].sort((a, b) => a.iso3.localeCompare(b.iso3)),
    countryless: [...countryless].sort(),
  }
}

function frameOf(day: string): LayerFrame {
  const data = readDay<ConsensusData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)
  if (!data.headline) return EMPTY_FRAME(day, READOUT.none)

  const file = dayPath(DIR, day)
  const mastheads = data.headline.mastheads
  const phrase = cleanTitle(data.headline.phrase)
  const { placed, countryless } = groupByCountry(mastheads)

  const records: LayerRecord[] = []
  const unplaced: string[] = []
  let countrylessDomains = mastheads.length

  placed.forEach((group) => {
    countrylessDomains -= group.domains.length
    const centroid = centroidOfIso3(group.iso3)
    if (!centroid) {
      if (!unplaced.includes(group.name)) unplaced.push(group.name)
      return
    }
    records.push({
      key: `consensus-tld:${day}:${group.iso3}`,
      // the centroid travels with the code (G3, third evening), so the island can draw the point
      // without holding a crosswalk of its own — the name already did, since the second evening
      at: { iso3: group.iso3, name: group.name, centroid },
      value: group.domains.length,
      labelKind: 'centroid',
      receipt: {
        file,
        locator: `headline.mastheads · the domains ending in .${group.cctld}`,
        words: `${group.name} · ${group.domains.length} of ${mastheads.length} mastheads · “${phrase}”`,
        url: data.source.url,
      },
    })
  })

  const notes: string[] = []
  if (countrylessDomains > 0) {
    notes.push(
      READOUT.noCountry
        .replace('{unplaced}', String(countrylessDomains))
        .replace('{mastheads}', String(mastheads.length))
        .replace('{tlds}', countryless.join(', ')),
    )
  }
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{countries}', unplaced.join(', ')))
  return notes.length === 0 ? { day, records } : { day, records, note: notes.join(' ') }
}

const newest = readJson<ConsensusData>(dayPath(DIR, NEWEST))

export const consensusTldLayer: GlobeLayer = {
  id: 'consensus-tld',
  title: 'Consensus, by domain',
  kind: 'points',
  owner: { line: 'counter-measurement' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name:
      `${newest.source.name} — the mastheads of the day's most-echoed phrase, counted by their ` +
      'top-level domain; a top-level domain is a registration and not a location, and a domain with no country in it is counted and drawn nowhere',
    url: 'https://frankbueltge.de/consensus',
    license: newest.source.license,
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}

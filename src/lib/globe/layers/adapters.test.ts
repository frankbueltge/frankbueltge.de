// One suite per adapter, and every one of them asks the same three questions, because those are
// the three ways an adapter goes wrong without anybody noticing.
//
//   1. Does it move? A frame that differs between two builds of the same commit means something in
//      the chain read a clock or a set's iteration order.
//   2. Where does its day axis come from? If it comes from anywhere but the archive's own
//      filenames, the oldest day on the globe moves when the machine's clock moves.
//   3. Does one real record survive the trip? The file is read again here, independently, and the
//      record the adapter built is held against it — so a mis-indexed coordinate or a lost vessel
//      name fails here instead of shipping as a mark in the wrong ocean.
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { byFips, byIso3, centroidOfIso3, countries, nameOf } from '../crosswalk'
import { REDACTION_SEATS, redactionSeatFor } from '../seats'
import { admissionsLayer, resolveEmdatIso3, resolveUcdpCountry } from './admissions'
import {
  attentionWarningsLayer,
  countriesInHeading,
  groupByCountry as groupWarningsByCountry,
  readMirroredPages,
  resolveMirroredCountry,
} from './attention-warnings'
import { balanceLayer } from './balance'
import { consensusTldLayer, groupByCountry, tldOf } from './consensus-tld'
import { ghostFleetLayer } from './ghost-fleet'
import { invokedLayer, maximumOf } from './invoked'
import { protocolLayer } from './protocol'
import { byInstitution, largestOf, redactionSeatsLayer } from './redaction-seats'
import { germanVantageNote, receiptWords, receiptsByTld, redactionWorldLayer } from './redaction-world'
import { skyLayer } from './sky'
import { geoKindOf, groupByGeo, trendingLayer } from './trending'
import type { GlobeLayer } from './types'

const read = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const datedFiles = (dir: string) =>
  readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.slice(0, 10))
    .sort()

const LAYERS = [
  skyLayer,
  ghostFleetLayer,
  protocolLayer,
  redactionSeatsLayer,
  balanceLayer,
  invokedLayer,
  consensusTldLayer,
  redactionWorldLayer,
  trendingLayer,
]

describe.each(LAYERS.map((l) => [l.id, l] as const))('%s', (id, layer: GlobeLayer) => {
  it('gives the same frame twice for the same day', () => {
    const day = layer.days[layer.days.length - 1]
    expect(layer.frame(day)).toEqual(layer.frame(day))
  })

  it('holds its days ascending and unique', () => {
    expect(layer.days).toEqual([...new Set(layer.days)].sort())
    for (const day of layer.days) expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('answers a day it does not hold with an empty frame, never a throw', () => {
    const frame = layer.frame('1999-01-01')
    expect(frame.day).toBe('1999-01-01')
    expect(frame.records).toEqual([])
  })

  it('states its own as-of date, its source and its licence', () => {
    expect(layer.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(layer.source.file.length).toBeGreaterThan(0)
    expect(layer.source.license.length).toBeGreaterThan(0)
  })

  it('gives every record a key, a receipt and a kind of label', () => {
    const day = layer.days[layer.days.length - 1]
    const { records } = layer.frame(day)
    const keys = new Set(records.map((r) => r.key))
    expect(keys.size).toBe(records.length)
    for (const record of records) {
      expect(record.key.startsWith(`${id}:`), record.key).toBe(true)
      expect(record.receipt.file).toMatch(/^src\//)
      expect(record.receipt.locator.length).toBeGreaterThan(0)
      expect(record.receipt.words.length).toBeGreaterThan(0)
      expect(['point', 'seat', 'centroid', 'station', 'gap']).toContain(record.labelKind)
    }
  })
})

describe('ghost fleet — the arcs', () => {
  const day = ghostFleetLayer.days[ghostFleetLayer.days.length - 1]
  const file = `src/data/ghost-fleet/${day}.json`
  const data = read<{
    date: string
    events: Array<{ id: string; vessel: { name: string }; off: { lat: number | null; lon: number | null }; on: { lat: number | null; lon: number | null } }>
  }>(file)

  it('reads its days from the archive’s filenames', () => {
    expect(ghostFleetLayer.days).toEqual(datedFiles('src/data/ghost-fleet'))
    expect(ghostFleetLayer.asOf).toBe(data.date)
  })

  it('carries one real gap exactly as the file holds it', () => {
    const first = data.events.find((e) => e.off.lat !== null && e.on.lat !== null)!
    const record = ghostFleetLayer.frame(day).records[0]
    expect(record.at).toEqual({ from: [first.off.lon, first.off.lat], to: [first.on.lon, first.on.lat] })
    expect(record.receipt.file).toBe(file)
    expect(record.receipt.locator).toContain(first.id)
    expect(record.receipt.words).toContain(first.vessel.name)
    expect(record.labelKind).toBe('gap')
  })

  it('counts the gaps it cannot draw instead of thinning the day in silence', () => {
    const drawable = data.events.filter((e) => e.off.lat !== null && e.on.lat !== null).length
    const frame = ghostFleetLayer.frame(day)
    expect(frame.records.length).toBe(drawable)
    if (drawable < data.events.length) expect(frame.note).toMatch(/counted, not drawn/)
  })
})

describe('sky — the one exception', () => {
  it('draws only on the day its elements are from', () => {
    const elements = read<{ generated_at: string; satellites: unknown[] }>('src/data/ueberflug/satellites.json')
    const elementsDay = elements.generated_at.slice(0, 10)
    expect(skyLayer.asOf).toBe(elementsDay)
    const frame = skyLayer.frame(elementsDay)
    expect(frame.records.length).toBeGreaterThan(elements.satellites.length * 0.9)
    expect(frame.note).toBeUndefined()
  })

  it('draws nothing on an older day and says why, with the fleet the series counted then', () => {
    const series = read<{ series: Array<{ date: string; fleet: number; commit: string }> }>(
      'src/data/ueberflug/densification.json',
    ).series
    const observed = series[0]
    const frame = skyLayer.frame(observed.date)
    expect(frame.records).toEqual([])
    expect(frame.note).toContain('not one set per day')
    expect(frame.note).toContain(String(observed.fleet))
    expect(frame.note).toContain(observed.commit)
  })

  it('carries one real satellite exactly as the elements hold it', () => {
    const elements = read<{
      generated_at: string
      satellites: Array<{ norad: number; name: string; group: string }>
    }>('src/data/ueberflug/satellites.json')
    const lowest = [...elements.satellites].sort((a, b) => a.norad - b.norad)[0]
    const record = skyLayer.frame(skyLayer.asOf).records[0]
    expect(record.receipt.locator).toContain(String(lowest.norad))
    expect(record.receipt.words).toContain(lowest.name)
    expect(record.labelKind).toBe('point')
  })
})

describe('protocol — the stations and the seats', () => {
  const day = protocolLayer.days[protocolLayer.days.length - 1]
  const file = `src/content/protokoll/2026/${day}.json`
  const minutes = read<{
    date: string
    entries: Array<{ top_id: string; value: number | null; status: string; as_of: string | null }>
  }>(file)

  it('reads its days from the archive’s filenames', () => {
    expect(protocolLayer.days).toEqual(datedFiles('src/content/protokoll/2026'))
    expect(protocolLayer.asOf).toBe(minutes.date)
  })

  it('draws the carbon dioxide as a station and the price index as a seat', () => {
    const records = protocolLayer.frame(day).records
    const co2Index = minutes.entries.findIndex((e) => e.top_id === 'co2')
    const co2 = records.find((r) => r.receipt.locator.includes(`entries[${co2Index}]`))
    expect(co2?.labelKind).toBe('station')
    expect(co2?.receipt.words).toContain('Mauna Loa')
    expect(records.find((r) => r.receipt.locator.includes('food'))?.labelKind).toBe('seat')
  })

  it('carries one real reading exactly as the minutes hold it', () => {
    const entry = minutes.entries.find((e) => e.top_id === 'co2')!
    const record = protocolLayer.frame(day).records.find((r) => r.receipt.locator.includes('co2'))!
    expect(record.value).toBe(entry.value)
    expect(record.receipt.file).toBe(file)
    expect(record.receipt.locator).toContain(`as of ${entry.as_of}`)
  })

  it('counts a reading it could not take instead of drawing a zero', () => {
    const taken = minutes.entries.filter((e) => e.value !== null && e.status === 'ok')
    const frame = protocolLayer.frame(day)
    expect(frame.records.length).toBeLessThanOrEqual(taken.length)
    if (taken.length < minutes.entries.length) expect(frame.note).toMatch(/counted, not drawn/)
  })
})

describe('no adapter reads a clock', () => {
  it.each([
    'ghost-fleet.ts',
    'protocol.ts',
    'sky.ts',
    'balance.ts',
    'invoked.ts',
    'consensus-tld.ts',
    'redaction-seats.ts',
    'redaction-world.ts',
    'trending.ts',
    'admissions.ts',
    'attention-warnings.ts',
    'archive.ts',
    'types.ts',
    'index.ts',
  ])(
    '%s calls no Date.now(), no new Date() and no Math.random()',
    (name) => {
      const source = readFileSync(`src/lib/globe/layers/${name}`, 'utf8')
      for (const forbidden of ['Date.now(', 'new Date()', 'Math.random(']) {
        expect(source, `${name} calls ${forbidden} — the day axis must come from the archive`).not.toContain(forbidden)
      }
    },
  )

  it('holds the same rule over the model the globe is built from', () => {
    for (const name of ['living.ts', 'geo.ts', 'crosswalk.ts', 'seats.ts', 'shapes.ts', 'antimeridian.ts']) {
      const source = readFileSync(`src/lib/globe/${name}`, 'utf8')
      for (const forbidden of ['Date.now(', 'new Date()', 'Math.random(']) {
        expect(source, `${name} calls ${forbidden}`).not.toContain(forbidden)
      }
    }
  })
})

// ── G3, the layers whose records name a country ────────────────────────────────────────────────
// The same third question as above, asked of a country: does one real record survive the trip? The
// day file is read again here, independently, and the record the adapter built is held against it —
// so a country matched to the wrong code, a measure taken from the wrong dimension or a count read
// off the wrong row fails here rather than shipping as a fill in the wrong colour.

describe('balance — the tone gap as country fills', () => {
  const day = balanceLayer.days[balanceLayer.days.length - 1]
  const file = `src/data/balance/${day}.json`
  const data = read<{
    date: string
    countries: Array<{
      fips: string
      name: string
      dims: { tone?: { self: number; foreign: number; gap_ci95: [number, number]; significant: boolean } }
    }>
  }>(file)

  it('reads its days from the archive’s filenames', () => {
    expect(balanceLayer.days).toEqual(datedFiles('src/data/balance'))
    expect(balanceLayer.asOf).toBe(data.date)
  })

  it('carries the measure the page headlines — the tone of a country’s own press minus the world’s', () => {
    const index = data.countries.findIndex((c) => c.dims.tone)
    const entry = data.countries[index]
    const tone = entry.dims.tone!
    const record = balanceLayer.frame(day).records.find((r) => r.receipt.locator === `countries[${index}] · ${entry.fips}`)
    // a country the atlas draws no polygon for is counted in the note instead, so the row may have
    // no record at all — but where it has one, the value is the gap and nothing else
    if (record) {
      expect(record.value).toBeCloseTo(tone.self - tone.foreign, 10)
      // the place carries the crosswalk's NAME beside the code since G3's second evening, so the
      // card can say "centroid of Qatar" without the island ever holding a crosswalk
      expect(record.at).toEqual({ iso3: byFips(entry.fips).iso3, name: byFips(entry.fips).names.wikidata })
      expect(record.labelKind).toBe('centroid')
      expect(record.receipt.file).toBe(file)
      expect(record.receipt.words).toContain(entry.name)
      expect(record.receipt.words).toContain('gap')
    }
    expect(balanceLayer.frame(day).records.length).toBeGreaterThan(0)
  })

  it('places every record it draws, and counts every country it cannot', () => {
    const frame = balanceLayer.frame(day)
    const withTone = data.countries.filter((c) => c.dims.tone)
    const drawable = withTone.filter((c) => centroidOfIso3(byFips(c.fips).iso3) !== null)
    expect(frame.records.length).toBe(drawable.length)
    for (const record of frame.records) {
      const at = record.at as { iso3: string }
      expect(centroidOfIso3(at.iso3), at.iso3).not.toBeNull()
    }
    if (drawable.length < data.countries.length) expect(frame.note).toMatch(/drawn nowhere|not drawn/)
  })

  it('says in its source block which measure the fill carries', () => {
    expect(balanceLayer.kind).toBe('countries')
    expect(balanceLayer.source.name).toContain('tone gap')
  })
})

describe('invoked past — the countries that invoked the day’s most-invoked year', () => {
  const day = invokedLayer.days[invokedLayer.days.length - 1]
  const file = `src/data/invoked/${day}.json`
  const data = read<{
    date: string
    most_invoked: { year: number } | null
    top_years: Array<{ year: number; invoked_by: Array<{ fips: string; name: string; mentions: number }> }>
  }>(file)

  it('reads its days from the archive’s filenames', () => {
    expect(invokedLayer.days).toEqual(datedFiles('src/data/invoked'))
    expect(invokedLayer.asOf).toBe(data.date)
  })

  it('takes the year from the record’s own maximum, never from the ranked list’s first row', () => {
    const maximum = maximumOf(data as never)!
    expect(maximum.year).toBe(data.most_invoked!.year)
  })

  it('carries one real invoking country exactly as the file holds it, at the centroid of its polygon', () => {
    const maximum = maximumOf(data as never)!
    const index = data.top_years.findIndex((y) => y.year === maximum.year)
    const country = maximum.countries[0]
    const record = invokedLayer.frame(day).records[0]
    expect(record.value).toBe(country.mentions)
    // the name and the centroid both travel with the code since G3's third evening, so the card
    // can say "centroid of X" and the island can draw the point without holding a crosswalk
    const resolved = byFips(country.fips)
    expect(record.at).toEqual({ iso3: resolved.iso3, name: nameOf(resolved), centroid: centroidOfIso3(resolved.iso3) })
    expect(record.labelKind).toBe('centroid')
    expect(record.receipt.file).toBe(file)
    expect(record.receipt.locator).toBe(`top_years[${index}] · ${maximum.year} · invoked_by[0] · ${country.fips}`)
    expect(record.receipt.words).toContain(country.name)
    expect(record.receipt.words).toContain(String(maximum.year))
  })

  it('draws nothing and says why on a day the source named no maximum', () => {
    const empty = invokedLayer.frame('1999-01-01')
    expect(empty.records).toEqual([])
  })
})

describe('consensus by domain — a registration, not a location', () => {
  const day = consensusTldLayer.days[consensusTldLayer.days.length - 1]
  const data = read<{ date: string; headline: { mastheads: string[] } | null }>(`src/data/consensus/${day}.json`)

  it('reads its days from the archive’s filenames', () => {
    expect(consensusTldLayer.days).toEqual(datedFiles('src/data/consensus'))
    expect(consensusTldLayer.asOf).toBe(data.date)
  })

  it('reads the last label of a domain, and nothing else', () => {
    expect(tldOf('theguardian.co.uk')).toBe('uk')
    expect(tldOf('chicagotribune.com')).toBe('com')
    expect(tldOf('KAZU.ORG')).toBe('org')
    expect(tldOf('localhost')).toBeNull()
  })

  it('reads the crosswalk’s own ccTLD column, so uk is the United Kingdom and not Ukraine', () => {
    const { placed } = groupByCountry(['bbc.co.uk', 'rte.ie', 'abc.net.au', 'thetimes.co.uk'])
    expect(placed.map((g) => g.iso3)).toEqual(['AUS', 'GBR', 'IRL'])
    expect(placed.find((g) => g.iso3 === 'GBR')!.domains).toEqual(['bbc.co.uk', 'thetimes.co.uk'])
  })

  it('places no generic domain anywhere, and hands the caller its label to state', () => {
    const { placed, countryless } = groupByCountry(['cnn.com', 'kazu.org', 'europa.eu', 'bbc.co.uk'])
    expect(placed.map((g) => g.iso3)).toEqual(['GBR'])
    expect(countryless).toEqual(['com', 'eu', 'org'])
  })

  it('states in words how many mastheads carry no country at all, on the day it holds', () => {
    const frame = consensusTldLayer.frame(day)
    const { placed } = groupByCountry(data.headline!.mastheads)
    const countryless = data.headline!.mastheads.length - placed.reduce((sum, g) => sum + g.domains.length, 0)
    if (countryless > 0) {
      expect(frame.note).toContain(String(countryless))
      expect(frame.note).toContain('carry no country')
    }
    // and every mark it does draw stands at a centroid, with the phrase the day file carries,
    // its name and its own embedded centroid both riding with the code (G3, third evening)
    for (const record of frame.records) {
      expect(record.labelKind).toBe('centroid')
      expect(Array.isArray(record.at)).toBe(false)
      const at = record.at as { iso3: string; name: string; centroid: [number, number] }
      expect(at.centroid).toEqual(centroidOfIso3(at.iso3))
      expect(at.name).toBe(nameOf(byIso3(at.iso3)))
    }
  })

  it('says in its source block that a top-level domain is a registration', () => {
    expect(consensusTldLayer.source.name).toContain('registration and not a location')
    expect(consensusTldLayer.readout.caution).toContain('registration')
  })
})

// ── G3, second evening: the removals, the world chamber's hosts and the trending countries ──────
// Three more adapters, the same third question asked three more ways — and one question this
// evening adds: does the adapter STOP when the archive holds something it cannot place? The
// institution table, the alpha-2 codes and the geo shapes are all resolved through throwing
// lookups, so a quiet mark fewer is impossible by construction; these suites prove it rather than
// asserting it in a comment.

describe('editorial deadline, at the seats — a removal stands at the body that published it', () => {
  const day = redactionSeatsLayer.days[redactionSeatsLayer.days.length - 1]
  const file = `src/data/redaction/${day}.json`
  const data = read<{
    date: string
    watched_count: number
    redactions: Array<{ id: string; institution: string; label: string; kind: string; removed_tokens: number; after: { url: string } }>
  }>(file)

  it('reads its days from the archive’s filenames', () => {
    expect(redactionSeatsLayer.days).toEqual(datedFiles('src/data/redaction'))
    expect(redactionSeatsLayer.asOf).toBe(data.date)
  })

  it('maps every institution in every committed day, and names one it cannot', () => {
    // the whole archive, not only the newest night: an institution that appeared once in July and
    // never again must still have a seat, or that night draws one mark fewer than it holds
    for (const name of datedFiles('src/data/redaction')) {
      const rows = read<{ redactions: Array<{ institution: string }> }>(`src/data/redaction/${name}.json`).redactions
      for (const row of rows) {
        expect(REDACTION_SEATS[row.institution], `${name}: no seat for "${row.institution}"`).toBeDefined()
        expect(() => redactionSeatFor(row.institution)).not.toThrow()
      }
    }
    expect(() => redactionSeatFor('Ministry of Nothing')).toThrow(/no seat for the institution "Ministry of Nothing"/)
  })

  it('calls every mark a seat — a removal is never taken at an instrument', () => {
    for (const name of redactionSeatsLayer.days) {
      for (const record of redactionSeatsLayer.frame(name).records) {
        expect(record.labelKind, `${name} ${record.key}`).toBe('seat')
      }
    }
  })

  it('carries one real removal exactly as the file holds it, with the words the page counts in', () => {
    const withRows = redactionSeatsLayer.days
      .map((name) => ({ name, frame: redactionSeatsLayer.frame(name) }))
      .find((entry) => entry.frame.records.length > 0)!
    const rows = read<typeof data>(`src/data/redaction/${withRows.name}.json`).redactions
    const record = withRows.frame.records[0]
    const index = Number(/redactions\[(\d+)\]/.exec(record.receipt.locator)![1])
    const row = rows[index]
    expect(record.receipt.file).toBe(`src/data/redaction/${withRows.name}.json`)
    expect(record.receipt.locator).toContain(row.id)
    expect(record.receipt.words).toContain(row.institution)
    expect(record.receipt.words).toContain(row.label)
    expect(record.receipt.words).toContain(`${row.removed_tokens} word`)
    expect(record.receipt.url).toBe(row.after.url)
  })

  it('gives an institution one mark a day and the day’s whole loss as its value', () => {
    for (const name of redactionSeatsLayer.days) {
      const rows = read<typeof data>(`src/data/redaction/${name}.json`).redactions
      const grouped = byInstitution(rows as never)
      const frame = redactionSeatsLayer.frame(name)
      expect(frame.records.length, name).toBe(grouped.length)
      expect(new Set(frame.records.map((r) => r.key)).size).toBe(frame.records.length)
      for (const group of grouped) {
        const total = group.rows.reduce((sum, entry) => sum + entry.row.removed_tokens, 0)
        const record = frame.records.find((r) => r.receipt.words.startsWith(`${group.institution} ·`))!
        expect(record, `${name} ${group.institution}`).toBeTruthy()
        expect(record.value).toBe(total)
        // the locator leads to the largest of that institution's removals, never to a group
        expect(record.receipt.locator).toContain(largestOf(group.rows).row.id)
      }
    }
  })

  it('draws nothing on a night the watch found nothing, and says so with the record’s own count', () => {
    const quiet = redactionSeatsLayer.days.find(
      (name) => read<typeof data>(`src/data/redaction/${name}.json`).redactions.length === 0,
    )!
    const record = read<typeof data>(`src/data/redaction/${quiet}.json`)
    const frame = redactionSeatsLayer.frame(quiet)
    expect(frame.records).toEqual([])
    expect(frame.note).toContain('took nothing back')
    expect(frame.note).toContain(String(record.watched_count))
  })

  it('says in its source block that the mark is a seat and what its value is', () => {
    expect(redactionSeatsLayer.kind).toBe('stations')
    expect(redactionSeatsLayer.source.name).toContain('seat of a body, never the place a page was written')
    expect(redactionSeatsLayer.readout.place).toContain('seat of the institution')
  })
})

describe('editorial deadline, the world chamber — hosts by registration, outcomes where committed', () => {
  const day = redactionWorldLayer.days[redactionWorldLayer.days.length - 1]
  const data = read<{
    date: string
    deletion: {
      available: boolean
      pool_day: string
      counts: Record<string, number>
      gone: number
      legal_451: number
      notes: string[]
      receipts: Array<{ domain: string; url: string; class: string; http_code: number | null }>
    }
  }>(`src/data/redaction/world/${day}.json`)

  it('reads its days from the archive’s filenames', () => {
    expect(redactionWorldLayer.days).toEqual(datedFiles('src/data/redaction/world'))
    expect(redactionWorldLayer.asOf).toBe(data.date)
  })

  it('places the hosts of the sample the day actually checked, not the one it committed that night', () => {
    // proven, not assumed: every receipt of the day is a URL of the pool the record names in
    // `pool_day` — which is a different file from the `sample_committed` drawn for the next run
    const pool = read<{ items: Array<{ url: string; domain: string }> }>(
      `src/data/redaction/world/samples/${data.deletion.pool_day}.json`,
    )
    const urls = new Set(pool.items.map((item) => item.url))
    for (const receipt of data.deletion.receipts) expect(urls.has(receipt.url), receipt.url).toBe(true)

    const { placed } = groupByCountry(pool.items.map((item) => item.domain))
    const frame = redactionWorldLayer.frame(day)
    const drawable = placed.filter((group) => centroidOfIso3(group.iso3) !== null)
    expect(frame.records.length).toBe(drawable.length)
    for (const group of drawable) {
      const record = frame.records.find((r) => r.key === `redaction-world:${day}:${group.iso3}`)!
      expect(record, group.iso3).toBeTruthy()
      expect(record.value).toBe(group.domains.length)
      expect(record.labelKind).toBe('centroid')
      expect(record.receipt.file).toBe(`src/data/redaction/world/samples/${data.deletion.pool_day}.json`)
      expect(record.receipt.locator).toContain(`.${group.cctld}`)
    }
  })

  it('counts the hosts that carry no country, and the countries the atlas cannot draw', () => {
    const pool = read<{ items: Array<{ domain: string }> }>(
      `src/data/redaction/world/samples/${data.deletion.pool_day}.json`,
    )
    const { placed } = groupByCountry(pool.items.map((item) => item.domain))
    const countryless = pool.items.length - placed.reduce((sum, group) => sum + group.domains.length, 0)
    const frame = redactionWorldLayer.frame(day)
    expect(frame.note).toContain(String(countryless))
    expect(frame.note).toContain('carry no country')
    if (placed.some((group) => centroidOfIso3(group.iso3) === null)) expect(frame.note).toContain('drawn nowhere')
  })

  it('states the day’s counts in words and never folds a 451 into gone', () => {
    const frame = redactionWorldLayer.frame(day)
    expect(frame.note).toContain('stood behind a bot wall')
    expect(frame.note).toContain('counted apart and never added together')
    expect(frame.note).toContain(String(data.deletion.gone))
    expect(frame.note).toContain(String(data.deletion.counts.botwall))
    // and the two classes are two different sentences, never one
    expect(receiptWords({ domain: 'x.uk', url: 'u', first_seen: 'f', class: 'gone_404', http_code: 404 })).toContain('gone')
    const withheld = receiptWords({ domain: 'x.uk', url: 'u', first_seen: 'f', class: 'legal_451', http_code: 451 })
    expect(withheld).toContain('withheld for legal reasons')
    expect(withheld).not.toContain('gone')
  })

  it('carries the per-host outcome the record commits, wherever a vanished host had a country', () => {
    // most vanished hosts are `.com` and belong to no country at all, so the archive is walked for
    // the ones that do — and every one of them must be named in its country's own mark
    let named = 0
    for (const name of redactionWorldLayer.days) {
      const record = read<typeof data>(`src/data/redaction/world/${name}.json`)
      const frame = redactionWorldLayer.frame(name)
      for (const [tld, receipts] of receiptsByTld((record.deletion.receipts ?? []) as never)) {
        for (const receipt of receipts) {
          const mark = frame.records.find((r) => r.receipt.locator.includes(`.${tld} `))
          // a ccTLD the atlas draws no polygon for is counted in the note instead of drawn
          if (!mark) continue
          named += 1
          expect(mark.receipt.words, `${name} ${receipt.domain}`).toContain(receipt.domain)
          expect(mark.receipt.words).toContain(String(receipt.http_code))
          expect(mark.receipt.url).toBeTruthy()
        }
      }
    }
    expect(named, 'no vanished host in the whole archive carried a country — check receiptsByTld').toBeGreaterThan(0)
  })

  it('draws nothing and quotes the record’s own reason on a day it could not measure', () => {
    const unavailable = redactionWorldLayer.days.find(
      (name) => read<typeof data>(`src/data/redaction/world/${name}.json`).deletion.available === false,
    )!
    const record = read<{ deletion: { note: string } }>(`src/data/redaction/world/${unavailable}.json`)
    const frame = redactionWorldLayer.frame(unavailable)
    expect(frame.records).toEqual([])
    expect(frame.note).toContain(record.deletion.note)
  })

  it('quotes the record’s own German-vantage caution in the source block, byte for byte', () => {
    const note = germanVantageNote(data as never)
    expect(note, 'the day record no longer carries the 451 caution the source block quotes').toBeTruthy()
    expect(data.deletion.notes).toContain(note)
    expect(redactionWorldLayer.source.name).toContain(note!)
    expect(redactionWorldLayer.source.name).toContain('registration and not a location')
  })
})

describe('common ground, by country — a language is not a country', () => {
  const day = trendingLayer.days[trendingLayer.days.length - 1]
  const data = read<{
    date: string
    sources: Array<{ id: string; name: string }>
    signals: Record<string, Array<{ geo: string | null; source: string; meta: Record<string, unknown> }>>
  }>(`src/data/trending/${day}.json`)

  it('reads its days from the archive’s filenames, however few there are', () => {
    expect(trendingLayer.days).toEqual(datedFiles('src/data/trending'))
    expect(trendingLayer.days.length).toBeGreaterThan(0)
    expect(trendingLayer.asOf).toBe(data.date)
  })

  it('tells a country from a language by a rule, and stops at anything that is neither', () => {
    expect(geoKindOf({ geo: 'DE', source: 'google_trends', meta: {} })).toEqual({ kind: 'country', iso2: 'DE' })
    expect(geoKindOf({ geo: 'de', source: 'wikipedia', meta: { lang: 'de' } })).toEqual({ kind: 'language', code: 'de' })
    expect(geoKindOf({ geo: 'en', source: 'wikipedia', meta: {} })).toEqual({ kind: 'language', code: 'en' })
    expect(geoKindOf({ geo: null, source: 'hackernews', meta: {} })).toEqual({ kind: 'none' })
    expect(() => geoKindOf({ geo: 'Berlin', source: 'somewhere', meta: {} })).toThrow(/neither an ISO 3166-1/)
  })

  it('refuses an alpha-2 the crosswalk cannot place, rather than drawing one mark fewer', () => {
    expect(() => groupByGeo([{ geo: 'XX', source: 'nowhere', meta: {} } as never])).toThrow(/alpha-2/)
  })

  it('counts one real country’s signals exactly as the file holds them, and names their sources', () => {
    const counted = new Map<string, Set<string>>()
    let expected = 0
    for (const [id, signals] of Object.entries(data.signals)) {
      for (const signal of signals) {
        if (signal.geo === null || !/^[A-Z]{2}$/.test(signal.geo)) continue
        const held = counted.get(signal.geo) ?? new Set<string>()
        held.add(id)
        counted.set(signal.geo, held)
        expected += 1
      }
    }
    expect(expected).toBeGreaterThan(0)
    const frame = trendingLayer.frame(day)
    expect(frame.records.reduce((sum, r) => sum + (r.value ?? 0), 0)).toBe(expected)

    const names = new Map(data.sources.map((source) => [source.id, source.name]))
    const iso2 = [...counted.keys()].sort()[0]
    const record = frame.records.find((r) => r.receipt.locator.includes(`geo is ${iso2} `))!
    expect(record, iso2).toBeTruthy()
    expect(record.labelKind).toBe('centroid')
    // the name and the centroid both ride with the code since G3's third evening
    expect(Array.isArray(record.at)).toBe(false)
    const at = record.at as { iso3: string; name: string; centroid: [number, number] }
    expect(at.centroid).toEqual(centroidOfIso3(at.iso3))
    expect(at.name).toBe(nameOf(byIso3(at.iso3)))
    for (const source of counted.get(iso2)!) expect(record.receipt.words).toContain(names.get(source)!)
  })

  it('counts the signals that carry a language, in words, and places none of them', () => {
    const languages = Object.values(data.signals)
      .flat()
      .filter((signal) => signal.geo !== null && !/^[A-Z]{2}$/.test(signal.geo))
    expect(languages.length).toBeGreaterThan(0)
    const frame = trendingLayer.frame(day)
    expect(frame.note).toContain(String(languages.length))
    expect(frame.note).toContain('carry a language rather than a country')
    for (const signal of languages) {
      expect(frame.records.some((r) => r.receipt.locator.includes(`geo is ${signal.geo} `))).toBe(false)
    }
  })

  it('says in its source block that a per-language signal is placed nowhere', () => {
    expect(trendingLayer.kind).toBe('points')
    expect(trendingLayer.source.name).toContain('placed nowhere')
    expect(trendingLayer.readout.caution).toContain('never of people')
  })
})

// ── G3, third evening: the first STATIC layers, and the two alias tables they own ───────────────
// A static layer holds no day of its own (`days: []`), so the generic suite above — built to ask
// "does an unheld day answer empty?" — does not fit it: an unheld day for THESE layers still
// answers with the one frame they always answer with, on every day there is. So each gets its own
// suite here instead of a row in the shared `LAYERS` table, asking the same three real questions
// in the shape that actually applies, plus the one this evening adds twice: does every row of the
// real archive resolve, so an alias table gap fails the build rather than dropping a country.

interface AdmissionsFixture {
  source: { licence_notice: string }
  generated: string
  pairs: Array<{ admitted: Array<{ key: Array<string | number>; label: string; where: string | null }> }>
}

describe('admissions — EM-DAT and UCDP, static, one mark per country per register', () => {
  const emdat = read<AdmissionsFixture>('src/data/admissions/emdat.json')
  const ucdp = read<AdmissionsFixture>('src/data/admissions/ucdp-brd.json')

  it('resolves every row of both committed files — an alias gap fails here, not silently on the globe', () => {
    for (const pair of emdat.pairs) {
      for (const row of pair.admitted) {
        expect(() => resolveEmdatIso3(String(row.key[0])), String(row.key[0])).not.toThrow()
      }
    }
    for (const pair of ucdp.pairs) {
      for (const row of pair.admitted) {
        expect(() => resolveUcdpCountry(row.where!), row.where!).not.toThrow()
      }
    }
  })

  it('throws naming an EM-DAT code and a UCDP place it truly cannot place', () => {
    expect(() => resolveEmdatIso3('1999-0001-ZZZ')).toThrow(/no country for EM-DAT|ZZZ/)
    expect(() => resolveUcdpCountry('Not A Real Country')).toThrow(/no country for UCDP place "Not A Real Country"/)
  })

  it('holds no day of its own, and answers any day — even a nonsense one — with the same frame', () => {
    expect(admissionsLayer.days).toEqual([])
    expect(admissionsLayer.static).toBeTruthy()
    const a = admissionsLayer.frame('1999-01-01')
    const b = admissionsLayer.frame(admissionsLayer.asOf)
    expect(a).toEqual(admissionsLayer.static)
    expect(a).toEqual(b)
  })

  it('takes its as-of as the later of the two files’ own generated dates, never a clock', () => {
    expect(admissionsLayer.asOf).toBe([emdat.generated, ucdp.generated].sort().at(-1))
    expect(admissionsLayer.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('counts one country of one register exactly as the file holds it, at a real row', () => {
    // Colombia's UCDP rows, counted by hand from the committed file, independently of the adapter
    const colombiaRows = ucdp.pairs.flatMap((p) => p.admitted).filter((r) => r.where === 'Colombia')
    expect(colombiaRows.length).toBeGreaterThan(0)
    const record = admissionsLayer.static!.records.find(
      (r) => r.receipt.file.endsWith('ucdp-brd.json') && (r.at as { iso3: string }).iso3 === 'COL',
    )!
    expect(record, 'no Colombia mark from the UCDP register').toBeTruthy()
    expect(record.value).toBe(colombiaRows.length)
    expect(record.labelKind).toBe('centroid')
    expect(record.receipt.locator).toMatch(/^pairs\[\d+\]\.admitted\[\d+\] · /)
    // the locator names a real row: the key it prints is one of the file's own keys
    const namedKey = record.receipt.locator.split(' · ')[1]
    expect(colombiaRows.some((r) => r.key.join('-') === namedKey)).toBe(true)
  })

  it('gives a country in both registers two marks, never one summed mark', () => {
    const marks = admissionsLayer.static!.records.filter((r) => (r.at as { iso3: string }).iso3 === 'COL')
    expect(marks.length).toBe(2)
    expect(new Set(marks.map((m) => m.receipt.file)).size).toBe(2)
    expect(admissionsLayer.readout.caution).toContain('never adds their counts together')
  })

  it('counts the small islands the 1:110m atlas draws no polygon for, and draws them nowhere', () => {
    // Cayman Islands (CYM) is in the EM-DAT file (see the file's own header comment example) and
    // is one of the countries this atlas has no polygon for
    expect(centroidOfIso3('CYM')).toBeNull()
    expect(admissionsLayer.static!.records.some((r) => (r.at as { iso3: string }).iso3 === 'CYM')).toBe(false)
    expect(admissionsLayer.static!.note).toContain('drawn nowhere')
  })

  it('gives every mark a name and a centroid riding with its code, and a country-line owner', () => {
    for (const record of admissionsLayer.static!.records) {
      const at = record.at as { iso3: string; name: string; centroid: [number, number] }
      expect(at.centroid).toEqual(centroidOfIso3(at.iso3))
      expect(at.name).toBe(nameOf(byIso3(at.iso3)))
    }
    expect(admissionsLayer.owner).toEqual({ line: 'counter-measurement' })
  })

  it('quotes both licence notices byte-exact, and says EM-DAT is CC BY-NC-ND', () => {
    expect(admissionsLayer.source.license).toContain(emdat.source.licence_notice)
    expect(admissionsLayer.source.license).toContain(ucdp.source.licence_notice)
    expect(admissionsLayer.source.license).toContain('CC BY-NC-ND')
  })

  it('carries no digit in its own readout templates', () => {
    for (const value of Object.values(admissionsLayer.readout)) expect(value).not.toMatch(/\d/)
  })
})

describe('the mirrored attention warnings — a heading’s own country, at this house’s own centroids', () => {
  const pages = readMirroredPages()

  it('holds exactly the 250 mirrored pages this evening’s survey counted', () => {
    expect(pages.length).toBe(250)
  })

  it('resolves every named country of every one of the 250 mirrored headings', () => {
    for (const page of pages) {
      const names = countriesInHeading(page.h1)
      if (names === null) continue
      for (const name of names) expect(() => resolveMirroredCountry(name), `${page.slug}: "${name}"`).not.toThrow()
    }
  })

  it('throws naming a mirrored country name it truly cannot place', () => {
    expect(() => resolveMirroredCountry('Not A Real Country')).toThrow(/no country for mirrored name "Not A Real Country"/)
  })

  it('parses the <h1>, never the <title> — the two truncated titles still resolve in full', () => {
    const truncated = pages.filter((p) => {
      const html = readFileSync(`public/attention/future/${p.slug}.html`, 'utf8')
      return /<title>[^<]*…[^<]*<\/title>/.test(html)
    })
    expect(truncated.length).toBe(2)
    for (const page of truncated) {
      const names = countriesInHeading(page.h1)
      expect(names, page.slug).not.toBeNull()
      expect(names!.length).toBeGreaterThan(1)
      expect(page.h1).not.toContain('…')
    }
  })

  it('skips an empty segment — one heading ends in a stray trailing comma', () => {
    const withStray = pages.find((p) => /,\s*,\s*$/.test(p.h1))
    expect(withStray, 'no mirrored heading ends in a stray double comma this evening').toBeTruthy()
    expect(countriesInHeading(withStray!.h1)!.every((n) => n.length > 0)).toBe(true)
  })

  it('collapses doubled whitespace inside a country name before matching it', () => {
    expect(countriesInHeading('Drought in Bosnia  and  Herzegovina')).toEqual(['Bosnia and Herzegovina'])
  })

  it('counts a heading naming no country in words, and draws it nowhere — most of this archive', () => {
    const { placed, countryless } = groupWarningsByCountry(pages)
    expect(countryless).toBeGreaterThan(placed.length)
    expect(attentionWarningsLayer.static!.note).toContain(String(countryless))
    expect(attentionWarningsLayer.static!.note).toContain('name no country')
  })

  it('counts one real country’s warnings exactly as the mirror holds them, at a real page', () => {
    const chinaPages = pages.filter((p) => countriesInHeading(p.h1)?.includes('China'))
    expect(chinaPages.length).toBeGreaterThan(0)
    const record = attentionWarningsLayer.static!.records.find((r) => (r.at as { iso3: string }).iso3 === 'CHN')!
    expect(record, 'no China mark').toBeTruthy()
    expect(record.value).toBe(chinaPages.length)
    expect(record.receipt.file).toMatch(/^public\/attention\/future\/.+\.html$/)
    expect(readFileSync(record.receipt.file, 'utf8')).toContain('<h1>')
    expect(record.receipt.url).toBe(`/attention/future/${record.receipt.file.split('/').pop()}`)
  })

  it('gives every mark a name and a centroid riding with its code, and Machine Attention’s own voice', () => {
    for (const record of attentionWarningsLayer.static!.records) {
      const at = record.at as { iso3: string; name: string; centroid: [number, number] }
      expect(at.centroid).toEqual(centroidOfIso3(at.iso3))
      expect(at.name).toBe(nameOf(byIso3(at.iso3)))
      expect(record.labelKind).toBe('centroid')
    }
    expect(attentionWarningsLayer.owner).toEqual({ voice: 'machine-attention' })
  })

  it('draws none of Machine Attention’s own coordinates, and says so in its source block', () => {
    expect(attentionWarningsLayer.source.name).toContain('never Machine Attention’s own GDACS positions')
    expect(attentionWarningsLayer.readout.caution).toContain('asked for and not yet answered')
  })

  it('holds no day of its own, and answers any day — even a nonsense one — with the same frame', () => {
    expect(attentionWarningsLayer.days).toEqual([])
    const a = attentionWarningsLayer.frame('1999-01-01')
    expect(a).toEqual(attentionWarningsLayer.static)
  })

  it('takes its as-of from the practice’s own export, never a clock', () => {
    expect(attentionWarningsLayer.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('carries no digit in its own readout templates', () => {
    for (const value of Object.values(attentionWarningsLayer.readout)) expect(value).not.toMatch(/\d/)
  })

  it('the crosswalk resolves every country name this alias table maps, and every alias earns its keep', () => {
    // hygiene on the alias table itself: an alias pointing at a code the crosswalk cannot place
    // would throw loudly at import time already, so this proves the OTHER direction — every
    // aliased name is one this evening's mirror actually uses, so none of the three can rot unused
    const names = new Set(pages.flatMap((p) => countriesInHeading(p.h1) ?? []))
    for (const alias of ['China', 'Democratic Republic of Congo', 'Türkiye']) {
      expect(names.has(alias), `${alias} is aliased in attention-warnings.ts but never appears in the mirror`).toBe(true)
    }
    expect(countries().length).toBeGreaterThan(0)
  })
})

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
import { ghostFleetLayer } from './ghost-fleet'
import { protocolLayer } from './protocol'
import { skyLayer } from './sky'
import type { GlobeLayer } from './types'

const read = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const datedFiles = (dir: string) =>
  readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.slice(0, 10))
    .sort()

const LAYERS = [skyLayer, ghostFleetLayer, protocolLayer]

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
  it.each(['ghost-fleet.ts', 'protocol.ts', 'sky.ts', 'archive.ts', 'types.ts', 'index.ts'])(
    '%s calls no Date.now(), no new Date() and no Math.random()',
    (name) => {
      const source = readFileSync(`src/lib/globe/layers/${name}`, 'utf8')
      for (const forbidden of ['Date.now(', 'new Date()', 'Math.random(']) {
        expect(source, `${name} calls ${forbidden} — the day axis must come from the archive`).not.toContain(forbidden)
      }
    },
  )

  it('holds the same rule over the model the globe is built from', () => {
    for (const name of ['living.ts', 'geo.ts', 'crosswalk.ts', 'seats.ts']) {
      const source = readFileSync(`src/lib/globe/${name}`, 'utf8')
      for (const forbidden of ['Date.now(', 'new Date()', 'Math.random(']) {
        expect(source, `${name} calls ${forbidden}`).not.toContain(forbidden)
      }
    }
  })
})

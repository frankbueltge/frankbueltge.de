import { describe, expect, it } from 'vitest'
import type { SatSnapshot } from '@/lib/ueberflug/types'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import skyJson from '@/data/ueberflug/satellites.json'
import fleetJson from '@/data/ghost-fleet/latest.json'
import { asOfDay, buildGlobeModel, clientPayload } from './model'
import { positionsAt, satrecsOf } from './propagate'

const sky = skyJson as unknown as SatSnapshot
const fleet = fleetJson as unknown as GhostFleetData

const omm = (norad: number, name: string) => ({
  OBJECT_NAME: name,
  OBJECT_ID: '2014-029A',
  NORAD_CAT_ID: norad,
  EPOCH: '2026-09-01T21:39:31.595328',
  MEAN_MOTION: 14.79480977,
  ECCENTRICITY: 0.00015559,
  INCLINATION: 97.9228,
  RA_OF_ASC_NODE: 340.9688,
  ARG_OF_PERICENTER: 91.9118,
  MEAN_ANOMALY: 268.2272,
  EPHEMERIS_TYPE: 0,
  CLASSIFICATION_TYPE: 'U',
  ELEMENT_SET_NO: 999,
  REV_AT_EPOCH: 66292,
  BSTAR: 0.00018467079,
  MEAN_MOTION_DOT: 0.00001328,
  MEAN_MOTION_DDOT: 0,
})

const FIXTURE_SKY: SatSnapshot = {
  generated_at: '2026-09-02T09:19:38Z',
  sources: [{ name: 'CelesTrak', url: 'https://celestrak.org/', license: 'attribution' }],
  satellites: [
    { norad: 2, name: 'B', intl: 'b', group: 'sar', gcat: { class: 'B', category: 'IMG-R', owner: 'X', state: 'X' }, omm: omm(2, 'B') },
    { norad: 1, name: 'A', intl: 'a', group: 'resource', gcat: { class: null, category: null, owner: null, state: null }, omm: omm(1, 'A') },
  ],
}

const FIXTURE_FLEET: GhostFleetData = {
  date: '2026-09-02',
  generated_at: '2026-09-02T08:16:46Z',
  schema_version: '1',
  pipeline_version: '1',
  window: { from: '2026-08-26', to: '2026-09-02', ended_within_days: 7, examined: 3, capped: false },
  index: { total: 3, dark_hours_examined: 100, in_eez: 2, on_high_seas: 0, in_mpa: 0, in_no_take: 0 },
  pick: null,
  source: { name: 'GFW', url: 'https://globalfishingwatch.org/', license: 'non-commercial' },
  events: [
    { id: 'short', vessel: { name: 'ONE', flag: 'MHL', type: 'cargo' }, start: 's', end: 'e', duration_hours: 10.4, off: { lat: 1, lon: 2 }, on: { lat: 3, lon: 4 }, regions: { mpa: false, no_take: false, eez: [], high_seas: true }, gfw_url: 'u1' },
    { id: 'long', vessel: { name: 'TWO', flag: 'PAN', type: 'fishing' }, start: 's', end: 'e', duration_hours: 99.6, off: { lat: 10, lon: 20 }, on: { lat: 30, lon: 40 }, regions: { mpa: false, no_take: false, eez: ['1'], eez_name: 'Somewhere EEZ', high_seas: false }, gfw_url: 'u2' },
    { id: 'nowhere', vessel: { name: 'THREE', flag: 'X', type: 'x' }, start: 's', end: 'e', duration_hours: 5, off: { lat: null, lon: null }, on: { lat: 1, lon: 1 }, regions: { mpa: false, no_take: false, eez: [], high_seas: false }, gfw_url: 'u3' },
  ],
}

describe('buildGlobeModel', () => {
  it('is deterministic and orders by the record, not by the snapshot rows', () => {
    const a = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    const b = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(a.satellites.map((s) => s.norad)).toEqual([1, 2])
    expect(a.arcs.map((x) => x.id)).toEqual(['long', 'short'])
  })

  it('draws only gaps with both ends on the map, and names their waters in the ghost-fleet page’s words', () => {
    const m = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    expect(m.arcs).toHaveLength(2)
    expect(m.arcs[0]!.waters).toBe('Somewhere EEZ')
    expect(m.arcs[1]!.waters).toBe('high seas')
    expect(m.arcs[0]!.from).toEqual([20, 10])
    expect(m.arcs[0]!.to).toEqual([40, 30])
  })

  it('derives every count and takes its dates from the snapshots, never from a clock', () => {
    const m = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    expect(m.counts).toEqual({ satellites: 2, byGroup: { resource: 1, sar: 1 }, arcs: 2, darkHours: 110, eventsExamined: 3 })
    expect(m.asOf).toEqual({ satellites: '2026-09-02T09:19:38Z', fleet: '2026-09-02' })
    expect(asOfDay(m.asOf.satellites)).toBe('2026-09-02')
    expect(m.sources).toHaveLength(2)
  })

  it('hands the island a payload without the fields the drawing never reads', () => {
    const p = clientPayload(buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET))
    expect(Object.keys(p).sort()).toEqual(['arcs', 'asOf', 'counts', 'satellites'])
    expect(Object.keys(p.satellites[0]!).sort()).toEqual(['cls', 'group', 'name', 'norad', 'omm', 'owner'])
  })

  it('reads the committed record of this repo', () => {
    const m = buildGlobeModel(sky, fleet)
    expect(m.satellites.length).toBe(sky.satellites.length)
    expect(m.arcs.length).toBeGreaterThan(0)
    expect(m.arcs.length).toBeLessThanOrEqual(fleet.events.length)
    expect(JSON.stringify(m)).not.toMatch(/#[0-9a-fA-F]{6}\b/)
  })
})

describe('positionsAt', () => {
  it('propagates every parsable record to a finite point, the same one for the same instant', () => {
    const m = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    const recs = satrecsOf(m.satellites)
    const t = Date.parse('2026-09-02T09:19:38Z')
    const a = positionsAt(recs, t)
    const b = positionsAt(recs, t)
    expect(a).toEqual(b)
    for (const p of a) {
      expect(p).not.toBeNull()
      expect(Math.abs(p!.lon)).toBeLessThanOrEqual(180)
      expect(Math.abs(p!.lat)).toBeLessThanOrEqual(90)
      expect(p!.altKm).toBeGreaterThan(100)
    }
  })

  it('moves when the instant moves', () => {
    const m = buildGlobeModel(FIXTURE_SKY, FIXTURE_FLEET)
    const recs = satrecsOf(m.satellites)
    const t = Date.parse('2026-09-02T09:19:38Z')
    const a = positionsAt(recs, t)[0]!
    const b = positionsAt(recs, t + 60_000)[0]!
    expect(a.lon !== b.lon || a.lat !== b.lat).toBe(true)
  })

  it('keeps a broken element set out of the drawing instead of throwing', () => {
    const recs = satrecsOf([{ omm: { ...omm(9, 'X'), MEAN_MOTION: Number.NaN } as never }])
    const p = positionsAt(recs, Date.parse('2026-09-02T09:19:38Z'))
    expect(p).toEqual([null])
  })
})

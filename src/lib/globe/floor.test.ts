import { describe, expect, it } from 'vitest'
import type { Topology } from 'topojson-specification'
import type { SatSnapshot } from '@/lib/ueberflug/types'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import landJson from '@/data/globe/land-110m.json'
import skyJson from '@/data/ueberflug/satellites.json'
import fleetJson from '@/data/ghost-fleet/latest.json'
import { buildGlobeModel } from './model'
import { positionsAt, satrecsOf } from './propagate'
import { buildGlobeFloorSvg, FLOOR_H, FLOOR_W, type FloorLabels } from './floor'

const land = landJson as unknown as Topology
const model = buildGlobeModel(skyJson as unknown as SatSnapshot, fleetJson as unknown as GhostFleetData)
const points = positionsAt(satrecsOf(model.satellites), Date.parse(model.asOf.satellites))
const labels: FloorLabels = {
  title: 'the sky over the record',
  desc: 'satellites and dark vessels at the snapshot’s time',
  satellite: (s) => `${s.name} · ${s.group}`,
  arc: (a) => `${a.vessel.name} · ${a.waters}`,
}
const svg = buildGlobeFloorSvg({ land, arcs: model.arcs, satellites: model.satellites, points, labels })

describe('the globe’s floor', () => {
  it('is byte-identical for the same record', () => {
    expect(buildGlobeFloorSvg({ land, arcs: model.arcs, satellites: model.satellites, points, labels })).toBe(svg)
  })

  it('carries no colour and no style — appearance belongs to the stylesheet', () => {
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|style=/)
  })

  it('draws the land, the graticule, one arc per gap and one point per positioned satellite', () => {
    expect(svg).toMatch(/<path class="sky-land" d="M/)
    expect(svg).toMatch(/<path class="sky-grat" d="M/)
    expect(svg.match(/<g class="sky-gap"/g)?.length).toBe(model.arcs.length)
    const positioned = points.filter((p) => p !== null).length
    expect(svg.match(/<circle class="sky-sat /g)?.length).toBe(positioned)
    expect(positioned).toBeGreaterThan(model.satellites.length * 0.9)
  })

  it('names every mark natively, so the plate reads without a script', () => {
    expect(svg).toContain('<title id="sky-floor-title">the sky over the record</title>')
    expect(svg.match(/<title>/g)?.length).toBe(model.arcs.length + points.filter((p) => p !== null).length)
  })

  it('keeps every coordinate inside the plate, at one decimal', () => {
    const coords = [...svg.matchAll(/c[xy]="(-?\d+(?:\.\d)?)"/g)].map((m) => Number(m[1]))
    expect(coords.length).toBeGreaterThan(0)
    for (const c of coords) {
      expect(c).toBeGreaterThanOrEqual(-0.1)
      expect(c).toBeLessThanOrEqual(Math.max(FLOOR_W, FLOOR_H) + 0.1)
    }
    expect(svg).not.toMatch(/\d\.\d{2,}"/)
  })
})

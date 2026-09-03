import { describe, expect, it } from 'vitest'
import type { Topology } from 'topojson-specification'
import type { SatSnapshot } from '@/lib/ueberflug/types'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import landJson from '@/data/globe/land-110m.json'
import skyJson from '@/data/ueberflug/satellites.json'
import fleetJson from '@/data/ghost-fleet/latest.json'
import { buildGlobeModel } from './model'
import { positionsAt, satrecsOf } from './propagate'
import { buildGlobeFloorSvg, buildLayeredFloorSvg, FLOOR_H, FLOOR_W, type FloorLabels } from './floor'
import { LAYERS } from './layers'
import { buildLivingGlobe, frameOf } from './living'

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

// ── the living globe's plate ───────────────────────────────────────────────────────────────────
// The same four questions as above, asked of the plate that carries every layer: does it stay
// still, does it stay colour-free, does every mark read without a script, and — the new one —
// does its structure match the registry? A group per registered layer is what lets the legend,
// the tables and the plate be the same list; a plate that quietly drew two of three layers would
// look entirely healthy.
const living = buildLivingGlobe()
const layered = buildLayeredFloorSvg({
  land,
  layers: LAYERS.map((layer) => ({ id: layer.id, kind: layer.kind, frame: frameOf(layer, living.newest) })),
  labels: {
    title: 'everything the house measured on this day',
    desc: 'the newest frame of every layer',
    mark: (record, layerId) => `${layerId} · ${record.receipt.words}`,
  },
})

describe('the living globe’s floor', () => {
  it('is byte-identical for the same day', () => {
    const again = buildLayeredFloorSvg({
      land,
      layers: LAYERS.map((layer) => ({ id: layer.id, kind: layer.kind, frame: frameOf(layer, living.newest) })),
      labels: {
        title: 'everything the house measured on this day',
        desc: 'the newest frame of every layer',
        mark: (record, layerId) => `${layerId} · ${record.receipt.words}`,
      },
    })
    expect(again).toBe(layered)
  })

  it('carries no colour and no style — appearance belongs to the stylesheet', () => {
    expect(layered).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|style=/)
  })

  it('gives every registered layer a group of its own, in the registry’s order', () => {
    const groups = [...layered.matchAll(/<g class="globe-layer" data-layer="([^"]+)"/g)].map((m) => m[1])
    expect(groups).toEqual(LAYERS.map((l) => l.id))
  })

  it('draws one mark per record of the day, and names every one of them natively', () => {
    for (const layer of LAYERS) {
      const frame = frameOf(layer, living.newest)
      const group = layered.slice(layered.indexOf(`data-layer="${layer.id}"`))
      const untilNext = group.slice(0, group.indexOf('</g><g class="globe-layer"') + 1 || undefined)
      const marks = untilNext.match(/class="globe-mark /g)?.length ?? 0
      expect(marks, layer.id).toBe(frame.records.length)
    }
    const total = LAYERS.reduce((sum, layer) => sum + frameOf(layer, living.newest).records.length, 0)
    expect(layered.match(/<title>/g)?.length).toBe(total)
  })

  it('says of every mark what kind of place it stands for', () => {
    for (const kind of [...new Set(LAYERS.flatMap((l) => frameOf(l, living.newest).records.map((r) => r.labelKind)))]) {
      expect(layered).toContain(`data-kind="${kind}"`)
    }
  })

  it('keeps every coordinate inside the plate, at one decimal', () => {
    const coords = [...layered.matchAll(/c[xy]="(-?\d+(?:\.\d)?)"/g)].map((m) => Number(m[1]))
    expect(coords.length).toBeGreaterThan(0)
    for (const c of coords) {
      expect(c).toBeGreaterThanOrEqual(-0.1)
      expect(c).toBeLessThanOrEqual(Math.max(FLOOR_W, FLOOR_H) + 0.1)
    }
    expect(layered).not.toMatch(/\d\.\d{2,}"/)
  })
})

describe('the graticule costs what a grid of straight lines costs', () => {
  // Measured on the live entrance on 2026-09-03: `geoPath` walked every graticule line in small
  // steps and wrote each one out — twenty-nine kilobytes of a hundred-and-thirty-seven-kilobyte
  // plate, for a grid that is straight in this projection. Two points per line describe it
  // exactly here, and this test is what keeps the densified version from coming back.
  const grat = /<path class="sky-grat" d="([^"]*)"/.exec(svg)![1]

  it('writes one move and one line per graticule line, and nothing between', () => {
    const moves = grat.match(/M/g)!.length
    const lines = grat.match(/L/g)!.length
    expect(moves).toBe(lines)
    expect(moves).toBeGreaterThan(20)
    expect(moves).toBeLessThan(60)
  })

  it('stays a fraction of what the densified path cost', () => {
    // the densified graticule of the same grid was just under thirty thousand characters
    expect(grat.length).toBeLessThan(2500)
  })
})

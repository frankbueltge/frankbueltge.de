// The triangle's geometry, held to what the drawing claims (2026-10-05): two lanes per pair on
// opposite sides of the axis, an empty direction drawn as an empty track, widths that grow with
// the count and stop at a cap, and nothing that leaves the box or runs into a corner.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parseRelay, type Relation, type RelayKind } from './relay'
import {
  HIT_MIN,
  KIND_SCALE,
  NODE_AT,
  NODE_R,
  TRI_BOX,
  bandAnchor,
  buildRelayView,
  buildTriangle,
  kindSummary,
  relationAnchor,
  relationRows,
  strokeWidth,
  type Band,
  type Point,
} from './relay-triangle'

const SEED = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL('./__fixtures__/relay.seed.json', import.meta.url)), 'utf8'),
)
const state = parseRelay(SEED)
if (state.status !== 'ok') throw new Error('seed does not parse')
const relations: Relation[] = state.relay.relations

const v3 = buildTriangle(relations, '2026-08-30')
const cycle = buildTriangle(relations, '2026-10-03')

/** the corners of a lane's pointer target, parsed back from its points string */
const corners = (points: string): Point[] =>
  points.split(' ').map((p) => {
    const [x, y] = p.split(',').map(Number)
    return { x: x!, y: y! }
  })

/** signed distance of a point from the line through a → b */
function side(p: Point, a: Point, b: Point): number {
  return ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / Math.hypot(b.x - a.x, b.y - a.y)
}

/** separating-axis test for two convex polygons */
function overlaps(p: Point[], q: Point[]): boolean {
  for (const poly of [p, q]) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!
      const b = poly[(i + 1) % poly.length]!
      const axis = { x: -(b.y - a.y), y: b.x - a.x }
      const proj = (pts: Point[]) => pts.map((v) => v.x * axis.x + v.y * axis.y)
      const [pp, qq] = [proj(p), proj(q)]
      if (Math.max(...pp) < Math.min(...qq) || Math.max(...qq) < Math.min(...pp)) return false
    }
  }
  return true
}

const bandById = (bands: Band[], id: string) => bands.find((b) => b.id === id)!

describe('stroke widths', () => {
  it('draws nothing for a count of nothing', () => {
    for (const k of ['built_on', 'answered', 'noted'] as RelayKind[]) expect(strokeWidth(k, 0)).toBe(0)
  })

  it('grows with the count and never past the cap', () => {
    for (const k of ['built_on', 'answered', 'noted'] as RelayKind[]) {
      let last = 0
      for (let c = 1; c <= 40; c++) {
        const w = strokeWidth(k, c)
        expect(w).toBeGreaterThanOrEqual(last)
        expect(w).toBeLessThanOrEqual(KIND_SCALE[k].max)
        last = w
      }
    }
  })

  it('keeps the kinds in their order of weight at every count', () => {
    for (let c = 1; c <= 40; c++) {
      expect(strokeWidth('built_on', c)).toBeGreaterThan(strokeWidth('answered', c))
      expect(strokeWidth('answered', c)).toBeGreaterThan(strokeWidth('noted', c))
    }
  })
})

describe('the triangle', () => {
  it('is deterministic — one relay, one drawing', () => {
    expect(buildTriangle(relations, '2026-08-30')).toEqual(v3)
  })

  it('draws six lanes, one per direction, in the house order', () => {
    expect(v3.bands.map((b) => b.id)).toEqual([
      'field-atelier',
      'field-studio',
      'atelier-field',
      'atelier-studio',
      'studio-field',
      'studio-atelier',
    ])
  })

  it('stacks a lane’s strokes in order of weight, one per kind present', () => {
    const b = bandById(v3.bands, 'atelier-field')
    expect(b.strokes.map((s) => [s.kind, s.count])).toEqual([
      ['built_on', 1],
      ['answered', 2],
    ])
    expect(b.strokes[0]!.offset).toBeLessThan(b.strokes[1]!.offset)
    expect(b.empty).toBe(false)
    expect(b.void).toBeNull()
  })

  it('draws an empty direction as an empty track — notes alone carry nothing', () => {
    const b = bandById(v3.bands, 'studio-field')
    expect(b.empty).toBe(true)
    expect(b.void).not.toBeNull()
    expect(b.strokes.map((s) => s.kind)).toEqual(['noted'])
    expect(v3.isolation).toEqual([
      { giver: 'field', taker: 'atelier' },
      { giver: 'studio', taker: 'field' },
    ])
  })

  it('puts the two directions of a pair on opposite sides of their axis', () => {
    for (const b of v3.bands) {
      const back = bandById(v3.bands, `${b.taker}-${b.giver}`)
      const a = NODE_AT[b.giver]
      const z = NODE_AT[b.taker]
      expect(Math.sign(side(b.mid, a, z))).toBe(-Math.sign(side(back.mid, a, z)))
      for (const c of corners(b.hit)) {
        // every corner of a lane's target is on its own side (or on the axis' own margin)
        expect(side(c, a, z) * side(b.mid, a, z)).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('keeps every lane’s target apart from every other — nothing can be hit twice', () => {
    // the test of the test: a target meets itself, so a "never meets" below is not vacuous
    expect(overlaps(corners(v3.bands[0]!.hit), corners(v3.bands[0]!.hit))).toBe(true)
    for (const model of [v3, cycle]) {
      for (let i = 0; i < model.bands.length; i++) {
        for (let j = i + 1; j < model.bands.length; j++) {
          const [p, q] = [model.bands[i]!, model.bands[j]!]
          expect(overlaps(corners(p.hit), corners(q.hit)), `${p.id} meets ${q.id}`).toBe(false)
        }
      }
    }
  })

  it('holds all of that at the cap too — every lane as wide as it can be drawn', () => {
    const busy: Relation[] = []
    for (const b of v3.bands)
      for (const kind of ['built_on', 'answered', 'noted'] as RelayKind[])
        for (let i = 0; i < 30; i++)
          busy.push({ ...relations[0]!, id: `${b.id}-${kind}-${i}`, giver: b.giver, taker: b.taker, kind })
    const full = buildTriangle(busy, '2026-08-30')
    for (let i = 0; i < full.bands.length; i++) {
      for (let j = i + 1; j < full.bands.length; j++) {
        const [p, q] = [full.bands[i]!, full.bands[j]!]
        expect(overlaps(corners(p.hit), corners(q.hit)), `${p.id} meets ${q.id} at the cap`).toBe(false)
      }
      for (const c of corners(full.bands[i]!.hit)) {
        expect(c.x).toBeGreaterThanOrEqual(0)
        expect(c.x).toBeLessThanOrEqual(TRI_BOX.w)
        for (const n of Object.values(NODE_AT)) expect(Math.hypot(c.x - n.x, c.y - n.y)).toBeGreaterThan(NODE_R + 8)
      }
    }
  })

  it('keeps lanes clear of the corners and inside the box', () => {
    for (const b of v3.bands) {
      const points: Point[] = [
        ...b.strokes.flatMap((s) => [
          { x: s.x1, y: s.y1 },
          { x: s.x2, y: s.y2 },
        ]),
        ...corners(b.arrow),
        ...corners(b.hit),
      ]
      for (const p of points) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThanOrEqual(TRI_BOX.w)
        expect(p.y).toBeLessThanOrEqual(TRI_BOX.h)
        for (const n of Object.values(NODE_AT)) expect(Math.hypot(p.x - n.x, p.y - n.y)).toBeGreaterThan(NODE_R + 8)
      }
    }
  })

  it('never lets a lane’s target narrow below a tappable width', () => {
    for (const b of v3.bands) {
      const c = corners(b.hit)
      expect(Math.hypot(c[3]!.x - c[0]!.x, c[3]!.y - c[0]!.y)).toBeGreaterThanOrEqual(HIT_MIN - 1)
    }
  })

  it('labels the corners away from the lanes, inside the box', () => {
    for (const n of v3.nodes) {
      expect(n.nameY).toBeGreaterThan(0)
      expect(n.personaY).toBeLessThan(TRI_BOX.h)
    }
    expect(v3.nodes.map((n) => n.practice)).toEqual(['field', 'atelier', 'studio'])
  })

  it('draws the window it is given, by the relations’ own dates', () => {
    expect(v3.relationCount).toBe(19)
    expect(cycle.relationCount).toBe(8)
    expect(bandById(cycle.bands, 'field-studio').counts).toEqual({ built_on: 0, answered: 0, noted: 1 })
    expect(cycle.isolation).toHaveLength(5)
  })

  it('says every kind in a summary, zeros included', () => {
    const labels = { built_on: 'built on', answered: 'answered', noted: 'noted' }
    expect(kindSummary(bandById(v3.bands, 'field-studio').counts, labels)).toBe('built on 3 · answered 0 · noted 2')
  })
})

describe('the rows the card and the table floor read', () => {
  const rows = relationRows(relations)

  it('links both ends of a relation to the pinned files', () => {
    const r = rows.find((x) => x.id === 'rel-fixture-17')!
    expect(r.giverHref).toBe(
      'https://github.com/frankbueltge/ulysses/blob/8989898989898989898989898989898989898989/window/cycle-004-session-4/index.html',
    )
    expect(r.takerHref).toContain('https://github.com/frankbueltge/studio/blob/')
  })

  it('links a correction to the relation it names, and leaves free text as text', () => {
    const named = relationRows([
      ...relations,
      { ...relations[0]!, id: 'rel-later', corrects: relations[0]!.id },
    ]).find((x) => x.id === 'rel-later')!
    expect(named.correctsAnchor).toBe(relationAnchor(relations[0]!.id))
    expect(rows.find((x) => x.id === 'rel-fixture-08')!.correctsAnchor).toBeNull()
    expect(rows.find((x) => x.id === 'rel-fixture-08')!.corrects).toBe("the Atelier's thirteen held sources")
  })

  it('keeps fragment ids to a safe alphabet', () => {
    expect(relationAnchor('a b/c#d')).toBe('rel-a-b-c-d')
    expect(bandAnchor('field-studio')).toBe('relay-field-studio')
  })
})

describe('the page’s view of the relay', () => {
  it('draws no lane and lists nothing before the relay has reported', () => {
    const view = buildRelayView({ status: 'absent' }, '2026-10-03')
    expect(view.status).toBe('absent')
    expect(view.windows.v3.relationCount).toBe(0)
    expect(view.windows.cycle.relationCount).toBe(0)
    expect(view.rows).toEqual([])
    expect(view.open).toEqual([])
    expect(view.closed).toEqual([])
    expect(view.asOf).toBeNull()
  })

  it('carries the reason an invalid relay was not drawn', () => {
    const view = buildRelayView({ status: 'invalid', reason: 'contract "x" is not "middle-relay/1"' }, '2026-10-03')
    expect(view.status).toBe('invalid')
    expect(view.reason).toContain('middle-relay/1')
  })

  it('opens "this cycle" on the cycle’s own opening date, and never before the shared question', () => {
    const view = buildRelayView(state, '2026-10-03')
    expect(view.windows.cycle.since).toBe('2026-10-03')
    expect(view.windows.v3.since).toBe('2026-08-30')
    expect(view.asOf).toBe('2026-10-05')
    expect(buildRelayView(state, '2026-08-01').windows.cycle.since).toBe('2026-08-30')
  })
})

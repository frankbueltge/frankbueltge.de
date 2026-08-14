// src/lib/graph/field.test.ts — the drawing keeps its promises.
//
// A figure whose geometry is arithmetic can be checked like arithmetic. These are the claims
// the /experiments/neighbors page makes by DRAWING rather than by writing, so they are asserted
// here rather than trusted: that the daylight really is longer where the audit found more of
// it, that no two marks land on top of each other, and that nothing crowds the centre caption
// or runs off the canvas.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CANVAS,
  CENTRE,
  CENTRE_CLEAR,
  DAYLIGHT,
  LABEL_RADIUS,
  NEIGHBOR_SPACING,
  RAIL,
  VERDICT_LEGEND,
  innermostRadius,
  layoutField,
  polar,
} from './field'
import { neighborhoodField } from './query'
import type { KnowledgeGraph } from './types'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const graph = JSON.parse(readFileSync(`${ROOT}src/data/graph/graph.json`, 'utf8')) as KnowledgeGraph
const entries = neighborhoodField(graph)
const layout = layoutField(entries)

describe('the field draws the whole audited shelf', () => {
  it('gives one spoke to every ranked experiment, in the ranked order', () => {
    expect(layout.spokes).toHaveLength(entries.length)
    // Fourteen since 2026-08-09, not sixteen: Machine Attention and its instrument left the
    // shelf that day — a practice is not a peer of a single piece, and it has its own door at
    // /machine-attention. The floor stays as a guard against a silent shrink; it moved because
    // a decision moved it, and a comment says which.
    expect(layout.spokes.length).toBeGreaterThanOrEqual(14)
    const ranks = layout.spokes.map((s) => s.work.rank as number)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })

  it('places every neighbour the graph carries — none silently dropped for the sake of the picture', () => {
    const drawn = layout.spokes.reduce((sum, s) => sum + s.neighbors.length, 0)
    const inGraph = graph.edges.filter(
      (e) => e.kind === 'neighbor-of' && layout.spokes.some((s) => s.work.id === e.from),
    ).length
    expect(drawn).toBe(inGraph)
    expect(layout.counts.neighbors).toBe(drawn)
  })

  it('never draws a work without prior art — an empty spoke would read as "no neighbours found"', () => {
    for (const spoke of layout.spokes) {
      expect(spoke.neighbors.length, `${spoke.work.werkId} has no neighbour to draw`).toBeGreaterThan(0)
    }
  })
})

describe('the daylight is the claim, so it is measured', () => {
  it('gives a wide-daylight verdict strictly more room than a some-daylight one, and that more than little', () => {
    expect(DAYLIGHT.UNIQUE).toBeGreaterThan(DAYLIGHT['ADDED VALUE'])
    expect(DAYLIGHT['ADDED VALUE']).toBeGreaterThan(DAYLIGHT.REDUNDANT)
  })

  it('draws each spoke’s gap at exactly its verdict’s length', () => {
    for (const spoke of layout.spokes) {
      const verdict = spoke.work.verdict as keyof typeof DAYLIGHT
      expect(spoke.gap, `${spoke.work.werkId} (${verdict})`).toBe(DAYLIGHT[verdict])
      expect(Math.round(Math.hypot(spoke.daylight.x2 - spoke.daylight.x1, spoke.daylight.y2 - spoke.daylight.y1))).toBe(
        DAYLIGHT[verdict],
      )
    }
  })

  it('names every verdict class in the legend — nothing is drawn that the legend cannot explain', () => {
    const drawn = new Set(layout.spokes.map((s) => s.work.verdict))
    for (const verdict of drawn) expect(VERDICT_LEGEND.map((l) => l.key)).toContain(verdict)
    // and the reverse: the legend explains the scale itself, in plain words
    for (const item of VERDICT_LEGEND) expect(item.hint.length).toBeGreaterThan(20)
  })
})

describe('nothing collides and nothing runs off the canvas', () => {
  it('keeps neighbours on one spoke apart — evenly, at most the default spacing, never touching', () => {
    for (const spoke of layout.spokes) {
      const radii = spoke.neighbors.map((n) => n.r)
      const gaps = radii.slice(1).map((r, i) => radii[i] - r)
      for (const gap of gaps) {
        expect(gap).toBeLessThanOrEqual(NEIGHBOR_SPACING)
        expect(gap).toBeGreaterThan(4) // marks must stay distinguishable dots
        expect(gap).toBeCloseTo(gaps[0], 6) // even within one spoke
      }
    }
  })

  it('keeps the innermost mark clear of the centre caption', () => {
    // "nothing may come nearer the middle than this" — sitting exactly on the
    // clearing is the deepest a compressed stack may reach, never inside it
    expect(innermostRadius(layout)).toBeGreaterThanOrEqual(CENTRE_CLEAR)
  })

  it('keeps every mark inside the canvas', () => {
    const points = layout.spokes.flatMap((s) => [{ x: s.x, y: s.y }, ...s.neighbors])
    for (const p of points) {
      expect(p.x).toBeGreaterThan(0)
      expect(p.x).toBeLessThan(CANVAS)
      expect(p.y).toBeGreaterThan(0)
      expect(p.y).toBeLessThan(CANVAS)
    }
  })

  it('leaves room outside the rail for the longest title on this shelf', () => {
    // Radial labels run outward from LABEL_RADIUS at 11px; 7.0px per character is the safe
    // upper bound for this face at that size. If a longer title ever lands on the shelf, this
    // fails rather than letting the label walk out of the frame — which is exactly what it did
    // when the canvas was 880 and "The State Before the Interface" arrived.
    const longest = Math.max(...layout.spokes.map((s) => s.work.label.length))
    expect(LABEL_RADIUS + longest * 7.0).toBeLessThan(CENTRE)
  })

  it('spaces the spokes evenly around the circle', () => {
    const step = 360 / layout.spokes.length
    layout.spokes.forEach((spoke, i) => expect(spoke.angle).toBeCloseTo(i * step, 6))
    expect(new Set(layout.spokes.map((s) => s.angle)).size).toBe(layout.spokes.length)
  })

  it('puts 0° at the top and turns clockwise', () => {
    const top = polar(RAIL, 0)
    expect(top.x).toBeCloseTo(CENTRE, 6)
    expect(top.y).toBeCloseTo(CENTRE - RAIL, 6)
    const right = polar(RAIL, 90)
    expect(right.x).toBeCloseTo(CENTRE + RAIL, 6)
  })

  it('flips the labels on the left half so none of them reads upside down', () => {
    for (const spoke of layout.spokes) {
      expect(spoke.label.flipped).toBe(spoke.angle > 180)
    }
  })
})

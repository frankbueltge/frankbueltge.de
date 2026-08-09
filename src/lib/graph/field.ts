// src/lib/graph/field.ts — the geometry of the neighbourhood figure (/holdings/neighbors).
//
// Every experiment is a point on one rail; the projects that already do something like it sit
// on the same spoke, INWARD. What the eye reads is the empty stretch between the two: the
// daylight. The stretch is set by the audit's verdict class and by nothing else — this figure
// draws a dated, cited judgement, not a computed similarity (the difference from the literature
// maps and originality metrics named on the page itself).
//
// The layout is pure arithmetic: same graph in, same coordinates out, no randomness, no force
// simulation — so field.test.ts can assert that nothing collides and that the drawing keeps its
// promises (a UNIQUE work really does get more room than a REDUNDANT one).

import type { GraphNode, WorkNode } from './types'
import type { FieldEntry } from './query'

/** Square canvas; the centre is its middle. Labels run OUTWARD from the rail, so the canvas —
 *  not the rail — is what has to grow with the longest title on the shelf. It was 880 until
 *  field.test.ts measured "The State Before the Interface" walking 48px past the frame. */
export const CANVAS = 1000
export const CENTRE = CANVAS / 2
/** where the experiments themselves sit */
export const RAIL = 250
/** first character of a work's label */
export const LABEL_RADIUS = RAIL + 16
/** distance between two neighbours on the same spoke */
export const NEIGHBOR_SPACING = 14
/** nothing may come nearer the middle than this — the centre carries the figure's own count */
export const CENTRE_CLEAR = 62

/** The daylight, in pixels, per verdict class. The ONLY place this mapping exists; the legend
 *  and the register read it from here so a change cannot be half-applied. */
export const DAYLIGHT: Record<NonNullable<WorkNode['verdict']>, number> = {
  UNIQUE: 110,
  'ADDED VALUE': 64,
  REDUNDANT: 26,
}

/** How the legend says it out loud — plain language, no jargon, no traffic lights. */
export const VERDICT_LEGEND: Array<{ key: NonNullable<WorkNode['verdict']>; label: string; hint: string }> = [
  {
    key: 'UNIQUE',
    label: 'wide daylight',
    hint: 'the audit found no project doing this; the verdict rests on absence of evidence',
  },
  {
    key: 'ADDED VALUE',
    label: 'some daylight',
    hint: 'neighbours exist and are named; something here is still not replicated',
  },
  {
    key: 'REDUNDANT',
    label: 'little daylight',
    hint: 'a named neighbour already does this, often at greater scale',
  },
]

export interface PlacedNeighbor {
  node: GraphNode
  url?: string
  note?: string
  r: number
  x: number
  y: number
}

export interface Spoke {
  work: WorkNode
  /** position on the rail, clockwise from the top */
  index: number
  /** degrees, 0 = top */
  angle: number
  x: number
  y: number
  gap: number
  /** where the label starts, and whether it must be flipped to stay readable */
  label: { x: number; y: number; angle: number; flipped: boolean }
  /** the daylight stretch, drawn: from the rail inward to the nearest neighbour */
  daylight: { x1: number; y1: number; x2: number; y2: number; length: number }
  neighbors: PlacedNeighbor[]
}

export interface FieldLayout {
  spokes: Spoke[]
  canvas: number
  centre: number
  rail: number
  /** what the middle of the figure states about itself */
  counts: { works: number; neighbors: number }
}

/** Polar → cartesian with 0° at the top, turning clockwise. */
export function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTRE + r * Math.cos(rad), y: CENTRE + r * Math.sin(rad) }
}

export function layoutField(entries: FieldEntry[]): FieldLayout {
  const step = 360 / entries.length
  const spokes = entries.map((entry, index) => {
    const angle = index * step
    const verdict = entry.work.verdict as NonNullable<WorkNode['verdict']>
    const gap = DAYLIGHT[verdict]
    const at = polar(RAIL, angle)

    const neighbors = entry.neighbors.map((neighbor, k) => {
      const r = RAIL - gap - k * NEIGHBOR_SPACING
      return { ...neighbor, r, ...polar(r, angle) }
    })

    // Radial labels stay readable by being flipped on the left half of the circle: on the right
    // they run outward, on the left they run inward and are anchored at the far end.
    const flipped = angle > 180
    const label = { ...polar(LABEL_RADIUS, angle), angle: flipped ? angle + 90 : angle - 90, flipped }

    const inner = polar(RAIL - gap, angle)
    return {
      work: entry.work,
      index,
      angle,
      x: at.x,
      y: at.y,
      gap,
      label,
      daylight: { x1: at.x, y1: at.y, x2: inner.x, y2: inner.y, length: gap },
      neighbors,
    }
  })

  return {
    spokes,
    canvas: CANVAS,
    centre: CENTRE,
    rail: RAIL,
    counts: {
      works: spokes.length,
      neighbors: spokes.reduce((sum, s) => sum + s.neighbors.length, 0),
    },
  }
}

/** The innermost point the drawing reaches — the guard that keeps the centre caption legible. */
export function innermostRadius(layout: FieldLayout): number {
  return Math.min(...layout.spokes.flatMap((s) => s.neighbors.map((n) => n.r)))
}

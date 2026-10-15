// src/lib/ops/viz.ts — the small marks of the ops room: the board's sparklines and the live
// tiles' mini-vizzes. Pure string and geometry builders, no colour: every mark inherits its
// stroke and fill from the CSS class it is given, so the palette lives in src/styles/ops-room.css
// and this file carries none (the same split the dataviz layer is held to by
// scripts/drift-check.mjs rule 6).
//
// Every mark here is drawn from a real committed series. The design mock filled these with
// plausible shapes — a decorative line under a real number is a small lie about how much of the
// tile is measured, and it costs nothing to draw the actual thing instead.
//
// 2026-09-01: the geometry moved onto d3 (scales and shape generators, at BUILD time only). The
// lines are monotone cubic curves (d3.curveMonotoneX) rather than straight segments — a curve
// that passes through every point and never overshoots, so a peak stays a peak and a zero stays
// a zero; the bars and cells sit on band scales, so their spacing is one decision instead of
// arithmetic repeated in three places. Same contract as before: same inputs ⇒ byte-identical
// output (d3's generators are pure; digits are fixed at one decimal), no clock, no randomness.

import { area, curveMonotoneX, line, scaleBand, scaleLinear } from 'd3'

/** Moving average, window 3, one pass — enough to keep a 26px-high line from looking like noise. */
export function smooth3(values: readonly number[]): number[] {
  if (values.length < 3) return [...values]
  return values.map(
    (_, i) => (values[Math.max(i - 1, 0)] + values[i] + values[Math.min(i + 1, values.length - 1)]) / 3,
  )
}

const round1 = (n: number): number => Math.round(n * 10) / 10

export interface VizBox {
  width: number
  height: number
  /** ink kept off the top and bottom edge so a stroke is never half-clipped */
  pad: number
}

export const SPARK_BOX: VizBox = { width: 96, height: 26, pad: 3 }
export const TILE_BOX: VizBox = { width: 96, height: 26, pad: 3 }

export interface VizPoint {
  x: number
  y: number
}

/**
 * The points of a line across the box, peak-normalised, one decimal. Normalising each mark to
 * its OWN peak is right here and would be wrong on a shared axis: these marks sit in separate
 * tiles about separate quantities, so the only thing a reader can compare between them is shape,
 * and shape is what the normalisation preserves. Nothing in the room invites comparing two of
 * them by height.
 *
 * Exported on its own because the client's hover probe needs the same points the line was drawn
 * through — they travel on the SVG as data, so the script never re-derives this maths.
 */
export function linePoints(values: readonly number[], box: VizBox = TILE_BOX): VizPoint[] {
  const v = values.filter((n) => Number.isFinite(n))
  if (v.length < 2) return []
  const min = Math.min(...v)
  const max = Math.max(...v)
  const x = scaleLinear().domain([0, v.length - 1]).range([0, box.width])
  // A flat series has no span; it sits on the floor rather than dividing by zero.
  const y = scaleLinear()
    .domain([min, max === min ? min + 1 : max])
    .range([box.height - box.pad, box.pad])
  return v.map((n, i) => ({ x: round1(x(i)), y: round1(y(n)) }))
}

const monotone = line<VizPoint>()
  .x((p) => p.x)
  .y((p) => p.y)
  .curve(curveMonotoneX)
  .digits(1)

/** A line across the box, peak-normalised — a monotone cubic through the series' own points. */
export function linePath(values: readonly number[], box: VizBox = TILE_BOX): string {
  const pts = linePoints(values, box)
  return pts.length < 2 ? '' : (monotone(pts) ?? '')
}

/**
 * The same curve closed down to the box's floor — the quiet fill under a sparkline. Drawn from
 * the identical points as the line, so the two can never disagree about where the series went.
 */
export function areaPath(values: readonly number[], box: VizBox = TILE_BOX): string {
  const pts = linePoints(values, box)
  if (pts.length < 2) return ''
  const fill = area<VizPoint>()
    .x((p) => p.x)
    .y0(box.height)
    .y1((p) => p.y)
    .curve(curveMonotoneX)
    .digits(1)
  return fill(pts) ?? ''
}

/** Where the series ends — the newest reading, marked as a point on the line. */
export function lastPoint(values: readonly number[], box: VizBox = TILE_BOX): VizPoint | null {
  const pts = linePoints(values, box)
  return pts.length ? pts[pts.length - 1] : null
}

/** The points as one attribute value ("x,y x,y …") for the hover probe to read back. */
export function pointsAttr(points: readonly VizPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export interface Bar {
  x: number
  y: number
  width: number
  height: number
  /** true where the bar is the one the reading is about — the tile's own emphasis */
  marked: boolean
}

/** Bars from the box's floor on a band scale, peak-normalised, with an optional set of indices
 *  to mark. A bar is never thinner than 1.5 nor shorter than 1: a real zero still shows as a
 *  hairline on the floor rather than vanishing. */
export function bars(values: readonly number[], marked: ReadonlySet<number> = new Set(), box: VizBox = TILE_BOX): Bar[] {
  const v = values.filter((n) => Number.isFinite(n))
  if (v.length === 0) return []
  const peak = Math.max(...v, 0) || 1
  const x = scaleBand<number>()
    .domain(v.map((_, i) => i))
    .range([0, box.width])
    .paddingInner(0.28)
  const h = scaleLinear().domain([0, peak]).range([0, box.height - box.pad])
  const w = Math.max(1.5, round1(x.bandwidth()))
  return v.map((n, i) => {
    const height = Math.max(1, round1(h(Math.max(n, 0))))
    return { x: round1(x(i) ?? 0), y: round1(box.height - height), width: w, height, marked: marked.has(i) }
  })
}

export interface Cell {
  x: number
  y: number
  width: number
  height: number
  marked: boolean
}

/** A row of equal cells — counting, not measuring: one cell per thing, the marked ones dim.
 *  Used where the reading IS a count of items in two states (sources answered vs. adjourned).
 *  Capped at 24 cells: beyond that a 96px row stops being countable by eye. */
export function cells(count: number, marked: ReadonlySet<number> = new Set(), box: VizBox = TILE_BOX): Cell[] {
  if (count <= 0) return []
  const capped = Math.min(count, 24)
  const x = scaleBand<number>()
    .domain(Array.from({ length: capped }, (_, i) => i))
    .range([0, box.width])
    .paddingInner(0.38)
  const w = Math.max(1.5, round1(x.bandwidth()))
  const h = Math.min(10, box.height - 2 * box.pad)
  const y = round1((box.height - h) / 2)
  return Array.from({ length: capped }, (_, i) => ({ x: round1(x(i) ?? 0), y, width: w, height: h, marked: marked.has(i) }))
}

/** Two stacked bars — a proportion drawn as length, where the number above it is a share. */
export function ratioBars(part: number, whole: number, box: VizBox = TILE_BOX): Bar[] {
  const safeWhole = whole > 0 ? whole : 1
  const share = Math.min(Math.max(part / safeWhole, 0), 1)
  const h = 6
  return [
    { x: 0, y: box.height / 2 - h - 2, width: round1(box.width * share), height: h, marked: true },
    { x: 0, y: box.height / 2 + 2, width: box.width, height: h, marked: false },
  ]
}

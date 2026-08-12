// src/lib/ops/viz.ts — the small marks of the ops room: the board's sparklines and the live
// tiles' mini-vizzes. Pure string builders, no colour: every mark inherits its stroke and fill
// from the CSS class it is given, so the palette lives in src/styles/ops-room.css and this file
// carries none (the same split the dataviz layer is held to by scripts/drift-check.mjs rule 6).
//
// Every mark here is drawn from a real committed series. The design mock filled these with
// plausible shapes — a decorative line under a real number is a small lie about how much of the
// tile is measured, and it costs nothing to draw the actual thing instead.

/** Moving average, window 3, one pass — enough to keep a 26px-high line from looking like noise. */
export function smooth3(values: readonly number[]): number[] {
  if (values.length < 3) return [...values]
  return values.map(
    (_, i) => (values[Math.max(i - 1, 0)] + values[i] + values[Math.min(i + 1, values.length - 1)]) / 3,
  )
}

const fmt = (n: number): string => (Number.isFinite(n) ? n.toFixed(1) : '0.0')

export interface VizBox {
  width: number
  height: number
  /** ink kept off the top and bottom edge so a stroke is never half-clipped */
  pad: number
}

export const SPARK_BOX: VizBox = { width: 96, height: 26, pad: 3 }
export const TILE_BOX: VizBox = { width: 96, height: 26, pad: 3 }

/**
 * A line across the box, peak-normalised. Normalising each mark to its OWN peak is right here and
 * would be wrong on a shared axis: these marks sit in separate tiles about separate quantities,
 * so the only thing a reader can compare between them is shape, and shape is what the
 * normalisation preserves. Nothing in the room invites comparing two of them by height.
 */
export function linePath(values: readonly number[], box: VizBox = TILE_BOX): string {
  const v = values.filter((n) => Number.isFinite(n))
  if (v.length < 2) return ''
  const min = Math.min(...v)
  const max = Math.max(...v)
  const span = max - min || 1
  const usable = box.height - 2 * box.pad
  const last = v.length - 1
  return v
    .map((n, i) => {
      const x = (i * box.width) / last
      const y = box.height - box.pad - ((n - min) / span) * usable
      return `${i === 0 ? 'M' : 'L'}${fmt(x)} ${fmt(y)}`
    })
    .join('')
}

export interface Bar {
  x: number
  y: number
  width: number
  height: number
  /** true where the bar is the one the reading is about — the tile's own emphasis */
  marked: boolean
}

/** Bars from the box's floor, peak-normalised, with an optional set of indices to mark. */
export function bars(values: readonly number[], marked: ReadonlySet<number> = new Set(), box: VizBox = TILE_BOX): Bar[] {
  const v = values.filter((n) => Number.isFinite(n))
  if (v.length === 0) return []
  const peak = Math.max(...v, 0) || 1
  const slot = box.width / v.length
  const w = Math.max(1.5, slot - 2)
  const usable = box.height - box.pad
  return v.map((n, i) => {
    const h = Math.max(1, (Math.max(n, 0) / peak) * usable)
    return { x: i * slot, y: box.height - h, width: w, height: h, marked: marked.has(i) }
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
 *  Used where the reading IS a count of items in two states (sources answered vs. adjourned). */
export function cells(count: number, marked: ReadonlySet<number> = new Set(), box: VizBox = TILE_BOX): Cell[] {
  if (count <= 0) return []
  const capped = Math.min(count, 24)
  const slot = box.width / capped
  const w = Math.max(1.5, slot - 2)
  const h = Math.min(10, box.height - 2 * box.pad)
  const y = (box.height - h) / 2
  return Array.from({ length: capped }, (_, i) => ({ x: i * slot, y, width: w, height: h, marked: marked.has(i) }))
}

/** Two stacked bars — a proportion drawn as length, where the number above it is a share. */
export function ratioBars(part: number, whole: number, box: VizBox = TILE_BOX): Bar[] {
  const safeWhole = whole > 0 ? whole : 1
  const share = Math.min(Math.max(part / safeWhole, 0), 1)
  const h = 6
  return [
    { x: 0, y: box.height / 2 - h - 2, width: box.width * share, height: h, marked: true },
    { x: 0, y: box.height / 2 + 2, width: box.width, height: h, marked: false },
  ]
}

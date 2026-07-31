// src/lib/dataviz/geometry.ts — shared, pure geometry and string helpers behind the site's
// build-time SVG generators (WP3, "shared dataviz primitives"). Behavior and structure only
// (ADR 0010: the three practices carry no shared visual grammar) — nothing here decides a
// color, a font, or any appearance; every generator that used to carry its own copy of these
// stays free to draw however it likes.
//
// Consolidates: four byte-identical `escapeXml` copies (field/strip.ts, studio/stage.ts,
// begegnungen/score.ts, pulse/render.ts), two byte-identical `wrapLines` copies (studio/stage.ts,
// begegnungen/score.ts), two INCOMPATIBLE `dayRange` implementations (partitur.ts validated and
// returned [] on invalid input; field/strip.ts assumed valid input and threw on a reversed
// range) kept distinct behind an explicit option rather than guessed into one behavior, and
// three path-building formulas (protokoll/series.ts's linePath/areaPath, praemie/chart.ts's
// yearLinePath/yearAreaPath, halbwertszeit/svg.ts's sparkPath) that all reduce to the same
// polyline-over-a-linear-scale shape.
//
// Every export here is pure — same input, same output, no clock reads, no randomness — the
// same contract the generators that use it already carry.

// ---------------------------------------------------------------- escapeXml
/** Byte-identical across all four call sites before this consolidation. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ---------------------------------------------------------------- wrapLines
/** Deterministic greedy word-wrap — no hand-picked line breaks; byte-identical across both
 *  call sites before this consolidation. */
export function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

// ---------------------------------------------------------------- dayRange
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export interface DayRangeOptions {
  /** 'empty' validates the ISO format and returns [] on invalid or reversed input
   *  (partitur.ts's historical contract); 'throw' assumes well-formed dates and refuses only
   *  a reversed range, by throwing (field/strip.ts's historical contract). */
  onInvalid: 'empty' | 'throw'
  /** Caps the number of days generated. partitur.ts's historical cap was 400 (a guard against
   *  a broken-date axis running away); field/strip.ts carried no cap — leave unset to match. */
  maxDays?: number
}

/**
 * Inclusive day range [start..end] — consolidates two incompatible historical contracts behind
 * one explicit option instead of guessing a merged behavior: partitur.ts validated the ISO
 * format and returned [] on anything invalid or reversed; field/strip.ts assumed well-formed
 * input and threw only on a reversed range. Both call sites keep their exact behavior via a
 * one-line wrapper (see partitur.ts and field/strip.ts) — partitur.test.ts and strip.test.ts
 * stay green unmodified.
 */
export function dayRange(start: string, end: string, opts: DayRangeOptions): string[] {
  if (opts.onInvalid === 'empty') {
    if (!DATE_RE.test(start) || !DATE_RE.test(end) || start > end) return []
    const max = opts.maxDays ?? 400
    const out: string[] = []
    const d = new Date(`${start}T00:00:00Z`)
    const stop = new Date(`${end}T00:00:00Z`)
    while (d <= stop && out.length <= max) {
      out.push(d.toISOString().slice(0, 10))
      d.setUTCDate(d.getUTCDate() + 1)
    }
    return out
  }
  // 'throw': no format validation (the historical contract) — only a reversed range is refused.
  const startMs = Date.UTC(Number(start.slice(0, 4)), Number(start.slice(5, 7)) - 1, Number(start.slice(8, 10)))
  const endMs = Date.UTC(Number(end.slice(0, 4)), Number(end.slice(5, 7)) - 1, Number(end.slice(8, 10)))
  if (endMs < startMs) throw new Error(`dayRange: ${end} lies before ${start}`)
  const out: string[] = []
  for (let t = startMs; t <= endMs; t += 86_400_000) {
    if (opts.maxDays !== undefined && out.length > opts.maxDays) break
    out.push(new Date(t).toISOString().slice(0, 10))
  }
  return out
}

// ---------------------------------------------------------------- polyPath + bandScale
export type Scale = (value: number) => number

/** A linear scale from a domain to a range — the shared shape behind every path builder this
 *  consolidates (linePath/areaPath, yearLinePath/yearAreaPath, sparkPath): each mapped a data
 *  value to a pixel position with the same affine formula, just a different domain/range. A
 *  degenerate domain (span 0) falls back to a span of 1 rather than dividing by zero — the same
 *  guard `span = max - min || 1` every ported caller already carried. */
export function bandScale(domain: readonly [number, number], range: readonly [number, number]): Scale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0 || 1
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0)
}

export interface Point {
  x: number
  y: number
}

export interface PolyPathOptions {
  /** decimal places for coordinate formatting (default 1 — matches every ported caller) */
  decimals?: number
  /** closes the path to a baseline y — right point then left point, then `Z` — the shared
   *  area-fill shape behind areaPath/yearAreaPath */
  closeToBaseline?: number
}

/** Builds an SVG path `d` string from a polyline of points — `M` then `L`-joined coordinates,
 *  optionally closed to a baseline for an area fill. Fewer than two points yields no path (the
 *  documented "nothing to draw" case every ported caller already had). */
export function polyPath(points: readonly Point[], opts: PolyPathOptions = {}): string {
  if (points.length < 2) return ''
  const decimals = opts.decimals ?? 1
  const fmt = (n: number) => n.toFixed(decimals)
  const body = points.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(' L')
  let d = `M${body}`
  if (opts.closeToBaseline !== undefined) {
    const last = points[points.length - 1]
    const first = points[0]
    d += ` L${fmt(last.x)},${fmt(opts.closeToBaseline)} L${fmt(first.x)},${fmt(opts.closeToBaseline)} Z`
  }
  return d
}

// ---------------------------------------------------------------- hash01 + derived layouts
//
// The deterministic-placement trio behind every figure that must scatter marks without a grid and
// without a clock: a string hash for the jitter, a sunflower spiral for the initial cloud, and a
// fixed-iteration relaxation pass that pushes overlaps apart. Extracted from src/lib/atelier/
// cockpit.ts's starLayout (which keeps its own domain wrapper and re-exports hash01 from here, so
// its committed pixels and its tests are untouched) because the studio's season floor needs the
// same three pieces in a different combination: a time axis for x, a hashed offset for y, and the
// same collision pass over the result.
//
// The rule these exist to keep: NO Math.random, NO Date.now, no convergence loop with a tolerance
// — identical data must render identical pixels, forever, because these figures are committed
// build artifacts in a repo that treats git as the archive.

/** FNV-1a over the string's char codes, mapped into [0,1). The jitter source for every derived
 *  layout here: a mark's own identity decides where it sits, so the same season always draws
 *  itself the same way and a diff of the built SVG shows real data changes only. */
export function hash01(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) / 0x100000000
}

export interface LayoutNode {
  /** stable identity — the ONLY jitter source (see hash01) */
  key: string
  x: number
  y: number
  /** the mark's own collision footprint */
  r: number
}

export interface RelaxOptions {
  /** extra clearance kept between two marks on top of their two radii */
  gap: number
  /** FIXED number of passes — a count, never "until it converges" (determinism) */
  iterations?: number
  /** inclusive bounds every node is clamped into after the passes (relaxation can push a node
   *  past an edge; clamping last means a crowded cloud packs against the edge rather than
   *  escaping the frame) */
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
}

/**
 * Pushes overlapping nodes apart in place-free fashion (returns new nodes, leaves the input
 * untouched) — the same symmetric half-push over a fixed iteration count cockpit.ts's starLayout
 * carries, generalized so a layout that derives its own initial positions (e.g. from a date axis)
 * can reuse the collision pass without reusing the spiral.
 */
export function relaxOverlaps(nodes: readonly LayoutNode[], opts: RelaxOptions): LayoutNode[] {
  const out = nodes.map((n) => ({ ...n }))
  const iterations = opts.iterations ?? 24
  for (let iter = 0; iter < iterations; iter++) {
    for (let a = 0; a < out.length; a++) {
      for (let b = a + 1; b < out.length; b++) {
        const s = out[a]
        const t = out[b]
        const dx = t.x - s.x
        const dy = t.y - s.y
        const min = s.r + t.r + opts.gap
        const d = Math.hypot(dx, dy) || 0.001
        if (d < min) {
          const push = (min - d) / 2
          const ux = dx / d
          const uy = dy / d
          s.x -= ux * push
          s.y -= uy * push
          t.x += ux * push
          t.y += uy * push
        }
      }
    }
  }
  if (opts.bounds) {
    const { minX, minY, maxX, maxY } = opts.bounds
    for (const n of out) {
      n.x = Math.min(maxX, Math.max(minX, n.x))
      n.y = Math.min(maxY, Math.max(minY, n.y))
    }
  }
  return out
}

export interface SpiralLayoutOptions extends RelaxOptions {
  cx: number
  cy: number
  /** half-extent of the cloud along each axis BEFORE relaxation */
  spreadX: number
  spreadY: number
}

/**
 * Places `items` on a sunflower spiral (golden angle) around a center, jittered by each item's own
 * hash, then relaxes overlaps and clamps to bounds — the generic form of cockpit.ts's
 * constellation layout. Unbounded in count by construction: a spiral has a next slot for every n,
 * which is exactly why it replaces a hand-written position table (studio/stage.ts used to throw
 * once an 11th struck position arrived).
 */
export function spiralLayout(
  items: readonly { key: string; r: number }[],
  opts: SpiralLayoutOptions,
): LayoutNode[] {
  const n = items.length
  const seeded = items.map((item, i) => {
    const angle = i * 2.399963 + hash01(item.key) * 0.9
    const unit = Math.sqrt((i + 0.6) / Math.max(1, n)) * (0.82 + hash01(item.key + '#r') * 0.36)
    return {
      key: item.key,
      r: item.r,
      x: opts.cx + Math.cos(angle) * opts.spreadX * unit,
      y: opts.cy + Math.sin(angle) * opts.spreadY * unit,
    }
  })
  return relaxOverlaps(seeded, opts)
}

// ---------------------------------------------------------------- clampBox
export interface ClampBoxInput {
  /** anchor point, in the container's own local coordinate space */
  x: number
  y: number
  /** size of the box being placed (e.g. a tooltip) */
  w: number
  h: number
  /** the container box to clamp within — the FIGURE's own box, never a scroll container or the
   *  viewport (dataviz/readout.ts's house rule 1) */
  boxW: number
  boxH: number
  /** clearance between the anchor and the box, and the minimum margin from the container edges */
  gap: number
  /** when true, an overflow on the preferred side (right of x / below y) flips the box to the
   *  opposite side instead of clipping (house rule 2); when false the box is only clamped */
  flipX: boolean
  flipY: boolean
}

export interface ClampBoxResult {
  x: number
  y: number
  flippedX: boolean
  flippedY: boolean
}

/** Places a w×h box near an anchor point inside a boxW×boxH container, flipping to the opposite
 *  side on overflow (when enabled) and always clamping the result inside the container so the
 *  box is never clipped. Generic home for the Readout's placement (dataviz/readout.ts's
 *  placeReadout) — see that module for the anchor-relative wrapper. */
export function clampBox(input: ClampBoxInput): ClampBoxResult {
  const { x, y, w, h, boxW, boxH, gap, flipX, flipY } = input

  let px = x + gap
  let flippedX = false
  if (flipX && px + w > boxW - gap) {
    px = x - w - gap
    flippedX = true
  }
  px = Math.min(Math.max(px, gap), Math.max(gap, boxW - w - gap))

  let py = y + gap
  let flippedY = false
  if (flipY && py + h > boxH - gap) {
    py = y - h - gap
    flippedY = true
  }
  py = Math.min(Math.max(py, gap), Math.max(gap, boxH - h - gap))

  return { x: px, y: py, flippedX, flippedY }
}

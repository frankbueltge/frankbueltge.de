/** The arc of one watched term, as geometry (visual layer, 2026-09-03).
 *
 *  The bars themselves have been derived by terms-view.ts's seriesStrip since the tracker
 *  shipped, and they stay there: this module adds the one thing the strip never drew, which is
 *  the COMPARISON the status word rests on. `/trending/topics/<slug>` says a term is rising or
 *  fading; the pipeline decides that by holding the last seven days against the three weeks
 *  before them. Until today a reader saw the sentence and a row of bars, with nothing on the
 *  drawing to say which bars the sentence was about.
 *
 *  The two spans are drawn only when the archive can carry them — a bracket over four committed
 *  days would be a picture of a comparison nobody made. `arcWindows` returns null below the
 *  floor, and the frame says so in words instead. (The archive began on 2026-09-02, so this
 *  appears of its own accord some weeks later; that is the honest behaviour, not a placeholder.)
 *
 *  Pure: same points in, byte-identical spans out. No clock is read — "the last seven days" means
 *  the last seven COMMITTED runs, which is what the tracker itself compares.
 */
import type { TermSeriesPoint } from './terms-types'
import { seriesStrip, type SeriesStrip } from './terms-view'
import { stripSpan, type StripSpan } from './view'

/** Days in the two windows the pipeline's thresholds use. */
export const ARC_WINDOW = { recent: 7, prior: 21 } as const

export interface ArcSpan {
  /** left edge of the span, in the strip's own units */
  x: number
  width: number
  /** how many committed runs the span covers */
  days: number
  /** total mentions inside it */
  total: number
  /** mentions per run inside it, rounded to one decimal — the number the comparison is made of */
  perDay: number
}

export interface ArcWindows {
  recent: ArcSpan
  prior: ArcSpan
  /** the baseline the two brackets hang under */
  y: number
}

export interface ArcModel extends SeriesStrip {
  /** how wide the drawing may render — the day ledger's own bucket (view.ts's stripSpan) */
  span: StripSpan
  /** null until the archive holds both windows; the frame then says so in words */
  windows: ArcWindows | null
  /** committed runs still needed before the comparison can be drawn — 0 once it can */
  needs: number
}

function span(bars: SeriesStrip['bars'], from: number, to: number, barWidth: number): ArcSpan {
  const slice = bars.slice(from, to)
  const first = slice[0]!
  const last = slice[slice.length - 1]!
  const total = slice.reduce((acc, b) => acc + b.d1, 0)
  return {
    x: first.x,
    // from the left edge of the first bar to the right edge of the last one: the bracket covers
    // the bars, not the gaps outside them
    width: last.x + barWidth - first.x,
    days: slice.length,
    total,
    perDay: Math.round((total / slice.length) * 10) / 10,
  }
}

/**
 * The strip plus the two spans the status rests on. `width` and `height` are the strip's, so a
 * caller that already draws bars keeps every coordinate it had.
 */
export function arcModel(points: TermSeriesPoint[], width = 560, height = 72): ArcModel {
  const strip = seriesStrip(points, width, height)
  const need = ARC_WINDOW.recent + ARC_WINDOW.prior
  if (strip.bars.length < need) {
    return { ...strip, span: stripSpan(strip.bars.length), windows: null, needs: need - strip.bars.length }
  }
  const n = strip.bars.length
  const recentFrom = n - ARC_WINDOW.recent
  const priorFrom = recentFrom - ARC_WINDOW.prior
  return {
    ...strip,
    span: stripSpan(strip.bars.length),
    windows: {
      recent: span(strip.bars, recentFrom, n, strip.barWidth),
      prior: span(strip.bars, priorFrom, recentFrom, strip.barWidth),
      y: height + 4,
    },
    needs: 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// The register's sparklines (2026-09-03)
//
// /trending/topics is the half of the ledger called "the arcs", and until today it drew none:
// twenty watched terms with their counts, their status and their pace, and not one line. This is
// the smallest honest figure for a register row — a term's own shape, at the size of a word.
//
// It is deliberately NOT an island. The visual layer permits client rendering; it does not
// require it, and a sparkline has nothing to answer: no readout, no filter, no keyboard walk that
// the row's own link does not already give. Twenty of them cost one <title> each and no
// JavaScript at all.

export const SPARK = { width: 72, height: 16, pad: 1.5 } as const

export interface Spark {
  width: number
  height: number
  /** the polyline through the runs, empty when there is nothing to draw */
  d: string
  /** the newest run, for the dot that ends the line */
  last: { x: number; y: number } | null
  /** this term's own maximum — the line is scaled to it, never to a neighbour's */
  max: number
  runs: number
  /** the term's own zero. A line without one reads as a scratch rather than a figure — with two
   *  committed runs, which is what the archive holds today, it is the only thing that says
   *  whether the segment rose or fell. */
  baseY: number
}

/**
 * One term's committed runs as a line at the size of a word.
 *
 * SCALED TO ITS OWN MAXIMUM, which is the one thing a reader must know: two lines of the same
 * height in this register mean two terms each at their own peak, not two terms at the same count.
 * The alternative — one scale across the register — would flatten every small term into the
 * baseline and say nothing at all. The hub states which of the two it is, in words, under the
 * list.
 */
export function sparkline(points: TermSeriesPoint[], width = SPARK.width, height = SPARK.height): Spark {
  const pad = SPARK.pad
  const runs = points.length
  const baseY = height - pad
  if (runs === 0) return { width, height, d: '', last: null, max: 0, runs, baseY }
  const max = Math.max(...points.map((p) => p.d1))
  const span = height - pad * 2
  const xs = runs === 1 ? [width / 2] : points.map((_, i) => (i / (runs - 1)) * width)
  const ys = points.map((p) => (max > 0 ? height - pad - (p.d1 / max) * span : height - pad))
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(ys[i]!)}`).join(' ')
  return { width, height, d, last: { x: round(xs[runs - 1]!), y: round(ys[runs - 1]!) }, max, runs, baseY }
}

/** Two decimals: enough for a 72-unit line, and it keeps the built markup byte-identical run to
 *  run rather than carrying floating-point noise into the archive. */
function round(n: number): number {
  return Math.round(n * 100) / 100
}

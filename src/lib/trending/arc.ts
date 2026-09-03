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

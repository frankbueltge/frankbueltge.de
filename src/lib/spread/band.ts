// src/lib/spread/band.ts — pure math behind the one claim this figure draws: how far apart the
// venues' current prices sit, and whether that gap is wide enough to belong in the ledger.
//
// "The price" a venue currently offers is read as the MID of its own best bid and best ask — the
// number a single trade's side cannot swing on its own. A trade is drawn as a mark; a quote
// moves the band.
import type { Quote, VenueId } from './venues'

export const mid = (q: Quote): number => (q.bid + q.ask) / 2

export interface Band {
  high: number
  low: number
  width: number
  highVenue: VenueId
  lowVenue: VenueId
}

/** The band across whichever venues currently have a live quote. Fewer than two quoted venues
 *  make no band at all — one venue cannot disagree with itself. */
export function computeBand(quotes: readonly Quote[]): Band | null {
  if (quotes.length < 2) return null
  let high = quotes[0]!
  let low = quotes[0]!
  for (const q of quotes) {
    if (mid(q) > mid(high)) high = q
    if (mid(q) < mid(low)) low = q
  }
  const highMid = mid(high)
  const lowMid = mid(low)
  return { high: highMid, low: lowMid, width: highMid - lowMid, highVenue: high.venue, lowVenue: low.venue }
}

/** A running, decaying estimate of "how wide the band usually is this session" — an exponential
 *  moving average rather than a fixed number, because the right baseline for a quiet night and
 *  for a volatile one are not the same width. */
export interface TypicalWidth {
  ema: number
  count: number
}

export function initTypicalWidth(): TypicalWidth {
  return { ema: 0, count: 0 }
}

/** Folds one more band-width sample into the running estimate. Every sample counts, including a
 *  currently-remarkable one: real disagreements close in under a second (this piece's own
 *  claim), so a few wide samples barely move a slow average, while an average that only ever
 *  learned from calm moments would drift out of date the first time the market actually moved. */
export function updateTypicalWidth(state: TypicalWidth, width: number, alpha = 0.02): TypicalWidth {
  if (!Number.isFinite(width) || width < 0) return state
  if (state.count === 0) return { ema: width, count: 1 }
  return { ema: state.ema + alpha * (width - state.ema), count: state.count + 1 }
}

export interface RemarkableOptions {
  /** how many times the session's typical width a gap must reach to be logged */
  multiplier?: number
  /** how many band samples must have been seen before "typical" means anything — without this a
   *  work that just opened its sockets would log its very first quote as a disagreement */
  minSamples?: number
}

/** The one rule that decides whether a moment belongs in the ledger. */
export function isRemarkableGap(width: number, typical: TypicalWidth, options: RemarkableOptions = {}): boolean {
  const { multiplier = 3, minSamples = 20 } = options
  if (typical.count < minSamples || typical.ema <= 0) return false
  return width >= typical.ema * multiplier
}

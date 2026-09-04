// src/lib/spread/reconnect.ts — pure exponential backoff for one venue's socket.
//
// A dropped venue is not a dead one: a page that gave up after the first failed reconnect would
// call a hiccup an outage. This decides only HOW LONG to wait before the next try, forever —
// Spread.tsx is the one thing that decides WHETHER to try again at all (a venue the visitor
// switched off, or a page nobody is looking at, does not reconnect no matter what this returns).
export interface BackoffOptions {
  /** delay before the first retry, in ms */
  baseMs?: number
  /** the ceiling no retry delay ever exceeds, in ms */
  maxMs?: number
  /** injected for the test; real use lets this default to Math.random */
  random?: () => number
}

/** attempt 0 is the first reconnect try, right after the first drop. Full jitter between 0 and
 *  the exponential ceiling for that attempt, so many tabs reconnecting to the same venue at once
 *  do not all retry on the same tick. */
export function backoffDelayMs(attempt: number, options: BackoffOptions = {}): number {
  const { baseMs = 500, maxMs = 20_000, random = Math.random } = options
  const ceiling = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt))
  return Math.round(ceiling * random())
}

// src/lib/comma/clock.ts — Comma's broadcast clock (2026-11-14). Pure.
//
// The piece plays the world a fixed time behind, on the wall clock, in blocks of five minutes: the block that began
// at B plays from B + DELAY_MS to B + DELAY_MS + BLOCK_MS, for every listener at once. The delay is the block
// itself, the time its tests need to reach OONI, and one more minute in which a refused read can be asked again
// before the block is due. Reading five minutes in one question instead of a minute at a time is a matter of
// OONI's quota, measured on 2026-11-13: OONI charges every address that asks, and one question for five minutes
// of deviations costs about a sixth of five questions for five minutes of all tests.

export const MINUTE_MS = 60_000
export const BLOCK_MS = 5 * MINUTE_MS
/** Tests reach OONI within about three minutes of being run (counted 2026-11-12); a fourth keeps the block whole. */
export const SETTLE_MS = 4 * MINUTE_MS
/** The minute between a block becoming readable and its first test being due. */
export const SLACK_MS = MINUTE_MS
export const DELAY_MS = BLOCK_MS + SETTLE_MS + SLACK_MS

/** The start of the block whose tests are playing at wall time `now`. */
export const blockPlaying = (now: number): number => Math.floor((now - DELAY_MS) / BLOCK_MS) * BLOCK_MS

/** From when a block can be read whole. */
export const readableFrom = (block: number): number => block + BLOCK_MS + SETTLE_MS

/** The wall time at which a moment of the world is played. */
export const playedAt = (world: number): number => world + DELAY_MS

/** The moment of the world that is playing at wall time `now`. */
export const worldAt = (now: number): number => now - DELAY_MS

/** "23:35" for a moment, UTC. */
export const hhmm = (ms: number): string => new Date(ms).toISOString().slice(11, 16)

/** How soon the page asks again after a refusal, by how many came in a row: soon at first, because a block is
 *  due within the minute, then every half minute, so a listener who waits sends at most two questions a minute. */
export const RETRY_SECONDS = [5, 10, 20, 30] as const

export function retrySeconds(inARow: number): number {
  const i = Math.min(Math.max(Math.floor(inARow), 1), RETRY_SECONDS.length) - 1
  return RETRY_SECONDS[i]!
}

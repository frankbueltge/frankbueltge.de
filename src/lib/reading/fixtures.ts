// src/lib/reading/fixtures.ts — readings for the tests, drawn the way the page draws them (2026-10-26).
// Never imported by the site or the Functions.
import { drawPairs, drawSome, seeded } from './draw'
import type { EstimateTuple, VoteTuple } from './reading'
import { CURRENT_ROUND as R } from './rounds'

/** A well-formed reading of the current round: every fifth choice a tie, every seventh "can't say",
 *  the first estimate unknown. */
export function sampleReading(seed = 1, pick: (i: number) => 0 | 1 | 2 | null = (i) => (i % 7 === 6 ? null : i % 5 === 4 ? 2 : ((i % 2) as 0 | 1))) {
  const rand = seeded(seed)
  const votes: VoteTuple[] = drawPairs(R.matters.map((m) => m.id), R.pairs_per_reading, rand).map(([a, b], i) => [a, b, pick(i), 2000 + i])
  const estimates: EstimateTuple[] = drawSome(R.estimates, R.estimates_per_reading, rand).map((e, i) => [e.id, i === 0 ? null : e.truth, 5000])
  return { round: R.id, consent: R.consent_version, primed: false, votes, estimates }
}

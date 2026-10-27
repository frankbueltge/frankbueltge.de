// src/lib/reading/position.ts — where a reading stands between the other two (2026-10-26).
//
// Two plain counts, for one visitor's reading right after it, and for all readings together on the
// record. Neither needs a ranking of the briefing, which ranks nothing but its "urgent but quiet" list:
//
//   · LOUDER — of the decided choices between two matters one of which was CLEARLY louder on the web
//     (at least twice the signals, and at least one more), how many went to the louder one. All of
//     them would mean urgency read off the noise; none, against it. Pairs whose counts differ by less
//     are left out, because a small difference is more the terms' doing than the web's.
//   · QUIET — of the decided choices where exactly one of the two stands on the briefing's "urgent but
//     quiet" list, how many went to that one.
//
// Ties ("equally urgent") and "can't say" count in neither.
import type { Matter } from './round'
import type { VoteTuple } from './reading'

export interface Tally {
  /** choices that could go either way on this question */
  of: number
  /** choices that went the way named */
  went: number
}

/** One count is clearly above another: at least twice it, and at least one more. */
export const clearlyLouder = (x: number, y: number): boolean => x >= 2 * y + 1

export function louderTally(votes: readonly VoteTuple[], signals: Record<string, number>): Tally {
  const t: Tally = { of: 0, went: 0 }
  for (const [a, b, pick] of votes) {
    if (pick === null || pick === 2) continue
    const sa = signals[a] ?? 0
    const sb = signals[b] ?? 0
    if (!clearlyLouder(sa, sb) && !clearlyLouder(sb, sa)) continue
    t.of++
    const chosen = pick === 0 ? a : b
    if ((chosen === a ? sa : sb) > (chosen === a ? sb : sa)) t.went++
  }
  return t
}

export function quietTally(votes: readonly VoteTuple[], round: { matters: readonly Pick<Matter, 'id' | 'quiet_rank'>[] }): Tally {
  const quiet = new Set(round.matters.filter((m) => m.quiet_rank !== null).map((m) => m.id))
  const t: Tally = { of: 0, went: 0 }
  for (const [a, b, pick] of votes) {
    if (pick === null || pick === 2 || quiet.has(a) === quiet.has(b)) continue
    t.of++
    if (quiet.has(pick === 0 ? a : b)) t.went++
  }
  return t
}

export const addTally = (x: Tally, y: Tally): Tally => ({ of: x.of + y.of, went: x.went + y.went })

/** A reader's own order of the matters: how often each was chosen when it appeared, a tie as half. */
export function ownOrder(votes: readonly VoteTuple[]): { id: string; chosen: number; shown: number }[] {
  const m = new Map<string, { chosen: number; shown: number }>()
  const at = (id: string) => m.get(id) ?? (m.set(id, { chosen: 0, shown: 0 }), m.get(id)!)
  for (const [a, b, pick] of votes) {
    at(a).shown++
    at(b).shown++
    if (pick === 0) at(a).chosen++
    else if (pick === 1) at(b).chosen++
    else if (pick === 2) {
      at(a).chosen += 0.5
      at(b).chosen += 0.5
    }
  }
  return [...m.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((x, y) => y.chosen / y.shown - x.chosen / x.shown || y.shown - x.shown || x.id.localeCompare(y.id))
}

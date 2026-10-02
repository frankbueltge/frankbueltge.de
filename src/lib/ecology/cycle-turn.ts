// src/lib/ecology/cycle-turn.ts — the cycle clock: turns cycle.json by a fixed rule, never by taste.
//
// Until 2026-10-03 the cycle was turned by hand only, on purpose: which question the next cycle
// carries was a judgement (cycle-watch.ts says why). Cycle 003 showed the cost. It opened on
// 2026-09-07, all three practices had presented within days, and then they worked on for some
// twenty sessions each, writing "between cycles" while the record waited for a hand that did not
// come. The sentinel reported it every morning for weeks.
//
// On 2026-10-03 the architect made the judgement once, in advance (wording private; decision
// record docs/design/2026-10-03-the-continuing-question.md): the ecology stays on ONE standing
// question, and only a new seed from outside moves it off. With that rule the next question is
// no longer a choice, so a script may apply it:
//
//   · a continuing round whose three presentations stand → the next round, same continuing question
//   · a seed released to all three while the continuing question runs → the next cycle opens on
//     the seed at once, mid-round if need be (the interruption the architect asked for)
//   · a seed's cycle whose three presentations stand → back to the continuing question, or on to
//     the next waiting seed if one came in meanwhile
//
// What stays a hand step: anything without a continuing question (the defaults regime turns by
// hand, as before), a seed's cycle is never cut short by another seed, and the architect may
// edit cycle.json at any time — the clock only ever reads the state it finds.
//
// Pure: no file system, no clock. scripts/ecology/cycle-turn.ts is the mouth that reads the
// files, writes the result and validates it through loadCycle before anything is committed.

/** A seed as the public register keeps it (src/data/saat/register.json). Only approved seeds are
 *  ever in the register — rejected ones never touch Git — so "in the register" means "released". */
export interface RegisterSeed {
  id: string
  text: string
  addressed_to: string
  ts: string
  status: string
}

export type TurnKind = 'round' | 'interrupt' | 'return' | 'next-seed'

export interface Turn {
  kind: TurnKind
  /** the complete cycle.json to write */
  next: Record<string, unknown>
  /** one line for the log and the job summary */
  line: string
}

const RULE = 'Turned by the cycle clock under the rule of 2026-10-03.'
const pad = (n: number) => String(n).padStart(3, '0')

/** Seeds that may still open a cycle: released to all three, still on offer, never taken.
 *  Oldest first — a queue, not a vote. */
export function waitingSeeds(seeds: readonly RegisterSeed[], taken: readonly string[]): RegisterSeed[] {
  return seeds
    .filter((s) => s.addressed_to === 'open' && s.status === 'offered' && !taken.includes(s.id))
    .filter((s) => typeof s.text === 'string' && s.text.trim().length > 0)
    .sort((a, b) => a.ts.localeCompare(b.ts))
}

/**
 * The turn due now, or null. `raw` is cycle.json as parsed; `allPresented` is the sentinel's
 * verdict for the running cycle; `today` is the date the new cycle opens (YYYY-MM-DD).
 */
export function planTurn(
  raw: Record<string, unknown>,
  allPresented: boolean,
  seeds: readonly RegisterSeed[],
  today: string,
): Turn | null {
  const continuing = raw.continuing as { question: string; since: string } | null | undefined
  if (!continuing) return null // no continuing question: the cycle stays a hand step

  const cycle = raw.cycle as number
  const opened = raw.opened as string
  const inSeedCycle = raw.source === 'seed'
  const taken = Array.isArray(raw.taken_seeds) ? (raw.taken_seeds as string[]) : []
  const waiting = waitingSeeds(seeds, taken)
  const seed = waiting[0]

  // A seed's cycle is not cut short by the next seed; it runs to its presentations.
  if (inSeedCycle && !allPresented) return null
  // A continuing round runs on until it is presented — unless a seed interrupts it.
  if (!inSeedCycle && !allPresented && !seed) return null

  const n = cycle + 1
  let kind: TurnKind
  let line: string
  if (seed) {
    kind = inSeedCycle ? 'next-seed' : 'interrupt'
    line = inSeedCycle
      ? `Cycle ${pad(cycle)} (a seed's cycle, opened ${opened}) closed on ${today}: all three practices presented. ` +
        `Another seed released to all three was waiting (${seed.id}); cycle ${pad(n)} opens on it.`
      : `Cycle ${pad(cycle)} (opened ${opened}) was interrupted on ${today} by a seed released to all three through ` +
        `the public channel (${seed.id}). Cycle ${pad(n)} opens on it.`
    line += ` When its three presentations stand, the ecology returns to the continuing question, ${continuing.question}. ${RULE}`
  } else {
    kind = inSeedCycle ? 'return' : 'round'
    line =
      `Cycle ${pad(cycle)} (${inSeedCycle ? "a seed's cycle, " : ''}opened ${opened}) closed on ${today}: all three ` +
      `practices presented. Cycle ${pad(n)} ${inSeedCycle ? 'returns to' : 'opens as the next round of'} the continuing ` +
      `question, ${continuing.question}, and builds on what the presentations left open. ${RULE}`
  }

  const {
    _note,
    cycle: _c,
    phase: _p,
    question: _q,
    source: _s,
    seed_id: _id,
    opened: _o,
    sessions_per_practice,
    continuing: _st,
    taken_seeds: _t,
    defaults,
    transition: _tr,
    ...rest
  } = raw
  const next: Record<string, unknown> = {
    _note,
    cycle: n,
    phase: 'working',
    question: seed ? seed.text.trim() : continuing.question,
    source: seed ? 'seed' : 'continuing',
    seed_id: seed ? seed.id : null,
    opened: today,
    sessions_per_practice,
    continuing,
    taken_seeds: seed ? [...taken, seed.id] : taken,
    defaults,
    ...rest,
    transition: line,
  }
  return { kind, next, line }
}

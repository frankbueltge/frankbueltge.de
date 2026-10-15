// src/lib/ecology/cycle-turn.ts — the cycle clock: turns cycle.json by a fixed rule, never by taste.
//
// Until 2026-10-03 the cycle was turned by hand only, on purpose: which question the next cycle
// carries was a judgement (cycle-watch.ts says why). Cycle 003 showed the cost. It opened on
// 2026-09-07, all three practices had presented within days, and then they worked on for some
// twenty sessions each, writing "between cycles" while the record waited for a hand that did not
// come. The sentinel reported it every morning for weeks.
//
// On 2026-10-03 the architect made the judgement once, in advance (wording private; decision
// record docs/design/2026-10-03-the-continuing-question.md): the ecology stays on ONE continuing
// question, and only a new seed from outside moves it off. On 2026-10-07 he changed who answers
// "what next" (wording private; docs/design/2026-10-07-the-convening.md): not the clock, but the
// three practices, in a CONVENING between cycles. The clock still decides nothing — it applies
// what the convening's tally and the calendar say:
//
//   · a working cycle whose three presentations stand, with no seed waiting → the convening opens
//     (the phase becomes "convening"; cycle and question stay those of the presented cycle)
//   · a convening whose result the relay carries → the next cycle opens on that question a day
//     after the tally, unless the architect objected (his silence is consent)
//   · a convening with no result seven days after it opened → the next cycle opens on the
//     continuing question, which stays the programme's origin and its fallback
//   · a seed released to all three → the next cycle opens on the seed at once, from a working
//     cycle or from a convening; only a seed's own cycle is never cut short, and a seed's cycle
//     whose presentations stand goes on to the next waiting seed before anything convenes
//
// What stays a hand step: anything without a continuing question (the defaults regime turns by
// hand, as before), and the architect may edit cycle.json at any time — the clock only ever reads
// the state it finds.
//
// Pure: no file system, no clock. scripts/ecology/cycle-turn.ts is the mouth that reads the
// files, writes the result and validates it through loadCycle before anything is committed.
import {
  CONVENING_DAYS,
  fallbackOn,
  opensOn,
  rankedScores,
  standingResult,
  type ConveningResult,
  type RelayConvening,
} from './convening'

/** A seed as the public register keeps it (src/data/saat/register.json). Only approved seeds are
 *  ever in the register — rejected ones never touch Git — so "in the register" means "released". */
export interface RegisterSeed {
  id: string
  text: string
  addressed_to: string
  ts: string
  status: string
}

/** convene: a presented cycle opens its convening · convened: the convening's result opens the
 *  next cycle · fallback: a convening without a result opens it on the continuing question ·
 *  interrupt: a released seed opens it at once · next-seed: a presented seed's cycle hands on to
 *  the next waiting seed. */
export type TurnKind = 'convene' | 'convened' | 'fallback' | 'interrupt' | 'next-seed'

export interface Turn {
  kind: TurnKind
  /** the complete cycle.json to write */
  next: Record<string, unknown>
  /** one line for the log and the job summary */
  line: string
}

const RULE = 'Turned by the cycle clock under the rules of 2026-10-03 and 2026-10-07.'
const pad = (n: number) => String(n).padStart(3, '0')
const NAME: Record<string, string> = { field: 'the Field', atelier: 'the Atelier', studio: 'the Studio' }

/** Seeds that may still open a cycle: released to all three, still on offer, never taken.
 *  Oldest first — a queue, not a vote. */
export function waitingSeeds(seeds: readonly RegisterSeed[], taken: readonly string[]): RegisterSeed[] {
  return seeds
    .filter((s) => s.addressed_to === 'open' && s.status === 'offered' && !taken.includes(s.id))
    .filter((s) => typeof s.text === 'string' && s.text.trim().length > 0)
    .sort((a, b) => a.ts.localeCompare(b.ts))
}

interface RawConvening {
  after_cycle: number
  opened: string
  objected?: string | null
}

/** The tally in words: "the Studio 5 · the Field 3 · the Atelier 1 (borda)". */
function tally(result: ConveningResult): string {
  const scores = rankedScores(result)
    .map((s) => `${NAME[s.practice]} ${s.score}`)
    .join(' · ')
  return scores ? ` (${scores}${result.rule ? `, ${result.rule}` : ''})` : ''
}

/**
 * The turn due now, or null. `raw` is cycle.json as parsed; `allPresented` is the sentinel's
 * verdict for the running cycle; `today` is the date the turn happens on (YYYY-MM-DD); `relay` is
 * the convening the Middle's relay carries, if any (src/lib/ecology/convening.ts reads it).
 */
export function planTurn(
  raw: Record<string, unknown>,
  allPresented: boolean,
  seeds: readonly RegisterSeed[],
  today: string,
  relay: RelayConvening | null = null,
): Turn | null {
  const continuing = raw.continuing as { question: string; since: string } | null | undefined
  if (!continuing) return null // no continuing question: the cycle stays a hand step

  const cycle = raw.cycle as number
  const opened = raw.opened as string
  const phase = raw.phase as string
  const taken = Array.isArray(raw.taken_seeds) ? (raw.taken_seeds as string[]) : []
  const seed = waitingSeeds(seeds, taken)[0]
  const n = cycle + 1

  // ——— in the convening ———————————————————————————————————————————————————————————
  if (phase === 'convening') {
    const conv = raw.convening as RawConvening
    const where = `The convening after cycle ${pad(cycle)} (opened ${conv.opened})`
    if (seed) {
      const line =
        `${where} was interrupted on ${today} by a seed released to all three through the public channel ` +
        `(${seed.id}). Cycle ${pad(n)} opens on it; when its three presentations stand, the practices convene ` +
        `again. ${RULE}`
      return { kind: 'interrupt', next: opening(raw, n, today, { question: seed.text.trim(), source: 'seed', seedId: seed.id, taken: [...taken, seed.id] }, line), line }
    }
    const result = standingResult(cycle, conv.objected ?? null, relay)
    if (result) {
      const day = opensOn(result)
      if (today < day) return null // the architect's veto window runs
      const by = result.proposedBy ? `${NAME[result.proposedBy]}'s proposal` : 'the proposal'
      const line =
        `${where} closed on ${today}: the three practices proposed and ranked, and ${by} won the tally of ` +
        `${result.talliedOn}${tally(result)}. No objection came within a day. Cycle ${pad(n)} opens on it. ${RULE}`
      return { kind: 'convened', next: opening(raw, n, today, { question: result.question, source: 'convening', seedId: null, taken }, line), line }
    }
    if (today < fallbackOn(conv.opened)) return null // the practices still have days to agree
    const line =
      `${where} reached no result within ${CONVENING_DAYS} days. Cycle ${pad(n)} opens on ${today} on the ` +
      `continuing question, ${continuing.question}, as the fallback. ${RULE}`
    return { kind: 'fallback', next: opening(raw, n, today, { question: continuing.question, source: 'continuing', seedId: null, taken }, line), line }
  }

  // ——— in a working cycle ——————————————————————————————————————————————————————————
  // 'closing' was the one-time transition of 2026-08-30 and stays a hand step; 'presenting' is
  // read like 'working' — a cycle that runs until its presentations stand.
  if (phase !== 'working' && phase !== 'presenting') return null
  const inSeedCycle = raw.source === 'seed'
  // A seed's cycle is not cut short by the next seed; it runs to its presentations.
  if (inSeedCycle && !allPresented) return null
  // Any other cycle runs until it is presented — unless a seed interrupts it.
  if (!inSeedCycle && !allPresented && !seed) return null

  if (seed) {
    const line = inSeedCycle
      ? `Cycle ${pad(cycle)} (a seed's cycle, opened ${opened}) closed on ${today}: all three practices presented. ` +
        `Another seed released to all three was waiting (${seed.id}); cycle ${pad(n)} opens on it.`
      : `Cycle ${pad(cycle)} (opened ${opened}) was interrupted on ${today} by a seed released to all three through ` +
        `the public channel (${seed.id}). Cycle ${pad(n)} opens on it.`
    const full = `${line} When its three presentations stand, the practices convene on the next question. ${RULE}`
    return {
      kind: inSeedCycle ? 'next-seed' : 'interrupt',
      next: opening(raw, n, today, { question: seed.text.trim(), source: 'seed', seedId: seed.id, taken: [...taken, seed.id] }, full),
      line: full,
    }
  }

  // All three have presented and no seed waits: the practices convene on what comes next.
  const line =
    `Cycle ${pad(cycle)} (${inSeedCycle ? "a seed's cycle, " : ''}opened ${opened}) closed on ${today}: all three ` +
    `practices presented. The convening opens: each practice proposes the next question and ranks the three ` +
    `proposals, and the tally opens cycle ${pad(n)} a day later unless the architect objects. Without a result by ` +
    `${fallbackOn(today)}, cycle ${pad(n)} opens on the continuing question, ${continuing.question}. ${RULE}`
  return { kind: 'convene', next: convening(raw, today, line), line }
}

/** cycle.json's own keys, in the order the file has always carried them. Everything else the file
 *  holds is kept as it stands, after them. */
function split(raw: Record<string, unknown>) {
  const {
    _note,
    cycle: _c,
    phase: _p,
    question,
    source,
    seed_id,
    opened,
    convening: _cv,
    sessions_per_practice,
    continuing,
    taken_seeds,
    defaults,
    transition: _tr,
    ...rest
  } = raw
  return { _note, question, source, seed_id, opened, sessions_per_practice, continuing, taken_seeds, defaults, rest }
}

/** The presented cycle stays the cycle; its question, source and opening stay its own. */
function convening(raw: Record<string, unknown>, today: string, line: string): Record<string, unknown> {
  const k = split(raw)
  return {
    _note: k._note,
    cycle: raw.cycle,
    phase: 'convening',
    question: k.question,
    source: k.source,
    seed_id: k.seed_id,
    opened: k.opened,
    convening: { after_cycle: raw.cycle, opened: today },
    sessions_per_practice: k.sessions_per_practice,
    continuing: k.continuing,
    taken_seeds: k.taken_seeds,
    defaults: k.defaults,
    ...k.rest,
    transition: line,
  }
}

/** A new cycle, working, on the question the rule named. The convening block goes with the phase. */
function opening(
  raw: Record<string, unknown>,
  n: number,
  today: string,
  q: { question: string; source: string; seedId: string | null; taken: string[] },
  line: string,
): Record<string, unknown> {
  const k = split(raw)
  return {
    _note: k._note,
    cycle: n,
    phase: 'working',
    question: q.question,
    source: q.source,
    seed_id: q.seedId,
    opened: today,
    sessions_per_practice: k.sessions_per_practice,
    continuing: k.continuing,
    taken_seeds: q.taken,
    defaults: k.defaults,
    ...k.rest,
    transition: line,
  }
}

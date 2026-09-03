// src/lib/ecology/cycle-watch.ts — is the running cycle finished, and does anyone know?
//
// Found on 2026-09-03 (Frank asked why the practices were not moving on): cycle 001 opened
// 2026-08-30 with a budget of three to five sessions per practice. By 2026-09-03 all three had
// presented and published their closing reports, and the counts stood at ten, eight and eleven.
// The Atelier had spent three consecutive nights writing "empty tick: cycle presented, nothing
// owed" — a practice correctly idling in a cycle nobody had closed. The Field and the Studio
// simply kept going, filing artifacts into a cycle that had already been shown.
//
// Nothing was broken. The cycle is advanced by hand — `cycle.json` says so, and the v3 decision
// says why: "advanced by the architect or a site session, never by a practice". What was missing
// is that no part of this house NOTICED. The Ecology sentinel watches branches, the morning
// digest counts sessions; neither reads the cycle clock.
//
// So this module reads it, and only reads it. It computes a verdict from committed state and
// hands it to a workflow that opens one standing issue and writes one digest line. It does not
// advance the cycle, and the workflow that calls it has no write access to cycle.json — the
// hand-turned step stays hand-turned, because WHICH question the next cycle carries is a
// judgement no script can make. (Cycle 002's question was changed, not repeated: the answer to
// noticing is not automating the decision.)

import { loadCycle, loadPresentations, loadSessionNotes, PRACTICES, type CycleState, type PracticeId } from './v3'

/** The house's own budget line, parsed from the string cycle.json carries ("3-5"). */
export function parseBudget(spec: string): { min: number; max: number } | null {
  const m = /^(\d+)\s*[-–]\s*(\d+)$/.exec(spec.trim())
  if (m) return { min: Number(m[1]), max: Number(m[2]) }
  const one = /^(\d+)$/.exec(spec.trim())
  return one ? { min: Number(one[1]), max: Number(one[1]) } : null
}

export interface PracticeStanding {
  practice: PracticeId
  sessions: number
  presented: boolean
  /** sessions beyond the budget's upper bound; 0 while inside it */
  over: number
}

export interface CycleVerdict {
  cycle: number
  phase: CycleState['phase']
  opened: string
  budget: { min: number; max: number } | null
  standings: PracticeStanding[]
  /** every practice has presented — the cycle has done what it was opened to do */
  allPresented: boolean
  /** at least one practice is past the budget's upper bound */
  anyOverBudget: boolean
  /** the cycle is finished in substance and still open in the record */
  needsTurning: boolean
  /** one line per finding, in the order a reader should meet them; empty when nothing is due */
  lines: string[]
}

/**
 * The verdict, from committed state alone. Sources are injectable so the derivation can be
 * tested against fixtures rather than against whatever the practices shipped last night.
 *
 * `needsTurning` is deliberately narrow: a cycle is due to be turned when ALL THREE have
 * presented. Over-budget alone is reported but does not demand the turn — a practice may
 * legitimately need a sixth session, and a watcher that cried "finished" at session six would
 * be turned off within a week. Everything past the budget is said, and only the presentations
 * make it a decision.
 */
export function cycleVerdict(
  cycle: CycleState = loadCycle(),
  presented: ReadonlySet<PracticeId> = new Set(
    loadPresentations().filter((p) => p.cycle === cycle.cycle).map((p) => p.practice),
  ),
  sessionCount: (p: PracticeId) => number = (p) => loadSessionNotes(p, cycle.opened).length,
): CycleVerdict {
  const budget = parseBudget(cycle.sessionsPerPractice)
  const standings: PracticeStanding[] = PRACTICES.map((practice) => {
    const sessions = sessionCount(practice)
    return {
      practice,
      sessions,
      presented: presented.has(practice),
      over: budget ? Math.max(0, sessions - budget.max) : 0,
    }
  })

  const allPresented = standings.every((s) => s.presented)
  const anyOverBudget = standings.some((s) => s.over > 0)
  const needsTurning = allPresented

  const lines: string[] = []
  if (allPresented) {
    lines.push(
      `Cycle ${String(cycle.cycle).padStart(3, '0')} is finished in substance: all three practices have presented. ` +
        `The record still says phase "${cycle.phase}". Only the architect or a site session may turn it.`,
    )
  }
  if (anyOverBudget && budget) {
    const over = standings
      .filter((s) => s.over > 0)
      .map((s) => `${s.practice} ${s.sessions}`)
      .join(' · ')
    lines.push(`Past the ${budget.min}–${budget.max} session budget: ${over}.`)
  }
  // Said only when there is already something to say — a practice that has not presented is the
  // normal state of a running cycle, not a finding.
  if (lines.length > 0) {
    const waiting = standings.filter((s) => !s.presented).map((s) => s.practice)
    if (waiting.length > 0) lines.push(`Still to present: ${waiting.join(' · ')}.`)
  }

  return { cycle: cycle.cycle, phase: cycle.phase, opened: cycle.opened, budget, standings, allPresented, anyOverBudget, needsTurning, lines }
}

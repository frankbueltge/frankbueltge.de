import { describe, expect, it } from 'vitest'
import { cycleVerdict, parseBudget } from './cycle-watch'
import { loadCycle, type CycleState, type PracticeId } from './v3'

const CYCLE: CycleState = {
  cycle: 1,
  phase: 'working',
  question: null,
  source: 'defaults',
  opened: '2026-08-30',
  sessionsPerPractice: '3-5',
  defaults: { field: 'f', atelier: 'a', studio: 's' },
}

const verdict = (presented: PracticeId[], counts: Partial<Record<PracticeId, number>>) =>
  cycleVerdict(CYCLE, new Set(presented), (p) => counts[p] ?? 0)

describe('the budget line, as the house writes it', () => {
  it('reads a range, a single number, and refuses a shape it does not know', () => {
    expect(parseBudget('3-5')).toEqual({ min: 3, max: 5 })
    expect(parseBudget(' 3 – 5 ')).toEqual({ min: 3, max: 5 })
    expect(parseBudget('4')).toEqual({ min: 4, max: 4 })
    expect(parseBudget('a few')).toBeNull()
  })
})

describe('a cycle that is still running says nothing', () => {
  it('is silent while the practices are inside their budget and have not presented', () => {
    const v = verdict([], { field: 3, atelier: 2, studio: 4 })
    expect(v.needsTurning).toBe(false)
    expect(v.lines).toEqual([])
  })

  it('does not call a cycle finished because one practice presented early', () => {
    const v = verdict(['studio'], { field: 3, atelier: 2, studio: 5 })
    expect(v.allPresented).toBe(false)
    expect(v.needsTurning).toBe(false)
    expect(v.lines).toEqual([])
  })
})

describe('a cycle that is finished asks for a hand', () => {
  it('names the turn once all three have presented, and says who may make it', () => {
    const v = verdict(['field', 'atelier', 'studio'], { field: 4, atelier: 4, studio: 4 })
    expect(v.needsTurning).toBe(true)
    expect(v.lines[0]).toMatch(/Cycle 001 is finished in substance/)
    expect(v.lines[0]).toMatch(/architect or a site session/)
  })

  it('reports over-budget without calling it a decision — a sixth session may be legitimate', () => {
    const v = verdict([], { field: 10, atelier: 8, studio: 11 })
    expect(v.anyOverBudget).toBe(true)
    expect(v.needsTurning).toBe(false)
    expect(v.lines.join(' ')).toMatch(/Past the 3–5 session budget: field 10 · atelier 8 · studio 11/)
    expect(v.lines.join(' ')).not.toMatch(/finished in substance/)
  })

  it('names who is still owed, but only once there is already something to report', () => {
    const running = verdict([], { field: 3, atelier: 1, studio: 2 })
    expect(running.lines).toEqual([])
    const late = verdict(['studio'], { field: 9, atelier: 2, studio: 6 })
    expect(late.lines.at(-1)).toBe('Still to present: field · atelier.')
  })
})

describe('what it must never do', () => {
  it('reports state and nothing else — no field on the verdict proposes a next question', () => {
    const v = verdict(['field', 'atelier', 'studio'], { field: 4, atelier: 4, studio: 4 })
    // The turn is a judgement about WHICH question comes next; a watcher that carried a
    // proposal would be the automation the v3 decision deliberately withheld.
    expect(Object.keys(v).sort()).toEqual(
      ['allPresented', 'anyOverBudget', 'budget', 'cycle', 'lines', 'needsTurning', 'opened', 'phase', 'standings'].sort(),
    )
  })
})

describe('against this repository’s own cycle', () => {
  it('reads the committed state without throwing, and agrees with cycle.json', () => {
    const c = loadCycle()
    const v = cycleVerdict()
    expect(v.cycle).toBe(c.cycle)
    expect(v.phase).toBe(c.phase)
    expect(v.standings).toHaveLength(3)
    for (const s of v.standings) expect(s.sessions).toBeGreaterThanOrEqual(0)
  })
})

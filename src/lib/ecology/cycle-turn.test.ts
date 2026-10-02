// The cycle clock (2026-10-03): the continuing question runs in rounds, only a seed released to all
// three interrupts it, and nothing turns where the rule does not say so.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { planTurn, waitingSeeds, type RegisterSeed } from './cycle-turn'
import { loadCycle } from './v3'

const CONTINUING = { question: 'Missing Data Art', since: '2026-10-03' }

function state(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    _note: 'the note stays',
    cycle: 4,
    phase: 'working',
    question: 'Missing Data Art, read through human extinction',
    source: 'continuing',
    seed_id: 'seed-20260919-225045-3080',
    opened: '2026-10-03',
    sessions_per_practice: '3-5',
    continuing: CONTINUING,
    taken_seeds: ['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080'],
    defaults: { field: 'f', atelier: 'a', studio: 's' },
    transition: 'the previous turn',
    ...overrides,
  }
}

const seed = (id: string, overrides: Partial<RegisterSeed> = {}): RegisterSeed => ({
  id,
  text: `question of ${id}`,
  addressed_to: 'open',
  ts: `2026-10-1${id.slice(-1)}T12:00:00.000Z`,
  status: 'offered',
  ...overrides,
})

const TODAY = '2026-10-20'

describe('which seeds may open a cycle', () => {
  it('takes only seeds released to all three, still on offer, never taken — oldest first', () => {
    const seeds = [
      seed('s2'),
      seed('s1'),
      seed('s3', { addressed_to: 'studio' }),
      seed('s4', { status: 'declined' }),
      seed('s5', { status: 'taken' }),
      seed('s6', { text: '   ' }),
      seed('seed-20260919-225045-3080'),
    ]
    expect(waitingSeeds(seeds, ['seed-20260919-225045-3080']).map((s) => s.id)).toEqual(['s1', 's2'])
  })
})

describe('the clock stays still where the rule does not speak', () => {
  it('never turns a cycle that has no continuing question — that regime is turned by hand', () => {
    expect(planTurn(state({ continuing: null, source: 'defaults', question: null }), true, [seed('s1')], TODAY)).toBeNull()
  })

  it('lets a continuing round run until its three presentations stand', () => {
    expect(planTurn(state(), false, [], TODAY)).toBeNull()
  })

  it('never cuts a seed\'s cycle short, not even for the next seed', () => {
    const s = state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    expect(planTurn(s, false, [seed('s2')], TODAY)).toBeNull()
  })

  it('does not reopen a seed it has already taken', () => {
    expect(planTurn(state(), false, [seed('seed-20260919-225045-3080')], TODAY)).toBeNull()
  })
})

describe('the continuing question runs in rounds', () => {
  it('opens the next round on the plain continuing question once all three have presented', () => {
    const t = planTurn(state(), true, [], TODAY)!
    expect(t.kind).toBe('round')
    expect(t.next).toMatchObject({
      cycle: 5,
      phase: 'working',
      question: 'Missing Data Art',
      source: 'continuing',
      seed_id: null,
      opened: TODAY,
      taken_seeds: ['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080'],
    })
    expect(t.line).toMatch(/^Cycle 004 \(opened 2026-10-03\) closed on 2026-10-20/)
    expect(t.line).toContain('Cycle 005 opens as the next round of the continuing question, Missing Data Art')
  })
})

describe('only a seed interrupts', () => {
  it('opens the next cycle on a waiting seed at once, mid-round', () => {
    const t = planTurn(state(), false, [seed('s2'), seed('s1')], TODAY)!
    expect(t.kind).toBe('interrupt')
    expect(t.next).toMatchObject({ cycle: 5, question: 'question of s1', source: 'seed', seed_id: 's1' })
    expect(t.next.taken_seeds).toEqual(['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080', 's1'])
    expect(t.line).toContain('was interrupted on 2026-10-20')
    expect(t.line).toContain('returns to the continuing question, Missing Data Art')
  })

  it('returns to the continuing question when the seed\'s cycle has been presented', () => {
    const s = state({ cycle: 5, source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    const t = planTurn(s, true, [], TODAY)!
    expect(t.kind).toBe('return')
    expect(t.next).toMatchObject({ cycle: 6, question: 'Missing Data Art', source: 'continuing', seed_id: null })
    expect(t.line).toContain('Cycle 006 returns to the continuing question')
  })

  it('goes on to a second waiting seed before returning', () => {
    const s = state({ cycle: 5, source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    const t = planTurn(s, true, [seed('s1'), seed('s2')], TODAY)!
    expect(t.kind).toBe('next-seed')
    expect(t.next).toMatchObject({ cycle: 6, question: 'question of s2', source: 'seed', seed_id: 's2' })
  })
})

describe('what the clock writes', () => {
  it('keeps the note, the defaults, the budget and any key it does not know', () => {
    const t = planTurn(state({ extra: { kept: true } }), true, [], TODAY)!
    expect(t.next._note).toBe('the note stays')
    expect(t.next.defaults).toEqual({ field: 'f', atelier: 'a', studio: 's' })
    expect(t.next.sessions_per_practice).toBe('3-5')
    expect(t.next.continuing).toEqual(CONTINUING)
    expect(t.next.extra).toEqual({ kept: true })
    expect(t.next.transition).toBe(t.line)
  })

  it('writes a state the site\'s own loader accepts, for every kind of turn', () => {
    const turns = [
      planTurn(state(), true, [], TODAY)!,
      planTurn(state(), false, [seed('s1')], TODAY)!,
      planTurn(state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] }), true, [], TODAY)!,
    ]
    for (const t of turns) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cycle-turn-'))
      fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
      fs.writeFileSync(path.join(root, 'src/data/ecology/cycle.json'), JSON.stringify(t.next, null, 2))
      const c = loadCycle(root)
      expect(c.cycle).toBe(t.next.cycle)
      expect(c.continuing).toEqual(CONTINUING)
    }
  })
})

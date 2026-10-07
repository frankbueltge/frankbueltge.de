// The cycle clock (rules of 2026-10-03 and 2026-10-07): a presented cycle opens a convening, the
// convening's tally opens the next cycle a day later unless the architect objected, seven days
// without a result fall back to the continuing question, a released seed interrupts in either
// phase, and nothing turns where the rules do not say so.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { RelayConvening } from './convening'
import { planTurn, waitingSeeds, type RegisterSeed } from './cycle-turn'
import { loadCycle } from './v3'

const CONTINUING = { question: 'Missing Data Art', since: '2026-10-03' }

function state(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    _note: 'the note stays',
    cycle: 6,
    phase: 'working',
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    seed_id: 'seed-20260919-225045-3080',
    opened: '2026-10-07',
    sessions_per_practice: '3-5',
    continuing: CONTINUING,
    taken_seeds: ['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080'],
    defaults: { field: 'f', atelier: 'a', studio: 's' },
    transition: 'the previous turn',
    ...overrides,
  }
}

/** cycle.json in the convening after cycle 6, opened on `opened`. */
const convening = (opened = '2026-10-10', extra: Record<string, unknown> = {}) =>
  state({ phase: 'convening', convening: { after_cycle: 6, opened, ...extra } })

/** The convening the relay carries, with a result tallied on `talliedOn` (null: no result yet). */
const relay = (talliedOn: string | null, afterCycle = 6): RelayConvening => ({
  afterCycle,
  opened: '2026-10-10',
  proposals: [
    { practice: 'field', question: 'q-field', docksOnto: null, date: '2026-10-10', ref: null },
    { practice: 'atelier', question: 'q-atelier', docksOnto: null, date: '2026-10-10', ref: null },
    { practice: 'studio', question: 'What the archive refuses to count', docksOnto: null, date: '2026-10-11', ref: null },
  ],
  rankings: [],
  result: talliedOn
    ? {
        question: 'What the archive refuses to count',
        proposedBy: 'studio',
        scores: { field: 3, atelier: 1, studio: 5 },
        talliedOn,
        rule: 'borda',
      }
    : null,
  skipped: 0,
})

const seed = (id: string, overrides: Partial<RegisterSeed> = {}): RegisterSeed => ({
  id,
  text: `question of ${id}`,
  addressed_to: 'open',
  ts: `2026-10-1${id.slice(-1)}T12:00:00.000Z`,
  status: 'offered',
  ...overrides,
})

const TODAY = '2026-10-10'

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

describe('the clock stays still where the rules do not speak', () => {
  it('never turns a cycle that has no continuing question — that regime is turned by hand', () => {
    expect(planTurn(state({ continuing: null, source: 'defaults', question: null }), true, [seed('s1')], TODAY)).toBeNull()
    expect(planTurn(convening('2026-10-01', {}), true, [], TODAY, relay('2026-10-02'))).not.toBeNull()
    expect(planTurn({ ...convening('2026-10-01'), continuing: null }, true, [], TODAY, relay('2026-10-02'))).toBeNull()
  })

  it('lets a working cycle run until its three presentations stand', () => {
    expect(planTurn(state(), false, [], TODAY)).toBeNull()
  })

  it("never cuts a seed's cycle short, not even for the next seed", () => {
    const s = state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    expect(planTurn(s, false, [seed('s2')], TODAY)).toBeNull()
  })

  it('does not reopen a seed it has already taken', () => {
    expect(planTurn(state(), false, [seed('seed-20260919-225045-3080')], TODAY)).toBeNull()
  })

  it('leaves the one-time closing phase to a hand', () => {
    expect(planTurn(state({ phase: 'closing' }), true, [seed('s1')], TODAY)).toBeNull()
  })
})

describe('a presented cycle opens the convening', () => {
  it('moves to the convening once all three have presented — cycle, question and opening stay the presented cycle\'s', () => {
    const t = planTurn(state(), true, [], TODAY)!
    expect(t.kind).toBe('convene')
    expect(t.next).toMatchObject({
      cycle: 6,
      phase: 'convening',
      question: 'Missing Data Art, read through human extinction by AI',
      source: 'continuing',
      seed_id: 'seed-20260919-225045-3080',
      opened: '2026-10-07',
      convening: { after_cycle: 6, opened: TODAY },
    })
    expect(t.line).toMatch(/^Cycle 006 \(opened 2026-10-07\) closed on 2026-10-10: all three practices presented\./)
    expect(t.line).toContain('opens cycle 007 a day later unless the architect objects')
    expect(t.line).toContain('Without a result by 2026-10-17, cycle 007 opens on the continuing question, Missing Data Art')
  })

  it('no longer opens a next round on the continuing question by itself', () => {
    const t = planTurn(state(), true, [], TODAY)!
    expect(t.next.cycle).toBe(6)
    expect(t.next.phase).not.toBe('working')
  })

  it("convenes after a seed's cycle too, when no other seed waits", () => {
    const s = state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    const t = planTurn(s, true, [], TODAY)!
    expect(t.kind).toBe('convene')
    expect(t.next).toMatchObject({ cycle: 6, phase: 'convening', question: 'q1', source: 'seed' })
  })

  it("goes on to a second waiting seed before anything convenes", () => {
    const s = state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] })
    const t = planTurn(s, true, [seed('s1'), seed('s2')], TODAY)!
    expect(t.kind).toBe('next-seed')
    expect(t.next).toMatchObject({ cycle: 7, phase: 'working', question: 'question of s2', source: 'seed', seed_id: 's2' })
  })
})

describe('the convening opens the next cycle on its tally', () => {
  it('waits while no result stands and the seven days are not over', () => {
    expect(planTurn(convening(), true, [], '2026-10-12', relay(null))).toBeNull()
    expect(planTurn(convening(), true, [], '2026-10-16', null)).toBeNull()
  })

  it("holds the result through the architect's veto day, and opens on it the day after the tally", () => {
    expect(planTurn(convening(), true, [], '2026-10-12', relay('2026-10-12'))).toBeNull()
    const t = planTurn(convening(), true, [], '2026-10-13', relay('2026-10-12'))!
    expect(t.kind).toBe('convened')
    expect(t.next).toMatchObject({
      cycle: 7,
      phase: 'working',
      question: 'What the archive refuses to count',
      source: 'convening',
      seed_id: null,
      opened: '2026-10-13',
      taken_seeds: ['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080'],
    })
    expect(t.next).not.toHaveProperty('convening')
    expect(t.line).toContain("the Studio's proposal won the tally of 2026-10-12 (the Studio 5 · the Field 3 · the Atelier 1, borda)")
    expect(t.line).toContain('Cycle 007 opens on it')
  })

  it('reads only the convening after this very cycle', () => {
    expect(planTurn(convening(), true, [], '2026-10-13', relay('2026-10-05', 5))).toBeNull()
  })

  it('lets a result stand even past the seventh day while its veto day runs', () => {
    expect(planTurn(convening(), true, [], '2026-10-17', relay('2026-10-17'))).toBeNull()
    expect(planTurn(convening(), true, [], '2026-10-18', relay('2026-10-17'))!.kind).toBe('convened')
  })

  it('sets aside a result the architect objected to, and takes a later tally', () => {
    const objected = convening('2026-10-10', { objected: '2026-10-12' })
    expect(planTurn(objected, true, [], '2026-10-14', relay('2026-10-12'))).toBeNull()
    expect(planTurn(objected, true, [], '2026-10-14', relay('2026-10-13'))!.kind).toBe('convened')
  })
})

describe('the fallback', () => {
  it('opens the next cycle on the continuing question seven days after the convening opened', () => {
    const t = planTurn(convening(), true, [], '2026-10-17', relay(null))!
    expect(t.kind).toBe('fallback')
    expect(t.next).toMatchObject({ cycle: 7, phase: 'working', question: 'Missing Data Art', source: 'continuing', seed_id: null, opened: '2026-10-17' })
    expect(t.next).not.toHaveProperty('convening')
    expect(t.line).toContain('reached no result within 7 days')
  })

  it('falls back after an objection too, when no new tally comes', () => {
    const objected = convening('2026-10-10', { objected: '2026-10-12' })
    expect(planTurn(objected, true, [], '2026-10-17', relay('2026-10-12'))!.kind).toBe('fallback')
  })
})

describe('only a seed interrupts', () => {
  it('opens the next cycle on a waiting seed at once, mid-cycle', () => {
    const t = planTurn(state(), false, [seed('s2'), seed('s1')], TODAY)!
    expect(t.kind).toBe('interrupt')
    expect(t.next).toMatchObject({ cycle: 7, phase: 'working', question: 'question of s1', source: 'seed', seed_id: 's1' })
    expect(t.next.taken_seeds).toEqual(['seed-20260907-220129-aa5f', 'seed-20260919-225045-3080', 's1'])
    expect(t.line).toContain('was interrupted on 2026-10-10')
    expect(t.line).toContain('the practices convene on the next question')
  })

  it('interrupts a convening too, result or not', () => {
    const t = planTurn(convening(), true, [seed('s1')], '2026-10-13', relay('2026-10-12'))!
    expect(t.kind).toBe('interrupt')
    expect(t.next).toMatchObject({ cycle: 7, phase: 'working', question: 'question of s1', source: 'seed', seed_id: 's1' })
    expect(t.next).not.toHaveProperty('convening')
    expect(t.line).toContain('The convening after cycle 006 (opened 2026-10-10) was interrupted on 2026-10-13')
  })

  it('interrupts a cycle the convening chose', () => {
    const t = planTurn(state({ cycle: 7, source: 'convening', seed_id: null, question: 'chosen' }), false, [seed('s1')], TODAY)!
    expect(t.kind).toBe('interrupt')
  })
})

describe('what the clock writes', () => {
  it('keeps the note, the defaults, the budget and any key it does not know', () => {
    for (const t of [planTurn(state({ extra: { kept: true } }), true, [], TODAY)!, planTurn(convening('2026-10-01', { }), true, [], TODAY, relay(null))!]) {
      expect(t.next._note).toBe('the note stays')
      expect(t.next.defaults).toEqual({ field: 'f', atelier: 'a', studio: 's' })
      expect(t.next.sessions_per_practice).toBe('3-5')
      expect(t.next.continuing).toEqual(CONTINUING)
      expect(t.next.transition).toBe(t.line)
    }
    expect(planTurn(state({ extra: { kept: true } }), true, [], TODAY)!.next.extra).toEqual({ kept: true })
  })

  it("writes a state the site's own loader accepts, for every kind of turn", () => {
    const turns = [
      planTurn(state(), true, [], TODAY)!, // convene
      planTurn(convening(), true, [], '2026-10-13', relay('2026-10-12'))!, // convened
      planTurn(convening(), true, [], '2026-10-17', relay(null))!, // fallback
      planTurn(convening(), true, [seed('s1')], TODAY)!, // interrupt from the convening
      planTurn(state(), false, [seed('s1')], TODAY)!, // interrupt from a working cycle
      planTurn(state({ source: 'seed', seed_id: 's1', question: 'q1', taken_seeds: ['s1'] }), true, [seed('s2')], TODAY)!, // next-seed
    ]
    expect(turns.map((t) => t.kind)).toEqual(['convene', 'convened', 'fallback', 'interrupt', 'interrupt', 'next-seed'])
    for (const t of turns) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cycle-turn-'))
      fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
      fs.writeFileSync(path.join(root, 'src/data/ecology/cycle.json'), JSON.stringify(t.next, null, 2))
      const c = loadCycle(root)
      expect(c.cycle).toBe(t.next.cycle)
      expect(c.phase).toBe(t.next.phase)
      expect(c.continuing).toEqual(CONTINUING)
      expect(c.convening ?? null).toEqual(t.kind === 'convene' ? { afterCycle: 6, opened: TODAY, objected: null } : null)
    }
  })
})

describe('the clock is started where the relay lands, and deploys what it turns', () => {
  // A dispatch is the one start the built-in token may make, and a run it starts creates no
  // workflow_run for deploy-cf.yml — so both halves are bound here (the pattern of PR #1049).
  const read = (f: string) => fs.readFileSync(path.join(process.cwd(), '.github/workflows', f), 'utf8')
  const sentinel = read('cycle-sentinel.yml')
  const integrate = read('ecology-integrate.yml')

  it('the Ecology integrate starts the sentinel after a relay mirror and while a convening is open', () => {
    expect(integrate).toContain('gh workflow run cycle-sentinel.yml')
    expect(integrate).toMatch(/steps\.relay\.outputs\.changed/)
    expect(integrate).toMatch(/"\$PHASE" = "convening"/)
    expect(integrate).toMatch(/^\s*actions: write$/m)
  })

  it('the sentinel accepts the dispatch and deploys a turn it was started for', () => {
    expect(sentinel).toMatch(/^\s*workflow_dispatch:/m)
    expect(sentinel).toMatch(/^\s*actions: write$/m)
    expect(sentinel).toContain('gh workflow run deploy-cf.yml')
    expect(sentinel).toContain("steps.turn.outputs.turned == 'true' && github.triggering_actor == 'github-actions[bot]'")
  })
})

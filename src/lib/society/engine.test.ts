// src/lib/society/engine.test.ts — the piece's claims, as tests.
//
// The page says: this society builds although none of its agents can build; silencing one
// small agent changes what the whole can do; the same seed is the same morning. Those are
// checkable claims, so they are checked here — the same reason palette verdicts moved from
// CSS comments into palette.test.ts.

import { describe, expect, it, vi } from 'vitest'
import {
  bodySnapshot,
  makeSociety,
  NO_VISITOR,
  silence,
  snapshot,
  step,
  WORTH_FLOOR,
  type Society,
  type VisitorInput,
} from './engine'
import type { WorldEvent } from './world'
import { AGENTS, awakeChapters, CHAPTERS } from './agents'

// Several claims here need thousands of ticks before the society reaches the stage they are
// about — the transfer to the arch does not happen in five seconds of wall clock. Under the
// 5 s default these tests passed alone and failed at random inside the full suite, which is
// the worst state a guard can be in: it trains everyone to re-run until green. The cost is
// real, so it is declared rather than hidden by shortening the simulations (2026-08-15).
vi.setConfig({ testTimeout: 60_000 })

const SEED = 20260805

function run(s: Society, ticks: number, input: VisitorInput = NO_VISITOR): WorldEvent[] {
  const events: WorldEvent[] = []
  for (let i = 0; i < ticks; i++) events.push(...step(s, input).events)
  return events
}

describe('the same seed is the same morning', () => {
  it('two runs from one seed agree tick for tick', () => {
    const a = makeSociety(SEED)
    const b = makeSociety(SEED)
    run(a, 5000)
    run(b, 5000)
    expect(snapshot(a)).toBe(snapshot(b))
  })

  it('a different seed is a different morning', () => {
    const a = makeSociety(SEED)
    const b = makeSociety(SEED + 1)
    run(a, 2000)
    run(b, 2000)
    expect(snapshot(a)).not.toBe(snapshot(b))
  })
})

describe('competence without a competent part', () => {
  it('left alone, the society finishes a tower', () => {
    const s = makeSociety(SEED)
    const events = run(s, 8000)
    expect(events.some((e) => e.kind === 'towerComplete')).toBe(true)
  })

  it('a K-line forms when the tower stands, and is remembered', () => {
    const s = makeSociety(SEED)
    run(s, 8000)
    expect(s.kLines.length).toBeGreaterThan(0)
    expect(s.kLines[0].agents.length).toBeGreaterThan(0)
  })

  it('the censor holds: an intact society only wrecks finished work', () => {
    const s = makeSociety(SEED)
    const events = run(s, 12000)
    const wrecks = events.filter((e) => e.kind === 'wrecked')
    for (const wreckEvent of wrecks) {
      expect('complete' in wreckEvent && wreckEvent.complete).toBe(true)
    }
  })
})

describe('what silencing one small agent costs', () => {
  it('without GRASP, no block is ever placed — and the B-brain notices the circle', () => {
    const s = makeSociety(SEED)
    silence(s, 'grasp')
    const events = run(s, 8000)
    expect(events.some((e) => e.kind === 'placed')).toBe(false)
    expect(events.some((e) => e.kind === 'towerComplete')).toBe(false)
    // WATCH-CIRCLE sees the A-brain repeat itself even across naps — the stall counter
    // survives interruptions and only real progress clears it
    expect(s.lines.some((l) => l.text.includes('WATCH-CIRCLE'))).toBe(true)
  })

  it('without CENSOR-WRECK, the society smashes its own unfinished work', () => {
    const s = makeSociety(SEED)
    silence(s, 'censor-wreck')
    const events = run(s, 12000)
    const early = events.filter((e) => e.kind === 'wrecked' && !e.complete)
    expect(early.length).toBeGreaterThan(0)
  })

  it('without BALANCE, towers grow a lean and fall on their own', () => {
    const s = makeSociety(SEED)
    silence(s, 'balance')
    const events = run(s, 12000)
    expect(events.some((e) => e.kind === 'collapsed')).toBe(true)
  })

  it('an elegy arrives marked as one — the ticker must be able to give it its weight', () => {
    const s = makeSociety(SEED)
    run(s, 400)
    silence(s, 'balance')
    const elegies = s.lines.filter((l) => l.kind === 'elegy')
    expect(elegies).toHaveLength(1)
    expect(elegies[0].text).toContain('BALANCE is silent')
    // ordinary reporting is never dressed as mourning
    expect(s.lines.filter((l) => l.kind === 'note').length).toBeGreaterThan(0)
  })

  it('the scribe’s own elegy is the last thing it writes, and it is marked', () => {
    const s = makeSociety(SEED)
    run(s, 400)
    silence(s, 'scribe')
    const last = s.lines[s.lines.length - 1]
    expect(last.kind).toBe('elegy')
    expect(last.text).toContain('SCRIBE is silent')
  })

  it('without SCRIBE, things keep happening and no one says so', () => {
    const s = makeSociety(SEED)
    silence(s, 'scribe')
    const before = s.lines.length // the scribe's own elegy is its last line
    const events = run(s, 6000)
    expect(events.length).toBeGreaterThan(0)
    expect(s.lines.length).toBe(before)
  })
})

describe('the visitor is perceived, never understood', () => {
  it('a moving shadow hands the eye to CURIOSITY', () => {
    const s = makeSociety(SEED)
    let ruledByCuriosity = false
    for (let i = 0; i < 1200; i++) {
      // a restless cursor: speed oscillates, which is what NOVELTY feeds on
      const input: VisitorInput = { present: true, x: 30, y: 20, speed: i % 3 === 0 ? 5 : 2 }
      step(s, input)
      if (s.ruler === 'curiosity') ruledByCuriosity = true
    }
    expect(ruledByCuriosity).toBe(true)
  })

  it('a sudden leap startles the whole body — once; the suppressor holds the second fright', () => {
    const s = makeSociety(SEED)
    run(s, 300)
    step(s, { present: true, x: 30, y: 20, speed: 8 })
    expect(s.ruler).toBe('alarm')
    // let the fright fade, then leap again inside the suppressor's window
    run(s, 60)
    step(s, { present: true, x: 60, y: 10, speed: 9 })
    expect(s.ruler).not.toBe('alarm')
  })

  it('with SEE-MOTION silenced, the visitor becomes invisible', () => {
    const s = makeSociety(SEED)
    silence(s, 'see-motion')
    for (let i = 0; i < 1200; i++) {
      const input: VisitorInput = { present: true, x: 30, y: 20, speed: i % 3 === 0 ? 6 : 1 }
      step(s, input)
      expect(s.ruler).not.toBe('curiosity')
      expect(s.ruler).not.toBe('alarm')
    }
  })
})

describe('stage 2 — the transfer (§8.6)', () => {
  it('after two towers the society turns to the arch — and its first move goes to the old site', () => {
    const s = makeSociety(SEED)
    const events = run(s, 30000)
    const order = events.map((e) => e.kind)
    const misfireAt = order.indexOf('misfire')
    const archAt = order.indexOf('archComplete')
    // the arch gets built at all…
    expect(archAt).toBeGreaterThan(-1)
    // …the practiced society's first arch move follows the tower K-lines to the old site…
    expect(misfireAt).toBeGreaterThan(-1)
    expect(misfireAt).toBeLessThan(archAt)
    // …because two towers really did come first, and the arch is remembered afterwards
    expect(s.kLines.filter((k) => k.kind === 'tower').length).toBeGreaterThanOrEqual(2)
    expect(s.kLines.filter((k) => k.kind === 'arch').length).toBeGreaterThanOrEqual(1)
  })

  it('a society that never built towers reaches the arch without the detour', () => {
    // silencing BUILDER routes play to the arch from the morning: no tower K-lines,
    // no habit, no misfire — the detour belongs to memory, not to the arch
    const s = makeSociety(SEED)
    silence(s, 'builder')
    const events = run(s, 30000)
    expect(events.some((e) => e.kind === 'archComplete')).toBe(true)
    expect(events.some((e) => e.kind === 'misfire')).toBe(false)
    expect(s.kLines.filter((k) => k.kind === 'tower').length).toBe(0)
  })

  it('without ARCHER, this society builds towers until the end of its days', () => {
    const s = makeSociety(SEED)
    silence(s, 'archer')
    const events = run(s, 20000)
    expect(events.some((e) => e.kind === 'archComplete')).toBe(false)
    expect(events.some((e) => e.kind === 'towerComplete')).toBe(true)
  })

  it('without SEE-ARCH, three parts never become an arch', () => {
    const s = makeSociety(SEED)
    silence(s, 'see-arch')
    const events = run(s, 30000)
    expect(events.some((e) => e.kind === 'archComplete')).toBe(false)
  })
})

describe('stage 4 — the dream (§15.4, §15.8, §3.5)', () => {
  /** a morning left alone long enough that the body runs out of things to do */
  function sleepingSociety(seed = SEED) {
    const s = makeSociety(seed)
    for (let i = 0; i < 40000 && !s.asleep; i++) step(s, NO_VISITOR)
    return s
  }

  it('left alone long enough, the society sleeps', () => {
    const s = sleepingSociety()
    expect(s.asleep).toBe(true)
    expect(s.mode).toBe('sleep')
  })

  it('while it sleeps nothing in the world moves — the mind runs without the body', () => {
    const s = sleepingSociety()
    const before = JSON.stringify(s.world.blocks)
    const hand = { ...s.world.hand }
    const events: WorldEvent[] = []
    for (let i = 0; i < 600 && s.asleep; i++) events.push(...step(s, NO_VISITOR).events)
    expect(JSON.stringify(s.world.blocks)).toBe(before)
    expect(s.world.hand.holding).toBe(hand.holding)
    expect(events).toHaveLength(0)
  })

  it('but its agents keep firing: a K-line is re-aroused', () => {
    const s = sleepingSociety()
    expect(s.dream).not.toBeNull()
    let sawFiring = false
    for (let i = 0; i < 120 && s.asleep; i++) {
      step(s, NO_VISITOR)
      if (s.dream!.agents.some((id) => (s.a[id] ?? 0) > 0.5)) sawFiring = true
    }
    expect(sawFiring).toBe(true)
  })

  it('the scribe reports the dream as work — it can see only the A-brain', () => {
    const s = sleepingSociety()
    for (let i = 0; i < 200 && s.asleep; i++) step(s, NO_VISITOR)
    const dreamLines = s.lines.filter((l) => l.kind === 'dream')
    expect(dreamLines.length).toBeGreaterThan(1)
    expect(dreamLines.some((l) => l.text.includes('is not there'))).toBe(true)
  })

  it('a society that never achieved anything sleeps dreamlessly', () => {
    // GRASP silenced: no tower ever stands, so no K-line ever forms — nothing to re-arouse
    const s = makeSociety(SEED)
    silence(s, 'grasp')
    for (let i = 0; i < 40000 && !s.asleep; i++) step(s, NO_VISITOR)
    expect(s.asleep).toBe(true)
    expect(s.kLines).toHaveLength(0)
    expect(s.dream).toBeNull()
    expect(s.lines.some((l) => l.text.includes('nothing to dream of'))).toBe(true)
  })

  it('the censors sleep too, so the dream may hold what the day forbade (§27.3)', () => {
    const s = sleepingSociety()
    for (let i = 0; i < 200 && s.asleep; i++) step(s, NO_VISITOR)
    expect(s.a['censor-wreck']).toBe(0)
    expect(s.a['suppressor-startle']).toBe(0)
  })

  it('the visitor’s return wakes it', () => {
    const s = sleepingSociety()
    for (let i = 0; i < 40 && s.asleep; i++) {
      step(s, { present: true, x: 40, y: 20, speed: 6 })
    }
    expect(s.asleep).toBe(false)
    expect(s.lines.some((l) => l.kind === 'wake' && l.text.includes('wakes'))).toBe(true)
  })

  it('a sleeping society is never startled into dropping something', () => {
    // the startle's drop is the one way the body could move while asleep; waking is the
    // fright instead
    const s = sleepingSociety()
    const before = JSON.stringify(s.world.blocks)
    step(s, { present: true, x: 40, y: 20, speed: 10 })
    expect(JSON.stringify(s.world.blocks)).toBe(before)
  })

  it('the night is still deterministic: one seed, one night', () => {
    const a = sleepingSociety()
    const b = sleepingSociety()
    for (let i = 0; i < 500; i++) {
      step(a, NO_VISITOR)
      step(b, NO_VISITOR)
    }
    expect(snapshot(a)).toBe(snapshot(b))
  })
})

describe('stage 5 — attachment (§17.2)', () => {
  /** a visitor who is present and holds a sign only when `when` says so */
  function parent(s: Society, ticks: number, when: (s: Society) => number) {
    for (let i = 0; i < ticks; i++) {
      step(s, { present: true, x: 50, y: 20, speed: 0.2, sign: when(s) })
    }
  }

  it('a morning with no sign is the morning we already had', () => {
    const a = makeSociety(SEED)
    const b = makeSociety(SEED)
    for (let i = 0; i < 6000; i++) {
      step(a, { present: true, x: 50, y: 20, speed: 0.2 })
      step(b, { present: true, x: 50, y: 20, speed: 0.2, sign: 0 })
    }
    expect(snapshot(a)).toBe(snapshot(b))
    expect(a.worth).toEqual({ tower: 1, arch: 1, wreck: 1 })
  })

  it('the same seed and the same parenting is the same morning', () => {
    const a = makeSociety(SEED)
    const b = makeSociety(SEED)
    const script = (i: number) => (i % 400 < 60 ? -1 : 0)
    for (let i = 0; i < 8000; i++) {
      step(a, { present: true, x: 50, y: 20, speed: 0.2, sign: script(i) })
      step(b, { present: true, x: 50, y: 20, speed: 0.2, sign: script(i) })
    }
    expect(snapshot(a)).toBe(snapshot(b))
  })

  it('censure changes ends, never means — the falsifier', () => {
    // With nothing to outbid the tower, a censured society must build EXACTLY as an
    // unparented one does: same placements, same lean, same collapses, same K-lines. If
    // attachment ever touched a method — hand speed, jitter, the find/get/put chain —
    // these two bodies come apart and this test goes red.
    const make = () => {
      const s = makeSociety(SEED)
      silence(s, 'archer')
      silence(s, 'wrecker')
      return s
    }
    const parented = make()
    const baseline = make()
    parent(parented, 8000, () => -1)
    for (let i = 0; i < 8000; i++) step(baseline, { present: true, x: 50, y: 20, speed: 0.2 })
    expect(parented.worth.tower).toBeLessThan(1)
    expect(bodySnapshot(parented)).toBe(bodySnapshot(baseline))
  })

  it('fear is not censure', () => {
    const s = makeSociety(SEED)
    let sawAlarm = false
    for (let i = 0; i < 3000; i++) {
      step(s, { present: true, x: 30, y: 20, speed: i % 60 === 0 ? 9 : 1, sign: 0 })
      if (s.ruler === 'alarm') sawAlarm = true
    }
    expect(sawAlarm).toBe(true)
    expect(s.worth).toEqual({ tower: 1, arch: 1, wreck: 1 })
  })

  it('ordinary failure is not censure', () => {
    const s = makeSociety(SEED)
    silence(s, 'balance')
    const events: WorldEvent[] = []
    for (let i = 0; i < 12000; i++) {
      events.push(...step(s, { present: true, x: 50, y: 20, speed: 0.2 }).events)
    }
    expect(events.some((e) => e.kind === 'collapsed')).toBe(true)
    expect(s.worth).toEqual({ tower: 1, arch: 1, wreck: 1 })
  })

  it('timing aims the sign, and a sign with nothing under it lands on nothing', () => {
    const towerOnly = makeSociety(SEED)
    parent(towerOnly, 12000, (s) => (s.mode === 'build' && s.goal === 'tower' ? 1 : 0))
    expect(towerOnly.worth.tower).toBeGreaterThan(1)
    expect(towerOnly.worth.wreck).toBe(1)

    const wreckOnly = makeSociety(SEED)
    parent(wreckOnly, 12000, (s) => (s.mode === 'wreck' ? 1 : 0))
    expect(wreckOnly.worth.wreck).toBeGreaterThan(1)
    expect(wreckOnly.worth.tower).toBe(1)

    const restOnly = makeSociety(SEED)
    parent(restOnly, 12000, (s) => (s.mode === 'rest' ? -1 : 0))
    expect(restOnly.worth).toEqual({ tower: 1, arch: 1, wreck: 1 })
    expect(restOnly.lines.some((l) => l.text.includes('lands on nothing'))).toBe(true)
  })

  it('you cannot parent past a censor: ends are taught, means are gated (§9.3)', () => {
    const loved = makeSociety(SEED)
    parent(loved, 14000, (s) => (s.mode === 'wreck' ? 1 : 0))
    expect(loved.worth.wreck).toBeGreaterThan(1.2)
    // …and still nothing unfinished is ever smashed while the censor stands
    const s = makeSociety(SEED)
    const events: WorldEvent[] = []
    for (let i = 0; i < 14000; i++) {
      events.push(...step(s, { present: true, x: 50, y: 20, speed: 0.2, sign: s.mode === 'wreck' ? 1 : 0 }).events)
    }
    expect(events.some((e) => e.kind === 'wrecked' && !e.complete)).toBe(false)
  })

  it('attachment cannot buy the transfer: praise wakes ARCHER no earlier (§17.6)', () => {
    const s = makeSociety(SEED)
    const events: WorldEvent[] = []
    for (let i = 0; i < 30000; i++) {
      events.push(...step(s, { present: true, x: 50, y: 20, speed: 0.2, sign: 1 }).events)
    }
    const order = events.map((e) => e.kind)
    expect(order.indexOf('misfire')).toBeGreaterThan(-1)
    expect(order.indexOf('archComplete')).toBeGreaterThan(order.indexOf('misfire'))
    expect(s.kLines.filter((k) => k.kind === 'tower').length).toBeGreaterThanOrEqual(2)
  })

  it('both new agents are ablatable, and their losses differ', () => {
    const blind = makeSociety(SEED)
    silence(blind, 'see-sign')
    parent(blind, 6000, () => -1)
    expect(blind.worth).toEqual({ tower: 1, arch: 1, wreck: 1 })
    expect(blind.a['worth']).toBe(0)

    // WORTH silenced after it has already learned: the eye still reports, the values stand
    const taught = makeSociety(SEED)
    parent(taught, 6000, () => -1)
    const learned = taught.worth.tower
    expect(learned).toBeLessThan(1)
    silence(taught, 'worth')
    parent(taught, 6000, () => -1)
    expect(taught.worth.tower).toBe(learned)
    expect(taught.a['see-sign']).toBeGreaterThan(0)
  })

  it('a goal can be made unworthy, never impossible', () => {
    const s = makeSociety(SEED)
    parent(s, 40000, () => -1)
    expect(s.worth.tower).toBeGreaterThanOrEqual(WORTH_FLOOR)
  })
})

describe('the roster reflects the book', () => {
  it('is exactly the twenty-nine agents the page claims', () => {
    // the prose on /society, the table caption and the map aria-label all say twenty-seven
    // (stage 2 added ARCHER and SEE-ARCH); this pins the number so the copy can never
    // drift from the roster again
    expect(AGENTS.length).toBe(29)
  })

  it('every agent cites a real chapter of the 1986 edition', () => {
    const chapterNumbers = new Set(CHAPTERS.map((c) => c.n))
    for (const agent of AGENTS) {
      expect(chapterNumbers.has(agent.ref.ch)).toBe(true)
      if (agent.ref.sec) expect(agent.ref.sec.startsWith(`${agent.ref.ch}.`)).toBe(true)
    }
  })

  it('the shelf wakes only chapters with resident agents, and there are some of each', () => {
    const awake = awakeChapters()
    expect(awake.size).toBeGreaterThanOrEqual(8)
    expect(awake.size).toBeLessThan(CHAPTERS.length) // the rest is roadmap, honestly dim
  })
})

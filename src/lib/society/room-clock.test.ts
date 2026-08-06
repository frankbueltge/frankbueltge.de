// src/lib/society/room-clock.test.ts — the honesty rule, checked at the moment of speaking.
//
// score.test.ts checks that lines which make claims are MARKED as claims. That is a check on
// the data. This one runs the room: the real engine, the real score machine, a whole pass at
// a time, and asserts the thing the piece actually promises — that at the instant a line went
// on screen, what it claims had happened.
//
// It exists because both ways of breaking that promise shipped, and neither was visible in
// the data:
//   · "A tower. And no one built it." went up over a table the wrecker had just cleared,
//     because the beat's cue was a memory of an event rather than the state of the world;
//   · the society fell asleep during the act about building, because a room constant was
//     tuned without checking it against the score's clock.
// Both were found by watching the screen. Neither should have needed to be.

import { describe, expect, it } from 'vitest'
import { makeSociety, NO_VISITOR, seedFromString, step, TICKS_PER_SEC, type Society } from './engine'
import { SCORE } from './score'
import {
  advance,
  currentBeat,
  NO_CUES,
  ROOM_RATE,
  SLEEP_AFTER,
  shownLine,
  startPass,
  type Clock,
  type Cues,
} from './room-clock'

const FRAME_MS = 1000 / 60
const SIM_MS = 1000 / (TICKS_PER_SEC * ROOM_RATE)

interface Visitor {
  /** milliseconds after the pass begins at which this visitor is present, or never */
  from?: number
  until?: number
}

interface Shown {
  at: number
  id: string
  line: string
  /** the world as it was at the instant the line appeared */
  cues: Cues
}

/**
 * Run one pass of the room, headless: the real engine on the room's clock, the real score
 * machine, and a note of every line at the moment it went up.
 */
function runPass(seed: string, visitor: Visitor = {}, limitMs = 6 * 60 * 1000) {
  const society: Society = makeSociety(seedFromString(seed), { sleepAfter: SLEEP_AFTER })
  const clock: Clock = startPass(0)
  const shown: Shown[] = []
  let sawGrasp = false
  let sawVisitor = false
  let acc = 0
  let now = 0
  let last: string | null = null

  const present = (t: number) =>
    visitor.from !== undefined && t >= visitor.from && (visitor.until === undefined || t < visitor.until)

  const cues = (t: number): Cues => ({
    grasped: sawGrasp,
    towerStands: society.world.towerComplete,
    visitorSeen: sawVisitor,
    visitorPresent: present(t),
    silenced: false, // nobody touches anything in these passes
    asleep: society.asleep,
  })

  while (!clock.finished && now < limitMs) {
    now += FRAME_MS
    acc += FRAME_MS
    while (acc >= SIM_MS) {
      const here = present(now)
      if (here) sawVisitor = true
      const { events } = step(
        society,
        here ? { present: true, x: 50, y: 20, speed: 4 } : NO_VISITOR,
      )
      for (const e of events) if (e.kind === 'grasped') sawGrasp = true
      acc -= SIM_MS
    }
    advance(clock, now, cues(now))
    const line = shownLine(clock)
    if (line !== null && line !== last) {
      shown.push({ at: now, id: currentBeat(clock).id, line, cues: cues(now) })
    }
    last = line
  }
  return { society, clock, shown, endedAt: now }
}

const SEEDS = ['2026-08-07#0', '2026-08-07#1', '2026-08-06#0', '2026-08-05#2', '2026-08-04#1']

describe('an unattended morning — the projection with nobody in front of it', () => {
  it.each(SEEDS)('%s finishes its pass and comes round again', (seed) => {
    const { clock, endedAt } = runPass(seed)
    expect(clock.finished, 'the pass never ended — the room would hang').toBe(true)
    // long enough to be a piece, short enough that a stranger sees a whole one
    expect(endedAt).toBeGreaterThan(60_000)
    expect(endedAt).toBeLessThan(4 * 60 * 1000)
  })

  it.each(SEEDS)('%s never says a thing that has not happened', (seed) => {
    const { shown } = runPass(seed)
    for (const s of shown) {
      const beat = SCORE.find((b) => b.id === s.id)!
      if (!beat.conditional) continue
      const truth: Record<string, boolean> = {
        towerComplete: s.cues.towerStands,
        visitorPresent: s.cues.visitorSeen,
        asleep: s.cues.asleep,
        silenced: s.cues.silenced,
        stayedAwake: true, // set by the machine itself, and checked separately below
        grasped: s.cues.grasped,
        none: false,
      }
      expect(
        truth[beat.cue],
        `"${s.line}" went up at ${(s.at / 1000).toFixed(1)}s and its cue (${beat.cue}) was false`,
      ).toBe(true)
    }
  })

  it.each(SEEDS)('%s is never told about a visitor who was not there', (seed) => {
    const { shown } = runPass(seed)
    const said = shown.map((s) => s.id)
    expect(said).not.toContain('noticed')
    expect(said).not.toContain('unknown')
    expect(said).not.toContain('awake')
  })

  it.each(SEEDS)('%s still gets a beginning, a tower and an ending', (seed) => {
    const { shown } = runPass(seed)
    const said = shown.map((s) => s.id)
    expect(said[0]).toBe('open')
    expect(said, 'an unattended pass never showed its tower').toContain('stands')
    expect(said.at(-1), 'the loop must end on the line it forgets you with').toBe('forget')
  })

  it.each(SEEDS)('%s sleeps AFTER it has built, not during', (seed) => {
    // the failure this is named for: at sleepAfter 120 the dream was drawn over a frozen
    // hand while the room was still saying "none of them knows what a tower is"
    const { shown } = runPass(seed)
    const tower = shown.find((s) => s.id === 'stands')!
    expect(tower.cues.asleep, 'the society was asleep when its tower was announced').toBe(false)
    const sleeps = shown.find((s) => s.id === 'alone')
    expect(sleeps, 'an unattended pass never reached its sleep').toBeDefined()
    expect(sleeps!.at).toBeGreaterThan(tower.at)
  })

  it.each(SEEDS)('%s falls asleep inside the window the score leaves for it', (seed) => {
    // SLEEP_AFTER is squeezed from both ends and the squeeze is the point: late enough that
    // the invitation plays over a society still working, early enough that the sleep act
    // finds it asleep. This is the test that lets that number be tuned without watching.
    const { shown } = runPass(seed)
    const invite = shown.find((s) => s.id === 'invite')!
    const sleeps = shown.find((s) => s.id === 'alone')!
    expect(invite, 'the invitation never appeared').toBeDefined()
    expect(sleeps, 'the sleep act never got its line').toBeDefined()
    // the whole invitation was addressed to something awake
    expect(invite.cues.asleep, 'the invitation was addressed to a sleeper').toBe(false)
    // and by the time the room turns to sleep, it is asleep
    expect(sleeps.cues.asleep).toBe(true)
  })

  it.each(SEEDS)('%s announces the tower while one is actually standing', (seed) => {
    const { shown } = runPass(seed)
    for (const s of shown.filter((x) => x.id === 'stands' || x.id === 'remember')) {
      expect(s.cues.towerStands, `"${s.line}" was said over an empty table`).toBe(true)
    }
  })
})

describe('a claim is retracted when it stops being true', () => {
  it('the tower line comes down with the tower, mid-sentence if need be', () => {
    // hand-driven rather than engine-driven, so the moment the wrecker acts is exact
    const clock = startPass(0)
    const cues: Cues = { ...NO_CUES, grasped: true }
    // run to the beat that announces the tower, giving it a tower to announce
    cues.towerStands = true
    let now = 0
    while (currentBeat(clock).id !== 'stands' && now < 200_000) {
      now += 16
      advance(clock, now, cues)
    }
    advance(clock, now + 16, cues)
    expect(shownLine(clock)).toBe('A tower. And no one built it.')

    // one second in — well short of the 4.2s it is entitled to — the table is cleared
    const shownAt = now
    now += 1000
    cues.towerStands = false
    advance(clock, now, cues)
    expect(now - shownAt).toBeLessThan(SCORE.find((b) => b.id === 'stands')!.minMs)
    expect(
      shownLine(clock),
      'the room went on claiming a tower over an empty table',
    ).not.toBe('A tower. And no one built it.')
  })

  it('a line with no claim to retract is left alone', () => {
    // "This is a mind." has cue 'none' and is not conditional: nothing can falsify it, and
    // it must not be cut short by this rule
    const clock = startPass(0)
    const open = SCORE[0]
    for (let now = 16; now < open.minMs - 100; now += 16) advance(clock, now, NO_CUES)
    expect(shownLine(clock)).toBe(open.line)
  })
})

describe('a visitor who stays and keeps moving', () => {
  const STAYS: Visitor = { from: 2000 }

  it.each(SEEDS)('%s is told the true ending — it never slept', (seed) => {
    const { shown, clock } = runPass(seed, STAYS)
    const said = shown.map((s) => s.id)
    expect(clock.finished).toBe(true)
    expect(said, 'a society kept awake was told it slept').not.toContain('alone')
    expect(said, 'the other true ending never came').toContain('awake')
    expect(said.at(-1)).toBe('forget')
  })

  it.each(SEEDS)('%s is noticed, because it moved', (seed) => {
    const { shown } = runPass(seed, STAYS)
    expect(shown.map((s) => s.id)).toContain('noticed')
  })

  it.each(SEEDS)('%s never waits eighty seconds in the dark at the end', (seed) => {
    // the defect this whole ending was built for: with only the sleeping ending, a visitor
    // who stayed got `alone` and `dreaming` timing out back to back in silence
    const { shown, endedAt } = runPass(seed, STAYS)
    const last = shown.at(-1)!
    expect(endedAt - last.at).toBeLessThan(20_000)
  })
})

describe('a visitor who walks away in the middle', () => {
  const LEAVES: Visitor = { from: 2000, until: 40_000 }

  it.each(SEEDS)('%s is not told it is keeping anything awake', (seed) => {
    // "you keep it awake" said to an empty room is the same lie in the other direction
    const { shown, clock } = runPass(seed, LEAVES)
    expect(clock.finished).toBe(true)
    const said = shown.map((s) => s.id)
    expect(said).not.toContain('awake')
    // it was noticed while they were there, and that stays true after they go
    expect(said).toContain('noticed')
    expect(said.at(-1)).toBe('forget')
  })
})

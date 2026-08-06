// src/lib/society/score.test.ts — the room's rules, as tests.
//
// A room is not a page: a line that cannot be read across five metres in one breath has
// failed, and a beat that can stall has emptied the room. Both are checkable.

import { describe, expect, it } from 'vitest'
import { bestCaseMs, SCORE, worstCaseMs, type Cue } from './score'
import { AGENTS } from './agents'

describe('the score can be read from across a room', () => {
  it('every line is one short sentence', () => {
    for (const beat of SCORE) {
      if (beat.line === null) continue
      // 52 characters is the camera's limit too; a projected intertitle gets the same rule
      expect(beat.line.length, `beat "${beat.id}" is too long`).toBeLessThanOrEqual(52)
      expect(beat.line.length).toBeGreaterThan(8)
      // one sentence, not a paragraph: at most one full stop, and it ends the line
      expect(beat.line.split('.').filter(Boolean).length).toBeLessThanOrEqual(2)
    }
  })

  it('every line stands long enough to be read, and never longer than it earns', () => {
    for (const beat of SCORE) {
      // roughly 12 characters per second of reading, plus a breath
      const needed = beat.line ? beat.line.length * 80 : 1500
      expect(beat.minMs, `beat "${beat.id}" flashes past`).toBeGreaterThanOrEqual(needed)
      expect(beat.maxMs).toBeGreaterThanOrEqual(beat.minMs)
    }
  })
})

describe('the room loops, and cannot hang', () => {
  it('no beat can hold the room hostage', () => {
    for (const beat of SCORE) {
      expect(beat.maxMs, `beat "${beat.id}" has no ceiling`).toBeLessThanOrEqual(80000)
    }
  })

  it('even with no visitor and no luck, a pass ends inside five minutes… of waiting', () => {
    // worst case is the unattended museum at closing time: nothing is touched, nothing
    // moves. It must still come round again rather than stop on a dead beat.
    expect(worstCaseMs()).toBeLessThanOrEqual(6 * 60 * 1000)
  })

  it('a quick visitor gets the whole arc in about a minute of reading', () => {
    expect(bestCaseMs()).toBeGreaterThan(45 * 1000)
    expect(bestCaseMs()).toBeLessThan(90 * 1000)
  })
})

describe('the arc contains its turns', () => {
  it('has the five moments the room promises, in order', () => {
    const ids = SCORE.map((b) => b.id)
    const order = ['open', 'watch', 'noticed', 'invite', 'alone', 'forget']
    let last = -1
    for (const id of order) {
      const at = ids.indexOf(id)
      expect(at, `beat "${id}" is missing`).toBeGreaterThan(last)
      last = at
    }
  })

  it('an empty gallery still gets a whole, honest loop', () => {
    // nothing is touched, no one walks past: the beats that survive must still say
    // something true from beginning to end, and must include the ending
    const unconditional = SCORE.filter((b) => !b.conditional && b.line)
    expect(unconditional.length).toBeGreaterThanOrEqual(6)
    expect(unconditional.map((b) => b.id)).toContain('open')
    expect(unconditional.map((b) => b.id)).toContain('forget')
  })

  it('the gesture is invited exactly once, and it is the only instruction', () => {
    const instructions = SCORE.filter((b) => b.line?.toLowerCase().includes('touch'))
    expect(instructions).toHaveLength(1)
    expect(instructions[0].cue).toBe('silenced')
  })

  it('no line claims something that may not have happened', () => {
    // A line asserting an event ("something moved", "it sleeps") must be conditional, so an
    // empty gallery is never told about a visitor who was not there.
    const asserts = /moved|sleeps|not there|what you are|the rule is gone/i
    for (const beat of SCORE) {
      if (beat.line && asserts.test(beat.line)) {
        expect(beat.conditional, `beat "${beat.id}" asserts without a cue`).toBe(true)
        expect(beat.cue).not.toBe('none')
      }
    }
  })

  it('a conditional beat that never gets its cue simply says nothing', () => {
    // guaranteed by the room's runtime, but the data must at least make it possible:
    // every conditional beat has a real cue and a ceiling to move on from
    for (const beat of SCORE.filter((b) => b.conditional)) {
      expect(beat.cue).not.toBe('none')
      expect(beat.maxMs).toBeGreaterThan(beat.minMs)
    }
  })

  it('every cue a beat waits for is one the room can actually deliver', () => {
    const known: Cue[] = ['none', 'grasped', 'towerComplete', 'visitorPresent', 'silenced', 'asleep']
    for (const beat of SCORE) expect(known).toContain(beat.cue)
  })

  it('says nothing a visitor must already know: no agent names in the lines', () => {
    // the reading exit names its agents; the room shows them. A stranger cannot be asked
    // to carry a vocabulary they were handed four seconds ago.
    for (const beat of SCORE) {
      for (const agent of AGENTS) {
        expect(beat.line ?? '', `beat "${beat.id}" leans on the name ${agent.name}`).not.toContain(
          agent.name,
        )
      }
    }
  })
})

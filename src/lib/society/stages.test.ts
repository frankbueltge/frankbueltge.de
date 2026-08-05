// src/lib/society/stages.test.ts — the growth record is load-bearing, not decorative.
//
// The chronicle's promise (stages add, nothing silently overwritten, every stage anchored
// and reproducible) is held here: machinery cannot grow without its dated entry, entries
// cannot name agents or chapters that do not exist, and every entry carries its anchors.

import { describe, expect, it } from 'vitest'
import { AGENTS, awakeChapters, CHAPTERS } from './agents'
import { STAGES } from './stages'

describe('the growth record accounts for the whole roster', () => {
  it('every agent in the roster was added by exactly one recorded entry', () => {
    const added = STAGES.flatMap((s) => s.agentsAdded)
    expect(new Set(added).size).toBe(added.length) // no agent added twice
    expect(added.length).toBe(AGENTS.length) // no unrecorded growth — THE tripwire
    const rosterIds = new Set(AGENTS.map((a) => a.id))
    for (const id of added) expect(rosterIds.has(id), `unknown agent "${id}"`).toBe(true)
  })

  it('woken chapters exist and really are awake', () => {
    const awake = awakeChapters()
    const chapterNumbers = new Set(CHAPTERS.map((c) => c.n))
    for (const s of STAGES) {
      for (const ch of s.chaptersWoken) {
        expect(chapterNumbers.has(ch)).toBe(true)
        expect(awake.has(ch), `chapter ${ch} recorded as woken but asleep`).toBe(true)
      }
    }
  })

  it('every entry carries its anchors: date, claim, commit, PR', () => {
    for (const s of STAGES) {
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(s.claim.length).toBeGreaterThan(20)
      expect(s.visible.length).toBeGreaterThan(20)
      expect(s.commits.length).toBeGreaterThan(0)
      expect(s.prs.length).toBeGreaterThan(0)
      expect(s.refs.length).toBeGreaterThan(0)
    }
  })

  it("only the newest entry may be 'pending' — squash-merge cannot know its own hash", () => {
    // An entry written in the same PR it describes cannot carry its squash hash yet; a
    // follow-up commit fills it in. Everything older must be a real hash, so a 'pending'
    // can never quietly become permanent.
    STAGES.forEach((s, i) => {
      const last = i === STAGES.length - 1
      for (const c of s.commits) {
        if (last) expect(c).toMatch(/^([0-9a-f]{8}|pending)$/)
        else expect(c, `entry "${s.title}" still pending`).toMatch(/^[0-9a-f]{8}$/)
      }
    })
  })

  it('the record reads forward: dates never decrease, stage numbers never decrease', () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].date >= STAGES[i - 1].date).toBe(true)
      expect(STAGES[i].n).toBeGreaterThanOrEqual(STAGES[i - 1].n)
    }
  })

  it('corrections add framing, never machinery', () => {
    for (const s of STAGES.filter((x) => x.kind === 'correction')) {
      expect(s.agentsAdded).toHaveLength(0)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { DIRECTION, SEASON1, SLOTS, WITHOUT_SLOT } from './season1'

describe('Season 1 register', () => {
  it('carries exactly the declared number of episode slots, numbered 1..n uniquely', () => {
    expect(SLOTS).toHaveLength(SEASON1.episodes)
    expect(SLOTS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  // The rule the withdrawal of 2026-08-06 turns into a build constraint. A subject sitting
  // on an unclaimed slot is exactly what was struck from SEASON.md — a topic assigned to a
  // number nobody argued for. The register may not quietly reintroduce it.
  it('an open slot carries no subject, no title and no practice — nobody has argued one', () => {
    for (const s of SLOTS) {
      if (s.status !== 'open') continue
      expect(s.title, `slot ${s.n} is open but carries a title`).toBeUndefined()
      expect(s.subject, `slot ${s.n} is open but carries a subject`).toBeUndefined()
      expect(s.practice, `slot ${s.n} is open but names a practice`).toBeUndefined()
      expect(s.note, `slot ${s.n} is open but carries a note`).toBeUndefined()
    }
  })

  it('every non-open row names the practice and its provenance — no status without a record', () => {
    for (const s of SLOTS) {
      if (s.status === 'open') continue
      expect(s.practice, `slot ${s.n} lacks a practice`).toBeTruthy()
      expect(s.provenance, `slot ${s.n} lacks provenance`).toBeTruthy()
      expect(s.title, `slot ${s.n} lacks the practice's own title`).toBeTruthy()
    }
  })

  it('a shipped episode must link to its work', () => {
    for (const s of SLOTS) {
      if (s.status === 'shipped') expect(s.href, `slot ${s.n} shipped without href`).toBeTruthy()
    }
  })

  it('an entry holding no slot still carries its record', () => {
    for (const e of WITHOUT_SLOT) {
      expect(e.provenance, `${e.title} lacks provenance`).toBeTruthy()
      expect(e.outcome, `${e.title} lacks an outcome`).toBeTruthy()
    }
  })
})

describe("Season 1 direction — the practices', not the architect's", () => {
  it('is coherent in whichever state it stands', () => {
    if (DIRECTION.state === 'unset') {
      expect(DIRECTION.settled).toBeUndefined()
      expect(DIRECTION.proposals).toHaveLength(0)
    }
    if (DIRECTION.state === 'proposed') {
      expect(DIRECTION.proposals.length).toBeGreaterThan(0)
      expect(DIRECTION.settled).toBeUndefined()
    }
    if (DIRECTION.state === 'settled') {
      expect(DIRECTION.settled).toBeTruthy()
      expect(
        DIRECTION.provenance,
        'a settled direction needs the record that settles it',
      ).toBeTruthy()
    }
  })

  it('every proposal is argued by a practice in a committed record', () => {
    for (const p of DIRECTION.proposals) {
      expect(p.practice, 'a proposal without a practice is nobody speaking').toBeTruthy()
      expect(p.provenance, `${p.practice}'s proposal lacks provenance`).toBeTruthy()
    }
  })

  // The season is allowed to have no theme, so nothing in the register may carry one.
  it('the season itself declares no theme', () => {
    expect('theme' in SEASON1).toBe(false)
    expect('name' in SEASON1).toBe(false)
    expect('brief' in SEASON1).toBe(false)
  })
})

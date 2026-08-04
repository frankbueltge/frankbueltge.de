import { describe, expect, it } from 'vitest'
import { SEASON1, SLOTS } from './season1'

describe('Season 1 register', () => {
  it('carries exactly the declared number of episode slots, numbered 1..n uniquely', () => {
    expect(SLOTS).toHaveLength(SEASON1.episodes)
    expect(SLOTS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('every non-open row names the practice and its provenance — no status without a record', () => {
    for (const s of SLOTS) {
      if (s.status !== 'open') {
        expect(s.practice, `slot ${s.n} lacks a practice`).toBeTruthy()
        expect(s.provenance, `slot ${s.n} lacks provenance`).toBeTruthy()
      }
    }
  })

  it('a shipped episode must link to its work', () => {
    for (const s of SLOTS) {
      if (s.status === 'shipped') expect(s.href, `slot ${s.n} shipped without href`).toBeTruthy()
    }
  })
})

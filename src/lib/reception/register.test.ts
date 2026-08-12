// The committed register is the fixture: it must always validate, and the per-work
// view must read chronologically.
import { describe, expect, it } from 'vitest'
import { loadReception, receptionFor, receivedSlugs } from './register'

describe('reception register', () => {
  it('the committed register validates and every entry carries provenance', () => {
    const entries = loadReception()
    expect(entries.length).toBeGreaterThan(0)
    for (const e of entries) expect(e.provenance.length).toBeGreaterThan(3)
  })

  it('per-work reception reads oldest-first and index knows received slugs', () => {
    const forWork = receptionFor('studio', '2026-07-30-no-part')
    expect(forWork.length).toBeGreaterThan(0)
    for (let i = 1; i < forWork.length; i++) {
      expect(forWork[i - 1].date <= forWork[i].date).toBe(true)
    }
    expect(receivedSlugs('studio').has('2026-07-30-no-part')).toBe(true)
    expect(receivedSlugs('studio').has('nope')).toBe(false)
  })
})

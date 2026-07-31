// src/lib/post/incoming.test.ts
import { describe, it, expect } from 'vitest'
import { loadIncoming, countByKind } from './incoming'

describe('loadIncoming', () => {
  const entries = loadIncoming()

  it('reads the committed registers rather than a list of its own', () => {
    // Derived, never hand-kept: the seed register holds three seeds today, and every one of
    // them has to appear. A register that can drift from its source is worse than none.
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.some((e) => e.kind === 'seed')).toBe(true)
  })

  it('every row says where its full record is', () => {
    for (const e of entries) {
      expect(e.href.startsWith('/')).toBe(true)
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.from.length).toBeGreaterThan(1)
      expect(e.outcome.length).toBeGreaterThan(2)
    }
  })

  it('newest first — the register is read from its edge', () => {
    const dates = entries.map((e) => e.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('names what arrived, never quotes it — mail is not a publication', () => {
    // The seed register carries the submitted text verbatim. It must not travel into this
    // overview: what a stranger sent is theirs, and /seed is the surface that shows it.
    const raw = JSON.stringify(entries)
    expect(raw).not.toContain('ai-2040.com')
  })

  it('a decision is quoted in the practice’s own words, and disagreement survives', () => {
    // One seed was taken by studio and declined by field. An overview that averaged that into
    // a single verdict would hide exactly the thing worth seeing.
    const geteilt = entries.filter((e) => e.outcome.includes('·'))
    for (const e of geteilt) expect(e.outcome).toMatch(/\w+: \w+ · \w+: \w+/)
  })

  it('German intake vocabulary is translated, not shown raw (EN-only since 2026-07-16)', () => {
    const seeds = entries.filter((e) => e.kind === 'seed')
    for (const e of seeds) {
      expect(e.what).not.toMatch(/quelle|wort|frage|richtung/i)
      expect(e.what.startsWith('a ')).toBe(true)
    }
  })
})

describe('countByKind', () => {
  it('counts each kind, so no number has to be written into prose', () => {
    const c = countByKind(loadIncoming())
    expect(c.seed + c.reception).toBe(loadIncoming().length)
  })

  it('a kind that has not arrived yet counts zero rather than going missing', () => {
    expect(countByKind([])).toEqual({ seed: 0, reception: 0 })
  })
})

// src/data/werke.test.ts
import { describe, it, expect } from 'vitest'
import { WERKE, WERKE_CHRONO, byRecency } from './werke'

describe('byRecency (newest first, stable ties)', () => {
  it('sorts a newer "since" before an older one', () => {
    const a = { since: '2026-06-29' } as any
    const b = { since: '2026-06-12' } as any
    expect(byRecency(a, b)).toBeLessThan(0)
  })
  it('keeps equal "since" stable (array order preserved)', () => {
    const list = [
      { id: 'a', since: '2026-06-22' },
      { id: 'b', since: '2026-06-22' },
      { id: 'c', since: '2026-06-29' },
    ] as any[]
    expect([...list].sort(byRecency).map((w) => w.id)).toEqual(['c', 'a', 'b'])
  })
})

describe('WERKE_CHRONO', () => {
  it('leads with the newest experiment (beifang)', () => {
    expect(WERKE_CHRONO[0].id).toBe('beifang')
  })
  it('ends with Überflug (placed last)', () => {
    expect(WERKE_CHRONO[WERKE_CHRONO.length - 1].id).toBe('ueberflug')
  })
  it('contains every experiment exactly once', () => {
    expect(WERKE_CHRONO).toHaveLength(WERKE.length)
    expect(new Set(WERKE_CHRONO.map((w) => w.id)).size).toBe(WERKE.length)
  })
  it('every entry carries a "since" date', () => {
    for (const w of WERKE_CHRONO) expect(w.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

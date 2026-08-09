// src/data/werke.test.ts
import { describe, it, expect } from 'vitest'
import {
  WERKE_PROJECTS,
  WERKE_INSTRUMENTS,
  HOLDINGS_EXCLUDED_IDS,
  HOLDINGS_RANKED,
  WERKE,
  WERKE_CHRONO,
  WERKE_EXPERIMENTE,
  WERKE_HOLDINGS,
  WERKE_STUDIEN,
  byRecency,
} from './werke'

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
  it('leads with the newest experiment (Machine Attention, since 2026-08-08)', () => {
    expect(WERKE_CHRONO[0].id).toBe('attention')
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

describe('WERKE_HOLDINGS (/experiments register)', () => {
  it('excludes the three practice doors and current MRR artefacts', () => {
    // Regression guard: 'on-record' (MRR, since 2026-07-23) once rendered as the TOP entry
    // of /experiments — a page that lists the lab's earlier experiments, not running practices.
    for (const id of ['field', 'studio', 'atelier', 'on-record']) {
      expect(HOLDINGS_EXCLUDED_IDS.has(id)).toBe(true)
      expect(WERKE_HOLDINGS.map((w) => w.id)).not.toContain(id)
    }
  })
  it('renders the curated strength ranking, The Consensus first and Iceberg Theory second (Frank, 2026-08-05)', () => {
    expect(WERKE_HOLDINGS[0].id).toBe('consensus')
    expect(WERKE_HOLDINGS[1].id).toBe('parallaxe')
    expect(WERKE_HOLDINGS.map((w) => w.id)).toEqual([...HOLDINGS_RANKED])
  })
  it('keeps every non-excluded entry — ranked and register agree on the set', () => {
    const ranked = new Set(WERKE_HOLDINGS.map((w) => w.id))
    const expected = WERKE_CHRONO.filter((w) => !HOLDINGS_EXCLUDED_IDS.has(w.id)).map((w) => w.id)
    expect(ranked.size).toBe(WERKE_HOLDINGS.length)
    for (const id of expected) expect(ranked.has(id)).toBe(true)
    expect(WERKE_HOLDINGS.length).toBe(WERKE_CHRONO.length - HOLDINGS_EXCLUDED_IDS.size)
  })
  it('every excluded id actually exists in the register (no dead exclusions)', () => {
    const ids = new Set(WERKE_CHRONO.map((w) => w.id))
    for (const id of HOLDINGS_EXCLUDED_IDS) expect(ids.has(id)).toBe(true)
  })
})

describe('tier split (Experimente vs. Studien)', () => {
  it('lists the three studies, newest first (The Consensus rejoined the experiments row, Frank 2026-08-05)', () => {
    expect(WERKE_STUDIEN.map((w) => w.id)).toEqual(['ghost-fleet', 'correction', 'ueberflug'])
  })
  it('keeps studies out of the experiments list', () => {
    for (const w of WERKE_EXPERIMENTE) expect(w.tier).not.toBe('studie')
  })
  it('splits without losing entries', () => {
    expect(
      WERKE_EXPERIMENTE.length +
        WERKE_STUDIEN.length +
        WERKE_PROJECTS.length +
        WERKE_INSTRUMENTS.length,
    ).toBe(WERKE.length)
  })
  it('keeps the research project and its instrument out of the experiments row (Frank, 2026-08-09)', () => {
    expect(WERKE_PROJECTS.map((w) => w.id)).toEqual(['attention'])
    expect(WERKE_INSTRUMENTS.map((w) => w.id)).toEqual(['observatory'])
    const experiments = WERKE_EXPERIMENTE.map((w) => w.id)
    expect(experiments).not.toContain('attention')
    expect(experiments).not.toContain('observatory')
  })
})

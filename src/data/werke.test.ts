// src/data/werke.test.ts
import { describe, it, expect } from 'vitest'
import {
  EXPERIMENT_LINES,
  WERKE_BY_LINE,
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
  werkTitle,
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
  // Pinned to a name until 2026-08-27, when registering Admissions broke it — the pin was a
  // digit in the sense the currency doctrine warns about: true when typed, false as soon as the
  // work continued. Asserting the rule instead cannot go stale.
  it('is ordered newest first, with the newest entry at the head', () => {
    const dates = WERKE_CHRONO.filter((w) => w.id !== 'ueberflug').map((w) => w.since)
    expect([...dates].sort().reverse()).toEqual(dates)
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
  it('renders newest first — the curated 2026-08-05 ranking is dissolved (Frank, 2026-08-14)', () => {
    // Frank's instruction of 2026-08-14 (wording private): new works on top, dissolving the
    // curated order — recency, derived from WERKE_CHRONO, no manual list left to go stale.
    expect(WERKE_HOLDINGS.map((w) => w.id)).toEqual(
      WERKE_CHRONO.filter((w) => !HOLDINGS_EXCLUDED_IDS.has(w.id)).map((w) => w.id),
    )
    expect(WERKE_HOLDINGS[0].id).toBe('trending') // newest werk on top today (Common Ground, 2026-09-02)
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
  it('lists the three studies, newest first (Consensus rejoined the experiments row, Frank 2026-08-05)', () => {
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
  it('keeps the research project and the instruments out of the experiments row (Frank, 2026-08-09; redaction reclassified 2026-08-14)', () => {
    expect(WERKE_PROJECTS.map((w) => w.id)).toEqual(['attention'])
    expect(WERKE_INSTRUMENTS.map((w) => w.id).sort()).toEqual(['admissions', 'observatory', 'redaction'])
    const experiments = WERKE_EXPERIMENTE.map((w) => w.id)
    expect(experiments).not.toContain('attention')
    expect(experiments).not.toContain('observatory')
    expect(experiments).not.toContain('redaction')
    expect(experiments).not.toContain('admissions')
  })
})

describe('research lines — the shelf’s categories (Frank, 2026-08-22)', () => {
  it('lists the four lines in the decided order', () => {
    expect(EXPERIMENT_LINES.map((l) => l.id)).toEqual([
      'counter-measurement',
      'ledger',
      'memory',
      'watchers',
    ])
  })

  it('groups every shelf entry exactly once — nothing lost between register and page', () => {
    const grouped = WERKE_BY_LINE.flatMap((g) => g.werke.map((w) => w.id))
    expect(new Set(grouped).size).toBe(grouped.length)
    expect([...grouped].sort()).toEqual([...WERKE_HOLDINGS.map((w) => w.id)].sort())
  })

  it('keeps recency order inside every group (Frank’s 2026-08-14 rule survives the grouping)', () => {
    for (const group of WERKE_BY_LINE) {
      expect(group.werke.map((w) => w.id)).toEqual(
        WERKE_CHRONO.filter((w) => w.line === group.line.id).map((w) => w.id),
      )
    }
  })

  it('prints no heading over an empty line', () => {
    for (const group of WERKE_BY_LINE) expect(group.werke.length).toBeGreaterThan(0)
  })

  it('gives the practice doors and the other houses no line — they are not on this shelf', () => {
    for (const id of HOLDINGS_EXCLUDED_IDS) {
      expect(WERKE.find((w) => w.id === id)?.line).toBeUndefined()
    }
  })

  it('files every werk that claims the counter-measurement line in its own words under it', () => {
    // This is why the by-line cut was chosen over a by-subject one: the works had already said
    // it themselves, and the page showed none of it. A werk that starts claiming the line — or
    // stops — must move with its own description, so this reads the description, not a list.
    for (const werk of WERKE_HOLDINGS) {
      if (/counter-measurement.{0,3} line|Linie „Gegenmessung/i.test(werk.description.en)) {
        expect(werk.line, `${werk.id} claims the line in its description`).toBe('counter-measurement')
      }
    }
  })

  it('gives every line a blurb and a label without a leading article', () => {
    for (const line of EXPERIMENT_LINES) {
      expect(line.label).not.toMatch(/^THE\s/)
      expect(line.blurb.en.length).toBeGreaterThan(60)
      expect(line.blurb.de).toBe(line.blurb.en) // EN-only site; the Locale duality is legacy
    }
  })
})

describe('titles carry no leading article (Frank, 2026-08-22)', () => {
  // Eight titles lost their "The" on 2026-08-22. The rule holds for the shelf only: the
  // practice doors and the other houses' pieces ("The Measuring Field", "The State Before the
  // Interface") are named by their own houses, and this register does not rename them.
  it('no experiment on /experiments starts with "The"', () => {
    for (const werk of WERKE_HOLDINGS) {
      expect(werkTitle(werk, 'en'), werk.id).not.toMatch(/^The\s/)
      expect(werkTitle(werk, 'de'), werk.id).not.toMatch(/^The\s/)
    }
  })

  it('keeps the eight renamed titles', () => {
    const byId = new Map(WERKE.map((w) => [w.id, werkTitle(w, 'en')]))
    expect(byId.get('society')).toBe('Society')
    expect(byId.get('protokoll')).toBe('Protocol')
    expect(byId.get('praemie')).toBe('Policy')
    expect(byId.get('consensus')).toBe('Consensus')
    expect(byId.get('invoked-past')).toBe('Invoked Past')
    expect(byId.get('balance')).toBe('Balance')
    expect(byId.get('correction')).toBe('Correction')
    expect(byId.get('ghost-fleet')).toBe('Ghost Fleet')
  })
})

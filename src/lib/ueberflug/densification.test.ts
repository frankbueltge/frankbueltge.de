import { describe, expect, it } from 'vitest'
import satellites from '@/data/ueberflug/satellites.json'
import series from '@/data/ueberflug/densification.json'
import type { SatEntry } from './types'
import { commercialShare, launchCohorts, launchYear } from './densification'

const fleet = (satellites as { satellites: SatEntry[] }).satellites

function sat(intl: string, cls: string | null): SatEntry {
  return {
    norad: 1,
    name: 'x',
    intl,
    group: 'resource',
    gcat: { class: cls as SatEntry['gcat']['class'], category: null, owner: null, state: null },
    omm: {} as SatEntry['omm'],
  }
}

describe('launchYear', () => {
  it('reads the year out of the international designator', () => {
    expect(launchYear('2014-029A')).toBe(2014)
    expect(launchYear('1993-061B')).toBe(1993)
  })

  it('refuses anything it cannot read rather than guessing a cohort', () => {
    expect(launchYear('')).toBeNull()
    expect(launchYear(null)).toBeNull()
    expect(launchYear('TBA-000A')).toBeNull()
    expect(launchYear('0042-001A')).toBeNull() // before Sputnik — not a launch year
  })
})

describe('launchCohorts', () => {
  it('splits a cohort across the four GCAT classes and the unclassified rest', () => {
    const cohorts = launchCohorts([
      sat('2024-001A', 'B'),
      sat('2024-002A', 'B'),
      sat('2024-003A', 'C'),
      sat('2024-004A', 'D'),
      sat('2024-005A', 'A'),
      sat('2024-006A', null),
    ])
    expect(cohorts).toHaveLength(1)
    expect(cohorts[0]).toMatchObject({
      year: 2024,
      total: 6,
      commercial: 2,
      civil: 1,
      military: 1,
      amateur: 1,
      unclassified: 1,
    })
  })

  it('sorts ascending and drops entries without a readable year', () => {
    const cohorts = launchCohorts([sat('2025-001A', 'B'), sat('bad', 'B'), sat('2019-001A', 'C')])
    expect(cohorts.map((c) => c.year)).toEqual([2019, 2025])
  })

  it('every class adds up to the cohort total, on the real committed snapshot', () => {
    const cohorts = launchCohorts(fleet)
    expect(cohorts.length).toBeGreaterThan(10)
    for (const c of cohorts) {
      expect(c.commercial + c.civil + c.military + c.amateur + c.unclassified).toBe(c.total)
    }
    // Nothing is silently lost between the snapshot and the curve.
    const counted = cohorts.reduce((n, c) => n + c.total, 0)
    expect(counted).toBe(fleet.filter((s) => launchYear(s.intl) !== null).length)
  })
})

describe('commercialShare', () => {
  it('brackets the unclassified satellites instead of assuming them away', () => {
    const [cohort] = launchCohorts([
      sat('2010-001A', 'B'),
      sat('2010-002A', 'C'),
      sat('2010-003A', null),
      sat('2010-004A', null),
    ])
    const share = commercialShare(cohort)
    expect(share.low).toBeCloseTo(0.25) // 1 of 4
    expect(share.high).toBeCloseTo(0.75) // 1 + 2 unclassified, of 4
  })

  it('states a point estimate the band actually contains — on every real cohort', () => {
    // The rule for the point estimate is a decision (see densification.ts); whichever rule
    // stands, a page may not state a share its own band does not cover.
    for (const cohort of launchCohorts(fleet)) {
      const { low, point, high } = commercialShare(cohort)
      expect(low).toBeLessThanOrEqual(high)
      expect(point).toBeGreaterThanOrEqual(low)
      expect(point).toBeLessThanOrEqual(high)
    }
  })

  it('an empty cohort claims nothing', () => {
    expect(commercialShare({
      year: 2000, total: 0, commercial: 0, civil: 0, military: 0, amateur: 0, unclassified: 0,
    })).toEqual({ low: 0, point: 0, high: 0 })
  })
})

describe('the standing register derived from git history', () => {
  const register = series as {
    first_observation: string
    last_observation: string
    observations: number
    gaps: unknown[]
    series: { date: string; fleet: number; unknown_class: number; by_class: Record<string, number> }[]
  }

  it('carries one row per observation day, in order', () => {
    expect(register.series).toHaveLength(register.observations)
    const dates = register.series.map((r) => r.date)
    expect([...dates].sort()).toEqual(dates)
    expect(new Set(dates).size).toBe(dates.length)
    expect(dates[0]).toBe(register.first_observation)
    expect(dates.at(-1)).toBe(register.last_observation)
  })

  it('each row accounts for its whole fleet', () => {
    for (const row of register.series) {
      const classified = Object.values(row.by_class).reduce((a, b) => a + b, 0)
      expect(classified + row.unknown_class).toBe(row.fleet)
    }
  })

  it('keeps the failed night on the record instead of dropping it', () => {
    // 2026-06-12 was committed with an empty fleet. An archive that quietly skips its
    // outages reports a cleaner instrument than the one that ran.
    expect(register.series.some((r) => r.fleet === 0)).toBe(true)
  })
})

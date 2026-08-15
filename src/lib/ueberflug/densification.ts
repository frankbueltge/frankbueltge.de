// The densification of the gaze — USP rework #16 (docs/design/2026-08-09-usp-rework-program.md).
//
// The audit called this the strongest rework direction of all sixteen: not "which satellites
// are overhead right now" (SatFleetLive and SpyMeSat both do that), but how the observing
// fleet CHANGES. The page had named it an open direction and assumed it needed a pipeline
// that stops overwriting its snapshot. It did not: the launch year is already carried by
// every satellite's international designator, so today's committed snapshot contains a
// multi-year cohort curve, and the git history of that snapshot (see
// scripts/ueberflug_densification.py) is the standing register that extends it forward.
//
// What the numbers can and cannot say is stated on the page, not hidden here:
//   - This is the ACTIVE catalogued fleet by launch year, not launches per year. Satellites
//     that launched and already deorbited are absent, so early cohorts are undercounted and
//     the rise looks steeper than the launch record alone would make it.
//   - Classified satellites are absent from the catalogue. A military count is a FLOOR.
//   - The current year is partial.

import type { SatEntry } from './types'

export interface LaunchCohort {
  year: number
  total: number
  /** GCAT ownership classes: B commercial, C state-civil, D military, A amateur. */
  commercial: number
  civil: number
  military: number
  amateur: number
  /** Satellites GCAT carries without an ownership class. */
  unclassified: number
}

/**
 * Launch year from the international designator ("2014-029A" → 2014).
 * Returns null for anything that does not carry a four-digit year, so a malformed
 * entry drops out of the curve instead of landing in a wrong cohort.
 */
export function launchYear(intl: string | null | undefined): number | null {
  if (!intl) return null
  const match = /^(\d{4})-/.exec(intl)
  if (!match) return null
  const year = Number(match[1])
  return year >= 1957 && year <= 2100 ? year : null
}

/** Cohort table of an active-fleet snapshot, ascending by launch year. */
export function launchCohorts(satellites: SatEntry[]): LaunchCohort[] {
  const byYear = new Map<number, LaunchCohort>()

  for (const sat of satellites) {
    const year = launchYear(sat.intl)
    if (year === null) continue

    let cohort = byYear.get(year)
    if (!cohort) {
      cohort = {
        year,
        total: 0,
        commercial: 0,
        civil: 0,
        military: 0,
        amateur: 0,
        unclassified: 0,
      }
      byYear.set(year, cohort)
    }

    cohort.total += 1
    switch (sat.gcat?.class) {
      case 'B':
        cohort.commercial += 1
        break
      case 'C':
        cohort.civil += 1
        break
      case 'D':
        cohort.military += 1
        break
      case 'A':
        cohort.amateur += 1
        break
      default:
        cohort.unclassified += 1
    }
  }

  return [...byYear.values()].sort((a, b) => a.year - b.year)
}

/**
 * The commercial share of a cohort, as a band plus a point estimate.
 *
 * `low` and `high` are arithmetic, not judgement: they are what the share would be if every
 * unclassified satellite in the cohort turned out to be non-commercial (low) or commercial
 * (high). The band is the honest width of the claim.
 */
export interface CommercialShare {
  /** Every unclassified satellite counted as non-commercial. 0…1 */
  low: number
  /** The share this page states. Must lie within [low, high]. 0…1 */
  point: number
  /** Every unclassified satellite counted as commercial. 0…1 */
  high: number
}

export function commercialShare(cohort: LaunchCohort): CommercialShare {
  if (cohort.total === 0) return { low: 0, point: 0, high: 0 }

  const low = cohort.commercial / cohort.total
  const high = (cohort.commercial + cohort.unclassified) / cohort.total

  // The midpoint of the band (Frank, 2026-08-15). The unclassified rate is not constant
  // across the curve — above 50 % in some 2005–2011 cohorts, zero from 2023 on — so this
  // choice changes the SHAPE of the finding, not a rounding. Counting the unclassified as
  // non-commercial would make the old cohorts look maximally state-owned and so EXAGGERATE
  // the very flip this page claims; dropping them would rest the early years on a handful of
  // satellites. The midpoint claims nothing about them in either direction, stays inside the
  // band by construction, and is drawn on the page WITH its band, so the width of the claim
  // is visible rather than asserted. Where GCAT classified everything, low = point = high and
  // the band disappears on its own — which is why the recent cohorts that carry the headline
  // are unaffected by this rule at all.
  const point = (low + high) / 2

  return { low, point, high }
}

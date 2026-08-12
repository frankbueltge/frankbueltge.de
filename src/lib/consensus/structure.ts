// src/lib/consensus/structure.ts — the structure of the consensus, aggregated per method.
//
// USP rework program, Phase 1 (docs/design/2026-08-09-usp-rework-program.md, row 1).
// The audit found the measurement itself well-occupied (Media Cloud, Churnalism) and named
// the daylight: none of the neighbors classify WHY outlets converged — chain syndication
// vs. scattered placement — they only count THAT they did. The pipeline has computed that
// classification per day since v3; this module turns the committed archive into the
// aggregate figure the page can stand on.
//
// Derived at build time from the committed day files — never typed, never estimated.
//
// DATED CORRECTION, 2026-08-09 (evening): this module used to return ONE chainShare across
// the whole archive, and the page showed it as "the whole archive: 93% chain syndication".
// That number was an artifact of a method break, not a finding. The v1 pool (8 beat queries
// against the DOC API, <=250 articles each, ~700-1300 articles/day) surfaces narrow phrases
// with small, market-homogeneous domain sets, which classify as chain; the v2 pool (the full
// English raw stream, ~110k articles/day) surfaces the genuinely widest phrase, which
// classifies as scattered. refresh.py's own docstring warns against exactly this comparison
// ("do not compare pools across the two methods as if they were one instrument"), and the
// BigQuery baseline settles it: across 2,496 single-method days, chain runs at 3-5% a year,
// never 93%. So the aggregate is now computed PER METHOD VERSION and there is no
// archive-wide share to misread. See src/data/consensus/baseline.json.

export interface DayStructure {
  date: string
  label: string
  tldShare: number
  topTld: string
  domainCount: number
  /** the method version that measured this day — days of different versions never mix */
  methodVersion: string
}

export interface MethodAggregate {
  methodVersion: string
  /** label → count within this method version */
  counts: Record<string, number>
  /** classified days in this method version */
  classified: number
  /** share of this version's classified days labelled wire/chain, 0..1 */
  chainShare: number
  first: string
  last: string
}

export interface StructureAggregate {
  /** every day carrying a syndication classification, ascending by date */
  days: DayStructure[]
  /** one aggregate per method version, newest method first */
  byMethod: MethodAggregate[]
  /** days with any classification, across all versions (a count, never a numerator) */
  classified: number
  /** days in the archive without one (early records, honest gap) */
  unclassified: number
}

interface RawDay {
  date?: string
  method?: { version?: string }
  headline?: {
    domain_count?: number
    syndication?: { label?: string; tld_share?: number; top_tld?: string }
  }
}

export const CHAIN_LABEL = 'wire/chain syndication'

/** A day file written before the method block existed was measured by v1 — the same
 *  default refresh.py applies when it refuses to overwrite across versions. */
export const IMPLICIT_V1 = 'v1-doc-api'

/** Aggregate the committed consensus archive, per method version. `records` is date-keyed raw JSON. */
export function aggregateStructure(records: Record<string, RawDay>): StructureAggregate {
  const days: DayStructure[] = []
  let unclassified = 0
  for (const [key, raw] of Object.entries(records)) {
    const date = raw.date ?? key
    const syn = raw.headline?.syndication
    if (!syn?.label) {
      unclassified += 1
      continue
    }
    days.push({
      date,
      label: syn.label,
      tldShare: syn.tld_share ?? 0,
      topTld: syn.top_tld ?? '',
      domainCount: raw.headline?.domain_count ?? 0,
      methodVersion: raw.method?.version ?? IMPLICIT_V1,
    })
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1))

  const groups = new Map<string, DayStructure[]>()
  for (const d of days) {
    const g = groups.get(d.methodVersion)
    if (g) g.push(d)
    else groups.set(d.methodVersion, [d])
  }

  const byMethod: MethodAggregate[] = [...groups.entries()].map(([methodVersion, group]) => {
    const counts: Record<string, number> = {}
    for (const d of group) counts[d.label] = (counts[d.label] ?? 0) + 1
    return {
      methodVersion,
      counts,
      classified: group.length,
      chainShare: (counts[CHAIN_LABEL] ?? 0) / group.length,
      first: group[0].date,
      last: group[group.length - 1].date,
    }
  })
  // newest method first: the current instrument leads, superseded ones follow
  byMethod.sort((a, b) => (a.last < b.last ? 1 : -1))

  return { days, byMethod, classified: days.length, unclassified }
}

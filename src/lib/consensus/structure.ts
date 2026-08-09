// src/lib/consensus/structure.ts — the structure of the consensus, aggregated.
//
// USP rework program, Phase 1 (docs/design/2026-08-09-usp-rework-program.md, row 1).
// The audit found the measurement itself well-occupied (Media Cloud, Churnalism) and named
// the daylight: none of the neighbors classify WHY outlets converged — chain syndication
// vs. scattered placement — they only count THAT they did. The pipeline has computed that
// classification per day since v3; this module turns the committed archive into the
// aggregate figure the page can stand on: across every classified day, how often was the
// day's widest consensus one publishing group's push?
//
// Derived at build time from the committed day files — never typed, never estimated.

export interface DayStructure {
  date: string
  label: string
  tldShare: number
  topTld: string
  domainCount: number
}

export interface StructureAggregate {
  /** every day carrying a syndication classification, ascending by date */
  days: DayStructure[]
  /** label → count across all classified days */
  counts: Record<string, number>
  /** days with any classification (the denominator the shares use) */
  classified: number
  /** days in the archive without one (early records, honest gap) */
  unclassified: number
  /** share of classified days labelled wire/chain, 0..1 */
  chainShare: number
}

interface RawDay {
  date?: string
  headline?: {
    domain_count?: number
    syndication?: { label?: string; tld_share?: number; top_tld?: string }
  }
}

export const CHAIN_LABEL = 'wire/chain syndication'

/** Aggregate the committed consensus archive. `records` is date-keyed raw JSON. */
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
    })
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1))

  const counts: Record<string, number> = {}
  for (const d of days) counts[d.label] = (counts[d.label] ?? 0) + 1

  const classified = days.length
  const chainShare = classified === 0 ? 0 : (counts[CHAIN_LABEL] ?? 0) / classified
  return { days, counts, classified, unclassified, chainShare }
}

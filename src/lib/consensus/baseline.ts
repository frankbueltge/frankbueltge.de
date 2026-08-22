// src/lib/consensus/baseline.ts — the longitudinal layer of the Consensus.
//
// USP rework program, Phase 1 (docs/design/2026-08-09-usp-rework-program.md, row 1),
// on the G1 BigQuery path activated 2026-08-09 (docs/design/2026-08-09-gcp-activation.md).
// The nightly instrument can say how loud today's echo is. It cannot say whether that is
// loud — for that you need the distribution the raw-file HTTP path can never compute, so
// the same measurement was re-implemented in SQL over the whole historical GKG archive and
// committed once as src/data/consensus/baseline.json. Git stays the archive: nothing here
// reads BigQuery, at build time or any other time.
//
// The baseline is ONE method over 2,496 days. That is what makes it a baseline — and why
// today's value may be compared against it while v1 archive days may not be compared
// against v2 ones (see the dated correction in structure.ts).

export interface BaselineDay {
  date: string
  articles: number
  domains: number
  echoed: number
  echo_index: number
  label: string
  phrase?: string
  phrase_domains?: number
  span_hours?: number | null
  top_tld?: string
  tld_share?: number
  distinct_tlds?: number
}

export interface Baseline {
  window: { from: string; to: string; days_present: number }
  gaps: { missing_days: number; runs: { from: string; to: string; days: number }[] }
  source: { citation: string; url: string; license_notice: string }
  /** the G1 trace condition: committed query text, job ids and bytes billed travel with the data */
  provenance: {
    query: string
    query_sha256: string
    jobs: { job_id: string; created_utc: string; total_bytes_billed: string }[]
    total_bytes_billed: string
    cost: string
  }
  days: BaselineDay[]
}

export const CHAIN_LABEL = 'wire/chain syndication'

/** Where a value sits in the baseline: the share of baseline days at or below it, 0..1.
 *  Reported as a rank, not a probability — the distribution is the record, not a model. */
export function percentileOf(value: number, days: BaselineDay[]): number {
  if (days.length === 0) return 0
  let atOrBelow = 0
  for (const d of days) if (d.echo_index <= value) atOrBelow += 1
  return atOrBelow / days.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export interface YearRow {
  year: string
  days: number
  medianEcho: number
  chainDays: number
  chainShare: number
}

/** Per calendar year: how many days, the median echo index, and the chain-syndication share.
 *  The point of the table is the trend — one method, seven years, no smoothing. */
export function byYear(days: BaselineDay[]): YearRow[] {
  const groups = new Map<string, BaselineDay[]>()
  for (const d of days) {
    const y = d.date.slice(0, 4)
    const g = groups.get(y)
    if (g) g.push(d)
    else groups.set(y, [d])
  }
  return [...groups.entries()]
    .map(([year, g]) => {
      const chainDays = g.filter((d) => d.label === CHAIN_LABEL).length
      return {
        year,
        days: g.length,
        medianEcho: median(g.map((d) => d.echo_index)),
        chainDays,
        chainShare: chainDays / g.length,
      }
    })
    .sort((a, b) => (a.year < b.year ? -1 : 1))
}

export interface BaselineSummary {
  days: number
  from: string
  to: string
  medianEcho: number
  minEcho: number
  maxEcho: number
  chainDays: number
  /** share of ALL baseline days classified as chain syndication — the figure that
   *  replaces the archive-wide number the method break had inflated */
  chainShare: number
  labelCounts: Record<string, number>
  missingDays: number
}

export function summarise(b: Baseline): BaselineSummary {
  const idx = b.days.map((d) => d.echo_index)
  const labelCounts: Record<string, number> = {}
  for (const d of b.days) labelCounts[d.label] = (labelCounts[d.label] ?? 0) + 1
  const chainDays = labelCounts[CHAIN_LABEL] ?? 0
  return {
    days: b.days.length,
    from: b.window.from,
    to: b.window.to,
    medianEcho: median(idx),
    minEcho: Math.min(...idx),
    maxEcho: Math.max(...idx),
    chainDays,
    chainShare: b.days.length === 0 ? 0 : chainDays / b.days.length,
    labelCounts,
    missingDays: b.gaps.missing_days,
  }
}

/** How today's reading stands against seven years of the same measurement. */
export interface Standing {
  value: number
  percentile: number
  /** ranked position, 1 = quietest echo in the record */
  rank: number
  of: number
  /** the median of the most recent full calendar year in the baseline */
  recentMedian: number
  recentYear: string
  /** the median of the first full calendar year — the other end of the trend */
  firstMedian: number
  firstYear: string
}

export function standing(value: number, b: Baseline): Standing {
  const years = byYear(b.days).filter((y) => y.days >= 300)
  const first = years[0]
  const recent = years[years.length - 1]
  let atOrBelow = 0
  for (const d of b.days) if (d.echo_index <= value) atOrBelow += 1
  return {
    value,
    percentile: percentileOf(value, b.days),
    rank: atOrBelow,
    of: b.days.length,
    recentMedian: recent?.medianEcho ?? 0,
    recentYear: recent?.year ?? '',
    firstMedian: first?.medianEcho ?? 0,
    firstYear: first?.year ?? '',
  }
}

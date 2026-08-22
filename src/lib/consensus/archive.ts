/**
 * Consensus — chronicle of the committed daily measurements.
 *
 * Git is the archive: pipelines/consensus/ commits one JSON per day under
 * src/data/consensus/<YYYY-MM-DD>.json. This module turns that committed set
 * into a render-ready chronicle. It invents nothing: a day whose source failed
 * stays a failure, and a calendar day with no committed file at all becomes a
 * visible gap ("missing"), never a silently skipped row.
 */
import type { ConsensusData } from './types'

export type ChronicleKind = 'measured' | 'failed' | 'missing'

export interface ChronicleDay {
  kind: ChronicleKind
  /** YYYY-MM-DD */
  date: string
  /** Present for 'measured' and 'failed'; absent for 'missing'. */
  data?: ConsensusData
}

const DATE_FILE_RE = /(\d{4}-\d{2}-\d{2})\.json$/

/**
 * Build the chronicle, newest day first, from an import.meta.glob result.
 * Files not named like a date (e.g. latest.json) are not part of the archive.
 * Malformed entries fail the build loudly rather than being skipped.
 */
export function chronicle(files: Record<string, unknown>): ChronicleDay[] {
  const byDate = new Map<string, ConsensusData>()
  for (const [path, mod] of Object.entries(files)) {
    const m = path.match(DATE_FILE_RE)
    if (!m) continue
    const data = ((mod as { default?: unknown }).default ?? mod) as ConsensusData
    if (data?.date !== m[1]) {
      throw new Error(`consensus archive: ${path} carries date "${data?.date}" — file name and record disagree`)
    }
    if (typeof data.stats?.articles_scanned !== 'number' || typeof data.echo_index !== 'number') {
      throw new Error(`consensus archive: ${path} lacks stats.articles_scanned or echo_index`)
    }
    byDate.set(m[1], data)
  }
  if (byDate.size === 0) return []

  const dates = [...byDate.keys()].sort()
  const out: ChronicleDay[] = []
  const last = new Date(`${dates[dates.length - 1]}T00:00:00Z`)
  for (const d = new Date(`${dates[0]}T00:00:00Z`); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10)
    const data = byDate.get(date)
    if (!data) out.push({ kind: 'missing', date })
    else out.push({ kind: data.stats.articles_scanned === 0 ? 'failed' : 'measured', date, data })
  }
  return out.reverse()
}

/** Types for the world chamber's daily record
 *  (src/data/redaction/world/<date>.json, written by redaction.world.run_world). */

export interface WorldRegisterEntry {
  url: string
  domain: string
  before: string
  after: string
  removed: string[]
  added: string[]
  weight: number
  similarity: number
  window: '24h' | '1w' | 'unknown'
  detected: string | null
}

export interface WorldGdgSection {
  available: boolean
  day: string
  note?: string
  notice: string
  status_counts?: Record<string, number>
  title_changes_en?: number
  classes?: { trivial: number; update: number; reframing: number; replaced: number }
  register?: WorldRegisterEntry[]
  trace?: { job_id: string; project?: string; created?: string; bytes_billed?: number }[]
}

export interface WorldReceipt {
  url: string
  domain: string
  title: string
  first_seen: string
  class: string
  http_code: number | null
}

export interface WorldDeletionSection {
  available: boolean
  note?: string
  pool_day?: string
  sample_drawn_at?: string
  checked_at?: string
  sample_size?: number
  counts?: Record<string, number>
  decided?: number
  excluded_unverifiable?: number
  gone?: number
  gone_rate?: number | null
  gone_ci95?: [number, number] | null
  legal_451?: number
  legal_451_rate?: number | null
  legal_451_ci95?: [number, number] | null
  receipts?: WorldReceipt[]
  notes?: string[]
}

export interface WorldData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  filter_version: string
  selection_version: string
  register_bound: number
  gdg: WorldGdgSection
  deletion: WorldDeletionSection
  sample_committed: string | null
}

/** "0.037" → "3.7 %" — one decimal, honest rounding. */
export function pct(rate: number | null | undefined): string {
  if (rate == null) return '—'
  return `${(rate * 100).toFixed(1)} %`
}

/** Compact thousands for the day's big numbers. */
export function thousands(n: number | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('en-US')
}

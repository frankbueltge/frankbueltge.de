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
  /** absent for 451 receipts — the day record carries only title_sha256 there */
  title?: string
  title_sha256?: string
  first_seen: string
  class: string
  http_code: number | null
}

/** Crime/court reporting markers (English stream). A vanished headline that
 *  matches may name a private person whose report was deliberately removed —
 *  the page then withholds the wording (personal-rights caution) while the
 *  archive keeps counting. The rule is deliberately coarse and disclosed on
 *  the method sheet; withholding too much is the safe failure mode. */
const PERSONAL_MARKERS =
  /\b(arrested|charged|accused|convicted|guilty|sentenced|jailed|on trial|court|suspect|murder|rape|assault|molest|abuse|fraud|paedophile|pedophile)\b/i

export function withholdOnPage(title: string): boolean {
  return PERSONAL_MARKERS.test(title)
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

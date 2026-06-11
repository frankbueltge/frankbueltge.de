/** Frontend-Typen, spiegeln das kanonische Pipeline-Schema (schema_version 1). */
export type ProtokollStatus = 'ok' | 'unavailable' | 'implausible'
export type ComparisonLabel = 'prev_day' | 'prev_month' | 'prev_year_day' | 'prev_observation_day'

export interface ProtokollComparison {
  label: ComparisonLabel
  value: number
}

export interface ProtokollEntry {
  top_id: string
  status: ProtokollStatus
  unit: string
  cadence: string
  source: { name: string; url: string; license: string }
  retrieved_at: string
  value: number | null
  as_of: string | null
  comparison: ProtokollComparison | null
  label: string | null
  record: boolean
  note: string | null
}

export interface ProtokollDay {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  entries: ProtokollEntry[]
}

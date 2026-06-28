/** Frontend-Typen, spiegeln das kanonische Pipeline-Schema (schema_version 2). */
export type ProtokollStatus = 'ok' | 'unavailable' | 'implausible'
export type ComparisonLabel = 'prev_day' | 'prev_month' | 'prev_year_day' | 'prev_observation_day'

export interface ProtokollComparison {
  label: ComparisonLabel
  value: number
}

/** Ein dokumentiertes Großereignis mit Todesopfern (nur TOP „Verluste"). */
export interface LossEvent {
  date: string
  label_de: string
  label_en: string
  deaths: number
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
  events?: LossEvent[] | null
  trend: 'worsened' | 'improved' | 'unchanged' | null
}

export interface ProtokollIndex {
  eligible: number
  established: number
  improved: number
  worsened: number
  unchanged: number
}

export interface ProtokollDay {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  entries: ProtokollEntry[]
  index: ProtokollIndex | null
}

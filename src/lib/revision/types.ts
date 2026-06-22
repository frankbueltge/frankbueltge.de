/** Spiegel von src/data/revision/latest.json (pipelines/revision/refresh.py). */
export interface RevisionWeek {
  epiweek: number
  first_cases: number
  final_cases: number
  delta: number
  pct: number
  first_wili: number | null
  final_wili: number | null
  final_lag_weeks: number | null
}
export interface RevisionData {
  generated_at: string
  date: string
  systematic: { weeks: number; revised_up: number; revised_up_share: number; mean_pct: number }
  headline: RevisionWeek | null
  max_lag: RevisionWeek | null
  weeks: RevisionWeek[]
  source: { name: string; url: string; license: string; retrieved: string }
}

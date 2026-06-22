/** Spiegel von src/data/revision/latest.json (pipelines/revision/refresh.py). */
export interface Localized {
  de: string
  en: string
}
export interface RevisionMonth {
  period: string
  first: number
  final: number
  delta: number
}
export interface RevisionData {
  generated_at: string
  date: string
  metric: Localized
  systematic: { months: number; revised_down: number; revised_down_share: number }
  headline: RevisionMonth | null
  recent: RevisionMonth[]
  source: { name: string; url: string; license: string; retrieved: string }
}

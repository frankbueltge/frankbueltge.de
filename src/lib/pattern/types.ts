/** Spiegel von src/data/pattern/latest.json (pipelines/pattern/refresh.py). */
export interface Localized {
  de: string
  en: string
}
export interface PatternHeadline {
  a_id: string
  b_id: string
  a_label: Localized
  b_label: Localized
  r: number
  dates: string[]
  a_series: number[]
  b_series: number[]
}
export interface PatternData {
  generated_at: string
  date: string
  days: number
  metrics_count: number
  pairs: number
  strong_pairs: number
  strong_threshold: number
  permutations: number
  false_discovery_rate: number
  headline: PatternHeadline
  source: { name: string; url: string; license: string; retrieved: string }
}

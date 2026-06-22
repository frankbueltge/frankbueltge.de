/** Spiegel von src/data/tell/latest.json (pipelines/tell/refresh.py). */
export interface TellMarker {
  word: string
  baseline_per100k: number
  peak_per100k: number
  peak_year: number
  fold: number | null
}
export interface TellPoint {
  year: number
  value: number
}
export interface TellData {
  generated_at: string
  date: string
  chatgpt_year: number
  peak_year: number
  baseline_years: [number, number]
  headline: TellMarker
  markers: TellMarker[]
  index: TellPoint[]
  source: { name: string; url: string; license: string; retrieved: string }
}

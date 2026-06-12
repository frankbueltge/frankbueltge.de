/** Spiegel des kanonischen register.json der Halbwertszeit-Pipeline. */
export type HwStatus = 'gemessen' | 'laeuft' | 'nicht_messbar'

export interface HwEvent {
  qid: string
  label_de: string
  label_en: string
  date: string
  deaths: number
  languages: string[]
  languages_failed: string[]
  peak: number
  peak_day: string | null
  baseline: number
  lambda_per_day: number | null
  halflife_days: number | null
  r2: number | null
  status: HwStatus
  views_per_death: number
  series: [string, number][]
}

export interface HwRegister {
  generated_at: string
  rule: { deaths_min: number; since: string; langs: string[] }
  median_halflife_days: number | null
  events: HwEvent[]
}

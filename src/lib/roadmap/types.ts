/** Spiegel des kanonischen src/data/roadmap/earth.json. */
export type Locale = 'de' | 'en'
export interface Localized {
  de: string
  en: string
}
export interface KpiSource {
  name: string
  url: string
  license: string
  retrieved: string
}
export interface Kpi {
  id: string
  label: Localized
  metric: Localized
  unit: 'index' | 'ppm' | 'percent'
  /** Wie der KONZERN die Kennzahl bewertet — die Satire. „high" = mehr ist „besser". */
  good_when: 'high' | 'low'
  /** Deklarierte Zielmarke des Konzerns (bei good_when „high" eine Untergrenze). */
  target: number
  owner: Localized
  /** Autorisierter Deadpan-Einzeiler je KPI. */
  spin: Localized
  series: [number, number][]
  source: KpiSource
}
export interface EarthData {
  generated_at: string
  quarter: string
  kpis: Kpi[]
}
export type Rag = 'ok' | 'warn' | 'crit'

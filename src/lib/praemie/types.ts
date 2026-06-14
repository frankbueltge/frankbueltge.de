/** Frontend-Typen, spiegeln das kanonische police.json-Schema (schema_version 1).
 *  Jede Sektion kann statt der Daten ein { error } tragen, wenn ihre Quelle scheiterte. */
export interface PoliceSource {
  name: string
  url: string
  license: string
}

export interface PolicePremiumData {
  index: number
  base_value: number
  base_year: number
  change_pct_since_base: number
  latest_date: string
  source: PoliceSource
}
export type PolicePremium = PolicePremiumData | { error: string }

export interface PoliceDisastersData {
  cumulative_cost_busd: number
  total_events: number
  since_year: number
  latest_year: number
  latest_year_events: number
  latest_year_cost_busd: number
  latest_year_deaths: number
  source: PoliceSource
}
export type PoliceDisasters = PoliceDisastersData | { error: string }

export interface PoliceClaimsData {
  recent_paid_usd: number
  recent_count: number
  latest_year: number
  source: PoliceSource
}
export type PoliceClaims = PoliceClaimsData | { error: string }

export interface PoliceRetreatData {
  non_renewals: number
  as_of: string
  note: string
  source: PoliceSource
}
export type PoliceRetreat = PoliceRetreatData | { error: string }

export interface Police {
  generated_at: string
  schema_version: string
  pipeline_version: string
  premium: PolicePremium
  disasters: PoliceDisasters
  claims: PoliceClaims
  retreat: PoliceRetreat
}

/** Typ-Guard: Sektion hat Daten (kein { error }). */
export function hasData<T extends object>(s: T | { error: string }): s is T {
  return !('error' in s)
}

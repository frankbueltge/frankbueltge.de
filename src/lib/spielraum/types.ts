/** Frontend-Typen, spiegeln das kanonische spielraum/register.json-Schema (schema_version 1)
 *  exakt. Kein { error }-Muster wie bei praemie: AWS' `discloses: false` ist ein BEFUND
 *  (keine Offenlegung), kein Fehlerzustand — daher ein eigener Typ-Guard (hasDisclosure). */

/** Belegtiefe der Quelle. Aktuell im Register beobachtete Werte. */
export type Tier = 'VERIFIED' | 'SOURCED'

export type CompanyKey = 'aws' | 'google' | 'meta' | 'microsoft'

export interface Caveat {
  de: string
  en: string
}

export interface PueEntry {
  figure: number
  period: string
  source_id: string
  tier: Tier
  vintage_note_de?: string
  vintage_note_en?: string
}

export interface Pue {
  quote: string
  quote_source_id: string
  scope_note_de: string
  scope_note_en: string
  series: PueEntry[]
}

export interface GrowthPctEntry {
  period: string
  quote: string
  scope_de: string
  scope_en: string
  source_id: string
  tier: Tier
  value: number
}

export interface MwhEntry {
  period: string
  source_id: string
  tier: Tier
  value: number
}

/** Wachstum offengelegt als Prozentzahl (Google). */
export interface ConsumptionGrowth {
  discloses: true
  form: 'growth_pct'
  growth_pct: GrowthPctEntry[]
}

/** Wachstum aus absoluten MWh-Reihen ableitbar (Meta, Microsoft). */
export interface ConsumptionMwh {
  discloses: true
  form: 'mwh'
  mwh: MwhEntry[]
  scope_de: string
  scope_en: string
}

/** Keine Offenlegung (AWS) — die Absenz selbst ist der Befund, kein Fehler. */
export interface ConsumptionNone {
  discloses: false
  note_de: string
  note_en: string
  absence_check_source_id: string
  tier: Tier
}

export type Consumption = ConsumptionGrowth | ConsumptionMwh | ConsumptionNone

export interface Company {
  caveats: Caveat[]
  consumption: Consumption
  display_name: string
  pue: Pue
}

export interface SourceInfo {
  fetched_at: string
  name: string
  tier_note: string
  url: string
  official?: string
}

export interface IngestLogEntry {
  action: string
  by: string
  note_de: string
  note_en: string
  ts: string
}

export interface SpielraumRegister {
  companies: Record<CompanyKey, Company>
  floor: number
  floor_note_de: string
  floor_note_en: string
  generated_at: string
  ingest_log: IngestLogEntry[]
  schema_version: string
  sources: Record<string, SourceInfo>
}

/** Typ-Guard: Firma legt Verbrauch offen (growth_pct ODER mwh). AWS' discloses:false ist ein
 *  BEFUND, keine Fehlerlage — bewusst kein { error }-Muster wie bei praemie/types.ts hasData. */
export function hasDisclosure(c: Consumption): c is ConsumptionGrowth | ConsumptionMwh {
  return c.discloses === true
}

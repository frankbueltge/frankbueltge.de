// Ökologie-Neustrukturierung (Phase 3e, Branch ecology-restructure): Datenzugriff auf die
// von research-ecology exportierten Begegnungs-Daten (src/data/begegnungen/, siehe deren
// README.md für Provenienz). Bewusst schmal — nur, was die Skelett-Seiten aus Phase 3e
// brauchen; die endgültige Form kommt aus der eigenen Design-Session.
import entranceData from '@/data/begegnungen/entrance.json'
import narrativeData from '@/data/begegnungen/enc-2026-001/narrative.json'

export interface LocalizedText {
  de: string
  en: string
}

export interface SiteEntranceParticipant {
  actor_id: string
  collective_id: string | null
  role: string
  local_status: string | null
}

export interface SiteEntranceDivergence {
  leftLabel: LocalizedText
  leftQuote: string
  rightLabel: LocalizedText
  rightQuote: string
  closing: LocalizedText
}

export interface SiteEntranceStation {
  id: string
  heading: LocalizedText
  quote?: string
  attribution?: LocalizedText
  akte_event_id?: string
  akte_event_type?: string
  divergence?: SiteEntranceDivergence
}

export interface SiteEntrance {
  encounter_id: string
  title: string
  headline: LocalizedText
  status: { as_of: string; statusLine: LocalizedText }
  participants: SiteEntranceParticipant[]
  stations: SiteEntranceStation[]
  links: { akte: string; divergenz: string }
  authored_by: string
  approval: 'pending' | 'approved'
}

// research-ecology's own JSON-Schema-Validierung (packages/protocol/schemas/site-entrance.
// schema.json) läuft im Export selbst; hier nur ein struktureller Cast, wie beim übrigen
// JSON-Datenimport dieser Site (z. B. src/data/praemie/police.json).
export const currentEntrance = entranceData as unknown as SiteEntrance

/** encounter_id -> Ordnername unter src/data/begegnungen/ (research-ecology's apps/export-site
 * leitet denselben Slug her, siehe dort shortEncounterSlug: die ersten drei bindestrich-
 * getrennten Segmente). Aktuell genau eine Begegnung. */
export function shortEncounterSlug(encounterId: string): string {
  return encounterId.split('-').slice(0, 3).join('-')
}

export function isDivergenceStation(s: SiteEntranceStation): s is SiteEntranceStation & { divergence: SiteEntranceDivergence } {
  return s.divergence !== undefined
}

/** Alle Begegnungen — aktuell genau eine (der Export deckt nur die aktuelle Begegnung ab). */
export const allEncounters: SiteEntrance[] = [currentEntrance]

export const currentNarrative = narrativeData as unknown as {
  encounter_id: string
  authored_by: string
  approval: 'pending' | 'approved'
  beats: unknown[]
}

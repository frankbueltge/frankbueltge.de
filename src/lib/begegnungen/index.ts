// Ökologie-Neustrukturierung (Phase 3e, Branch ecology-restructure): Datenzugriff auf die
// von research-ecology exportierten Begegnungs-Daten (src/data/begegnungen/, siehe deren
// README.md für Provenienz). Bewusst schmal — nur, was die Skelett-Seiten aus Phase 3e
// brauchen; die endgültige Form kommt aus der eigenen Design-Session.
//
// Einsprachig Englisch (Frank, 2026-07-15): der Ökologie-Stack schreibt kein Deutsch mehr —
// research-ecology liefert jedes vormals lokalisierte Feld ({ de, en }) jetzt als einfachen
// englischen String; das frühere `LocalizedText` entfällt.
import entranceData from '@/data/begegnungen/entrance.json'
import type { ScoreExport } from './score'

// Der Eingang folgt der Auswahlregel (neueste Begegnung mit freigegebener Partitur) — der
// Export schreibt entrance.json UND den passenden Ordner; Narrative/Partitur werden hier aus
// dem Ordner der AKTUELLEN Begegnung geladen statt (wie bis 2026-07-22) festverdrahtet aus
// enc-2026-001. Fail-loud beim Build, wenn der Ordner fehlt: eine stumme 001-Rückfalllösung
// wäre genau die stale Projektion, die der Export-Vertrag ausschließen soll.
const narrativeModules = import.meta.glob('/src/data/begegnungen/*/narrative.json', {
  eager: true
}) as Record<string, { default: unknown }>
const scoreModules = import.meta.glob('/src/data/begegnungen/*/score.json', {
  eager: true
}) as Record<string, { default: unknown }>
const currentSlug = (entranceData as { encounter_id: string }).encounter_id
  .split('-')
  .slice(0, 3)
  .join('-')
const narrativeModule = narrativeModules[`/src/data/begegnungen/${currentSlug}/narrative.json`]
const scoreModule = scoreModules[`/src/data/begegnungen/${currentSlug}/score.json`]
if (narrativeModule === undefined || scoreModule === undefined) {
  throw new Error(
    `begegnungen: entrance.json nennt ${currentSlug}, aber src/data/begegnungen/${currentSlug}/ fehlt (narrative/score)`
  )
}
const narrativeData = narrativeModule.default
const scoreData = scoreModule.default

export interface SiteEntranceParticipant {
  actor_id: string
  collective_id: string | null
  role: string
  local_status: string | null
}

export interface SiteEntranceDivergence {
  leftLabel: string
  leftQuote: string
  rightLabel: string
  rightQuote: string
  closing: string
}

export interface SiteEntranceStation {
  id: string
  heading: string
  quote?: string
  attribution?: string
  akte_event_id?: string
  akte_event_type?: string
  divergence?: SiteEntranceDivergence
}

export interface SiteEntrance {
  encounter_id: string
  title: string
  headline: string
  status: { as_of: string; statusLine: string }
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

/** The Partitur's data source (work order phase-c2-site-entrance-design.md §1): the full
 * 7-event ledger plus lane/flow/obligation/divergence facts entrance.json's narrated-station
 * subset doesn't carry. Built by research-ecology's apps/export-site — see its own README.md
 * for provenance. Rendered by src/lib/begegnungen/score.ts's `buildScoreSvg`. */
export const currentScore = scoreData as unknown as ScoreExport

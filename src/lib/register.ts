// Dataset Register (/datasets) — Typen und reine Hilfsfunktionen.
//
// Löst src/lib/datasets.ts ab (Rückbau 2026-07-27, docs/design/2026-07-27-register-
// rueckbau-und-scouts.md). Der Unterschied ist nicht technisch, sondern der Zweck:
//
//   vorher   16.516 Einträge aus einem Stichwortsieb über 56,6 Mio. DataCite-Records,
//            als 14-MB-Snapshot beim Bauen aus einem Release geholt, 8.590 Unterseiten.
//   jetzt    eine kuratierte Liste, klein genug zum Committen — wie src/data/atlas/
//            werke.json (448 Einträge, 315 KB) und ulysses/atlas/atlas.json (98).
//
// Der Grund für den Rückbau steht im Papier (§3): Ein Stichwort im Titel bezeichnet oft
// eine ROLLE, keinen GEGENSTAND — „Training data for MaxQuant" heißt, dass diese
// Proteomik-Daten ein Modell trainiert haben, nicht dass der Datensatz von KI handelt.
// Gemessen am 27.07.: von 16.507 DOIs im Register und 89 DOIs, die die Praxen je
// zitiert haben, war die Schnittmenge NULL. Der Bestand hat der Forschung nie gedient.
//
// Die Konsequenz steckt im Typ unten: `relevance` ist ein Pflichtfeld. Ein Eintrag kann
// nicht existieren, ohne zu sagen, warum er zählt. Ein Sammelverfahren, das beliebig
// skaliert, ist kein Kuratieren — dass das alte auf 16.516 skalieren konnte, ist der
// Beweis, dass es keinen einzigen Eintrag begründen musste (Papier §4).
//
// Die Kanon-Regeln des dataset-hub gelten unverändert weiter und stehen hier, weil sie
// die Felder prägen: nichts erfinden (leere Felder bleiben leer), nie URLs konstruieren
// (`access_url` steht wörtlich so in der Quelle), Ausfälle vermerken statt überbrücken
// (`access_checked: 'none'` heißt ungeprüft, nicht „nicht erreichbar").
import eintraegeRaw from '@/data/register/datasets.json'

/** Wie weit der Zugriffsweg tatsächlich nachgeprüft wurde. Bestätigt sind NUR 200/203/206
 *  — HTTP 202 ist keine Zugriffsbestätigung (die figshare-Familie antwortet
 *  automatisierten Anfragen so, auf HEAD wie auf GET; Papier §9.5). */
export type AccessChecked = 'none' | 'landing' | 'download'

/** Herkunft des Eintrags. `praxis` = eine der drei Praxen hat ihn in ihrer eigenen
 *  Forschung benutzt; `scout` = der nächtliche Lauf hat ihn vorgeschlagen. Die
 *  Unterscheidung steht am Eintrag, damit die Seite sie nicht behaupten muss. */
export type FoundBy = 'praxis' | 'scout' | 'frank'

/** `toVerify` heißt: aufgenommen, aber noch nicht von Hand gegengelesen — die Liste
 *  zeigt das mit „?", und Git ist die Rücknahme (Muster des Atlas-Scouts). */
export type VerifyStatus = 'verified' | 'toVerify'

export interface RegisterEntry {
  id: string
  /** Wörtlich aus der Quelle, nie umformuliert. */
  title: string
  /** Wörtlich aus der Quelle; leer, wenn die Quelle keine nennt — nicht geraten. */
  creators: string[]
  year: number | null
  publisher: string
  /** Katalog, aus dem der Nachweis stammt: 'datacite' | 'zenodo' | 'arcgis' | … */
  source: string
  /** DOI o. ä., wörtlich. */
  identifier: string
  /** Wörtlich aus der Quelle. NIE konstruiert, auch nicht aus Titel und Muster. */
  access_url: string
  access_checked: AccessChecked
  /** HTTP-Status der Prüfung, null bei Netzfehler oder ungeprüft. */
  http_status: number | null
  licence: string
  /** Felder 1–13 der gemeinsamen Themenkarte. Die Nummern sind bindend und stehen in
   *  pipelines/atlas-scout/src/atlas_scout/themen.py sowie in AtlasPage.astro (CLUSTER).
   *  Wer eine Nummer ändert, ändert die Karte. */
  fields: number[]
  /** Beschreibung aus der Quelle, unbearbeitet. */
  summary: string
  /** WARUM dieser Eintrag für die Forschung dieser Ökologie zählt — ein Satz, der sich
   *  nicht per Stichwort erzeugen lässt (Papier §4). Pflichtfeld: ohne Begründung kein
   *  Eintrag. Das ist die einzige Schranke, die gegen unbegrenztes Sammeln hilft. */
  relevance: string
  /** Welche Praxis den Eintrag benutzt oder vorgeschlagen hat: 'atelier' | 'field' |
   *  'studio'. Leer, solange nur der Scout ihn kennt. */
  cited_by: string[]
  found_by: FoundBy
  verify_status: VerifyStatus
  /** ISO-Datum der Aufnahme. */
  added: string
}

export const ENTRIES = eintraegeRaw as unknown as RegisterEntry[]

/** Klartext für den Prüfstand. Unbekannte Codes zeigen sich wörtlich, statt dass die
 *  Seite eine Bedeutung rät. */
const accessLabels: Record<AccessChecked, string> = {
  none: 'access unverified',
  landing: 'access confirmed — landing page',
  download: 'access confirmed — download',
}
export const accessLabel = (v: AccessChecked): string => accessLabels[v] ?? v

/** Lizenz-Kennungen erscheinen in Großschreibung, sonst wörtlich. Leer bleibt leer. */
export const licenceLabel = (id: string): string =>
  id ? id.toUpperCase().replace(/-/g, ' ') : 'licence not stated'

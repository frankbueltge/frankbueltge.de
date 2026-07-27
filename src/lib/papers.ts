// Paper-Katalog (/papers) — Typen und reine Hilfsfunktionen.
//
// Der zweite der beiden Kataloge, die aus derselben Suche abfallen (Frank, 2026-07-27:
// „datasets für das register und einen weiteren katalog für die sammlung von papers").
// Warum getrennt vom Register: Die Praxen zitieren ganz überwiegend PAPER, nicht
// Datensätze — gemessen am 27.07. waren von 89 je zitierten DOIs null im Dataset-Register.
// Ein Katalog, der nur Datensätze führt, hätte die Forschung nur zur Hälfte bedient.
//
// Abgrenzung zu `src/data/atelier/atlas.json` (Ulysses' Theorie-Atlas, 98 Einträge): Der
// ist die Bibliothek EINER Praxis und bleibt es. Dieser Katalog ist ökologieweit und
// vermerkt je Eintrag, WER ihn zitiert. Überschneidung ist erlaubt und wird sichtbar —
// ein Eintrag, den mehrere Praxen brauchen, ist ein stärkerer Eintrag, kein doppelter.
//
// Herkunft der Daten: pipelines/atlas-scout (praxen.py sammelt, was die Praxen zitieren;
// katalog.py löst die Kennungen bei OpenAlex bzw. arXiv auf). Committet, nicht zur
// Bauzeit geholt — kuratiert heißt klein genug fürs Repo.
import eintraegeRaw from '@/data/register/papers.json'

/** Woher der Begründungssatz stammt. `praxis` = eine Praxis hat ihn selbst geschrieben
 *  (wörtlich übernommen aus Ulysses' Atlas). `gebrauch` = der nachprüfbare Beleg, WER
 *  den Eintrag wann zitiert hat — er sagt DASS, nicht WARUM, und wartet auf die
 *  Urteilsroutine. Die Fläche macht den Unterschied sichtbar, statt ihn einzuebnen. */
export type RelevanceSource = 'praxis' | 'gebrauch'

export type VerifyStatus = 'verified' | 'toVerify'

export interface PaperEntry {
  id: string
  /** Wörtlich aus der Quelle. */
  titel: string
  urheber: string[]
  jahr: number | null
  /** Zeitschrift, Verlag, Repositorium — wörtlich; leer, wenn die Quelle nichts nennt. */
  ort: string
  /** DOI oder `arXiv:<id>`, so wie die Quelle sie selbst führt. */
  kennung: string
  /** Weitere Kennungen desselben Textes — vor allem die Preprint-Fassung neben der
   *  veröffentlichten. Beim Zusammenführen von Dubletten verschwindet keine Kennung:
   *  Wer über die arXiv-Nummer sucht, soll den Eintrag finden. */
  weitere_kennungen: string[]
  url: string
  frei_zugaenglich: boolean
  /** Felder 1–13 der gemeinsamen Themenkarte (themen.py / AtlasPage CLUSTER).
   *  Leer heißt „noch nicht eingeordnet" — nie ein geratenes Feld. */
  felder: number[]
  zusammenfassung: string
  relevanz: string
  relevanz_herkunft: RelevanceSource
  /** Welche Praxen den Eintrag zitieren: 'atelier' | 'field' | 'studio' | 'meridian'. */
  zitiert_von: string[]
  /** ISO-Datum der jüngsten Nennung — das Maß für „gerade in Arbeit". */
  zuletzt_gebraucht: string | null
  verify_status: VerifyStatus
}

export const PAPERS = eintraegeRaw as unknown as PaperEntry[]

/** Anzeigename einer Praxis. Unbekannte Schlüssel zeigen sich wörtlich, statt dass die
 *  Seite eine Zugehörigkeit rät. */
const praxisNamen: Record<string, string> = {
  atelier: 'Atelier',
  field: 'Field',
  studio: 'Studio',
  meridian: 'Meridian',
}
export const praxisLabel = (p: string): string => praxisNamen[p] ?? p

/** Autorenzeile: bis zu drei Namen, danach „et al." — gekürzt, nicht erfunden. */
export const authorLine = (urheber: string[]): string => {
  if (urheber.length === 0) return 'author not stated'
  if (urheber.length <= 3) return urheber.join(', ')
  return `${urheber.slice(0, 3).join(', ')} et al.`
}

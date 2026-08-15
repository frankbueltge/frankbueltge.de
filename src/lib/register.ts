// Dataset Register (/datasets) — Typen und reine Hilfsfunktionen.
//
// **Woher der Bestand kommt (Frank, 2026-07-28).** Am 27.07. wurde das Register auf Null
// zurückgebaut, weil 16.516 gesammelte Einträge mit der Forschung null Schnittmenge
// hatten. Danach wurden fünf Wege gemessen, Datensätze zu FINDEN — DataCite-
// Rückverweise, OpenAlex-Nachbarschaft, drei Themensuchen: 1, 0, 0, 0 und 38 unpassende
// Treffer. Kunsttheorie und Medienwissenschaft hinterlegen kaum Datensätze mit
// Verknüpfung; eine Themensuche brächte dasselbe Rauschen wie der zurückgebaute Bestand.
//
// Franks Frage beendete die Suche (Wortlaut privat): ob das Haus in den Holdings nicht
// ohnehin schon öffentliche Daten abrufe und selbst welche sammle. — Ja. 60 Datenquellen, die die
// eigenen Werke nächtlich abrufen, lagen die ganze Zeit im Repo.
//
// Dieselbe Umkehrung wie beim Paper-Katalog: nicht suchen, was es gibt, sondern lesen,
// was benutzt wird. Ein Abruf im Quelltext einer laufenden Pipeline ist dabei der
// härteste Gebrauchsbeleg überhaupt — härter als ein Zitat, denn er läuft jede Nacht.
// Die Begründung ist nicht behauptet, sie ist in Betrieb.
//
// Erzeugt von `pipelines/atlas-scout/src/atlas_scout/experiments.py`, committet.
import eintraegeRaw from '@/data/register/datasets.json'

export interface RegisterEntry {
  id: string
  /** Der `<title>` der Quelle, wörtlich (Entities aufgelöst). Fehlt einer, steht der
   *  Host da — nachprüfbar, statt dass ein Name erfunden wird. */
  titel: string
  host: string
  /** Alle im Quelltext gefundenen Adressen dieser Quelle. Nie konstruiert. */
  adressen: string[]
  /** Die geprüfte Adresse — eine echte, wo es eine gibt. */
  zugriff_url: string

  /** Bestätigt sind nur 200/203/206. HTTP 202 ist keine Bestätigung. */
  geprueft: boolean
  pruef_status: number | null
  pruef_vermerk: string | null
  /** 401/403: Die Quelle existiert, sie ist nur nicht offen. Das ist eine Eigenschaft
   *  der Quelle, kein Fehler des Registers — und für ein Register, das Zugriffswege
   *  bescheinigt, der wichtigere Unterschied gegenüber „weg". */
  zugang_gesperrt: boolean
  /** Im Code steht nur eine Vorlage mit Platzhalter (`…/winners{jahr}`), keine
   *  abrufbare Adresse. Sie zu prüfen ergäbe einen Befund über den Ausschnitt. */
  nur_vorlage: boolean

  relevanz: string
  relevanz_herkunft: 'praxis' | 'urteil' | 'gebrauch'
  weg: 'praxis' | 'scout'
  /** `benutzt` = im Betrieb abgerufen. Stärker als `zitiert`. */
  aufnahmegrund: 'benutzt' | 'zitiert' | 'kuratiert' | 'nachbarschaft'
  /** Repo-relative Pfade, in denen der Abruf steht — der Beleg. */
  fundstellen: string[]
  /** Welche Werke die Quelle abrufen. */
  benutzt_von: string[]
  verify_status: 'verified' | 'toVerify'
}

export const ENTRIES = eintraegeRaw as unknown as RegisterEntry[]

/** Klartext des Zugangsbefunds. Die vier Zustände sind bewusst getrennt: „nicht
 *  bestätigt" und „braucht Anmeldung" sind verschiedene Aussagen über eine Quelle. */
export const zugangLabel = (e: RegisterEntry): string => {
  if (e.geprueft) return `access confirmed (HTTP ${e.pruef_status})`
  if (e.zugang_gesperrt) return `exists, but gated (HTTP ${e.pruef_status})`
  if (e.nur_vorlage) return 'address is a template in code, not a fetchable URL'
  return e.pruef_status ? `no answer (HTTP ${e.pruef_status})` : 'no answer'
}

/** Anzeigename eines Werks. Unbekannte Schlüssel zeigen sich wörtlich. */
const werkNamen: Record<string, string> = {
  protokoll: 'The Protocol',
  redaction: 'Redaction',
  consensus: 'The Consensus',
  balance: 'The Balance',
  'ghost-fleet': 'Ghost Fleet',
  beifang: 'Bycatch',
  revision: 'Correction',
  irrtum: 'Error',
  'atlas-scout': 'Atlas Scout',
  scripts: 'site data scripts',
}
export const werkLabel = (w: string): string => werkNamen[w] ?? w

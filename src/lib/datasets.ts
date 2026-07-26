// Dataset Register (/datasets, /datasets/[id]) — Typen und reine Hilfsfunktionen.
//
// Datenquelle: das Repo dataset-hub (oberflaeche/generiere_index.py schreibt
// eintraege.json + meta.json aus bestand/hub.sqlite). Einmalig kopiert nach
// src/data/datasets/ (Stand: siehe meta.json → erzeugt/gebaut_am), analog zu
// src/data/atlas/werke.json. Diese Datei formatiert nur, was schon da ist — sie
// füllt keine leeren Felder und konstruiert keine URLs (Kanon-Regel, siehe
// dataset-hub/schema/SCHEMA.md und SNAPSHOT-API.md "Drei Regeln beim Lesen").
//
// Feldkürzel in eintraege.json (dataset-hub/oberflaeche/generiere_index.py):
// i=id, w=werk_id, q=quelle, p=quell_id, g=granularität, t=titel, h=herausgeber,
// j=jahr, l=lizenz-id, u=zugriffs-url (wörtlich), v=prüfstand, s=http-status, z=status.
//
// Das aktuelle Export-Schema führt kein Urheber- oder Beschreibungsfeld (nur
// Herausgeber) — Detailseiten zeigen deshalb keine "Urheber"-Zeile und kein
// JSON-LD-description, nicht weil wir sie unterschlagen, sondern weil der
// Snapshot sie (noch) nicht mitbringt.
import eintraegeRaw from '@/data/datasets/eintraege.json'
import metaRaw from '@/data/datasets/meta.json'

export type Pruefstand = 'none' | 'versucht' | 'landing' | 'download'
export type EintragStatus = 'ungeprueft' | 'geprueft' | 'markiert' | 'zurueckgezogen'

/** Schlanker Suchindex — genau die Felder, die Suche, Filter und Ergebnisliste
 *  brauchen. Zugriffs-URL, Quell-ID und Werk-Zugehörigkeit stehen bewusst NICHT hier:
 *  sie werden nur auf den Einzelseiten gebraucht und lägen sonst im Browser-Download,
 *  der mit jedem Eintrag mitwächst (details.json wird nur beim Bauen gelesen). */
export interface DatasetEntry {
  i: string
  q: string
  g: string
  t: string
  h: string
  j: number | null
  l: string
  v: Pruefstand
  s: number | null
  z: EintragStatus
}

export const ENTRIES = eintraegeRaw as unknown as DatasetEntry[]

export interface SourceWindow {
  quelle: string
  seit: string | null
  bis: string
  records: number
  vollstaendig: boolean
}

export interface DatasetMeta {
  erzeugt: string
  schema_version: string
  gebaut_am: string
  zaehler: {
    eintraege: number
    werke: number
    fundstellen: number
    abgelehnt_gesamt: number
    aufgeloest_versucht: number
    aufgeloest_bestaetigt: number
  }
  mehrfassungs_werke: number
  quellfenster: SourceWindow[]
  quellen: { quelle: string; n: number }[]
  ablehnungen: { grund: string; n: number }[]
  ablehnungen_meta: {
    ereignisse_gesamt: number
    aktuell_verworfen: number
    spaeter_doch_aufgenommen: number
  }
  ausfaelle: { datum: string; quelle: string; fehler: string; kontext: string }[]
}

export const META = metaRaw as unknown as DatasetMeta

/** Ehrliche Zugriffs-Marke — behauptet nie mehr, als tatsächlich geprüft wurde
 *  (SNAPSHOT-API.md "Drei Regeln beim Lesen"). landing/download = per HTTP bestätigt;
 *  versucht = aufgelöst, aber der Host antwortete nicht mit 2xx (ein 403 ist meist
 *  Bot-Schutz, kein toter Link — der Status steht dabei); none = noch nicht geprüft. */
export function accessLabel(v: Pruefstand, s: number | null): string {
  if (v === 'landing' || v === 'download') return 'access confirmed'
  if (v === 'versucht') return `checked, not confirmed (HTTP ${s ?? '—'})`
  return 'access unverified'
}

/** isAccessibleForFree nur setzen, wenn eine erfolgreiche HTTP-Auflösung sie stützt —
 *  sonst bleibt das JSON-LD-Feld ganz weg. Ein "versucht" (z. B. 403) sagt nichts
 *  darüber aus, ob eine Ressource frei zugänglich ist, nur dass der Host beim
 *  automatisierten Abruf nicht mit 2xx antwortete — deshalb hier bewusst kein Rateversuch. */
export function isAccessibleForFree(v: Pruefstand): true | undefined {
  return v === 'landing' || v === 'download' ? true : undefined
}

/** Fehlende Lizenz bleibt sichtbar leer benannt, nie stillschweigend weggelassen und
 *  nie ergänzt (Kanon-Regel, Auftrag Teil 3). */
export function licenceLabel(l: string): string {
  return l ? l : 'not stated'
}

/** Deterministisch aus den Feldern des Eintrags zusammengesetzt — kein Zitat der
 *  Quelle, sondern ein Formatierungsvorschlag; die Seite weist selbst darauf hin. */
export function suggestedCitation(
  e: Pick<DatasetEntry, 't' | 'h' | 'j'>,
  url: string,
): string {
  const lead = [e.h || null, e.j ? `(${e.j})` : null].filter(Boolean).join(' ')
  return `${lead ? `${lead}. ` : ''}${e.t}.${url ? ` ${url}` : ''}`
}

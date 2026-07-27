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
// j=jahr, l=lizenz-id, u=zugriffs-url (wörtlich), v=prüfstand, s=http-status, z=status,
// k=herkunft des Kernbestand-Merkmals.
//
// Seit der Neufassung des Registerzwecks (docs/design/2026-07-27-register-neufassung.md,
// §4) enthält eintraege.json NUR den Kernbestand — die kuratierte Auswahl, die die
// Themen der Ökologie trägt. Der übrige Bestand ist nicht verschwunden: er bleibt über
// den Snapshot abfragbar, den die Praxen laden, hat aber keine Seite auf dieser Domain.
// META.zaehler führt beide Größen, damit die Seite den Ausschnitt benennen kann.
//
// Das aktuelle Export-Schema führt kein Urheber- oder Beschreibungsfeld (nur
// Herausgeber) — Detailseiten zeigen deshalb keine "Urheber"-Zeile und kein
// JSON-LD-description, nicht weil wir sie unterschlagen, sondern weil der
// Snapshot sie (noch) nicht mitbringt.
import eintraegeRaw from '@/data/datasets/eintraege.json'
import metaRaw from '@/data/datasets/meta.json'
import worksRaw from '@/data/datasets/werke.json'
import listeRaw from '@/data/datasets/liste.json'

export type Pruefstand = 'none' | 'versucht' | 'landing' | 'download'
export type EintragStatus = 'ungeprueft' | 'geprueft' | 'markiert' | 'zurueckgezogen'

/** Woher das Kernbestand-Merkmal kommt: 'regel' = ein Begriff im Titel entschied
 *  deterministisch, 'urteil' = die Urteilsroutine hat den Grenzfall entschieden.
 *  Die Einzelseite sagt das, statt die Zugehörigkeit unbegründet zu behaupten. */
export type KernbestandHerkunft = 'regel' | 'urteil'

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
  k: KernbestandHerkunft
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
    /** der GANZE Bestand (Snapshot der Praxen) — nicht die Zahl der Seiten hier */
    eintraege: number
    werke: number
    fundstellen: number
    abgelehnt_gesamt: number
    aufgeloest_versucht: number
    aufgeloest_bestaetigt: number
    /** die kuratierte Auswahl, die diese Oberfläche zeigt */
    kernbestand: number
    kernbestand_regel: number
    kernbestand_urteil: number
    /** Grenzfälle, die noch auf ein Urteil warten — offener Arbeitsvorrat, nicht
     *  „verworfen". Sichtbar gemacht, damit ein unbearbeiteter Stapel nicht wie
     *  ein leerer aussieht. */
    kernbestand_grenzfaelle_offen: number
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

/** Eine Fassung innerhalb eines Werks, wie werke.json sie führt. */
export interface WorkVersion {
  i: string
  t: string
  j: number | null
  l: string
  q: string
  pv: Pruefstand
  s: number | null
  /** wörtlicher Zugriffsweg dieser Fassung, aus der Quelle — nie konstruiert */
  u: string
  /** Quell-Id (DOI o. Ä.) dieser Fassung */
  p: string
}

/** Ein Werk mit MEHREREN Fassungen. Werke mit genau einer Fassung stehen bewusst
 *  nicht in werke.json: eine Werk-Seite wäre dort eine Dublette der Eintragsseite
 *  und schüfe genau das Problem, das die Werk-Ebene löst (5.127 der 8.579 Werke
 *  hatten zwei Fassungen — 10.254 paarweise fast identische Seiten). */
export interface DatasetWork {
  /** Titel des Vertreters */
  t: string
  h: string
  /** Eintrags-Id des Vertreters */
  v: string
  /** woher der Vertreter kommt: 'quelle' = die Fassungen zeigen selbst auf ihn
   *  (IsPreviousVersionOf/IsVersionOf/IsIdenticalTo), 'juengster' = niemand zeigt,
   *  also entschied das Jahr. Der Unterschied steht auf der Seite: welche Fassung
   *  die aktuelle ist, behauptet das Register nicht von sich aus. */
  vg: 'quelle' | 'juengster'
  n: number
  /** Felder, in denen die Fassungen einander widersprechen (Lizenz, Herausgeber) —
   *  benannt statt geglättet. */
  abw: string[]
  f: WorkVersion[]
}

export const WORKS = worksRaw as unknown as Record<string, DatasetWork>

/** Eine Zeile der Registerliste = eine INDEXIERBARE Seite, nicht ein Eintrag.
 *  Entweder ein Werk mit mehreren Fassungen (`w: 1`, Adresse /datasets/work/<i>)
 *  oder ein Eintrag ohne Geschwister (`w: 0`, Adresse /datasets/<i>). Ohne diese
 *  Unterscheidung stünden 24 Zeilen mit demselben Titel in der Liste, die alle auf
 *  dieselbe Werk-Seite zeigen. */
export interface ListRow extends DatasetEntry {
  /** 1 = Werk-Seite, 0 = Eintragsseite */
  w: 0 | 1
  /** Zahl der Fassungen (1 bei Eintragsseiten) */
  n: number
  /** Felder, in denen die Fassungen einander widersprechen — oder null */
  abw: string[] | null
}

export const LISTE = listeRaw as unknown as ListRow[]

/** Adresse einer Listenzeile — Werk oder Eintrag. Nie andernorts zusammensetzen:
 *  ein Verweis auf die Fassungsseite eines Mehrfassungs-Werks zeigt auf eine Seite,
 *  die selbst sagt, dass sie nicht die kanonische ist. */
export function rowHref(r: Pick<ListRow, 'i' | 'w'>): string {
  return r.w ? `/datasets/work/${r.i}` : `/datasets/${r.i}`
}

/** Eintrags-Id → Werk-Id, aber NUR für Werke mit mehreren Fassungen. Damit weiß
 *  eine Fassungsseite, wohin ihr canonical zeigt; Einträge ohne Geschwister
 *  bleiben ihre eigene kanonische Adresse. */
export const WORK_OF_ENTRY: Record<string, string> = Object.fromEntries(
  Object.entries(WORKS).flatMap(([werkId, w]) => w.f.map((v) => [v.i, werkId])),
)

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

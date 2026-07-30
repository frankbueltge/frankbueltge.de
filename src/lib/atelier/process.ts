// src/lib/atelier/process.ts — der Weg einer Frage durch die Praxis, aus den committeten
// Projektakten abgeleitet.
//
// Warum (Frank, 2026-07-30): „/atelier/projects hat zwar ausführliche TRACE und SCORE, aber
// es fehlt ein Diagramm, das einem den gesamten Prozess auf einen Blick verständlich macht
// — niemand liest diese ellenlangen Texte." Die Akten sind die Tiefe; diese Datei liefert
// die Vogelperspektive darüber.
//
// ALLES hier ist Ableitung aus committeten Dateien, keine Erzählung: der Ausgang steht als
// `disposition` in der SCORE-Frontmatter, die erreichten Stationen sind die vorhandenen
// Aktenstücke, die Züge sind Journaleinträge, deren Dateiname den Namen der Linie trägt.
// Nichts wird geschätzt; was sich nicht zuordnen lässt, wird als solches ausgewiesen.

/** Die vier Ausgänge, die die Praxis selbst kennt (Protokoll v5 §7 + DECISION.md), plus
 * `OPEN` für eine Linie, über die noch nicht geurteilt wurde.
 *
 * WICHTIG für die Farbwahl: Das sind Identitäten, KEINE Statusfarben. Ein abgebrochenes
 * Vorhaben ist in dieser Praxis kein Fehlschlag — die Symmetrieregel des Protokolls sagt
 * ausdrücklich „closing costs what continuing costs". Ein rotes Warndreieck auf KILL würde
 * die Ethik der Praxis in ihrer eigenen Darstellung verfälschen. */
export type Ausgang = 'PUBLISH' | 'PUBLICATION_CANDIDATE' | 'ARCHIVE_AS_STUDY' | 'KILL' | 'OPEN'

export const AUSGAENGE: Ausgang[] = ['PUBLISH', 'PUBLICATION_CANDIDATE', 'ARCHIVE_AS_STUDY', 'KILL', 'OPEN']

/** Die Aktenstücke, die eine Linie im Lauf ihres Weges anlegt. Reihenfolge = Weg:
 * eine Frage (SCORE), ihre Züge (TRACE), die Offenlegung des Apparats, die Exposition,
 * das Urteil (DECISION). Protokoll v5 §7: Ein Veröffentlichungskandidat braucht APPARATUS
 * und EXPOSITION — deshalb sind genau diese fünf die Stationen und nicht irgendwelche. */
export const STATIONEN = ['SCORE', 'TRACE', 'APPARATUS', 'EXPOSITION', 'DECISION'] as const
export type Station = (typeof STATIONEN)[number]

export interface RohProjekt {
  id: string
  title: string
  status: string
  disposition: string
  created: string
  /** Dateinamen der Akte, wie sie im Repo liegen (z. B. 'SCORE.md'). */
  dateien: string[]
}

export interface Linie {
  id: string
  title: string
  /** Der Namensteil ohne Datumspräfix — er verbindet Linie und Journaleinträge. */
  name: string
  created: string
  ausgang: Ausgang
  aktiv: boolean
  stationen: Record<Station, boolean>
  /** Journaleinträge, deren Dateiname mit dem Namen dieser Linie beginnt. */
  zuege: number
  /** Die Tage, an denen ein Zug geschrieben wurde — die Figur setzt daraus die Striche
   * auf dem Band. Aufsteigend, Mehrfachnennung möglich (zwei Züge an einem Tag). */
  zugTage: string[]
  letzterZug: string | null
  /** Tage von der Eröffnung bis zum letzten Zug (bzw. bis heute, solange sie läuft). */
  tage: number
}

export interface Prozessbild {
  linien: Linie[]
  /** Zählwerk pro Ausgang, in fester Reihenfolge — die Legende liest daraus. */
  haefen: Array<{ ausgang: Ausgang; anzahl: number }>
  /** Journaleinträge seit der ersten Linie, die zu keiner Linie gehören: Sitzungen,
   * Protokollwechsel, Begegnungen. Sie werden ausgewiesen, nicht unterschlagen — sonst
   * sähe die Figur so aus, als sei die ganze Arbeit in Linien aufgegangen. */
  ohneLinie: number
  /** Stand der Ableitung (Bau-Datum) — eine laufende Linie altert, das Bild muss es sagen. */
  stand: string
}

const TAG = 86_400_000

function tage(vonIso: string, bisIso: string): number {
  const von = Date.parse(`${vonIso}T00:00:00Z`)
  const bis = Date.parse(`${bisIso}T00:00:00Z`)
  if (Number.isNaN(von) || Number.isNaN(bis)) return 0
  return Math.max(0, Math.round((bis - von) / TAG))
}

/** '2026-07-23-negative-parallax' → 'negative-parallax' */
export function nameOhneDatum(id: string): string {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

/** 'journal/2026-07-30-negative-parallax-an-illustrative-example' → { datum, rest } */
export function zerlegeJournalId(id: string): { datum: string; rest: string } | null {
  const m = /(?:^|\/)(\d{4}-\d{2}-\d{2})-(.+?)(?:\.md)?$/.exec(id)
  return m ? { datum: m[1], rest: m[2] } : null
}

function alsAusgang(disposition: string, status: string): Ausgang {
  const d = disposition.trim().toUpperCase()
  if ((AUSGAENGE as string[]).includes(d) && d !== 'OPEN') return d as Ausgang
  // Kein Urteil in der Akte: Solange die Linie läuft, ist das der ehrliche Zustand „offen".
  // Eine geschlossene Linie ohne Urteil gibt es nach Protokoll nicht — wir zeigen sie
  // trotzdem als offen, statt ihr eines zu erfinden.
  return 'OPEN'
}

/** Baut das Prozessbild. `journalIds` sind die IDs der Journal-Einträge (mit oder ohne
 * Präfix 'journal/'), `heute` das Bau-Datum als YYYY-MM-DD. */
export function baueProzessbild(projekte: RohProjekt[], journalIds: string[], heute: string): Prozessbild {
  const linien: Linie[] = projekte
    .filter((p) => p.created)
    .map((p) => {
      const name = nameOhneDatum(p.id)
      const stationen = Object.fromEntries(
        STATIONEN.map((s) => [s, p.dateien.some((d) => d.toUpperCase() === `${s}.MD`)]),
      ) as Record<Station, boolean>
      return {
        id: p.id,
        title: p.title || p.id,
        name,
        created: p.created,
        ausgang: alsAusgang(p.disposition, p.status),
        aktiv: p.status.trim().toUpperCase() === 'ACTIVE',
        stationen,
        zuege: 0,
        zugTage: [] as string[],
        letzterZug: null as string | null,
        tage: 0,
      }
    })
    .sort((a, b) => (a.created === b.created ? a.id.localeCompare(b.id) : a.created.localeCompare(b.created)))

  // Zuordnung der Züge. Der längste passende Name gewinnt, damit ein Präfix wie
  // 'negative-parallax' einer hypothetischen Linie 'negative-parallax-ii' nicht die
  // Einträge wegnimmt.
  const nachLaenge = [...linien].sort((a, b) => b.name.length - a.name.length)
  const frueheste = linien[0]?.created ?? heute
  let ohneLinie = 0

  for (const jid of journalIds) {
    const teile = zerlegeJournalId(jid)
    if (!teile || teile.datum < frueheste) continue
    const treffer = nachLaenge.find((l) => teile.rest.startsWith(l.name))
    if (!treffer) {
      ohneLinie++
      continue
    }
    treffer.zuege++
    treffer.zugTage.push(teile.datum)
    if (!treffer.letzterZug || teile.datum > treffer.letzterZug) treffer.letzterZug = teile.datum
  }

  for (const l of linien) {
    l.zugTage.sort()
    const bis = l.aktiv ? heute : (l.letzterZug ?? l.created)
    l.tage = tage(l.created, bis)
  }

  const haefen = AUSGAENGE.map((ausgang) => ({
    ausgang,
    anzahl: linien.filter((l) => l.ausgang === ausgang).length,
  })).filter((h) => h.anzahl > 0)

  return { linien, haefen, ohneLinie, stand: heute }
}

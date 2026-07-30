// src/lib/partitur.ts
// Datenlage der Partitur auf /maschinenraum: vier Stimmen (Praktiken), jede gelandete
// Session eine Marke auf der gemeinsamen Zeitachse. Ausschließlich committete Spiegel —
// dieselbe Ehrlichkeitsregel wie die Seite selbst: die Achse endet am letzten GELANDETEN
// Tag, nie an „heute"; jede Stimme trägt ihr eigenes as-of. Pure Funktionen; die
// Astro-Seite reicht Globs und Chroniken herein (wie in maschinenraum.ts).

export type VoiceId = 'atelier' | 'field' | 'studio' | 'plenum'

/** Markentypus — Vorrang bei Tagesbündeln: fail > work > session. */
export type Glyph = 'session' | 'work' | 'fail'

export interface ScoreEvent {
  voice: VoiceId
  /** YYYY-MM-DD */
  date: string
  glyph: Glyph
  /** Session-Nummer aus der Chronik; Journale tragen keine */
  session: number | null
  move: string | null
  verdict: string | null
  /** die Klartext-Zeile: Chronik-Summary, erste Journalzeile oder Linien-Titel */
  text: string
}

/** Ein Tag einer Stimme — mehrere Landungen am selben Tag bleiben einzeln erhalten. */
export interface DayCluster {
  voice: VoiceId
  date: string
  events: ScoreEvent[]
  /** das Gesicht des Bündels: schwerste Marke gewinnt (fail > work > session) */
  glyph: Glyph
}

export interface VoiceLane {
  voice: VoiceId
  clusters: DayCluster[]
  /** Datum der letzten Landung dieser Stimme — das ehrliche as-of */
  asOf: string | null
  /** Landungen gesamt (Events, nicht Tage) */
  count: number
}

export interface ScoreModel {
  lanes: VoiceLane[]
  /** lückenlose Tagesachse von erster bis letzter Landung (inklusive) */
  days: string[]
  start: string
  end: string
}

const VOICE_ORDER: VoiceId[] = ['atelier', 'field', 'studio', 'plenum']
const GLYPH_RANK: Record<Glyph, number> = { fail: 2, work: 1, session: 0 }
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
/** Schutz gegen kaputte Datumswerte: mehr als ~1 Jahr Achse wäre ein Datenfehler. */
const MAX_DAYS = 400

const stripMd = (s: string): string =>
  s
    .replace(/^#+\s*/, '')
    .replace(/\*\*?/g, '')
    .replace(/`/g, '')
    .trim()

/** Lückenlose Tagesliste [start..end]; leere Liste bei ungültigen/verdrehten Grenzen. */
export function dayRange(start: string, end: string): string[] {
  if (!DATE_RE.test(start) || !DATE_RE.test(end) || start > end) return []
  const out: string[] = []
  const d = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  while (d <= stop && out.length <= MAX_DAYS) {
    out.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

/** Minimalform der gemergten Chronik-Einträge (field/studio loadChronicle()). */
export interface ChronicleEventSource {
  date: string
  collective_session: number | null
  move: string
  summary: string
  verdict: string | null
  works: string[]
  fail: boolean
}

/** Chronik → Events: fail-Flag schlägt Werkberührung schlägt gewöhnliche Session. */
export function chronicleEvents(entries: ChronicleEventSource[], voice: VoiceId): ScoreEvent[] {
  return entries
    .filter((e) => DATE_RE.test(e.date))
    .map((e) => ({
      voice,
      date: e.date,
      glyph: (e.fail || e.verdict === 'fail'
        ? 'fail'
        : e.works.length > 0 || e.move === 'ship'
          ? 'work'
          : 'session') as Glyph,
      session: e.collective_session,
      move: e.move || null,
      verdict: e.verdict,
      text: e.summary.trim(),
    }))
}

/** journal/*.md-Glob (?raw) → ein Event je datumspräfigierter Datei; erste Überschrift
 *  oder erste nicht-leere Zeile als Text (wie latestJournal in maschinenraum.ts). */
export function journalEvents(raw: Record<string, string>, voice: VoiceId): ScoreEvent[] {
  return Object.entries(raw)
    .map(([path, content]): ScoreEvent | null => {
      const base = path.split('/').pop() ?? ''
      const date = base.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
      if (!date) return null
      const line =
        content.split('\n').find((l) => l.trim().startsWith('#')) ??
        content.split('\n').find((l) => l.trim() !== '') ??
        ''
      return {
        voice,
        date,
        glyph: 'session' as Glyph,
        session: null,
        move: null,
        verdict: null,
        text: stripMd(line),
      }
    })
    .filter((e): e is ScoreEvent => e !== null)
}

const fmField = (fm: string, k: string): string | undefined =>
  fm.match(new RegExp(`^${k}:\\s*"?([^"#\\n]+?)"?\\s*(#.*)?$`, 'm'))?.[1]?.trim() || undefined

/** SCORE-Frontmatter der Atelier-Projekte → „Linie eröffnet"-Marken (glyph work). */
export function scoreOpenings(scoresRaw: Record<string, string>): ScoreEvent[] {
  const out: ScoreEvent[] = []
  for (const raw of Object.values(scoresRaw)) {
    const fm = raw.split('\n---')[0]
    const created = fmField(fm, 'created')
    if (!created || !DATE_RE.test(created)) continue
    const kind = fmField(fm, 'kind') ?? fmField(fm, 'sub_kind') ?? 'project'
    out.push({
      voice: 'atelier',
      date: created,
      glyph: 'work',
      session: null,
      move: `${kind} opened`,
      verdict: null,
      text: fmField(fm, 'title') ?? created,
    })
  }
  return out
}

/** Startdatum einer Joint Inquiry: früheste SCORE-created mit passender encounter_ref. */
export function jiStart(scoresRaw: Record<string, string>, id: string): string | null {
  let min: string | null = null
  for (const raw of Object.values(scoresRaw)) {
    const fm = raw.split('\n---')[0]
    if (fmField(fm, 'encounter_ref') !== id) continue
    const created = fmField(fm, 'created')
    if (created && DATE_RE.test(created) && (min === null || created < min)) min = created
  }
  return min
}

/** Fenster für den Hub-Teaser: nur Events der letzten n Tage VOR der jüngsten Landung —
 *  relativ zum Archivende, nie zu „heute" (die Achse bleibt eine Aussage über Gelandetes). */
export function clampToLastDays(events: ScoreEvent[], n: number): ScoreEvent[] {
  const valid = events.filter((e) => DATE_RE.test(e.date))
  const end = valid.map((e) => e.date).sort().at(-1)
  if (!end || n < 1) return []
  const d = new Date(`${end}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (n - 1))
  const start = d.toISOString().slice(0, 10)
  return valid.filter((e) => e.date >= start)
}

/** Events → Partitur: je Stimme Tagesbündel, gemeinsame Achse, ehrliche as-ofs. */
export function buildScore(events: ScoreEvent[]): ScoreModel | null {
  const valid = events.filter((e) => DATE_RE.test(e.date))
  if (valid.length === 0) return null
  const dates = valid.map((e) => e.date).sort()
  const start = dates[0]
  const end = dates[dates.length - 1]
  const days = dayRange(start, end)
  if (days.length === 0) return null

  const lanes: VoiceLane[] = VOICE_ORDER.map((voice) => {
    const mine = valid
      .filter((e) => e.voice === voice)
      .sort((a, b) => a.date.localeCompare(b.date) || GLYPH_RANK[b.glyph] - GLYPH_RANK[a.glyph])
    const byDay = new Map<string, ScoreEvent[]>()
    for (const e of mine) {
      const bucket = byDay.get(e.date)
      if (bucket) bucket.push(e)
      else byDay.set(e.date, [e])
    }
    const clusters: DayCluster[] = [...byDay.entries()].map(([date, evs]) => ({
      voice,
      date,
      events: evs,
      glyph: evs.reduce<Glyph>((g, e) => (GLYPH_RANK[e.glyph] > GLYPH_RANK[g] ? e.glyph : g), 'session'),
    }))
    return {
      voice,
      clusters,
      asOf: mine.length ? mine[mine.length - 1].date : null,
      count: mine.length,
    }
  })

  return { lanes, days, start, end }
}

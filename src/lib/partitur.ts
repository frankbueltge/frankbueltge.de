// src/lib/partitur.ts
// Data layer for the score on /maschinenraum: four voices (practices), every landed
// session a mark on the shared time axis. Committed mirrors only — the same honesty
// rule as the page itself: the axis ends on the last LANDED day, never on "today";
// each voice carries its own as-of. Pure functions; the Astro pages pass in their
// globs and chronicles (as in maschinenraum.ts).

import { dayRange as geometryDayRange } from '@/lib/dataviz/geometry'

export type VoiceId = 'atelier' | 'field' | 'studio' | 'plenum'

/** mark type — precedence within day clusters: fail > work > session */
export type Glyph = 'session' | 'work' | 'fail'

export interface ScoreEvent {
  voice: VoiceId
  /** YYYY-MM-DD */
  date: string
  glyph: Glyph
  /** session number from the chronicle; journals carry none */
  session: number | null
  move: string | null
  verdict: string | null
  /** the plain-language line: chronicle summary, first journal line, or line title */
  text: string
}

/** One day of one voice — multiple landings on the same day are kept individually. */
export interface DayCluster {
  voice: VoiceId
  date: string
  events: ScoreEvent[]
  /** the cluster's face: the heaviest mark wins (fail > work > session) */
  glyph: Glyph
}

export interface VoiceLane {
  voice: VoiceId
  clusters: DayCluster[]
  /** date of this voice's last landing — the honest as-of */
  asOf: string | null
  /** total landings (events, not days) */
  count: number
}

export interface ScoreModel {
  lanes: VoiceLane[]
  /** gapless day axis from first to last landing (inclusive) */
  days: string[]
  start: string
  end: string
}

const VOICE_ORDER: VoiceId[] = ['atelier', 'field', 'studio', 'plenum']

/**
 * Who each lane is, and the room it leads into. Moved out of the score component on 2026-08-02,
 * when the lane labels themselves became links: an href that decides where a reader lands is data,
 * and data in this repo is testable (partitur.test.ts checks every voice has a house).
 *
 * `href` is the voice's OWN room, not a guided tour — the score's detail panel has always opened
 * these ("open the log →"), and one voice must not lead two different ways from one figure.
 * The Plenum's room is /plenum: it is a guest here (data-snack.com's resident collective), it has
 * no door on the hub, and its lane is the one place on the entrance where its voice sounds — so
 * the lane is where it gets linked.
 */
export const VOICE_META: Record<VoiceId, { label: string; short: string; href: string }> = {
  atelier: { label: 'Atelier · Ulysses', short: 'atelier', href: '/atelier/journal' },
  field: { label: 'Field · Meridian', short: 'field', href: '/field' },
  studio: { label: 'Studio · Ensemble', short: 'studio', href: '/studio' },
  plenum: { label: 'Plenum · data-snack', short: 'plenum', href: '/plenum' },
}
const GLYPH_RANK: Record<Glyph, number> = { fail: 2, work: 1, session: 0 }
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const stripMd = (s: string): string =>
  s
    .replace(/^#+\s*/, '')
    .replace(/\*\*?/g, '')
    .replace(/`/g, '')
    .trim()

/** Gapless day list [start..end]; empty list on invalid or reversed bounds. One-line wrapper
 *  around dataviz/geometry.ts's consolidated dayRange, keeping this module's historical
 *  contract (validate, empty on invalid/reversed, cap at 400 days) byte-identical. */
export function dayRange(start: string, end: string): string[] {
  return geometryDayRange(start, end, { onInvalid: 'empty', maxDays: 400 })
}

/** Minimal shape of the merged chronicle entries (field/studio loadChronicle()). */
export interface ChronicleEventSource {
  date: string
  collective_session: number | null
  move: string
  summary: string
  verdict: string | null
  works: string[]
  fail: boolean
}

/** Chronicle → events: the fail flag beats work contact beats a plain session. */
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

/** journal/*.md glob (?raw) → one event per date-prefixed file; first heading or
 *  first non-empty line as text (mirrors latestJournal in maschinenraum.ts). */
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

/** SCORE frontmatter of the atelier projects → "line opened" marks (glyph work). */
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

/** Start date of a joint inquiry: earliest SCORE `created` with a matching encounter_ref. */
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

/** Window for the hub teaser: only events within the last n days BEFORE the newest
 *  landing — relative to the archive's end, never to "today" (the axis remains a
 *  statement about what has landed). */
export function clampToLastDays(events: ScoreEvent[], n: number): ScoreEvent[] {
  const valid = events.filter((e) => DATE_RE.test(e.date))
  const end = valid.map((e) => e.date).sort().at(-1)
  if (!end || n < 1) return []
  const d = new Date(`${end}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (n - 1))
  const start = d.toISOString().slice(0, 10)
  return valid.filter((e) => e.date >= start)
}

// ── Mark-cluster layout ──────────────────────────────────────────────────────
// Shared between the server-side SVG layout (Partitur.astro's frontmatter) and the client's
// hover/nearest-mark resolution (its inline script) — until this port these existed as two
// hand-kept-in-sync copies, one per side.

/** Within-day mark offsets for a cluster of ≤3 landings: up to three are drawn individually,
 *  spread evenly around the day's x position; a denser cluster collapses to one face mark + ×n
 *  instead (see `fanOffsets` for that dense case's lens-expanded, per-landing form). */
export const MARK_OFFSETS: Record<number, number[]> = { 1: [0], 2: [-6.5, 6.5], 3: [-9, 0, 9] }

/** Even spread for a fanned-out dense day (the time lens's expanded view, n > 3 landings),
 *  centered on 0 — the dense-cluster counterpart to `MARK_OFFSETS`. */
export function fanOffsets(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * 11)
}

/**
 * Resolves which mark within a cluster's offsets sits nearest a given pointer position, in the
 * cluster's own local x frame (`localDx` = pointer x minus the cluster's own center) — the
 * tooltip fix (Frank, 2026-07-31): "nobody hits a 9px dot reliably", so hovering ANYWHERE within
 * a cluster's hit band resolves to the CLOSEST mark by pointer distance, never just the first.
 * On an exact tie the earlier offset wins (strict `<`, not `<=`) — a deterministic, if arbitrary,
 * tiebreak rather than an unspecified one.
 */
export function nearestMarkOffset(offsets: readonly number[], localDx: number): number {
  let best = Infinity
  let mi = 0
  offsets.forEach((dx, i) => {
    const dist = Math.abs(localDx - dx)
    if (dist < best) {
      best = dist
      mi = i
    }
  })
  return mi
}

/** Events → score: day clusters per voice, shared axis, honest as-ofs. */
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

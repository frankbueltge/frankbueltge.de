// src/lib/ecology/score.ts — THE SCORE: the research ecology since v3, drawn as music is written.
//
// Design handoff of 2026-10-11 (docs/design_handoff_homepage_ecology/README.md §4 and §5). Three
// staves, one per practice; one bar per night since the order of 2026-08-30 came into force; a
// notehead for every session a practice's journal holds, filled when that night left a work or
// an artifact; a bar in the practice's colour where it presented; and the Middle's relations —
// who built on, answered or noted whom — as slurs between the staves. A cycle is the stretch
// between two heavy barlines, numbered like a rehearsal mark.
//
// This module is the whole geometry of that drawing and of each practice's own PART (its
// sessions between what it took from its siblings and what they took from it). It is pure: it reads no file and no clock, takes
// plain records, and returns numbers — so every position on the page can be re-derived in a test
// from the same committed records, and the component that renders it decides nothing.
//
// TWO HOUSE RULES IT KEEPS
//   · The ruler ends at the newest record, never at "today": `until` is handed in by the caller
//     as the last day any record names (lastDay), and the dashed line the drawing calls today is
//     that day's end. A build never reads the clock.
//   · A day belongs to the cycle that OPENED on it. A cycle's `closed` is the day the next one
//     opened, so the half-open interval [opened, closed) gives every day exactly one cycle and
//     the day between two cycles to the later one — the rule for slurs, and for a session whose
//     note names no cycle. A session whose note does name one belongs to that cycle, and a
//     session of a convening to none (2026-10-17: the days of a cycle also hold the convening
//     after it, and the calendar counted those sessions as the cycle's).

import type { RelayKind } from '@/lib/ecology/relay'
import type { PracticeId } from '@/lib/ecology/v3'

const DAY_MS = 86_400_000

/** Days since the epoch for an ISO day — the unit every position is computed in. */
export const dayNumber = (iso: string): number => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY_MS)
export const isoDay = (n: number): string => new Date(n * DAY_MS).toISOString().slice(0, 10)
export const dayAfter = (iso: string): string => isoDay(dayNumber(iso) + 1)
export const dayBefore = (iso: string): string => isoDay(dayNumber(iso) - 1)

/** The newest of a set of ISO days; throws on an empty set, because a ruler needs an end. */
export function lastDay(days: Iterable<string | null | undefined>): string {
  let best: string | null = null
  for (const d of days) if (d && (!best || d > best)) best = d
  if (!best) throw new Error('score: no record names a day — there is nothing to end the ruler on')
  return best
}

// ── the records the score is drawn from ──────────────────────────────────────────────────────

export interface ScoreCycle {
  n: number
  opened: string
  /** the day the next cycle opened; null while this one runs */
  closed: string | null
  question: string | null
}

export interface ScoreSession {
  practice: PracticeId
  date: string
  title: string
  href: string
  /** The cycle the session's own note names — null for a session of a convening. Left out, the
   *  note takes the cycle its day falls in. (record.ts, sessionCycle; 2026-10-17) */
  cycle?: number | null
  /** What the record ties to this session: the pieces it left, and the long work it advanced.
   *  Left out, the session is filled only by the day's count of untied pieces (piecesPerDay). */
  pieces?: readonly string[]
}

/** A dated work or artifact — what fills a notehead. Presentations are not pieces: they have a
 *  mark of their own. */
export interface ScorePiece {
  practice: PracticeId
  date: string
  title: string
}

export interface ScorePresentation {
  practice: PracticeId
  cycle: number
  /** the day the presentation's own summary names, or null where it names none */
  date: string | null
}

export interface ScoreRelation {
  id: string
  date: string
  giver: PracticeId
  taker: PracticeId
  kind: RelayKind
  what: string
}

export interface ScoreInput {
  /** the first day of the ruler — the day the order came into force */
  since: string
  /** the last day of the ruler — the newest day any record names (lastDay) */
  until: string
  cycles: readonly ScoreCycle[]
  sessions: readonly ScoreSession[]
  pieces: readonly ScorePiece[]
  presentations: readonly ScorePresentation[]
  relations: readonly ScoreRelation[]
  /** the convening the relay records, where it records one: the day it opened */
  convening?: { after: number; opened: string } | null
}

// ── the day ruler ────────────────────────────────────────────────────────────────────────────

export interface DayAxis {
  since: string
  until: string
  /** how many days the ruler holds, both ends included */
  days: number
  /** the width of one day */
  unit: number
  /** x of a day: `at` 0 is its left edge, 0.5 its middle, 1 its right edge */
  x: (iso: string, at?: number) => number
}

export function dayAxis(since: string, until: string, left: number, width: number): DayAxis {
  const first = dayNumber(since)
  const days = Math.max(1, dayNumber(until) - first + 1)
  const unit = width / days
  return { since, until, days, unit, x: (iso, at = 0.5) => left + (dayNumber(iso) - first + at) * unit }
}

/** Where a cycle ends on the ruler: the day the next one opened, or the day after the ruler's
 *  last for the running cycle. */
export const cycleEnd = (cycle: ScoreCycle, until: string): string => cycle.closed ?? dayAfter(until)

/** The cycle a day belongs to — the one that opened on or before it and had not closed (see the
 *  head of this file) — or null for a day outside every cycle. */
export function cycleOn(date: string, cycles: readonly ScoreCycle[], until: string): ScoreCycle | null {
  return cycles.find((c) => date >= c.opened && date < cycleEnd(c, until)) ?? null
}

/** A tick on the first day and on every Monday after the first few days — a week ruler. */
function weekTicks(axis: DayAxis): { x: number; date: string }[] {
  const first = dayNumber(axis.since)
  const out: { x: number; date: string }[] = []
  for (let i = 0; i < axis.days; i++) {
    const iso = isoDay(first + i)
    const monday = new Date(`${iso}T00:00:00Z`).getUTCDay() === 1
    if (i === 0 || (monday && i > 3)) out.push({ x: axis.x(iso), date: iso })
  }
  return out
}

const r1 = (n: number): number => Math.round(n * 10) / 10

// ── the full score (/ecology) ────────────────────────────────────────────────────────────────

/** The handoff's own measures, in the units of a 1312 × 336 drawing. */
export const SCORE = {
  width: 1312,
  height: 336,
  /** where the staves begin and how wide the ruler is — the names stand to the left of it */
  left: 150,
  plot: 1140,
  /** top line of each stave, in the house order of the practices */
  tops: { field: 78, atelier: 162, studio: 246 } as Record<PracticeId, number>,
  /** distance between two lines of a stave; a stave has five */
  step: 6,
  barTop: 72,
  barBottom: 276,
  /** a caption fits beside a rehearsal number only in a cycle at least this wide */
  captionMin: 130,
} as const

const STAVE_LINES = 5
export const ORDER: readonly PracticeId[] = ['field', 'atelier', 'studio']

export interface ScoreNote {
  practice: PracticeId
  date: string
  x: number
  y: number
  /** that night left a work or an artifact */
  filled: boolean
  /** the cycle the day belongs to, or null outside every cycle */
  cycle: number | null
  title: string
  href: string
}

export interface ScoreSlur {
  id: string
  date: string
  giver: PracticeId
  taker: PracticeId
  kind: RelayKind
  /** the curve, from the giver's stave to the taker's */
  d: string
  /** where a readout anchors: the curve's x and its upper end */
  x: number
  y: number
  cycle: number | null
  what: string
}

export interface ScoreBand {
  cycle: number
  x: number
  width: number
  question: string | null
  /** wide enough for the question beside its number */
  captioned: boolean
  running: boolean
}

export interface ScoreModel {
  width: number
  height: number
  axis: DayAxis
  staves: { practice: PracticeId; top: number; lines: number[] }[]
  bands: ScoreBand[]
  /** a heavy line where a cycle opens, a light one where the ruler ends */
  barlines: { x: number; heavy: boolean }[]
  ticks: { x: number; date: string }[]
  notes: ScoreNote[]
  slurs: ScoreSlur[]
  /** a practice's presentation, at the end of the day it was presented */
  presentations: { practice: PracticeId; cycle: number; date: string; x: number; y: number }[]
  /** the right edge of the ruler's last day */
  endX: number
  convening: { after: number; x: number; width: number } | null
}

/** Sessions of one practice in the ruler, with their place in their day's stack. */
function stacked(sessions: readonly ScoreSession[], practice: PracticeId, since: string, until: string) {
  const perDay = new Map<string, number>()
  return sessions
    .filter((s) => s.practice === practice && s.date >= since && s.date <= until)
    .map((s) => {
      const index = perDay.get(s.date) ?? 0
      perDay.set(s.date, index + 1)
      return { session: s, index }
    })
}

/** The pieces each practice landed on each day, in input order: `practice|date` → titles. */
function piecesPerDay(pieces: readonly ScorePiece[]): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const p of pieces) out.set(`${p.practice}|${p.date}`, [...(out.get(`${p.practice}|${p.date}`) ?? []), p.title])
  return out
}

/**
 * The piece each session of the ruler left, or null — by session, in the order `stacked` walks
 * them. A session the record ties a piece to carries it (ScoreSession.pieces); the pieces no
 * session claims are counted on their day as they always were, filling that day's unclaimed
 * sessions in order. Until 2026-10-17 the count was all there was: it drew a Studio night that
 * advanced the long work without leaving a new folder as a night without a work, and on a day of
 * several sessions it gave the first notes the day's pieces, whichever session made them.
 */
function piecesOfSessions(
  sessions: readonly ScoreSession[],
  pieces: readonly ScorePiece[],
  practice: PracticeId,
  since: string,
  until: string,
): Map<ScoreSession, string | null> {
  const untied = piecesPerDay(pieces.filter((p) => p.practice === practice))
  const used = new Map<string, number>()
  const out = new Map<ScoreSession, string | null>()
  for (const { session } of stacked(sessions, practice, since, until)) {
    const own = session.pieces?.[0]
    if (own !== undefined) {
      out.set(session, own)
      continue
    }
    const key = `${practice}|${session.date}`
    const k = used.get(key) ?? 0
    const piece = untied.get(key)?.[k] ?? null
    if (piece !== null) used.set(key, k + 1)
    out.set(session, piece)
  }
  return out
}

export function buildScore(input: ScoreInput): ScoreModel {
  const axis = dayAxis(input.since, input.until, SCORE.left, SCORE.plot)
  const cycles = [...input.cycles].sort((a, b) => a.n - b.n)
  const cycleNo = (date: string) => cycleOn(date, cycles, input.until)?.n ?? null

  const notes: ScoreNote[] = []
  for (const practice of ORDER) {
    const left = piecesOfSessions(input.sessions, input.pieces, practice, input.since, input.until)
    for (const { session, index } of stacked(input.sessions, practice, input.since, input.until)) {
      notes.push({
        practice,
        date: session.date,
        x: r1(axis.x(session.date)),
        // on the stave's lowest space, each further session of the day a little higher
        y: r1(SCORE.tops[practice] + 21 - index * 4.5),
        filled: left.get(session) != null,
        // the cycle the note's own label names, where the record hands one in (a session of a
        // convening belongs to none); the cycle its day falls in otherwise
        cycle: session.cycle !== undefined ? session.cycle : cycleNo(session.date),
        title: session.title,
        href: session.href,
      })
    }
  }

  // The slurs of one day fan out a little to either side of the day's middle, alternating the
  // side they bow to, so a night of a dozen relations stays a bundle of separate lines.
  const perDay = new Map<string, number>()
  const slurs: ScoreSlur[] = []
  for (const r of input.relations) {
    if (r.date < input.since || r.date > input.until) continue
    const k = (perDay.get(r.date) ?? 0) + 1
    perDay.set(r.date, k)
    const x = axis.x(r.date) + ((k % 6) - 2.5) * 2.4
    const y1 = SCORE.tops[r.giver] + 12
    const y2 = SCORE.tops[r.taker] + 12
    const bulge = (10 + Math.abs(y2 - y1) * 0.09) * (k % 2 ? 1 : -1)
    slurs.push({
      id: r.id,
      date: r.date,
      giver: r.giver,
      taker: r.taker,
      kind: r.kind,
      d: `M${r1(x)} ${y1}Q${r1(x + bulge)} ${(y1 + y2) / 2} ${r1(x)} ${y2}`,
      x: r1(x),
      y: Math.min(y1, y2),
      cycle: cycleNo(r.date),
      what: r.what,
    })
  }

  const bands = cycles
    .filter((c) => cycleEnd(c, input.until) > input.since && c.opened <= input.until)
    .map((c): ScoreBand => {
      const x = axis.x(c.opened < input.since ? input.since : c.opened, 0)
      const width = axis.x(cycleEnd(c, input.until), 0) - x
      return { cycle: c.n, x: r1(x), width: r1(width), question: c.question, captioned: width > SCORE.captionMin, running: c.closed === null }
    })

  const endX = r1(axis.x(input.until, 1))
  // A presentation stands at the end of the day it was presented: the day its own summary
  // names, or — where it names none — the last day of its cycle, which is the day before the
  // next one opened. (The handoff draws every bar on the closing day; the record knows better
  // for most of them, because a convening can lie between a presentation and the next cycle.)
  const closedOn = new Map(cycles.filter((c) => c.closed).map((c) => [c.n, c.closed!]))
  const presentations = input.presentations.flatMap((p) => {
    const closed = closedOn.get(p.cycle)
    const date = p.date ?? (closed ? dayBefore(closed) : null)
    return date && date >= input.since && date <= input.until
      ? [{ practice: p.practice, cycle: p.cycle, date, x: r1(axis.x(date, 1) - 5), y: SCORE.tops[p.practice] }]
      : []
  })

  // The convening runs from the day it opened to the day the next cycle did — or to the end of
  // the ruler while it is still open.
  const conv = input.convening
  const next = conv ? cycles.find((c) => c.n === conv.after + 1) : undefined
  const convening =
    conv && conv.opened >= input.since && conv.opened <= input.until
      ? {
          after: conv.after,
          x: r1(axis.x(conv.opened, 0)),
          width: r1(axis.x(next?.opened ?? dayAfter(input.until), 0) - axis.x(conv.opened, 0)),
        }
      : null

  return {
    width: SCORE.width,
    height: SCORE.height,
    axis,
    staves: ORDER.map((practice) => ({
      practice,
      top: SCORE.tops[practice],
      lines: Array.from({ length: STAVE_LINES }, (_, i) => SCORE.tops[practice] + i * SCORE.step),
    })),
    bands,
    barlines: [...bands.map((b) => ({ x: b.x, heavy: true })), { x: endX, heavy: false }],
    ticks: weekTicks(axis).map((t) => ({ ...t, x: r1(t.x) })),
    notes,
    slurs,
    presentations,
    endX,
    convening,
  }
}

// ── a practice's own part (/field, /atelier, /studio) ────────────────────────────────────────
//
// REDRAWN ON 2026-11-14. The part of 2026-10-11 set the practice's stave between two ghost
// staves and drew a slur for every relation that reached it. That read well for a few dozen
// relations and stopped reading at several hundred: the slurs of one night lay on top of each
// other and of the next night's. The same records are now drawn as three lanes on the same day
// ruler: what the practice TOOK from its siblings stacks up from a floor, one cell per relation;
// its own sessions stand in the middle, one dot each; what its siblings took FROM IT hangs down
// from a ceiling. A cell wears the sibling's hue, and its fill says the kind of relation. No
// cell covers another, so every relation can still be pointed at and read.

/** The measures of a part, in the units of a 1312 × 318 drawing. */
export const PART = {
  width: 1312,
  height: 318,
  left: 150,
  plot: 1140,
  barTop: 34,
  barBottom: 290,
  /** the line the taken cells stand on, and how high the fullest night may reach above it */
  tookFloor: 122,
  /** the line the given cells hang from */
  gaveCeil: 202,
  reach: 84,
  /** the tallest a cell's row is; a fuller night than the lane holds makes every row lower */
  maxStep: 5.6,
  /** the lowest session dot of a night, and the distance to the next one above it */
  sessionFloor: 184,
  sessionStep: 8,
  /** the baseline of the week ruler's labels */
  tickY: 308,
} as const

/**
 * The order the two siblings are named in on a practice's page, and stacked in within a night.
 * Kept from the staves of 2026-10-11, where it said who stood above and who below.
 */
export const PART_SIBLINGS: Record<PracticeId, readonly [PracticeId, PracticeId]> = {
  field: ['studio', 'atelier'],
  atelier: ['field', 'studio'],
  studio: ['field', 'atelier'],
}

const PART_KINDS: readonly RelayKind[] = ['built_on', 'answered', 'noted']

export interface PartNote {
  date: string
  x: number
  y: number
  filled: boolean
  title: string
  href: string
  /** the piece that session left, or null */
  piece: string | null
}

export interface PartCrossing {
  id: string
  date: string
  kind: RelayKind
  giver: PracticeId
  taker: PracticeId
  /** the sibling at the other end — the cell wears its hue */
  other: PracticeId
  /** this practice took something (the cell stands above its sessions) or gave it (below) */
  took: boolean
  x: number
  y: number
  width: number
  height: number
  what: string
}

export interface PartModel {
  width: number
  height: number
  axis: DayAxis
  me: PracticeId
  barlines: number[]
  /** cycle numbers, one where each cycle opens */
  marks: { cycle: number; x: number }[]
  ticks: { x: number; date: string }[]
  notes: PartNote[]
  crossings: PartCrossing[]
  /** per sibling, in the order of PART_SIBLINGS: how often this practice took from it and gave to it */
  siblings: { practice: PracticeId; took: number; gave: number }[]
  /** the fullest stack of one night in one direction — what the lanes' height stands for */
  peak: number
}

export function buildPart(input: ScoreInput, me: PracticeId): PartModel {
  const axis = dayAxis(input.since, input.until, PART.left, PART.plot)
  const cycles = [...input.cycles].sort((a, b) => a.n - b.n)
  const order = PART_SIBLINGS[me]

  const left = piecesOfSessions(input.sessions, input.pieces, me, input.since, input.until)
  const notes: PartNote[] = []
  for (const { session, index } of stacked(input.sessions, me, input.since, input.until)) {
    const piece = left.get(session) ?? null
    notes.push({
      date: session.date,
      x: r1(axis.x(session.date)),
      y: r1(PART.sessionFloor - index * PART.sessionStep),
      filled: piece !== null,
      title: session.title,
      href: session.href,
      piece,
    })
  }

  // One stack per night and direction, sorted so that a sibling's cells lie together and the
  // weightiest kind lies nearest the sessions.
  const mine = input.relations.filter((r) => (r.giver === me || r.taker === me) && r.date >= input.since && r.date <= input.until)
  const otherOf = (r: ScoreRelation) => (r.giver === me ? r.taker : r.giver)
  const stacks = new Map<string, ScoreRelation[]>()
  for (const r of mine) {
    const key = `${r.date}|${r.taker === me ? 'took' : 'gave'}`
    stacks.set(key, [...(stacks.get(key) ?? []), r])
  }
  const peak = Math.max(0, ...[...stacks.values()].map((s) => s.length))
  const step = Math.min(PART.maxStep, PART.reach / Math.max(1, peak))
  const width = r1(Math.max(2, axis.unit - 3))
  const crossings: PartCrossing[] = []
  for (const stack of stacks.values()) {
    const sorted = [...stack].sort(
      (a, b) => order.indexOf(otherOf(a)) - order.indexOf(otherOf(b)) || PART_KINDS.indexOf(a.kind) - PART_KINDS.indexOf(b.kind),
    )
    sorted.forEach((r, i) => {
      const took = r.taker === me
      crossings.push({
        id: r.id,
        date: r.date,
        kind: r.kind,
        giver: r.giver,
        taker: r.taker,
        other: otherOf(r),
        took,
        x: r1(axis.x(r.date) - width / 2),
        y: r1(took ? PART.tookFloor - (i + 1) * step + 1 : PART.gaveCeil + i * step),
        width,
        height: r1(step - 1),
        what: r.what,
      })
    })
  }
  crossings.sort((a, b) => a.date.localeCompare(b.date) || Number(b.took) - Number(a.took) || a.y - b.y)

  const shown = cycles.filter((c) => cycleEnd(c, input.until) > input.since && c.opened <= input.until)
  const startOf = (c: ScoreCycle) => r1(axis.x(c.opened < input.since ? input.since : c.opened, 0))
  return {
    width: PART.width,
    height: PART.height,
    axis,
    me,
    barlines: [...shown.map(startOf), r1(axis.x(input.until, 1))],
    marks: shown.map((c) => ({ cycle: c.n, x: startOf(c) })),
    ticks: weekTicks(axis).map((t) => ({ ...t, x: r1(t.x) })),
    notes,
    crossings,
    siblings: order.map((practice) => ({
      practice,
      took: mine.filter((r) => r.taker === me && r.giver === practice).length,
      gave: mine.filter((r) => r.giver === me && r.taker === practice).length,
    })),
    peak,
  }
}

// ── the Middle's crossings, night by night (/encounters) ─────────────────────────────────────

export const CROSSINGS = { width: 1312, height: 190, floor: 170 } as const

export interface CrossingBar {
  date: string
  x: number
  width: number
  counts: Record<RelayKind, number>
  total: number
  /** stacked from the floor up: built on, answered, noted — each `{ y, height }` in the box */
  segments: Record<RelayKind, { y: number; height: number }>
}

export interface CrossingsModel {
  width: number
  height: number
  axis: DayAxis
  bars: CrossingBar[]
  marks: { cycle: number; x: number }[]
  ticks: { x: number; date: string }[]
  /** the busiest night's total — what the tallest bar stands for */
  peak: number
  nights: number
}

const KIND_ORDER: readonly RelayKind[] = ['built_on', 'answered', 'noted']

/**
 * The relations as one stacked bar per night, from the relay's first day to the ruler's last.
 * The tallest night fills the box; every other bar is drawn to the same scale. A night without
 * a relation has no bar — and the axis still gives it its width, so a gap is a gap.
 */
export function buildCrossings(
  relations: readonly ScoreRelation[],
  cycles: readonly ScoreCycle[],
  until: string,
): CrossingsModel | null {
  if (relations.length === 0) return null
  const since = relations.reduce((min, r) => (r.date < min ? r.date : min), relations[0].date)
  const axis = dayAxis(since, until, 0, CROSSINGS.width)
  const byDay = new Map<string, Record<RelayKind, number>>()
  for (const r of relations) {
    if (r.date > until) continue
    const day = byDay.get(r.date) ?? { built_on: 0, answered: 0, noted: 0 }
    day[r.kind]++
    byDay.set(r.date, day)
  }
  const totalOf = (c: Record<RelayKind, number>) => c.built_on + c.answered + c.noted
  const peak = Math.max(...[...byDay.values()].map(totalOf))
  const scale = CROSSINGS.floor / peak

  const bars = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]): CrossingBar => {
      let y = CROSSINGS.floor
      const segments = {} as CrossingBar['segments']
      for (const kind of KIND_ORDER) {
        const height = counts[kind] * scale
        y -= height
        segments[kind] = { y: r1(y), height: r1(height) }
      }
      return { date, x: r1(axis.x(date, 0) + 2), width: r1(Math.max(1, axis.unit - 4)), counts, total: totalOf(counts), segments }
    })

  return {
    width: CROSSINGS.width,
    height: CROSSINGS.height,
    axis,
    bars,
    marks: cycles.filter((c) => c.opened >= since && c.opened <= until).map((c) => ({ cycle: c.n, x: r1(axis.x(c.opened, 0)) })),
    ticks: weekTicks(axis).map((t) => ({ ...t, x: r1(t.x) })),
    peak,
    nights: bars.length,
  }
}

/** Who took how much from whom: one cell per directed pair, in the house order of the practices
 *  (givers down, takers across), and the fullest cell's total — what the strongest tint stands
 *  for. The diagonal does not exist: a practice does not take from itself. */
export interface MatrixCell {
  giver: PracticeId
  taker: PracticeId
  counts: Record<RelayKind, number>
  total: number
  /** 0–6: how full the cell is against the fullest, in six steps */
  tint: number
}

export function relationMatrix(relations: readonly ScoreRelation[]): { rows: { giver: PracticeId; cells: (MatrixCell | null)[] }[]; peak: number } {
  const cell = (giver: PracticeId, taker: PracticeId) => {
    const counts: Record<RelayKind, number> = { built_on: 0, answered: 0, noted: 0 }
    for (const r of relations) if (r.giver === giver && r.taker === taker) counts[r.kind]++
    return { giver, taker, counts, total: counts.built_on + counts.answered + counts.noted }
  }
  const cells = ORDER.flatMap((g) => ORDER.filter((t) => t !== g).map((t) => cell(g, t)))
  const peak = Math.max(0, ...cells.map((c) => c.total))
  const tinted = new Map(cells.map((c) => [`${c.giver}|${c.taker}`, { ...c, tint: peak > 0 ? Math.round((c.total / peak) * 6) : 0 }]))
  return {
    rows: ORDER.map((giver) => ({ giver, cells: ORDER.map((taker) => (taker === giver ? null : tinted.get(`${giver}|${taker}`)!)) })),
    peak,
  }
}

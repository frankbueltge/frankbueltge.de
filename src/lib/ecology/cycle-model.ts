// The cycle as a partitur (2026-09-02) — the pure model behind /ecology's living score.
//
// This module is the whole claim of that figure: what the running cycle contains, on which
// lane it stands, on which day, and where on the ruler that day falls. The island
// (src/components/ecology/CyclePartitur.tsx) mounts it, animates it and answers the pointer;
// it computes nothing a reader would have to take on trust. That split is duty 1 of the seven
// (.claude/rules/dataviz-figures.md, "Interaktive Figuren", 2026-09-02) and the reason a
// browser is not needed to check what the drawing says.
//
// What it replaces: src/lib/ecology/cycle-score.ts, the SVG-string builder of 2026-09-01, which
// drew one square per artifact on three lanes. The cycle is more than its artifacts — it is
// also the sessions that produced them, the letters the house prepared for receivers outside
// it, the encounters in which one practice's material travelled into another's work, and the
// presentations that close it. Those records were already committed and already had surfaces;
// they were simply not drawn together. Git keeps the builder it replaces.
//
// Two rules the geometry obeys, both of them honesty rules rather than taste:
//
//   · THE RULER ENDS AT THE NEWEST RECORD, NEVER AT TODAY. A clock read would make the figure
//     say something new every morning without anything having happened; the axis end is the
//     latest day the cycle's own records name. (Where no record has landed yet, the axis is
//     one day wide, so the drawing has a scale at all.)
//   · A LANE WITHOUT MARKS IS DRAWN AS EMPTY, NOT LEFT OUT. Absence is a fact about the cycle.
//     The house lane in particular is usually quiet: it carries only what the house does as
//     itself — the ecology's and the plenum's letters, and the encounters between practices.
import type {
  ArtifactEntry,
  CyclePhase,
  CycleState,
  EncounterEntry,
  LetterEntry,
  PracticeId,
  PresentationEntry,
  SessionNote,
} from './v3'
import { bandScale } from '@/lib/dataviz/geometry'

/** The four voices of the drawing: the three practices, and the house as a declared neutral. */
export type LaneId = PracticeId | 'house'
/** The persona whose recorded hue inks a lane — the `pr-*` vocabulary of score-map.css. The
 *  house's `conductor` is grey on purpose: greyness is the meaning (the human hand, not a
 *  fourth practice), which is why it sits outside the validated categorical quartet. */
export type LanePersona = 'meridian' | 'ulysses' | 'ensemble' | 'conductor'
/** What a mark is. Carried by SHAPE, never by a new hue — the four lane colours are the only
 *  categorical set on this surface (duty 7). */
export type MarkKind = 'artifact' | 'session' | 'letter' | 'encounter' | 'presentation'

/** Top to bottom, the order the lanes are drawn in. */
export const LANES: readonly LaneId[] = ['field', 'atelier', 'studio', 'house'] as const
export const LANE_PERSONA: Record<LaneId, LanePersona> = {
  field: 'meridian',
  atelier: 'ulysses',
  studio: 'ensemble',
  house: 'conductor',
}
/** Reading order of the kinds — used for the key, the table and the total order of marks. */
export const MARK_KINDS: readonly MarkKind[] = [
  'artifact',
  'session',
  'letter',
  'encounter',
  'presentation',
] as const

export interface CycleMark {
  /** stable, content-derived id — the selection key, and what `dv:mark-selected` carries */
  id: string
  kind: MarkKind
  lane: LaneId
  /** the mark's own committed day */
  date: string
  /** the record's own words */
  title: string
  /** the page this site publishes for the record */
  href: string
  /** the committed file or directory the record was read from — the card's provenance line */
  source: string
  /** step within its own lane on its own day, so a busy evening does not overprint itself */
  nth: number
}

export interface CycleLane {
  id: LaneId
  persona: LanePersona
  /** no mark this cycle — drawn thin and dashed, and it says so */
  quiet: boolean
  marks: number
  y: number
}

export interface CycleBand {
  phase: CyclePhase
  from: string
  to: string
}

export interface CycleBox {
  w: number
  laneX0: number
  spanX1: number
  laneY0: number
  laneGap: number
  rulerY: number
  h: number
}

export interface CycleModel {
  cycle: number
  phase: CyclePhase
  axis: { start: string; end: string; days: number }
  lanes: CycleLane[]
  bands: CycleBand[]
  /** sorted by date, then lane order, then kind order, then title — a total order */
  marks: CycleMark[]
  box: CycleBox
}

export interface CycleModelInput {
  cycle: CycleState
  /** the running cycle's artifacts (the caller filters with inCycle) */
  artifacts: ArtifactEntry[]
  sessions: SessionNote[]
  letters: LetterEntry[]
  encounters: EncounterEntry[]
  presentations: PresentationEntry[]
}

// ---------------------------------------------------------------- geometry constants
//
// The box is the one the score grammar has used since 2026-07-15 (a 1440-wide stage, lanes
// starting at 230 so a lane label has room, the span ending at 1330). The fourth lane is the
// only change: the house sits under the three practices at the same gap.

export const BOX: CycleBox = {
  w: 1440,
  laneX0: 230,
  spanX1: 1330,
  laneY0: 138,
  laneGap: 96,
  rulerY: 56,
  h: 138 + 3 * 96 + 86,
}

/** Distance between two marks of the same lane on the same day at the identity view — just wide
 *  enough that two sixteen-unit signs do not touch. */
export const MARK_STEP = 22
/** How far such a group may spread when the ruler is zoomed. A day has no width on a date scale,
 *  so zooming alone would never separate an evening's three works; letting the step grow with the
 *  zoom (to a little more than a label's minimum gap) is what lets a busy evening unfold as the
 *  figure is read closer. The marks themselves never grow. */
export const MARK_STEP_MAX = 150
/** A label is drawn only where its lane has this much room to the previously drawn one. Zooming
 *  in widens the day spacing, so more words appear: that is the "semantic" in semantic zoom. */
export const LABEL_MIN_GAP = 138
/** Same rule for the ruler's dates. */
export const TICK_MIN_GAP = 116
/** How many characters of a record's own words a label carries before it is cut at a word. */
export const LABEL_MAX = 26

const DAY_MS = 86_400_000

function dayIndex(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
}

function addDay(date: string, days: number): string {
  return new Date((dayIndex(date) + days) * DAY_MS).toISOString().slice(0, 10)
}

/** The words a record carries: its own title where it has one, its slug read as words otherwise. */
function words(title: string | undefined, slug: string): string {
  const t = title?.trim()
  return t && t.length > 0 ? t : slug.replace(/-/g, ' ')
}

/** A mark's label: the record's own words, without the day it already stands on (the practices
 *  write "Session 118 — 2026-09-01", and the ruler says the date once), cut at a word. */
export function markLabel(mark: CycleMark): string {
  const text = mark.title.replace(/\s+[—–-]\s+\d{4}-\d{2}-\d{2}\b.*$/, '').trim() || mark.title
  if (text.length <= LABEL_MAX) return text
  const cut = text.slice(0, LABEL_MAX)
  return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}…`
}

// ---------------------------------------------------------------- buildCycleModel

function laneOfPractice(p: PracticeId): LaneId {
  return p
}

export function buildCycleModel(input: CycleModelInput): CycleModel {
  const { cycle } = input
  const marks: CycleMark[] = []

  for (const a of input.artifacts) {
    if (!a.date) continue
    marks.push({
      id: `artifact:${a.practice}:${a.slug}`,
      kind: 'artifact',
      lane: laneOfPractice(a.practice),
      date: a.date,
      title: words(a.title, a.slug),
      href: a.href,
      source: `public${a.href}`,
      nth: 0,
    })
  }

  for (const s of input.sessions) {
    marks.push({
      id: `session:${s.practice}:${s.anchor}`,
      kind: 'session',
      lane: laneOfPractice(s.practice),
      date: s.date,
      title: s.title,
      href: s.href,
      source: s.source,
      nth: 0,
    })
  }

  for (const l of input.letters) {
    // A letter of one of the three practices rides that practice's lane; the ecology's and the
    // plenum's letters are the house speaking as itself, and ride the house lane.
    const lane: LaneId =
      l.practice === 'field' || l.practice === 'atelier' || l.practice === 'studio' ? l.practice : 'house'
    marks.push({
      id: `letter:${l.id}`,
      kind: 'letter',
      lane,
      date: l.date,
      title: l.title,
      href: l.href,
      source: l.source,
      nth: 0,
    })
  }

  for (const e of input.encounters) {
    marks.push({
      id: `encounter:${e.id}`,
      kind: 'encounter',
      lane: 'house',
      date: e.date,
      title: e.title,
      href: e.href,
      source: e.source,
      nth: 0,
    })
  }

  for (const p of input.presentations) {
    // An undated presentation is listed by the page's own shelf, never placed on a guess.
    if (!p.date || p.cycle !== cycle.cycle) continue
    marks.push({
      id: `presentation:${p.practice}:${p.cycle}`,
      kind: 'presentation',
      lane: laneOfPractice(p.practice),
      date: p.date,
      title: words(p.title, `presentation ${p.practice}`),
      href: p.href,
      source: `public/${p.practice}/presentations/cycle-${String(p.cycle).padStart(3, '0')}/SUMMARY.md`,
      nth: 0,
    })
  }

  // A total order — never the order the filesystem happened to answer in.
  marks.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      LANES.indexOf(a.lane) - LANES.indexOf(b.lane) ||
      MARK_KINDS.indexOf(a.kind) - MARK_KINDS.indexOf(b.kind) ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id),
  )

  // Same lane, same day: step right by a fixed offset, in the order above.
  const seen = new Map<string, number>()
  for (const m of marks) {
    const slot = `${m.lane}:${m.date}`
    const nth = seen.get(slot) ?? 0
    seen.set(slot, nth + 1)
    m.nth = nth
  }

  const start = cycle.opened
  const latest = marks.reduce((acc, m) => (m.date > acc ? m.date : acc), start)
  // Never the clock: the ruler ends where the record ends. One day wide when nothing has landed,
  // so the scale exists at all.
  const end = latest > start ? latest : addDay(start, 1)

  const lanes: CycleLane[] = LANES.map((id, i) => {
    const count = marks.filter((m) => m.lane === id).length
    return {
      id,
      persona: LANE_PERSONA[id],
      quiet: count === 0,
      marks: count,
      y: BOX.laneY0 + i * BOX.laneGap,
    }
  })

  return {
    cycle: cycle.cycle,
    phase: cycle.phase,
    axis: { start, end, days: dayIndex(end) - dayIndex(start) },
    lanes,
    // The cycle state carries one phase, so the drawing bands one phase — the band says which
    // stretch of the ruler the house was in this phase for, and nothing it does not know.
    bands: [{ phase: cycle.phase, from: start, to: end }],
    marks,
    box: BOX,
  }
}

// ---------------------------------------------------------------- placement (semantic zoom)

/** A d3-zoom transform, x only: `x' = k · x + tx`. */
export interface CycleView {
  k: number
  x: number
}

export const IDENTITY_VIEW: CycleView = { k: 1, x: 0 }

export interface PlacedMark {
  mark: CycleMark
  /** centre of the mark, in the box's own coordinates */
  x: number
  y: number
  /** false when the zoom has pushed the mark off the ruler — drawn nowhere, still in the table */
  visible: boolean
  /** the words to draw beside the mark, or null when its lane has no room at this zoom */
  label: string | null
  labelY: number
}

/** Where a day falls on the unzoomed ruler. */
export function axisX(model: CycleModel, date: string): number {
  const scale = bandScale(
    [dayIndex(model.axis.start), dayIndex(model.axis.end)],
    [model.box.laneX0, model.box.spanX1],
  )
  return scale(dayIndex(date))
}

/**
 * Every mark placed under one view — the pure half of the semantic zoom.
 *
 * Three things happen here and nowhere else: the day's position is transformed by the view;
 * a group of marks sharing a lane and a day steps right by `markStep(view)` and, where that would
 * carry the group past the end of the ruler, shifts left AS ONE so the last mark stands on the
 * end; and a label is granted only where its lane has LABEL_MIN_GAP of room since the last label
 * it granted. The last two are what make zooming mean something: the same figure says more the
 * closer it is read, without a single number changing.
 */
/** The step between same-day marks under one view — MARK_STEP at rest, widening with the zoom
 *  up to MARK_STEP_MAX so a crowded evening spreads instead of staying a single blur. */
export function markStep(view: CycleView): number {
  return Math.min(MARK_STEP * view.k, MARK_STEP_MAX)
}

export function placeMarks(model: CycleModel, view: CycleView): PlacedMark[] {
  const stepPx = markStep(view)
  const groupSize = new Map<string, number>()
  for (const m of model.marks) {
    const slot = `${m.lane}:${m.date}`
    groupSize.set(slot, Math.max(groupSize.get(slot) ?? 0, m.nth + 1))
  }
  const laneY = new Map(model.lanes.map((l) => [l.id, l.y]))

  const placed: PlacedMark[] = model.marks.map((mark) => {
    const base = view.k * axisX(model, mark.date) + view.x
    const size = groupSize.get(`${mark.lane}:${mark.date}`) ?? 1
    const overflow = Math.max(0, base + (size - 1) * stepPx - model.box.spanX1)
    const x = base + mark.nth * stepPx - overflow
    return {
      mark,
      x,
      y: laneY.get(mark.lane) ?? model.box.laneY0,
      visible: x >= model.box.laneX0 - 26 && x <= model.box.spanX1 + 26,
      label: null,
      labelY: 0,
    }
  })

  // Labels, lane by lane, left to right. Alternating below/above keeps two neighbouring labels
  // of one lane from touching even at the moment a new one is granted.
  for (const lane of model.lanes) {
    const inLane = placed
      .filter((p) => p.mark.lane === lane.id && p.visible)
      .sort((a, b) => a.x - b.x || a.mark.id.localeCompare(b.mark.id))
    let lastX = Number.NEGATIVE_INFINITY
    let granted = 0
    for (const p of inLane) {
      if (p.x - lastX < LABEL_MIN_GAP) continue
      p.label = markLabel(p.mark)
      p.labelY = granted % 2 === 0 ? p.y + 30 : p.y - 22
      lastX = p.x
      granted += 1
    }
  }

  return placed
}

export interface AxisTick {
  date: string
  x: number
}

/** The ruler's dates under one view: the cycle's own days — its opening, every day a record
 *  landed on, and the end — thinned left to right so two dates never overprint. Zooming in
 *  admits more of them, for the same reason more labels appear. */
export function axisTicks(model: CycleModel, view: CycleView): AxisTick[] {
  const days = [...new Set([model.axis.start, ...model.marks.map((m) => m.date), model.axis.end])].sort()
  const ticks: AxisTick[] = []
  let lastX = Number.NEGATIVE_INFINITY
  for (const date of days) {
    const x = view.k * axisX(model, date) + view.x
    if (x < model.box.laneX0 - 2 || x > model.box.spanX1 + 2) continue
    if (x - lastX < TICK_MIN_GAP) continue
    ticks.push({ date, x })
    lastX = x
  }
  return ticks
}

/** Where a band's stretch of ruler starts and ends under one view, clamped to the drawing. */
export function bandSpan(model: CycleModel, band: CycleBand, view: CycleView): { x: number; w: number } {
  const from = Math.max(model.box.laneX0, view.k * axisX(model, band.from) + view.x)
  const to = Math.min(model.box.spanX1, view.k * axisX(model, band.to) + view.x)
  return { x: from, w: Math.max(0, to - from) }
}

// ---------------------------------------------------------------- the table floor

export interface ModelRow extends Record<string, string> {
  date: string
  lane: LaneId
  kind: MarkKind
  what: string
}

/** The figure as rows — the floor under it (duty 2). Same marks, same order, no geometry: what
 *  a reader gets with the drawing switched off, and what a reader with a screen reader gets
 *  instead of a shape vocabulary. */
export function modelRows(model: CycleModel): ModelRow[] {
  return model.marks.map((m) => ({
    date: m.date,
    lane: m.lane,
    kind: m.kind,
    what: m.title,
  }))
}

// src/lib/ecology/pyramid/figures.ts — one speaking figure per station, each in that practice's
// own vocabulary, each drawn only from what that practice's own record actually carries.
//
// The station sheets share a frame on purpose (design handoff, Level 1): the frame is identical so
// that the difference a reader sees between four rooms is the practices' and not the layout's.
// The FIGURES are where the difference lives, and that is why they are four separate builders and
// not one parameterised chart: the Atelier has lines with ends, the Field has a gate that lets
// things through, the Studio has a floor that keeps every mark, and the Middle has voices that
// cross. None of those is the same picture with different data in it.
//
// ── the one figure that is NOT here, and why ──────────────────────────────────────────────────
// The handoff specifies a VERDICT SPECTRUM for the Field: every instrument as a dot on an axis
// running "claim confirmed ←→ claim taken apart". It also says, in the same paragraph, that the
// axis position "needs a small committed field or a curated mapping — flag as TODO with the
// practice, never guessed". It was right to say so: the Field's instrument metadata
// (src/components/field/werke/*/meta.json) carries title, date, author, medium and embodies, and
// nothing that places a finding on that axis. Twenty-two dots would therefore have been twenty-two
// invented positions wearing the authority of a measurement — on the practice whose whole remit is
// putting measurements on trial.
//
// So the Field gets what its record does carry: its chronicle logs a verdict per session, and the
// works register knows what shipped. That is a picture of the gate, not of the findings. The
// spectrum stays open, owed to the practice, and is noted in the sheet's own figure caption rather
// than quietly dropped.

import type { Dossier } from '@/lib/atelier/dossier'
import type { LatestWork } from '@/lib/engines/latest'
import type { ChronicleEntry } from './landings'

// ───────────────────────────────────────────────────────────────────────────────────────────────
// The Field — the gate
// ───────────────────────────────────────────────────────────────────────────────────────────────

/** The verdict vocabulary the Field's chronicle uses as a single word. Most entries state their
 *  verdict in prose instead; those are classified as `stated` — a real category meaning "the
 *  record answered, in its own words" — never squeezed into one of the four below. */
export type GateVerdict = 'graduated' | 'pass' | 'conditions' | 'deferred' | 'fail' | 'stated' | 'none'

const VERDICT_WORDS: Record<string, GateVerdict> = {
  graduated: 'graduated',
  pass: 'pass',
  conditions: 'conditions',
  deferred: 'deferred',
  fail: 'fail',
  rework: 'deferred',
  null: 'none',
}

/**
 * Classify one chronicle verdict.
 *
 * Only an EXACT single-word match counts. The temptation is to match on prefixes — "deferred —
 * built as a draft, full gauntlet owed" obviously starts with "deferred" — but the same field also
 * carries sentences like "gate resolved → narrowed/reshaped; not built, not killed", and a
 * classifier greedy enough to catch the first is greedy enough to mis-file the second. A figure
 * that says "stated" for a sentence it did not parse is telling the truth; one that guesses is not.
 */
export function classifyVerdict(raw: string | null | undefined): GateVerdict {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) return 'none'
  return VERDICT_WORDS[value] ?? 'stated'
}

export interface GateMark {
  date: string
  session: number | null
  verdict: GateVerdict
  /** the record's own words, for the mark's tooltip — never a paraphrase */
  words: string
  /** did this session ship something the works register knows about */
  shipped: boolean
}

export interface GateStrip {
  marks: GateMark[]
  /** how many sessions stated their verdict in prose rather than in one word */
  statedCount: number
}

export function buildGateStrip(rows: readonly ChronicleEntry[] & { verdict?: string }[], works: readonly LatestWork[]): GateStrip {
  const shippedDates = new Set(works.filter((w) => w.ns === 'field').map((w) => w.date))
  const marks = rows
    .filter((r) => r.date)
    .map((r) => {
      const raw = (r as { verdict?: string }).verdict ?? null
      return {
        date: r.date!,
        session: r.collective_session ?? null,
        verdict: classifyVerdict(raw),
        words: (raw ?? '').trim(),
        shipped: shippedDates.has(r.date!),
      }
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1))
  return { marks, statedCount: marks.filter((m) => m.verdict === 'stated').length }
}

export interface FunnelRow {
  label: string
  n: number
  /** width fraction of the widest row */
  w: number
  /** the last row is the one still standing */
  terminal: boolean
}

/**
 * THE GAUNTLET — what the gate lets through, as four counts that are all countable.
 *
 * Deliberately NOT the mock's four rows: "instruments proposed" is not a number this archive has
 * (a proposal that never reached the chronicle left no trace on this site). The rows below are the
 * ones the committed record can answer, and the caption says which record each came from.
 */
export function buildGauntlet(sessions: number, shipped: number, standing: number, labels: readonly string[]): FunnelRow[] {
  const rows = [
    { label: labels[0], n: sessions },
    { label: labels[1], n: shipped },
    { label: labels[2], n: standing },
  ]
  const widest = Math.max(...rows.map((r) => r.n), 1)
  return rows.map((row, i) => ({
    ...row,
    w: Math.max(0.08, row.n / widest),
    terminal: i === rows.length - 1,
  }))
}

// ───────────────────────────────────────────────────────────────────────────────────────────────
// The Atelier — the line map
// ───────────────────────────────────────────────────────────────────────────────────────────────

export type LineEnd = 'kill' | 'study' | 'publish' | 'running'

export interface LineMapLine {
  id: string
  title: string
  /** where the line started, and where its record last moved */
  from: string
  to: string
  end: LineEnd
}

export interface LineMap {
  /** ISO dates bounding the axis */
  from: string
  to: string
  works: { date: string; title: string }[]
  lines: LineMapLine[]
}

const END_OF: Record<string, LineEnd> = {
  KILL: 'kill',
  ARCHIVE_AS_STUDY: 'study',
  PUBLISH: 'publish',
  PUBLICATION_CANDIDATE: 'running',
  RUNNING: 'running',
}

/**
 * The Atelier's entrance map, reduced to a figure: works as ink slabs on one time axis, and the
 * lines that produced them hanging below it, each ending in the mark its record earned.
 *
 * A killed line gets its own mark and NOT a warning colour: under this practice's constitution
 * closing costs what continuing costs, so a stopped line is an outcome and not a failure state
 * (the repo's own dataviz rule — status colours are forbidden where the practice does not judge).
 */
export function buildLineMap(dossiers: readonly Dossier[], works: readonly LatestWork[]): LineMap {
  const atelierWorks = works
    .filter((w) => w.ns === 'atelier' && /^\d{4}-\d{2}-\d{2}$/.test(w.date))
    .map((w) => ({ date: w.date, title: w.title }))
  const lines = dossiers
    .filter((d) => d.created)
    .map((d) => ({
      id: d.id,
      title: d.title,
      from: d.created,
      to: d.lastMove || d.created,
      end: END_OF[d.stand] ?? 'running',
    }))
  const dates = [...atelierWorks.map((w) => w.date), ...lines.flatMap((l) => [l.from, l.to])].sort()
  return {
    from: dates[0] ?? '',
    to: dates.at(-1) ?? '',
    works: atelierWorks,
    lines,
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────
// The Studio — the stage floor
// ───────────────────────────────────────────────────────────────────────────────────────────────

export interface StagePool {
  title: string
  date: string
  /** the one currently in the light */
  lit: boolean
}

export interface StageStrike {
  name: string
  session: string
  /** the reason, verbatim — every strike keeps its reason taped to the floor */
  reason: string
}

export interface StageFloor {
  pools: StagePool[]
  strikes: StageStrike[]
  held: StageStrike[]
}

export function buildStageFloor(
  works: readonly LatestWork[],
  stage: { kills?: StageStrike[]; held?: { name: string; sub?: string; note?: string }[] },
): StageFloor {
  const premiered = works
    .filter((w) => w.ns === 'studio' && w.state !== 'withdrawn')
    .sort((a, b) => (a.date < b.date ? -1 : 1))
  return {
    pools: premiered.map((w, i) => ({ title: w.title, date: w.date, lit: i === premiered.length - 1 })),
    strikes: stage.kills ?? [],
    // The Gasse: concepts held at the gate rather than struck. They are unlit rectangles, not
    // pools — the floor keeps them visible because a held work is not a rejected one.
    held: (stage.held ?? []).map((h) => ({ name: h.name, session: h.sub ?? '', reason: h.note ?? '' })),
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────
// The Middle — the crossing score
// ───────────────────────────────────────────────────────────────────────────────────────────────

export type LaneId = 'ulysses' | 'meridian' | 'ensemble' | 'plenum'

export interface Crossing {
  id: string
  title: string
  /** which voices took part, in lane order */
  lanes: LaneId[]
  /** the as-of date where the record carries one */
  date: string | null
}

const LANE_OF: Record<string, LaneId> = {
  ulysses: 'ulysses',
  meridian: 'meridian',
  ensemble: 'ensemble',
  'data-snack-plenum': 'plenum',
}

export const LANES: readonly LaneId[] = ['ulysses', 'meridian', 'ensemble', 'plenum']

/**
 * The crossing score: one lane per voice, one column per recorded crossing, a connector where a
 * crossing joined two or more lanes.
 *
 * The columns are the register's own ORDER, not a time axis: two of the six crossings carry no
 * as-of date, and stretching an axis over dates that half the record does not have would put
 * those two somewhere they were never observed. The order is a fact; a position in time would be
 * a guess. The conductor is not a lane — a human keeping the record is not a voice crossing with
 * the others.
 */
export function buildCrossings(
  rows: readonly { encounter_id?: string; title?: string; participants?: { id?: string }[]; status?: { as_of?: string } }[],
): Crossing[] {
  return rows
    .filter((r) => r.encounter_id && r.title)
    .map((r) => {
      const lanes = (r.participants ?? [])
        .map((p) => LANE_OF[p.id ?? ''])
        .filter((l): l is LaneId => Boolean(l))
      return {
        id: r.encounter_id!,
        title: r.title!,
        lanes: LANES.filter((l) => lanes.includes(l)),
        date: r.status?.as_of ?? null,
      }
    })
}

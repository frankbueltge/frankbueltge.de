// src/lib/ecology/relay-triangle.ts — the Middle's triangle, as pure geometry (2026-10-05).
//
// Duty 1 of the house's interactive figures (.claude/rules/dataviz-figures.md): every number and
// every coordinate the figure draws comes from here, and this module is pure and tested. The
// island (src/components/ecology/RelayTriangle.tsx) mounts what this returns, switches between the
// two windows and answers the pointer; it computes nothing that carries a claim.
//
// THE DRAWING. Three practices at the corners of a near-equilateral triangle. Between every pair
// run two lanes, one per direction, each from the GIVER (whose material it was) towards the
// TAKER (who did something with it), ending in an arrowhead at the taker. Opposite directions sit
// on opposite sides of the axis between the two corners, so the six lanes never share ground. A
// lane holds up to three strokes, stacked outward from the axis in order of weight:
//
//   built on  — the widest, opaque stroke: the material was used;
//   answered  — a narrower, half-strength stroke: a question or a number was taken up;
//   noted     — a hairline at low strength: it was mentioned and nothing was done with it.
//
// A lane with nothing built on and nothing answered is drawn as a dashed track: absence is drawn,
// not left out, because "where they don't work together" is half of what the page shows.
//
// Widths grow with the square root of the count and stop at a cap, so a busy lane cannot swallow
// the triangle; the exact counts stand in the readout, the band's card and the table floor.
import { PRACTICES, type PracticeId } from './v3'
import {
  KINDS,
  LOAD_BEARING,
  V3_SINCE,
  checkDeclaredCounts,
  closedHandoffs,
  countKinds,
  evidenceUrl,
  isolation,
  openHandoffs,
  pairCounts,
  practiceTotals,
  relationsSince,
  threads,
  type CountsCheck,
  type Handoff,
  type KindCounts,
  type PracticeTotals,
  type Relation,
  type RelayKind,
  type RelayState,
  type Thread,
} from './relay'

export interface Point {
  x: number
  y: number
}

/** The drawing's own box, in SVG user units — the viewBox. */
export const TRI_BOX = { w: 520, h: 480 } as const
export const NODE_R = 28
/** The corners, in the house order of the practices: the Field on top, the Atelier bottom left,
 *  the Studio bottom right. Fixed, so the same practice stands in the same place in both windows
 *  and on every day. */
export const NODE_AT: Readonly<Record<PracticeId, Point>> = {
  field: { x: 260, y: 96 },
  atelier: { x: 92, y: 386 },
  studio: { x: 428, y: 386 },
}

/** Distance from a corner's centre to where a lane starts, and from the taker's centre to the
 *  arrowhead's tip. The inner lanes of two sides leave a corner sixty degrees apart, so at a
 *  distance T along its axis a lane's target of width H stays clear of its neighbour's while
 *  T·sin60° − H·cos60° > H, i.e. T > √3·H; at the cap H is 35, so 66 leaves a margin. The test
 *  "holds all of that at the cap too" measures it with every lane at full width. */
export const TRIM = 66
export const ARROW_LEN = 10
/** Gap between the axis and the first stroke of a lane — each direction keeps to its own side. */
export const LANE_INNER = 4
export const STROKE_GAP = 2.5
/** Width of the dashed track an empty lane draws. */
export const VOID_W = 6
/** A lane's pointer target never narrows below this, so a thin lane can still be tapped. */
export const HIT_MIN = 22

export const KIND_SCALE: Readonly<Record<RelayKind, { base: number; min: number; max: number }>> = {
  built_on: { base: 3.5, min: 3.5, max: 12 },
  answered: { base: 2.25, min: 2.25, max: 7 },
  noted: { base: 0.9, min: 1, max: 3 },
}

const r1 = (v: number): number => Math.round(v * 10) / 10
const pt = (p: Point): string => `${r1(p.x)},${r1(p.y)}`
const add = (p: Point, q: Point, k = 1): Point => ({ x: p.x + q.x * k, y: p.y + q.y * k })

/** The stroke width a kind gets for a count: zero for none, otherwise the square-root scale
 *  between the kind's floor and its cap. Monotone in the count; never wider than the cap. */
export function strokeWidth(kind: RelayKind, count: number): number {
  if (!(count > 0)) return 0
  const s = KIND_SCALE[kind]
  return r1(Math.min(s.max, Math.max(s.min, s.base * Math.sqrt(count))))
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface BandStroke extends Segment {
  kind: RelayKind
  count: number
  width: number
  /** distance of the stroke's centre line from the axis, on the lane's own side */
  offset: number
}

export interface Band {
  id: string
  giver: PracticeId
  taker: PracticeId
  counts: KindCounts
  /** built on + answered */
  loadBearing: number
  total: number
  /** nothing built on and nothing answered in this direction */
  empty: boolean
  /** one per kind with a count, in the order built on → answered → noted */
  strokes: BandStroke[]
  /** the dashed track an empty lane draws; null when something load-bearing passed */
  void: Segment | null
  /** the arrowhead at the taker's end, as polygon points */
  arrow: string
  /** the pointer target, as polygon points — the lane's whole width, never narrower than HIT_MIN */
  hit: string
  /** the lane's centre at mid-length: where a keyboard focus anchors the readout */
  mid: Point
  /** the relations drawn in this lane, newest first */
  relationIds: string[]
}

export interface TriangleNode {
  practice: PracticeId
  x: number
  y: number
  r: number
  /** label baselines: the name, then the persona under it */
  nameY: number
  personaY: number
  totals: PracticeTotals
}

export interface TriangleModel {
  box: { w: number; h: number }
  since: string
  nodes: TriangleNode[]
  bands: Band[]
  isolation: { giver: PracticeId; taker: PracticeId }[]
  counts: KindCounts
  relationCount: number
}

function laneGeometry(giver: PracticeId, taker: PracticeId, counts: KindCounts) {
  const A = NODE_AT[giver]
  const B = NODE_AT[taker]
  const len = Math.hypot(B.x - A.x, B.y - A.y)
  const u = { x: (B.x - A.x) / len, y: (B.y - A.y) / len }
  // The lane's side. Reversing the direction flips u and therefore n, which is what puts the
  // two directions of a pair on opposite sides of the axis.
  const n = { x: -u.y, y: u.x }
  const start = add(A, u, TRIM)
  const tip = add(B, u, -TRIM)
  const end = add(tip, u, -ARROW_LEN)
  const segment = (offset: number): Segment => {
    const p = add(start, n, offset)
    const q = add(end, n, offset)
    return { x1: r1(p.x), y1: r1(p.y), x2: r1(q.x), y2: r1(q.y) }
  }

  const empty = LOAD_BEARING.every((k) => counts[k] === 0)
  let cursor = LANE_INNER
  let voidSeg: Segment | null = null
  if (empty) {
    voidSeg = segment(cursor + VOID_W / 2)
    cursor += VOID_W + STROKE_GAP
  }
  const strokes: BandStroke[] = []
  for (const kind of KINDS) {
    const width = strokeWidth(kind, counts[kind])
    if (width === 0) continue
    const offset = r1(cursor + width / 2)
    strokes.push({ kind, count: counts[kind], width, offset, ...segment(offset) })
    cursor += width + STROKE_GAP
  }
  const outer = cursor - STROKE_GAP
  const centre = (LANE_INNER + outer) / 2
  const arrow = [add(end, n, LANE_INNER), add(tip, n, centre), add(end, n, outer)].map(pt).join(' ')
  const hitOuter = Math.max(outer + 4, LANE_INNER + HIT_MIN)
  const hit = [add(start, n, 1), add(tip, n, 1), add(tip, n, hitOuter), add(start, n, hitOuter)].map(pt).join(' ')
  const midAxis = { x: (start.x + tip.x) / 2, y: (start.y + tip.y) / 2 }
  const mid = add(midAxis, n, centre)
  return { empty, strokes, voidSeg, arrow, hit, mid: { x: r1(mid.x), y: r1(mid.y) } }
}

/** The triangle for one window: every relation dated on or after `since`. */
export function buildTriangle(relations: Relation[], since: string): TriangleModel {
  const inWindow = relationsSince(relations, since)
  const totals = practiceTotals(inWindow)
  const nodes: TriangleNode[] = PRACTICES.map((practice) => {
    const at = NODE_AT[practice]
    // the top corner is labelled above itself, the bottom corners below — away from the lanes;
    // the gaps leave room for the larger type the stylesheet sets on a phone
    const above = at.y < TRI_BOX.h / 2
    return {
      practice,
      x: at.x,
      y: at.y,
      r: NODE_R,
      nameY: above ? at.y - NODE_R - 30 : at.y + NODE_R + 26,
      personaY: above ? at.y - NODE_R - 10 : at.y + NODE_R + 46,
      totals: totals[practice],
    }
  })
  const bands: Band[] = pairCounts(inWindow).map((pair) => {
    const g = laneGeometry(pair.giver, pair.taker, pair.counts)
    return {
      id: pair.id,
      giver: pair.giver,
      taker: pair.taker,
      counts: pair.counts,
      loadBearing: pair.loadBearing,
      total: pair.relations.length,
      empty: g.empty,
      strokes: g.strokes,
      void: g.voidSeg,
      arrow: g.arrow,
      hit: g.hit,
      mid: g.mid,
      relationIds: pair.relations.map((r) => r.id),
    }
  })
  return {
    box: { w: TRI_BOX.w, h: TRI_BOX.h },
    since,
    nodes,
    bands,
    isolation: isolation(inWindow),
    counts: countKinds(inWindow),
    relationCount: inWindow.length,
  }
}

/** "built on 3 · answered 0 · noted 2" — every kind, zeros included, so an absence is said. */
export function kindSummary(counts: KindCounts, labels: Record<RelayKind, string>, sep = ' · '): string {
  return KINDS.map((k) => `${labels[k]} ${counts[k]}`).join(sep)
}

/** An HTML id for a relation's row in the table floor. Relay ids are free strings; ids on the
 *  page are kept to a safe alphabet so a fragment link can never break. */
export const relationAnchor = (id: string): string => `rel-${id.replace(/[^A-Za-z0-9_-]/g, '-')}`
/** The id of a lane's group in the table floor — the no-script target of a lane's link. */
export const bandAnchor = (bandId: string): string => `relay-${bandId}`

export interface RelationRow {
  id: string
  anchor: string
  date: string
  kind: RelayKind
  giver: PracticeId
  taker: PracticeId
  what: string
  thread: string | null
  corrects: string | null
  /** set when `corrects` names another relation of the same relay — a link, not a guess */
  correctsAnchor: string | null
  giverHref: string | null
  takerHref: string | null
}

export function relationRows(relations: Relation[]): RelationRow[] {
  const ids = new Set(relations.map((r) => r.id))
  return relations.map((r) => ({
    id: r.id,
    anchor: relationAnchor(r.id),
    date: r.date,
    kind: r.kind,
    giver: r.giver,
    taker: r.taker,
    what: r.what,
    thread: r.thread,
    corrects: r.corrects,
    correctsAnchor: r.corrects && ids.has(r.corrects) && r.corrects !== r.id ? relationAnchor(r.corrects) : null,
    giverHref: evidenceUrl(r.giverRef),
    takerHref: evidenceUrl(r.takerRef),
  }))
}

export type WindowId = 'cycle' | 'v3'
export const WINDOWS: readonly WindowId[] = ['cycle', 'v3']
/** The window the server renders and a visitor first sees: the whole record of the shared
 *  question, of which the running cycle is the newest part. */
export const DEFAULT_WINDOW: WindowId = 'v3'

export interface RelayView {
  /** 'ok' once a relay that holds the contract has been mirrored; anything else draws no lanes */
  status: RelayState['status']
  /** why an invalid relay was not drawn — for the provenance line, never for the figure */
  reason: string | null
  generatedAt: string | null
  /** the date the handoffs' ages are counted to: the day the relay was generated */
  asOf: string | null
  period: { from: string; to: string } | null
  windows: Record<WindowId, TriangleModel>
  /** the whole record, whatever its dates — what the table floor lists, lane by lane */
  record: TriangleModel
  rows: RelationRow[]
  open: Handoff[]
  closed: Handoff[]
  threads: Thread[]
  check: CountsCheck
  skipped: number
}

/** Everything the page draws, from the relay state and the cycle's opening date
 *  (src/data/ecology/cycle.json `opened`). With no relay, both windows are empty models and the
 *  status says why — the figure then draws the corners and no lane at all. */
export function buildRelayView(state: RelayState, cycleOpened: string): RelayView {
  const relay = state.status === 'ok' ? state.relay : null
  const relations = relay?.relations ?? []
  const generatedAt = relay?.generatedAt || null
  const asOf = generatedAt && /^\d{4}-\d{2}-\d{2}/.test(generatedAt) ? generatedAt.slice(0, 10) : null
  return {
    status: state.status,
    reason: state.status === 'invalid' ? state.reason : null,
    generatedAt,
    asOf,
    period: relay?.period ?? null,
    windows: {
      // never earlier than v3: a cycle opened before the shared question would not be "this cycle"
      cycle: buildTriangle(relations, cycleOpened > V3_SINCE ? cycleOpened : V3_SINCE),
      v3: buildTriangle(relations, V3_SINCE),
    },
    record: buildTriangle(relations, ''),
    rows: relationRows(relations),
    open: openHandoffs(relay?.handoffs ?? []),
    closed: closedHandoffs(relay?.handoffs ?? []),
    threads: threads(relations),
    check: relay ? checkDeclaredCounts(relay) : { agrees: true, differences: [] },
    skipped: relay?.skipped ?? 0,
  }
}

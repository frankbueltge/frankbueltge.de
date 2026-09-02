// The Middle's partitur, as a MODEL (visual layer, Phase 3d, 2026-09-02) — the current exchange
// between the three practices in the ORIGINAL score's drawing language, computed here and drawn
// by the island src/components/ecology/MiddleScore.tsx.
//
// History: the first version (2026-09-01) drew plain lines and squares of its own; the
// architect's review pointed back at the site's first partitur (src/lib/begegnungen/score.ts, the
// port of the 2026-07-15 Zeichengrammatik) — the ruler, the lanes in the voices' recorded hues,
// the sign vocabulary, the flow currents, the numbered badges, the legend — and the builder of
// that evening emitted the grammar's OWN class vocabulary as an SVG string. Since 2026-09-02 the
// string is gone and the geometry is this model: the island renders the same classes (ruler,
// grat, lane, t-lane, t-note, mk-fill, mk, badge, flow, obl, hit, pr-<lane>) and
// src/styles/score-map.css inks them — the original's ink, not an imitation.
//
// What it lays out: one lane per practice; one object square per item the practice's current
// bulletin carries for its siblings, in bulletin order (ordinal — the ruler says so); a flow
// current from the writer's mark to a ring on every sibling lane the item names; two dashed
// obligation whiskers for an item carried for both; a numbered badge per mark, and the same
// number stands at the quoted item on the page — drawing and words cannot drift apart, because
// both derive from src/lib/ecology/middle.ts. Pure and deterministic: same voices ⇒ the same
// model, no clock, no randomness, no colour.
import { PRACTICES, type PracticeId } from './v3'
import type { MiddleVoice } from './middle'

/** The practices' lane ids in the score grammar are their personas' — that is what
 *  score-map.css's pr-* hues are named after. */
export const LANE_OF: Record<PracticeId, string> = {
  field: 'meridian',
  atelier: 'ulysses',
  studio: 'ensemble',
}

export interface MiddleBox {
  w: number
  rulerY: number
  laneX0: number
  spanX1: number
  laneY0: number
  laneGap: number
  height: number
}

const TITLE_MAX = 90

export const MIDDLE_BOX: Omit<MiddleBox, 'height'> = {
  w: 1440,
  rulerY: 54,
  laneX0: 230,
  spanX1: 1330,
  laneY0: 148,
  laneGap: 122,
}

/** The markdown a practice wrote is its own; a title or a card shows the words without the
 *  marks, and never re-flows them. */
export function plainText(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim()
}

/** The tooltip shows the practice's words, not its markdown — cut at a word, cut declared. */
export function markTitle(text: string): string {
  const plain = plainText(text)
  if (plain.length <= TITLE_MAX) return plain
  const cut = plain.slice(0, TITLE_MAX)
  const atWord = cut.slice(0, cut.lastIndexOf(' '))
  return `${atWord || cut} …`
}

/** The anchor an item's quoted text carries on the page — the score and the list must agree,
 *  so both derive it from here. */
export function itemAnchor(practice: PracticeId, index: number): string {
  return `middle-item-${practice}-${index + 1}`
}

/** The badge number a mark wears — page order, the same order the quoted list renders in,
 *  so the number in the drawing and the number beside the words are one count. */
export function itemNumbers(voices: MiddleVoice[]): Map<string, number> {
  const ordered = PRACTICES.flatMap(
    (p) => (voices.find((v) => v.practice === p)?.items ?? []).map((_, i) => itemAnchor(p, i)),
  )
  return new Map(ordered.map((anchor, i) => [anchor, i + 1]))
}

/** The original's flow curve, verbatim (score.ts flowPath) — the current leaves the writer's
 *  mark and lands short of the ring, arrowhead pointing at the addressed lane. */
export function flowPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const inset = 14
  const dirX = dx === 0 ? 1 : Math.sign(dx)
  const dirY = dy === 0 ? 1 : Math.sign(dy)
  const sx = x1 + dirX * inset
  const sy = y1 + dirY * inset * 0.3
  const ex = x2 - dirX * inset
  const ey = y2 - dirY * inset * 0.3
  const n = (v: number) => Number(v.toFixed(1))
  return `M${n(sx)} ${n(sy)} C ${n(x1 + dx * 0.55)} ${n(y1 + dy * 0.15)}, ${n(x2 - dx * 0.55)} ${n(y2 - dy * 0.15)}, ${n(ex)} ${n(ey)}`
}

export interface MiddleLane {
  practice: PracticeId
  /** the persona whose hue the lane wears (score-map.css `pr-<persona>`) */
  persona: string
  y: number
  /** no bulletin, or a bulletin without a section for the siblings — drawn thin and said */
  quiet: boolean
  count: number
}

/** The file an item was read from — the bulletin its practice mirrors. A figure that opens a card
 *  and does not name its source is asking to be believed. */
export function bulletinSource(practice: PracticeId): string {
  return `src/content/${practice}/BULLETIN.md`
}

export interface MiddleMark {
  /** the item's page anchor — the selection key, the href target, and what `dv:mark-selected` carries */
  id: string
  practice: PracticeId
  persona: string
  /** the mirrored bulletin this item was read from */
  source: string
  /** the item's index within its own bulletin */
  index: number
  /** the badge number — page order across all three bulletins */
  number: number
  /** ordinal slot along the ruler at the identity view */
  x: number
  y: number
  /** the item's first words, cut at a word and declared */
  title: string
  /** the item verbatim, as the practice wrote it (markdown marks and all) */
  text: string
  to: PracticeId[]
  /** carried for both siblings, naming neither */
  whisker: boolean
}

export interface MiddleFlow {
  markId: string
  persona: string
  from: PracticeId
  to: PracticeId
  x: number
  y1: number
  y2: number
}

export interface MiddleScoreModel {
  box: MiddleBox
  lanes: MiddleLane[]
  marks: MiddleMark[]
  flows: MiddleFlow[]
}

export function buildMiddleScoreModel(voices: MiddleVoice[]): MiddleScoreModel {
  const ordered = PRACTICES.map(
    (p) => voices.find((v) => v.practice === p) ?? { practice: p, present: false, items: [] },
  )
  const laneY = new Map<PracticeId, number>(PRACTICES.map((p, i) => [p, MIDDLE_BOX.laneY0 + i * MIDDLE_BOX.laneGap]))
  const bottomY = MIDDLE_BOX.laneY0 + (PRACTICES.length - 1) * MIDDLE_BOX.laneGap
  const box: MiddleBox = { ...MIDDLE_BOX, height: bottomY + 64 }
  const numbers = itemNumbers(voices)

  const lanes: MiddleLane[] = ordered.map((v) => ({
    practice: v.practice,
    persona: LANE_OF[v.practice],
    y: laneY.get(v.practice)!,
    quiet: !v.present || v.items.length === 0,
    count: v.items.length,
  }))

  const flat = ordered.flatMap((v) => v.items.map((item, index) => ({ item, index })))
  const usable = box.spanX1 - box.laneX0
  const stepX = flat.length > 0 ? usable / (flat.length + 1) : 0
  const xOf = (i: number) => Number((box.laneX0 + stepX * (i + 1)).toFixed(1))

  const marks: MiddleMark[] = flat.map(({ item, index }, i) => {
    const id = itemAnchor(item.from, index)
    return {
      id,
      practice: item.from,
      persona: LANE_OF[item.from],
      source: bulletinSource(item.from),
      index,
      number: numbers.get(id)!,
      x: xOf(i),
      y: laneY.get(item.from)!,
      title: markTitle(item.text),
      text: item.text,
      to: [...item.to],
      whisker: item.to.length === 0,
    }
  })

  const flows: MiddleFlow[] = marks.flatMap((m) =>
    m.to.map((to) => ({
      markId: m.id,
      persona: m.persona,
      from: m.practice,
      to,
      x: m.x,
      y1: m.y,
      y2: laneY.get(to)!,
    })),
  )

  return { box, lanes, marks, flows }
}

// ---------------------------------------------------------------- the view

export interface MiddleView {
  k: number
  x: number
}

export const MIDDLE_IDENTITY: MiddleView = { k: 1, x: 0 }

/** A mark's ruler position under the view — the ordinal ruler stretches, the lanes stay. */
export function viewX(x: number, view: MiddleView): number {
  return Number((x * view.k + view.x).toFixed(1))
}

export interface PlacedMiddleMark {
  mark: MiddleMark
  x: number
  /** false once the stretched ruler has carried this slot off the drawing's span */
  visible: boolean
}

export interface PlacedMiddleFlow extends MiddleFlow {
  x: number
  visible: boolean
}

export interface PlacedMiddle {
  marks: PlacedMiddleMark[]
  flows: PlacedMiddleFlow[]
  /** the graticule slots, at the same stretched positions as the marks that stand on them */
  graticules: number[]
}

/** Where everything stands under a view. Pure: the island re-renders from this and computes
 *  nothing of its own, so the server render and every zoomed frame come from one function. */
export function placeMiddle(model: MiddleScoreModel, view: MiddleView): PlacedMiddle {
  const { laneX0, spanX1 } = model.box
  const inside = (x: number) => x >= laneX0 - 1 && x <= spanX1 + 1
  const at = new Map(model.marks.map((m) => [m.id, viewX(m.x, view)]))
  return {
    marks: model.marks.map((mark) => {
      const x = at.get(mark.id)!
      return { mark, x, visible: inside(x) }
    }),
    flows: model.flows.map((flow) => {
      const x = at.get(flow.markId)!
      return { ...flow, x, visible: inside(x) }
    }),
    graticules: model.marks.map((m) => at.get(m.id)!).filter(inside),
  }
}

// ---------------------------------------------------------------- the table floor

export interface MiddleRow extends Record<string, string> {
  number: string
  voice: string
  addressed: string
  item: string
}

export interface MiddleRowWording {
  voiceName: (practice: PracticeId) => string
  addressedTo: (names: string[]) => string
  forBoth: string
}

/** The score's table rendition — nothing here is reachable only by hovering a mark. Page order,
 *  verbatim words without the markdown marks. */
export function middleRows(model: MiddleScoreModel, w: MiddleRowWording): MiddleRow[] {
  return model.marks.map((m) => ({
    number: String(m.number),
    voice: w.voiceName(m.practice),
    addressed: m.whisker ? w.forBoth : w.addressedTo(m.to.map((p) => w.voiceName(p))),
    item: plainText(m.text),
  }))
}

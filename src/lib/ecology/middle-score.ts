// The Middle's score (2026-09-01) — the current exchange drawn as a partitur.
//
// The first Middle had a score a reader could love: lanes, marks, crossings. The v3 rebuild
// replaced the ledger it drew with the bulletins' own traffic — this module gives the traffic
// its drawing back, from the same derivation the page already quotes (src/lib/ecology/middle.ts).
// One lane per practice, one mark per item a practice wrote down for its siblings, a drawn
// connector to every sibling the item names. No time axis is claimed: the horizontal order is
// bulletin order within the current session, and the caption says so.
//
// Same rules as every figure of this house: the model is derived, never typed; a quiet lane is
// drawn as quiet rather than dropped; and the geometry lives here, testable, while the component
// only draws it.
import { PRACTICES, type PracticeId } from './v3'
import type { MiddleVoice } from './middle'

export interface ScoreLane {
  practice: PracticeId
  y: number
  /** true when the practice's bulletin carries no siblings section (or no items) — drawn dashed */
  quiet: boolean
}

export interface ScoreMark {
  /** the id of the quoted item below the figure — the mark links there */
  anchor: string
  from: PracticeId
  to: PracticeId[]
  x: number
  /** the writer's lane */
  y: number
  /** the lane of every named sibling, resolved so the component draws without lookups */
  targetYs: number[]
  /** an item carried for both siblings names neither — drawn as whiskers, not connectors */
  both: boolean
  /** the item's first words, markdown marks stripped, for the mark's native tooltip */
  title: string
}

export interface MiddleScore {
  width: number
  height: number
  labelWidth: number
  lanes: ScoreLane[]
  marks: ScoreMark[]
}

const WIDTH = 760
const LABEL_WIDTH = 132
const PAD_RIGHT = 28
const LANE_TOP = 40
const LANE_GAP = 62
const TITLE_MAX = 90

/** The tooltip shows the practice's words, not its markdown — cut at a word, cut declared. */
export function markTitle(text: string): string {
  const plain = text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim()
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

export function buildMiddleScore(voices: MiddleVoice[]): MiddleScore {
  const ordered = PRACTICES.map(
    (p) => voices.find((v) => v.practice === p) ?? { practice: p, present: false, items: [] },
  )
  const laneY = new Map<PracticeId, number>(
    PRACTICES.map((p, i) => [p, LANE_TOP + i * LANE_GAP]),
  )
  const lanes: ScoreLane[] = ordered.map((v) => ({
    practice: v.practice,
    y: laneY.get(v.practice)!,
    quiet: !v.present || v.items.length === 0,
  }))

  const flat = ordered.flatMap((v) => v.items.map((item, index) => ({ item, index })))
  const usable = WIDTH - LABEL_WIDTH - PAD_RIGHT
  const step = flat.length > 0 ? usable / (flat.length + 1) : 0
  const marks: ScoreMark[] = flat.map(({ item, index }, i) => ({
    anchor: itemAnchor(item.from, index),
    from: item.from,
    to: item.to,
    x: LABEL_WIDTH + step * (i + 1),
    y: laneY.get(item.from)!,
    targetYs: item.to.map((t) => laneY.get(t)!),
    both: item.to.length === 0,
    title: markTitle(item.text),
  }))

  return {
    width: WIDTH,
    height: LANE_TOP + (PRACTICES.length - 1) * LANE_GAP + 42,
    labelWidth: LABEL_WIDTH,
    lanes,
    marks,
  }
}

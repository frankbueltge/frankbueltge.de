// The Middle's partitur (2026-09-01, redrawn the same day) — the current exchange in the
// ORIGINAL score's drawing language.
//
// The first version of this module drew plain lines and squares of its own; the architect's
// review pointed back at the site's first partitur (src/lib/begegnungen/score.ts, the port of
// the 2026-07-15 Zeichengrammatik) — the ruler, the lanes in the voices' recorded hues, the
// sign vocabulary, the flow currents, the numbered badges, the legend. So this builder emits
// that grammar's OWN class vocabulary (ruler, grat, lane, t-lane, t-note, mk-fill, mk, badge,
// flow, obl, hit, pr-<lane>) and lets src/styles/score-map.css ink it — the original's ink,
// not an imitation.
//
// What it draws: one lane per practice; one object square per item the practice's current
// bulletin carries for its siblings, in bulletin order (ordinal — the ruler says so); a flow
// current from the writer's mark to a ring on every sibling lane the item names; two dashed
// obligation whiskers for an item carried for both; a numbered badge per mark, and the same
// number stands at the quoted item below — drawing and words cannot drift apart, because both
// derive from src/lib/ecology/middle.ts. Every mark links to its quoted item and carries the
// item's own first words as its native tooltip. Pure and deterministic.
import { escapeXml } from '@/lib/dataviz/geometry'
import { PRACTICES, type PracticeId } from './v3'
import type { MiddleVoice } from './middle'

/** The practices' lane ids in the score grammar are their personas' — that is what
 *  score-map.css's pr-* hues are named after. */
export const LANE_OF: Record<PracticeId, string> = {
  field: 'meridian',
  atelier: 'ulysses',
  studio: 'ensemble',
}

const W = 1440
const RULER_Y = 54
const LANE_X0 = 230
const SPAN_X1 = 1330
const LANE_Y0 = 148
const LANE_GAP = 122
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
function flowPath(x1: number, y1: number, x2: number, y2: number): string {
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

export function buildMiddleScoreSvg(voices: MiddleVoice[]): string {
  const ordered = PRACTICES.map(
    (p) => voices.find((v) => v.practice === p) ?? { practice: p, present: false, items: [] },
  )
  const laneY = new Map<PracticeId, number>(PRACTICES.map((p, i) => [p, LANE_Y0 + i * LANE_GAP]))
  const bottomY = LANE_Y0 + (PRACTICES.length - 1) * LANE_GAP
  const height = bottomY + 64
  const numbers = itemNumbers(voices)

  const flat = ordered.flatMap((v) => v.items.map((item, index) => ({ item, index })))
  const usable = SPAN_X1 - LANE_X0
  const step = flat.length > 0 ? usable / (flat.length + 1) : 0
  const xOf = (i: number) => Number((LANE_X0 + step * (i + 1)).toFixed(1))

  const s: string[] = []
  s.push(
    `<svg viewBox="0 0 ${W} ${height}" role="img" aria-label="${escapeXml(
      'The current exchange between the three practices, drawn as a score',
    )}" xmlns="http://www.w3.org/2000/svg">`,
  )
  s.push(
    '<defs>' +
      '<marker id="mvs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto">' +
      '<path d="M1 1 L9 5 L1 9" fill="none" class="marker-stroke"/></marker>' +
      '</defs>',
  )

  // graticule at every mark slot (recessive chrome), then the ruler — ordinal, and it says so
  for (let i = 0; i < flat.length; i++) s.push(`<path class="grat" d="M${xOf(i)} ${RULER_Y + 14} V${bottomY + 20}"/>`)
  s.push(`<path class="ruler" d="M${LANE_X0} ${RULER_Y} H${SPAN_X1}"/>`)
  s.push(`<text class="t-note t-dim" x="${LANE_X0 + 2}" y="${RULER_Y + 20}">ordinal · bulletin order</text>`)
  s.push(`<text class="t-note t-dim" x="${SPAN_X1}" y="${RULER_Y + 20}" text-anchor="end">the current bulletins, as mirrored</text>`)

  // lanes, canonical order — a quiet bulletin draws thin and says so
  for (const v of ordered) {
    const lane = LANE_OF[v.practice]
    const y = laneY.get(v.practice)!
    const quiet = !v.present || v.items.length === 0
    s.push(`<path class="lane ${quiet ? 'lane-thin' : ''} pr-${lane}" d="M${LANE_X0} ${y} H${SPAN_X1}"/>`)
    s.push(`<text class="t-lane pr-${lane}" x="${LANE_X0 - 14}" y="${y - 16}" text-anchor="end">${escapeXml(lane.toUpperCase())}</text>`)
    s.push(
      `<text class="t-note t-dim" x="${LANE_X0 - 14}" y="${y + 2}" text-anchor="end">${escapeXml(
        quiet ? 'quiet this session' : v.practice,
      )}</text>`,
    )
  }

  // currents first, marks on top — a flow from the writer's mark to a ring on every named lane
  flat.forEach(({ item }, i) => {
    const x = xOf(i)
    const y = laneY.get(item.from)!
    const lane = LANE_OF[item.from]
    for (const t of item.to) {
      const ty = laneY.get(t)!
      s.push(`<path class="flow flow-down pr-${lane}" marker-end="url(#mvs-arrow)" d="${flowPath(x, y, x, ty)}"/>`)
      s.push(`<circle class="mk pr-${lane}" cx="${x}" cy="${ty}" r="5" fill="none"/>`)
    }
    if (item.to.length === 0) {
      // carried for both, naming neither — sustained toward both siblings, never arriving
      s.push(`<path class="obl pr-${lane}" d="M${x} ${y - 12} V${y - 34}"/>`)
      s.push(`<path class="obl pr-${lane}" d="M${x} ${y + 12} V${y + 34}"/>`)
    }
  })

  flat.forEach(({ item, index }, i) => {
    const x = xOf(i)
    const y = laneY.get(item.from)!
    const lane = LANE_OF[item.from]
    const anchor = itemAnchor(item.from, index)
    const n = numbers.get(anchor)!
    const title = markTitle(item.text)
    s.push(`<a href="#${anchor}" class="evt" aria-label="${escapeXml(title)}">`)
    s.push(`<title>${escapeXml(title)}</title>`)
    s.push(`<rect class="mk-fill pr-${lane}" x="${(x - 8).toFixed(1)}" y="${y - 8}" width="16" height="16"/>`)
    s.push(`<circle class="badge" cx="${(x - 22).toFixed(1)}" cy="${y - 26}" r="9"/>`)
    s.push(`<text class="badge-n" x="${(x - 22).toFixed(1)}" y="${(y - 22.8).toFixed(1)}" text-anchor="middle">${n}</text>`)
    s.push(`<rect class="hit" x="${(x - 26).toFixed(1)}" y="${y - 40}" width="52" height="80" fill="transparent"/>`)
    s.push('</a>')
  })

  s.push('</svg>')
  return s.join('')
}

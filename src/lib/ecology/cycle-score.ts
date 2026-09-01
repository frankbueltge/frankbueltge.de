// The cycle, drawn (2026-09-01) — a partitur of the running cycle for /ecology.
//
// Same drawing language as the site's original score (src/lib/begegnungen/score.ts, the port
// of the 2026-07-15 Zeichengrammatik): a day ruler, one lane per voice in its recorded hue,
// filled squares for objects that entered the record, hairline graticules, honest labels.
// It deliberately emits the SAME class vocabulary (ruler, grat, lane, t-lane, t-note, mk-fill,
// hit, pr-<lane>) so src/styles/score-map.css styles it — the original's ink, not a remake.
//
// What it draws is smaller than the original on purpose: one mark per ARTIFACT the current
// cycle has produced, placed by its own committed date on a true date scale (the original's
// ruler is ordinal and says so; this one is dated and says so). Every mark links to the
// artifact it draws and carries its title as the native tooltip. Pure and deterministic:
// same inputs ⇒ byte-identical SVG.
import { escapeXml } from '@/lib/dataviz/geometry'
import { PRACTICES, type PracticeId } from './v3'
import type { ArtifactEntry, CycleState } from './v3'

/** The practices' lane ids in the score grammar are their personas' — that is what
 *  score-map.css's pr-* hues are named after. */
const LANE_OF: Record<PracticeId, string> = {
  field: 'meridian',
  atelier: 'ulysses',
  studio: 'ensemble',
}

const W = 1440
const RULER_Y = 56
const LANE_X0 = 230
const SPAN_X1 = 1330
const LANE_Y0 = 138
const LANE_GAP = 96
const LABEL_MAX = 24

function dayIndex(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000)
}

function label(slug: string): string {
  const words = slug.replace(/-/g, ' ')
  if (words.length <= LABEL_MAX) return words
  const cut = words.slice(0, LABEL_MAX)
  return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}…`
}

export interface CycleScoreInput {
  cycle: CycleState
  /** the CURRENT cycle's artifacts only — the caller filters, this module draws */
  artifacts: ArtifactEntry[]
}

export function buildCycleScoreSvg({ cycle, artifacts }: CycleScoreInput): string {
  const dated = artifacts.filter((a) => a.date !== null)
  const d0 = dayIndex(cycle.opened)
  const dMax = Math.max(d0 + 1, ...dated.map((a) => dayIndex(a.date!)))
  const x = (date: string) =>
    LANE_X0 + ((dayIndex(date) - d0) / (dMax - d0)) * (SPAN_X1 - LANE_X0)
  const laneY = new Map<PracticeId, number>(
    PRACTICES.map((p, i) => [p, LANE_Y0 + i * LANE_GAP]),
  )
  const bottomY = LANE_Y0 + (PRACTICES.length - 1) * LANE_GAP
  const height = bottomY + 78

  const s: string[] = []
  s.push(
    `<svg viewBox="0 0 ${W} ${height}" role="img" aria-label="${escapeXml(
      'The running cycle: every artifact on its practice’s lane, placed by its own date',
    )}" xmlns="http://www.w3.org/2000/svg">`,
  )

  // day ruler — dated, and it says so (the original's is ordinal, and says that)
  s.push(`<path class="ruler" d="M${LANE_X0} ${RULER_Y} H${SPAN_X1}"/>`)
  const seenDates = new Set<string>()
  const tick = (date: string) => {
    if (seenDates.has(date)) return
    seenDates.add(date)
    const tx = x(date)
    s.push(`<path class="ruler" d="M${tx} ${RULER_Y - 6} V${RULER_Y + 6}"/>`)
    s.push(`<text class="t-note" x="${tx}" y="${RULER_Y - 14}" text-anchor="middle">${escapeXml(date)}</text>`)
  }
  tick(cycle.opened)
  for (const a of dated) tick(a.date!)
  s.push(`<text class="t-note t-dim" x="${LANE_X0 + 2}" y="${RULER_Y + 22}">dated · placed by the artifact’s own day</text>`)
  s.push(`<text class="t-note t-dim" x="${SPAN_X1}" y="${RULER_Y + 22}" text-anchor="end">opened ${escapeXml(cycle.opened)}</text>`)

  // graticules at every dated mark, original idiom
  for (const date of seenDates) {
    s.push(`<path class="grat" d="M${x(date)} ${RULER_Y + 16} V${bottomY + 24}"/>`)
  }

  // lanes, top to bottom in the canonical practice order
  for (const p of PRACTICES) {
    const lane = LANE_OF[p]
    const y = laneY.get(p)!
    const quiet = !dated.some((a) => a.practice === p)
    s.push(`<path class="lane ${quiet ? 'lane-thin' : ''} pr-${lane}" d="M${LANE_X0} ${y} H${SPAN_X1}"/>`)
    s.push(`<text class="t-lane pr-${lane}" x="${LANE_X0 - 14}" y="${y - 16}" text-anchor="end">${escapeXml(lane.toUpperCase())}</text>`)
    s.push(
      `<text class="t-note t-dim" x="${LANE_X0 - 14}" y="${y + 2}" text-anchor="end">${escapeXml(
        quiet ? 'no artifact yet this cycle' : p,
      )}</text>`,
    )
  }

  // marks: one filled square per artifact — the grammar's object sign; each links to the
  // artifact it draws, and the label under it is the artifact's own slug, cut at a word.
  // Two sessions can land on the same lane on the same day: later marks of such a pair step
  // right by a fixed offset, and their labels alternate below/above the lane, so neither the
  // squares nor the words overprint each other.
  const seenSlot = new Map<string, number>()
  dated.forEach((a) => {
    const slot = `${a.practice}:${a.date}`
    const nth = seenSlot.get(slot) ?? 0
    seenSlot.set(slot, nth + 1)
    const ax = x(a.date!) + nth * 26
    const y = laneY.get(a.practice)!
    const labelY = nth % 2 === 0 ? y + 30 : y - 22
    const lane = LANE_OF[a.practice]
    const title = `${a.date} · ${a.slug.replace(/-/g, ' ')}`
    s.push(`<a href="${escapeXml(a.href)}" class="evt" aria-label="${escapeXml(title)}">`)
    s.push(`<title>${escapeXml(title)}</title>`)
    s.push(`<rect class="mk-fill pr-${lane}" x="${(ax - 8).toFixed(1)}" y="${y - 8}" width="16" height="16"/>`)
    s.push(`<text class="t-note" x="${ax}" y="${labelY}" text-anchor="middle">${escapeXml(label(a.slug))}</text>`)
    s.push(`<rect class="hit" x="${(ax - 22).toFixed(1)}" y="${y - 30}" width="44" height="70" fill="transparent"/>`)
    s.push('</a>')
  })

  s.push('</svg>')
  return s.join('')
}

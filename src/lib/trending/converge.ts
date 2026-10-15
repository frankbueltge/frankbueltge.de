/** The convergence matrix — the day ledger's own claim, drawn (visual layer, 2026-09-03).
 *
 *  /trending says one thing above everything else: a topic is here because at least two
 *  INDEPENDENT sources carried it this morning. Between 2026-09-01 and 2026-09-03 that claim had
 *  no figure at all — only a table of comma-separated platform names, in which "carried by four"
 *  and "carried by two" look exactly alike. This model turns the crossing into a grid: one row
 *  per converging topic, one column per source that carried at least one of them, and a mark
 *  where the two meet. The row's length in marks IS its platform count, so the page's headline
 *  number and the drawing cannot disagree.
 *
 *  Pure geometry, no clock, no randomness: same day file in, byte-identical model out (duty 1 of
 *  .claude/rules/dataviz-figures.md). Nothing here reads a config, formats a date or decides a
 *  colour — the island mounts what this returns and the frame supplies every word.
 *
 *  What a mark's SIZE means, and why it is honest. Each source states its own rank for a topic
 *  (Google Trends' #3, Wikipedia's #58). Ranks are not comparable ACROSS sources — a list of 300
 *  and a list of 25 are different rulers — so the weight here is normalised WITHIN each column:
 *  a mark is heavy when the topic sits high in THAT source's own list, light when it sits low.
 *  The three steps are quantised rather than continuous, so every appearance decision can live in
 *  the stylesheet as a class instead of a style attribute the CSP would drop anyway.
 */
import { platformLabel, signalText } from './format'
import type { TrendingDay, TrendingLink, TrendingTopic, TrendingTopicSignal } from './types'

/** The drawing's fixed frame, in viewBox units. The figure box keeps a floor width and the frame
 *  scrolls (the score's habit): a twenty-column grid squeezed into a phone is a grey smear. */
export const CONVERGE = {
  width: 920,
  /** left gutter, where the topic labels are lettered */
  gutter: 300,
  /** the column-head band above the first row */
  headHeight: 34,
  rowHeight: 34,
  /** below the last row: the column totals */
  footHeight: 22,
  /** at most this many topics are drawn; the rest stay in the table below */
  maxRows: 14,
  /** a column narrower than this letters its head at an angle instead of straight */
  straightLabelWidth: 74,
  /** characters a row label letters before it is cut — SVG text has no text-overflow, and the
   *  gutter is a fixed 300 units wide. The whole label stays one hover and one table away. */
  labelChars: 34,
  radius: { light: 4.5, medium: 6.5, heavy: 8.5 },
} as const

export type ConvergeWeight = 1 | 2 | 3

export interface ConvergeMark {
  /** stable within one figure: `<topic id>::<source id>` */
  key: string
  topic: string
  source: string
  cx: number
  cy: number
  r: number
  /** 3 = high in that source's own list, 1 = low in it */
  weight: ConvergeWeight
  rank: number
  /** the source's OWN label for this topic — never the row's label */
  label: string
  /** "Google Trends US 2,000+ searches" — the source's own signal, spelled by format.ts */
  detail: string
  url: string | null
}

export interface ConvergeRow {
  id: string
  label: string
  /** the label as it is lettered in the gutter — cut with an ellipsis where it would not fit */
  labelShort: string
  url: string | null
  y: number
  /** the baseline the label letters on */
  labelY: number
  height: number
  platformCount: number
  daysHot: number
  firstSeen: string
  marks: ConvergeMark[]
  /** the platforms of this row, in the ledger's own source order */
  sources: string[]
  /** the headlines the crossing kept for this topic — the card's receipts */
  links: TrendingLink[]
}

export interface ConvergeColumn {
  id: string
  label: string
  x: number
  width: number
  /** the x a mark in this column centres on */
  cx: number
  /** how many of the drawn topics this source carried */
  carried: number
  labelX: number
  labelY: number
  /** degrees; 0 means the head letters straight */
  rotate: number
  /** SVG text-anchor for the head */
  anchor: 'middle' | 'start'
}

export interface ConvergeModel {
  width: number
  height: number
  gutter: number
  headHeight: number
  rowHeight: number
  rows: ConvergeRow[]
  columns: ConvergeColumn[]
  /** y of the rule under the column heads */
  headRuleY: number
  /** y the column totals letter on */
  footY: number
  /** converging topics the drawing left to the table */
  more: number
}

/** The signals of a topic, one per source, keyed by source id — a source that reported the same
 *  topic twice (two geos, say) keeps its best rank, because that is the rank the ledger scored on. */
function bestPerSource(topic: TrendingTopic): Map<string, TrendingTopicSignal> {
  const best = new Map<string, TrendingTopicSignal>()
  for (const s of topic.signals) {
    const held = best.get(s.source)
    if (!held || s.rank < held.rank) best.set(s.source, s)
  }
  return best
}

/** Three steps within ONE column's own ranks: heaviest third, middle third, lightest third.
 *  A column carrying a single topic gives it the middle step — one mark cannot be "high in the
 *  list" relative to nothing, and drawing it heaviest would claim a comparison never made. */
function weigh(rank: number, ranksInColumn: number[]): ConvergeWeight {
  if (ranksInColumn.length < 2) return 2
  const lo = Math.min(...ranksInColumn)
  const hi = Math.max(...ranksInColumn)
  if (hi === lo) return 2
  const share = (rank - lo) / (hi - lo) // 0 = best rank in this column, 1 = worst
  if (share <= 1 / 3) return 3
  if (share <= 2 / 3) return 2
  return 1
}

/** The gutter's own budget. An ellipsis is added only where something was actually removed, so a
 *  label that fits is never dressed as if it had been cut. */
function cut(label: string): string {
  return label.length <= CONVERGE.labelChars ? label : `${label.slice(0, CONVERGE.labelChars - 1).trimEnd()}…`
}

function radiusOf(weight: ConvergeWeight): number {
  return weight === 3 ? CONVERGE.radius.heavy : weight === 2 ? CONVERGE.radius.medium : CONVERGE.radius.light
}

/**
 * The matrix of one committed day. Rows are the converging topics in the file's own order (score
 * desc), columns are the sources that carried at least one DRAWN topic, in the ledger's source
 * order — so the columns read left to right the way the "By source" section below reads.
 */
export function convergeModel(day: TrendingDay, maxRows: number = CONVERGE.maxRows): ConvergeModel {
  const converging = day.topics.filter((t) => t.platform_count >= 2)
  const drawn = converging.slice(0, maxRows)
  const signalsOf = new Map(drawn.map((t) => [t.id, bestPerSource(t)]))

  const order = day.sources.map((s) => s.id)
  const carrying = order.filter((id) => drawn.some((t) => signalsOf.get(t.id)!.has(id)))

  const colWidth = carrying.length ? (CONVERGE.width - CONVERGE.gutter) / carrying.length : 0
  const straight = colWidth >= CONVERGE.straightLabelWidth
  const headRuleY = CONVERGE.headHeight

  const columns: ConvergeColumn[] = carrying.map((id, i) => {
    const x = CONVERGE.gutter + i * colWidth
    const cx = x + colWidth / 2
    return {
      id,
      label: platformLabel(id),
      x,
      width: colWidth,
      cx,
      carried: drawn.filter((t) => signalsOf.get(t.id)!.has(id)).length,
      labelX: straight ? cx : cx - 4,
      labelY: headRuleY - 10,
      rotate: straight ? 0 : -38,
      anchor: straight ? 'middle' : 'start',
    }
  })

  // The ranks each column actually carries, so a mark's weight is read against its own source's
  // list and never against a neighbour's differently sized one.
  const ranksPerColumn = new Map<string, number[]>(
    carrying.map((id) => [
      id,
      drawn.map((t) => signalsOf.get(t.id)!.get(id)?.rank).filter((r): r is number => r !== undefined),
    ]),
  )

  const rows: ConvergeRow[] = drawn.map((t, i) => {
    const y = headRuleY + i * CONVERGE.rowHeight
    const cy = y + CONVERGE.rowHeight / 2
    const best = signalsOf.get(t.id)!
    const marks: ConvergeMark[] = carrying.flatMap((id) => {
      const signal = best.get(id)
      if (!signal) return []
      const weight = weigh(signal.rank, ranksPerColumn.get(id) ?? [])
      const column = columns.find((c) => c.id === id)!
      return [
        {
          key: `${t.id}::${id}`,
          topic: t.id,
          source: id,
          cx: column.cx,
          cy,
          r: radiusOf(weight),
          weight,
          rank: signal.rank,
          label: signal.label,
          detail: signalText(signal),
          url: signal.url,
        },
      ]
    })
    return {
      id: t.id,
      label: t.label,
      labelShort: cut(t.label),
      url: topicUrl(t),
      y,
      labelY: cy + 4,
      height: CONVERGE.rowHeight,
      platformCount: t.platform_count,
      daysHot: t.days_hot,
      firstSeen: t.first_seen,
      marks,
      sources: carrying.filter((id) => best.has(id)),
      links: t.links,
    }
  })

  const height = headRuleY + rows.length * CONVERGE.rowHeight + CONVERGE.footHeight
  return {
    width: CONVERGE.width,
    height,
    gutter: CONVERGE.gutter,
    headHeight: CONVERGE.headHeight,
    rowHeight: CONVERGE.rowHeight,
    rows,
    columns,
    headRuleY,
    footY: headRuleY + rows.length * CONVERGE.rowHeight + 15,
    more: converging.length - drawn.length,
  }
}

/** Where a topic's own row label points: its Wikipedia article where the crossing found one,
 *  otherwise the first signal that carries a link. Same rule as view.ts's topicRow, kept here so
 *  the drawing and the table never disagree about a topic's destination. */
export function topicUrl(t: TrendingTopic): string | null {
  if (t.wikipedia) {
    return `https://${t.wikipedia.lang}.wikipedia.org/wiki/${encodeURIComponent(t.wikipedia.article.replace(/ /g, '_'))}`
  }
  return t.signals.find((s) => s.url)?.url ?? null
}

/** Every mark of the matrix in reading order — rows top to bottom, marks left to right. The
 *  keyboard walk is built over this, and the segments are the rows. */
export function convergeWalkOrder(model: ConvergeModel): ConvergeMark[] {
  return model.rows.flatMap((r) => r.marks)
}

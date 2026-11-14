/** The reading aids of the day ledger (2026-11-14): the numbers of the morning, the ranked
 *  crossings, what stayed across mornings, and the archive as a calendar.
 *
 *  Until this day /trending answered "what is the web looking at?" with a grid and thirty-four
 *  lists, and a reader had to assemble the answer. These models put the answer first: how much
 *  was read, how much of it crossed, which topics crossed widest, and which of them the ledger
 *  has been carrying for days. Nothing here measures anything new. Every number is counted out
 *  of the committed day files, so the page and the JSON edition cannot disagree.
 *
 *  Pure: no clock, no randomness, no config. "The last fourteen mornings" means the last
 *  fourteen COMMITTED days up to the page's own day, which is also what the pipeline's memory
 *  reads when it writes `first_seen` and `days_hot`.
 */
import { topicUrl } from './converge'
import { fmtDateShort, platformLabel } from './format'
import { sameTopic } from './memory'
import type { TrendingDay, TrendingTopic } from './types'

/** The crossings of a day, in the file's own order (score descending). */
function convergingTopics(day: TrendingDay): TrendingTopic[] {
  return day.topics.filter((t) => t.platform_count >= 2)
}

// ─────────────────────────────────────────────────────────────────────────────
// The numbers of the morning
// ─────────────────────────────────────────────────────────────────────────────

export interface DayStats {
  /** every signal the sources reported: the sum of their own counts */
  signals: number
  sourcesOk: number
  sourcesTotal: number
  /** topics carried by two or more independent sources */
  converging: number
  /** how many sources carried the widest crossing; 0 when nothing crossed */
  widest: number
  /** crossings the ledger had first seen on an earlier morning */
  seenBefore: number
}

export function dayStats(day: TrendingDay): DayStats {
  const crossings = convergingTopics(day)
  return {
    signals: day.sources.reduce((acc, s) => acc + s.count, 0),
    sourcesOk: day.summary.sources_ok,
    sourcesTotal: day.summary.sources_total,
    converging: crossings.length,
    widest: crossings.reduce((acc, t) => Math.max(acc, t.platform_count), 0),
    seenBefore: crossings.filter((t) => t.first_seen < day.date).length,
  }
}

export interface StatPoint extends DayStats {
  date: string
}

/** The same numbers for the last `n` committed days up to and including `date`, oldest first.
 *  A day with no file is absent, never a zero: the line is as long as the archive. */
export function statSeries(days: readonly TrendingDay[], date: string, n = 30): StatPoint[] {
  return [...days]
    .filter((d) => d.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-n)
    .map((d) => ({ date: d.date, ...dayStats(d) }))
}

export const TILE_SPARK = { width: 96, height: 22, pad: 2 } as const

export interface TileSpark {
  width: number
  height: number
  /** the polyline through the days, empty when there is nothing to draw */
  d: string
  /** the newest day, for the dot that ends the line */
  last: { x: number; y: number } | null
  /** the zero the line stands on: these are counts, so the scale starts at nothing */
  baseY: number
  runs: number
  min: number
  max: number
}

/** A run of counts as a line at the size of a word, scaled from ZERO to its own maximum. A count
 *  drawn from its own minimum would turn "33 of 34 sources" against "32 of 34" into a cliff. */
export function tileSpark(values: readonly number[], width: number = TILE_SPARK.width, height: number = TILE_SPARK.height): TileSpark {
  const pad = TILE_SPARK.pad
  const runs = values.length
  const baseY = height - pad
  if (runs === 0) return { width, height, d: '', last: null, baseY, runs, min: 0, max: 0 }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = height - pad * 2
  const xs = runs === 1 ? [width / 2] : values.map((_, i) => pad + (i / (runs - 1)) * (width - pad * 2))
  const ys = values.map((v) => (max > 0 ? baseY - (v / max) * span : baseY))
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(ys[i]!)}`).join(' ')
  return { width, height, d, last: { x: round(xs[runs - 1]!), y: round(ys[runs - 1]!) }, baseY, runs, min, max }
}

// ─────────────────────────────────────────────────────────────────────────────
// The crossings, ranked
// ─────────────────────────────────────────────────────────────────────────────

export interface LeadSource {
  id: string
  label: string
}

export interface LeadRow {
  id: string
  /** 1-based position in the file's own order */
  rank: number
  label: string
  url: string | null
  /** how many independent sources carried it: the length of its bar, in sources */
  platformCount: number
  /** those sources, in the ledger's own source order */
  sources: LeadSource[]
  daysHot: number
  firstSeen: string
  /** true when the ledger first saw this topic before this day */
  seenBefore: boolean
}

/** Every crossing of the day as a ranked row. The order is the file's (platforms, then rank
 *  within each of them), so this list, the grid and the table below can never disagree. */
export function leadRows(day: TrendingDay): LeadRow[] {
  const order = new Map(day.sources.map((s, i) => [s.id, i]))
  const position = (id: string) => order.get(id) ?? Number.MAX_SAFE_INTEGER
  return convergingTopics(day).map((t, i) => ({
    id: t.id,
    rank: i + 1,
    label: t.label,
    url: topicUrl(t),
    platformCount: t.platform_count,
    sources: [...t.platforms]
      .sort((a, b) => position(a) - position(b) || a.localeCompare(b))
      .map((id) => ({ id, label: platformLabel(id) })),
    daysHot: t.days_hot,
    firstSeen: t.first_seen,
    seenBefore: t.first_seen < day.date,
  }))
}

/** How long the ledger has known a crossing, in the pipeline's own two numbers: `days_hot`
 *  counts the unbroken run of mornings up to this one, `first_seen` the earliest morning in the
 *  archive. A topic that returns after a gap has a run of one and an earlier first sighting, and
 *  the line says exactly that instead of calling it new. */
export function ageText(row: Pick<LeadRow, 'seenBefore' | 'daysHot' | 'firstSeen'>): string {
  if (!row.seenBefore) return 'new this morning'
  if (row.daysHot >= 2) return `${row.daysHot} mornings in a row · first seen ${fmtDateShort(row.firstSeen)}`
  return `back again · first seen ${fmtDateShort(row.firstSeen)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// What stayed
// ─────────────────────────────────────────────────────────────────────────────

/** Three steps for a mark, by how many sources carried the topic that morning. */
export type StayWeight = 1 | 2 | 3

/** Where the steps begin. A crossing needs two sources, so the lightest step starts there. */
export const STAY_STEPS = { light: 2, medium: 3, heavy: 5 } as const

export function stayWeight(platformCount: number): StayWeight {
  if (platformCount >= STAY_STEPS.heavy) return 3
  if (platformCount >= STAY_STEPS.medium) return 2
  return 1
}

export interface StayedCell {
  date: string
  /** sources that carried the topic on that morning; null when it did not cross */
  n: number | null
  weight: StayWeight | null
}

export interface StayedRow {
  /** the id of its most recent crossing, where the row is anchored */
  id: string
  /** the label of that crossing */
  label: string
  url: string | null
  cells: StayedCell[]
  /** mornings inside the window on which it crossed */
  mornings: number
  /** the most sources it reached on one of them */
  peak: number
  /** its most recent crossing */
  last: string
  /** true when it crossed on the page's own day */
  onDay: boolean
}

export interface StayedModel {
  /** the committed days of the window, oldest first */
  dates: string[]
  rows: StayedRow[]
  /** topics that qualify but were left to the table */
  more: number
  /** every topic that qualifies */
  total: number
}

/**
 * The topics that crossed on at least two mornings of the window, one row each, one cell per
 * committed day.
 *
 * A TOPIC IS THE SAME TOPIC ACROSS MORNINGS BY THE LEDGER'S OWN MEMORY RULE (memory.ts): the same
 * id, or labels that share enough of their words. That is the rule the pipeline asks by when it
 * writes `days_hot`, so a row here and the "N mornings in a row" beside a crossing are two
 * readings of one fact. Matching by id alone, the first version of this figure, left out more
 * than a quarter of the runs the ledger counts, because a topic is often named by another source
 * on its second morning.
 *
 * A row is ANCHORED at the most recent morning of its topic and looks back from there, exactly as
 * the memory does: every earlier morning is asked whether it carried the anchor's topic, never
 * whether it carried something that resembles yesterday's resemblance. An earlier topic that an
 * anchor has claimed does not open a row of its own. Where several topics of one morning match,
 * the cell takes the one with the anchor's id, otherwise the widest.
 *
 * Order: the most recent crossing first, then the more mornings, then the wider peak, then the
 * label, so the rows a reader meets first are the ones still alive.
 */
export function stayedModel(days: readonly TrendingDay[], date: string, window = 14, maxRows = 12): StayedModel {
  const span = [...days]
    .filter((d) => d.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-window)
  const dates = span.map((d) => d.date)
  const crossings = span.map(convergingTopics)

  const key = (day: string, id: string) => `${day}\u0000${id}`
  const claimed = new Set<string>()
  const all: StayedRow[] = []

  for (let i = span.length - 1; i >= 0; i--) {
    for (const anchor of crossings[i]!) {
      if (claimed.has(key(dates[i]!, anchor.id))) continue
      const byDate = new Map<string, number>([[dates[i]!, anchor.platform_count]])
      for (let j = i - 1; j >= 0; j--) {
        const matches = crossings[j]!.filter((t) => sameTopic(anchor, t))
        if (matches.length === 0) continue
        for (const m of matches) claimed.add(key(dates[j]!, m.id))
        const held =
          matches.find((t) => t.id === anchor.id) ??
          matches.reduce((a, b) => (b.platform_count > a.platform_count ? b : a))
        byDate.set(dates[j]!, held.platform_count)
      }
      if (byDate.size < 2) continue
      all.push({
        id: anchor.id,
        label: anchor.label,
        url: topicUrl(anchor),
        cells: dates.map((d) => {
          const n = byDate.get(d) ?? null
          return { date: d, n, weight: n === null ? null : stayWeight(n) }
        }),
        mornings: byDate.size,
        peak: Math.max(...byDate.values()),
        last: dates[i]!,
        onDay: dates[i] === date,
      })
    }
  }

  all.sort(
    (a, b) =>
      b.last.localeCompare(a.last) || b.mornings - a.mornings || b.peak - a.peak || a.label.localeCompare(b.label),
  )
  return { dates, rows: all.slice(0, maxRows), more: Math.max(0, all.length - maxRows), total: all.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// The archive, as a calendar
// ─────────────────────────────────────────────────────────────────────────────

/** 0 = no committed day; 1..4 = the quarter of the archive's own counts the day falls in. */
export type CalendarLevel = 0 | 1 | 2 | 3 | 4

export interface CalendarCell {
  date: string
  dayOfMonth: number
  /** topics on two or more sources that morning; null when no day file was committed */
  converging: number | null
  level: CalendarLevel
}

export interface CalendarMonth {
  /** "2026-11" */
  key: string
  /** "November 2026" */
  label: string
  /** Monday-first weeks; null pads the days before the first and after the last of the month */
  weeks: (CalendarCell | null)[][]
  /** committed days in this month */
  committed: number
}

export interface CalendarModel {
  /** newest month first */
  months: CalendarMonth[]
  /** the three cut points between the four shades, so the legend can state them */
  cuts: [number, number, number]
  days: number
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** The count at a share of the sorted list: the nearest-rank quantile, which is always a value
 *  that actually occurred. */
function quantile(sorted: readonly number[], share: number): number {
  if (sorted.length === 0) return 0
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil(share * sorted.length) - 1))
  return sorted[i]!
}

export function calendarLevel(n: number, cuts: readonly [number, number, number]): CalendarLevel {
  if (n <= cuts[0]) return 1
  if (n <= cuts[1]) return 2
  if (n <= cuts[2]) return 3
  return 4
}

/**
 * Every committed day placed in its month, shaded by how many topics crossed that morning.
 *
 * THE SHADES ARE QUARTERS OF THE ARCHIVE'S OWN COUNTS, not fixed thresholds: the ledger grew from
 * eight sources to thirty-four, and a fixed scale would either paint the early months blank or
 * the late ones solid. Quarters keep four shades in use whatever the archive holds, and the
 * legend prints the cut points so a shade can be read back into a number.
 */
export function archiveCalendar(days: readonly TrendingDay[]): CalendarModel {
  const counts = new Map(days.map((d) => [d.date, convergingTopics(d).length]))
  const sorted = [...counts.values()].sort((a, b) => a - b)
  const cuts: [number, number, number] = [quantile(sorted, 0.25), quantile(sorted, 0.5), quantile(sorted, 0.75)]

  const monthKeys = [...new Set([...counts.keys()].map((d) => d.slice(0, 7)))].sort().reverse()
  const months = monthKeys.map((key) => {
    const [y, m] = key.split('-').map(Number) as [number, number]
    const first = new Date(Date.UTC(y, m - 1, 1))
    const length = new Date(Date.UTC(y, m, 0)).getUTCDate()
    // Monday-first: getUTCDay() is 0 for Sunday.
    const lead = (first.getUTCDay() + 6) % 7
    const slots: (CalendarCell | null)[] = Array.from({ length: lead }, () => null)
    for (let dom = 1; dom <= length; dom++) {
      const date = `${key}-${String(dom).padStart(2, '0')}`
      const converging = counts.get(date) ?? null
      slots.push({ date, dayOfMonth: dom, converging, level: converging === null ? 0 : calendarLevel(converging, cuts) })
    }
    while (slots.length % 7 !== 0) slots.push(null)
    const weeks: (CalendarCell | null)[][] = []
    for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7))
    return {
      key,
      label: MONTH_LABEL.format(first),
      weeks,
      committed: [...counts.keys()].filter((d) => d.startsWith(key)).length,
    }
  })

  return { months, cuts, days: counts.size }
}

/** Two decimals: enough for a line the size of a word, and it keeps the built markup
 *  byte-identical run to run instead of carrying floating-point noise into the page. */
function round(n: number): number {
  return Math.round(n * 100) / 100
}

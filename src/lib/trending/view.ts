/** View models for the trending page — derived, never hand-written, so a number on the page
 *  is always the committed file's number. Pure functions, unit-tested. */
import { compact, platformLabel, signalText } from './format'
import { AUDIENCE_CLASSES, type AudienceClass, type TrendingAudience, type TrendingDay, type TrendingLink, type TrendingTopic } from './types'

export interface ConvergingRow {
  id: string
  label: string
  url: string | null
  platforms: string[]
  platformsText: string
  signalsText: string
  firstSeen: string
  daysHot: number
  category: string | null
  links: TrendingLink[]
}

/** Topics on two or more platforms, in the file's order (score desc, label asc), capped. */
export function convergingRows(day: TrendingDay, max = 40): ConvergingRow[] {
  return day.topics
    .filter((t) => t.platform_count >= 2)
    .slice(0, max)
    .map(topicRow)
}

export function topicRow(t: TrendingTopic): ConvergingRow {
  const url = t.wikipedia
    ? `https://${t.wikipedia.lang}.wikipedia.org/wiki/${encodeURIComponent(t.wikipedia.article.replace(/ /g, '_'))}`
    : (t.signals.find((s) => s.url)?.url ?? null)
  return {
    id: t.id,
    label: t.label,
    url,
    platforms: t.platforms,
    platformsText: t.platforms.map(platformLabel).join(' · '),
    signalsText: t.signals.map(signalText).join(' · '),
    firstSeen: t.first_seen,
    daysHot: t.days_hot,
    category: t.category,
    links: t.links,
  }
}

export interface SourceColumnSignal {
  label: string
  url: string | null
  geo: string | null
  magnitudeText: string
}

export interface SourceColumn {
  id: string
  name: string
  url: string
  status: 'ok' | 'partial' | 'unavailable'
  note: string
  asOf: string | null
  count: number
  signals: SourceColumnSignal[]
}

/** One column per source in the file's order, the top `top` signals of each. */
export function sourceColumns(day: TrendingDay, top = 15): SourceColumn[] {
  return day.sources.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    status: s.status,
    note: s.note,
    asOf: s.as_of,
    count: s.count,
    signals: (day.signals[s.id] ?? []).slice(0, top).map((sig) => ({
      label: sig.label,
      url: sig.url,
      geo: sig.geo,
      magnitudeText: sig.magnitude === null || sig.magnitude_unit === 'rank' ? `#${sig.rank}` : `${compact(sig.magnitude)}${sig.magnitude_unit === 'approx_searches' ? '+' : ''}`,
    })),
  }))
}

export interface StripSegment {
  cls: AudienceClass
  y: number
  h: number
  n: number
}

export interface StripBar {
  day: string
  x: number
  /** null when that day's edge count is unavailable — drawn as a hollow tick, never as zero */
  total: number | null
  segments: StripSegment[]
}

export interface StripModel {
  width: number
  height: number
  barWidth: number
  gap: number
  max: number
  bars: StripBar[]
  /** class → total over the drawn window, for the legend */
  totals: Record<AudienceClass, number>
}

/** The last `n` audience days as stacked bars, oldest left, pure geometry. Missing days
 *  (no file) are not drawn; unavailable days are drawn as hollow ticks. */
export function audienceStrip(days: TrendingAudience[], n = 30, width = 640, height = 96): StripModel {
  const window = [...days].sort((a, b) => a.day.localeCompare(b.day)).slice(-n)
  const gap = 3
  const barWidth = window.length ? Math.max(4, (width - gap * (window.length - 1)) / window.length) : 0
  const totals = Object.fromEntries(AUDIENCE_CLASSES.map((c) => [c, 0])) as Record<AudienceClass, number>
  const counted = window.map((d) => {
    if (d.edge.status !== 'ok' || !d.edge.classes) return { day: d.day, total: null as number | null, byClass: null as Record<AudienceClass, number> | null }
    const byClass = Object.fromEntries(AUDIENCE_CLASSES.map((c) => [c, d.edge.classes?.[c] ?? 0])) as Record<AudienceClass, number>
    for (const c of AUDIENCE_CLASSES) totals[c] += byClass[c]
    const total = AUDIENCE_CLASSES.reduce((acc, c) => acc + byClass[c], 0)
    return { day: d.day, total, byClass }
  })
  const max = Math.max(0, ...counted.map((c) => c.total ?? 0))
  const bars: StripBar[] = counted.map((c, i) => {
    const x = i * (barWidth + gap)
    if (c.total === null || !c.byClass) return { day: c.day, x, total: null, segments: [] }
    let y = height
    const segments: StripSegment[] = []
    for (const cls of AUDIENCE_CLASSES) {
      const nCls = c.byClass[cls]
      if (nCls <= 0) continue
      const h = max > 0 ? (nCls / max) * height : 0
      y -= h
      segments.push({ cls, y, h, n: nCls })
    }
    return { day: c.day, x, total: c.total, segments }
  })
  return { width, height, barWidth, gap, max, bars, totals }
}

export interface AudienceTableRow extends Record<string, string | number> {
  day: string
  total: string
  browser: string
  search: string
  'ai-retrieval': string
  'ai-user-fetch': string
  'ai-training': string
  'other-bot': string
  pageviews: string
}

/** The always-on table under the strip: one row per audience file, newest first. */
export function audienceTableRows(days: TrendingAudience[]): AudienceTableRow[] {
  return [...days]
    .sort((a, b) => b.day.localeCompare(a.day))
    .map((d) => {
      const ok = d.edge.status === 'ok'
      const cell = (c: AudienceClass) => (ok ? compact(d.edge.classes?.[c] ?? 0) : 'standby')
      return {
        day: d.day,
        total: ok ? compact(d.edge.total) : 'standby',
        browser: cell('browser'),
        search: cell('search'),
        'ai-retrieval': cell('ai-retrieval'),
        'ai-user-fetch': cell('ai-user-fetch'),
        'ai-training': cell('ai-training'),
        'other-bot': cell('other-bot'),
        pageviews: d.umami.status === 'ok' ? compact(d.umami.pageviews) : 'standby',
      }
    })
}

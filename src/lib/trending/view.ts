/** View models for the trending page — derived, never hand-written, so a number on the page
 *  is always the committed file's number. Pure functions, unit-tested. */
import { compact, magnitudeOf, platformLabel, signalText } from './format'
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
  /** the source's own number WITH its unit — "941 posts", "#3" (see format.ts's magnitudeOf) */
  magnitudeText: string
  /** the same measurement, apart, for the page's structured data */
  magnitudeValue: number | null
  magnitudeUnit: string
  rank: number
}

export interface SourceColumn {
  id: string
  name: string
  url: string
  status: 'ok' | 'partial' | 'unavailable'
  note: string
  /** null when the source is as of the ledger's own day — printing the same date twenty times
   *  says nothing; a source that lags says so, and that is the only case worth the line */
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
    asOf: s.as_of && s.as_of !== day.date ? s.as_of : null,
    count: s.count,
    signals: (day.signals[s.id] ?? []).slice(0, top).map((sig) => {
      const m = magnitudeOf(sig)
      return {
        label: sig.label,
        url: sig.url,
        geo: sig.geo,
        magnitudeText: m.text,
        magnitudeValue: m.value,
        magnitudeUnit: m.unit,
        rank: sig.rank,
      }
    }),
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

/** How wide a strip of `n` bars may render. A strip's viewBox scales to its container, so two
 *  committed days drawn at full width become two 300-unit slabs that read as a broken figure
 *  rather than as a young archive (seen on /trending on 2026-09-03, with two audience days in the
 *  window). The bucket is geometry, so it lives here and is tested here; the stylesheet turns it
 *  into a max-width and the island only carries it across as a data attribute. */
export type StripSpan = 'short' | 'mid' | 'full'

export function stripSpan(n: number): StripSpan {
  if (n <= 5) return 'short'
  if (n <= 14) return 'mid'
  return 'full'
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
  /** how wide the drawing may render — see stripSpan() */
  span: StripSpan
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
  return { width, height, barWidth, gap, max, bars, totals, span: stripSpan(bars.length) }
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

/** True when at least one of these files still carries the retired browser-beacon half, i.e.
 *  when the Umami column has anything to say at all. From `trending-audience/2` on no file
 *  has it (decision of 2026-09-03), so the column disappears once the two `/1` days fall out
 *  of the drawn window — rather than standing there reading "unavailable" for ever. */
export function audienceHasUmami(days: TrendingAudience[]): boolean {
  return days.some((d) => Boolean(d.umami))
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
        // A day whose file never had that half reads as an absence, not as standby: standby
        // would say a count is pending, and no count is pending — the half is retired.
        pageviews: d.umami ? (d.umami.status === 'ok' ? compact(d.umami.pageviews) : 'standby') : '—',
      }
    })
}

export interface AudienceDimensionRow extends Record<string, string | number> {
  name: string
  requests: string
}

/** One of the two dimensions `trending-audience/2` adds — countries, referring hosts — as
 *  table rows: by requests descending, ties by name, capped. A `null` or absent dimension
 *  yields no rows at all, so the surface can say why instead of drawing an empty table; it is
 *  never read as a row of zeros. */
export function audienceDimensionRows(dim: Record<string, number> | null | undefined, max = 10): AudienceDimensionRow[] {
  if (!dim) return []
  return Object.entries(dim)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([name, n]) => ({ name, requests: compact(n) }))
}

/** Which of the two new dimensions this record explicitly reports as unavailable (`null`),
 *  in contract order. A record that does not carry the key at all — every
 *  `trending-audience/1` day — reports nothing, and nothing is claimed about it. */
export function audienceMissingDimensions(a: TrendingAudience): ('countries' | 'referers')[] {
  return (['countries', 'referers'] as const).filter((k) => a.edge[k] === null)
}

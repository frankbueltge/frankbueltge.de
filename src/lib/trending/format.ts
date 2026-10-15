/** Formatting for the trending pages. Pure functions, unit-tested; every visible string that
 *  carries a date or number passes through here so the templates stay one place. */
import type { AudienceClass, PathKind, TrendingDay, TrendingTopicSignal } from './types'

const DATE_LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const DATE_WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const NUM = new Intl.NumberFormat('en-GB')

/** "2 September 2026" */
export function fmtDateLong(iso: string): string {
  return DATE_LONG.format(new Date(`${iso}T00:00:00Z`))
}

/** "Wednesday, 2 September 2026" */
export function fmtDateWeekday(iso: string): string {
  return DATE_WEEKDAY.format(new Date(`${iso}T00:00:00Z`))
}

/** "06:41" from an ISO timestamp, always UTC. */
export function fmtTimeUtc(isoDateTime: string): string {
  const d = new Date(isoDateTime)
  if (Number.isNaN(d.getTime())) return '—'
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

/** Full digits below 100 000 (a reader can still count them), compact above.
 *  The compact form is spelled here rather than left to Intl's compact notation: ICU builds
 *  disagree on "314.2K" versus "314.2k" (macOS and the Linux runners differ), and a figure that
 *  renders differently per machine is not a fact the page can stand on. */
export function compact(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  if (n < 100_000) return NUM.format(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

// Every source the pipeline reads, spelled the way its own house spells it. An id with no
// entry here falls through to the id itself, which is how twelve of the twenty sources read
// as `stackoverflow` and `appstore` on the page between 2026-09-01 and 2026-09-03: the map was
// written when the ledger had eight sources and did not grow with it. The names come from each
// source's own report line in the committed day file, never from a guess.
const PLATFORM_LABEL: Record<string, string> = {
  google_trends: 'Google Trends',
  wikipedia: 'Wikipedia',
  hackernews: 'Hacker News',
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  google_news: 'Google News',
  reddit: 'Reddit',
  github: 'GitHub',
  github_trending: 'GitHub Trending',
  huggingface: 'Hugging Face',
  lobsters: 'Lobsters',
  devto: 'DEV',
  stackoverflow: 'Stack Overflow',
  pypi: 'PyPI',
  producthunt: 'Product Hunt',
  techmeme: 'Techmeme',
  arxiv: 'arXiv',
  appstore: 'App Store',
  steam: 'Steam',
  coingecko: 'CoinGecko',
  polymarket: 'Polymarket',
}

export function platformLabel(id: string): string {
  return PLATFORM_LABEL[id] ?? id
}

// What each source counts, in words. A source that answers with a bare rank has no unit at all,
// which is why '' is a value here and not an omission. Twelve of these were missing between
// 2026-09-01 and 2026-09-03 — see the note on magnitudeOf below.
const UNIT_LABEL: Record<string, string> = {
  approx_searches: 'searches',
  views: 'views',
  points: 'points',
  posts: 'posts',
  uses: 'uses',
  shares: 'shares',
  stars: 'stars',
  stars_today: 'stars today',
  downloads: 'downloads',
  reactions: 'reactions',
  score: 'score',
  usd_24h: 'USD in 24 h',
  rank: '',
}

/** The shape every signal shares, day ledger and crossing alike. */
interface Measured {
  magnitude: number | null
  magnitude_unit: string
  rank: number
}

export interface Magnitude {
  /** what a reader sees: "941 posts" · "2,000+ searches" · "#3" */
  text: string
  /** the source's own number, null where the source states only a position */
  value: number | null
  /** the unit in words; '' when the source states only a position */
  unit: string
}

/**
 * A source's own number WITH the unit it counted in.
 *
 * The unit is not decoration. Between 2026-09-01 and 2026-09-03 the per-source cards on
 * /trending printed the bare number, so one column of the page carried eleven incomparable
 * quantities side by side — 3206.7M (PyPI downloads in a month), 941 (Bluesky posts), 207
 * (Hacker News points) and -1 (a Stack Overflow score, which can be negative). A reader could
 * take nothing from that, and a machine reader even less: a number without a unit is not a fact.
 * `value` and `unit` are carried separately so the page's structured data can state the same
 * measurement as a PropertyValue rather than as prose.
 */
export function magnitudeOf(s: Measured): Magnitude {
  if (s.magnitude === null || s.magnitude_unit === 'rank') {
    return { text: `#${s.rank}`, value: null, unit: '' }
  }
  const unit = UNIT_LABEL[s.magnitude_unit] ?? s.magnitude_unit
  const approx = s.magnitude_unit === 'approx_searches' ? '+' : ''
  return {
    text: `${compact(s.magnitude)}${approx}${unit ? ` ${unit}` : ''}`,
    value: s.magnitude,
    unit,
  }
}

/** "Google Trends US 2,000+ searches" · "Wikipedia en 314,205 views" · "Google News #3" */
export function signalText(s: TrendingTopicSignal): string {
  const head = [platformLabel(s.source), s.geo].filter(Boolean).join(' ')
  return `${head} ${magnitudeOf(s).text}`.trim()
}

const CLASS_LABEL: Record<AudienceClass, string> = {
  browser: 'browsers',
  search: 'search crawlers',
  'ai-retrieval': 'AI retrieval bots',
  'ai-user-fetch': 'AI user fetches',
  'ai-training': 'AI training crawlers',
  'other-bot': 'other bots',
}

export function classLabel(cls: AudienceClass): string {
  return CLASS_LABEL[cls]
}

const PATH_KIND_LABEL: Record<PathKind, string> = {
  page: 'the page',
  archive: 'archive days',
  json: 'JSON',
  feed: 'RSS',
  md: 'Markdown',
  other: 'other',
}

export function pathKindLabel(kind: PathKind): string {
  return PATH_KIND_LABEL[kind]
}

/** Top labels for a title: at most `n`, never empty strings. */
export function topLabels(day: TrendingDay, n = 3): string[] {
  const fromSummary = day.summary.top_labels.filter(Boolean)
  const labels = fromSummary.length ? fromSummary : day.topics.map((t) => t.label)
  return labels.slice(0, n)
}

export function pageTitle(day: TrendingDay): string {
  return `Trending today, ${fmtDateLong(day.date)} — cross-checked across ${day.summary.sources_ok} sources | Frank Bültge`
}

export function archiveTitle(day: TrendingDay): string {
  const tops = topLabels(day, 3)
  const tail = tops.length ? `: ${tops.join(', ')}` : ''
  return `Trending on ${fmtDateLong(day.date)}${tail} | Frank Bültge`
}

export const LATEST_DESCRIPTION =
  "What the web is searching, reading and posting about right now: Google Trends, Wikipedia, Hacker News, Bluesky, Mastodon and the day's headlines cross-checked into one list, rebuilt every morning. Open data (CC0) as JSON, Markdown and RSS for people and machine readers."

export function metaDescription(day: TrendingDay, isLatest: boolean): string {
  if (isLatest) return LATEST_DESCRIPTION
  const tops = topLabels(day, 5)
  const head = tops.length ? `Trending topics on ${fmtDateLong(day.date)}: ${tops.join(', ')}.` : `Trending topics on ${fmtDateLong(day.date)}.`
  return `${head} Cross-checked across ${day.summary.sources_ok} independent sources; archived as open data.`
}

/** The feed item / archive heading: "Trending on 2 September 2026: a, b, c" */
export function feedTitle(day: TrendingDay): string {
  const tops = topLabels(day, 3)
  return `Trending on ${fmtDateLong(day.date)}${tops.length ? `: ${tops.join(', ')}` : ''}`
}

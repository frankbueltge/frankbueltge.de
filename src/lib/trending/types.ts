/** Mirror of the two contracts the trending pipeline commits (pipelines/trending):
 *  `src/data/trending/YYYY-MM-DD.json` (`trending-day/1`) and
 *  `src/data/trending/audience/YYYY-MM-DD.json` (`trending-audience/1` or `/2`).
 *  The zod schemas in ./schema.ts are the validating twin; keep both in step. */

export type SourceStatus = 'ok' | 'partial' | 'unavailable'
export type AudienceStatus = 'ok' | 'unavailable'

/** Both audience contracts stay readable: `/1` carried a second, browser-beacon half beside
 *  the edge count; `/2` (from 2026-09-03) counts at the edge alone and adds the country and
 *  referring-host dimensions. The two `/1` days already committed are never rewritten, so
 *  everything here reads both — see docs/design/2026-09-02-common-ground.md §12. */
export type AudienceContract = 'trending-audience/1' | 'trending-audience/2'

export const AUDIENCE_CONTRACTS: readonly AudienceContract[] = ['trending-audience/1', 'trending-audience/2'] as const

export type AudienceClass =
  | 'browser'
  | 'search'
  | 'ai-retrieval'
  | 'ai-user-fetch'
  | 'ai-training'
  | 'other-bot'

export const AUDIENCE_CLASSES: readonly AudienceClass[] = [
  'browser',
  'search',
  'ai-retrieval',
  'ai-user-fetch',
  'ai-training',
  'other-bot',
] as const

export type PathKind = 'page' | 'archive' | 'json' | 'feed' | 'md' | 'other'

export interface TrendingLink {
  title: string
  url: string
  publisher: string | null
}

export interface TrendingSignal {
  source: string
  label: string
  url: string | null
  rank: number
  magnitude: number | null
  magnitude_unit: string
  geo: string | null
  links: TrendingLink[]
  meta: Record<string, unknown>
}

export interface TrendingSourceReport {
  id: string
  name: string
  url: string
  licence: string
  status: SourceStatus
  note: string
  retrieved_at: string | null
  as_of: string | null
  count: number
}

export interface TrendingTopicSignal {
  source: string
  geo: string | null
  label: string
  url: string | null
  rank: number
  magnitude: number | null
  magnitude_unit: string
}

export interface TrendingTopic {
  id: string
  label: string
  platforms: string[]
  platform_count: number
  score: number
  category: string | null
  first_seen: string
  days_hot: number
  signals: TrendingTopicSignal[]
  links: TrendingLink[]
  wikipedia: { lang: string; article: string; views: number } | null
}

export interface TrendingSummary {
  topics_total: number
  converging: number
  sources_ok: number
  sources_total: number
  top_labels: string[]
}

export interface SelfCheckItem {
  id: string
  ok: boolean
  note: string
}

/** The run's grade of its own record (rubric on the method sheet). */
export interface SelfCheck {
  rubric_version: string
  ok: boolean
  passed: number
  total: number
  checks: SelfCheckItem[]
}

export interface TrendingDay {
  $contract: 'trending-day/1'
  date: string
  generated_at: string
  pipeline_version: string
  method_version: string
  sources: TrendingSourceReport[]
  signals: Record<string, TrendingSignal[]>
  topics: TrendingTopic[]
  summary: TrendingSummary
  quality?: SelfCheck
}

export interface AudienceBot {
  name: string
  class: AudienceClass
  requests: number
  ok_2xx: number
  other_status: number
}

export interface AudienceEdge {
  status: AudienceStatus
  note: string
  source: string
  window: [string, string] | null
  sample_interval_avg: number | null
  total: number | null
  paths: Partial<Record<PathKind, number>> | null
  classes: Partial<Record<AudienceClass, number>> | null
  bots: AudienceBot[]
  /** Top ten visitor countries by requests (`trending-audience/2` and later). `null` means the
   *  dimension is not available on this plan — the reason is in `extra_note`. Never a zero. */
  countries?: Record<string, number> | null
  /** Top ten referring hosts by requests, same rule: `null` is an absence, not an emptiness. */
  referers?: Record<string, number> | null
  /** Why `countries` / `referers` are null, when they are; empty otherwise. */
  extra_note?: string
}

/** The retired second half of `trending-audience/1`: a client-side beacon, which cannot see a
 *  reader that runs no JavaScript and so could never answer this page's question. Kept as a
 *  type because the two `/1` days that carry it still render (decision of 2026-09-03). */
export interface AudienceUmami {
  status: AudienceStatus
  note: string
  source: string
  pageviews: number | null
  visitors: number | null
}

export interface TrendingAudience {
  $contract: AudienceContract
  day: string
  generated_at: string
  edge: AudienceEdge
  /** Absent from `trending-audience/2` on: the measurement is taken at the edge alone. */
  umami?: AudienceUmami
}

/** Mirror of the two contracts the trending pipeline commits (pipelines/trending):
 *  `src/data/trending/YYYY-MM-DD.json` (`trending-day/1`) and
 *  `src/data/trending/audience/YYYY-MM-DD.json` (`trending-audience/1`).
 *  The zod schemas in ./schema.ts are the validating twin; keep both in step. */

export type SourceStatus = 'ok' | 'partial' | 'unavailable'
export type AudienceStatus = 'ok' | 'unavailable'

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
}

export interface AudienceUmami {
  status: AudienceStatus
  note: string
  source: string
  pageviews: number | null
  visitors: number | null
}

export interface TrendingAudience {
  $contract: 'trending-audience/1'
  day: string
  generated_at: string
  edge: AudienceEdge
  umami: AudienceUmami
}

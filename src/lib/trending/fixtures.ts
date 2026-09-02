/** Small in-file fixtures in the shape of the two contracts, shared by the trending tests. */
import type { TrendingAudience, TrendingDay } from './types'

export function fixtureDay(over: Partial<TrendingDay> = {}): TrendingDay {
  return {
    $contract: 'trending-day/1',
    date: '2026-09-02',
    generated_at: '2026-09-02T06:41:12Z',
    pipeline_version: '0.1.0',
    method_version: '1',
    sources: [
      { id: 'google_trends', name: 'Google Trends — Daily Search Trends (RSS)', url: 'https://trends.google.com/trending/rss', licence: 'Google Terms; titles and counts only', status: 'ok', note: '', retrieved_at: '2026-09-02T06:40:01Z', as_of: '2026-09-02', count: 2 },
      { id: 'bluesky', name: 'Bluesky — trending topics', url: 'https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends', licence: 'AT Protocol public API', status: 'ok', note: '', retrieved_at: '2026-09-02T06:40:02Z', as_of: null, count: 1 },
      { id: 'reddit', name: 'Reddit — r/popular', url: 'https://www.reddit.com/r/popular/.rss', licence: 'Reddit terms; titles only', status: 'unavailable', note: 'HTTP 403', retrieved_at: null, as_of: null, count: 0 },
    ],
    signals: {
      google_trends: [
        { source: 'google_trends', label: 'usps mail ballots', url: null, rank: 1, magnitude: 2000, magnitude_unit: 'approx_searches', geo: 'US', links: [{ title: 'USPS whistleblower', url: 'https://example.org/usps', publisher: 'Example News' }], meta: {} },
        { source: 'google_trends', label: 'mickey gasper', url: null, rank: 2, magnitude: 1000, magnitude_unit: 'approx_searches', geo: 'US', links: [], meta: {} },
      ],
      bluesky: [
        { source: 'bluesky', label: 'USPS mail ballot handling', url: 'https://bsky.app/profile/x/feed/a', rank: 1, magnitude: 2779, magnitude_unit: 'posts', geo: null, links: [], meta: { category: 'politics' } },
      ],
      reddit: [],
    },
    topics: [
      {
        id: 'usps-mail-ballots', label: 'usps mail ballots', platforms: ['bluesky', 'google_trends'], platform_count: 2, score: 2.9,
        category: 'politics', first_seen: '2026-09-01', days_hot: 2,
        signals: [
          { source: 'google_trends', geo: 'US', label: 'usps mail ballots', url: null, rank: 1, magnitude: 2000, magnitude_unit: 'approx_searches' },
          { source: 'bluesky', geo: null, label: 'USPS mail ballot handling', url: 'https://bsky.app/profile/x/feed/a', rank: 1, magnitude: 2779, magnitude_unit: 'posts' },
        ],
        links: [{ title: 'USPS whistleblower', url: 'https://example.org/usps', publisher: 'Example News' }],
        wikipedia: null,
      },
      {
        id: 'mickey-gasper', label: 'mickey gasper', platforms: ['google_trends'], platform_count: 1, score: 1.5,
        category: null, first_seen: '2026-09-02', days_hot: 1,
        signals: [{ source: 'google_trends', geo: 'US', label: 'mickey gasper', url: null, rank: 2, magnitude: 1000, magnitude_unit: 'approx_searches' }],
        links: [], wikipedia: { lang: 'en', article: 'Mickey Gasper', views: 51234 },
      },
    ],
    summary: { topics_total: 2, converging: 1, sources_ok: 2, sources_total: 3, top_labels: ['usps mail ballots', 'mickey gasper'] },
    ...over,
  }
}

export function fixtureAudience(over: Partial<TrendingAudience> = {}): TrendingAudience {
  return {
    $contract: 'trending-audience/1',
    day: '2026-09-01',
    generated_at: '2026-09-02T06:41:40Z',
    edge: {
      status: 'ok',
      note: '',
      source: 'Cloudflare GraphQL Analytics API, httpRequestsAdaptiveGroups, zone scope, requestSource eyeball, clientRequestPath_like /trending%',
      window: ['2026-09-01T00:00:00Z', '2026-09-01T23:59:59Z'],
      sample_interval_avg: 1,
      total: 120,
      paths: { page: 80, archive: 10, json: 20, feed: 5, md: 5, other: 0 },
      classes: { browser: 50, search: 30, 'ai-retrieval': 20, 'ai-user-fetch': 10, 'ai-training': 5, 'other-bot': 5 },
      bots: [
        { name: 'Googlebot', class: 'search', requests: 30, ok_2xx: 30, other_status: 0 },
        { name: 'PerplexityBot', class: 'ai-retrieval', requests: 20, ok_2xx: 19, other_status: 1 },
      ],
    },
    umami: { status: 'ok', note: '', source: 'self-hosted Umami, website cea1def9-…, url prefix /trending', pageviews: 42, visitors: 30 },
    ...over,
  }
}

export function standbyAudience(day = '2026-09-01'): TrendingAudience {
  return fixtureAudience({
    day,
    edge: { status: 'unavailable', note: 'CF_ANALYTICS_TOKEN not set', source: 'Cloudflare GraphQL Analytics API', window: null, sample_interval_avg: null, total: null, paths: null, classes: null, bots: [] },
    umami: { status: 'unavailable', note: 'UMAMI_API_URL not set', source: 'self-hosted Umami', pageviews: null, visitors: null },
  })
}

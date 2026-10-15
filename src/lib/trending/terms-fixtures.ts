/** Small in-file fixtures in the shape of `trending-terms/1`, shared by the arcs tests.
 *  Deliberately covers every branch the wording has to survive: all five statuses, a term with
 *  a Wikipedia article and one without, a ratio that is null because the prior window was
 *  empty, a capped platform, a platform that returned nothing, and a candidate list. */
import type { LetGoTerm, PromotedTerm, TrendingTerm, TrendingTermsDay, WatchlistEntry } from './terms-types'

const SOURCES: TrendingTermsDay['sources'] = [
  { id: 'hackernews', name: 'Hacker News (Algolia search)', url: 'https://hn.algolia.com/api/v1/search_by_date', status: 'ok', note: '', retrieved_at: '2026-09-03T06:45:01Z' },
  { id: 'google_news', name: 'Google News (RSS search)', url: 'https://news.google.com/rss/search', status: 'ok', note: '', retrieved_at: '2026-09-03T06:45:20Z' },
  { id: 'github', name: 'GitHub (repository search)', url: 'https://api.github.com/search/repositories', status: 'ok', note: '', retrieved_at: '2026-09-03T06:45:41Z' },
  { id: 'arxiv', name: 'arXiv (Atom API)', url: 'https://export.arxiv.org/api/query', status: 'ok', note: '', retrieved_at: '2026-09-03T06:46:10Z' },
  { id: 'reddit', name: 'Reddit (search feed)', url: 'https://www.reddit.com/search.rss', status: 'unavailable', note: 'HTTP 403', retrieved_at: null },
  { id: 'wikipedia_views', name: 'Wikimedia pageviews API', url: 'https://wikimedia.org/api/rest_v1/metrics/pageviews', status: 'ok', note: '', retrieved_at: '2026-09-03T06:46:30Z' },
]

function counts(over: Record<string, { d1: number; d7: number; d30: number; capped?: boolean } | null> = {}) {
  const base: TrendingTerm['counts'] = {
    hackernews: { d1: 0, d7: 3, d30: 11, capped: false },
    google_news: { d1: 2, d7: 9, d30: 31, capped: true },
    github: { d1: 4, d7: 20, d30: 77, capped: false },
    arxiv: { d1: 0, d7: 1, d30: 5, capped: false },
    reddit: null,
    wikipedia_views: null,
  }
  for (const [id, c] of Object.entries(over)) base[id] = c === null ? null : { capped: false, ...c }
  return base
}

export function fixtureTerm(over: Partial<TrendingTerm> = {}): TrendingTerm {
  return {
    slug: 'loop-engineering',
    term: 'loop engineering',
    aliases: ['loop-engineering'],
    added: '2026-09-02',
    origin: 'editorial',
    note: 'Editorial seed, 2026-09-02',
    wikipedia_article: null,
    counts: counts(),
    total: { d1: 6, d7: 33, d30: 124 },
    ratio: 1.62,
    status: 'rising',
    first_seen: '2026-06-14',
    receipts: [
      { platform: 'hackernews', title: 'Loop engineering in practice', url: 'https://news.ycombinator.com/item?id=1', date: '2026-09-02' },
      { platform: 'github', title: 'loop-engineering/kit', url: 'https://github.com/example/kit', date: '2026-09-01' },
    ],
    ...over,
  }
}

/** The five statuses, one term each — the wording matrix the hub and the term page must
 *  survive without a hand-typed number anywhere. */
export function fixtureTerms(over: Partial<TrendingTermsDay> = {}): TrendingTermsDay {
  const terms: TrendingTerm[] = [
    fixtureTerm(),
    fixtureTerm({
      slug: 'agentic-commerce',
      term: 'agentic commerce',
      aliases: [],
      origin: 'discovered',
      note: 'discovery run 2026-09-02',
      counts: counts({ hackernews: { d1: 1, d7: 6, d30: 6 }, google_news: { d1: 0, d7: 2, d30: 2, capped: true }, github: { d1: 1, d7: 4, d30: 4 }, arxiv: null }),
      total: { d1: 2, d7: 12, d30: 12 },
      ratio: null,
      status: 'emerging',
      first_seen: '2026-08-28',
      receipts: [{ platform: 'hackernews', title: 'Agentic commerce is not a checkout button', url: 'https://news.ycombinator.com/item?id=2', date: '2026-09-03' }],
    }),
    fixtureTerm({
      slug: 'knowledge-graph',
      term: 'knowledge graph',
      aliases: ['knowledge graphs'],
      wikipedia_article: 'Knowledge_graph',
      counts: counts({ wikipedia_views: { d1: 1234, d7: 8100, d30: 33000 } }),
      total: { d1: 9, d7: 41, d30: 210 },
      ratio: 1.05,
      status: 'established',
      first_seen: '2026-05-02',
    }),
    fixtureTerm({
      slug: 'vibe-coding',
      term: 'vibe coding',
      aliases: [],
      counts: counts({ hackernews: { d1: 0, d7: 1, d30: 40 }, google_news: { d1: 0, d7: 2, d30: 60, capped: true }, github: { d1: 0, d7: 1, d30: 30 }, arxiv: { d1: 0, d7: 0, d30: 4 } }),
      total: { d1: 0, d7: 4, d30: 134 },
      ratio: 0.09,
      status: 'fading',
      first_seen: '2026-02-11',
    }),
    fixtureTerm({
      slug: 'harness-engineering',
      term: 'harness engineering',
      aliases: [],
      counts: counts({ hackernews: { d1: 0, d7: 1, d30: 3 }, google_news: null, github: { d1: 0, d7: 0, d30: 1 }, arxiv: null }),
      total: { d1: 0, d7: 1, d30: 4 },
      ratio: 0.3,
      status: 'quiet',
      first_seen: '2026-07-19',
    }),
  ]
  return {
    $contract: 'trending-terms/1',
    date: '2026-09-03',
    generated_at: '2026-09-03T06:47:02Z',
    pipeline_version: '0.2.0',
    method_version: '2',
    windows: { d1: 1, d7: 7, d30: 30 },
    sources: SOURCES,
    terms,
    candidates: [
      { ngram: 'context compaction', docs_recent: 9, docs_prior: 1, ratio: 8, platforms: ['hackernews', 'github'], sample: { title: 'Context compaction beats context stuffing', url: 'https://news.ycombinator.com/item?id=3', date: '2026-09-01' } },
      { ngram: 'eval harness', docs_recent: 6, docs_prior: 2, ratio: 2.4, platforms: ['github'], sample: null },
    ],
    summary: {
      terms_total: terms.length,
      by_status: { emerging: 1, rising: 1, established: 1, fading: 1, quiet: 1 },
      candidates_total: 2,
    },
    ...over,
  }
}

/** The promotions of a run (added 2026-09-02): terms the discovery pass took onto the list
 *  itself this morning. `fixtureTerms()` deliberately carries NO `promoted` key — that is the
 *  older contract, and the page has to survive it — so a test that wants promotions passes
 *  these in. The second entry has no pace, because a term nobody mentioned in the prior
 *  window has no ratio to show. */
export function fixturePromoted(): PromotedTerm[] {
  return [
    {
      slug: 'context-compaction',
      term: 'context compaction',
      days_seen: 3,
      platforms: ['hackernews', 'github', 'google_news'],
      ratio: 4.2,
      note: 'promoted 2026-09-03: proposed on three consecutive days, three platforms',
    },
    {
      slug: 'eval-harness',
      term: 'eval harness',
      days_seen: 4,
      platforms: ['github', 'arxiv'],
      ratio: null,
      note: 'promoted 2026-09-03: proposed on four consecutive days, two platforms',
    },
  ]
}

/** What a run let go of: a term the run itself had promoted that stood still long enough to
 *  fail the test the run applies to its own additions. Never a term a person seeded. */
export function fixtureLetGo(): LetGoTerm[] {
  return [
    {
      slug: 'mac-studio',
      term: 'mac studio',
      days_quiet: 21,
      note: 'let go 2026-09-24: quiet for 21 days running',
    },
  ]
}

/** The live watchlist, with one term a person has struck. The tombstone stays in the file —
 *  it is what keeps the run from promoting the term again. */
export function fixtureWatchlist(over: WatchlistEntry[] = []): WatchlistEntry[] {
  return [
    {
      term: 'loop engineering',
      slug: 'loop-engineering',
      aliases: ['loop-engineering'],
      added: '2026-09-02',
      origin: 'editorial',
      note: 'Editorial seed, 2026-09-02',
      wikipedia_article: null,
    },
    {
      term: 'context compaction',
      slug: 'context-compaction',
      aliases: [],
      added: '2026-09-03',
      origin: 'discovered',
      note: 'promoted 2026-09-03: proposed on three consecutive days, three platforms',
      wikipedia_article: null,
    },
    {
      term: 'prompt kung fu',
      slug: 'prompt-kung-fu',
      aliases: [],
      added: '2026-09-02',
      origin: 'discovered',
      note: 'promoted 2026-09-02',
      wikipedia_article: null,
      retired: '2026-09-04',
      retired_note: 'a joke, not a trend',
    },
    ...over,
  ]
}

/** A day of the archive carrying one term with a given daily count — the material for the
 *  series test, which has to prove that the series is read out of the dated files rather
 *  than accumulated anywhere. */
export function fixtureTermsDay(date: string, d1: number, slug = 'loop-engineering'): TrendingTermsDay {
  const t = fixtureTerm({ slug, total: { d1, d7: d1 * 7, d30: d1 * 30 } })
  return fixtureTerms({ date, terms: [t], candidates: [], summary: { terms_total: 1, by_status: { rising: 1 }, candidates_total: 0 } })
}

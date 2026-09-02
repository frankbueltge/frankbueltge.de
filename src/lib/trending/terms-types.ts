/** Mirror of the third contract the trending pipeline commits (pipelines/trending):
 *  `src/data/trending/terms/YYYY-MM-DD.json` (`trending-terms/1`) — the slower layer of the
 *  ledger. Where a day file records what spiked this morning, a terms file records how a
 *  watched term has been moving across blogs, forums, papers and repositories over weeks.
 *
 *  The zod schema in ./terms-schema.ts is the validating twin; keep both in step. Tolerant
 *  where the contract says `| null`: a term without a Wikipedia article, a ratio with nothing
 *  to compare against and a platform that did not answer all have a shape here, and none of
 *  them is ever filled in with a guess. */

/** The five readings a watched term can carry. Order matters: it is the hub's sort order
 *  (what is new and moving first, what is dormant last) and the order of the summary counts. */
export type TermStatus = 'emerging' | 'rising' | 'established' | 'fading' | 'quiet'

export const TERM_STATUSES: readonly TermStatus[] = ['emerging', 'rising', 'established', 'fading', 'quiet'] as const

/** How a term entered the watchlist: an editorial decision, or a discovery run's proposal
 *  that a human then wrote into the watchlist by hand. The machine only ever proposes. */
export type TermOrigin = 'editorial' | 'discovered'

export type TermSourceStatus = 'ok' | 'partial' | 'unavailable'

/** One platform searched for every term this run, with what happened to it. */
export interface TermSourceReport {
  id: string
  name: string
  url: string
  status: TermSourceStatus
  note: string
  retrieved_at: string | null
}

/** Documents mentioning a term or one of its aliases in each window, deduplicated by URL.
 *  `capped` says the platform's feed cannot return more than a fixed number of items, so the
 *  thirty-day figure may undercount — a fact about the source, kept beside the number. */
export interface TermCount {
  d1: number
  d7: number
  d30: number
  capped: boolean
}

export interface TermTotal {
  d1: number
  d7: number
  d30: number
}

/** A document that carries the term: title, URL, date and the platform it came from. Never a
 *  body text — the receipt exists so a reader can open the source and check the count. */
export interface TermReceipt {
  platform: string
  title: string
  url: string
  date: string
}

export interface TrendingTerm {
  slug: string
  term: string
  aliases: string[]
  added: string
  origin: TermOrigin
  note: string
  wikipedia_article: string | null
  /** platform id → counts; `wikipedia_views` is null when the watchlist names no article */
  counts: Record<string, TermCount | null>
  /** sum over the searched platforms, page views deliberately excluded */
  total: TermTotal
  /** seven-day pace against the three weeks before it; null when the prior window is empty */
  ratio: number | null
  status: TermStatus
  first_seen: string
  receipts: TermReceipt[]
}

/** An n-gram the discovery run noticed that is NOT on the watchlist. Shown on the hub as a
 *  proposal; it becomes a tracked term only when a human writes it into the watchlist. */
export interface TermCandidate {
  ngram: string
  docs_recent: number
  docs_prior: number
  ratio: number | null
  platforms: string[]
  sample: { title: string; url: string; date: string } | null
}

export interface TermsSummary {
  terms_total: number
  by_status: Partial<Record<TermStatus, number>>
  candidates_total: number
}

export interface TrendingTermsDay {
  $contract: 'trending-terms/1'
  date: string
  generated_at: string
  pipeline_version: string
  method_version: string
  windows: { d1: number; d7: number; d30: number }
  sources: TermSourceReport[]
  terms: TrendingTerm[]
  candidates: TermCandidate[]
  summary: TermsSummary
}

/** One point of a term's series: a committed day and the mentions it counted that day. */
export interface TermSeriesPoint {
  date: string
  d1: number
}

/** The platform whose counts are page views, not documents — excluded from every total. */
export const VIEWS_PLATFORM = 'wikipedia_views'

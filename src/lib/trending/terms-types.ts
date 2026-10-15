import type { SelfCheck } from './types'
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

/** How a term entered the watchlist: a person put it there by hand (`editorial`), or the
 *  discovery run promoted it itself (`discovered`). Load-bearing on the page since the
 *  decision of 2026-09-02 (docs/design/2026-09-02-common-ground.md, §9 amendment): the
 *  default reversed — the run promotes a candidate that keeps coming back, and a person
 *  prunes. So this field is the answer to "who put this on the list", and the hub shows it
 *  for every term rather than treating both cases as the same. */
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

/** An n-gram the discovery run noticed that is NOT (yet) on the watchlist. Since 2026-09-02 a
 *  candidate is a term on its way in rather than a suggestion waiting for a person: keep
 *  clearing the promotion rule and the run takes it onto the list by itself. */
export interface TermCandidate {
  ngram: string
  docs_recent: number
  docs_prior: number
  ratio: number | null
  platforms: string[]
  sample: { title: string; url: string; date: string } | null
}

/** A candidate the run promoted onto the watchlist TODAY, with the evidence that promoted it:
 *  how many consecutive days it was proposed, the platforms it was carried on, and the pace it
 *  was moving at (null when the prior window held nothing to compare against). A promoted term
 *  is tracked from the NEXT run — it has no counts in the file that promotes it, and the page
 *  must not pretend otherwise. */
export interface PromotedTerm {
  slug: string
  term: string
  days_seen: number
  platforms: string[]
  ratio: number | null
  note: string
}

/** A term the run struck TODAY, and the reason: it is one the RUN promoted (`origin:
 *  "discovered"`) and it has been quiet or fading on every run for the committed number of
 *  days. The machine lets go of what it added; a term a person put on the list is never struck
 *  this way. The striking is recorded in the watchlist file as a tombstone, so the term cannot
 *  come back through a later promotion. */
export interface LetGoTerm {
  slug: string
  term: string
  days_quiet: number
  note: string
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
  /** Added 2026-09-02 and optional on purpose: every run committed before that day carries no
   *  such key, and a run that promoted nothing writes an empty list. The zod twin fills `[]`,
   *  so a reader never has to tell "no promotions" apart from "an older contract". */
  promoted?: PromotedTerm[]
  /** The other direction, same day and same tolerance: what the run let go of this morning. */
  let_go?: LetGoTerm[]
  summary: TermsSummary
  quality?: SelfCheck
}

/** One line of `src/data/trending/watchlist.json` — the live list the nightly run reads, and
 *  the only place a term is added or struck. A struck term keeps its entry and gains
 *  `retired`, whether the run struck it (a discovered term gone quiet) or a person did: the
 *  tombstone is what stops a second promotion, so removing the line would undo the striking
 *  rather than record it. */
export interface WatchlistEntry {
  term: string
  slug: string
  aliases: string[]
  added: string
  origin: TermOrigin
  note: string
  wikipedia_article: string | null
  /** the day the term was struck, by the run or by a person; absent (or null) while tracked */
  retired?: string | null
  retired_note?: string
}

/** One point of a term's series: a committed day and the mentions it counted that day. */
export interface TermSeriesPoint {
  date: string
  d1: number
}

/** The platform whose counts are page views, not documents — excluded from every total. */
export const VIEWS_PLATFORM = 'wikipedia_views'

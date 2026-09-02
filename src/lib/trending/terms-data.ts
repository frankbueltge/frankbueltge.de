/** Readers for the committed terms files — the arcs half of the trending archive.
 *
 *  Same construction as ./data.ts and for the same reason: Vite's import.meta.glob rather than
 *  astro:content, so the JSON and Markdown endpoints and vitest all read through one function.
 *  The content collection in src/content.config.ts validates the files on build; this parses
 *  them once more with the same schema.
 *
 *  A term's series is not stored anywhere: it is READ OUT of the dated files, one point per
 *  committed day. That is the whole memory of this layer — no accumulating state, no rewriting
 *  of yesterday. A term added to the watchlist last week therefore has a short series, and the
 *  page says so rather than padding it with zeros. */
import { trendingTermsSchema, watchlistSchema } from './terms-schema'
import type { TermSeriesPoint, TrendingTerm, TrendingTermsDay, WatchlistEntry } from './terms-types'

const TERMS_FILE = /\/(\d{4}-\d{2}-\d{2})\.json$/

const termsModules = import.meta.glob('../../data/trending/terms/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

/** The live watchlist, as one file rather than a dated run. Globbed rather than imported so
 *  the site still builds before the pipeline has written it for the first time: no file, no
 *  entries, and the page simply says nothing about the pruning. */
const watchlistModules = import.meta.glob('../../data/trending/watchlist.json', { eager: true, import: 'default' }) as Record<string, unknown>

/** Every committed terms file, newest first. */
export function getTermsDays(): TrendingTermsDay[] {
  return Object.entries(termsModules)
    .filter(([path]) => TERMS_FILE.test(path))
    .map(([, raw]) => trendingTermsSchema.parse(raw) as TrendingTermsDay)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** The newest committed terms file, or nothing before the first run. */
export function getLatestTerms(): TrendingTermsDay | undefined {
  return getTermsDays()[0]
}

export function getTermsByDate(date: string): TrendingTermsDay | undefined {
  return getTermsDays().find((f) => f.date === date)
}

/** The watchlist as it stands: every term the nightly run reads, including the ones a person
 *  has struck. A struck term keeps its line — the tombstone is what stops the run from
 *  promoting it a second time (docs/design/2026-09-02-common-ground.md, §9 amendment) — so
 *  this list is longer than the tracked terms of a run, on purpose. */
export function getWatchlist(): WatchlistEntry[] {
  const raw = Object.values(watchlistModules)[0]
  if (raw === undefined) return []
  return watchlistSchema.parse(raw) as WatchlistEntry[]
}

/** One watched term out of a terms file, by slug. */
export function termIn(file: TrendingTermsDay, slug: string): TrendingTerm | undefined {
  return file.terms.find((t) => t.slug === slug)
}

/** The term as the newest committed file records it. */
export function latestTerm(slug: string): TrendingTerm | undefined {
  const file = getLatestTerms()
  return file ? termIn(file, slug) : undefined
}

/** A term's series over the given files: one point per file that carries the slug, OLDEST
 *  first, capped at `max` points (the most recent ones). Pure, so the tests can hand it
 *  fixtures instead of the archive. */
export function buildSeries(files: TrendingTermsDay[], slug: string, max = 30): TermSeriesPoint[] {
  return files
    .filter((f) => termIn(f, slug) !== undefined)
    .map((f) => ({ date: f.date, d1: termIn(f, slug)!.total.d1 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-max)
}

/** A term's series over the whole committed archive, oldest first, at most thirty points. */
export function seriesFor(slug: string, max = 30): TermSeriesPoint[] {
  return buildSeries(getTermsDays(), slug, max)
}

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
import { trendingTermsSchema } from './terms-schema'
import type { TermSeriesPoint, TrendingTerm, TrendingTermsDay } from './terms-types'

const TERMS_FILE = /\/(\d{4}-\d{2}-\d{2})\.json$/

const termsModules = import.meta.glob('../../data/trending/terms/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

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

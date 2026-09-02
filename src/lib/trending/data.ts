/** Readers for the committed trending files. Vite's import.meta.glob rather than
 *  astro:content so the same functions serve the JSON/Markdown endpoints AND vitest (the
 *  catalogue-feeds test imports the endpoints directly, and astro:content does not exist
 *  there). The content collections in src/content.config.ts validate the files on build;
 *  this parses them once more with the same schema so a reader can never receive a shape
 *  the contract does not promise. */
import { trendingDaySchema, trendingAudienceSchema } from './schema'
import type { TrendingDay, TrendingAudience } from './types'

const DAY_FILE = /\/(\d{4}-\d{2}-\d{2})\.json$/

const dayModules = import.meta.glob('../../data/trending/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
const audienceModules = import.meta.glob('../../data/trending/audience/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

/** Every committed day, newest first. `latest.json` is deliberately not a day: it is a copy. */
export function getTrendingDays(): TrendingDay[] {
  return Object.entries(dayModules)
    .filter(([path]) => DAY_FILE.test(path))
    .map(([, raw]) => trendingDaySchema.parse(raw) as TrendingDay)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getLatestTrending(): TrendingDay | undefined {
  return getTrendingDays()[0]
}

export function getTrendingByDate(date: string): TrendingDay | undefined {
  return getTrendingDays().find((d) => d.date === date)
}

/** Every committed audience day, newest first; `n` caps the result. */
export function getAudienceDays(n = 30): TrendingAudience[] {
  return Object.entries(audienceModules)
    .filter(([path]) => DAY_FILE.test(path))
    .map(([, raw]) => trendingAudienceSchema.parse(raw) as TrendingAudience)
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, n)
}

export function audienceFor(day: string): TrendingAudience | undefined {
  return getAudienceDays(10_000).find((a) => a.day === day)
}

/** The audience record a page for `date` should show: the day before it (a day's readers are
 *  counted the morning after), or nothing — never the nearest available day passed off as it. */
export function audienceBefore(date: string): TrendingAudience | undefined {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return audienceFor(d.toISOString().slice(0, 10))
}

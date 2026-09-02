// The archive register of the trending ledger: every committed day with its page, its JSON and
// what converged on it, newest first. The slim companion to /trending/latest.json — a reader
// that wants a range of days gets the whole map in one request instead of guessing dates.
import type { APIRoute } from 'astro'
import { getTrendingDays } from '@/lib/trending/data'
import { topLabels } from '@/lib/trending/format'
import { trendingUrls } from '@/lib/trending/markdown'

export const prerender = true

export const GET: APIRoute = () => {
  const days = getTrendingDays()
  return new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/trending',
        page: 'https://frankbueltge.de/trending',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'The archive register of Common Ground, the nightly trending ledger: one entry per committed ' +
          'day, newest first, each with the page a person reads, the JSON a machine reads, how many topics ' +
          'converged across independent sources that morning, and the labels that led the day. Committed ' +
          'days are never edited afterwards, so an entry here is a stable citation target.',
        count: days.length,
        days: days.map((d) => ({
          date: d.date,
          url: trendingUrls(d.date).day,
          json: trendingUrls(d.date).dayJson,
          converging: d.summary.converging,
          top_labels: topLabels(d, 3),
        })),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}

// One committed trending day, whole, addressed by its date — the citation target. A day is
// written once in the morning and never edited afterwards, so this URL keeps returning the same
// bytes: a claim made from it stays checkable long after the sources have moved on.
import type { APIRoute, GetStaticPaths } from 'astro'
import { getTrendingDays } from '@/lib/trending/data'
import type { TrendingDay } from '@/lib/trending/types'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () =>
  getTrendingDays().map((day) => ({ params: { date: day.date }, props: { day } }))

export const GET: APIRoute = ({ props }) => {
  const day = (props as { day: TrendingDay }).day
  return new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/trending',
        page: `https://frankbueltge.de/trending/${day.date}`,
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'One morning of Common Ground, the nightly trending ledger: every source read that day with its ' +
          'status and licence, every signal with its own label, rank and count, the topics that surfaced on ' +
          'more than one independent source, and the summary. Written once and never edited afterwards; the ' +
          'register of all days is at /trending/index.json.',
        ...day,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}

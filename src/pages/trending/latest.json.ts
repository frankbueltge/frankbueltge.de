// The newest committed trending day, whole, at a stable address — the one URL a machine reader
// can poll without first learning today's date. Same envelope as the catalogue feeds
// (/atlas/werke.json, /papers/register.json): where it came from, which page shows it, under
// which licence, and one sentence saying what it is.
//
// Static at build time. The archive is Git: the pipeline commits src/data/trending/<date>.json
// every morning, the commit rebuilds the site, and this file moves with it. Nothing is read at
// runtime, so a finding stays recomputable even when a source stops answering.
import type { APIRoute } from 'astro'
import { getLatestTrending } from '@/lib/trending/data'

export const prerender = true

export const GET: APIRoute = () => {
  const day = getLatestTrending()
  return new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/trending',
        page: 'https://frankbueltge.de/trending',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'Common Ground, the nightly ledger: what the open web says it is searching, reading and ' +
          'posting about, read once every morning from independent sources and crossed by a disclosed ' +
          'token rule rather than a model. This is the newest committed day in full — every source with ' +
          'its status and licence, every signal with its own label, rank and count, the converging topics ' +
          'and the summary. Any single day stays reachable at /trending/YYYY-MM-DD.json.',
        ...(day ?? { $contract: 'trending-day/1', date: null, topics: [], sources: [], signals: {}, summary: null }),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}

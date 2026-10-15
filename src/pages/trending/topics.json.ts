// The whole watchlist as it stands today — the arcs half of Common Ground at one stable
// address a machine reader can poll without first learning today's date. Same envelope as the
// catalogue feeds (/atlas/werke.json, /papers/register.json, /trending/latest.json): where it
// came from, which page shows it, under which licence, and one sentence saying what it is.
//
// Static at build time. The archive is Git: the pipeline commits
// src/data/trending/terms/<date>.json with every run, the commit rebuilds the site, and this
// file moves with it. Nothing is read at runtime, so a finding stays recomputable even when a
// platform stops answering.
import type { APIRoute } from 'astro'
import { getLatestTerms } from '@/lib/trending/terms-data'

export const prerender = true

export const GET: APIRoute = () => {
  const file = getLatestTerms()
  return new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/trending/terms',
        page: 'https://frankbueltge.de/trending/topics',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'Common Ground, the slower half of the nightly ledger: terms watched every day across link ' +
          'aggregators, news, code repositories and preprints, counted over one day, seven days and thirty. ' +
          'This is the newest committed run in full — every watched term with its counts per platform, its ' +
          'status and the threshold comparison behind it, the documents each count was read from, and the ' +
          'n-grams a discovery run proposed that nobody tracks yet. A term page and its own JSON live at ' +
          '/trending/topics/<slug> and /trending/topics/<slug>.json; the day ledger of spikes is at ' +
          '/trending/latest.json. Nothing here is written by a language model, and the watchlist is only ' +
          'ever changed by a person.',
        ...(file ?? {
          $contract: 'trending-terms/1',
          date: null,
          sources: [],
          terms: [],
          candidates: [],
          summary: null,
        }),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}

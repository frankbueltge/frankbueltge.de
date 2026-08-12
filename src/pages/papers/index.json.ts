// The papers register without the abstracts — for scanning, not for reading.
//
// `/papers/register.json` is the whole thing and is 2.9 MB, of which the abstracts alone are
// 1.5 MB. A session that fetches it over HTTP gets it truncated, which is worse than a smaller
// feed: it reads as a complete register that happens to stop at the letter G. So the full feed
// stays whole and this one drops exactly one field, `zusammenfassung`, keeping every field a
// reader needs to decide whether a paper is worth the full record: who, when, where, the
// identifier, the URL, the fields it was filed under, and the register's own verdict.
import type { APIRoute } from 'astro'
import { PAPERS } from '@/lib/papers'

export const prerender = true

const KEEP = [
  'id', 'titel', 'urheber', 'jahr', 'ort', 'kennung', 'url', 'frei_zugaenglich',
  'felder', 'urteil', 'verify_status', 'zitiert_von',
] as const

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/register/papers.json',
        page: 'https://frankbueltge.de/papers',
        full: 'https://frankbueltge.de/papers/register.json',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'The papers register with abstracts omitted, so that a fetch returns the whole list ' +
          'rather than a truncated one. Every other field is kept, including the register\'s ' +
          'verdict. For the abstracts, the rejections and the access checks, read the full feed ' +
          'at `full` — knowing it is large.',
        count: PAPERS.length,
        entries: PAPERS.map((p) =>
          Object.fromEntries(
            KEEP.filter((k) => (p as unknown as Record<string, unknown>)[k] !== undefined).map(
              (k) => [k, (p as unknown as Record<string, unknown>)[k]],
            ),
          ),
        ),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )

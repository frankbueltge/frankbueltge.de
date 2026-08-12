// Public, machine-readable dataset register — what /datasets renders, in machine form. Sibling
// of /atlas/werke.json; the reasoning for both is written out there.
//
// This register is deliberately small (59 entries against the 16,516 it once held): since the
// reset of 2026-07-27 it does not collect what exists, it reads what this ecology's own
// pipelines actually call. The access checks travel with it — `geprueft`, `pruef_status`,
// `zugang_gesperrt` — because a source that answers 403 is a fact about the source, not a gap
// in the register.
import type { APIRoute } from 'astro'
import { ENTRIES } from '@/lib/register'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        source:
          'https://github.com/frankbueltge/frankbueltge.de — src/data/register/datasets.json',
        page: 'https://frankbueltge.de/datasets',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'Data sources this ecology actually calls, derived from its own pipelines by the ' +
          'katalog-scout (daily 05:30 UTC) and probed for reachability. Rebuilt with the site, ' +
          'so this feed and the /datasets page are never two states.',
        count: ENTRIES.length,
        entries: ENTRIES,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )

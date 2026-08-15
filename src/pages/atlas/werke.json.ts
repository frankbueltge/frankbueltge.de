// Public, machine-readable atlas of data art — the same 505-and-growing records the /atlas page
// renders, in the form a machine can actually read. Same pattern and same reasoning as
// /studio/chronicle.json and /field/chronicle.json: static at build time, Git is the archive,
// no runtime reads.
//
// Why this exists (2026-08-13, Frank's question, wording private: can the practices reach
// the atlas of data art?): the four research lines of this house run as cloud sessions with their own
// repository and the open web, and NONE of them holds this repository — by design (they publish
// through `site-prs/` and a human-merged gate, `engine-site-pr.yml`). So the atlas, which is
// this house's "has the world already done this?" corpus and therefore the evidence base of the
// USP duty, was reachable to them only as a 938 kB HTML page. That is reachable the way a
// library is reachable if you may only photograph the shelves.
//
// A feed rather than a copy, deliberately. Copying the file into a practice's repository would
// make a second atlas that drifts from the first — the argument that kept `atlas/` out of the
// `error-as-method` fork, and it holds here too. This is rebuilt from `src/data/atlas/werke.json`
// on every build, so it is exactly as current as the page: `atlas-scout` commits new candidates
// daily at 05:00 UTC, the commit triggers the rebuild, and the feed moves with it.
import type { APIRoute } from 'astro'
import works from '@/data/atlas/werke.json'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/atlas/werke.json',
        page: 'https://frankbueltge.de/atlas',
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'The atlas of neighbouring works: data art and adjacent practice, collected by the ' +
          'atlas-scout pipeline (daily 05:00 UTC) and verified before admission. Rebuilt with ' +
          'the site, so this feed and the /atlas page are never two states. Entries carry ' +
          'title, artist, year, venue_prize, clusters, axis_pole, form and decisive_move.',
        count: (works as unknown[]).length,
        entries: works,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )

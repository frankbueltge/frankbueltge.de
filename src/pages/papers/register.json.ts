// Public, machine-readable papers register — what /papers renders, in machine form. Sibling of
// /atlas/werke.json; the reasoning for both is written out there.
//
// The rejections travel with the register, in their own key. A catalogue that publishes only
// what it admitted states a result and hides the criterion — and this house's own line is that
// the discarded stays in the record. `rejected` is small, and it is the part that says what the
// register is FOR.
import type { APIRoute } from 'astro'
import { PAPERS, ABGELEHNT, TESTED_IN_WORK, isTestedInWork } from '@/lib/papers'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/register/papers.json',
        page: 'https://frankbueltge.de/papers',
        slim: 'https://frankbueltge.de/papers/index.json',
        // 2026-11-14: the dedication covers what is the register's own. An abstract is its authors'
        // and publisher's text, read from the source catalogues, and is not the register's to give;
        // since the same day a paywalled work carries none (Frank's decision, wording private).
        licence:
          'CC0-1.0 for the register’s own fields (selection, relevance, verdicts, access checks), per the licence line of 2026-07-26. ' +
          'Titles and names are quoted from the source catalogues. An abstract (`zusammenfassung`) appears only for an openly accessible work ' +
          'and stays under the rights of its authors and publishers; a summary a practice wrote in its own reading list is that practice’s text, under CC BY 4.0. ' +
          'A paywalled work carries its title, authors and link, and no abstract',
        note:
          'Papers this ecology cites, keeps on its reading lists or examined, collected by the katalog-scout ' +
          'pipeline (daily 05:30 UTC) with identifiers resolved and links checked. `geprueft` means ' +
          'the address answered (often a publisher landing page), not that the full text is open; ' +
          '`lesestand` is a practice\u2019s own reading mark (seed = not yet read, read, worked). Rebuilt ' +
          'with the site, so this feed and the /papers page are never two states. `rejected` ' +
          'holds what the register turned away, with its reason. This feed is LARGE (the ' +
          'abstracts make most of it); to scan rather than read, take `slim` — same entries, ' +
          'no abstracts, whole in one fetch.',
        count: PAPERS.length,
        // Since 2026-11-09 /papers lists only what the practices cite or keep on reading lists; identifiers a work tested
        // as its material (found only in a work's data folder) carry `tested_in_work: true`.
        tested_in_work_count: TESTED_IN_WORK.length,
        rejected_count: ABGELEHNT.length,
        entries: PAPERS.map((p) => ({ ...p, tested_in_work: isTestedInWork(p) })),
        rejected: ABGELEHNT,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )

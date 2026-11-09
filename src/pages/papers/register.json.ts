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
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'Papers this ecology has read, cited or examined, collected by the katalog-scout ' +
          'pipeline (daily 05:30 UTC) with identifiers resolved and access checked. Rebuilt ' +
          'with the site, so this feed and the /papers page are never two states. `rejected` ' +
          'holds what the register turned away, with its reason. This feed is LARGE (the ' +
          'abstracts alone are 1.5 MB); to scan rather than read, take `slim` — same entries, ' +
          'no abstracts, whole in one fetch.',
        count: PAPERS.length,
        // Since 2026-11-09 /papers lists only what the practices read; identifiers a work tested
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

// src/lib/n1/published.ts — the n-1 pages this site publishes as works (2026-10-17).
//
// Since the publication rule of 2026-10-17 (src/lib/engines/publication.mjs) the site serves
// n-1's front page, its record and its works, not its studies. A page is a work where the house's
// shelf reading says so (src/lib/n1/shelf.ts: filed under works/, a work document beside it, or a
// night's record declaring it one), and also where the practice's own front page lists it among its
// works (surface/margin.json). The second source exists because the practice declares some works
// in words the shelf does not read yet ("closes as a modest work"); a page the practice presents as
// a work on its own front door must not lead from there to a repository listing.
//
// Read by the prune integration (on dist/n-1, before it prunes) and by the links that name n-1's
// newest page (on public/n-1): one derivation, so the two can never disagree about a page.
//
// The imports carry their extensions: this file is reached from astro.config.mjs, which Node may
// load without a bundler.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { n1MarginWorks } from '../engines/publication.mjs'
import { N1_MIRROR, readN1Shelf } from './shelf.ts'

/** Dist-relative paths (`n-1/works/x/index.html`) of every page n-1 has declared a work. */
export function n1WorkPages(root: string = N1_MIRROR): Set<string> {
  const out = new Set<string>()
  for (const page of readN1Shelf(root)) if (page.kind === 'work') out.add(`n-1/${page.path}`)
  try {
    for (const page of n1MarginWorks(JSON.parse(readFileSync(join(root, 'surface', 'margin.json'), 'utf8')))) out.add(page)
  } catch {
    // no front-page listing, or an unreadable one: the shelf's reading stands alone
  }
  return out
}

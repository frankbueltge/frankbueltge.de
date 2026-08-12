// src/lib/ecology/pyramid/counts.ts — the four numbers under the timeline, counted from the
// committed files at build time and never written into the prose (wording-kanon).
//
// The entrance says "every figure counted from committed files, never typed". This module is what
// makes that sentence true, and it is deliberately the ONLY place the entrance counts anything:
// the works total comes through the engines register, which is the site's single counting point,
// so /ecology and /works cannot disagree about how many works exist.

import { allWorks, summarise } from '@/lib/engines/register'
import { PROTOCOL_LADDER } from '@/lib/engines/nightly-line'
import crossings from '@/data/begegnungen/register.json'

/** Every journal page in the house: the three practices' own journals plus the forked nightly
 *  line's, which is the Atelier's practice by descent and keeps its pages in its own repository. */
const JOURNALS = import.meta.glob(['/src/content/*/journal/*.md', '/src/data/nightly/journal/*.md'])

export interface HouseCounts {
  /** the night the founding text was adopted — the house's own start, from the ladder */
  since: string
  works: number
  journalPages: number
  crossings: number
}

export function houseCounts(): HouseCounts {
  const founding = PROTOCOL_LADDER.reduce((min, step) => (step.date < min.date ? step : min), PROTOCOL_LADDER[0])
  return {
    since: founding.date,
    works: summarise(allWorks()).total,
    // The Plenum keeps minutes rather than a journal, and is a guest voice in any case — its
    // pages are not the house's pages.
    journalPages: Object.keys(JOURNALS).filter((p) => !p.includes('/plenum/')).length,
    crossings: (crossings as unknown[]).length,
  }
}

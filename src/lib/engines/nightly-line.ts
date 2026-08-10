// src/lib/engines/nightly-line.ts — the nightly line, derived from what is already committed.
//
// The Atelier's works up to 2026-07-18 were not a series of one-offs: they were a line with a
// position, and the position moved once, at session 26, when the practice read its own field and
// replaced "error is what method is made of" with error as a special case of Rheinberger's
// epistemic thing. The night after the last of them, Protocol v4 replaced nightly work with
// bounded projects; v5 replaced those with work-lines. On 2026-08-11 Frank forked the line back
// to life in its own repository, under the protocol that produced it.
//
// Nothing here is a second mirror. Those works have been on this site since they were made, under
// /atelier/werke/… — this module only draws the line around them, from their own committed metas,
// so the page can never claim a count the archive does not have.

import { allWorks } from './register'
import type { LatestWork } from './latest'

/** The night the line was switched off — v4 landed the next day. */
export const LINE_END = '2026-07-18'
/** The night it was restarted, in its own repository, under Protocol v3 restored verbatim. */
export const LINE_RESUMED = '2026-08-11'
export const LINE_REPO = 'https://github.com/frankbueltge/error-as-method'

/** The session at which the position moved — the practice's own outward turn. */
export const OUTWARD_TURN = {
  session: 26,
  date: '2026-07-14',
  /** verbatim from works/position-2026-07-14.md, mirrored to src/content/atelier/works/ */
  quote:
    'For 25 sessions the project asserted "error is what method is made of" and never read the ' +
    'field it practices. On 2026-07-14 it finally did.',
  href: '/atelier/requests/archive',
}

export interface NightlyLine {
  works: LatestWork[]
  count: number
  first?: string
  last?: string
  /** research days the line ran, inclusive — a fact about the calendar, not about output */
  days: number
}

/** Every work of the line, oldest first. A work counts if the Atelier made it on or before the
 *  night the line stopped; there is no editorial selection, and none is possible here. */
export function nightlyLine(): NightlyLine {
  const works = allWorks()
    .filter((w) => w.ns === 'atelier' && w.date <= LINE_END)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.slug.localeCompare(b.slug)))

  const first = works[0]?.date
  const last = works[works.length - 1]?.date
  const days =
    first && last ? Math.round((Date.parse(last) - Date.parse(first)) / 86_400_000) + 1 : 0

  return { works, count: works.length, first, last, days }
}

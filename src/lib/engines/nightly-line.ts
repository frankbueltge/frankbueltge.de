// src/lib/engines/nightly-line.ts — the nightly line, derived from what is already committed.
//
// The Atelier's works up to 2026-07-18 were not a series of one-offs: they were a line with a
// position, and the position moved once, at session 26, when the practice read its own field and
// replaced "error is what method is made of" with error as a special case of Rheinberger's
// epistemic thing. The night after the last of them, Protocol v4 replaced nightly work with
// bounded projects; v5 replaced those with work-lines. On 2026-08-10 Frank forked the line back
// to life in its own repository, under the protocol that produced it.
//
// The line therefore has two halves in two repositories, and this module draws one figure across
// both. Neither half is mirrored twice: the works up to 2026-07-18 have been on this site since
// the night each was made, under /atelier/werke/…, and the nights since are mirrored from the
// fork into src/data/nightly. Both come from the works register, so the page can never claim a
// count the archive does not have.

import { allWorks, forkedNightlyWorks } from './register'
import type { EngineWorkMeta, LatestWork } from './latest'

/** The night the line was switched off — v4 landed the next day. */
export const LINE_END = '2026-07-18'
/** The night it was restarted, in its own repository, under Protocol v3 restored verbatim.
 *  The date the repository itself carries (PROTOCOL.md, "On 2026-08-10 Frank forked …"), not
 *  the local calendar date of the session that did it. */
export const LINE_RESUMED = '2026-08-10'
export const LINE_REPO = 'https://github.com/frankbueltge/error-as-method'

/** The constitutions the practice has run under, oldest first — the one ladder both arms need,
 *  so /atelier and /error-as-method can never tell it differently.
 *
 *  This is historical record, not live state: each row is a text archived in the engine repo
 *  under `archive/protocols/`, and the dates are the ones those filenames carry. The CURRENT
 *  version is not written here — pages read it from the mirrored PROTOCOL.md, so a protocol
 *  change shows up without anyone editing this list.
 *
 *  Read it as the answer to the question the site could not answer before: v3 and v6 are not
 *  two numbers of one thing, they are two constitutions with different units of work, and the
 *  fork is the younger repository carrying the older line. */
export interface ProtocolStep {
  version: number
  date: string
  /** what the protocol made the unit of work */
  unit: string
  /** what changed, in the practice's own terms */
  note: string
  /** true for the constitution the forked line runs under */
  restored?: boolean
}

export const PROTOCOL_LADDER: readonly ProtocolStep[] = [
  {
    version: 2,
    date: '2026-06-28',
    unit: 'the night',
    note: 'the founding text — “the subject is free”, and both names provisional',
  },
  {
    version: 3,
    date: '2026-07-16',
    unit: 'the night',
    note: 'the nightly constitution, and the last one the nightly line ran under',
    restored: true,
  },
  {
    version: 4,
    date: '2026-07-18',
    unit: 'the bounded project',
    note: 'nightly work ends — the ban is on “a routine whose reason for running is the clock itself”',
  },
  { version: 5, date: '2026-07-24', unit: 'the work-line', note: 'bounded projects give way to an open horizon' },
  {
    version: 6,
    date: '2026-08-08',
    unit: 'the work-line',
    note: 'the work-line protocol sharpened — and amended on 2026-08-12, when the horizon closed at twelve worked sessions',
  },  {
    version: 7,
    date: '2026-08-30',
    unit: 'the shared question',
    note: 'research ecology v3 — one question for all three practices, set at the reading held that day',
  },
]

/** A forked work's metadata as the practice committed it, by slug — for the one page that shows
 *  more of it than a catalogue entry can (the register keeps only what a catalogue row needs). */
const FORK_METAS = import.meta.glob('/src/data/nightly/works/*/meta.json', {
  eager: true,
  import: 'default',
}) as Record<string, EngineWorkMeta>

export function forkedMeta(slug: string): EngineWorkMeta | undefined {
  return FORK_METAS[`/src/data/nightly/works/${slug}/meta.json`]
}

/** Works made after the fork, each linking to its own page on this site. Derived once, in the
 *  works register, so the line's page and the house's register can never disagree about what
 *  the fork has made. */
export const forkedWorks = forkedNightlyWorks

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
  /** the works the line made before it was switched off, held by the Atelier's mirror */
  inherited: number
  /** the works the fork has made since, held by this line's own mirror */
  sinceFork: number
  first?: string
  last?: string
  /** calendar days of the FIRST run, first night to the night it was switched off, inclusive.
   *  Deliberately not the span of the whole list: the line stood still for weeks in between, and
   *  a figure that swallowed the dormancy would report it as work. */
  days: number
  /** the days it stood still — counted, so the page never has to round it into a word */
  dormant: number
}

/** Every work of the line, NEWEST first — the order the works register uses, and the order a
 *  reader wants when a line is running again: the most recent night at the top. A work counts if
 *  the Atelier made it on or before the night the line stopped, or if the fork has made it since;
 *  there is no editorial selection, and none is possible here. The two halves come from two
 *  mirrors and are one list, because they are one line. `first`/`last` stay chronological
 *  regardless of the display order. */
export function nightlyLine(): NightlyLine {
  const inherited = allWorks().filter((w) => w.ns === 'atelier' && w.date <= LINE_END)
  const sinceFork = forkedWorks()
  const works = [...inherited, ...sinceFork].sort((a, b) =>
    a.date > b.date ? -1 : a.date < b.date ? 1 : a.slug.localeCompare(b.slug),
  )

  const dates = works.map((w) => w.date).sort()
  const first = dates[0]
  const last = dates[dates.length - 1]
  const span = (from?: string, to?: string): number =>
    from && to ? Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) : 0
  const days = first ? span(first, LINE_END) + 1 : 0
  const dormant = span(LINE_END, LINE_RESUMED)

  return {
    works,
    count: works.length,
    inherited: inherited.length,
    sinceFork: sinceFork.length,
    first,
    last,
    days,
    dormant,
  }
}

// src/lib/studio/long-work.ts — the Studio's long work, counted (2026-10-17).
//
// The amendment of 2026-10-15 to the Studio's constitution ("the long work", studio/PROTOCOL.md)
// has the practice make ONE work per working cycle and grow it across the cycle's sessions: the
// first session writes its score (`works/<slug>/SCORE.md`) and lays its ground, every later
// session advances it by one increment, the second-to-last is a critique, and the last presents
// it. Until the last session the work is in progress, "and nothing unfinished is passed off as
// finished".
//
// The site counted a Studio work as one dated folder, made and premiered by one session. Under the
// long work that count says two wrong things: the sessions after the first leave no new folder, so
// the score drew them as sessions without a work, and the folder appears the night of the first
// increment, so every room that lists the folder called it premiered. The Studio took the form up
// early, in cycle 008 (FILED UNDER, sessions 175 onwards), so both showed at once.
//
// This module only COUNTS. It reads the practice's own self-report — the chronicle, mirrored
// nightly to src/data/studio/chronicle.upstream.json — the way the amendment tells the practice
// to write it (point 8): the score and every increment `build`, the critique `verify`, the last
// session `ship`, each entry naming the long work's slug. A work is a long work when its score
// stands beside it in the mirror. The richer reading of a long work (its increments on its own
// page) waits until the first one has shipped.

import fs from 'node:fs'
import path from 'node:path'

import { loadChronicle, type Move } from './chronicle'

/** The moves a session of a long work is recorded under (the amendment, point 8). */
export const INCREMENT_MOVES: readonly Move[] = ['build', 'verify', 'ship']

/** What this module needs of a chronicle entry — the merged entry and the upstream self-report
 *  both have it. */
export interface ChronicleMove {
  collective_session: number | null
  date: string
  move: Move
  works: readonly string[]
}

export interface LongWorkSession {
  session: number
  date: string
  move: Move
}

export interface LongWork {
  /** the work's directory under works/, as the chronicle names it */
  slug: string
  /** every session that advanced it, oldest first */
  sessions: LongWorkSession[]
  /** the session that shipped it — the premiere; null while it is in progress */
  shipped: LongWorkSession | null
}

/** Where the mirror lands a Studio work's files; the score is one of them. */
export const STUDIO_STAGE_DIR = 'public/studio/werke-html'

/** Whether a Studio work is a long work: its score (SCORE.md) stands beside it. */
export function hasScore(slug: string, root: string = process.cwd()): boolean {
  return fs.existsSync(path.join(root, STUDIO_STAGE_DIR, slug, 'SCORE.md'))
}

/**
 * The long works the chronicle records, each with the sessions that advanced it. Pure: the
 * entries and the test for a long work are handed in. A session counts once per work, whatever
 * else it names; an entry without a session number, or with a move outside the amendment's three,
 * advances nothing.
 */
export function longWorks(entries: readonly ChronicleMove[], isLong: (slug: string) => boolean): LongWork[] {
  const bySlug = new Map<string, LongWork>()
  const ordered = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.collective_session ?? 0) - (b.collective_session ?? 0),
  )
  for (const e of ordered) {
    if (e.collective_session === null || !INCREMENT_MOVES.includes(e.move)) continue
    for (const slug of new Set(e.works)) {
      if (!isLong(slug)) continue
      const work = bySlug.get(slug) ?? { slug, sessions: [], shipped: null }
      if (work.sessions.some((s) => s.session === e.collective_session)) continue
      const step = { session: e.collective_session, date: e.date, move: e.move }
      work.sessions.push(step)
      if (e.move === 'ship' && !work.shipped) work.shipped = step
      bySlug.set(slug, work)
    }
  }
  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))
}

/** The slugs of the long works still in progress: advanced, never shipped. */
export function inProgress(works: readonly LongWork[]): Set<string> {
  return new Set(works.filter((w) => w.shipped === null).map((w) => w.slug))
}

/** The long works of the committed record: the mirrored chronicle, and the scores in the mirror. */
export function loadLongWorks(root: string = process.cwd()): LongWork[] {
  return longWorks(loadChronicle(), (slug) => hasScore(slug, root))
}

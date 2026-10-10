// src/lib/ops/edition.ts — THE EDITION: what the entrance says on a given day, derived.
//
// Since 2026-10-11 the entrance is laid out like the front page of a paper (design handoff:
// docs/design_handoff_homepage_ecology/README.md §2): a dateline, a lead, a list of what
// arrived, a column per house. A front page has a date, and everything on it that says
// "today", "yesterday" or "since" hangs on that date. This module decides it, once, and
// derives the page's parts from the two records that already exist — the house's stream of
// live updates (src/lib/ops/live-feed.ts) and the commit pulse (src/data/pulse/pulse.json).
//
// THE EDITION INSTANT is the newest moment either record knows of: the pulse's own as-of
// stamp, or the newest row of the feed where that is later. The pulse is refreshed once a day
// around noon UTC while the practices land their work before dawn, so for half of every day the
// feed is ahead of the pulse — and a dateline read off the pulse alone would call a page
// "Saturday" that already lists Sunday's arrivals. No clock is read: the edition is a property
// of the committed record, and the same record always yields the same page.
//
// Nothing here is authored. Titles, facts, names and addresses are the feed's own; this module
// selects, groups and counts.

import type { FeedEntry, HouseId } from '@/lib/ops/house-feed'
import { dayOf, startOf } from '@/lib/ops/since'

/** "2026-10-10 12:46 UTC" → the instant, in milliseconds. The stamp is written by
 *  scripts/fetch-pulse.ts in exactly this shape; anything else is null rather than a guess. */
export function asOfInstant(asOf: string): number | null {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}) UTC$/.exec(asOf.trim())
  if (!m) return null
  const ms = Date.parse(`${m[1]}T${m[2]}:${m[3]}:00Z`)
  return Number.isFinite(ms) ? ms : null
}

/** The instant a row stands at: the one its record names, or the start of its day where the
 *  record names only the day. */
export function entryInstant(e: Pick<FeedEntry, 'date' | 'time'>): number {
  const named = e.time ? Date.parse(e.time) : NaN
  return Number.isFinite(named) ? named : startOf(e.date)
}

/**
 * The edition instant (see the head of this file). `feed` need not be sorted. With an
 * unreadable as-of stamp and an empty feed there is no record to date an edition by, and the
 * function throws: a front page without a date is a build that should stop.
 */
export function editionInstant(feed: readonly Pick<FeedEntry, 'date' | 'time'>[], asOf: string): number {
  const stamps = feed.map(entryInstant)
  const pulse = asOfInstant(asOf)
  if (pulse !== null) stamps.push(pulse)
  if (stamps.length === 0) throw new Error('edition: neither the pulse nor the feed carries a date')
  return stamps.reduce((a, b) => Math.max(a, b))
}

// ── the since list ───────────────────────────────────────────────────────────────────────────

export interface SinceDay {
  /** the UTC day, ISO */
  date: string
  /** every arrival of that day */
  count: number
  /** the rows the page shows for it, in the feed's own order */
  rows: FeedEntry[]
  /** how many more the longer log holds */
  more: number
}

/**
 * The feed's days from `fromDay` (inclusive) on, newest first, each cut to its first `perDay`
 * rows. The feed's order within a day is kept as it comes — sortFeed already lets every source
 * take its turn, so the first rows of a day are one from each house rather than seven readings.
 */
export function sinceDays(feed: readonly FeedEntry[], fromDay: string, perDay: number): SinceDay[] {
  const byDay = new Map<string, FeedEntry[]>()
  for (const e of feed) {
    if (e.date < fromDay) continue
    const list = byDay.get(e.date)
    if (list) list.push(e)
    else byDay.set(e.date, [e])
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, entries]) => ({
      date,
      count: entries.length,
      rows: entries.slice(0, Math.max(0, perDay)),
      more: Math.max(0, entries.length - Math.max(0, perDay)),
    }))
}

/** Arrivals per day from `fromDay` (inclusive) on — the counts a returning reader's sentence is
 *  summed from, for a longer stretch than the page lists row by row. */
export function arrivalsByDay(feed: readonly Pick<FeedEntry, 'date'>[], fromDay: string): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of feed) if (e.date >= fromDay) counts[e.date] = (counts[e.date] ?? 0) + 1
  return counts
}

/** The ISO day `n` days before `isoDay`. */
export const daysBefore = (isoDay: string, n: number): string => dayOf(startOf(isoDay) - n * 86_400_000)

// ── the lead ─────────────────────────────────────────────────────────────────────────────────

export type PracticeHouse = Extract<HouseId, 'atelier' | 'field' | 'studio'>

/** What a practice lands in a session: an artifact, a work, or the presentation that closes its
 *  cycle. The other readers that file rows under a practice's house do not exist today; naming
 *  the three keeps a future one from becoming a "piece" by accident. */
const PIECE_SOURCES: readonly FeedEntry['source'][] = ['artifact', 'work', 'presentation']

/**
 * The newest piece each practice has landed since `sinceDay` (inclusive) — the day the running
 * cycle opened. A practice with nothing since then maps to null: the lead draws that absence
 * rather than reaching back into the cycle before for something to show. Withdrawn works are
 * passed over; a lead does not headline what its maker took back.
 */
export function newestPieces(
  feed: readonly FeedEntry[],
  practices: readonly PracticeHouse[],
  sinceDay: string,
): Record<PracticeHouse, FeedEntry | null> {
  const out = { atelier: null, field: null, studio: null } as Record<PracticeHouse, FeedEntry | null>
  for (const practice of practices) {
    let best: FeedEntry | null = null
    for (const e of feed) {
      if (e.house !== practice || e.withdrawn || e.date < sinceDay || !PIECE_SOURCES.includes(e.source)) continue
      if (!best || e.date > best.date || (e.date === best.date && entryInstant(e) > entryInstant(best))) best = e
    }
    out[practice] = best
  }
  return out
}

/**
 * A title without a trailing " — <house>" (in any case, with or without the article): the
 * Atelier titles its windows "The Hinge — the Atelier", and under a column headed THE ATELIER
 * the second half is the heading said twice. Only an exact trailing match is cut.
 */
export function withoutHouseSuffix(title: string, houseName: string): string {
  const bare = houseName.replace(/^the\s+/i, '')
  const escaped = bare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return title.replace(new RegExp(`\\s+[—–-]\\s+(?:the\\s+)?${escaped}\\s*$`, 'i'), '')
}

/**
 * A row as one line: its title, and the one fact its record carries where it carries one. A
 * fact that already opens with the title is the whole line — a project's own statement begins
 * with its name ("The Foreknown stopped recording…"), and printing the name before it says it
 * twice.
 */
export const lineOf = (e: Pick<FeedEntry, 'title' | 'fact'>): string =>
  !e.fact ? e.title : e.fact.startsWith(e.title) ? e.fact : `${e.title} · ${e.fact}`

// ── house by house ───────────────────────────────────────────────────────────────────────────

/** The newest row any of `houses` has in the feed, or null. `feed` need not be sorted. */
export function newestOf(feed: readonly FeedEntry[], houses: readonly HouseId[]): FeedEntry | null {
  let best: FeedEntry | null = null
  for (const e of feed) {
    if (!houses.includes(e.house)) continue
    if (!best || e.date > best.date || (e.date === best.date && entryInstant(e) > entryInstant(best))) best = e
  }
  return best
}

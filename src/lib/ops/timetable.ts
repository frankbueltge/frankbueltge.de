// src/lib/ops/timetable.ts — THE TIMETABLE: who worked when, read off the commit pulse.
//
// The entrance's board used to draw a sparkline per system — the shape of two weeks of commits.
// The redesign of 2026-10-11 (docs/design_handoff_homepage_ecology/README.md §2.4) asks a
// plainer question of the same snapshot: on each of the last days, between which hours did each
// system work? A cell answers with the first and the last two-hour block of that UTC day that
// carry a commit, or with a dot when none does.
//
// Everything is read from the committed pulse snapshot (src/data/pulse/pulse.json →
// weeks[].by_repo): one array of two-hour bins per repository and ISO week, Monday 00:00 UTC
// first. This module only cuts those arrays into days. It forecasts nothing — the last day ends
// at the snapshot's own cutoff, and a block that has not started yet is not drawn as silence
// but simply is not there.
//
// PURE AND DETERMINISTIC: same snapshot, same repositories ⇒ the same table. No clock is read;
// "the last day" is the last day the snapshot has begun.

import type { PulseSnapshot } from '@/lib/pulse/render'

const DAY_MS = 86_400_000

export interface TimetableCell {
  /** the UTC day, ISO */
  date: string
  /** commits per block of that day, earliest first — only the blocks that have begun */
  blocks: number[]
  commits: number
  /** indices of the blocks that carry a commit */
  active: number[]
  /** the UTC hour the first active block begins at, and the hour the last one ends at */
  from: number | null
  to: number | null
}

export interface TimetableRow {
  repo: string
  cells: TimetableCell[]
  /** commits across every day of the table */
  commits: number
}

export interface Timetable {
  /** the UTC days of the table, oldest first, ISO */
  days: string[]
  /** hours per block, as the snapshot bins them */
  blockHours: number
  /** blocks in a whole day */
  blocksPerDay: number
  rows: TimetableRow[]
}

/** Monday 00:00 UTC of an ISO week, in milliseconds. ISO 8601: week 1 is the week holding the
 *  fourth of January, and weeks begin on Monday. */
export function isoWeekStart(isoYear: number, isoWeek: number): number {
  const jan4 = Date.UTC(isoYear, 0, 4)
  const weekday = (new Date(jan4).getUTCDay() + 6) % 7 // Monday = 0
  return jan4 - weekday * DAY_MS + (isoWeek - 1) * 7 * DAY_MS
}

const isoDay = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/**
 * The table for `repos`, over the last `days` days the snapshot has begun.
 *
 * A repository with no commit in a week is absent from that week's split, which is a real
 * zero: its cells read as days on which nothing ran. A week without any split at all (a
 * snapshot older than 2026-08-11) contributes no days — the aggregate cannot say who worked,
 * and a row cut out of it would be a picture of a repository that was never measured.
 */
export function buildTimetable(snapshot: PulseSnapshot, repos: readonly string[], days = 7): Timetable {
  const blockHours = snapshot.bin_hours
  const blocksPerDay = Math.round(24 / blockHours)
  const perWeek = snapshot.bins_per_week

  // Every day the snapshot has begun, oldest first, with where its blocks sit in its week.
  const begun: { date: string; week: number; start: number; length: number }[] = []
  snapshot.weeks.forEach((week, w) => {
    if (!week.by_repo) return
    const monday = isoWeekStart(week.iso_year, week.iso_week)
    const elapsed = Math.max(0, Math.min(week.cutoff_bin ?? perWeek, perWeek))
    for (let d = 0; d * blocksPerDay < elapsed; d++) {
      const start = d * blocksPerDay
      begun.push({ date: isoDay(monday + d * DAY_MS), week: w, start, length: Math.min(blocksPerDay, elapsed - start) })
    }
  })
  const shown = begun.slice(-Math.max(0, days))

  const rows = repos.map((repo): TimetableRow => {
    const cells = shown.map((day): TimetableCell => {
      const own = snapshot.weeks[day.week].by_repo?.[repo]
      const blocks = Array.from({ length: day.length }, (_, i) => own?.[day.start + i] ?? 0)
      const active = blocks.flatMap((count, i) => (count > 0 ? [i] : []))
      return {
        date: day.date,
        blocks,
        commits: blocks.reduce((a, b) => a + b, 0),
        active,
        from: active.length ? active[0] * blockHours : null,
        to: active.length ? (active[active.length - 1] + 1) * blockHours : null,
      }
    })
    return { repo, cells, commits: cells.reduce((sum, c) => sum + c.commits, 0) }
  })

  return { days: shown.map((d) => d.date), blockHours, blocksPerDay, rows }
}

/**
 * A cell as the small-screen strip draws it: one bar per block, its height the square root of
 * the block's commits so one loud block does not flatten a day's quiet ones — three units for
 * the first commit and three more per root, capped at `max` (the handoff's rule, §3). Returned
 * as the `d` of one SVG path in a box `blocksPerDay` wide and `max` high, bars standing on the
 * floor, so a whole day is a single element and a day without commits is an empty path.
 */
export function stripPath(blocks: readonly number[], max = 16): string {
  return blocks
    .map((count, i) => {
      if (count <= 0) return ''
      const h = Math.min(max, 3 + Math.round(Math.sqrt(count) * 3))
      return `M${i} ${max - h}h1v${h}h-1z`
    })
    .join('')
}

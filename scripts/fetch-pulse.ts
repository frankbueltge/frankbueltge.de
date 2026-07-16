// Fetches the ecology's real commit activity — the five sibling repos this site, the three
// autonomous engines and research-ecology (the conductor) all live in — and writes a
// committed, citable snapshot to src/data/pulse/pulse.json: one row per ISO week (rolling,
// the last 13 including the current, partial one), 2-hour UTC bins, Monday 00:00 → Sunday
// 24:00. Same shape as scripts/fetch-climate.ts: the snapshot is committed so the build is
// reproducible and offline-safe, and the exact numbers behind the hub's pulse are auditable.
//
// This script is the ONE place allowed to read the clock and the sibling checkouts (decisions
// doc 2026-07-16 §1.2 + site-v2 work order §2) — src/lib/pulse/render.ts, which turns this
// JSON into the SVG, never does either. Run with: npm run pulse:refresh. Nightly refresh of
// this snapshot is a later, separate work item (the nightly chain strand, not this package) —
// per the work order this is run once now and committed.
//
// Port of research-ecology's docs/design/variants-2026-07-16-hub/hub_pulse_viz.py `collect()` —
// same five repos, same 2-hour bins — generalised from that mockup's hand-pinned W17–29/2026
// window to a rolling "last 13 ISO weeks ending today" window, so re-running this script next
// month still produces a sensible snapshot instead of silently drawing 2026-W17 forever.

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import type { PulseSnapshot, PulseWeek } from '../src/lib/pulse/render.ts'

const OUT = 'src/data/pulse/pulse.json'
const BIN_HOURS = 2
const BINS_PER_WEEK = (7 * 24) / BIN_HOURS // 84
const WEEK_COUNT = 13

// The site repo checkout is expected to sit alongside its sibling ecology repos, same
// workspace convention as ~/Documents/GitHub/CLAUDE.md describes ("each subdirectory is an
// independent project"). Resolved from cwd rather than hard-coded to one machine's username.
const GH_ROOT = resolve(process.cwd(), '..')
const REPOS = ['field-research', 'irrtum-als-methode', 'studio', 'research-ecology', 'frankbueltge.de']

/** ISO 8601 week-numbering, the standard "nearest Thursday" algorithm (UTC throughout). */
function isoWeekOf(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = d.getUTCDay() || 7 // Mon=1 .. Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum) // Thursday of the same ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

/** UTC midnight Monday of the ISO week containing `date`. */
function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = d.getUTCDay() || 7 // Mon=1 .. Sun=7
  d.setUTCDate(d.getUTCDate() - dayNum + 1)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

const now = new Date()
const thisMonday = mondayOf(now)
const firstMonday = addDays(thisMonday, -7 * (WEEK_COUNT - 1))

// The 13 target weeks, oldest first, current (possibly partial) last.
const targetWeeks = Array.from({ length: WEEK_COUNT }, (_, i) => {
  const monday = addDays(firstMonday, 7 * i)
  const { year, week } = isoWeekOf(monday)
  return { year, week, bins: new Array<number>(BINS_PER_WEEK).fill(0) }
})
const weekIndex = new Map(targetWeeks.map((w, i) => [`${w.year}-${w.week}`, i]))

const repoLast: Record<string, string> = {}
for (const repo of REPOS) {
  const repoPath = join(GH_ROOT, repo)
  const out = execFileSync(
    'git',
    ['-C', repoPath, 'log', `--since=${firstMonday.toISOString().slice(0, 10)}`, '--format=%aI'],
    { encoding: 'utf8' },
  )
  const stamps = out.split('\n').filter(Boolean)
  for (const iso of stamps) {
    const t = new Date(iso)
    const { year, week } = isoWeekOf(t)
    const idx = weekIndex.get(`${year}-${week}`)
    if (idx === undefined) continue // outside the rolling window (--since is a coarse cutoff)
    const weekdayIdx = (t.getUTCDay() || 7) - 1 // Mon=0 .. Sun=6
    const hourBin = Math.floor(t.getUTCHours() / BIN_HOURS)
    const binIdx = weekdayIdx * (24 / BIN_HOURS) + hourBin
    targetWeeks[idx].bins[binIdx] += 1
  }
  if (stamps.length) repoLast[repo] = stamps.reduce((a, b) => (a > b ? a : b)).slice(0, 10)
}

// The current (last) week's cutoff: how many 2-hour bins have started, inclusive of the one
// "now" falls in — ported from hub_pulse_viz.py's `n = ((weekday-1)*24 + hour)//BIN_HOURS + 1`.
const nowWeekdayIdx = (now.getUTCDay() || 7) - 1
const cutoffBin = Math.min(
  BINS_PER_WEEK,
  Math.max(1, nowWeekdayIdx * (24 / BIN_HOURS) + Math.floor(now.getUTCHours() / BIN_HOURS) + 1),
)

const weeks: PulseWeek[] = targetWeeks.map((w, i) => ({
  iso_year: w.year,
  iso_week: w.week,
  bins: w.bins,
  ...(i === targetWeeks.length - 1 ? { cutoff_bin: cutoffBin } : {}),
}))

const totalCommits = weeks.reduce((sum, w) => sum + w.bins.reduce((a, b) => a + b, 0), 0)
const asOf = `${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`

const snapshot: PulseSnapshot = {
  schema_version: '1',
  generated_at: now.toISOString(),
  as_of: asOf,
  bin_hours: BIN_HOURS,
  bins_per_week: BINS_PER_WEEK,
  repos: REPOS,
  total_commits: totalCommits,
  weeks,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n')

console.log(
  `wrote ${OUT}: ${weeks.length} weeks (W${weeks[0].iso_week}/${weeks[0].iso_year}–` +
    `W${weeks.at(-1)!.iso_week}/${weeks.at(-1)!.iso_year}), ${totalCommits} commits, as of ${asOf}`,
)
for (const [repo, last] of Object.entries(repoLast)) console.log(`  ${repo}: last commit ${last}`)

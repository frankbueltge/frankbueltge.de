// Fetches the real commit activity of ALL repositories involved in this site (Frank,
// 2026-08-10: the pulse is the whole site's, not the ecology's) — the site itself, the three
// ecology engines and research-ecology, machine-attention, and data-snack-plenum (the
// resident collective this site integrates) — and writes a committed, citable snapshot to
// src/data/pulse/pulse.json: one row per ISO week (rolling, the last 13 including the
// current, partial one), 2-hour UTC bins, Monday 00:00 → Sunday 24:00. Same shape as scripts/fetch-climate.ts: the snapshot is committed so the build is
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
const REPOS = [
  'field-research',
  'ulysses',
  'studio',
  'research-ecology',
  'machine-attention',
  'data-snack-plenum',
  // The nightly line, forked back to life in its own repository on 2026-08-11 (see
  // src/lib/engines/nightly-line.ts). It runs beside the ecology under the same law, so the
  // pulse counts it like the other machine-run repos — and the ops room's board draws its
  // sparkline from this repo's own bins.
  'error-as-method',
  // Arch, founded 2026-08-22 beside the ecology under its own dowry; its sessions commit to
  // this repository, so the ops room's board draws its sparkline from these bins.
  'arch',
  // n-1 (the practice named itself Remainder), founded 2026-08-15 as the Atelier's third line
  // and given a board row of its own on 2026-09-03. It was the one practice standing beside the
  // ecology whose commits the pulse did not count — so the hero's total was short by a machine
  // that works every night, and its board row could draw no sparkline.
  'n-1',
  'frankbueltge.de',
]

// The pulse measures the MACHINES' activity (Frank, 2026-07-25): for the machine-run repos
// the real work happens across their session/feature branches, so they are counted with
// `git log --all` — the nightly must clone them with all branches present (--no-single-branch)
// for this to reproduce. The site repo (frankbueltge.de) is Frank's own; its work lands on
// main and its human feature branches are not "the ridge before dawn", so it is counted on
// HEAD/main only. NOTE: `--all` is why the count is far higher than a main-only count would be
// (field-research alone: ~170 on main vs ~690 across all branches) — that difference IS the
// machine activity the hero is meant to show. machine-attention and data-snack-plenum joined
// 2026-08-10 (Frank: the pulse shows every repo involved in this site); both are machine-run,
// so they are counted like the engines.
const ALL_BRANCHES = new Set([
  'field-research',
  'ulysses',
  'studio',
  'research-ecology',
  'machine-attention',
  'data-snack-plenum',
  'error-as-method',
])

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
  return {
    year,
    week,
    bins: new Array<number>(BINS_PER_WEEK).fill(0),
    // Same bins, kept per repository (2026-08-11): the ops room's board draws one sparkline per
    // running system, and a sparkline sliced out of the AGGREGATE would look right and be false.
    // A repo only gets an entry once it has a commit in the window — an empty row is drawn as
    // "no line yet", never as a flat one it did not earn.
    byRepo: new Map<string, number[]>(),
  }
})
const weekIndex = new Map(targetWeeks.map((w, i) => [`${w.year}-${w.week}`, i]))

const repoLast: Record<string, string> = {}
/** Repos whose checkout is missing next to this one — reported, never silently counted as zero. */
const missing: string[] = []
for (const repo of REPOS) {
  const repoPath = join(GH_ROOT, repo)
  let out: string
  try {
    out = execFileSync(
      'git',
      [
        // Engines: --all (session/feature branches = the machine activity). Site repo: the
        // explicit `main` ref, NOT HEAD — so the count is deterministic regardless of which
        // branch happens to be checked out locally, and the nightly (actions/checkout of main,
        // fetch-depth 0) reproduces exactly the same number instead of drifting.
        '-C', repoPath, 'log',
        ...(ALL_BRANCHES.has(repo) ? ['--all'] : ['main']),
        `--since=${firstMonday.toISOString().slice(0, 10)}`,
        '--format=%aI',
      ],
      { encoding: 'utf8' },
    )
  } catch {
    // A repo listed here but not cloned beside this one (a new arrival the nightly's clone list
    // has not caught up with yet, or a local workspace without it). Loud on stderr and absent
    // from the snapshot — the alternative, counting it as a week of silence, would draw a repo
    // as idle that was merely unreachable.
    missing.push(repo)
    continue
  }
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
    const own = targetWeeks[idx].byRepo.get(repo) ?? new Array<number>(BINS_PER_WEEK).fill(0)
    own[binIdx] += 1
    targetWeeks[idx].byRepo.set(repo, own)
  }
  if (stamps.length) repoLast[repo] = stamps.reduce((a, b) => (a > b ? a : b)).slice(0, 10)
}
if (missing.length) {
  console.warn(`fetch-pulse: no checkout beside this one for ${missing.join(', ')} — omitted from the snapshot`)
}

// The current (last) week's cutoff: how many 2-hour bins have started, inclusive of the one
// "now" falls in — ported from hub_pulse_viz.py's `n = ((weekday-1)*24 + hour)//BIN_HOURS + 1`.
const nowWeekdayIdx = (now.getUTCDay() || 7) - 1
const cutoffBin = Math.min(
  BINS_PER_WEEK,
  Math.max(1, nowWeekdayIdx * (24 / BIN_HOURS) + Math.floor(now.getUTCHours() / BIN_HOURS) + 1),
)

const allWeeks: PulseWeek[] = targetWeeks.map((w, i) => ({
  iso_year: w.year,
  iso_week: w.week,
  bins: w.bins,
  ...(i === targetWeeks.length - 1 ? { cutoff_bin: cutoffBin } : {}),
  // Written in REPOS order rather than in the order commits happened to arrive, so a re-run
  // over unchanged history produces a byte-identical file (the whole point of committing it).
  ...(w.byRepo.size > 0
    ? { by_repo: Object.fromEntries(REPOS.filter((r) => w.byRepo.has(r)).map((r) => [r, w.byRepo.get(r)!])) }
    : {}),
}))

// Trim leading empty weeks (Frank, 2026-07-25): the ecology is younger than the 13-week
// window, so the earliest weeks are structurally empty and only waste vertical space in the
// hero (nothing to see before the record begins). Drop all-zero weeks from the FRONT until
// the first week with activity — internal quiet weeks stay (an honest gap), the current week
// is always kept, and once the project is older than 13 weeks nothing is trimmed at all.
const firstActive = allWeeks.findIndex((w) => w.bins.some((b) => b > 0))
const weeks: PulseWeek[] = firstActive > 0 ? allWeeks.slice(firstActive) : allWeeks

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

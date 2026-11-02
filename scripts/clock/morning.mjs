#!/usr/bin/env node
// scripts/clock/morning.mjs — the house's morning clock. Run by .github/workflows/morning-clock.yml.
//
// WHY THIS EXISTS (2026-11-02). GitHub starts this repository's scheduled workflows hours late.
// Common Ground (trending.yml, cron 06:40 UTC) is documented as the ledger of the morning, and
// all 60 of its scheduled runs from 2026-09-03 to 2026-11-01 began between 10:54 and 16:05 UTC,
// 5 h 38 min late in the median. So the web was read in the early afternoon, and a reader who came
// before then found the day before. The lateness is GitHub's, not this repository's load: Machine
// Attention, with six schedules, starts six to seven hours late as well.
//
// The house has a pulse that is on time. The practices' cloud sessions dispatch their integrates
// the moment they land, from about 00:20 UTC on through the morning, and on every day from
// 2026-10-20 to 2026-11-02 one of those dispatches also arrived between 06:41 and 09:01 UTC. The end
// of each integrate starts this clock. For each morning run below that has not happened today, it
// waits until the run is due when that is at most WAIT_MAX_MIN minutes away, and then starts it; a
// pulse after the due time starts it at once. The run's own cron stays as the fallback, and a run
// that finds its day already written writes nothing.
//
// WHAT IT NEVER DOES. It commits nothing and reads nothing an integrate wrote: an integrate's end
// is only its tick. It never starts a run while one is waiting or running, and it stops after
// ATTEMPTS_MAX runs of a day ended without writing the day (a red run is the green-keeper's to
// read, not the clock's to repeat). A run it starts deploys what it commits itself, because GitHub
// creates no workflow_run event for a run the built-in token started (see trending.yml).
//
// DRY_RUN=1 decides and says what it would start, waits for nothing and starts nothing.

import { execFileSync } from 'node:child_process'

/** The morning runs: the workflow, the minute it is due (UTC, as its cron), and the file whose
 *  existence on main says the day is done ({date} is the UTC day, YYYY-MM-DD). */
export const MORNING = [
  { name: 'Common Ground', workflow: 'trending.yml', due: '06:40', marker: 'src/data/trending/{date}.json' },
]

/** The longest the clock waits for a due time; the job's timeout (345 min) sits above it. */
export const WAIT_MAX_MIN = 330

/** Runs of one day that may end without writing the day before the clock stops starting it. */
export const ATTEMPTS_MAX = 2

/** The UTC day of an instant, YYYY-MM-DD. */
export const utcDate = (now) => now.toISOString().slice(0, 10)

/** The instant `due` (HH:MM UTC) falls on, on the UTC day of `now`, in epoch milliseconds. */
export function dueAt(now, due) {
  const [h, m] = due.split(':').map(Number)
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m)
}

/** Whole minutes from `now` until `due` on the same UTC day; zero or less once it is due. */
export const minutesUntil = (now, due) => Math.ceil((dueAt(now, due) - now.getTime()) / 60_000)

export const markerPath = (run, date) => run.marker.replaceAll('{date}', date)

/**
 * What the clock does with one morning run, now.
 * @param {{ now: Date, due: string, markerExists: boolean, runs: { status: string, conclusion: string | null }[] }} s
 *   `runs` are the workflow's runs created on today's UTC day, by any event.
 * @returns {'early' | 'done' | 'running' | 'gave-up' | 'start'}
 */
export function decide({ now, due, markerExists, runs }) {
  if (minutesUntil(now, due) > 0) return 'early'
  if (markerExists) return 'done'
  if (runs.some((r) => r.status !== 'completed')) return 'running'
  if (runs.filter((r) => r.status === 'completed').length >= ATTEMPTS_MAX) return 'gave-up'
  return 'start'
}

/** Wait for the due time only when it lies ahead, within reach, and the day is not done already. */
export const shouldWait = (minutes, markerExists) => !markerExists && minutes > 0 && minutes <= WAIT_MAX_MIN

const SITE = process.env.GITHUB_REPOSITORY || 'frankbueltge/frankbueltge.de'
const DRY = Boolean(process.env.DRY_RUN)

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60_000 })
}

/** Has any commit on main touched the day's file? (The contents API would send the file itself.) */
function markerExists(path) {
  return gh(['api', `repos/${SITE}/commits?sha=main&per_page=1&path=${encodeURIComponent(path)}`, '--jq', 'length']).trim() !== '0'
}

function runsOn(workflow, date) {
  const q = `created=${encodeURIComponent(`>=${date}`)}&per_page=50`
  return JSON.parse(gh(['api', `repos/${SITE}/actions/workflows/${workflow}/runs?${q}`, '--jq', '[.workflow_runs[] | {status, conclusion, event, created_at}]']))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const hm = (d) => d.toISOString().slice(11, 16)

/** Start the run, then hold the clock's lock until GitHub lists it, so the next tick sees it waiting. */
async function start(run, date) {
  gh(['workflow', 'run', run.workflow, '--repo', SITE, '--ref', 'main'])
  for (let i = 0; i < 24; i++) {
    await sleep(5_000)
    if (runsOn(run.workflow, date).some((r) => r.status !== 'completed')) return true
  }
  return false
}

export async function main() {
  for (const run of MORNING) {
    let now = new Date()
    const ahead = minutesUntil(now, run.due)
    if (ahead > 0) {
      if (!shouldWait(ahead, markerExists(markerPath(run, utcDate(now))))) {
        console.log(`${run.name}: due ${run.due} UTC, ${ahead} min away; ${ahead > WAIT_MAX_MIN ? 'a later landing starts it' : 'already written'}`)
        continue
      }
      console.log(`${run.name}: due ${run.due} UTC, waiting ${ahead} min`)
      if (DRY) continue
      await sleep(Math.max(0, dueAt(now, run.due) - now.getTime()))
      now = new Date()
    }
    const date = utcDate(now)
    const verdict = decide({ now, due: run.due, markerExists: markerExists(markerPath(run, date)), runs: runsOn(run.workflow, date) })
    console.log(`${run.name} (${run.workflow}) at ${hm(now)} UTC: ${verdict}`)
    if (verdict !== 'start') continue
    if (DRY) {
      console.log(`(dry run) would start ${run.workflow}`)
    } else if (!(await start(run, date))) {
      console.log(`::warning::${run.workflow} was started but GitHub did not list it within two minutes`)
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(String(e.stderr || e.message || e).trim())
    process.exit(1)
  })
}

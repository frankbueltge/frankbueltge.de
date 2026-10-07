#!/usr/bin/env node
// scripts/engines/practice-watch.mjs — every practice that lands reaches this site, however many
// sessions it runs in a day. Run by .github/workflows/practice-watch.yml.
//
// WHY THIS EXISTS (2026-10-07). That day the practices' routines were started by hand several
// times, and five sessions per practice landed in one day. The Field and the Studio tell this site
// when they land (repository_dispatch from their auto-land), and every one of their sessions was
// listed within minutes. The other five houses tell it nothing — the Atelier's auto-land
// deliberately stopped dispatching with Protocol v4, and Machine Attention, n-1, Error as Method
// and Arch hold no token for it — so their mirrors ran on GitHub's schedule. On this repository
// that schedule is a request, not a guarantee, and it was barely granted: across 2026-10-05 to
// 10-07 the hourly mirror watch ran three or four times a day, Arch's ten-minute cron three to
// five times, the Atelier's four daily runs twice. At 16:50 UTC on 10-07 the site lacked the
// Atelier's sessions 2–5 and its presentation, n-1's nights 47–49 and Error as Method's three
// works of the day; the oldest of them had landed six hours before.
//
// WHAT IT DOES. It asks each practice's repository for its head (`git ls-remote`, no token, no
// API quota) once a minute, and compares it with the head the site's mirror last carried — the
// sha each integrate commits to .github/state/<house>-mirror-head beside its mirror. When a
// practice has moved and then held still for a few minutes (a session pushes in bursts), it
// dispatches that practice's integrate, once per head. A practice that announces its own landing
// (the Field, the Studio) is given time for its own dispatch to land first; only when its mirror
// has not caught up does the watch step in, so a lost dispatch costs minutes instead of a day.
// An integrate it starts deploys what it commits itself: GitHub creates no workflow_run event for
// a run the built-in token started, so deploy-cf.yml would never hear of it (found the day this
// went live — four mirrors committed and stood undeployed).
//
// HOW LONG IT WATCHES. A landing elsewhere in the house (a dispatch from the Field or the Studio,
// sent when one of their sessions lands) starts it, because the practices' routines run in rounds
// and the rest of the round is about to land; the night run starts it before the nightly sessions;
// sparse crons start it whenever GitHub grants one. It then watches until three hours have passed
// with no practice moving (TIMING.activeMs). One job may run 340 minutes; a watch still active then
// dispatches its successor, which carries on. A quiet house ends the chain, and the next landing
// starts it again.
//
// WHAT IT NEVER DOES. It copies nothing and commits nothing. Copying stays with each integrate,
// which validates the whole site before it commits, exactly as before. Over-asking is cheap — an
// integrate that finds nothing new commits nothing — but each run still costs a build, so the
// watch asks once per head, not at all when a run of that integrate is already waiting to start
// (it will clone the newest head when it does), and never for a head that is only this site's
// own letter to the practice (a refusal, a red build's brief) — or a red build would restart
// itself every ten minutes.
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'

/** The practices whose landings this site mirrors, and how each one is mirrored. `announces`:
 *  the practice dispatches to this site when it lands, so its own integrate normally runs at once
 *  and the watch is only the net under it. */
export const PRACTICES = [
  { id: 'atelier', repo: 'frankbueltge/ulysses', workflow: 'atelier-integrate.yml', state: '.github/state/atelier-mirror-head', announces: false },
  { id: 'field', repo: 'frankbueltge/field-research', workflow: 'field-integrate.yml', state: '.github/state/field-mirror-head', announces: true },
  { id: 'studio', repo: 'frankbueltge/studio', workflow: 'studio-integrate.yml', state: '.github/state/studio-mirror-head', announces: true },
  { id: 'nightly-line', repo: 'frankbueltge/error-as-method', workflow: 'nightly-integrate.yml', state: '.github/state/nightly-mirror-head', announces: false },
  { id: 'n-1', repo: 'frankbueltge/n-1', workflow: 'n1-integrate.yml', state: '.github/state/n1-mirror-head', announces: false },
  { id: 'arch', repo: 'frankbueltge/arch', workflow: 'arch-integrate.yml', state: '.github/state/arch-mirror-head', announces: false },
  { id: 'attention', repo: 'frankbueltge/machine-attention', workflow: 'attention-integrate.yml', state: '.github/state/attention-mirror-head', announces: false },
]

const MINUTE = 60_000
const HOUR = 60 * MINUTE

export const TIMING = {
  /** between two asks */
  pollMs: MINUTE,
  /** a head must hold still this long before it is mirrored — a session pushes in bursts */
  quietMs: 3 * MINUTE,
  /** ... but no head waits longer than this, or a practice pushing all session long would keep
   *  the site stale for the whole of it */
  maxDeferMs: 20 * MINUTE,
  /** how long a practice that announces its landing gets for its own dispatch to land first */
  graceMs: 20 * MINUTE,
  /** the watch ends this long after the last practice moved — long enough to bridge the gaps
   *  between the nightly sessions (Error as Method ~23:20 UTC, n-1 ~01:20, the Field ~03:40) */
  activeMs: 3 * HOUR,
  /** one job's share of the watch; GitHub stops a job at six hours, the successor carries on */
  capMs: 340 * MINUTE,
}

/** How long a watch lasts at the least, by what started it. The night run spans the window the
 *  nightly sessions have woken in so far (22:50–03:50 UTC); a landing elsewhere keeps the watch
 *  open for the rest of its round. Minutes. */
export const MINIMUM_MINUTES = {
  night: 300,
  landing: 120,
  schedule: 30,
  manual: 120,
}

/** The night run's cron — the one schedule that opens the long window. Kept in step with
 *  practice-watch.yml by the test beside this file. */
export const NIGHT_CRON = '50 22 * * *'

/** What a watch is started by, and so how long it lasts at the least. */
export function minimumMinutes({ event, schedule, input }) {
  const asked = input === undefined || input === null || String(input).trim() === '' ? NaN : Number(input)
  if (event === 'workflow_dispatch' && Number.isFinite(asked) && asked >= 0) return asked
  if (event === 'schedule') return schedule === NIGHT_CRON ? MINIMUM_MINUTES.night : MINIMUM_MINUTES.schedule
  if (event === 'repository_dispatch') return MINIMUM_MINUTES.landing
  return MINIMUM_MINUTES.manual
}

/** A practice's watch at the start: the head its mirror carries, nothing seen yet. */
export function startEntry(mirrored) {
  return { done: mirrored ?? null, seen: null, firstSeen: null, lastChange: null }
}

/**
 * One ask's answer folded into a practice's watch. Pure. `moved` is true only when the head
 * changed WHILE watched — the first answer is a reading of where the practice stands, not a
 * movement, so a watch that starts beside a practice that moved yesterday does not extend itself.
 * An empty answer (the ask failed) changes nothing.
 */
export function observe(entry, remote, now) {
  if (!remote) return { entry, moved: false }
  const moved = entry.seen !== null && remote !== entry.seen
  if (remote === entry.done) return { entry: { ...entry, seen: remote, firstSeen: null, lastChange: null }, moved }
  if (remote === entry.seen) return { entry, moved: false }
  return {
    entry: { ...entry, seen: remote, firstSeen: entry.firstSeen ?? now, lastChange: now },
    moved,
  }
}

/** Whether a practice's new head should be mirrored now. Pure. */
export function isDue(practice, entry, now, timing = TIMING) {
  if (entry.seen === null || entry.seen === entry.done || entry.firstSeen === null) return false
  if (practice.announces && now - entry.firstSeen < timing.graceMs) return false
  return now - entry.lastChange >= timing.quietMs || now - entry.firstSeen >= timing.maxDeferMs
}

/** When this job stops watching: at its minimum, or ACTIVE after the last movement, whichever is
 *  later — never past its cap. Pure. */
export function deadlineOf({ start, minimumMs, lastMovement }, timing = TIMING) {
  const wanted = Math.max(start + minimumMs, lastMovement === null ? 0 : lastMovement + timing.activeMs)
  return Math.min(wanted, start + timing.capMs)
}

/** Whether the watch outlives this job: the house was still active when the job reached its cap.
 *  Only movement hands over — a minimum asked for by hand ends with its job. */
export function handsOver({ start, lastMovement }, timing = TIMING) {
  return lastMovement !== null && lastMovement + timing.activeMs > start + timing.capMs
}

/** The identities this site writes into the practices' repositories with: the integrates' letters
 *  (a refusal, a red build's brief) and the site-PR sluice's feedback. None of them is mirrored
 *  back — a letter to the practice is not the practice's record. */
export const SITE_FOOTPRINT = new Set([
  'atelier-integrate@frankbueltge.de',
  'field-integrate@frankbueltge.de',
  'studio-integrate@frankbueltge.de',
  'site-pr-schleuse@frankbueltge.de',
])

/**
 * Whether a new head is only this site's own letter on top of a head already settled — the one the
 * watch last handled, or the one the mirror carries. Without this the watch would chase its own
 * footprint: a red integrate writes its brief into the practice's repository, that moves the
 * practice's head, the watch starts the integrate again, and a red build becomes a red build every
 * ten minutes, each with a letter and an issue comment. Only a settled parent counts — a session
 * that landed under the letter is still new.
 */
export function isOwnLetter(commit, ...settled) {
  if (commit === null || !SITE_FOOTPRINT.has(commit.email) || commit.parent === null) return false
  return settled.includes(commit.parent)
}

/** Statuses of a run that has been asked for and has not started — it will clone the newest head
 *  when it does, so asking again would only replace it. */
const WAITING = new Set(['queued', 'pending', 'waiting', 'requested'])
export const hasWaitingRun = (runs) => runs.some((r) => WAITING.has(r.status))

/** A head as the state file holds it: one sha on one line, or nothing. */
export function readHead(text) {
  const sha = String(text ?? '').trim()
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null
}

// ── the loop ────────────────────────────────────────────────────────────────────────────────

const SITE = process.env.GITHUB_REPOSITORY || 'frankbueltge/frankbueltge.de'

function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60_000 })
}

function lsRemote(repo) {
  try {
    return readHead(run('git', ['ls-remote', `https://github.com/${repo}`, 'HEAD']).split('\t')[0])
  } catch {
    return null
  }
}

function committedHead(state) {
  try {
    const b64 = run('gh', ['api', `repos/${SITE}/contents/${state}?ref=main`, '--jq', '.content'])
    return readHead(Buffer.from(b64, 'base64').toString('utf8'))
  } catch {
    return null // absent (a mirror that has not written one yet) or unreadable: not mirrored
  }
}

function headCommit(repo, sha) {
  try {
    const c = JSON.parse(run('gh', ['api', `repos/${repo}/commits/${sha}`, '--jq', '{email: .commit.author.email, parent: (.parents[0].sha // null)}']))
    return { email: String(c.email ?? ''), parent: readHead(c.parent) }
  } catch {
    return null // unreadable: treated as the practice's own commit, so it is mirrored
  }
}

function waitingRun(workflow) {
  try {
    const runs = JSON.parse(run('gh', ['api', `repos/${SITE}/actions/workflows/${workflow}/runs?per_page=10`, '--jq', '[.workflow_runs[] | {status}]']))
    return hasWaitingRun(runs)
  } catch {
    return false
  }
}

function dispatch(workflow, fields = []) {
  // DRY_RUN=1 asks and decides, and says what it would have started — for a run by hand.
  if (process.env.DRY_RUN) {
    console.log(`(dry run) would dispatch ${workflow} ${fields.join(' ')}`.trim())
    return true
  }
  try {
    run('gh', ['workflow', 'run', workflow, '--repo', SITE, '--ref', 'main', ...fields.flatMap((f) => ['-f', f])])
    return true
  } catch (e) {
    console.log(`::warning::could not dispatch ${workflow}: ${String(e.stderr || e.message).trim()}`)
    return false
  }
}

const stamp = (ms) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ') + 'Z'
const short = (sha) => (sha ? sha.slice(0, 8) : 'none')

export async function main() {
  const start = Date.now()
  const minimumMs =
    minimumMinutes({ event: process.env.EVENT_NAME, schedule: process.env.SCHEDULE, input: process.env.INPUT_MINUTES }) * MINUTE
  const handed = Number(process.env.INPUT_LAST_MOVEMENT)
  let lastMovement = Number.isFinite(handed) && handed > 0 ? handed * 1000 : null
  const log = []
  const entries = new Map(
    PRACTICES.map((p) => [p.id, startEntry(existsSync(p.state) ? readHead(readFileSync(p.state, 'utf8')) : null)]),
  )
  console.log(`watching ${PRACTICES.length} practices from ${stamp(start)}, at least ${minimumMs / MINUTE} min`)

  for (;;) {
    const now = Date.now()
    for (const p of PRACTICES) {
      const { entry, moved } = observe(entries.get(p.id), lsRemote(p.repo), now)
      entries.set(p.id, entry)
      if (moved) {
        lastMovement = now
        console.log(`${stamp(now)} ${p.id} moved to ${short(entry.seen)}`)
      }
      if (!isDue(p, entry, now)) continue
      const committed = committedHead(p.state)
      if (committed === entry.seen) {
        entries.set(p.id, { ...entry, done: entry.seen })
        console.log(`${stamp(now)} ${p.id} ${short(entry.seen)} is already mirrored`)
        continue
      }
      if (isOwnLetter(headCommit(p.repo, entry.seen), entry.done, committed)) {
        entries.set(p.id, { ...entry, done: entry.seen })
        console.log(`${stamp(now)} ${p.id} ${short(entry.seen)} is this site's own letter to the practice — nothing to mirror`)
        continue
      }
      if (waitingRun(p.workflow)) {
        entries.set(p.id, { ...entry, done: entry.seen })
        console.log(`${stamp(now)} ${p.id} ${short(entry.seen)}: a ${p.workflow} run is waiting to start and will take it`)
        continue
      }
      if (dispatch(p.workflow)) {
        entries.set(p.id, { ...entry, done: entry.seen })
        log.push(`| ${stamp(now)} | ${p.id} | \`${short(entry.seen)}\` | mirror carried \`${short(committed)}\` | ${p.workflow} |`)
        console.log(`${stamp(now)} ${p.id} ${short(entry.seen)} (mirror carries ${short(committed)}) → ${p.workflow}`)
      }
    }
    if (Date.now() >= deadlineOf({ start, minimumMs, lastMovement })) break
    await new Promise((resolve) => setTimeout(resolve, TIMING.pollMs))
  }

  const successor = handsOver({ start, lastMovement })
  if (successor) {
    // The successor learns when the house last moved, so the chain ends ACTIVE after the last
    // movement and not ACTIVE after every handover.
    dispatch('practice-watch.yml', ['minutes=0', `last_movement=${Math.floor(lastMovement / 1000)}`])
  }
  const summary = [
    `### Practice watch, ${stamp(start)} – ${stamp(Date.now())}`,
    '',
    log.length ? '| when | practice | head | before | dispatched |\n|---|---|---|---|---|\n' + log.join('\n') : 'Nothing to mirror: every practice’s head was already on the site.',
    '',
    `Last movement: ${lastMovement ? stamp(lastMovement) : 'none seen'}. ${successor ? 'Still active — a successor carries the watch on.' : 'Quiet — the watch ends here.'}`,
  ].join('\n')
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

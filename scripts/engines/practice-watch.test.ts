// The practice watch, tested without a network. What it guards is the day of 2026-10-07: five
// sessions per practice landed, and every house that does not announce its landings waited for a
// GitHub schedule that came twice — the Atelier's sessions 2–5, n-1's nights 47–49 and Error as
// Method's three works stood published for hours while the site showed none of them.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  MINIMUM_MINUTES,
  NIGHT_CRON,
  PRACTICES,
  SITE_FOOTPRINT,
  TIMING,
  deadlineOf,
  handsOver,
  hasWaitingRun,
  isDue,
  isOwnLetter,
  minimumMinutes,
  observe,
  readHead,
  startEntry,
} from './practice-watch.mjs'

const WORKFLOWS = fileURLToPath(new URL('../../.github/workflows', import.meta.url))
const workflow = (file: string) => readFileSync(`${WORKFLOWS}/${file}`, 'utf8')

const MIN = 60_000
const A = 'a'.repeat(40)
const B = 'b'.repeat(40)
const C = 'c'.repeat(40)
const silent = PRACTICES.find((p) => !p.announces)!
const announcing = PRACTICES.find((p) => p.announces)!

/** Polls once a minute from `from` to `to` (inclusive) with the head `head(t)`, and returns the
 *  minutes at which the watch would dispatch — marking the head done the way the loop does. */
function simulate(practice: (typeof PRACTICES)[number], mirrored: string | null, head: (t: number) => string | null, minutes: number) {
  let entry = startEntry(mirrored)
  const dispatched: [number, string][] = []
  for (let t = 0; t <= minutes; t++) {
    entry = observe(entry, head(t), t * MIN).entry
    if (isDue(practice, entry, t * MIN)) {
      dispatched.push([t, entry.seen!])
      entry = { ...entry, done: entry.seen }
    }
  }
  return dispatched
}

describe('a practice that does not announce its landing is mirrored within minutes', () => {
  it('dispatches once the new head has held still for the quiet time — and only once per head', () => {
    // lands at minute 10; the head then holds
    const got = simulate(silent, A, (t) => (t < 10 ? A : B), 60)
    expect(got).toEqual([[10 + TIMING.quietMs / MIN, B]])
  })

  it('takes every landing of a day of many sessions, each once', () => {
    // five sessions, a landing every forty minutes, as on 2026-10-07
    const heads = [A, B, C, 'd'.repeat(40), 'e'.repeat(40), 'f'.repeat(40)]
    const got = simulate(silent, A, (t) => heads[Math.min(5, Math.floor(t / 40))]!, 240)
    expect(got.map(([, sha]) => sha)).toEqual(heads.slice(1))
  })

  it('waits out a burst of pushes, but never past the longest deferral', () => {
    // a session pushing a new commit every minute for half an hour
    const got = simulate(silent, A, (t) => (t === 0 ? A : t <= 30 ? `${t}`.padStart(40, '0') : C), 60)
    expect(got[0]![0]).toBe(1 + TIMING.maxDeferMs / MIN)
  })

  it('asks at once, after the quiet time, for a head that moved before the watch began', () => {
    expect(simulate(silent, A, () => B, 10)).toEqual([[TIMING.quietMs / MIN, B]])
  })

  it('treats a mirror that never recorded a head as behind — the first watch fills the state', () => {
    expect(simulate(silent, null, () => A, 10)).toEqual([[TIMING.quietMs / MIN, A]])
  })

  it('does nothing while the practice stands where its mirror is, and an empty answer changes nothing', () => {
    expect(simulate(silent, A, (t) => (t % 2 ? null : A), 60)).toEqual([])
  })
})

describe('a practice that announces its landing gets the time for its own dispatch first', () => {
  it('steps in only after the grace time — the net under a lost dispatch, not a second integrate', () => {
    const got = simulate(announcing, A, (t) => (t < 5 ? A : B), 60)
    expect(got).toEqual([[5 + TIMING.graceMs / MIN, B]])
  })
})

describe('the watch does not chase its own letters', () => {
  it('settles a head that is only this site’s letter on a head already settled — handled, or mirrored', () => {
    // the watch handled A; the integrate's letter sits on it
    expect(isOwnLetter({ email: 'atelier-integrate@frankbueltge.de', parent: A }, A, null)).toBe(true)
    expect(isOwnLetter({ email: 'site-pr-schleuse@frankbueltge.de', parent: A }, A, null)).toBe(true)
    // the practice's own dispatch had the mirror take B before the watch got to it
    expect(isOwnLetter({ email: 'field-integrate@frankbueltge.de', parent: B }, A, B)).toBe(true)
  })

  it('still mirrors a session that landed under the letter, and anything the practice wrote itself', () => {
    // the letter sits on B, a session neither handled nor mirrored
    expect(isOwnLetter({ email: 'atelier-integrate@frankbueltge.de', parent: B }, A, A)).toBe(false)
    // the practice's own persona, the founder, and the house's seed relay are the practice's record
    expect(isOwnLetter({ email: 'ulysses@ulysses.invalid', parent: A }, A, A)).toBe(false)
    expect(isOwnLetter({ email: 'steuerzentrale@frankbueltge.de', parent: A }, A, A)).toBe(false)
    expect(isOwnLetter({ email: 'atelier-integrate@frankbueltge.de', parent: null }, null, null)).toBe(false)
    expect(isOwnLetter(null, A, A)).toBe(false)
  })

  it('knows every identity a workflow of this site writes into a practice’s repository with', () => {
    // A renamed identity would turn every red build into a loop again — so the list is read
    // against the workflows that clone a practice's repository with a key and push to it.
    const practiceRepos = new Set(PRACTICES.map((p) => p.repo))
    let checked = 0
    for (const file of readdirSync(WORKFLOWS).filter((f) => f.endsWith('.yml'))) {
      const text = workflow(file)
      const targets = [...text.matchAll(/x-access-token:\$\{BOT_TOKEN\}@github\.com\/([\w${}./-]+?)["\s]/g)].map((m) => m[1]!)
      if (!targets.some((t) => practiceRepos.has(t) || t === '${ENGINE_REPO}')) continue
      for (const m of text.matchAll(/user\.email ["']([^"']+)["']/g)) {
        expect([...SITE_FOOTPRINT], `${file} writes as ${m[1]}`).toContain(m[1])
        checked += 1
      }
    }
    expect(checked).toBeGreaterThan(3)
  })
})

describe('a movement is a change seen while watching', () => {
  it('does not count the first answer as a movement, and counts every change after it', () => {
    let e = startEntry(A)
    const first = observe(e, B, 0)
    expect(first.moved).toBe(false)
    e = first.entry
    expect(observe(e, B, MIN).moved).toBe(false)
    expect(observe(e, C, MIN).moved).toBe(true)
  })
})

describe('how long the watch lasts', () => {
  const start = 1_000_000_000_000

  it('lasts its minimum when nothing moves, and three hours after the last movement otherwise', () => {
    expect(deadlineOf({ start, minimumMs: 120 * MIN, lastMovement: null })).toBe(start + 120 * MIN)
    const moved = start + 60 * MIN
    expect(deadlineOf({ start, minimumMs: 120 * MIN, lastMovement: moved })).toBe(moved + TIMING.activeMs)
  })

  it('never lets one job pass its cap, and hands over only when the house is still active then', () => {
    const late = start + 300 * MIN
    expect(deadlineOf({ start, minimumMs: 0, lastMovement: late })).toBe(start + TIMING.capMs)
    expect(handsOver({ start, lastMovement: late })).toBe(true)
    expect(handsOver({ start, lastMovement: start + 10 * MIN })).toBe(false)
    expect(handsOver({ start, lastMovement: null })).toBe(false)
  })

  it('opens the long window at night, the round’s window on a landing, and takes a minimum asked by hand', () => {
    expect(minimumMinutes({ event: 'schedule', schedule: NIGHT_CRON, input: '' })).toBe(MINIMUM_MINUTES.night)
    expect(minimumMinutes({ event: 'schedule', schedule: '7 */2 * * *', input: '' })).toBe(MINIMUM_MINUTES.schedule)
    expect(minimumMinutes({ event: 'repository_dispatch', schedule: '', input: '' })).toBe(MINIMUM_MINUTES.landing)
    expect(minimumMinutes({ event: 'workflow_dispatch', schedule: '', input: '0' })).toBe(0)
    expect(minimumMinutes({ event: 'workflow_dispatch', schedule: '', input: '' })).toBe(MINIMUM_MINUTES.manual)
    // the night window spans the hours the nightly sessions have woken in (22:50–03:50 UTC)
    expect(MINIMUM_MINUTES.night * MIN).toBeLessThanOrEqual(TIMING.capMs)
  })
})

describe('what it reads', () => {
  it('reads a state file as one sha, and anything else as no head', () => {
    expect(readHead(`${A}\n`)).toBe(A)
    expect(readHead('')).toBeNull()
    expect(readHead('none')).toBeNull()
  })

  it('leaves a run that has not started alone — it will clone the newest head when it does', () => {
    expect(hasWaitingRun([{ status: 'completed' }, { status: 'in_progress' }])).toBe(false)
    expect(hasWaitingRun([{ status: 'pending' }])).toBe(true)
    expect(hasWaitingRun([{ status: 'queued' }])).toBe(true)
  })
})

describe('the watch and the workflows agree', () => {
  const watch = workflow('practice-watch.yml')

  it('dispatches only integrates that exist, accept a dispatch, and record the head the watch compares', () => {
    for (const p of PRACTICES) {
      const text = workflow(p.workflow)
      expect(text, `${p.workflow} cannot be dispatched`).toMatch(/^\s*workflow_dispatch:/m)
      // the state file is written by the integrate itself — a watch comparing against a file
      // nothing writes would ask for every head, forever
      expect(text, `${p.workflow} never writes ${p.state}`).toContain(p.state.split('/').pop())
    }
  })

  it('runs its night window at the minute the script reads as the night', () => {
    expect(watch).toContain(`cron: '${NIGHT_CRON}'`)
  })

  it('starts on the landing of every practice that announces one', () => {
    const types = watch.match(/repository_dispatch:\s*\n\s*types:\s*\[([^\]]*)\]/)?.[1].split(',').map((t) => t.trim()) ?? []
    for (const p of PRACTICES.filter((x) => x.announces)) {
      const own = workflow(p.workflow).match(/repository_dispatch:\s*\n\s*types:\s*\[([^\]]*)\]/)?.[1].trim()
      expect(own, `${p.workflow} declares no landing type`).toBeTruthy()
      expect(types, `the watch does not start on ${own}`).toContain(own)
    }
  })

  it('may dispatch the integrates and its own successor', () => {
    expect(watch).toMatch(/^\s*actions: write$/m)
    expect(watch).toMatch(/^\s*last_movement:/m)
  })

  it('leaves no practice the landing watchdog reads without a freshness watch', () => {
    // The landing watchdog reads every practice repository; each must also be watched for a
    // mirror that lags — by this watch, or by the mirror watch for the two houses it keeps.
    const watched = new Set(PRACTICES.map((p) => p.repo.split('/')[1]))
    const mirrorWatch = workflow('mirror-watch.yml')
    for (const m of mirrorWatch.matchAll(/^\s*check\s+(\S+)\s+\S+\.yml/gm)) watched.add(m[1]!)
    const repos = workflow('landing-watchdog.yml').match(/^\s*for REPO in ([^;]+);/m)![1]!.trim().split(/\s+/)
    expect(repos.length).toBeGreaterThan(3)
    expect(repos.filter((r) => !watched.has(r))).toEqual([])
  })
})

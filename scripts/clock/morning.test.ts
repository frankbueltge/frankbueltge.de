// The morning clock, tested without a network. What it guards is the record of 2026-09-03 to
// 2026-11-01: Common Ground's cron said 06:40 UTC, and all 60 of its scheduled runs began between
// 10:54 and 16:05 UTC, so a ledger that says it reads the web every morning was written in the
// afternoon and a reader before then saw the day before.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ATTEMPTS_MAX, MORNING, WAIT_MAX_MIN, decide, dueAt, markerPath, minutesUntil, shouldWait, utcDate } from './morning.mjs'

const WORKFLOWS = fileURLToPath(new URL('../../.github/workflows', import.meta.url))
const workflow = (file: string) => readFileSync(`${WORKFLOWS}/${file}`, 'utf8')

const at = (iso: string) => new Date(iso)
const done = { status: 'completed', conclusion: 'success' }
const failed = { status: 'completed', conclusion: 'failure' }
const queued = { status: 'queued', conclusion: null }
const running = { status: 'in_progress', conclusion: null }

describe('the clock decides one morning run at a time', () => {
  const base = { due: '06:40', markerExists: false, runs: [] as { status: string; conclusion: string | null }[] }

  it('starts nothing before the due minute, and starts at it', () => {
    expect(decide({ ...base, now: at('2026-11-03T06:39:30Z') })).toBe('early')
    expect(decide({ ...base, now: at('2026-11-03T06:40:00Z') })).toBe('start')
    expect(decide({ ...base, now: at('2026-11-03T13:47:00Z') })).toBe('start')
  })

  it('leaves a day alone once its file is on main, whoever wrote it', () => {
    expect(decide({ ...base, now: at('2026-11-03T07:00:00Z'), markerExists: true })).toBe('done')
    expect(decide({ ...base, now: at('2026-11-03T07:00:00Z'), markerExists: true, runs: [failed, failed] })).toBe('done')
  })

  it('never starts a second run while one is waiting or running', () => {
    expect(decide({ ...base, now: at('2026-11-03T07:00:00Z'), runs: [queued] })).toBe('running')
    expect(decide({ ...base, now: at('2026-11-03T07:00:00Z'), runs: [failed, running] })).toBe('running')
  })

  it('tries again after one run that wrote nothing, and gives up after ATTEMPTS_MAX', () => {
    expect(ATTEMPTS_MAX).toBe(2)
    expect(decide({ ...base, now: at('2026-11-03T07:30:00Z'), runs: [failed] })).toBe('start')
    expect(decide({ ...base, now: at('2026-11-03T08:30:00Z'), runs: [failed, failed] })).toBe('gave-up')
    // a rehearsal or a probe ends green and writes nothing: it counts as a run of the day, too
    expect(decide({ ...base, now: at('2026-11-03T08:30:00Z'), runs: [done, failed] })).toBe('gave-up')
  })
})

describe('the clock waits for a due time only when it is near', () => {
  it('counts whole minutes on the UTC day of now', () => {
    expect(minutesUntil(at('2026-11-03T02:20:00Z'), '06:40')).toBe(260)
    expect(minutesUntil(at('2026-11-03T06:39:01Z'), '06:40')).toBe(1)
    expect(minutesUntil(at('2026-11-03T06:41:00Z'), '06:40')).toBe(-1)
    expect(dueAt(at('2026-11-03T23:59:00Z'), '06:40')).toBe(Date.parse('2026-11-03T06:40:00Z'))
  })

  it('waits from the night landings on (n-1 about 02:20 UTC), not from the first one (about 00:20)', () => {
    expect(shouldWait(minutesUntil(at('2026-11-03T02:20:00Z'), '06:40'), false)).toBe(true)
    expect(shouldWait(minutesUntil(at('2026-11-03T00:20:00Z'), '06:40'), false)).toBe(false)
    expect(WAIT_MAX_MIN).toBeLessThan(345) // the job's timeout in morning-clock.yml
  })

  it('does not wait for a day that is written already, nor once the due time has passed', () => {
    expect(shouldWait(120, true)).toBe(false)
    expect(shouldWait(0, false)).toBe(false)
    expect(shouldWait(-30, false)).toBe(false)
  })

  it('names the day by UTC, as the pipeline does', () => {
    expect(utcDate(at('2026-11-03T23:30:00Z'))).toBe('2026-11-03')
    expect(markerPath(MORNING[0], '2026-11-03')).toBe('src/data/trending/2026-11-03.json')
  })
})

describe('the clock and the workflows it starts agree', () => {
  const clock = workflow('morning-clock.yml')

  it.each(MORNING)('$name is due at the minute its own cron names, so the cron stays the fallback', (run) => {
    const cron = workflow(run.workflow).match(/- cron: '(\d+) (\d+) \* \* \*'/)
    expect(cron, `${run.workflow} has no daily cron`).not.toBeNull()
    const [, minute, hour] = cron!
    expect(run.due).toBe(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`)
  })

  it.each(MORNING)('$name deploys what it commits when the clock started it', (run) => {
    // GitHub creates no workflow_run event for a run the built-in token started, so deploy-cf.yml
    // would never hear of the day it committed (the pattern of the integrates, PR #1049)
    const text = workflow(run.workflow)
    expect(text).toContain('gh workflow run deploy-cf.yml')
    expect(text).toContain("github.triggering_actor == 'github-actions[bot]'")
    expect(text).toMatch(/actions: write/)
  })

  it('listens only to workflows that exist, by the name GitHub matches workflow_run against', () => {
    const block = clock.match(/workflow_run:\s*\n\s*workflows:\s*\n((?:[ \t]*(?:#.*|-[ \t].*)\n)+)/)
    expect(block).not.toBeNull()
    const names = block![1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim())
    expect(names.length).toBeGreaterThan(0)
    const declared = ['ecology', 'field', 'atelier', 'studio', 'attention', 'n1', 'nightly'].map(
      (f) => workflow(`${f}-integrate.yml`).match(/^name: (.+)$/m)![1].trim(),
    )
    expect(names.sort()).toEqual(declared.sort())
  })

  it('is never cancelled while it waits, and its timeout sits above the longest wait', () => {
    expect(clock).toMatch(/cancel-in-progress: false/)
    expect(Number(clock.match(/timeout-minutes: (\d+)/)![1])).toBeGreaterThan(WAIT_MAX_MIN)
    expect(clock).toContain('node scripts/clock/morning.mjs')
  })
})

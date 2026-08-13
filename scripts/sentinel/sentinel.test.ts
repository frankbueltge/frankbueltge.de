// The sentinel's judgement, tested without a network. What matters here is not that it can call
// `gh` — it is which findings it decides deserve a person, because that decision is the whole
// point of the thing: on 2026-08-13 the ecology's plumbing consumed a day, and most of what it
// consumed it with was already fixed and merely waiting to be pressed again.
import { describe, expect, it } from 'vitest'
import { ACCEPTED_RED, REPOS, TOKENS_FOR, failureStreak, hasOwnKey, isAccepted, latestPerWorkflow } from './sweep.mjs'
import { composeIssue, composeLine } from './line.mjs'

const run = (name: string, conclusion: string | null, extra: Record<string, unknown> = {}) =>
  ({ name, conclusion, databaseId: 1, createdAt: '2026-08-13T20:00:00Z', ...extra })

describe('the sentinel reads a run list the way a person would', () => {
  it('takes the newest run of each workflow and ignores the history behind it', () => {
    const runs = [run('Deploy', 'success'), run('Deploy', 'failure'), run('CI', 'failure')]
    expect(latestPerWorkflow(runs).map((r) => [r.name, r.conclusion])).toEqual([
      ['Deploy', 'success'],
      ['CI', 'failure'],
    ])
  })

  it('counts an unbroken run of failures back from the newest, and stops at the first green', () => {
    const runs = [run('X', 'failure'), run('X', 'failure'), run('X', 'success'), run('X', 'failure')]
    expect(failureStreak(runs, 'X')).toEqual({ streak: 2, atLeast: false })
  })

  it('lets a cancelled or skipped run neither confirm nor break the streak', () => {
    // A cancelled run says nothing about health — treating it as a success would hide a streak,
    // treating it as a failure would invent one.
    const runs = [run('X', 'failure'), run('X', 'cancelled'), run('X', 'skipped'), run('X', 'failure')]
    // No green anywhere in the window, so the count is a floor and says so.
    expect(failureStreak(runs, 'X')).toEqual({ streak: 2, atLeast: true })
  })
})

describe('every suppressed red carries its reason and the way out', () => {
  it('names a document for each, because a suppression without a citation is a blind spot', () => {
    // The list may be empty — that is a house with nothing to suppress, not a broken guard.
    // What may never happen is an entry without its reasoning and its way out.
    for (const entry of ACCEPTED_RED) {
      expect(entry.why.length, entry.workflow).toBeGreaterThan(80)
      expect(entry.why, `${entry.workflow} names no document holding the diagnosis`).toMatch(/\.md/)
      expect(entry.why, `${entry.workflow} states no condition that would end the suppression`)
        .toMatch(/Ends when|until/i)
      expect(REPOS.map((r) => r.repo)).toContain(entry.repo)
    }
  })

  it('suppresses by repo AND workflow, never by workflow name alone', () => {
    const known = ACCEPTED_RED[0]
    if (!known) return
    expect(isAccepted(known.repo, known.workflow)).toBe(true)
    expect(isAccepted('frankbueltge/studio', known.workflow)).toBe(false)
  })
})

describe('a public repository needs no key of its own to be seen', () => {
  it('gives every repository the default token as a last resort, so none is a blind spot', () => {
    // Checked before asking anyone to mint a token: all six repos are public, and public run
    // history is readable by any valid token. Being unable to SEE a house is a real gap; being
    // unable to re-dispatch in it is a smaller one.
    for (const { repo } of REPOS) {
      expect(TOKENS_FOR[repo], repo).toBeDefined()
      expect(TOKENS_FOR[repo].at(-1), `${repo} has no fallback key`).toBe('GITHUB_TOKEN')
    }
  })

  it('knows where a re-dispatch can be expected to work and where it cannot', () => {
    const env = { GITHUB_TOKEN: 'x', ATELIER_BOT_TOKEN: 'y' }
    expect(hasOwnKey('frankbueltge/ulysses', env)).toBe(true)
    expect(hasOwnKey('frankbueltge/machine-attention', env)).toBe(false)
  })
})

describe('the line is the whole report, and says the true thing in each case', () => {
  const base = { at: '2026-08-13T22:00:00Z', retry: [], forPerson: [], accepted: [], errors: [] }

  it('reports a quiet night as a measurement, not as a health verdict', () => {
    const line = composeLine(base)
    expect(line).toContain('nothing red')
    expect(line.split('\n')).toHaveLength(1)
  })

  it('does not escalate what a retry settled — that class is the load, not the news', () => {
    const line = composeLine({
      ...base,
      retry: [{ repo: 'frankbueltge/studio', workflow: 'Auto-land' }],
    })
    expect(line).toContain('re-dispatched')
    expect(line).toContain('nothing survived the retry')
    expect(line).not.toContain('needing a person')
  })

  it('names what survived, with its house and its streak', () => {
    const line = composeLine({
      ...base,
      forPerson: [{ repo: 'frankbueltge/studio', workflow: 'Auto-land', streak: 8, why: 'x' }],
    })
    expect(line).toContain('1 needing a person')
    expect(line).toContain('studio: Auto-land ×8')
  })

  it('marks a streak the fetch window could not bound, rather than inventing precision', () => {
    // The first real sweep printed "x60" for a workflow whose window WAS 60 runs — a number
    // invented by the page size, in a house whose whole claim is that it counts.
    const line = composeLine({
      ...base,
      forPerson: [{ repo: 'frankbueltge/studio', workflow: 'Auto-land', streak: 60, atLeast: true, why: 'x' }],
    })
    expect(line).toContain('Auto-land ×≥60')
  })

  it('never reports an unreadable repository as a healthy one', () => {
    // The failure this whole file exists to prevent, in miniature: silence read as green.
    const line = composeLine({ ...base, errors: [{ repo: 'frankbueltge/ulysses', error: '401' }] })
    expect(line).toContain('unreachable')
    expect(line).toContain('ulysses')
  })

  it('stays one line however much it has to say', () => {
    const line = composeLine({
      ...base,
      retry: [{ repo: 'frankbueltge/studio', workflow: 'A' }],
      forPerson: [
        { repo: 'frankbueltge/ulysses', workflow: 'B', streak: 3, why: 'x' },
        { repo: 'frankbueltge/studio', kind: 'stranded-branch', branch: 'research/old', ageDays: 17, behind: 245, why: 'y' },
      ],
      accepted: [{ repo: 'frankbueltge/frankbueltge.de', workflow: 'Workers Builds' }],
    })
    expect(line.split('\n')).toHaveLength(1)
    expect(line).toContain('research/old (17d, 245 behind)')
  })
})

describe('the standing issue exists only while something is true', () => {
  it('says in its own body that it is edited in place and closed when empty', () => {
    const body = composeIssue({
      at: '2026-08-13T22:00:00Z',
      retry: [], accepted: [], errors: [],
      forPerson: [{ repo: 'frankbueltge/studio', workflow: 'Auto-land', streak: 8, runId: 7, why: 'red 8 runs running' }],
    })
    expect(body).toContain('edited in place')
    expect(body).toContain('closes it the night nothing is')
    expect(body).toContain('actions/runs/7')
  })
})

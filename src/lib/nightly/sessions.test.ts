// The line's sessions, counted the way the line counts them (tools/sessions.py in its repository).
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LINE_END, nightlyLine } from '@/lib/engines/nightly-line'
import { HEAD_CHARS, journalFiles, ledgerOf, sessionClaimed } from './sessions'

describe('the session a research day claims', () => {
  it('is the first number after "Session" (or the early "Sitzung") in the head', () => {
    expect(sessionClaimed('# Research day — 2026-10-18 (Session 135)\n\nSession 134 said …')).toBe(135)
    expect(sessionClaimed('# Forschungstag — Sitzung 12')).toBe(12)
    expect(sessionClaimed('# A day\n\nno number here')).toBeUndefined()
  })

  it('is read in the head only, as the line reads it', () => {
    expect(sessionClaimed(`${'x'.repeat(HEAD_CHARS)} Session 9`)).toBeUndefined()
  })
})

describe('the ledger', () => {
  const files = {
    'journal/2026-07-18.md': '# Session 43',
    'journal/2026-08-10.md': '# Research day (Session 44)',
    'journal/2026-08-10-session-45.md': '# Research day (Session 45)',
    'journal/2026-08-11.md': '# Research day (Session 46)',
    'journal/2026-08-12.md': '# A day with no number in its head',
  }

  it('counts distinct sessions and the days they fell on, after the cut only', () => {
    expect(ledgerOf(files, '2026-07-18')).toEqual({
      sessions: 3,
      days: 2,
      first: 44,
      last: 46,
      lastDate: '2026-08-11',
      unnumbered: ['2026-08-12.md'],
    })
  })

  it('counts a session claimed twice once', () => {
    expect(ledgerOf({ 'a/2026-08-10.md': 'Session 44', 'a/2026-08-11.md': 'Session 44' }).sessions).toBe(1)
  })
})

describe('the mirror', () => {
  it('reads every research day the mirror carries', () => {
    const onDisk = readdirSync('src/data/nightly/journal').filter((f) => f.endsWith('.md'))
    expect(Object.keys(journalFiles()).length).toBe(onDisk.length)
  })

  it('gives the line its sessions since the fork, counted from the research days and not from the works', () => {
    const line = nightlyLine()
    const numbers = new Set<number>()
    for (const f of readdirSync('src/data/nightly/journal')) {
      if (!f.endsWith('.md') || f.slice(0, 10) <= LINE_END) continue
      const n = sessionClaimed(readFileSync(`src/data/nightly/journal/${f}`, 'utf8'))
      if (n !== undefined) numbers.add(n)
    }
    expect(line.sessionsSinceFork).toBe(numbers.size)
    expect(line.daysWorkedSinceFork).toBeLessThanOrEqual(line.sessionsSinceFork)
  })
})

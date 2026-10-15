// The score's copy carries no digits (2026-10-11).
//
// The same law as the entrance's (edition-wording.test.ts): a number written into wording goes
// stale the first night the record moves. Every count, day and cycle number on the ecology's
// pages is derived from committed files and reaches a sentence as an argument. This guard walks
// SCORE_WORDING and fails on a digit in any static string. One name is exempt because it is a
// name: "v3", the order the pages describe.
import { describe, expect, it } from 'vitest'
import { cycleNo, longDate, SCORE_WORDING as W, shortDate, shortDateYear } from './score-wording'

const strings: { path: string; text: string }[] = []
const walk = (value: unknown, path: string): void => {
  if (typeof value === 'string') strings.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
}
walk(W, 'SCORE_WORDING')

describe('the score’s static copy', () => {
  it('holds strings to check', () => {
    expect(strings.length).toBeGreaterThan(60)
  })

  it.each(
    strings
      // an address is not copy: the decision record's file is named for its day
      .filter((s) => !/\.href$/.test(s.path))
      .map((s) => [s.path, s.text] as const),
  )('%s carries no digit', (_path, text) => {
    expect(text.replace(/\bv3\b/g, '')).not.toMatch(/\d/)
  })
})

describe('days, as the pages write them', () => {
  it('abbreviates the month the same way on every machine', () => {
    expect(shortDate('2026-09-07')).toBe('7 Sept')
    expect(shortDate('2026-08-30')).toBe('30 Aug')
    expect(shortDateYear('2026-10-10')).toBe('10 Oct 2026')
    expect(longDate('2026-10-10')).toBe('10 October')
  })

  it('writes a cycle’s number with three figures', () => {
    expect(cycleNo(7)).toBe('007')
    expect(cycleNo(12)).toBe('012')
  })
})

describe('the sentences take their numbers as arguments', () => {
  it('counts the score’s parts, singular and plural', () => {
    expect(W.score.sub({ cycles: 7, sessions: 153, crossings: 240 })).toBe(
      'every night since v3, one bar per night · 7 cycles · 153 sessions · 240 recorded crossings · select a cycle',
    )
    expect(W.score.sub({ cycles: 1, sessions: 1, crossings: 1 })).toContain('1 cycle · 1 session · 1 recorded crossing ·')
  })

  it('ends the ruler on a day, not on “today”', () => {
    expect(W.score.end('2026-10-10')).toBe('10 Oct ▸')
  })

  it('says where the running question came from', () => {
    const base = { previous: 6, proposedBy: 'the Studio', sessions: '3-5' }
    expect(W.hero.origin({ ...base, source: 'convening' })).toBe(
      'Chosen by the three practices in the convening after cycle 006; proposed by the Studio. 3-5 sessions per practice, then a joint presentation.',
    )
    expect(W.hero.origin({ ...base, source: 'seed' })).toContain('seed channel')
    expect(W.hero.origin({ ...base, source: 'continuing' })).toContain('continuing question')
    expect(W.hero.origin({ ...base, source: 'defaults', proposedBy: null })).toContain('default theme')
  })

  it('spells the span of sessions from the house clock’s own figure', () => {
    const step = W.how.steps[1]
    expect(typeof step.text).toBe('function')
    expect((step.text as (s: string) => string)('3-5')).toContain('three to five sessions')
    expect((step.text as (s: string) => string)('2-4')).toContain('two to four sessions')
  })

  it('words the last turn from the cycles it names', () => {
    expect(W.how.sub(6, 7)).toBe('shown with the turn from cycle 006 to 007')
    expect(W.how.example.tally([{ name: 'Studio', score: 6 }, { name: 'Field', score: 3 }, { name: 'Atelier', score: 0 }], 7)).toBe(
      'Studio 6 · Field 3 · Atelier 0 → cycle 007',
    )
    expect(W.how.convening.head({ after: 6, opened: '2026-10-08', tallied: '2026-10-09', rule: 'borda' })).toBe(
      'The convening after cycle 006 · opened 8 Oct · tallied 9 Oct (borda)',
    )
    expect(W.how.convening.head({ after: 6, opened: null, tallied: null, rule: null })).toBe('The convening after cycle 006')
  })

  it('names a row’s kind in the practice’s own noun', () => {
    const kind = W.register.kind
    expect(kind({ kind: 'work', before: true, paper: false })).toBe('work (before v3)')
    expect(kind({ kind: 'work', before: false, paper: false })).toBe('work')
    expect(kind({ kind: 'artifact', before: false, paper: false })).toBe('artifact')
    expect(kind({ kind: 'presentation', before: false, paper: true })).toBe('presentation + paper')
    expect(W.register.cycleCell(0)).toBe('pre-v3')
    expect(W.register.cycleCell(7)).toBe('007')
    expect(W.register.cycleCell(null)).toBe('—')
  })

  it('takes the article a practice’s noun needs', () => {
    expect(W.practice.part.legend.filled('artifact')).toBe('● a night that left an artifact')
    expect(W.practice.part.legend.filled('work')).toBe('● a night that left a work')
  })

  it('states a station’s cadence from its own counts', () => {
    expect(W.practice.status.cadenceValue({ sessions: 51, nights: 36, of: 42 })).toBe('51 sessions on 36 of 42 nights since v3')
    expect(W.practice.status.timesValue(74, 23)).toBe('74 times (built on 23)')
    expect(W.practice.status.timesValue(1, 0)).toBe('1 time (built on 0)')
  })
})

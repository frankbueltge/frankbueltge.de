// The edition's copy carries no digits (2026-10-11).
//
// The ops room's law, restated for the surface that replaced it: a number written into wording
// goes stale the first night the record moves, and nothing on the page says so. Every figure
// the entrance prints is derived from a committed record and reaches a sentence as an argument.
// This guard walks EDITION and fails on a digit in any static string; a function is called
// with arguments it can recognise, and whatever it returns may contain those and nothing else.
import { describe, expect, it } from 'vitest'
import pulseData from '@/data/pulse/pulse.json'
import { EDITION, inWords } from './edition-wording'

const strings: { path: string; text: string }[] = []
const walk = (value: unknown, path: string): void => {
  if (typeof value === 'string') strings.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
}
walk(EDITION, 'EDITION')

describe('the edition’s static copy', () => {
  it('holds strings to check', () => {
    expect(strings.length).toBeGreaterThan(30)
  })

  it.each(strings.map((s) => [s.path, s.text] as const))('%s carries no digit', (_path, text) => {
    expect(text).not.toMatch(/\d/)
  })
})

describe('the edition’s sentences take their numbers as arguments', () => {
  const T = EDITION.timetable

  it('spells a small count, and leaves a large one a figure', () => {
    expect(inWords(7)).toBe('seven')
    expect(inWords(12)).toBe('twelve')
    expect(inWords(60)).toBe('60')
  })

  it('names the block size the snapshot actually bins by', () => {
    // "two-hour blocks" is 24 ÷ the pulse's own bin size, said in words — never a typed "two".
    const hours = pulseData.bin_hours
    expect(T.foot({ blockHours: hours })).toContain(`${inWords(hours)}-hour block`)
    expect(T.footStrip({ perDay: 24 / hours, blockHours: hours })).toContain(`${inWords(24 / hours)} ${inWords(hours)}-hour blocks`)
    expect(T.foot({ blockHours: 4 })).toContain('four-hour block')
  })

  it('keeps the placeholder the script swaps per mode in both footnotes', () => {
    expect(T.foot({ blockHours: 2 })).toContain('{shade}')
    expect(T.footStrip({ perDay: 12, blockHours: 2 })).toContain('{shade}')
  })

  it('words a timetable cell from the cell’s own figures', () => {
    expect(T.readout({ name: 'Ulysses', day: 'Friday, 9 October', commits: 84, active: 5, perDay: 12, blockHours: 2, hours: ['00', '06', '08', '20', '22'] })).toBe(
      'Ulysses · Friday, 9 October: 84 commits in 5 of 12 two-hour blocks (00 06 08 20 22)',
    )
    expect(T.readout({ name: 'n-1', day: 'Sunday, 4 October', commits: 0, active: 0, perDay: 12, blockHours: 2, hours: [] })).toBe(
      'n-1 · Sunday, 4 October: 0 commits in 0 of 12 two-hour blocks',
    )
    expect(T.readout({ name: 'n-1', day: 'x', commits: 1, active: 1, perDay: 12, blockHours: 2, hours: ['00'] })).toContain('1 commit in')
  })

  it('writes a span as the hour the first block begins and the hour the last one ends', () => {
    expect(T.span(4, 24)).toBe('04–24')
    expect(T.span(0, 2)).toBe('00–02')
  })
})

describe('the lead follows the cycle’s own state', () => {
  const L = EDITION.lead
  const base = { source: 'convening', phase: 'working', age: 0, pieces: 3, practices: 3, previous: 6 } as const

  it('says how long ago the cycle opened, from its age', () => {
    expect(L.kicker({ cycle: 7, phase: 'working', age: 0 })).toBe('cycle 007 opened today')
    expect(L.kicker({ cycle: 7, phase: 'working', age: 1 })).toBe('cycle 007 opened yesterday')
    expect(L.kicker({ cycle: 7, phase: 'working', age: 3 })).toBe('cycle 007 · day 4')
    expect(L.kicker({ cycle: 12, phase: 'convening', age: 6 })).toBe('cycle 012 presented · the convening is open')
  })

  it('claims a piece from each only when each has landed one', () => {
    expect(L.standfirst(base)).toBe(
      'The three machine-run practices chose the question in the convening after cycle 006. Overnight each opened its first session on it and committed one piece.',
    )
    expect(L.standfirst({ ...base, pieces: 2 })).toContain('Two of the three have landed a piece on it so far.')
    expect(L.standfirst({ ...base, pieces: 1 })).toContain('One of the three has landed a piece on it so far.')
    expect(L.standfirst({ ...base, pieces: 0 })).toContain('Nothing has landed on it yet.')
  })

  it('stops saying “overnight” once the opening night is past', () => {
    expect(L.standfirst({ ...base, age: 2 })).not.toContain('Overnight')
    expect(L.standfirst({ ...base, age: 2 })).toContain('the newest piece of each is below')
  })

  it('names where the question came from, for every source the cycle clock knows', () => {
    expect(L.standfirst({ ...base, source: 'seed' })).toContain('came in as a seed')
    expect(L.standfirst({ ...base, source: 'continuing' })).toContain('continuing question')
    expect(L.standfirst({ ...base, source: 'defaults' })).toContain('default theme')
  })

  it('follows the phase past the working nights', () => {
    expect(L.standfirst({ ...base, phase: 'presenting' })).toContain('presentation')
    expect(L.standfirst({ ...base, phase: 'convening' })).toContain('proposing and ranking the next question')
  })
})

describe('house by house', () => {
  it('counts the nights it sums over in words, from the table’s own length', () => {
    expect(EDITION.overnight.meta({ day: 'Friday, 9 October', commits: 262, days: 7, relation: 'forked from the Atelier' })).toBe(
      'Friday, 9 October · 262 commits in seven nights · forked from the Atelier',
    )
    expect(EDITION.overnight.meta({ day: null, commits: 1, days: 7, relation: 'x' })).toBe('1 commit in seven nights · x')
  })
})

describe('the arrivals', () => {
  it('heads a day with its own count', () => {
    expect(EDITION.arrivals.dayHead('Saturday, 10 October', 19)).toBe('Saturday, 10 October · 19 arrivals')
    expect(EDITION.arrivals.dayHead('Friday, 9 October', 1)).toBe('Friday, 9 October · 1 arrival')
  })
})

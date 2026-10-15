import { describe, expect, it } from 'vitest'
import {
  arrivedAfter,
  counted,
  DAY_MS,
  dayOf,
  dayReaches,
  daysSpanned,
  fill,
  firstVisits,
  longDate,
  longDay,
  nextVisits,
  parseVisits,
  SESSION_MS,
  shortDay,
  startOf,
} from './since'

const at = (iso: string) => Date.parse(iso)

describe('the stored entry', () => {
  it('reads what it wrote', () => {
    expect(parseVisits(JSON.stringify({ ref: 5, seen: 9 }))).toEqual({ ref: 5, seen: 9 })
    expect(parseVisits(JSON.stringify(firstVisits(9)))).toEqual({ ref: null, seen: 9 })
  })

  it('treats anything else as no entry', () => {
    for (const raw of [null, '', 'not json', '{}', '{"seen":"yesterday"}', '{"seen":null}', '[1,2]', '{"seen":1e999}']) {
      expect(parseVisits(raw)).toBeNull()
    }
  })

  it('drops a reference point that is not a number, and keeps the entry', () => {
    expect(parseVisits('{"ref":"x","seen":4}')).toEqual({ ref: null, seen: 4 })
  })
})

describe('a page load', () => {
  const seen = at('2026-10-07T12:00:00Z')

  it('within a session leaves the reference point where it was — a reload resets nothing', () => {
    expect(nextVisits({ ref: 100, seen }, seen + SESSION_MS)).toEqual({ ref: 100, seen: seen + SESSION_MS })
    expect(nextVisits({ ref: null, seen }, seen + 60_000)).toEqual({ ref: null, seen: seen + 60_000 })
  })

  it('more than a session later makes the last load the reference point', () => {
    const now = seen + SESSION_MS + 1
    expect(nextVisits({ ref: 100, seen }, now)).toEqual({ ref: seen, seen: now })
    expect(nextVisits({ ref: null, seen }, now)).toEqual({ ref: seen, seen: now })
  })
})

describe('days', () => {
  it('names a day the way the dateline does', () => {
    expect(longDay('2026-10-10')).toBe('Saturday, 10 October')
    expect(longDate('2026-10-10')).toBe('Saturday, 10 October 2026')
    expect(shortDay('2026-10-04')).toBe('Sun 4')
  })

  it('reads days in UTC', () => {
    expect(dayOf(at('2026-10-10T23:59:59Z'))).toBe('2026-10-10')
    expect(dayOf(at('2026-10-11T00:00:00Z'))).toBe('2026-10-11')
    expect(startOf('2026-10-10')).toBe(at('2026-10-10T00:00:00Z'))
  })
})

describe('what counts as new', () => {
  const ref = at('2026-10-09T12:46:00Z')

  it('an arrival is new from the day after the reference day', () => {
    expect(arrivedAfter('2026-10-09', ref)).toBe(false)
    expect(arrivedAfter('2026-10-10', ref)).toBe(true)
    expect(arrivedAfter('2026-10-08', ref)).toBe(false)
  })

  it('a timetable day is new when any of it lies after the reference point', () => {
    expect(dayReaches('2026-10-08', ref)).toBe(false)
    expect(dayReaches('2026-10-09', ref)).toBe(true)
    expect(dayReaches('2026-10-10', ref)).toBe(true)
    // a day that ended exactly at the reference point has nothing after it
    expect(dayReaches('2026-10-08', at('2026-10-09T00:00:00Z'))).toBe(false)
  })

  it('spans whole days, never fewer than one', () => {
    const edition = at('2026-10-10T12:46:00Z')
    expect(daysSpanned(at('2026-10-07T12:00:00Z'), edition)).toBe(3)
    expect(daysSpanned(edition - DAY_MS, edition)).toBe(1)
    expect(daysSpanned(edition - 60_000, edition)).toBe(1)
    expect(daysSpanned(edition + DAY_MS, edition)).toBe(1)
  })
})

describe('wording a count', () => {
  it('fills a template and leaves an unknown placeholder empty', () => {
    expect(fill('Since {day}: {n}{x}.', { day: 'Friday', n: 3 })).toBe('Since Friday: 3.')
  })

  it('picks the noun by count', () => {
    expect(counted(1, ['arrival', 'arrivals'])).toBe('1 arrival')
    expect(counted(0, ['arrival', 'arrivals'])).toBe('0 arrivals')
    expect(counted(38, ['arrival', 'arrivals'])).toBe('38 arrivals')
  })
})

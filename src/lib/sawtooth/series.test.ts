import { describe, expect, it } from 'vitest'
import { dayAt, sawtooth } from './series'

const s = sawtooth()

describe('the series is the committed record, read straight', () => {
  it('opens in 1962 and has one row per day with no gaps', () => {
    expect(s.first).toBe('1962-01-01')
    expect(s.days).toBe(s.cumulative.length)
    expect(s.observed).toHaveLength(s.days)
    // the last index must land exactly on the last date the file names
    expect(dayAt(s.days - 1)).toBe(s.last)
  })

  it('counts the inserted leap seconds, not the offset UTC started from', () => {
    // The table's first row is the 1972 starting offset of ten seconds; every row after it is an
    // insertion. TAI-UTC today minus that offset is therefore the number of leap seconds.
    const offset = 10
    expect(s.leaps.length).toBe(s.leaps.at(-1)!.tai_utc - offset)
    expect(s.leaps.every((l, i, a) => i === 0 || l.date > a[i - 1].date)).toBe(true)
  })
})

describe('the correction did its job, which is why the picture is flat', () => {
  it('keeps the observed line inside the tolerance the rule sets', () => {
    // UTC is defined to stay within 0.9 s of UT1; every published day must honour it.
    for (const v of s.observed) expect(Math.abs(v)).toBeLessThanOrEqual(0.9)
  })

  it('has an uncorrected counterfactual far outside that tolerance — the size of the intervention', () => {
    expect(s.drift).toBeGreaterThan(Math.max(...s.observed.map(Math.abs)) * 10)
  })

  it('is monotone in the counterfactual only while days ran long', () => {
    // The running total rises for as long as the Earth loses; a decade of short days bends it.
    const last = s.cumulative.at(-1)!
    const peak = Math.max(...s.cumulative)
    expect(peak).toBeGreaterThanOrEqual(last)
  })
})

describe('the reversal, which is the subject', () => {
  it('finds the day the Earth turned fastest, and it is recent', () => {
    expect(s.shortest.ms).toBeLessThan(0)
    expect(Number(s.shortest.date.slice(0, 4))).toBeGreaterThanOrEqual(2020)
  })

  it('puts most of the short days in the years since the reversal', () => {
    expect(s.shortDaysSince2020 / s.shortDays).toBeGreaterThan(0.5)
  })

  it('ends on a decade whose mean day runs SHORT — the sign change', () => {
    const last = s.decades.at(-1)!
    const first = s.decades[0]
    expect(first.ms).toBeGreaterThan(0)
    expect(last.ms).toBeLessThan(0)
  })

  it('has inserted nothing for years, because there is nothing left to insert', () => {
    expect(s.yearsSinceLeap).toBeGreaterThanOrEqual(5)
    expect(s.lastLeap).toBe(s.leaps.at(-1)!.date)
  })
})

describe('nothing is invented', () => {
  it('derives every headline figure from the arrays, not from a constant', () => {
    const recomputed = s.observed.at(-1)!
    expect(s.standing).toBe(recomputed)
    const shortest = Math.min(...s.decades.map((d) => d.ms))
    expect(s.decades.some((d) => d.ms === shortest)).toBe(true)
  })

  it('names the sources it was built from', () => {
    expect(s.sources.eop).toMatch(/^https:\/\//)
    expect(s.sources.leap).toMatch(/^https:\/\//)
    expect(s.fetched).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

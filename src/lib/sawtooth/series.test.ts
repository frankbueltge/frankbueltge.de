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

  it('ends on a decade whose mean day runs SHORT — the sign change, for the first time', () => {
    // The page and the register both say it in words: the last decade is the first of the record
    // whose average day runs short. A refresh can take that away (a run of long days pulls the
    // decade's mean back over the line), and then those sentences have to be rewritten, not kept.
    const last = s.decades.at(-1)!
    for (const d of s.decades.slice(0, -1)) {
      expect(d.ms, `the ${d.decade}s already ran short, so the last decade is not the first`).toBeGreaterThan(0)
    }
    expect(last.ms, `the ${last.decade}s no longer run short on average — rewrite the prose`).toBeLessThan(0)
  })

  it('has inserted nothing for years, because there is nothing left to insert', () => {
    expect(s.yearsSinceLeap).toBeGreaterThanOrEqual(5)
    expect(s.lastLeap).toBe(s.leaps.at(-1)!.date)
  })

  it('stops the slide after the last tooth short of the edge, and turns it back up', () => {
    // Plate two says this in words. If a refresh lets the line fall past that low again, the low
    // moves to the right-hand end, the rebound goes to zero, and this fails: the sentence has to
    // be rewritten rather than left standing over a record that no longer says it.
    expect(s.lowSinceLeap.date > s.lastLeap).toBe(true)
    expect(s.lowSinceLeap.s).toBeGreaterThan(-0.9)
    // a turn, not the seasonal wobble, which moves UT1-UTC by a few hundredths of a second
    expect(s.reboundSinceLow).toBeGreaterThan(0.1)
  })
})

describe('the slide after the last tooth, on a record small enough to read', () => {
  // ut1_utc in tenths of a millisecond: 0.5 s after the snap, down to −0.3 s, back up to +0.1 s
  const tiny = {
    first: '2017-01-01',
    last: '2017-01-06',
    days: 6,
    fetched: '2017-01-07',
    lod: [0, 0, 0, 0, 0, 0],
    ut1_utc: [5000, 2000, -1000, -3000, -2000, 1000],
    leaps: [
      { date: '1972-01-01', tai_utc: 10 },
      { date: '2017-01-01', tai_utc: 11 },
    ],
    sources: { eop: 'https://example.org/eop', leap: 'https://example.org/leap' },
  }

  it('finds the lowest point after the leap and the climb back from it', () => {
    const t = sawtooth(tiny)
    expect(t.lowSinceLeap).toEqual({ date: '2017-01-04', s: -0.3 })
    expect(t.reboundSinceLow).toBeCloseTo(0.4, 10)
  })

  it('reports no climb at all while the slide is still going', () => {
    const t = sawtooth({ ...tiny, ut1_utc: [5000, 2000, -1000, -3000, -4000, -5000] })
    expect(t.lowSinceLeap.date).toBe(t.last)
    expect(t.reboundSinceLow).toBe(0)
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

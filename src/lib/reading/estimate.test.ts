import { describe, expect, it } from 'vitest'
import { SCALES, fmtCount, fmtValue, judge, parseNumber, summarize, verdictLine } from './estimate'
import type { EstimateItem } from './round'

const people: EstimateItem = {
  id: 'p',
  matter: 'm',
  question: '?',
  kind: 'count',
  unit: 'people',
  truth: 266_000_000,
  truth_label: 'around 266 million',
  source: { label: 's', url: 'https://example.org' },
}
const share: EstimateItem = { ...people, id: 's', kind: 'percent', unit: '%', truth: 20, truth_label: 'roughly 20 %' }
const warm: EstimateItem = { ...people, id: 'w', kind: 'degrees', unit: '°C', truth: 1.63, truth_label: '1.63 °C' }

describe('judge', () => {
  it('reads a count by factor: within 1.25 is close, otherwise under or over', () => {
    expect(judge('count', 250_000_000, 266_000_000).direction).toBe('close')
    const under = judge('count', 50_000_000, 266_000_000)
    expect(under.direction).toBe('under')
    expect(under.factor).toBeCloseTo(5.32, 2)
    expect(judge('count', 1_000_000_000, 266_000_000).direction).toBe('over')
    expect(judge('count', 0, 266_000_000)).toMatchObject({ direction: 'under', factor: Infinity })
  })

  it('reads a percentage within five points and a temperature within a tenth as close', () => {
    expect(judge('percent', 25, 20).direction).toBe('close')
    expect(judge('percent', 26, 20)).toMatchObject({ direction: 'over', difference: 6 })
    expect(judge('degrees', 1.55, 1.63).direction).toBe('close')
    expect(judge('degrees', 1.2, 1.63).direction).toBe('under')
  })
})

describe('formatting', () => {
  it('says counts the way people say them', () => {
    expect(fmtCount(4053)).toBe('4,053')
    expect(fmtCount(266_000_000)).toBe('266 million')
    expect(fmtCount(2_700_000)).toBe('2.7 million')
    expect(fmtCount(1_200_000_000)).toBe('1.2 billion')
    expect(fmtValue('percent', 59)).toBe('59 %')
    expect(fmtValue('degrees', 1.63)).toBe('1.63 °C')
  })

  it('words a verdict from the values alone', () => {
    expect(verdictLine(people, 50_000_000)).toBe('You said 50 million; the figure is around 266 million: 5.3 times too low.')
    expect(verdictLine(share, 10)).toBe('You said 10 %; the figure is roughly 20 %: 10 points too low.')
    expect(verdictLine(warm, 1.6)).toBe('You said 1.6 °C; the figure is 1.63 °C: close.')
  })
})

describe('summarize', () => {
  it('counts answers and unknowns and reads the middle of the answers', () => {
    const s = summarize(share, [10, 20, 30, null, 40])
    expect(s).toMatchObject({ answered: 4, unknown: 1, median: 25, under: 1, close: 1, over: 2 })
  })

  it('has no middle without answers', () => {
    expect(summarize(share, [null])).toMatchObject({ answered: 0, median: null })
  })
})

describe('parseNumber and SCALES', () => {
  it('reads thousands separators, decimal commas and signs, and refuses the unclear', () => {
    expect(parseNumber('4,053')).toBe(4053)
    expect(parseNumber('4053')).toBe(4053)
    expect(parseNumber('1.63')).toBe(1.63)
    expect(parseNumber('1,63')).toBe(1.63)
    expect(parseNumber(' 59 % ')).toBe(59)
    expect(parseNumber('1.5 °C')).toBe(1.5)
    expect(parseNumber('266 000 000')).toBe(266000000)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('a lot')).toBeNull()
    expect(parseNumber('1.2.3')).toBeNull()
  })

  it('offers counts in plain numbers, thousands, millions and billions', () => {
    expect(SCALES.map((s) => s.factor)).toEqual([1, 1e3, 1e6, 1e9])
  })
})

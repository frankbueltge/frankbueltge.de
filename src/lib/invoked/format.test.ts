import { describe, expect, it } from 'vitest'
import {
  ageBucketLabel,
  count,
  decimal,
  humanDate,
  invokedByLabel,
  percent,
  standoutWindow,
  times,
  windowLabel,
} from './format'

describe('count', () => {
  it('separates thousands so five- and six-figure counts stay readable', () => {
    expect(count(95653)).toBe('95,653')
    expect(count(917)).toBe('917')
    expect(count(0)).toBe('0')
  })
})

describe('decimal', () => {
  it('keeps a typographic minus and the requested precision', () => {
    expect(decimal(9.587, 2)).toBe('9.59')
    expect(decimal(74.8)).toBe('74.8')
    expect(decimal(-1.25, 1)).toBe('−1.3')
  })
})

describe('times', () => {
  it('reads as a multiple of the baseline', () => {
    expect(times(7.97)).toBe('8.0×')
    expect(times(2)).toBe('2.0×')
  })
})

describe('percent', () => {
  it('turns a stored fraction into a percentage', () => {
    expect(percent(0.599)).toBe('59.9%')
    expect(percent(0.3905, 1)).toBe('39.1%')
    expect(percent(1)).toBe('100.0%')
  })
})

describe('humanDate', () => {
  it('reads an archive date as a date, without touching a clock', () => {
    expect(humanDate('1947-08-15')).toBe('15 August 1947')
    expect(humanDate('2001-09-11')).toBe('11 September 2001')
    expect(humanDate('1883-11-18')).toBe('18 November 1883')
  })
  it('passes anything it does not recognize through untouched', () => {
    expect(humanDate('1947-08')).toBe('1947-08')
    expect(humanDate('1947-13-01')).toBe('1947-13-01')
  })
})

describe('ageBucketLabel', () => {
  it('labels closed and open-ended buckets', () => {
    expect(ageBucketLabel({ from: 11, to: 25, mentions: 0, share: 0 })).toBe('11–25 years')
    expect(ageBucketLabel({ from: 201, to: null, mentions: 0, share: 0 })).toBe('201+ years')
  })
})

describe('invokedByLabel', () => {
  it('names the largest sources of a year, in order, with their counts', () => {
    const cs = [
      { fips: 'IN', name: 'India', mentions: 515 },
      { fips: 'US', name: 'United States', mentions: 119 },
      { fips: 'UK', name: 'United Kingdom', mentions: 72 },
      { fips: 'PK', name: 'Pakistan', mentions: 26 },
    ]
    expect(invokedByLabel(cs)).toBe('India 515 · United States 119 · United Kingdom 72')
    expect(invokedByLabel(cs, 1)).toBe('India 515')
    expect(invokedByLabel([])).toBe('')
  })
})

describe('windowLabel', () => {
  it('turns a slot window into a readable UTC range', () => {
    expect(windowLabel('20260814131500 .. 20260815130000 UTC')).toBe(
      '2026-08-14 13:15 UTC — 2026-08-15 13:00 UTC',
    )
  })
  it('passes through anything it does not recognize, including an empty window', () => {
    expect(windowLabel('')).toBe('')
    expect(windowLabel('weird')).toBe('weird')
  })
})

describe('standoutWindow', () => {
  it('reads the neighbourhood half-width out of the method sentence', () => {
    expect(standoutWindow('… exceeds the median of the +/-5 years around it …')).toBe(5)
    expect(standoutWindow('… the median of the +/- 7 years around it …')).toBe(7)
  })
  it('falls back only when the sentence stops saying it', () => {
    expect(standoutWindow('a method sentence without a window')).toBe(5)
    expect(standoutWindow('', 3)).toBe(3)
  })
})

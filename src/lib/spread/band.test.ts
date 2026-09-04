// src/lib/spread/band.test.ts
import { describe, expect, it } from 'vitest'

import { computeBand, initTypicalWidth, isRemarkableGap, mid, updateTypicalWidth } from './band'
import type { Quote } from './venues'

const q = (venue: Quote['venue'], bid: number, ask: number): Quote => ({ venue, bid, ask, time: 0 })

describe('mid', () => {
  it('is the midpoint of bid and ask', () => {
    expect(mid(q('coinbase', 100, 102))).toBe(101)
  })
})

describe('computeBand', () => {
  it('is null with fewer than two quoted venues', () => {
    expect(computeBand([])).toBeNull()
    expect(computeBand([q('coinbase', 100, 102)])).toBeNull()
  })

  it('finds the highest and lowest venue by mid price, and their width', () => {
    const band = computeBand([q('coinbase', 100, 102), q('kraken', 105, 107), q('bitstamp', 99, 101)])
    expect(band).toEqual({ high: 106, low: 100, width: 6, highVenue: 'kraken', lowVenue: 'bitstamp' })
  })

  it('is zero-width, not null, when every venue agrees exactly (a tie keeps the first venue)', () => {
    const band = computeBand([q('coinbase', 100, 100), q('kraken', 100, 100)])
    expect(band).toEqual({ high: 100, low: 100, width: 0, highVenue: 'coinbase', lowVenue: 'coinbase' })
  })
})

describe('typical width (EMA baseline)', () => {
  it('starts at the first sample, not zero', () => {
    const s = updateTypicalWidth(initTypicalWidth(), 10)
    expect(s).toEqual({ ema: 10, count: 1 })
  })

  it('moves toward new samples without jumping straight to them', () => {
    let s = updateTypicalWidth(initTypicalWidth(), 10)
    s = updateTypicalWidth(s, 20, 0.5)
    expect(s.ema).toBe(15)
    expect(s.count).toBe(2)
  })

  it('converges toward a steady input over many samples', () => {
    let s = initTypicalWidth()
    for (let i = 0; i < 500; i++) s = updateTypicalWidth(s, 4, 0.02)
    expect(s.ema).toBeCloseTo(4, 3)
  })

  it('ignores a negative or non-finite width rather than corrupting the average', () => {
    let s = updateTypicalWidth(initTypicalWidth(), 10)
    const untouched = updateTypicalWidth(s, -5)
    expect(untouched).toEqual(s)
    expect(updateTypicalWidth(s, NaN)).toEqual(s)
    expect(updateTypicalWidth(s, Infinity)).toEqual(s)
  })
})

describe('isRemarkableGap', () => {
  it('is never remarkable before the minimum number of samples has been seen', () => {
    const typical = { ema: 1, count: 19 }
    expect(isRemarkableGap(100, typical, { minSamples: 20 })).toBe(false)
  })

  it('is never remarkable while the baseline itself is zero (nothing to compare against)', () => {
    expect(isRemarkableGap(5, { ema: 0, count: 1000 })).toBe(false)
  })

  it('fires exactly at the multiplier, and not just under it', () => {
    const typical = { ema: 2, count: 1000 }
    expect(isRemarkableGap(5.999, typical, { multiplier: 3 })).toBe(false)
    expect(isRemarkableGap(6, typical, { multiplier: 3 })).toBe(true)
    expect(isRemarkableGap(6.01, typical, { multiplier: 3 })).toBe(true)
  })

  it('honours a caller-supplied multiplier and minSamples', () => {
    const typical = { ema: 10, count: 5 }
    expect(isRemarkableGap(15, typical, { multiplier: 1.5, minSamples: 5 })).toBe(true)
    expect(isRemarkableGap(15, typical, { multiplier: 1.5, minSamples: 6 })).toBe(false)
  })
})

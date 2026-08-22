import { describe, expect, it } from 'vitest'
import { rStr, pct, normalize, linePath } from './format'

describe('rStr', () => {
  it('formats the correlation with its sign', () => {
    expect(rStr(-0.981, 'en')).toBe('−0.98')
    expect(rStr(-0.981, 'de')).toBe('−0,98')
    expect(rStr(0.7, 'en')).toBe('+0.70')
  })

  it('never rounds a strong correlation up to a perfect one', () => {
    // The live value on 2026-08-22 was −0.996 and rendered as "−1.00" — a claim of perfect
    // correlation on a page about numbers overstating themselves.
    expect(rStr(-0.996, 'en')).toBe('−0.996')
    expect(rStr(-0.9996, 'en')).toBe('−0.9996')
    expect(rStr(0.996, 'de')).toBe('+0,996')
  })

  it('still prints two decimals for an actual 1', () => {
    expect(rStr(1, 'en')).toBe('+1.00')
    expect(rStr(-1, 'en')).toBe('−1.00')
  })
})

describe('pct', () => {
  it('rundet Anteil', () => {
    expect(pct(0.0, 'en')).toBe('0%')
    expect(pct(0.62, 'de')).toBe('62 %')
  })
})

describe('normalize', () => {
  it('skaliert auf 0..1', () => {
    expect(normalize([10, 20, 30])).toEqual([0, 0.5, 1])
  })
  it('konstante Reihe → 0', () => {
    expect(normalize([5, 5, 5])).toEqual([0, 0, 0])
  })
})

describe('linePath', () => {
  it('erste/letzte x-Position spannen die Breite', () => {
    const p = linePath([0, 1, 0], 100, 50)
    expect(p.startsWith('M0.0,50.0')).toBe(true)
    expect(p).toContain('L100.0,50.0')
  })
})

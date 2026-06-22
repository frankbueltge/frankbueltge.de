import { describe, expect, it } from 'vitest'
import { rStr, pct, normalize, linePath } from './format'

describe('rStr', () => {
  it('formatiert die Korrelation mit Vorzeichen', () => {
    expect(rStr(-0.981, 'en')).toBe('−0.98')
    expect(rStr(-0.981, 'de')).toBe('−0,98')
    expect(rStr(0.7, 'en')).toBe('+0.70')
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

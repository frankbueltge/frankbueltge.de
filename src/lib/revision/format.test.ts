import { describe, expect, it } from 'vitest'
import { signedPct, sharePct, epiweekLabel, num } from './format'

describe('signedPct', () => {
  it('formatiert mit Vorzeichen je Sprache', () => {
    expect(signedPct(8.9, 'en')).toBe('+8.9%')
    expect(signedPct(8.9, 'de')).toBe('+8,9 %')
    expect(signedPct(-1.2, 'en')).toBe('−1.2%')
  })
})

describe('sharePct', () => {
  it('rundet Anteil auf ganze Prozent', () => {
    expect(sharePct(0.949, 'en')).toBe('95%')
    expect(sharePct(0.949, 'de')).toBe('95 %')
  })
})

describe('epiweekLabel', () => {
  it('zerlegt Epiweek in Jahr-Woche', () => {
    expect(epiweekLabel(202514)).toBe('2025-W14')
    expect(epiweekLabel(202240)).toBe('2022-W40')
  })
})

describe('num', () => {
  it('trennt Tausender', () => {
    expect(num(66660, 'en')).toBe('66,660')
    expect(num(66660, 'de')).toBe('66.660')
  })
})

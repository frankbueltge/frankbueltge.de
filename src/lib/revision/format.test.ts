import { describe, expect, it } from 'vitest'
import { millions, signedFull, sharePct, monthLabel } from './format'

describe('millions', () => {
  it('rechnet Tausender in Millionen, betragsweise', () => {
    expect(millions(1246, 'en')).toBe('1.25')
    expect(millions(1246, 'de')).toBe('1,25')
    expect(millions(-298, 'en')).toBe('0.3')
  })
})

describe('signedFull', () => {
  it('volle Zahl mit Vorzeichen', () => {
    expect(signedFull(-1246, 'en')).toBe('−1,246,000')
    expect(signedFull(50, 'en')).toBe('+50,000')
  })
})

describe('sharePct', () => {
  it('rundet Anteil', () => {
    expect(sharePct(1, 'en')).toBe('100%')
    expect(sharePct(1, 'de')).toBe('100 %')
  })
})

describe('monthLabel', () => {
  it('macht aus 2025-06 einen Monatsnamen', () => {
    expect(monthLabel('2025-06', 'en')).toBe('June 2025')
    expect(monthLabel('2025-06', 'de')).toBe('Juni 2025')
  })
})

import { describe, expect, it } from 'vitest'
import { pct, thousands, withholdOnPage } from './world'

describe('the page withholds crime/court headlines — personal-rights caution', () => {
  it('withholds reporting that likely names a private person', () => {
    expect(withholdOnPage('Local man charged with fraud after raid')).toBe(true)
    expect(withholdOnPage('Teacher jailed for assault on pupil')).toBe(true)
    expect(withholdOnPage('Suspect arrested in downtown murder case')).toBe(true)
  })

  it('leaves ordinary news wording alone', () => {
    expect(withholdOnPage('Parliament passes budget after long debate')).toBe(false)
    expect(withholdOnPage('Storm closes coastal roads overnight')).toBe(false)
    expect(withholdOnPage('Airline drops named carrier from catering claim')).toBe(false)
  })

  it('is case-insensitive and word-bounded', () => {
    expect(withholdOnPage('COURT rules on fishing quota')).toBe(true)
    // "courting" is not "court" — the boundary keeps metaphors out
    expect(withholdOnPage('Startups courting investors this autumn')).toBe(false)
  })
})

describe('format helpers', () => {
  it('renders rates and thousands honestly', () => {
    expect(pct(0.037)).toBe('3.7 %')
    expect(pct(null)).toBe('—')
    expect(thousands(53724)).toBe('53,724')
    expect(thousands(undefined)).toBe('—')
  })
})

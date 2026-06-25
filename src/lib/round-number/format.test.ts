import { describe, expect, it } from 'vitest'
import { percent, verdictLabel } from './format'

describe('percent', () => {
  it('formats a fraction as a percentage per locale', () => {
    expect(percent(0.51, 'en')).toBe('51%')
    expect(percent(0.51, 'de')).toBe('51 %')
    expect(percent(0, 'en')).toBe('0%')
  })
})

describe('verdictLabel', () => {
  it('maps verdict keys to human labels', () => {
    expect(verdictLabel('nonconformity', 'en')).toBe('nonconformity')
    expect(verdictLabel('nonconformity', 'de')).toBe('Nonkonformität')
    expect(verdictLabel('uniform', 'de')).toBe('gleichverteilt')
    expect(verdictLabel('unknown', 'en')).toBe('unknown')
  })
})

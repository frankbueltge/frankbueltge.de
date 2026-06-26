import { describe, expect, it } from 'vitest'
import { coord, darkLabel, regionLabel } from './format'

describe('darkLabel', () => {
  it('shows days for long gaps, hours for short', () => {
    expect(darkLabel(1070, 'en')).toBe('45 days')
    expect(darkLabel(1070, 'de')).toBe('45 Tage')
    expect(darkLabel(30, 'en')).toBe('30 h')
  })
})

describe('coord', () => {
  it('formats lat/lon with hemisphere', () => {
    expect(coord({ lat: 10.6, lon: -91.4 })).toBe('10.6°N, 91.4°W')
    expect(coord({ lat: -12.5, lon: 145 })).toBe('12.5°S, 145.0°E')
    expect(coord({ lat: null, lon: null })).toBe('—')
  })
})

describe('regionLabel', () => {
  it('picks the most charged region', () => {
    expect(regionLabel({ mpa: true, no_take: true, eez: [], high_seas: false }, 'en')).toBe('no-take reserve')
    expect(regionLabel({ mpa: false, no_take: false, eez: ['8'], high_seas: false }, 'de')).toBe('nationale Hoheitsgewässer (EEZ)')
    expect(regionLabel({ mpa: false, no_take: false, eez: [], high_seas: true }, 'en')).toBe('high seas')
  })
})

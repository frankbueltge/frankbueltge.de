import { describe, expect, it } from 'vitest'
import { coord, darkLabel, flagClause, regionLabel, vesselKind } from './format'

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
    expect(regionLabel({ mpa: false, no_take: false, eez: [], high_seas: true }, 'en')).toBe('high seas')
  })

  it('prefers the resolved EEZ name, which the committed data carries since 2026-06-26', () => {
    expect(regionLabel({ mpa: false, no_take: false, eez: ['8450'], eez_name: 'Kiribati EEZ (Phoenix Group)', high_seas: false }, 'en'))
      .toBe('Kiribati EEZ (Phoenix Group)')
  })

  it('never calls an EEZ national or territorial waters', () => {
    for (const locale of ['en', 'de'] as const) {
      const label = regionLabel({ mpa: false, no_take: false, eez: ['8'], high_seas: false }, locale)
      expect(label).toMatch(/EEZ/)
      expect(label).not.toMatch(/waters|Hoheitsgewässer/)
    }
  })
})

describe('vesselKind', () => {
  it('names fishing gear as gear, not as a ship', () => {
    expect(vesselKind('gear', 'en')).toBe('fishing-gear tag')
    expect(vesselKind('gear', 'de')).not.toMatch(/schiff/i)
  })

  it('falls back to a plain vessel for an unmapped class', () => {
    expect(vesselKind('fishing', 'en')).toBe('fishing vessel')
    expect(vesselKind('tug', 'en')).toBe('vessel')
  })
})

describe('flagClause', () => {
  it('states the absence instead of printing the placeholder flag', () => {
    expect(flagClause('—', 'en')).toBe(' with no flag state')
    expect(flagClause('', 'de')).toBe(' ohne Flaggenstaat')
    expect(flagClause('JPN', 'en')).toBe(' flagged JPN')
  })
})

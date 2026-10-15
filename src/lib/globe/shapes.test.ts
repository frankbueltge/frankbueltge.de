// What a country fill is drawn from. Three ways this goes wrong quietly, and one that is loud.
//
// Quiet: a country whose code the crosswalk cannot place would simply have no polygon and no fill,
// and every test would stay green while the globe drew one country fewer — so the resolver throws,
// and this suite asserts that the set of keys is exactly the set of countries the centroids cover.
// Quiet: an outline that drifts from the one the plate draws, because two decoders read the same
// topology differently. Quiet: a payload that grows a night at a time until a country layer costs
// more than the records on it. Loud: a payload that is not byte-identical between two builds.
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { byNumeric } from './crosswalk'
import { countryGeometries } from './geo'
import { countryShapes } from './shapes'

const payload = countryShapes()
const json = JSON.stringify(payload)

describe('the country polygons a fill is drawn from', () => {
  it('covers exactly the countries the committed topology draws, keyed by the code a record names', () => {
    // the fills and the centroids must cover the same set, or a country would be filled without a
    // point to open a card at, or hold a point with nothing to fill
    const expected = countryGeometries()
      .map((country) => byNumeric(country.num).iso3)
      .sort()
    expect(Object.keys(payload.byIso3).sort()).toEqual(expected)
    expect(expected.length).toBeGreaterThan(150)
  })

  it('carries a filled geometry for every key, and no upstream properties at all', () => {
    for (const [iso3, f] of Object.entries(payload.byIso3)) {
      expect(f.type, iso3).toBe('Feature')
      expect(f.properties, iso3).toEqual({})
      expect(['Polygon', 'MultiPolygon'], iso3).toContain(f.geometry.type)
    }
  })

  it('rounds once, to two decimals, so the same commit serves the same bytes', () => {
    expect(json).not.toMatch(/\d\.\d{3,}/)
    expect(JSON.stringify(countryShapes())).toBe(json)
  })

  it('declares what it is derived from and how it is regenerated', () => {
    expect(payload._).toContain('countries-110m.json')
    expect(payload._).toContain('crosswalk.json')
    expect(payload._).toContain('shapes.ts')
    expect(payload._).toContain('do not edit')
  })

  it('states its own transfer cost, and stays inside the per-feed ceiling of this globe', () => {
    const gz = gzipSync(Buffer.from(json, 'utf8')).length
    expect(
      gz,
      `the country polygons are ${(gz / 1024).toFixed(1)} KB gzipped; a country layer fetches them once`,
    ).toBeLessThanOrEqual(150 * 1024)
  })
})

// A centroid is a derived point, and the failure this suite guards against is the one where it
// stops being derived: a rounding change, a swapped lon/lat pair, or a topology quietly replaced
// would all move every country mark on the globe without a single test going red.
import { describe, expect, it } from 'vitest'
import { atlasName, centroidOfNumeric, countryGeometries, numericKey } from './geo'

describe('the centroid of a country', () => {
  it('places Germany where the spherical centroid of its polygon is, to three decimals', () => {
    expect(atlasName(276)).toBe('Germany')
    expect(centroidOfNumeric(276)).toEqual([10.27, 51.077])
  })

  it('takes a numeric code however it was typed — "004" and 4 are one country', () => {
    expect(numericKey(4)).toBe('004')
    expect(centroidOfNumeric('276')).toEqual(centroidOfNumeric(276))
  })

  it('answers a country the topology does not draw with null, never with a guess', () => {
    // 1:110m Natural Earth holds no Monaco (492), no Singapore (702), no Vatican (336).
    expect(centroidOfNumeric(492)).toBeNull()
    expect(centroidOfNumeric('999')).toBeNull()
  })

  it('keeps every centroid on the earth, at three decimals', () => {
    const all = countryGeometries()
    expect(all.length).toBeGreaterThan(150)
    for (const country of all) {
      const [lon, lat] = country.centroid
      expect(Math.abs(lon), country.name).toBeLessThanOrEqual(180)
      expect(Math.abs(lat), country.name).toBeLessThanOrEqual(90)
      expect(Number(lon.toFixed(3)), country.name).toBe(lon)
      expect(Number(lat.toFixed(3)), country.name).toBe(lat)
    }
  })

  it('is stable — the same committed topology gives the same points twice', () => {
    expect(countryGeometries()).toEqual(countryGeometries())
  })
})

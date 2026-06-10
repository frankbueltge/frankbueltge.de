import { describe, it, expect } from 'vitest'
import { parseGistempCsv, seriesToRidges, type ClimateSeries } from './climate'

const FIXTURE = `Land-Ocean: Global Means
Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D
1880,-.19,-.25,-.10,-.17,-.10,-.21,-.19,-.11,-.15,-.24,-.22,-.19,-.18
2020,1.0,1.1,1.2,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,***,1.02
`

describe('parseGistempCsv', () => {
  it('parses years and monthly anomalies', () => {
    const s = parseGistempCsv(FIXTURE)
    expect(s.years).toHaveLength(2)
    expect(s.years[0].year).toBe(1880)
    expect(s.years[0].months[0]).toBeCloseTo(-0.19)
    expect(s.years[1].year).toBe(2020)
  })

  it('treats *** as null', () => {
    const s = parseGistempCsv(FIXTURE)
    expect(s.years[1].months[11]).toBeNull() // Dec 2020 is ***
  })
})

describe('seriesToRidges', () => {
  it('normalizes globally and sorts oldest first', () => {
    const series: ClimateSeries = {
      years: [
        { year: 2020, months: Array(12).fill(2) },
        { year: 1880, months: Array(12).fill(0) },
      ],
    }
    const ridges = seriesToRidges(series)
    expect(ridges.map((r) => r.year)).toEqual([1880, 2020])
    expect(ridges[0].heights.every((h) => h === 0)).toBe(true)
    expect(ridges[1].heights.every((h) => h === 1)).toBe(true)
  })

  it('linearly interpolates an interior gap', () => {
    // raw [0, null, 2, 2, ...] → filled [0, 1, 2, ...]; global min 0 / max 2 → height[1] = 0.5
    const series: ClimateSeries = {
      years: [{ year: 2000, months: [0, null, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] }],
    }
    const ridges = seriesToRidges(series)
    expect(ridges[0].heights[1]).toBeCloseTo(0.5)
  })
})

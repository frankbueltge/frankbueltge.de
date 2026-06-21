import { describe, expect, it } from 'vitest'
import { yearAreaPath, yearLinePath } from './chart'

describe('yearLinePath', () => {
  it('mappt Jahr auf x (xMin..xMax → 0..w) und Wert auf y (0 unten, valMax oben)', () => {
    const pts = [
      { year: 1980, value: 0 },
      { year: 2000, value: 50 },
      { year: 2020, value: 100 },
    ]
    const coords = yearLinePath(pts, 1980, 2020, 100, 400, 100)
      .replace('M', '')
      .split(' L')
      .map((s) => s.split(',').map(Number))
    expect(coords[0][0]).toBeCloseTo(0) // 1980 → links
    expect(coords[1][0]).toBeCloseTo(200) // 2000 → Mitte
    expect(coords[2][0]).toBeCloseTo(400) // 2020 → rechts
    expect(coords[0][1]).toBeGreaterThan(coords[2][1]) // Wert 0 unten, 100 oben
  })

  it('leer bei weniger als zwei Punkten oder valMax ≤ 0', () => {
    expect(yearLinePath([{ year: 2000, value: 5 }], 1980, 2020, 100)).toBe('')
    expect(yearLinePath([{ year: 1, value: 1 }, { year: 2, value: 1 }], 1, 2, 0)).toBe('')
  })
})

describe('yearAreaPath', () => {
  it('schließt zur Grundlinie (beginnt mit M, endet mit Z)', () => {
    const a = yearAreaPath([{ year: 1980, value: 10 }, { year: 2020, value: 90 }], 1980, 2020, 100, 400, 100)
    expect(a.startsWith('M')).toBe(true)
    expect(a.endsWith('Z')).toBe(true)
    expect(a).toContain('400.0,100.0') // rechts hinunter zur Grundlinie h=100
  })
})

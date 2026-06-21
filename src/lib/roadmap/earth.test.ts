import { describe, expect, it } from 'vitest'
import data from '../../data/roadmap/earth.json'

describe('earth.json', () => {
  it('hat genau fünf KPIs mit vollständiger Provenienz', () => {
    expect(data.kpis).toHaveLength(5)
    for (const k of data.kpis) {
      expect(k.id).toBeTruthy()
      expect(k.label.de).toBeTruthy()
      expect(k.label.en).toBeTruthy()
      expect(['high', 'low']).toContain(k.good_when)
      expect(k.source.url).toMatch(/^https:\/\//)
      expect(k.source.license).toBeTruthy()
      expect(k.series.length).toBeGreaterThanOrEqual(5)
      // Reihe ist [Jahr, Wert]-Paare, chronologisch aufsteigend
      const years = k.series.map((p) => p[0])
      expect([...years].sort((a, b) => a - b)).toEqual(years)
    }
  })
})

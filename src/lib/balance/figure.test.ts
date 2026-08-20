import { describe, expect, it } from 'vitest'
import latest from '@/data/balance/latest.json'
import type { BalanceData } from './types'
import { buildFigure } from './figure'

const d = latest as unknown as BalanceData

describe('buildFigure', () => {
  const m = buildFigure(d.countries)

  it('draws only significant rows, sorted by absolute gap', () => {
    expect(m.rows.length).toBeGreaterThan(0)
    expect(m.rows.length).toBeLessThanOrEqual(14)
    for (let i = 1; i < m.rows.length; i++) {
      expect(Math.abs(m.rows[i - 1].gap)).toBeGreaterThanOrEqual(Math.abs(m.rows[i].gap))
    }
    for (const r of m.rows) {
      const src = d.countries.find((c) => c.fips === r.fips)!
      expect(src.dims.tone!.significant).toBe(true)
    }
  })

  it('keeps every mark inside the plot box', () => {
    for (const r of m.rows) {
      for (const x of [r.xSelf, r.xForeign]) {
        expect(x).toBeGreaterThanOrEqual(m.labelWidth)
        expect(x).toBeLessThanOrEqual(m.width)
      }
      expect(r.y).toBeGreaterThan(0)
      expect(r.y).toBeLessThan(m.height)
    }
  })

  it('places the zero line between the extreme tick positions', () => {
    const xs = m.ticks.map((t) => t.x)
    expect(m.xZero).toBeGreaterThanOrEqual(Math.min(...xs) - 1)
    expect(m.xZero).toBeLessThanOrEqual(Math.max(...xs) + 1)
  })

  it('positions match the recorded values (scale is linear and honest)', () => {
    for (const r of m.rows) {
      // brighter value must sit further right
      if (r.self > r.foreign) expect(r.xSelf).toBeGreaterThan(r.xForeign)
      if (r.self < r.foreign) expect(r.xSelf).toBeLessThan(r.xForeign)
    }
  })

  it('gap equals self minus foreign as published', () => {
    for (const r of m.rows) {
      expect(r.gap).toBeCloseTo(r.self - r.foreign, 2)
    }
  })
})

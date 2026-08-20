/** Data contract of the committed Balance archive: what the page's claims stand on.
 *  Mirrors the consensus pattern — the file's own components must support every
 *  number the page derives from them. */
import { describe, expect, it } from 'vitest'
import latest from '@/data/balance/latest.json'
import type { BalanceData } from './types'

const d = latest as unknown as BalanceData

describe('balance latest.json contract', () => {
  it('carries the method block the page and method sheet quote', () => {
    expect(d.method.version).toMatch(/^v\d/)
    expect(d.method.min_pool).toBeGreaterThanOrEqual(25)
    expect(d.method.bootstrap.resamples).toBeGreaterThanOrEqual(500)
    expect(Object.keys(d.method.dimensions)).toContain('tone')
  })

  it('never lists a country below the published pool floor', () => {
    for (const c of d.countries) {
      expect(c.n_self, `${c.fips} self pool`).toBeGreaterThanOrEqual(d.method.min_pool)
      expect(c.n_foreign, `${c.fips} foreign pool`).toBeGreaterThanOrEqual(d.method.min_pool)
    }
  })

  it('marks significance exactly as the interval says', () => {
    for (const c of d.countries) {
      for (const [key, dim] of Object.entries(c.dims)) {
        if (!dim) continue
        const [lo, hi] = dim.gap_ci95
        expect(lo, `${c.fips}.${key} CI order`).toBeLessThanOrEqual(hi)
        expect(dim.significant, `${c.fips}.${key} significance`).toBe(lo > 0 || hi < 0)
      }
    }
  })

  it('derives the headline from a listed country with a significant tone gap', () => {
    if (!d.headline) return // a day without a significant gap is a valid day
    const row = d.countries.find((c) => c.fips === d.headline!.fips)
    expect(row).toBeDefined()
    expect(row!.dims.tone?.significant).toBe(true)
    expect(d.headline.gap).toBeCloseTo(d.headline.tone_self - d.headline.tone_foreign, 2)
    expect(['self_brighter', 'world_brighter']).toContain(d.headline.direction)
  })

  it('a failed fetch is a disclosed gap, not a quiet day', () => {
    if (d.stats.slots_fetched === 0) {
      expect(d.countries).toHaveLength(0)
      expect(d.headline).toBeNull()
      expect(d.note).toBeTruthy()
    } else {
      expect(d.stats.articles_scanned).toBeGreaterThan(0)
    }
  })

  it('date and window agree with the archive filename convention', () => {
    expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(d.stats.window).toMatch(/UTC$/)
  })
})

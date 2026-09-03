import { describe, expect, it } from 'vitest'

import { ARC_WINDOW, arcModel } from './arc'
import { seriesStrip } from './terms-view'

/** `n` committed runs, one mention per run unless `at` says otherwise. */
function runs(n: number, at: Record<number, number> = {}) {
  return Array.from({ length: n }, (_, i) => ({
    date: `2026-${String(9 + Math.floor(i / 28)).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    d1: at[i] ?? 1,
  }))
}

describe("a term's arc", () => {
  it('keeps every bar the strip already drew, coordinate for coordinate', () => {
    const points = runs(12)
    const { windows, needs, span, ...strip } = arcModel(points)
    expect(strip).toEqual(seriesStrip(points))
  })

  it('buckets its drawn width by how much archive there is, so a young arc is a small figure', () => {
    // A viewBox scales to its container: two committed runs at full width are two slabs.
    expect(arcModel(runs(2)).span).toBe('short')
    expect(arcModel(runs(12)).span).toBe('mid')
    expect(arcModel(runs(30)).span).toBe('full')
  })

  it('draws no comparison the archive cannot carry, and says how much is missing', () => {
    const model = arcModel(runs(10))
    expect(model.windows).toBeNull()
    expect(model.needs).toBe(ARC_WINDOW.recent + ARC_WINDOW.prior - 10)
  })

  it('draws the two windows the moment the archive is long enough', () => {
    const model = arcModel(runs(28))
    expect(model.needs).toBe(0)
    expect(model.windows!.recent.days).toBe(7)
    expect(model.windows!.prior.days).toBe(21)
  })

  it('puts the recent window last and the prior one immediately before it, never overlapping', () => {
    const model = arcModel(runs(40))
    const { recent, prior } = model.windows!
    expect(prior.x).toBeLessThan(recent.x)
    expect(prior.x + prior.width).toBeLessThanOrEqual(recent.x + 0.001)
    expect(recent.x + recent.width).toBeCloseTo(model.width, 6)
  })

  it('carries the totals the status word is decided on', () => {
    // The last seven runs carry ten mentions each, the twenty-one before them one.
    const at: Record<number, number> = {}
    for (let i = 21; i < 28; i++) at[i] = 10
    const { windows } = arcModel(runs(28, at))
    expect(windows!.recent.total).toBe(70)
    expect(windows!.recent.perDay).toBe(10)
    expect(windows!.prior.total).toBe(21)
    expect(windows!.prior.perDay).toBe(1)
  })

  it('measures only the runs inside a window, ignoring anything older than both', () => {
    const model = arcModel(runs(50, { 0: 999 }))
    expect(model.windows!.prior.total).toBe(21)
  })

  it('stands up to an empty archive', () => {
    const model = arcModel([])
    expect(model.bars).toEqual([])
    expect(model.windows).toBeNull()
    expect(model.needs).toBe(28)
  })

  it('is deterministic', () => {
    expect(JSON.stringify(arcModel(runs(30)))).toBe(JSON.stringify(arcModel(runs(30))))
  })
})

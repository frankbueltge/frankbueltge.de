import { describe, expect, it } from 'vitest'
import { shuffledOrder } from './shelf-order'

/** a seeded generator, so a test can repeat a "random" run exactly */
function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

describe('shuffledOrder', () => {
  it('returns every position exactly once', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const order = shuffledOrder(8, seeded(seed))
      expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    }
  })

  it('handles an empty or a single-card shelf', () => {
    expect(shuffledOrder(0)).toEqual([])
    expect(shuffledOrder(1)).toEqual([0])
    expect(shuffledOrder(-3)).toEqual([])
  })

  it('stays in range when the generator returns its upper edge', () => {
    const order = shuffledOrder(5, () => 0.9999999999)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
  })

  it('puts every card first about equally often', () => {
    const random = seeded(7)
    const firsts = new Array(8).fill(0)
    const runs = 16000
    for (let i = 0; i < runs; i++) firsts[shuffledOrder(8, random)[0]]++
    for (const count of firsts) expect(Math.abs(count - runs / 8)).toBeLessThan(runs / 8 / 5)
  })
})

import { describe, expect, it } from 'vitest'
import { drawPairs, drawSome, pairKey, seeded, shuffle } from './draw'

const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

describe('seeded', () => {
  it('gives the same sequence for the same seed, in [0, 1)', () => {
    const x = seeded(7)
    const y = seeded(7)
    const xs = Array.from({ length: 50 }, () => x())
    expect(xs).toEqual(Array.from({ length: 50 }, () => y()))
    expect(xs.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('drawPairs', () => {
  it('draws k distinct unordered pairs of two different matters', () => {
    const pairs = drawPairs(IDS, 15, seeded(1))
    expect(pairs).toHaveLength(15)
    expect(new Set(pairs.map(([a, b]) => pairKey(a, b))).size).toBe(15)
    expect(pairs.every(([a, b]) => a !== b && IDS.includes(a) && IDS.includes(b))).toBe(true)
  })

  it('refuses to draw more pairs than exist', () => {
    expect(() => drawPairs(['a', 'b', 'c'], 4, seeded(1))).toThrow()
  })

  it('reaches every pair and puts each matter on both sides, over many readings', () => {
    const rand = seeded(42)
    const seen = new Set<string>()
    const left = new Map<string, number>()
    for (let r = 0; r < 400; r++) {
      for (const [a, b] of drawPairs(IDS, 15, rand)) {
        seen.add(pairKey(a, b))
        left.set(a, (left.get(a) ?? 0) + 1)
      }
    }
    expect(seen.size).toBe(45)
    // 400 readings × 15 pairs × 2 seats / 10 matters = 1200 seatings each, about half on the left
    for (const id of IDS) expect(left.get(id)!).toBeGreaterThan(450)
    for (const id of IDS) expect(left.get(id)!).toBeLessThan(750)
  })
})

describe('shuffle and drawSome', () => {
  it('keeps every item exactly once', () => {
    expect(shuffle(IDS, seeded(3)).sort()).toEqual(IDS)
    const some = drawSome(IDS, 3, seeded(3))
    expect(new Set(some).size).toBe(3)
  })
})

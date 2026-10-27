import { describe, expect, it } from 'vitest'
import { seeded } from './draw'
import { fitStrengths, rankMatters, scores, spearman, type Choice } from './rank'

const IDS = ['a', 'b', 'c', 'd']

/** Readings drawn from known strengths, so the fit can be checked against the truth. */
function simulate(truth: Record<string, number>, readings: number, perReading: number, seed: number): Choice[][] {
  const rand = seeded(seed)
  const ids = Object.keys(truth)
  return Array.from({ length: readings }, () =>
    Array.from({ length: perReading }, () => {
      const i = Math.floor(rand() * ids.length)
      let j = Math.floor(rand() * (ids.length - 1))
      if (j >= i) j++
      const a = ids[i]!
      const b = ids[j]!
      const pa = truth[a]! / (truth[a]! + truth[b]!)
      return rand() < pa ? { winner: a, loser: b } : { winner: b, loser: a }
    }),
  )
}

describe('fitStrengths', () => {
  it('gives every matter the reference strength when nothing was chosen', () => {
    for (const p of fitStrengths(IDS, []).values()) expect(p).toBeCloseTo(1, 9)
  })

  it('keeps a matter that never won above zero', () => {
    const choices: Choice[] = Array.from({ length: 20 }, () => ({ winner: 'a', loser: 'b' }))
    const p = fitStrengths(IDS, choices)
    expect(p.get('b')!).toBeGreaterThan(0)
    expect(p.get('a')!).toBeGreaterThan(p.get('c')!)
    expect(p.get('c')!).toBeGreaterThan(p.get('b')!)
  })

  it('recovers the order of known strengths from enough readings', () => {
    const truth = { a: 4, b: 2, c: 1, d: 0.5 }
    const p = fitStrengths(IDS, simulate(truth, 300, 6, 9).flat())
    const order = [...p.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id)
    expect(order).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('ties', () => {
  it('reads "equally urgent" as half a win each, so two matters only ever tied stay level', () => {
    const p = fitStrengths(IDS, Array.from({ length: 10 }, () => ({ winner: 'a', loser: 'b', tie: true })))
    expect(p.get('a')!).toBeCloseTo(p.get('b')!, 9)
  })

  it('counts ties apart from wins', () => {
    const rows = rankMatters(IDS, [[{ winner: 'a', loser: 'b', tie: true }, { winner: 'a', loser: 'c' }]], { resamples: 10 })
    expect(rows.find((r) => r.id === 'a')).toMatchObject({ appearances: 2, wins: 1, ties: 1 })
    expect(rows.find((r) => r.id === 'b')).toMatchObject({ appearances: 1, wins: 0, ties: 1 })
  })
})

describe('scores', () => {
  it('is 50 for everyone when all are equal, and averages to 50 otherwise', () => {
    expect([...scores(new Map(IDS.map((id) => [id, 1]))).values()]).toEqual([50, 50, 50, 50])
    const s = [...scores(new Map([['a', 4], ['b', 1], ['c', 0.25]])).values()]
    expect(s.reduce((x, y) => x + y, 0) / s.length).toBeCloseTo(50, 9)
  })
})

describe('rankMatters', () => {
  it('lists every matter at 50 with a point interval before any reading', () => {
    const rows = rankMatters(IDS, [])
    expect(rows.map((r) => [r.score, r.low, r.high])).toEqual(IDS.map(() => [50, 50, 50]))
  })

  it('puts the strongest first, with an interval around each score, the same on every run', () => {
    const readings = simulate({ a: 4, b: 2, c: 1, d: 0.5 }, 120, 6, 5)
    const rows = rankMatters(IDS, readings, { resamples: 150 })
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd'])
    for (const r of rows) expect(r.low <= r.score && r.score <= r.high).toBe(true)
    expect(rankMatters(IDS, readings, { resamples: 150 })).toEqual(rows)
  })

  it('narrows the interval as readings accumulate', () => {
    const truth = { a: 3, b: 1, c: 1, d: 1 }
    const width = (n: number) => {
      const a = rankMatters(IDS, simulate(truth, n, 6, 11), { resamples: 150 }).find((r) => r.id === 'a')!
      return a.high - a.low
    }
    expect(width(200)).toBeLessThan(width(15))
  })

  it('counts appearances and wins from the decided choices', () => {
    const rows = rankMatters(IDS, [[{ winner: 'a', loser: 'b' }, { winner: 'c', loser: 'a' }]], { resamples: 10 })
    const a = rows.find((r) => r.id === 'a')!
    expect([a.appearances, a.wins, a.ties]).toEqual([2, 1, 0])
  })
})

describe('spearman', () => {
  it('is 1 for the same order, -1 for the reverse, null when too short', () => {
    expect(spearman([1, 2, 3, 4], [10, 20, 30, 40])).toBeCloseTo(1, 9)
    expect(spearman([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 9)
    expect(spearman([1, 2], [1, 2])).toBeNull()
  })

  it('handles ties with average ranks', () => {
    expect(spearman([1, 1, 2, 3], [0, 0, 5, 9])).toBeCloseTo(1, 9)
  })
})

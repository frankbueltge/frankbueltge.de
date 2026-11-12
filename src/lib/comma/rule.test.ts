import { describe, expect, it } from 'vitest'

import windowFixture from './fixtures/window-2026-11-12T193805Z.json'
import aggregationFixture from './fixtures/aggregation-2026-11-11.json'
import type { State, Test } from './ooni'
import { askingLevel, balance, commaSeconds, GAP_SECONDS, prune, ruleOf, weightOf } from './rule'

const STATE: Record<string, State> = { c: 'confirmed', a: 'anomaly', f: 'failure', o: 'open' }
const start = Date.parse(windowFixture.start)
const tests: Test[] = (windowFixture.rows as [number, string, string][]).map(([s, cc, st]) => ({
  at: start + s * 1000,
  cc,
  state: STATE[st]!,
  url: '',
}))
const aggregation = {
  result: (aggregationFixture.rows as [string, number, number, number][]).map(([cc, n, a, c]) => ({
    probe_cc: cc,
    measurement_count: n,
    anomaly_count: a,
    confirmed_count: c,
  })),
}

describe('the suspicion rule, read from the day before', () => {
  const rule = ruleOf(aggregation)!

  it('takes the median over the countries tested at least 500 times (2026-11-11: 3.70 %)', () => {
    expect(rule.median).toBeCloseTo(0.037, 3)
  })

  it('gives the weights the second sketch was heard with', () => {
    const w = (cc: string) => Math.round(weightOf(rule, cc) * 100) / 100
    expect([w('US'), w('GB'), w('DE'), w('CA'), w('NL')]).toEqual([0, 0, 0.06, 0.12, 0.13])
    expect([w('RU'), w('CN'), w('IR')]).toEqual([1, 1, 1])
    expect([w('TR'), w('BY'), w('VE'), w('EG'), w('SA'), w('CU'), w('MM')]).toEqual([0.51, 0.53, 0.64, 0.65, 0.7, 0.69, 0.85])
  })

  it('gives no weight to a country tested fewer than 100 times, or not at all', () => {
    expect(weightOf(rule, 'KP')).toBe(0)
    expect(weightOf(rule, 'TM')).toBe(0)
  })

  it('refuses a day it cannot read', () => {
    expect(ruleOf(null)).toBeNull()
    expect(ruleOf({ result: [] })).toBeNull()
    expect(ruleOf({ result: [{ probe_cc: 'XX', measurement_count: 10, anomaly_count: 1, confirmed_count: 0 }] })).toBeNull()
  })
})

describe('one country, the same chances', () => {
  const rule = ruleOf(aggregation)!

  it('reproduces what the second sketch sounded on the window Frank heard', () => {
    expect(tests).toHaveLength(1781)
    const sounded = balance(tests, rule)
    const by = (cc: string, state?: string) => sounded.filter((s) => s.cc === cc && (!state || s.state === state)).length
    expect(sounded).toHaveLength(51)
    expect(by('RU')).toBe(10)
    expect(by('RU', 'confirmed')).toBe(9)
    expect(by('IR')).toBe(5)
    expect(by('VE')).toBe(7)
    // without the limit Russia would have sounded 103 times: 28 blockpages and 75 heard anomalies
    expect(tests.filter((t) => t.cc === 'RU' && t.state === 'confirmed')).toHaveLength(28)
  })

  it('never sounds one country twice within the gap, across minutes too', () => {
    const memory = new Map<string, number[]>()
    const first = balance(tests.slice(0, 900), rule, memory)
    const second = balance(tests.slice(900), rule, memory)
    const all = [...first, ...second]
    for (const cc of new Set(all.map((s) => s.cc))) {
      const times = all.filter((s) => s.cc === cc).map((s) => s.at).sort((a, b) => a - b)
      for (let i = 1; i < times.length; i++) expect(times[i]! - times[i - 1]!).toBeGreaterThanOrEqual(GAP_SECONDS * 1000)
    }
  })

  it('lets a blockpage take the place before an anomaly of the same country', () => {
    const t0 = 1_000_000
    const sounded = balance(
      [
        { at: t0, cc: 'RU', state: 'anomaly', url: '' },
        { at: t0 + 3000, cc: 'RU', state: 'confirmed', url: '' },
      ],
      rule,
    )
    expect(sounded.map((s) => s.state)).toEqual(['confirmed'])
  })

  it('keeps silent the anomalies of a country without weight', () => {
    expect(balance([{ at: 0, cc: 'US', state: 'anomaly', url: '' }], rule)).toEqual([])
  })

  it('forgets what the gap can no longer reach', () => {
    const memory = new Map([['RU', [0, 5000]], ['IR', [100_000]]])
    prune(memory, 20_000)
    expect(memory.get('RU')).toEqual([5000])
    prune(memory, 200_000)
    expect(memory.has('RU')).toBe(false)
  })
})

describe('the tones', () => {
  it('lets covert interference last longer: 1.6 s plus as much again at full weight', () => {
    expect(commaSeconds(0)).toBeCloseTo(1.6)
    expect(commaSeconds(1)).toBeCloseTo(3.2)
    expect(commaSeconds(7)).toBeCloseTo(3.2)
  })

  it('counts the asking of the last five seconds on a log scale', () => {
    expect(askingLevel([], 10_000)).toBe(0)
    const sixty = Array.from({ length: 60 }, (_, i) => 6000 + i * 50)
    expect(askingLevel(sixty, 10_000)).toBeCloseTo(1)
    expect(askingLevel([1000, 9000], 10_000)).toBeCloseTo(Math.log2(2) / Math.log2(61))
    expect(askingLevel([9000, 11_000], 10_000)).toBeCloseTo(Math.log2(2) / Math.log2(61))
  })
})

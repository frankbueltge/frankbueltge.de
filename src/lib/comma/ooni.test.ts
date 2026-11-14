import { describe, expect, it } from 'vitest'

import { COMMA, GROUPS, groupOf, hzOf, OTHER } from './groups'
import { hostOf, stateOf, testsOf, timeOf } from './ooni'

describe('the state of a test', () => {
  it('takes the strongest that applies: blockpage, anomaly, failure, open', () => {
    expect(stateOf({ confirmed: true, anomaly: true, failure: true })).toBe('confirmed')
    expect(stateOf({ anomaly: true, failure: true })).toBe('anomaly')
    expect(stateOf({ failure: true })).toBe('failure')
    expect(stateOf({})).toBe('open')
  })
})

describe('a minute of OONI rows', () => {
  const json = {
    results: [
      { measurement_start_time: '2026-11-12T19:38:05.000000Z', probe_cc: 'RU', test_name: 'web_connectivity', input: 'https://www.dw.com/ru/', confirmed: true, anomaly: true },
      { measurement_start_time: '2026-11-12T19:38:04.000000Z', probe_cc: 'DE', test_name: 'web_connectivity', input: 'https://example.org/' },
      { measurement_start_time: '2026-11-12T19:39:05.000000Z', probe_cc: 'IR', test_name: 'web_connectivity', input: 'https://example.org/' },
      { measurement_start_time: 'yesterday', probe_cc: 'FR', test_name: 'web_connectivity' },
      { measurement_start_time: '2026-11-12T19:38:30.000000Z', probe_cc: 'nope', test_name: 'web_connectivity' },
      { measurement_start_time: '2026-11-12T19:38:31.000000Z', probe_cc: 'IR', test_name: 'Not A Test', anomaly: true },
      { measurement_start_time: '2026-11-12T19:38:32.000000Z', probe_cc: 'IR', anomaly: true },
      { measurement_start_time: '2026-11-12T19:38:10.000000Z', probe_cc: 'IR', test_name: 'signal', anomaly: true },
    ],
  }
  const from = Date.parse('2026-11-12T19:38:05Z')

  it('keeps only well-formed rows inside [from, to), sorted', () => {
    const tests = testsOf(json, from, from + 60_000)
    expect(tests.map((t) => [t.cc, t.state])).toEqual([
      ['RU', 'confirmed'],
      ['IR', 'anomaly'],
    ])
    expect(tests[0]!.url).toBe('https://www.dw.com/ru/')
    expect(tests[1]!.url).toBe('')
    expect(tests.map((t) => t.test)).toEqual(['web_connectivity', 'signal'])
  })

  it('reads six fractional digits by ignoring them', () => {
    expect(timeOf('2026-11-12T19:38:05.123456Z')).toBe(from)
    expect(timeOf(null)).toBeNull()
  })

  it('answers nothing, not an error, for a response it does not know', () => {
    expect(testsOf(null, 0, 1)).toEqual([])
    expect(testsOf({ standby: 'rate-limit' }, 0, 1)).toEqual([])
  })

  it('names an outlet by its host', () => {
    expect(hostOf('https://www.bbc.com/news')).toBe('bbc.com')
    expect(hostOf('not a url')).toBe('')
  })
})

describe('the six kinds of page', () => {
  it('sound on the harmonics 4, 5, 6, 7, 9 and 11 of A at 55 Hz', () => {
    expect(GROUPS.map((_, i) => hzOf(i))).toEqual([220, 275, 330, 385, 495, 605])
  })

  it('keep porn and gambling apart from political speech', () => {
    expect(GROUPS[groupOf('NEWS')]!.id).toBe('politics')
    expect(GROUPS[groupOf('LGBT')]!.id).toBe('identity')
    expect(GROUPS[groupOf('ANON')]!.id).toBe('tools')
    expect(GROUPS[groupOf('PORN')]!.id).toBe('porn')
    expect(GROUPS[groupOf('GMB')]!.id).toBe('porn')
  })

  it('send every unnamed or unknown category to the last group', () => {
    expect(groupOf(null)).toBe(OTHER)
    expect(groupOf('SOMETHING-NEW')).toBe(OTHER)
    expect(groupOf('news')).toBe(0)
  })

  it('hear suspicion a syntonic comma lower', () => {
    expect(COMMA).toBeCloseTo(80 / 81, 12)
    expect(1200 * Math.log2(1 / COMMA)).toBeCloseTo(21.506, 2)
  })

  it('every category appears in one group only', () => {
    const all = GROUPS.flatMap((g) => g.categories)
    expect(new Set(all).size).toBe(all.length)
  })
})

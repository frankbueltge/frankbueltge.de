import { describe, expect, it } from 'vitest'

import windowFixture from './fixtures/window-2026-11-12T193805Z.json'
import aggregationFixture from './fixtures/aggregation-2026-11-11.json'
import dayJson from '@/data/comma/day.json'

import { GROUPS } from './groups'
import type { State } from './ooni'
import { ASK_FULL, balance, commaSeconds, dayOf, GAP_SECONDS, prune, ruleOf, ruleOfDay, ruleOfVoice, tideLevel, tideOf, voiceCountriesOf, voiceLevel, voiceTideOf, weightOf, type Heard } from './rule'
import { VOICE_FULL_SHARE, VOICE_GAP_SECONDS, VOICE_SILENT_SHARE, VOICES } from './voices'

const STATE: Record<string, State> = { c: 'confirmed', a: 'anomaly', f: 'failure', o: 'open' }
const start = Date.parse(windowFixture.start)
const tests: Heard[] = (windowFixture.rows as [number, string, string][]).map(([s, cc, st]) => ({
  at: start + s * 1000,
  cc,
  state: STATE[st]!,
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
        { at: t0, cc: 'RU', state: 'anomaly' },
        { at: t0 + 3000, cc: 'RU', state: 'confirmed' },
      ],
      rule,
    )
    expect(sounded.map((s) => s.state)).toEqual(['confirmed'])
  })

  it('keeps silent the anomalies of a country without weight', () => {
    expect(balance([{ at: 0, cc: 'US', state: 'anomaly' }], rule)).toEqual([])
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

  it('passes on whatever came with a test, and adds its country’s weight', () => {
    const rule = ruleOf(aggregation)!
    const [one] = balance([{ at: 0, cc: 'RU', state: 'confirmed', uid: 'x', group: 2 }], rule)
    expect(one).toEqual({ at: 0, cc: 'RU', state: 'confirmed', uid: 'x', group: 2, weight: 1 })
  })
})

describe('the committed day', () => {
  const day = dayOf(dayJson)

  it('is a whole day of counts: countries, and 24 hours of the six kinds of page', () => {
    expect(day).not.toBeNull()
    expect(day!.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(day!.countries.length).toBeGreaterThan(100)
    expect(day!.tide).toHaveLength(24)
    expect(day!.tide.every((hour) => hour.length === GROUPS.length && hour.reduce((a, b) => a + b, 0) > 10_000)).toBe(true)
  })

  it('makes a rule in which the heavily deviating countries carry weight and the open ones none', () => {
    const rule = ruleOfDay(day)
    expect(rule).not.toBeNull()
    expect(rule!.median).toBeGreaterThan(0.01)
    expect(rule!.median).toBeLessThan(0.15)
    expect(weightOf(rule, 'RU')).toBeGreaterThan(0.5)
    expect(weightOf(rule, 'IR')).toBeGreaterThan(0.5)
    expect(weightOf(rule, 'US')).toBeLessThan(0.25)
  })

  it('refuses a file that is not a day of counts', () => {
    expect(dayOf(null)).toBeNull()
    const tide = Array.from({ length: 24 }, () => [1, 1, 1, 1, 1, 1])
    const good = { v: 2, day: '2026-11-12', countries: [['RU', 1, 0, 0]], tide, voices: [] }
    expect(dayOf(good)).not.toBeNull()
    expect(dayOf({ ...good, v: 1 })).toBeNull()
    expect(dayOf({ ...good, day: 'yesterday' })).toBeNull()
    expect(dayOf({ ...good, tide: tide.slice(1) })).toBeNull()
    expect(dayOf({ ...good, countries: [['russia', 1, 0, 0]] })).toBeNull()
    expect(dayOf({ ...good, voices: undefined })).toBeNull()
    expect(dayOf({ ...good, voices: [{ id: 'talk', countries: [], tide: [1, 2, 3] }] })).toBeNull()
    expect(dayOf({ ...good, voices: [{ id: 'Not An Id', countries: [], tide: Array.from({ length: 24 }, () => 1) }] })).toBeNull()
    expect(ruleOfDay(null)).toBeNull()
  })

  it('folds OONI’s count by hour and category into the six kinds, and refuses a day with a missing hour', () => {
    const rows = Array.from({ length: 24 }, (_, hour) => [
      { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, category_code: 'NEWS', measurement_count: 100 },
      { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, category_code: 'POLR', measurement_count: 20 },
      { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, category_code: 'PORN', measurement_count: 7 },
      { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, category_code: 'NEVER-SEEN', measurement_count: 3 },
    ]).flat()
    const tide = tideOf({ result: rows }, '2026-11-12')!
    expect(tide).toHaveLength(24)
    expect(tide[0]).toEqual([120, 0, 0, 0, 7, 3])
    expect(tideOf({ result: rows.slice(4) }, '2026-11-12')).toBeNull()
    expect(tideOf({ result: rows }, '2026-11-13')).toBeNull()
    expect(tideOf(null, '2026-11-12')).toBeNull()
  })

  it('sets a tone’s loudness from its kind’s tests in this hour, on the scale the live count had', () => {
    const tide = Array.from({ length: 24 }, (_, hour) => [hour === 7 ? ASK_FULL * 720 : 720, 0, 0, 0, 0, 0])
    const made = dayOf({ v: 2, day: '2026-11-12', countries: [['RU', 1000, 100, 10]], tide, voices: [] })!
    const at = (hour: number) => Date.parse(`2026-11-14T${String(hour).padStart(2, '0')}:30:00Z`)
    // 720 tests an hour are one every five seconds
    expect(tideLevel(made, 0, at(3))).toBeCloseTo(Math.log2(2) / Math.log2(1 + ASK_FULL))
    expect(tideLevel(made, 0, at(7))).toBeCloseTo(1)
    expect(tideLevel(made, 1, at(7))).toBe(0)
    expect(tideLevel(null, 0, at(7))).toBe(0)
  })
})

describe('the deeper voices', () => {
  const day = dayOf(dayJson)

  it('are counted for the committed day: both voices, by country and by hour', () => {
    expect(day!.voices.map((v) => v.id)).toEqual(VOICES.map((v) => v.id))
    for (const voice of day!.voices) {
      expect(voice.countries.length).toBeGreaterThan(50)
      expect(voice.tide).toHaveLength(24)
      expect(voice.tide.reduce((a, b) => a + b, 0)).toBeGreaterThan(5000)
    }
  })

  it('weigh a country by the share of its own tests that failed: silent to a tenth, full from a half', () => {
    const made = dayOf({
      v: 2,
      day: '2026-11-12',
      countries: [['RU', 1000, 100, 10]],
      tide: Array.from({ length: 24 }, () => [1, 1, 1, 1, 1, 1]),
      voices: [
        {
          id: 'talk',
          countries: [
            ['AA', 1000, 50],
            ['BB', 1000, 100],
            ['CC', 1000, 300],
            ['DD', 1000, 500],
            ['EE', 1000, 990],
            ['FF', 99, 99],
          ],
          tide: Array.from({ length: 24 }, (_, hour) => (hour === 7 ? ASK_FULL * 720 : 720)),
        },
      ],
    })!
    const rule = ruleOfVoice(made, 'talk', VOICE_SILENT_SHARE, VOICE_FULL_SHARE)!
    const w = (cc: string) => Math.round(weightOf(rule, cc) * 100) / 100
    expect([w('AA'), w('BB'), w('CC'), w('DD'), w('EE')]).toEqual([0, 0, 0.5, 1, 1])
    // 99 tests are too few to judge, however many of them failed
    expect(w('FF')).toBe(0)
    expect(w('ZZ')).toBe(0)
    expect(ruleOfVoice(made, 'around', VOICE_SILENT_SHARE, VOICE_FULL_SHARE)).toBeNull()
    expect(ruleOfVoice(null, 'talk', VOICE_SILENT_SHARE, VOICE_FULL_SHARE)).toBeNull()
    // the loudness of its tone: the same scale as the pages' tones
    const at = (hour: number) => Date.parse(`2026-11-14T${String(hour).padStart(2, '0')}:30:00Z`)
    expect(voiceLevel(made, 'talk', at(3))).toBeCloseTo(Math.log2(2) / Math.log2(1 + ASK_FULL))
    expect(voiceLevel(made, 'talk', at(7))).toBeCloseTo(1)
    expect(voiceLevel(made, 'around', at(7))).toBe(0)
  })

  it('on the committed day, are heard where messengers and tools are known to be blocked, and not where they work', () => {
    const talk = ruleOfVoice(day, 'talk', VOICE_SILENT_SHARE, VOICE_FULL_SHARE)!
    const around = ruleOfVoice(day, 'around', VOICE_SILENT_SHARE, VOICE_FULL_SHARE)!
    expect(weightOf(talk, 'RU')).toBeGreaterThan(0.5)
    expect(weightOf(talk, 'IR')).toBeGreaterThan(0.5)
    expect(weightOf(around, 'RU')).toBeGreaterThan(0.5)
    for (const open of ['DE', 'US', 'GB', 'FR', 'NL']) {
      expect(weightOf(talk, open), `messengers in ${open}`).toBeLessThan(0.25)
      expect(weightOf(around, open), `ways around in ${open}`).toBeLessThan(0.25)
    }
    expect(talk.median).toBeLessThan(VOICE_SILENT_SHARE)
    expect(around.median).toBeLessThan(VOICE_SILENT_SHARE)
  })

  it('fold OONI’s counts by test into a voice', () => {
    const names = Object.keys(VOICES[0]!.tests)
    const byCountry = {
      result: [
        { probe_cc: 'IR', test_name: 'signal', measurement_count: 60, anomaly_count: 50 },
        { probe_cc: 'IR', test_name: 'whatsapp', measurement_count: 40, anomaly_count: 30 },
        { probe_cc: 'IR', test_name: 'web_connectivity', measurement_count: 9000, anomaly_count: 900 },
        { probe_cc: 'DE', test_name: 'telegram', measurement_count: 10, anomaly_count: 0 },
        { probe_cc: 'nope', test_name: 'signal', measurement_count: 10, anomaly_count: 10 },
      ],
    }
    expect(voiceCountriesOf(byCountry, names)).toEqual([
      ['DE', 10, 0],
      ['IR', 100, 80],
    ])
    const byHour = {
      result: Array.from({ length: 24 }, (_, hour) => [
        { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, test_name: 'signal', measurement_count: 5 },
        { measurement_start_day: `2026-11-12T${String(hour).padStart(2, '0')}:00:00Z`, test_name: 'tor', measurement_count: 2 },
      ]).flat(),
    }
    expect(voiceTideOf(byHour, '2026-11-12', names)).toEqual(Array.from({ length: 24 }, () => 5))
    expect(voiceTideOf({ result: byHour.result.slice(2) }, '2026-11-12', names)).toBeNull()
    expect(voiceTideOf(null, '2026-11-12', names)).toBeNull()
  })

  it('let a country sound once in five minutes, where the pages let it sound every eight seconds', () => {
    const rule = { median: 0.01, weights: new Map([['RU', 1], ['IR', 1]]) }
    const items = Array.from({ length: 40 }, (_, i) => ({ at: i * 10_000, cc: i % 4 === 0 ? 'IR' : 'RU', state: 'anomaly' }))
    const memory = new Map<string, number[]>()
    const sounded = balance(items, rule, memory, VOICE_GAP_SECONDS)
    // 400 seconds of tests: each country twice, 300 seconds apart
    expect(sounded.map((s) => [s.cc, s.at])).toEqual([
      ['IR', 0],
      ['RU', 10_000],
      ['RU', 310_000],
      ['IR', 320_000],
    ])
    expect(balance(items, rule).length).toBeGreaterThan(30)
  })
})

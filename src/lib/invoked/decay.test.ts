import { describe, expect, it } from 'vitest'
import registerJson from '@/data/invoked/register.json'
import type { InvokedData } from './types'
import { argumentHolds, decayArithmetic, lawReading, lawStates, REREAD_AFTER_YEARS, type InvokedRegister } from './decay'

// ——— synthetic register and days ——————————————————————————————————————————————————

const REGISTER: InvokedRegister = {
  founded: '2026-09-14',
  rule: 'test',
  founding_window: ['2026-09-11', '2026-09-13'],
  selection_effect: 'test',
  events: [
    { date: '2001-09-11', founding_mentions: 300 }, // 100 per day in the founding window
    { date: '1881-02-02', founding_mentions: 6 }, //    2 per day
  ],
}

const day = (date: string, mentions: Record<string, number> | null, failed = false): InvokedData =>
  ({
    date,
    stats: { slots_fetched: failed ? 0 : 96, max_year_observed: failed ? 0 : 2014 },
    tracked_events: mentions
      ? {
          founded: REGISTER.founded,
          founding_day_excluded: date === REGISTER.founded,
          events: Object.entries(mentions).map(([d, n]) => ({ date: d, mentions: n, age_years: 2026 - Number(d.slice(0, 4)) })),
        }
      : null,
  }) as unknown as InvokedData

const files = (...days: InvokedData[]) =>
  Object.fromEntries(days.map((d) => [`/src/data/invoked/${d.date}.json`, { default: d }]))

const a = decayArithmetic(
  REGISTER,
  files(
    day('2026-09-13', null), // before founding: no register yet
    day('2026-09-14', { '2001-09-11': 900, '1881-02-02': 9 }), // the founding day: excluded
    day('2026-09-15', { '2001-09-11': 40, '1881-02-02': 0 }),
    day('2026-09-16', null, true), // failed: not an observation
    day('2026-09-17', { '2001-09-11': 20 }), // carries only one event: not an observation of the other
    day('2026-09-18', { '2001-09-11': 0, '1881-02-02': 3 }),
  ),
)
const sept11 = a.events.find((e) => e.date === '2001-09-11')!
const old = a.events.find((e) => e.date === '1881-02-02')!

describe('decayArithmetic — what the register series actually holds', () => {
  it('ages the events by the pipeline’s own rule, as of the newest record', () => {
    expect(sept11.age).toBe(25)
    expect(old.age).toBe(145)
    expect([a.minAge, a.maxAge]).toEqual([25, 145])
  })

  it('observes only measured days after founding — the founding day and failed days are not observations', () => {
    expect(a.observedDays).toBe(3)
    expect(sept11.observedDays).toBe(3)
    // 2026-09-17 does not carry 1881-02-02: absent from the record is not a zero
    expect(old.observedDays).toBe(2)
  })

  it('measures the span in calendar days and the shift in years', () => {
    expect(a.spanDays).toBe(4)
    expect(a.ageShiftYears).toBeCloseTo(4 / 365.25, 6)
    expect(a.foundingDays).toBe(3)
  })

  it('compares each event with the rate of the window that selected it', () => {
    expect(sept11.foundingPerDay).toBe(100)
    expect(sept11.sincePerDay).toBe(20)
    expect(old.foundingPerDay).toBe(2)
    expect(old.sincePerDay).toBe(1.5)
    expect(a.belowFoundingRate).toBe(2)
  })

  it('counts silence and finds the burst', () => {
    expect(sept11.silentDays).toBe(1)
    expect(old.silentDays).toBe(1)
    expect(a.mostlySilent).toBe(0)
    expect(sept11.busiest).toEqual({ date: '2026-09-15', mentions: 40 })
    expect(a.burst).toEqual({ event: '2001-09-11', date: '2026-09-15', mentions: 40, silentDays: 1, observedDays: 3 })
  })

  it('names the youngest age the source can show at all', () => {
    expect(a.ceiling).toBe(2014)
    expect(a.youngestInvocableAge).toBe(12)
  })
})

describe('lawReading — the old promise is named as withdrawn, never repeated', () => {
  it('reads the new state', () => {
    expect(lawReading({ status: 'not_built', reason: 'r', since: '2026-10-17' })).toEqual({
      kind: 'not_built',
      reason: 'r',
      since: '2026-10-17',
    })
  })

  it('reads a record written before the withdrawal as withdrawn, keeping its date only to name it', () => {
    expect(lawReading({ status: 'pending', reason: 'r', first_possible: '2026-10-14', valid_days_so_far: 30 })).toEqual({
      kind: 'withdrawn',
      reason: 'r',
      firstPossible: '2026-10-14',
    })
    expect(lawReading({ status: 'pending', reason: 'r' })).toMatchObject({ kind: 'withdrawn', firstPossible: null })
  })

  it('passes an unknown state through untouched', () => {
    expect(lawReading({ status: 'something else', reason: 'r' })).toEqual({ kind: 'other', status: 'something else', reason: 'r' })
  })

  it('finds where the archive changes state, off the files themselves', () => {
    const rec = (date: string, status: string) => ({ default: { date, law_test: { status, reason: 'r' } } })
    expect(
      lawStates({
        'a/2026-10-16.json': rec('2026-10-16', 'pending'),
        'a/2026-10-17.json': rec('2026-10-17', 'pending'),
        'a/2026-10-18.json': rec('2026-10-18', 'not_built'),
        'a/2026-10-19.json': rec('2026-10-19', 'not_built'),
      }),
    ).toEqual({ lastPending: '2026-10-17', firstNotBuilt: '2026-10-18' })
    expect(lawStates({ 'a/2026-10-16.json': rec('2026-10-16', 'pending') })).toEqual({
      lastPending: '2026-10-16',
      firstNotBuilt: null,
    })
  })
})

// ——— the committed register and archive ——————————————————————————————————————————

const archive = import.meta.glob('/src/data/invoked/2*.json', { eager: true, import: 'default' })
const real = decayArithmetic(registerJson as InvokedRegister, archive)

describe('the committed register', () => {
  it('follows every frozen event, and observes each on every measured day since founding', () => {
    expect(real.events.map((e) => e.date)).toEqual((registerJson as InvokedRegister).events.map((e) => e.date))
    for (const e of real.events) {
      expect(e.observedDays).toBe(real.observedDays)
      expect(e.silentDays).toBeLessThanOrEqual(e.observedDays)
      expect(e.age).toBeGreaterThanOrEqual(real.youngestInvocableAge!)
    }
    expect(real.observedDays).toBeLessThanOrEqual(real.spanDays)
  })

  it('agrees with the age each day file printed for its events', () => {
    const latest = Object.entries(archive)
      .filter(([p]) => /\d{4}-\d{2}-\d{2}\.json$/.test(p))
      .sort(([p], [q]) => p.localeCompare(q))
      .map(([, v]) => v as InvokedData)
      .reverse()
      .find((d) => d.tracked_events)!
    for (const e of latest.tracked_events!.events) {
      expect(real.events.find((x) => x.date === e.date)!.age).toBe(e.age_years)
    }
  })

  // The page argues that the series is far too short to move the events' ages: "a fraction of a
  // year" against ages of decades. That argument is written for a series shorter than a year, and
  // past it the page says so itself (argumentHolds). This used to fail on purpose once the real
  // series passed a year; it no longer does, because deploy-cf.yml and every practice integrate run
  // this suite, and a test that broke on the archive growing would freeze the site on that night.
  it('says when its own argument is due to be re-read, and never breaks the build over it', () => {
    expect(argumentHolds({ ageShiftYears: 0.09 })).toBe(true)
    expect(argumentHolds({ ageShiftYears: REREAD_AFTER_YEARS - 0.001 })).toBe(true)
    expect(argumentHolds({ ageShiftYears: REREAD_AFTER_YEARS })).toBe(false)
    expect(argumentHolds({ ageShiftYears: 1.6 })).toBe(false)
    // whatever the archive holds tonight, the page has a sentence for it
    expect(typeof argumentHolds(real)).toBe('boolean')
  })
})

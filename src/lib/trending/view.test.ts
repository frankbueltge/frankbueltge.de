import { describe, expect, it } from 'vitest'
import { audienceDimensionRows, audienceHasUmami, audienceMissingDimensions, audienceStrip, audienceTableRows, convergingRows, sourceColumns } from './view'
import { dimensionlessAudience, fixtureAudience, fixtureDay, legacyAudience, standbyAudience } from './fixtures'
import { AUDIENCE_CLASSES } from './types'

describe('converging rows', () => {
  it('keeps only topics on two or more platforms, in file order', () => {
    const rows = convergingRows(fixtureDay())
    expect(rows.map((r) => r.id)).toEqual(['usps-mail-ballots'])
    expect(rows[0].platformsText).toBe('Bluesky · Google Trends')
    expect(rows[0].signalsText).toBe('Google Trends US 2,000+ searches · Bluesky 2,779 posts')
    expect(rows[0].url).toBe('https://bsky.app/profile/x/feed/a')
  })

  it('links a topic to its Wikipedia article when the file names one', () => {
    const day = fixtureDay()
    day.topics[1].platform_count = 2
    const rows = convergingRows(day)
    expect(rows[1].url).toBe('https://en.wikipedia.org/wiki/Mickey_Gasper')
  })

  it('caps the list', () => {
    const day = fixtureDay()
    day.topics = Array.from({ length: 50 }, (_, i) => ({ ...day.topics[0], id: `t${i}`, label: `t${i}` }))
    expect(convergingRows(day, 40)).toHaveLength(40)
  })
})

describe('source columns', () => {
  it('follows the file order and carries the status of a failed source', () => {
    const cols = sourceColumns(fixtureDay(), 15)
    expect(cols.map((c) => c.id)).toEqual(['google_trends', 'bluesky', 'reddit'])
    expect(cols[2].status).toBe('unavailable')
    expect(cols[2].note).toBe('HTTP 403')
    expect(cols[2].signals).toEqual([])
    expect(cols[0].signals[0].magnitudeText).toBe('2,000+')
  })
})

describe('audience strip', () => {
  it('stacks every class in order and sums to the day total', () => {
    const m = audienceStrip([fixtureAudience()], 30)
    expect(m.bars).toHaveLength(1)
    const bar = m.bars[0]
    expect(bar.total).toBe(120)
    expect(bar.segments.map((s) => s.cls)).toEqual([...AUDIENCE_CLASSES])
    const height = bar.segments.reduce((acc, s) => acc + s.h, 0)
    expect(height).toBeCloseTo(m.height, 6)
    expect(m.max).toBe(120)
    expect(m.totals.browser).toBe(50)
  })

  it('draws an unavailable day hollow, oldest on the left, and caps the window', () => {
    const days = [fixtureAudience({ day: '2026-09-02' }), standbyAudience('2026-09-01')]
    const m = audienceStrip(days, 30)
    expect(m.bars.map((b) => b.day)).toEqual(['2026-09-01', '2026-09-02'])
    expect(m.bars[0].total).toBeNull()
    expect(m.bars[0].segments).toEqual([])
    expect(m.bars[1].x).toBeGreaterThan(m.bars[0].x)
    const many = Array.from({ length: 40 }, (_, i) => fixtureAudience({ day: `2026-08-${String(i + 1).padStart(2, '0')}` }))
    expect(audienceStrip(many, 30).bars).toHaveLength(30)
  })

  it('is empty, not broken, without any audience file', () => {
    const m = audienceStrip([], 30)
    expect(m.bars).toEqual([])
    expect(m.max).toBe(0)
  })
})

describe('audience table', () => {
  it('reads standby, never zero, for an unavailable day', () => {
    const rows = audienceTableRows([standbyAudience('2026-09-01'), legacyAudience({ day: '2026-09-02' })])
    expect(rows[0].day).toBe('2026-09-02')
    expect(rows[0].total).toBe('120')
    expect(rows[0].pageviews).toBe('42')
    expect(rows[1].total).toBe('standby')
    expect(rows[1].browser).toBe('standby')
  })

  // The two committed trending-audience/1 days keep their beacon half for ever; a /2 day never
  // had one. A dash says "this file has no such half", which is a different statement from the
  // "standby" of a half whose count is pending — the distinction the decision of 2026-09-03 rests on.
  it('tells a retired half apart from a pending one', () => {
    // 2026-09-01 is the shape of the real committed day: a /1 file whose beacon half never got
    // its credentials, so it reads standby. 2026-09-03 is a /2 file — a dash, not standby,
    // because nothing is pending there.
    const unconnected = legacyAudience({ day: '2026-09-01', umami: { status: 'unavailable', note: 'no analytics account connected', source: 'self-hosted Umami', pageviews: null, visitors: null } })
    const rows = audienceTableRows([fixtureAudience({ day: '2026-09-03' }), legacyAudience({ day: '2026-09-02' }), unconnected])
    expect(rows.map((r) => r.pageviews)).toEqual(['—', '42', 'standby'])
  })

  it('keeps the beacon column only while a file still carries that half', () => {
    expect(audienceHasUmami([legacyAudience(), fixtureAudience({ day: '2026-09-03' })])).toBe(true)
    expect(audienceHasUmami([fixtureAudience(), dimensionlessAudience()])).toBe(false)
    expect(audienceHasUmami([])).toBe(false)
  })
})

describe('the two dimensions of trending-audience/2', () => {
  it('ranks countries and referring hosts by requests, ties by name, capped', () => {
    const a = fixtureAudience()
    expect(audienceDimensionRows(a.edge.countries)).toEqual([
      { name: 'United States', requests: '61' },
      { name: 'Germany', requests: '22' },
      { name: 'France', requests: '7' },
    ])
    expect(audienceDimensionRows(a.edge.referers).map((r) => r.name)).toEqual(['news.ycombinator.com', 'www.google.com'])
    expect(audienceDimensionRows({ b: 5, a: 5, c: 9 })).toEqual([
      { name: 'c', requests: '9' },
      { name: 'a', requests: '5' },
      { name: 'b', requests: '5' },
    ])
    expect(audienceDimensionRows(Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`c${i}`, i])), 10)).toHaveLength(10)
  })

  // A plan that does not expose a dimension is an absence with a reason, not a row of zeros:
  // no rows at all, and the record names which dimension is missing so the surface can say why.
  it('yields no rows for a null dimension, and names it as missing', () => {
    const none = dimensionlessAudience()
    expect(audienceDimensionRows(none.edge.countries)).toEqual([])
    expect(audienceDimensionRows(none.edge.referers)).toEqual([])
    expect(audienceMissingDimensions(none)).toEqual(['countries', 'referers'])
    expect(none.edge.extra_note).toContain('not queryable')
  })

  // A trending-audience/1 day carries neither key. That is not the same as a null: nothing is
  // claimed about it, so nothing is reported as missing either.
  it('claims nothing about a record from before the dimensions existed', () => {
    const old = legacyAudience()
    expect(old.edge.countries).toBeUndefined()
    expect(audienceDimensionRows(old.edge.countries)).toEqual([])
    expect(audienceMissingDimensions(old)).toEqual([])
  })
})

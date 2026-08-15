/** Data contract of the committed Invoked Past archive: what the page's claims stand on.
 *  Every number the page prints must be supported by the file's own components — and the
 *  three things the page promises to say honestly (the finding is the standout and not the
 *  maximum, the wall is measured, the law test is a state) are asserted here rather than
 *  trusted to prose. */
import { describe, expect, it } from 'vitest'
import latest from '@/data/invoked/latest.json'
import type { InvokedData } from './types'

const d = latest as unknown as InvokedData
const failed = d.stats.slots_fetched === 0

describe('invoked latest.json contract', () => {
  it('carries the method block the page and method sheet quote', () => {
    expect(d.method.version).toMatch(/^v\d/)
    expect(d.method.year_window[0]).toBe(1800)
    expect(d.method.register_min_days).toBeGreaterThanOrEqual(30)
    expect(d.method.register_size).toBeGreaterThan(0)
    expect(d.method.standout).toMatch(/median/i)
    expect(d.method.inherited_ceiling).toMatch(/2015/)
    expect(Object.keys(d.method.rules)).toEqual([
      'a_year_window',
      'b_self_reference',
      'c_per_article_dedup',
      'd_stoplist',
    ])
  })

  it('a failed fetch is a disclosed gap, not a quiet day', () => {
    if (failed) {
      expect(d.headline).toBeNull()
      expect(d.most_invoked).toBeNull()
      expect(d.years).toHaveLength(0)
      expect(d.top_years).toHaveLength(0)
      expect(d.age_profile).toHaveLength(0)
      expect(d.exact_dates_top).toHaveLength(0)
      expect(d.tracked_events).toBeNull()
      expect(d.note).toBeTruthy()
      expect(d.law_test.status).toBe('pending')
    } else {
      expect(d.stats.articles_scanned).toBeGreaterThan(0)
      expect(d.years.length).toBeGreaterThan(0)
      expect(d.note).toBeUndefined()
    }
  })

  it('keeps every invoked year inside the method window, ascending, without duplicates', () => {
    const thisYear = Number(d.date.slice(0, 4))
    let previous = -Infinity
    for (const y of d.years) {
      expect(y.year).toBeGreaterThanOrEqual(d.method.year_window[0])
      expect(y.year).toBeLessThanOrEqual(thisYear)
      expect(y.year, 'years ascend and never repeat').toBeGreaterThan(previous)
      expect(y.mentions).toBeGreaterThan(0)
      previous = y.year
    }
  })

  it('the headline is the standout, and it really stands out', () => {
    if (!d.headline) return // a day without a standout year is a valid day
    const h = d.headline
    const row = d.years.find((y) => y.year === h.year)
    expect(row?.mentions).toBe(h.mentions)
    expect(h.neighbourhood_median).toBeGreaterThan(0)
    expect(h.times_its_neighbourhood).toBeCloseTo(h.mentions / h.neighbourhood_median, 1)
    // the published rule: at least double the neighbourhood, and above the mention floor
    expect(h.times_its_neighbourhood).toBeGreaterThanOrEqual(2)
    expect(h.mentions).toBeGreaterThanOrEqual(30)
    expect(h.surprise).toBeCloseTo(
      (h.mentions - h.neighbourhood_median) / Math.sqrt(h.neighbourhood_median),
      0,
    )
    if (h.top_country_share !== null) {
      expect(h.top_country_share).toBeGreaterThan(0)
      expect(h.top_country_share).toBeLessThanOrEqual(1)
    }
  })

  it('the headline is NOT the raw maximum — the maximum is the ceiling artefact', () => {
    if (!d.headline || !d.most_invoked) return
    const maximum = d.years.reduce((m, y) => (y.mentions > m.mentions ? y : m), d.years[0])
    expect(d.most_invoked.year).toBe(maximum.year)
    expect(d.most_invoked.mentions).toBe(maximum.mentions)
    // The page presents most_invoked as an artefact of the wall; that framing is only honest
    // while the maximum really does sit at the wall. If a run ever breaks this, the page's
    // sentence must change with it — which is what this assertion is for.
    expect(d.most_invoked.year).toBe(d.stats.max_year_observed)
  })

  it('publishes the evidence for the standout whenever it publishes a standout', () => {
    if (!d.headline) return
    const why = d.headline.why
    expect(why, 'method v1.1 owes every headline its why block').toBeDefined()
    expect(d.method.why, 'the method block must describe the evidence it now carries').toMatch(/lift|theme|headline/i)
    expect(why!.articles).toBeGreaterThan(0)
    // Articles, not mentions: one article can carry several distinct dates in the same year,
    // which is exactly why the page prints both numbers instead of conflating them.
    expect(why!.articles).toBeLessThanOrEqual(d.stats.articles_scanned)
    expect(why!.articles).toBeLessThanOrEqual(d.headline.mentions)
  })

  it('the anniversary is arithmetic on the file itself, checkable without a calendar', () => {
    const why = d.headline?.why
    if (!why) return
    for (const e of why.top_exact_dates) {
      expect(e.date.startsWith(`${d.headline!.year}-`), 'top exact dates lie inside the standout year').toBe(true)
      expect(e.mentions).toBeGreaterThan(0)
    }
    expect(why.top_exact_dates.length).toBeLessThanOrEqual(5)
    const a = why.anniversary
    if (!a) {
      expect(why.top_exact_dates).toHaveLength(0)
      return
    }
    // The page calls this arithmetic and not a lookup, so the arithmetic is asserted:
    // the year's most-invoked exact date, and a month-day comparison against the record's day.
    expect(a.date).toBe(why.top_exact_dates[0].date)
    expect(a.mentions).toBe(why.top_exact_dates[0].mentions)
    expect(a.today).toBe(d.date)
    expect(a.matches_today).toBe(a.date.slice(5) === d.date.slice(5))
  })

  it('themes are ranked by lift and clear the three published floors', () => {
    const why = d.headline?.why
    if (!why) return
    expect(why.themes.length).toBeLessThanOrEqual(8)
    let previous = Infinity
    for (const t of why.themes) {
      expect(t.code).toMatch(/^[A-Z0-9_]+$/)
      expect(t.articles, 'floor: at least 15 invoking articles').toBeGreaterThanOrEqual(15)
      expect(t.share, 'floor: at least 8% of the invoking articles').toBeGreaterThanOrEqual(0.08)
      expect(t.lift, 'floor: at least twice as common as across the day').toBeGreaterThanOrEqual(2)
      expect(t.share).toBeCloseTo(t.articles / why.articles, 2)
      expect(t.lift, 'ranked by lift, not by frequency').toBeLessThanOrEqual(previous)
      previous = t.lift
    }
  })

  it('names come from the extractor, counted and in order, never tidied', () => {
    const why = d.headline?.why
    if (!why) return
    for (const list of [why.persons, why.organisations]) {
      expect(list.length).toBeLessThanOrEqual(6)
      let previous = Infinity
      for (const n of list) {
        expect(n.name.length).toBeGreaterThan(0)
        expect(n.articles).toBeGreaterThan(0)
        expect(n.articles).toBeLessThanOrEqual(why.articles)
        expect(n.articles).toBeLessThanOrEqual(previous)
        previous = n.articles
      }
    }
  })

  it('the headlines are real articles, linkable and attributed to their domain', () => {
    const why = d.headline?.why
    if (!why) return
    expect(why.headlines.length).toBeLessThanOrEqual(5)
    for (const a of why.headlines) {
      expect(a.title.trim().length).toBeGreaterThan(0)
      expect(a.url).toMatch(/^https?:\/\//)
      expect(a.domain.length).toBeGreaterThan(0)
      expect(a.url.toLowerCase(), 'the shown domain is the one the link goes to').toContain(a.domain.toLowerCase())
    }
  })

  it('measures the wall every night instead of assuming 2014', () => {
    if (failed) {
      expect(d.stats.max_year_observed).toBe(0)
      return
    }
    expect(d.stats.max_year_observed).toBeGreaterThanOrEqual(d.method.year_window[0])
    expect(d.stats.max_year_observed).toBeLessThanOrEqual(Number(d.date.slice(0, 4)))
    expect(Math.max(...d.years.map((y) => y.year))).toBe(d.stats.max_year_observed)
  })

  it('publishes the age profile as complete, contiguous buckets', () => {
    if (failed) return
    let expectedFrom = 0
    for (const b of d.age_profile) {
      expect(b.from).toBe(expectedFrom)
      expect(b.share).toBeGreaterThanOrEqual(0)
      if (b.to !== null) expectedFrom = b.to + 1
    }
    expect(d.age_profile.at(-1)?.to).toBeNull()
    const summed = d.age_profile.reduce((s, b) => s + b.mentions, 0)
    expect(summed).toBe(d.stats.mentions_kept)
  })

  it('every top year is a year the histogram carries, sorted by mentions', () => {
    let previous = Infinity
    for (const t of d.top_years) {
      expect(d.years.find((y) => y.year === t.year)?.mentions).toBe(t.mentions)
      expect(t.mentions).toBeLessThanOrEqual(previous)
      previous = t.mentions
      for (const c of t.invoked_by) expect(c.mentions).toBeGreaterThan(0)
    }
  })

  it('the law test is a state with a reason, never a placeholder', () => {
    expect(d.law_test.status).toBeTruthy()
    expect(d.law_test.reason.length).toBeGreaterThan(10)
    if (d.tracked_events === null && !failed) {
      // Not founded yet: the record must say what it is waiting for, and the wait must be real.
      expect(d.law_test.register_days_needed).toBe(d.method.register_min_days)
      expect(d.law_test.register_days_have).toBeLessThan(d.method.register_min_days)
      expect(d.law_test.hypothesis).toMatch(/Candia/)
    }
  })

  it('exact dates are dated, sorted and inside the method window', () => {
    let previous = Infinity
    for (const e of d.exact_dates_top) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number(e.date.slice(0, 4))).toBeGreaterThanOrEqual(d.method.year_window[0])
      expect(e.mentions).toBeLessThanOrEqual(previous)
      previous = e.mentions
    }
  })

  it('accounts for every mention it read: kept plus removed equals raw', () => {
    const removed = Object.values(d.stats.mentions_removed).reduce((s, n) => s + n, 0)
    expect(d.stats.mentions_kept + removed).toBe(d.stats.mentions_raw)
    expect(d.stats.mentions_kept).toBe(d.years.reduce((s, y) => s + y.mentions, 0))
  })

  it('date, window and source licence agree with the archive conventions', () => {
    expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(d.stats.slots_missing.length).toBe(d.stats.slots_expected - d.stats.slots_fetched)
    expect(d.source.license.length).toBeGreaterThan(0)
    expect(d.source.url).toMatch(/^https:\/\//)
  })
})

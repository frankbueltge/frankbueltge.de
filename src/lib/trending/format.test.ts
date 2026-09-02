import { describe, expect, it } from 'vitest'
import { archiveTitle, compact, feedTitle, fmtDateLong, fmtDateWeekday, fmtTimeUtc, metaDescription, pageTitle, signalText, topLabels } from './format'
import { fixtureDay } from './fixtures'

describe('trending formatting', () => {
  it('formats dates in UTC, long form', () => {
    expect(fmtDateLong('2026-09-02')).toBe('2 September 2026')
    expect(fmtDateWeekday('2026-09-02')).toBe('Wednesday, 2 September 2026')
    expect(fmtTimeUtc('2026-09-02T06:41:12Z')).toBe('06:41')
    expect(fmtTimeUtc('not a date')).toBe('—')
  })

  it('keeps full digits below a hundred thousand and goes compact above', () => {
    expect(compact(2000)).toBe('2,000')
    expect(compact(99_999)).toBe('99,999')
    expect(compact(314_205)).toBe('314.2K')
    expect(compact(null)).toBe('—')
  })

  it('renders a signal as platform, geo, magnitude and unit', () => {
    expect(signalText({ source: 'google_trends', geo: 'US', label: 'x', url: null, rank: 1, magnitude: 2000, magnitude_unit: 'approx_searches' })).toBe('Google Trends US 2,000+ searches')
    expect(signalText({ source: 'bluesky', geo: null, label: 'x', url: null, rank: 1, magnitude: 2779, magnitude_unit: 'posts' })).toBe('Bluesky 2,779 posts')
    expect(signalText({ source: 'google_news', geo: null, label: 'x', url: null, rank: 3, magnitude: null, magnitude_unit: 'rank' })).toBe('Google News #3')
  })

  it('builds the page and archive titles from the day', () => {
    const day = fixtureDay()
    expect(pageTitle(day)).toBe('Trending today, 2 September 2026 — cross-checked across 2 sources | Frank Bültge')
    expect(archiveTitle(day)).toBe('Trending on 2 September 2026: usps mail ballots, mickey gasper | Frank Bültge')
    expect(feedTitle(day)).toBe('Trending on 2 September 2026: usps mail ballots, mickey gasper')
  })

  it('takes at most three top labels and falls back to the topics when the summary is empty', () => {
    const day = fixtureDay({ summary: { ...fixtureDay().summary, top_labels: [] } })
    expect(topLabels(day, 3)).toEqual(['usps mail ballots', 'mickey gasper'])
    expect(topLabels(fixtureDay(), 1)).toEqual(['usps mail ballots'])
  })

  it('describes the latest page with the fixed sentence and archive days with their topics', () => {
    const day = fixtureDay()
    expect(metaDescription(day, true)).toMatch(/^What the web is searching/)
    expect(metaDescription(day, false)).toBe('Trending topics on 2 September 2026: usps mail ballots, mickey gasper. Cross-checked across 2 independent sources; archived as open data.')
  })
})

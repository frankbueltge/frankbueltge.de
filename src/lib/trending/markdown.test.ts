import { describe, expect, it } from 'vitest'
import { renderMarkdown, trendingUrls } from './markdown'
import { dimensionlessAudience, fixtureAudience, fixtureDay, legacyAudience, standbyAudience } from './fixtures'

describe('the Markdown edition', () => {
  it('names all six machine endpoints and the licence', () => {
    const md = renderMarkdown(fixtureDay(), fixtureAudience())
    const u = trendingUrls('2026-09-02')
    for (const url of [u.dayJson, u.latestJson, u.index, u.feed, u.markdown, u.llms]) expect(md).toContain(url)
    expect(md).toContain('CC0 1.0')
    expect(md.startsWith('# Trending today — 2 September 2026')).toBe(true)
  })

  it('tabulates the converging topics and lists every source, failed ones with their note', () => {
    const md = renderMarkdown(fixtureDay(), fixtureAudience())
    expect(md).toContain('| [usps mail ballots](https://bsky.app/profile/x/feed/a) | Bluesky · Google Trends |')
    expect(md).toContain('### Reddit — r/popular (unavailable — HTTP 403)')
    expect(md).toContain('- [USPS mail ballot handling](https://bsky.app/profile/x/feed/a) — 2,779')
  })

  it('reports the audience, or standby, never a guessed number', () => {
    expect(renderMarkdown(fixtureDay(), fixtureAudience())).toContain('- AI retrieval bots: 20')
    expect(renderMarkdown(fixtureDay(), standbyAudience())).toContain('Audience counter in standby')
    expect(renderMarkdown(fixtureDay())).toContain('Audience counter in standby')
  })

  it('carries the countries and referring hosts of a trending-audience/2 record', () => {
    const md = renderMarkdown(fixtureDay(), fixtureAudience())
    expect(md).toContain('Countries: United States 61, Germany 22, France 7.')
    expect(md).toContain('Referring hosts: news.ycombinator.com 3, www.google.com 2.')
    expect(md).not.toContain('page views')
  })

  // A dimension the plan refuses is stated as missing with its reason — the machine edition
  // says the same thing the page does, and neither of them prints a zero (decision 2026-09-03).
  it('names a refused dimension and its reason instead of a number', () => {
    const md = renderMarkdown(fixtureDay(), dimensionlessAudience('2026-09-02'))
    expect(md).toContain('Not in this record: countries and referring hosts — clientCountryName')
    expect(md).not.toContain('Countries: ')
  })

  it('still reports the beacon half of a trending-audience/1 day', () => {
    const md = renderMarkdown(fixtureDay(), legacyAudience({ day: '2026-09-01' }))
    expect(md).toContain('Human page views (browser beacon, script-executing browsers only): 42.')
  })

  it('discloses that no language model writes here', () => {
    expect(renderMarkdown(fixtureDay())).toMatch(/No language model writes anything here/)
  })
})

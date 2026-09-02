import { describe, expect, it } from 'vitest'
import { renderMarkdown, trendingUrls } from './markdown'
import { fixtureAudience, fixtureDay, standbyAudience } from './fixtures'

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

  it('discloses that no language model writes here', () => {
    expect(renderMarkdown(fixtureDay())).toMatch(/No language model writes anything here/)
  })
})

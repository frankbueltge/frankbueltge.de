// The Markdown edition is the version a retrieval agent reads. If it drops a term or a URL,
// the machine reader sees a smaller watchlist than the person does.
import { describe, expect, it } from 'vitest'
import { renderTermsMarkdown, termsUrls } from './terms-markdown'
import { fixtureTerms } from './terms-fixtures'

describe('the Markdown edition of the arcs hub', () => {
  it('lists every watched term, with its page and its JSON', () => {
    const file = fixtureTerms()
    const md = renderTermsMarkdown(file)
    const u = termsUrls()
    for (const t of file.terms) {
      expect(md, `the term "${t.term}" is missing`).toContain(t.term)
      expect(md).toContain(u.termPage(t.slug))
      expect(md).toContain(u.termJson(t.slug))
    }
    expect(md.startsWith('# Trends in the making — 3 September 2026')).toBe(true)
  })

  it('names the machine editions, the ledger, the method sheet and the licence', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    const u = termsUrls()
    for (const url of [u.hub, u.hubJson, u.markdown, u.ledger, u.method, u.llms]) expect(md).toContain(url)
    expect(md).toContain('CC0 1.0')
  })

  it('carries the status sentence of each term, not just a label', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    expect(md).toContain('Rising: mentions in the last seven days run at 1.6× the pace of the three weeks before.')
    expect(md).toContain('Quiet: fewer than the threshold of mentions in the last seven days.')
  })

  it('separates the candidates and says they are not tracked', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    expect(md).toContain('## What the machine noticed')
    expect(md).toContain('NOT on the watchlist')
    expect(md).toContain('context compaction')
    expect(md).toContain('only when a human writes them into the watchlist')
  })

  it('survives an empty watchlist and an empty discovery run', () => {
    const md = renderTermsMarkdown(fixtureTerms({ terms: [], candidates: [], summary: { terms_total: 0, by_status: {}, candidates_total: 0 } }))
    expect(md).toContain('The watchlist is empty.')
    expect(md).toContain('The discovery run proposed nothing this time.')
  })

  it('discloses that the watchlist is only ever changed by a human', () => {
    expect(renderTermsMarkdown(fixtureTerms())).toMatch(/the watchlist is only ever changed by a human/)
  })
})

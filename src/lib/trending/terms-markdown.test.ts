// The Markdown edition is the version a retrieval agent reads. If it drops a term or a URL,
// the machine reader sees a smaller watchlist than the person does.
import { describe, expect, it } from 'vitest'
import { renderTermsMarkdown, termsUrls } from './terms-markdown'
import { fixtureLetGo, fixturePromoted, fixtureTerms } from './terms-fixtures'

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

  it('separates the candidates and says they are terms on their way in, not yet counted', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    expect(md).toContain('## What the machine noticed')
    expect(md).toContain('NOT (yet) on the watchlist')
    expect(md).toContain('context compaction')
    expect(md).toContain('not proposals waiting for a person')
    expect(md).toContain('takes itself onto the list')
  })

  it('survives an empty watchlist and an empty discovery run', () => {
    const md = renderTermsMarkdown(fixtureTerms({ terms: [], candidates: [], summary: { terms_total: 0, by_status: {}, candidates_total: 0 } }))
    expect(md).toContain('The watchlist is empty')
    expect(md).toContain('no candidate has cleared the promotion rule yet')
    expect(md).toContain('The discovery run proposed nothing this time.')
  })

  // The governance reversed on 2026-09-02: the run promotes, a person prunes. A machine reader
  // that still read "only ever changed by a human" out of this file would be reading a rule
  // the pipeline no longer follows.
  it('states both directions of the rule in the method, and who overrides them', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    expect(md).not.toMatch(/only ever changed by a human/)
    expect(md).toContain("Discovery reads the house's own committed day files")
    expect(md).toContain('three days in a row')
    expect(md).toContain('lets go of what it added')
    expect(md).toContain('A person overrides both directions')
    expect(md).toContain('never returns')
  })

  it('says who put each term on the list', () => {
    const md = renderTermsMarkdown(fixtureTerms())
    expect(md).toContain('On the list since 2 September 2026, put there by hand — Editorial seed, 2026-09-02.')
    expect(md).toContain('promoted by the run itself')
    expect(md).toContain('| On the list since | How |')
  })

  it('carries the terms promoted today, with their evidence and the sentence about their counts', () => {
    const md = renderTermsMarkdown(fixtureTerms({ promoted: fixturePromoted() }))
    expect(md).toContain('## What came and went today')
    expect(md).toContain('2 terms joined the watchlist this morning')
    expect(md).toContain('counts start with the next run')
    expect(md).toContain('| context compaction | 3 | Hacker News · GitHub · Google News | 4.2× |')
    expect(md).toContain(termsUrls().termPage('eval-harness'))
  })

  it('carries what the run let go of, with the days it stood still and why', () => {
    const md = renderTermsMarkdown(fixtureTerms({ let_go: fixtureLetGo() }))
    expect(md).toContain('## What came and went today')
    expect(md).toContain('One term the run had promoted was let go this morning')
    expect(md).toContain('| mac studio | 21 | let go 2026-09-24: quiet for 21 days running |')
  })

  it('writes no such section in a run that changed nothing, or in an older file', () => {
    expect(renderTermsMarkdown(fixtureTerms())).not.toContain('## What came and went today')
    expect(renderTermsMarkdown(fixtureTerms({ promoted: [], let_go: [] }))).not.toContain('## What came and went today')
  })
})

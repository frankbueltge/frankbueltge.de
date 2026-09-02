// The schema is the gate between the pipeline and the site: a committed file that drifts from
// `trending-terms/1` has to fail the build, not render a half-page. Tolerant only where the
// contract says `| null` — and nowhere does it supply a number the pipeline did not measure.
import { describe, expect, it } from 'vitest'
import { trendingTermsSchema } from './terms-schema'
import { fixtureTerm, fixtureTerms } from './terms-fixtures'

describe('the terms contract', () => {
  it('accepts the fixture unchanged', () => {
    expect(() => trendingTermsSchema.parse(fixtureTerms())).not.toThrow()
  })

  it('refuses a file without the contract marker, and a foreign version of it', () => {
    const { $contract: _dropped, ...withoutContract } = fixtureTerms()
    expect(() => trendingTermsSchema.parse(withoutContract)).toThrow()
    expect(() => trendingTermsSchema.parse({ ...fixtureTerms(), $contract: 'trending-terms/2' })).toThrow()
    expect(() => trendingTermsSchema.parse({ ...fixtureTerms(), $contract: 'trending-day/1' })).toThrow()
  })

  it('tolerates every null the contract allows', () => {
    const file = fixtureTerms({
      terms: [
        fixtureTerm({
          wikipedia_article: null,
          ratio: null,
          counts: { hackernews: { d1: 0, d7: 0, d30: 0, capped: false }, reddit: null, wikipedia_views: null },
          receipts: [],
        }),
      ],
      candidates: [{ ngram: 'no sample', docs_recent: 4, docs_prior: 0, ratio: null, platforms: [], sample: null }],
    })
    const parsed = trendingTermsSchema.parse(file)
    expect(parsed.terms[0].ratio).toBeNull()
    expect(parsed.terms[0].counts.reddit).toBeNull()
    expect(parsed.candidates[0].sample).toBeNull()
  })

  it('refuses a bad date, an unknown status and a slug that is not a slug', () => {
    expect(() => trendingTermsSchema.parse({ ...fixtureTerms(), date: '3 September 2026' })).toThrow()
    expect(() => trendingTermsSchema.parse(fixtureTerms({ terms: [{ ...fixtureTerm(), status: 'hot' }] as never }))).toThrow()
    expect(() => trendingTermsSchema.parse(fixtureTerms({ terms: [fixtureTerm({ slug: 'Loop Engineering' })] }))).toThrow()
  })

  it('refuses a count that is missing a window', () => {
    expect(() =>
      trendingTermsSchema.parse(fixtureTerms({ terms: [fixtureTerm({ counts: { hackernews: { d1: 1, d7: 2 } } as never })] })),
    ).toThrow()
  })
})

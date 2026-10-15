// The schema is the gate between the pipeline and the site: a committed file that drifts from
// `trending-terms/1` has to fail the build, not render a half-page. Tolerant only where the
// contract says `| null` — and nowhere does it supply a number the pipeline did not measure.
import { describe, expect, it } from 'vitest'
import { trendingTermsSchema, watchlistSchema } from './terms-schema'
import { fixtureLetGo, fixturePromoted, fixtureTerm, fixtureTerms, fixtureWatchlist } from './terms-fixtures'

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

// `promoted` joined the contract on 2026-09-02 with the reversal of the watchlist default. It
// has to be tolerant in one direction only: every file committed before that day carries no
// such key, and reading its absence as "nothing was promoted" is true of those runs. It must
// NOT be tolerant of a promotion without its evidence.
describe('the promotions of a run', () => {
  it('reads a file written before the key existed as nothing promoted', () => {
    const older = fixtureTerms()
    expect('promoted' in older).toBe(false)
    expect(trendingTermsSchema.parse(older).promoted).toEqual([])
  })

  it('accepts the promotions with their evidence, pace or no pace', () => {
    const parsed = trendingTermsSchema.parse(fixtureTerms({ promoted: fixturePromoted() }))
    expect(parsed.promoted.map((p) => p.slug)).toEqual(['context-compaction', 'eval-harness'])
    expect(parsed.promoted[0].days_seen).toBe(3)
    expect(parsed.promoted[0].platforms).toEqual(['hackernews', 'github', 'google_news'])
    expect(parsed.promoted[1].ratio).toBeNull()
  })

  it('refuses a promotion without its day count, and a slug that is not a slug', () => {
    expect(() =>
      trendingTermsSchema.parse(fixtureTerms({ promoted: [{ slug: 'x', term: 'x', platforms: [] }] as never })),
    ).toThrow()
    expect(() =>
      trendingTermsSchema.parse(fixtureTerms({ promoted: [{ ...fixturePromoted()[0], slug: 'Context Compaction' }] })),
    ).toThrow()
  })
})

// `let_go` is the same key in the other direction: what the run withdrew this morning from
// what it had promoted itself.
describe('what a run let go of', () => {
  it('reads a file written before the key existed as nothing let go', () => {
    const older = fixtureTerms()
    expect('let_go' in older).toBe(false)
    expect(trendingTermsSchema.parse(older).let_go).toEqual([])
  })

  it('accepts a striking with the days it stood still and the reason', () => {
    const parsed = trendingTermsSchema.parse(fixtureTerms({ let_go: fixtureLetGo() }))
    expect(parsed.let_go).toHaveLength(1)
    expect(parsed.let_go[0].slug).toBe('mac-studio')
    expect(parsed.let_go[0].days_quiet).toBe(21)
  })

  it('refuses a striking without the days it stood still', () => {
    expect(() =>
      trendingTermsSchema.parse(fixtureTerms({ let_go: [{ slug: 'mac-studio', term: 'mac studio' }] as never })),
    ).toThrow()
  })
})

// The watchlist is the live list, not a dated run: the one file in this contract that is
// rewritten. A struck term keeps its line — the tombstone is what stops a second promotion —
// so the schema has to carry `retired` and must not require it.
describe('the watchlist', () => {
  it('accepts the live list, with and without tombstones', () => {
    const parsed = watchlistSchema.parse(fixtureWatchlist())
    expect(parsed).toHaveLength(3)
    expect(parsed.filter((e) => typeof e.retired === 'string')).toHaveLength(1)
    expect(parsed[0].retired).toBeUndefined()
  })

  it('accepts the list wrapped in an object as well as bare', () => {
    expect(watchlistSchema.parse({ terms: fixtureWatchlist() })).toHaveLength(3)
  })

  it('refuses an entry without an origin or without the day it was added', () => {
    const [first] = fixtureWatchlist()
    const { origin: _o, ...noOrigin } = first
    const { added: _a, ...noAdded } = first
    expect(() => watchlistSchema.parse([noOrigin])).toThrow()
    expect(() => watchlistSchema.parse([noAdded])).toThrow()
  })
})

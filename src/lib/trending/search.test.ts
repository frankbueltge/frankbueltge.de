import { describe, expect, it } from 'vitest'
import { getTrendingByDate } from './data'
import { fixtureDay } from './fixtures'
import { EMPTY_FILTER, MIN_QUERY, isSearching, parseFilter, searchDay, serialiseFilter } from './search'

describe('a filter in the address', () => {
  it('survives the round trip and leaves an unfiltered page its clean address', () => {
    expect(serialiseFilter(EMPTY_FILTER)).toBe('')
    expect(serialiseFilter({ q: '  el niño ', kind: 'science' })).toBe('?kind=science&q=el+ni%C3%B1o')
    expect(parseFilter('?kind=science&q=el+ni%C3%B1o')).toEqual({ q: 'el niño', kind: 'science' })
  })

  it('ignores a kind it does not know, so an old link opens the whole register', () => {
    expect(parseFilter('?kind=podcasts')).toEqual({ q: '', kind: 'all' })
    expect(parseFilter('')).toEqual(EMPTY_FILTER)
  })

  it('narrows only from two characters on', () => {
    expect(MIN_QUERY).toBe(2)
    expect(isSearching({ q: 'a', kind: 'all' })).toBe(false)
    expect(isSearching({ q: ' a ', kind: 'all' })).toBe(false)
    expect(isSearching({ q: 'ai', kind: 'all' })).toBe(true)
  })
})

describe('finding a word in a morning', () => {
  it('finds every line that carries all the words, source by source, in the ledger’s order', () => {
    const result = searchDay(fixtureDay(), { q: 'ballot usps', kind: 'all' })
    expect(result.total).toBe(2)
    expect(result.listed).toBe(2)
    expect(result.sources.map((s) => s.id)).toEqual(['google_trends', 'bluesky'])
    expect(result.sources[0]).toMatchObject({ label: 'Google Trends', group: 'search' })
    expect(result.sources[0]!.hits[0]).toMatchObject({
      label: 'usps mail ballots',
      geo: 'US',
      rank: 1,
      magnitudeText: '2,000+ searches',
    })
  })

  it('folds case and accents, and leaves out a source with no matching line', () => {
    const result = searchDay(fixtureDay(), { q: 'GÁSPER', kind: 'all' })
    expect(result.sources.map((s) => s.id)).toEqual(['google_trends'])
    expect(result.sources[0]!.hits.map((h) => h.label)).toEqual(['mickey gasper'])
  })

  it('says which lines belong to a crossing, and how wide it is', () => {
    const hits = searchDay(fixtureDay(), { q: 'us', kind: 'all' }).sources.flatMap((s) => s.hits)
    expect(hits.find((h) => h.label === 'usps mail ballots')!.crossing).toBe(2)
    expect(hits.find((h) => h.label === 'USPS mail ballot handling')!.crossing).toBe(2)
    expect(searchDay(fixtureDay(), { q: 'gasper', kind: 'all' }).sources[0]!.hits[0]!.crossing).toBeNull()
  })

  it('matches a country and a desk as well as the label', () => {
    const day = fixtureDay()
    day.signals.bluesky![0]!.meta = { feed: 'bbc' }
    expect(searchDay(day, { q: 'bbc', kind: 'all' }).sources.map((s) => s.id)).toEqual(['bluesky'])
    expect(searchDay(day, { q: 'bbc', kind: 'all' }).sources[0]!.hits[0]!.desk).toBe('BBC')
    // Both Google Trends lines are from the US list; neither label says so.
    expect(searchDay(day, { q: 'gasper us', kind: 'all' }).total).toBe(1)
  })

  it('stays inside the chosen kind of source', () => {
    const result = searchDay(fixtureDay(), { q: 'usps', kind: 'social' })
    expect(result.sources.map((s) => s.id)).toEqual(['bluesky'])
    expect(result.total).toBe(1)
  })

  it('caps what it lists and never what it counts', () => {
    const result = searchDay(fixtureDay(), { q: 'usps', kind: 'all' }, 1)
    expect(result.total).toBe(2)
    expect(result.listed).toBe(1)
    expect(result.sources.map((s) => s.id)).toEqual(['google_trends'])
  })

  it('reaches the lines a card does not print', () => {
    // The register prints the first eight lines of a source. The search is there for the rest:
    // on a committed morning, the last line of the longest list is found by its own label, at
    // the rank the file gives it. A fixed day, so a later morning cannot change the answer.
    const day = getTrendingByDate('2026-11-14')!
    const longest = Object.values(day.signals).reduce((a, b) => (b.length > a.length ? b : a))
    const last = longest[longest.length - 1]!
    expect(longest.length).toBeGreaterThan(8)
    const hits = searchDay(day, { q: last.label, kind: 'all' }).sources.find((s) => s.id === last.source)!.hits
    expect(hits.some((h) => h.label === last.label && h.rank === last.rank)).toBe(true)
  })
})

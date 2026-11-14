import { describe, expect, it } from 'vitest'
import { getTrendingDays } from './data'
import { SOURCE_GROUPS, sourceGroup, sourceGroupCounts, sourceGroupLabel } from './groups'

describe('the kinds of source', () => {
  it('sorts a source it knows and reads one it does not as other, never as a guess', () => {
    expect(sourceGroup('wikipedia')).toBe('search')
    expect(sourceGroup('polymarket')).toBe('markets')
    expect(sourceGroup('a_source_added_last_night')).toBe('other')
  })

  it('names every kind in words', () => {
    expect(sourceGroupLabel('tech')).toBe('Tech & code')
    for (const g of SOURCE_GROUPS) expect(sourceGroupLabel(g.key), g.key).not.toBe(g.key)
  })

  it('counts the kinds that occur, in the order of the filter, and offers no empty one', () => {
    const counts = sourceGroupCounts(['arxiv', 'wikipedia', 'google_trends', 'never_seen'])
    expect(counts).toEqual([
      { key: 'search', label: 'Search & reference', n: 2 },
      { key: 'science', label: 'Science', n: 1 },
      { key: 'other', label: 'Other', n: 1 },
    ])
    expect(counts.reduce((acc, c) => acc + c.n, 0)).toBe(4)
  })

  it('has sorted every source the ledger read through 2026-11-14', () => {
    // Held to the mornings on which the sorting was made. A source the nightly run adds later
    // reads as "Other" until someone sorts it; that must not stand between a morning and its
    // deploy, so the newer days are not asserted here.
    const ids = new Set(
      getTrendingDays()
        .filter((d) => d.date <= '2026-11-14')
        .flatMap((d) => d.sources.map((s) => s.id)),
    )
    expect(ids.size).toBeGreaterThan(30)
    expect([...ids].filter((id) => sourceGroup(id) === 'other')).toEqual([])
  })
})

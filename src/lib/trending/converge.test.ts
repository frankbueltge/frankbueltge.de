import { describe, expect, it } from 'vitest'

import { CONVERGE, convergeModel, convergeWalkOrder, topicUrl } from './converge'
import { fixtureDay } from './fixtures'
import type { TrendingDay, TrendingTopic } from './types'

/** A topic in the day contract's shape, with only the fields the matrix reads spelled out. */
function topic(over: Partial<TrendingTopic> & Pick<TrendingTopic, 'id'>): TrendingTopic {
  return {
    label: over.id,
    platforms: [],
    platform_count: 2,
    score: 1,
    category: null,
    first_seen: '2026-09-01',
    days_hot: 1,
    signals: [],
    links: [],
    wikipedia: null,
    ...over,
  }
}

function signal(source: string, rank: number, label = `${source} label`) {
  return { source, geo: null, label, url: null, rank, magnitude: null, magnitude_unit: 'rank' }
}

/** Three sources, four converging topics, ranks chosen so every weight step is exercised. */
function grid(): TrendingDay {
  return fixtureDay({
    sources: [
      { id: 'google_trends', name: 'Google Trends', url: 'https://x', licence: '', status: 'ok', note: '', retrieved_at: null, as_of: null, count: 4 },
      { id: 'wikipedia', name: 'Wikipedia', url: 'https://x', licence: '', status: 'ok', note: '', retrieved_at: null, as_of: null, count: 4 },
      { id: 'hackernews', name: 'Hacker News', url: 'https://x', licence: '', status: 'ok', note: '', retrieved_at: null, as_of: null, count: 1 },
      { id: 'reddit', name: 'Reddit', url: 'https://x', licence: '', status: 'unavailable', note: '', retrieved_at: null, as_of: null, count: 0 },
    ],
    topics: [
      topic({ id: 'a', platform_count: 3, signals: [signal('google_trends', 1), signal('wikipedia', 10), signal('hackernews', 4)] }),
      topic({ id: 'b', platform_count: 2, signals: [signal('google_trends', 5), signal('wikipedia', 150)] }),
      topic({ id: 'c', platform_count: 2, signals: [signal('google_trends', 9), signal('wikipedia', 290)] }),
      topic({ id: 'solo', platform_count: 1, signals: [signal('google_trends', 2)] }),
    ],
  })
}

describe('the convergence matrix', () => {
  it('draws only what converged — a topic on one platform is not in the grid', () => {
    const model = convergeModel(grid())
    expect(model.rows.map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('gives a column only to a source that carried one of the drawn topics', () => {
    // Reddit answered nothing this morning and hackernews carried exactly one topic: the first
    // earns no column, the second does.
    const model = convergeModel(grid())
    expect(model.columns.map((c) => c.id)).toEqual(['google_trends', 'wikipedia', 'hackernews'])
  })

  it("keeps the columns in the ledger's own source order, so the grid reads like the page", () => {
    const day = grid()
    day.sources.reverse()
    expect(convergeModel(day).columns.map((c) => c.id)).toEqual(['hackernews', 'wikipedia', 'google_trends'])
  })

  it("spells a column head with the source's own name, never its id", () => {
    expect(convergeModel(grid()).columns.map((c) => c.label)).toEqual(['Google Trends', 'Wikipedia', 'Hacker News'])
  })

  it("a row's marks are exactly its platform count — the drawing cannot outrun the headline", () => {
    for (const row of convergeModel(grid()).rows) {
      expect(row.marks.length, `${row.id} draws a different number of marks than it claims`).toBe(row.platformCount)
    }
  })

  it('weighs a mark against its own column, never against a neighbour with a different ruler', () => {
    const model = convergeModel(grid())
    const at = (topicId: string, source: string) =>
      model.rows.find((r) => r.id === topicId)!.marks.find((m) => m.source === source)!
    // Google Trends' ranks here are 1, 5, 9; Wikipedia's are 10, 150, 290. Rank 10 is the BEST of
    // Wikipedia's list and so weighs heaviest there, although 10 is the worst rank in the figure.
    expect(at('a', 'wikipedia').weight).toBe(3)
    expect(at('a', 'google_trends').weight).toBe(3)
    expect(at('c', 'wikipedia').weight).toBe(1)
    expect(at('b', 'google_trends').weight).toBe(2)
  })

  it('gives a column carrying a single topic the middle weight, claiming no comparison', () => {
    const mark = convergeModel(grid()).rows[0]!.marks.find((m) => m.source === 'hackernews')!
    expect(mark.weight).toBe(2)
    expect(mark.r).toBe(CONVERGE.radius.medium)
  })

  it("carries the source's OWN label and signal on the mark, not the row's label", () => {
    const day = grid()
    day.topics[0]!.label = 'the crossing label'
    day.topics[0]!.signals = [signal('google_trends', 1, 'what google called it'), signal('wikipedia', 10, 'what wikipedia called it')]
    day.topics[0]!.platform_count = 2
    const row = convergeModel(day).rows[0]!
    expect(row.label).toBe('the crossing label')
    expect(row.marks.map((m) => m.label)).toEqual(['what google called it', 'what wikipedia called it'])
    expect(row.marks[0]!.detail).toBe('Google Trends #1')
  })

  it("keeps a source's best rank when it reported the same topic twice", () => {
    const day = grid()
    day.topics[0]!.signals = [signal('google_trends', 7), signal('google_trends', 2), signal('wikipedia', 10)]
    day.topics[0]!.platform_count = 2
    const marks = convergeModel(day).rows[0]!.marks
    expect(marks.filter((m) => m.source === 'google_trends')).toHaveLength(1)
    expect(marks.find((m) => m.source === 'google_trends')!.rank).toBe(2)
  })

  it('lays the geometry out from the frame alone — every row on the grid, every mark in its column', () => {
    const model = convergeModel(grid())
    const colWidth = (CONVERGE.width - CONVERGE.gutter) / 3
    expect(model.columns.map((c) => c.x)).toEqual([300, 300 + colWidth, 300 + 2 * colWidth])
    expect(model.rows.map((r) => r.y)).toEqual([34, 68, 102])
    for (const row of model.rows) {
      for (const mark of row.marks) {
        const column = model.columns.find((c) => c.id === mark.source)!
        expect(mark.cx).toBe(column.cx)
        expect(mark.cy).toBe(row.y + CONVERGE.rowHeight / 2)
      }
    }
    expect(model.height).toBe(34 + 3 * 34 + CONVERGE.footHeight)
  })

  it('letters a column head straight where there is room and at an angle where there is not', () => {
    expect(convergeModel(grid()).columns.every((c) => c.rotate === 0 && c.anchor === 'middle')).toBe(true)

    // Twelve columns leave 51 units each — a straight "Stack Overflow" would run into its
    // neighbour, so the heads tilt instead of overlapping or being silently truncated.
    const many = grid()
    const ids = ['google_trends', 'wikipedia', 'hackernews', 'bluesky', 'mastodon', 'google_news', 'github', 'lobsters', 'devto', 'stackoverflow', 'pypi', 'arxiv']
    many.sources = ids.map((id) => ({ id, name: id, url: 'https://x', licence: '', status: 'ok' as const, note: '', retrieved_at: null, as_of: null, count: 1 }))
    many.topics = [topic({ id: 'wide', platform_count: ids.length, signals: ids.map((id, i) => signal(id, i + 1)) })]
    const wide = convergeModel(many)
    expect(wide.columns).toHaveLength(12)
    expect(wide.columns.every((c) => c.rotate === -38 && c.anchor === 'start')).toBe(true)
  })

  it('counts what each column carried, for the totals under the grid', () => {
    const model = convergeModel(grid())
    expect(model.columns.map((c) => [c.id, c.carried])).toEqual([
      ['google_trends', 3],
      ['wikipedia', 3],
      ['hackernews', 1],
    ])
  })

  it('caps the drawn rows and says how many it left to the table', () => {
    const day = grid()
    day.topics = Array.from({ length: 20 }, (_, i) =>
      topic({ id: `t${i}`, platform_count: 2, signals: [signal('google_trends', i + 1), signal('wikipedia', i + 1)] }),
    )
    const model = convergeModel(day, 5)
    expect(model.rows).toHaveLength(5)
    expect(model.more).toBe(15)
  })

  it('stands up to a day on which nothing converged', () => {
    const day = grid()
    day.topics = [topic({ id: 'solo', platform_count: 1, signals: [signal('google_trends', 1)] })]
    const model = convergeModel(day)
    expect(model.rows).toEqual([])
    expect(model.columns).toEqual([])
    expect(model.more).toBe(0)
    expect(Number.isFinite(model.height)).toBe(true)
  })

  it('points a row at the same place the table does', () => {
    const withArticle = topic({ id: 'a', wikipedia: { lang: 'en', article: 'Lake Ontario', views: 5 } })
    expect(topicUrl(withArticle)).toBe('https://en.wikipedia.org/wiki/Lake_Ontario')
    const withSignalUrl = topic({ id: 'b', signals: [{ ...signal('bluesky', 1), url: 'https://bsky.app/x' }] })
    expect(topicUrl(withSignalUrl)).toBe('https://bsky.app/x')
    expect(topicUrl(topic({ id: 'c' }))).toBeNull()
  })

  it('walks the marks in reading order — rows top to bottom, left to right within a row', () => {
    const order = convergeWalkOrder(convergeModel(grid()))
    expect(order.map((m) => m.key)).toEqual([
      'a::google_trends',
      'a::wikipedia',
      'a::hackernews',
      'b::google_trends',
      'b::wikipedia',
      'c::google_trends',
      'c::wikipedia',
    ])
  })

  it('is deterministic: the same file gives byte-identical geometry', () => {
    expect(JSON.stringify(convergeModel(grid()))).toBe(JSON.stringify(convergeModel(grid())))
  })
})

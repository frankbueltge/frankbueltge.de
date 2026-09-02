// The arcs say a status in a sentence, with the number it rests on — a badge that only reads
// "rising" is an opinion. These tests pin the order the hub sorts in, the sentence each status
// produces, and the one place the ratio is formatted.
import { describe, expect, it } from 'vitest'
import { fixtureTerm, fixtureTerms } from './terms-fixtures'
import {
  atWindowFloor,
  firstSeenCell,
  firstSeenText,
  windowFloor,
  cappedPlatforms,
  countRows,
  countedPlatforms,
  hubRows,
  joinWithAnd,
  ratioText,
  risingLinks,
  searchedPlatforms,
  seriesRows,
  seriesStrip,
  sortTerms,
  statusLabel,
  statusSentence,
  statusTally,
  termDescription,
  termPlatformLabel,
  termSubline,
  termTitle,
} from './terms-view'

describe('status order and labels', () => {
  it('sorts emerging → rising → established → fading → quiet, then by the seven-day count', () => {
    const file = fixtureTerms()
    expect(sortTerms(file.terms).map((t) => t.status)).toEqual(['emerging', 'rising', 'established', 'fading', 'quiet'])
  })

  it('breaks a tie inside one status by the seven-day count, descending', () => {
    const terms = [
      fixtureTerm({ slug: 'a', term: 'a', status: 'rising', total: { d1: 0, d7: 4, d30: 40 } }),
      fixtureTerm({ slug: 'b', term: 'b', status: 'rising', total: { d1: 0, d7: 90, d30: 400 } }),
      fixtureTerm({ slug: 'c', term: 'c', status: 'emerging', total: { d1: 0, d7: 1, d30: 1 } }),
    ]
    expect(sortTerms(terms).map((t) => t.slug)).toEqual(['c', 'b', 'a'])
  })

  it('labels every status', () => {
    expect(statusLabel('emerging')).toBe('Emerging')
    expect(statusLabel('quiet')).toBe('Quiet')
    expect(statusTally(fixtureTerms()).map((i) => i.status)).toEqual(['emerging', 'rising', 'established', 'fading', 'quiet'])
    expect(statusTally(fixtureTerms()).every((i) => i.n > 0)).toBe(true)
  })
})

describe('the status sentence', () => {
  it('names the pace for a rising term', () => {
    expect(statusSentence(fixtureTerm({ status: 'rising', ratio: 1.62 }))).toBe(
      'Rising: mentions in the last seven days run at 1.6× the pace of the three weeks before.',
    )
  })

  it('adds the first sighting for an emerging term', () => {
    const s = statusSentence(fixtureTerm({ status: 'emerging', ratio: 2.4, first_seen: '2026-08-28' }))
    expect(s).toBe('Emerging: mentions in the last seven days run at 2.4× the pace of the three weeks before, and the term was first seen on 28 August 2026.')
  })

  it('refuses to invent a pace when the prior window held nothing', () => {
    expect(statusSentence(fixtureTerm({ status: 'rising', ratio: null }))).toBe(
      'Rising: mentions in the last seven days, where the three weeks before it held none.',
    )
    expect(statusSentence(fixtureTerm({ status: 'emerging', ratio: null, first_seen: '2026-08-28' }))).toContain('where the three weeks before it held none')
  })

  it('says what quiet, established and fading mean', () => {
    expect(statusSentence(fixtureTerm({ status: 'quiet', ratio: 0.3 }))).toBe('Quiet: fewer than the threshold of mentions in the last seven days.')
    expect(statusSentence(fixtureTerm({ status: 'established', ratio: 1.05 }))).toBe('Established: present through the month at a steady pace.')
    expect(statusSentence(fixtureTerm({ status: 'fading', ratio: 0.09 }))).toBe('Fading: mentions in the last seven days run at 0.1× the pace of the three weeks before.')
  })
})

describe('ratio formatting', () => {
  it('keeps one decimal, and none when the pace is whole', () => {
    expect(ratioText(1.62)).toBe('1.6×')
    expect(ratioText(8)).toBe('8×')
    expect(ratioText(0.09)).toBe('0.1×')
    expect(ratioText(2.45)).toBe('2.5×')
  })
})

describe('the hub table', () => {
  it('carries every term with its status, both windows, the first sighting and the platforms', () => {
    const file = fixtureTerms()
    const rows = hubRows(file)
    expect(rows).toHaveLength(file.terms.length)
    expect(rows[0].term).toBe('agentic commerce')
    expect(rows[0].status).toBe('Emerging')
    expect(rows.map((r) => r.term)).toEqual(sortTerms(file.terms).map((t) => t.term))
    // Cells are strings or numbers only — the shared table primitive takes no markup.
    for (const row of rows) for (const v of Object.values(row)) expect(['string', 'number']).toContain(typeof v)
  })

  it('names only the platforms that actually carried a term, page views excluded', () => {
    const file = fixtureTerms()
    const knowledge = file.terms.find((t) => t.slug === 'knowledge-graph')!
    expect(countedPlatforms(knowledge, searchedPlatforms(file))).toEqual(['hackernews', 'google_news', 'github', 'arxiv'])
    expect(countedPlatforms(knowledge, searchedPlatforms(file))).not.toContain('wikipedia_views')
    expect(searchedPlatforms(file)).not.toContain('wikipedia_views')
  })

  it('flags a platform whose feed may undercount', () => {
    const file = fixtureTerms()
    expect(cappedPlatforms(fixtureTerm(), searchedPlatforms(file))).toEqual(['google_news'])
  })
})

describe('the per-platform counts of one term', () => {
  it('follows the run order, marks a platform that returned nothing, and ends on the total', () => {
    const file = fixtureTerms()
    const rows = countRows(file, fixtureTerm())
    expect(rows.map((r) => r.platform)).toEqual([
      'Hacker News',
      'Google News',
      'GitHub',
      'arXiv',
      'Reddit',
      'Wikipedia page views',
      'Total (page views excluded)',
    ])
    expect(rows[4].d30).toBe('—')
    expect(rows[1].capped).toBe('may undercount')
    expect(rows[6].d30).toBe('124')
  })
})

describe('the rising block on the day ledger', () => {
  it('keeps only what is new or accelerating, in the hub order, capped', () => {
    const file = fixtureTerms()
    const rising = risingLinks(file, 8)
    expect(rising.map((r) => r.status)).toEqual(['emerging', 'rising'])
    expect(rising[0].href).toBe('/trending/topics/agentic-commerce/')
    expect(rising[0].ratio).toBeNull()
    expect(rising[1].ratio).toBe('1.6×')
    expect(risingLinks(file, 1)).toHaveLength(1)
  })
})

describe('the series strip', () => {
  it('draws oldest left, scales to the tallest day and keeps a counted zero visible', () => {
    const strip = seriesStrip([
      { date: '2026-09-01', d1: 0 },
      { date: '2026-09-02', d1: 5 },
      { date: '2026-09-03', d1: 10 },
    ], 100, 50)
    expect(strip.max).toBe(10)
    expect(strip.bars.map((b) => b.date)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03'])
    expect(strip.bars[0].x).toBe(0)
    expect(strip.bars[2].x).toBeGreaterThan(strip.bars[1].x)
    expect(strip.bars[0].h).toBe(1)
    expect(strip.bars[2].h).toBe(50)
    expect(strip.bars[2].y).toBe(0)
  })

  it('survives an empty archive and an all-zero series', () => {
    expect(seriesStrip([]).bars).toEqual([])
    expect(seriesStrip([{ date: '2026-09-01', d1: 0 }]).bars[0].h).toBe(1)
  })

  it('has a table floor, newest first', () => {
    const rows = seriesRows([
      { date: '2026-09-01', d1: 1 },
      { date: '2026-09-03', d1: 3 },
    ])
    expect(rows.map((r) => r.date)).toEqual(['2026-09-03', '2026-09-01'])
  })
})

describe('the term page head', () => {
  it('joins the searched platforms into the title', () => {
    const file = fixtureTerms()
    expect(joinWithAnd(['a'])).toBe('a')
    expect(joinWithAnd(['a', 'b'])).toBe('a and b')
    expect(termTitle(file, fixtureTerm())).toBe(
      'loop engineering — rising trend, tracked across Hacker News, Google News, GitHub, arXiv and Reddit | Frank Bültge',
    )
  })

  it('builds a meta description out of the file, and does not say first seen twice', () => {
    const file = fixtureTerms()
    const rising = termDescription(file, fixtureTerm())
    expect(rising).toBe(
      'loop engineering: Rising: mentions in the last seven days run at 1.6× the pace of the three weeks before. ' +
        'First seen 14 June 2026; 124 mentions across 4 platforms in thirty days. Daily open data.',
    )
    const emerging = termDescription(file, file.terms.find((t) => t.slug === 'agentic-commerce')!)
    expect(emerging).toContain('first seen on 28 August 2026')
    expect(emerging).not.toContain('First seen')
  })

  it('states the subline as status, tracked-since and first-seen', () => {
    expect(termSubline(fixtureTerm())).toBe('Rising · tracked since 2 September 2026 · first seen 14 June 2026')
  })

  it('spells the two platform labels the arcs add', () => {
    expect(termPlatformLabel('arxiv')).toBe('arXiv')
    expect(termPlatformLabel('wikipedia_views')).toBe('Wikipedia page views')
    expect(termPlatformLabel('hackernews')).toBe('Hacker News')
  })
})

describe('the window floor', () => {
  it('names the edge of the window and refuses to call it a birthday', () => {
    const file = fixtureTerms()
    const floor = windowFloor(file)
    const edge = fixtureTerm({ first_seen: floor })
    expect(atWindowFloor(file, edge)).toBe(true)
    expect(firstSeenCell(file, edge)).toBe(`≤ ${floor}`)
    expect(firstSeenText(file, edge)).toContain('already in view when the window opened')
    expect(termSubline(edge, file)).toContain('already in view')
    expect(termDescription(file, edge)).toContain('In view since before')
    const real = fixtureTerm({ first_seen: '2026-06-14' })
    expect(atWindowFloor(file, real)).toBe(false)
    expect(firstSeenCell(file, real)).toBe('2026-06-14')
  })
})

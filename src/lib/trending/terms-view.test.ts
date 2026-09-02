// The arcs say a status in a sentence, with the number it rests on — a badge that only reads
// "rising" is an opinion. These tests pin the order the hub sorts in, the sentence each status
// produces, and the one place the ratio is formatted.
import { describe, expect, it } from 'vitest'
import { fixtureLetGo, fixturePromoted, fixtureTerm, fixtureTerms, fixtureWatchlist } from './terms-fixtures'
import {
  atWindowFloor,
  firstSeenCell,
  firstSeenText,
  windowFloor,
  cappedPlatforms,
  countRows,
  countedPlatforms,
  hubRows,
  GOVERNANCE_RULE,
  joinWithAnd,
  letGoItems,
  letGoRows,
  letGoSentence,
  letGoTerms,
  listChanged,
  originLabel,
  originMark,
  originSentence,
  promotedItems,
  promotedRows,
  promotedTerms,
  promotionSentence,
  PROMOTION_RULE,
  ratioText,
  RETIREMENT_RULE,
  retiredEntries,
  retiredSentence,
  risingLinks,
  searchedPlatforms,
  seriesRows,
  seriesStrip,
  sortTerms,
  statusLabel,
  statusSentence,
  statusTally,
  termDescription,
  termLinks,
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

  it('carries the governance too: when a term joined the list, and who put it there', () => {
    const rows = hubRows(fixtureTerms())
    const agentic = rows.find((r) => r.term === 'agentic commerce')!
    const loop = rows.find((r) => r.term === 'loop engineering')!
    expect(agentic.origin).toBe('By the run')
    expect(loop.origin).toBe('By hand')
    expect(loop.added).toBe('2026-09-02')
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

// Since 2026-09-02 the run promotes a candidate and a person prunes (decision of 2026-09-02,
// wording private; docs/design/2026-09-02-common-ground.md §9 amendment). Two things must hold
// on the page: every term says who put it on the list, and a term promoted this morning is
// never shown as if it already had counts.
describe('who put a term on the list', () => {
  it('labels both origins, in the table and in a running line', () => {
    expect(originLabel('editorial')).toBe('By hand')
    expect(originLabel('discovered')).toBe('By the run')
    expect(originMark('editorial')).toBe('by hand')
    expect(originMark('discovered')).toBe('by the run')
  })

  it('says it in a sentence, with the note the file carries', () => {
    expect(originSentence(fixtureTerm())).toBe(
      'On the list since 2 September 2026, put there by hand — Editorial seed, 2026-09-02.',
    )
    expect(originSentence(fixtureTerm({ origin: 'discovered', note: 'promoted 2026-09-02' }))).toBe(
      'On the list since 2 September 2026, promoted by the run itself — promoted 2026-09-02.',
    )
    expect(originSentence(fixtureTerm({ note: '' }))).toBe('On the list since 2 September 2026, put there by hand.')
    // a note that already ends on a full stop must not close the sentence twice
    expect(originSentence(fixtureTerm({ note: 'Editorial seed: filler as a phenomenon.' }))).toBe(
      'On the list since 2 September 2026, put there by hand — Editorial seed: filler as a phenomenon.',
    )
  })

  it('carries the origin into the linked list above the table', () => {
    const links = termLinks(fixtureTerms().terms)
    expect(links.find((l) => l.slug === 'agentic-commerce')!.originMark).toBe('by the run')
    expect(links.find((l) => l.slug === 'loop-engineering')!.originMark).toBe('by hand')
  })
})

describe('the promotions of a run', () => {
  it('reads a file without the key as nothing promoted, and says nothing about it', () => {
    const older = fixtureTerms()
    expect(older.promoted).toBeUndefined()
    expect(promotedTerms(older)).toEqual([])
    expect(promotedItems(older)).toEqual([])
    expect(promotedRows(older)).toEqual([])
    expect(promotionSentence(older)).toBe('')
    expect(promotionSentence(fixtureTerms({ promoted: [] }))).toBe('')
  })

  it('states the evidence that promoted each term, and links its page', () => {
    const items = promotedItems(fixtureTerms({ promoted: fixturePromoted() }))
    expect(items.map((i) => i.term)).toEqual(['context compaction', 'eval harness'])
    expect(items[0].href).toBe('/trending/topics/context-compaction/')
    expect(items[0].days).toBe('3')
    expect(items[0].platformCount).toBe('3')
    expect(items[0].platforms).toBe('Hacker News · GitHub · Google News')
    expect(items[0].ratio).toBe('4.2×')
    expect(items[0].evidence).toBe(
      'Proposed on 3 days in a row, on 3 platforms: Hacker News, GitHub, Google News.',
    )
  })

  it('refuses to invent a pace for a promotion that had nothing to compare against', () => {
    const items = promotedItems(fixtureTerms({ promoted: fixturePromoted() }))
    expect(items[1].ratio).toBeNull()
    expect(promotedRows(fixtureTerms({ promoted: fixturePromoted() }))[1].pace).toBe('—')
  })

  it('says the counts start with the next run, in the singular and the plural', () => {
    const two = promotionSentence(fixtureTerms({ promoted: fixturePromoted() }))
    expect(two).toContain('2 terms joined the watchlist this morning')
    expect(two).toContain('counts start with the next run')
    const one = promotionSentence(fixtureTerms({ promoted: [fixturePromoted()[0]] }))
    expect(one).toContain('One term joined the watchlist this morning')
    expect(one).toContain('Its counts start with the next run')
  })

  it('has a plain-text floor with the same four facts', () => {
    const rows = promotedRows(fixtureTerms({ promoted: fixturePromoted() }))
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      term: 'context compaction',
      days: '3',
      platforms: 'Hacker News · GitHub · Google News',
      pace: '4.2×',
      note: 'promoted 2026-09-03: proposed on three consecutive days, three platforms',
    })
    for (const row of rows) for (const v of Object.values(row)) expect(['string', 'number']).toContain(typeof v)
  })

  it('states the promotion rule with all five of its conditions', () => {
    for (const clause of [
      'three days in a row',
      'at least two platforms',
      'never struck before',
      'at most three promotions in one run',
      'thirty-five tracked terms',
    ]) {
      expect(PROMOTION_RULE, `the rule no longer says "${clause}"`).toContain(clause)
    }
  })

  it('states the other direction, and who overrides both', () => {
    for (const clause of [
      'lets go of what it added',
      'quiet or fading on every run for three weeks',
      'never struck that way',
      'A person overrides both directions',
      'never returns',
      'tombstone',
    ]) {
      expect(RETIREMENT_RULE, `the rule no longer says "${clause}"`).toContain(clause)
    }
    expect(GOVERNANCE_RULE).toContain(PROMOTION_RULE)
    expect(GOVERNANCE_RULE).toContain(RETIREMENT_RULE)
  })
})

describe('what the run let go of', () => {
  it('reads a file without the key as nothing let go, and says nothing about it', () => {
    const older = fixtureTerms()
    expect(older.let_go).toBeUndefined()
    expect(letGoTerms(older)).toEqual([])
    expect(letGoItems(older)).toEqual([])
    expect(letGoRows(older)).toEqual([])
    expect(letGoSentence(older)).toBe('')
    expect(letGoSentence(fixtureTerms({ let_go: [] }))).toBe('')
  })

  it('names each term with the days it stood still, and the reason from the file', () => {
    const items = letGoItems(fixtureTerms({ let_go: fixtureLetGo() }))
    expect(items.map((i) => i.term)).toEqual(['mac studio'])
    expect(items[0].days).toBe('21')
    expect(items[0].evidence).toBe('Quiet or fading on every run for 21 days.')
    expect(items[0].note).toBe('let go 2026-09-24: quiet for 21 days running')
    const rows = letGoRows(fixtureTerms({ let_go: fixtureLetGo() }))
    expect(rows[0]).toEqual({ term: 'mac studio', days_quiet: '21', note: 'let go 2026-09-24: quiet for 21 days running' })
    for (const row of rows) for (const v of Object.values(row)) expect(['string', 'number']).toContain(typeof v)
  })

  it('says the run withdrew its own additions, and that they cannot come back', () => {
    const one = letGoSentence(fixtureTerms({ let_go: fixtureLetGo() }))
    expect(one).toContain('One term the run had promoted was let go this morning')
    expect(one).toContain('tombstone')
    expect(one).toContain('cannot be promoted again')
    const two = letGoSentence(fixtureTerms({ let_go: [...fixtureLetGo(), { slug: 'zebra-week', term: 'zebra week', days_quiet: 30, note: '' }] }))
    expect(two).toContain('2 terms the run had promoted were let go this morning')
    expect(two).toContain('tombstones')
  })

  it('knows whether a run changed the list in either direction', () => {
    expect(listChanged(fixtureTerms())).toBe(false)
    expect(listChanged(fixtureTerms({ promoted: [], let_go: [] }))).toBe(false)
    expect(listChanged(fixtureTerms({ promoted: fixturePromoted() }))).toBe(true)
    expect(listChanged(fixtureTerms({ let_go: fixtureLetGo() }))).toBe(true)
  })
})

describe('the terms that have been struck', () => {
  it('keeps the tombstones and nothing else', () => {
    const struck = retiredEntries(fixtureWatchlist())
    expect(struck.map((e) => e.slug)).toEqual(['prompt-kung-fu'])
  })

  it('says how many were struck and why their lines are still in the file', () => {
    const one = retiredSentence(fixtureWatchlist())
    expect(one).toContain('One term has been struck')
    expect(one).toContain('tombstone')
    expect(one).toContain('prompt kung fu')
    const two = retiredSentence(
      fixtureWatchlist([
        { term: 'zebra week', slug: 'zebra-week', aliases: [], added: '2026-09-01', origin: 'discovered', note: '', wikipedia_article: null, retired: '2026-09-05' },
      ]),
    )
    expect(two).toContain('2 terms have been struck')
    expect(two).toContain('tombstones')
    expect(retiredEntries(fixtureWatchlist()).length).toBe(1)
  })

  it('says nothing at all when nobody has struck anything, and survives no watchlist file', () => {
    expect(retiredSentence([])).toBe('')
    expect(retiredSentence(fixtureWatchlist().filter((e) => e.retired === undefined))).toBe('')
  })
})

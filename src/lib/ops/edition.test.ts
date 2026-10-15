import { describe, expect, it } from 'vitest'
import type { FeedEntry } from './house-feed'
import {
  arrivalsByDay,
  asOfInstant,
  daysBefore,
  editionInstant,
  entryInstant,
  lineOf,
  newestOf,
  newestPieces,
  sinceDays,
  withoutHouseSuffix,
} from './edition'

const at = (iso: string) => Date.parse(iso)

const row = (over: Partial<FeedEntry>): FeedEntry => ({
  date: '2026-10-10',
  time: null,
  source: 'reading',
  house: 'lab',
  houseName: 'The Lab',
  title: 'a row',
  fact: null,
  kind: 'reading',
  href: '/x',
  withdrawn: false,
  voice: null,
  ...over,
})

describe('the as-of stamp', () => {
  it('reads the shape the pulse writes', () => {
    expect(asOfInstant('2026-10-10 12:46 UTC')).toBe(at('2026-10-10T12:46:00Z'))
  })
  it('is null for anything else, rather than a guess', () => {
    for (const bad of ['', '2026-10-10', '2026-10-10T12:46:00Z', '10 October 2026', '2026-13-40 99:99 UTC']) {
      expect(asOfInstant(bad)).toBeNull()
    }
  })
})

describe('the edition instant', () => {
  it('is the pulse’s stamp while nothing in the feed is newer', () => {
    const feed = [row({ date: '2026-10-10', time: '2026-10-10T10:00:00.000Z' }), row({ date: '2026-10-09' })]
    expect(editionInstant(feed, '2026-10-10 12:46 UTC')).toBe(at('2026-10-10T12:46:00Z'))
  })

  it('is the newest row once the feed is ahead of the pulse — the morning after', () => {
    const feed = [row({ date: '2026-10-11' }), row({ date: '2026-10-10', time: '2026-10-10T13:03:53.000Z' })]
    expect(editionInstant(feed, '2026-10-10 12:46 UTC')).toBe(at('2026-10-11T00:00:00Z'))
  })

  it('stands a row that names no hour at the start of its day', () => {
    expect(entryInstant(row({ date: '2026-10-10' }))).toBe(at('2026-10-10T00:00:00Z'))
    expect(entryInstant(row({ date: '2026-10-10', time: 'not a time' }))).toBe(at('2026-10-10T00:00:00Z'))
  })

  it('does not depend on the order the rows come in', () => {
    const feed = [row({ date: '2026-10-08' }), row({ date: '2026-10-11' }), row({ date: '2026-10-09' })]
    expect(editionInstant(feed, 'unreadable')).toBe(at('2026-10-11T00:00:00Z'))
  })

  it('refuses to date an edition by nothing', () => {
    expect(() => editionInstant([], 'unreadable')).toThrow(/carries a date/)
  })
})

describe('the days of arrivals', () => {
  const feed = [
    ...Array.from({ length: 9 }, (_, i) => row({ date: '2026-10-10', title: `ten-${i}` })),
    row({ date: '2026-10-09', title: 'nine' }),
    row({ date: '2026-10-07', title: 'seven' }),
    row({ date: '2026-09-01', title: 'long ago' }),
  ]

  it('groups by day, newest first, from the first day asked for', () => {
    const days = sinceDays(feed, '2026-10-07', 7)
    expect(days.map((d) => d.date)).toEqual(['2026-10-10', '2026-10-09', '2026-10-07'])
  })

  it('cuts a day to its first rows, keeps their order, and counts the rest', () => {
    const [ten] = sinceDays(feed, '2026-10-07', 7)
    expect(ten.count).toBe(9)
    expect(ten.rows.map((r) => r.title)).toEqual(['ten-0', 'ten-1', 'ten-2', 'ten-3', 'ten-4', 'ten-5', 'ten-6'])
    expect(ten.more).toBe(2)
  })

  it('says zero more for a day that fits', () => {
    expect(sinceDays(feed, '2026-10-09', 7)[1]).toMatchObject({ date: '2026-10-09', count: 1, more: 0 })
  })

  it('counts every arrival of a day, for a longer stretch than it lists', () => {
    expect(arrivalsByDay(feed, '2026-09-01')).toEqual({ '2026-10-10': 9, '2026-10-09': 1, '2026-10-07': 1, '2026-09-01': 1 })
    expect(arrivalsByDay(feed, '2026-10-08')).toEqual({ '2026-10-10': 9, '2026-10-09': 1 })
  })

  it('steps back whole days, across a month', () => {
    expect(daysBefore('2026-10-10', 1)).toBe('2026-10-09')
    expect(daysBefore('2026-10-01', 1)).toBe('2026-09-30')
    expect(daysBefore('2026-10-10', 0)).toBe('2026-10-10')
  })
})

describe('the lead’s pieces', () => {
  const feed = [
    row({ house: 'atelier', source: 'artifact', date: '2026-10-10', title: 'The Hinge — the Atelier' }),
    row({ house: 'atelier', source: 'artifact', date: '2026-10-09', title: 'How near — the Atelier' }),
    row({ house: 'field', source: 'artifact', date: '2026-10-09', title: 'before the cycle' }),
    row({ house: 'studio', source: 'work', date: '2026-10-10', title: 'taken back', withdrawn: true }),
    row({ house: 'studio', source: 'work', date: '2026-10-10', title: 'AFTER IT PASSED' }),
    row({ house: 'studio', source: 'relay', date: '2026-10-10', title: 'not a piece' }),
  ]
  const pieces = newestPieces(feed, ['atelier', 'field', 'studio'], '2026-10-10')

  it('takes each practice’s newest piece since the cycle opened', () => {
    expect(pieces.atelier?.title).toBe('The Hinge — the Atelier')
    expect(pieces.studio?.title).toBe('AFTER IT PASSED')
  })

  it('draws an absence rather than reaching back into the cycle before', () => {
    expect(pieces.field).toBeNull()
  })

  it('passes over what a practice withdrew, and what is not a piece', () => {
    expect(pieces.studio?.title).not.toBe('taken back')
    expect(newestPieces([feed[5]], ['studio'], '2026-10-01').studio).toBeNull()
  })

  it('takes the later of two pieces of one day where the record names the hour', () => {
    const two = [
      row({ house: 'field', source: 'artifact', title: 'early', time: '2026-10-10T03:00:00.000Z' }),
      row({ house: 'field', source: 'presentation', title: 'late', time: '2026-10-10T07:00:00.000Z' }),
    ]
    expect(newestPieces(two, ['field'], '2026-10-10').field?.title).toBe('late')
  })
})

describe('a title under its own house’s heading', () => {
  it('drops a trailing “— the <house>”', () => {
    expect(withoutHouseSuffix('The Hinge — the Atelier', 'The Atelier')).toBe('The Hinge')
    expect(withoutHouseSuffix('How near – The Atelier', 'The Atelier')).toBe('How near')
    expect(withoutHouseSuffix('Window - Atelier', 'The Atelier')).toBe('Window')
  })
  it('leaves everything else alone', () => {
    expect(withoutHouseSuffix('The Atelier — a window', 'The Atelier')).toBe('The Atelier — a window')
    expect(withoutHouseSuffix('Who Keeps the Close Calls', 'The Field')).toBe('Who Keeps the Close Calls')
    expect(withoutHouseSuffix('Notes — the Field', 'The Atelier')).toBe('Notes — the Field')
  })
})

describe('a row as one line', () => {
  it('states the fact beside the title where the record carries one', () => {
    expect(lineOf({ title: 'Common Ground', fact: '12 converging' })).toBe('Common Ground · 12 converging')
    expect(lineOf({ title: 'AFTER IT PASSED', fact: null })).toBe('AFTER IT PASSED')
  })
  it('does not say a name twice where the fact already opens with it', () => {
    expect(lineOf({ title: 'The Foreknown', fact: 'The Foreknown stopped recording after 50 nights.' })).toBe(
      'The Foreknown stopped recording after 50 nights.',
    )
  })
})

describe('the newest row of a house', () => {
  const feed = [
    row({ house: 'lab', date: '2026-10-10', title: 'first of the day' }),
    row({ house: 'catalogues', date: '2026-10-10', title: 'second of the day' }),
    row({ house: 'lab', date: '2026-10-11', title: 'newer' }),
    row({ house: 'n-1', date: '2026-10-12', title: 'another house' }),
  ]

  it('is the newest among the houses asked for', () => {
    expect(newestOf(feed, ['lab', 'catalogues'])?.title).toBe('newer')
    expect(newestOf(feed, ['n-1'])?.title).toBe('another house')
  })

  it('keeps the feed’s own order between rows of one day that name no hour', () => {
    expect(newestOf(feed.slice(0, 2), ['lab', 'catalogues'])?.title).toBe('first of the day')
  })

  it('is null for a house with nothing in the stream', () => {
    expect(newestOf(feed, ['attention'])).toBeNull()
  })
})

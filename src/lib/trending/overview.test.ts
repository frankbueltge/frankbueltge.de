import { describe, expect, it } from 'vitest'
import { getTrendingDays } from './data'
import { fixtureDay } from './fixtures'
import {
  STAY_STEPS,
  TILE_SPARK,
  ageText,
  archiveCalendar,
  calendarLevel,
  dayStats,
  leadRows,
  statSeries,
  stayWeight,
  stayedModel,
  tileSpark,
} from './overview'
import type { TrendingDay } from './types'

/** A day with the given crossings: [id, label, sources that carried it]. */
function dayOn(date: string, topics: [id: string, label: string, n: number][] = []): TrendingDay {
  const base = fixtureDay().topics[0]!
  return fixtureDay({
    date,
    topics: topics.map(([id, label, n]) => ({
      ...base,
      id,
      label,
      platform_count: n,
      platforms: Array.from({ length: n }, (_, i) => `source_${i}`),
      first_seen: date,
      days_hot: 1,
    })),
  })
}

describe('the numbers of a morning', () => {
  it('counts lines, sources and crossings out of the day file', () => {
    expect(dayStats(fixtureDay())).toEqual({
      signals: 3,
      sourcesOk: 2,
      sourcesTotal: 3,
      converging: 1,
      widest: 2,
      seenBefore: 1,
    })
  })

  it('reads a morning on which nothing crossed as zero, not as missing', () => {
    const stats = dayStats(dayOn('2026-09-02'))
    expect(stats.converging).toBe(0)
    expect(stats.widest).toBe(0)
    expect(stats.seenBefore).toBe(0)
  })

  it('takes the last committed days up to the page, oldest first, and no day after it', () => {
    const days = ['2026-09-05', '2026-09-02', '2026-09-04', '2026-09-03'].map((d) => dayOn(d))
    expect(statSeries(days, '2026-09-04', 2).map((p) => p.date)).toEqual(['2026-09-03', '2026-09-04'])
    expect(statSeries(days, '2026-09-04').map((p) => p.date)).toEqual(['2026-09-02', '2026-09-03', '2026-09-04'])
  })
})

describe('a tile line', () => {
  it('stands on zero, so two close counts stay close', () => {
    const spark = tileSpark([33, 32])
    const top = TILE_SPARK.pad
    expect(spark.baseY).toBe(TILE_SPARK.height - TILE_SPARK.pad)
    expect(spark.d).toBe(`M${TILE_SPARK.pad} ${top} L${TILE_SPARK.width - TILE_SPARK.pad} ${spark.last!.y}`)
    // 32 of 33 is a step of about half a unit on an eighteen-unit scale, not a fall to the floor.
    expect(spark.last!.y - top).toBeLessThan(1)
  })

  it('ends on the newest value and reports the range it drew', () => {
    const spark = tileSpark([0, 10, 5])
    expect(spark.runs).toBe(3)
    expect(spark.min).toBe(0)
    expect(spark.max).toBe(10)
    expect(spark.last).toEqual({ x: TILE_SPARK.width - TILE_SPARK.pad, y: 11 })
  })

  it('draws a flat line on the floor when every count is zero, and nothing for no days', () => {
    const flat = tileSpark([0, 0])
    expect(flat.last!.y).toBe(flat.baseY)
    const none = tileSpark([])
    expect(none.d).toBe('')
    expect(none.last).toBeNull()
  })
})

describe('the crossings, ranked', () => {
  it('lists only the crossings, in file order, with their sources in the order of the ledger', () => {
    const rows = leadRows(fixtureDay())
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      id: 'usps-mail-ballots',
      rank: 1,
      platformCount: 2,
      daysHot: 2,
      firstSeen: '2026-09-01',
      seenBefore: true,
    })
    // The file lists the platforms alphabetically; the row follows the day's own source order.
    expect(rows[0]!.sources).toEqual([
      { id: 'google_trends', label: 'Google Trends' },
      { id: 'bluesky', label: 'Bluesky' },
    ])
  })

  it('says how long the ledger has known a crossing, in the ledger’s own two numbers', () => {
    expect(ageText({ seenBefore: false, daysHot: 1, firstSeen: '2026-11-14' })).toBe('new this morning')
    expect(ageText({ seenBefore: true, daysHot: 3, firstSeen: '2026-11-12' })).toBe('3 mornings in a row · first seen 12 Nov')
    // Back after a gap: a run of one and an earlier first sighting. It is not new.
    expect(ageText({ seenBefore: true, daysHot: 1, firstSeen: '2026-10-21' })).toBe('back again · first seen 21 Oct')
  })
})

describe('what stayed', () => {
  it('steps a mark by how many sources carried the topic', () => {
    expect(stayWeight(STAY_STEPS.light)).toBe(1)
    expect(stayWeight(STAY_STEPS.medium)).toBe(2)
    expect(stayWeight(STAY_STEPS.heavy - 1)).toBe(2)
    expect(stayWeight(STAY_STEPS.heavy)).toBe(3)
    expect(stayWeight(12)).toBe(3)
  })

  it('keeps the topics that crossed on at least two mornings, one cell per committed day', () => {
    const days = [
      dayOn('2026-09-01', [['el-nino', 'El Niño', 2]]),
      dayOn('2026-09-02', [['one-off', 'One morning only', 4]]),
      dayOn('2026-09-04', [['el-nino', 'El Niño', 5]]),
    ]
    const model = stayedModel(days, '2026-09-04')
    // 2026-09-03 has no file: it is absent from the columns, not an empty one.
    expect(model.dates).toEqual(['2026-09-01', '2026-09-02', '2026-09-04'])
    expect(model.total).toBe(1)
    expect(model.rows[0]).toMatchObject({ id: 'el-nino', mornings: 2, peak: 5, last: '2026-09-04', onDay: true })
    expect(model.rows[0]!.cells).toEqual([
      { date: '2026-09-01', n: 2, weight: 1 },
      { date: '2026-09-02', n: null, weight: null },
      { date: '2026-09-04', n: 5, weight: 3 },
    ])
  })

  it('follows a topic that another source names differently on its second morning', () => {
    const days = [
      dayOn('2026-09-03', [['gloria-steinem', 'gloria steinem', 4]]),
      dayOn('2026-09-04', [['death-of-gloria-steinem', 'Death of Gloria Steinem', 3]]),
    ]
    const model = stayedModel(days, '2026-09-04')
    expect(model.rows).toHaveLength(1)
    // One row, under the name of the most recent morning; the earlier name opens no row of its own.
    expect(model.rows[0]).toMatchObject({ id: 'death-of-gloria-steinem', label: 'Death of Gloria Steinem', mornings: 2 })
    expect(model.rows[0]!.cells.map((c) => c.n)).toEqual([4, 3])
  })

  it('takes the topic with the same id where several of one morning match, otherwise the widest', () => {
    const days = [
      dayOn('2026-09-02', [
        ['gloria-steinem-dies', 'Gloria Steinem dies', 6],
        ['gloria-steinem', 'gloria steinem', 2],
      ]),
      dayOn('2026-09-03', [
        ['steinem-gloria', 'Steinem, Gloria', 2],
        ['gloria-steinem-dies', 'Gloria Steinem dies', 5],
      ]),
      dayOn('2026-09-04', [['gloria-steinem', 'gloria steinem', 3]]),
    ]
    const model = stayedModel(days, '2026-09-04')
    expect(model.rows.map((r) => r.id)).toEqual(['gloria-steinem'])
    expect(model.rows[0]!.cells.map((c) => c.n)).toEqual([2, 5, 3])
  })

  it('asks every earlier morning about the anchor, never about a resemblance of a resemblance', () => {
    // b shares enough words with a and with c; a and c share too few with each other.
    const days = [
      dayOn('2026-09-02', [['c', 'gamma delta', 2]]),
      dayOn('2026-09-03', [['b', 'beta gamma delta', 2]]),
      dayOn('2026-09-04', [['a', 'alpha beta gamma', 2]]),
    ]
    const model = stayedModel(days, '2026-09-04')
    expect(model.rows.map((r) => r.id)).toEqual(['a'])
    expect(model.rows[0]!.cells.map((c) => c.n)).toEqual([null, 2, 2])
  })

  it('shows a topic that is no longer crossing, anchored at its last morning', () => {
    const days = [
      dayOn('2026-09-01', [['wendell-berry', 'Wendell Berry', 3]]),
      dayOn('2026-09-02', [['wendell-berry', 'Wendell Berry', 2]]),
      dayOn('2026-09-03', [['el-nino', 'El Niño', 2]]),
    ]
    const model = stayedModel(days, '2026-09-03')
    expect(model.rows).toHaveLength(1)
    expect(model.rows[0]).toMatchObject({ id: 'wendell-berry', last: '2026-09-02', onDay: false, mornings: 2, peak: 3 })
  })

  it('puts the rows still alive first, then the longer and the wider ones', () => {
    const days = [
      dayOn('2026-09-01', [['old', 'Harbour strike', 9], ['long', 'Glacier survey', 2], ['wide', 'Orchard frost', 2]]),
      dayOn('2026-09-02', [['old', 'Harbour strike', 9], ['long', 'Glacier survey', 2]]),
      dayOn('2026-09-03', [['long', 'Glacier survey', 2], ['wide', 'Orchard frost', 7]]),
    ]
    expect(stayedModel(days, '2026-09-03').rows.map((r) => r.id)).toEqual(['long', 'wide', 'old'])
  })

  it('reads no day after the page’s own, and no more days than the window', () => {
    const days = [
      dayOn('2026-09-01', [['t', 'Tipping point', 2]]),
      dayOn('2026-09-02', [['t', 'Tipping point', 2]]),
      dayOn('2026-09-03', [['t', 'Tipping point', 2]]),
      dayOn('2026-09-04', [['t', 'Tipping point', 2]]),
    ]
    expect(stayedModel(days, '2026-09-03').dates).toEqual(['2026-09-01', '2026-09-02', '2026-09-03'])
    const narrow = stayedModel(days, '2026-09-04', 2)
    expect(narrow.dates).toEqual(['2026-09-03', '2026-09-04'])
    expect(narrow.rows[0]!.mornings).toBe(2)
  })

  it('caps the rows it hands out and says how many it kept back', () => {
    const topics = Array.from({ length: 5 }, (_, i): [string, string, number] => [`t${i}`, `Topic number${i}`, 2])
    const model = stayedModel([dayOn('2026-09-01', topics), dayOn('2026-09-02', topics)], '2026-09-02', 14, 3)
    expect(model.rows).toHaveLength(3)
    expect(model.more).toBe(2)
    expect(model.total).toBe(5)
  })

  it('draws every run the ledger counts: a crossing said to be in a row has its row', () => {
    // The promise of the block on the real archive: wherever a committed morning says "N mornings
    // in a row" about a crossing, the grid of that morning shows the row, with a mark on the
    // morning itself and on the one before. Checked on the days through 2026-11-14, on which
    // memory.test.ts holds the site's reading of the rule to the pipeline's without exception.
    const days = getTrendingDays().filter((d) => d.date <= '2026-11-14')
    const missing: string[] = []
    let runs = 0
    for (const day of days) {
      const model = stayedModel(days, day.date, 14, Number.MAX_SAFE_INTEGER)
      for (const t of day.topics) {
        if (t.platform_count < 2 || t.days_hot < 2) continue
        runs++
        const row = model.rows.find((r) => r.id === t.id && r.onDay)
        const tail = row?.cells.slice(-2).map((c) => c.n !== null)
        if (!row || tail?.length !== 2 || !tail.every(Boolean)) missing.push(`${day.date} ${t.id}`)
      }
    }
    expect(runs).toBeGreaterThan(100)
    expect(missing).toEqual([])
  })
})

describe('the archive as a calendar', () => {
  const days = [
    dayOn('2026-11-02', [['a', 'Alpha one', 2]]),
    dayOn('2026-11-01', []),
    dayOn('2026-10-31', [['a', 'Alpha one', 2], ['b', 'Bravo two', 2], ['c', 'Charlie three', 2]]),
    dayOn('2026-10-05', [['a', 'Alpha one', 2], ['b', 'Bravo two', 2]]),
  ]
  const model = archiveCalendar(days)

  it('lays the months newest first, in Monday-first weeks padded to full rows', () => {
    expect(model.days).toBe(4)
    expect(model.months.map((m) => m.key)).toEqual(['2026-11', '2026-10'])
    expect(model.months.map((m) => m.label)).toEqual(['November 2026', 'October 2026'])
    expect(model.months.map((m) => m.committed)).toEqual([2, 2])
    const november = model.months[0]!
    // 1 November 2026 is a Sunday: six empty slots, then the first.
    expect(november.weeks[0]!.map((c) => c?.dayOfMonth ?? null)).toEqual([null, null, null, null, null, null, 1])
    expect(november.weeks.every((w) => w.length === 7)).toBe(true)
    expect(november.weeks.flat().filter(Boolean)).toHaveLength(30)
  })

  it('tells a morning with no crossing from a day with no file', () => {
    const cells = model.months[0]!.weeks.flat()
    const first = cells.find((c) => c?.date === '2026-11-01')!
    const third = cells.find((c) => c?.date === '2026-11-03')!
    expect(first.converging).toBe(0)
    expect(first.level).toBe(1)
    expect(third.converging).toBeNull()
    expect(third.level).toBe(0)
  })

  it('shades by quarters of the archive’s own counts and hands out the cut points', () => {
    // Counts 0, 1, 2, 3: the nearest-rank quartiles are values that occurred.
    expect(model.cuts).toEqual([0, 1, 2])
    expect(calendarLevel(0, model.cuts)).toBe(1)
    expect(calendarLevel(1, model.cuts)).toBe(2)
    expect(calendarLevel(2, model.cuts)).toBe(3)
    expect(calendarLevel(3, model.cuts)).toBe(4)
  })

  it('holds every committed day of the real archive exactly once', () => {
    const real = getTrendingDays()
    const calendar = archiveCalendar(real)
    const dated = calendar.months.flatMap((m) => m.weeks.flat()).filter((c) => c && c.converging !== null)
    expect(calendar.days).toBe(real.length)
    expect(dated.map((c) => c!.date).sort()).toEqual(real.map((d) => d.date).sort())
  })
})

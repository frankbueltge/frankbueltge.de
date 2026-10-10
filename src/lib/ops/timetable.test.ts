import { describe, expect, it } from 'vitest'
import type { PulseSnapshot } from '@/lib/pulse/render'
import pulseData from '@/data/pulse/pulse.json'
import { buildTimetable, isoWeekStart, stripPath } from './timetable'

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10)

describe('isoWeekStart', () => {
  it('is the Monday of the ISO week', () => {
    expect(day(isoWeekStart(2026, 41))).toBe('2026-10-05')
    expect(new Date(isoWeekStart(2026, 41)).getUTCDay()).toBe(1)
  })
  it('follows ISO 8601 across a year boundary: week 1 holds the fourth of January', () => {
    expect(day(isoWeekStart(2026, 1))).toBe('2025-12-29')
    expect(day(isoWeekStart(2027, 1))).toBe('2027-01-04')
    expect(day(isoWeekStart(2026, 53))).toBe('2026-12-28')
  })
})

/** two weeks of four-hour blocks: six blocks a day, forty-two a week */
const week = (fill: (bin: number) => number) => Array.from({ length: 42 }, (_, i) => fill(i))
const snapshot: PulseSnapshot = {
  schema_version: 'test',
  generated_at: '2026-10-07T09:00:00Z',
  as_of: '2026-10-07 09:00 UTC',
  bin_hours: 4,
  bins_per_week: 42,
  repos: ['a', 'b'],
  total_commits: 0,
  weeks: [
    { iso_year: 2026, iso_week: 40, bins: week(() => 1), by_repo: { a: week(() => 1) } },
    {
      iso_year: 2026,
      iso_week: 41,
      bins: week(() => 0),
      // Monday and Tuesday whole, Wednesday three blocks in (00, 04 and 08 have begun)
      cutoff_bin: 15,
      by_repo: { a: week((i) => (i === 0 ? 2 : i === 5 ? 7 : i === 14 ? 1 : 0)), b: week((i) => (i === 7 ? 3 : 0)) },
    },
  ],
}

describe('buildTimetable', () => {
  const table = buildTimetable(snapshot, ['a', 'b', 'c'], 4)

  it('ends on the last day the snapshot has begun, and runs back from it', () => {
    expect(table.days).toEqual(['2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'])
  })

  it('reads the block size off the snapshot', () => {
    expect(table.blockHours).toBe(4)
    expect(table.blocksPerDay).toBe(6)
  })

  it('gives the first and the last active block of a day as hours', () => {
    const monday = table.rows[0].cells[1]
    expect(monday.active).toEqual([0, 5])
    expect(monday.from).toBe(0)
    expect(monday.to).toBe(24)
    expect(monday.commits).toBe(9)
  })

  it('draws only the blocks that have begun on the last day — it forecasts nothing', () => {
    const today = table.rows[0].cells[3]
    expect(today.blocks).toEqual([0, 0, 1])
    expect(today.from).toBe(8)
    expect(today.to).toBe(12)
  })

  it('reads a repository absent from a week as days on which nothing ran', () => {
    const b = table.rows[1]
    expect(b.cells[0].commits).toBe(0)
    expect(b.cells[0].from).toBeNull()
    expect(b.cells[2].active).toEqual([1])
    expect(b.commits).toBe(3)
  })

  it('keeps a row for a repository the snapshot never counted, and says nothing ran', () => {
    expect(table.rows[2].cells.every((c) => c.commits === 0)).toBe(true)
  })

  it('contributes no days from a week that carries no split', () => {
    const old: PulseSnapshot = { ...snapshot, weeks: [{ iso_year: 2026, iso_week: 39, bins: week(() => 1) }, ...snapshot.weeks] }
    expect(buildTimetable(old, ['a'], 30).days[0]).toBe('2026-09-28')
  })
})

describe('the committed snapshot', () => {
  const pulse = pulseData as PulseSnapshot
  const table = buildTimetable(pulse, pulse.repos, 7)

  it('ends on the day of its own as-of stamp', () => {
    expect(table.days.at(-1)).toBe(pulse.as_of.slice(0, 10))
    expect(table.days).toHaveLength(7)
  })

  it('counts, per day and repository, exactly the commits the split holds', () => {
    const last = pulse.weeks.at(-1)!
    for (const row of table.rows) {
      const lastDay = row.cells.at(-1)!
      const own = last.by_repo?.[row.repo] ?? []
      const dayIndex = Math.floor(((last.cutoff_bin ?? pulse.bins_per_week) - 1) / table.blocksPerDay)
      const expected = own.slice(dayIndex * table.blocksPerDay, (dayIndex + 1) * table.blocksPerDay).reduce((a, b) => a + b, 0)
      expect(lastDay.commits).toBe(expected)
    }
  })
})

describe('stripPath', () => {
  it('stands one bar per active block on the floor of the box', () => {
    expect(stripPath([0, 1, 0, 4], 16)).toBe('M1 10h1v6h-1zM3 7h1v9h-1z')
  })
  it('caps a loud block at the height of the box', () => {
    expect(stripPath([400], 16)).toBe('M0 0h1v16h-1z')
  })
  it('is an empty path for a day on which nothing ran', () => {
    expect(stripPath([0, 0, 0])).toBe('')
  })
})

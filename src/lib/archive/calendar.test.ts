import { describe, expect, it } from 'vitest'
import { dailyCalendar, daysBetween, monthTicks, shortDay } from './calendar'

const rec = (date: string) => ({ date, value: 1 })

describe('dailyCalendar', () => {
  it('returns an empty axis for an empty file set', () => {
    expect(dailyCalendar({}, 'test')).toEqual([])
  })

  it('ignores files that are not named like a day (latest.json, register.json)', () => {
    const days = dailyCalendar(
      {
        '/src/data/x/latest.json': { default: rec('2026-08-03') },
        '/src/data/x/register.json': { default: { date: 'not a day' } },
        '/src/data/x/2026-08-03.json': { default: rec('2026-08-03') },
      },
      'test',
    )
    expect(days).toEqual([{ date: '2026-08-03', record: rec('2026-08-03') }])
  })

  it('accepts both module-shaped and plain glob entries', () => {
    const days = dailyCalendar({ 'a/2026-08-03.json': rec('2026-08-03') }, 'test')
    expect(days[0].record).toEqual(rec('2026-08-03'))
  })

  it('runs oldest first, every calendar day, and a day without a file is a visible gap', () => {
    const days = dailyCalendar(
      {
        'a/2026-08-03.json': { default: rec('2026-08-03') },
        'a/2026-07-31.json': { default: rec('2026-07-31') },
      },
      'test',
    )
    expect(days.map((d) => [d.date, d.record === null])).toEqual([
      ['2026-07-31', false],
      ['2026-08-01', true],
      ['2026-08-02', true],
      ['2026-08-03', false],
    ])
  })

  it('fails loudly when a file name and its record disagree', () => {
    expect(() => dailyCalendar({ 'a/2026-08-03.json': { default: rec('2026-08-02') } }, 'test')).toThrow(/disagree/)
  })

  it('does not read a date out of the middle of a file name', () => {
    expect(dailyCalendar({ 'a/copy-of-2026-08-03.json': { default: rec('2026-08-03') } }, 'test')).toEqual([])
  })
})

describe('day helpers', () => {
  it('counts calendar days across month ends and DST changes', () => {
    expect(daysBetween('2026-09-14', '2026-10-17')).toBe(33)
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
    expect(daysBetween('2026-08-15', '2026-08-15')).toBe(0)
  })

  it('labels a day without a clock', () => {
    expect(shortDay('2026-09-01')).toBe('1 Sep')
    expect(shortDay('2026-12-31')).toBe('31 Dec')
    expect(shortDay('nonsense')).toBe('nonsense')
  })

  it('ticks every first of the month, and the ends only where their label has room', () => {
    const dates = ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03']
    const ticks = monthTicks(dates, (i) => i * 10, 15)
    // 30 Aug sits 20 px from 1 Sep (room), 3 Sep only 20 px away as well (room)
    expect(ticks.map((t) => t.label)).toEqual(['30 Aug', '1 Sep', '3 Sep'])
    const crowded = monthTicks(dates, (i) => i * 10, 25)
    expect(crowded.map((t) => t.label)).toEqual(['1 Sep'])
  })
})

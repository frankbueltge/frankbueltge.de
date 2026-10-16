import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dataAge, ageStamp, overdueNotice } from './data-age'

const now = new Date('2026-08-22T14:54:29Z')

describe('dataAge', () => {
  it('flags the reading #723 found: 26 days old on a weekly instrument', () => {
    const a = dataAge('2026-07-27T09:59:25+00:00', 'weekly', now)
    expect(a).toEqual({ readingDate: '2026-07-27', days: 26, cadence: 'weekly', overdue: true })
    expect(overdueNotice(a)).toContain('newest reading is from 2026-07-27, 26 days old')
  })

  it('leaves a weekly reading alone until a week and a day have passed', () => {
    expect(dataAge('2026-08-17T12:00:00+00:00', 'weekly', now).overdue).toBe(false)
    expect(dataAge('2026-08-14T14:54:28+00:00', 'weekly', now).overdue).toBe(true)
  })

  it('gives a daily instrument one day of slack, not more', () => {
    expect(dataAge('2026-08-21T06:00:00+00:00', 'daily', now).overdue).toBe(false)
    expect(dataAge('2026-08-20T14:54:28+00:00', 'daily', now).overdue).toBe(true)
  })

  it('never reports a negative age', () => {
    expect(dataAge('2026-08-23T00:00:00+00:00', 'daily', now).days).toBe(0)
  })

  it('refuses an unreadable timestamp instead of calling it fresh', () => {
    expect(() => dataAge('', 'daily', now)).toThrow(/unreadable/)
  })

  it('stamps the reading in words', () => {
    expect(ageStamp(dataAge('2026-08-21T06:00:00+00:00', 'daily', now))).toBe(
      'Reading of 2026-08-21 (1 day ago) · refreshed daily',
    )
    expect(ageStamp(dataAge('2026-08-22T06:00:00+00:00', 'daily', now))).toBe(
      'Reading of 2026-08-22 (today) · refreshed daily',
    )
  })

  it('reads every Gegenmessung snapshot the pages import', () => {
    // A pipeline that renames or drops `generated_at` would otherwise throw only at build time.
    for (const dir of ['consensus', 'balance', 'invoked', 'pattern', 'tell', 'revision']) {
      const { generated_at } = JSON.parse(readFileSync(`src/data/${dir}/latest.json`, 'utf8'))
      expect(() => dataAge(generated_at, 'daily', now), dir).not.toThrow()
    }
  })
})

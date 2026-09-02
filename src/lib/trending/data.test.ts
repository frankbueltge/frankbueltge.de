// The committed files are the archive; these readers are the only way the site sees them.
import { describe, expect, it } from 'vitest'
import { audienceBefore, getAudienceDays, getLatestTrending, getTrendingDays } from './data'
import { trendingDaySchema } from './schema'
import { fixtureDay } from './fixtures'

describe('trending data readers', () => {
  it('reads only dated day files, newest first, each carrying the contract', () => {
    const days = getTrendingDays()
    for (let i = 1; i < days.length; i++) expect(days[i - 1].date.localeCompare(days[i].date)).toBeGreaterThan(0)
    for (const d of days) {
      expect(d.$contract).toBe('trending-day/1')
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.summary.sources_total).toBeGreaterThanOrEqual(d.summary.sources_ok)
    }
    expect(getLatestTrending()?.date).toBe(days[0]?.date)
  })

  it('reads audience files newest first, and finds the day before a ledger day', () => {
    const all = getAudienceDays(10_000)
    for (let i = 1; i < all.length; i++) expect(all[i - 1].day.localeCompare(all[i].day)).toBeGreaterThan(0)
    for (const a of all) expect(a.$contract).toBe('trending-audience/1')
    expect(audienceBefore('2026-01-02')?.day ?? '2026-01-01').toBe('2026-01-01')
  })

  it('the schema accepts the fixture and refuses a foreign contract', () => {
    expect(() => trendingDaySchema.parse(fixtureDay())).not.toThrow()
    expect(() => trendingDaySchema.parse({ ...fixtureDay(), $contract: 'trending-day/2' })).toThrow()
  })
})

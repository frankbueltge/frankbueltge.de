// The committed files are the archive; these readers are the only way the site sees them.
import { describe, expect, it } from 'vitest'
import { audienceBefore, getAudienceDays, getLatestTrending, getTrendingDays } from './data'
import { trendingAudienceSchema, trendingDaySchema } from './schema'
import { dimensionlessAudience, fixtureAudience, fixtureDay, legacyAudience } from './fixtures'
import { AUDIENCE_CONTRACTS } from './types'

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

  // Both audience contracts live in the archive at once and neither is ever rewritten: the two
  // days committed before 2026-09-03 carry a browser-beacon half, every later one does not.
  it('reads audience files newest first, under either contract, and finds the day before a ledger day', () => {
    const all = getAudienceDays(10_000)
    for (let i = 1; i < all.length; i++) expect(all[i - 1].day.localeCompare(all[i].day)).toBeGreaterThan(0)
    for (const a of all) expect(AUDIENCE_CONTRACTS).toContain(a.$contract)
    for (const a of all) if (a.$contract === 'trending-audience/2') expect(a.umami).toBeUndefined()
    expect(audienceBefore('2026-01-02')?.day ?? '2026-01-01').toBe('2026-01-01')
  })

  it('the schema accepts the fixture and refuses a foreign contract', () => {
    expect(() => trendingDaySchema.parse(fixtureDay())).not.toThrow()
    expect(() => trendingDaySchema.parse({ ...fixtureDay(), $contract: 'trending-day/2' })).toThrow()
  })

  it('the audience schema takes both contracts and refuses a third', () => {
    for (const record of [legacyAudience(), fixtureAudience(), dimensionlessAudience()]) {
      expect(() => trendingAudienceSchema.parse(record)).not.toThrow()
    }
    expect(() => trendingAudienceSchema.parse({ ...fixtureAudience(), $contract: 'trending-audience/3' })).toThrow()
  })

  // Parsed, not just typed: a null dimension must survive the schema as null (an absence with a
  // reason in extra_note) and must never arrive as a zero or as an empty object.
  it('carries a refused dimension through the schema as null, with its reason', () => {
    const parsed = trendingAudienceSchema.parse(dimensionlessAudience())
    expect(parsed.edge.countries).toBeNull()
    expect(parsed.edge.referers).toBeNull()
    expect(parsed.edge.extra_note).toBeTruthy()
    const v1 = trendingAudienceSchema.parse(legacyAudience())
    expect(v1.edge.countries).toBeUndefined()
    expect(v1.umami?.pageviews).toBe(42)
  })
})

describe('the audience contract versions', () => {
  it('refuses a v2 record that still carries the beacon half', () => {
    const v1 = legacyAudience()
    expect(trendingAudienceSchema.safeParse(v1).success).toBe(true)
    // A /2 file with the beacon key means the pipeline and the schema disagree; the build
    // says so rather than rendering a column nobody decided on.
    const got = trendingAudienceSchema.safeParse({ ...v1, $contract: 'trending-audience/2' })
    expect(got.success).toBe(false)
    if (!got.success) expect(JSON.stringify(got.error.issues)).toContain('beacon half')
  })
})

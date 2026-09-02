// A term's series is not stored anywhere — it is read out of the dated files. So the thing
// worth testing is exactly that: the order the points come back in, the cap, and that a file
// which does not carry the term contributes no point (rather than a zero nobody measured).
import { describe, expect, it } from 'vitest'
import { buildSeries, getTermsDays, getLatestTerms, termIn } from './terms-data'
import { fixtureTerm, fixtureTerms, fixtureTermsDay } from './terms-fixtures'

const day = (n: number) => `2026-${String(1 + Math.floor((n - 1) / 28)).padStart(2, '0')}-${String(((n - 1) % 28) + 1).padStart(2, '0')}`

describe('a term series over committed files', () => {
  it('comes back oldest first, one point per file, whatever order the files arrive in', () => {
    const files = [fixtureTermsDay('2026-09-03', 4), fixtureTermsDay('2026-09-01', 1), fixtureTermsDay('2026-09-02', 2)]
    expect(buildSeries(files, 'loop-engineering')).toEqual([
      { date: '2026-09-01', d1: 1 },
      { date: '2026-09-02', d1: 2 },
      { date: '2026-09-03', d1: 4 },
    ])
  })

  it('caps at thirty points and keeps the most recent ones', () => {
    const files = Array.from({ length: 45 }, (_, i) => fixtureTermsDay(day(i + 1), i + 1))
    const series = buildSeries(files, 'loop-engineering')
    expect(series).toHaveLength(30)
    expect(series[0].d1).toBe(16)
    expect(series[29].d1).toBe(45)
    expect(buildSeries(files, 'loop-engineering', 7)).toHaveLength(7)
  })

  it('skips a day that does not carry the term instead of counting it as zero', () => {
    const files = [fixtureTermsDay('2026-09-01', 3), fixtureTermsDay('2026-09-02', 5, 'other-term')]
    expect(buildSeries(files, 'loop-engineering').map((p) => p.date)).toEqual(['2026-09-01'])
    expect(buildSeries(files, 'nothing-tracked')).toEqual([])
  })

  it('finds one term in a file by slug', () => {
    const file = fixtureTerms()
    expect(termIn(file, 'knowledge-graph')?.term).toBe('knowledge graph')
    expect(termIn(file, 'not-watched')).toBeUndefined()
    expect(termIn(fixtureTerms({ terms: [fixtureTerm()] }), 'loop-engineering')?.status).toBe('rising')
  })
})

describe('the committed terms archive', () => {
  it('reads only dated files, newest first, each carrying the contract', () => {
    const files = getTermsDays()
    for (let i = 1; i < files.length; i++) expect(files[i - 1].date.localeCompare(files[i].date)).toBeGreaterThan(0)
    for (const f of files) {
      expect(f.$contract).toBe('trending-terms/1')
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(f.summary.terms_total).toBe(f.terms.length)
    }
    // Before the first run the archive is empty, and every surface has to survive that.
    expect(getLatestTerms()?.date ?? null).toBe(files[0]?.date ?? null)
  })
})

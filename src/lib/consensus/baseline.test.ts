// The baseline is a committed measurement, so the tests run against the committed file —
// not against fixtures. Anything the page says about seven years of echo has to survive
// being recomputed here from the file's own components.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CHAIN_LABEL, byYear, percentileOf, standing, summarise, type Baseline } from './baseline'

const PATH = fileURLToPath(new URL('../../data/consensus/baseline.json', import.meta.url))
const b = JSON.parse(readFileSync(PATH, 'utf8')) as Baseline & {
  provenance: { jobs: { job_id: string; total_bytes_billed: string }[]; query: string; query_sha256: string }
  source: { citation: string; license_notice: string }
}

describe('the committed echo baseline', () => {
  it('spans the window it claims, with unique ascending days', () => {
    const dates = b.days.map((d) => d.date)
    expect(b.days).toHaveLength(b.window.days_present)
    expect([...new Set(dates)]).toHaveLength(dates.length)
    expect(dates).toEqual([...dates].sort())
    expect(dates[0]).toBe(b.window.from)
    expect(dates[dates.length - 1]).toBe(b.window.to)
  })

  it('recomputes every echo_index from the day\'s own components — the ratio is not asserted', () => {
    for (const d of b.days) {
      expect(d.echoed).toBeLessThanOrEqual(d.articles)
      expect(d.articles).toBeGreaterThan(0)
      expect(d.echo_index).toBeCloseTo(Number((d.echoed / d.articles).toFixed(3)), 10)
    }
  })

  it('carries only known labels, and TLD shares within [0,1]', () => {
    const known = new Set([CHAIN_LABEL, 'scattered placement', 'mixed', 'unknown'])
    for (const d of b.days) {
      expect(known.has(d.label), `unknown label "${d.label}" on ${d.date}`).toBe(true)
      if (d.tld_share !== undefined) {
        expect(d.tld_share).toBeGreaterThanOrEqual(0)
        expect(d.tld_share).toBeLessThanOrEqual(1)
      }
      if (d.phrase !== undefined) expect(d.phrase.split(' ')).toHaveLength(6)
    }
  })

  it('discloses its gap instead of interpolating it — the missing days are really missing', () => {
    const present = new Set(b.days.map((d) => d.date))
    let counted = 0
    for (const run of b.gaps.runs) {
      const from = new Date(`${run.from}T00:00:00Z`)
      const to = new Date(`${run.to}T00:00:00Z`)
      for (let t = from; t <= to; t = new Date(t.getTime() + 86400000)) {
        expect(present.has(t.toISOString().slice(0, 10))).toBe(false)
        counted += 1
      }
      expect(run.days).toBe(Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
    }
    expect(counted).toBe(b.gaps.missing_days)
  })

  it('travels with the GDELT citation the licence requires, and with its query trace', () => {
    expect(b.source.citation).toMatch(/GDELT/)
    expect(b.source.license_notice).toMatch(/citation/i)
    expect(b.provenance.query).toBe('pipelines/consensus/baseline.sql')
    expect(b.provenance.query_sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(b.provenance.jobs.length).toBeGreaterThan(0)
    for (const j of b.provenance.jobs) {
      expect(j.job_id).toMatch(/^consensus_baseline_/)
      expect(Number(j.total_bytes_billed)).toBeGreaterThan(0)
    }
  })
})

describe('what the page is allowed to say about it', () => {
  const sum = summarise(b)
  const years = byYear(b.days)

  it('chain syndication is the exception across the single-method record, not the rule', () => {
    // Guards the dated correction of 2026-08-09: the archive-wide "93% chain" the page
    // showed came from mixing v1 and v2 pools. One method over thousands of days says the
    // opposite, and no future edit may quietly restore the old framing.
    expect(sum.days).toBeGreaterThan(2000)
    expect(sum.chainShare).toBeLessThan(0.15)
    for (const y of years) if (y.days >= 300) expect(y.chainShare).toBeLessThan(0.15)
  })

  it('the verbatim echo has declined across the record — the claim the figure makes', () => {
    const full = years.filter((y) => y.days >= 300)
    expect(full.length).toBeGreaterThanOrEqual(5)
    expect(full[full.length - 1].medianEcho).toBeLessThan(full[0].medianEcho)
  })

  it('ranks a value against the record monotonically, and brackets it at the edges', () => {
    expect(percentileOf(0, b.days)).toBe(0)
    expect(percentileOf(1, b.days)).toBe(1)
    expect(percentileOf(sum.medianEcho, b.days)).toBeGreaterThan(0.4)
    expect(percentileOf(sum.medianEcho, b.days)).toBeLessThanOrEqual(0.6)
    expect(percentileOf(0.2, b.days)).toBeLessThan(percentileOf(0.4, b.days))
  })

  it('places a reading in the record with a rank that matches its percentile', () => {
    const s = standing(0.32, b)
    expect(s.of).toBe(sum.days)
    expect(s.rank / s.of).toBeCloseTo(s.percentile, 10)
    expect(s.firstYear < s.recentYear).toBe(true)
  })
})

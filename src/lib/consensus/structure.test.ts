// The structure aggregate is derived from the committed archive, never typed — this test
// runs it against the real day files, so the number the page shows cannot drift from the
// record it claims to summarize (the same discipline as the anatomy quotes).
//
// Since the dated correction of 2026-08-09 the aggregate is per method version, and the
// central test here is that it stays that way: a single share across the v1/v2 break was
// how the page came to claim the opposite of what the record says.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CHAIN_LABEL, IMPLICIT_V1, aggregateStructure } from './structure'

const DIR = fileURLToPath(new URL('../../data/consensus/', import.meta.url))

const loadArchive = (): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const f of readdirSync(DIR)) {
    // date-named day files only — latest.json is a moving pointer, counting it would
    // double one day, and baseline.json is a different instrument entirely
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(f)) continue
    out[f.replace('.json', '')] = JSON.parse(readFileSync(DIR + f, 'utf8'))
  }
  return out
}

describe('the structure of the consensus, derived from the committed archive', () => {
  const agg = aggregateStructure(loadArchive() as never)

  it('classifies a real majority of the archive — the aggregate is not resting on a handful of days', () => {
    expect(agg.classified).toBeGreaterThan(30)
    expect(agg.classified).toBe(agg.days.length)
  })

  it('every classified day carries a known label, a date, and a TLD share within [0,1]', () => {
    const known = new Set([CHAIN_LABEL, 'scattered placement', 'mixed'])
    for (const d of agg.days) {
      expect(known.has(d.label), `unknown label "${d.label}" on ${d.date} — extend the page key before shipping`).toBe(true)
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.tldShare).toBeGreaterThanOrEqual(0)
      expect(d.tldShare).toBeLessThanOrEqual(1)
    }
  })

  it('days are ascending and unique — an archive day counted twice would inflate the finding', () => {
    const dates = agg.days.map((d) => d.date)
    expect([...new Set(dates)]).toHaveLength(dates.length)
    expect(dates).toEqual([...dates].sort())
  })

  it('never pools two method versions into one share — the defect of 2026-08-09', () => {
    // Each group's counts sum to its own classified total, and the groups partition the
    // archive. There is no archive-wide chainShare to read by accident: if one is ever
    // reintroduced, this test is where the reasoning lives.
    expect(agg.byMethod.length).toBeGreaterThanOrEqual(1)
    let sum = 0
    for (const m of agg.byMethod) {
      const counted = Object.values(m.counts).reduce((a, b) => a + b, 0)
      expect(counted).toBe(m.classified)
      expect(m.chainShare).toBeCloseTo((m.counts[CHAIN_LABEL] ?? 0) / m.classified, 10)
      expect(m.first <= m.last).toBe(true)
      sum += m.classified
    }
    expect(sum).toBe(agg.classified)
    expect((agg as unknown as { chainShare?: number }).chainShare).toBeUndefined()
  })

  it('assigns every day a version, dating the pre-block files to v1 as the pipeline does', () => {
    for (const d of agg.days) expect(d.methodVersion.length).toBeGreaterThan(0)
    // The archive still holds the v1 days; they are kept and labelled, never deleted.
    const versions = new Set(agg.days.map((d) => d.methodVersion))
    expect(versions.has(IMPLICIT_V1) || versions.has('v2-raw-files')).toBe(true)
  })

  it('lists the newest method first, so the page leads with the current instrument', () => {
    const lasts = agg.byMethod.map((m) => m.last)
    expect(lasts).toEqual([...lasts].sort().reverse())
  })
})

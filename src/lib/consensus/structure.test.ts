// The structure aggregate is derived from the committed archive, never typed — this test
// runs it against the real day files, so the number the page shows cannot drift from the
// record it claims to summarize (the same discipline as the anatomy quotes).
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CHAIN_LABEL, aggregateStructure } from './structure'

const DIR = fileURLToPath(new URL('../../data/consensus/', import.meta.url))

const loadArchive = (): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const f of readdirSync(DIR)) {
    // date-named day files only — latest.json is a moving pointer, counting it would
    // double one day
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(f)) continue
    out[f.replace('.json', '')] = JSON.parse(readFileSync(DIR + f, 'utf8'))
  }
  return out
}

describe('the structure of the consensus, derived from the committed archive', () => {
  const agg = aggregateStructure(loadArchive() as never)

  it('classifies a real majority of the archive — the aggregate is not resting on a handful of days', () => {
    expect(agg.classified).toBeGreaterThan(30)
    expect(agg.classified + agg.unclassified).toBe(agg.days.length + agg.unclassified)
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

  it('counts sum to the classified total and chainShare matches the counts', () => {
    const sum = Object.values(agg.counts).reduce((a, b) => a + b, 0)
    expect(sum).toBe(agg.classified)
    expect(agg.chainShare).toBeCloseTo((agg.counts[CHAIN_LABEL] ?? 0) / agg.classified, 10)
  })

  it('days are ascending and unique — an archive day counted twice would inflate the finding', () => {
    const dates = agg.days.map((d) => d.date)
    expect([...new Set(dates)]).toHaveLength(dates.length)
    expect(dates).toEqual([...dates].sort())
  })
})

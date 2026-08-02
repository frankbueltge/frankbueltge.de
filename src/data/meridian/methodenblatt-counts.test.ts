/**
 * N1-T06 AT5: the On Record method sheet cannot go stale again.
 *
 * It said "two claims from a single run" as WORDS, and stayed wrong for ten
 * days after the runtime's archive grew to three runs and seven claims. The
 * fix is structural — every figure is read from the committed export — and
 * this suite is what keeps it structural: a future edit that spells a number
 * back into the prose fails here rather than on the page.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import parallax from './parallax.json'

const SHEET = fileURLToPath(new URL('../../components/pages/MethodenblattOnRecord.astro', import.meta.url))
const sheet = readFileSync(SHEET, 'utf8')

/** The sheet minus its comments — a comment may quote the old wording in
 *  order to explain why it is gone, and punishing it for that would push the
 *  explanation out of the file. */
const executable = sheet
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\n')

describe('the method sheet counts instead of asserting', () => {
  it('no longer spells the claim count as a word', () => {
    expect(executable).not.toContain('two claims')
    expect(executable).not.toContain('a single run')
  })

  it('derives its figures from the view model', () => {
    for (const symbol of ['totals.claims', 'totals.runs', 'featureRun', 'runs']) {
      expect(executable).toContain(symbol)
    }
  })
})

describe('the view model carries what the sheet needs', () => {
  it('has one row per committed crate, with its own counts', () => {
    expect(Array.isArray(parallax.runs)).toBe(true)
    expect(parallax.runs.length).toBeGreaterThan(0)
    for (const run of parallax.runs) {
      expect(typeof run.run).toBe('string')
      expect(run.claims).toBeGreaterThan(0)
      expect(run.object_count).toBeGreaterThan(0)
    }
  })

  it('totals are the sum of the rows, not a separate assertion', () => {
    const claims = parallax.runs.reduce((sum, r) => sum + r.claims, 0)
    const verifications = parallax.runs.reduce((sum, r) => sum + r.verifications, 0)
    expect(parallax.totals.claims).toBe(claims)
    expect(parallax.totals.verifications).toBe(verifications)
    expect(parallax.totals.runs).toBe(parallax.runs.length)
  })

  it('names a feature run that actually exists among the crates', () => {
    expect(parallax.runs.map((r) => r.run)).toContain(parallax.feature_run)
  })

  it('the feature run is the one the parallax section describes', () => {
    const feature = parallax.runs.find((r) => r.run === parallax.feature_run)!
    expect(feature.verifications).toBeGreaterThanOrEqual(parallax.verifications.length)
    expect(parallax.export_meta.object_count).toBe(feature.object_count)
  })
})

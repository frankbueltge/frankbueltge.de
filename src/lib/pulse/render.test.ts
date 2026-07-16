// Determinism + fidelity guard for the pulse SVG generator (site-v2 work order §2, same
// "same input ⇒ byte-identical output" contract as src/lib/begegnungen/score.test.ts). Uses the
// real, committed snapshot (src/data/pulse/pulse.json) — not a hand-typed stand-in — so a
// future re-run of scripts/fetch-pulse.ts that changes shape fails this test rather than
// silently rendering something else.
import { describe, expect, it } from 'vitest'
import pulseData from '@/data/pulse/pulse.json'
import { buildPulseSvg, formatWeekRange, smooth, type PulseSnapshot, type PulseWeek } from './render'

const snapshot = pulseData as PulseSnapshot

function makeWeek(bins: number[], overrides: Partial<PulseWeek> = {}): PulseWeek {
  return { iso_year: 2026, iso_week: 1, bins, ...overrides }
}

describe('buildPulseSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    const a = buildPulseSvg(snapshot)
    const b = buildPulseSvg(structuredClone(snapshot))
    expect(a).toBe(b)
  })

  it('draws exactly one ridgeline path per week, plus a closing stroke path for the current week', () => {
    const svg = buildPulseSvg(snapshot)
    const pathCount = [...svg.matchAll(/<path /g)].length
    // every week gets one filled ridge path; the last (current) week gets a second, open-stroke path
    expect(pathCount).toBe(snapshot.weeks.length + 1)
  })

  it('rejects a snapshot with no weeks', () => {
    expect(() => buildPulseSvg({ ...snapshot, weeks: [] })).toThrow(/no weeks/)
  })

  it('rejects a week whose bin count does not match bins_per_week', () => {
    const bad: PulseSnapshot = { ...snapshot, weeks: [makeWeek([1, 2, 3])] }
    expect(() => buildPulseSvg(bad)).toThrow(/expected 84/)
  })

  describe('edge cases', () => {
    it('marks an all-silent week visibly muted (opacity .33) and does not crash', () => {
      const silentWeek = makeWeek(new Array(84).fill(0), { iso_week: 5 })
      const activeWeek = makeWeek(
        Array.from({ length: 84 }, (_, i) => (i === 10 ? 4 : 0)),
        { iso_week: 6 },
      )
      const svg = buildPulseSvg({ ...snapshot, weeks: [silentWeek, activeWeek] })
      expect(svg).toContain('opacity=".33"')
      expect(svg).toContain('nothing recorded yet')
    })

    it('a partial (current) week draws only up to cutoff_bin and never reaches the full row width', () => {
      const bins = new Array(84).fill(0)
      bins[0] = 3
      const partial = makeWeek(bins, { iso_week: 29, cutoff_bin: 5 })
      const svg = buildPulseSvg({ ...snapshot, weeks: [partial] })
      // the current week's open-stroke path must not contain the full-width closing segment
      // ("L940 …") that complete weeks get — it ends at the as-of edge, not the row's far side.
      const strokePath = svg.split('<path').find((p) => p.includes('stroke="var(--color-fg)"'))!
      expect(strokePath).not.toContain('L940.0')
      expect(svg).toContain('the as-of edge')
    })

    it('prefers the as-of-edge label when a single week is both the first and the last row (even if silent)', () => {
      const single = makeWeek(new Array(84).fill(0), { iso_week: 40, cutoff_bin: 2 })
      const svg = buildPulseSvg({ ...snapshot, weeks: [single] })
      expect(svg).toContain('W40 · the as-of edge')
      expect(svg).not.toContain('nothing recorded yet')
    })
  })
})

describe('smooth', () => {
  it('is a 3-window moving average, two passes, clamped at the edges', () => {
    expect(smooth([0, 0, 3, 0, 0], 1)).toEqual([0, 1, 1, 1, 0])
  })

  it('leaves an all-zero series at zero', () => {
    expect(smooth(new Array(10).fill(0))).toEqual(new Array(10).fill(0))
  })
})

describe('formatWeekRange', () => {
  it('formats a same-year window as "W..–W.. YYYY"', () => {
    expect(formatWeekRange(snapshot.weeks)).toBe('W17–W29 2026')
  })

  it('formats a window crossing a year boundary with both years shown', () => {
    const weeks: PulseWeek[] = [makeWeek(new Array(84).fill(0), { iso_year: 2025, iso_week: 51 }), makeWeek(new Array(84).fill(0), { iso_year: 2026, iso_week: 3 })]
    expect(formatWeekRange(weeks)).toBe('W51 2025–W3 2026')
  })

  it('returns an empty string for no weeks', () => {
    expect(formatWeekRange([])).toBe('')
  })
})

import { describe, expect, it } from 'vitest'
import { buildStackLines, buildStackSvg, smoothOnce, stackWeekRange, taper, WEEKS_IN_STACK } from './stack'
import type { PulseSnapshot, PulseWeek } from '@/lib/pulse/render'
import pulseData from '@/data/pulse/pulse.json'

const BINS = 84

/** A week whose bins rise from 0 to 83 — a shape with a known direction, so a smoothing or taper
 *  bug shows up as a broken slope rather than as numbers that merely look plausible. */
function ramp(isoWeek: number, extra: Partial<PulseWeek> = {}): PulseWeek {
  return { iso_year: 2026, iso_week: isoWeek, bins: Array.from({ length: BINS }, (_, i) => i), ...extra }
}

function snapshotOf(weeks: PulseWeek[]): PulseSnapshot {
  return {
    schema_version: '1',
    generated_at: '2026-08-11T00:00:00.000Z',
    as_of: '2026-08-11 00:00 UTC',
    bin_hours: 2,
    bins_per_week: BINS,
    repos: ['a', 'b'],
    total_commits: 1,
    weeks,
  }
}

describe('smoothOnce', () => {
  it('is ONE pass, clamped at the edges — not render.ts’s two', () => {
    expect(smoothOnce([0, 3, 0])).toEqual([1, 1, 1])
    // A second pass would flatten this further; a half-week is short enough that it must not.
    expect(smoothOnce([0, 9, 0, 0, 0])[1]).toBe(3)
  })

  it('leaves a series shorter than the window recognisable', () => {
    expect(smoothOnce([5, 5]).every((v) => Number.isFinite(v))).toBe(true)
  })
})

describe('taper', () => {
  it('silences both ends and leaves the middle nearly untouched', () => {
    const flat = new Array(42).fill(10)
    const shaped = taper(flat)
    expect(shaped[0]).toBeCloseTo(0, 5)
    expect(shaped.at(-1)!).toBeCloseTo(0, 5)
    expect(shaped[21]).toBeGreaterThan(9.5)
  })

  it('never lifts a value above what was measured — a drawing rule, not a gain stage', () => {
    const shaped = taper([1, 7, 3, 9, 2, 8])
    shaped.forEach((v, i) => expect(v).toBeLessThanOrEqual([1, 7, 3, 9, 2, 8][i] + 1e-9))
  })
})

describe('buildStackLines', () => {
  it('draws two lines per whole week, newest lowest', () => {
    const lines = buildStackLines(snapshotOf([ramp(30), ramp(31)]))
    expect(lines).toHaveLength(4)
    expect(lines.map((l) => l.isoWeek)).toEqual([30, 30, 31, 31])
    expect(lines.map((l) => l.half)).toEqual([0, 1, 0, 1])
    // Baselines increase strictly: paint order is back-to-front, and the fill occludes upward.
    expect(lines.every((l, i) => i === 0 || l.base > lines[i - 1].base)).toBe(true)
  })

  it('takes at most the newest WEEKS_IN_STACK weeks', () => {
    const many = Array.from({ length: WEEKS_IN_STACK + 4 }, (_, i) => ramp(20 + i))
    const lines = buildStackLines(snapshotOf(many))
    expect(new Set(lines.map((l) => l.isoWeek)).size).toBe(WEEKS_IN_STACK)
    expect(lines[0].isoWeek).toBe(20 + 4)
  })

  it('stops the current week at its cutoff — unelapsed time is never drawn as silence', () => {
    const lines = buildStackLines(snapshotOf([ramp(31), ramp(32, { cutoff_bin: 30 })]))
    const current = lines.filter((l) => l.isoWeek === 32)
    // 30 elapsed bins: the first half is clipped to 30, the second half has nothing yet.
    expect(current).toHaveLength(1)
    expect(current[0].points).toHaveLength(30)
  })

  it('drops a half with too few elapsed bins rather than drawing a stub', () => {
    const lines = buildStackLines(snapshotOf([ramp(31), ramp(32, { cutoff_bin: 2 })]))
    expect(lines.filter((l) => l.isoWeek === 32)).toHaveLength(0)
  })

  it('normalises each line to its own peak, so a quiet week still has a shape', () => {
    const loud = ramp(31)
    // The identical shape at seven times the traffic: after per-line normalisation the two lines
    // must reach exactly the same height, which is the whole point — the stack shows each week's
    // own rhythm, not which week was busiest.
    const quiet: PulseWeek = { iso_year: 2026, iso_week: 32, bins: ramp(32).bins.map((b) => b * 7) }
    const lines = buildStackLines(snapshotOf([loud, quiet]))
    const amplitude = (i: number) => lines[i].base - Math.min(...lines[i].points.map((p) => p.y))
    expect(amplitude(2)).toBeCloseTo(amplitude(0), 3)
  })

  it('does not amplify a silent week into a shape it never had', () => {
    // The peak floor of 1 is what stops an all-zero week being stretched to full height; a silent
    // week draws as the flat line it is, which is the honest picture of nothing having happened.
    const silent: PulseWeek = { iso_year: 2026, iso_week: 32, bins: new Array(BINS).fill(0) }
    const lines = buildStackLines(snapshotOf([ramp(31), silent]))
    const quiet = lines.filter((l) => l.isoWeek === 32)
    expect(quiet.every((l) => l.points.every((p) => p.y === l.base))).toBe(true)
  })

  it('keeps every line inside the viewBox — no peak is ever clipped by the frame', () => {
    for (const count of [2, 5, 7]) {
      const lines = buildStackLines(snapshotOf(Array.from({ length: count }, (_, i) => ramp(26 + i))))
      const ys = lines.flatMap((l) => l.points.map((p) => p.y))
      expect(Math.min(...ys), `${count} weeks`).toBeGreaterThanOrEqual(0)
      expect(Math.max(...lines.map((l) => l.base)), `${count} weeks`).toBeLessThanOrEqual(220)
    }
  })
})

describe('buildStackSvg', () => {
  it('is deterministic — same snapshot, byte-identical markup', () => {
    const snap = snapshotOf([ramp(30), ramp(31, { cutoff_bin: 60 })])
    expect(buildStackSvg(snap)).toBe(buildStackSvg(snap))
  })

  it('pairs every ridge with an open track for the dots to walk', () => {
    const svg = buildStackSvg(snapshotOf([ramp(30), ramp(31)]))
    expect((svg.match(/class="ops-ridge"/g) ?? []).length).toBe(4)
    expect((svg.match(/class="ops-track"/g) ?? []).length).toBe(4)
    // The track carries no closing segment: a dot must never walk back along the baseline.
    const track = /id="ops-track-0" d="([^"]+)"/.exec(svg)![1]
    expect(track).not.toContain('Z')
  })

  it('ships the six dots already positioned, so the instrument is whole without JavaScript', () => {
    const svg = buildStackSvg(snapshotOf([ramp(30), ramp(31)]))
    const dots = [...svg.matchAll(/<circle class="ops-dot"[^/]*\/>/g)].map((m) => m[0])
    expect(dots).toHaveLength(6)
    for (const dot of dots) {
      expect(dot).toMatch(/cx="[\d.]+"/)
      expect(dot).toMatch(/cy="[\d.]+"/)
      expect(Number(/data-track="(\d+)"/.exec(dot)![1])).toBeLessThan(4)
    }
  })

  it('carries no colour — the palette lives in the stylesheet', () => {
    expect(buildStackSvg(snapshotOf([ramp(30)]))).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i)
  })
})

describe('against the committed snapshot', () => {
  const snap = pulseData as unknown as PulseSnapshot

  it('draws the real record without a single unfinite coordinate', () => {
    const lines = buildStackLines(snap)
    expect(lines.length).toBeGreaterThan(6)
    for (const line of lines) {
      for (const p of line.points) {
        expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
          expect(p.y).toBeGreaterThanOrEqual(0) // nothing escapes the top of the viewBox
        expect(p.y).toBeLessThanOrEqual(220)
      }
    }
  })

  it('names the weeks it actually drew', () => {
    const range = stackWeekRange(snap)
    expect(range).toMatch(/^W\d+(–W\d+)?$/)
    expect(range).toContain(`W${snap.weeks.at(-1)!.iso_week}`)
  })
})

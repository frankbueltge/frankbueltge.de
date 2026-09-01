import { describe, expect, it } from 'vitest'
import { buildDayDial, dayCounts, DIAL } from './dial'
import type { PulseSnapshot, PulseWeek } from '@/lib/pulse/render'
import pulseData from '@/data/pulse/pulse.json'

const BINS = 84

function week(isoWeek: number, bins: number[], extra: Partial<PulseWeek> = {}): PulseWeek {
  return { iso_year: 2026, iso_week: isoWeek, bins, ...extra }
}

function snapshotOf(weeks: PulseWeek[]): PulseSnapshot {
  return {
    schema_version: '1',
    generated_at: '2026-09-01T00:00:00.000Z',
    as_of: '2026-09-01 00:00 UTC',
    bin_hours: 2,
    bins_per_week: BINS,
    repos: ['a', 'b'],
    total_commits: 1,
    weeks,
  }
}

/** one commit in every bin — so each of the twelve slots collects exactly seven (one per day) */
const flat = Array.from({ length: BINS }, () => 1)

describe('dayCounts', () => {
  it('folds a week’s 2-hour bins into twelve slots of the UTC day', () => {
    const counts = dayCounts(snapshotOf([week(30, flat)]))
    expect(counts).toHaveLength(12)
    expect(counts.every((n) => n === 7)).toBe(true)
  })

  it('puts a bin into the slot of its hour of day, whatever weekday it fell on', () => {
    // bin 0 is Monday 00:00–02:00 (slot 0); bin 13 is Tuesday 02:00–04:00 (slot 1)
    const bins = new Array<number>(BINS).fill(0)
    bins[0] = 3
    bins[13] = 5
    const counts = dayCounts(snapshotOf([week(30, bins)]))
    expect(counts[0]).toBe(3)
    expect(counts[1]).toBe(5)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(8)
  })

  it('sums across weeks and clips the current week at its cutoff — the future is not quiet, it is absent', () => {
    const counts = dayCounts(snapshotOf([week(30, flat), week(31, flat, { cutoff_bin: 12 })]))
    // week 30 whole (7 per slot) + the first 12 bins of week 31 (one Monday: 1 per slot)
    expect(counts.every((n) => n === 8)).toBe(true)
  })

  it('reads the real snapshot without a NaN and accounts for every elapsed bin', () => {
    const snap = pulseData as PulseSnapshot
    const counts = dayCounts(snap)
    expect(counts.every((n) => Number.isFinite(n) && n >= 0)).toBe(true)
    const elapsed = snap.weeks.reduce((sum, w, i) => {
      const n = i === snap.weeks.length - 1 ? Math.min(w.cutoff_bin ?? w.bins.length, w.bins.length) : w.bins.length
      return sum + w.bins.slice(0, n).reduce((a, b) => a + b, 0)
    }, 0)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(elapsed)
  })
})

describe('buildDayDial', () => {
  const snap = snapshotOf([week(30, flat), week(31, flat, { cutoff_bin: 12 })])

  it('is deterministic — same snapshot, byte-identical markup', () => {
    expect(buildDayDial(snap).svg).toBe(buildDayDial(snap).svg)
  })

  it('draws one arc per slot, a ring, a pin, and a hand it does not yet set', () => {
    const { svg, counts, total, weeks } = buildDayDial(snap)
    expect((svg.match(/class="ops-dial-arc"/g) ?? []).length).toBe(counts.length)
    expect(svg).toContain('class="ops-dial-ring"')
    expect(svg).toContain('class="ops-dial-pin"')
    // The hand carries no angle: a build-time angle would be a stopped clock claiming to be live.
    const hand = /<line class="ops-dial-hand"[^>]*>/.exec(svg)![0]
    expect(hand).not.toContain('transform')
    expect(hand).toContain(`x2="${DIAL.centre}"`)
    expect(total).toBe(96)
    expect(weeks).toBe(2)
  })

  it('names itself with the figures it draws, so a screen reader hears the record too', () => {
    const { svg } = buildDayDial(snap)
    const label = /aria-label="([^"]+)"/.exec(svg)![1]
    expect(label).toContain('96 commits')
    expect(label).toContain('2 weeks')
    expect(svg).toContain('role="img"')
  })

  it('lets every arc reach in proportion to its slot, inside the viewBox', () => {
    const bins = new Array<number>(BINS).fill(0)
    bins[0] = 10 // slot 0, the peak
    bins[1] = 5 // slot 1, half of it
    const { svg } = buildDayDial(snapshotOf([week(30, bins)]))
    // every coordinate the arcs use stays within the dial's half-size around its centre
    const numbers = [...svg.matchAll(/d="([^"]+)"/g)].flatMap((m) => m[1].match(/-?[\d.]+/g)!.map(Number))
    expect(Math.max(...numbers.map(Math.abs))).toBeLessThanOrEqual(DIAL.centre)
    // an empty slot is still a hairline of ink, never nothing
    expect((svg.match(/class="ops-dial-arc"/g) ?? []).length).toBe(12)
  })

  it('carries no colour and no style attribute — the stylesheet inks it, the CSP would drop a style', () => {
    const { svg } = buildDayDial(snap)
    expect(svg).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|style=/i)
  })
})

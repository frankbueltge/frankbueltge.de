// The figures of Machine Attention's entrance, recomputed from the mirrored views.json: the quarry's
// clock (Planetary Listening) and the gap between warning and money (The Interval).
import { describe, expect, it } from 'vitest'

import viewsFile from '@/data/attention/views.json'

import { berlinTime, clockFigure, intervalPanel, readViews, usd, waveform, waveforms } from './views'

const views = readViews(viewsFile)!

describe('the mirrored views', () => {
  it('are attention-views/1 with both projects', () => {
    expect(views.planetary.length).toBeGreaterThan(0)
    expect(views.interval.length).toBeGreaterThan(0)
    expect(readViews({ $contract: 'attention-views/0', planetary: [], interval: [] })).toBeNull()
  })
})

describe('the quarry clock', () => {
  const night = (day: string, onsets: [string, number][], strong: string[] = []) => ({
    date: day,
    day,
    outage: false,
    triggers: onsets.length,
    top: onsets.map(([t, r]) => ({ onset: `${day}T${t}+00:00`, peak_ratio: r, duration_s: 9 })),
    strong: onsets.filter(([t]) => strong.includes(t)).map(([t, r]) => ({ onset: `${day}T${t}+00:00`, peak_ratio: r, duration_s: 9 })),
    excerpts: [],
  })
  const fig = clockFigure([
    night('2026-10-27', [['08:30:00', 2400]], ['08:30:00']),
    night('2026-10-23', [['07:30:00', 900], ['11:00:00', 8]], ['07:30:00']),
    night('2026-10-24', [['12:00:00', 9]]),
    night('2026-10-26', [['08:40:00', 600]], ['08:40:00']),
  ])

  it('orders the days, puts each impulse at its time of day, and marks the clock change between them', () => {
    expect(fig.columns.map((c) => c.day)).toEqual(['2026-10-23', '2026-10-24', '2026-10-26', '2026-10-27'])
    expect(fig.columns[1].weekend).toBe(true)
    const strong = fig.dots.filter((d) => d.strong)
    expect(strong.map((d) => d.utc).sort()).toEqual(['07:30', '08:30', '08:40'])
    const at730 = strong.find((d) => d.utc === '07:30')!
    expect(at730.y).toBeCloseTo(fig.plot.top + (7.5 / 24) * (fig.plot.bottom - fig.plot.top))
    expect(fig.change!.x).toBeGreaterThan(fig.columns[1].x)
    expect(fig.change!.x).toBeLessThan(fig.columns[2].x)
  })

  it('reads the shift of the weekday blast across the change, and the same wall-clock time in Berlin', () => {
    expect(fig.medians).toEqual({ before: '07:30', after: '08:35', shiftMinutes: 65 })
    expect(berlinTime('2026-10-23T07:30:00+00:00')).toBe('09:30')
    expect(berlinTime('2026-10-27T08:30:00+00:00')).toBe('09:30')
  })

  it('shows in the committed record what the practice reports: the blast moved by about an hour', () => {
    const real = clockFigure(views.planetary)
    expect(real.medians.shiftMinutes).toBeGreaterThan(50)
    expect(real.medians.shiftMinutes).toBeLessThan(70)
  })
})

describe('the waveforms', () => {
  it('draw a closed band between min and max with the onset where it sits in the excerpt', () => {
    const w = waveform('2026-10-27', '2026-10-27T08:29:56Z', {
      start: '2026-10-27T08:29:26Z',
      seconds: 90,
      min: [-1, -4, -2],
      max: [1, 4, 2],
    }, 90, 40)
    expect(w.area.startsWith('M0,15L45,0L90,10L90,30L45,40L0,25Z')).toBe(true)
    expect(w.onsetX).toBe(30)
    expect(w.local).toBe('09:30')
  })

  it('exist for every preserved excerpt of the record', () => {
    const n = views.planetary.reduce((s, x) => s + x.excerpts.filter((e) => e.envelope).length, 0)
    expect(waveforms(views.planetary)).toHaveLength(n)
  })
})

describe('the interval panels', () => {
  it('put t0, t1 and the doubled baseline where the register says, for every episode', () => {
    for (const e of views.interval) {
      const p = intervalPanel(e)
      expect(p.bars).toHaveLength(24)
      expect(p.bars.filter((b) => b.after)).toHaveLength(12)
      if (e.money.fsc.t1) {
        const t1bar = p.bars.find((b) => b.month === e.money.fsc.t1)!
        expect(t1bar.usd).toBeGreaterThanOrEqual(2 * e.money.fsc.baseline_usd! - 1)
        expect(p.t1x).toBeCloseTo(t1bar.x - 0.5 + (p.plot.right - p.plot.left) / 24, 0)
      }
      expect(p.bars.every((b) => b.y >= p.plot.top - 0.1 && b.y + b.h <= p.plot.bottom + 0.1)).toBe(true)
    }
  })

  it('formats dollars compactly', () => {
    expect([usd(950), usd(12_400), usd(3_250_000), usd(1_200_000_000)]).toEqual(['$950', '$12k', '$3.3M', '$1.2B'])
  })
})

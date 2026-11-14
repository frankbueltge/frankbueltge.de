// The shared ruler of the ill-tempered week's scores: just intonation on A, the lines a piece wraps into, and the
// two-way map between a moment and a place on the drawing.
import { describe, expect, it } from 'vitest'

import {
  CHORD_HARMONICS,
  fitLabel,
  frameFor,
  harmonicOf,
  harmonicsBetween,
  hzLabel,
  mmss,
  SCALE_HARMONICS,
  spanAt,
  systemsFor,
  tickStep,
  ticksBetween,
  timeAtX,
  xAt,
} from './score'

describe('just intonation on A', () => {
  it('names a pitch as a harmonic of A1 = 55 Hz brought into the scale’s octave, with its ratio over A', () => {
    expect(harmonicOf(605, SCALE_HARMONICS)).toMatchObject({ harmonic: 11, octave: 0, ratio: '11/8' })
    expect(harmonicOf(990, SCALE_HARMONICS)).toMatchObject({ harmonic: 9, octave: 1, ratio: '9/8' })
    expect(harmonicOf(440, SCALE_HARMONICS)).toMatchObject({ harmonic: 8, octave: 0, ratio: '1/1' })
    expect(harmonicOf(660, SCALE_HARMONICS)).toMatchObject({ harmonic: 12, ratio: '3/2' })
    expect(harmonicOf(770, SCALE_HARMONICS)).toMatchObject({ harmonic: 14, ratio: '7/4' })
  })

  it('reads the records’ rounded pitches back to the exact harmonic', () => {
    // 55 × 13 / 8 = 89.375, which the record writes 89.38
    expect(harmonicOf(89.38, SCALE_HARMONICS)).toMatchObject({ harmonic: 13, octave: -3, hz: 89.375 })
    // 55 × 7 / 4 = 96.25, written 96.2 by a one-decimal record
    expect(harmonicOf(96.2, CHORD_HARMONICS)).toMatchObject({ harmonic: 7, octave: -2, ratio: '7/4' })
    expect(harmonicOf(137.5, CHORD_HARMONICS)).toMatchObject({ harmonic: 5, ratio: '5/4' })
  })

  it('says null for a pitch outside the set, never the nearest one', () => {
    expect(harmonicOf(100, SCALE_HARMONICS)).toBeNull()
    expect(harmonicOf(605, CHORD_HARMONICS)).toBeNull()
    expect(harmonicOf(0, SCALE_HARMONICS)).toBeNull()
  })

  it('lists the lines of a just staff between two pitches', () => {
    expect(harmonicsBetween(605, 990, SCALE_HARMONICS).map((h) => h.hz)).toEqual([605, 660, 715, 770, 825, 880, 990])
    expect(harmonicsBetween(200, 400, CHORD_HARMONICS).map((h) => h.hz)).toEqual([220, 275, 330, 385])
  })

  it('writes hertz whole where whole', () => {
    expect(hzLabel(440)).toBe('440 Hz')
    expect(hzLabel(89.375)).toBe('89.4 Hz')
    expect(hzLabel(96.25)).toBe('96.3 Hz')
  })
})

describe('the ruler', () => {
  it('counts m:ss as a player does', () => {
    expect(mmss(0)).toBe('0:00')
    expect(mmss(337.2)).toBe('5:37')
    expect(mmss(59.999)).toBe('0:59')
  })

  it('spaces its labels at least the given pixels apart', () => {
    expect(tickStep(2.4)).toBe(30)
    expect(tickStep(5)).toBe(10)
    expect(tickStep(10)).toBe(5)
    expect(ticksBetween(92.8, 182.4, 30)).toEqual([120, 150, 180])
  })
})

describe('the lines of a score', () => {
  const starts = [3.2, 48, 92.8, 137.6, 182.4, 227.2, 272]

  it('breaks only where a day begins, as many whole days to a line as fit', () => {
    expect(systemsFor(337.2, starts, 147).map((s) => [s.t0, s.t1])).toEqual([[0, 137.6], [137.6, 272], [272, 337.2]])
    expect(systemsFor(337.2, starts, 400).map((s) => [s.t0, s.t1])).toEqual([[0, 337.2]])
  })

  it('gives a day longer than a line a line of its own', () => {
    expect(systemsFor(100, [10, 70], 30).map((s) => [s.t0, s.t1])).toEqual([[0, 10], [10, 70], [70, 100]])
  })

  it('draws the whole piece on one line where it fits, and wraps it at a phone’s width', () => {
    const wide = frameFor(960, 337.2, starts, 2.0, { wide: 132, narrow: 74 })
    expect(wide.spans).toHaveLength(1)
    expect(wide.narrow).toBe(false)
    const phone = frameFor(358, 337.2, starts, 2.0, { wide: 132, narrow: 74 })
    expect(phone.narrow).toBe(true)
    expect(phone.spans.length).toBeGreaterThan(1)
    expect(phone.pxPerSecond).toBeGreaterThanOrEqual(2.0)
    // one scale for every line: the longest fills the width
    const longest = Math.max(...phone.spans.map((s) => s.t1 - s.t0))
    expect(phone.left + longest * phone.pxPerSecond).toBeCloseTo(phone.right, 6)
  })

  it('maps a moment to its line and back', () => {
    const f = frameFor(358, 337.2, starts, 2.0, { wide: 132, narrow: 74 })
    for (const t of [0, 47.9, 48, 150, 300, 337.2]) {
      const span = spanAt(f, t)
      expect(span.t0).toBeLessThanOrEqual(t)
      expect(timeAtX(f, span, xAt(f, span, t))).toBeCloseTo(t, 6)
    }
    const first = f.spans[0]!
    expect(timeAtX(f, first, -50)).toBe(first.t0)
    expect(timeAtX(f, first, 10_000)).toBe(first.t1)
  })
})

describe('a label that gives way', () => {
  it('takes the longest name that fits and the shortest when none does', () => {
    expect(fitLabel(['Sat 7 Nov · turn', 'Sat · turn', 'Sat 7 Nov', 'Sat'], 200)).toBe('Sat 7 Nov · turn')
    expect(fitLabel(['Sat 7 Nov · turn', 'Sat · turn', 'Sat 7 Nov', 'Sat'], 70)).toBe('Sat · turn')
    expect(fitLabel(['Sat 7 Nov · turn', 'Sat · turn', 'Sat 7 Nov', 'Sat'], 60)).toBe('Sat 7 Nov')
    expect(fitLabel(['Sat 7 Nov', 'Sat'], 5)).toBe('Sat')
  })
})

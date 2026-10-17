import { describe, expect, it } from 'vitest'
import { sawtooth } from './series'
import { decades, teeth, thin, together, TOLERANCE, WIDE } from './figure'

const s = sawtooth()

describe('thinning keeps the events it exists to show', () => {
  it('returns the values untouched when there is nothing to thin', () => {
    expect(thin([1, 2, 3], 10)).toEqual([1, 2, 3])
  })

  it('keeps a one-sample spike that a mean would erase', () => {
    const flat = new Array(100).fill(0)
    flat[57] = -1
    expect(thin(flat, 10)).toContain(-1)
  })

  it('is deterministic — the same input gives the same picks', () => {
    expect(thin(s.observed, 400)).toEqual(thin(s.observed, 400))
  })
})

describe('the plates are geometry over the record', () => {
  const one = together(s)
  const two = teeth(s)

  it('draws both lines on ONE scale, which is the argument', () => {
    expect(one.paths.map((p) => p.id)).toEqual(['uncorrected', 'observed'])
    expect(one.domain[0]).toBeLessThan(-10)
    expect(one.domain[1]).toBeGreaterThanOrEqual(0)
  })

  it('gives the teeth plate its own, much tighter scale', () => {
    expect(two.domain[1] - two.domain[0]).toBeLessThan(one.domain[1] - one.domain[0])
  })

  it('scales the teeth plate to the RULE, not to the data — the margin has to be visible', () => {
    expect(two.domain).toEqual([-TOLERANCE, TOLERANCE])
    // and the line must actually sit inside it, or the plate would clip the record
    for (const v of s.observed) expect(Math.abs(v)).toBeLessThan(TOLERANCE)
  })

  it('writes a value axis on both plates, so the gap can be sized and not only seen', () => {
    expect(one.axis.map((a) => a.label)).toEqual(['0 s', expect.stringMatching(/^\u2212\d+ s$/)])
    expect(two.axis).toHaveLength(3)
    expect(two.axis[0].label).toContain('the rule')
    // a true minus sign, matching the prose — never a hyphen
    expect(two.axis[2].label.startsWith('\u2212')).toBe(true)
    for (const plate of [one, two]) {
      for (const a of plate.axis) {
        expect(a.y).toBeGreaterThan(0)
        expect(a.y).toBeLessThan(WIDE.height)
        // the text, not just the line it names, has to stay on the plate
        expect(a.textY, `axis label "${a.label}" is clipped off the top`).toBeGreaterThanOrEqual(10)
        expect(a.textY, `axis label "${a.label}" falls off the bottom`).toBeLessThan(WIDE.height)
      }
    }
  })

  it('marks every inserted leap second on both plates, inside the box', () => {
    for (const plate of [one, two]) {
      expect(plate.leapX).toHaveLength(s.leaps.length)
      for (const x of plate.leapX) {
        expect(x).toBeGreaterThanOrEqual(WIDE.padX - 1)
        expect(x).toBeLessThanOrEqual(WIDE.width - WIDE.padX + 1)
      }
    }
  })

  it('keeps every drawn coordinate inside the box', () => {
    for (const { d } of [...one.paths, ...two.paths]) {
      for (const [, x, y] of d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)) {
        expect(Number(x)).toBeGreaterThanOrEqual(-1)
        expect(Number(x)).toBeLessThanOrEqual(WIDE.width + 1)
        expect(Number(y)).toBeGreaterThanOrEqual(-1)
        expect(Number(y)).toBeLessThanOrEqual(WIDE.height + 1)
      }
    }
  })

  it('uses straight segments — a spline would round a leap second into a curve the record has not', () => {
    for (const { d } of one.paths) expect(d).not.toMatch(/[CQSTA]/)
  })

  it('labels the decades and puts the last bar below the line', () => {
    const { bars, zeroY } = decades(s)
    expect(bars).toHaveLength(s.decades.length)
    expect(bars.at(-1)!.negative).toBe(true)
    expect(bars[0].negative).toBe(false)
    expect(zeroY).toBeGreaterThan(0)
  })

  it('keeps every value label inside the plate — the tallest bar clipped its own number once', () => {
    const box = { ...WIDE, height: 165, padTop: 22 }
    const { bars, decadeY } = decades(s, box)
    for (const b of bars) {
      expect(b.labelY, `${b.decade}s label is clipped off the top`).toBeGreaterThan(6)
      expect(b.labelY, `${b.decade}s label falls off the bottom`).toBeLessThan(decadeY)
    }
  })

  it('never lets a value label land on the decade row beneath it', () => {
    // The first draw put the last decade's value straight on top of its own name, because a bar
    // that barely crosses the line has no room under it.
    const { bars, decadeY } = decades(s)
    for (const b of bars) {
      expect(Math.abs(b.labelY - decadeY), `${b.decade}s value collides with its name`).toBeGreaterThan(8)
    }
  })
})

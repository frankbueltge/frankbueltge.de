import { describe, expect, it } from 'vitest'

import { GROUPS } from './groups'
import { bandWidth, bellLabelY, dividerY, labelEnd, layoutFor, NARROW_SECONDS, stagger, TAPE_LABEL_Y, TAPE_LINE_Y, visible, weightTier, WIDE_SECONDS, xOf, yOf } from './score'

describe('the score on a wide box', () => {
  const l = layoutFor(1000)

  it('keeps the names in a column on the left and shows the last 45 seconds', () => {
    expect(l.namesAbove).toBe(false)
    expect(l.left).toBe(230)
    expect(l.seconds).toBe(WIDE_SECONDS)
  })

  it('puts now on the right edge and a moment as old as the window on the left', () => {
    expect(xOf(l, 100, 100)).toBe(l.right)
    expect(xOf(l, 100, 100 - l.seconds)).toBeCloseTo(l.left)
  })

  it('stacks the six rows inside the box', () => {
    expect(yOf(l, 0)).toBe(l.top)
    expect(yOf(l, GROUPS.length - 1)).toBeLessThan(l.height)
  })
})

describe('the score on a phone', () => {
  const l = layoutFor(358)

  it('puts the names above their rows and shows fewer seconds over the full width', () => {
    expect(l.namesAbove).toBe(true)
    expect(l.left).toBe(10)
    expect(l.right).toBe(348)
    expect(l.seconds).toBe(NARROW_SECONDS)
  })

  it('moves the names above the rows wherever they would not fit beside the score', () => {
    expect(layoutFor(700).namesAbove).toBe(true)
    expect(layoutFor(800).namesAbove).toBe(false)
  })

  it('never narrower than it can draw', () => {
    expect(layoutFor(100).width).toBe(280)
  })
})

describe('the marks', () => {
  const l = layoutFor(1000)

  it('a second of asking is as wide as a second', () => {
    expect(bandWidth(l)).toBeCloseTo((l.right - l.left) / l.seconds - 1)
  })

  it('turns a label left near the right edge', () => {
    expect(labelEnd(l, 500, 6)).toBe(false)
    expect(labelEnd(l, 960, 18)).toBe(true)
  })

  it('shows what has sounded within the window, and a long mark while any of it is', () => {
    expect(visible(l, 100, 101)).toBe(false)
    expect(visible(l, 100, 60)).toBe(true)
    expect(visible(l, 100, 50)).toBe(false)
    expect(visible(l, 100, 53, 3)).toBe(true)
  })

  it('draws a weight in four steps, the lowest for barely audible', () => {
    expect([0.1, 0.3, 0.6, 0.9].map(weightTier)).toEqual([1, 2, 3, 4])
  })
})

describe('labels that would collide', () => {
  it('step down when two marks of one row stand close, and not across rows', () => {
    expect(
      stagger([
        { row: 0, x: 100, chars: 10 },
        { row: 0, x: 110, chars: 10 },
        { row: 1, x: 112, chars: 10 },
        { row: 0, x: 400, chars: 10 },
      ]),
    ).toEqual([0, 1, 0, 0])
  })

  it('stand above the row on a wide box and below it on a phone', () => {
    expect(bellLabelY(layoutFor(1000), 100, 0)).toBe(91)
    expect(bellLabelY(layoutFor(358), 100, 1)).toBe(136)
  })
})

describe('the rows', () => {
  it('are eight, the two deeper voices set apart below the six kinds of page', () => {
    for (const width of [390, 1000]) {
      const l = layoutFor(width)
      const step = yOf(l, 1) - yOf(l, 0)
      expect(yOf(l, 5) - yOf(l, 4)).toBe(step)
      expect(yOf(l, 6) - yOf(l, 5)).toBe(step + l.deep)
      expect(yOf(l, 7) - yOf(l, 6)).toBe(step)
      expect(l.deep).toBeGreaterThan(10)
      expect(yOf(l, 7) + 24).toBeLessThan(l.height)
      expect(dividerY(l)).toBeGreaterThan(yOf(l, 5))
      expect(dividerY(l)).toBeLessThan(yOf(l, 6))
    }
  })
})

describe('the line that marks a recording', () => {
  it('stands clear of the highest label of the first row, on a wide box and on a phone', () => {
    const wide = layoutFor(1000)
    // three steps of labels above the first row; the top of the highest one's letters
    const highest = bellLabelY(wide, yOf(wide, 0), 2) - 9
    expect(TAPE_LINE_Y).toBeLessThan(highest - 2)
    const phone = layoutFor(390)
    // on a phone the row's name stands above the row; the top of its letters
    expect(TAPE_LINE_Y).toBeLessThan(yOf(phone, 0) - 14 - 11)
    expect(TAPE_LABEL_Y).toBeLessThan(TAPE_LINE_Y)
  })
})

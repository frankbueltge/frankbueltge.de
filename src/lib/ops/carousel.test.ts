// Where the lab's carousel stands, and where a step takes it (2026-11-02): the two answers the
// island asks of its own geometry (src/lib/ops/carousel.ts).
import { describe, expect, it } from 'vitest'
import { currentSlide, stepSlide } from './carousel'

// a row of five slides a 1000-pixel slide and a 28-pixel gap apart, of which the last two cannot
// reach their own snap position: the row ends 600 pixels short of the fifth
const positions = [0, 1028, 2056, 3084, 4112]
const maxScroll = 3512

describe('the slide the row stands at', () => {
  it('is the one whose snap position is nearest the scroll offset', () => {
    expect(currentSlide(positions, 0, maxScroll)).toBe(0)
    expect(currentSlide(positions, 400, maxScroll)).toBe(0)
    expect(currentSlide(positions, 600, maxScroll)).toBe(1)
    expect(currentSlide(positions, 2056, maxScroll)).toBe(2)
    expect(currentSlide(positions, 2600, maxScroll)).toBe(3)
  })

  it('is the last one once the row can scroll no further, though that slide never reached its place', () => {
    expect(currentSlide(positions, maxScroll, maxScroll)).toBe(4)
    // a fractional offset on a zoomed screen still counts as the end
    expect(currentSlide(positions, maxScroll - 0.5, maxScroll)).toBe(4)
  })

  it('is the first one of a row with nothing to scroll, or of no slides at all', () => {
    expect(currentSlide([0], 0, 0)).toBe(0)
    expect(currentSlide([], 120, 0)).toBe(0)
  })

  it('prefers the earlier slide when the offset lies exactly between two', () => {
    expect(currentSlide([0, 100, 200], 50, 1000)).toBe(0)
  })
})

describe('a step', () => {
  it('moves by the slides it is given', () => {
    expect(stepSlide(0, 1, 5)).toBe(1)
    expect(stepSlide(3, -1, 5)).toBe(2)
    expect(stepSlide(1, 3, 5)).toBe(4)
  })

  it('stops at both ends rather than wrapping round', () => {
    expect(stepSlide(0, -1, 5)).toBe(0)
    expect(stepSlide(4, 1, 5)).toBe(4)
    expect(stepSlide(2, -10, 5)).toBe(0)
    expect(stepSlide(2, 10, 5)).toBe(4)
  })

  it('lands on the first slide of an empty row', () => {
    expect(stepSlide(0, 1, 0)).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { ciLabel, directionSentence, fixed, signed, windowLabel } from './format'

describe('signed', () => {
  it('prefixes positives with + and negatives with a typographic minus', () => {
    expect(signed(1.234)).toBe('+1.23')
    expect(signed(-0.5)).toBe('−0.50')
    expect(signed(0)).toBe('+0.00')
  })
})

describe('fixed', () => {
  it('keeps the typographic minus without a plus for positives', () => {
    expect(fixed(2.5)).toBe('2.50')
    expect(fixed(-2.5)).toBe('−2.50')
  })
})

describe('ciLabel', () => {
  it('renders both bounds with the ellipsis separator', () => {
    expect(ciLabel([-1.2, -0.4])).toBe('[−1.20 … −0.40]')
    expect(ciLabel([0.1, 0.9])).toBe('[0.10 … 0.90]')
  })
})

describe('directionSentence', () => {
  it('names the brighter side in plain language', () => {
    expect(directionSentence('Germany', 'self_brighter')).toContain("Germany's own press writes about Germany in brighter language")
    expect(directionSentence('Germany', 'world_brighter')).toContain("The world's press writes about Germany in brighter language")
  })
})

describe('windowLabel', () => {
  it('turns a slot window into a readable UTC range', () => {
    expect(windowLabel('20260812221500 .. 20260813220000 UTC')).toBe(
      '2026-08-12 22:15 UTC — 2026-08-13 22:00 UTC',
    )
  })
  it('passes through anything it does not recognize', () => {
    expect(windowLabel('weird')).toBe('weird')
  })
})

import { describe, expect, it } from 'vitest'
import { bars } from './histogram'

describe('bars', () => {
  it('returns one bar per observed value, digits 1..9', () => {
    const b = bars([0.3, 0.18, 0.12], [0.3, 0.18, 0.12])
    expect(b.length).toBe(3)
    expect(b.map((x) => x.digit)).toEqual([1, 2, 3])
  })

  it('normalises heights to the largest value (0..1)', () => {
    const b = bars([0.3, 0.2, 0.1], [0.3, 0.18, 0.12])
    expect(Math.max(...b.map((x) => x.obs))).toBe(1)
    b.forEach((x) => {
      expect(x.obs).toBeGreaterThanOrEqual(0)
      expect(x.obs).toBeLessThanOrEqual(1)
    })
  })

  it('handles all-zero input without dividing by zero', () => {
    const b = bars([0, 0], [0, 0])
    expect(b.every((x) => x.obs === 0 && x.exp === 0)).toBe(true)
  })
})

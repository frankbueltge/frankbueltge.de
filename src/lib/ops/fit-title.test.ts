// The standing question on one line (2026-11-03): the size the edition's script fits it to.
import { describe, expect, it } from 'vitest'
import { fitFontSize } from './fit-title'

describe('fitting a line to its width', () => {
  it('scales the size by the ratio of the room to the line', () => {
    expect(fitFontSize({ width: 600, size: 60, available: 1200, max: 150 })).toBe(120)
    expect(fitFontSize({ width: 800, size: 40, available: 400, max: 150 })).toBe(20)
  })

  it('never goes past the largest size it is given', () => {
    expect(fitFontSize({ width: 300, size: 60, available: 1200, max: 150 })).toBe(150)
  })

  it('rounds down, so the fitted line never overflows by a rounding', () => {
    const size = fitFontSize({ width: 700, size: 70, available: 1000, max: 150 })!
    expect((700 / 70) * size).toBeLessThanOrEqual(1000)
  })

  it('leaves the stylesheet’s size where nothing was measured', () => {
    expect(fitFontSize({ width: 0, size: 60, available: 1200, max: 150 })).toBeNull()
    expect(fitFontSize({ width: 600, size: 60, available: 0, max: 150 })).toBeNull()
  })
})

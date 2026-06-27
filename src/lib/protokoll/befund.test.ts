import { describe, expect, it } from 'vitest'
import { befundSatz, corridorPosition, streak } from './befund'

describe('corridorPosition', () => {
  it('maps a value to 0..1 within the corridor', () => {
    expect(corridorPosition(425, [350, 500])).toBeCloseTo(0.5, 5)
    expect(corridorPosition(375, [350, 500])).toBeCloseTo(0.1667, 3)
  })
  it('clamps below min and above max', () => {
    expect(corridorPosition(300, [350, 500])).toBe(0)
    expect(corridorPosition(600, [350, 500])).toBe(1)
  })
})

describe('streak', () => {
  it('counts consecutive moves in the latest direction', () => {
    expect(streak([1, 2, 3])).toEqual({ dir: 'up', len: 2 })
    expect(streak([3, 2, 1])).toEqual({ dir: 'down', len: 2 })
    expect(streak([5, 1, 2, 3])).toEqual({ dir: 'up', len: 2 }) // up-run nur am Ende
  })
  it('is flat for equal or single values', () => {
    expect(streak([2, 2])).toEqual({ dir: 'flat', len: 0 })
    expect(streak([7])).toEqual({ dir: 'flat', len: 0 })
    expect(streak([])).toEqual({ dir: 'flat', len: 0 })
  })
})

describe('befundSatz', () => {
  it('reports a record high (latest is max over >=3 readings)', () => {
    expect(befundSatz([1, 2, 5], [0, 10], true)).toBe('Höchster Wert im verzeichneten Zeitraum.')
  })
  it('reports a record low', () => {
    expect(befundSatz([5, 4, 3], [0, 10], true)).toBe('Niedrigster Wert im verzeichneten Zeitraum.')
  })
  it('reports a streak when not a record', () => {
    expect(befundSatz([5, 1, 2, 3], [0, 10], true)).toBe('Seit 2 Tagen steigend.')
  })
  it('falls back to the corridor position', () => {
    expect(befundSatz([400, 480], [350, 500], true)).toBe('Im oberen Drittel des plausiblen Bereichs.')
    expect(befundSatz([360, 355], [350, 500], true)).toBe('Im unteren Drittel des plausiblen Bereichs.')
  })
  it('is empty with fewer than two readings', () => {
    expect(befundSatz([400], [350, 500], true)).toBe('')
  })
  it('localises to English', () => {
    expect(befundSatz([1, 2, 5], [0, 10], false)).toBe('Highest value in the recorded period.')
  })
})

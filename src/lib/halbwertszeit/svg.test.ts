import { describe, expect, it } from 'vitest'
import { SPARK_H, SPARK_W, sparkPath } from './svg'

describe('sparkPath', () => {
  it('startet am Peak oben und endet rechts unten beim Sockel', () => {
    const series: [string, number][] = [
      ['2026-03-01', 10000], ['2026-03-02', 5000], ['2026-03-03', 2500], ['2026-03-04', 100],
    ]
    const path = sparkPath(series)
    expect(path.startsWith('M0.0,1.0')).toBe(true) // Peak: ganz oben
    const last = path.split(' L').at(-1)!
    expect(parseFloat(last.split(',')[0])).toBe(SPARK_W)
    expect(parseFloat(last.split(',')[1])).toBeGreaterThan(SPARK_H - 8) // Sockel: fast unten
  })

  it('leere oder flache Serien ergeben keinen Pfad', () => {
    expect(sparkPath([])).toBe('')
    expect(sparkPath([['2026-03-01', 0], ['2026-03-02', 0]])).toBe('')
  })
})

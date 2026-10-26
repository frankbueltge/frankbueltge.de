import { describe, expect, it } from 'vitest'
import { BOX, gapFigure } from './figure'
import type { RankRow } from './rank'

const matters = [
  { id: 'loud', title: 'Loud', quiet: false, signals: 150 },
  { id: 'some', title: 'Some', quiet: false, signals: 9 },
  { id: 'silent', title: 'Silent', quiet: true, signals: 0 },
]
const row = (id: string, score: number, low = score, high = score): RankRow => ({ id, score, low, high, appearances: 0, wins: 0, ties: 0 })

describe('gapFigure', () => {
  it('puts a silent matter on the left edge and the loudest furthest right, inside the box', () => {
    const f = gapFigure(matters, [])
    const x = Object.fromEntries(f.marks.map((m) => [m.id, m.x]))
    expect(x.silent).toBe(BOX.padLeft)
    expect(x.loud!).toBeGreaterThan(x.some!)
    for (const m of f.marks) expect(m.x).toBeLessThanOrEqual(BOX.width - BOX.padRight)
  })

  it('seats every mark on the 50 line before any reading', () => {
    const f = gapFigure(matters, [])
    expect(f.marks.every((m) => m.y === f.mid && m.yLow === f.mid && m.yHigh === f.mid)).toBe(true)
  })

  it('draws a higher score higher, with its interval around it', () => {
    const f = gapFigure(matters, [row('silent', 80, 70, 88), row('loud', 30, 22, 41), row('some', 50)])
    const silent = f.marks.find((m) => m.id === 'silent')!
    const loud = f.marks.find((m) => m.id === 'loud')!
    expect(silent.y).toBeLessThan(loud.y)
    expect(silent.yHigh).toBeLessThan(silent.y)
    expect(silent.yLow).toBeGreaterThan(silent.y)
  })

  it('pushes apart labels whose boxes overlap, even when their marks stand apart', () => {
    const f = gapFigure(
      [
        { id: 'a', title: 'A long label that runs far to the right', quiet: false, signals: 0 },
        { id: 'b', title: 'Another long label', quiet: false, signals: 1 },
        { id: 'c', title: 'Loud', quiet: false, signals: 1000 },
      ],
      [],
    )
    const [a, b] = f.marks
    expect(b!.x - a!.x).toBeGreaterThan(40)
    expect(Math.abs(a!.labelY - b!.labelY)).toBeGreaterThanOrEqual(13)
  })

  it('pushes labels apart that would collide', () => {
    const f = gapFigure(
      [
        { id: 'a', title: 'A', quiet: false, signals: 0 },
        { id: 'b', title: 'B', quiet: true, signals: 0 },
      ],
      [],
    )
    const [a, b] = f.marks
    expect(Math.abs(a!.labelY - b!.labelY)).toBeGreaterThanOrEqual(13)
  })

  it('labels the axes with round values only', () => {
    const f = gapFigure(matters, [])
    // the axis runs to the next half decade above the loudest matter: 150 signals → about 316
    expect(f.xTicks.map((t) => t.value)).toEqual([0, 1, 3, 10, 30, 100, 300])
    expect(f.yTicks.map((t) => t.value)).toEqual([0, 25, 50, 75, 100])
  })
})

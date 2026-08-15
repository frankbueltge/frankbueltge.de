import { describe, expect, it } from 'vitest'
import latest from '@/data/invoked/latest.json'
import { buildFigure, figureInput, type FigureInput } from './figure'
import type { InvokedData } from './types'

const d = latest as unknown as InvokedData
const input = figureInput(d)
const m = buildFigure(input)

const EMPTY: FigureInput = {
  years: [],
  standout: null,
  maxYearObserved: 0,
  windowStart: 1800,
  today: 2026,
  neighbourhoodWindow: 5,
}

describe('figureInput', () => {
  it('reads the figure straight out of the committed record', () => {
    expect(input.years).toBe(d.years)
    expect(input.windowStart).toBe(d.method.year_window[0])
    expect(input.maxYearObserved).toBe(d.stats.max_year_observed)
    expect(input.today).toBe(Number(d.date.slice(0, 4)))
    expect(input.neighbourhoodWindow).toBe(5)
    expect(input.standout?.year).toBe(d.headline?.year)
  })
})

describe('buildFigure', () => {
  it('draws one bar per invoked year, in the order the record carries them', () => {
    expect(m.empty).toBe(false)
    expect(m.bars).toHaveLength(d.years.length)
    expect(m.bars.map((b) => b.year)).toEqual(d.years.map((y) => y.year))
  })

  it('keeps every mark inside the plot box', () => {
    for (const b of m.bars) {
      expect(b.x).toBeGreaterThanOrEqual(m.plotLeft)
      expect(b.x + b.width).toBeLessThanOrEqual(m.plotRight + 0.01)
      expect(b.y).toBeGreaterThanOrEqual(m.plotTop - 0.01)
      expect(+(b.y + b.height).toFixed(2)).toBeLessThanOrEqual(m.plotBottom)
      expect(b.height).toBeGreaterThanOrEqual(0)
      expect(b.width).toBeGreaterThan(0)
    }
    for (const t of m.yTicks) {
      expect(t.y).toBeGreaterThanOrEqual(m.plotTop - 0.01)
      expect(t.y).toBeLessThanOrEqual(m.plotBottom + 0.01)
    }
    for (const t of m.xTicks) {
      expect(t.x).toBeGreaterThanOrEqual(m.plotLeft)
      expect(t.x).toBeLessThanOrEqual(m.plotRight)
    }
  })

  it('is a linear count scale: taller bar means more mentions, and years run left to right', () => {
    const tallest = m.bars.reduce((a, b) => (b.height > a.height ? b : a))
    const busiest = d.years.reduce((a, b) => (b.mentions > a.mentions ? b : a))
    expect(tallest.year).toBe(busiest.year)
    for (let i = 1; i < m.bars.length; i++) {
      expect(m.bars[i].x).toBeGreaterThan(m.bars[i - 1].x)
      const ratio = m.bars[i].height / Math.max(1e-9, m.bars[i].mentions)
      const previous = m.bars[i - 1].height / Math.max(1e-9, m.bars[i - 1].mentions)
      expect(ratio).toBeCloseTo(previous, 1) // one unit of mentions is one length everywhere
    }
  })

  it('marks exactly the standout year the record published', () => {
    const marked = m.bars.filter((b) => b.standout)
    expect(marked).toHaveLength(1)
    expect(marked[0].year).toBe(d.headline!.year)
    expect(marked[0].mentions).toBe(d.headline!.mentions)
  })

  it('rules the neighbourhood across exactly the years the median was taken from', () => {
    const n = m.neighbourhood!
    expect(n.from).toBe(d.headline!.year - 5)
    expect(n.to).toBe(d.headline!.year + 5)
    expect(n.median).toBe(d.headline!.neighbourhood_median)
    expect(n.x1).toBeLessThan(n.x2)
    // the finding IS that the bar towers over this rule: on screen the rule sits lower
    expect(n.y).toBeGreaterThan(m.bars.find((b) => b.standout)!.y)
    expect(n.y).toBeLessThanOrEqual(m.plotBottom)
  })

  it('anchors the standout label in the headroom above the plot, pointing at its bar', () => {
    const c = m.callout!
    expect(c.labelY).toBeLessThan(m.plotTop)
    expect(c.leaderY2).toBeGreaterThan(c.leaderY1)
    expect(c.leaderY2).toBeLessThanOrEqual(m.bars.find((b) => b.standout)!.y)
    // a label near the right edge reads leftwards, so it cannot run off the figure
    expect(c.anchor).toBe(c.x > (m.plotLeft + m.plotRight) / 2 ? 'end' : 'start')
  })

  it('draws the wall at the boundary after the last year the source emits', () => {
    expect(m.wall!.year).toBe(d.stats.max_year_observed)
    const lastBar = m.bars.at(-1)!
    expect(lastBar.year).toBe(d.stats.max_year_observed)
    expect(m.wall!.x).toBeGreaterThanOrEqual(lastBar.x + lastBar.width)
    expect(m.wall!.x).toBeLessThan(m.plotRight)
  })

  it('draws the years the source never emits as an empty, labelled band', () => {
    const g = m.gap!
    expect(g.from).toBe(d.stats.max_year_observed + 1)
    expect(g.to).toBe(Number(d.date.slice(0, 4)))
    expect(g.width).toBeGreaterThan(0)
    expect(+(g.x + g.width).toFixed(2)).toBe(m.plotRight)
    expect(g.labelX).toBeGreaterThan(g.x)
    expect(g.labelX).toBeLessThan(m.plotRight)
    expect(g.labelY).toBeLessThan(m.plotBottom)
    // no bar may sit inside the band — the band is exactly what was never emitted
    for (const b of m.bars) expect(b.x).toBeLessThan(g.x)
  })

  it('has no wall to draw once the source reaches the present', () => {
    const reaching = buildFigure({ ...input, maxYearObserved: input.today })
    expect(reaching.wall).toBeNull()
    expect(reaching.gap).toBeNull()
  })

  it('renders the failed-fetch record as an empty model instead of an invented one', () => {
    const empty = buildFigure(EMPTY)
    expect(empty.empty).toBe(true)
    expect(empty.bars).toHaveLength(0)
    expect(empty.neighbourhood).toBeNull()
    expect(empty.callout).toBeNull()
    expect(empty.wall).toBeNull()
    expect(empty.gap).toBeNull()
    expect(empty.yMax).toBeGreaterThan(0) // a degenerate axis is still a finite axis
    expect(empty.height).toBeGreaterThan(0)
  })

  it('is deterministic — the same record draws the same figure', () => {
    expect(buildFigure(input)).toEqual(buildFigure(input))
    expect(buildFigure(EMPTY)).toEqual(buildFigure(EMPTY))
  })

  it('rounds the axis to a readable ceiling above the tallest bar', () => {
    const busiest = Math.max(...d.years.map((y) => y.mentions))
    expect(m.yMax).toBeGreaterThanOrEqual(busiest)
    expect(m.yTicks.length).toBeGreaterThanOrEqual(4)
    expect(m.yTicks.length).toBeLessThanOrEqual(7)
    expect(m.yTicks[0].value).toBe(0)
    expect(m.yTicks.at(-1)!.value).toBe(m.yMax)
    expect(m.yTicks[0].y).toBe(m.plotBottom)
  })
})

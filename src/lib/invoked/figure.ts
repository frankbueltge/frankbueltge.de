/** Invoked Past figure — pure geometry for the year histogram.
 *  Build-time only; unit-tested so the drawing is derived, not eyeballed.
 *
 *  The figure carries three facts at once, which is why it exists at all:
 *    · the shape of the press's memory — one bar per invoked year, on a linear count scale,
 *    · the day's finding — the standout year, with the neighbourhood median it towers over
 *      drawn as a rule across exactly the years that median was taken from,
 *    · the wall — the axis runs to the day's own year, and the stretch the extractor never
 *      emits is drawn as an empty, labelled band rather than left off the axis. A gap that
 *      is not drawn reads as a press that stopped remembering; this one is the instrument's,
 *      and the drawing says so. */
import { standoutWindow } from './format'
import type { InvokedData, InvokedYear } from './types'

export interface HistogramBar {
  year: number
  mentions: number
  x: number
  y: number
  width: number
  height: number
  standout: boolean
}

export interface FigureInput {
  years: InvokedYear[]
  /** the day's standout year and the baseline it was measured against, or null */
  standout: { year: number; mentions: number; neighbourhoodMedian: number } | null
  /** the highest year the source emitted today — the wall, re-measured every night */
  maxYearObserved: number
  /** the method's plausible-window start (1800) */
  windowStart: number
  /** the record's own year: the right edge of what the press could possibly invoke */
  today: number
  /** half-width of the neighbourhood the standout is measured against (±N years) */
  neighbourhoodWindow: number
}

export interface FigureOptions {
  width?: number
  plotHeight?: number
  padLeft?: number
  padRight?: number
  padTop?: number
  padBottom?: number
}

export interface FigureModel {
  bars: HistogramBar[]
  yTicks: { y: number; value: number }[]
  xTicks: { x: number; year: number }[]
  /** the rule the standout is measured against, spanning the years it was taken from */
  neighbourhood: { x1: number; x2: number; y: number; median: number; from: number; to: number } | null
  /** anchor for the standout's direct label: a plumb line from the headroom to the bar */
  callout: { x: number; labelX: number; labelY: number; leaderY1: number; leaderY2: number; anchor: 'start' | 'end' } | null
  /** the cliff in the source's own extraction, at the boundary after the last year it emits */
  wall: { x: number; year: number } | null
  /** the years the source never emits: drawn empty, labelled, never omitted */
  gap: { x: number; width: number; from: number; to: number; labelX: number; labelY: number } | null
  width: number
  height: number
  plotLeft: number
  plotRight: number
  plotTop: number
  plotBottom: number
  yMax: number
  yStep: number
  empty: boolean
}

/** The figure's input, read out of the committed record — the page and its test build the
 *  same input from the same file, so what the test checks is what the page draws. */
export function figureInput(d: InvokedData): FigureInput {
  return {
    years: d.years,
    standout: d.headline
      ? {
          year: d.headline.year,
          mentions: d.headline.mentions,
          neighbourhoodMedian: d.headline.neighbourhood_median,
        }
      : null,
    maxYearObserved: d.stats.max_year_observed,
    windowStart: d.method.year_window[0],
    today: Number(d.date.slice(0, 4)),
    neighbourhoodWindow: standoutWindow(d.method.standout),
  }
}

/** A round axis ceiling and its tick step, aiming for four to five gridlines. */
function niceScale(max: number): { top: number; step: number } {
  if (!(max > 0)) return { top: 1, step: 1 }
  const target = max / 4
  const exp = Math.pow(10, Math.floor(Math.log10(target)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * exp).find((s) => s >= target) ?? exp * 10
  return { top: Math.ceil(max / step) * step, step }
}

const r2 = (n: number) => +n.toFixed(2)

export function buildFigure(input: FigureInput, opts: FigureOptions = {}): FigureModel {
  const width = opts.width ?? 720
  const plotHeight = opts.plotHeight ?? 190
  const padLeft = opts.padLeft ?? 46
  const padRight = opts.padRight ?? 12
  const padTop = opts.padTop ?? 34
  const padBottom = opts.padBottom ?? 26

  const plotLeft = padLeft
  const plotRight = width - padRight
  const plotTop = padTop
  const plotBottom = padTop + plotHeight
  const height = plotBottom + padBottom

  const windowStart = input.windowStart
  const domainEnd = Math.max(input.today, input.maxYearObserved, windowStart)
  const slots = domainEnd - windowStart + 1
  const slot = (plotRight - plotLeft) / slots
  const barWidth = r2(Math.max(1, slot * 0.78))
  const xOf = (year: number) => plotLeft + (year - windowStart) * slot

  const maxMentions = input.years.reduce((m, y) => Math.max(m, y.mentions), 0)
  const { top: yMax, step: yStep } = niceScale(maxMentions)
  const yOf = (value: number) => plotBottom - (value / yMax) * plotHeight

  const standoutYear = input.standout?.year ?? null
  const bars: HistogramBar[] = input.years.map((y) => {
    const barY = r2(yOf(y.mentions))
    return {
      year: y.year,
      mentions: y.mentions,
      x: r2(xOf(y.year)),
      y: barY,
      width: barWidth,
      height: r2(plotBottom - barY),
      standout: y.year === standoutYear,
    }
  })

  const yTicks: { y: number; value: number }[] = []
  for (let v = 0; v <= yMax + 1e-9; v += yStep) {
    yTicks.push({ y: r2(yOf(v)), value: +v.toFixed(6) })
  }

  const xTicks: { x: number; year: number }[] = []
  const tickStep = 50
  for (let year = Math.ceil(windowStart / tickStep) * tickStep; year <= domainEnd; year += tickStep) {
    xTicks.push({ x: r2(xOf(year) + barWidth / 2), year })
  }

  // The wall: the boundary AFTER the last year the source emits. Only a wall while the
  // source stops short of the present — if it ever reaches this year, there is nothing
  // to draw and the band below disappears with it.
  const hasWall = input.maxYearObserved >= windowStart && input.maxYearObserved < domainEnd
  const wallX = hasWall ? r2(xOf(input.maxYearObserved + 1)) : 0
  const wall = hasWall ? { x: wallX, year: input.maxYearObserved } : null
  const gap = hasWall
    ? {
        x: wallX,
        width: r2(plotRight - wallX),
        from: input.maxYearObserved + 1,
        to: domainEnd,
        labelX: r2(wallX + (plotRight - wallX) / 2 + 3.5),
        labelY: r2(plotBottom - 6),
      }
    : null

  const s = input.standout
  const neighbourhood = s
    ? {
        x1: r2(Math.max(plotLeft, xOf(s.year - input.neighbourhoodWindow))),
        x2: r2(Math.min(plotRight, xOf(s.year + input.neighbourhoodWindow) + barWidth)),
        y: r2(yOf(s.neighbourhoodMedian)),
        median: s.neighbourhoodMedian,
        from: s.year - input.neighbourhoodWindow,
        to: s.year + input.neighbourhoodWindow,
      }
    : null

  const calloutBar = s ? bars.find((b) => b.year === s.year) : undefined
  const calloutX = calloutBar ? r2(calloutBar.x + barWidth / 2) : 0
  const anchor: 'start' | 'end' = calloutX > (plotLeft + plotRight) / 2 ? 'end' : 'start'
  const callout = calloutBar
    ? {
        x: calloutX,
        labelX: r2(anchor === 'end' ? calloutX - 6 : calloutX + 6),
        labelY: 15,
        leaderY1: 21,
        leaderY2: r2(Math.max(21, calloutBar.y - 4)),
        anchor,
      }
    : null

  return {
    bars,
    yTicks,
    xTicks,
    neighbourhood,
    callout,
    wall,
    gap,
    width,
    height,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    yMax,
    yStep,
    empty: bars.length === 0,
  }
}

/** Balance figure — pure geometry for the dumbbell (gap) chart.
 *  Build-time only; unit-tested so the drawing is derived, not eyeballed. */
import type { BalanceCountry } from './types'

export interface DumbbellRow {
  fips: string
  name: string
  self: number
  foreign: number
  gap: number
  nSelf: number
  nForeign: number
  y: number
  xSelf: number
  xForeign: number
  /** x of the gap label, just past the rightmost dot */
  xLabel: number
}

export interface FigureModel {
  rows: DumbbellRow[]
  ticks: { x: number; label: string }[]
  xZero: number
  width: number
  height: number
  padTop: number
  rowHeight: number
  labelWidth: number
}

export interface FigureOptions {
  top?: number
  width?: number
  labelWidth?: number
  rowHeight?: number
  padTop?: number
  padRight?: number
}

/** Top |tone gap| countries with a significant gap, drawn on a shared tone axis.
 *  Only significant rows enter the figure — the full table below carries the rest. */
export function buildFigure(countries: BalanceCountry[], opts: FigureOptions = {}): FigureModel {
  const top = opts.top ?? 14
  const width = opts.width ?? 680
  const labelWidth = opts.labelWidth ?? 150
  const rowHeight = opts.rowHeight ?? 30
  const padTop = opts.padTop ?? 26
  const padRight = opts.padRight ?? 64

  const rows = countries
    .filter((c) => c.dims.tone?.significant)
    .map((c) => ({
      fips: c.fips,
      name: c.name,
      self: c.dims.tone!.self,
      foreign: c.dims.tone!.foreign,
      gap: +(c.dims.tone!.self - c.dims.tone!.foreign).toFixed(3),
      nSelf: c.n_self,
      nForeign: c.n_foreign,
    }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap) || a.fips.localeCompare(b.fips))
    .slice(0, top)

  const values = rows.flatMap((r) => [r.self, r.foreign])
  const lo = Math.floor(Math.min(0, ...values)) - 1
  const hi = Math.ceil(Math.max(0, ...values)) + 1
  const plotWidth = width - labelWidth - padRight
  const x = (v: number) => labelWidth + ((v - lo) / (hi - lo)) * plotWidth

  const step = hi - lo > 12 ? 4 : 2
  const ticks: { x: number; label: string }[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    ticks.push({ x: +x(v).toFixed(1), label: v > 0 ? `+${v}` : String(v) })
  }

  const placed: DumbbellRow[] = rows.map((r, i) => {
    const xSelf = +x(r.self).toFixed(1)
    const xForeign = +x(r.foreign).toFixed(1)
    return {
      ...r,
      y: padTop + i * rowHeight + rowHeight / 2,
      xSelf,
      xForeign,
      xLabel: +(Math.max(xSelf, xForeign) + 12).toFixed(1),
    }
  })

  return {
    rows: placed,
    ticks,
    xZero: +x(0).toFixed(1),
    width,
    height: padTop + rows.length * rowHeight + 24,
    padTop,
    rowHeight,
    labelWidth,
  }
}

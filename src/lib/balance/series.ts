/**
 * Balance — the series: every country's tone gap across the committed archive.
 *
 * One day's ledger cannot say whether a gap is a habit or an accident; the archive can. This
 * module reads every committed day file (src/data/balance/YYYY-MM-DD.json) and returns, per
 * country and per calendar day, exactly what that day's file recorded — and nothing it did not:
 *   · a country below the article floor on a measured day is ABSENT that day, never zero;
 *   · a day whose fetch failed, or a calendar day with no committed file, is UNMEASURED for
 *     every country, drawn as a gap and never bridged;
 *   · the gap is the file's own `self − foreign`, its interval the file's own bootstrap 95%
 *     interval, and significance the file's own flag (the contract test holds that flag to the
 *     interval). Nothing is re-estimated, smoothed or interpolated.
 * Geometry for the figure is computed here too, so every position the page draws is tested.
 */
import { dailyCalendar, monthTicks } from '@/lib/archive/calendar'
import { fixed, signed } from './format'
import type { BalanceData } from './types'

export type DayKind = 'measured' | 'failed' | 'missing'

export interface SeriesDay {
  date: string
  kind: DayKind
  /** countries in that day's ledger; 0 on a failed or missing day */
  listed: number
  /** the day's headline — its widest significant tone gap — or null */
  headline: { fips: string; name: string; nSelf: number; gap: number } | null
}

export type Direction = 'own' | 'world'

export type CountryDay =
  | {
      date: string
      state: 'measured'
      gap: number
      lo: number
      hi: number
      significant: boolean
      /** which press wrote brighter, when the interval excludes zero; null when it does not */
      direction: Direction | null
      nSelf: number
      nForeign: number
    }
  /** a measured day on which the country did not clear the floor in both pools */
  | { date: string; state: 'absent' }
  /** listed, but the record carries no tone dimension for it */
  | { date: string; state: 'withheld' }
  /** nothing was measured for anyone: the fetch failed, or no file exists for the day */
  | { date: string; state: 'unmeasured'; kind: 'failed' | 'missing' }

export interface Run {
  direction: Direction
  days: number
  from: string
  to: string
}

export interface CountrySeries {
  fips: string
  name: string
  /** one entry per calendar day of the archive, aligned with BalanceSeries.days */
  days: CountryDay[]
  /** days with a measured tone gap */
  listed: number
  /** significant days on which its own press wrote brighter than the world's press */
  ownBrighter: number
  /** significant days on which the world's press wrote brighter */
  worldBrighter: number
  notSignificant: number
  /** measured days on which it fell below the floor */
  absent: number
  withheld: number
  medianGap: number | null
  /** median over listed days of the smaller of the two pools — the depth of the measurement */
  medianSmallerPool: number | null
  /** the longest stretch of consecutive calendar days significant in one direction; any other
   *  day — not significant, absent, unmeasured — ends a run */
  longestRun: Run | null
  /** days on which it carried the day's headline */
  headlineDays: number
}

export interface BalanceSeries {
  days: SeriesDay[]
  measured: number
  failed: number
  missing: number
  first: string | null
  last: string | null
  /** the article floor, from the newest measured record's method block */
  minPool: number | null
  /** every country listed on at least one day, in selection order (see bySelection) */
  countries: CountrySeries[]
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const r3 = (n: number) => +n.toFixed(3)

/** The selection rule of the figure, and the order of the ledger: the countries that clear the
 *  floor most often first; ties to the deeper smaller pool (the better-measured country); then
 *  the FIPS code, so the order is total. A rule on the MEASUREMENT, never on the result — picking
 *  rows by how persistent their gap is would find persistence by selection. */
export function bySelection(a: CountrySeries, b: CountrySeries): number {
  return (
    b.listed - a.listed ||
    (b.medianSmallerPool ?? -1) - (a.medianSmallerPool ?? -1) ||
    a.fips.localeCompare(b.fips)
  )
}

export function balanceSeries(files: Record<string, unknown>): BalanceSeries {
  const calendar = dailyCalendar<BalanceData>(files, 'balance')
  const days: SeriesDay[] = calendar.map(({ date, record }) => {
    if (!record) return { date, kind: 'missing', listed: 0, headline: null }
    if (record.stats.slots_fetched === 0) return { date, kind: 'failed', listed: 0, headline: null }
    const h = record.headline
    return {
      date,
      kind: 'measured',
      listed: record.countries.length,
      headline: h ? { fips: h.fips, name: h.name, nSelf: h.n_self, gap: h.gap } : null,
    }
  })

  // every country ever listed, named as its newest listing names it
  const names = new Map<string, string>()
  for (const { record } of calendar) {
    if (!record) continue
    for (const c of record.countries) names.set(c.fips, c.name)
  }

  const countries: CountrySeries[] = [...names.entries()].map(([fips, name]) => {
    const perDay: CountryDay[] = calendar.map(({ date, record }, i) => {
      const kind = days[i].kind
      if (kind !== 'measured' || !record) return { date, state: 'unmeasured', kind: kind === 'failed' ? 'failed' : 'missing' }
      const row = record.countries.find((c) => c.fips === fips)
      if (!row) return { date, state: 'absent' }
      const tone = row.dims.tone
      if (!tone) return { date, state: 'withheld' }
      const [lo, hi] = tone.gap_ci95
      return {
        date,
        state: 'measured',
        gap: r3(tone.self - tone.foreign),
        lo,
        hi,
        significant: tone.significant,
        direction: tone.significant ? (lo > 0 ? 'own' : hi < 0 ? 'world' : null) : null,
        nSelf: row.n_self,
        nForeign: row.n_foreign,
      }
    })

    const measured = perDay.filter((d): d is Extract<CountryDay, { state: 'measured' }> => d.state === 'measured')
    let longestRun = null as Run | null
    let current = null as Run | null
    for (const d of perDay) {
      const dir = d.state === 'measured' ? d.direction : null
      if (dir && current && current.direction === dir) {
        current = { direction: dir, days: current.days + 1, from: current.from, to: d.date }
      } else {
        current = dir ? { direction: dir, days: 1, from: d.date, to: d.date } : null
      }
      if (current && (!longestRun || current.days > longestRun.days)) longestRun = current
    }

    return {
      fips,
      name,
      days: perDay,
      listed: measured.length,
      ownBrighter: measured.filter((d) => d.direction === 'own').length,
      worldBrighter: measured.filter((d) => d.direction === 'world').length,
      notSignificant: measured.filter((d) => !d.significant).length,
      absent: perDay.filter((d) => d.state === 'absent').length,
      withheld: perDay.filter((d) => d.state === 'withheld').length,
      medianGap: median(measured.map((d) => d.gap)),
      medianSmallerPool: median(measured.map((d) => Math.min(d.nSelf, d.nForeign))),
      longestRun,
      headlineDays: days.filter((d) => d.headline?.fips === fips).length,
    }
  })

  const newest = [...calendar].reverse().find((d) => d.record && d.record.stats.slots_fetched > 0)?.record
  return {
    days,
    measured: days.filter((d) => d.kind === 'measured').length,
    failed: days.filter((d) => d.kind === 'failed').length,
    missing: days.filter((d) => d.kind === 'missing').length,
    first: days[0]?.date ?? null,
    last: days[days.length - 1]?.date ?? null,
    minPool: newest?.method.min_pool ?? null,
    countries: countries.filter((c) => c.listed > 0).sort(bySelection),
  }
}

/** The figure's rows: the first `k` countries in selection order, then drawn from the most
 *  own-press-brighter median gap at the top to the most world-press-brighter at the bottom. */
export function figureRows(series: BalanceSeries, k = 8): CountrySeries[] {
  return series.countries
    .slice(0, k)
    .sort((a, b) => (b.medianGap ?? -Infinity) - (a.medianGap ?? -Infinity) || a.fips.localeCompare(b.fips))
}

/** The rows' two persistence extremes: the largest share of listed days significant in each
 *  direction (ties to the longer listing, then the FIPS code). Null where no row has a single
 *  significant day in that direction. */
export function persistenceExtremes(rows: readonly CountrySeries[]): { own: CountrySeries | null; world: CountrySeries | null } {
  const pick = (count: (c: CountrySeries) => number): CountrySeries | null => {
    const ranked = rows
      .filter((c) => c.listed > 0 && count(c) > 0)
      .sort((a, b) => count(b) / b.listed - count(a) / a.listed || b.listed - a.listed || a.fips.localeCompare(b.fips))
    return ranked[0] ?? null
  }
  return { own: pick((c) => c.ownBrighter), world: pick((c) => c.worldBrighter) }
}

export interface HeadlineTally {
  fips: string
  name: string
  days: number
}

/** Who carried the day's headline across the archive, and how deep its self pool was. */
export function headlineTally(series: BalanceSeries): {
  tally: HeadlineTally[]
  days: number
  medianSelfPool: number | null
  medianListedSelfPool: number | null
} {
  const counts = new Map<string, HeadlineTally>()
  const pools: number[] = []
  for (const d of series.days) {
    if (!d.headline) continue
    const t = counts.get(d.headline.fips) ?? { fips: d.headline.fips, name: d.headline.name, days: 0 }
    counts.set(d.headline.fips, { ...t, days: t.days + 1 })
    pools.push(d.headline.nSelf)
  }
  const listedPools = series.countries.flatMap((c) =>
    c.days.flatMap((d) => (d.state === 'measured' ? [d.nSelf] : [])),
  )
  return {
    tally: [...counts.values()].sort((a, b) => b.days - a.days || a.fips.localeCompare(b.fips)),
    days: pools.length,
    medianSelfPool: median(pools),
    medianListedSelfPool: median(listedPools),
  }
}

// ——— tables ————————————————————————————————————————————————————————————————————————

export type Cell = string | number

/** One cell of the per-day table: what the file says about that country on that day. */
export function dayCell(d: CountryDay): string {
  switch (d.state) {
    case 'measured':
      return `${signed(d.gap)} [${fixed(d.lo)} … ${fixed(d.hi)}]${d.significant ? '' : ' n.s.'}`
    case 'absent':
      return 'below floor'
    case 'withheld':
      return 'withheld'
    case 'unmeasured':
      return d.kind === 'failed' ? 'source unreachable' : 'no file'
  }
}

/** The figure as a table: one row per calendar day, newest first, one column per drawn country. */
export function seriesTable(series: BalanceSeries, rows: readonly CountrySeries[]): {
  columns: { key: string; label: string; align?: 'left' | 'right'; nowrap?: boolean }[]
  rows: Record<string, Cell>[]
} {
  const columns = [
    { key: 'date', label: 'Day', nowrap: true },
    ...rows.map((c) => ({ key: c.fips, label: c.name, align: 'right' as const, nowrap: true })),
  ]
  const out = series.days
    .map((day, i) => {
      const row: Record<string, Cell> = { date: day.date }
      for (const c of rows) row[c.fips] = dayCell(c.days[i])
      return row
    })
    .reverse()
  return { columns, rows: out }
}

/** The persistence ledger: every country listed on at least `minShare` of the measured days,
 *  in selection order. */
export function persistenceTable(series: BalanceSeries, minShare = 0.5): {
  columns: { key: string; label: string; align?: 'left' | 'right'; nowrap?: boolean }[]
  rows: Record<string, Cell>[]
  floor: number
} {
  const floor = Math.ceil(series.measured * minShare)
  const columns = [
    { key: 'name', label: 'Country' },
    { key: 'listed', label: 'listed', align: 'right' as const },
    { key: 'own', label: 'own press brighter', align: 'right' as const },
    { key: 'world', label: 'world’s press brighter', align: 'right' as const },
    { key: 'ns', label: 'n.s.', align: 'right' as const },
    { key: 'median', label: 'median gap', align: 'right' as const },
    { key: 'pool', label: 'median smaller pool', align: 'right' as const },
    { key: 'headline', label: 'headline days', align: 'right' as const },
  ]
  const rows = series.countries
    .filter((c) => c.listed >= floor && c.listed > 0)
    .map((c) => ({
      name: c.name,
      listed: `${c.listed} of ${series.measured}`,
      own: c.ownBrighter,
      world: c.worldBrighter,
      ns: c.notSignificant,
      median: c.medianGap === null ? '—' : signed(c.medianGap),
      pool: c.medianSmallerPool === null ? '—' : Math.round(c.medianSmallerPool).toLocaleString('en-US'),
      headline: c.headlineDays,
    }))
  return { columns, rows, floor }
}

// ——— geometry ——————————————————————————————————————————————————————————————————————

export interface SeriesMark {
  date: string
  x: number
  /** the gap */
  y: number
  /** the interval's ends: yLo for the lower bound (further down the drawing), yHi for the upper */
  yLo: number
  yHi: number
  gap: number
  lo: number
  hi: number
  significant: boolean
}

export interface SeriesRowModel {
  series: CountrySeries
  top: number
  bandTop: number
  bandBottom: number
  zeroY: number
  railY: number
  grid: { value: number; y: number }[]
  marks: SeriesMark[]
  /** every interval of the row as ONE path (a vertical stroke per mark) — the same geometry as
   *  the marks' yHi/yLo, drawn without a DOM node per day */
  ciPath: string
  /** measured days on which the country was below the floor: a tick on the rail, not a zero */
  absences: { date: string; x: number }[]
  withheld: { date: string; x: number }[]
  nameY: number
  subY: number
  upY: number
  downY: number
}

export interface SeriesFigureModel {
  width: number
  height: number
  plotLeft: number
  plotRight: number
  plotTop: number
  plotBottom: number
  /** px per calendar day */
  step: number
  dotR: number
  yMin: number
  yMax: number
  gridStep: number
  rows: SeriesRowModel[]
  /** failed or missing days: hatched across every row, never bridged */
  columns: { x: number; width: number; date: string; kind: 'failed' | 'missing' }[]
  ticks: { x: number; label: string; date: string }[]
  axisY: number
  empty: boolean
}

export interface SeriesFigureOptions {
  width?: number
  labelWidth?: number
  rightWidth?: number
  padTop?: number
  rowHeight?: number
  bandHeight?: number
}

const r2 = (n: number) => +n.toFixed(2)

function gridStepFor(span: number): number {
  return [1, 2, 4, 5, 10, 20].find((s) => span / s <= 4) ?? 50
}

export function buildSeriesFigure(
  series: BalanceSeries,
  rows: readonly CountrySeries[],
  opts: SeriesFigureOptions = {},
): SeriesFigureModel {
  const width = opts.width ?? 720
  const labelWidth = opts.labelWidth ?? 124
  const rightWidth = opts.rightWidth ?? 56
  const padTop = opts.padTop ?? 30
  // tall enough that a one-point gap moves a mark by several pixels on the shared scale, and an
  // interval of a deep pool still shows past its dot
  const rowHeight = opts.rowHeight ?? 84
  const bandHeight = opts.bandHeight ?? 64

  const plotLeft = labelWidth
  const plotRight = width - rightWidth
  const plotTop = padTop
  const plotBottom = plotTop + rows.length * rowHeight
  const n = series.days.length
  const step = n > 0 ? (plotRight - plotLeft) / n : 0
  const xOf = (i: number) => plotLeft + (i + 0.5) * step
  const dotR = r2(Math.min(2.4, Math.max(1.2, step * 0.3)))

  const bounds = rows.flatMap((c) => c.days.flatMap((d) => (d.state === 'measured' ? [d.lo, d.hi, d.gap] : [])))
  let yMin = Math.floor(Math.min(0, ...bounds))
  let yMax = Math.ceil(Math.max(0, ...bounds))
  if (yMin === yMax) {
    yMin -= 1
    yMax += 1
  }
  const gridStep = gridStepFor(yMax - yMin)

  const rowModels: SeriesRowModel[] = rows.map((c, r) => {
    const top = plotTop + r * rowHeight
    const bandTop = top + 6
    const bandBottom = bandTop + bandHeight
    const yOf = (v: number) => r2(bandBottom - ((v - yMin) / (yMax - yMin)) * bandHeight)
    const grid: { value: number; y: number }[] = []
    for (let v = Math.ceil(yMin / gridStep) * gridStep; v <= yMax; v += gridStep) {
      if (v !== 0) grid.push({ value: v, y: yOf(v) })
    }
    const marks: SeriesMark[] = []
    const absences: { date: string; x: number }[] = []
    const withheld: { date: string; x: number }[] = []
    c.days.forEach((d, i) => {
      const x = r2(xOf(i))
      if (d.state === 'measured') {
        marks.push({
          date: d.date,
          x,
          y: yOf(d.gap),
          yLo: yOf(d.lo),
          yHi: yOf(d.hi),
          gap: d.gap,
          lo: d.lo,
          hi: d.hi,
          significant: d.significant,
        })
      } else if (d.state === 'absent') {
        absences.push({ date: d.date, x })
      } else if (d.state === 'withheld') {
        withheld.push({ date: d.date, x })
      }
    })
    return {
      series: c,
      top,
      bandTop,
      bandBottom,
      zeroY: yOf(0),
      railY: bandBottom + 6,
      grid,
      marks,
      ciPath: marks.map((k) => `M${k.x} ${k.yHi}V${k.yLo}`).join(''),
      absences,
      withheld,
      nameY: bandTop + 24,
      subY: bandTop + 38,
      upY: bandTop + 12,
      downY: bandBottom - 2,
    }
  })

  const columns = series.days.flatMap((d, i) =>
    d.kind === 'measured'
      ? []
      : [{ x: r2(plotLeft + i * step), width: r2(step), date: d.date, kind: d.kind as 'failed' | 'missing' }],
  )

  return {
    width,
    height: plotBottom + 28,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    step: r2(step),
    dotR,
    yMin,
    yMax,
    gridStep,
    rows: rowModels,
    columns,
    ticks: n > 0 ? monthTicks(series.days.map((d) => d.date), xOf) : [],
    axisY: plotBottom + 16,
    empty: rows.length === 0 || n === 0,
  }
}

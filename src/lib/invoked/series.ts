/**
 * Invoked Past — the series: the standout year of every committed day.
 *
 * One day names one year that breaks the decay ramp; whether that year breaks it again, and for
 * how long, is something only the archive knows. This module reads every committed day file
 * (src/data/invoked/YYYY-MM-DD.json) and returns, per calendar day, what that file recorded —
 * the standout year with its counts, the raw maximum, the ceiling the source emitted — and
 * nothing it did not:
 *   · a measured day without a standout is a QUIET day, drawn as one (a quiet day is a finding);
 *   · a failed fetch, or a calendar day without a committed file, is a gap, never bridged;
 *   · no standout is recomputed here: the year, its mentions, its ratio and its surprise are the
 *     file's own (the contract test holds them to the file's histogram).
 * Geometry for the figure is computed here too, so every position the page draws is tested.
 */
import { dailyCalendar, monthTicks } from '@/lib/archive/calendar'
import { count, decimal, standoutWindow } from './format'
import type { InvokedData } from './types'

export type DayKind = 'measured' | 'failed' | 'missing'

export interface Standout {
  year: number
  mentions: number
  /** times its neighbourhood median */
  times: number
  surprise: number
  /** the anniversary arithmetic: true when the year's most-named exact date falls on the
   *  record's own day of the year; null when the record carries no such date */
  anniversary: boolean | null
}

export interface StandoutDay {
  date: string
  kind: DayKind
  standout: Standout | null
  /** the raw most-invoked year (the count, not the finding) */
  maximum: number | null
  /** the highest year the source emitted that day — the wall, re-measured nightly */
  ceiling: number | null
  /** the years a standout could be that day: the observed range less ±window at both edges */
  eligible: [number, number] | null
  /** the record's own year: the top of what the press could possibly invoke */
  recordYear: number
}

export interface RecurringYear {
  year: number
  days: number
  first: string
  last: string
  /** longest stretch of consecutive calendar days on which it was the standout */
  longestRun: number
}

export interface StandoutSeries {
  days: StandoutDay[]
  measured: number
  failed: number
  missing: number
  quiet: number
  withStandout: number
  distinctYears: number
  /** years that stood out on more than one day — most days first, then the earlier year */
  recurring: RecurringYear[]
  longestRun: { year: number; days: number; from: string; to: string } | null
  /** days on which the anniversary arithmetic matched */
  anniversaries: number
  /** measured days on which the raw maximum sat on that day's ceiling */
  maximumAtCeiling: number
  /** half-width of the standout's neighbourhood, read from the newest method sentence */
  window: number
  /** the method's plausible-window start (1800) */
  windowStart: number
  first: string | null
  last: string | null
}

export function standoutSeries(files: Record<string, unknown>): StandoutSeries {
  const calendar = dailyCalendar<InvokedData>(files, 'invoked')
  const newest = [...calendar].reverse().find((d) => d.record && d.record.stats.slots_fetched > 0)?.record
  const window = newest ? standoutWindow(newest.method.standout) : 5
  const windowStart = newest?.method.year_window[0] ?? 1800

  const days: StandoutDay[] = calendar.map(({ date, record }) => {
    const recordYear = Number(date.slice(0, 4))
    if (!record) return { date, kind: 'missing', standout: null, maximum: null, ceiling: null, eligible: null, recordYear }
    if (record.stats.slots_fetched === 0) {
      return { date, kind: 'failed', standout: null, maximum: null, ceiling: null, eligible: null, recordYear }
    }
    const years = record.years.map((y) => y.year)
    const lo = years.length ? Math.min(...years) : null
    const hi = years.length ? Math.max(...years) : null
    const w = standoutWindow(record.method.standout)
    const h = record.headline
    return {
      date,
      kind: 'measured',
      standout: h
        ? {
            year: h.year,
            mentions: h.mentions,
            times: h.times_its_neighbourhood,
            surprise: h.surprise,
            anniversary: h.why?.anniversary ? h.why.anniversary.matches_today : null,
          }
        : null,
      maximum: record.most_invoked?.year ?? null,
      ceiling: record.stats.max_year_observed,
      eligible: lo !== null && hi !== null && lo + w <= hi - w ? [lo + w, hi - w] : null,
      recordYear,
    }
  })

  const withStandout = days.filter((d) => d.standout)
  const byYear = new Map<number, StandoutDay[]>()
  for (const d of withStandout) byYear.set(d.standout!.year, [...(byYear.get(d.standout!.year) ?? []), d])

  type Span = { days: number; from: string; to: string }
  const runsOf = (year: number): Span[] => {
    const runs: Span[] = []
    let current = null as Span | null
    for (const d of days) {
      if (d.standout?.year === year) {
        current = current ? { days: current.days + 1, from: current.from, to: d.date } : { days: 1, from: d.date, to: d.date }
      } else if (current) {
        runs.push(current)
        current = null
      }
    }
    if (current) runs.push(current)
    return runs
  }

  const recurring: RecurringYear[] = [...byYear.entries()]
    .filter(([, ds]) => ds.length > 1)
    .map(([year, ds]) => ({
      year,
      days: ds.length,
      first: ds[0].date,
      last: ds[ds.length - 1].date,
      longestRun: Math.max(...runsOf(year).map((r) => r.days)),
    }))
    .sort((a, b) => b.days - a.days || a.year - b.year)

  let longestRun: StandoutSeries['longestRun'] = null
  for (const year of byYear.keys()) {
    for (const r of runsOf(year)) {
      if (r.days < 2) continue
      if (!longestRun || r.days > longestRun.days || (r.days === longestRun.days && r.from < longestRun.from)) {
        longestRun = { year, ...r }
      }
    }
  }

  const measured = days.filter((d) => d.kind === 'measured')
  return {
    days,
    measured: measured.length,
    failed: days.filter((d) => d.kind === 'failed').length,
    missing: days.filter((d) => d.kind === 'missing').length,
    quiet: measured.filter((d) => !d.standout).length,
    withStandout: withStandout.length,
    distinctYears: byYear.size,
    recurring,
    longestRun,
    anniversaries: withStandout.filter((d) => d.standout!.anniversary === true).length,
    maximumAtCeiling: measured.filter((d) => d.maximum !== null && d.maximum === d.ceiling).length,
    window,
    windowStart,
    first: days[0]?.date ?? null,
    last: days[days.length - 1]?.date ?? null,
  }
}

// ——— the table ———————————————————————————————————————————————————————————————————————

export function standoutTable(series: StandoutSeries): {
  columns: { key: string; label: string; align?: 'left' | 'right'; nowrap?: boolean }[]
  rows: Record<string, string>[]
} {
  const columns = [
    { key: 'date', label: 'Day', nowrap: true },
    { key: 'year', label: 'standout year' },
    { key: 'mentions', label: 'mentions', align: 'right' as const },
    { key: 'times', label: '× its neighbourhood', align: 'right' as const },
    { key: 'surprise', label: 'surprise', align: 'right' as const },
    { key: 'anniversary', label: 'anniversary' },
    { key: 'maximum', label: 'raw maximum', align: 'right' as const },
  ]
  const rows = series.days
    .map((d) => {
      if (d.kind !== 'measured') {
        const why = d.kind === 'failed' ? 'source unreachable — finding omitted' : 'no committed file'
        return { date: d.date, year: why, mentions: '', times: '', surprise: '', anniversary: '', maximum: '' }
      }
      const s = d.standout
      return {
        date: d.date,
        year: s ? String(s.year) : 'none — a quiet day',
        mentions: s ? count(s.mentions) : '',
        times: s ? `${decimal(s.times, 1)}×` : '',
        surprise: s ? decimal(s.surprise, 1) : '',
        anniversary: s ? (s.anniversary === null ? '—' : s.anniversary ? 'yes' : 'no') : '',
        maximum: d.maximum === null ? '—' : `${d.maximum}${d.maximum === d.ceiling ? ' (at the wall)' : ''}`,
      }
    })
    .reverse()
  return { columns, rows }
}

// ——— geometry ——————————————————————————————————————————————————————————————————————

export interface StandoutMark {
  date: string
  x: number
  y: number
  standout: Standout
  recurring: boolean
}

export interface Band {
  x: number
  width: number
  y: number
  height: number
  from: number
  to: number
}

export interface YearLabel {
  year: number
  days: number
  text: string
  /** the year's own height, where its guide runs */
  targetY: number
  /** the label's baseline after dodging its neighbours */
  y: number
}

export interface StandoutFigureModel {
  width: number
  height: number
  plotLeft: number
  plotRight: number
  plotTop: number
  plotBottom: number
  step: number
  dotR: number
  domainStart: number
  domainEnd: number
  yTicks: { year: number; y: number }[]
  marks: StandoutMark[]
  /** measured days without a standout, on their own lane below the plot */
  quiet: { date: string; x: number }[]
  quietY: number
  /** failed or missing days: hatched full height, never bridged */
  columns: { x: number; width: number; date: string; kind: 'failed' | 'missing' }[]
  /** the years the source never emits, per run of days with the same ceiling */
  ceilingBands: Band[]
  /** the years a standout cannot be — within ±window of the day's observed range */
  edgeBands: Band[]
  /** a recurring year's line, from its first day to the right edge of the plot */
  guides: { year: number; y: number; x1: number; x2: number }[]
  labels: YearLabel[]
  ticks: { x: number; label: string; date: string }[]
  axisY: number
  empty: boolean
}

export interface StandoutFigureOptions {
  width?: number
  padLeft?: number
  padRight?: number
  padTop?: number
  plotHeight?: number
  labelGap?: number
}

const r2 = (n: number) => +n.toFixed(2)

/** Spread label baselines at least `gap` apart inside [lo, hi], each as near its target as the
 *  others allow. Order is kept: a label never jumps over its neighbour. Pure 1-D packing. */
export function dodge(targets: readonly number[], gap: number, lo: number, hi: number): number[] {
  const order = targets.map((t, i) => [t, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const ys = order.map(([t]) => Math.min(hi, Math.max(lo, t)))
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + gap)
  if (ys.length && ys[ys.length - 1] > hi) {
    ys[ys.length - 1] = hi
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - gap)
  }
  const out = new Array<number>(targets.length)
  order.forEach(([, i], k) => {
    out[i] = r2(ys[k])
  })
  return out
}

export function buildStandoutFigure(series: StandoutSeries, opts: StandoutFigureOptions = {}): StandoutFigureModel {
  const width = opts.width ?? 720
  const padLeft = opts.padLeft ?? 44
  const padRight = opts.padRight ?? 100
  const padTop = opts.padTop ?? 12
  const plotHeight = opts.plotHeight ?? 300
  const labelGap = opts.labelGap ?? 11

  const plotLeft = padLeft
  const plotRight = width - padRight
  const plotTop = padTop
  const plotBottom = plotTop + plotHeight
  const n = series.days.length
  const step = n > 0 ? (plotRight - plotLeft) / n : 0
  const xOf = (i: number) => plotLeft + (i + 0.5) * step
  const dotR = r2(Math.min(3.4, Math.max(1.6, step * 0.36)))

  const domainStart = series.windowStart
  const domainEnd = Math.max(domainStart, ...series.days.map((d) => d.recordYear))
  const slots = domainEnd - domainStart + 1
  const slotTop = (year: number) => plotBottom - ((year - domainStart + 1) / slots) * plotHeight
  const slotBottom = (year: number) => plotBottom - ((year - domainStart) / slots) * plotHeight
  const yOf = (year: number) => r2((slotTop(year) + slotBottom(year)) / 2)

  const recurringYears = new Set(series.recurring.map((r) => r.year))
  const marks: StandoutMark[] = []
  const quiet: { date: string; x: number }[] = []
  series.days.forEach((d, i) => {
    if (d.kind !== 'measured') return
    if (d.standout) {
      marks.push({ date: d.date, x: r2(xOf(i)), y: yOf(d.standout.year), standout: d.standout, recurring: recurringYears.has(d.standout.year) })
    } else {
      quiet.push({ date: d.date, x: r2(xOf(i)) })
    }
  })

  const columns = series.days.flatMap((d, i) =>
    d.kind === 'measured' ? [] : [{ x: r2(plotLeft + i * step), width: r2(step), date: d.date, kind: d.kind as 'failed' | 'missing' }],
  )

  // runs of consecutive measured days that share a value, for bands drawn as one rectangle
  const runs = (key: (d: StandoutDay) => string | null): { key: string; i0: number; i1: number }[] => {
    const out: { key: string; i0: number; i1: number }[] = []
    series.days.forEach((d, i) => {
      const k = d.kind === 'measured' ? key(d) : null
      const last = out[out.length - 1]
      if (k !== null && last && last.key === k && last.i1 === i - 1) last.i1 = i
      else if (k !== null) out.push({ key: k, i0: i, i1: i })
    })
    return out
  }
  const band = (i0: number, i1: number, from: number, to: number): Band => ({
    x: r2(plotLeft + i0 * step),
    width: r2((i1 - i0 + 1) * step),
    y: r2(slotTop(to)),
    height: r2(slotBottom(from) - slotTop(to)),
    from,
    to,
  })

  const ceilingBands = runs((d) => (d.ceiling !== null && d.ceiling < d.recordYear ? `${d.ceiling}:${d.recordYear}` : null)).map(
    ({ key, i0, i1 }) => {
      const [ceiling, recordYear] = key.split(':').map(Number)
      return band(i0, i1, ceiling + 1, recordYear)
    },
  )

  const edgeBands = runs((d) => (d.eligible && d.ceiling !== null ? `${d.eligible[0]}:${d.eligible[1]}:${d.ceiling}` : null)).flatMap(
    ({ key, i0, i1 }) => {
      const [lo, hi, ceiling] = key.split(':').map(Number)
      const out: Band[] = []
      if (lo > domainStart) out.push(band(i0, i1, domainStart, lo - 1))
      if (hi < ceiling) out.push(band(i0, i1, hi + 1, ceiling))
      return out
    },
  )

  const guides = series.recurring.map((r) => {
    const i = series.days.findIndex((d) => d.date === r.first)
    return { year: r.year, y: yOf(r.year), x1: r2(xOf(i)), x2: plotRight }
  })

  const labelTargets = series.recurring.map((r) => yOf(r.year) + 3.5)
  const placed = dodge(labelTargets, labelGap, plotTop + 8, plotBottom)
  const labels: YearLabel[] = series.recurring.map((r, k) => ({
    year: r.year,
    days: r.days,
    text: `${r.year} · ${r.days} days`,
    targetY: yOf(r.year),
    y: placed[k],
  }))

  const yTicks: { year: number; y: number }[] = []
  for (let year = Math.ceil(domainStart / 50) * 50; year <= domainEnd; year += 50) yTicks.push({ year, y: yOf(year) })

  return {
    width,
    height: plotBottom + 46,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    step: r2(step),
    dotR,
    domainStart,
    domainEnd,
    yTicks,
    marks,
    quiet,
    quietY: plotBottom + 13,
    columns,
    ceilingBands,
    edgeBands,
    guides,
    labels,
    ticks: n > 0 ? monthTicks(series.days.map((d) => d.date), xOf) : [],
    axisY: plotBottom + 36,
    empty: n === 0,
  }
}

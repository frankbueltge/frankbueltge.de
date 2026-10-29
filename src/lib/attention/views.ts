// The figures of Machine Attention's entrance (Frank's decision, 2026-10-29, wording private:
// the experiments are drawn, not listed). The practice builds the rows in views.json
// (attention-views/1, machine-attention practice/src/practice/views.py) from its committed records
// with the projects' own code; the attention mirror copies the file here. This lib reads it and
// computes every coordinate the two figures draw, so the claims stay checkable without a browser.
//
// Until 2026-10-29 both projects kept every figure off the site during their acceptance windows
// (criterion C). The maintainer lifted that bar the same day; both reviews count C as missed
// (machine-attention docs/2026-10-29-sperre-aufgehoben.md).

export const VIEWS_CONTRACT = 'attention-views/1'

export type Impulse = { onset: string; peak_ratio: number; duration_s: number }
export type Envelope = { start: string; seconds: number; min: number[]; max: number[] }
export type PlanetaryNight = {
  date: string
  day: string
  outage: boolean
  triggers: number | null
  strong: Impulse[]
  top: Impulse[]
  excerpts: { onset: string; envelope: Envelope | null }[]
}
export type MoneySet = {
  series: Record<string, number>
  baseline_usd: number | null
  t1: string | null
  gap_months: number | null
  status: string | null
}
export type IntervalEpisode = {
  country: string
  t0: string
  w: number
  phase5_projected: boolean
  window: [string, string]
  warning: { month: string; w: number | null }[]
  money: { fsc: MoneySet; total: MoneySet }
}
export type Views = { planetary: PlanetaryNight[]; interval: IntervalEpisode[] }

/** Parse the mirrored views; anything but attention-views/1 is refused, not guessed at. */
export function readViews(file: unknown): Views | null {
  if (typeof file !== 'object' || file === null) return null
  const v = file as Record<string, unknown>
  if (v.$contract !== VIEWS_CONTRACT || !Array.isArray(v.planetary) || !Array.isArray(v.interval)) return null
  return { planetary: v.planetary as PlanetaryNight[], interval: v.interval as IntervalEpisode[] }
}

// ---------------------------------------------------------------- Planetary Listening

/** The day the clocks went back in Germany, 2026: the quarry's blast should move by an hour in UTC. */
export const CLOCK_CHANGE = '2026-10-25'

const minutesOfDay = (iso: string) => {
  const d = new Date(iso)
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60
}

const hhmm = (minutes: number) => {
  const m = Math.round(minutes)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Berlin wall-clock time of a UTC instant, for the two offsets this window spans. */
export const berlinTime = (iso: string) => hhmm(minutesOfDay(iso) + (iso.slice(0, 10) < CLOCK_CHANGE ? 120 : 60))

export type ClockDot = {
  x: number
  y: number
  r: number
  strong: boolean
  day: string
  utc: string
  local: string
  ratio: number
}
export type ClockFigure = {
  width: number
  height: number
  plot: { left: number; right: number; top: number; bottom: number }
  columns: { day: string; x: number; label: string; outage: boolean; weekend: boolean }[]
  hours: { y: number; label: string }[]
  dots: ClockDot[]
  change: { x: number } | null
  /** median UTC time of the first strong impulse on weekdays before and after the change */
  medians: { before: string | null; after: string | null; shiftMinutes: number | null }
}

const median = (xs: number[]) => {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** The quarry's clock: one column per day read, the time of day of every candidate impulse. */
export function clockFigure(nights: PlanetaryNight[], width = 720, height = 340, hourFrom = 0, hourTo = 24): ClockFigure {
  const plot = { left: 52, right: width - 12, top: 16, bottom: height - 40 }
  const days = [...nights].sort((a, b) => a.day.localeCompare(b.day))
  // x is the calendar day, so a night that was never read stays an empty column
  const dayNo = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86400000
  const span = days.length > 1 ? dayNo(days[days.length - 1].day) - dayNo(days[0].day) : 0
  const xOf = (i: number) =>
    span > 0 ? plot.left + ((dayNo(days[i].day) - dayNo(days[0].day)) / span) * (plot.right - plot.left) : (plot.left + plot.right) / 2
  const yOf = (minutes: number) =>
    plot.top + ((minutes - hourFrom * 60) / ((hourTo - hourFrom) * 60)) * (plot.bottom - plot.top)
  const rOf = (ratio: number) => Math.max(2, Math.min(11, 2 + 2.6 * Math.log10(Math.max(ratio, 1))))

  const columns = days.map((n, i) => {
    const wd = new Date(`${n.day}T12:00:00Z`).getUTCDay()
    return { day: n.day, x: xOf(i), label: n.day.slice(8, 10), outage: n.outage, weekend: wd === 0 || wd === 6 }
  })
  const dots: ClockDot[] = []
  days.forEach((n, i) => {
    const strong = new Set(n.strong.map((s) => s.onset))
    const seen = new Set<string>()
    for (const imp of [...n.top, ...n.strong]) {
      if (seen.has(imp.onset)) continue
      seen.add(imp.onset)
      const m = minutesOfDay(imp.onset)
      if (m < hourFrom * 60 || m > hourTo * 60) continue
      dots.push({
        x: xOf(i),
        y: yOf(m),
        r: rOf(imp.peak_ratio),
        strong: strong.has(imp.onset),
        day: n.day,
        utc: hhmm(m),
        local: berlinTime(imp.onset),
        ratio: imp.peak_ratio,
      })
    }
  })
  dots.sort((a, b) => Number(a.strong) - Number(b.strong) || a.r - b.r)

  const changeIndex = days.findIndex((n) => n.day >= CLOCK_CHANGE)
  const change =
    changeIndex > 0 ? { x: (xOf(changeIndex - 1) + xOf(changeIndex)) / 2 } : changeIndex === 0 ? { x: xOf(0) } : null

  const firstStrong = (side: 'before' | 'after') =>
    median(
      days
        .filter((n) => (side === 'before' ? n.day < CLOCK_CHANGE : n.day >= CLOCK_CHANGE))
        .filter((n) => ![0, 6].includes(new Date(`${n.day}T12:00:00Z`).getUTCDay()))
        .flatMap((n) => (n.strong.length ? [Math.min(...n.strong.map((s) => minutesOfDay(s.onset)))] : [])),
    )
  const b = firstStrong('before')
  const a = firstStrong('after')

  const hours = []
  for (let h = hourFrom; h <= hourTo; h += hourTo - hourFrom > 12 ? 3 : 1) hours.push({ y: yOf(h * 60), label: `${String(h).padStart(2, '0')}:00` })

  return {
    width,
    height,
    plot,
    columns,
    hours,
    dots,
    change,
    medians: {
      before: b === null ? null : hhmm(b),
      after: a === null ? null : hhmm(a),
      shiftMinutes: a === null || b === null ? null : Math.round(a - b),
    },
  }
}

export type Waveform = { day: string; utc: string; local: string; seconds: number; area: string; onsetX: number }

/** One excerpt as a filled min/max band, scaled to its own peak (the shape, not the size, is compared). */
export function waveform(day: string, onset: string, env: Envelope, width = 720, height = 44): Waveform {
  const peak = Math.max(1, ...env.max.map(Math.abs), ...env.min.map(Math.abs))
  const n = env.max.length
  const x = (i: number) => (i / (n - 1)) * width
  const y = (v: number) => height / 2 - (v / peak) * (height / 2)
  const r = (v: number) => Math.round(v * 10) / 10
  const top = env.max.map((v, i) => `${r(x(i))},${r(y(v))}`)
  const bottom = env.min.map((v, i) => `${r(x(i))},${r(y(v))}`).reverse()
  const offset = (Date.parse(onset) - Date.parse(env.start)) / 1000
  return {
    day,
    utc: hhmm(minutesOfDay(onset)),
    local: berlinTime(onset),
    seconds: env.seconds,
    area: `M${top.join('L')}L${bottom.join('L')}Z`,
    onsetX: r((offset / env.seconds) * width),
  }
}

export const waveforms = (nights: PlanetaryNight[], width = 720, height = 44): Waveform[] =>
  [...nights]
    .sort((a, b) => a.day.localeCompare(b.day))
    .flatMap((n) => n.excerpts.flatMap((e) => (e.envelope ? [waveform(n.day, e.onset, e.envelope, width, height)] : [])))

// ---------------------------------------------------------------- The Interval

export const COUNTRY: Record<string, string> = {
  AFG: 'Afghanistan',
  DJI: 'Djibouti',
  SDN: 'Sudan',
  SOM: 'Somalia',
  YEM: 'Yemen',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const monthLabel = (m: string) => `${MONTHS[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`

const monthsBetween = (a: string, b: string) =>
  (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7))

export type IntervalPanel = {
  title: string
  subtitle: string
  width: number
  height: number
  plot: { left: number; right: number; top: number; bottom: number }
  bars: { x: number; y: number; w: number; h: number; month: string; usd: number; after: boolean }[]
  threshold: { y: number; usd: number } | null
  t0x: number
  t1x: number | null
  gapMonths: number | null
  ticks: { x: number; label: string }[]
  max: number
}

/** One episode: monthly food-security money around the month the warning crossed its line. */
export function intervalPanel(e: IntervalEpisode, width = 340, height = 150, set: 'fsc' | 'total' = 'fsc'): IntervalPanel {
  const plot = { left: 8, right: width - 8, top: 10, bottom: height - 22 }
  const m = e.money[set]
  const months = Object.keys(m.series).sort()
  const threshold = m.baseline_usd !== null ? 2 * m.baseline_usd : null
  const max = Math.max(1, ...months.map((k) => m.series[k]), threshold ?? 0)
  const slot = (plot.right - plot.left) / months.length
  const yOf = (v: number) => plot.bottom - (v / max) * (plot.bottom - plot.top)
  const xOf = (month: string) => plot.left + monthsBetween(months[0], month) * slot
  const bars = months.map((k) => ({
    x: Math.round((xOf(k) + 0.5) * 10) / 10,
    y: Math.round(yOf(m.series[k]) * 10) / 10,
    w: Math.max(1, Math.round((slot - 1) * 10) / 10),
    h: Math.round((plot.bottom - yOf(m.series[k])) * 10) / 10,
    month: k,
    usd: m.series[k],
    after: k >= e.t0,
  }))
  const ticks = months.filter((k) => k.endsWith('-01')).map((k) => ({ x: xOf(k), label: k.slice(0, 4) }))
  return {
    title: `${COUNTRY[e.country] ?? e.country} · ${monthLabel(e.t0)}`,
    subtitle: `${(e.w * 100).toFixed(1)} % of the population projected in emergency or worse${e.phase5_projected ? ', famine among them' : ''}`,
    width,
    height,
    plot,
    bars,
    threshold: threshold === null ? null : { y: yOf(threshold), usd: threshold },
    t0x: xOf(e.t0),
    t1x: m.t1 ? xOf(m.t1) + slot : null,
    gapMonths: m.gap_months,
    ticks,
    max,
  }
}

/** Compact US dollars for labels: $1.2M, $340k. */
export function usd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${Math.round(v / 1e3)}k`
  return `$${Math.round(v)}`
}

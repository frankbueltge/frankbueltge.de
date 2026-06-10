// Climate data layer — parses NASA GISTEMP global temperature anomalies and
// transforms them into normalized "ridges" (one per year) for the HeroField
// canvas. Pure functions only, so they are unit-tested in climate.test.ts.
//
// Integrity: the ridge heights are a faithful, linear normalization of the real
// monthly anomalies — no cosmetic distortion. Warming shows up because recent
// years carry higher anomalies, so their ridges sit higher.

export type Month = number | null

export interface YearRow {
  year: number
  /** 12 monthly anomalies (Jan..Dec) in °C relative to the dataset baseline; null = missing. */
  months: Month[]
}

export interface ClimateMeta {
  source: string
  url: string
  baseline: string
  units: string
  retrieved: string
  license: string
}

export interface ClimateSeries {
  years: YearRow[]
  meta?: ClimateMeta
}

export interface Ridge {
  year: number
  /** 12 normalized heights in [0,1], scaled consistently across the whole series. */
  heights: number[]
}

/** Parse a NASA GISTEMP `GLB.Ts+dSST.csv` text into a ClimateSeries. */
export function parseGistempCsv(text: string): ClimateSeries {
  const lines = text.split(/\r?\n/)
  const headerIdx = lines.findIndex((l) => l.startsWith('Year'))
  const years: YearRow[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = lines[i].split(',')
    if (!/^\d{4}$/.test((cells[0] ?? '').trim())) continue
    const months: Month[] = cells.slice(1, 13).map((v) => {
      const s = v.trim()
      if (s === '' || /^\*+$/.test(s)) return null
      const n = parseFloat(s)
      return Number.isFinite(n) ? n : null
    })
    while (months.length < 12) months.push(null)
    years.push({ year: Number(cells[0]), months })
  }
  return { years }
}

/** Fill a 12-month array: linear interpolation for interior gaps, nearest value at edges. */
function fillMonths(months: Month[]): number[] | null {
  if (months.every((m) => m == null)) return null
  const out: number[] = new Array(12)
  for (let i = 0; i < 12; i++) {
    if (months[i] != null) {
      out[i] = months[i] as number
      continue
    }
    let p = i - 1
    while (p >= 0 && months[p] == null) p--
    let n = i + 1
    while (n < 12 && months[n] == null) n++
    if (p >= 0 && n < 12) {
      const pv = months[p] as number
      const nv = months[n] as number
      out[i] = pv + ((nv - pv) * (i - p)) / (n - p)
    } else if (p >= 0) {
      out[i] = months[p] as number
    } else {
      out[i] = months[n] as number
    }
  }
  return out
}

/** Transform a ClimateSeries into normalized ridges (oldest year first). */
export function seriesToRidges(series: ClimateSeries): Ridge[] {
  const filled = series.years
    .map((y) => ({ year: y.year, months: fillMonths(y.months) }))
    .filter((y): y is { year: number; months: number[] } => y.months != null)

  let min = Infinity
  let max = -Infinity
  for (const y of filled) {
    for (const v of y.months) {
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  const span = max - min || 1

  return filled
    .map((y) => ({ year: y.year, heights: y.months.map((v) => (v - min) / span) }))
    .sort((a, b) => a.year - b.year)
}

/** Zerfallskurve als server-gerenderter SVG-Pfad — kein Client-JS, Mono-Ästhetik. */
export const SPARK_W = 220
export const SPARK_H = 40
const MAX_DAYS = 120

export function sparkPath(series: [string, number][]): string {
  if (series.length < 2) return ''
  const peak = Math.max(...series.map(([, v]) => v))
  if (peak <= 0) return ''
  const days = Math.min(series.length, MAX_DAYS)
  const pts = series.slice(0, MAX_DAYS).map(([, v], i) => {
    const x = (i / (days - 1)) * SPARK_W
    // Wurzelskala: zeigt den Sockel, ohne den Peak zu erschlagen
    const y = SPARK_H - Math.sqrt(Math.max(0, v) / peak) * (SPARK_H - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}

export const STRIP_W = 320
export const STRIP_H = 44

export interface StripPoint {
  x: number
  vpd: number
  label: string
}
export interface StripLayout {
  points: StripPoint[]
  min: number
  max: number
}

/** Aufrufe je Todesopfer auf logarithmischer Achse — eine Position je Ereignis.
 *  Nicht-positive Werte (keine messbare Anteilnahme) fallen heraus; mit weniger als
 *  zwei Punkten lässt sich keine Achse aufspannen. */
export function attentionStrip(
  values: { vpd: number; label: string }[],
  width = STRIP_W,
): StripLayout {
  const positive = values.filter((d) => d.vpd > 0)
  if (positive.length < 2) return { points: [], min: 0, max: 0 }
  const logs = positive.map((d) => Math.log10(d.vpd))
  const lo = Math.min(...logs)
  const hi = Math.max(...logs)
  const span = hi - lo || 1
  const points = positive.map((d, i) => ({
    x: ((logs[i] - lo) / span) * width,
    vpd: d.vpd,
    label: d.label,
  }))
  return { points, min: 10 ** lo, max: 10 ** hi }
}

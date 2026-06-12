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

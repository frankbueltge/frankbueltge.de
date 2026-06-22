import type { Locale } from '@/lib/site'

/** Korrelation mit Vorzeichen, z. B. „−0,98" / „−0.98". */
export function rStr(r: number, locale: Locale): string {
  const v = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(r))
  return `${r < 0 ? '−' : '+'}${v}`
}

/** Anteil 0..1 als ganze Prozent. */
export function pct(x: number, locale: Locale): string {
  const v = Math.round(x * 100)
  return locale === 'de' ? `${v} %` : `${v}%`
}

/** Reihe auf [0,1] normieren (für den Vergleich verschieden skalierter Metriken). */
export function normalize(xs: number[]): number[] {
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  const span = hi - lo || 1
  return xs.map((x) => (x - lo) / span)
}

/** SVG-Polylinie aus normierten Werten (x = gleichmäßig, y = 0 oben). */
export function linePath(norm: number[], w: number, h: number): string {
  if (norm.length < 2) return ''
  return norm
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (norm.length - 1)) * w).toFixed(1)},${((1 - v) * h).toFixed(1)}`)
    .join(' ')
}

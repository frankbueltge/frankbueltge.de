import type { Locale } from '@/lib/site'

/** Signed correlation, e.g. "−0,98" / "−0.98".
 *
 *  Two decimals read best and are the default — but they turned |r| = 0.996 into "−1.00", and a
 *  PERFECT correlation is a different claim from a very strong one. That was not hypothetical:
 *  the currency audit of 2026-08-22 found it on 28 of 64 committed pattern days, on a page whose
 *  whole subject is how easily a number overstates itself. So when rounding would reach 1 without
 *  the value being 1, this keeps adding decimals until the figure stops lying. */
export function rStr(r: number, locale: Locale): string {
  const abs = Math.abs(r)
  let digits = 2
  while (digits < 5 && abs < 1 && abs.toFixed(digits) === (1).toFixed(digits)) digits++
  const v = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(abs)
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

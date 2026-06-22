import type { Locale } from '@/lib/site'

/** Vorzeichen-Prozent, z. B. „+8,9 %" / „+8.9%". */
export function signedPct(n: number, locale: Locale): string {
  const v = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(n))
  const sign = n >= 0 ? '+' : '−'
  return locale === 'de' ? `${sign}${v} %` : `${sign}${v}%`
}

/** Anteil 0..1 als ganze Prozent, z. B. „95 %" / „95%". */
export function sharePct(x: number, locale: Locale): string {
  const v = Math.round(x * 100)
  return locale === 'de' ? `${v} %` : `${v}%`
}

/** Epiweek 202514 → „2025-W14". */
export function epiweekLabel(wk: number): string {
  const y = Math.floor(wk / 100)
  const w = wk % 100
  return `${y}-W${String(w).padStart(2, '0')}`
}

/** Tausender-Trennung je Sprache. */
export const num = (n: number, locale: Locale): string =>
  new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB').format(n)

import type { Locale } from '@/lib/site'

/** Tausender als Millionen, 2 Nachkomma, z. B. 1246 → „1,25" / „1.25". */
export function millions(thousands: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(Math.abs(thousands) / 1000)
}

/** Vorzeichen-Tausenderzahl, z. B. „−1.246.000" / „-1,246,000". */
export function signedFull(thousands: number, locale: Locale): string {
  const v = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB').format(Math.abs(thousands) * 1000)
  return `${thousands >= 0 ? '+' : '−'}${v}`
}

/** Anteil 0..1 als ganze Prozent. */
export function sharePct(x: number, locale: Locale): string {
  const v = Math.round(x * 100)
  return locale === 'de' ? `${v} %` : `${v}%`
}

/** „2025-06" → „Juni 2025" / „June 2025". */
export function monthLabel(period: string, locale: Locale): string {
  const [y, m] = period.split('-').map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

import type { Locale } from '@/lib/site'

/** Faktor mit ד, z. B. „13,7×" / „13.7×". Null → „—". */
export function foldStr(n: number | null, locale: Locale): string {
  if (n == null) return '—'
  return `${new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1 }).format(n)}×`
}

/** Auf ganze Zahl gerundeter Faktor für die Schlagzeile, z. B. „14×". */
export const foldRound = (n: number | null): string => (n == null ? '—' : `${Math.round(n)}×`)

/** Zahl mit einer Nachkommastelle je Sprache. */
export const num1 = (n: number, locale: Locale): string =>
  new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)

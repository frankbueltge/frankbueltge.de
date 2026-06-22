import type { Locale } from '@/lib/site'

/** GDELT-Titel tragen oft doppelte Leerzeichen — kollabieren + trimmen. */
export const cleanTitle = (s: string): string => s.replace(/\s+/g, ' ').trim()

/** Echo-Index (0..1) als Prozent je Sprache. */
export function echoPercent(idx: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(idx)
}

/** Zeitspanne der Kaskade, z. B. „4,5 h" / „4.5h". Null → leer. */
export function spanLabel(hours: number | null, locale: Locale): string {
  if (hours == null) return ''
  const n = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1 }).format(hours)
  return locale === 'de' ? `${n} h` : `${n}h`
}

/** „HH:MM" aus einem ISO-Zeitstempel (UTC-Stunde von GDELT). */
export const hhmm = (iso: string): string => (iso.match(/T(\d{2}:\d{2})/)?.[1] ?? '')

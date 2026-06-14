import type { ClaimMark } from './types'

/** Sprachcodes → Anzeige in Großbuchstaben (DE, EN, …). */
export function langLabel(code: string): string {
  return code.toUpperCase()
}

/** Markierung einer Aussage je Sprachversion: Symbol + zweisprachiges Label. */
export const CLAIM_MARK: Record<ClaimMark, { sym: string; de: string; en: string }> = {
  nennt: { sym: '✓', de: 'nennt', en: 'states' },
  verschweigt: { sym: '·', de: 'verschweigt', en: 'omits' },
  widerspricht: { sym: '✗', de: 'widerspricht', en: 'contradicts' },
}

/** Auslassungs-Anteil (0…1) als gerundeter Ganzzahl-Prozentwert ohne Zeichen, z. B. 0.675 → "68". */
export function omissionPercent(fraction: number): string {
  return String(Math.round(fraction * 100))
}

/** Kopfsatz über den mittleren Auslassungsindex; null → Platzhalter. */
export function topicHeadline(meanIndex: number | null, locale: 'de' | 'en'): string {
  if (meanIndex == null) {
    return locale === 'de' ? 'Noch keine Messung.' : 'No measurement yet.'
  }
  const pct = omissionPercent(meanIndex)
  return locale === 'de'
    ? `Im Mittel verschweigt jede Sprachversion ${pct} % dessen, was die anderen benennen.`
    : `On average, each language version omits ${pct}% of what the others state.`
}

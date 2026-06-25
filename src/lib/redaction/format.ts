import type { Locale } from '@/lib/site'

export function tokensLabel(n: number, locale: Locale): string {
  if (locale === 'de') return `${n} ${n === 1 ? 'Wort' : 'Wörter'}`
  return `${n} ${n === 1 ? 'word' : 'words'}`
}

const SIGNALS: Record<string, Record<Locale, string>> = {
  number: { de: 'Zahl', en: 'number' },
  date: { de: 'Datum', en: 'date' },
  named_entity: { de: 'Eigenname', en: 'named entity' },
  negation: { de: 'Verneinung', en: 'negation' },
  commitment_verb: { de: 'Zusage', en: 'commitment' },
}

export function signalLabel(sig: string, locale: Locale): string {
  return SIGNALS[sig]?.[locale] ?? sig
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

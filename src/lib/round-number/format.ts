import type { Locale } from '@/lib/site'

export function percent(x: number, locale: Locale): string {
  const v = Math.round(x * 100)
  return locale === 'de' ? `${v} %` : `${v}%`
}

const VERDICTS: Record<string, Record<Locale, string>> = {
  close: { de: 'nah', en: 'close' },
  acceptable: { de: 'akzeptabel', en: 'acceptable' },
  marginal: { de: 'marginal', en: 'marginal' },
  nonconformity: { de: 'Nonkonformität', en: 'nonconformity' },
  uniform: { de: 'gleichverteilt', en: 'uniform' },
  heaped: { de: 'gehäuft', en: 'heaped' },
}

export function verdictLabel(v: string, locale: Locale): string {
  return VERDICTS[v]?.[locale] ?? v
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

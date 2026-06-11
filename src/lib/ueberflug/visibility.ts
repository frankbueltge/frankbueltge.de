import type { Locale } from '@/lib/site'

/** Spec §3: > 10° Sichtkontakt möglich; >= 35° Abbildungsgeometrie wahrscheinlich. */
export const CONTACT_MIN_RAD = (10 * Math.PI) / 180
export const IMAGING_MIN_RAD = (35 * Math.PI) / 180

export type Sicht = 'none' | 'contact' | 'imaging'

export function deg(d: number): number {
  return (d * Math.PI) / 180
}

export function classifyElevation(elevationRad: number): Sicht {
  if (elevationRad >= IMAGING_MIN_RAD) return 'imaging'
  if (elevationRad > CONTACT_MIN_RAD) return 'contact'
  return 'none'
}

type L10n = Record<Locale, string>

export const CLASS_LABEL: Record<'C' | 'D' | 'B' | 'A' | 'unknown', L10n> = {
  C: { de: 'staatlich-zivil', en: 'state-civil' },
  D: { de: 'militärisch', en: 'military' },
  B: { de: 'kommerziell', en: 'commercial' },
  A: { de: 'Amateur', en: 'amateur' },
  unknown: { de: 'nicht klassifiziert', en: 'not classified' },
}

export const CATEGORY_LABEL: Record<string, L10n> = {
  IMG: { de: 'Abbildung', en: 'imaging' },
  'IMG-R': { de: 'Radar-Abbildung', en: 'radar imaging' },
  MET: { de: 'Wetter', en: 'weather' },
  EW: { de: 'Frühwarnung', en: 'early warning' },
  SIG: { de: 'Signalerfassung', en: 'signals' },
  SCI: { de: 'Wissenschaft', en: 'science' },
  EOSCI: { de: 'Erdbeobachtung (Wissenschaft)', en: 'earth science' },
}

export function categoryLabel(cat: string | null, locale: Locale): string {
  if (!cat) return CLASS_LABEL.unknown[locale]
  return CATEGORY_LABEL[cat]?.[locale] ?? cat
}

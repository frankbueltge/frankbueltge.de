import type { Locale } from '@/lib/site'
import type { Coord, GfRegions } from '@/lib/ghost-fleet/types'

/** Gaps run for weeks here — show days, fall back to hours for short ones. */
export function darkLabel(hours: number, locale: Locale): string {
  if (hours >= 48) {
    const d = Math.round(hours / 24)
    return locale === 'de' ? `${d} Tage` : `${d} days`
  }
  const h = Math.round(hours)
  return locale === 'de' ? `${h} Std.` : `${h} h`
}

export function coord(c: Coord): string {
  if (c.lat == null || c.lon == null) return '—'
  const ns = c.lat >= 0 ? 'N' : 'S'
  const ew = c.lon >= 0 ? 'E' : 'W'
  return `${Math.abs(c.lat).toFixed(1)}°${ns}, ${Math.abs(c.lon).toFixed(1)}°${ew}`
}

export function regionLabel(r: GfRegions, locale: Locale): string {
  const de = locale === 'de'
  if (r.no_take) return de ? 'No-Take-Schutzzone' : 'no-take reserve'
  if (r.mpa) return de ? 'Meeresschutzgebiet' : 'marine protected area'
  if (r.eez.length) return de ? 'nationale Hoheitsgewässer (EEZ)' : 'national waters (EEZ)'
  if (r.high_seas) return de ? 'Hohe See' : 'high seas'
  return de ? 'ohne Zuordnung' : 'unattributed'
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

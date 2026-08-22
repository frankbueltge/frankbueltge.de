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

/** An EEZ is an exclusive economic zone, NOT national or territorial waters — the two are
 *  different legal spaces and the source field is `eez`, so the label never says "waters". */
export function regionLabel(r: GfRegions, locale: Locale): string {
  const de = locale === 'de'
  if (r.no_take) return de ? 'No-Take-Schutzzone' : 'no-take reserve'
  if (r.mpa) return de ? 'Meeresschutzgebiet' : 'marine protected area'
  if (r.eez_name) return r.eez_name
  if (r.eez.length) return de ? 'einer unbenannten Wirtschaftszone (EEZ)' : 'an unnamed national EEZ'
  if (r.high_seas) return de ? 'Hohe See' : 'high seas'
  return de ? 'ohne Zuordnung' : 'unattributed'
}

/** GFW's vessel classes as the page names them. An unmapped class stays a plain "vessel" —
 *  the page never invents a class the source did not send. Note that `gear` is not a ship at
 *  all but fishing gear carrying its own AIS transponder. */
export function vesselKind(type: string, locale: Locale): string {
  const de = locale === 'de'
  switch (type) {
    case 'fishing':
      return de ? 'Fischereischiff' : 'fishing vessel'
    case 'gear':
      return de ? 'Fischereigerät mit eigener AIS-Kennung' : 'fishing-gear tag'
    case 'cargo':
      return de ? 'Frachtschiff' : 'cargo ship'
    case 'passenger':
      return de ? 'Passagierschiff' : 'passenger ship'
    case 'support':
      return de ? 'Versorgungsschiff' : 'support vessel'
    default:
      return de ? 'Schiff' : 'vessel'
  }
}

/** GFW sends "—" where it holds no flag state, which is most gear tags. The clause states
 *  the absence instead of printing "flagged —". */
export function flagClause(flag: string, locale: Locale): string {
  const de = locale === 'de'
  if (!flag || flag === '—') return de ? ' ohne Flaggenstaat' : ' with no flag state'
  return de ? ` unter Flagge ${flag}` : ` flagged ${flag}`
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

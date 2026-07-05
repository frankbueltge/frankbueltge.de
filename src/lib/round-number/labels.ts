import type { Locale } from '@/lib/site'

/**
 * The /round-number archive JSON is written nightly by the Python pipeline and carries the
 * series `name` and `institution` in German only — and the archive is immutable. This
 * presentation-layer lookup supplies the English labels for the bounded WDI/control catalogue
 * (keyed by the stable series id / institution string), so the EN page isn't a de/en mix.
 *
 * The catalogue is defined in `pipelines/round-number/scripts/fetch_datasets.py`. If a new
 * series is added there, add its English name here too — until then it falls back to the
 * German string (visibly untranslated rather than silently wrong).
 */
const SERIES_NAME_EN: Record<string, string> = {
  'wb-gdp': 'GDP per economy, US$ (WDI)',
  'wb-population': 'Population per economy (WDI)',
  'wb-land': 'Land area per economy, km² (WDI)',
  '_control_clean': 'Synthetic — clean Benford series',
  '_control_tampered': 'Synthetic — rounded (tampered)',
}

const INSTITUTION_EN: Record<string, string> = {
  Weltbank: 'World Bank',
  Kontrolle: 'Control',
}

/** English series name for the EN page; German name verbatim on the DE page. */
export function seriesName(series: { id: string; name: string }, locale: Locale): string {
  if (locale === 'de') return series.name
  return SERIES_NAME_EN[series.id] ?? series.name
}

/** English institution label for the EN page; German verbatim on the DE page. */
export function institutionLabel(institution: string, locale: Locale): string {
  if (locale === 'de') return institution
  return INSTITUTION_EN[institution] ?? institution
}

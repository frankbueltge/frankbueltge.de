import { SITE, type Locale } from '@/lib/site'
import { WERKE, type Werk } from '@/data/werke'

/** The Werk whose page this path is (an instrument page or its method sheet), or null.
 *  Path is stripped of the /de locale prefix and a trailing slash before matching. */
export function workForPath(pathname: string): Werk | null {
  const p = pathname.replace(/^\/de/, '').replace(/\/+$/, '') || '/'
  for (const w of WERKE) {
    if (p === w.href || p.startsWith(`${w.href}/`)) return w
    if (p === `/werke/${w.id}` || p.startsWith(`/werke/${w.id}/`)) return w
  }
  return null
}

/** Schema.org CreativeWork for an instrument, attributed to Frank (E-E-A-T + AI-citability).
 *  Connects each work to the site-wide Person/WebSite via @id references. */
export function workJsonLd(w: Werk, locale: Locale, canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${canonical}#work`,
    name: w.title,
    description: w.description[locale],
    url: canonical,
    inLanguage: locale === 'de' ? 'de-DE' : 'en',
    isAccessibleForFree: true,
    creator: { '@id': `${SITE.url}/#person` },
    author: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    keywords: ['Gegenmessung', 'Counter-Measurement', 'data art', 'open data', w.title],
  }
}

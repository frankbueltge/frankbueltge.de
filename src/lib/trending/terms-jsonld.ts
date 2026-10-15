/** Schema.org for the arcs: the hub as a Dataset and a DefinedTermSet, each term page as a
 *  Dataset with its own DefinedTerm, and the page itself. Emitted in the page body like the
 *  day ledger's (see ./jsonld.ts); the CreativeWork of the register comes from the layout.
 *
 *  A DefinedTerm rather than a Thing on purpose: what a term page publishes is not a claim
 *  about a subject, it is a record of how often a PHRASE occurs — and that is what a defined
 *  term in a named set is. */
import { SITE } from '@/lib/site'
import { fmtDateLong } from './format'
import { CC0_URL } from './jsonld'
import type { TrendingTerm, TrendingTermsDay } from './terms-types'
import { termsUrls } from './terms-markdown'
import { countedPlatforms, HUB_DESCRIPTION, searchedPlatforms, sortTerms, statusLabel, statusSentence, termPlatformLabel } from './terms-view'

export { CC0_URL }

const KEYWORDS = ['trending terms', 'emerging topics', 'trend tracking', 'Hacker News', 'GitHub', 'arXiv', 'Google News', 'open data']

/** The hub: the whole watchlist as one dataset, with its two machine editions. */
export function termsDatasetLd(file: TrendingTermsDay, canonical: string) {
  const u = termsUrls()
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${canonical}#dataset`,
    name: `Common Ground — trends in the making, ${fmtDateLong(file.date)}`,
    description: HUB_DESCRIPTION,
    url: canonical,
    license: CC0_URL,
    isAccessibleForFree: true,
    temporalCoverage: file.date,
    dateModified: file.generated_at,
    inLanguage: 'en',
    variableMeasured: ['mentions per day', 'mentions per seven days', 'mentions per thirty days'],
    creator: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    keywords: [...KEYWORDS, ...sortTerms(file.terms).slice(0, 8).map((t) => t.term)],
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: u.hubJson },
      { '@type': 'DataDownload', encodingFormat: 'text/markdown', contentUrl: u.markdown },
    ],
  }
}

/** The watchlist as a named set, so a term page can point at the set it belongs to. */
export function definedTermSetLd(file: TrendingTermsDay, canonical: string) {
  const u = termsUrls()
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${canonical}#watchlist`,
    name: 'Common Ground watchlist',
    description: 'The terms the arcs tracker follows every day, and the status each one carries.',
    url: canonical,
    inLanguage: 'en',
    hasDefinedTerm: sortTerms(file.terms).map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${u.termPage(t.slug)}#term`,
      name: t.term,
      url: u.termPage(t.slug),
    })),
  }
}

/** One term page: its counts as a dataset, addressed by its own URL. */
export function termDatasetLd(file: TrendingTermsDay, term: TrendingTerm, canonical: string) {
  const u = termsUrls(term.slug)
  const where = countedPlatforms(term, searchedPlatforms(file)).map(termPlatformLabel)
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${canonical}#dataset`,
    name: `${term.term} — mentions per day across ${where.length ? where.join(', ') : 'the tracked platforms'}`,
    description: `${statusSentence(term)} Counted daily from the platforms' own search interfaces, with the documents each count was read from; archived as open data and never edited afterwards.`,
    url: canonical,
    license: CC0_URL,
    isAccessibleForFree: true,
    temporalCoverage: `${term.first_seen}/${file.date}`,
    dateModified: file.generated_at,
    inLanguage: 'en',
    variableMeasured: ['mentions per day', 'mentions per seven days', 'mentions per thirty days'],
    creator: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    keywords: [term.term, ...term.aliases, ...KEYWORDS],
    about: { '@id': `${canonical}#term` },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: u.json }],
  }
}

/** The phrase itself, as a member of the watchlist. */
export function definedTermLd(term: TrendingTerm, canonical: string) {
  const u = termsUrls(term.slug)
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${canonical}#term`,
    name: term.term,
    ...(term.aliases.length ? { alternateName: term.aliases } : {}),
    description: `A term the Common Ground tracker follows daily; currently ${statusLabel(term.status).toLowerCase()}.`,
    url: canonical,
    inLanguage: 'en',
    inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${u.hub}#watchlist`, name: 'Common Ground watchlist', url: u.hub },
    ...(term.wikipedia_article
      ? { sameAs: `https://en.wikipedia.org/wiki/${encodeURIComponent(term.wikipedia_article)}` }
      : {}),
  }
}

/** The page — hub or term — anchored on its dataset. */
export function termsWebPageLd(opts: { name: string; canonical: string; datePublished: string; dateModified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${opts.canonical}#page`,
    name: opts.name,
    url: opts.canonical,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.url}/#website` },
    mainEntity: { '@id': `${opts.canonical}#dataset` },
  }
}

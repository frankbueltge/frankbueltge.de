/** Schema.org for the trending pages: the day as a Dataset with its three machine editions, the
 *  converging topics as an ItemList, and the page itself. Emitted in the page body like
 *  LabDetail's BlogPosting; the CreativeWork of the register (structured-data.ts) comes from
 *  the layout on top. */
import { SITE } from '@/lib/site'
import { fmtDateLong, LATEST_DESCRIPTION, topLabels } from './format'
import type { TrendingDay } from './types'
import { convergingRows } from './view'
import { trendingUrls } from './markdown'

export const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/'

export function datasetLd(day: TrendingDay, canonical: string) {
  const u = trendingUrls(day.date)
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${canonical}#dataset`,
    name: `Common Ground — trending ledger, ${fmtDateLong(day.date)}`,
    description: LATEST_DESCRIPTION,
    url: canonical,
    license: CC0_URL,
    isAccessibleForFree: true,
    temporalCoverage: day.date,
    dateModified: day.generated_at,
    inLanguage: 'en',
    creator: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    keywords: ['trending topics', 'trending today', 'Google Trends', 'Wikipedia pageviews', 'Hacker News', 'Bluesky', 'Mastodon', 'open data', ...topLabels(day, 5)],
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: u.dayJson },
      { '@type': 'DataDownload', encodingFormat: 'text/markdown', contentUrl: u.markdown },
      { '@type': 'DataDownload', encodingFormat: 'application/rss+xml', contentUrl: u.feed },
    ],
  }
}

export function itemListLd(day: TrendingDay, canonical: string) {
  const rows = convergingRows(day)
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonical}#converging`,
    name: `Converging topics on ${fmtDateLong(day.date)}`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.label,
      ...(r.url ? { url: r.url } : {}),
    })),
  }
}

export function webPageLd(day: TrendingDay, canonical: string, isLatest: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#page`,
    name: isLatest ? `Trending today — ${fmtDateLong(day.date)}` : `Trending on ${fmtDateLong(day.date)}`,
    url: canonical,
    datePublished: `${day.date}T00:00:00Z`,
    dateModified: day.generated_at,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.url}/#website` },
    mainEntity: { '@id': `${canonical}#dataset` },
  }
}

/** Schema.org for the trending pages: the day as a Dataset with its three machine editions, the
 *  converging topics as an ItemList, and the page itself. Emitted in the page body like
 *  LabDetail's BlogPosting; the CreativeWork of the register (structured-data.ts) comes from
 *  the layout on top. */
import { SITE } from '@/lib/site'
import { fmtDateLong, LATEST_DESCRIPTION, topLabels } from './format'
import type { TrendingDay } from './types'
import { convergingRows, sourceColumns } from './view'
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

/**
 * One ItemList per source: what that source said on its own, before any crossing.
 *
 * The gap this closes (2026-09-03): the per-source register is half the weight of this page and
 * appeared in no structured data at all — the Dataset described the day, the ItemList described
 * the crossing, and the twenty lists the crossing is DERIVED FROM were invisible to a machine
 * reader that does not parse markup. A retrieval agent could learn that "gloria steinem" was
 * converging but not that Mastodon called it something else at rank four.
 *
 * Two rules held here. The lists mirror exactly what the page renders — same sources, same
 * `top` cut, same order — because structured data that says more than the page is cloaking. And
 * every measurement travels as a PropertyValue with its unit, never as a bare number: the same
 * reason the cards stopped printing bare numbers on the same day.
 */
export function sourceListsLd(day: TrendingDay, canonical: string, top = 8) {
  return sourceColumns(day, top)
    .filter((col) => col.signals.length > 0)
    .map((col) => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${canonical}#source-${col.id}`,
      name: `${col.name} — ${fmtDateLong(day.date)}`,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: col.signals.length,
      isPartOf: { '@id': `${canonical}#dataset` },
      itemListElement: col.signals.map((sig, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Thing',
          name: sig.label,
          ...(sig.url ? { url: sig.url } : {}),
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'rank', value: sig.rank },
            ...(sig.magnitudeValue !== null
              ? [{ '@type': 'PropertyValue', name: sig.magnitudeUnit, value: sig.magnitudeValue, unitText: sig.magnitudeUnit }]
              : []),
            ...(sig.geo ? [{ '@type': 'PropertyValue', name: 'geo', value: sig.geo }] : []),
          ],
        },
      })),
    }))
}

import { describe, expect, it } from 'vitest'
import { CC0_URL, datasetLd, itemListLd, sourceListsLd, webPageLd } from './jsonld'
import { fixtureDay } from './fixtures'

const canonical = 'https://frankbueltge.de/trending/2026-09-02/'

describe('trending JSON-LD', () => {
  it('describes the day as a CC0 dataset with three downloads and a modification date', () => {
    const ld = datasetLd(fixtureDay(), canonical)
    expect(ld['@type']).toBe('Dataset')
    expect(ld.license).toBe(CC0_URL)
    expect(ld.dateModified).toBe('2026-09-02T06:41:12Z')
    expect(ld.temporalCoverage).toBe('2026-09-02')
    expect(ld.distribution).toHaveLength(3)
    expect(ld.distribution.map((d) => d.encodingFormat)).toEqual(['application/json', 'text/markdown', 'application/rss+xml'])
    expect(ld.keywords).toContain('usps mail ballots')
  })

  it('lists the converging topics in order', () => {
    const ld = itemListLd(fixtureDay(), canonical)
    expect(ld.numberOfItems).toBe(1)
    expect(ld.itemListElement[0]).toMatchObject({ position: 1, name: 'usps mail ballots' })
  })

  it('anchors the page on the dataset', () => {
    const ld = webPageLd(fixtureDay(), canonical, true)
    expect(ld.mainEntity).toEqual({ '@id': `${canonical}#dataset` })
    expect(ld.name).toBe('Trending today — 2 September 2026')
    expect(webPageLd(fixtureDay(), canonical, false).name).toBe('Trending on 2 September 2026')
  })
})

describe('the per-source lists', () => {
  const day = fixtureDay()
  const lists = sourceListsLd(day, 'https://frankbueltge.de/trending/', 8)

  it('states one list per source that actually said something', () => {
    // reddit answered nothing this morning, so it gets no list rather than an empty one
    expect(lists.map((l) => l['@id'])).toEqual([
      'https://frankbueltge.de/trending/#source-google_trends',
      'https://frankbueltge.de/trending/#source-bluesky',
    ])
  })

  it("names each list with the source's own full name, and ties it to the day's dataset", () => {
    expect(lists[0]!.name).toContain('Google Trends — Daily Search Trends (RSS)')
    expect(lists[0]!.isPartOf).toEqual({ '@id': 'https://frankbueltge.de/trending/#dataset' })
  })

  it('carries every measurement as a PropertyValue with its unit, never as a bare number', () => {
    const first = lists[0]!.itemListElement[0]!.item
    expect(first.name).toBe('usps mail ballots')
    expect(first.additionalProperty).toEqual([
      { '@type': 'PropertyValue', name: 'rank', value: 1 },
      { '@type': 'PropertyValue', name: 'searches', value: 2000, unitText: 'searches' },
      { '@type': 'PropertyValue', name: 'geo', value: 'US' },
    ])
  })

  it('states a link where the source gave one, and none where it did not', () => {
    expect(lists[0]!.itemListElement[0]!.item).not.toHaveProperty('url')
    expect(lists[1]!.itemListElement[0]!.item.url).toBe('https://bsky.app/profile/x/feed/a')
  })

  it('says no more than the page shows — same cut, same order', () => {
    // structured data that outruns the rendered register is cloaking
    const capped = sourceListsLd(day, 'https://x/', 1)
    expect(capped[0]!.itemListElement).toHaveLength(1)
    expect(capped[0]!.numberOfItems).toBe(1)
  })
})

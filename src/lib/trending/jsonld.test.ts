import { describe, expect, it } from 'vitest'
import { CC0_URL, datasetLd, itemListLd, webPageLd } from './jsonld'
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

import { describe, expect, it } from 'vitest'
import { CC0_URL, definedTermLd, definedTermSetLd, termDatasetLd, termsDatasetLd, termsWebPageLd } from './terms-jsonld'
import { fixtureTerm, fixtureTerms } from './terms-fixtures'
import { termsUrls } from './terms-markdown'

const hub = 'https://frankbueltge.de/trending/topics/'
const termCanonical = 'https://frankbueltge.de/trending/topics/loop-engineering/'

describe('the arcs JSON-LD', () => {
  it('describes the watchlist as a CC0 dataset with its two downloads', () => {
    const ld = termsDatasetLd(fixtureTerms(), hub)
    expect(ld['@type']).toBe('Dataset')
    expect(ld.license).toBe(CC0_URL)
    expect(ld.temporalCoverage).toBe('2026-09-03')
    expect(ld.dateModified).toBe('2026-09-03T06:47:02Z')
    expect(ld.distribution.map((d) => d.encodingFormat)).toEqual(['application/json', 'text/markdown'])
    expect(ld.distribution[0].contentUrl).toBe(termsUrls().hubJson)
    expect(ld.keywords).toContain('loop engineering')
  })

  it('names the watchlist as a set that holds every term', () => {
    const file = fixtureTerms()
    const ld = definedTermSetLd(file, hub)
    expect(ld['@type']).toBe('DefinedTermSet')
    expect(ld.hasDefinedTerm).toHaveLength(file.terms.length)
    expect(ld.hasDefinedTerm[0]).toMatchObject({ '@type': 'DefinedTerm', name: 'agentic commerce' })
  })

  it('describes one term as a CC0 dataset covering first-seen to today', () => {
    const ld = termDatasetLd(fixtureTerms(), fixtureTerm(), termCanonical)
    expect(ld['@type']).toBe('Dataset')
    expect(ld.license).toBe(CC0_URL)
    expect(ld.temporalCoverage).toBe('2026-06-14/2026-09-03')
    expect(ld.about).toEqual({ '@id': `${termCanonical}#term` })
    expect(ld.distribution[0].contentUrl).toBe(termsUrls('loop-engineering').json)
    expect(ld.description).toContain('Rising: mentions in the last seven days')
  })

  it('publishes the phrase as a DefinedTerm inside the hub set', () => {
    const ld = definedTermLd(fixtureTerm(), termCanonical)
    expect(ld['@type']).toBe('DefinedTerm')
    expect(ld.name).toBe('loop engineering')
    expect(ld.alternateName).toEqual(['loop-engineering'])
    expect(ld.inDefinedTermSet['@id']).toBe(`${hub}#watchlist`)
    expect(ld.inDefinedTermSet.url).toBe(hub)
    expect('sameAs' in ld).toBe(false)
  })

  it('links a term with a Wikipedia article to that article', () => {
    const ld = definedTermLd(fixtureTerm({ wikipedia_article: 'Knowledge_graph' }), termCanonical)
    expect(ld.sameAs).toBe('https://en.wikipedia.org/wiki/Knowledge_graph')
  })

  it('anchors the page on its dataset', () => {
    const ld = termsWebPageLd({ name: 'loop engineering', canonical: termCanonical, datePublished: '2026-06-14T00:00:00Z', dateModified: '2026-09-03T06:47:02Z' })
    expect(ld['@type']).toBe('WebPage')
    expect(ld.mainEntity).toEqual({ '@id': `${termCanonical}#dataset` })
    expect(ld.name).toBe('loop engineering')
  })
})

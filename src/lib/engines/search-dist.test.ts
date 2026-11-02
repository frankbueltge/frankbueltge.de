// The practices' published pages, named to search engines (2026-11-02): the share list goes into a
// sitemap of its own, registered once in Astro's index, and nothing public/_headers keeps out of the
// index is submitted.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { PRACTICE_SITEMAP, matchesRule, noindexRules, searchDist, sitemapXml, withSitemap } from './search-dist'

const HEADERS = readFileSync('public/_headers', 'utf8')
const NIGHTLY_PARTS = '/error-as-method/works-html/:slug/:part/*'

describe('the noindex rules of public/_headers', () => {
  const rules = noindexRules(HEADERS)

  it('are read from the blocks that set X-Robots-Tag, and from no other', () => {
    expect(rules).toEqual(expect.arrayContaining(['/attention/future/*', '/arch/works/*', '/*template.html', NIGHTLY_PARTS]))
    expect(rules).not.toContain('/n-1/*')
    expect(rules).not.toContain('/*')
    expect(rules.some((r) => r.startsWith('https://'))).toBe(false)
  })

  it('keep the nightly works’ parts out of the index and never the work itself', () => {
    for (const part of [
      '/error-as-method/works-html/2026-10-14-the-same-swing/makers/m07/',
      '/error-as-method/works-html/2026-10-09-order-words/makers/m07/first/renders/02',
      '/error-as-method/works-html/2026-10-19-handed-on/lineages/L3/v1/',
      '/error-as-method/works-html/2026-10-21-under-other-names/rooms/c1/renders/02',
      '/error-as-method/works-html/2026-10-10-prepared-clay/seen/contact',
    ]) expect(matchesRule(NIGHTLY_PARTS, part), part).toBe(true)
    expect(matchesRule(NIGHTLY_PARTS, '/error-as-method/works-html/2026-10-19-handed-on/')).toBe(false)
    expect(matchesRule(NIGHTLY_PARTS, '/error-as-method/works-html/2026-10-19-handed-on')).toBe(false)
  })

  it('reach none of the pages a visitor arrives at cold', () => {
    for (const href of [
      '/error-as-method/works-html/2026-10-19-handed-on/',
      '/studio/werke-html/2026-10-16-filed-under/',
      '/studio/werke-html/2026-10-16-filed-under/coda/',
      '/atelier/presentations/cycle-008/exposition/',
      '/field/presentations/cycle-007/',
      '/studio/closing-report/reach/',
      '/n-1/works/between-the-keys/',
      '/attention/',
    ]) expect(rules.filter((r) => matchesRule(r, href)), href).toEqual([])
  })

  it('read a splat as any run of characters and a placeholder as one segment', () => {
    expect(matchesRule('/attention/future/*', '/attention/future/nws-pafc-srw-6196-26')).toBe(true)
    expect(matchesRule('/*template.html', '/field/presentations/cycle-007/template.html')).toBe(true)
    expect(matchesRule('/a/:b/c', '/a/x/y/c')).toBe(false)
    expect(matchesRule('/a/:b/c', '/a/x.y/c')).toBe(true)
  })
})

describe('the other addresses of the site', () => {
  it('are kept out of the index: the Pages address, its previews and the www host', () => {
    for (const host of ['https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*', 'https://www.frankbueltge.de/*']) {
      const at = HEADERS.indexOf(`\n${host}\n`)
      expect(at, `${host} has no rule`).toBeGreaterThan(-1)
      expect(HEADERS.slice(at).split('\n')[2]).toMatch(/^\s+X-Robots-Tag: noindex$/)
    }
  })
})

describe('the practices’ sitemap', () => {
  it('names each address once, escaped, in a stable order', () => {
    const xml = sitemapXml(['/b/', '/a/?x=1&y=2', '/b/'], 'https://example.org')
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><urlset')).toBe(true)
    expect(xml.match(/<loc>/g)).toHaveLength(2)
    expect(xml.indexOf('/a/?x=1&amp;y=2')).toBeLessThan(xml.indexOf('/b/'))
  })

  it('is added to the index once, however often the build runs', () => {
    const index = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://frankbueltge.de/sitemap-0.xml</loc></sitemap></sitemapindex>'
    const once = withSitemap(index, 'https://frankbueltge.de/sitemap-practices.xml')
    expect(withSitemap(once, 'https://frankbueltge.de/sitemap-practices.xml')).toBe(once)
    expect(once.match(/<sitemap>/g)).toHaveLength(2)
  })

  let root: string | null = null
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true })
    root = null
  })

  it('is written into dist from the share list, leaving out what a noindex rule keeps out', () => {
    root = mkdtempSync(join(tmpdir(), 'search-dist-'))
    const dist = join(root, 'dist')
    mkdirSync(dist, { recursive: true })
    writeFileSync(join(dist, '_headers'), HEADERS)
    writeFileSync(
      join(dist, 'sitemap-index.xml'),
      '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://frankbueltge.de/sitemap-0.xml</loc></sitemap></sitemapindex>',
    )
    const pages = [{ href: '/studio/werke-html/2026-10-16-filed-under/' }, { href: '/error-as-method/works-html/2026-10-14-the-same-swing/makers/m07/' }]

    for (let run = 0; run < 2; run++) {
      const report = searchDist({ dist, publicDir: join(root, 'public'), pages })
      expect(report).toEqual({ listed: 1, held: ['/error-as-method/works-html/2026-10-14-the-same-swing/makers/m07/'], registered: true })
    }
    const sitemap = readFileSync(join(dist, PRACTICE_SITEMAP), 'utf8')
    expect(sitemap).toContain('<loc>https://frankbueltge.de/studio/werke-html/2026-10-16-filed-under/</loc>')
    expect(sitemap).not.toContain('makers')
    expect(readFileSync(join(dist, 'sitemap-index.xml'), 'utf8').match(/sitemap-practices\.xml/g)).toHaveLength(1)
  })
})

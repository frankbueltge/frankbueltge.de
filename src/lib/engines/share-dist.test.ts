// The practices' published pages, finished for sharing on dist/ (2026-10-18): every work and
// presentation the publication rule publishes gets its preview tags, an image and, where no frame
// stands, the way back — once, however often the build runs, and never a page the rule keeps off
// the site, a page the site renders itself, or a work Arch serves bare on purpose.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { BACK_MARKER, SHARE_MARKER } from './share'
import { imageHref, shareDist, stillFor } from './share-dist'
import { sharePages } from './share-pages'
import { FRAME_MARKER, frameStandaloneWork } from './work-frame'

const count = (s: string, needle: string) => s.split(needle).length - 1
const page = (title: string, body = '<p>An opening paragraph that is long enough to be read as a description of the page.</p>') =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`
const HOUSE = '<!doctype html><html lang="en" data-skin="mono" data-theme="dark"><head><title>A house page</title></head><body><p>house</p></body></html>'

/** dist-relative path → content; `mirrored` paths are also written to public/ (they came from a mirror). */
const SITE: Record<string, { html: string; mirrored: boolean }> = {
  // published: a presentation, its linked sub-page, a framed work with its still, a nightly face, n-1's front page
  'field/presentations/cycle-007/index.html': { html: page('Where the Near Miss Is Decided', '<p class="stand">A near miss is an event that did not happen, so every record of near misses holds a decision.</p><a href="exposition/">the exposition</a>'), mirrored: true },
  'field/presentations/cycle-007/exposition/index.html': { html: page('The Exposition'), mirrored: true },
  'field/presentations/cycle-007/template.html': { html: page('A build template'), mirrored: true },
  'studio/werke-html/2026-10-14-under-warning/index.html': { html: frameStandaloneWork(page('Under Warning'), 'studio', 'A wall text.'), mirrored: true },
  'error-as-method/works-html/2026-10-09-order-words/index.html': { html: page('Order-Words'), mirrored: true },
  'error-as-method/works-html/2026-10-09-order-words/makers/m01/first/index.html': { html: page('A maker’s page'), mirrored: true },
  'n-1/index.html': { html: frameStandaloneWork(page('Remainder'), 'n-1', null, { atHouseIndex: true }), mirrored: true },
  // a page that names its own preview image
  'atelier/presentations/cycle-008/index.html': { html: page('The Heeded Column').replace('</head>', '<meta property="og:image" content="https://frankbueltge.de/atelier/own.png"></head>'), mirrored: true },
  // NOT published: a session artifact (working material under the rule), an unlinked sub-page
  'field/artifacts/2026-10-11-how-far/index.html': { html: page('A session artifact'), mirrored: true },
  'field/presentations/cycle-007/unlinked/index.html': { html: page('Nobody links here'), mirrored: true },
  // NOT the practices' pages: Arch's bare works, and a page the site renders itself
  'arch/works/the-ledger/index.html': { html: page('An Arch work'), mirrored: true },
  'error-as-method/2026-10-09-order-words/index.html': { html: HOUSE, mirrored: false },
}

let root: string | null = null
afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true })
  root = null
})

function site(extra: Record<string, { html: string; mirrored: boolean }> = {}) {
  root = mkdtempSync(join(tmpdir(), 'share-dist-'))
  const dist = join(root, 'dist')
  const publicDir = join(root, 'public')
  for (const [path, { html, mirrored }] of Object.entries({ ...SITE, ...extra })) {
    for (const base of mirrored ? [dist, publicDir] : [dist]) {
      mkdirSync(dirname(join(base, path)), { recursive: true })
      writeFileSync(join(base, path), html)
    }
  }
  // a Studio screenshot beside the work: its still
  writeFileSync(join(dist, 'studio/werke-html/2026-10-14-under-warning/shot-1100.png'), 'png')
  writeFileSync(join(publicDir, 'studio/werke-html/2026-10-14-under-warning/shot-1100.png'), 'png')
  return { dist, publicDir }
}

const rendered: string[] = []
const render = {
  card: async (input: { title: string }) => {
    rendered.push(`card:${input.title}`)
    return new TextEncoder().encode(`card ${input.title}`)
  },
  still: async (file: string) => {
    rendered.push(`still:${file}`)
    return new TextEncoder().encode('still')
  },
}
const run = (dirs: { dist: string; publicDir: string }) =>
  shareDist({ ...dirs, root: process.cwd(), render, wallText: () => undefined, readWorks: () => new Set() })
const read = (dist: string, path: string) => readFileSync(join(dist, path), 'utf8')

describe('which pages are finished', () => {
  it('lists the published works and presentations, and the pages they link to as pages', () => {
    const { dist, publicDir } = site()
    const files = sharePages({ dist, publicDir, readWorks: () => new Set() }).map((p) => p.file)
    expect(files).toEqual([
      'atelier/presentations/cycle-008/index.html',
      'error-as-method/works-html/2026-10-09-order-words/index.html',
      'field/presentations/cycle-007/exposition/index.html',
      'field/presentations/cycle-007/index.html',
      'n-1/index.html',
      'studio/werke-html/2026-10-14-under-warning/index.html',
    ])
  })

  it('never touches a page the publication rule keeps off the site, a template, Arch, or a page the site renders', async () => {
    const dirs = site()
    await run(dirs)
    for (const path of [
      'field/artifacts/2026-10-11-how-far/index.html',
      'field/presentations/cycle-007/unlinked/index.html',
      'field/presentations/cycle-007/template.html',
      'error-as-method/works-html/2026-10-09-order-words/makers/m01/first/index.html',
      'arch/works/the-ledger/index.html',
      'error-as-method/2026-10-09-order-words/index.html',
    ]) {
      const html = read(dirs.dist, path)
      expect(html, path).toBe({ ...SITE }[path]!.html)
      expect(html).not.toContain(SHARE_MARKER)
      expect(html).not.toContain(BACK_MARKER)
    }
  })
})

describe('a finished page', () => {
  it('carries its preview tags, its image and the way back — the strip only where no frame stands', async () => {
    const dirs = site()
    const report = await run(dirs)
    expect(report.failed).toEqual([])
    const presentation = read(dirs.dist, 'field/presentations/cycle-007/index.html')
    expect(presentation).toContain('<meta property="og:title" content="Where the Near Miss Is Decided">')
    expect(presentation).toContain('<meta property="og:description" content="A near miss is an event that did not happen, so every record of near misses holds a decision.">')
    expect(presentation).toContain('content="https://frankbueltge.de/og/practice/field/presentations/cycle-007.png"')
    expect(count(presentation, `<nav class="${BACK_MARKER}"`)).toBe(1)
    expect(presentation).toContain('<a href="/field">The Field</a>')

    const work = read(dirs.dist, 'studio/werke-html/2026-10-14-under-warning/index.html')
    expect(work).toContain('content="https://frankbueltge.de/og/practice/studio/werke-html/2026-10-14-under-warning.jpg"')
    expect(work).not.toContain(BACK_MARKER)
    expect(count(work, `<header class="${FRAME_MARKER}"`)).toBe(1)

    // n-1's front door has the house frame: tags, no strip
    expect(read(dirs.dist, 'n-1/index.html')).toContain(SHARE_MARKER)
    expect(read(dirs.dist, 'n-1/index.html')).not.toContain(BACK_MARKER)

    // the images were written where the tags point
    expect(existsSync(join(dirs.dist, imageHref({ href: '/field/presentations/cycle-007/' } as never, 'png')))).toBe(true)
    expect(existsSync(join(dirs.dist, 'og/practice/studio/werke-html/2026-10-14-under-warning.jpg'))).toBe(true)
    expect(report).toMatchObject({ pages: 6, stills: 1, cards: 4, ownImages: 1, strips: 4 })
  })

  it('keeps an image the page names itself, and makes none for it', async () => {
    const dirs = site()
    await run(dirs)
    const html = read(dirs.dist, 'atelier/presentations/cycle-008/index.html')
    expect(count(html, 'property="og:image"')).toBe(1)
    expect(html).toContain('https://frankbueltge.de/atelier/own.png')
    expect(existsSync(join(dirs.dist, 'og/practice/atelier/presentations/cycle-008.png'))).toBe(false)
  })

  it('uses the maker’s own still where one stands beside the page', () => {
    const dirs = site()
    const [work] = sharePages({ ...dirs, readWorks: () => new Set() }).filter((p) => p.slug === '2026-10-14-under-warning')
    expect(stillFor(work!, dirs.dist)).toBe('studio/werke-html/2026-10-14-under-warning/shot-1100.png')
  })
})

describe('the step can run again', () => {
  it('is idempotent: a second run changes no byte and doubles nothing', async () => {
    const dirs = site()
    await run(dirs)
    const snapshot = Object.keys(SITE).map((path) => read(dirs.dist, path))
    const again = await run(dirs)
    expect(again.written).toBe(0)
    expect(Object.keys(SITE).map((path) => read(dirs.dist, path))).toEqual(snapshot)
    for (const html of snapshot) {
      expect(count(html, `<!--${SHARE_MARKER}-->`)).toBeLessThanOrEqual(1)
      expect(count(html, `<nav class="${BACK_MARKER}"`)).toBeLessThanOrEqual(1)
    }
  })

  it('never fails the build: a page whose image cannot be made keeps its tags and goes without one', async () => {
    const dirs = site()
    const report = await shareDist({
      ...dirs,
      root: process.cwd(),
      render: { card: async () => Promise.reject(new Error('no canvas')), still: async () => Promise.reject(new Error('no sharp')) },
      wallText: () => undefined,
      readWorks: () => new Set(),
    })
    expect(report.pages).toBe(6)
    expect(report.failed.length).toBeGreaterThan(0)
    const html = read(dirs.dist, 'field/presentations/cycle-007/index.html')
    expect(html).toContain('property="og:title"')
    expect(html).not.toContain('property="og:image"')
    expect(html).toContain('<meta name="twitter:card" content="summary">')
  })
})

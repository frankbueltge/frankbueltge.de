import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { collectWorks, hrefFor } from './latest'
import { NIGHTLY_FORK_DIR, WORK_SOURCES, allWorks, summarise } from './register'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

/** The register's only claim is completeness, so the tripwire is a second, independent count:
 *  read the work directories off the disk and compare with what the globs delivered. A source
 *  that silently stops matching (a renamed directory, a moved namespace) would otherwise leave
 *  a page that still looks full. */
describe('allWorks covers every committed work source', () => {
  const works = allWorks()

  it('finds as many works as there are meta.json files on disk', () => {
    const onDisk = WORK_SOURCES.flatMap(({ ns, kind, dir }) => {
      const abs = `${ROOT}${dir}`
      if (!existsSync(abs)) return []
      return readdirSync(abs)
        .filter((slug) => existsSync(`${abs}/${slug}/meta.json`))
        .map((slug) => `${ns}/${kind}/${slug}`)
    })
    expect(onDisk.length).toBeGreaterThan(0)
    expect(works.map((w) => `${w.ns}/${w.kind}/${w.slug}`).sort()).toEqual(onDisk.sort())
  })

  it('carries all three practices', () => {
    expect(new Set(works.map((w) => w.ns))).toEqual(new Set(['atelier', 'field', 'studio']))
  })

  it('gives every entry a date, a title and a link', () => {
    for (const w of works) {
      expect(w.date, `${w.ns}/${w.slug} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(w.title.length, `${w.ns}/${w.slug} title`).toBeGreaterThan(0)
      // A work's link is the one its own source declares. Four of the five sources declare
      // nothing and get the derived address; the fifth — the forked nightly line, whose works
      // live at an address of their own — declares a stage, and is named rather than excused.
      const expected =
        w.dir === NIGHTLY_FORK_DIR ? `/error-as-method/${w.slug}/` : hrefFor(w.ns, w.kind, w.slug, 'stage')
      expect(w.href, `${w.ns}/${w.slug} href`).toBe(expected)
    }
  })

  it('links html works to their own stage, not to the practice front page', () => {
    const html = works.filter((w) => w.kind === 'html' && w.dir !== NIGHTLY_FORK_DIR)
    expect(html.length).toBeGreaterThan(0)
    for (const w of html) {
      expect(w.href).toBe(`/${w.ns}/werke-html/${w.slug}/`)
      // the stage is a static file in public/ — a link that is not built is a link that 404s
      expect(existsSync(`${ROOT}public/${w.ns}/werke-html/${w.slug}/index.html`), w.slug).toBe(true)
    }
  })

  it('links the forked line\'s works to their own mirrored page, which has a text to render', () => {
    // The same obligation as the stage check above, for the source that cannot satisfy it the
    // same way: there is no public/ stage here, there is a mirrored work.md and a route that
    // renders it. A link with nothing behind it is a 404 either way.
    const forked = works.filter((w) => w.dir === NIGHTLY_FORK_DIR)
    for (const w of forked) {
      expect(w.href).toBe(`/error-as-method/${w.slug}/`)
      expect(existsSync(`${ROOT}${NIGHTLY_FORK_DIR}/${w.slug}/work.md`), w.slug).toBe(true)
      expect(existsSync(`${ROOT}src/pages/error-as-method/[slug].astro`)).toBe(true)
    }
  })

  it('links astro works to their own page, which exists as a route', () => {
    const astro = works.filter((w) => w.kind === 'astro')
    expect(astro.length).toBeGreaterThan(0)
    for (const w of astro) {
      expect(w.href).toBe(`/${w.ns}/werke/${w.slug}`)
      expect(existsSync(`${ROOT}src/pages/${w.ns}/werke/${w.slug}.astro`), w.slug).toBe(true)
    }
  })

  it('lists the withdrawn work instead of hiding it, and quotes its own marker', () => {
    const withdrawn = works.filter((w) => w.state === 'withdrawn')
    expect(withdrawn.length).toBeGreaterThan(0)
    for (const w of withdrawn) {
      expect(w.withdrawnNote?.startsWith('WITHDRAWN'), w.slug).toBe(true)
      expect(w.withdrawnOn, w.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('orders newest first and stays stable across calls', () => {
    const dates = works.map((w) => w.date)
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates)
    expect(allWorks().map((w) => w.slug)).toEqual(works.map((w) => w.slug))
  })
})

describe('summarise', () => {
  it('counts the practices, the kinds and the withdrawals it was given', () => {
    const s = summarise([
      { ns: 'field', kind: 'astro', slug: 'a', title: 'A', date: '2026-07-02', href: '/x', state: 'published' },
      { ns: 'atelier', kind: 'html', slug: 'b', title: 'B', date: '2026-07-01', href: '/y', state: 'published' },
      { ns: 'studio', kind: 'html', slug: 'c', title: 'C', date: '2026-07-03', href: '/z', state: 'withdrawn' },
    ])
    expect(s).toMatchObject({
      total: 3,
      withdrawn: 1,
      byNs: { field: 1, atelier: 1, studio: 1 },
      byKind: { astro: 1, html: 2 },
      first: '2026-07-01',
      last: '2026-07-03',
    })
  })

  it('agrees with the register it describes', () => {
    const works = allWorks()
    const s = summarise(works)
    expect(s.byNs.atelier + s.byNs.field + s.byNs.studio).toBe(s.total)
    expect(s.byKind.astro + s.byKind.html).toBe(s.total)
    expect(s.total).toBe(works.length)
  })
})

/** The register and the entrance read the same works, so they must agree about them: the
 *  register's first rows ARE the strip, apart from the link an html work gets. */
describe('the register and the hub LATEST strip agree', () => {
  it('starts with the same works the entrance shows newest-first', () => {
    const registerTop = allWorks().slice(0, 8).map((w) => `${w.ns}/${w.slug}`)
    const stripTop = collectWorks(WORK_SOURCES).slice(0, 8).map((w) => `${w.ns}/${w.slug}`)
    expect(registerTop).toEqual(stripTop)
  })
})

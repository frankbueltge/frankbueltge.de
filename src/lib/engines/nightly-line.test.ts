// The nightly line, held against the two mirrors it is drawn from.
//
// The page at /error-as-method prints counts, a span and a list. Every one of them is derived,
// so every one of them can drift silently when a mirror changes shape. These tests hold the
// derivation against the committed files themselves — not against numbers written down here.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LINE_END, LINE_RESUMED, forkedMeta, forkedWorks, nightlyLine } from './nightly-line'

const FORK_WORKS_DIR = 'src/data/nightly/works'
const FIGURES_DIR = 'public/error-as-method'

const mirroredSlugs = (): string[] =>
  existsSync(FORK_WORKS_DIR)
    ? readdirSync(FORK_WORKS_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
    : []

describe('the forked half of the line', () => {
  it('shows exactly the works the mirror committed — no more, and none invented', () => {
    expect(forkedWorks().map((w) => w.slug).sort()).toEqual(mirroredSlugs())
  })

  it('sends every forked work to something this site actually serves', () => {
    // Two forms, one address. A text work is rendered by /error-as-method/[slug].astro from its
    // mirrored work.md; an interactive work is the practice's own index.html, served as built
    // from public/. Either is a page — neither being there is a 404 with a link pointing at it.
    for (const work of forkedWorks()) {
      expect(work.href).toBe(`/error-as-method/${work.slug}/`)
      const text = existsSync(join(FORK_WORKS_DIR, work.slug, 'work.md'))
      const stage = existsSync(join(FIGURES_DIR, work.slug, 'index.html'))
      expect(text || stage, `${work.slug} has neither a mirrored text nor a stage`).toBe(true)
      // Never both: the route and the static file would fight over the same path.
      expect(text && stage, `${work.slug} is mirrored twice, as text AND as stage`).toBe(false)
    }
  })

  it('takes title, date and blurb from the work\'s own meta.json', () => {
    for (const work of forkedWorks()) {
      const meta = JSON.parse(readFileSync(join(FORK_WORKS_DIR, work.slug, 'meta.json'), 'utf8'))
      expect(work.title).toBe(meta.title)
      expect(work.date).toBe(meta.date)
      expect(work.blurb).toBe(meta.embodies)
      expect(forkedMeta(work.slug)?.medium).toBe(meta.medium)
    }
  })

  it('keeps a figure where the work\'s own relative link resolves', () => {
    // The practice writes `![…](figure.svg)`. If the mirror ever stops putting that file beside
    // the route, the image 404s silently and the page still looks fine — so it is checked here.
    for (const slug of mirroredSlugs()) {
      if (!existsSync(join(FORK_WORKS_DIR, slug, 'work.md'))) continue
      const body = readFileSync(join(FORK_WORKS_DIR, slug, 'work.md'), 'utf8')
      if (!/!\[[^\]]*\]\(figure\.svg\)/.test(body)) continue
      expect(existsSync(join(FIGURES_DIR, slug, 'figure.svg'))).toBe(true)
    }
  })

  it('holds only what the fork made — the inherited works stay with the Atelier mirror', () => {
    // Mirroring them twice would put one work at two addresses and let the house count it twice.
    for (const work of forkedWorks()) expect(work.date > LINE_END).toBe(true)
  })
})

describe('the line as one list', () => {
  const line = nightlyLine()

  it('is both halves, and nothing else', () => {
    expect(line.count).toBe(line.inherited + line.sinceFork)
    expect(line.sinceFork).toBe(forkedWorks().length)
    expect(line.inherited).toBeGreaterThan(0)
  })

  it('runs newest first', () => {
    const dates = line.works.map((w) => w.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('counts the first run\'s days without swallowing the dormancy', () => {
    // 2026-06-29 → 2026-07-18 inclusive is 20 days of work; the weeks of standstill that follow
    // are counted separately, and a page that added them together would report silence as work.
    expect(line.days).toBe(20)
    expect(line.dormant).toBeGreaterThan(20)
    expect(line.first).toBeDefined()
    expect(line.last).toBeDefined()
    expect(line.last! >= LINE_RESUMED || line.sinceFork === 0).toBe(true)
  })

  it('gives every work a date and a title, so no row renders as a slug', () => {
    for (const work of line.works) {
      expect(work.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(work.title.length).toBeGreaterThan(0)
      expect(work.title).not.toBe(work.slug)
    }
  })
})

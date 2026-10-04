// The nightly mirror, run against a repository built here rather than the real one.
//
// What it guards is the door promised to the line on 2026-09-03 and missing until 2026-10-04:
// a work that carries both `work.md` and `index.html` must come out as BOTH — the text rendered
// by this site at its route, the page served bare at /error-as-method/works-html/<slug>/. For a
// month the mirror read such a work as text only and dropped the page without a word, and
// nothing failed, because nothing checked for the page.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FACES, mirror } from './mirror.mjs'

let root = ''
let src = ''
let dest = ''

function work(slug: string, files: Record<string, string>) {
  const dir = join(src, 'works', slug)
  mkdirSync(dir, { recursive: true })
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body)
}
const meta = (date: string) => JSON.stringify({ title: 'T', date, embodies: 'e', medium: 'm' })
const listing = (dir: string) => (existsSync(dir) ? readdirSync(dir).sort() : [])

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'nightly-mirror-'))
  src = join(root, 'repo')
  dest = join(root, 'site')
  mkdirSync(join(src, 'journal'), { recursive: true })
  mkdirSync(dest, { recursive: true })
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('a work with both forms comes out as both', () => {
  beforeEach(() => {
    work('2026-09-22-both', {
      'meta.json': meta('2026-09-22'),
      'work.md': '# Both\n\n![f](figure.svg)\n',
      'index.html': '<!doctype html><script>1</script><img src="figure.svg">',
      'figure.svg': '<svg/>',
      'results.json': '{}',
      'measure.py': 'print(1)',
      'corpus.json.gz': 'gz',
      'citations.json': '[]',
      '.gitignore': 'cache/\n',
    })
    mkdirSync(join(src, 'works', '2026-09-22-both', 'sources'))
    writeFileSync(join(src, 'works', '2026-09-22-both', 'sources', 'MANIFEST.json'), '{}')
  })

  it('keeps the text rendering exactly as before', () => {
    mirror(src, dest)
    expect(listing(join(dest, 'src/data/nightly/works/2026-09-22-both'))).toEqual(['meta.json', 'work.md'])
    expect(listing(join(dest, 'public/error-as-method/2026-09-22-both'))).toEqual(['figure.svg'])
  })

  it('serves the page and what stands beside it at works-html/<slug>/', () => {
    mirror(src, dest)
    // The page's own relative links (figure.svg, work.md) resolve beside it; the metadata, the
    // measuring code, the compressed corpus, the harvested citations, the dotfile and the
    // sources/ directory stay in the repository.
    expect(listing(join(dest, 'public/error-as-method', FACES, '2026-09-22-both'))).toEqual([
      'figure.svg',
      'index.html',
      'results.json',
      'work.md',
    ])
  })

  it('reports the face, so a run says which works it served', () => {
    const report = mirror(src, dest)
    expect(report.faces).toEqual(['2026-09-22-both'])
    expect(report.works).toEqual([{ slug: '2026-09-22-both', form: 'text', face: true }])
  })

  it('removes a face withdrawn upstream, and a file dropped from beside it, on the next run', () => {
    mirror(src, dest)
    rmSync(join(src, 'works', '2026-09-22-both', 'results.json'))
    mirror(src, dest)
    expect(listing(join(dest, 'public/error-as-method', FACES, '2026-09-22-both'))).not.toContain('results.json')

    rmSync(join(src, 'works', '2026-09-22-both', 'index.html'))
    const report = mirror(src, dest)
    expect(existsSync(join(dest, 'public/error-as-method', FACES, '2026-09-22-both'))).toBe(false)
    expect(report.faces).toEqual([])
    // ...and the text is still there: losing the face does not lose the work.
    expect(existsSync(join(dest, 'src/data/nightly/works/2026-09-22-both/work.md'))).toBe(true)
  })
})

describe('the other forms are unchanged', () => {
  it('serves a stage-only work at its own address and gives it no face', () => {
    work('2026-08-10-stage', {
      'meta.json': meta('2026-08-10'),
      'index.html': '<!doctype html>',
      'data.json': '{}',
      'cut.py': 'x',
    })
    const report = mirror(src, dest)
    expect(listing(join(dest, 'public/error-as-method/2026-08-10-stage'))).toEqual(['data.json', 'index.html'])
    expect(listing(join(dest, 'src/data/nightly/works/2026-08-10-stage'))).toEqual(['meta.json'])
    expect(existsSync(join(dest, 'public/error-as-method', FACES))).toBe(false)
    expect(report.works).toEqual([{ slug: '2026-08-10-stage', form: 'stage' }])
    expect(report.faces).toEqual([])
  })

  it('gives a text-only work no face', () => {
    work('2026-09-28-text', { 'meta.json': meta('2026-09-28'), 'work.md': '# T', 'figure.svg': '<svg/>' })
    const report = mirror(src, dest)
    expect(existsSync(join(dest, 'public/error-as-method', FACES, '2026-09-28-text'))).toBe(false)
    expect(report.faces).toEqual([])
  })

  it('leaves an inherited work with the Atelier mirror, page or not', () => {
    work('2026-07-04-old', { 'meta.json': meta('2026-07-04'), 'work.md': '# O', 'index.html': '<!doctype html>' })
    const report = mirror(src, dest)
    expect(report.inherited).toEqual(['2026-07-04-old'])
    expect(report.faces).toEqual([])
    expect(existsSync(join(dest, 'public/error-as-method', FACES, '2026-07-04-old'))).toBe(false)
  })
})

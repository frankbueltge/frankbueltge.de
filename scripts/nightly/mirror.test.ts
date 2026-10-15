// The nightly mirror, run against a repository built here rather than the real one.
//
// What it guards is the door promised to the line on 2026-09-03 and missing until 2026-10-04:
// a work that carries both `work.md` and `index.html` must come out as BOTH — the text rendered
// by this site at its route, the page served bare at /error-as-method/works-html/<slug>/. For a
// month the mirror read such a work as text only and dropped the page without a word, and
// nothing failed, because nothing checked for the page.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FACES, MAX_ASSET_BYTES, mirror } from './mirror.mjs'

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
    // sources/ directory (the harvested source bytes, evidence) stay in the repository.
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

// 2026-10-05 (Frank's decision, wording private: the practices may publish rich works, size and
// form not limited). Until that day copyStage() skipped every directory, so the face of
// 2026-10-04-before-the-verdict went online without the 25 images it loads from thumbs/, and
// 2026-10-04-the-mould without seen/ and iterations/. A work now arrives whole.
describe('a multi-file work arrives whole', () => {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff])
  const face = (p = '') => join(dest, 'public/error-as-method', FACES, '2026-10-04-verdict', p)

  beforeEach(() => {
    const dir = join(src, 'works', '2026-10-04-verdict')
    work('2026-10-04-verdict', {
      'meta.json': meta('2026-10-04'),
      'work.md': '# Verdict\n',
      'index.html': '<!doctype html><img src="thumbs/V01.jpg"><script src="iterations/i1.js"></script>',
      'measure.py': 'print(1)',
    })
    for (const d of ['thumbs', 'seen', 'iterations', 'models/lod', 'data/sources', 'sources', '.cache']) {
      mkdirSync(join(dir, d), { recursive: true })
    }
    writeFileSync(join(dir, 'thumbs', 'V01.jpg'), PNG)
    writeFileSync(join(dir, 'thumbs', 'V02.jpg'), PNG)
    writeFileSync(join(dir, 'seen', '0.png'), PNG)
    writeFileSync(join(dir, 'iterations', 'i1.js'), 'console.log(1)')
    writeFileSync(join(dir, 'models', 'lod', 'scene.glb'), 'glTF')
    writeFileSync(join(dir, 'models', 'lod', 'engine.wasm'), Buffer.from([0x00, 0x61, 0x73, 0x6d]))
    writeFileSync(join(dir, 'data', 'sources', 'counts.json'), '{}')
    // evidence and housekeeping, at depth
    writeFileSync(join(dir, 'iterations', 'fit.py'), 'print(2)')
    writeFileSync(join(dir, 'models', 'corpus.json.gz'), 'gz')
    writeFileSync(join(dir, 'seen', 'citations.json'), '[]')
    writeFileSync(join(dir, 'seen', '.DS_Store'), 'x')
    writeFileSync(join(dir, '.cache', 'tmp.json'), '{}')
    writeFileSync(join(dir, 'sources', 'MANIFEST.json'), '{}')
    symlinkSync(join(src, 'journal'), join(dir, 'up'))
  })

  it('brings every subdirectory with its images, scripts, models and WebAssembly', () => {
    mirror(src, dest)
    expect(listing(face('thumbs'))).toEqual(['V01.jpg', 'V02.jpg'])
    expect(listing(face('seen'))).toEqual(['0.png'])
    expect(listing(face('iterations'))).toEqual(['i1.js'])
    expect(listing(face('models/lod'))).toEqual(['engine.wasm', 'scene.glb'])
    expect(readFileSync(face('thumbs/V01.jpg')).equals(PNG)).toBe(true)
    // only the TOP-LEVEL sources/ is the line's evidence directory; one further in is the work's
    expect(listing(face('data/sources'))).toEqual(['counts.json'])
  })

  it('keeps the evidence, the dotfiles and the links behind at every depth', () => {
    mirror(src, dest)
    expect(listing(face())).toEqual(['data', 'index.html', 'iterations', 'models', 'seen', 'thumbs', 'work.md'])
    expect(listing(face('iterations'))).not.toContain('fit.py')
    expect(listing(face('models'))).toEqual(['lod'])
    expect(listing(face('seen'))).not.toContain('citations.json')
    expect(listing(face('seen'))).not.toContain('.DS_Store')
  })

  it('serves a stage-only work whole at its own address', () => {
    const dir = join(src, 'works', '2026-10-05-stage')
    work('2026-10-05-stage', { 'meta.json': meta('2026-10-05'), 'index.html': '<!doctype html>' })
    mkdirSync(join(dir, 'assets', 'audio'), { recursive: true })
    writeFileSync(join(dir, 'assets', 'app.js'), 'export {}')
    writeFileSync(join(dir, 'assets', 'audio', 'score.ogg'), 'ogg')
    mirror(src, dest)
    const at = join(dest, 'public/error-as-method/2026-10-05-stage')
    expect(listing(at)).toEqual(['assets', 'index.html'])
    expect(listing(join(at, 'assets'))).toEqual(['app.js', 'audio'])
    expect(listing(join(at, 'assets', 'audio'))).toEqual(['score.ogg'])
  })

  it('leaves a file over the 25 MiB asset limit behind, by name, and copies the rest', () => {
    writeFileSync(join(src, 'works', '2026-10-04-verdict', 'seen', 'film.mp4'), Buffer.alloc(MAX_ASSET_BYTES + 1))
    const report = mirror(src, dest)
    expect(report.oversized).toEqual([{ slug: '2026-10-04-verdict', file: 'seen/film.mp4', bytes: MAX_ASSET_BYTES + 1 }])
    expect(listing(face('seen'))).toEqual(['0.png'])
    expect(report.faces).toEqual(['2026-10-04-verdict'])
  })
})

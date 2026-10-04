import { describe, it, expect } from 'vitest'
import { classifyWork, isHousekeeping, siteTargets, type ClassifiedWork } from './paths'

describe('classifyWork', () => {
  it('classifies an astro work', () => {
    expect(classifyWork('drei', ['work.astro', 'meta.json'])).toEqual({
      slug: 'drei', kind: 'astro', files: ['work.astro', 'meta.json'], ignored: [],
    })
  })
  it('classifies an html work', () => {
    expect(classifyWork('alt', ['index.html', 'meta.json'])).toEqual({
      slug: 'alt', kind: 'html', files: ['index.html', 'meta.json'], ignored: [],
    })
  })
  it('ignores a disallowed file type instead of rejecting the work', () => {
    const r = classifyWork('bad', ['work.astro', 'evil.sh'])
    expect(r.kind).toBe('astro')
    if (r.kind !== null) expect(r.ignored).toEqual(['evil.sh'])
  })
  it('rejects a work without index.html or work.astro', () => {
    expect(classifyWork('empty', ['meta.json']).kind).toBeNull()
  })
  it('partitions disallowed files as ignored instead of rejecting', () => {
    const w = classifyWork('x', ['work.astro', 'meta.json', 'README.md', 'runner.py', 'data'])
    expect(w.kind).toBe('astro')
    if (w.kind !== null) {
      expect(w.files).toEqual(['work.astro', 'meta.json'])
      expect(w.ignored).toEqual(['README.md', 'runner.py', 'data'])
    }
  })
  // 2026-08-16: a work may now carry the assets that make it a work. Before this, a standalone
  // work could reach a visitor only through text, SVG and canvas — which is the form Studio
  // Protocol v3 stopped accepting.
  it('carries sound, moving image, raster and fonts beside the entry file', () => {
    const w = classifyWork('loud', [
      'index.html', 'meta.json', 'score.mp3', 'loop.webm', 'frame.png', 'type.woff2',
    ])
    expect(w.kind).toBe('html')
    expect((w as { files: string[] }).files).toEqual([
      'index.html', 'meta.json', 'score.mp3', 'loop.webm', 'frame.png', 'type.woff2',
    ])
    expect((w as { ignored: string[] }).ignored).toEqual([])
  })

  it('still rejects a directory with no entry file', () => {
    const w = classifyWork('x', ['README.md', 'notes.txt'])
    expect(w.kind).toBeNull()
  })
})

// 2026-10-05 (Frank's decision, wording private): the practices may publish rich works, size
// and form not limited. A standalone work is served bare and never compiled here, so it travels
// whole; until today the allow-list dropped .wasm, .glb, LICENSE and every subdirectory.
describe('classifyWork — a standalone work travels whole', () => {
  const tree = [
    'index.html',
    'meta.json',
    'LICENSE',
    'README.md',
    'assets/index-3f2a.js',
    'assets/index-9c1d.css',
    'vendor/three/three.module.min.js',
    'vendor/three/LICENSE',
    'models/scene.glb',
    'models/scene.bin',
    'textures/ground.ktx2',
    'audio/score.opus',
    'video/loop.mov',
    'py/pyodide.asm.wasm',
    'py/python_stdlib.zip',
    'data/counts.csv',
    'fonts/Inter.ttf',
    'chapter/2/index.html',
    '.gitignore',
    'assets/.DS_Store',
    '.cache/stale.json',
  ]

  it('carries every file at every depth, whatever its extension', () => {
    const w = classifyWork('rich', tree)
    expect(w.kind).toBe('html')
    const files = (w as { files: string[] }).files
    for (const f of tree.filter((f) => !f.split('/').some((s) => s.startsWith('.')))) expect(files).toContain(f)
  })

  it('leaves only housekeeping behind: dotfiles and dot-directories, at any depth', () => {
    const w = classifyWork('rich', tree) as { files: string[]; ignored: string[] }
    expect(w.ignored).toEqual(['.gitignore', 'assets/.DS_Store', '.cache/stale.json'])
    expect(w.files.some((f) => isHousekeeping(f))).toBe(false)
  })

  it('maps every nested file beside index.html, at the same relative path', () => {
    const w = classifyWork('rich', tree) as ClassifiedWork
    const targets = siteTargets(w, 'studio')
    expect(targets).toContainEqual({ from: 'models/scene.glb', to: 'public/studio/werke-html/rich/models/scene.glb' })
    expect(targets).toContainEqual({ from: 'chapter/2/index.html', to: 'public/studio/werke-html/rich/chapter/2/index.html' })
    expect(targets).toContainEqual({ from: 'meta.json', to: 'src/content/studio/works/rich/meta.json' })
    // only the top-level meta.json is the work's metadata; a nested one is data of the work
    expect(siteTargets({ ...w, files: ['index.html', 'data/meta.json'] }, 'studio')).toContainEqual({
      from: 'data/meta.json',
      to: 'public/studio/werke-html/rich/data/meta.json',
    })
  })

  it('decides the form at the top level only', () => {
    expect(classifyWork('deep', ['site/index.html', 'meta.json']).kind).toBeNull()
  })

  it('keeps a native Astro work to its top level and its allow-list', () => {
    const w = classifyWork('native', ['work.astro', 'meta.json', 'lib/geo.ts', 'lib/more.ts', 'model.glb']) as {
      files: string[]
      ignored: string[]
    }
    expect(w.files).toEqual(['work.astro', 'meta.json'])
    expect(w.ignored).toEqual(['lib', 'model.glb'])
  })
})

describe('siteTargets', () => {
  it('maps an astro work dir into the components tree', () => {
    const w = { slug: 'drei', kind: 'astro' as const, files: ['work.astro', 'meta.json', 'data.json'], ignored: [] }
    expect(siteTargets(w)).toEqual([
      { from: 'work.astro', to: 'src/components/atelier/werke/drei/index.astro' },
      { from: 'meta.json',  to: 'src/components/atelier/werke/drei/meta.json' },
      { from: 'data.json',  to: 'src/components/atelier/werke/drei/data.json' },
    ])
  })
  it('maps an html work: index.html → public/atelier/werke-html/, meta.json stays in content tree', () => {
    const w = { slug: 'alt', kind: 'html' as const, files: ['index.html', 'meta.json'], ignored: [] }
    expect(siteTargets(w)).toEqual([
      { from: 'index.html', to: 'public/atelier/werke-html/alt/index.html' },
      { from: 'meta.json',  to: 'src/content/atelier/works/alt/meta.json' },
    ])
  })
  it('maps html-work runtime assets next to index.html so relative refs resolve (Attractor-Bug)', () => {
    const w = { slug: 'att', kind: 'html' as const, files: ['index.html', 'meta.json', 'data.js', 'engine.mjs'], ignored: [] }
    expect(siteTargets(w)).toEqual([
      { from: 'index.html', to: 'public/atelier/werke-html/att/index.html' },
      { from: 'meta.json',  to: 'src/content/atelier/works/att/meta.json' },
      { from: 'data.js',    to: 'public/atelier/werke-html/att/data.js' },
      { from: 'engine.mjs', to: 'public/atelier/werke-html/att/engine.mjs' },
    ])
  })
  it('allows .mjs modules through the extension gate', () => {
    const r = classifyWork('m', ['index.html', 'engine.mjs', 'test.mjs'])
    expect(r.kind).toBe('html')
    if (r.kind !== null) expect(r.files).toEqual(['index.html', 'engine.mjs', 'test.mjs'])
  })
  it('maps into a custom namespace', () => {
    const html = { slug: 'x', kind: 'html' as const, files: ['index.html', 'meta.json'], ignored: [] }
    expect(siteTargets(html, 'field')).toEqual([
      { from: 'index.html', to: 'public/field/werke-html/x/index.html' },
      { from: 'meta.json',  to: 'src/content/field/works/x/meta.json' },
    ])
    const astro = { slug: 'y', kind: 'astro' as const, files: ['work.astro'], ignored: [] }
    expect(siteTargets(astro, 'field')[0].to).toBe('src/components/field/werke/y/index.astro')
  })
})

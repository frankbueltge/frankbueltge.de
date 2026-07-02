import { describe, it, expect } from 'vitest'
import { classifyWork, siteTargets } from './paths'

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
  it('still rejects a directory with no entry file', () => {
    const w = classifyWork('x', ['README.md', 'notes.txt'])
    expect(w.kind).toBeNull()
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

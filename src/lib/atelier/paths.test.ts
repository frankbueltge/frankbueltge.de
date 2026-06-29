import { describe, it, expect } from 'vitest'
import { classifyWork, siteTargets } from './paths'

describe('classifyWork', () => {
  it('classifies an astro work', () => {
    expect(classifyWork('drei', ['work.astro', 'meta.json'])).toEqual({
      slug: 'drei', kind: 'astro', files: ['work.astro', 'meta.json'],
    })
  })
  it('classifies an html work', () => {
    expect(classifyWork('alt', ['index.html', 'meta.json'])).toEqual({
      slug: 'alt', kind: 'html', files: ['index.html', 'meta.json'],
    })
  })
  it('rejects a work with a disallowed file type', () => {
    const r = classifyWork('bad', ['work.astro', 'evil.sh'])
    expect(r.kind).toBeNull()
    expect((r as any).reason).toMatch(/evil\.sh/)
  })
  it('rejects a work without index.html or work.astro', () => {
    expect(classifyWork('empty', ['meta.json']).kind).toBeNull()
  })
})

describe('siteTargets', () => {
  it('maps an astro work dir into the components tree', () => {
    const w = { slug: 'drei', kind: 'astro' as const, files: ['work.astro', 'meta.json', 'data.json'] }
    expect(siteTargets(w)).toEqual([
      { from: 'work.astro', to: 'src/components/atelier/werke/drei/index.astro' },
      { from: 'meta.json',  to: 'src/components/atelier/werke/drei/meta.json' },
      { from: 'data.json',  to: 'src/components/atelier/werke/drei/data.json' },
    ])
  })
  it('maps an html work: index.html → public/atelier/werke-html/, meta.json stays in content tree', () => {
    const w = { slug: 'alt', kind: 'html' as const, files: ['index.html', 'meta.json'] }
    expect(siteTargets(w)).toEqual([
      { from: 'index.html', to: 'public/atelier/werke-html/alt/index.html' },
      { from: 'meta.json',  to: 'src/content/atelier/works/alt/meta.json' },
    ])
  })
})

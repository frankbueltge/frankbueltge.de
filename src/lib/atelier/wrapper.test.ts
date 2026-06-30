// src/lib/atelier/wrapper.test.ts
import { describe, it, expect } from 'vitest'
import { renderWrapperPage } from './wrapper'

describe('renderWrapperPage', () => {
  it('imports the work component and meta and wraps in Page', () => {
    const out = renderWrapperPage('drei-maschinen', { title: 'Drei Maschinen', verkoerpert: 'X' })
    expect(out).toContain("import Page from '@/layouts/Page.astro'")
    expect(out).toContain("import Work from '@/components/atelier/werke/drei-maschinen/index.astro'")
    expect(out).toContain("import meta from '@/components/atelier/werke/drei-maschinen/meta.json'")
    expect(out).toContain('<Work />')
    expect(out).toContain('<Page')
  })
  it('escapes nothing into code (slug is path-segment safe)', () => {
    expect(() => renderWrapperPage('a/b', {})).toThrow(/slug/)
  })
  it('targets a custom namespace', () => {
    const out = renderWrapperPage('w', { title: 'W' }, 'field')
    expect(out).toContain("import Work from '@/components/field/werke/w/index.astro'")
    expect(out).toContain('— Field |')
  })
})

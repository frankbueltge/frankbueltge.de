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

  // The wall text (Frank, 2026-08-01). A visitor opens the work, not the record — so the
  // plain-language teaser stands at the head of the page, keyed to this work's own namespace.
  it('puts the wall text above the work, keyed to the work itself', () => {
    const out = renderWrapperPage('drei-maschinen', { title: 'Drei Maschinen' })
    expect(out).toContain("import { teaserFor } from '@/lib/engines/teaser'")
    expect(out).toContain("const wallText = teaserFor('atelier', 'drei-maschinen')")
    // Above the work, not below it: the label is read before the picture.
    expect(out.indexOf('wallText &&')).toBeLessThan(out.indexOf('<Work />'))
  })

  it('keys the wall text to the work namespace, not always atelier', () => {
    const out = renderWrapperPage('w', { title: 'W' }, 'field')
    expect(out).toContain("teaserFor('field', 'w')")
  })

  // Load-bearing: a missing wall text must leave a gap, never fall back to `embodies`. The
  // apparatus prose is exactly what the wall text exists to replace, so silently substituting
  // it would hide the omission the drift-check is meant to count.
  it('never falls back to embodies for the wall text', () => {
    const out = renderWrapperPage('x', { title: 'X', embodies: 'LONG APPARATUS PROSE' })
    expect(out).not.toMatch(/wallText\s*(\?\?|\|\|)/)
    // Only the visible region counts: <Page description={m.embodies …}> is the meta tag and
    // stays as it is — what must not carry apparatus prose is the body above the work.
    const body = out.slice(out.indexOf('<main'), out.indexOf('<Work />'))
    expect(body).not.toContain('embodies')
    expect(body).toContain('wallText')
  })
})

// The wall texts, applied to the built site (2026-10-17): a teaser on record reaches its page with
// the next build, whenever its work's mirror was copied. See ./frame-dist.ts for the deadlock this
// replaces.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { frameDist } from './frame-dist'
import { FRAME_MARKER, frameStandaloneWork } from './work-frame'

const DOC = '<!DOCTYPE html><html lang="en"><head><title>W</title></head><body><h1>work</h1></body></html>'
const wallEl = `class="${FRAME_MARKER}__wall"`
const count = (s: string, needle: string) => s.split(needle).length - 1

let dist: string | null = null
afterEach(() => {
  if (dist) rmSync(dist, { recursive: true, force: true })
  dist = null
})

/** A built site holding Studio work pages framed as their mirrors were, with the given wall texts. */
function builtSite(pages: Record<string, string | undefined>): string {
  dist = mkdtempSync(join(tmpdir(), 'frame-dist-'))
  for (const [slug, wall] of Object.entries(pages)) {
    mkdirSync(join(dist, 'studio', 'werke-html', slug), { recursive: true })
    writeFileSync(join(dist, 'studio', 'werke-html', slug, 'index.html'), frameStandaloneWork(DOC, 'studio', wall))
  }
  return dist
}
const page = (root: string, slug: string) => readFileSync(join(root, 'studio', 'werke-html', slug, 'index.html'), 'utf8')

describe('the built site carries the wall text on record', () => {
  it('frames a page whose mirror predates its teaser, once', () => {
    const root = builtSite({ 'a-new-work': undefined })
    const report = frameDist(root, () => 'Two sentences for a stranger. The second one says what was found.')
    const html = page(root, 'a-new-work')
    expect(html).toContain('Two sentences for a stranger.')
    expect(count(html, wallEl)).toBe(1)
    expect(count(html, `<header class="${FRAME_MARKER}"`)).toBe(1)
    expect(report).toEqual({ pages: 1, reframed: 1, failed: [] })
  })

  it('replaces a wall text the teaser store has since rewritten', () => {
    const root = builtSite({ 'an-edited-work': 'The old words.' })
    frameDist(root, () => 'The new words.')
    const html = page(root, 'an-edited-work')
    expect(html).toContain('The new words.')
    expect(html).not.toContain('The old words.')
  })

  it('leaves a page that already carries its teaser byte for byte', () => {
    const root = builtSite({ 'a-current-work': 'Already on the wall.' })
    const before = page(root, 'a-current-work')
    const report = frameDist(root, () => 'Already on the wall.')
    expect(page(root, 'a-current-work')).toBe(before)
    expect(report.reframed).toBe(0)
  })

  it('invents nothing for a work with no teaser on record', () => {
    const root = builtSite({ 'an-undescribed-work': undefined })
    frameDist(root, () => undefined)
    expect(page(root, 'an-undescribed-work')).not.toContain(wallEl)
  })

  it('reads the teaser store by default, under the same key the integrate uses', () => {
    const root = builtSite({ 'not-a-real-work': undefined })
    expect(frameDist(root).failed).toEqual([])
  })

  it('runs as the second half of every build', () => {
    // The integrate gates, CI and the deploy all build through `npm run build` (the workflows say
    // so in so many words), so the step belongs to that script and to nothing narrower.
    const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../../../package.json', import.meta.url)), 'utf8'))
    expect(pkg.scripts.build).toMatch(/^astro build && tsx scripts\/engines\/frame-dist\.ts$/)
  })
})

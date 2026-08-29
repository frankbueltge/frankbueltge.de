// The room at /arch links into the practice's mirrored record. A link that lands nowhere is not
// a cosmetic fault here: the page's whole claim is that it shows the record as the practice
// wrote it, and a 404 is the site failing to keep that promise. On 2026-08-23 every "how it is
// rebuilt" link did exactly that — the route generator excluded any file named README.md, which
// caught the works' own documentation along with the directory scaffolding. These tests hold the
// rule that replaced it.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { archReadPaths } from './facts'

describe('the pages /arch/read offers', () => {
  const paths = archReadPaths()

  it('gives every document the room links by name a page', () => {
    const page = readFileSync('src/pages/arch/index.astro', 'utf8')
    const linked = [...page.matchAll(/readHref\('([^']+)'\)/g)].map((m) => m[1])
    expect(linked.length).toBeGreaterThan(0)
    for (const rel of linked) expect(paths).toContain(rel)
  })

  // The reverse direction, added 2026-08-30: on that day fourteen rendered pages — including the
  // eight newest ledger sessions — were reachable only through the sitemap. A page nobody can
  // walk to is not published, it is merely deployed.
  it('leaves no rendered page unreachable from the room', () => {
    const page = readFileSync('src/pages/arch/index.astro', 'utf8')
    expect(page).toContain('archReadPaths()')
    expect(page).toMatch(/restOfRecord\[shelf\]\.map/)
  })

  it("gives each work's own README a page — the room calls it 'how it is rebuilt'", () => {
    const workReadmes = paths.filter((p) => /^works\/[^/]+\/README\.md$/.test(p))
    expect(workReadmes.length).toBeGreaterThan(0)
  })

  it('leaves the scaffold READMEs out: they describe shelves, not work', () => {
    expect(paths).not.toContain('README.md')
    expect(paths.filter((p) => /^[^/]+\/README\.md$/.test(p))).toEqual([])
  })

  it('renders markdown only, and never the practice ignore file', () => {
    for (const p of paths) expect(p.endsWith('.md')).toBe(true)
    expect(paths).not.toContain('.gitignore')
  })
})

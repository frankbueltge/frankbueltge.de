// The room at /arch links into the practice's record. A link that lands nowhere is not a cosmetic
// fault here: the page's whole claim is that it shows the record as the practice wrote it, and a
// dead link is the site failing to keep that promise. On 2026-08-23 every "how it is rebuilt" link
// did exactly that — the route generator excluded any file named README.md, which caught the
// works' own documentation along with the directory scaffolding. These tests hold the rule that
// replaced it.
//
// 2026-10-17, the publication rule (src/lib/engines/publication.mjs): the rendered pages at
// /arch/read/<path> were retired, and the room's links open each file in the practice's repository
// instead (the old addresses 301 to the same files). What the tests guard is unchanged: every file
// the room names exists in the record, and every markdown file of the record is listed. archReadPaths
// still says which files those are.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { archReadPaths } from './facts'

describe('the record files /arch links', () => {
  const paths = archReadPaths()

  it('names only files the record holds', () => {
    const page = readFileSync('src/pages/arch/index.astro', 'utf8')
    const linked = [...page.matchAll(/readHref\('([^']+)'\)/g)].map((m) => m[1])
    expect(linked.length).toBeGreaterThan(0)
    for (const rel of linked) expect(paths).toContain(rel)
  })

  it('opens every file in the practice’s repository, never at a retired /arch/read page', () => {
    const page = readFileSync('src/pages/arch/index.astro', 'utf8')
    expect(page).toMatch(/const readHref = \(path: string\) => `\$\{REPO\}\/blob\/main\/\$\{path\}`/)
    // no address built on the retired route, in any quoting
    expect(page).not.toMatch(/[`'"]\/arch\/read\//)
  })

  // The reverse direction, added 2026-08-30: on that day fourteen rendered pages — including the
  // eight newest ledger sessions — were reachable only through the sitemap. A file nobody can walk
  // to is not published, it is merely deployed.
  it('leaves no file of the record unlisted in the room', () => {
    const page = readFileSync('src/pages/arch/index.astro', 'utf8')
    expect(page).toContain('archReadPaths()')
    expect(page).toMatch(/restOfRecord\[shelf\]\.map/)
  })

  it("lists each work's own README — the room calls it 'how it is rebuilt'", () => {
    const workReadmes = paths.filter((p) => /^works\/[^/]+\/README\.md$/.test(p))
    expect(workReadmes.length).toBeGreaterThan(0)
  })

  it('leaves the scaffold READMEs out: they describe shelves, not work', () => {
    expect(paths).not.toContain('README.md')
    expect(paths.filter((p) => /^[^/]+\/README\.md$/.test(p))).toEqual([])
  })

  it('lists markdown only, and never the practice ignore file', () => {
    for (const p of paths) expect(p.endsWith('.md')).toBe(true)
    expect(paths).not.toContain('.gitignore')
  })
})

// src/lib/atelier/integrate.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { integrate } from './integrate'

let src: string, site: string
beforeEach(() => {
  src = mkdtempSync(join(tmpdir(), 'atelier-src-'))
  site = mkdtempSync(join(tmpdir(), 'atelier-site-'))
  const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
  mk('works/good/work.astro', `---\nimport d from '@/data/climate/gistemp.json'\n---\n<p>ok</p>`)
  mk('works/good/meta.json', JSON.stringify({ title: 'Good', verkoerpert: 'v' }))
  mk('works/evil/work.astro', `<script src="https://evil.example/x.js"></script>`)
  mk('works/evil/meta.json', JSON.stringify({ title: 'Evil' }))
  mk('works/Bad_Slug/work.astro', `---\n---\n<p>bad</p>`)
  mk('works/Bad_Slug/meta.json', JSON.stringify({ title: 'Bad' }))
})
afterEach(() => { rmSync(src, { recursive: true, force: true }); rmSync(site, { recursive: true, force: true }) })

describe('integrate', () => {
  it('accepts a clean astro work and writes component + wrapper page', () => {
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
    expect(existsSync(join(site, 'src/components/atelier/werke/good/index.astro'))).toBe(true)
    expect(existsSync(join(site, 'src/components/atelier/werke/good/meta.json'))).toBe(true)
    expect(existsSync(join(site, 'src/pages/atelier/werke/good.astro'))).toBe(true)
    expect(readFileSync(join(site, 'src/pages/atelier/werke/good.astro'), 'utf8')).toContain('<Work />')
  })
  it('rejects a work with an external script and does not copy it', () => {
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === 'evil')?.reason).toMatch(/external resource/)
    expect(existsSync(join(site, 'src/components/atelier/werke/evil/index.astro'))).toBe(false)
  })
  it('rejects a work with an unsafe slug before copying any files', () => {
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === 'Bad_Slug')?.reason).toMatch(/unsafe slug/)
    expect(existsSync(join(site, 'src/components/atelier/werke/Bad_Slug/index.astro'))).toBe(false)
  })
  it('rejects an astro work with missing meta.json without crashing, and still processes other works', () => {
    const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
    mk('works/no-meta/work.astro', `---\n---\n<p>no meta</p>`)
    // no meta.json written — integrate must catch the ENOENT and continue
    const r = integrate({ sourceDir: src, siteDir: site })
    const rej = r.rejected.find((x) => x.slug === 'no-meta')
    expect(rej).toBeDefined()
    expect(rej?.reason).toMatch(/fehler bei verarbeitung/)
    // other clean work must still be accepted
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
  })
  it('rejects an astro work with broken meta.json without crashing', () => {
    const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
    mk('works/bad-meta/work.astro', `---\n---\n<p>bad meta</p>`)
    mk('works/bad-meta/meta.json', 'NOT VALID JSON {{{')
    const r = integrate({ sourceDir: src, siteDir: site })
    const rej = r.rejected.find((x) => x.slug === 'bad-meta')
    expect(rej).toBeDefined()
    expect(rej?.reason).toMatch(/fehler bei verarbeitung/)
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
  })
})

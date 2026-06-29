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
})

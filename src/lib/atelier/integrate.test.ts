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
  it('copies only allowlisted files and reports the rest as ignored', () => {
    const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
    mk('works/mixed/work.astro', `---\n---\n<p>ok</p>`)
    mk('works/mixed/meta.json', JSON.stringify({ title: 'Mixed' }))
    mk('works/mixed/README.md', '# notes')
    mk('works/mixed/notes.py', 'print("hi")')
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted).toContainEqual({ slug: 'mixed', kind: 'astro', ignored: ['README.md', 'notes.py'] })
    expect(existsSync(join(site, 'src/components/atelier/werke/mixed/index.astro'))).toBe(true)
    expect(existsSync(join(site, 'src/components/atelier/werke/mixed/meta.json'))).toBe(true)
    expect(existsSync(join(site, 'src/components/atelier/werke/mixed/README.md'))).toBe(false)
    expect(existsSync(join(site, 'src/components/atelier/werke/mixed/notes.py'))).toBe(false)
  })
  it('shields engine work scripts + modules from the site tsconfig, but not JSON-LD data', () => {
    const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
    mk('works/scripted/work.astro',
      `---\n---\n<script type="application/ld+json" set:html={JSON.stringify({ a: 1 })} />\n<script>\n  let timers = [];\n  function run(instant) { return instant ? 0 : 1; }\n  run(false); timers.length;\n</script>`)
    mk('works/scripted/meta.json', JSON.stringify({ title: 'Scripted' }))
    mk('works/scripted/helper.ts', `export const f = (x) => x`)
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted.find((x) => x.slug === 'scripted')).toBeDefined()
    const astro = readFileSync(join(site, 'src/components/atelier/werke/scripted/index.astro'), 'utf8')
    // the client <script> is shielded, exactly once…
    expect(astro).toMatch(/<script>\s*\n\s*\/\/ @ts-nocheck/)
    expect(astro.match(/@ts-nocheck/g)?.length).toBe(1)
    // …and the JSON-LD data script is left untouched
    expect(astro).toContain('application/ld+json')
    // copied .ts helper modules are shielded at the top
    expect(readFileSync(join(site, 'src/components/atelier/werke/scripted/helper.ts'), 'utf8').startsWith('// @ts-nocheck')).toBe(true)
  })
  it('integrates into a custom namespace', () => {
    const r = integrate({ sourceDir: src, siteDir: site, ns: 'field' })
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
    expect(existsSync(join(site, 'src/components/field/werke/good/index.astro'))).toBe(true)
    expect(existsSync(join(site, 'src/pages/field/werke/good.astro'))).toBe(true)
  })
})

// Protocol-v4 publication gate (M-08): projects/ reaches the works surface only through
// a valid, human-approved PUBLICATION.json. Everything else is a research record.
describe('integrate — v4 publication gate', () => {
  const mkProject = (id: string, pub: object | string | null, withWork = true) => {
    const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
    if (withWork) {
      mk(`projects/${id}/work/work.astro`, `---\n---\n<p>v4 work</p>`)
      mk(`projects/${id}/work/meta.json`, JSON.stringify({ title: id, verkoerpert: 'v' }))
    }
    mk(`projects/${id}/EXPOSITION.md`, '# exposition')
    mk(`projects/${id}/APPARATUS.md`, '# apparatus')
    if (pub !== null) mk(`projects/${id}/PUBLICATION.json`, typeof pub === 'string' ? pub : JSON.stringify(pub))
  }
  const validPub = (id: string) => ({
    project_id: id,
    status: 'PUBLISHED_WORK',
    protocol_version: 4,
    approved_by: 'Frank Bültge',
    approved_at: '2026-07-18T12:00:00Z',
    work_path: 'work',
    exposition_path: 'EXPOSITION.md',
    apparatus_path: 'APPARATUS.md',
  })

  it('never imports a project without PUBLICATION.json — active/study/killed states are invisible', () => {
    mkProject('2026-07-18-active-line', null)
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted.find((x) => x.slug === '2026-07-18-active-line')).toBeUndefined()
    expect(r.rejected.find((x) => x.slug === '2026-07-18-active-line')).toBeUndefined()
    expect(existsSync(join(site, 'src/components/atelier/werke/2026-07-18-active-line/index.astro'))).toBe(false)
  })
  it('imports a project with a valid human-approved manifest', () => {
    mkProject('2026-07-18-published', validPub('2026-07-18-published'))
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted).toContainEqual({ slug: '2026-07-18-published', kind: 'astro' })
    expect(existsSync(join(site, 'src/pages/atelier/werke/2026-07-18-published.astro'))).toBe(true)
  })
  it('refuses a manifest without a human approver', () => {
    mkProject('2026-07-18-no-approver', { ...validPub('2026-07-18-no-approver'), approved_by: '' })
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === '2026-07-18-no-approver')?.reason).toMatch(/approved_by/)
    expect(existsSync(join(site, 'src/components/atelier/werke/2026-07-18-no-approver/index.astro'))).toBe(false)
  })
  it('refuses a manifest whose status is not PUBLISHED_WORK', () => {
    mkProject('2026-07-18-candidate', { ...validPub('2026-07-18-candidate'), status: 'PUBLICATION_CANDIDATE' })
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === '2026-07-18-candidate')?.reason).toMatch(/PUBLISHED_WORK/)
  })
  it('refuses a work_path that escapes the project directory', () => {
    mkProject('2026-07-18-escape', { ...validPub('2026-07-18-escape'), work_path: '../../works/good' })
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === '2026-07-18-escape')?.reason).toMatch(/inside the project/)
  })
  it('refuses a mismatched project_id and reports broken JSON without crashing', () => {
    mkProject('2026-07-18-mismatch', { ...validPub('2026-07-18-other'), project_id: '2026-07-18-other' })
    mkProject('2026-07-18-broken', 'NOT JSON {{{')
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === '2026-07-18-mismatch')?.reason).toMatch(/project_id/)
    expect(r.rejected.find((x) => x.slug === '2026-07-18-broken')?.reason).toMatch(/fehler bei verarbeitung/)
    // the ordinary works pass is unaffected
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
  })
  it('skips the _template directory', () => {
    mkProject('_template', validPub('_template'))
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted.find((x) => x.slug === '_template')).toBeUndefined()
    expect(r.rejected.find((x) => x.slug === '_template')).toBeUndefined()
  })
})

// A nightly work's own face, held against the committed mirror and against the pages that
// must link it. The door was promised on 2026-09-03 and stood missing for a month without a
// single red check, because nothing asked whether a mirrored page was linked from anywhere —
// these tests ask it.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FACES_DIR, faceHref, workFace } from './face'
import { PRACTICE_POLICY, governsLoads, matchesPattern, parseHeaders } from '@/lib/engines/practice-policy'

const WORKS_DIR = 'src/data/nightly/works'

const faceSlugs = (): string[] =>
  existsSync(FACES_DIR)
    ? readdirSync(FACES_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
    : []

describe('workFace', () => {
  it('returns the face only where the mirror carries an index.html for it', () => {
    const seen: string[] = []
    const exists = (p: string) => {
      seen.push(p)
      return p.includes('2026-09-22-the-same-rate')
    }
    expect(workFace('2026-09-22-the-same-rate', exists)).toBe('/error-as-method/works-html/2026-09-22-the-same-rate/')
    expect(workFace('2026-09-24-the-name-of-the-act', exists)).toBeUndefined()
    expect(seen[0]).toBe(`${FACES_DIR}/2026-09-22-the-same-rate/index.html`)
  })

  it('agrees with the mirror script about where the faces live', () => {
    const script = readFileSync('scripts/nightly/mirror.mjs', 'utf8')
    const name = script.match(/export const FACES = '([^']+)'/)?.[1]
    expect(name).toBeDefined()
    expect(FACES_DIR).toBe(`public/error-as-method/${name}`)
    expect(faceHref('x')).toBe(`/error-as-method/${name}/x/`)
  })
})

describe('the committed faces', () => {
  it('belong to mirrored text works, each with a page at its root', () => {
    // A face accompanies a text work: the work's route renders work.md and links the face. A face
    // without a text would be an orphan no page of this site links to.
    for (const slug of faceSlugs()) {
      expect(existsSync(join(FACES_DIR, slug, 'index.html')), `${slug} has no index.html`).toBe(true)
      expect(existsSync(join(WORKS_DIR, slug, 'work.md')), `${slug} has a face but no mirrored text`).toBe(true)
      expect(existsSync(join(WORKS_DIR, slug, 'meta.json')), `${slug} has a face but no metadata`).toBe(true)
    }
  })

  it('carry none of the evidence that stays in the repository, at any depth', () => {
    // Faces arrive whole since 2026-10-05, subdirectories included; the evidence still stays.
    const walk = (dir: string, rel: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? [`${rel}${e.name}/`, ...walk(join(dir, e.name), `${rel}${e.name}/`)] : [`${rel}${e.name}`],
      )
    for (const slug of faceSlugs()) {
      for (const path of walk(join(FACES_DIR, slug), '')) {
        const name = path.replace(/\/$/, '').split('/').pop()!
        expect(name, `${slug}/${path}`).not.toMatch(/^\.|\.(py|ipynb|gz)$|citations\.json$/)
        expect(path, `${slug}/${path}`).not.toMatch(/^meta\.json$|^sources\/$/)
      }
    }
  })
})

describe('the pages that open the door', () => {
  it('the work page links its face above the text', () => {
    const page = readFileSync('src/pages/error-as-method/[slug].astro', 'utf8')
    expect(page).toContain("import { workFace } from '@/lib/nightly/face'")
    expect(page).toMatch(/const face = workFace\(work\.slug\)/)
    const door = page.indexOf('href={face}')
    expect(door).toBeGreaterThan(-1)
    // Prominent means before the rendered text, not in the footer with the evidence links.
    expect(door).toBeLessThan(page.indexOf('set:html={html}'))
  })

  it('the line page marks the works that have one', () => {
    const page = readFileSync('src/pages/error-as-method.astro', 'utf8')
    expect(page).toContain('workFace(w.slug)')
    expect(page).toContain('href={faces.get(work.slug)}')
  })

  it('neither page carries an inline style attribute (CSP, drift-check rule 3)', () => {
    for (const f of ['src/pages/error-as-method/[slug].astro', 'src/pages/error-as-method.astro']) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/style=["{]/)
    }
  })
})

describe('the policy the faces are served under', () => {
  // Every rule in public/_headers whose pattern matches a path, with its CSP. Pages joins the
  // values of every matching rule with a comma, and the browser enforces each as its own policy,
  // so EVERY matching CSP must allow what the face needs — one strict rule is enough to block it.
  const rules = parseHeaders(readFileSync('public/_headers', 'utf8'))
  const SIBLING = rules.find((r) => r.pattern === '/studio/werke-html/*')?.csp

  it('names the door with the siblings\' policy, word for word', () => {
    expect(SIBLING).toBe(PRACTICE_POLICY)
    expect(rules.find((r) => r.pattern === '/error-as-method/works-html/*')?.csp).toBe(PRACTICE_POLICY)
  })

  it('lets every matching policy run what a face needs (inline script, WebAssembly, live data)', () => {
    const path = '/error-as-method/works-html/2026-09-22-the-same-rate/index.html'
    const applying = rules.filter((r) => r.csp && matchesPattern(r.pattern, path))
    expect(applying.length).toBeGreaterThan(1)
    for (const { pattern, csp } of applying) {
      // A policy that only restricts framing (the site-wide `/*` rule) says nothing about loads.
      if (!governsLoads(csp!)) continue
      expect(csp, pattern).toBe(PRACTICE_POLICY)
    }
  })
})

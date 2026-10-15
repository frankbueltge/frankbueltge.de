// The practices' shared policy, held against public/_headers and against the mirrors.
//
// 2026-10-05, Frank's decision (wording private): the practices may publish rich works, size and
// form not limited. The policy that allows it is only worth something if EVERY practice surface
// carries it — Pages joins the CSP values of every matching rule, the browser enforces each of
// them, so one narrower rule over a practice path silently takes back what this one gives. Until
// today nothing checked that: the v3 artifacts went a month without any practice policy, and the
// Machine Attention stage kept a stricter one nobody had re-decided.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FACES } from '../../../scripts/nightly/mirror.mjs'
import {
  PRACTICE_POLICY,
  PRACTICE_PREFIXES,
  governsLoads,
  matchesPattern,
  parseHeaders,
} from './practice-policy'

const rules = parseHeaders(readFileSync('public/_headers', 'utf8'))
/** A page some levels deep under a `_headers` prefix. */
const sample = (prefix: string) => prefix.replace('*', 'deep/er/index.html')

describe('the practices\' shared policy', () => {
  it('runs no script from another host: libraries are vendored and served from here', () => {
    // Frank's decision of 2026-09-04 stands: foreign code does not run on this site.
    const scriptSrc = PRACTICE_POLICY.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src '))!
    expect(scriptSrc.split(/\s+/).slice(1).sort()).toEqual(
      ["'self'", "'unsafe-eval'", "'unsafe-inline'", "'wasm-unsafe-eval'", 'blob:'].sort(),
    )
    const workerSrc = PRACTICE_POLICY.split(';').map((d) => d.trim()).find((d) => d.startsWith('worker-src '))!
    expect(workerSrc).toBe("worker-src 'self' blob:")
  })

  it('opens what a rich work needs: WebAssembly, workers, blobs, live data, media and frames', () => {
    for (const d of [
      "'wasm-unsafe-eval'",
      "worker-src 'self' blob:",
      "connect-src 'self' https: wss:",
      "media-src 'self' data: blob: https:",
      "img-src 'self' data: blob: https:",
      'frame-src https:',
    ]) expect(PRACTICE_POLICY).toContain(d)
  })
})

describe('public/_headers', () => {
  it('carries the shared policy, word for word, on every practice prefix', () => {
    for (const prefix of PRACTICE_PREFIXES) {
      const rule = rules.find((r) => r.pattern === prefix)
      expect(rule, `${prefix} has no rule in public/_headers`).toBeDefined()
      expect(rule!.csp, prefix).toBe(PRACTICE_POLICY)
    }
  })

  it('lets no other rule narrow a practice surface', () => {
    for (const prefix of PRACTICE_PREFIXES) {
      for (const r of rules.filter((r) => r.csp && matchesPattern(r.pattern, sample(prefix)))) {
        // The site-wide frame-ancestors policy says nothing about loads and combines with any.
        if (!governsLoads(r.csp!)) continue
        expect(r.csp, `${r.pattern} also matches ${prefix}`).toBe(PRACTICE_POLICY)
      }
    }
  })

  it('gives no path a load-governing policy except the practices\' — a new prefix cannot get the old narrow one', () => {
    // A rule here that governs loads and is not in PRACTICE_PREFIXES is either a practice surface
    // someone forgot to list (then list it, and give it the shared policy) or a house path that
    // needs its own policy (then say why, here, before it ships).
    for (const r of rules.filter((r) => r.csp && governsLoads(r.csp))) {
      expect(PRACTICE_PREFIXES, `${r.pattern} sets a load-governing CSP but is no practice prefix`).toContain(r.pattern)
      expect(r.csp, r.pattern).toBe(PRACTICE_POLICY)
    }
  })
})

describe('every path the mirrors write', () => {
  // The public/ targets named in the integrate workflows and the nightly mirror: a path that ends
  // there, optionally with a slash — `public/n-1/`, `public/field/window` — not one built from a
  // loop variable or a placeholder. The loops' targets are named literally in each workflow's
  // `git status --porcelain` line, so they are read from there.
  const WORKFLOWS = '.github/workflows'
  const TARGET = /(?<![\w./-])public\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?(?=[\s"';)|]|$)/gm
  const targets = (() => {
    const out = new Set<string>()
    const sources = [
      ...readdirSync(WORKFLOWS)
        .filter((f) => f.endsWith('-integrate.yml'))
        .map((f) => readFileSync(join(WORKFLOWS, f), 'utf8')),
      readFileSync('scripts/nightly/mirror.mjs', 'utf8'),
    ]
    for (const text of sources) for (const m of text.matchAll(TARGET)) out.add(m[2] ? `${m[1]}/${m[2]}` : m[1]!)
    out.add(`error-as-method/${FACES}`)
    return [...out].sort()
  })()

  it('finds the mirrors it is meant to guard', () => {
    for (const t of [
      'atelier/werke-html', 'atelier/window', 'atelier/presentations', 'field/artifacts', 'studio/closing-report',
      'plenum/werke-html', 'n-1', 'arch', 'attention', 'error-as-method', 'error-as-method/works-html',
    ]) expect(targets).toContain(t)
  })

  it('serves every one of them under the shared policy, and under nothing narrower', () => {
    for (const t of targets) {
      const path = `/${t}/deep/er/index.html`
      const applying = rules.filter((r) => r.csp && governsLoads(r.csp) && matchesPattern(r.pattern, path))
      expect(applying.length, `/${t}/ is mirrored by a practice but has no practice policy in public/_headers`).toBeGreaterThan(0)
      for (const r of applying) expect(r.csp, `${r.pattern} over /${t}/`).toBe(PRACTICE_POLICY)
    }
  })
})

// Guards the DE-Abbau + /lab retirement (site-v2 work order §7): every route removed on this
// branch must have a covering entry in public/_redirects, checked statically against the real
// file — not against a hand-maintained duplicate list that could silently drift from what
// Cloudflare actually serves. See docs/redirect-matrix-site-v2.md for the full, human-readable
// table this test is the machine-checked half of.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const REDIRECTS_PATH = fileURLToPath(new URL('../../public/_redirects', import.meta.url))
const raw = readFileSync(REDIRECTS_PATH, 'utf8')

interface Rule {
  from: string
  to: string
  code: string
}

function parseRedirects(text: string): Rule[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const [from, to, code] = line.split(/\s+/)
      return { from, to, code }
    })
}

/** A route is "covered" if some rule matches it exactly, or a `/prefix/*` rule matches its
 * prefix. Order doesn't matter for this check — it only asks "does SOME rule catch this route",
 * not "which one fires first" (that's the redirect-matrix doc's job, for the hop-count notes). */
function isCovered(path: string, rules: Rule[]): boolean {
  return rules.some((rule) => {
    if (rule.from.endsWith('/*')) {
      const prefix = rule.from.slice(0, -1) // keep the trailing slash, drop the star
      return path === prefix.slice(0, -1) || path.startsWith(prefix)
    }
    return path === rule.from
  })
}

// The 42 removed src/pages/de/** routes, site-v2 work order §6/§7 — dynamic routes
// ([slug]/[datum]) stand in for a real, representative example path, since redirects match
// concrete URLs, not route source patterns. Kept as a literal list (not derived from the
// filesystem, which no longer has these files after their removal) — this list, together with
// docs/redirect-matrix-site-v2.md, IS the record of what used to exist.
const WERKE_SUBPAGES = [
  'beifang',
  'consensus',
  'correction',
  'ghost-fleet',
  'parallaxe',
  'pattern',
  'praemie',
  'protokoll',
  'redaction',
  'round-number',
  'spielraum',
  'tell',
]

const REMOVED_DE_ROUTES = [
  '/de',
  '/de/about',
  '/de/atelier',
  '/de/atelier/cockpit',
  '/de/atlas',
  '/de/beifang',
  '/de/consensus',
  '/de/contact',
  '/de/correction',
  '/de/datenschutz',
  '/de/ghost-fleet',
  '/de/impressum',
  '/de/lab',
  '/de/lab/ueberflug-studie',
  '/de/lab/an-example-slug', // stands in for the (currently empty) dynamic [slug] route
  '/de/parallaxe',
  '/de/pattern',
  '/de/plenum',
  '/de/praemie',
  '/de/protokoll',
  '/de/protokoll/archiv',
  '/de/protokoll/feed.xml',
  '/de/protokoll/2026-07-15', // stands in for the dynamic [datum] route
  '/de/redaction',
  '/de/round-number',
  '/de/spielraum',
  '/de/tell',
  '/de/werke',
  ...WERKE_SUBPAGES.map((slug) => `/de/werke/${slug}`),
  '/de/work',
  '/de/work/datavism', // stands in for the dynamic [slug] route
]

describe('removed DE routes are covered by public/_redirects', () => {
  const rules = parseRedirects(raw)

  it.each(REMOVED_DE_ROUTES)('%s', (route) => {
    expect(isCovered(route, rules)).toBe(true)
  })
})

describe('the retired /lab collection index', () => {
  const rules = parseRedirects(raw)

  it('redirects to /holdings', () => {
    const labRule = rules.find((r) => r.from === '/lab')
    expect(labRule?.to).toBe('/holdings')
  })

  it('is an exact rule (no wildcard), so it never swallows /lab/ueberflug-studie or /lab/[slug]', () => {
    const labRule = rules.find((r) => r.from === '/lab')
    expect(labRule).toBeDefined()
    expect(labRule!.from.endsWith('/*')).toBe(false)
  })

  it('does not redirect /lab/ueberflug-studie (the page stays live)', () => {
    expect(isCovered('/lab/ueberflug-studie', rules)).toBe(false)
  })
})

// Routen englisch (2026-07-16, Frank): /encounters und /holdings sind kanonisch; die deutschen
// Ökologie-Pfade müssen abgedeckt sein, samt Unterseiten.
const REMOVED_GERMAN_ECOLOGY_ROUTES = [
  '/begegnungen',
  '/begegnungen/enc-2026-001',
  '/bestaende',
]

describe('German ecology routes are covered and point at the English canonicals', () => {
  const rules = parseRedirects(raw)

  it.each(REMOVED_GERMAN_ECOLOGY_ROUTES)('%s', (route) => {
    expect(isCovered(route, rules)).toBe(true)
  })

  it('/begegnungen goes to /encounters, /bestaende to /holdings', () => {
    expect(rules.find((r) => r.from === '/begegnungen')?.to).toBe('/encounters')
    expect(rules.find((r) => r.from === '/bestaende')?.to).toBe('/holdings')
  })
})

describe('the interim /akte record redirect (middle-web app not deployed yet)', () => {
  const rules = parseRedirects(raw)

  it('covers the record links the encounter export carries', () => {
    expect(isCovered('/akte/encounters/enc-2026-001-calibration-gap-travels', rules)).toBe(true)
    expect(isCovered('/akte/encounters/enc-2026-001-calibration-gap-travels/compare', rules)).toBe(true)
  })

  it('is temporary (302) and points at the public record on GitHub', () => {
    const akte = rules.find((r) => r.from === '/akte/*')
    expect(akte?.code).toBe('302')
    expect(akte?.to).toContain('github.com/frankbueltge/research-ecology')
  })
})

describe('every parsed rule', () => {
  const rules = parseRedirects(raw)

  it('is a well-formed three-column line (from, to, status)', () => {
    expect(rules.length).toBeGreaterThan(0)
    for (const r of rules) {
      expect(r.from.startsWith('/')).toBe(true)
      expect(r.to.length).toBeGreaterThan(0)
      expect(r.code).toMatch(/^\d{3}$/)
    }
  })

  it('uses permanent (301) redirects — except the declared-interim /akte rule (302)', () => {
    for (const r of rules) {
      if (r.from === '/akte/*') {
        expect(r.code).toBe('302')
      } else {
        expect(r.code).toBe('301')
      }
    }
  })
})

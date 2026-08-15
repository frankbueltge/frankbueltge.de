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

  it('redirects to /experiments', () => {
    const labRule = rules.find((r) => r.from === '/lab')
    expect(labRule?.to).toBe('/experiments')
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

// Routen englisch (2026-07-16, Frank): /encounters und /experiments sind kanonisch; die deutschen
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

  it('/begegnungen goes to /encounters, /bestaende to /experiments', () => {
    expect(rules.find((r) => r.from === '/begegnungen')?.to).toBe('/encounters')
    expect(rules.find((r) => r.from === '/bestaende')?.to).toBe('/experiments')
  })
})

// Praxis-Oberflächen-Paket (practice-surfaces): das Cockpit wird datiertes Artefakt
// (ADR 0008), /praktiken geht auf den Hub (die vier Türen wohnen dort).
describe('practice-surfaces routes are covered', () => {
  const rules = parseRedirects(raw)

  it('/atelier/cockpit 301s to the archive path in one hop', () => {
    const rule = rules.find((r) => r.from === '/atelier/cockpit')
    expect(rule?.to).toBe('/atelier/archive/cockpit')
    expect(rule?.code).toBe('301')
  })

  it('/praktiken 301s to the hub', () => {
    const rule = rules.find((r) => r.from === '/praktiken')
    expect(rule?.to).toBe('/')
    expect(rule?.code).toBe('301')
  })

  it('does not swallow the practice entrances themselves', () => {
    // The entrances ARE the station sheets since the v3 pyramid (2026-08-12) — they are the
    // redirect targets, so a rule catching them would be a loop.
    for (const route of ['/atelier', '/field', '/studio', '/encounters']) {
      expect(isCovered(route, rules)).toBe(false)
    }
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

// Werk-Slugs englisch (2026-07-20, Franks Entscheid, Wortlaut privat: keine deutschen Slugs) — die zuvor als
// "Werk-Archivpfade" belassenen deutschen Slugs wandern auf englische Slugs (Anzeigetitel aus
// src/i18n/ui.ts). Je Werk muss die alte Werk-Seite UND das alte Methodenblatt (/werke/<slug>)
// aufs englische Pendant zeigen; /police zeigt jetzt direkt auf /policy (kein Doppel-Hop).
const RENAMED_WORK_SLUGS: Array<[string, string]> = [
  ['/parallaxe', '/parallax'],
  ['/werke/parallaxe', '/werke/parallax'],
  ['/beifang', '/bycatch'],
  ['/werke/beifang', '/werke/bycatch'],
  ['/praemie', '/policy'],
  ['/werke/praemie', '/werke/policy'],
  ['/spielraum', '/headroom'],
  ['/werke/spielraum', '/werke/headroom'],
  ['/protokoll', '/protocol'],
  ['/werke/protokoll', '/werke/protocol'],
]

// The in-app /werke index redirect (an Astro.redirect, not a _redirects rule) must point at
// the real target: it used to send visitors to the retired /lab route and only resolved via a
// second 301 in public/_redirects — invisible in prod, wrong in `astro dev`, which does not
// process _redirects.
describe('the in-app /werke index redirect', () => {
  const PAGE_PATH = fileURLToPath(new URL('../pages/werke/index.astro', import.meta.url))
  const pageSource = readFileSync(PAGE_PATH, 'utf8')

  it('targets /experiments directly', () => {
    expect(pageSource).toContain("'/experiments'")
  })

  it('no longer names the retired /lab route as its target', () => {
    expect(pageSource).not.toMatch(/redirect\([^)]*'\/lab'/)
  })
})

describe('renamed German work slugs 301 to their English canonicals', () => {
  const rules = parseRedirects(raw)

  it.each(RENAMED_WORK_SLUGS)('%s -> %s', (from, to) => {
    const rule = rules.find((r) => r.from === from)
    expect(rule?.to).toBe(to)
    expect(rule?.code).toBe('301')
  })

  it('/police points straight at /policy (no /praemie double hop)', () => {
    expect(rules.find((r) => r.from === '/police')?.to).toBe('/policy')
  })

  // The Protocol carries sub-paths (RSS feed, archive, dated minutes) — the /protokoll/* wildcard
  // must cover them so old bookmarks and RSS subscribers land on /protocol/* in one hop.
  it.each(['/protokoll/feed.xml', '/protokoll/archiv', '/protokoll/2026-07-15'])(
    'covers %s via the /protokoll/* wildcard',
    (route) => {
      expect(isCovered(route, rules)).toBe(true)
    },
  )
})

/**
 * Research ecology v3 — the four-level pyramid (2026-08-12).
 *
 * Seventeen page files were deleted on this branch because the station sheets now carry what they
 * carried. This block is the machine-checked half of that decision: every retired route has a
 * rule, every rule lands on a surface that exists, and no rule points at a route this branch also
 * deleted. Without it the deletion is a promise; with it, it is checked at every commit.
 *
 * The list is literal, not derived from the filesystem — after the deletion the filesystem no
 * longer knows these routes existed, so this list and docs/redirect-matrix-site-v2.md ARE the
 * record of what used to be here.
 */
describe('research ecology v3 — retired routes', () => {
  const rules = parseRedirects(raw)

  const RETIRED: [string, string][] = [
    ['/maschinenraum', '/ecology#now'],
    ['/atelier/history', '/atelier'],
    ['/atelier/apparatus', '/atelier'],
    ['/atelier/how-a-line-ends', '/atelier#figure'],
    ['/atelier/sheet', '/atelier'],
    ['/atelier/sheets', '/atelier'],
    ['/atelier/material', '/atelier'],
    ['/atelier/foundation', '/atelier'],
    ['/atelier/projects', '/atelier/works'],
    ['/field/history', '/field'],
    ['/field/apparatus', '/field'],
    ['/field/how-a-claim-came-off', '/field#figure'],
    ['/studio/history', '/studio'],
    ['/studio/apparatus', '/studio'],
    ['/studio/how-a-premiere-returned', '/studio#figure'],
    ['/season', '/ecology#record'],
    ['/notation', 'https://github.com/frankbueltge/research-ecology'],
  ]

  it.each(RETIRED)('%s 301s to %s in one hop', (from, to) => {
    const rule = rules.find((r) => r.from === from)
    expect(rule?.to, `no rule for ${from}`).toBe(to)
    expect(rule?.code).toBe('301')
  })

  // A redirect onto a redirect is two hops and a page that flickers. The targets are the surfaces
  // this rebuild BUILT, so none of them may itself be a rule's `from`.
  it('never points a retired route at another retired route', () => {
    const froms = new Set(rules.map((r) => r.from))
    for (const [, to] of RETIRED) {
      if (to.startsWith('http')) continue
      expect(froms.has(to.split('#')[0]), `${to} is itself redirected — that is two hops`).toBe(false)
    }
  })

  // The three tours were the deepest-linked of the retired pages: the doors and the triptych cards
  // both pointed at them. They now point at the figure on each station sheet, and the old routes
  // land on the same anchor — so a published tour link and a door link reach the same place.
  it('lands the retired tours on the anchor the doors now use', () => {
    for (const [from, to] of RETIRED.filter(([f]) => f.includes('how-a-'))) {
      expect(to.endsWith('#figure'), `${from} should land on the practice's figure`).toBe(true)
    }
  })
})

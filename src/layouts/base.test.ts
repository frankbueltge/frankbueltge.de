// Base.astro carries two `is:inline` scripts whose SHA-256 hashes are pinned by hand in
// astro.config.mjs (security.csp.scriptDirective.resources). Astro hashes its bundled module
// scripts itself; an inline script it does not. So an edit to either script — a character, a
// comment, a blank line — silently drops it out of the CSP, the browser refuses to run it, and
// nothing turns red: the anti-FOUC resolver simply stops resolving before first paint. That is
// exactly what happened once already (the hash pinned on 2026-07-07 no longer matched the
// script on main by 2026-09-02, found while wiring the ClientRouter). This test recomputes the
// hashes the way the CSP does — sha256 over the script's text, base64 — and compares.
//
// If this test fails after you edited one of the scripts: run `npm run build`, take the new
// hash from here (the failure message prints it) and replace the constant in astro.config.mjs.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const base = readFileSync(fileURLToPath(new URL('./Base.astro', import.meta.url)), 'utf8')
const config = readFileSync(fileURLToPath(new URL('../../astro.config.mjs', import.meta.url)), 'utf8')

const inlineScripts = [...base.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map((m) => m[1]!)
const pinned = [...config.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map((m) => m[1]!)
const sha256 = (text: string): string => createHash('sha256').update(text).digest('base64')

describe('the layout and the content security policy agree', () => {
  it('finds exactly the two inline scripts the CSP pins', () => {
    expect(inlineScripts).toHaveLength(2)
    expect(pinned).toHaveLength(2)
  })

  it('pins the hash of every inline script as it is written — a changed script is a blocked script', () => {
    for (const [i, text] of inlineScripts.entries()) {
      const hash = sha256(text)
      expect(
        pinned,
        `inline script #${i + 1} hashes to sha256-${hash}, which astro.config.mjs does not pin — the browser will refuse to run it`,
      ).toContain(hash)
    }
  })

  it('pins nothing that no inline script produces any more', () => {
    const produced = inlineScripts.map(sha256)
    for (const hash of pinned) {
      expect(produced, `sha256-${hash} is pinned but no inline script in Base.astro hashes to it`).toContain(hash)
    }
  })
})

describe('the page lifecycle survives a client-side navigation (re-skin 2a, 2026-09-02)', () => {
  it('mounts the ClientRouter', () => {
    expect(base).toMatch(/import \{ ClientRouter \} from 'astro:transitions'/)
    expect(base).toMatch(/<ClientRouter \/>/)
  })

  it('copies the resolved theme onto the incoming document before the swap, so a light reader never flashes dark', () => {
    expect(base).toMatch(/astro:before-swap/)
    for (const attr of ['data-theme', 'data-theme-mode', 'data-skin']) {
      expect(base, `${attr} is not carried across the swap`).toContain(`'${attr}'`)
    }
  })

  it('re-establishes theme, smooth scroll and the flash on every page load — and tears the scroll down before each swap', () => {
    expect(base).toMatch(/astro:page-load/)
    expect(base).toMatch(/lenis\.destroy\(\)/)
    expect(base).toMatch(/new Lenis\(\{[^}]*allowNestedScroll: true/)
  })

  it('persists the top bar across transitions', () => {
    const topBar = readFileSync(fileURLToPath(new URL('../components/TopBar.astro', import.meta.url)), 'utf8')
    expect(topBar).toMatch(/transition:persist=/)
  })
})

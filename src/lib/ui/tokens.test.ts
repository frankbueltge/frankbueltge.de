// The shadcn token bridge in src/styles/global.css may only ever POINT at the site's own
// tokens. This test is the guard against the two ways `npx shadcn init` (or a well-meaning
// session) would break the mono skin without anyone noticing: a second palette pasted in as
// literal values, and a `.dark {}` block that switches on a class this site never sets.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../../styles/global.css', import.meta.url)), 'utf8')

function block(css: string, opener: string): string {
  const start = css.indexOf(opener)
  if (start === -1) return ''
  let depth = 0
  for (let i = start; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(start, i + 1)
    }
  }
  return ''
}

const theme = block(css, '@theme {')
const bridge = block(css, '@theme inline {')

describe('the shadcn token bridge', () => {
  it('exists, and every bridge variable resolves to a token the site already declares', () => {
    expect(bridge, 'no `@theme inline` bridge block in global.css').not.toBe('')
    const pairs = [...bridge.matchAll(/--color-([\w-]+):\s*var\(--color-([\w-]+)\)/g)]
    expect(pairs.length).toBeGreaterThan(8)
    for (const [, name, target] of pairs) {
      expect(theme, `bridge var --color-${name} points at --color-${target}, which @theme does not declare`).toMatch(
        new RegExp(`--color-${target}:`),
      )
    }
  })

  it('carries no literal colour — the bridge points, it never paints', () => {
    expect(bridge).not.toMatch(/#[0-9a-fA-F]{3,8}\b|oklch\(|rgb\(|hsl\(/)
  })

  it('defines neither a destructive nor a chart nor a sidebar slot', () => {
    // status colours are taboo where the practice does not judge; figures ink themselves from
    // their own PALETTE-marked stylesheets, never from a shared chart palette
    expect(bridge).not.toMatch(/--color-destructive|--color-chart-|--color-sidebar-/)
  })

  it('switches dark mode on <html data-theme>, never on a .dark class', () => {
    expect(css).toMatch(/@custom-variant dark \(&:where\(\[data-theme='dark'\], \[data-theme='dark'\] \*\)\);/)
    expect(css).not.toMatch(/^\s*\.dark\s*\{/m)
  })

})

// Re-skin 2a (2026-09-02): the frame's own scales. They were decided, not inherited, and this
// guard keeps a later `npx shadcn` run from quietly putting Tailwind's or shadcn's defaults back.
const light = block(css, ":root[data-skin][data-theme='light'] {")

describe('the frame tokens of the re-skin', () => {
  it('declares the radius scale that was decided — eight rungs, tighter than the default at every one', () => {
    const rungs: Record<string, string> = {
      xs: '0.125rem', sm: '0.1875rem', md: '0.3125rem', lg: '0.4375rem',
      xl: '0.625rem', '2xl': '0.875rem', '3xl': '1.25rem', '4xl': '1.625rem',
    }
    for (const [rung, value] of Object.entries(rungs)) {
      expect(theme, `--radius-${rung} is not ${value}`).toMatch(new RegExp(`--radius-${rung}:\\s*${value.replace('.', '\\.')};`))
    }
    // shadcn's `--radius` base variable would re-derive the rungs from one number; the house sets each rung itself
    expect(theme).not.toMatch(/--radius:\s/)
  })

  it('declares the type scale with a line height per step', () => {
    for (const step of ['display', 'h1', 'h2', 'h3', 'body', 'small', 'mono', 'mono-sm', 'mono-xs']) {
      expect(theme, `--text-${step} missing`).toMatch(new RegExp(`--text-${step}:`))
      expect(theme, `--text-${step}--line-height missing`).toMatch(new RegExp(`--text-${step}--line-height:`))
    }
  })

  it('paints depth and the second hairline in BOTH themes — a token declared once is a token the light theme inherits from the dark', () => {
    for (const token of ['--color-line-lift', '--elev-rest', '--elev-lift', '--elev-float']) {
      expect(css, `${token} missing from the dark declarations`).toMatch(new RegExp(`${token}:`))
      expect(light, `${token} missing from the light theme block`).toMatch(new RegExp(`${token}:`))
    }
  })

  it('gives hand-written CSS a --color-ring to read (the @theme inline bridge emits nothing to :root)', () => {
    expect(css).toMatch(/^\s*--color-ring:\s*var\(--color-accent\);/m)
  })

  it('keeps every page transition and hover gesture still under reduced motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{[^}]*::view-transition-old\(root\)/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.lift:hover/)
  })
})

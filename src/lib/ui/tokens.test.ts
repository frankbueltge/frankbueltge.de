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

  it('leaves the radius scale alone until it is decided deliberately (plan, Phase 2a)', () => {
    expect(css).not.toMatch(/--radius(-\w+)?:/)
  })
})

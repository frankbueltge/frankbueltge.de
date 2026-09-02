// cn() must know the house's type scale (re-skin 2c, 2026-09-02). Without this, tailwind-merge
// files `text-h1` and `text-mono-sm` under "text colour" and drops them the moment a colour
// follows — which is how every head cut through cn() rendered at 16 px for a day.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { cn, TYPE_SCALE_STEPS } from './cn'

describe('cn() and the type scale', () => {
  it('keeps a type-scale step beside a text colour — size and colour are different groups', () => {
    expect(cn('max-w-4xl text-h1 font-semibold text-fg')).toBe('max-w-4xl text-h1 font-semibold text-fg')
    expect(cn('h-7 px-2 font-mono text-mono-sm font-normal text-fg-muted hover:text-fg')).toContain('text-mono-sm')
    expect(cn('mt-3 max-w-2xl text-body text-fg-muted')).toContain('text-body')
  })

  it('still lets a later size win over an earlier one, so a consumer can override a primitive', () => {
    expect(cn('text-sm text-mono-sm')).toBe('text-mono-sm')
    expect(cn('text-h2 text-h1')).toBe('text-h1')
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('lists every step the stylesheet declares — a new rung is added in both places', () => {
    const css = readFileSync(fileURLToPath(new URL('../../styles/global.css', import.meta.url)), 'utf8')
    const declared = [...css.matchAll(/^\s*--text-([a-z0-9-]+):\s/gm)]
      .map((m) => m[1]!)
      .filter((s) => !s.includes('--'))
    expect([...new Set(declared)].sort()).toEqual([...TYPE_SCALE_STEPS].sort())
  })
})

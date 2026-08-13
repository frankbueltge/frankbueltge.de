// The refrain score defines the Atelier tokens it needs on its own root, so that it renders
// wherever it is mounted and not only inside an Atelier room. That restatement is a copy, and a
// copy drifts — so this test holds the two files to the same values.
//
// The bug it descends from, 2026-08-13: the score was mounted on the ecology's station sheet,
// which carries a different grammar and none of these tokens. Nothing failed. `stroke:
// var(--at-hairline)` with the token missing is invalid at computed-value time, so `stroke` takes
// its initial value — and for SVG that is `none`. Every stave, tie and rest stopped being drawn.
// An undefined custom property does not warn; it erases.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const sheet = readFileSync('src/styles/atelier-sheet.css', 'utf8')
const refrain = readFileSync('src/styles/atelier-refrain.css', 'utf8')

/** Every `--token: value` inside the block that follows a selector containing `needle`. */
function tokensIn(css: string, needle: string): Record<string, string> {
  const at = css.indexOf(needle)
  if (at < 0) return {}
  const open = css.indexOf('{', at)
  const close = css.indexOf('}', open)
  const out: Record<string, string> = {}
  for (const m of css.slice(open, close).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

// The tokens the score actually reads. Not every token the rooms define — only what would break.
const SHARED = ['--at-surface', '--at-ink', '--at-ink-2', '--at-h1-ink', '--at-hairline', '--at-thread', '--at-graphite', '--at-badge-bg']

describe('the score’s copy of the Atelier grammar', () => {
  for (const theme of ['light', 'dark']) {
    it(`matches atelier-sheet.css in ${theme}`, () => {
      const room = tokensIn(sheet, `:root[data-theme='${theme}'] .atelier-surface`)
      const figure = tokensIn(refrain, `:root[data-theme='${theme}'] .at-rf`)
      expect(Object.keys(room).length, 'the room’s token block moved — this test is reading the wrong place').toBeGreaterThan(5)
      for (const token of SHARED) {
        expect(figure[token], `${token} is missing from the score in ${theme}`).toBeDefined()
        expect(figure[token], `${token} drifted: the score would recolour itself inside its own practice’s room`).toBe(room[token])
      }
    })
  }

  it('reads no Atelier token it does not define', () => {
    // The check that would have caught the original bug: every var(--at-…) the score uses must be
    // one this file sets, or the figure depends on its host again — silently, and only outside the
    // rooms where it was written.
    const used = new Set([...refrain.matchAll(/var\((--at-[\w-]+)/g)].map((m) => m[1]))
    const defined = new Set([
      ...Object.keys(tokensIn(refrain, ":root[data-theme='dark'] .at-rf")),
      ...Object.keys(tokensIn(refrain, '.at-rf {')),
    ])
    const orphans = [...used].filter((t) => !defined.has(t))
    expect(orphans, `the score reads tokens it does not define: ${orphans.join(', ')}`).toEqual([])
  })
})

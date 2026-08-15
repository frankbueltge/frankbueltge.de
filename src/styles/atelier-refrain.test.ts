// The refrain score defines the tokens it needs on its own root, so that it renders wherever it
// is mounted and never depends on its host's grammar. That restatement is a copy, and a copy
// drifts — so this test holds it to the ground it actually sits on.
//
// The bug it descends from, 2026-08-13: the score was mounted on the ecology's station sheet,
// which carried none of its tokens. Nothing failed. `stroke: var(--at-hairline)` with the token
// missing is invalid at computed-value time, so `stroke` takes its initial value — for SVG that
// is `none`. Every stave, tie and rest stopped being drawn. An undefined custom property does
// not warn; it erases.
//
// WHICH ground changed on 2026-08-16. Until then the copy restated atelier-sheet.css (the cream
// rooms), held byte-identical here — but the pyramid migration of 2026-08-15 retired that chrome
// from every Atelier room, and the score's one remaining host is the ecology's station sheet,
// where the cream card read as last month's design (Frank's finding, wording private). The copy
// now restates ecology-pyramid.css, and this test holds THAT pairing instead: each --at-* token
// the score carries must equal the eco token it stands in for, per theme.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const eco = readFileSync('src/styles/ecology-pyramid.css', 'utf8')
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

/** Which eco token each of the score's tokens stands in for. Renaming the score's own vars
 *  wholesale would churn 300 lines of stylesheet for no reader-visible change; the mapping is
 *  the contract instead, and it is asserted. */
const STANDS_FOR: Record<string, string> = {
  '--at-surface': '--eco-panel-solid',
  '--at-ink': '--eco-fg',
  '--at-ink-2': '--eco-muted',
  '--at-h1-ink': '--eco-fg',
  '--at-hairline': '--eco-line',
  '--at-thread': '--eco-accent',
  '--at-graphite': '--eco-faint',
  '--at-badge-bg': '--eco-bg',
}

describe('the score’s copy of the ecology grammar', () => {
  for (const theme of ['light', 'dark'] as const) {
    it(`matches ecology-pyramid.css in ${theme}`, () => {
      const ground = tokensIn(eco, `:root[data-theme='${theme}'] .eco`)
      const figure = tokensIn(refrain, `:root[data-theme='${theme}'] .at-rf`)
      expect(Object.keys(ground).length, 'the eco token block moved — this test is reading the wrong place').toBeGreaterThan(5)
      for (const [token, standsFor] of Object.entries(STANDS_FOR)) {
        expect(figure[token], `${token} is missing from the score in ${theme}`).toBeDefined()
        expect(
          figure[token],
          `${token} drifted from ${standsFor}: the score would recolour itself on the station sheet it hangs on`,
        ).toBe(ground[standsFor])
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

// A term's arc, rendered on the server (visual layer, 2026-09-03).
//
// Duty 2 of docs/design/2026-09-02-the-visual-layer.md §3. Like the audience strip, this island
// replaced a build-time drawing, so the `.tt-*` class vocabulary of src/styles/trending-figures.css
// is asserted here — and so is the one thing the island added: the brackets appear only once the
// archive can carry the comparison, and are absent, without excuse or placeholder, before that.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { arcModel } from '@/lib/trending/arc'

import TrendingArc, { type ArcWording } from './TrendingArc'

const wording: ArcWording = {
  figureLabel: 'Bars: mentions of this term per committed run.',
  mentionsWord: 'mentions',
  perRunWord: 'per run',
  recentLabel: 'last 7 runs',
  priorLabel: 'the 21 before',
}

const runs = (n: number, at: Record<number, number> = {}) =>
  Array.from({ length: n }, (_, i) => ({ date: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`, d1: at[i] ?? 2 }))

const render = (points: { date: string; d1: number }[]) =>
  renderToStaticMarkup(
    <TrendingArc model={arcModel(points)} wording={wording} id="trending-arc" readoutId="trending-arc-readout" />,
  )

describe('the arc, rendered on the server', () => {
  it('is deterministic, and carries no style attribute or hex', () => {
    // \x22 rather than a literal quote, so this line does not itself trip drift-check rule 3.
    expect(render(runs(9))).toBe(render(runs(9)))
    expect(render(runs(9))).not.toMatch(/ style=\x22/)
    expect(render(runs(9))).not.toMatch(/ style=\{/)
    expect(render(runs(9))).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it("keeps the class vocabulary the stylesheet inks — the strip's own drawing, unchanged", () => {
    const html = render(runs(9))
    for (const cls of ['tt-baseline', 'tt-mark', 'tt-axis', 'tt-bar']) {
      expect(html, `${cls} is gone`).toContain(cls)
    }
  })

  it('draws one bar per committed run, each with its own count as a native title', () => {
    const html = render(runs(5, { 0: 7 }))
    expect(html.match(/class="tt-bar"/g) ?? []).toHaveLength(5)
    expect(html).toContain('<title>2026-09-01: 7 mentions</title>')
  })

  it('draws a measured zero as a hairline, because a measurement is not an absence', () => {
    // seriesStrip gives a zero-count run height 1 rather than 0 — asserted in terms-view.test.ts;
    // what matters here is that the bar exists in the markup at all.
    const html = render(runs(3, { 1: 0 }))
    expect(html).toContain('<title>2026-09-02: 0 mentions</title>')
    expect(html.match(/class="tt-mark"/g) ?? []).toHaveLength(3)
  })

  it('draws no window bracket while the archive is too short to carry the comparison', () => {
    const html = render(runs(10))
    expect(html).not.toContain('tt-win')
    expect(html).not.toContain('last 7 runs')
  })

  it('brackets both windows the moment the archive is long enough, with their own per-run figures', () => {
    const at: Record<number, number> = {}
    for (let i = 21; i < 28; i++) at[i] = 10
    const html = render(runs(28, at))
    expect(html).toContain('tt-win-recent')
    expect(html).toContain('last 7 runs · 10 per run')
    expect(html).toContain('the 21 before · 2 per run')
  })

  it('gives every bar a keyboard stop and names the drawing', () => {
    const html = render(runs(4))
    expect(html.match(/tabindex="0"/g) ?? []).toHaveLength(4)
    expect(html).toContain(`aria-label="${wording.figureLabel}"`)
  })

  it('declares no entrance on the server', () => {
    expect(render(runs(4))).not.toContain('tt-enter')
  })

  it('hands the width bucket to the stylesheet instead of deciding a width itself', () => {
    expect(render(runs(2))).toContain('data-span="short"')
    expect(render(runs(12))).toContain('data-span="mid"')
    expect(render(runs(30))).toContain('data-span="full"')
    expect(render(runs(4)), 'the island types a width of its own again').not.toContain('max-w-')
  })

  it('stands up to a term no run has carried yet', () => {
    const html = render([])
    expect(html).toContain('tt-baseline')
    expect(html).not.toContain('class="tt-bar"')
  })
})

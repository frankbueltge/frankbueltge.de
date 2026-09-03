// The convergence matrix's server render is the floor of the figure (visual layer, 2026-09-03).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): the markup Astro renders on the server is the complete no-JS figure —
// deterministic, free of style attributes, and carrying every link and every native title before
// a script has run. What hydration adds is the column filter, the readout, the card and the
// keyboard walk; what it must never add is the figure itself.
//
// This file also holds the one thing the model alone cannot: that the DRAWING says what the model
// counted. A row's marks are its platform count in converge.test.ts; here it is asserted that the
// grid actually renders that many, with the source's own words on each.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { convergeModel } from '@/lib/trending/converge'
import { fixtureDay } from '@/lib/trending/fixtures'
import type { TrendingDay } from '@/lib/trending/types'

import TrendingConvergence, { type ConvergenceWording } from './TrendingConvergence'

const wording: ConvergenceWording = {
  figureLabel: 'A grid of the topics two or more sources carried this morning.',
  columnsLabel: 'The sources carrying them',
  carriedWord: 'carried',
  sourcesWord: 'sources',
  card: {
    platformsLabel: 'Sources',
    firstSeenLabel: 'first seen',
    daysHotLabel: 'mornings held',
    signalsLabel: 'What each source called it',
    headlinesLabel: 'Headlines the run kept',
    open: 'Open the topic',
    close: 'Close',
    hint: 'Arrow keys walk the row · Esc closes',
  },
}

/** The shared fixture already carries one converging topic (two sources) and one solo topic. */
const day: TrendingDay = fixtureDay()
const model = convergeModel(day)

const render = (m = model) =>
  renderToStaticMarkup(
    <TrendingConvergence model={m} wording={wording} id="trending-converge" readoutId="trending-converge-readout" />,
  )

describe('the convergence matrix, rendered on the server', () => {
  it('is deterministic — the same model gives byte-identical markup', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 rather than a literal quote, so this line does not itself trip the drift check
    // (the house convention — see MiddleScore.test.tsx).
    const html = render()
    expect(html).not.toMatch(/ style=\x22/)
    expect(html).not.toMatch(/ style=\{/)
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('draws the whole grid before any script runs', () => {
    const html = render()
    // one cell per mark, one head and one guide per column
    const cells = html.match(/class="tr-cv-cell"/g) ?? []
    expect(cells).toHaveLength(model.rows.flatMap((r) => r.marks).length)
    for (const column of model.columns) {
      expect(html).toContain(column.label)
    }
  })

  it("letters every row's own count, which is the claim the page makes about it", () => {
    const html = render()
    for (const row of model.rows) {
      expect(html).toContain(row.labelShort)
      expect(html).toContain(`>${row.platformCount}<`)
    }
  })

  it("carries each source's own label and signal as a native title, reachable without JavaScript", () => {
    const html = render()
    for (const mark of model.rows.flatMap((r) => r.marks)) {
      expect(html).toContain(`<title>${mark.detail} — ${mark.label}</title>`)
    }
  })

  it('renders a topic\'s destination as a real link, not a click handler', () => {
    const withArticle = convergeModel(
      fixtureDay({
        topics: [
          {
            ...day.topics[0]!,
            wikipedia: { lang: 'en', article: 'United States Postal Service', views: 10 },
          },
        ],
      }),
    )
    const html = render(withArticle)
    expect(html).toContain('href="https://en.wikipedia.org/wiki/United_States_Postal_Service"')
    expect(html).toContain('rel="noopener nofollow"')
  })

  it('gives every mark a keyboard stop and a name a screen reader can read', () => {
    const html = render()
    const stops = html.match(/tabindex="0"/g) ?? []
    expect(stops).toHaveLength(model.rows.flatMap((r) => r.marks).length)
    for (const mark of model.rows.flatMap((r) => r.marks)) {
      expect(html).toContain(`aria-label="${mark.label} — ${mark.detail}"`)
    }
  })

  it('names the whole drawing, so a screen reader is not handed a bare grid', () => {
    expect(render()).toContain(`aria-label="${wording.figureLabel}"`)
  })

  it('declares no entrance on the server — the marks land only once the island is mounted', () => {
    // `tr-cv-enter` is the class the stylesheet gates the landing gesture on; rendered on the
    // server it must be absent, or a visitor without JavaScript would be left with the
    // animation's starting frame (opacity 0) as their whole figure.
    expect(render()).not.toContain('tr-cv-enter')
    expect(render()).toContain('class="tr-cv"')
  })

  it('opens no card on the server, and so needs no shadcn runtime to be readable', () => {
    expect(render()).not.toContain('data-slot="card"')
  })

  it('draws nothing at all on a morning without a crossing', () => {
    const empty = convergeModel(fixtureDay({ topics: [day.topics[1]!] }))
    const html = render(empty)
    expect(html).not.toContain('tr-cv-cell')
    expect(html).toContain('class="tr-cv"')
  })
})

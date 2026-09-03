// The audience strip's server render is the floor of the figure (visual layer, 2026-09-03).
//
// Duty 2 of docs/design/2026-09-02-the-visual-layer.md §3: the markup Astro renders on the server
// is the complete no-JS figure. This one has a second obligation on top, because it REPLACED a
// build-time drawing rather than adding one: the class vocabulary is the contract with
// src/styles/trending-figures.css, and the drawing a visitor gets today must be the drawing they
// got on 2026-09-01. Every class the old figure wrote is asserted here.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { fixtureAudience } from '@/lib/trending/fixtures'
import { AUDIENCE_CLASSES } from '@/lib/trending/types'
import { audienceStrip } from '@/lib/trending/view'

import TrendingAudienceStrip, { type AudienceStripWording } from './TrendingAudienceStrip'

const wording: AudienceStripWording = {
  figureLabel: 'Stacked bars: requests to /trending per day.',
  legendLabel: 'The audience classes, as a filter',
  standby: 'standby (no edge count)',
  requestsWord: 'requests',
}

const days = [
  fixtureAudience({ day: '2026-09-01' }),
  fixtureAudience({ day: '2026-09-02' }),
  // a day the edge could not count: a hollow tick, never a zero
  fixtureAudience({
    day: '2026-09-03',
    edge: { ...fixtureAudience().edge, status: 'unavailable', note: 'no token', classes: null, total: 0 },
  }),
]
const model = audienceStrip(days, 30)

const render = (m = model) =>
  renderToStaticMarkup(
    <TrendingAudienceStrip model={m} wording={wording} id="trending-audience" readoutId="trending-audience-readout" />,
  )

describe('the audience strip, rendered on the server', () => {
  it('is deterministic, and carries no style attribute or hex', () => {
    // \x22 rather than a literal quote, so this line does not itself trip drift-check rule 3.
    expect(render()).toBe(render())
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render()).not.toMatch(/ style=\{/)
    expect(render()).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('keeps the class vocabulary the stylesheet inks — the drawing of 2026-09-01, unchanged', () => {
    const html = render()
    for (const cls of AUDIENCE_CLASSES) {
      expect(html, `the fill of ${cls} is gone`).toContain(`tra-seg-${cls}`)
    }
    for (const cls of ['tra-baseline', 'tra-axis', 'tra-bar', 'tra-standby', 'tra-legend']) {
      expect(html, `${cls} is gone`).toContain(cls)
    }
  })

  it('carries the six fill patterns, because a fill of url(#…) needs its pattern in the document', () => {
    const html = render()
    for (const id of ['tra-p-search', 'tra-p-ai-retrieval', 'tra-p-ai-user-fetch', 'tra-p-ai-training', 'tra-p-other-bot']) {
      expect(html).toContain(`id="${id}"`)
    }
  })

  it('draws a day the edge could not count as a hollow tick and says so, never as a zero', () => {
    const html = render()
    expect(html).toContain('class="tra-standby"')
    expect(html).toContain('<title>2026-09-03: standby (no edge count)</title>')
    expect(html).not.toContain('2026-09-03: 0 requests')
  })

  it('spells a counted day whole in its native title, class by class', () => {
    expect(render()).toContain(
      '<title>2026-09-01: 120 requests — browsers 50, search crawlers 30, AI retrieval bots 20, AI user fetches 10, AI training crawlers 5, other bots 5</title>',
    )
  })

  it('renders the legend as real buttons in their resting state, all classes on', () => {
    const html = render()
    const pressed = html.match(/aria-pressed="false"/g) ?? []
    expect(pressed).toHaveLength(AUDIENCE_CLASSES.length)
    expect(html).not.toContain('aria-pressed="true"')
    expect(html).not.toContain('data-off')
  })

  it('gives every bar a keyboard stop', () => {
    const stops = render().match(/tabindex="0"/g) ?? []
    expect(stops).toHaveLength(model.bars.length)
  })

  it('declares no entrance on the server, so a no-JS reader never sees the first frame alone', () => {
    expect(render()).not.toContain('tra-enter')
  })

  it('hands the width bucket to the stylesheet instead of deciding a width itself', () => {
    // Three counted days is a young archive: the strip draws small rather than stretching two
    // bars across the column (the defect this bucket exists for).
    expect(render()).toContain('data-span="short"')
    expect(render()).toContain('class="tr-strip"')
    expect(render(), 'the island types a width of its own again').not.toContain('max-w-')
  })

  it('stands up to an empty window', () => {
    const html = render(audienceStrip([], 30))
    expect(html).toContain('tra-baseline')
    expect(html).not.toContain('class="tra-bar"')
  })
})

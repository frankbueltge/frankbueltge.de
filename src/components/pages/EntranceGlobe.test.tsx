import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import EntranceGlobe, { parseInk, type SkyWording } from './EntranceGlobe'

const WORDING: SkyWording = {
  readout: { satellite: '{name} · {group} · {owner}', gap: '{vessel} · {hours} h dark · {waters}' },
  groups: { resource: 'resource', sar: 'radar', weather: 'weather' },
  status: { loading: 'loading', live: 'live', still: 'still', noWebgl: 'no webgl', failed: 'failed' },
}
const FLOOR = '<svg class="sky-floor-svg" viewBox="0 0 960 480"><title id="t">the sky</title><circle class="sky-sat" cx="1" cy="2" r="1.7"/></svg>'

const render = () =>
  renderToStaticMarkup(
    <EntranceGlobe
      floorSvg={FLOOR}
      wording={WORDING}
      readoutId="sky-readout"
      figureId="entrance-globe"
      modelUrl="/globe/model.json"
      landUrl="/globe/land.json"
    />,
  )

describe('the entrance globe, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries the build-time plate in the HTML before any script runs, and says nothing about loading yet', () => {
    const html = render()
    expect(html).toContain('<svg class="sky-floor-svg"')
    expect(html).toContain('data-phase="floor"')
    expect(html).toMatch(/<p class="sky-status" aria-live="polite"><\/p>/)
  })

  it('sets no style attribute — placement and sizing belong to the stylesheet and setVars', () => {
    // written with \x22 so drift-check rule 3, which scans test sources too, does not read the
    // assertion itself as an inline style attribute (the partitur's test does the same)
    expect(render()).not.toMatch(/ style=\x22/)
  })

  it('keeps the canvas out of the accessibility tree; the plate stays the figure', () => {
    const html = render()
    expect(html).toMatch(/<div class="sky-canvas" aria-hidden="true">/)
    expect(html).not.toMatch(/sky-floor[^>]*aria-hidden/)
  })
})

describe('reading the room’s ink', () => {
  it('parses the three shapes a token takes on this site', () => {
    expect(parseInk('#7fd0e8')).toEqual([127, 208, 232])
    expect(parseInk(' #fff ')).toEqual([255, 255, 255])
    expect(parseInk('rgba(13, 21, 19, 0.7)')).toEqual([13, 21, 19])
    expect(parseInk('194 194 200')).toEqual([194, 194, 200])
  })

  it('refuses what it cannot read instead of guessing', () => {
    expect(parseInk('')).toBeNull()
    expect(parseInk('var(--nothing)')).toBeNull()
  })
})

// The living globe's island, held to the four promises it makes before any script runs and to the
// three it makes after. The entrance globe's own assertions of 2026-09-02 moved here onto the
// COMPACT path when EntranceGlobe.tsx was replaced (G1, 2026-09-03) — the front door and the room
// are one island now, and what was true of the hero must stay true of it.
//
// This repository carries no jsdom or happy-dom (see runtime.ts's header), so the rules that live
// inside effects — one fetch per layer ever, the day axis starting at the newest day, no walk
// under reduced motion, who owns ←/→ while a card is open — are exported as pure functions and
// tested as such, rather than asserted in a comment above an effect nobody can run.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'

import { GLOBE } from '@/config/globe-wording'
import {
  activatePanel,
  dispatchPanelKey,
  isPanelActive,
  resetPanelRegistry,
  type PanelKeyHandlers,
} from '@/lib/dataviz/stepper'
import type { GlobeManifest } from '@/lib/globe/feeds'
import LivingGlobe, { emphasisFor, layersToFetch, newestDayIndex, parseInk, playAdvances, scrubberYields } from './LivingGlobe'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const DAYS = ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02']

const MANIFEST: GlobeManifest = {
  _: 'a fixture, not the archive',
  asOf: DAYS[DAYS.length - 1],
  days: DAYS,
  layers: [
    {
      id: 'sky',
      title: 'Sky',
      kind: 'points',
      owner: { line: 'watchers' },
      asOf: '2026-09-02',
      source: { file: 'src/data/ueberflug/satellites.json', name: 'CelesTrak', url: 'https://celestrak.org/', license: 'free redistribution' },
      days: DAYS,
      counts: { '2026-09-02': 341 },
      total: 341,
      bytes: 1024,
      href: '/globe/layers/sky.json',
    },
    {
      id: 'ghost-fleet',
      title: 'Ghost Fleet',
      kind: 'arcs',
      owner: { line: 'counter-measurement' },
      asOf: '2026-09-02',
      source: { file: 'src/data/ghost-fleet/<day>.json', name: 'Global Fishing Watch', url: 'https://globalfishingwatch.org/', license: 'CC BY-SA' },
      days: DAYS,
      counts: { '2026-09-02': 12 },
      total: 828,
      bytes: 2048,
      href: '/globe/layers/ghost-fleet.json',
    },
  ],
}

const FLOOR =
  '<svg class="globe-floor-svg" viewBox="0 0 960 480"><title id="t">the living globe</title>' +
  '<circle class="globe-dot" cx="1" cy="2" r="1.7"/></svg>'

const render = (compact = false) =>
  renderToStaticMarkup(
    <LivingGlobe
      floorSvg={FLOOR}
      manifest={MANIFEST}
      wording={GLOBE.island}
      readoutId="living-globe-readout"
      figureId="living-globe"
      compact={compact}
      defaultLayers={['sky', 'ghost-fleet']}
    />,
  )

describe('the living globe, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
    expect(render(true)).toBe(render(true))
  })

  it('carries the build-time plate in the HTML before any script runs, and says nothing about loading yet', () => {
    const html = render()
    expect(html).toContain('<svg class="globe-floor-svg"')
    expect(html).toContain('data-phase="floor"')
    expect(html).toMatch(/<p class="lg-status" aria-live="polite"><\/p>/)
  })

  it('sets no style attribute — placement and sizing belong to the stylesheet and setVars', () => {
    // written with \x22 so drift-check rule 3, which scans test sources too, does not read the
    // assertion itself as an inline style attribute (the partitur's test does the same)
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render(true)).not.toMatch(/ style=\x22/)
  })

  it('keeps the canvas out of the accessibility tree; the plate stays the figure', () => {
    const html = render()
    expect(html).toMatch(/<div class="lg-canvas" aria-hidden="true">/)
    expect(html).not.toMatch(/lg-floor[^>]*aria-hidden/)
  })

  it('renders the legend as the no-JS figure: every layer, with the file it was read from', () => {
    const html = render()
    for (const layer of MANIFEST.layers) {
      expect(html).toContain(layer.title)
      // the archive's own `<day>` placeholder arrives HTML-escaped, as it must
      expect(html).toContain(layer.source.file.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    }
    // the toggles exist but do nothing until the island is alive — a dead live button is worse
    expect(html).toContain('disabled=""')
  })

  it('names the last of the default layers as the one in front — the emphasis rule, in the markup', () => {
    const html = render()
    const items = html.split('<li class="lg-legend-item"').slice(1)
    const front = items.filter((item) => item.includes('data-front="yes"'))
    expect(front).toHaveLength(1)
    expect(front[0]).toContain('Ghost Fleet')
  })

  it('starts the day axis at the newest day the archive holds', () => {
    const html = render()
    expect(newestDayIndex(MANIFEST.days)).toBe(MANIFEST.days.length - 1)
    expect(html).toContain(`value="${MANIFEST.days.length - 1}"`)
    expect(html).toContain(`aria-valuetext="${MANIFEST.asOf}"`)
  })

  it('gives the compact form no controls and no card — the hero is a figure, not a console', () => {
    const html = render(true)
    expect(html).toContain('data-compact="yes"')
    expect(html).not.toContain('lg-controls')
    expect(html).not.toContain('type="range"')
    expect(html).toContain('<svg class="globe-floor-svg"')
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

describe('a layer’s records are fetched once, ever', () => {
  it('asks for a layer the first time it is switched on', () => {
    expect(layersToFetch(new Set(), ['sky'])).toEqual(['sky'])
  })

  it('never asks again — not on a re-toggle, not on a day change', () => {
    const asked = new Set(['sky'])
    expect(layersToFetch(asked, ['sky'])).toEqual([])
    // off and on again is the same layer, and the same fetch that already happened
    expect(layersToFetch(asked, [])).toEqual([])
    expect(layersToFetch(asked, ['sky'])).toEqual([])
  })

  it('asks only for what is actually on', () => {
    expect(layersToFetch(new Set(['sky']), ['sky', 'ghost-fleet'])).toEqual(['ghost-fleet'])
  })
})

describe('the walk over the days', () => {
  it('does not advance under reduced motion, even if something set it running', () => {
    expect(playAdvances(true, false)).toBe(true)
    expect(playAdvances(true, true)).toBe(false)
    expect(playAdvances(false, false)).toBe(false)
  })

  it('hides the play button under reduced motion — the server render offers it, the client withdraws it', () => {
    // the server cannot know the preference, so it renders the offer; the island's own effect
    // reads matchMedia after mount and takes it away
    expect(render()).toContain(GLOBE.island.controls.play)
    expect(read('./LivingGlobe.tsx')).toContain('{!reduced && (')
  })
})

describe('who owns the arrow keys', () => {
  beforeEach(() => resetPanelRegistry())

  it('leaves them to the scrubber while no card is open', () => {
    expect(isPanelActive()).toBe(false)
    expect(scrubberYields('ArrowRight', isPanelActive())).toBe(false)
  })

  it('hands them to an open card — the day does not move under a card walking its own marks', () => {
    const steps: string[] = []
    const handlers: PanelKeyHandlers = {
      onPrev: () => steps.push('prev'),
      onNext: () => steps.push('next'),
      onClose: () => steps.push('close'),
    }
    activatePanel(handlers)

    expect(scrubberYields('ArrowLeft', isPanelActive())).toBe(true)
    expect(scrubberYields('ArrowRight', isPanelActive())).toBe(true)

    // and the ONE registry — never a second listener on document — does the stepping
    let prevented = 0
    dispatchPanelKey({ key: 'ArrowRight', preventDefault: () => (prevented += 1) })
    dispatchPanelKey({ key: 'ArrowLeft', preventDefault: () => (prevented += 1) })
    expect(steps).toEqual(['next', 'prev'])
    expect(prevented).toBe(2)
  })

  it('keeps every other key with the scrubber, card or no card', () => {
    activatePanel({ onPrev: () => {}, onNext: () => {}, onClose: () => {} })
    for (const key of ['Home', 'End', 'PageUp', 'ArrowUp', ' ']) {
      expect(scrubberYields(key, isPanelActive())).toBe(false)
    }
  })

  it('registers no keydown listener of its own — the arbitration registry is the only one', () => {
    const source = read('./LivingGlobe.tsx')
    expect(source).not.toContain("document.addEventListener('keydown'")
    expect(source).toContain('ensurePanelKeydownListener()')
  })
})

describe('the drawing half is handed arrays, never a URL', () => {
  it('names no data URL — the island fetches and parses, deck.gl only draws', () => {
    // deck.gl would fetch a URL handed to a layer's `data` prop itself, on its own schedule, past
    // the island's "once per layer" promise and past any error the island could show. Comment
    // lines are skipped, exactly as drift-check does it, so the module may name the rule it keeps.
    const code = read('./globe-deck.ts')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
      .join('\n')
    expect(code).not.toMatch(/data: '/)
    expect(code).not.toMatch(/data: `/)
  })

  it('does the fetching in the island, same-origin, from the manifest’s own hrefs', () => {
    const source = read('./LivingGlobe.tsx')
    expect(source).toContain('fetch(entry.href)')
    expect(source).toContain("fetch('/globe/land.json')")
  })
})

describe('which layers stand in front', () => {
  it('names one in the room — the last switched on', () => {
    expect(emphasisFor(false, ['sky', 'ghost-fleet', 'protocol'])).toBe('protocol')
    expect(emphasisFor(false, ['sky'])).toBe('sky')
  })

  it('names both on the compact entrance, so each keeps its own recorded hue', () => {
    // the emphasis rule is arithmetic about legibility: ten layers cannot carry ten identities on
    // one sphere, two can, and the hero has drawn exactly two since 2026-09-02
    expect(emphasisFor(true, ['sky', 'ghost-fleet'])).toEqual(['sky', 'ghost-fleet'])
  })

  it('names nothing when nothing is on', () => {
    expect(emphasisFor(false, [])).toBeNull()
    expect(emphasisFor(true, [])).toBeNull()
  })
})

describe('the sky keeps the one declared no-clock exception', () => {
  it('propagates to the visitor’s present, on the newest frame, from the elements the feed carries', () => {
    const island = read('./LivingGlobe.tsx')
    const deck = read('./globe-deck.ts')
    // the island hands the elements over only while the day on screen is the day they were taken
    expect(island).toContain("feeds[id]).find((feed) => feed?.instant?.day === day)")
    // and the drawing half is the only place a clock is read on this globe
    expect(deck).toContain('positionsAt(recs, Date.now())')
    expect(deck).toContain('POSITION_INTERVAL_MS')
    expect(deck).toContain('easeMs: POSITION_INTERVAL_MS')
    // one copy of satellite.js on this site: the house's own propagator, not a second import
    expect(deck).toContain("from '@/lib/globe/propagate'")
    expect(deck).not.toContain("from 'satellite.js'")
  })

  it('reads no clock anywhere else — the island itself never asks what time it is', () => {
    const island = read('./LivingGlobe.tsx')
    const code = island
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
      .join('\n')
    expect(code).not.toContain('Date.now()')
    expect(code).not.toContain('new Date(')
  })
})

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

import { GLOBE, placePhrase } from '@/config/globe-wording'
import {
  activatePanel,
  dispatchPanelKey,
  isPanelActive,
  resetPanelRegistry,
  type PanelKeyHandlers,
} from '@/lib/dataviz/stepper'
import type { GlobeManifest } from '@/lib/globe/feeds'
import { LAYERS } from '@/lib/globe/layers'
import type { LayerRecord } from '@/lib/globe/layers/types'
import LivingGlobe, {
  cameraKey,
  cardStands,
  dayIndexOf,
  emphasisFor,
  layersToFetch,
  mayFly,
  mountsOnSight,
  NARROW_PX,
  newestDayIndex,
  parseInk,
  playAdvances,
  scrubberYields,
  tourFigureId,
} from './LivingGlobe'

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

  it('fetches the country polygons once, and only when a country layer is switched on (G3)', () => {
    const source = read('./LivingGlobe.tsx')
    // the shapes travel the way a layer's records do: asked for once, when they are first needed,
    // and served ready to draw — the island decodes no topology of its own, because a border is
    // geometry and geometry belongs to a tested library (src/lib/globe/shapes.ts)
    expect(source).toContain("fetch('/globe/countries.json')")
    expect(source).toContain("byId.get(id)?.kind === 'countries'")
    expect(source).toContain('countriesAskedRef')
    expect(source).not.toContain("from 'topojson-client'")
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

describe('a guided story drives the room, and only the room (G2)', () => {
  const island = read('./LivingGlobe.tsx')

  it('answers to the room’s figure id, and to nothing at all under the hero', () => {
    expect(tourFigureId(false, 'living-globe')).toBe('living-globe')
    // the hero renders no controls and no card; a story that could fly it would move a figure the
    // visitor has no way to take back, on a page that is not about the globe at all
    expect(tourFigureId(true, 'living-globe')).toBe('')
  })

  it('registers no handle for an empty id — the guard is in the shared hook, not in a comment', () => {
    expect(island).toContain('useFigureReady(tourFigureId(compact, figureId)')
    const hook = read('../ecology/score-kit/useFigureReady.ts')
    expect(hook).toContain('if (!figureId) return')
  })

  it('moves the day only to a day the archive holds — never to the nearest one', () => {
    expect(dayIndexOf(DAYS, '2026-08-31')).toBe(1)
    expect(dayIndexOf(DAYS, DAYS[DAYS.length - 1])).toBe(DAYS.length - 1)
    // a day the model does not hold, a day between two it holds, and no day at all: all ignored
    expect(dayIndexOf(DAYS, '2026-07-04')).toBe(-1)
    expect(dayIndexOf(DAYS, '2026-08-30T12:00:00Z')).toBe(-1)
    expect(dayIndexOf(DAYS, undefined)).toBe(-1)
  })

  it('yields the camera to the pointer for the scene the visitor took hold in, and takes it back at the next', () => {
    // nothing held: the story may always fly
    expect(mayFly(false, false)).toBe(true)
    expect(mayFly(true, false)).toBe(true)
    // the same scene re-applied while the reader is holding the globe: leave it alone
    expect(mayFly(true, true)).toBe(false)
    // the next scene asks for a different view, and that is a new command
    expect(mayFly(false, true)).toBe(true)
  })

  it('tells one view from another without holding on to the tour’s own objects', () => {
    // Tour.astro parses a fresh FocusState out of its JSON payload on every activation, so object
    // identity says nothing about whether this is the same scene
    expect(cameraKey({ longitude: 13.384, latitude: 52.5191, zoom: 2.2 })).toBe('13.384,52.5191,2.2')
    expect(cameraKey({ longitude: 13.384, latitude: 52.5191 })).not.toBe(
      cameraKey({ longitude: 13.384, latitude: 52.5191, zoom: 2.2 }),
    )
  })

  it('applies a scene in the order a reader needs it: layers, day, camera, then the mark', () => {
    // the mark exists ON a day, IN a layer — asking for it first would open nothing, and the
    // records it names may still be one fetch away, which is what the pending ref is for
    const focusBlock = island.slice(island.indexOf('useFigureReady(tourFigureId'), island.indexOf('// ── what the island says'))
    const order = ['focus.layers', 'focus.time?.day', 'focus.camera', 'focus.select'].map((needle) =>
      focusBlock.indexOf(needle),
    )
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order]).toEqual([...order].sort((a, b) => a - b))
    expect(focusBlock).toContain('handleRef.current?.heldByPointer()')
    expect(focusBlock).toContain('flyTo(focus.camera, !reduced)')
  })

  it('closes an open card rather than re-pointing it at another day’s record', () => {
    // Found while walking the stories in the browser on 2026-09-03: a card holds a POSITION in a
    // day's frame, so on the next day the same position is a different vessel — the card relabelled
    // itself honestly (new day, new file) and said nothing about having changed mark. A card is one
    // mark, of one layer, on one day.
    const open = { layerId: 'ghost-fleet', day: '2026-09-01' }
    expect(cardStands(open, '2026-09-01', ['sky', 'ghost-fleet'], true)).toBe(true)
    expect(cardStands(open, '2026-09-02', ['sky', 'ghost-fleet'], true)).toBe(false)
    expect(cardStands(open, '2026-09-01', ['sky'], true)).toBe(false)
    expect(cardStands(open, '2026-09-01', ['sky', 'ghost-fleet'], false)).toBe(false)
    expect(cardStands(null, '2026-09-01', ['ghost-fleet'], true)).toBe(false)
  })

  it('asks the drawing half whether the globe was taken over — never a second listener on the page', () => {
    const deck = read('./globe-deck.ts')
    expect(deck).toContain('heldByPointer()')
    // the flag is cleared by the story's own camera command, so "held" means "held since this view"
    expect(deck).toMatch(/flyTo\(camera, animate\) \{\n\s+interacted = true\n\s+held = false/)
    expect(island).not.toContain("document.addEventListener('pointerdown'")
  })
})

describe('what the drawing half is handed at mount', () => {
  // The mount effect runs once, on `seen`, and awaits the module and the land before it draws.
  // A feed that arrives in that gap changes buildFrame — but the setFrame effect finds no handle
  // yet and does nothing, and the mount, reading its own first closure, would draw the records it
  // knew then: none. Sea and land and no marks (2026-09-03). The mount therefore reads the newest
  // closures through a ref, never its own.
  const source = read('./LivingGlobe.tsx')

  it('reads the newest frame, not the one its first closure knew', () => {
    expect(source).toContain('frame: latest.current.buildFrame()')
    expect(source).not.toMatch(/frame: buildFrame\(\)/)
  })

  it('answers hover and select with the newest records as well', () => {
    expect(source).toContain('latest.current.showHover(hit)')
    expect(source).toContain('latest.current.recordsOf(hit.layerId)')
    expect(source).toContain('latest.current.openMark(hit.layerId, index)')
  })
})

describe('the card names a country, never its code (G3, second evening)', () => {
  // The wording repair carried over from the first evening. The island renders `placePhrase` into
  // the card's "What the mark is" row and into the hover readout, and for a record that names a
  // country rather than a coordinate that phrase read "centroid of the country QAT" — a receipt
  // only somebody holding the crosswalk could read. The name now travels WITH the code, resolved by
  // the adapter that resolved the code, because the island holds no crosswalk and must not grow one.
  const P = GLOBE.island.place
  const country = (iso3: string, name: string): LayerRecord => ({
    key: `balance:2026-09-02:0`,
    at: { iso3, name },
    value: 1,
    labelKind: 'centroid',
    receipt: { file: 'src/data/balance/2026-09-02.json', locator: 'countries[0] · QA', words: 'w' },
  })

  it('fills the crosswalk’s name into the phrase the card prints', () => {
    expect(placePhrase(country('QAT', 'Qatar'), P)).toBe('centroid of Qatar')
    expect(placePhrase(country('DEU', 'Germany'), P)).toBe('centroid of Germany')
  })

  it('prints no alpha-3 code at a reader', () => {
    expect(placePhrase(country('QAT', 'Qatar'), P)).not.toContain('QAT')
    expect(P.country).toContain('{name}')
    expect(P.country).not.toContain('{code}')
  })

  it('is the phrase the island itself uses, in the card and in the readout', () => {
    const source = read('./LivingGlobe.tsx')
    expect(source).toContain('placePhrase(selectedRecord, wording.place)')
    expect(source).toContain('place: placePhrase(hit.record, wording.place)')
  })

  it('holds for every country record the real archive carries', () => {
    const balance = LAYERS.find((layer) => layer.id === 'balance')!
    const frame = balance.frame(balance.days[balance.days.length - 1])
    expect(frame.records.length).toBeGreaterThan(0)
    for (const record of frame.records) {
      const phrase = placePhrase(record, P)
      expect(phrase.startsWith('centroid of '), record.key).toBe(true)
      expect(phrase, record.key).not.toMatch(/centroid of [A-Z]{3}$/)
    }
  })
})

describe('who pays for the globe, and when', () => {
  // Measured on the live entrance on 2026-09-03: a phone fetched the drawing half, two whole
  // archives and a land topology for a figure the server had already drawn as a plate, and spent
  // a third of a second of main-thread time on it unthrottled — several times that on the
  // processor a mobile audit emulates. A narrow screen therefore keeps the plate and fetches
  // nothing until the visitor asks for the turn.
  it('mounts on sight on a wide screen', () => {
    expect(mountsOnSight(1440)).toBe(true)
    expect(mountsOnSight(NARROW_PX)).toBe(true)
  })

  it('waits to be asked on a narrow one', () => {
    expect(mountsOnSight(NARROW_PX - 1)).toBe(false)
    expect(mountsOnSight(412)).toBe(false)
    expect(mountsOnSight(0)).toBe(false)
  })

  it('leaves the server render alone — the plate is what every screen gets first', () => {
    // the gate lives in an effect, so the markup the server sends is the same for every width
    expect(render(true)).toContain('lg-floor')
    expect(render(true)).not.toContain('lg-ask')
    expect(render(false)).not.toContain('lg-ask')
  })

  it('fetches no archive while the gate stands — not the drawing half, not the records', () => {
    const source = read('./LivingGlobe.tsx')
    // both effects carry the same early return, and the fetch effect watches the gate
    // both effects carry the same early return, and neither runs before the width is measured:
    // `gated === null` is the unmeasured state the server render stands in
    expect(source.match(/if \(gated !== false && !armed\) return/g)?.length).toBe(2)
    expect(source).toContain('}, [active, armed, byId, gated])')
    expect(source).toContain('React.useState<boolean | null>(null)')
  })

  it('asks in the wording config’s own words, and only while the gate stands', () => {
    const source = read('./LivingGlobe.tsx')
    expect(source).toContain('{gated === true && !armed && (')
    expect(source).toContain('wording.controls.turn')
  })
})

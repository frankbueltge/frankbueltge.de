// The front door, the full board it links, and what the front page mounts (2026-09-01).
// Source-scan guards in the pattern naming.test.ts established for the entrance: what these
// check is not markup taste but the promises the pages make to each other — the front door
// derives from the same tested libs as the board page, the "the full board →" link really lands
// on the full board, and the front page really mounts the entrance the eyebrow guard reads.
// Each of these broke silently at least once in this entrance's lineage (the eyebrow in
// August); a scan is what makes the next time loud.
//
// Lineage on this one day: FrontDoor.astro became the entrance in the morning; in the evening
// Frank's decision (wording private) brought the ops room back, and FrontDoor.astro stays in the
// repo unlinked — reachable through Git, mounted nowhere. /now keeps the board page as built.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { NAMING } from '@/config/naming'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const frontDoor = read('../../components/pages/FrontDoor.astro')
const nowBoard = read('../../components/pages/NowBoard.astro')
const indexPage = read('../../pages/index.astro')

describe('the front door derives, never types', () => {
  it('renders the signal log from the tested derivation', () => {
    expect(frontDoor).toContain('buildSignalLog')
  })

  it('compresses the board rows rather than restating them', () => {
    expect(frontDoor).toContain('buildBoard')
  })

  it('reads the house clock from the committed cycle state', () => {
    expect(frontDoor).toContain('loadCycle')
  })

  it('links the full board, and the link goes to /now', () => {
    // The href lives in NAMING (one source); the component must render exactly that link.
    expect(NAMING.frontDoor.live.link.href).toBe('/now')
    expect(frontDoor).toContain('FD.live.link.href')
  })
})

describe('the full-board promise the homepage link makes stays true', () => {
  it('/now renders the whole board', () => {
    expect(nowBoard).toContain('buildBoard')
  })

  it('/now renders every live-experiment tile', () => {
    expect(nowBoard).toContain('readTiles')
  })
})

describe('the front page mounts the ops room', () => {
  // The eyebrow guard in naming.test.ts reads OpsRoom.astro; this is what keeps that guard
  // honest — if the page ever mounts something else, one of the two fails.
  it('imports OpsRoom.astro and mounts nothing else as the entrance', () => {
    expect(indexPage).toContain('@/components/pages/OpsRoom.astro')
    expect(indexPage).toContain('<OpsRoom />')
    expect(indexPage).not.toContain('<FrontDoor />')
  })

  it('keeps the front door in the repo, dated, rather than deleting it', () => {
    expect(frontDoor.length).toBeGreaterThan(0)
    expect(indexPage).toContain('FrontDoor.astro stays in the repo')
  })

  // The globe under the hero (visual layer, Phase 3b, 2026-09-02; the one island since G1 of the
  // living globe, 2026-09-03): the ops room mounts its frame, and the frame mounts the SAME island
  // the room at /globe mounts — with `compact`, which turns the controls off and nothing else.
  // Both hops are by path, so mounted.test.ts sees the island too.
  it('mounts the living globe under the hero, frame and island, in its compact form', () => {
    const opsRoom = read('../../components/pages/OpsRoom.astro')
    const figure = read('../../components/pages/EntranceGlobeFigure.astro')
    expect(opsRoom).toContain("from './EntranceGlobeFigure.astro'")
    expect(opsRoom).toContain('<EntranceGlobeFigure />')
    expect(figure).toContain("from './LivingGlobe'")
    expect(figure).toMatch(/<LivingGlobe\s+client:idle\s+compact/)
  })

  it('gives the hero the two layers it has always drawn, the ghost fleet in front', () => {
    // The last id in `defaultLayers` is the layer in front (LivingGlobe.tsx's emphasis rule), and
    // the ghost fleet is the one this house records a colour for — so the hero keeps the division
    // it has carried since the globe arrived: the gaps in the Field's hue, the fleet behind them.
    const figure = read('../../components/pages/EntranceGlobeFigure.astro')
    expect(figure).toContain("const DEFAULT_LAYERS = ['sky', 'ghost-fleet']")
  })
})

describe('/now SEO strings fit their windows', () => {
  const SUFFIX = ' | Frank Bültge'

  it('keeps the title inside the tab budget, suffix included', () => {
    expect(NAMING.frontDoor.now.seo.title.length).toBeLessThanOrEqual(60 - SUFFIX.length)
  })

  it('keeps the description inside the snippet window', () => {
    const len = NAMING.frontDoor.now.seo.description.length
    expect(len).toBeGreaterThanOrEqual(70)
    expect(len).toBeLessThanOrEqual(160)
  })
})

describe('the front door copy carries no digits', () => {
  // Kanon rule, same as the catalogues guard: numbers are rendered from data, never written
  // into wording, where they go stale silently. The cycle label and the seeded-question
  // wrapper are functions and take their values as arguments — the strings must stay clean.
  it('in the introduction', () => {
    expect(NAMING.frontDoor.sub).not.toMatch(/\d/)
  })

  it('in the section labels and the /now head', () => {
    expect(NAMING.frontDoor.front.kicker).not.toMatch(/\d/)
    expect(NAMING.frontDoor.front.kickerSub).not.toMatch(/\d/)
    expect(NAMING.frontDoor.live.kicker).not.toMatch(/\d/)
    expect(NAMING.frontDoor.live.kickerSub).not.toMatch(/\d/)
    expect(NAMING.frontDoor.now.h1).not.toMatch(/\d/)
    expect(NAMING.frontDoor.now.lead).not.toMatch(/\d/)
    expect(NAMING.frontDoor.now.seo.title).not.toMatch(/\d/)
    expect(NAMING.frontDoor.now.seo.description).not.toMatch(/\d/)
  })
})

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
import { GLOBE } from '@/config/globe-wording'
import { NAMING } from '@/config/naming'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const frontDoor = read('../../components/pages/FrontDoor.astro')
const nowBoard = read('../../components/pages/NowBoard.astro')
const indexPage = read('../../pages/index.astro')

describe('the front door derives, never types', () => {
  it('renders the signal log from the tested derivation, and from the house-wide one', () => {
    // buildHouseFeed since 2026-09-03: the old buildSignalLog read the three ecology practices
    // only, so a front door still importing it would be announcing "what landed last" over a
    // third of the house.
    expect(frontDoor).toContain('buildHouseFeed')
    expect(frontDoor).not.toContain('buildSignalLog')
  })

  it('renders the log through the one component all three surfaces share', () => {
    // The same twenty lines of markup stood in three files until 2026-09-03; a page that
    // hand-rolls the log again is a page that can drift away from the other two.
    for (const [name, src] of [['the front door', frontDoor], ['/now', nowBoard]] as const) {
      expect(src, name).toContain('SignalLog')
      expect(src, name).not.toContain('ops-log-date')
    }
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

  // The sky and the water stood under the hero from 2026-09-02: a turning globe first, then the
  // plate underneath it. The owner took the globe off the front page on 2026-09-03 and, when the
  // plate turned out to be what he meant by it, the panel too (wording private, paraphrased). Six
  // hundred pixels of world map were the second thing on the page and the most expensive; the
  // fleet and the gaps are one click away in the signal log and the tiles. This assertion is the
  // way round it is so nobody puts it back without saying so.
  it('mounts no sky panel under the hero', () => {
    const opsRoom = read('../../components/pages/OpsRoom.astro')
    expect(opsRoom).not.toContain('<EntranceGlobeFigure />')
    expect(opsRoom).not.toContain("from './EntranceGlobeFigure.astro'")
  })

  it('keeps the figure in the repo, dated and unmounted, rather than deleting it', () => {
    const figure = read('../../components/pages/EntranceGlobeFigure.astro')
    expect(figure.length).toBeGreaterThan(0)
    expect(figure).toContain('NOT MOUNTED SINCE 2026-09-03')
    // and it is still a plate, not a globe: whoever mounts it again mounts the drawing, not the island
    expect(figure).not.toContain("from './LivingGlobe'")
  })

  it('leaves the ops room with no client data fetching at all', () => {
    const opsRoom = read('../../components/pages/OpsRoom.astro')
    expect(opsRoom).toContain('NO CLIENT DATA FETCHING, with no exception again since 2026-09-03')
  })

  it('says the plate stands where the elements were taken, not at the reader’s present', () => {
    // the claim followed the instrument: the propagated present lives at /globe now, and a plate
    // that cannot move must not say "your now"
    expect(NAMING.opsRoom.sky.footLeft).not.toContain('YOUR NOW')
    expect(NAMING.opsRoom.sky.footLeft).toContain('WHERE THE ELEMENTS WERE TAKEN')
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

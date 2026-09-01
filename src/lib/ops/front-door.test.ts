// The front door and the full board it links (2026-09-01). Source-scan guards in the pattern
// naming.test.ts established for the entrance: what these check is not markup taste but the
// promises the pages make to each other — the entrance derives from the same tested libs as
// the board page, the "the full board →" link really lands on the full board, and the front
// page really mounts the front door. Each of these broke silently at least once in this
// entrance's lineage (the eyebrow in August); a scan is what makes the next time loud.
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

describe('the front page mounts the front door', () => {
  // The eyebrow guard in naming.test.ts reads FrontDoor.astro; this is what keeps that guard
  // honest — if the page ever mounts something else, one of the two fails.
  it('imports FrontDoor.astro', () => {
    expect(indexPage).toContain("@/components/pages/FrontDoor.astro")
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

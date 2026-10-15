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
// 2026-10-11: the entrance is HomeEdition.astro (design handoff docs/design_handoff_homepage_
// ecology); OpsRoom.astro joins FrontDoor.astro in the repo, unlinked and dated.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { GLOBE } from '@/config/globe-wording'
import { EDITION } from '@/config/edition-wording'
import { NAMING } from '@/config/naming'
import { buildHouseFeed } from './live-feed'

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

describe('the stream’s two surfaces (Frank, 2026-10-05; the entrance redrawn 2026-10-11)', () => {
  const edition = read('../../components/pages/HomeEdition.astro')

  it('lists the entrance’s arrivals from the house-wide stream, by day', () => {
    // The ops room showed the newest twenty rows; the edition lists what arrived since a
    // reference point, grouped by day and cut to a few rows each (src/lib/ops/edition.ts).
    // Either way it is the one stream, never a second derivation.
    expect(edition).toContain('buildHouseFeed()')
    expect(edition).toContain('sinceDays(feed,')
  })

  it('carries the longer log on /now, paged', () => {
    expect(nowBoard).toContain('topOf(buildHouseFeed(), FEED_DEPTH)')
    expect(nowBoard).not.toContain('pageSize={FEED_TOP}')
  })

  it('links the entrance’s arrivals to the longer log, and the link goes to /now', () => {
    expect(EDITION.arrivals.link.href).toMatch(/^\/now#latest$/)
    // through the fragment-aware helper: the locale helper alone writes `/now#latest/`, and misses.
    // Since 2026-10-05 every link on the entrance takes that path (src/lib/locale-href.ts).
    expect(edition).toContain('url(E.arrivals.link.href)')
    expect(edition).toContain('localeHref(href,')
    expect(nowBoard).toContain('id="latest"')
  })
})

describe('the front page mounts the edition', () => {
  // The name guard in naming.test.ts reads the top bar and the page layout; this is what keeps
  // the other half honest — the front page mounts exactly one entrance, and it is this one.
  it('imports HomeEdition.astro and mounts nothing else as the entrance', () => {
    expect(indexPage).toContain('@/components/pages/HomeEdition.astro')
    expect(indexPage).toContain('<HomeEdition />')
    expect(indexPage).not.toContain('<OpsRoom />')
    expect(indexPage).not.toContain('<FrontDoor />')
  })

  it('stands on the paper ground', () => {
    expect(indexPage).toContain('surface="paper"')
  })

  it('keeps the earlier entrances in the repo, dated, rather than deleting them', () => {
    expect(frontDoor.length).toBeGreaterThan(0)
    expect(indexPage).toContain('FrontDoor.astro stays in the repo')
    expect(read('../../components/pages/OpsRoom.astro').length).toBeGreaterThan(0)
    expect(indexPage).toContain('OpsRoom.astro stays in the repo')
  })

  it('keeps the three properties the ops room was built to keep', () => {
    const edition = read('../../components/pages/HomeEdition.astro')
    expect(edition).toContain('NO NUMBER IS TYPED')
    expect(edition).toContain('NO CLIENT DATA FETCHING')
    expect(edition).toContain('ABSENCE IS DRAWN')
    // and the second of them is true of the script: it asks the network for nothing
    const script = edition.slice(edition.indexOf('<script>'))
    expect(script).not.toMatch(/\bfetch\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon/)
  })

  it('writes to the reader’s browser only through the opt-in entry', () => {
    // § 25 TDDDG: storage on the device without consent only for what the reader expressly asked
    // for. The script may touch local storage in exactly two places — the load, which writes
    // only where an entry already exists, and the button — and under exactly one key.
    const edition = read('../../components/pages/HomeEdition.astro')
    const script = edition.slice(edition.indexOf('<script>'))
    expect(script).not.toMatch(/sessionStorage|document\.cookie|indexedDB/)
    for (const call of script.match(/localStorage\.\w+\([^)]*\)/g) ?? []) expect(call).toContain('VISITS_KEY')
    expect(script).toContain('if (stored) {')
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

describe('the log’s links land where its rows say', () => {
  const signalLog = read('../../components/ops/SignalLog.astro')

  it('hands a row’s fragment past the locale helper, which would write its slash after the #', () => {
    // Since 2026-10-05 rows lead into sections of their pages — the relay (`/encounters#relay`)
    // and Arch's works (`/arch#works`). Handed whole, the helper wrote `#relay/`, and both links
    // missed their anchor.
    expect(signalLog).toContain('localeHref(href,')
    expect(buildHouseFeed().some((e) => e.href.includes('#'))).toBe(true)
  })
})

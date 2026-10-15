// The Middle's triangle, rendered on the server (2026-10-05) — the floor of the figure.
//
// The contract every island in this house inherits (.claude/rules/dataviz-figures.md, duty 2): the
// markup Astro renders on the server is the complete no-JS figure — deterministic, free of style
// attributes, every lane a real link with its counts as a native title. And the state this page
// lives in until research-ecology first publishes the relay: corners, no lanes, and a sentence
// saying the relay has not reported — never an empty triangle that would read as "nothing passed".
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MIDDLE_V3 } from '@/config/middle-v3-wording'
import { parseRelay } from '@/lib/ecology/relay'
import { DEFAULT_WINDOW, bandAnchor, buildRelayView, type RelayView } from '@/lib/ecology/relay-triangle'

import RelayTriangle from './RelayTriangle'
import { relayWording } from './relay-wording'

const SEED = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL('../../lib/ecology/__fixtures__/relay.seed.json', import.meta.url)), 'utf8'),
)
const reported = buildRelayView(parseRelay(SEED), '2026-10-03')
const absent = buildRelayView({ status: 'absent' }, '2026-10-03')
const invalid = buildRelayView({ status: 'invalid', reason: 'contract "middle-relay/0" is not "middle-relay/1"' }, '2026-10-03')

const render = (view: RelayView) =>
  renderToStaticMarkup(
    <RelayTriangle
      windows={view.windows}
      defaultWindow={DEFAULT_WINDOW}
      rows={view.rows}
      wording={relayWording(view)}
      readoutId="relay-triangle-readout"
      figureId="relay-triangle"
    />,
  )

describe('the triangle with a relay to draw', () => {
  const html = render(reported)

  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render(reported)).toBe(html)
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 does not read the guard itself
    expect(html).not.toMatch(/ style=\x22/)
    expect(html).not.toMatch(/ style=\{/)
  })

  it('draws six lanes, each a link to its group in the table floor, titled with its counts', () => {
    const marks = [...html.matchAll(/<a [^>]*data-mark="([^"]+)"/g)].map((m) => m[1])
    expect(marks).toEqual(reported.windows.v3.bands.map((b) => b.id))
    for (const band of reported.windows.v3.bands) expect(html).toContain(`href="#${bandAnchor(band.id)}"`)
    expect(html).toContain('<title>The Field → The Studio · built on 3 · answered 0 · noted 2</title>')
  })

  it('draws an empty direction as a dashed track, and says in words where nothing passed', () => {
    expect(html.match(/class="tri-void"/g)).toHaveLength(reported.windows.v3.isolation.length)
    expect(html).toContain('Nothing load-bearing has passed: The Field → The Atelier · The Studio → The Field.')
  })

  it('names the carrying directions instead, once most are empty (this cycle: five of six)', () => {
    expect(relayWording(reported).isolation.cycle).toBe(
      'Only The Atelier → The Studio carried something load-bearing; in every other direction, nothing.',
    )
  })

  it('inks the kinds by class and width, the hue by the giver', () => {
    expect(html).toContain('class="tri-stroke k-built_on"')
    expect(html).toContain('class="tri-stroke k-answered"')
    expect(html).toContain('class="tri-stroke k-noted"')
    expect(html).toContain('class="tri-band g-studio"')
  })

  it('keeps the window toggle hidden until the island has mounted, and says which window is drawn', () => {
    expect(html).toMatch(/class="tri-windows"[^>]*hidden/)
    expect(html).toContain(MIDDLE_V3.triangle.drawn(MIDDLE_V3.triangle.windows.v3('2026-08-30')))
  })

  it('opens no card on the server — a card is what a click adds', () => {
    expect(html).not.toContain('tri-card')
  })

  it('names the three corners with their personas', () => {
    for (const label of ['The Field', 'The Atelier', 'The Studio', 'Meridian', 'Assay', 'Ensemble']) expect(html).toContain(label)
  })
})

describe('the sources of the rebuilt page carry no style attribute', () => {
  // drift-check rule 3 walks these too; this is the same rule, named where the files are made.
  // Comment lines may NAME the rule (the island's header does), so they are skipped as there.
  const files = [
    './RelayTriangle.tsx',
    './RelayTriangleFigure.astro',
    './RelayHandoffs.astro',
    './MiddleV3.astro',
    './relay-wording.ts',
    '../../styles/middle-relay.css',
  ]
  it.each(files)('%s', (rel) => {
    const source = fs.readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
    const offending = source
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .filter((line) => /style=["{]/.test(line))
    expect(offending).toEqual([])
  })
})

describe('the triangle before the relay has reported', () => {
  const html = render(absent)

  it('draws the corners and no lane — nothing measured, nothing drawn', () => {
    expect(html).not.toContain('tri-band')
    expect(html.match(/class="tri-node /g)).toHaveLength(3)
    expect(html).toContain(MIDDLE_V3.triangle.notReported.title)
  })

  it('offers no window toggle, and claims no isolation and no count', () => {
    expect(html).not.toContain('tri-windows')
    expect(html).not.toContain('Nothing load-bearing has passed')
    // a corner's title names it; "built on 0" would be a measurement nobody made
    expect(html).toContain('<title>The Field (Meridian)</title>')
    expect(html).not.toMatch(/built on \d/)
  })

  it('says an unreadable relay is unreadable, not empty', () => {
    const bad = render(invalid)
    expect(bad).not.toContain('tri-band')
    expect(bad).toContain(MIDDLE_V3.triangle.invalid.title)
    expect(bad).toContain('middle-relay/0')
  })
})

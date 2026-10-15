// The Middle score's server render is the floor of the figure (visual layer, Phase 3d,
// 2026-09-02).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): the markup Astro renders on the server is the complete no-JS figure —
// deterministic, free of style attributes, and carrying every link and every native title before
// a single script has run. What JavaScript adds is the stretching ruler, the readout and the
// card; what it must never add is the figure itself.
//
// The second job of this file is continuity. Until 2026-09-02 this drawing was an SVG STRING and
// its class vocabulary was asserted against that string; the vocabulary is the contract with
// src/styles/score-map.css (the first partitur's own stylesheet, PALETTE: ecology-voices), so it
// is asserted here instead — same classes, same structure, one renderer.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ECOLOGY_V3 } from '@/config/ecology-v3-wording'
import { MIDDLE_V3 } from '@/config/middle-v3-wording'
import type { MiddleVoice } from '@/lib/ecology/middle'
import { buildMiddleScoreModel, itemAnchor } from '@/lib/ecology/middle-score-model'
import { PRACTICES, type PracticeId } from '@/lib/ecology/v3'

import MiddleScore, { type MiddleScoreWording } from './MiddleScore'

const VOICES: MiddleVoice[] = [
  {
    practice: 'field',
    present: true,
    items: [
      { from: 'field', to: ['studio'], text: '**The correction is upheld.** Details follow.' },
      { from: 'field', to: [], text: 'Carried for both siblings, naming neither.' },
    ],
  },
  { practice: 'atelier', present: false, items: [] },
  {
    practice: 'studio',
    present: true,
    items: [{ from: 'studio', to: ['field', 'atelier'], text: 'A finding you `may` want.' }],
  },
]

const model = buildMiddleScoreModel(VOICES)
const W = MIDDLE_V3.score
const voiceName = Object.fromEntries(PRACTICES.map((p) => [p, ECOLOGY_V3.practices[p].name])) as Record<
  PracticeId,
  string
>

const wording: MiddleScoreWording = {
  figureLabel: W.figureLabel,
  ruler: W.ruler,
  laneQuiet: W.laneQuiet,
  hint: W.hint,
  zoom: W.zoom,
  card: W.card,
  voiceName,
  addressed: Object.fromEntries(
    model.marks.map((m) => [
      m.id,
      m.whisker ? MIDDLE_V3.voice.openLabel : MIDDLE_V3.voice.toLabel(m.to.map((p) => voiceName[p])),
    ]),
  ),
}

const render = () =>
  renderToStaticMarkup(
    <MiddleScore model={model} wording={wording} readoutId="middle-score-readout" figureId="middle-score" />,
  )

describe('the Middle score, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 — which greps this source too,
    // .tsx included since 2026-09-02 — does not read the guard itself as an offence.
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render()).not.toMatch(/ style=\{/)
  })

  it('draws the three lanes in the grammar’s own classes, the quiet one thin and said', () => {
    const html = render()
    for (const persona of ['meridian', 'ulysses', 'ensemble']) expect(html).toContain(`pr-${persona}`)
    expect(html.match(/lane-thin/g)!).toHaveLength(1)
    expect(html).toContain(W.laneQuiet)
    expect(html).toContain(W.ruler.ordinal)
    expect(html).toContain(W.ruler.mirrored)
    expect(html).toContain('class="ruler"')
    expect(html.match(/class="grat"/g)!).toHaveLength(model.marks.length)
  })

  it('draws one object square per item and a current with a ring per named sibling', () => {
    const html = render()
    expect(html.match(/mk-fill/g)!).toHaveLength(3)
    expect(html.match(/class="flow flow-down/g)!).toHaveLength(3)
    expect(html.match(/<circle class="mk pr-/g)!).toHaveLength(3)
  })

  it('draws whiskers for an item carried for both, and no current for it', () => {
    const html = render()
    expect(html.match(/class="obl/g)!).toHaveLength(2)
  })

  it('numbers every mark, and links it to its own quoted item', () => {
    const html = render()
    const anchors = [...html.matchAll(/<a [^>]*data-mark="([^"]+)"/g)].map((m) => m[1]!)
    expect(anchors).toEqual(model.marks.map((m) => m.id))
    expect(html).toContain(`href="#${itemAnchor('field', 0)}"`)
    expect(html).toContain(`href="#${itemAnchor('studio', 0)}"`)
    const badges = [...html.matchAll(/class="badge-n"[^>]*>(\d+)</g)].map((m) => Number(m[1]))
    expect(badges).toEqual([1, 2, 3])
  })

  it('titles every mark with the item’s own first words', () => {
    const html = render()
    expect(html).toContain('<title>The correction is upheld. Details follow.</title>')
    for (const mark of model.marks) expect(html).toContain(`data-lane="${mark.practice}"`)
  })

  it('keeps the zoom controls hidden until the island has mounted — no dead buttons without JS', () => {
    expect(render()).toMatch(/class="score-zoom[^"]*"[^>]*hidden/)
  })

  it('opens no card on the server — a card is what a click adds', () => {
    expect(render()).not.toContain('score-card')
  })
})

describe('the Middle score’s wording types no number', () => {
  const strings: string[] = []
  const walk = (value: unknown, path: string) => {
    // key.signRows[].mini is SVG GEOMETRY, not prose — coordinates are what it is made of.
    if (path.endsWith('.mini')) return
    if (typeof value === 'string') strings.push(value)
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
    }
  }
  walk(W, 'score')

  it('carries no digit in any fixed string — counts and numbers arrive from the data', () => {
    const offenders = strings.filter((s) => /\d/.test(s))
    expect(offenders, 'a number typed into wording goes stale; render it from the data instead').toEqual([])
  })
})

// The season floor's server render is the floor of the figure — and the second drawing of a stage
// that already had one (visual layer, Phase 3d, 2026-09-02).
//
// Two things are guarded here, and the second is the reason this file exists at all.
//
//   1. THE CONTRACT EVERY ISLAND INHERITS (docs/design/2026-09-02-the-visual-layer.md §3, duty 2):
//      the markup Astro renders on the server is the complete no-JS figure — deterministic, free
//      of style attributes, and carrying every mark's key, state and verbatim record before a
//      single script has run.
//   2. THE DRIFT GUARD. This floor has two renderers: the island below and the SVG-string builder
//      in src/lib/studio/season.ts, which the hub's thumbnails and the tour's build-time stills are
//      cut from. They must be the same drawing. So both are rendered over the REAL committed
//      record, parsed into shapes, and compared: the same tags in the same order, with the same
//      classes, the same geometry, the same mark keys and the same lettering. A change to one
//      renderer that the other did not get fails here — which is the only way a still can be
//      trusted to stand in for a figure nobody rendered beside it.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { STUDIO_NARRATIVE } from '@/config/studio-wording'
import chronicleUpstream from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import {
  buildSeasonFloorSvg,
  buildSeasonModel,
  hoverText,
  seasonRows,
  STATE_WORD,
  type SeasonInput,
  type SeasonKill,
  type SeasonModel,
  type SeasonState,
  type SeasonWorkMeta,
} from '@/lib/studio/season'

import SeasonFloor, { type SeasonFloorWording } from './SeasonFloor'

/** Every work the mirror carries, keyed by slug — the same glob season.test.ts and the site's own
 *  assembly use, so this guard runs against the floor the site actually ships. */
const METAS: Record<string, SeasonWorkMeta> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/content/studio/works/*/meta.json', { eager: true, import: 'default' }),
  ).map(([path, meta]) => [path.split('/').at(-2) as string, meta as SeasonWorkMeta]),
)

const REAL: SeasonInput = {
  chronicle: chronicleUpstream,
  metas: METAS,
  kills: stageData.kills as SeasonKill[],
}

const model = buildSeasonModel(REAL)
const w = STUDIO_NARRATIVE.seasonFloor

// The frame's own resolution, repeated here rather than imported: an .astro module cannot be
// imported into a test, and a second spelling of the wording would be exactly the drift this file
// is about. Kept in the same order SeasonFloor.astro writes it.
const LEGEND_ORDER: SeasonState[] = ['premiered', 'struck', 'returned', 'withdrawn']
const swatchOf = (state: SeasonState): string =>
  state === 'struck' || state === 'withdrawn'
    ? 'var(--st-c-struck)'
    : state === 'returned'
      ? 'var(--st-c-returned)'
      : 'var(--st-c-lit)'

const wording: SeasonFloorWording = {
  figureLabel: w.altText,
  headline: w.curtainLine,
  productionLabel: w.productionLabel,
  legendLabel: w.legendLabel,
  legend: LEGEND_ORDER.map((state) => ({
    key: state,
    label: w.legend[state].label,
    hint: w.legend[state].hint,
    swatch: swatchOf(state),
  })),
  stateWord: STATE_WORD,
  unknownEvening: w.unknownEvening,
  segmentLabel: w.segmentLabel,
  card: w.card,
}

const links: Record<string, string> = Object.fromEntries(
  model.marks
    .filter((m) => m.state !== 'struck')
    .map((m) => [m.key, `/studio/works#${m.ofWork ?? m.key.split(':')[1]}`]),
)

const render = (m: SeasonModel = model) =>
  renderToStaticMarkup(
    <SeasonFloor
      model={m}
      wording={wording}
      id="studio-season-floor"
      readoutId="studio-season-floor-readout"
      links={links}
    />,
  )

// ---------------------------------------------------------------- the two renderers, compared

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#x27': "'",
  '#39': "'",
}
const decode = (s: string) => s.replace(/&(#x27|#39|amp|lt|gt|quot);/g, (_, name: string) => ENTITIES[name] ?? _)

/** Attributes only ONE renderer has a reason to write. `data-mark` is the shared score-kit's
 *  spelling of a mark's key, needed by the island to move focus and meaningless in a static still;
 *  the pointer/focus handlers React attaches leave no attribute at all. Everything else must match. */
const ISLAND_ONLY = new Set(['data-mark'])

interface Shape {
  tag: string
  attrs: Record<string, string>
  /** the text this element carries directly, when it carries any */
  text: string
}

/**
 * Parses a drawing into the sequence of shapes it draws. Deliberately small and strict rather than
 * a real parser: it accepts exactly the markup both renderers emit (double-quoted attributes, no
 * namespaces, text nodes only inside <text> and <title>), so anything it cannot read is itself a
 * finding. Closing tags are dropped — the tag sequence plus each element's own text is what says
 * whether two drawings are the same drawing.
 */
function shapes(svg: string): Shape[] {
  const out: Shape[] = []
  const tag = /<([a-zA-Z][\w-]*)((?:\s+[a-zA-Z_:][\w:.-]*="[^"]*")*)\s*(\/?)>([^<]*)/g
  for (const m of svg.matchAll(tag)) {
    const attrs: Record<string, string> = {}
    for (const a of (m[2] ?? '').matchAll(/([a-zA-Z_:][\w:.-]*)="([^"]*)"/g)) {
      if (ISLAND_ONLY.has(a[1]!)) continue
      attrs[a[1]!] = decode(a[2]!)
    }
    out.push({ tag: m[1]!, attrs, text: decode(m[4] ?? '').trim() })
  }
  return out
}

/** The island's markup, reduced to the SVG the string builder would have written: the legend, the
 *  readout and the card are HTML the string renderer has no opinion about. */
function islandDrawing(html: string): string {
  const from = html.indexOf('<svg')
  const to = html.indexOf('</svg>')
  expect(from, 'the island renders no svg at all').toBeGreaterThanOrEqual(0)
  return html.slice(from, to)
}

describe('the season floor, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 — which greps this source too,
    // .tsx included since 2026-09-02 — does not read the guard itself as an offence.
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render()).not.toMatch(/ style=\{/)
  })

  it('gives every mark its key, its state and its own native title with the record verbatim', () => {
    const html = render()
    const keys = [...html.matchAll(/<g [^>]*data-key="([^"]+)"/g)].map((m) => m[1]!)
    expect(keys.sort()).toEqual(model.marks.map((m) => m.key).sort())
    for (const mark of model.marks) {
      expect(html, mark.key).toContain(`data-state="${mark.state}"`)
      // the verbatim record, reachable with no JavaScript at all
      const title = shapes(islandDrawing(html)).find((s) => s.tag === 'title' && s.text === hoverText(mark))
      expect(title, `${mark.key} has no native title carrying its record`).toBeDefined()
    }
  })

  it('names every state in the legend and counts it off the model', () => {
    const html = render()
    for (const item of wording.legend) {
      expect(html).toContain(`data-dv-legend-key="${item.key}"`)
      expect(html).toContain(item.label)
    }
    // nothing is filtered before a visitor asks: every mark is on, every legend button unpressed
    expect(html).not.toContain('aria-pressed="true"')
    expect((html.match(/data-on=""/g) ?? []).length).toBe(model.marks.length)
  })

  it('opens no card on the server — a card is what a click adds', () => {
    expect(render()).not.toContain('st-sf-card')
  })

  it('leaves the curtain down until the island mounts', () => {
    // st-sf-enter is added in an effect, so the server markup and the first client render agree
    expect(render()).not.toContain('st-sf-enter')
  })

  it('repeats the whole record in the table floor the frame lays under it', () => {
    const rows = seasonRows(model)
    expect(rows).toHaveLength(model.marks.length)
    for (const mark of model.marks) {
      const row = rows.find((r) => r.reason === mark.record && r.source === mark.source)
      expect(row, `${mark.key} is on the floor but not in the table`).toBeDefined()
      expect(row!.state).toBe(STATE_WORD[mark.state])
    }
  })
})

describe('the island and the string builder draw the same floor', () => {
  const fromString = shapes(
    buildSeasonFloorSvg(model, {
      label: wording.figureLabel,
      headline: wording.headline,
      productionLabel: wording.productionLabel,
    }),
  )
  const fromIsland = shapes(islandDrawing(render()))

  it('draws the same shapes in the same order', () => {
    expect(fromIsland.map((s) => s.tag)).toEqual(fromString.map((s) => s.tag))
    expect(fromIsland.map((s) => s.attrs.class ?? '')).toEqual(fromString.map((s) => s.attrs.class ?? ''))
    // the guard is worth nothing if the parser found nothing: the real record has marks in all
    // four states, so the drawing is a few hundred shapes deep
    expect(fromString.length).toBeGreaterThan(model.marks.length * 4)
  })

  const GEOMETRY = [
    'd',
    'cx',
    'cy',
    'rx',
    'ry',
    'r',
    'x',
    'y',
    'width',
    'height',
    'viewBox',
    'text-anchor',
    'preserveAspectRatio',
  ]

  it('puts every shape at the same coordinates', () => {
    const pick = (list: Shape[]) =>
      list.map((s) => GEOMETRY.filter((k) => k in s.attrs).map((k) => `${k}=${s.attrs[k]}`).join(' '))
    expect(pick(fromIsland)).toEqual(pick(fromString))
  })

  it('letters the same words on the same shapes', () => {
    expect(fromIsland.map((s) => s.text)).toEqual(fromString.map((s) => s.text))
  })

  it('keys the marks the same way, in the same order, with the same states', () => {
    const marks = (list: Shape[]) =>
      list.filter((s) => 'data-key' in s.attrs).map((s) => `${s.attrs['data-key']} ${s.attrs['data-state']}`)
    expect(marks(fromIsland)).toEqual(marks(fromString))
    expect(marks(fromString)).toHaveLength(model.marks.length)
  })

  it('agrees about the figure itself — its box, its lettering step and its accessible name', () => {
    const svgOf = (list: Shape[]) => list.find((s) => s.tag === 'svg')!.attrs
    const island = svgOf(fromIsland)
    const string = svgOf(fromString)
    for (const key of ['viewBox', 'role', 'preserveAspectRatio', 'data-lettering', 'aria-label', 'class']) {
      expect(island[key], key).toBe(string[key])
    }
  })

  it('marks every mark focusable in both — a still is the one drawing that is not', () => {
    const hooks = (list: Shape[]) => list.filter((s) => s.attrs.tabindex === '0' && s.attrs.role === 'button').length
    expect(hooks(fromIsland)).toBe(model.marks.length)
    expect(hooks(fromString)).toBe(model.marks.length)
    expect(shapes(buildSeasonFloorSvg(model, { still: true })).filter((s) => 'tabindex' in s.attrs)).toEqual([])
  })
})

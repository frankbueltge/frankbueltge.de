// The explorer's server render is the floor of the figure (visual layer, Phase 3a, 2026-09-02).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): the markup Astro renders on the server is the complete no-JS figure —
// deterministic, free of style attributes, every node and edge drawn at the model's own
// coordinates with its native title before a script has run. What JavaScript adds is the force
// relaxation, zoom, filters, search and the card; what it must never add is the graph itself.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GRAPH_EXPLORER as W } from '@/config/graph-explorer-wording'
import {
  buildGraphView,
  EDGE_KINDS,
  layoutRadial,
  NODE_KINDS,
  type GraphView,
} from '@/lib/graph/graph-explorer-model'
import type { EdgeKind, NodeKind } from '@/lib/graph/types'
import { GRAPH } from '@/lib/graph/load'

import GraphExplorer, { markShape, practiceLabel, radiusOf, type ExplorerWording } from './GraphExplorer'

const view: GraphView = buildGraphView(GRAPH)
const placed = layoutRadial(view)
const edges = view.edges.map((e) => ({ from: e.from, to: e.to, kind: e.kind }))

const wording: ExplorerWording = {
  figureLabel: W.figureLabel(W.count.nodes(view.counts.nodes), W.count.edges(view.counts.edges)),
  hint: W.hint,
  kinds: W.kinds,
  kindWhat: W.kindWhat,
  kindCount: Object.fromEntries(NODE_KINDS.map((k) => [k, W.filters.count(view.counts.nodesByKind[k] ?? 0)])) as Record<NodeKind, string>,
  edgeKinds: W.edgeKinds,
  edgeCount: Object.fromEntries(EDGE_KINDS.map((k) => [k, W.filters.count(view.counts.edgesByKind[k] ?? 0)])) as Record<EdgeKind, string>,
  voices: W.voices,
  filters: W.filters,
  search: W.search,
  zoom: W.zoom,
  card: W.card,
  degree: {},
}

const render = () =>
  renderToStaticMarkup(
    <GraphExplorer
      nodes={view.nodes}
      edges={edges}
      placed={placed}
      wording={wording}
      readoutId="graph-explorer-readout"
      figureId="graph-explorer"
      receiptsUrl="/graph/view.json"
    />,
  )

describe('the graph explorer, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 — which greps this source too —
    // does not read the guard itself as an offence.
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render()).not.toMatch(/ style=\{/)
  })

  it('draws every node once, with its kind, its voice and its native title, at the model’s coordinates', () => {
    const html = render()
    const ids = [...html.matchAll(/<g class="gx-node[^"]*"[^>]*data-node="([^"]+)"/g)].map((m) => m[1]!)
    expect(ids.sort()).toEqual(view.nodes.map((n) => n.id).sort())
    const at = new Map(placed.map((p) => [p.id, p]))
    for (const node of view.nodes.slice(0, 40)) {
      const p = at.get(node.id)!
      expect(html).toContain(`data-node="${node.id}" data-kind="${node.kind}"`)
      expect(html).toContain(`transform="translate(${p.x} ${p.y})"`)
      expect(html).toContain(`gx-v-${node.voice}`)
    }
    expect(html).toContain(`<title>${W.kinds.practice} · `)
  })

  it('draws every edge as a line with its kind, between its ends', () => {
    const html = render()
    const lines = [...html.matchAll(/<line class="gx-edge" data-edge="(\d+)" data-kind="([^"]+)"/g)]
    expect(lines.length).toBe(view.edges.length)
    lines.forEach((m, i) => {
      expect(Number(m[1])).toBe(i)
      expect(m[2]).toBe(view.edges[i]!.kind)
    })
  })

  it('letters practices and experiments at rest and carries the other labels for the reader to reveal', () => {
    const html = render()
    for (const node of view.nodes.filter((n) => n.kind === 'practice')) {
      // a practice is lettered by its persona where the record spells one ("The Field · Meridian")
      expect(html).toContain(`>${practiceLabel(node.label).replace(/&/g, '&amp;')}</text>`)
    }
    expect((html.match(/class="gx-label"/g) ?? []).length).toBe(view.nodes.length)
    expect(practiceLabel('The Field · Meridian')).toBe('Meridian')
    expect(practiceLabel('The conductor')).toBe('The conductor')
    expect(practiceLabel('MRR — the Meridian research runtime').length).toBeLessThanOrEqual(22)
  })

  it('hides nothing by default and lights nothing — no card is open on the server', () => {
    const html = render()
    expect(html).not.toContain('data-hidden=""')
    expect(html).not.toContain('data-lit=""')
    expect(html).not.toContain('data-reading')
    expect(html).not.toContain('gx-card')
  })

  it('keeps the controls hidden until the island has mounted — no dead buttons without JS', () => {
    const html = render()
    const controls = html.match(/<div class="gx-controls[^"]*"[^>]*>/g) ?? []
    expect(controls.length).toBe(2)
    for (const c of controls) expect(c).toContain('hidden')
  })

  it('draws the seven rings in the kinds’ order with their names', () => {
    const html = render()
    const rings = (html.match(/class="gx-ring"/g) ?? []).length
    expect(rings).toBe(NODE_KINDS.length)
    for (const kind of NODE_KINDS) expect(html).toContain(`>${W.kinds[kind]}</text>`)
  })
})

describe('kind is shape, weight is size', () => {
  it('gives every kind its own mark and every mark a size that grows with the degree', () => {
    const shapes = new Set(NODE_KINDS.map((kind) => renderToStaticMarkup(<svg>{markShape(kind, 5)}</svg>)))
    expect(shapes.size).toBe(NODE_KINDS.length)
    for (const kind of NODE_KINDS) {
      expect(radiusOf({ kind, degree: 12 })).toBeGreaterThan(radiusOf({ kind, degree: 0 }))
      expect(radiusOf({ kind, degree: 200 })).toBeLessThanOrEqual(radiusOf({ kind, degree: 0 }) + 6)
    }
  })
})

describe('the explorer’s wording types no number', () => {
  const strings: string[] = []
  const walk = (value: unknown) => {
    if (typeof value === 'string') strings.push(value)
    else if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk(W)

  it('carries no digit in any fixed string — counts arrive as arguments', () => {
    const offenders = strings.filter((s) => /\d/.test(s))
    expect(offenders, 'a number typed into wording goes stale; render it from the data instead').toEqual([])
  })
})

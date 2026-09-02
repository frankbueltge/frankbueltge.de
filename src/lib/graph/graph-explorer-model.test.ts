// The explorer's model over the committed graph (visual layer, Phase 3a, 2026-09-02).
//
// Three promises are held here: the VIEW is the graph with fields removed and nothing added (and
// the committed file is exactly that derivation, packed); the LAYOUT is arithmetic — same graph
// in, same coordinates out, nothing colliding, nothing off the canvas; and the QUESTIONS the
// island asks (filter, search, receipts, neighbourhood) answer out of the view alone.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { GRAPH } from './load'
import {
  ALL_ON,
  buildGraphView,
  CANVAS,
  EDGE_KINDS,
  filterView,
  LABEL_FULL_MAX,
  LABEL_MAX,
  layoutRadial,
  MIN_GAP,
  neighbourhood,
  NODE_KINDS,
  NOTE_MAX,
  packView,
  QUOTE_MAX,
  receiptsOf,
  RING,
  searchView,
  shortLabel,
  unpackView,
  viewRows,
  type PackedView,
} from './graph-explorer-model'

const view = buildGraphView(GRAPH)
const committed = JSON.parse(readFileSync(new URL('../../data/graph/graph-view.json', import.meta.url), 'utf8')) as PackedView

describe('the view is the graph with fields removed, nothing added', () => {
  it('carries every node and every edge of the graph, once', () => {
    expect(view.nodes.map((n) => n.id).sort()).toEqual(GRAPH.nodes.map((n) => n.id).sort())
    expect(view.edges.length).toBe(GRAPH.edges.length)
    expect(view.counts.nodes).toBe(GRAPH.nodes.length)
    expect(view.counts.edges).toBe(GRAPH.edges.length)
  })

  it('keeps every edge’s receipt — the file and words it was read from — and says when a quote was cut', () => {
    const byKey = new Map(GRAPH.edges.map((e) => [`${e.kind}|${e.from}|${e.to}`, e]))
    for (const edge of view.edges) {
      const source = byKey.get(`${edge.kind}|${edge.from}|${edge.to}`)
      expect(source, `${edge.kind} ${edge.from} → ${edge.to} is not in the graph`).toBeDefined()
      expect(edge.file).toBe(source!.source.file)
      const whole = source!.source.quote.replace(/\s+/g, ' ').trim()
      if (edge.cut) {
        expect(whole.length).toBeGreaterThan(QUOTE_MAX)
        expect(edge.quote.endsWith('…')).toBe(true)
        expect(whole.startsWith(edge.quote.slice(0, -1))).toBe(true)
      } else {
        expect(edge.quote).toBe(whole)
      }
      expect(edge.quote.length).toBeLessThanOrEqual(QUOTE_MAX)
      if (edge.note) expect(edge.note.length).toBeLessThanOrEqual(NOTE_MAX)
    }
  })

  it('gives the three practices their voices and everything else the declared neutral', () => {
    const voice = new Map(view.nodes.map((n) => [n.id, n.voice]))
    expect(voice.get('practice:meridian')).toBe('meridian')
    expect(voice.get('practice:ulysses')).toBe('ulysses')
    expect(voice.get('practice:ensemble')).toBe('ensemble')
    expect(voice.get('practice:conductor')).toBe('conductor')
    for (const node of view.nodes) {
      if (node.kind === 'decision' || node.kind === 'neighbor' || node.kind === 'receiver' || node.kind === 'encounter') {
        expect(node.voice, `${node.id} is the house’s or the world’s and wears no voice`).toBe('conductor')
      }
    }
    // a practice work wears its maker's voice
    for (const edge of view.edges.filter((e) => e.kind === 'made-by')) {
      expect(voice.get(edge.from)).toBe(voice.get(edge.to))
    }
  })

  it('cuts labels for the file and again for the drawing, on a word where one is near', () => {
    for (const node of view.nodes) expect(node.label.length).toBeLessThanOrEqual(LABEL_FULL_MAX)
    expect(shortLabel('short')).toBe('short')
    const long = shortLabel('The site entrance becomes the Partitur (score map) of the current season and its works')
    expect(long.length).toBeLessThanOrEqual(LABEL_MAX)
    expect(long.endsWith('…')).toBe(true)
    expect(long).not.toMatch(/ …$/)
  })

  it('orders totally, so an unchanged graph yields a byte-identical view', () => {
    expect(JSON.stringify(buildGraphView(GRAPH))).toBe(JSON.stringify(view))
  })
})

describe('the committed view is the derivation, packed — run `npm run graph:build` if this fails', () => {
  it('matches a fresh build of the committed graph', () => {
    expect(committed).toEqual(packView(view))
  })

  it('unpacks to exactly the view it was packed from', () => {
    expect(unpackView(packView(view))).toEqual(view)
  })

  it('names its columns, so a reader without this module can read the file', () => {
    expect(committed.columns.nodes).toEqual(['id', 'kind', 'label', 'voice', 'degree', 'date', 'href', 'rank'])
    expect(committed.columns.edges).toEqual(['from', 'to', 'kind', 'file', 'quote', 'cut', 'note'])
    expect(committed.kinds).toEqual(NODE_KINDS)
    expect(committed.edgeKinds).toEqual(EDGE_KINDS)
  })

  it('stays under the size the plan budgets for it', () => {
    const bytes = readFileSync(new URL('../../data/graph/graph-view.json', import.meta.url)).byteLength
    expect(bytes, 'the view outgrew its budget — cut QUOTE_MAX or NOTE_MAX before raising it').toBeLessThanOrEqual(120 * 1024)
  })
})

describe('the radial layout is arithmetic over the record', () => {
  const placed = layoutRadial(view)
  const at = new Map(placed.map((p) => [p.id, p]))

  it('places every node once, inside the canvas', () => {
    expect(placed.length).toBe(view.nodes.length)
    expect(new Set(placed.map((p) => p.id)).size).toBe(view.nodes.length)
    for (const p of placed) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(CANVAS)
      expect(p.y).toBeLessThanOrEqual(CANVAS)
    }
  })

  it('is deterministic — the same view yields the same coordinates', () => {
    expect(layoutRadial(view)).toEqual(placed)
  })

  it('lets no two nodes stand closer than the gap', () => {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!
        const b = placed[j]!
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        expect(d, `${a.id} and ${b.id} collide (${d.toFixed(1)} px)`).toBeGreaterThanOrEqual(MIN_GAP - 1e-9)
      }
    }
  })

  it('keeps every kind on its own ring, stepping outward at most one band', () => {
    for (const node of view.nodes) {
      const p = at.get(node.id)!
      const r = Math.hypot(p.x - CANVAS / 2, p.y - CANVAS / 2)
      expect(r, `${node.id} left its ring`).toBeGreaterThanOrEqual(RING[node.kind] - 0.01)
      expect(r).toBeLessThanOrEqual(RING[node.kind] + 30 + 0.01)
    }
  })

  it('stands a practice work in its maker’s sector and a neighbour beside its experiment', () => {
    const angle = (id: string) => {
      const p = at.get(id)!
      return Math.atan2(p.y - CANVAS / 2, p.x - CANVAS / 2)
    }
    const diff = (a: number, b: number) => {
      const d = Math.abs(a - b) % (Math.PI * 2)
      return d > Math.PI ? Math.PI * 2 - d : d
    }
    const edges = view.edges.filter((e) => e.kind === 'made-by')
    // in radians: 15° of the maker for every work, the sector being proportional to the making
    for (const e of edges) expect(diff(angle(e.from), angle(e.to))).toBeLessThan((Math.PI / 180) * 130)
    const neighbours = view.edges.filter((e) => e.kind === 'neighbor-of')
    for (const e of neighbours) expect(diff(angle(e.from), angle(e.to))).toBeLessThan((Math.PI / 180) * 30)
  })
})

describe('the island’s questions answer out of the view alone', () => {
  it('filters by kind and drops an edge whose end is hidden', () => {
    const all = filterView(view, ALL_ON)
    expect(all.nodes.size).toBe(view.nodes.length)
    expect(all.edges.size).toBe(view.edges.length)
    const noNeighbours = filterView(view, { kinds: NODE_KINDS.filter((k) => k !== 'neighbor'), edgeKinds: EDGE_KINDS })
    expect([...noNeighbours.nodes].some((id) => id.startsWith('neighbor:'))).toBe(false)
    view.edges.forEach((e, i) => {
      if (e.kind === 'neighbor-of') expect(noNeighbours.edges.has(i)).toBe(false)
    })
    const noEdges = filterView(view, { kinds: NODE_KINDS, edgeKinds: [] })
    expect(noEdges.edges.size).toBe(0)
    expect(noEdges.nodes.size).toBe(view.nodes.length)
  })

  it('ranks an exact label first and the house’s own things before the world’s', () => {
    const society = view.nodes.find((n) => n.kind === 'work' && n.label === 'Society')!
    expect(searchView(view, 'society')[0]!.id).toBe(society.id)
    expect(searchView(view, '')).toEqual([])
    expect(searchView(view, 'zzzz-nothing-by-this-name')).toEqual([])
    expect(searchView(view, 'the', 5).length).toBe(5)
  })

  it('lists a node’s receipts — every edge with its file and quote — and its neighbourhood', () => {
    const meridian = 'practice:meridian'
    const receipts = receiptsOf(view, meridian)
    expect(receipts.length).toBe(view.nodes.find((n) => n.id === meridian)!.degree)
    for (const r of receipts) {
      expect(r.edge.file.length).toBeGreaterThan(0)
      expect(r.edge.quote.length).toBeGreaterThan(0)
      expect(r.other.id).not.toBe(meridian)
      expect(r.direction === 'out' ? r.edge.from : r.edge.to).toBe(meridian)
    }
    const near = neighbourhood(view, meridian)
    expect(near.has(meridian)).toBe(true)
    expect(near.size).toBe(new Set(receipts.map((r) => r.other.id)).size + 1)
  })

  it('lays a table row per node, in the view’s order', () => {
    const rows = viewRows(view)
    expect(rows.length).toBe(view.nodes.length)
    expect(rows.map((r) => r.label)).toEqual(view.nodes.map((n) => n.label))
  })
})

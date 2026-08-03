// src/lib/apparatus/map.ts — the apparatus map's geometry: where each node sits, how each edge
// runs, and the SVG that draws them. Pure and deterministic — same topology, same drawing, every
// build. Model in, markup out; no clock, no randomness, no network.
//
// The four rendering rules this figure inherits from src/lib/atelier/passage.ts, the house's
// reference implementation:
//   · no colour, ever — a mark carries `data-owner`/`data-kind` and the stylesheet decides what
//     that looks like (ADR 0010: the practices share no visual grammar, so none is imposed here);
//   · no `style=""` attribute — the site's CSP carries style hashes and no 'unsafe-hashes', so
//     the browser drops them silently and whatever they carried has no effect;
//   · every mark carries a native `<title>`, so the figure is readable without a hover readout;
//   · `still: true` strips every interaction hook, because a still is a picture, not a control.
//
// WHAT THE LAYOUT ASSERTS. The ecology has two inflows into its archive, and the figure is built
// so a reader sees that before reading a single label: the world enters through instruments
// (measurement), the practices enter through gates (research), and both converge on the same
// committed files. Position carries that claim. Colour carries only ownership. Shape carries only
// what kind of thing a node is. No channel is asked to mean two things at once.
//
// Oversight sits outside the flow on purpose — watchdogs, inlets and the conductor act ON the
// apparatus rather than passing material through it, and a figure that lined them up with the
// rest would be claiming they are a stage of it.

import { escapeXml } from '@/lib/dataviz/geometry'
import { domainOf, type ApparatusEdge, type ApparatusNode, type Layer } from './topology'

// ── layout constants (viewBox units) ─────────────────────────────────────────

/** Wide enough for the last column's own chain — build → host → the severed second deployer are
 *  all in the delivery column, so their connectors bow out to the right of it and need canvas. */
const VB_W = 1220
const NODE_W = 208
const NODE_H = 34
const ROW_GAP = 9
const ROW = NODE_H + ROW_GAP
const TOP = 54
const BAND_GAP = 40
const OVERSIGHT_GAP = 52
/** The first column starts well inside the frame on purpose: returning edges — a gate's refusal
 *  letter going back to a practice, a watchdog reaching back to a gate — bow out to the left of
 *  everything, and without this gutter they would bow straight off the canvas. */
const GUTTER = 96
const COL_X = [GUTTER, 344, 648, 916] as const

/** Which column a layer stands in, and which horizontal band it belongs to. `archive` and
 *  `delivery` span both bands: everything converges there, so they are centred across the two. */
const PLACE: Record<Layer, { col: number; band: 'measure' | 'practice' | 'span' | 'foot' }> = {
  world: { col: 0, band: 'measure' },
  instruments: { col: 1, band: 'measure' },
  practices: { col: 0, band: 'practice' },
  gates: { col: 1, band: 'practice' },
  archive: { col: 2, band: 'span' },
  delivery: { col: 3, band: 'span' },
  oversight: { col: 0, band: 'foot' },
}

export interface PlacedNode {
  node: ApparatusNode
  x: number
  y: number
  w: number
  h: number
}

export interface PlacedEdge {
  edge: ApparatusEdge
  /** the path the connector runs along */
  d: string
  /** midpoint, where a severed edge gets its break mark */
  mx: number
  my: number
}

export interface ApparatusModel {
  nodes: PlacedNode[]
  edges: PlacedEdge[]
  width: number
  height: number
  /** band label anchors, drawn as the figure's own column headings */
  headings: { label: string; x: number; y: number }[]
}

const layerOrder: Layer[] = ['world', 'instruments', 'practices', 'gates', 'archive', 'delivery', 'oversight']

/**
 * Stacks each layer in its column and returns absolute geometry. Deterministic: the order inside
 * a layer is the order the topology declares, never sorted by a value that could change under it.
 */
export function buildApparatusModel(
  nodes: readonly ApparatusNode[],
  edges: readonly ApparatusEdge[],
): ApparatusModel {
  const byLayer = new Map<Layer, ApparatusNode[]>()
  for (const layer of layerOrder) byLayer.set(layer, [])
  for (const n of nodes) byLayer.get(n.layer)?.push(n)

  const rowsIn = (layer: Layer): number => byLayer.get(layer)?.length ?? 0
  const measureH = Math.max(rowsIn('world'), rowsIn('instruments')) * ROW
  const practiceH = Math.max(rowsIn('practices'), rowsIn('gates')) * ROW

  const measureTop = TOP
  const practiceTop = measureTop + measureH + BAND_GAP
  const flowBottom = practiceTop + practiceH
  const spanH = Math.max(rowsIn('archive'), rowsIn('delivery')) * ROW
  const spanTop = measureTop + (flowBottom - measureTop - spanH) / 2
  const footTop = flowBottom + OVERSIGHT_GAP

  const bandTop = (band: 'measure' | 'practice' | 'span' | 'foot'): number =>
    band === 'measure' ? measureTop : band === 'practice' ? practiceTop : band === 'span' ? spanTop : footTop

  const placed: PlacedNode[] = []
  for (const layer of layerOrder) {
    const { col, band } = PLACE[layer]
    const list = byLayer.get(layer) ?? []
    list.forEach((node, i) => {
      // The oversight strip runs along the foot rather than down a column: it is not a stage of
      // the flow, and stacking it in column 0 would read as one.
      const x = layer === 'oversight' ? COL_X[0] + i * (NODE_W + 46) : COL_X[col]
      const y = layer === 'oversight' ? footTop : bandTop(band) + i * ROW
      placed.push({ node, x, y, w: NODE_W, h: NODE_H })
    })
  }

  const at = new Map(placed.map((p) => [p.node.id, p]))
  const placedEdges: PlacedEdge[] = []
  for (const edge of edges) {
    const a = at.get(edge.from)
    const b = at.get(edge.to)
    if (!a || !b) continue
    placedEdges.push(connector(a, b, edge))
  }

  const height = footTop + NODE_H + 46
  return {
    nodes: placed,
    edges: placedEdges,
    width: VB_W,
    height,
    headings: [
      { label: 'the world', x: COL_X[0], y: measureTop - 14 },
      { label: 'instruments', x: COL_X[1], y: measureTop - 14 },
      { label: 'the practices', x: COL_X[0], y: practiceTop - 14 },
      { label: 'the gates', x: COL_X[1], y: practiceTop - 14 },
      { label: 'the archive', x: COL_X[2], y: spanTop - 14 },
      { label: 'out', x: COL_X[3], y: spanTop - 14 },
      { label: 'oversight — acting on the apparatus, not passing through it', x: COL_X[0], y: footTop - 14 },
    ],
  }
}

/**
 * One connector, in three cases — because a return is not a forward step and must not look like
 * one:
 *   · forward (left to right): a flat cubic between the facing edges of the two boxes;
 *   · backward: out of the left face, bowing into the gutter, back into the left face — so a
 *     refusal letter travelling from a gate back to its practice reads as travelling back;
 *   · same column: bowing out to the RIGHT, where there is free canvas. Bowing left here would
 *     send the line back across the archive it has nothing to do with, which is how the severed
 *     deploy edge first drew its break mark in the middle of the store column.
 */
function connector(a: PlacedNode, b: PlacedNode, edge: ApparatusEdge): PlacedEdge {
  const ay = a.y + a.h / 2
  const by = b.y + b.h / 2

  if (b.x > a.x) {
    const x1 = a.x + a.w
    const x2 = b.x
    const c = Math.max(34, (x2 - x1) * 0.45)
    return {
      edge,
      d: `M${r(x1)} ${r(ay)} C${r(x1 + c)} ${r(ay)} ${r(x2 - c)} ${r(by)} ${r(x2)} ${r(by)}`,
      mx: r((x1 + x2) / 2),
      my: r((ay + by) / 2),
    }
  }

  if (b.x === a.x) {
    const x1 = a.x + a.w
    const bow = x1 + 34
    return {
      edge,
      d: `M${r(x1)} ${r(ay)} C${r(bow + 26)} ${r(ay)} ${r(bow + 26)} ${r(by)} ${r(x1)} ${r(by)}`,
      mx: r(bow + 12),
      my: r((ay + by) / 2),
    }
  }

  // backward: into the gutter and back, never past the left edge of the canvas
  const x1 = a.x
  const x2 = b.x
  const bow = Math.max(14, Math.min(x1, x2) - GUTTER * 0.55)
  return {
    edge,
    d: `M${r(x1)} ${r(ay)} C${r(bow)} ${r(ay)} ${r(bow)} ${r(by)} ${r(x2)} ${r(by)}`,
    mx: r(bow + 10),
    my: r((ay + by) / 2),
  }
}

/** One decimal is plenty at this scale and keeps the markup byte-stable across platforms. */
const r = (n: number): number => Math.round(n * 10) / 10

// ── the mark for each kind of thing ──────────────────────────────────────────

/**
 * Shape carries what kind of thing a node is — never its state, and never its owner. Drawn as
 * geometry rather than a glyph so it does not depend on a font shipping the character.
 */
export function kindMark(kind: ApparatusNode['kind'], cx: number, cy: number): string {
  const g = (body: string): string => `<g class="ap-glyph" data-kind="${kind}">${body}</g>`
  switch (kind) {
    case 'source':
      return g(`<circle cx="${r(cx)}" cy="${r(cy)}" r="4.5" />`)
    case 'pipeline':
      return g(`<rect x="${r(cx - 4)}" y="${r(cy - 4)}" width="8" height="8" />`)
    case 'repo':
      return g(`<rect x="${r(cx - 5)}" y="${r(cy - 4)}" width="10" height="8" rx="1.5" />`)
    case 'gate':
      return g(`<path d="M${r(cx - 4)} ${r(cy - 5)} L${r(cx + 5)} ${r(cy)} L${r(cx - 4)} ${r(cy + 5)} Z" />`)
    case 'store':
      return g(
        `<path d="M${r(cx - 5)} ${r(cy - 4)} H${r(cx + 5)} M${r(cx - 5)} ${r(cy)} H${r(cx + 5)} M${r(cx - 5)} ${r(cy + 4)} H${r(cx + 5)}" />`,
      )
    case 'service':
      return g(`<path d="M${r(cx)} ${r(cy - 5)} L${r(cx + 5)} ${r(cy)} L${r(cx)} ${r(cy + 5)} L${r(cx - 5)} ${r(cy)} Z" />`)
    case 'host':
      return g(`<path d="M${r(cx)} ${r(cy - 5)} L${r(cx + 5)} ${r(cy + 4)} H${r(cx - 5)} Z" />`)
    case 'person':
      return g(`<circle cx="${r(cx)}" cy="${r(cy)}" r="5" /><circle cx="${r(cx)}" cy="${r(cy)}" r="2" />`)
  }
}

// ── trace ────────────────────────────────────────────────────────────────────

/**
 * Everything reachable from one node, in both directions — what a reader gets when they ask
 * "what happens when Meridian lands?" and the figure answers with a path instead of a search.
 *
 * The rule it follows, and the one real choice in it: a trace crosses `oversight` edges but does
 * not continue THROUGH an oversight node. Following a watchdog onwards would pull in every gate
 * it can start and, from there, the whole apparatus — a highlight that lights everything up says
 * nothing. So oversight shows as a destination or an origin, never as a corridor.
 */
export function traceFrom(edges: readonly ApparatusEdge[], nodes: readonly ApparatusNode[], id: string): Set<string> {
  const layerOf = new Map(nodes.map((n) => [n.id, n.layer]))
  const seen = new Set<string>([id])
  const walk = (from: string, forward: boolean): void => {
    for (const e of edges) {
      const [here, there] = forward ? [e.from, e.to] : [e.to, e.from]
      if (here !== from || seen.has(there)) continue
      seen.add(there)
      if (layerOf.get(there) !== 'oversight') walk(there, forward)
    }
  }
  if (layerOf.get(id) === 'oversight') {
    // starting IN oversight is the one case where it may be a corridor: the reader asked for it
    for (const e of edges) {
      if (e.from === id) seen.add(e.to)
      if (e.to === id) seen.add(e.from)
    }
  } else {
    walk(id, true)
    walk(id, false)
  }
  return seen
}

/** Which edges connect two nodes that are both in the traced set — the lines to light up. */
export function traceEdgeKeys(edges: readonly ApparatusEdge[], traced: ReadonlySet<string>): string[] {
  return edges.filter((e) => traced.has(e.from) && traced.has(e.to)).map(edgeKey)
}

export const edgeKey = (e: ApparatusEdge): string => `${e.from}~${e.to}`

// ── svg ──────────────────────────────────────────────────────────────────────

export interface ApparatusRenderOptions {
  /** a still carries no interaction hooks: no tabindex, no keys, no role="button" */
  still?: boolean
  label: string
}

export function buildApparatusSvg(model: ApparatusModel, opts: ApparatusRenderOptions): string {
  const live = !opts.still
  const s: string[] = []
  s.push(
    `<svg class="ap-svg" viewBox="0 0 ${model.width} ${r(model.height)}" role="img"` +
      ` preserveAspectRatio="xMidYMid meet" aria-label="${escapeXml(opts.label)}">`,
  )

  // headings first, so every connector draws over them and nothing is lost under a label
  s.push('<g class="ap-headings">')
  for (const h of model.headings) {
    s.push(`<text class="ap-heading" x="${r(h.x)}" y="${r(h.y)}">${escapeXml(h.label)}</text>`)
  }
  s.push('</g>')

  s.push('<g class="ap-edges">')
  for (const { edge, d, mx, my } of model.edges) {
    const attrs = [
      'class="ap-edge"',
      `data-edge="${escapeXml(edgeKey(edge))}"`,
      `data-checked="${edge.checked}"`,
      `data-mech="${edge.kind}"`,
      `data-from="${escapeXml(edge.from)}"`,
      `data-to="${escapeXml(edge.to)}"`,
    ]
    if (edge.severed) attrs.push('data-severed=""')
    s.push(`<g ${attrs.join(' ')}>`)
    s.push(`<title>${escapeXml(`${edge.from} → ${edge.to}: ${edge.mechanism}`)}</title>`)
    s.push(`<path class="ap-edge-line" d="${d}" />`)
    if (edge.severed) {
      // the break is geometry, so it survives with styles off; what it means is in the title
      s.push(`<path class="ap-edge-break" d="M${r(mx - 5)} ${r(my - 7)} L${r(mx + 5)} ${r(my + 7)}" />`)
      s.push(`<path class="ap-edge-break" d="M${r(mx + 5)} ${r(my - 7)} L${r(mx - 5)} ${r(my + 7)}" />`)
    }
    s.push('</g>')
  }
  s.push('</g>')

  s.push('<g class="ap-nodes">')
  for (const { node, x, y, w, h } of model.nodes) {
    const attrs = [
      'class="ap-node"',
      `data-owner="${node.owner}"`,
      `data-layer="${node.layer}"`,
      `data-node-kind="${node.kind}"`,
      `data-domain="${domainOf(node.id) ?? 'shared'}"`,
    ]
    if (live) attrs.push(`data-key="${escapeXml(node.id)}"`, 'tabindex="0"', 'role="button"')
    s.push(`<g ${attrs.join(' ')}>`)
    s.push(`<title>${escapeXml(`${node.label} — ${node.what}`)}</title>`)
    s.push(`<rect class="ap-box" x="${r(x)}" y="${r(y)}" width="${w}" height="${h}" rx="3" />`)
    s.push(kindMark(node.kind, x + 17, y + h / 2))
    s.push(`<text class="ap-label" x="${r(x + 32)}" y="${r(y + h / 2 + 4)}">${escapeXml(node.label)}</text>`)
    if (node.members?.length) {
      s.push(
        `<text class="ap-count" x="${r(x + w - 10)}" y="${r(y + h / 2 + 4)}">${node.members.length}</text>`,
      )
    }
    s.push('</g>')
  }
  s.push('</g>')

  s.push('</svg>')
  return s.join('')
}

// ── the table floor ──────────────────────────────────────────────────────────

export interface ApparatusRow {
  from: string
  to: string
  mechanism: string
  checked: string
  record: string
  /** TableFallback takes Record<string, string | number>; this keeps the named fields above
   *  while satisfying it, rather than loosening the row type to a bare record. */
  [key: string]: string
}

export const APPARATUS_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'from', label: 'from', nowrap: true },
  { key: 'to', label: 'to', nowrap: true },
  { key: 'mechanism', label: 'mechanism' },
  { key: 'checked', label: 'vouched for' },
  { key: 'record', label: 'written in' },
]

/** Every edge as a row — the figure is the overview, this is the floor under it. */
export function apparatusRows(nodes: readonly ApparatusNode[], edges: readonly ApparatusEdge[]): ApparatusRow[] {
  const label = new Map(nodes.map((n) => [n.id, n.label]))
  return edges.map((e) => ({
    from: label.get(e.from) ?? e.from,
    to: label.get(e.to) ?? e.to,
    mechanism: e.severed ? `${e.mechanism} — severed: ${e.severed}` : e.mechanism,
    checked: e.checked === 'derived' ? 'read back from the file' : 'declared here',
    record: e.ref ?? '—',
  }))
}

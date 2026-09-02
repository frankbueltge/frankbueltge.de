// src/lib/graph/graph-explorer-model.ts — the knowledge graph, shaped for the explorer on
// /experiments/neighbors (visual layer, Phase 3a, 2026-09-02; docs/design/2026-09-02-the-
// visual-layer.md §4).
//
// The graph itself (src/data/graph/graph.json) is the instrument: every node and edge derived
// from a committed file and carrying the words it was read out of. This module does three
// things to it and nothing else:
//
//   1. TRIMS it to what a drawing needs — a view (`buildGraphView`) with ids, kinds, labels,
//      dates, links and, on every edge, the file and the quote it came from. The quote is cut
//      at QUOTE_MAX and SAYS SO (`cut: true`); the whole sentence stays in graph.json, which the
//      card names. Nothing is added: a view node is a graph node with fields removed.
//   2. PLACES it, deterministically (`layoutRadial`): one ring per kind, the house in the
//      middle and the world at the edge, every node at an angle its own relations decide — a
//      practice work in its maker's sector, a neighbour beside the experiment it neighbours, a
//      decision at the mean of the works it touches. Same graph in, same coordinates out, no
//      randomness: this is the server-rendered floor and the island's warm start. The force
//      layout on the client (d3-force) only relaxes it; it never invents the picture.
//   3. ANSWERS the island's questions purely: which nodes and edges a filter keeps
//      (`filterView`), what a search term ranks first (`searchView`, the same ranking the
//      command line uses in query.ts), and what receipts a node carries (`receiptsOf`).
//
// Pure and browser-free, like every figure lib in this house (dataviz duty 1): the island
// mounts, animates and answers the pointer; the numbers come from here.

import type { EdgeKind, GraphNode, KnowledgeGraph, NodeKind } from './types'

/** The identity a node wears. Three voices are categorical slots of the `ecology-voices` palette
 *  (src/lib/dataviz/palette.ts); `conductor` is that set's declared neutral — the house itself,
 *  and the world outside it, wear grey by declaration. Nothing else is a slot. */
export type Voice = 'meridian' | 'ulysses' | 'ensemble' | 'conductor'

export const VOICES: readonly Voice[] = ['meridian', 'ulysses', 'ensemble', 'conductor'] as const

/** Drawing order of the kinds — the house from the inside out, then the world. */
export const NODE_KINDS: readonly NodeKind[] = [
  'practice',
  'encounter',
  'work',
  'practice-work',
  'receiver',
  'neighbor',
  'decision',
] as const

export const EDGE_KINDS: readonly EdgeKind[] = [
  'door',
  'made-by',
  'participates',
  'concerns',
  'touches',
  'neighbor-of',
  'addresses',
] as const

/** How much of an edge's quote the view carries. The median quote is 31 characters and the
 *  longest 554; a card shows the receipt, it does not reprint the record. */
export const QUOTE_MAX = 140
/** How much of a label the VIEW carries. Decision labels are whole headlines (up to 655
 *  characters); the card shows this much and names the file that carries the rest. */
export const LABEL_FULL_MAX = 160
/** How much of an edge's note (an audit's one-line characterisation, a packet's title) the
 *  view carries; the file the edge names carries the rest. */
export const NOTE_MAX = 160
/** How much of a label the DRAWING letters — computed from the view label by `shortLabel`,
 *  never stored, so the view file stays small. */
export const LABEL_MAX = 44

export interface ViewNode {
  id: string
  kind: NodeKind
  /** the node's own label, cut at LABEL_FULL_MAX with an ellipsis where it was cut */
  label: string
  voice: Voice
  date?: string
  href?: string
  /** rank on /experiments, works only — orders the works ring the way the shelf does */
  rank?: number
  /** how many edges touch this node, both directions */
  degree: number
}

export interface ViewEdge {
  from: string
  to: string
  kind: EdgeKind
  /** the edge's own note (an audit's one-line characterisation, a packet's title …) */
  note?: string
  /** committed file the edge was read out of */
  file: string
  /** the words that carry the fact, cut at QUOTE_MAX */
  quote: string
  /** true when the quote above is shorter than the one in graph.json */
  cut: boolean
}

export interface GraphView {
  /** what this view is, for anyone who opens the json without the design doc */
  instrument: string
  counts: {
    nodes: number
    edges: number
    nodesByKind: Record<string, number>
    edgesByKind: Record<string, number>
  }
  nodes: ViewNode[]
  edges: ViewEdge[]
}

/** Voice from the way the records name a practice (normalised by the graph builder). */
function voiceOfPractice(practiceId: string | undefined): Voice {
  if (practiceId === 'meridian' || practiceId === 'ulysses' || practiceId === 'ensemble') return practiceId
  return 'conductor'
}

function cutLabel(label: string, max: number): string {
  const clean = label.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const head = clean.slice(0, max - 1)
  const space = head.lastIndexOf(' ')
  return `${(space > max * 0.6 ? head.slice(0, space) : head).trimEnd()}…`
}

/** The label as the drawing letters it: cut at LABEL_MAX on a word boundary where one is near. */
export function shortLabel(label: string): string {
  return cutLabel(label, LABEL_MAX)
}

function cutQuote(quote: string): { quote: string; cut: boolean } {
  const clean = quote.replace(/\s+/g, ' ').trim()
  if (clean.length <= QUOTE_MAX) return { quote: clean, cut: false }
  return { quote: `${clean.slice(0, QUOTE_MAX - 1).trimEnd()}…`, cut: true }
}

function hrefOf(node: GraphNode): string | undefined {
  switch (node.kind) {
    case 'work':
    case 'practice-work':
      return node.href
    case 'neighbor':
      return node.url
    case 'encounter':
      return node.recordUrl ?? '/encounters/register'
    case 'receiver':
      return '/post'
    case 'decision':
      return undefined
    case 'practice':
      return undefined
  }
}

/** The view: the graph with the fields a drawing does not need removed, and a receipt on
 *  every edge. Order is total — kind order, then label, then id — so the file is byte-stable
 *  across rebuilds of an unchanged graph. */
export function buildGraphView(graph: KnowledgeGraph): GraphView {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const degree = new Map<string, number>()
  for (const edge of graph.edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1)
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1)
  }

  // A practice's door: the work this site opens for it, which the work then wears as its voice.
  const doorVoice = new Map<string, Voice>()
  for (const edge of graph.edges) {
    if (edge.kind !== 'door') continue
    const practice = byId.get(edge.from)
    if (practice?.kind === 'practice') doorVoice.set(edge.to, voiceOfPractice(practice.practiceId))
  }
  const practiceHref = new Map<string, string>()
  for (const edge of graph.edges) {
    if (edge.kind !== 'door') continue
    const work = byId.get(edge.to)
    if (work?.kind === 'work' && !practiceHref.has(edge.from)) practiceHref.set(edge.from, work.href)
  }

  const kindOrder = new Map(NODE_KINDS.map((k, i) => [k, i]))
  const nodes: ViewNode[] = graph.nodes
    .map((node): ViewNode => {
      const voice: Voice =
        node.kind === 'practice'
          ? voiceOfPractice(node.practiceId)
          : node.kind === 'practice-work'
            ? voiceOfPractice(node.practiceId)
            : node.kind === 'work'
              ? (doorVoice.get(node.id) ?? 'conductor')
              : 'conductor'
      const href = node.kind === 'practice' ? practiceHref.get(node.id) : hrefOf(node)
      const date =
        node.kind === 'decision' || node.kind === 'practice-work'
          ? node.date
          : node.kind === 'work'
            ? node.since
            : undefined
      const view: ViewNode = {
        id: node.id,
        kind: node.kind,
        label: cutLabel(node.label, LABEL_FULL_MAX),
        voice,
        degree: degree.get(node.id) ?? 0,
      }
      if (date) view.date = date
      if (href) view.href = href
      if (node.kind === 'work' && typeof node.rank === 'number') view.rank = node.rank
      return view
    })
    .sort(
      (a, b) =>
        (kindOrder.get(a.kind) ?? 99) - (kindOrder.get(b.kind) ?? 99) ||
        a.label.localeCompare(b.label) ||
        a.id.localeCompare(b.id),
    )

  const edgeOrder = new Map(EDGE_KINDS.map((k, i) => [k, i]))
  const edges: ViewEdge[] = graph.edges
    .map((edge): ViewEdge => {
      const { quote, cut } = cutQuote(edge.source.quote)
      const view: ViewEdge = { from: edge.from, to: edge.to, kind: edge.kind, file: edge.source.file, quote, cut }
      if (edge.note) view.note = cutLabel(edge.note, NOTE_MAX)
      return view
    })
    .sort(
      (a, b) =>
        (edgeOrder.get(a.kind) ?? 99) - (edgeOrder.get(b.kind) ?? 99) ||
        a.from.localeCompare(b.from) ||
        a.to.localeCompare(b.to),
    )

  const nodesByKind: Record<string, number> = {}
  for (const n of nodes) nodesByKind[n.kind] = (nodesByKind[n.kind] ?? 0) + 1
  const edgesByKind: Record<string, number> = {}
  for (const e of edges) edgesByKind[e.kind] = (edgesByKind[e.kind] ?? 0) + 1

  return {
    instrument:
      'The knowledge graph of frankbueltge.de, trimmed for the explorer on /experiments/neighbors: ' +
      'every node and edge of src/data/graph/graph.json with the fields a drawing does not need ' +
      'removed, and on every edge the committed file and the quote it was read from (quotes cut ' +
      'at ' +
      QUOTE_MAX +
      ' characters and marked; labels at ' +
      LABEL_FULL_MAX +
      '). Derived by scripts/build-graph-view.ts inside `npm run graph:build`; never edited by hand.',
    counts: { nodes: nodes.length, edges: edges.length, nodesByKind, edgesByKind },
    nodes,
    edges,
  }
}

// ---------------------------------------------------------------------------- the file

/** The view as it is written to disk and served: the same facts as `GraphView`, in columns.
 *  A node is a row, an edge is a row, the kinds, voices and files are looked up by index — the
 *  file names its columns, so a reader without this module can still read it. Rows instead of
 *  objects because the object keys alone were a fifth of the file, and the file has a budget
 *  (scripts/build-graph-view.ts). `packView` and `unpackView` are exact inverses; the test
 *  holds them to it. */
export interface PackedView {
  instrument: string
  counts: GraphView['counts']
  columns: { nodes: readonly string[]; edges: readonly string[] }
  kinds: readonly NodeKind[]
  edgeKinds: readonly EdgeKind[]
  voices: readonly Voice[]
  files: string[]
  /** [id, kind index, label, voice index, degree, date or '', href or '', rank or -1] */
  nodes: Array<[string, number, string, number, number, string, string, number]>
  /** [from node index, to node index, edge-kind index, file index, quote, cut 0|1, note or ''] */
  edges: Array<[number, number, number, number, string, number, string]>
}

export const NODE_COLUMNS = ['id', 'kind', 'label', 'voice', 'degree', 'date', 'href', 'rank'] as const
export const EDGE_COLUMNS = ['from', 'to', 'kind', 'file', 'quote', 'cut', 'note'] as const

export function packView(view: GraphView): PackedView {
  const nodeIndex = new Map(view.nodes.map((node, i) => [node.id, i]))
  const files = [...new Set(view.edges.map((e) => e.file))].sort()
  const fileIndex = new Map(files.map((f, i) => [f, i]))
  return {
    instrument: view.instrument,
    counts: view.counts,
    columns: { nodes: NODE_COLUMNS, edges: EDGE_COLUMNS },
    kinds: NODE_KINDS,
    edgeKinds: EDGE_KINDS,
    voices: VOICES,
    files,
    nodes: view.nodes.map((node) => [
      node.id,
      NODE_KINDS.indexOf(node.kind),
      node.label,
      VOICES.indexOf(node.voice),
      node.degree,
      node.date ?? '',
      node.href ?? '',
      node.rank ?? -1,
    ]),
    edges: view.edges.map((edge) => [
      nodeIndex.get(edge.from) ?? -1,
      nodeIndex.get(edge.to) ?? -1,
      EDGE_KINDS.indexOf(edge.kind),
      fileIndex.get(edge.file) ?? -1,
      edge.quote,
      edge.cut ? 1 : 0,
      edge.note ?? '',
    ]),
  }
}

export function unpackView(packed: PackedView): GraphView {
  const nodes: ViewNode[] = packed.nodes.map(([id, kind, label, voice, degree, date, href, rank]) => {
    const node: ViewNode = { id, kind: packed.kinds[kind]!, label, voice: packed.voices[voice]!, degree }
    if (date) node.date = date
    if (href) node.href = href
    if (rank >= 0) node.rank = rank
    return node
  })
  const edges: ViewEdge[] = packed.edges.map(([from, to, kind, file, quote, cut, note]) => {
    const edge: ViewEdge = {
      from: nodes[from]?.id ?? '',
      to: nodes[to]?.id ?? '',
      kind: packed.edgeKinds[kind]!,
      file: packed.files[file] ?? '',
      quote,
      cut: cut === 1,
    }
    if (note) edge.note = note
    return edge
  })
  return { instrument: packed.instrument, counts: packed.counts, nodes, edges }
}

// ---------------------------------------------------------------------------- the layout

export const CANVAS = 1000
export const CENTRE = CANVAS / 2

/** One ring per kind: the house from the inside out, then the world. The rings leave room for
 *  a node to step outward when its angle is already taken (see `layoutRadial`). */
export const RING: Record<NodeKind, number> = {
  practice: 118,
  encounter: 172,
  work: 232,
  'practice-work': 322,
  receiver: 380,
  neighbor: 420,
  decision: 466,
}

/** Two nodes closer than this on the floor are a collision the layout must resolve. */
export const MIN_GAP = 10
/** How far a colliding node may step outward before it steps sideways instead. */
export const RING_BAND = 30
const STEP_OUT = 8
const STEP_AROUND = 1.6

export interface Placed {
  id: string
  x: number
  y: number
}

/** Polar → cartesian with 0° at the top, turning clockwise, two decimals. */
export function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: round2(CENTRE + r * Math.cos(rad)), y: round2(CENTRE + r * Math.sin(rad)) }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** Circular mean of angles in degrees; NaN for an empty list. */
function meanAngle(angles: number[]): number {
  if (angles.length === 0) return Number.NaN
  let sx = 0
  let sy = 0
  for (const a of angles) {
    const rad = (a * Math.PI) / 180
    sx += Math.cos(rad)
    sy += Math.sin(rad)
  }
  return norm((Math.atan2(sy, sx) * 180) / Math.PI)
}

const VOICE_ORDER: Record<Voice, number> = { meridian: 0, ulysses: 1, ensemble: 2, conductor: 3 }

/** Deterministic radial layout of a view. Angles are decided by the record: a practice work
 *  stands in its maker's sector, a neighbour beside the experiment it neighbours, a decision at
 *  the mean of the works it touches, an encounter between its participants, a receiver beside
 *  the practice that addressed it. What has no relation to lean on is spread evenly. Collisions
 *  step outward within the ring's band, then sideways — so no two nodes stand closer than
 *  MIN_GAP and nothing leaves the canvas. */
export function layoutRadial(view: GraphView): Placed[] {
  const nodes = view.nodes
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const angle = new Map<string, number>()

  const ofKind = (kind: NodeKind) => nodes.filter((n) => n.kind === kind)
  const spread = (list: ViewNode[], start = 0): void => {
    const step = 360 / Math.max(list.length, 1)
    list.forEach((n, i) => angle.set(n.id, norm(start + i * step)))
  }

  // Practice works first: their sectors are proportional to what each practice made, and the
  // practices themselves then stand at their sector's centre — the maker over its making.
  const works = ofKind('practice-work').sort(
    (a, b) => VOICE_ORDER[a.voice] - VOICE_ORDER[b.voice] || (a.date ?? '').localeCompare(b.date ?? '') || a.label.localeCompare(b.label),
  )
  const makerOf = new Map<string, string>()
  for (const e of view.edges) if (e.kind === 'made-by') makerOf.set(e.from, e.to)
  const sectorOrder: string[] = []
  const perMaker = new Map<string, ViewNode[]>()
  for (const w of works) {
    const maker = makerOf.get(w.id) ?? `voice:${w.voice}`
    if (!perMaker.has(maker)) {
      perMaker.set(maker, [])
      sectorOrder.push(maker)
    }
    perMaker.get(maker)!.push(w)
  }
  const sectorCentre = new Map<string, number>()
  if (works.length > 0) {
    const stepW = 360 / works.length
    let cursor = 0
    for (const maker of sectorOrder) {
      const list = perMaker.get(maker)!
      list.forEach((w, i) => angle.set(w.id, norm(cursor + (i + 0.5) * stepW)))
      sectorCentre.set(maker, norm(cursor + (list.length * stepW) / 2))
      cursor += list.length * stepW
    }
  }

  // Practices: makers at their sector centres, the rest evenly in the largest gaps — deterministic
  // by id, which is a normalised voice.
  const practices = ofKind('practice').sort((a, b) => a.id.localeCompare(b.id))
  const makersPlaced = practices.filter((p) => sectorCentre.has(p.id))
  for (const p of makersPlaced) angle.set(p.id, sectorCentre.get(p.id)!)
  const others = practices.filter((p) => !sectorCentre.has(p.id))
  if (others.length > 0) {
    const taken = makersPlaced.map((p) => angle.get(p.id)!).sort((a, b) => a - b)
    if (taken.length === 0) spread(others)
    else {
      // fill each gap between taken angles in proportion to its size
      const gaps: Array<{ start: number; size: number }> = taken.map((a, i) => {
        const next = taken[(i + 1) % taken.length]!
        return { start: a, size: norm(next - a) || 360 }
      })
      let k = 0
      const total = gaps.reduce((s, g) => s + g.size, 0)
      for (const gap of gaps) {
        const share = Math.round((gap.size / total) * others.length)
        const stepG = gap.size / (share + 1)
        for (let i = 0; i < share && k < others.length; i++, k++) angle.set(others[k]!.id, norm(gap.start + (i + 1) * stepG))
      }
      while (k < others.length) {
        angle.set(others[k]!.id, norm(gaps[0]!.start + gaps[0]!.size / 2))
        k++
      }
    }
  }

  // Experiments: the shelf's own order around the ring, the practice doors beside their practice.
  const labWorks = ofKind('work').sort(
    (a, b) => (a.rank ?? 999) - (b.rank ?? 999) || a.label.localeCompare(b.label),
  )
  const doorOf = new Map<string, string>()
  for (const e of view.edges) if (e.kind === 'door') doorOf.set(e.to, e.from)
  const doors = labWorks.filter((w) => doorOf.has(w.id) && angle.has(doorOf.get(w.id)!))
  const shelf = labWorks.filter((w) => !doors.includes(w))
  spread(shelf, 360 / Math.max(shelf.length, 1) / 2)
  for (const w of doors) angle.set(w.id, angle.get(doorOf.get(w.id)!)!)

  // Neighbours beside the work they neighbour, fanned out by their order in the audit.
  const neighbourOf = new Map<string, string[]>()
  for (const e of view.edges) {
    if (e.kind !== 'neighbor-of') continue
    if (!neighbourOf.has(e.from)) neighbourOf.set(e.from, [])
    neighbourOf.get(e.from)!.push(e.to)
  }
  const neighbours = ofKind('neighbor')
  const placedNeighbour = new Set<string>()
  for (const [workId, list] of [...neighbourOf].sort((a, b) => a[0].localeCompare(b[0]))) {
    const base = angle.get(workId)
    if (base === undefined) continue
    const fan = 3.4
    list.forEach((id, i) => {
      if (!byId.has(id) || placedNeighbour.has(id)) return
      angle.set(id, norm(base + (i - (list.length - 1) / 2) * fan))
      placedNeighbour.add(id)
    })
  }
  spread(neighbours.filter((n) => !placedNeighbour.has(n.id)))

  // Encounters between their participants; receivers beside the practice that addressed them.
  const participants = new Map<string, number[]>()
  for (const e of view.edges) {
    if (e.kind !== 'participates') continue
    const a = angle.get(e.to)
    if (a === undefined) continue
    if (!participants.has(e.from)) participants.set(e.from, [])
    participants.get(e.from)!.push(a)
  }
  const encounters = ofKind('encounter')
  const loose: ViewNode[] = []
  for (const enc of encounters) {
    const m = meanAngle(participants.get(enc.id) ?? [])
    if (Number.isNaN(m)) loose.push(enc)
    else angle.set(enc.id, m)
  }
  spread(loose, 17)

  const addressedBy = new Map<string, string[]>()
  for (const e of view.edges) {
    if (e.kind !== 'addresses') continue
    if (!addressedBy.has(e.from)) addressedBy.set(e.from, [])
    addressedBy.get(e.from)!.push(e.to)
  }
  const receivers = ofKind('receiver')
  const placedReceiver = new Set<string>()
  for (const [practiceId, list] of [...addressedBy].sort((a, b) => a[0].localeCompare(b[0]))) {
    const base = angle.get(practiceId)
    if (base === undefined) continue
    list.forEach((id, i) => {
      if (!byId.has(id) || placedReceiver.has(id)) return
      angle.set(id, norm(base + (i - (list.length - 1) / 2) * 5))
      placedReceiver.add(id)
    })
  }
  spread(receivers.filter((r) => !placedReceiver.has(r.id)), 11)

  // Decisions at the mean of the works they touch; the untouching ones by date around the ring.
  const touches = new Map<string, number[]>()
  for (const e of view.edges) {
    if (e.kind !== 'touches') continue
    const a = angle.get(e.to)
    if (a === undefined) continue
    if (!touches.has(e.from)) touches.set(e.from, [])
    touches.get(e.from)!.push(a)
  }
  const decisions = ofKind('decision').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.id.localeCompare(b.id))
  const untouching: ViewNode[] = []
  for (const d of decisions) {
    const m = meanAngle(touches.get(d.id) ?? [])
    if (Number.isNaN(m)) untouching.push(d)
    else angle.set(d.id, m)
  }
  spread(untouching, 7)

  // Resolve collisions in a fixed order: kind order, then angle, then id. A node that lands on
  // an occupied spot steps outward within its ring's band, then sideways.
  const kindOrder = new Map(NODE_KINDS.map((k, i) => [k, i]))
  const order = [...nodes].sort(
    (a, b) =>
      (kindOrder.get(a.kind) ?? 99) - (kindOrder.get(b.kind) ?? 99) ||
      (angle.get(a.id) ?? 0) - (angle.get(b.id) ?? 0) ||
      a.id.localeCompare(b.id),
  )
  const placed: Placed[] = []
  const tooClose = (x: number, y: number): boolean =>
    placed.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < MIN_GAP * MIN_GAP)
  for (const node of order) {
    const base = RING[node.kind]
    let a = angle.get(node.id) ?? 0
    let r = base
    let { x, y } = polar(r, a)
    let guard = 0
    while (tooClose(x, y) && guard < 400) {
      guard++
      if (r + STEP_OUT <= base + RING_BAND) r += STEP_OUT
      else {
        r = base
        a = norm(a + STEP_AROUND)
      }
      ;({ x, y } = polar(r, a))
    }
    placed.push({ id: node.id, x, y })
  }
  return placed
}

// ---------------------------------------------------------------------------- questions

/** What the questions below need of a view: the island's server render carries the nodes and
 *  the edges' ends and kinds (the floor), not the receipts — those it fetches when a card opens.
 *  So every question that does not read a quote takes this smaller shape. */
export interface ViewLike {
  nodes: ViewNode[]
  edges: Array<Pick<ViewEdge, 'from' | 'to' | 'kind'>>
}

export interface ViewFilter {
  kinds: readonly NodeKind[]
  edgeKinds: readonly EdgeKind[]
}

export const ALL_ON: ViewFilter = { kinds: NODE_KINDS, edgeKinds: EDGE_KINDS }

/** The ids a filter keeps: nodes of an allowed kind, edges of an allowed kind whose both ends
 *  are kept. Positions are never touched by a filter — a node that is hidden keeps its place,
 *  so nothing on the floor moves when the reader changes what is shown. */
export function filterView(view: ViewLike, filter: ViewFilter): { nodes: Set<string>; edges: Set<number> } {
  const kinds = new Set(filter.kinds)
  const edgeKinds = new Set(filter.edgeKinds)
  const nodes = new Set(view.nodes.filter((n) => kinds.has(n.kind)).map((n) => n.id))
  const edges = new Set<number>()
  view.edges.forEach((e, i) => {
    if (edgeKinds.has(e.kind) && nodes.has(e.from) && nodes.has(e.to)) edges.add(i)
  })
  return { nodes, edges }
}

/** Ranked lookup, the ranking of query.ts's `search` carried over to the view: exact label
 *  first, then prefix, then substring, then the id — and the house's own things before the
 *  world's. */
export function searchView(view: ViewLike, term: string, limit = 12): ViewNode[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []
  const scored = view.nodes
    .map((node) => {
      const label = node.label.toLowerCase()
      let score = 0
      if (label === needle) score += 200
      else if (label.startsWith(needle)) score += 120
      else if (label.includes(needle)) score += 60
      else if ((node.href ?? '').toLowerCase().includes(needle)) score += 40
      else if (node.id.toLowerCase().includes(needle)) score += 10
      if (score === 0) return null
      if (node.kind === 'work') score += 30
      else if (node.kind === 'practice-work') score += 25
      else if (node.kind === 'practice' || node.kind === 'encounter' || node.kind === 'decision') score += 10
      return { node, score }
    })
    .filter((hit): hit is { node: ViewNode; score: number } => hit !== null)
  return scored
    .sort((a, b) => b.score - a.score || a.node.label.localeCompare(b.node.label))
    .slice(0, limit)
    .map((hit) => hit.node)
}

export interface Receipt {
  edge: ViewEdge
  index: number
  direction: 'out' | 'in'
  other: ViewNode
}

/** Every edge that touches a node, with the node at its other end — the receipts a card shows. */
export function receiptsOf(view: GraphView, id: string): Receipt[] {
  const byId = new Map(view.nodes.map((n) => [n.id, n]))
  const out: Receipt[] = []
  view.edges.forEach((edge, index) => {
    if (edge.from === id) {
      const other = byId.get(edge.to)
      if (other) out.push({ edge, index, direction: 'out', other })
    } else if (edge.to === id) {
      const other = byId.get(edge.from)
      if (other) out.push({ edge, index, direction: 'in', other })
    }
  })
  return out
}

/** The ids one step from a node — what lights up with it. */
export function neighbourhood(view: ViewLike, id: string): Set<string> {
  const ids = new Set<string>([id])
  for (const e of view.edges) {
    if (e.from === id) ids.add(e.to)
    else if (e.to === id) ids.add(e.from)
  }
  return ids
}

/** The graph as rows — the table floor under the drawing. */
export function viewRows(view: GraphView): Array<{ kind: NodeKind; label: string; date: string; degree: number; voice: Voice }> {
  return view.nodes.map((n) => ({ kind: n.kind, label: n.label, date: n.date ?? '', degree: n.degree, voice: n.voice }))
}

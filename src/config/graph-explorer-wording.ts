// src/config/graph-explorer-wording.ts — every visitor-facing string of the knowledge-graph
// explorer on /experiments/neighbors (visual layer, Phase 3a, 2026-09-02). The island and its
// frame own no words: they receive these. Counts are functions — a number typed into a string
// goes stale the next night (docs/wording-kanon.md, "Schwarze Liste"); GraphExplorer.test.tsx
// holds every fixed string here digit-free.
import type { EdgeKind, NodeKind } from '@/lib/graph/types'
import type { Voice } from '@/lib/graph/graph-explorer-model'

const plural = (n: number, one: string, many: string) => (n === 1 ? `${n} ${one}` : `${n} ${many}`)

export const GRAPH_EXPLORER = {
  kicker: 'The graph of the house',
  sub:
    'Everything this house keeps on record about itself, drawn as one graph: its experiments, the works the three practices made, the practices, the encounters between them, the decisions that changed what the site publishes, the neighbours the audit named as prior art, and the receivers the post office addressed. Every node and every edge was read out of a committed file, and every edge carries the words it was read from — open a node and the receipts are listed.',
  figureLabel: (nodes: string, edges: string) => `The knowledge graph of this house: ${nodes}, ${edges}`,
  count: {
    nodes: (n: number) => plural(n, 'node', 'nodes'),
    edges: (n: number) => plural(n, 'edge', 'edges'),
    shown: (shown: number, of: number) => `${shown} of ${of} shown`,
  },
  hint: 'drag to pan · scroll or pinch to zoom · a node opens its card · / searches',

  kinds: {
    practice: 'practice',
    encounter: 'encounter',
    work: 'experiment',
    'practice-work': 'practice work',
    receiver: 'receiver',
    neighbor: 'neighbour',
    decision: 'decision',
  } satisfies Record<NodeKind, string>,
  kindWhat: {
    practice: 'a research practice of the house, as the records name it',
    encounter: 'a crossing — one practice’s material arriving in another’s work',
    work: 'an experiment of the lab, or a practice’s door on this site',
    'practice-work': 'a work one of the practices made, read from its own committed meta',
    receiver: 'a named addressee of the post office — the world, as this house has addressed it',
    neighbor: 'a project outside this house that the audit named as prior art',
    decision: 'a dated approval that changed what this repository publishes',
  } satisfies Record<NodeKind, string>,

  edgeKinds: {
    door: 'door',
    'made-by': 'made by',
    participates: 'takes part',
    concerns: 'concerns',
    touches: 'touches',
    'neighbor-of': 'neighbour of',
    addresses: 'addresses',
  } satisfies Record<EdgeKind, string>,
  edgeWhat: {
    door: 'a practice’s own door on this site',
    'made-by': 'who made a work, read from where the work lives',
    participates: 'a voice at a crossing',
    concerns: 'the work a crossing actually moved',
    touches: 'a decision whose text names this work’s files or route',
    'neighbor-of': 'prior art the audit found for a work',
    addresses: 'a packet lying addressed in the post office',
  } satisfies Record<EdgeKind, string>,

  voices: {
    meridian: 'The Field · Meridian',
    ulysses: 'The Atelier · Assay',
    ensemble: 'The Studio · Ensemble',
    conductor: 'no voice — the house itself, or the world',
  } satisfies Record<Voice, string>,

  filters: {
    nodesLabel: 'kinds of node',
    edgesLabel: 'kinds of edge',
    all: 'all',
    none: 'none',
    count: (n: number) => String(n),
  },

  search: {
    label: 'search the graph',
    placeholder: 'a work, a decision, a neighbour, a practice…',
    hint: '/ focuses · ↑ ↓ move · Enter opens · Esc closes',
    empty: 'nothing on record by that name',
    results: (n: number) => plural(n, 'match', 'matches'),
  },

  zoom: {
    group: 'zoom the floor',
    in: 'zoom in',
    out: 'zoom out',
    reset: 'reset the view',
    levelPrefix: '×',
  },

  card: {
    kindLabel: 'kind',
    voiceLabel: 'voice',
    dateLabel: 'date',
    degreeLabel: 'edges',
    degree: (n: number) => plural(n, 'edge', 'edges'),
    open: 'open the record →',
    close: 'close',
    receipts: 'the receipts — every edge, and the committed file it was read from',
    receiptsLoading: 'reading the receipts…',
    receiptsFailed: 'the receipts could not be loaded here; the whole graph, quotes included, is src/data/graph/graph.json',
    noEdges: 'no edge reaches this node — it stands in the record on its own',
    quoteCut: 'shortened here; the file carries the whole sentence',
    out: '→',
    in: '←',
    hint: 'Esc closes · a name in the receipts opens that node',
  },

  key: {
    kicker: 'The signs',
    voices: 'hues are the voices’ recorded ones; what the house or the world owns is grey by declaration',
    weight: 'a node grows with the edges that touch it',
  },

  table: {
    summary: (n: number) => `the graph as a table — ${plural(n, 'node', 'nodes')}`,
    caption: 'Every node of the knowledge graph with its kind, its voice, its date where it has one, and how many edges touch it.',
    columns: { kind: 'kind', label: 'label', voice: 'voice', date: 'date', degree: 'edges' },
  },

  provenance: (files: number) =>
    `Derived, not drawn by hand: every node and edge comes from src/data/graph/graph.json, which npm run graph:build reads out of ${plural(files, 'committed file', 'committed files')} — the works register, the two audits, the decision log, the post ledger, the encounter register and every practice work’s own meta. The placement is arithmetic over the record (a work in its maker’s sector, a neighbour beside the experiment it neighbours); the force layout only relaxes it. Nothing here measures similarity: an edge is a fact with a quote, or it is not in the graph.`,
} as const

// Trims the committed knowledge graph (src/data/graph/graph.json) into the view the explorer on
// /experiments/neighbors draws, and writes src/data/graph/graph-view.json. Runs as the second
// half of `npm run graph:build`, so the knowledge-graph rule keeps one command: whoever changes
// a graph source rebuilds the graph AND its view in one go, and graph-explorer-model.test.ts
// turns red when the committed view is not the derivation of the committed graph.
//
// Nothing is fetched and nothing is invented: a view node is a graph node with fields removed,
// a view edge is a graph edge with its receipt (file + quote) kept and the quote cut at a
// declared length. The page serves the same file at /graph/view.json (src/pages/graph/view.json.ts)
// for the island to fetch the receipts from — one source, two readers.

import { readFileSync, writeFileSync } from 'node:fs'
import { buildGraphView, packView } from '../src/lib/graph/graph-explorer-model.ts'
import type { KnowledgeGraph } from '../src/lib/graph/types.ts'

const IN = 'src/data/graph/graph.json'
const OUT = 'src/data/graph/graph-view.json'
/** The size the plan budgets for the view (docs/design/2026-09-02-the-visual-layer.md §4). */
const MAX_BYTES = 120 * 1024

const graph = JSON.parse(readFileSync(IN, 'utf8')) as KnowledgeGraph
const view = buildGraphView(graph)
// Written in columns (packView), not as objects: the keys alone were a fifth of the file.
const text = `${JSON.stringify(packView(view))}\n`
writeFileSync(OUT, text, 'utf8')

const kb = (text.length / 1024).toFixed(1)
console.log(`${OUT}: ${view.counts.nodes} nodes, ${view.counts.edges} edges, ${kb} KB`)
if (text.length > MAX_BYTES) {
  console.error(`  ✗ the view is over its ${MAX_BYTES / 1024} KB budget — cut QUOTE_MAX or drop a field, do not raise the budget silently`)
  process.exit(1)
}

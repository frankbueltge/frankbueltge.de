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
import { gzipSync } from 'node:zlib'
import { buildGraphView, packView } from '../src/lib/graph/graph-explorer-model.ts'
import type { KnowledgeGraph } from '../src/lib/graph/types.ts'

const IN = 'src/data/graph/graph.json'
const OUT = 'src/data/graph/graph-view.json'
// No size limit (Frank's decision of 2026-10-05, wording private). Until then this script
// stopped graph:build when the view passed 120 KB of raw JSON — a number a session set in the
// visual-layer plan of 2026-09-02, not a decision of Frank's — and a 43-byte overrun blocked every
// mirror of the practices' work for a night. The size is measured and reported below; a work that
// gains from a larger file may have one.

const graph = JSON.parse(readFileSync(IN, 'utf8')) as KnowledgeGraph
const view = buildGraphView(graph)
// Written in columns (packView), not as objects: the keys alone were a fifth of the file.
const text = `${JSON.stringify(packView(view))}\n`
writeFileSync(OUT, text, 'utf8')

const kb = (text.length / 1024).toFixed(1)
const gz = gzipSync(text, { level: 9 }).byteLength
console.log(`${OUT}: ${view.counts.nodes} nodes, ${view.counts.edges} edges, ${kb} KB (${(gz / 1024).toFixed(1)} KB gzip)`)

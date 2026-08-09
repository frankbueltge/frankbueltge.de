// Derives the house's knowledge graph from its committed records and writes
// src/data/graph/graph.json. Run with: npm run graph:build
//
// Nothing is fetched and nothing is invented: every node and edge is read out of a file that
// is already in this repository (src/lib/graph/build.ts names them). The output is committed
// so that a session can query the house without a build, and so that the graph is versioned
// like everything else here — git is the archive.

import { mkdirSync, writeFileSync } from 'node:fs'
import { buildGraphFromRepo } from '../src/lib/graph/build.ts'

const OUT = 'src/data/graph/graph.json'

const graph = buildGraphFromRepo('./')
mkdirSync('src/data/graph', { recursive: true })
writeFileSync(OUT, `${JSON.stringify(graph, null, 2)}\n`, 'utf8')

const { nodes, edges, nodesByKind, edgesByKind } = graph.meta.counts
console.log(`${OUT}: ${nodes} nodes, ${edges} edges`)
console.log(`  nodes: ${Object.entries(nodesByKind).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
console.log(`  edges: ${Object.entries(edgesByKind).map(([k, v]) => `${k} ${v}`).join(' · ')}`)

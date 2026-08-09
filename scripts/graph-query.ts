// "What touches X?" — the knowledge graph as a query layer for a working session.
// Run with: npm run graph -- <term>          e.g. npm run graph -- iceberg
//           npm run graph                    (no term: the shape of the whole graph)
//
// Cheaper than grep and, unlike grep, every line it prints names the file the fact came from.

import { readFileSync } from 'node:fs'
import type { KnowledgeGraph } from '../src/lib/graph/types.ts'
import { edgeSummary, relationsOf, search } from '../src/lib/graph/query.ts'

const graph = JSON.parse(readFileSync('src/data/graph/graph.json', 'utf8')) as KnowledgeGraph
const term = process.argv.slice(2).join(' ').trim()

if (!term) {
  const { nodes, edges, nodesByKind, edgesByKind } = graph.meta.counts
  console.log(`the house, as a graph: ${nodes} nodes, ${edges} edges`)
  console.log(`  nodes  ${Object.entries(nodesByKind).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
  console.log(`  edges  ${Object.entries(edgesByKind).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
  console.log(`  read from ${graph.meta.sources.map((s) => s.file).join(', ')}`)
  console.log('\nask about one thing:  npm run graph -- <term>')
  process.exit(0)
}

const hits = search(graph, term)
if (hits.length === 0) {
  console.log(`nothing in the graph matches "${term}".`)
  process.exit(0)
}

for (const node of hits.slice(0, 6)) {
  console.log(`\n${node.label}  [${node.kind}]  ${node.id}`)
  if (node.kind === 'work') {
    console.log(`  route     ${node.href}${node.rank ? `   rank ${node.rank} on /holdings` : ''}`)
    if (node.verdict) console.log(`  verdict   ${node.verdictLabel}`)
    if (node.line) console.log(`  line      ${node.line}`)
    if (node.daylight) console.log(`  daylight  ${wrap(node.daylight, 74, 12)}`)
  }
  if (node.kind === 'practice-work') {
    console.log(`  made      ${node.date} by ${node.practiceId}${node.medium ? `   ${node.medium}` : ''}`)
    console.log(`  route     ${node.href}`)
    if (node.embodies) console.log(`  embodies  ${wrap(node.embodies, 74, 12)}`)
  }
  if (node.kind === 'practice' && node.spellings.length > 1) {
    console.log(`  spelled   ${node.spellings.join(', ')}`)
  }
  if (node.kind === 'encounter' && node.recordUrl) console.log(`  record    ${node.recordUrl}`)
  if (node.kind === 'neighbor' && node.url) console.log(`  url       ${node.url}`)

  const relations = relationsOf(graph, node.id)
  const summary = edgeSummary(relations)
  console.log(
    `  edges     ${Object.entries(summary).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`,
  )
  for (const { edge, direction, other } of relations) {
    const arrow = direction === 'out' ? '→' : '←'
    const state = edge.state ? ` (${edge.state})` : ''
    console.log(`    ${arrow} ${edge.kind}${state}: ${other.label}`)
    console.log(`        source: ${edge.source.file}`)
  }
}

if (hits.length > 6) console.log(`\n… and ${hits.length - 6} more matches.`)

/** Wrap a long field under its label without pulling in a dependency. */
function wrap(text: string, width: number, indent: number): string {
  const pad = ' '.repeat(indent)
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if ((line + word).length > width) {
      lines.push(line.trimEnd())
      line = ''
    }
    line += `${word} `
  }
  if (line.trim()) lines.push(line.trimEnd())
  return lines.join(`\n${pad}`)
}

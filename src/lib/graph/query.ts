// src/lib/graph/query.ts — reading the graph.
//
// Purpose one of the instrument: a session that needs to know what a change touches asks here
// instead of grepping a repository of 2,500 files ("what touches Iceberg Theory?" → its audit
// verdict, its prior art, the decisions that named its files). Purpose two: the same functions
// shape the neighbourhood figure at /holdings/neighbors, so page and command line answer out
// of one artifact and cannot drift apart.
//
// Pure functions over a loaded graph — no fs here, so an Astro page may import this.

import type { EdgeKind, GraphEdge, GraphNode, KnowledgeGraph, WorkNode } from './types'

/** An edge seen from one node: which way it runs, and what sits at the other end. */
export interface Relation {
  edge: GraphEdge
  direction: 'out' | 'in'
  other: GraphNode
}

export function nodeById(graph: KnowledgeGraph, id: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === id)
}

/** Everything the graph knows about one node, both directions, edges of a kind kept together. */
export function relationsOf(graph: KnowledgeGraph, id: string): Relation[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const relations: Relation[] = []
  for (const edge of graph.edges) {
    if (edge.from === id) {
      const other = byId.get(edge.to)
      if (other) relations.push({ edge, direction: 'out', other })
    } else if (edge.to === id) {
      const other = byId.get(edge.from)
      if (other) relations.push({ edge, direction: 'in', other })
    }
  }
  return relations
}

/** Loose lookup for a human at a terminal: id, label or (for works) route and werk id.
 *
 *  Ranked, because unranked it was useless in practice: `graph -- society` answered with three
 *  of the audit's neighbours and a journal before reaching The Society. What a session asks
 *  about is almost always one of this house's own things, and almost always by its name. */
export function search(graph: KnowledgeGraph, term: string): GraphNode[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  const scored = graph.nodes
    .map((node) => {
      const label = node.label.toLowerCase()
      const own = node.kind === 'work' ? `${node.werkId} ${node.href}`.toLowerCase() : ''
      let score = 0
      if (label === needle || own.split(' ').includes(needle)) score += 200
      else if (label.startsWith(needle)) score += 120
      else if (label.includes(needle)) score += 60
      else if (own.includes(needle)) score += 40
      else if (node.id.toLowerCase().includes(needle)) score += 10
      if (score === 0) return null
      // the house's own things before the world's: a work is what a session is working on
      if (node.kind === 'work') score += 30
      else if (node.kind === 'practice' || node.kind === 'decision') score += 10
      return { node, score }
    })
    .filter((hit): hit is { node: GraphNode; score: number } => hit !== null)

  return scored.sort((a, b) => b.score - a.score || a.node.label.localeCompare(b.node.label)).map((hit) => hit.node)
}

/** One work with its prior art — the row the figure draws and the table repeats. */
export interface FieldEntry {
  work: WorkNode
  neighbors: Array<{ node: GraphNode; url?: string; note?: string }>
}

/** The audited shelf, in the order /holdings ranks it. Works without a verdict are left out:
 *  the figure is about the audit, and an unaudited work has no position in this field. */
export function neighborhoodField(graph: KnowledgeGraph): FieldEntry[] {
  const works = graph.nodes
    .filter((n): n is WorkNode => n.kind === 'work' && Boolean(n.verdict) && typeof n.rank === 'number')
    .sort((a, b) => (a.rank as number) - (b.rank as number))

  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  return works.map((work) => ({
    work,
    neighbors: graph.edges
      .filter((e) => e.kind === 'neighbor-of' && e.from === work.id)
      .map((edge) => {
        const node = byId.get(edge.to) as GraphNode
        return { node, url: node.kind === 'neighbor' ? node.url : undefined, note: edge.note }
      })
      .filter((n) => Boolean(n.node)),
  }))
}

/** How many of each kind of edge a node carries — the one-line answer to "is this connected?". */
export function edgeSummary(relations: Relation[]): Record<EdgeKind, number> {
  const counts = {} as Record<EdgeKind, number>
  for (const relation of relations) counts[relation.edge.kind] = (counts[relation.edge.kind] ?? 0) + 1
  return counts
}

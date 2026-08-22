// src/lib/graph/query.test.ts — the instrument answers the question that was asked.
//
// The graph's first purpose is to be asked things by a session at work ("what touches X?").
// That only pays off if the answer arrives at the top of the list, so the ranking is asserted
// here rather than left to chance — the unranked first version answered `society` with three
// prior-art projects and a journal before it reached the Society.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { edgeSummary, neighborhoodField, relationsOf, search } from './query'
import type { KnowledgeGraph } from './types'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const graph = JSON.parse(readFileSync(`${ROOT}src/data/graph/graph.json`, 'utf8')) as KnowledgeGraph

describe('search ranks the house’s own things first', () => {
  it.each([
    ['society', 'work:society'],
    ['iceberg', 'work:parallaxe'],
    ['consensus', 'work:consensus'],
    ['/headroom', 'work:spielraum'],
  ])('answers %s with %s', (term, expected) => {
    expect(search(graph, term)[0]?.id).toBe(expected)
  })

  it('answers with the practices’ own works, which the graph learned on 2026-08-09', () => {
    const hit = search(graph, 'native speaker')[0]
    expect(hit?.kind).toBe('practice-work')
    expect(hit?.label).toBe('Native Speaker')
  })

  it('finds a project outside the house by name too', () => {
    const hit = search(graph, 'INFOGAP')[0]
    expect(hit?.kind).toBe('neighbor')
    expect(hit?.label).toBe('INFOGAP')
  })

  it('returns nothing for nothing, rather than everything', () => {
    expect(search(graph, '')).toEqual([])
    expect(search(graph, 'zzzz-no-such-thing')).toEqual([])
  })
})

describe('relations answer in both directions', () => {
  it('gives a work its prior art outward and its decisions inward', () => {
    const relations = relationsOf(graph, 'work:atelier')
    expect(relations.length).toBeGreaterThan(0)
    const summary = edgeSummary(relations)
    expect(summary.touches).toBeGreaterThan(0)
    for (const relation of relations) {
      expect(relation.other.id).not.toBe('work:atelier')
      expect(['in', 'out']).toContain(relation.direction)
    }
  })

  it('never invents a relation for a node the graph does not carry', () => {
    expect(relationsOf(graph, 'work:does-not-exist')).toEqual([])
  })
})

describe('the field view is the audited shelf, in rank order', () => {
  const field = neighborhoodField(graph)

  it('carries only works with a verdict and a rank', () => {
    for (const entry of field) {
      expect(entry.work.verdict).toBeDefined()
      expect(typeof entry.work.rank).toBe('number')
      expect(entry.neighbors.length).toBeGreaterThan(0)
    }
  })

  it('is sorted by the /experiments ranking', () => {
    const ranks = field.map((entry) => entry.work.rank as number)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })
})

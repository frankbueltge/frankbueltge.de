// The /n-1 page reads the mirrored practice record through readN1Record —
// read, never typed. These tests hold the committed record to its contract
// and the reader to its two legal states: a well-formed record renders, and
// anything else degrades to the quiet state instead of crashing the build.
import { describe, expect, it } from 'vitest'
import record from '../../data/n1/record.json'
import { readN1Record } from './view'

describe('the committed n-1 record', () => {
  it('honours the n1-record/1 contract the mirror writes', () => {
    expect((record as { $contract?: string }).$contract).toBe('n1-record/1')
    expect((record as { source: { commit: string } }).source.commit).toMatch(/^[0-9a-f]{40}$/)
  })

  it('derives a consistent view: totals are sums, layer ids unique, docs linked', () => {
    const view = readN1Record(record)
    expect(view.ok).toBe(true)
    expect(view.totals.layers).toBe(view.layers.length)
    expect(view.totals.nodes).toBe(view.layers.reduce((s, l) => s + l.nodes, 0))
    expect(view.totals.edges).toBe(view.layers.reduce((s, l) => s + l.edges, 0))
    expect(new Set(view.layers.map((l) => l.id)).size).toBe(view.layers.length)
    for (const doc of [...view.nights, ...view.reading]) {
      expect(doc.url).toBe(`https://github.com/frankbueltge/n-1/blob/main/${doc.file}`)
      expect(doc.title).not.toBe('')
    }
  })

  it('quotes the founding problem from the record, never from this repo', () => {
    const view = readN1Record(record)
    const problemNodes = (record as { atlas: { nodes?: { type?: string; label?: string }[] }[] }).atlas
      .flatMap((l) => l.nodes ?? [])
      .filter((n) => n.type === 'problem')
    if (problemNodes.length > 0) {
      expect(view.foundingProblem).toBe(problemNodes[0].label)
    } else {
      expect(view.foundingProblem).toBeNull()
    }
  })
})

describe('the quiet state', () => {
  it('is returned for an absent, foreign or malformed record — never a throw', () => {
    for (const bad of [null, undefined, {}, { $contract: 'other/1' }, { $contract: 'n1-record/1' }, 42]) {
      const view = readN1Record(bad)
      expect(view.ok).toBe(false)
      expect(view.layers).toEqual([])
      expect(view.foundingProblem).toBeNull()
    }
  })
})

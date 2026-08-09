// src/lib/engines/register-audit.test.ts — the works register and the graph name the same works.
//
// /works prints what the ecology audit found next to the work it found it about. That join runs
// on a string (`<practice>/<slug>`) built in two places from two derivations, which is exactly
// the kind of seam that rots without anyone noticing: rename a work's directory and the page
// would quietly stop showing its verdict, reading as "unexamined" for a work that was examined.
//
// This test cannot live in src/lib/graph/: the register reads its metas through Vite's
// import.meta.glob, so it only resolves inside vitest's Vite pipeline.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { allWorks } from './register'
import { practiceWorkAudits } from '@/lib/graph/query'
import type { KnowledgeGraph } from '@/lib/graph/types'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const graph = JSON.parse(readFileSync(`${ROOT}src/data/graph/graph.json`, 'utf8')) as KnowledgeGraph
const works = allWorks()
const audits = practiceWorkAudits(graph)

describe('every work in the register is a work in the graph', () => {
  it('resolves each register row to a practice-work node — no silent orphans', () => {
    const ids = new Set(graph.nodes.filter((n) => n.kind === 'practice-work').map((n) => n.id))
    for (const work of works) {
      expect(ids, `${work.ns}/${work.slug} is in the register but not in the graph`).toContain(
        `practice-work:${work.ns}/${work.slug}`,
      )
    }
  })

  it('counts the same works on both sides', () => {
    const fromMetas = graph.nodes.filter(
      (n) => n.kind === 'practice-work' && n.source.file.endsWith('/meta.json'),
    )
    expect(fromMetas.length).toBe(works.length)
  })
})

describe('what the register prints about prior art', () => {
  it('has an audit for at least one work, and for far from all of them', () => {
    const audited = works.filter((w) => audits.has(`${w.ns}/${w.slug}`))
    expect(audited.length).toBeGreaterThan(0)
    expect(audited.length).toBeLessThan(works.length)
  })

  it('never shows a verdict without the neighbours that earned it', () => {
    for (const [key, audit] of audits) {
      expect(audit.neighbours.length, `${key} carries a verdict but no named prior art`).toBeGreaterThan(0)
      for (const neighbour of audit.neighbours) expect(neighbour.label.length).toBeGreaterThan(1)
    }
  })

  it('keys the audit exactly as the register names a work', () => {
    const keys = [...audits.keys()]
    const rows = new Set(works.map((w) => `${w.ns}/${w.slug}`))
    for (const key of keys) expect(rows, `the audit key ${key} matches no row of the register`).toContain(key)
  })

  // The one thing this page must never do: let silence read as a pass.
  it('leaves the unaudited majority without a note, so the head line has to explain it', () => {
    const unaudited = works.filter((w) => !audits.has(`${w.ns}/${w.slug}`))
    expect(unaudited.length).toBeGreaterThan(0)
    const page = readFileSync(`${ROOT}src/components/pages/WorksRegister.astro`, 'utf8')
    expect(page).toContain('unexamined, not cleared')
    expect(page).toContain('Prior art checked for')
  })
})

// Determinism + fidelity guard for the Blatt generator (Praxis-Oberflächen-Paket;
// Determinismus-Vertrag wie score.test.ts: gleicher Input ⇒ byte-gleicher Output). Uses
// the real, committed rhizome.json mirror — not a hand-typed stand-in — so a future sync
// that changes shape fails here instead of silently rendering something else. Also guards
// the Atelier's approved grammar formulas (wortlaute-2026-07-15.md §2/§5; Protokoll-
// Prinzip: Test-Strings nie aufweichen).
import { describe, expect, it } from 'vitest'
import rhizomeData from '@/data/atelier/rhizome.json'
import { ATELIER_GRAMMAR } from '@/config/atelier-wording'
import { buildSheetSvg, edgeRegister, sheetStats, sheetTitle, type Rhizome } from './sheet'

const rhizome = rhizomeData as unknown as Rhizome

describe('approved atelier grammar (static formulas, test-protected)', () => {
  it('keeps the data-edge formula verbatim', () => {
    expect(ATELIER_GRAMMAR.dataEdge).toBe('tonight’s page is not yet written')
    expect(ATELIER_GRAMMAR.dataEdgeLines).toEqual(['tonight’s page —', 'not yet written'])
  })

  it('keeps the margin rail exactly as designed (the only standing navigation)', () => {
    expect(ATELIER_GRAMMAR.rail.map((r) => r.label)).toEqual([
      'this sheet',
      'sheets',
      'works',
      'journal',
      'material',
      'apparatus',
    ])
    expect(ATELIER_GRAMMAR.door.label).toBe('→ the middle')
  })

  it('keeps the doorway wording verbatim', () => {
    expect(ATELIER_GRAMMAR.doorwayNote).toBe('doorway reserved — for an external encounter, once it exists')
  })
})

describe('buildSheetSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    const a = buildSheetSvg(rhizome)
    const b = buildSheetSvg(structuredClone(rhizome))
    expect(a).toBe(b)
  })

  it('draws one ink ribbon per thread and one slab or ghost per drawn work', () => {
    const svg = buildSheetSvg(rhizome)
    const stats = sheetStats(rhizome)
    expect(svg.match(/class="th"/g) ?? []).toHaveLength(stats.threads)
    const slabs = (svg.match(/class="slab"/g) ?? []).length
    const ghosts = (svg.match(/class="slab-ghost"/g) ?? []).length
    expect(slabs + ghosts).toBe(stats.works)
  })

  it('kinks every swerve source in red pencil and marks the birth session', () => {
    const svg = buildSheetSvg(rhizome)
    const swerves = rhizome.edges.filter((e) => e.kind === 'swerve')
    // one red kink per swerve source (plus the error strikes only exist on the spine)
    expect((svg.match(/class="rp"/g) ?? []).length).toBe(swerves.length)
    for (const session of new Set(swerves.map((e) => e.session))) {
      expect(svg).toContain(`>S${session}</text>`)
    }
  })

  it('draws the reserved doorway empty, with the approved wording', () => {
    const svg = buildSheetSvg(rhizome)
    expect(svg).toContain(ATELIER_GRAMMAR.doorwayNote)
    expect(svg.match(/class="door"/g) ?? []).toHaveLength(2)
  })

  it('letters bridges with their session, never with invented quotes', () => {
    const svg = buildSheetSvg(rhizome)
    const bridges = rhizome.edges.filter((e) => e.kind === 'bridge')
    for (const b of bridges) expect(svg).toContain(`bridge · S${b.session}`)
  })
})

describe('edgeRegister', () => {
  it('compresses nothing: one row per edge, labels verbatim', () => {
    const rows = edgeRegister(rhizome)
    expect(rows).toHaveLength(rhizome.edges.length)
    const byId = new Map(rhizome.nodes.map((n) => [n.id, n.label]))
    rows.forEach((row, i) => {
      const e = rhizome.edges[i]
      expect(row.from).toBe(byId.get(e.from) ?? e.from)
      expect(row.to).toBe(byId.get(e.to) ?? e.to)
      expect(row.kind).toBe(e.kind)
    })
  })
})

describe('sheetTitle', () => {
  it('is the youngest thread’s own label, verbatim from the rhizome', () => {
    const title = sheetTitle(rhizome)
    const labels = rhizome.nodes.filter((n) => n.kind === 'thread').map((n) => n.label)
    expect(labels).toContain(title)
    // the youngest thread is the one born in the highest swerve session
    const maxSession = Math.max(
      ...rhizome.edges.filter((e) => e.kind === 'swerve').map((e) => e.session ?? -1),
    )
    const youngest = rhizome.edges.find((e) => e.kind === 'swerve' && e.session === maxSession)
    const node = rhizome.nodes.find((n) => n.id === youngest?.to)
    expect(title).toBe(node?.label)
  })
})

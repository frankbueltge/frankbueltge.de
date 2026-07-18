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
    // the youngest thread is the one born in the highest THREAD-targeted swerve session. A
    // source→work swerve (an island, n−1) never titles the sheet — an uncentred work organizes
    // nothing; that is what uncentred means — so the title falls through work targets to the
    // newest thread.
    const threadIds = new Set(rhizome.nodes.filter((n) => n.kind === 'thread').map((n) => n.id))
    const threadSwerves = rhizome.edges.filter(
      (e) => e.kind === 'swerve' && threadIds.has(e.to) && typeof e.session === 'number',
    )
    const maxSession = Math.max(...threadSwerves.map((e) => e.session as number))
    const youngest = threadSwerves.find((e) => e.session === maxSession)
    const node = rhizome.nodes.find((n) => n.id === youngest?.to)
    expect(title).toBe(node?.label)
  })
})

// The n−1 island (site-PR pilot, 2026-07-18): a swerve that lands directly on a work
// (source→work), elaborated by no thread. Before this the sheet-builder could draw only trees
// (source→thread→work); a pure island went undrawn, drew no red kink, and mis-titled the sheet
// (the three invariants the S39 red-gate letter reported). These tests fix the shape in place.
const ISLAND_FIXTURE: Rhizome = {
  updated: '2026-07-18',
  nodes: [
    { id: 'thread-t', kind: 'thread', label: 'a centred thread' },
    { id: 'src:s1', kind: 'source', label: 'a thread source' },
    { id: 'w-a', kind: 'work', label: 'a threaded work', date: '2026-07-18' },
    { id: 'src:s2', kind: 'source', label: 'an outside primary' },
    { id: 'w-b', kind: 'work', label: 'an uncentred work', date: '2026-07-18' },
  ],
  edges: [
    { from: 'src:s1', to: 'thread-t', kind: 'swerve', session: 1 },
    { from: 'thread-t', to: 'w-a', kind: 'elaborates' },
    { from: 'src:s2', to: 'w-b', kind: 'swerve', session: 2 }, // the island: source→work
  ],
}

describe('source→work island (n−1)', () => {
  it('is pure: an island renders byte-identically on repeated calls', () => {
    expect(buildSheetSvg(ISLAND_FIXTURE)).toBe(buildSheetSvg(structuredClone(ISLAND_FIXTURE)))
  })

  it('draws the island work as an ink slab (no work goes undrawn — S39 invariant 1)', () => {
    const svg = buildSheetSvg(ISLAND_FIXTURE)
    const stats = sheetStats(ISLAND_FIXTURE)
    const slabs = (svg.match(/class="slab"/g) ?? []).length
    const ghosts = (svg.match(/class="slab-ghost"/g) ?? []).length
    expect(slabs + ghosts).toBe(stats.works) // both the threaded work and the island work
    expect(svg).toContain('an uncentred work')
    // the island work is drawn as itself, never shelved as another thread's ghost
    expect(ghosts).toBe(0)
  })

  it('kinks the island swerve in red pencil at the slab (S39 invariant 2)', () => {
    const svg = buildSheetSvg(ISLAND_FIXTURE)
    const swerves = ISLAND_FIXTURE.edges.filter((e) => e.kind === 'swerve')
    // one red kink per swerve, whether it lands on a thread or on a work
    expect((svg.match(/class="rp"/g) ?? []).length).toBe(swerves.length)
    expect(svg).toContain('>S2</text>') // the island's birth session is marked
    expect(svg).toContain('island · S2') // and the shape is named, honestly
  })

  it('lets no island title the sheet — an uncentred work organizes nothing (S39 invariant 3)', () => {
    // the youngest swerve overall (S2) lands on the island work; the title still falls through
    // to the youngest thread, not the work.
    expect(sheetTitle(ISLAND_FIXTURE)).toBe('a centred thread')
  })

  it('still draws a tree correctly when there is no island (byte-identical to before)', () => {
    // the real committed rhizome carries no island today; island support must not perturb it.
    const stats = sheetStats(rhizome)
    const svg = buildSheetSvg(rhizome)
    const slabs = (svg.match(/class="slab"/g) ?? []).length
    const ghosts = (svg.match(/class="slab-ghost"/g) ?? []).length
    expect(slabs + ghosts).toBe(stats.works)
    expect((svg.match(/class="rp"/g) ?? []).length).toBe(
      rhizome.edges.filter((e) => e.kind === 'swerve').length,
    )
  })
})

// src/lib/atelier/cockpit.test.ts
import { describe, it, expect } from 'vitest'
import {
  domainOf,
  groupAtlas,
  atlasHref,
  latestClosure,
  edgeCounts,
  cockpitStats,
  hash01,
  starLayout,
  type AtlasEntry,
  type Rhizome,
  type VitalSigns,
} from './cockpit'
import atlasJson from '@/data/atelier/atlas.json'
import rhizomeJson from '@/data/atelier/rhizome.json'
import vitalsJson from '@/data/atelier/vital-signs.json'

const atlas = atlasJson as AtlasEntry[]
const rhizome = rhizomeJson as Rhizome
const vitals = vitalsJson as VitalSigns

const entry = (over: Partial<AtlasEntry>): AtlasEntry => ({
  id: 'x',
  author: 'A',
  work: 'W',
  year: 2000,
  type: 'buch',
  tags: [],
  summary: '',
  relevance: '',
  added_by: 'fable',
  status: 'seed',
  ...over,
})

describe('domainOf (Prioritätsreihenfolge)', () => {
  it('artistic-research schlägt Maschinen-Tags', () => {
    expect(domainOf(entry({ tags: ['artistic-research', 'maschine/ki'] }))).toBe('praxis')
  })
  it('maschine/ki schlägt Philosophie-Tags', () => {
    expect(domainOf(entry({ tags: ['maschine/ki', 'philosophie'] }))).toBe('maschine')
  })
  it('Rest fällt auf methode', () => {
    expect(domainOf(entry({ tags: ['clinamen/aleatorik'] }))).toBe('methode')
  })
})

describe('atlasHref', () => {
  it('bevorzugt url, dann doi, dann arxiv', () => {
    expect(atlasHref(entry({ url: 'https://x.org' }))).toBe('https://x.org')
    expect(atlasHref(entry({ doi: '10.1/abc' }))).toBe('https://doi.org/10.1/abc')
    expect(atlasHref(entry({ arxiv: '2404.01413' }))).toBe('https://arxiv.org/abs/2404.01413')
    expect(atlasHref(entry({}))).toBeNull()
  })
})

/* Die echten Dateien wachsen jede Nacht mit Ulysses' Sitzungen — hier stehen deshalb
   NUR Invarianten, die für jeden Stand gelten müssen (nie Zustands-Annahmen wie
   „History ist leer": die brechen genau dann, wenn die Engine liefert). */
describe('gegen die echten Engine-Daten (Invarianten, kein Zustand)', () => {
  it('der Atlas hat verifizierte Einträge und jeder trägt einen Verweis', () => {
    expect(atlas.length).toBeGreaterThanOrEqual(70)
    for (const e of atlas) expect(atlasHref(e), e.id).not.toBeNull()
  })
  it('jeder Atlas-Eintrag landet in genau einer Domäne', () => {
    const groups = groupAtlas(atlas)
    expect(groups.praxis.length + groups.methode.length + groups.maschine.length).toBe(atlas.length)
    // keine Domäne darf leer sein — die Konstellation braucht drei Wolken
    expect(groups.praxis.length).toBeGreaterThan(0)
    expect(groups.methode.length).toBeGreaterThan(0)
    expect(groups.maschine.length).toBeGreaterThan(0)
  })
  it('closure ist null oder eine Zahl in [0,1]', () => {
    const c = latestClosure(vitals)
    if (c !== null) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(1)
    }
  })
  it('jede Kante referenziert existierende Knoten und einen bekannten kind', () => {
    const ids = new Set(rhizome.nodes.map((n) => n.id))
    for (const e of rhizome.edges) {
      expect(ids.has(e.from), `from: ${e.from}`).toBe(true)
      expect(ids.has(e.to), `to: ${e.to}`).toBe(true)
      expect(['elaborates', 'swerve', 'fork', 'bridge', 'continues', 'complement', 'grounds', 'measures', 'corrected-by']).toContain(e.kind)
    }
  })
  it('Stats sind konsistent (Werke vorhanden, read ⊇ worked, Zählungen ≥ 0)', () => {
    const stats = cockpitStats(rhizome, vitals, atlas)
    expect(stats.works).toBeGreaterThanOrEqual(20)
    expect(stats.edgesTotal).toBe(rhizome.edges.length)
    expect(stats.atlasRead).toBeGreaterThanOrEqual(stats.atlasWorked)
    expect(stats.atlasRead).toBeLessThanOrEqual(stats.atlasTotal)
    expect(stats.swerves).toBeGreaterThanOrEqual(0)
    expect(stats.sessionsMeasured).toBe(vitals.history.length)
  })
})

describe('Leer-Zustand (Fixtures — der Seed-Moment bleibt getestet, ohne am Live-Stand zu kleben)', () => {
  const emptyVitals: VitalSigns = { updated: '2026-07-14', history: [] }
  const seedRhizome: Rhizome = {
    updated: '2026-07-14',
    nodes: [{ id: 'w-2026-06-29-x', kind: 'work', label: 'X', date: '2026-06-29' }],
    edges: [],
  }
  it('leere History ⇒ closure null (ehrlich, keine erfundene Zahl)', () => {
    expect(latestClosure(emptyVitals)).toBeNull()
  })
  it('Seed: Werk-Knoten da, alles andere ehrlich auf null/0', () => {
    const stats = cockpitStats(seedRhizome, emptyVitals, [])
    expect(stats.edgesTotal).toBe(0)
    expect(stats.swerves).toBe(0)
    expect(stats.sessionsMeasured).toBe(0)
    expect(stats.closure).toBeNull()
  })
})

describe('latestClosure', () => {
  it('nimmt die jüngste vorhandene Zahl und klemmt auf [0,1]', () => {
    const v: VitalSigns = {
      updated: '2026-07-14',
      history: [
        { session: 1, date: '2026-07-01', closure: 0.3 },
        { session: 2, date: '2026-07-02', closure: 1.4 },
      ],
    }
    expect(latestClosure(v)).toBe(1)
  })
  it('überspringt Einträge ohne Zahl (leeres Feld schlägt erfundenen Wert)', () => {
    const v: VitalSigns = {
      updated: '2026-07-14',
      history: [
        { session: 1, date: '2026-07-01', closure: 0.42 },
        { session: 2, date: '2026-07-02', closure: null },
      ],
    }
    expect(latestClosure(v)).toBe(0.42)
  })
})

describe('edgeCounts + Swerve-Zählung', () => {
  const r: Rhizome = {
    updated: '2026-07-14',
    nodes: [
      { id: 'w-1', kind: 'work', label: 'W1' },
      { id: 't-1', kind: 'thread', label: 'T1' },
      { id: 'atlas:x', kind: 'source', label: 'X' },
    ],
    edges: [
      { from: 't-1', to: 'w-1', kind: 'elaborates' },
      { from: 'atlas:x', to: 't-1', kind: 'swerve', session: 34 },
    ],
  }
  it('zählt nach kind', () => {
    expect(edgeCounts(r)).toEqual({ elaborates: 1, swerve: 1, fork: 0, bridge: 0, continues: 0, complement: 0, grounds: 0, measures: 0, 'corrected-by': 0 })
  })
  it('Swerves = Maximum aus Kanten-Sicht und Vitalzeichen-Sicht, nie Summe', () => {
    const v: VitalSigns = {
      updated: '2026-07-14',
      history: [
        { session: 34, date: '2026-07-15', closure: 0.5, swerve: true },
        { session: 35, date: '2026-07-16', closure: 0.4, swerve: true },
      ],
    }
    expect(cockpitStats(r, v, []).swerves).toBe(2)
  })
})

describe('hash01 + starLayout (deterministisch)', () => {
  it('hash01 ist stabil und in [0,1)', () => {
    expect(hash01('frayling-research-in-art-and-design')).toBe(hash01('frayling-research-in-art-and-design'))
    for (const s of ['a', 'b', 'lucretius', '']) {
      expect(hash01(s)).toBeGreaterThanOrEqual(0)
      expect(hash01(s)).toBeLessThan(1)
    }
  })
  it('gleiche Daten ⇒ identisches Layout, Build für Build', () => {
    const a = starLayout(atlas, 1200, 640)
    const b = starLayout(atlas, 1200, 640)
    expect(a.map((s) => [s.x, s.y])).toEqual(b.map((s) => [s.x, s.y]))
  })
  it('alle Sterne bleiben im Rahmen und keiner geht verloren', () => {
    const stars = starLayout(atlas, 1200, 640)
    expect(stars.length).toBe(atlas.length)
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0)
      expect(s.x).toBeLessThanOrEqual(1200)
      expect(s.y).toBeGreaterThanOrEqual(0)
      expect(s.y).toBeLessThanOrEqual(640)
    }
  })
})

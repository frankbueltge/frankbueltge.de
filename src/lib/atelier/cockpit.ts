// src/lib/atelier/cockpit.ts — Datenschicht des Cockpits (/atelier/cockpit).
// Liest die committeten Engine-JSONs (src/data/atelier/*) und leitet daraus die
// Anzeigen ab. Alles hier ist deterministisch: das Cockpit rendert nur verifizierte,
// committete Daten — leere Felder bleiben leer (eine ehrliche Lücke schlägt jede
// erfundene Zahl), und Layout-Positionen kommen aus einem Hash, nie aus Math.random.

export type AtlasStatus = 'seed' | 'read' | 'worked' | 'archived'

export interface AtlasEntry {
  id: string
  author: string
  work: string
  year: number
  type: 'buch' | 'paper' | 'manifest' | 'essay'
  url?: string
  doi?: string
  arxiv?: string
  tags: string[]
  summary: string
  relevance: string
  added_by: string
  status: AtlasStatus
  archived_reason?: string
  session_read?: string
}

export type NodeKind = 'work' | 'thread' | 'source' | 'impulse'
// Ulysses' Rhizom-Vokabular ist offen — neue Kinds werden hier BEWUSST aufgenommen,
// wenn die Praxis sie einführt (S27: continues/grounds/complement); das Integrate-Gate
// (cockpit.test.ts) schlägt sonst ehrlich an, statt still zu raten.
export type EdgeKind = 'elaborates' | 'swerve' | 'fork' | 'bridge' | 'continues' | 'complement' | 'grounds' | 'measures' | 'corrected-by'

export interface RhizomeNode {
  id: string
  kind: NodeKind
  label: string
  date?: string
}

export interface RhizomeEdge {
  from: string
  to: string
  kind: EdgeKind
  session?: number
}

export interface Rhizome {
  updated: string
  note?: string
  nodes: RhizomeNode[]
  edges: RhizomeEdge[]
}

export interface VitalEntry {
  session: number
  date: string
  mode?: string
  closure?: number | null
  closure_note?: string
  swerve?: boolean
  swerve_from?: string | null
  atlas_touched?: string[]
  works_touched?: string[]
  fork_opened?: string | null
}

export interface VitalSigns {
  updated: string
  history: VitalEntry[]
}

/* ── Atlas-Domänen ──────────────────────────────────────────────────────────
   Der Atlas ist über Tags organisiert; fürs Cockpit gruppieren wir in die drei
   Wissensgebiete der Kuratierung (atlas/README.md). Prioritätsreihenfolge ist
   bewusst: ein Eintrag mit 'artistic-research' gehört zur Praxis, auch wenn er
   zusätzlich Philosophie-Tags trägt. */

export type AtlasDomain = 'praxis' | 'maschine' | 'methode'

export const DOMAIN_ORDER: readonly AtlasDomain[] = ['praxis', 'methode', 'maschine'] as const

export function domainOf(e: AtlasEntry): AtlasDomain {
  const t = new Set(e.tags)
  if (t.has('artistic-research') || t.has('practice-as-research')) return 'praxis'
  if (t.has('maschine/ki') || t.has('computation') || t.has('kybernetik')) return 'maschine'
  return 'methode'
}

export function groupAtlas(entries: AtlasEntry[]): Record<AtlasDomain, AtlasEntry[]> {
  const groups: Record<AtlasDomain, AtlasEntry[]> = { praxis: [], methode: [], maschine: [] }
  for (const e of entries) groups[domainOf(e)].push(e)
  return groups
}

/** Der eine externe Verweis eines Atlas-Eintrags (Regel: verifizierbar oder seed). */
export function atlasHref(e: AtlasEntry): string | null {
  if (e.url) return e.url
  if (e.doi) return `https://doi.org/${e.doi}`
  if (e.arxiv) return `https://arxiv.org/abs/${e.arxiv}`
  return null
}

/* ── Vitalzeichen ─────────────────────────────────────────────────────────── */

/** Jüngste closure-Konjektur — oder null, solange die History leer ist. */
export function latestClosure(v: VitalSigns): number | null {
  for (let i = v.history.length - 1; i >= 0; i--) {
    const c = v.history[i].closure
    if (typeof c === 'number' && Number.isFinite(c)) return Math.min(1, Math.max(0, c))
  }
  return null
}

export function edgeCounts(r: Rhizome): Record<EdgeKind, number> {
  const counts: Record<EdgeKind, number> = { elaborates: 0, swerve: 0, fork: 0, bridge: 0, continues: 0, complement: 0, grounds: 0, measures: 0, 'corrected-by': 0 }
  for (const e of r.edges) if (e.kind in counts) counts[e.kind]++
  return counts
}

export interface CockpitStats {
  works: number
  threads: number
  sourcesLinked: number
  impulses: number
  edgesTotal: number
  sessionsMeasured: number
  swerves: number
  closure: number | null
  atlasTotal: number
  atlasRead: number
  atlasWorked: number
}

export function cockpitStats(rhizome: Rhizome, vitals: VitalSigns, atlas: AtlasEntry[]): CockpitStats {
  const kind = (k: NodeKind) => rhizome.nodes.filter((n) => n.kind === k).length
  const edges = edgeCounts(rhizome)
  // Ein „Swerve" zählt, wo er sichtbar wird: als gezogene swerve-Kante im Rhizom
  // oder als selbstberichteter swerve in den Vitalzeichen — wir nehmen das Maximum
  // beider Sichten statt sie zu addieren (dieselbe Bewegung, zweimal notiert).
  const vitalSwerves = vitals.history.filter((h) => h.swerve === true).length
  return {
    works: kind('work'),
    threads: kind('thread'),
    sourcesLinked: kind('source'),
    impulses: kind('impulse'),
    edgesTotal: rhizome.edges.length,
    sessionsMeasured: vitals.history.length,
    swerves: Math.max(edges.swerve, vitalSwerves),
    closure: latestClosure(vitals),
    atlasTotal: atlas.length,
    atlasRead: atlas.filter((e) => e.status === 'read' || e.status === 'worked').length,
    atlasWorked: atlas.filter((e) => e.status === 'worked').length,
  }
}

/* ── Deterministisches Layout ───────────────────────────────────────────────
   FNV-1a über die ID → [0,1). Gleiche Daten ⇒ gleiches Bild, Build für Build. */

export function hash01(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) / 0x100000000
}

export interface Star {
  x: number
  y: number
  r: number
  entry: AtlasEntry
  domain: AtlasDomain
}

const STAR_RADIUS: Record<AtlasEntry['type'], number> = {
  buch: 4.6,
  paper: 3.6,
  manifest: 3.2,
  essay: 3.2,
}

/**
 * Konstellations-Layout: drei Domänen-Wolken nebeneinander, jeder Stern auf einer
 * deterministisch gejitterten Spiralbahn um sein Domänen-Zentrum. Eine kurze
 * Relaxation schiebt Überlappungen auseinander (deterministisch, feste Iterationen).
 */
export function starLayout(entries: AtlasEntry[], width: number, height: number): Star[] {
  const groups = groupAtlas(entries)
  const centers: Record<AtlasDomain, { cx: number; cy: number }> = {
    praxis: { cx: width * 0.2, cy: height * 0.46 },
    methode: { cx: width * 0.5, cy: height * 0.56 },
    maschine: { cx: width * 0.8, cy: height * 0.44 },
  }
  const stars: Star[] = []
  for (const domain of DOMAIN_ORDER) {
    const list = groups[domain]
    const { cx, cy } = centers[domain]
    const spread = Math.min(width * 0.14, height * 0.36)
    list.forEach((entry, i) => {
      // Sonnenblumen-Spirale (goldener Winkel) + Hash-Jitter → organische Wolke ohne Raster.
      const angle = i * 2.399963 + hash01(entry.id) * 0.9
      const radius = spread * Math.sqrt((i + 0.6) / list.length) * (0.82 + hash01(entry.id + '#r') * 0.36)
      stars.push({
        x: cx + Math.cos(angle) * radius * 1.35,
        y: cy + Math.sin(angle) * radius,
        r: STAR_RADIUS[entry.type] ?? 3.4,
        entry,
        domain,
      })
    })
  }
  // Relaxation: feste 24 Iterationen, rein aus den Positionen abgeleitet → deterministisch.
  for (let iter = 0; iter < 24; iter++) {
    for (let a = 0; a < stars.length; a++) {
      for (let b = a + 1; b < stars.length; b++) {
        const s = stars[a]
        const t = stars[b]
        const dx = t.x - s.x
        const dy = t.y - s.y
        const min = s.r + t.r + 10
        const d = Math.hypot(dx, dy) || 0.001
        if (d < min) {
          const push = (min - d) / 2
          const ux = dx / d
          const uy = dy / d
          s.x -= ux * push
          s.y -= uy * push
          t.x += ux * push
          t.y += uy * push
        }
      }
    }
  }
  // In den Rahmen klemmen (Relaxation kann an den Rand schieben).
  const pad = 14
  for (const s of stars) {
    s.x = Math.min(width - pad, Math.max(pad, s.x))
    s.y = Math.min(height - pad, Math.max(pad, s.y))
  }
  return stars
}

// src/lib/engines/register.ts
// The works register (/works): every work the three practices have produced, from the works'
// own committed meta.json files and from nothing else.
//
// The hub's LATEST strip reads the same derivation and shows the newest few (see
// src/lib/engines/latest.ts). This module adds the two things a complete register needs and a
// strip does not: it glob-reads ALL five work sources in one place, so the page and the
// catalogues card can never count differently, and it counts what it found instead of
// carrying numbers in prose.
//
// Scope, stated rather than assumed: the three research practices only. The Plenum
// (data-snack) keeps its works in src/content/plenum/works as essays without work metas —
// it is a house of its own, and quietly folding its texts in here would make the count a
// claim nobody could check against these files.
import { collectWorks, type EngineKind, type EngineNs, type EngineWorkMeta, type LatestWork, type WorkSource } from './latest'

/** The forked nightly line's mirror — named once, because three things must agree about it:
 *  the source below, the works that come out of it, and the tests that hold both. */
export const NIGHTLY_FORK_DIR = 'src/data/nightly/works'

/** The five committed sources of work metadata, with the shape each one has.
 *  import.meta.glob needs literal arguments (Vite analyses them statically), so they are
 *  listed rather than generated. An empty namespace yields {} and drops out harmlessly. */
export const WORK_SOURCES: (WorkSource & { dir: string })[] = [
  {
    ns: 'field', kind: 'astro', dir: 'src/components/field/werke',
    metas: import.meta.glob('/src/components/field/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>,
  },
  {
    ns: 'atelier', kind: 'astro', dir: 'src/components/atelier/werke',
    metas: import.meta.glob('/src/components/atelier/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>,
  },
  {
    ns: 'atelier', kind: 'html', dir: 'src/content/atelier/works',
    metas: import.meta.glob('/src/content/atelier/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>,
  },
  {
    ns: 'studio', kind: 'html', dir: 'src/content/studio/works',
    metas: import.meta.glob('/src/content/studio/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>,
  },
  // The fifth source, and the only one outside the three practices' own repositories: the nightly
  // line's fork (frankbueltge/error-as-method), mirrored by scripts/nightly/mirror.mjs. It carries
  // the Atelier's namespace because it IS the Atelier's practice by descent — one founding text,
  // one position, two constitutions since 2026-07-18 — and only its address differs, which is why
  // the source declares its own stage. Its inherited half is deliberately absent: those works have
  // been in src/content/atelier since the night each was made, and a register reading both mirrors
  // would count all thirty of them twice.
  {
    ns: 'atelier', kind: 'html', dir: NIGHTLY_FORK_DIR,
    stage: (slug: string) => `/error-as-method/${slug}/`,
    metas: import.meta.glob('/src/data/nightly/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>,
  },
]

/** Every work, newest first — withdrawn ones included and marked, never dropped.
 *  Links point at the works themselves ('stage'), which for an html work is its standalone
 *  full-viewport route and not the practice's front page. */
export function allWorks(): LatestWork[] {
  return collectWorks(WORK_SOURCES, { hrefMode: 'stage' })
}

/** The works the forked nightly line has made since 2026-07-18 — the register's own rows,
 *  filtered by the directory they were read from rather than re-globbed, so the line's page
 *  and the house's register can never disagree about what the fork has made. */
export function forkedNightlyWorks(): LatestWork[] {
  return allWorks().filter((w) => w.dir === NIGHTLY_FORK_DIR)
}

export interface WorksSummary {
  total: number
  withdrawn: number
  byNs: Record<EngineNs, number>
  byKind: Record<EngineKind, number>
  /** The register's own span, from the works' own dates. */
  first?: string
  last?: string
}

/** Counted, never claimed — the page renders these, so no digit is ever written into copy. */
export function summarise(works: LatestWork[]): WorksSummary {
  const byNs: Record<EngineNs, number> = { atelier: 0, field: 0, studio: 0 }
  const byKind: Record<EngineKind, number> = { astro: 0, html: 0 }
  for (const w of works) {
    byNs[w.ns] += 1
    byKind[w.kind] += 1
  }
  const dates = works.map((w) => w.date).filter(Boolean).sort()
  return {
    total: works.length,
    withdrawn: works.filter((w) => w.state === 'withdrawn').length,
    byNs,
    byKind,
    first: dates[0],
    last: dates.at(-1),
  }
}

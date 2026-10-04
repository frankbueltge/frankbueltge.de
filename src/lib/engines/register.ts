// src/lib/engines/register.ts
// The works register (/ecology#register, at /works until 2026-09-03): every work the three
// practices have produced, from the works' own committed meta.json files and from nothing else.
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
//
// Since 2026-10-04 the register on /ecology is more than allWorks(): it is buildRegister() below,
// the works merged with the practices' session ARTIFACTS. Research ecology v3 (2026-08-30) has
// every session leave one self-contained artifact, and two of the three practices land those
// outside any meta.json — the Field under artifacts/, the Atelier under window/ — so a register
// that read the works alone showed two months of the Studio and almost nothing of the other two.
// allWorks() keeps its meaning (the works, and only the works) for the rooms and figures that
// count works; the page that claims to list everything the practices brought forth reads both.
import { ECOLOGY_V3 } from '@/config/ecology-v3-wording'
import { loadArtifacts, type ArtifactEntry } from '@/lib/ecology/v3'
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

// ---------------------------------------------------------------------------------------------
// THE REGISTER AS /ecology LISTS IT (2026-10-04): works and session artifacts, one list.

/** Whose a register row is. The three practices by their namespace, and the nightly line under
 *  its own id: its works carry the Atelier's namespace by descent, but since 2026-08-31 the line
 *  has its own name, it keeps its own address (/error-as-method), and the canon places it beside
 *  the ecology rather than inside it — so its rows are its own, never counted as the Atelier's.
 *  The id is the one the signal log already uses for the same line (src/lib/ops/house-feed.ts). */
export type RegisterHouse = EngineNs | 'nightly-line'

/** The order houses take on a shared day and in the head line — the doors' own order, the
 *  nightly line after the three practices it stands beside. */
export const REGISTER_HOUSES: readonly RegisterHouse[] = ['atelier', 'field', 'studio', 'nightly-line']

/** Whether a work is the nightly line's: decided by the directory it was mirrored from, never by
 *  its namespace (which it shares with the Atelier) or its href (which a route rename would move). */
export const isNightlyLine = (w: Pick<LatestWork, 'dir'>): boolean => w.dir === NIGHTLY_FORK_DIR

/** Whether an artifact gets a row of its own: it must carry a day, and it must not already BE a
 *  work of the register — the Studio ships its artifacts as works (meta.json), and listing those
 *  again would count every Studio session twice. One predicate, shared with the signal log, so
 *  the two readings of the house can never disagree about which artifacts exist. */
export const isListedArtifact = (a: ArtifactEntry): boolean => a.date !== null && !a.fromWorksRegister

interface RowBase {
  house: RegisterHouse
  /** the namespace the row's colour and audit key come from — the nightly line's is the Atelier's */
  ns: EngineNs
  slug: string
  title: string
  date: string
  href: string
}

/** One line of the register. A work keeps everything the work record carries (withdrawal,
 *  blurb, line); an artifact keeps the entry it was read from and the source it was read in. */
export type RegisterRow =
  | (RowBase & { kind: 'work'; work: LatestWork })
  | (RowBase & { kind: 'artifact'; artifact: ArtifactEntry; source: string })

/** The committed place an artifact row was read from, in the loader's own conventions
 *  (src/lib/ecology/v3.ts, loadArtifacts) — the register's foot names these, so a reader can
 *  check the list against the repository. Derived from the row's href, which mirrors its path
 *  under public/ one to one. */
export function artifactSource(a: Pick<ArtifactEntry, 'href'>): string {
  const nested = /^\/([\w-]+)\/artifacts\/cycle-\d+\/[^/]+\/$/.exec(a.href)
  if (nested) return `public/${nested[1]}/artifacts/cycle-NNN/<date>-<slug>/`
  const flat = /^\/([\w-]+)\/artifacts\/[^/]+\/$/.exec(a.href)
  if (flat) return `public/${flat[1]}/artifacts/<date>-<slug>/`
  const window = /^\/([\w-]+)\/window\/cycle-[^/]+\/$/.exec(a.href)
  if (window) return `public/${window[1]}/window/cycle-NNN[-session-n]/`
  return `public${a.href}`
}

export interface Register {
  /** every dated work and artifact, newest first */
  rows: RegisterRow[]
  /** artifacts the practices committed whose record gives them no day — named in the foot,
   *  never placed on the list under a guessed date and never dropped without a word */
  undated: ArtifactEntry[]
}

export interface RegisterSources {
  works?: readonly LatestWork[]
  artifacts?: readonly ArtifactEntry[]
}

const workRow = (w: LatestWork): RegisterRow => ({
  kind: 'work',
  house: isNightlyLine(w) ? 'nightly-line' : w.ns,
  ns: w.ns,
  slug: w.slug,
  title: w.title,
  date: w.date,
  href: w.href,
  work: w,
})

const artifactRow = (a: ArtifactEntry): RegisterRow => ({
  kind: 'artifact',
  house: a.practice,
  ns: a.practice,
  slug: a.slug,
  // the practice's own title where its page has one; the slug read as words otherwise — the
  // same fallback every other surface of the cycle uses
  title: ECOLOGY_V3.artifacts.entryLabel(a.slug, a.title),
  date: a.date!,
  href: a.href,
  artifact: a,
  source: artifactSource(a),
})

/**
 * The register /ecology prints: every work of allWorks() and every listed artifact of
 * loadArtifacts(), newest first. Both sources are injectable for tests; left out, each reads its
 * own committed record.
 *
 * Order is total, so a rebuild is never a reshuffle: by date, then by house in the doors' order,
 * works before artifacts on the same day, then in the order each source already keeps.
 *
 * An artifact whose address is already a work's row is not listed twice — fromWorksRegister
 * catches every such case today; the href check is the second lock on the same door.
 */
export function buildRegister(sources: RegisterSources = {}): Register {
  const works = sources.works ?? allWorks()
  const artifacts = sources.artifacts ?? loadArtifacts()
  const workHrefs = new Set(works.map((w) => w.href))
  const fresh = artifacts.filter((a) => !a.fromWorksRegister && !workHrefs.has(a.href))
  const listed = [...works.map(workRow), ...fresh.filter(isListedArtifact).map(artifactRow)]
  const rank = new Map(listed.map((r, i) => [r, i]))
  const rows = listed.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      REGISTER_HOUSES.indexOf(a.house) - REGISTER_HOUSES.indexOf(b.house) ||
      (a.kind === b.kind ? 0 : a.kind === 'work' ? -1 : 1) ||
      rank.get(a)! - rank.get(b)!,
  )
  return { rows, undated: fresh.filter((a) => a.date === null) }
}

/** How many lines the register lists — the one number the catalogues card shows for it, from the
 *  same derivation the register page renders, so the card and the page cannot count apart. */
export function registerCount(): number {
  return buildRegister().rows.length
}

export interface RegisterSummary {
  total: number
  works: number
  artifacts: number
  withdrawn: number
  byHouse: Record<RegisterHouse, { works: number; artifacts: number }>
  /** the register's own span, from the rows' own dates */
  first?: string
  last?: string
}

/** Counted, never claimed — per house and per kind, so the head line can say what each practice
 *  made in its own nouns and never call an artifact a work. */
export function summariseRegister(rows: readonly RegisterRow[]): RegisterSummary {
  const byHouse = Object.fromEntries(
    REGISTER_HOUSES.map((h) => [h, { works: 0, artifacts: 0 }]),
  ) as RegisterSummary['byHouse']
  let withdrawn = 0
  for (const r of rows) {
    if (r.kind === 'work') {
      byHouse[r.house].works += 1
      if (r.work.state === 'withdrawn') withdrawn += 1
    } else byHouse[r.house].artifacts += 1
  }
  const dates = rows.map((r) => r.date).sort()
  const works = rows.filter((r) => r.kind === 'work').length
  return {
    total: rows.length,
    works,
    artifacts: rows.length - works,
    withdrawn,
    byHouse,
    first: dates[0],
    last: dates.at(-1),
  }
}

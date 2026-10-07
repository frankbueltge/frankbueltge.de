// src/lib/engines/latest.ts
// Engine works across namespaces — pure and testable; the Astro components pass in their
// import.meta.glob results (globs cannot be parameterised).
//
// Two callers, one derivation: the hub's LATEST strip takes the newest few (latestWorks),
// the works register takes the lot (collectWorks) — so a work can never appear on the
// entrance under one date and in the register under another.
export type EngineNs = 'field' | 'atelier' | 'studio'
/** astro-kind works live under src/components/<ns>/werke/*, get a standalone /<ns>/werke/<slug>
 *  page. html-kind works live under src/content/<ns>/works/*, and their built stage is a static
 *  file under public/<ns>/werke-html/<slug>/ — see hrefFor() for which of the two a caller gets. */
export type EngineKind = 'astro' | 'html'
/** What the practice's own record says has happened to a work. Only 'withdrawn' is read off the
 *  work's own meta.json (the /^WITHDRAWN/ marker the Studio writes into `medium`); the other two
 *  are the practices' own words for a work that stands: the Studio premieres, the Atelier and the
 *  Field publish. Nothing here is a verdict of this module's own making. */
export type WorkState = 'published' | 'premiered' | 'withdrawn'
export interface EngineWorkMeta {
  title?: string
  date?: string
  embodies?: string
  verkoerpert?: string
  medium?: string
  /** the Studio's session number, where its meta.json carries one */
  session?: unknown
  /** the work's signature — the nightly line signs "Ulysses (the nightly line), Session 112" */
  author?: unknown
}
export interface LatestWork {
  ns: EngineNs
  kind: EngineKind
  slug: string
  title: string
  date: string
  blurb?: string
  href: string
  state: WorkState
  /** The work's own withdrawal marker, verbatim and unabridged up to its first full stop —
   *  shown, never summarised: the record keeps every mark. Absent unless state is 'withdrawn'. */
  withdrawnNote?: string
  /** The date inside that marker, when it carries one. */
  withdrawnOn?: string
  /** The committed directory this work was read from, when the caller declared one. A work
   *  knowing its own source is what lets a test say "this row links there BECAUSE it came from
   *  here" instead of inferring it from the namespace — which stopped being sufficient when a
   *  second repository began contributing works to the same practice. */
  dir?: string
  /** The session that made it, where the work's own record numbers it — see sessionOf. Absent
   *  where it does not. */
  session?: number
}

/**
 * The session a work's own record says made it: the `session` field of its meta.json (the Studio
 * writes one), or the session its signature names (the nightly line signs "Ulysses (the nightly
 * line), Session 112"). Added 2026-10-07, when five sessions a day landed in one practice and the
 * signal log, finding no time in a work's record, stood a day's works in the order of their titles
 * — so the entrance showed the day's oldest and left its newest below the cut. Nothing is
 * inferred: a record that numbers no session gives none.
 */
export function sessionOf(meta: EngineWorkMeta): number | undefined {
  if (typeof meta.session === 'number' && Number.isInteger(meta.session) && meta.session > 0) return meta.session
  const signed = typeof meta.author === 'string' ? /\bSession\s+(\d+)\b/.exec(meta.author) : null
  return signed ? Number(signed[1]) : undefined
}

/** Where a work's link points.
 *  · 'engine' — html works link to the practice's own page. This is what the hub's LATEST strip
 *    has shipped since the 2026-07-02 review (back then html works had no page of their own and
 *    a /<ns>/werke/<slug> link was a 404).
 *  · 'stage' — html works link to their standalone full-viewport stage under
 *    /<ns>/werke-html/<slug>/, which is where the practices' own works rooms have sent visitors
 *    since the exhibition model landed (2026-07-21). A catalogue of works must link the work. */
export type HrefMode = 'engine' | 'stage'

export function hrefFor(ns: EngineNs, kind: EngineKind, slug: string, mode: HrefMode = 'engine'): string {
  if (kind === 'astro') return `/${ns}/werke/${slug}`
  return mode === 'stage' ? `/${ns}/werke-html/${slug}/` : `/${ns}/`
}

const WITHDRAWN = /^WITHDRAWN\b/i

/** The withdrawal marker as the practice wrote it: from "WITHDRAWN" up to the first full stop.
 *  Verbatim — a withdrawal is a completed honest act and gets quoted, not paraphrased. */
function withdrawalMarker(meta: EngineWorkMeta): string | undefined {
  const text = [meta.medium, meta.embodies, meta.verkoerpert].find((t) => t && WITHDRAWN.test(t.trim()))
  if (!text) return undefined
  const trimmed = text.trim()
  return (trimmed.match(/^.*?\.(?=\s|$)/)?.[0] ?? trimmed).trim()
}

/** A committed source of work metadata. `stage` exists for the one case hrefFor cannot derive:
 *  a source whose works live at an address of their own rather than at their practice's. It is
 *  declared by the source, not patched onto the result, so every caller — register, entrance,
 *  line page — reads the same link for the same work. */
export interface WorkSource {
  ns: EngineNs
  kind: EngineKind
  metas: Record<string, EngineWorkMeta>
  dir?: string
  stage?: (slug: string) => string
}

export function collectWorks(input: WorkSource[], options: { hrefMode?: HrefMode } = {}): LatestWork[] {
  const mode = options.hrefMode ?? 'engine'
  const all: LatestWork[] = []
  for (const { ns, kind, metas, dir, stage } of input) {
    for (const [path, meta] of Object.entries(metas)) {
      const slug = path.match(/\/(?:werke|works)\/([^/]+)\//)?.[1]
      if (!slug) continue
      const date = meta.date ?? slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
      const marker = withdrawalMarker(meta)
      const session = sessionOf(meta)
      all.push({
        ns, kind, slug, date,
        title: meta.title ?? slug,
        blurb: meta.embodies ?? meta.verkoerpert,
        href: stage ? stage(slug) : hrefFor(ns, kind, slug, mode),
        dir,
        state: marker ? 'withdrawn' : ns === 'studio' ? 'premiered' : 'published',
        withdrawnNote: marker,
        withdrawnOn: marker?.match(/(\d{4}-\d{2}-\d{2})/)?.[1],
        ...(session !== undefined ? { session } : {}),
      })
    }
  }
  // Newest first; the slug breaks ties so a rebuild is never a re-ordering.
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
}

export function latestWorks(input: WorkSource[], limit = 4): LatestWork[] {
  return collectWorks(input).slice(0, limit)
}

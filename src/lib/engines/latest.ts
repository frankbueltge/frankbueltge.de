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

export function collectWorks(
  input: { ns: EngineNs; kind: EngineKind; metas: Record<string, EngineWorkMeta> }[],
  options: { hrefMode?: HrefMode } = {},
): LatestWork[] {
  const mode = options.hrefMode ?? 'engine'
  const all: LatestWork[] = []
  for (const { ns, kind, metas } of input) {
    for (const [path, meta] of Object.entries(metas)) {
      const slug = path.match(/\/(?:werke|works)\/([^/]+)\//)?.[1]
      if (!slug) continue
      const date = meta.date ?? slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
      const marker = withdrawalMarker(meta)
      all.push({
        ns, kind, slug, date,
        title: meta.title ?? slug,
        blurb: meta.embodies ?? meta.verkoerpert,
        href: hrefFor(ns, kind, slug, mode),
        state: marker ? 'withdrawn' : ns === 'studio' ? 'premiered' : 'published',
        withdrawnNote: marker,
        withdrawnOn: marker?.match(/(\d{4}-\d{2}-\d{2})/)?.[1],
      })
    }
  }
  // Newest first; the slug breaks ties so a rebuild is never a re-ordering.
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
}

export function latestWorks(
  input: { ns: EngineNs; kind: EngineKind; metas: Record<string, EngineWorkMeta> }[],
  limit = 4,
): LatestWork[] {
  return collectWorks(input).slice(0, limit)
}

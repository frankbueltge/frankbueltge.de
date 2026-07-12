// src/lib/engines/latest.ts
// Newest engine works across namespaces — pure and testable; the Astro components pass in
// their import.meta.glob results (globs cannot be parameterised).
export type EngineNs = 'field' | 'atelier' | 'studio'
/** astro-kind works live under src/components/<ns>/werke/*, get a standalone /<ns>/werke/<slug>
 *  page. html-kind works live under src/content/<ns>/works/*, have NO standalone page — they
 *  render only as iframes on the engine's own page, so they must link there instead (2026-07-02
 *  review of Task 5: the old single-shape helper produced a 404 for html-kind works). */
export type EngineKind = 'astro' | 'html'
export interface EngineWorkMeta { title?: string; date?: string; embodies?: string; verkoerpert?: string }
export interface LatestWork { ns: EngineNs; slug: string; title: string; date: string; blurb?: string; href: string }

export function latestWorks(
  input: { ns: EngineNs; kind: EngineKind; metas: Record<string, EngineWorkMeta> }[],
  limit = 4,
): LatestWork[] {
  const all: LatestWork[] = []
  for (const { ns, kind, metas } of input) {
    for (const [path, meta] of Object.entries(metas)) {
      const slug = path.match(/\/(?:werke|works)\/([^/]+)\//)?.[1]
      if (!slug) continue
      const date = meta.date ?? slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
      all.push({
        ns, slug, date,
        title: meta.title ?? slug,
        blurb: meta.embodies ?? meta.verkoerpert,
        href: kind === 'astro' ? `/${ns}/werke/${slug}` : `/${ns}/`,
      })
    }
  }
  return all
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
    .slice(0, limit)
}

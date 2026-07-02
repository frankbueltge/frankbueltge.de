// src/lib/engines/latest.ts
// Newest engine works across namespaces — pure and testable; the Astro components pass in
// their import.meta.glob results (globs cannot be parameterised).
export type EngineNs = 'field' | 'atelier'
export interface EngineWorkMeta { title?: string; date?: string; embodies?: string; verkoerpert?: string }
export interface LatestWork { ns: EngineNs; slug: string; title: string; date: string; blurb?: string; href: string }

export function latestWorks(
  input: { ns: EngineNs; metas: Record<string, EngineWorkMeta> }[],
  limit = 4,
): LatestWork[] {
  const all: LatestWork[] = []
  for (const { ns, metas } of input) {
    for (const [path, meta] of Object.entries(metas)) {
      const slug = path.match(/\/(?:werke|works)\/([^/]+)\//)?.[1]
      if (!slug) continue
      const date = meta.date ?? slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
      all.push({
        ns, slug, date,
        title: meta.title ?? slug,
        blurb: meta.embodies ?? meta.verkoerpert,
        href: `/${ns}/werke/${slug}`,
      })
    }
  }
  return all
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
    .slice(0, limit)
}

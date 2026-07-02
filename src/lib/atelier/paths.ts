export type WorkKind = 'html' | 'astro'
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[]; ignored: string[] }
export interface RejectedWork { slug: string; kind: null; reason: string }
export interface FileMap { from: string; to: string }

const ALLOWED_EXT = /\.(astro|ts|js|json|css|svg|html)$/

export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const files = fileNames.filter((f) => ALLOWED_EXT.test(f))
  const ignored = fileNames.filter((f) => !ALLOWED_EXT.test(f))
  if (files.includes('work.astro')) return { slug, kind: 'astro', files, ignored }
  if (files.includes('index.html')) return { slug, kind: 'html', files, ignored }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}

export function siteTargets(work: ClassifiedWork, ns = 'atelier'): FileMap[] {
  if (work.kind === 'html') {
    return work.files.map((f) => ({
      from: f,
      to: f === 'index.html'
        ? `public/${ns}/werke-html/${work.slug}/index.html`
        : `src/content/${ns}/works/${work.slug}/${f}`,
    }))
  }
  // astro: whole dir → components/<ns>/werke/<slug>/, work.astro → index.astro
  return work.files.map((f) => ({
    from: f,
    to: `src/components/${ns}/werke/${work.slug}/${f === 'work.astro' ? 'index.astro' : f}`,
  }))
}

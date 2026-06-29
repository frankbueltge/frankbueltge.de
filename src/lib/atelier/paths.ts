export type WorkKind = 'html' | 'astro'
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[] }
export interface RejectedWork { slug: string; kind: null; reason: string }
export interface FileMap { from: string; to: string }

const ALLOWED_EXT = /\.(astro|ts|js|json|css|svg|html)$/

export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const bad = fileNames.find((f) => !ALLOWED_EXT.test(f))
  if (bad) return { slug, kind: null, reason: `disallowed file type: ${bad}` }
  if (fileNames.includes('work.astro')) return { slug, kind: 'astro', files: fileNames }
  if (fileNames.includes('index.html')) return { slug, kind: 'html', files: fileNames }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}

export function siteTargets(work: ClassifiedWork): FileMap[] {
  if (work.kind === 'html') {
    return work.files.map((f) => ({
      from: f,
      to: f === 'index.html'
        ? `public/atelier/werke-html/${work.slug}/index.html`
        : `src/content/atelier/works/${work.slug}/${f}`,
    }))
  }
  // astro: whole dir → components/atelier/werke/<slug>/, work.astro → index.astro
  return work.files.map((f) => ({
    from: f,
    to: `src/components/atelier/werke/${work.slug}/${f === 'work.astro' ? 'index.astro' : f}`,
  }))
}

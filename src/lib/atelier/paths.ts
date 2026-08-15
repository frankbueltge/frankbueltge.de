export type WorkKind = 'html' | 'astro'
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[]; ignored: string[] }
export interface RejectedWork { slug: string; kind: null; reason: string }
export interface FileMap { from: string; to: string }

// What travels from an engine repo into the site.
//
// Code and markup, as before — plus the assets a work needs to BE a work (2026-08-16).
// Until then the list carried no raster image, no font, no audio and no moving image, so a
// standalone work could only reach a visitor through text, SVG and canvas. Anything else had
// to be base64-inlined into the HTML, which costs a third of its size again and blocks the
// parser. Studio Protocol v3's form floor asks for sound, moving image and time-based
// behaviour; this line is what made those impossible, not the CSP alone.
//
// The site's works CSP allows `media-src 'self' data:` and `img-src 'self' data:` for the
// studio's routes, so these files play when they arrive as files. Cloudflare Pages caps a
// single asset at 25 MiB — enforced in integrate.ts, because a file over it fails the deploy
// rather than the gate.
const ALLOWED_EXT =
  /\.(astro|ts|js|mjs|json|css|svg|html|png|jpe?g|webp|avif|gif|woff2?|mp3|ogg|wav|m4a|flac|mp4|webm)$/i

export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const files = fileNames.filter((f) => ALLOWED_EXT.test(f))
  const ignored = fileNames.filter((f) => !ALLOWED_EXT.test(f))
  if (files.includes('work.astro')) return { slug, kind: 'astro', files, ignored }
  if (files.includes('index.html')) return { slug, kind: 'html', files, ignored }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}

export function siteTargets(work: ClassifiedWork, ns = 'atelier'): FileMap[] {
  if (work.kind === 'html') {
    // meta.json speist die Content-Collection; alle übrigen Dateien sind Laufzeit-Assets
    // und müssen NEBEN der index.html liegen, sonst laufen relative Referenzen ins 404.
    return work.files.map((f) => ({
      from: f,
      to: f === 'meta.json'
        ? `src/content/${ns}/works/${work.slug}/meta.json`
        : `public/${ns}/werke-html/${work.slug}/${f}`,
    }))
  }
  // astro: whole dir → components/<ns>/werke/<slug>/, work.astro → index.astro
  return work.files.map((f) => ({
    from: f,
    to: `src/components/${ns}/werke/${work.slug}/${f === 'work.astro' ? 'index.astro' : f}`,
  }))
}

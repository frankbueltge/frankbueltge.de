export type WorkKind = 'html' | 'astro'
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[]; ignored: string[] }
export interface RejectedWork { slug: string; kind: null; reason: string }
export interface FileMap { from: string; to: string }

// What travels from an engine repo into the site, by the form of the work.
//
// A STANDALONE work (`index.html`) travels WHOLE since 2026-10-05 (Frank's decision, wording
// private: the practices may publish rich works, and size and form are not limited). Every file
// at every depth of its directory comes along — scripts and vendored libraries, a built app's
// output, models, textures, sound, video, fonts, WebAssembly, data, further pages, and the
// licence files a vendored library must travel with. Such a work is served bare from public/
// and never compiled by this site, so filtering it protects nothing. The allow-list that stood
// here from 2026-08-16 dropped .wasm, .glb, .ttf, .txt, .csv, LICENSE and every subdirectory,
// so a multi-file work arrived broken. Only housekeeping stays behind: dotfiles and
// dot-directories (.gitignore, .DS_Store), which no page asks for.
//
// A NATIVE Astro work (`work.astro`) keeps the allow-list, top level only: its files become
// source code of this site (src/components/<ns>/werke/<slug>/), compiled into a page of the
// house and checked with it, so only what that build can take travels.
//
// Cloudflare Pages caps a single asset at 25 MiB, enforced in integrate.ts for every file of
// either form, because a file over it fails the deploy rather than the gate.
const ASTRO_EXT =
  /\.(astro|ts|js|mjs|json|css|svg|html|png|jpe?g|webp|avif|gif|woff2?|mp3|ogg|wav|m4a|flac|mp4|webm)$/i

/** Housekeeping no page asks for: a dotfile or anything inside a dot-directory, at any depth. */
export const isHousekeeping = (rel: string): boolean => rel.split('/').some((seg) => seg.startsWith('.'))

/** `fileNames` lists the work directory's files as '/'-separated paths relative to it (the
 *  integrator passes the whole tree); a plain name is a file at the top level. The form of the
 *  work is decided at the top level only. */
export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const top = fileNames.filter((f) => !f.includes('/'))
  if (top.includes('work.astro')) {
    const files = top.filter((f) => ASTRO_EXT.test(f))
    // Anything else is reported, a nested file by its top-level directory, once.
    const ignored = [...new Set(fileNames.filter((f) => !files.includes(f)).map((f) => f.split('/')[0]!))]
    return { slug, kind: 'astro', files, ignored }
  }
  if (top.includes('index.html')) {
    return {
      slug,
      kind: 'html',
      files: fileNames.filter((f) => !isHousekeeping(f)),
      ignored: fileNames.filter(isHousekeeping),
    }
  }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}

export function siteTargets(work: ClassifiedWork, ns = 'atelier'): FileMap[] {
  if (work.kind === 'html') {
    // The top-level meta.json feeds the content collection; every other file is a runtime
    // asset and keeps its place relative to index.html, or relative references run into a 404.
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

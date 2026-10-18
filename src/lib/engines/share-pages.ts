// src/lib/engines/share-pages.ts — which built pages of the practices are finished for sharing
// (2026-10-18).
//
// One list, read from dist/ after the publication rule has pruned it, of every page a visitor can
// arrive at cold: each published work's own page, each cycle presentation, each closing report, the
// Atelier's window front page, the nightly line's faces, n-1's front page, record and declared works,
// and Machine Attention's archive door. ./share-dist.ts gives each of them its preview tags and,
// where needed, its way back. A later step that adds something to the same pages (the reception's
// rating line is the one in view) reads the same list, so two steps never disagree about which pages
// are the practices' works.
//
// What is NOT on the list, on purpose:
//   · anything the publication rule does not publish (./publication.mjs, asked again here, so a
//     prune that failed and left working material in dist/ does not get it finished as a work);
//   · any page the site renders itself — those carry the house's own head (Base.astro);
//   · Arch's works, which stay bare by the practice's own reception model (naming.ts, houses.arch);
//   · a page's build templates and the sub-documents a work loads into itself (renders, shells,
//     frames): only an `index.html` that is a work's or a presentation's own page counts, and below
//     such a page only the pages it links to as pages (`<a href>`), which a visitor opens as
//     documents. A page a work loads into a frame of its own must not grow a second strip.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'
import { n1WorkPages } from '../n1/published.ts'
import { classify } from './publication.mjs'

export type SharePractice = 'atelier' | 'field' | 'studio' | 'plenum' | 'error-as-method' | 'n-1' | 'attention'
export type SharePageKind = 'work' | 'presentation' | 'report' | 'front' | 'record'

export interface SharePage {
  /** dist-relative, posix: `studio/presentations/cycle-007/index.html` */
  file: string
  /** the address it is served at: `/studio/presentations/cycle-007/` */
  href: string
  practice: SharePractice
  kind: SharePageKind
  /** the folder that names it: a work's slug, `cycle-007`, `closing-report`, `window` */
  slug: string
  /** a presentation's cycle, zero-padded: `007` */
  cycle: string | null
  /** the day its folder carries (`2026-10-14-…`), or null where it carries none */
  date: string | null
  /** for a page below a work or a presentation: the dist-relative file of that page */
  parent: string | null
}

/** The address a dist-relative file is served at: a directory for an index, no `.html` otherwise
 *  (Cloudflare Pages redirects both other spellings there). */
export function hrefOf(file: string): string {
  if (file === 'index.html') return '/'
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`
  return `/${file.replace(/\.html$/, '')}`
}

/** A page the site renders itself: Base.astro stamps the skin on its <html>. */
export function isHousePage(html: string): boolean {
  return /<html\b[^>]*\bdata-skin=/i.test(html)
}

const ROOTS: { re: RegExp; practice: (m: RegExpExecArray) => SharePractice; kind: SharePageKind }[] = [
  { re: /^(atelier|field|studio)\/presentations\/(cycle-(\d+))\/index\.html$/, practice: (m) => m[1] as SharePractice, kind: 'presentation' },
  { re: /^(atelier|field|studio)\/(closing-report)\/index\.html$/, practice: (m) => m[1] as SharePractice, kind: 'report' },
  { re: /^(atelier)\/(window)\/index\.html$/, practice: () => 'atelier', kind: 'report' },
  { re: /^(atelier|field|studio|plenum)\/werke-html\/([^/]+)\/index\.html$/, practice: (m) => m[1] as SharePractice, kind: 'work' },
  { re: /^(error-as-method)\/works-html\/([^/]+)\/index\.html$/, practice: () => 'error-as-method', kind: 'work' },
  // a stage-only work of the nightly line, served from its stage folder (the text works there are the
  // site's own pages, and isHousePage leaves them out)
  { re: /^(error-as-method)\/((?!works-html\/)[^/]+)\/index\.html$/, practice: () => 'error-as-method', kind: 'work' },
  { re: /^(n-1)\/(index)\.html$/, practice: () => 'n-1', kind: 'front' },
  { re: /^(n-1)\/(record)\.html$/, practice: () => 'n-1', kind: 'record' },
  { re: /^(n-1)\/works\/([^/]+)\/index\.html$/, practice: () => 'n-1', kind: 'work' },
  { re: /^(attention)\/(index)\.html$/, practice: () => 'attention', kind: 'front' },
]

/** The namespaces whose works and presentations may hold pages of their own below them. */
const SUBPAGE_PRACTICES = new Set<SharePractice>(['atelier', 'field', 'studio', 'plenum'])

/** The candidate files: the places above, walked shallowly. */
function candidates(dist: string): string[] {
  const out: string[] = []
  const list = (rel: string) => {
    const abs = join(dist, rel)
    return existsSync(abs) && statSync(abs).isDirectory() ? readdirSync(abs) : []
  }
  const add = (rel: string) => {
    if (existsSync(join(dist, rel))) out.push(rel)
  }
  for (const ns of ['atelier', 'field', 'studio']) {
    for (const dir of list(`${ns}/presentations`)) add(`${ns}/presentations/${dir}/index.html`)
    add(`${ns}/closing-report/index.html`)
  }
  add('atelier/window/index.html')
  for (const ns of ['atelier', 'field', 'studio', 'plenum']) for (const dir of list(`${ns}/werke-html`)) add(`${ns}/werke-html/${dir}/index.html`)
  for (const dir of list('error-as-method/works-html')) add(`error-as-method/works-html/${dir}/index.html`)
  for (const dir of list('error-as-method')) if (dir !== 'works-html') add(`error-as-method/${dir}/index.html`)
  add('n-1/index.html')
  add('n-1/record.html')
  for (const dir of list('n-1/works')) add(`n-1/works/${dir}/index.html`)
  add('attention/index.html')
  return out
}

/** The pages below `root` that it links to as pages: relative `<a href>`s that resolve to an
 *  `index.html` in a folder beneath the root's own. */
export function linkedSubpages(rootFile: string, html: string): string[] {
  const dir = posix.dirname(rootFile)
  const out = new Set<string>()
  for (const m of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*["']([^"'#?]*)[^"']*["']/gi)) {
    const ref = (m[1] ?? '').trim()
    if (!ref || /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('/')) continue
    let path = posix.normalize(posix.join(dir, ref))
    if (ref.endsWith('/') || !/\.[a-z0-9]+$/i.test(path)) path = `${path.replace(/\/$/, '')}/index.html`
    if (path.startsWith(`${dir}/`) && path !== rootFile && path.endsWith('/index.html')) out.add(path)
  }
  return [...out].sort()
}

export interface SharePagesOptions {
  dist: string
  /** public/, where a mirrored file came from: only mirrored files are the practices' pages */
  publicDir: string
  /** n-1's declared works, as the prune reads them (src/lib/n1/published.ts) */
  readWorks?: (n1Root: string) => ReadonlySet<string>
}

/** Every page of the practices that is finished for sharing, roots first, in path order. */
export function sharePages({ dist, publicDir, readWorks = n1WorkPages }: SharePagesOptions): SharePage[] {
  // n-1's declarations are read from its mirror, as the prune read them from dist/ before it
  // pruned: the files that date and declare a work (FORM.md, WORK.md) are not published, so dist/
  // no longer holds them when this runs.
  let n1Pages: ReadonlySet<string> = new Set()
  try {
    if (existsSync(join(dist, 'n-1')) && existsSync(join(publicDir, 'n-1'))) n1Pages = readWorks(join(publicDir, 'n-1'))
  } catch {
    // an unreadable n-1 shelf: only its filed works, front page and record count
  }
  const isMirrored = (path: string) => existsSync(join(publicDir, path))
  const ctx = { isMirrored, n1Pages }
  /** published, mirrored, and the practice's page rather than one the site renders */
  const eligible = (file: string): string | null => {
    if (!file.endsWith('.html') || !existsSync(join(dist, file)) || !isMirrored(file)) return null
    if (!classify(file, ctx).published) return null
    const html = readFileSync(join(dist, file), 'utf8')
    return isHousePage(html) ? null : html
  }

  const files = new Set(candidates(dist))
  for (const page of n1Pages) if (page.endsWith('.html')) files.add(page)

  const pages: SharePage[] = []
  const seen = new Set<string>()
  const roots: { page: SharePage; html: string }[] = []
  for (const file of [...files].sort()) {
    let rule: (typeof ROOTS)[number] | undefined
    let m: RegExpExecArray | null = null
    for (const r of ROOTS) {
      m = r.re.exec(file)
      if (m) {
        rule = r
        break
      }
    }
    const isN1Work = !rule && n1Pages.has(file)
    if (!rule && !isN1Work) continue
    const html = eligible(file)
    if (html === null) continue
    const practice: SharePractice = rule && m ? rule.practice(m) : 'n-1'
    const kind: SharePageKind = rule ? rule.kind : 'work'
    const slug = rule && m ? (m[2] ?? '') : file.replace(/\/index\.html$/, '').split('/').pop() ?? ''
    const cycle = kind === 'presentation' && m ? (m[3] ?? null)?.padStart(3, '0') ?? null : null
    const date = /^(\d{4}-\d{2}-\d{2})-/.exec(slug)?.[1] ?? null
    const page: SharePage = { file, href: hrefOf(file), practice, kind, slug, cycle, date, parent: null }
    pages.push(page)
    seen.add(file)
    roots.push({ page, html })
  }

  for (const { page: root, html } of roots) {
    if (!SUBPAGE_PRACTICES.has(root.practice)) continue
    for (const file of linkedSubpages(root.file, html)) {
      if (seen.has(file) || eligible(file) === null) continue
      seen.add(file)
      pages.push({ ...root, file, href: hrefOf(file), parent: root.file })
    }
  }
  return pages.sort((a, b) => a.file.localeCompare(b.file))
}

// src/lib/engines/etude-links.ts — the études, told apart and linked home (2026-11-14).
//
// Since 2026-11-10 the practices' convening pieces stand on the site beside their main works: the
// Field's and the Atelier's under `<ns>/artifacts/after-cycle-NNN/<slug>/`, the Studio's under
// `studio/etudes/<slug>/`. Frank asked for two things the same day (wording private): wherever a
// practice lists them, an étude is marked as one, so nobody takes it for a main work; and an
// étude's link to the work it answers opens that work on this site, not in a repository.
//
// The second is done to the built site, so every étude a practice publishes tomorrow is right
// without anyone touching it. An étude page links its work in one of two ways: relatively, into
// its practice's cycle folder (`../../cycle-012/the-quiet-curve/index.html`), which the site stops
// serving once the cycle is presented (the publication rule of 2026-10-17, and its 301 sends the
// reader to GitHub); or straight to the practice's repository (`github.com/<owner>/studio/tree/
// main/etudes/unread`). Either is turned into the page on this site that shows the piece — its
// own page where the site serves it, and the cycle's presentation where the cycle's work now lives
// there. A link that pins a commit cites a version and is left as written; so is a link to a file
// (data, a script, a note), and every link whose piece the site does not show.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, posix } from 'node:path'

/** The practices' repositories, by the namespace their mirror has on this site. */
const REPO_NS: Record<string, string> = {
  ulysses: 'atelier',
  'field-research': 'field',
  studio: 'studio',
}

/** An étude's place on this site, dist- or site-relative, with or without a leading slash. */
const ETUDE_PATH = /^\/?(?:(?:atelier|field)\/artifacts\/(?:after-cycle|convening-after)-\d+|studio\/etudes)\/[^/]+(?:\/|$)/

/** Whether a site address names an étude — a convening piece, not a main work. */
export function isEtudeHref(href: string): boolean {
  return ETUDE_PATH.test(href)
}

/** The extension of a path's last segment, lower-cased, or '' for a folder. */
function extOf(path: string): string {
  const base = path.slice(path.lastIndexOf('/') + 1)
  const dot = base.lastIndexOf('.')
  return dot > 0 ? base.slice(dot).toLowerCase() : ''
}

/**
 * Where a repository address lands in the mirror: `studio/etudes/unread`. Only addresses on the
 * moving `main` branch: a pinned commit is a citation of that version and stays.
 */
export function mirrorPathOfRepoUrl(url: string): string | null {
  const m = /^https:\/\/github\.com\/frankbueltge\/([^/]+)\/(?:tree|blob)\/main\/([^?#]+?)\/?$/.exec(url)
  if (!m) return null
  const ns = REPO_NS[m[1]!]
  if (!ns) return null
  return `${ns}/${m[2]!}`
}

/**
 * The site page that shows the piece at a dist-relative folder, or null where the site shows none.
 * `has` answers whether a dist-relative file exists.
 */
export function sitePageOf(folder: string, has: (file: string) => boolean): string | null {
  const asIs = folder.replace(/\/index\.html$/, '').replace(/\/+$/, '')
  // A practice's repository keeps its works in `works/`; the mirror serves them from `werke-html/`.
  const dir = asIs.replace(/^(atelier|field|studio)\/works(?=\/)/, '$1/werke-html')
  if (has(`${dir}/index.html`)) return `/${dir}/`
  // A presented cycle's work lives on in the cycle's presentation.
  const cycle = /^(atelier|field|studio)\/artifacts\/cycle-(\d+)\/[^/]+$/.exec(dir)
  if (cycle) {
    const presentation = `${cycle[1]}/presentations/cycle-${cycle[2]}`
    if (has(`${presentation}/index.html`)) return `/${presentation}/`
  }
  return null
}

/**
 * One étude page with its links to pieces pointed at this site. `page` is the page's own
 * dist-relative path (`field/artifacts/after-cycle-012/the-two-days/index.html`).
 */
export function rewriteEtudeLinks(html: string, page: string, has: (file: string) => boolean): { html: string; changed: number } {
  let changed = 0
  const here = posix.dirname(page)
  const out = html.replace(/(<a\b[^>]*?\bhref=)(["'])([^"']*)\2/gi, (whole, lead: string, q: string, href: string) => {
    let folder: string | null = null
    if (href.startsWith('https://')) {
      folder = mirrorPathOfRepoUrl(href)
    } else if (!/^[a-z][a-z0-9+.-]*:|^\/\/|^#|^\?/i.test(href) && href !== '') {
      const bare = href.replace(/[?#].*$/, '')
      const resolved = bare.startsWith('/') ? bare.slice(1) : posix.normalize(posix.join(here, bare))
      if (resolved.startsWith('..')) return whole
      // A relative link that still opens on the site is left alone.
      if (has(`${resolved}/index.html`) || (!bare.endsWith('/') && has(resolved))) return whole
      folder = resolved
    }
    // Only a practice's piece is pointed anew; the house's own pages keep the address they carry.
    if (!folder || !/^(?:atelier|field|studio)\//.test(folder)) return whole
    const ext = extOf(folder)
    if (ext && ext !== '.html') return whole
    if (ext === '.html' && !folder.endsWith('/index.html')) return whole
    const target = sitePageOf(folder, has)
    if (!target || target === `/${here}/`) return whole
    changed++
    return `${lead}${q}${target}${q}`
  })
  return { html: out, changed }
}

/** Every étude's HTML pages in the built site, dist-relative. */
export function etudePages(dist: string): string[] {
  const roots: string[] = []
  for (const ns of ['atelier', 'field']) {
    const artifacts = join(dist, ns, 'artifacts')
    if (!existsSync(artifacts)) continue
    for (const d of readdirSync(artifacts)) {
      if (/^(after-cycle|convening-after)-\d+$/.test(d)) roots.push(`${ns}/artifacts/${d}`)
    }
  }
  if (existsSync(join(dist, 'studio', 'etudes'))) roots.push('studio/etudes')
  const out: string[] = []
  const walk = (rel: string) => {
    for (const entry of readdirSync(join(dist, rel), { withFileTypes: true })) {
      const child = `${rel}/${entry.name}`
      if (entry.isDirectory()) walk(child)
      else if (entry.name.endsWith('.html')) out.push(child)
    }
  }
  for (const r of roots) walk(r)
  return out
}

export interface EtudeLinksReport {
  pages: number
  links: number
  failed: string[]
}

/** Points every étude's links to pieces at their pages on this site. Never throws for one page. */
export function etudeLinksDist(dist: string): EtudeLinksReport {
  const report: EtudeLinksReport = { pages: 0, links: 0, failed: [] }
  const has = (file: string) => {
    const p = join(dist, file)
    return existsSync(p) && statSync(p).isFile()
  }
  for (const page of etudePages(dist)) {
    report.pages++
    try {
      const file = join(dist, page)
      const before = readFileSync(file, 'utf8')
      const { html, changed } = rewriteEtudeLinks(before, page, has)
      if (changed > 0) {
        writeFileSync(file, html)
        report.links += changed
      }
    } catch (e) {
      report.failed.push(`${page}: ${(e as Error).message}`)
    }
  }
  return report
}

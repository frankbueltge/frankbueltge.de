// src/lib/engines/search-dist.ts — the practices' published pages, named to search engines, on dist/
// (2026-11-02).
//
// Astro's sitemap lists the routes Astro builds. The practices' pages are not among them: they are
// mirrored into public/ and copied into dist/ as they are, so the works, presentations and closing
// reports the site publishes reached a search engine only through links, while the site's own
// pages stood in the sitemap. Run by scripts/engines/frame-dist.ts after the share step, this
// writes them into a sitemap of their own and adds it to the index Astro wrote.
//
// The list is the share step's (./share-pages.ts): a page finished for sharing is a page a visitor
// can arrive at cold, which is what a sitemap names. A page that public/_headers keeps out of the
// index (`X-Robots-Tag: noindex`) is left out even if the list holds it, because a sitemap that
// submits a noindex page asks for two opposite things (the conflict astro.config.mjs filters out
// of the house's own sitemap).
//
// It never fails the build: without its sitemap the site is served as before.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { SITE } from '@/lib/site'
import { sharePages, type SharePage } from './share-pages'

/** The practices' sitemap, beside Astro's `sitemap-0.xml`. */
export const PRACTICE_SITEMAP = 'sitemap-practices.xml'

/** The path patterns public/_headers keeps out of the index: every rule whose block sets an
 *  `X-Robots-Tag` with `noindex`. Host rules (`https://…`) govern whole hosts, not pages. */
export function noindexRules(headers: string): string[] {
  const out: string[] = []
  let pattern: string | null = null
  for (const line of headers.split('\n')) {
    if (/^\S/.test(line)) pattern = line.startsWith('/') ? line.trim() : null
    else if (pattern && /^\s+X-Robots-Tag:.*\bnoindex\b/i.test(line) && !out.includes(pattern)) out.push(pattern)
  }
  return out
}

/** Whether a `_headers` pattern matches a path, as Pages reads it: a splat matches any run of
 *  characters, slashes included, and may be empty; a `:placeholder` matches one path segment. */
export function matchesRule(pattern: string, path: string): boolean {
  const re = pattern
    .split(/(\*|:[A-Za-z]\w*)/)
    .map((part) => (part === '*' ? '.*' : part.startsWith(':') ? '[^/]+' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('')
  return new RegExp(`^${re}$`).test(path)
}

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A sitemap of the given addresses on the site, each once, in a stable order. */
export function sitemapXml(hrefs: readonly string[], site: string = SITE.url): string {
  const urls = [...new Set(hrefs)].sort().map((href) => `<url><loc>${escapeXml(site + href)}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
}

/** The sitemap index with one more sitemap in it, never twice. */
export function withSitemap(index: string, loc: string): string {
  if (index.includes(`<loc>${loc}</loc>`)) return index
  return index.replace('</sitemapindex>', `<sitemap><loc>${loc}</loc></sitemap></sitemapindex>`)
}

export interface SearchDistReport {
  /** pages the practices' sitemap names */
  listed: number
  /** pages on the share list that a noindex rule keeps out */
  held: string[]
  /** whether the sitemap index names the practices' sitemap */
  registered: boolean
}

export interface SearchDistOptions {
  dist: string
  publicDir: string
  /** stands in for sharePages() in tests */
  pages?: readonly Pick<SharePage, 'href'>[]
}

/** Writes the practices' sitemap into dist/ and registers it in the sitemap index. */
export function searchDist({ dist, publicDir, pages }: SearchDistOptions): SearchDistReport {
  const headersFile = [join(dist, '_headers'), join(publicDir, '_headers')].find((f) => existsSync(f))
  const rules = headersFile ? noindexRules(readFileSync(headersFile, 'utf8')) : []
  const listed: string[] = []
  const held: string[] = []
  for (const { href } of pages ?? sharePages({ dist, publicDir })) {
    if (rules.some((rule) => matchesRule(rule, href))) held.push(href)
    else listed.push(href)
  }
  writeFileSync(join(dist, PRACTICE_SITEMAP), sitemapXml(listed))

  const indexFile = join(dist, 'sitemap-index.xml')
  const loc = `${SITE.url}/${PRACTICE_SITEMAP}`
  let registered = false
  if (existsSync(indexFile)) {
    const before = readFileSync(indexFile, 'utf8')
    const after = withSitemap(before, loc)
    if (after !== before) writeFileSync(indexFile, after)
    registered = after.includes(`<loc>${loc}</loc>`)
  }
  return { listed: new Set(listed).size, held, registered }
}

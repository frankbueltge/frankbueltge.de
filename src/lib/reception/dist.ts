// src/lib/reception/dist.ts — the reception band on the bare works, and the list of ratable works,
// applied to the built site (2026-10-17).
//
// Runs as the last step of `npm run build` (scripts/reception/dist.ts), after the publication rule has
// pruned dist/ (src/lib/engines/publication-prune.mjs) and after the wall texts were framed anew
// (src/lib/engines/frame-dist.ts). Two things happen here, both on the served copy only; the mirrors in
// public/ are never touched:
//
//   1. Every bare page that IS a published work, presentation or archive gets the reception band, just
//      below the work and above the frame's way out: a plain link to the form, which works without
//      JavaScript, and /reception/widget.js, a same-origin script that shows the ratings and opens the
//      form in a same-origin frame. The practices' policy (practice-policy.ts) needs nothing new for
//      it: 'self' scripts, 'self' fetches and https: frames are what it already allows. Arch's works
//      stay bare (ids.ts says why).
//   2. dist/reception/works.json lists every work that now carries a band, here or in a page Astro
//      rendered (src/components/reception/ReceptionBlock.astro marks those). The endpoint refuses every
//      id this list does not carry, so only what the site actually publishes can be rated.
//
// It never fails the build: every practice's integrate runs this build as its gate. A page that cannot
// be read or written is reported and keeps what it had; a list that cannot be written leaves the
// endpoints in declared standby, which is the fail-closed answer.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { n1WorkPages } from '../n1/published'
import { FRAME_MARKER } from '../engines/work-frame'
import { openCycleFolders } from '../engines/publication.mjs'
import { readOpenCycle } from '../engines/publication-prune.mjs'
import { SLUG_RE, formHref, workId, type RatableWork, type ReceptionKind, type ReceptionPractice } from './ids'

export const BAND_CLASS = 'fbde-reception'
export const WIDGET_SRC = '/reception/widget.js'
export const WORKS_FILE = 'reception/works.json'

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const decode = (s: string): string =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')

const KIND_WORD: Record<ReceptionKind, string> = {
  experiment: 'experiment',
  work: 'work',
  presentation: 'presentation',
  report: 'report',
  archive: 'archive',
}

// Explicit on every property, like the frame's own strip (work-frame.ts): the document around it owns
// the bare elements and may style them however it likes. Light in both colour schemes, as the strip is.
const BAND_STYLE = `<style data-reception-band>
.${BAND_CLASS}{all:initial;display:block;box-sizing:border-box;width:100%;margin:48px 0 0;
 padding:16px 22px 18px;background:#f4f4f1;color:#1a1a1a;border-top:1px solid #d8d8d2;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
.${BAND_CLASS} *{box-sizing:border-box;font-family:inherit;}
.${BAND_CLASS} .${BAND_CLASS}__head{display:block;margin:0;font-size:14px;line-height:1.6;color:#1a1a1a;}
.${BAND_CLASS} .${BAND_CLASS}__head b{font-weight:700;text-transform:uppercase;letter-spacing:.09em;
 font-size:11px;margin-right:10px;}
.${BAND_CLASS} .${BAND_CLASS}__note{display:block;margin:12px 0 0;max-width:72ch;font-size:12px;
 line-height:1.5;color:#6b6b64;}
.${BAND_CLASS} a{color:#1a1a1a;text-decoration:underline;text-underline-offset:2px;}
.${BAND_CLASS} a:hover,.${BAND_CLASS} a:focus{color:#000;background:#e6e6e0;}
.${BAND_CLASS}+.${FRAME_MARKER}--foot{margin-top:0;}
@media (max-width:520px){.${BAND_CLASS}{padding:12px 16px 14px;}}
</style>`

/** The band a bare page carries, below its work. */
export function receptionBand(work: Pick<RatableWork, 'id' | 'title' | 'kind'>): string {
  const word = KIND_WORD[work.kind]
  return (
    BAND_STYLE +
    `<section class="${BAND_CLASS}" data-reception-band data-reception-work="${esc(work.id)}" data-reception-title="${esc(work.title)}" data-reception-kind="${work.kind}" aria-label="Reception of this ${word}">` +
    `<p class="${BAND_CLASS}__head"><b>Reception</b>Rate this ${word} from 1 to 5, or leave a note.</p>` +
    `<div data-reception-live></div>` +
    `<p class="${BAND_CLASS}__note">Added by the site, below the ${word}. Every rating and note is public at ` +
    `<a href="/reception">/reception</a>, and the practice that made it reads them every night. ` +
    `<a href="${esc(formHref(work.id))}">The form on a page of its own</a>.</p>` +
    `</section>` +
    `<script data-reception-band src="${WIDGET_SRC}" defer></script>`
  )
}

const BAND_PARTS = [
  /<style data-reception-band>[\s\S]*?<\/style>/g,
  new RegExp(`<section class="${BAND_CLASS}" data-reception-band[\\s\\S]*?</section>`, 'g'),
  /<script data-reception-band [^>]*><\/script>/g,
]

export function stripReception(html: string): string {
  return BAND_PARTS.reduce((s, re) => s.replace(re, ''), html)
}

/** Puts the band below the work: before the frame's foot where the page has one, else before the
 *  body closes. Idempotent: a band already there is replaced. */
export function injectReception(html: string, work: Pick<RatableWork, 'id' | 'title' | 'kind'>): string {
  const page = stripReception(html)
  const band = receptionBand(work)
  const foot = page.indexOf(`<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot"`)
  if (foot >= 0) return page.slice(0, foot) + band + page.slice(foot)
  const close = page.lastIndexOf('</body>')
  return close >= 0 ? page.slice(0, close) + band + page.slice(close) : page + band
}

/** A page's own title, decoded and on one line, or null. */
export function titleOf(html: string): string | null {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  const t = m ? decode(m[1]!).replace(/\s+/g, ' ').trim() : ''
  return t ? t.slice(0, 160) : null
}

const metaTitle = (file: string): string | null => {
  try {
    const t = (JSON.parse(readFileSync(file, 'utf8')) as { title?: unknown }).title
    return typeof t === 'string' && t.trim() ? t.trim().slice(0, 160) : null
  } catch {
    return null
  }
}

const isFile = (p: string): boolean => existsSync(p) && statSync(p).isFile()
const dirs = (p: string): string[] => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [])

export interface BarePage {
  /** dist-relative */
  file: string
  work: RatableWork
}

const hrefOf = (file: string): string => `/${file.replace(/index\.html$/, '')}`

/** Every bare page in the built site that is a ratable work, with what it is. `root` is the
 *  repository, for the metadata the mirrors keep beside the site's public copy. */
export function barePages(dist: string, root: string): BarePage[] {
  const out: BarePage[] = []
  const add = (file: string, practice: ReceptionPractice, slug: string, kind: ReceptionKind, title: string | null) => {
    if (!SLUG_RE.test(slug) || !isFile(join(dist, file))) return
    out.push({ file, work: { id: workId(practice, slug), practice, kind, title: title ?? slug, href: hrefOf(file) } })
  }
  const pageTitle = (file: string) => {
    try {
      return titleOf(readFileSync(join(dist, file), 'utf8'))
    } catch {
      return null
    }
  }

  for (const ns of ['atelier', 'field', 'studio'] as const) {
    for (const slug of dirs(join(dist, ns, 'werke-html'))) {
      const file = `${ns}/werke-html/${slug}/index.html`
      add(file, ns, slug, 'work', metaTitle(join(root, 'src/content', ns, 'works', slug, 'meta.json')) ?? pageTitle(file))
    }
    for (const cycle of dirs(join(dist, ns, 'presentations')).filter((d) => /^cycle-\d{3}$/.test(d))) {
      const file = `${ns}/presentations/${cycle}/index.html`
      add(file, ns, cycle, 'presentation', pageTitle(file) ?? `Cycle ${cycle.slice(6)} presentation`)
    }
    add(`${ns}/closing-report/index.html`, ns, 'closing-report', 'report', pageTitle(`${ns}/closing-report/index.html`))
  }

  // n-1: the pages the practice has declared works (src/lib/n1/published.ts), read from its mirror,
  // where the shelf's sources still stand; named by their own folder.
  let declared: Set<string> = new Set()
  try {
    if (existsSync(join(root, 'public', 'n-1'))) declared = n1WorkPages(join(root, 'public', 'n-1'))
  } catch {
    // an unreadable shelf leaves n-1's works without the band, never the build without its list
  }
  const n1 = [...declared].filter((p) => isFile(join(dist, p))).sort()
  const segments = (p: string) => p.replace(/\/index\.html$/, '').split('/')
  const last = new Map<string, number>()
  for (const p of n1) last.set(segments(p).at(-1)!, (last.get(segments(p).at(-1)!) ?? 0) + 1)
  for (const p of n1) {
    const parts = segments(p)
    const slug = (last.get(parts.at(-1)!) ?? 0) > 1 ? parts.slice(-2).join('-') : parts.at(-1)!
    add(p, 'n-1', slug, 'work', pageTitle(p))
  }

  // The open cycle (Frank's decision of 2026-10-20): while a cycle is in its working phase, the
  // Atelier's and the Field's long work grows under artifacts/cycle-NNN/<slug>/ and is published as
  // work in progress. It is rated under its own folder's name, so its ratings carry on if the piece
  // later stands among the works under the same slug. Once the cycle is presented the folder is no
  // longer published, the band goes with it, and the ratings stay on the record.
  for (const folder of openCycleFolders(readOpenCycle(root))) {
    const ns = folder.split('/')[0] as 'atelier' | 'field' | 'studio'
    for (const slug of dirs(join(dist, folder))) add(`${folder}/${slug}/index.html`, ns, slug, 'work', pageTitle(`${folder}/${slug}/index.html`))
  }

  // Machine Attention's finished investigation: one archive, rated on its front page.
  add('attention/index.html', 'attention', 'the-foreknown', 'archive', pageTitle('attention/index.html'))

  // The nightly line: a work's own face, and a work that is only a stage (no text the site renders).
  // A text work's page is rendered by Astro and carries its block already.
  const nightly = join(root, 'src/data/nightly/works')
  for (const slug of dirs(nightly)) {
    const title = metaTitle(join(nightly, slug, 'meta.json'))
    if (title === null) continue
    add(`error-as-method/works-html/${slug}/index.html`, 'error-as-method', slug, 'work', title)
    if (!existsSync(join(nightly, slug, 'work.md'))) add(`error-as-method/${slug}/index.html`, 'error-as-method', slug, 'work', title)
  }
  return out
}

function* htmlFiles(dir: string, rel = ''): Generator<string> {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) yield* htmlFiles(join(dir, entry.name), childRel)
    else if (entry.isFile() && entry.name.endsWith('.html')) yield childRel
  }
}

// Quote-aware: an attribute value may carry a literal `>` (a title like "A > B"), which `[^>]*` would
// stop at, and the work would silently fall off the list.
const ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`
const ASTRO_BLOCK = new RegExp(`<section\\b${ATTRS}\\bdata-reception-page="astro"${ATTRS}>`)
const attr = (tag: string, name: string): string | null => {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag)
  return m ? decode(m[1]!) : null
}

/** The works on pages Astro rendered, read back from the block each one carries. */
export function astroWorks(dist: string): RatableWork[] {
  const out: RatableWork[] = []
  for (const file of htmlFiles(dist)) {
    let html: string
    try {
      html = readFileSync(join(dist, file), 'utf8')
    } catch {
      continue
    }
    const tag = ASTRO_BLOCK.exec(html)?.[0]
    if (!tag) continue
    const id = attr(tag, 'data-reception-work')
    const title = attr(tag, 'data-reception-title')
    const kind = attr(tag, 'data-reception-kind') as ReceptionKind | null
    const m = id ? /^([a-z0-9-]+):([a-z0-9-]+)$/.exec(id) : null
    if (!m || !title || !kind) continue
    out.push({ id: id!, practice: m[1] as ReceptionPractice, kind, title, href: hrefOf(file) })
  }
  return out
}

export interface ReceptionDistReport {
  banded: number
  astro: number
  works: number
  failed: string[]
}

/** Both steps, on a built dist/. */
export function receptionDist(dist: string, root: string): ReceptionDistReport {
  const report: ReceptionDistReport = { banded: 0, astro: 0, works: 0, failed: [] }
  const listed = new Map<string, RatableWork>()
  const astro = astroWorks(dist)
  report.astro = astro.length
  for (const w of astro) if (!listed.has(w.id)) listed.set(w.id, w)

  for (const page of barePages(dist, root)) {
    const abs = join(dist, page.file)
    try {
      const before = readFileSync(abs, 'utf8')
      const after = injectReception(before, page.work)
      if (after !== before) writeFileSync(abs, after)
      report.banded++
      if (!listed.has(page.work.id)) listed.set(page.work.id, page.work)
    } catch (e) {
      report.failed.push(`${page.file}: ${(e as Error).message}`)
    }
  }

  const works = [...listed.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  report.works = works.length
  const target = join(dist, WORKS_FILE)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify({ schema: 1, works }, null, 2)}\n`)
  return report
}

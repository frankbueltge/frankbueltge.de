// src/lib/engines/share-dist.ts — the practices' published pages, finished for sharing, on dist/
// (2026-10-18).
//
// Run by scripts/engines/frame-dist.ts as part of `npm run build`, after Astro's build and after the
// publication rule has pruned dist/ (./publication-prune.mjs), so it sees exactly what will be
// served. For each page on the list (./share-pages.ts) it writes, in this order:
//
//   1. the preview image: the maker's own still where one stands beside the page (a Studio
//      screenshot, an early Atelier work's preview, the still n-1 names for a work in its own
//      margin.json), else a card on the paper ground (./share-card.ts), under /og/practice/;
//   2. the share block in the page's head (./share.ts): title and description in the page's own
//      words where it has them (its meta description, else the work's wall text on record, else its
//      opening sentences), the image, the canonical address;
//   3. the way back, where the page carries no work frame of the house's.
//
// A later step that adds to the same pages runs after these, on the same list, with a marker of its
// own (the reception's rating line, being built in parallel on 2026-10-18, is meant to sit at the end
// of <body>): each step removes only its own block before writing it again, so the steps compose
// and repeat without doubling.
//
// It never fails the build. Every integrate of every practice runs this build as its gate, so a
// page that cannot be finished is reported and left as it was built, and an image that cannot be
// made leaves the page with its tags and without an image.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { SHARE } from '@/config/share-wording'
import { SITE } from '@/lib/site'
import { loadPresentations } from '@/lib/ecology/v3'
import { dayMonthYear } from '@/lib/ops/since'
import { injectBack, injectShare, openingSentences, ownMeta, pageTitle, type ShareImage } from './share'
import { CARD, renderCard, renderStill } from './share-card'
import { sharePages, type SharePage } from './share-pages'
import { teaserFor } from './teaser'

/** Where the preview images are written, as a site address. */
export const SHARE_IMAGE_DIR = '/og/practice'

/** Beside a page, the files its maker commits as a picture of it. */
const STILL_NAMES = ['shot-1100.png', 'preview.png'] as const

/** The image of a page, at its own address: `/og/practice/studio/werke-html/<slug>.png`. */
export function imageHref(page: SharePage, ext: 'png' | 'jpg'): string {
  const key = page.href.replace(/^\/+|\/+$/g, '') || 'index'
  return `${SHARE_IMAGE_DIR}/${key}.${ext}`
}

/** The maker's own still of a page, dist-relative, or null. */
export function stillFor(page: SharePage, dist: string): string | null {
  if (page.practice === 'n-1') {
    try {
      const margin = JSON.parse(readFileSync(join(dist, 'n-1', 'surface', 'margin.json'), 'utf8')) as { works?: { href?: unknown; still?: unknown }[] }
      const at = page.file.replace(/^n-1\//, '').replace(/index\.html$/, '')
      const bare = (h: string) => h.replace(/^\.?\//, '').replace(/index\.html$/, '').replace(/\/?$/, '/')
      const work = (margin.works ?? []).find((w) => typeof w?.href === 'string' && bare(w.href) === bare(at))
      if (work && typeof work.still === 'string') {
        const still = posix.normalize(posix.join('n-1', work.still))
        if (still.startsWith('n-1/') && existsSync(join(dist, still))) return still
      }
    } catch {
      // no margin, or an unreadable one: the page gets a card
    }
  }
  const dir = posix.dirname(page.file)
  for (const name of STILL_NAMES) {
    const still = `${dir}/${name}`
    if (existsSync(join(dist, still))) return still
  }
  return null
}

/** What a page is, on its card: `presentation · cycle 007 · 12 October 2026`. */
export function cardLine(page: SharePage, presentationDate: (p: SharePage) => string | null): string {
  const K = SHARE.kind
  const kind =
    page.kind === 'presentation' ? K.presentation(page.cycle) : page.kind === 'report' ? K.report : page.kind === 'front' ? K.front : page.kind === 'record' ? K.record : K.work
  const day = page.kind === 'presentation' ? presentationDate(page) : page.date
  return day ? `${kind} · ${dayMonthYear(day)}` : kind
}

/** The description of a page, in the first words of its own that exist. */
export function describe(page: SharePage, html: string, wallText: (ns: string, slug: string) => string | undefined = teaserFor): string {
  const own = ownMeta(html)
  const practice = SHARE.practice[page.practice]
  const kind = page.kind === 'presentation' ? 'presentation' : page.kind === 'report' ? 'closing report' : page.kind === 'work' ? 'work' : 'page'
  const words =
    own.description ??
    own.values.get('og:description') ??
    (page.kind === 'work' && page.parent === null ? wallText(page.practice, page.slug) : undefined) ??
    openingSentences(html) ??
    SHARE.fallback(kind, practice.label)
  return words.replace(/\s+/g, ' ').trim()
}

export interface ShareDistReport {
  /** pages on the list */
  pages: number
  /** of those, the ones whose bytes changed */
  written: number
  stills: number
  cards: number
  /** pages that name their own og:image, which is kept */
  ownImages: number
  /** back strips standing after the run */
  strips: number
  /** pages that could not be finished, or whose image could not be made, each with why */
  failed: string[]
}

export interface ShareDistOptions {
  dist: string
  publicDir: string
  /** the repository root: fonts and the presentations' own dates are read from here */
  root?: string
  /** injectable for tests: the image renderers */
  render?: {
    card: (input: Parameters<typeof renderCard>[0]) => Promise<Uint8Array>
    still: (file: string) => Promise<Uint8Array>
  }
  wallText?: (ns: string, slug: string) => string | undefined
  readWorks?: (n1Root: string) => ReadonlySet<string>
}

/** Finishes every published page of the practices on dist/ for sharing. Never throws for a page. */
export async function shareDist({ dist, publicDir, root = process.cwd(), render, wallText = teaserFor, readWorks }: ShareDistOptions): Promise<ShareDistReport> {
  const report: ShareDistReport = { pages: 0, written: 0, stills: 0, cards: 0, ownImages: 0, strips: 0, failed: [] }
  const renderers = render ?? { card: (input: Parameters<typeof renderCard>[0]) => renderCard(input, root), still: renderStill }
  const pages = sharePages({ dist, publicDir, ...(readWorks ? { readWorks } : {}) })
  report.pages = pages.length

  let dates: Map<string, string> | null = null
  const presentationDate = (page: SharePage) => {
    if (!dates) {
      dates = new Map()
      try {
        for (const p of loadPresentations(root)) if (p.date) dates.set(`${p.practice}/${String(p.cycle).padStart(3, '0')}`, p.date)
      } catch {
        // a presentation without a readable summary stays undated on its card
      }
    }
    return page.cycle ? (dates.get(`${page.practice}/${page.cycle}`) ?? null) : null
  }

  for (const page of pages) {
    const file = join(dist, page.file)
    try {
      const before = readFileSync(file, 'utf8')
      const own = ownMeta(before)
      const practice = SHARE.practice[page.practice]
      const title = (own.values.get('og:title') ?? pageTitle(before) ?? page.slug).replace(/\s+/g, ' ').trim()
      const description = describe(page, before, wallText)

      let image: ShareImage | null = null
      if (own.ogImage) report.ownImages++
      else {
        const still = stillFor(page, dist)
        try {
          if (still) {
            const href = imageHref(page, 'jpg')
            write(join(dist, href), await renderers.still(join(dist, still)))
            image = { url: `${SITE.url}${href}`, width: CARD.width, height: CARD.height, alt: SHARE.card.stillAlt(title, practice.label), type: 'image/jpeg' }
            report.stills++
          }
        } catch (e) {
          report.failed.push(`${page.file}: its still could not be cut (${(e as Error).message}); a card stands in`)
        }
        if (!image) {
          try {
            const href = imageHref(page, 'png')
            write(join(dist, href), await renderers.card({ kicker: practice.kicker, title, line: cardLine(page, presentationDate), practice: page.practice }))
            image = { url: `${SITE.url}${href}`, width: CARD.width, height: CARD.height, alt: SHARE.card.alt(title, practice.label), type: 'image/png' }
            report.cards++
          } catch (e) {
            report.failed.push(`${page.file}: no preview image (${(e as Error).message})`)
          }
        }
      }

      let html = injectShare(before, { url: `${SITE.url}${page.href}`, title, description, siteName: SITE.name, image })
      const back = injectBack(html, { label: practice.label, href: practice.href })
      html = back.html
      if (back.placed) report.strips++
      if (html !== before) {
        writeFileSync(file, html)
        report.written++
      }
    } catch (e) {
      report.failed.push(`${page.file}: left as built (${(e as Error).message})`)
    }
  }
  return report
}

function write(abs: string, bytes: Uint8Array) {
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, bytes)
}

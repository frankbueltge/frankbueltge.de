// src/lib/ops/shelf-pool.ts — every finished piece the entrance's shelf may draw from (2026-10-22).
//
// The edition shows eight cards, drawn at random on every visit from all the finished work the
// site publishes, not only from the hand-chosen picks (Frank's request of 2026-10-22, wording
// private). The picks of src/config/selected-works.ts stay the shelf of record: they are the eight
// a reader without JavaScript sees, the cards /dossier prints with their reasons, and they lead the
// pool with their own sentences. Everything else is listed here from its record, read by the same
// reader as a pick (readPick), so a pool card can say nothing a pick could not:
//
//   · every Studio work the site mirrors (src/content/studio/works/<slug>/ with its page),
//   · every cycle presentation of the three practices, and every Field paper,
//   · every experiment, study and instrument of the lab (src/data/werke.ts), retired ones as
//     their archives, but not the doors of the practices and houses, which are rooms, not pieces,
//   · every work n-1 declares (public/n-1/surface/margin.json),
//   · every experiment of Machine Attention that has a stage on this site.
//
// A pool card's sentence is its maker's own: the reviewed teaser on record, else the page's own
// description, else the first sentence of its first paragraph; where none reads, the card carries
// no sentence rather than one written for it. A piece the publication rule does not serve, or one
// whose record does not read, is left out silently: the pool is a draw, not a promise.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SELECTED_WORKS, type ShelfPick, type ShelfWork } from '@/config/selected-works'
import exportFile from '@/data/attention/export.json'
import { WERKE } from '@/data/werke'
import { loadCycle, loadFieldPapers, loadPresentations } from '@/lib/ecology/v3'
import { pieceHref } from '@/lib/engines/publication-links'
import { firstSentence, teaserFor } from '@/lib/engines/teaser'
import { readPick, type ShelfCard } from './selected-works'
import { shelfKey } from './shelf-stills'

/** The register entries that are doors to a practice or a house, not pieces of their own. */
const ROOMS = new Set(['/atelier', '/field', '/studio', '/attention'])

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

/** A line that only says who made it and when ("The Atelier · cycle 004 …") says nothing of the piece. */
const SAYS_ONLY_WHO = /^(?:the\s+(?:atelier|field|studio)\b|cycle\s+\d)/i

/** A page's own one-line account of itself: its description, else its first paragraph's first sentence. */
export function pageSentence(html: string): string | undefined {
  const meta =
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i.exec(html)?.[1] ??
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i.exec(html)?.[1]
  const described = meta ? decode(meta).replace(/\s+/g, ' ').trim() : ''
  if (described.length >= 40 && !SAYS_ONLY_WHO.test(described)) return described
  const body = html.replace(/<(script|style|nav|header)\b[\s\S]*?<\/\1>/gi, '')
  for (const [, inner] of body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decode(inner.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
    if (text.length < 40) continue
    const first = firstSentence(text)
    if (first && first.length >= 40 && !SAYS_ONLY_WHO.test(first)) return first
  }
  return undefined
}

const pageOf = (root: string, href: string): string | undefined => {
  const file = join(root, 'public', href.replace(/^\/|\/$/g, ''), 'index.html')
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined
}
const fromPage = (root: string, href: string) => {
  const html = pageOf(root, href)
  return html ? pageSentence(html) : undefined
}

/** Every piece the pool lists beside the picks, as a pick without a reason. */
export function poolPicks(root: string = process.cwd()): ShelfPick[] {
  const picks: ShelfPick[] = []
  // the running cycle's pieces are still being built; they show on the practices' pages as in
  // progress, and join the pool once the cycle is presented
  const cycle = loadCycle(root)
  const open = cycle.phase === 'working' ? cycle.cycle : null
  // a card carries one line: a longer account is cut to its first sentence where that sentence stands alone
  const add = (work: ShelfWork, sentence?: string) =>
    picks.push({ work, sentence: (sentence && sentence.length > 160 ? firstSentence(sentence) : undefined) ?? sentence ?? '', reason: '' })

  const studioDir = join(root, 'src/content/studio/works')
  if (existsSync(studioDir)) {
    for (const slug of readdirSync(studioDir).sort()) {
      const metaPath = join(studioDir, slug, 'meta.json')
      if (!existsSync(metaPath)) continue
      const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as { embodies?: string; cycle?: number }
      if (open !== null && meta.cycle === open) continue
      add({ kind: 'studio-work', slug }, teaserFor('studio', slug) ?? fromPage(root, `/studio/werke-html/${slug}/`) ?? firstSentence(meta.embodies))
    }
  }
  for (const p of loadPresentations(root)) {
    if (p.cycle === open) continue
    add({ kind: 'presentation', practice: p.practice, cycle: p.cycle }, p.href.startsWith('/') ? fromPage(root, p.href) : undefined)
  }
  for (const paper of loadFieldPapers(root)) {
    if (paper.cycle === open) continue
    const sections = readFileSync(join(root, paper.file), 'utf8').split(/^#+\s*/m)
    const abstract = sections.find((x) => /^abstract\s*$/im.test(x.split('\n')[0]))?.split('\n').slice(1).join(' ')
    add({ kind: 'field-paper', cycle: paper.cycle }, firstSentence(abstract?.replace(/\s+/g, ' ')))
  }
  for (const werk of WERKE) {
    if (ROOMS.has(werk.href) || werk.status === 'geplant' || werk.tier === 'project') continue
    picks.push({ work: { kind: 'experiment', id: werk.id }, reason: '' })
  }
  const marginFile = join(root, 'public/n-1/surface/margin.json')
  if (existsSync(marginFile)) {
    const margin = JSON.parse(readFileSync(marginFile, 'utf8')) as { works?: { href?: unknown; line?: unknown }[] }
    for (const w of Array.isArray(margin.works) ? margin.works : []) {
      if (typeof w?.href === 'string') add({ kind: 'n-1-work', href: w.href }, typeof w.line === 'string' ? w.line : undefined)
    }
  }
  for (const project of exportFile.projects as { id: string; site_route: string | null }[]) {
    if (project.site_route) add({ kind: 'attention-experiment', id: project.id }, fromPage(root, `${project.site_route}/`))
  }
  return picks
}

/**
 * The pool: the pinned pieces first, then the hand-chosen picks in their order, then every other
 * published piece, each
 * with the pick it was read from (scripts/shelf-stills.ts crops by the pick). A piece appears once,
 * however many records name it: by its key, its address, or its title and maker (a Studio work and
 * the presentation that shows it are one piece).
 */
export function readPoolEntries(
  root: string = process.cwd(),
  picks: readonly ShelfPick[] = SELECTED_WORKS.picks,
): { pick: ShelfPick; card: ShelfCard }[] {
  const shelf = loadPresentations(root)
  const entries: { pick: ShelfPick; card: ShelfCard }[] = []
  const seen = new Set<string>()
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const pinned: ShelfPick[] = SELECTED_WORKS.pinned.map((work) => ({ work, reason: '' }))
  const pinnedKeys = new Set(pinned.map((p) => shelfKey(p.work)))
  for (const pick of [...pinned, ...picks, ...poolPicks(root)]) {
    if (seen.has(`key:${shelfKey(pick.work)}`)) continue
    let card: ShelfCard
    try {
      card = readPick(pick, root, shelf)
    } catch {
      continue
    }
    if (!card.href.startsWith('/') || pieceHref(card.href, root) !== card.href) continue
    // a page title often carries its maker or its cycle after a dash ("NOT YET — Ensemble",
    // "Who is left to write it — cycle 006, the Atelier"); the card names the maker on its own line
    if (!picks.includes(pick)) card = { ...card, title: card.title.split(/\s+[—–]\s+/)[0].trim() || card.title }
    const marks = [`key:${card.key}`, `href:${card.href.replace(/\/$/, '')}`, `title:${norm(card.title)}|${card.maker}`]
    if (marks.some((m) => seen.has(m))) continue
    for (const m of marks) seen.add(m)
    if (pinnedKeys.has(card.key)) card = { ...card, pinned: true }
    entries.push({ pick, card })
  }
  return entries
}

/** The pool's cards, the pinned pieces and the picks first. */
export function readPool(root: string = process.cwd(), picks: readonly ShelfPick[] = SELECTED_WORKS.picks): ShelfCard[] {
  return readPoolEntries(root, picks).map((e) => e.card)
}

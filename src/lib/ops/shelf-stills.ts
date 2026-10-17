// src/lib/ops/shelf-stills.ts — which still a pick on the selected-works shelf shows (2026-10-17).
//
// A card shows its maker's own picture or none (src/config/selected-works.ts, "no picture is made
// up"). Two makers commit one: the Studio a screenshot beside each work (shot-1100.png, the full
// page at 1100 px, often several thousand pixels tall), and n-1 a still per declared work
// (surface/stills/, named in its own margin.json). Loading a full-page screenshot to show a corner
// of it would put megabytes on the entrance, so scripts/shelf-stills.ts cuts each one to the
// shelf's frame once and commits the crop under public/shelf/; this module says which picture is
// whose, and where its crop lives. It reads files only — no Vite, no build — because the script
// runs it under tsx.

import { existsSync, readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import type { ShelfWork } from '@/config/selected-works'

/** where the crops are committed, and the address they are served at */
export const SHELF_STILL_DIR = 'public/shelf'
export const SHELF_STILL_URL = '/shelf'
/** the frame a crop is cut to: the card's own 16 : 10, at twice a card's width on a desk */
export const STILL_FRAME = { width: 720, height: 450 } as const

const pad = (n: number) => String(n).padStart(3, '0')

/** A lowercase, hyphenated form of a title, for a file name. */
export const slugOf = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** A pick's stable key: the name of its crop, and its id on the page. */
export function shelfKey(work: ShelfWork): string {
  switch (work.kind) {
    case 'studio-work':
      return `studio-${work.slug}`
    case 'presentation':
      return `${work.practice}-presentation-cycle-${pad(work.cycle)}`
    case 'field-paper':
      return `field-paper-cycle-${pad(work.cycle)}`
    case 'experiment':
      return `lab-${work.id}`
    case 'n-1-work':
      return `n-1-${slugOf(work.title)}`
    case 'attention-experiment':
      return `attention-${work.id}`
  }
}

/** One entry of n-1's own list of its works (public/n-1/surface/margin.json, `works`). */
export interface N1MarginWork {
  title: string
  /** relative to n-1's front page: `projects/usgs-fixed-depth/` */
  href: string
  /** relative to the same: `surface/stills/what-the-catalogue-decides.png` */
  still?: string
  line?: string
}

/** The work n-1 lists under a title, or null where its margin lists none by that name. */
export function n1MarginWork(title: string, root: string = process.cwd()): N1MarginWork | null {
  const file = join(root, 'public', 'n-1', 'surface', 'margin.json')
  if (!existsSync(file)) return null
  const margin = JSON.parse(readFileSync(file, 'utf8')) as { works?: unknown }
  const works = Array.isArray(margin.works) ? (margin.works as N1MarginWork[]) : []
  return works.find((w) => w && w.title === title && typeof w.href === 'string') ?? null
}

/**
 * The maker's own still for a pick, repository-relative — or null where the maker committed none.
 * Only the two makers above commit stills; a presentation counts when its folder carries the
 * Studio's screenshot.
 */
export function makerStill(work: ShelfWork, root: string = process.cwd()): string | null {
  const present = (path: string) => (existsSync(join(root, path)) ? path : null)
  switch (work.kind) {
    case 'studio-work':
      return present(`public/studio/werke-html/${work.slug}/shot-1100.png`)
    case 'presentation':
      return present(`public/${work.practice}/presentations/cycle-${pad(work.cycle)}/shot-1100.png`)
    case 'n-1-work': {
      const still = n1MarginWork(work.title, root)?.still
      return still ? present(posix.join('public/n-1', still)) : null
    }
    default:
      return null
  }
}

/** The committed crop of a pick's still: its file, and the address the page loads. */
export function shelfCrop(work: ShelfWork): { file: string; src: string } {
  const name = `${shelfKey(work)}.webp`
  return { file: `${SHELF_STILL_DIR}/${name}`, src: `${SHELF_STILL_URL}/${name}` }
}

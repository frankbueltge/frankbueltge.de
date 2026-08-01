// src/lib/plenum/requests.ts — reading the Plenum's team channel.
//
// WHY THIS EXISTS AT ALL, when src/lib/zentrale/requestsMd.ts already reads three of these.
//
// The three practices write one H2 per exchange, each carrying its own `**Status:** open` line.
// The shared reader is built on exactly that convention, and it is right about it — it was proven
// against every status string in all four files.
//
// The Plenum writes a DIFFERENT document, because a different collective wrote it. Its channel
// has CONTAINER headings — `## Open requests`, `## Answered / resolved`, `## Seeds from Frank` —
// and the individual asks are dated bullets INSIDE them. Only its later Team notes adopted the
// per-section status line. Run through the shared reader, that document reports "0 open" and
// files the container "Open requests" under *Recently answered* — measured, on the committed
// file, on 2026-08-02. Three real asks, standing since 2026-07-20, rendered as though the channel
// were clear. On a page whose entire purpose is that an ask can never be hidden, that is not a
// cosmetic mismatch; it is the page telling the reader the opposite of the truth.
//
// So the shape is read here, and the SHARED PRIMITIVES do the work: parseSections splits the
// containers, excerpt/countWords/trimWords build the leads, slugifyHeading matches Astro's own
// heading ids. Nothing in requestsMd.ts is changed — that module runs inside the build which
// gates three practices' nightly publishing, and a convention this document happens to use is no
// reason to put their channels at risk.
//
// DEEP LINKS ARE SECTION-DEEP, HONESTLY. A bullet has no heading, so it has no id in the rendered
// archive; a card therefore links to its CONTAINER's heading id and the page says "read it in
// full" rather than pretending to land on the item itself. Inventing anchors for bullets would
// mean rewriting the collective's document, and this site does not edit what it mirrors.

import {
  countWords,
  excerpt,
  isOpenStatus,
  isSeedsSection,
  parseSections,
  slugifyHeading,
  type RenderedHeading,
  type RequestCard,
} from '@/lib/zentrale/requestsMd'
import { stripMd } from '@/lib/maschinenraum'

/** A container heading holding open asks as bullets. */
const OPEN_CONTAINER = /^open\b/i
/** A container heading holding settled asks as bullets. */
const CLOSED_CONTAINER = /^(answered|resolved|closed)\b/i

/** One dated bullet inside a container — a single ask, as this collective writes them. */
export interface ChannelItem {
  /** the ISO date the bullet leads with (`2026-07-20-b` keeps its suffix in `label`) */
  date: string | null
  /** the record's own date label, verbatim — including the `-b` of a second sitting that day */
  dateLabel: string | null
  /** the bolded lead of the bullet; its first sentence where it carries no bold lead */
  title: string
  /** the lead of the bullet, flattened to the caller's word budget */
  lead: string
  words: number
  /** the container this bullet stands under, verbatim */
  section: string
  /** fragment on /plenum/requests/archive — the container's own heading id */
  slug: string
  open: boolean
}

/** Everything the Plenum's channel room needs, in the order it renders it. */
export interface PlenumChannel {
  /** every open ask, newest first — never a selection */
  open: ChannelItem[]
  /** settled asks, newest first */
  closed: ChannelItem[]
  /** sections that carry a status of their own — the Team notes, read the shared way */
  notes: RequestCard[]
  /** the seed containers, listed rather than unpacked: an offer is not an ask */
  seeds: RequestCard[]
  /** every H2 of the document, for the honest "n exchanges on the record" count */
  sections: number
}

const DATE_LEAD = /^(\d{4}-\d{2}-\d{2}(?:-[a-z])?)\s*[—–-]\s*/
const BOLD_LEAD = /^\*\*([\s\S]*?)\*\*/

/**
 * The top-level bullets of a container body. A bullet starts at column 0 with `- `; every
 * continuation line is indented, which is how this document is written throughout, and nested
 * bullets therefore stay part of the item they belong to instead of becoming asks of their own.
 */
export function splitBullets(body: string): string[] {
  return body
    .split(/\n(?=- )/)
    .map((b) => b.trim())
    .filter((b) => b.startsWith('- '))
}

/** One bullet, dedented: the `- ` marker off the first line and the hanging indent off the rest,
 *  so the shared excerpt/word-count primitives see the same prose a reader sees. */
export function dedentBullet(bullet: string): string {
  return bullet
    .replace(/^- /, '')
    .split('\n')
    .map((l) => l.replace(/^ {1,4}/, ''))
    .join('\n')
    .trim()
}

/**
 * One bullet as a card. `title` is the collective's OWN bolded lead where it wrote one — these
 * asks are written title-first ("**Recovery notice: 7 stranded Appetizers land at once …**") —
 * and its first sentence where it did not. Nothing is composed here.
 */
export function readItem(
  bullet: string,
  section: string,
  slug: string,
  open: boolean,
  leadWords: number,
): ChannelItem {
  const text = dedentBullet(bullet)
  const dated = DATE_LEAD.exec(text)
  const rest = dated ? text.slice(dated[0].length) : text
  const bold = BOLD_LEAD.exec(rest)
  const title = bold
    ? stripMd(bold[1].replace(/\s+/g, ' ')).replace(/[.:]$/, '')
    : stripMd(rest.split(/\.\s/)[0].replace(/\s+/g, ' '))
  // The lead starts AFTER the title, where the bullet has one — the card already prints the
  // bolded lead as its heading, and reading the same sentence twice tells a visitor nothing.
  const afterTitle = bold ? rest.slice(bold[0].length) : rest
  return {
    date: dated ? dated[1].slice(0, 10) : null,
    dateLabel: dated ? dated[1] : null,
    title,
    lead: excerpt(afterTitle, leadWords),
    words: countWords(text),
    section,
    slug,
    open,
  }
}

/** Matches one H2 against Astro's rendered headings by flattened text, so the fragment a card
 *  links to is the id the archive page actually renders. Falls back to slugifyHeading; a wrong
 *  fragment then lands at the top of the archive, never on a 404. */
function slugFor(heading: string, headings: readonly RenderedHeading[] | undefined): string {
  const own = slugifyHeading(heading)
  if (!headings?.length) return own
  const wanted = stripMd(heading).toLowerCase()
  return headings.find((h) => h.depth === 2 && stripMd(h.text).toLowerCase() === wanted)?.slug ?? own
}

export interface ChannelOptions {
  /** words of body lead per open item (default 40) */
  leadWords?: number
  /** Astro's rendered heading list — the authoritative archive slugs */
  headings?: readonly RenderedHeading[]
}

/**
 * The Plenum's channel, read on its own terms.
 *
 * A section is one of four things, decided by its own heading and nothing else:
 *   · an OPEN container   — its bullets are the open asks, newest first as the file writes them;
 *   · a CLOSED container  — its bullets are settled asks;
 *   · a SEEDS container   — listed, never unpacked (an offer to the collective is not an ask of
 *                           the human, and the shared reader already refuses to count one);
 *   · anything else       — a section with a status of its own (the Team notes), read exactly the
 *                           way the practices' channels are read, including `isOpenStatus`.
 */
export function readPlenumChannel(md: string, opts: ChannelOptions = {}): PlenumChannel {
  const leadWords = opts.leadWords ?? 40
  const sections = parseSections(md)
  const open: ChannelItem[] = []
  const closed: ChannelItem[] = []
  const notes: RequestCard[] = []
  const seeds: RequestCard[] = []

  for (const s of sections) {
    const slug = slugFor(s.heading, opts.headings)
    if (isSeedsSection(s.heading)) {
      seeds.push(card(s.heading, s.body, slug, leadWords, false, true))
      continue
    }
    const isOpen = OPEN_CONTAINER.test(s.heading)
    if (isOpen || CLOSED_CONTAINER.test(s.heading)) {
      const items = splitBullets(s.body).map((b) => readItem(b, s.heading, slug, isOpen, leadWords))
      ;(isOpen ? open : closed).push(...items)
      continue
    }
    notes.push(card(s.heading, s.body, slug, leadWords, isOpenStatus(s.status), false, s.status))
  }

  return { open, closed, notes, seeds, sections: sections.length }
}

function card(
  heading: string,
  body: string,
  slug: string,
  leadWords: number,
  open: boolean,
  seeds: boolean,
  status: string | null = null,
): RequestCard {
  return {
    heading,
    title: heading,
    date: /(\d{4}-\d{2}-\d{2})/.exec(heading)?.[1] ?? null,
    status,
    open,
    seeds,
    request: !seeds,
    slug,
    excerpt: excerpt(body, leadWords),
    words: countWords(body),
  }
}

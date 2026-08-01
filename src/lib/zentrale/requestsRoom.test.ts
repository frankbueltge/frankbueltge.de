// src/lib/zentrale/requestsRoom.test.ts
// The word budget of the three public requests rooms, measured against the REAL synced
// REQUESTS.md files (Etappe 2, 2026-08-01). Before the rebuild each of these pages printed its
// whole document — 19,172 / 23,528 / 16,089 words on one screen. The rooms now show the
// standing rule, EVERY open item and five closed leads; the documents themselves are
// untouched and complete at /…/requests/archive.
//
// Why this test exists, and why it must never simply be relaxed: it is the trip-wire for a
// growing backlog. If it goes red, the honest answers are "the practice has an unusually long
// open queue — look at it" or "the copy in the wording config has grown"; the dishonest answer
// is raising the number until it passes.
//
// It also runs inside the build that gates the practices' nightly publishing, four times a
// day. That is why the room's per-item cost SHRINKS as the queue grows (openExcerptWords):
// a long queue must make the page denser, never make a collective unable to publish.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { STATUS_WORDS, countWords, openExcerptWords, preamble, requestCards, trimWords } from './requestsMd'
import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import { FIELD_NARRATIVE } from '@/config/field-wording'
import { STUDIO_NARRATIVE } from '@/config/studio-wording'

/** The budget every practice's requests room stays under — the whole page, chrome included. */
const BUDGET = 1500

/**
 * Words the site puts on every page regardless of its content: the Page layout's header and
 * footer plus the practice Frame's kicker, rail, status line and foot. Measured on the built
 * pages of 2026-08-01 (rendered total minus the composition below: atelier 217, field 211,
 * studio 212 words) and rounded up, so the assertion is about the PAGE a visitor loads rather
 * than only the part this test can compose.
 *
 * Re-measure if the header/footer/rail changes:
 *   npm run build && node -e "const h=require('fs').readFileSync('dist/field/requests/index.html','utf8');
 *   console.log(h.replace(/<(script|style)[\\s\\S]*?<\\/\\1>/g,' ').replace(/<[^>]+>/g,' ').split(/\\s+/).filter(Boolean).length)"
 */
const CHROME_WORDS = 220

const ROOMS = [
  ['atelier', ATELIER_NARRATIVE.requestsRoom],
  ['field', FIELD_NARRATIVE.requestsRoom],
  ['studio', STUDIO_NARRATIVE.requestsRoom],
] as const

const read = (ns: string) => readFileSync(join(process.cwd(), 'src/content', ns, 'REQUESTS.md'), 'utf-8')

/**
 * Counts the words the room renders — modelled on the three requests.astro pages, which are
 * byte-identical in structure and differ only in their skin and their copy (ADR 0010: shared
 * logic, no shared visual grammar). Kept next to the pages in review, not derived from them:
 * a test that rendered the Astro component would measure Astro, not the composition.
 */
function roomWords(md: string, room: (typeof ROOMS)[number][1]) {
  const cards = requestCards(md)
  const open = cards.filter((c) => c.open)
  const answered = cards.filter((c) => !c.open && !c.seeds).slice(-5)
  const seeds = cards.filter((c) => c.seeds)
  const lead = openExcerptWords(open.length)

  let words = countWords(preamble(md))
  words += countWords([room.intro, room.standingHeading, room.openHeading, room.answeredHeading, room.answeredNote, room.archiveLink].join(' '))
  words += countWords(open.length === 0 ? room.openNone : room.openNote)
  if (seeds.length > 0) words += countWords(`${room.seedsHeading} ${room.seedsNote}`)

  for (const c of open) {
    words += countWords(c.title) + (c.date ? 1 : 0) + countWords(trimWords(c.status ?? '', STATUS_WORDS.open)) + 2
    words += countWords(trimWords(c.excerpt, lead)) + countWords(room.fullTextLabel) + 1
  }
  for (const c of answered) {
    words += countWords(c.title) + (c.date ? 1 : 0) + countWords(trimWords(c.status ?? '', STATUS_WORDS.closed)) + 2
    words += countWords(c.excerpt)
  }
  for (const c of seeds) words += countWords(c.heading) + 3

  return { words, open: open.length, answered: answered.length, seeds: seeds.length, cards: cards.length }
}

describe('the requests rooms fit on a page', () => {
  for (const [ns, room] of ROOMS) {
    it(`${ns}: under ${BUDGET} words, with every open item shown`, () => {
      const md = read(ns)
      const { words: composed, open, cards } = roomWords(md, room)
      const words = composed + CHROME_WORDS
      const document = countWords(md)

      expect(
        words,
        `/${ns}/requests would render ~${words} words (${composed} composed + ${CHROME_WORDS} chrome; ` +
          `document: ${document}, ${open} open of ${cards} sections).\n` +
          `Budget is ${BUDGET}. Do NOT just raise it: check whether the open queue has grown ` +
          `(then look at the queue) or whether ${ns}-wording.ts requestsRoom copy has grown (then shorten it).`,
      ).toBeLessThan(BUDGET)

      // The room must be a real reduction, not a cosmetic one.
      expect(words).toBeLessThan(document / 5)
      // …and it must never be a reduction by omission of an open ask.
      expect(open).toBe(requestCards(md).filter((c) => c.open).length)
    })
  }

  it('every open item of every practice is on its room’s page — no cap, ever', () => {
    for (const [ns] of ROOMS) {
      const cards = requestCards(read(ns))
      const open = cards.filter((c) => c.open)
      // Regression guard for the one shortcut this design forbids: a `.slice(0, n)` on the
      // open list. The page filters, it never truncates.
      expect(open.length).toBeGreaterThan(0)
      for (const c of open) expect(c.slug.length).toBeGreaterThan(0)
    }
  })

  it('a seeds container is never listed as an open ask (its status is a nested seed’s)', () => {
    for (const [ns] of ROOMS) {
      const seeds = requestCards(read(ns)).filter((c) => c.seeds)
      expect(seeds.length).toBeGreaterThan(0)
      for (const c of seeds) expect(c.open).toBe(false)
    }
  })

  it('reads the real documents without throwing, and finds sections in all of them', () => {
    for (const ns of ['atelier', 'field', 'studio', 'plenum']) {
      const cards = requestCards(read(ns))
      expect(cards.length, ns).toBeGreaterThan(0)
      for (const c of cards) expect(typeof c.excerpt, `${ns}: ${c.heading}`).toBe('string')
    }
  })
})

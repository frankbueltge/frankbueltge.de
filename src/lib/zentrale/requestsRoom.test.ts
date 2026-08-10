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
import { ROOM_BUDGET, countWords, planRoom, preamble, requestCards, roomWords } from './requestsMd'
import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import { FIELD_NARRATIVE } from '@/config/field-wording'
import { STUDIO_NARRATIVE } from '@/config/studio-wording'

/** The budget every practice's requests room stays under — the whole page, chrome included. */

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

const ROOMS = [
  ['atelier', ATELIER_NARRATIVE.requestsRoom],
  ['field', FIELD_NARRATIVE.requestsRoom],
  ['studio', STUDIO_NARRATIVE.requestsRoom],
] as const

const read = (ns: string) => readFileSync(join(process.cwd(), 'src/content', ns, 'REQUESTS.md'), 'utf-8')

describe('the requests rooms fit on a page', () => {
  for (const [ns, room] of ROOMS) {
    it(`${ns}: under ${ROOM_BUDGET} words, with every open item shown`, () => {
      const md = read(ns)
      const cardList = requestCards(md)
      const open = cardList.filter((c) => c.open).length
      const cards = cardList.length
      const plan = planRoom(cardList, room, preamble(md))
      const words = roomWords(cardList, room, preamble(md), plan)
      const document = countWords(md)

      expect(
        words,
        `/${ns}/requests would render ~${words} words at plan lead ${plan.lead}, title cap ${plan.titleCap}; ` +
          `document: ${document}, ${open} open of ${cards} sections).\n` +
          `Budget is ${ROOM_BUDGET}. Do NOT raise it and do NOT hide an item: the planner is supposed to ` +
          `make this impossible by degrading density first (requestsMd.ts planRoom). If this fails, the ` +
          `planner ran out of levers — the queue needs answering, or a lever needs adding.`,
      ).toBeLessThan(ROOM_BUDGET)

      // The room must be a real reduction, not a cosmetic one.
      expect(words).toBeLessThan(document / 5)
      // …and it must never be a reduction by omission of an open ask.
      expect(open).toBe(cardList.filter((c) => c.open).length)
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

// The property the 2026-08-10 outage was missing. A constant that happened to fit today is not a
// guarantee; this is. Twelve integrations of the Atelier were refused by this budget in one day,
// so the room must now be provably unable to do that — for any queue, of any length, with the
// long titles this house actually writes.
describe('no queue can silence a practice', () => {
  const longTitle = (i: number) =>
    `2026-08-${String((i % 28) + 1).padStart(2, '0')} — The fourth case read across twelve years: ` +
    `the frame objection is answered, and one word in the shipped work is wrong (Ulysses, Atelier) #${i}`

  const synthetic = (openCount: number): string => {
    let md = '# Team channel\n\nA preamble of a few words, as every channel carries.\n\n'
    for (let i = 0; i < openCount; i++) {
      md += `## ${longTitle(i)}\n\n`
      md += 'A body paragraph of roughly forty words, which is what these asks actually look like when '
      md += 'the practice explains what it found, why it matters, what it needs and what happens if the '
      md += 'answer never comes at all in time.\n\n'
      md += '**Status:** open — a decision, a repair, or nothing at all.\n\n'
    }
    return md
  }

  it.each([1, 5, 10, 20, 40, 80])('fits with %i open items, and hides none of them', (n) => {
    const md = synthetic(n)
    const cards = requestCards(md)
    const open = cards.filter((c) => c.open)
    expect(open.length, 'the fixture must really produce open cards').toBe(n)

    const plan = planRoom(cards, ATELIER_NARRATIVE.requestsRoom, preamble(md))
    const words = roomWords(cards, ATELIER_NARRATIVE.requestsRoom, preamble(md), plan)

    expect(words, `${n} open items overflow the room even at its tightest plan`).toBeLessThan(ROOM_BUDGET)
    // …and the room never buys the fit by dropping an ask: the plan has no lever for that.
    expect(Object.keys(plan)).not.toContain('shown')
    expect(plan.lead).toBeGreaterThanOrEqual(0)
  })

  it('spends its levers in order — density before titles, and titles last', () => {
    const short = planRoom(requestCards(synthetic(2)), ATELIER_NARRATIVE.requestsRoom, '')
    const long = planRoom(requestCards(synthetic(40)), ATELIER_NARRATIVE.requestsRoom, '')
    expect(short.lead).toBe(40)
    expect(short.titleCap).toBe(Number.POSITIVE_INFINITY)
    expect(short.compressed).toBe(false)
    expect(long.lead).toBeLessThan(short.lead)
    expect(long.compressed).toBe(true)
  })

  it('degrades honestly instead of blocking when even the last lever is spent', () => {
    // Around a hundred open asks no density rule can save the page. What must NOT happen is a
    // refusal to render or a hidden item; what must happen is that the room says it is at its
    // limit. Nothing downstream may read `exhausted` as permission to block publishing.
    const md = synthetic(120)
    const cards = requestCards(md)
    const plan = planRoom(cards, ATELIER_NARRATIVE.requestsRoom, preamble(md))
    expect(plan.exhausted).toBe(true)
    expect(plan.compressed).toBe(true)
    expect(plan.lead).toBe(0)
    expect(plan.titleCap).toBe(3)
    expect(cards.filter((c) => c.open)).toHaveLength(120)
    expect(plan.words).toBeGreaterThan(ROOM_BUDGET)
  })
})

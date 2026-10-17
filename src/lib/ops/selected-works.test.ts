// The selected-works shelf (2026-10-17): the promises src/config/selected-works.ts makes, held.
//
// The shelf is chosen by hand and will be changed by hand, so these tests are written for the day
// a pick is swapped: each one names the pick that broke and what to do about it. They read the
// committed records and the committed crops, never the network.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SELECTED_WORKS, type ShelfPick } from '@/config/selected-works'
import { WERKE } from '@/data/werke'
import { loadFieldPapers } from '@/lib/ecology/v3'
import { pieceHref } from '@/lib/engines/publication-links'
import { readPick, readShelf } from './selected-works'
import { makerStill, SHELF_STILL_DIR, shelfCrop, shelfKey } from './shelf-stills'
import { dayMonthYear } from './since'

const picks: readonly ShelfPick[] = SELECTED_WORKS.picks
const cards = readShelf()
const byKey = new Map(cards.map((c) => [c.key, c]))
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

/** A page the build makes: a mirrored page, a route of this site, or a Field paper's page. */
function pageExists(href: string): boolean {
  const path = href.replace(/^\/|\/$/g, '')
  return (
    existsSync(join('public', path, 'index.html')) ||
    existsSync(join('src/pages', `${path}.astro`)) ||
    existsSync(join('src/pages', path, 'index.astro')) ||
    loadFieldPapers().some((p) => p.href === href)
  )
}

describe('the selected works', () => {
  it('stand five to eight on the shelf, each piece once', () => {
    expect(picks.length).toBeGreaterThanOrEqual(5)
    expect(picks.length).toBeLessThanOrEqual(8)
    const keys = picks.map((p) => shelfKey(p.work))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it.each(cards.map((c) => [c.key, c] as const))('%s reads title, maker, date and sentence from its record', (_key, card) => {
    expect(card.title.trim()).not.toBe('')
    expect(card.maker.trim()).not.toBe('')
    expect(card.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(card.when).toContain(dayMonthYear(card.day))
    expect(card.sentence.length).toBeGreaterThan(30)
  })

  it.each(cards.map((c) => [c.key, c] as const))('%s is a page this site publishes, not a redirect', (_key, card) => {
    // pieceHref is the publication rule's answer for a link (src/lib/engines/publication.mjs): an
    // address it would send elsewhere is a piece the site no longer serves. Swap the pick.
    expect(card.href.startsWith('/'), `${card.key} links away from the site: ${card.href}`).toBe(true)
    expect(pieceHref(card.href), `${card.key} is not published under the rule of 2026-10-17`).toBe(card.href)
    expect(pageExists(card.href), `${card.key}: no page is built at ${card.href}`).toBe(true)
  })
})

describe('what the shelf types', () => {
  // The edition's law (src/config/edition-wording.test.ts): a number written into wording goes
  // stale the night the record moves. Dates and counts come from the records; words carry none.
  const typed: [string, string][] = [
    ['title', SELECTED_WORKS.title],
    ['sub', SELECTED_WORKS.sub],
    ['reasonLabel', SELECTED_WORKS.reasonLabel],
    ...Object.entries(SELECTED_WORKS.kinds).map(([k, v]) => [`kinds.${k}`, v] as [string, string]),
    ...picks.flatMap((p) => {
      const key = shelfKey(p.work)
      return [[`${key}.reason`, p.reason], ...(p.sentence ? [[`${key}.sentence`, p.sentence]] : [])] as [string, string][]
    }),
  ]

  it.each(typed)('%s carries no digit', (_path, text) => {
    expect(text).not.toMatch(/\d/)
  })

  it('keeps every reason to one line', () => {
    for (const p of picks) {
      expect(p.reason, shelfKey(p.work)).not.toMatch(/\n/)
      expect(p.reason.length, shelfKey(p.work)).toBeLessThanOrEqual(180)
    }
  })

  it('wraps every date it shows in words that take the date as an argument', () => {
    expect(SELECTED_WORKS.when.made('9 October 2026')).toBe('9 October 2026')
    expect(SELECTED_WORKS.when.span('8 August', '4 October 2026')).toBe('8 August – 4 October 2026, retired')
    // an archive on the shelf names its span once per year it spans
    for (const card of cards.filter((c) => c.kind === SELECTED_WORKS.kinds.archive)) {
      expect(card.when).toMatch(/^\d{1,2} [A-Z][a-z]+( \d{4})? – \d{1,2} [A-Z][a-z]+ \d{4}, retired$/)
    }
    expect(SELECTED_WORKS.when.daily('14 August 2026')).toContain('14 August 2026')
  })

  it('lets a lab experiment speak with its register line, so it cannot say two things in two places', () => {
    for (const p of picks) {
      if (p.work.kind !== 'experiment' || p.sentence) continue
      const werk = WERKE.find((w) => w.id === (p.work as { id: string }).id)!
      expect(byKey.get(shelfKey(p.work))?.sentence).toBe(werk.subtitle.en)
    }
  })
})

describe('the stills', () => {
  it.each(picks.map((p) => [shelfKey(p.work), p] as const))('%s shows its maker’s own still, cut to the frame, or none', (key, pick) => {
    const source = makerStill(pick.work)
    const card = byKey.get(key)!
    if (!source) {
      expect(card.still, `${key} shows a picture its maker never committed`).toBeNull()
      return
    }
    const crop = shelfCrop(pick.work)
    expect(existsSync(crop.file), `${crop.file} is missing — run npm run shelf:stills`).toBe(true)
    expect(card.still?.src).toBe(crop.src)
    expect(card.still?.source).toBe(source)
  })

  it('keeps no crop that no pick uses', () => {
    const wanted = new Set(picks.filter((p) => makerStill(p.work)).map((p) => shelfCrop(p.work).file))
    const present = existsSync(SHELF_STILL_DIR) ? readdirSync(SHELF_STILL_DIR).map((f) => `${SHELF_STILL_DIR}/${f}`) : []
    expect(present.filter((f) => !wanted.has(f)), 'a stray crop — run npm run shelf:stills').toEqual([])
  })
})

describe('a pick its record cannot answer', () => {
  it('fails loud, naming the pick, rather than leaving a gap on the shelf', () => {
    expect(() => readPick({ work: { kind: 'studio-work', slug: '2026-01-01-no-such-work' }, sentence: 'A work that is not there.', reason: 'none' })).toThrow(
      /no-such-work.*cannot be read/,
    )
    expect(() => readPick({ work: { kind: 'experiment', id: 'no-such-experiment' }, reason: 'none' })).toThrow(/no entry "no-such-experiment"/)
    expect(() => readPick({ work: { kind: 'n-1-work', title: 'No Such Work' }, sentence: 'A work that is not there.', reason: 'none' })).toThrow(/lists no work/)
    expect(() => readPick({ work: { kind: 'presentation', practice: 'atelier', cycle: 999 }, sentence: 'A cycle that never ran.', reason: 'none' })).toThrow(
      /no presentation of cycle 999/,
    )
  })

  it('asks a sentence of every pick that is not a lab experiment', () => {
    expect(() => readPick({ work: { kind: 'attention-experiment', id: 'foreknown' }, reason: 'none' })).toThrow(/says no sentence/)
  })
})

describe('the two pages that show the shelf', () => {
  it('mount the one component, fed by the one reader', () => {
    for (const [name, rel] of [
      ['the edition', '../../components/pages/HomeEdition.astro'],
      ['the dossier', '../../pages/dossier.astro'],
    ] as const) {
      const src = read(rel)
      expect(src, name).toContain('readShelf')
      expect(src, name).toContain('<SelectedWorks')
    }
  })
})

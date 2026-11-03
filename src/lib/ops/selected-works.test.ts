// The selected-works shelf (2026-10-17): the promises src/config/selected-works.ts makes, held.
//
// The shelf is chosen by hand and will be changed by hand, so these tests are written for the day
// a pick is swapped: each one names the pick that broke and what to do about it. They read the
// committed records and the committed crops, never the network.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { NAMING } from '@/config/naming'
import { SELECTED_WORKS, type ShelfPick } from '@/config/selected-works'
import exportFile from '@/data/attention/export.json'
import { WERKE } from '@/data/werke'
import { loadCycle, loadFieldPapers } from '@/lib/ecology/v3'
import { pieceHref } from '@/lib/engines/publication-links'
import { readLabCarousel } from './lab-carousel'
import { claimedByAttention, readPick, readShelfReport, retirementDay } from './selected-works'
import { pageSentence, readPoolEntries, withoutLab } from './shelf-pool'
import { makerStill, pageShotSource, SHELF_STILL_DIR, shelfCrop, shelfKey } from './shelf-stills'
import { dayMonthYear } from './since'

const picks: readonly ShelfPick[] = SELECTED_WORKS.picks
const { cards, missing } = readShelfReport()
const byKey = new Map(cards.map((c) => [c.key, c]))
const poolEntries = readPoolEntries()

// WHERE THE SHELF IS HELD STRICTLY. Locally and in the pull request's CI, every pick must read: that
// is where a person changes the shelf, and a typo should be loud. The integrate and deploy runs
// execute this suite too, and there a pick that stopped reading was broken by a practice's own
// mirror, not by the shelf's editor; the page already leaves the pick out and logs it, so those
// runs ask only that the shelf still stands, and never turn a practice's delivery red over it.
const STRICT = !process.env.GITHUB_WORKFLOW || process.env.GITHUB_WORKFLOW === 'CI'
const SHELF_FLOOR = 5
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
    expect(picks.length).toBeGreaterThanOrEqual(SHELF_FLOOR)
    expect(picks.length).toBeLessThanOrEqual(8)
    const keys = picks.map((p) => shelfKey(p.work))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it(STRICT ? 'all read from their records' : 'still stand, whatever a mirror did tonight', () => {
    if (STRICT) expect(missing, missing.map((m) => m.why).join('\n')).toEqual([])
    else expect(cards.length).toBeGreaterThanOrEqual(SHELF_FLOOR)
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
  it.each(picks.map((p) => [shelfKey(p.work), p] as const))('%s shows its maker’s own still, cut to the frame, or a shot of its own page', (key, pick) => {
    const source = makerStill(pick.work)
    const card = byKey.get(key)
    if (!card) return // left off tonight; the strict run above names it
    if (!source) {
      // no still of its maker's: the picture, where there is one, is its own page (shelf:shots)
      if (card.still) expect(card.still.source).toBe(pageShotSource(card.href))
      return
    }
    const crop = shelfCrop(pick.work)
    expect(existsSync(crop.file), `${crop.file} is missing — run npm run shelf:stills`).toBe(true)
    expect(card.still?.src).toBe(crop.src)
    expect(card.still?.source).toBe(source)
  })

  it('keeps no crop that no piece of the pool uses', () => {
    // a crop named after a pick is never stray, even on a night its source left the mirror; a pool
    // piece's crop goes stray when a mirror drops the piece, which only a person tidies, so the
    // nightly runs do not ask
    if (!STRICT) return
    const wanted = new Set([...picks.map((p) => p.work), ...poolEntries.map((e) => e.pick.work)].flatMap((w) => [shelfCrop(w).file, shelfCrop(w).darkFile]))
    const present = existsSync(SHELF_STILL_DIR) ? readdirSync(SHELF_STILL_DIR).map((f) => `${SHELF_STILL_DIR}/${f}`) : []
    expect(present.filter((f) => !wanted.has(f)), 'a stray crop — run npm run shelf:stills').toEqual([])
  })
})

describe('the pool the edition draws from', () => {
  const pool = poolEntries.map((e) => e.card)

  it('leads with the pinned pieces, then the picks in their order, and holds far more than the shelf shows', () => {
    const pinned = SELECTED_WORKS.pinned.map((w) => shelfKey(w))
    expect(pool.slice(0, pinned.length).map((c) => c.key)).toEqual(pinned)
    expect(pool.filter((c) => c.pinned).map((c) => c.key)).toEqual(pinned)
    const rest = pool.slice(pinned.length).map((c) => c.key)
    expect(rest.slice(0, cards.length - pinned.filter((k) => byKey.has(k)).length)).toEqual(cards.map((c) => c.key).filter((k) => !pinned.includes(k)))
    expect(pool.length).toBeGreaterThan(cards.length * 3)
  })

  it('holds every piece once, by key, by address and by title', () => {
    for (const pick of [(c: (typeof pool)[number]) => c.key, (c: (typeof pool)[number]) => c.href, (c: (typeof pool)[number]) => `${c.title}|${c.maker}`]) {
      const seen = pool.map(pick)
      expect(new Set(seen).size).toBe(seen.length)
    }
  })

  it('draws from every maker of the house', () => {
    const makers = new Set(pool.map((c) => c.voice ?? c.maker))
    for (const voice of ['studio', 'atelier', 'field']) expect(makers.has(voice), voice).toBe(true)
    expect(makers.size).toBeGreaterThanOrEqual(6)
  })

  it.each(pool.map((c) => [c.key, c] as const))('%s is published, dated, and shows only a committed crop', (_key, card) => {
    expect(card.title.trim()).not.toBe('')
    expect(card.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(card.href.startsWith('/')).toBe(true)
    expect(pieceHref(card.href)).toBe(card.href)
    expect(pageExists(card.href), `no page is built at ${card.href}`).toBe(true)
    if (card.still) expect(existsSync(join('public', card.still.src)), card.still.src).toBe(true)
  })

  it('shows a picture of its piece on almost every card', () => {
    // a work that landed tonight has no shot until npm run shelf:shots runs, so this asks for most,
    // not all; a missing shot never turns a practice's delivery red
    const pictured = pool.filter((c) => c.still).length
    expect(pictured / pool.length, `${pool.length - pictured} card(s) without a picture — run npm run shelf:shots`).toBeGreaterThan(0.9)
  })

  it('leaves the running cycle out until it is presented', () => {
    const cycle = loadCycle()
    if (cycle.phase !== 'working') return
    const pad = String(cycle.cycle).padStart(3, '0')
    expect(pool.filter((c) => c.key.endsWith(`cycle-${pad}`)).map((c) => c.key)).toEqual([])
  })
})

describe('the shelf under the lab’s carousel (2026-11-02)', () => {
  // Frank's decision of 2026-11-02 (wording private): the entrance leads with the lab's experiments
  // in a carousel of their own, and the selected works below it hold the practices' pieces only.
  const pool = poolEntries.map((e) => e.card)
  const shelf = withoutLab(pool)
  // the maker's name as the card reads it: the overview card's title, else the house's fallback
  const attention = NAMING.overview.items.find((i) => i.id === 'attention')?.title ?? NAMING.opsRoom.signal.houseFallback.attention

  it('holds no piece of the lab’s own register, and none the carousel shows', () => {
    expect(shelf.filter((c) => c.lab).map((c) => c.key)).toEqual([])
    const carousel = new Set(readLabCarousel().map((c) => c.href.replace(/\/$/, '')))
    expect(shelf.filter((c) => carousel.has(c.href.replace(/\/$/, ''))).map((c) => c.key)).toEqual([])
  })

  it('marks as the lab’s exactly the register’s pieces no other house claims', () => {
    for (const { pick, card } of poolEntries) {
      expect(card.lab, card.key).toBe(pick.work.kind === 'experiment' && !claimedByAttention(card.href))
    }
  })

  it('keeps Machine Attention’s instrument as the practice’s piece, named for its maker', () => {
    // the register files it beside the lab's pieces; the practice's own export names its stage
    const stages = (exportFile.projects as { site_route: string | null }[]).flatMap((p) => (p.site_route ? [p.site_route] : []))
    const observatory = pool.find((c) => c.href.replace(/\/$/, '') === '/observatory')
    expect(stages).toContain('/observatory')
    expect(observatory?.maker).toBe(attention)
    expect(observatory?.lab).toBe(false)
    expect(shelf).toContain(observatory)
  })

  it('keeps every practice of the pool, the practices’ picks leading in their order', () => {
    expect(shelf).toEqual(pool.filter((c) => !c.lab))
    const makers = new Set(shelf.map((c) => c.voice ?? c.maker))
    for (const voice of ['studio', 'atelier', 'field', attention]) expect(makers.has(voice), voice).toBe(true)
    // n-1 is named by the title its own window declares, which the practice may change
    expect(shelf.some((c) => c.key.startsWith('n-1-'))).toBe(true)
    const practicePicks = cards.filter((c) => !c.lab).map((c) => c.key)
    expect(shelf.slice(0, practicePicks.length).map((c) => c.key)).toEqual(practicePicks)
    // the band keeps the size of the shelf of record, and the pool has far more to draw from
    expect(shelf.length).toBeGreaterThan(cards.length * 3)
  })
})

describe('a page’s own sentence', () => {
  it('is its description, unless that only names who made it', () => {
    expect(pageSentence('<meta name="description" content="A desk deals real warnings, and the record answers mostly with silence.">')).toBe(
      'A desk deals real warnings, and the record answers mostly with silence.',
    )
    expect(
      pageSentence('<meta name="description" content="The Atelier · cycle 004, read through extinction"><p>Each square is one record, lettered by its class. More follows.</p>'),
    ).toBe('Each square is one record, lettered by its class.')
  })

  it('is nothing where the page says nothing of itself', () => {
    expect(pageSentence('<p>Short.</p>')).toBeUndefined()
  })
})

describe('a pick its record cannot answer', () => {
  it('fails loud, naming the pick, rather than leaving a gap on the shelf', () => {
    expect(() => readPick({ work: { kind: 'studio-work', slug: '2026-01-01-no-such-work' }, sentence: 'A work that is not there.', reason: 'none' })).toThrow(
      /no-such-work.*cannot be read/,
    )
    expect(() => readPick({ work: { kind: 'experiment', id: 'no-such-experiment' }, reason: 'none' })).toThrow(/no entry "no-such-experiment"/)
    expect(() => readPick({ work: { kind: 'n-1-work', href: 'projects/no-such-work/' }, sentence: 'A work that is not there.', reason: 'none' })).toThrow(/lists no work/)
    expect(() => readPick({ work: { kind: 'presentation', practice: 'atelier', cycle: 999 }, sentence: 'A cycle that never ran.', reason: 'none' })).toThrow(
      /no presentation of cycle 999/,
    )
  })

  it('asks a sentence of every pick that is not a lab experiment', () => {
    expect(() => readPick({ work: { kind: 'attention-experiment', id: 'foreknown' }, reason: 'none' })).toThrow(/says no sentence/)
  })

  it('is left off the shelf, never taking the page down', () => {
    const good = picks[0]
    const bad: ShelfPick = { work: { kind: 'studio-work', slug: '2026-01-01-no-such-work' }, sentence: 'A work that is not there.', reason: 'none' }
    const report = readShelfReport(process.cwd(), [good, bad])
    expect(report.cards.map((c) => c.key)).toEqual([shelfKey(good.work)])
    expect(report.missing.map((m) => m.key)).toEqual([shelfKey(bad.work)])
  })
})

describe('a retirement’s day', () => {
  it('is read from the retirement moment, or from the archive’s own front page once the moment has scrolled out', () => {
    // the moments file keeps the newest hundred; an id with no moment of its own falls through to
    // the frozen stage, which states the day itself
    const fromMoment = retirementDay('foreknown', '/attention')
    expect(fromMoment).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(retirementDay('an-id-without-moments', '/attention')).toBe(fromMoment)
    expect(retirementDay('an-id-without-moments', '/no-such-stage')).toBeNull()
  })
})

describe('the two pages that show the practices’ pieces', () => {
  it('the dossier mounts the shelf of record, fed by its reader', () => {
    const src = read('../../pages/dossier.astro')
    expect(src).toContain('readShelf')
    expect(src).toContain('<SelectedWorks')
  })

  it('the edition mounts From the Ecology, fed by the pool without the lab (since 2026-11-03)', () => {
    const src = read('../../components/pages/HomeEdition.astro')
    expect(src).toContain('withoutLab(readPool())')
    expect(src).toContain('<EcologyShelf')
    expect(src).not.toContain('<SelectedWorks')
  })
})

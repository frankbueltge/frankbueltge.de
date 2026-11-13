// The lab's band at the top of the entrance (2026-11-02): its order, and what each card reads.
//
// Frank's decision of 2026-11-02 (wording private, paraphrased): the homepage leads with the lab's
// experiments. Since 2026-11-03 (the calm homepage, docs/design_handoff_homepage_calm/README.md §3)
// Ducking leads large, and under it the carousel holds exactly nine experiments in a fixed order.
// These tests hold that order on the register as it stands and on lists made up for the purpose.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EDITION } from '@/config/edition-wording'
import { EXPERIMENT_LINES, WERKE_BY_LINE, WERKE_HOLDINGS, WERKE_RETIRED, type Werk } from '@/data/werke'
import { pieceHref } from '@/lib/engines/publication-links'
import { carouselOrder, labBand, labSlides, labWording, readLabCarousel } from './lab-carousel'
import { dayMonthYear } from './since'

/** A register entry with only what the order reads. */
const werk = (id: string, since: string, retired = false): Werk => ({
  id,
  title: id,
  subtitle: { de: id, en: id },
  status: retired ? 'retired' : 'live',
  href: `/${id}`,
  description: { de: id, en: id },
  since,
  ...(retired ? { retired: { on: '2026-10-17', reason: 'stopped', archive: { path: `src/data/${id}`, kind: 'dated' as const } } } : {}),
})

const ids = (list: readonly Werk[]) => list.map((w) => w.id)

describe('the order of the band', () => {
  const list = [werk('a', '2026-06-01'), werk('b', '2026-09-01'), werk('c', '2026-08-01'), werk('d', '2026-10-01')]

  it('puts the lead first, then exactly the picks, each in the order given', () => {
    expect(ids(carouselOrder(list, ['c'], ['a', 'd']))).toEqual(['c', 'a', 'd'])
    expect(ids(carouselOrder(list, [], ['b', 'a']))).toEqual(['b', 'a'])
  })

  it('passes over a retired work, an id the list does not hold, and a work named twice', () => {
    const withRetired = [...list, werk('r', '2026-10-30', true)]
    expect(ids(carouselOrder(withRetired, ['r', 'c'], ['nowhere', 'a', 'c', 'a']))).toEqual(['c', 'a'])
  })

  it('reorders nothing it was given', () => {
    const before = ids(list)
    carouselOrder(list, ['c'], ['a'])
    expect(ids(list)).toEqual(before)
  })
})

describe('the band the edition shows', () => {
  const cards = readLabCarousel()
  const { lead, picks } = EDITION.lab

  it('has no lead and holds exactly the six selected experiments, in their order', () => {
    expect(lead).toEqual([])
    const band = labBand(cards)
    expect(band.lead).toEqual([])
    expect(picks).toEqual(['ducking', 'trending', 'ill-tempered-week', 'comma', 'third-reading', 'consensus'])
    expect(band.carousel.map((c) => c.key)).toEqual(picks.map((id) => `lab-${id}`))
    expect(band.carousel.map((c) => c.title)).toEqual(['Ducking', 'Common Ground', 'the ill-tempered week', 'Comma', 'Third Reading', 'Consensus'])
  })

  it('names only experiments /experiments lists and that are still running', () => {
    for (const id of [...lead, ...picks]) {
      const entry = WERKE_HOLDINGS.find((w) => w.id === id)
      expect(entry, `EDITION.lab names "${id}", which /experiments does not list`).toBeDefined()
      expect(entry?.retired, `EDITION.lab names "${id}", which is retired`).toBeUndefined()
      expect(WERKE_BY_LINE.some((g) => g.werke.includes(entry!)), `"${id}" stands under no line on /experiments`).toBe(true)
    }
    for (const w of WERKE_RETIRED) expect(cards.map((c) => c.key)).not.toContain(`lab-${w.id}`)
  })

  it('dates every card by the register’s `since`, and says the day in words', () => {
    for (const card of cards) {
      const entry = WERKE_HOLDINGS.find((w) => `lab-${w.id}` === card.key)!
      expect(card.day).toBe(entry.since)
      expect(card.when).toContain(dayMonthYear(entry.since))
    }
  })

  it('gives every card its line of research and the register’s own sentence', () => {
    for (const card of cards) {
      const entry = WERKE_HOLDINGS.find((w) => `lab-${w.id}` === card.key)!
      expect(card.line, card.key).toBe(EXPERIMENT_LINES.find((l) => l.id === entry.line)!.label)
      expect(card.sentence, card.key).toBe(entry.subtitle.en)
    }
  })

  it('links every card to a page this site publishes', () => {
    for (const card of cards) {
      expect(card.href.startsWith('/'), card.key).toBe(true)
      expect(pieceHref(card.href), card.key).toBe(card.href)
    }
  })

  it('shows a still where one is committed, in both themes’ tones, else the miniature of the work’s own record — never nothing', () => {
    for (const card of cards) {
      if (card.still) {
        expect(existsSync(join('public', card.still.src)), card.still.src).toBe(true)
        expect(card.still.dark, `${card.key} has no dark duotone`).not.toBeNull()
        expect(existsSync(join('public', card.still.dark!)), card.still.dark!).toBe(true)
        expect(card.mini, card.key).toBeNull()
      } else {
        expect(card.mini?.marks.length, `${card.key} has neither a still nor a miniature`).toBeGreaterThan(0)
      }
    }
  })

  it('is the lab’s own, every card of it', () => {
    expect(cards.every((c) => c.lab && c.maker === 'The Lab')).toBe(true)
  })
})

describe('what the island is handed', () => {
  const cards = readLabCarousel()
  const link = (href: string) => `${href.replace(/\/$/, '')}/`
  const slides = labSlides(cards, link)

  it('is one slide per card, in the carousel’s order, through the page’s own link helper', () => {
    expect(slides.map((s) => s.id)).toEqual(cards.map((c) => c.key))
    expect(slides.map((s) => s.href)).toEqual(cards.map((c) => link(c.href)))
  })

  it('composes the meta line the shelf composes, and a plate line for a frame without either picture', () => {
    for (const [i, slide] of slides.entries()) {
      expect(slide.meta).toBe(`${cards[i].kind} · ${cards[i].when}`)
      expect(slide.plate.length).toBeGreaterThan(0)
    }
  })

  it('carries the band’s words, with the link to every experiment through the same helper', () => {
    const words = labWording(link)
    expect(words.title).toBe(EDITION.lab.title)
    expect(words.all.href).toBe('/experiments/')
    for (const template of [words.position, words.count, words.announce]) {
      expect(template).toContain('{n}')
      expect(template).toContain('{total}')
    }
    expect(words.open).toContain('{kind}')
  })
})

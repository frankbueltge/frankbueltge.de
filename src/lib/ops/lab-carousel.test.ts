// The lab's carousel at the top of the entrance (2026-11-02): its order, and what each card reads.
//
// Frank's decision of 2026-11-02 (wording private, paraphrased): the homepage leads with the lab's
// experiments — Ducking first, Common Ground second, then every other experiment by the day it
// opened, newest first; the retired ones stay on /experiments, and since that afternoon so do the
// four EDITION.lab.leave names (his choice, wording private). These tests hold that order on the
// register as it stands and on lists made up for the purpose, so the rule is checked apart from
// whatever the register happens to hold tonight.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EDITION } from '@/config/edition-wording'
import { EXPERIMENT_LINES, WERKE_BY_LINE, WERKE_HOLDINGS, WERKE_RETIRED, type Werk } from '@/data/werke'
import { pieceHref } from '@/lib/engines/publication-links'
import { carouselOrder, labSlides, labWording, readLabCarousel } from './lab-carousel'
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

describe('the order of the carousel', () => {
  const list = [werk('a', '2026-06-01'), werk('b', '2026-09-01'), werk('c', '2026-08-01'), werk('d', '2026-10-01')]

  it('puts the lead first, in the lead’s own order, then every other work newest first', () => {
    expect(ids(carouselOrder(list, ['c', 'a']))).toEqual(['c', 'a', 'd', 'b'])
    expect(ids(carouselOrder(list, []))).toEqual(['d', 'b', 'c', 'a'])
  })

  it('keeps the given order between works that opened on the same day', () => {
    const tied = [werk('x', '2026-07-01'), werk('y', '2026-09-04'), werk('z', '2026-09-04')]
    expect(ids(carouselOrder(tied, []))).toEqual(['y', 'z', 'x'])
    expect(ids(carouselOrder([...tied].reverse(), []))).toEqual(['z', 'y', 'x'])
  })

  it('leaves the retired out, a retired lead among them', () => {
    const withRetired = [...list, werk('r', '2026-10-30', true), werk('s', '2026-05-01', true)]
    expect(ids(carouselOrder(withRetired, ['s', 'c']))).toEqual(['c', 'd', 'b', 'a'])
  })

  it('leaves out what it is told to leave, a lead among them', () => {
    expect(ids(carouselOrder(list, ['c'], ['c', 'a']))).toEqual(['d', 'b'])
  })

  it('passes over a lead the list does not hold, and a lead named twice', () => {
    expect(ids(carouselOrder(list, ['nowhere', 'b', 'b']))).toEqual(['b', 'd', 'c', 'a'])
  })

  it('reorders nothing it was given', () => {
    const before = ids(list)
    carouselOrder(list, ['c'])
    expect(ids(list)).toEqual(before)
  })
})

describe('the carousel the edition shows', () => {
  const cards = readLabCarousel()
  const lead = EDITION.lab.lead

  it('opens with Ducking, then Common Ground', () => {
    expect(lead).toEqual(['ducking', 'trending'])
    expect(cards.slice(0, 2).map((c) => c.key)).toEqual(['lab-ducking', 'lab-trending'])
    expect(cards.slice(0, 2).map((c) => c.title)).toEqual(['Ducking', 'Common Ground'])
  })

  it('leads only with experiments /experiments lists and that are still running', () => {
    for (const id of lead) {
      const entry = WERKE_HOLDINGS.find((w) => w.id === id)
      expect(entry, `EDITION.lab.lead names "${id}", which /experiments does not list`).toBeDefined()
      expect(entry?.retired, `EDITION.lab.lead names "${id}", which is retired`).toBeUndefined()
    }
  })

  it('holds every experiment /experiments groups under a line, once, but the ones it leaves and none it keeps as retired', () => {
    const leave: readonly string[] = EDITION.lab.leave
    const listed = WERKE_BY_LINE.flatMap((g) => g.werke.filter((w) => !leave.includes(w.id)).map((w) => `lab-${w.id}`))
    expect([...cards.map((c) => c.key)].sort()).toEqual([...listed].sort())
    for (const w of WERKE_RETIRED) expect(cards.map((c) => c.key)).not.toContain(`lab-${w.id}`)
  })

  it('leaves out Headroom, Editorial Deadline, Iceberg Theory and Society, which /experiments still lists', () => {
    const leave: readonly string[] = EDITION.lab.leave
    expect([...leave].sort()).toEqual(['parallaxe', 'redaction', 'society', 'spielraum'])
    for (const id of leave) {
      const entry = WERKE_HOLDINGS.find((w) => w.id === id)
      expect(entry, `EDITION.lab.leave names "${id}", which /experiments does not list`).toBeDefined()
      expect(lead, `"${id}" cannot both lead and be left out`).not.toContain(id)
      expect(cards.map((c) => c.key)).not.toContain(`lab-${id}`)
    }
  })

  it('follows the lead with every other experiment by the day it opened, newest first', () => {
    const days = cards.slice(lead.length).map((c) => c.day)
    expect(days).toEqual([...days].sort().reverse())
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

  it('shows a still where one is committed, else the miniature of the work’s own record — never nothing', () => {
    for (const card of cards) {
      if (card.still) {
        expect(existsSync(join('public', card.still.src)), card.still.src).toBe(true)
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

// The lab's band at the top of the entrance: since 2026-11-13 its six strongest experiments,
// ranked (EDITION.lab.six). These tests hold the order on the register as it stands and on lists
// made up for the purpose, and what every card reads.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EDITION } from '@/config/edition-wording'
import { EXPERIMENT_LINES, WERKE_BY_LINE, WERKE_HOLDINGS, WERKE_RETIRED, type Werk } from '@/data/werke'
import { pieceHref } from '@/lib/engines/publication-links'
import { labOrder, labTier, readLabSix } from './lab-six'
import { dayMonthYear } from './since'

/** A register entry with only what the order reads. */
const werk = (id: string, retired = false): Werk => ({
  id,
  title: id,
  subtitle: { de: id, en: id },
  status: retired ? 'retired' : 'live',
  href: `/${id}`,
  description: { de: id, en: id },
  since: '2026-10-01',
  ...(retired ? { retired: { on: '2026-10-17', reason: 'stopped', archive: { path: `src/data/${id}`, kind: 'dated' as const } } } : {}),
})
const pick = (id: string) => ({ id, reason: `why ${id}` })

describe('the order of the band', () => {
  const list = [werk('a'), werk('b'), werk('c'), werk('r', true)]

  it('keeps the order given and carries each pick’s reason', () => {
    expect(labOrder(list, [pick('c'), pick('a')]).map((x) => [x.werk.id, x.reason])).toEqual([
      ['c', 'why c'],
      ['a', 'why a'],
    ])
  })

  it('passes over a retired work, an id the list does not hold, and a work named twice', () => {
    expect(labOrder(list, [pick('r'), pick('nowhere'), pick('b'), pick('b')]).map((x) => x.werk.id)).toEqual(['b'])
  })

  it('lays the ranks out one, two, three', () => {
    expect([1, 2, 3, 4, 5, 6].map(labTier)).toEqual([1, 2, 2, 3, 3, 3])
  })
})

describe('the six the edition shows', () => {
  const cards = readLabSix()
  const ids = EDITION.lab.six.map((p) => p.id)

  it('shows all six, ranked from one, in the order of EDITION.lab.six', () => {
    expect(cards.map((c) => c.key)).toEqual(ids.map((id) => `lab-${id}`))
    expect(cards.map((c) => c.rank)).toEqual([1, 2, 3, 4, 5, 6])
    expect(cards.map((c) => c.reason)).toEqual(EDITION.lab.six.map((p) => p.reason))
  })

  it('names only experiments /experiments lists and that are still running', () => {
    for (const id of ids) {
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

  it('shows a committed still in both themes’ tones for every one of the six', () => {
    for (const card of cards) {
      expect(card.still, `${card.key} has no still`).not.toBeNull()
      expect(existsSync(join('public', card.still!.src)), card.still!.src).toBe(true)
      expect(card.still!.dark, `${card.key} has no dark duotone`).not.toBeNull()
      expect(existsSync(join('public', card.still!.dark!)), card.still!.dark!).toBe(true)
    }
  })

  it('is the lab’s own, every card of it', () => {
    expect(cards.every((c) => c.lab && c.maker === 'The Lab')).toBe(true)
  })
})

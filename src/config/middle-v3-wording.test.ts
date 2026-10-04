// The Middle's own words, held to the rebuild of 2026-10-05 (Frank's decision, wording private):
// a visitor should SEE how the practices work together, with very little text. So the framing
// above the figure is counted, and no fixed string carries a number — every count on the page is
// derived from the relay or the bulletins and arrives as an argument.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { MIDDLE_V3 } from './middle-v3-wording'

const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length

/** every plain string under a block — functions are skipped: their numbers are arguments */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out))
  return out
}

describe('the framing above the figure', () => {
  it('stays near eighty words: kicker, title, intro and the one-line key together', () => {
    const { head, legend } = MIDDLE_V3
    const total =
      words(head.kicker) +
      words(head.title) +
      words(head.intro) +
      words(Object.values(legend.kinds).join(' ')) +
      words(legend.empty) +
      words(legend.hue)
    expect(total).toBeLessThanOrEqual(80)
  })

  it('says what the three kinds mean, in the words the key uses', () => {
    for (const kind of Object.values(MIDDLE_V3.legend.kinds)) expect(MIDDLE_V3.head.intro).toContain(kind)
  })
})

describe('no number typed into the copy', () => {
  const blocks = {
    head: MIDDLE_V3.head,
    legend: MIDDLE_V3.legend,
    triangle: MIDDLE_V3.triangle,
    handoffs: MIDDLE_V3.handoffs,
    bulletins: MIDDLE_V3.bulletins,
    voice: MIDDLE_V3.voice,
  }

  it.each(Object.entries(blocks))('%s carries no digit in a fixed string', (_name, block) => {
    expect(strings(block).filter((s) => /\d/.test(s))).toEqual([])
  })

  it('lets the archive carry dates of record and nothing else that counts', () => {
    for (const s of strings(MIDDLE_V3.archive)) {
      const withoutDates = s.replace(/\d{4}-\d{2}-\d{2}/g, '')
      expect(withoutDates, s.slice(0, 40)).not.toMatch(/\d/)
    }
  })

  it('writes every counted line around its argument, never around a memory of it', () => {
    expect(MIDDLE_V3.triangle.table.summary(7)).toContain('7')
    expect(MIDDLE_V3.triangle.skipped(3)).toContain('3')
    expect(MIDDLE_V3.handoffs.age(12)).toContain('12')
    expect(MIDDLE_V3.handoffs.closed(4)).toContain('4')
    expect(MIDDLE_V3.bulletins.notes(5)).toContain('5')
  })
})

describe('the register’s archive line', () => {
  it('no longer claims the register was last written on 2026-08-23 — exports ran until 2026-09-15', () => {
    expect(MIDDLE_V3.archive.body).not.toContain('2026-08-23')
    expect(MIDDLE_V3.archive.body).toContain('2026-09-15')
    expect(MIDDLE_V3.archive.body).toContain('2026-10-05')
  })

  it('is what the register’s own page says about itself', () => {
    const page = readFileSync(fileURLToPath(new URL('../pages/encounters/register.astro', import.meta.url)), 'utf8')
    expect(page).toContain('MIDDLE_V3.archive.registerNote')
  })
})

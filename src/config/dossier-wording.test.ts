// The dossier's wording (2026-10-17): what it may say, and what it may no longer say.
//
// The page was a draft for eleven weeks and described mechanisms the ecology had retired, because
// nothing checked its prose against the house it described. These guards are that check, for the
// parts a test can hold: the statement's length, no digit in the prose (a day is a dated field,
// handed to a sentence by the page), none of the retired vocabulary, and no address of the wrong
// person.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DOSSIER } from './dossier-wording'

/** Dated or addressed fields: data, not prose. Everything else is walked. */
const DATA_KEYS = new Set(['asOf', 'since', 'admittedOn', 'auditOn', 'href', 'when'])

const strings: { path: string; text: string }[] = []
const walk = (value: unknown, path: string): void => {
  if (typeof value === 'string') strings.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) if (!DATA_KEYS.has(k)) walk(v, `${path}.${k}`)
}
walk(DOSSIER, 'DOSSIER')

/** The functions, called with recognisable arguments, so their own words are checked too. */
const D = DOSSIER
const called: { path: string; text: string }[] = [
  { path: 'dateline', text: D.dateline('X') },
  { path: 'ecology.lead', text: D.ecology.lead('X') },
  ...D.ecology.steps({ sessions: 'X', vetoDays: 'X', conveningDays: 'X' }).map((text, i) => ({ path: `ecology.steps[${i}]`, text })),
  {
    path: 'questions.lead',
    text: D.questions.lead({ total: 'X', chosen: 'X', continuing: 'X', seedOn: 'X', continuingSince: 'X', readThrough: 'X' }),
  },
  { path: 'publication.lead', text: D.publication.lead('X') },
  { path: 'neighbours.lead', text: D.neighbours.lead('X') },
  { path: 'attention.admittedHeading', text: D.attention.admittedHeading('X') },
  { path: 'attention.retiredOn', text: D.attention.retiredOn('X') },
  ...D.accountability.paragraphs({ personas: 'X' }).map((text, i) => ({ path: `accountability[${i}]`, text })),
]

const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('the dossier’s prose', () => {
  it('holds strings to check', () => {
    expect(strings.length).toBeGreaterThan(40)
  })

  // Names that carry a digit are names, not counts: a neighbour's (terra0) and Machine
  // Attention's own word for a stage of its admission path (V0).
  const NAMES_WITH_DIGITS = /\bterra0\b|\b[vV]0\b/g

  it.each([...strings, ...called].map((s) => [s.path, s.text] as const))('%s carries no digit', (_path, text) => {
    expect(text.replace(NAMES_WITH_DIGITS, '')).not.toMatch(/\d/)
  })

  it('keeps the statement to two hundred and fifty words', () => {
    const total = D.statement.paragraphs.reduce((sum, p) => sum + words(p), 0)
    expect(total).toBeGreaterThan(150)
    expect(total).toBeLessThanOrEqual(250)
  })

  it('names none of the mechanisms the ecology retired', () => {
    // v2 (2026-08-08 – 2026-08-30) and the draft that described it: gone, dated, never current
    // (docs/wording-kanon.md, research ecology v3).
    const retired = [/gated publication/i, /evidence tiers?/i, /honesty tiers?/i, /concept gate/i, /ship[- ]gate/i, /machine[- ]advantage bar/i, /seven-day/i, /\bwork-line\b/i]
    for (const { path, text } of [...strings, ...called]) for (const re of retired) expect(text, `${path} says ${re}`).not.toMatch(re)
  })

  it('never gives the address of the other Frank Bültge', () => {
    expect(JSON.stringify(DOSSIER)).not.toContain('frank@bueltge.de')
  })
})

describe('the dossier’s facts', () => {
  it('dates what it cannot read, as ISO days', () => {
    for (const day of [D.asOf, D.ecology.since, D.attention.admittedOn, D.neighbours.auditOn]) expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('links every neighbour to a source of its own', () => {
    for (const n of D.neighbours.rows) expect(n.href, n.name).toMatch(/^https:\/\//)
  })

  it('says who chose a question, and that the continuing question is the architect’s', () => {
    const lead = D.questions.lead({ total: 'eight', chosen: 'two', continuing: 'Missing Data Art', seedOn: 'day', continuingSince: 'day', readThrough: 'twice' })
    expect(lead).toContain('is the architect’s own')
    expect(lead).toContain('the practices chose two themselves, in convening')
    expect(D.questions.setBy.convening).toContain('the practices')
  })

  it('leads its table of contents to sections the page has', () => {
    const page = readFileSync(fileURLToPath(new URL('../pages/dossier.astro', import.meta.url)), 'utf8')
    for (const { href } of D.toc) expect(page, href).toContain(`id="${href.slice(1)}"`)
  })
})

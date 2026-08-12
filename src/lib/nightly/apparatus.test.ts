// The nightly line's instruments, held against the texts they are read from.
//
// Every figure the apparatus pages print is parsed out of the practice's own prose, and prose
// changes shape. These tests do not assert the numbers that happen to be true today; they hold
// the parse against the committed files, so a mirror that arrives in a different shape fails
// here instead of quietly rendering an empty register as a clean bill of health.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ERROR_TYPES,
  addenda,
  citations,
  errorRegister,
  positionShift,
  reading,
  registerEntries,
  registerFiles,
  stations,
  tracks,
} from './apparatus'

const WORKS_DIR = 'src/content/atelier/works'
const read = (name: string): string => readFileSync(join(WORKS_DIR, name), 'utf8')
const registerNames = (): string[] =>
  readdirSync(WORKS_DIR)
    .filter((n) => /^fehlerkataster-\d{3}\.md$/.test(n))
    .sort()

describe('the error register', () => {
  it('finds every register file the mirror committed', () => {
    expect(registerFiles().map((f) => f.number)).toEqual(
      registerNames().map((n) => Number(n.match(/(\d{3})/)![1])),
    )
  })

  it('dates and sessions every register from its own header', () => {
    // A register with neither would render as a blank row on the instrument page.
    for (const file of registerFiles()) {
      expect(file.date, `register ${file.number} has no date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(file.session, `register ${file.number} has no session`).toBeGreaterThan(0)
    }
  })

  it('reads exactly the F-headings the files carry — none dropped, none invented', () => {
    const inFiles = registerNames().flatMap((name) => [...read(name).matchAll(/^#{2,3}\s+F-(\d{3})/gm)].map((m) => `F-${m[1]}`))
    expect(registerEntries().map((e) => e.id)).toEqual(inFiles)
  })

  it('opens each id exactly once and keeps the returns to it separate', () => {
    const { opened, revisits } = errorRegister()
    const ids = opened.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const revisit of revisits) expect(ids).toContain(revisit.id)
  })

  it('numbers the opened entries contiguously from F-001', () => {
    // A gap means a heading shape the parser missed, not an error the practice skipped.
    const numbers = errorRegister().opened.map((e) => e.number)
    expect(numbers).toEqual(Array.from({ length: numbers.length }, (_, i) => i + 1))
  })

  it('gives every opened entry a session and at least one glossed type', () => {
    for (const entry of errorRegister().opened) {
      expect(entry.session, `${entry.id} has no session`).toBeGreaterThan(0)
      expect(entry.types.length, `${entry.id} has no type`).toBeGreaterThan(0)
      for (const type of entry.types) expect(ERROR_TYPES[type], `${entry.id} type ${type}`).toBeDefined()
    }
  })

  it('strips the bookkeeping off a headline without eating the prose', () => {
    // The machinery is a PREFIX ("F-020 · Type A · Session 10 — …"). It is stripped from the
    // front and from a trailing session marker, but never mid-sentence: F-020's own description
    // names a type ("Synthesis risk: Type G + double bind …") and that is the practice's text.
    for (const entry of registerEntries()) {
      expect(entry.headline, entry.id).not.toMatch(/^\(?Types?\s+[A-H]/i)
      expect(entry.headline, entry.id).not.toMatch(/^Sessions?\s+\d/i)
      expect(entry.headline, entry.id).not.toMatch(/Sessions?\s+\d+\s*$/i)
      expect(entry.headline, entry.id).not.toMatch(/^[\s·—:,-]/)
    }
  })

  it('keeps brackets that belong to the text', () => {
    // "Type B (inaccessible primary, …): Marenko (2015)" once came out as "…source): Marenko
    // (2015" — brackets trimmed off the ends of the wrong span. A headline may not end mid-pair.
    for (const entry of registerEntries()) {
      const opens = (entry.headline.match(/\(/g) ?? []).length
      const closes = (entry.headline.match(/\)/g) ?? []).length
      expect(opens, `${entry.id}: "${entry.headline}"`).toBe(closes)
    }
  })

  it('quotes the practice\'s own active-error declaration from its last register that makes one', () => {
    const { active } = errorRegister()
    expect(active.ids.length).toBeGreaterThan(0)
    const body = read(`fehlerkataster-${String(active.register).padStart(3, '0')}.md`)
    const block = body.match(/\*\*Active errors:\*\*([\s\S]+?)(?:\n\n|$)/)![1]
    expect(active.ids).toEqual([...new Set(block.match(/F-\d{3}/g)!)].sort())
    // Every declared-active id must be one the register actually opened, or the page would
    // print a status for an error that has no entry behind it.
    const opened = new Set(errorRegister().opened.map((e) => e.id))
    for (const id of active.ids) expect(opened).toContain(id)
  })

  it('never reports more active errors than the register has entries', () => {
    const { active, opened } = errorRegister()
    expect(active.ids.length).toBeLessThanOrEqual(opened.length)
  })

  it('counts each type against distinct ids, so a revisit cannot inflate the tally', () => {
    const { byType, opened } = errorRegister()
    const total = byType.reduce((sum, row) => sum + row.count, 0)
    // Multi-type entries ("Type A + Type C") count once per letter, so the sum is at least the
    // entry count and at most one per letter carried.
    expect(total).toBeGreaterThanOrEqual(opened.length)
    expect(total).toBe(opened.reduce((sum, e) => sum + e.types.length, 0))
  })
})

describe('the genealogy', () => {
  it('reads the four stations the document is built on', () => {
    const parsed = stations()
    const inFile = [...read('genealogie.md').matchAll(/^###\s+Station\s+\d+\s+—/gm)].length
    expect(parsed.length).toBe(inFile)
    expect(parsed.length).toBeGreaterThanOrEqual(4)
    for (const station of parsed) {
      expect(station.author.length).toBeGreaterThan(0)
      expect(station.year).toMatch(/^\d{4}$/)
      expect(station.claim.length).toBeGreaterThan(0)
    }
  })

  it('reads the dated addenda in session order, each with a title', () => {
    const parsed = addenda()
    expect(parsed.length).toBeGreaterThan(10)
    expect(parsed.map((a) => a.from)).toEqual([...parsed.map((a) => a.from)].sort((a, b) => a - b))
    for (const addendum of parsed) {
      expect(addendum.from, `addendum ${addendum.sessions}`).toBeGreaterThan(0)
      expect(addendum.title.length, `addendum ${addendum.sessions} has no title`).toBeGreaterThan(0)
      // The title must not have swallowed the next heading — the failure mode of a greedy parse.
      expect(addendum.title).not.toMatch(/^#{2,3}\s/)
    }
  })

  it('names only tracks the document actually mentions', () => {
    const body = read('genealogie.md')
    for (const track of tracks()) expect(body).toContain(`Track ${track.id}`)
  })
})

describe('the position shift', () => {
  it('takes both titles from the papers themselves', () => {
    const shift = positionShift()
    expect(read('position-2026-07-01.md')).toContain(shift.before.title)
    expect(read('position-2026-07-14.md')).toContain(shift.after.title)
  })

  it('is dated in the order it happened', () => {
    const shift = positionShift()
    expect(shift.before.date < shift.after.date).toBe(true)
  })
})

describe('the reading', () => {
  it('collects only retrievable URLs, each attributed to a text that cites it', () => {
    const found = citations()
    expect(found.length).toBeGreaterThan(10)
    for (const citation of found) {
      expect(citation.url).toMatch(/^https?:\/\//)
      expect(citation.cited.length).toBeGreaterThan(0)
      // No trailing sentence punctuation: these are rendered as links and a stray comma 404s.
      expect(citation.url).not.toMatch(/[.,;:]$/)
      for (const name of citation.cited) expect(read(name)).toContain(citation.url)
    }
  })

  it('runs most-cited first, so the line\'s load-bearing sources sort to the top', () => {
    const counts = citations().map((c) => c.cited.length)
    expect([...counts].sort((a, b) => b - a)).toEqual(counts)
  })

  it('carries the barriers beside the sources, each a Type-B entry of the register', () => {
    // The half a bibliography normally hides. If this ever empties while the register still
    // holds Type-B entries, the page would report the infrastructure as frictionless.
    const { barriers, reached, citingTexts } = reading()
    expect(barriers.length).toBeGreaterThan(0)
    const openedB = errorRegister().opened.filter((e) => e.types.includes('B'))
    expect(barriers.map((b) => b.id)).toEqual(openedB.map((b) => b.id))
    for (const barrier of barriers) expect(barrier.types).toContain('B')
    expect(citingTexts).toBeGreaterThan(0)
    expect(citingTexts).toBeLessThanOrEqual(new Set(reached.flatMap((c) => c.cited)).size)
  })
})

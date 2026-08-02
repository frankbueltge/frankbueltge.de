// src/lib/notation/register.test.ts — the register's acceptance list as a gate (spec §7).
// Structural throughout: nothing here pins a count of entries — a new notation is the
// program working, not drift.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { paletteById } from '@/lib/dataviz/palette'
import { NOTATION_REGISTER } from './register'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const inRepo = (p: string) => !p.includes(':')
const DATE = /^\d{4}-\d{2}-\d{2}$/

describe.each(NOTATION_REGISTER.map((e) => [e.id, e] as const))('notation entry %s', (_id, e) => {
  it('carries the required fields (spec §7.2)', () => {
    expect(e.name.length).toBeGreaterThan(3)
    expect(e.notates.length).toBeGreaterThan(20)
    expect(e.derivation.model.length).toBeGreaterThan(10)
    expect(e.figure.length).toBeGreaterThan(0)
    expect(e.validation.tests.length).toBeGreaterThan(0)
  })

  it('every in-repo pointer resolves — a register of the shipped, not of intentions (§7.1)', () => {
    const paths = [
      ...e.figure,
      e.grammar.source,
      ...(inRepo(e.derivation.record) ? [e.derivation.record] : []),
      ...e.validation.tests,
      ...e.changes.filter((c) => inRepo(c.record)).map((c) => c.record),
      ...e.openQuestions.filter((q) => inRepo(q.record)).map((q) => q.record),
    ]
    for (const p of paths) {
      expect(existsSync(new URL(p, `file://${ROOT}`)), `${p} must exist`).toBe(true)
    }
  })

  it('grammar is imported, never re-typed: lines or an honest data-driven note (§7.3)', () => {
    if (e.grammar.dataDriven) {
      expect(e.grammar.dataDriven.length).toBeGreaterThan(30)
    } else {
      expect(e.grammar.lines.length).toBeGreaterThan(0)
      for (const line of e.grammar.lines) expect(line.length).toBeGreaterThan(5)
    }
  })

  it('changes and open questions are dated; none open only by saying so (§7.2)', () => {
    for (const c of [...e.changes, ...e.openQuestions]) {
      expect(c.date).toMatch(DATE)
      expect(c.note.length).toBeGreaterThan(20)
      expect(c.record.length).toBeGreaterThan(3)
    }
    if (e.openQuestions.length === 0) {
      expect(e.noneOpen, 'an empty open-questions list needs an explicit noneOpen line').toBeTruthy()
    }
  })

  it('a claimed palette id is a recorded set', () => {
    if (e.validation.palette) {
      expect(paletteById(e.validation.palette), `palette set ${e.validation.palette}`).toBeDefined()
    }
  })
})

describe('the register as a whole', () => {
  it('ids are unique — a deep link means one thing', () => {
    const ids = NOTATION_REGISTER.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('quotes its grammars through imports: the refrain voices are the wording config’s own', () => {
    const refrain = NOTATION_REGISTER.find((e) => e.id === 'refrain-score')!
    // spot check the import-not-retype rule: the line must contain the shipped hint verbatim
    expect(refrain.grammar.lines.some((l) => l.includes('intercalation, intervals, superposition'))).toBe(true)
  })
})

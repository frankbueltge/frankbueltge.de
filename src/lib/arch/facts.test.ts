import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readArchFacts, readArchWindow, lastArchProtocol } from './facts'

const ISO = /^\d{4}-\d{2}-\d{2}$/

describe('readArchFacts — the checked-in mirror', () => {
  const facts = readArchFacts()

  it('reads the founding date and the law from the Dowry, never typed', () => {
    expect(facts.founded).toMatch(ISO)
    expect(facts.law).toMatch(/dowry/i)
  })

  it('reads a filled pre-registration as a window with bounds and a balance date', () => {
    expect(facts.window).not.toBeNull()
    const w = facts.window!
    expect(w.decision).toMatch(/^adopt/)
    expect(w.opens).toMatch(ISO)
    expect(w.closes).toMatch(ISO)
    expect(w.closes > w.opens).toBe(true)
    expect(w.minSessions).toBeGreaterThan(0)
    expect(w.days).toBeGreaterThan(0)
    expect(w.balanceBy >= w.closes).toBe(true)
  })

  it('lists every session protocol, oldest first, each with its own title', () => {
    expect(facts.protocols.length).toBeGreaterThan(0)
    for (const p of facts.protocols) {
      expect(p.date).toMatch(ISO)
      expect(p.title.length).toBeGreaterThan(0)
      expect(p.path).toMatch(/^record\/.+-session-\d+\.md$/)
    }
    const sessions = facts.protocols.map((p) => p.session)
    expect([...sessions].sort((a, b) => a - b)).toEqual(sessions)
  })

  it('counts register entries by their dated headings, not by prose', () => {
    expect(facts.registers.length).toBeGreaterThan(0)
    for (const r of facts.registers) {
      expect(r.entries).toBeGreaterThanOrEqual(0)
      expect(r.title.length).toBeGreaterThan(0)
    }
  })

  it('lists works by directory and their built instances, never the template', () => {
    for (const w of facts.works) {
      for (const i of w.instances) {
        expect(i.path).toMatch(/^works\/.+\.html$/)
        expect(i.id).not.toBe('template')
      }
    }
  })

  it('states the last protocol the way the board wants it', () => {
    const last = lastArchProtocol(facts)
    expect(last).not.toBeNull()
    expect(last!.href).toMatch(/^\/arch\/read\/record\//)
    expect(last!.meta).toMatch(ISO)
  })
})

describe('readArchWindow — the pre-registration', () => {
  it('reads the empty template as "no window", the one legal absence', () => {
    const template = [
      '# Pre-registration',
      '    Decision:               adopt / adopt in part / decline      date .........',
      '    Window opens / closes:  ......... / .........',
    ].join('\n')
    expect(readArchWindow(template)).toBeNull()
  })

  it('reads a declined model as "no window"', () => {
    expect(readArchWindow('    Decision:               DECLINE                              date 2026-08-22')).toBeNull()
  })

  it('fails loud on an adopted model whose window is missing', () => {
    expect(() => readArchWindow('    Decision:               ADOPT                                date 2026-08-22')).toThrow(/Window opens/)
  })

  it('fails loud when the form carries neither a decision nor the template blank', () => {
    expect(() => readArchWindow('# something else entirely')).toThrow(/no decision/)
  })
})

describe('readArchFacts — a broken mirror fails loud', () => {
  it('refuses a Dowry without a founding date', () => {
    const root = mkdtempSync(join(tmpdir(), 'arch-'))
    writeFileSync(join(root, 'DOWRY.md'), '# Dowry — Arch\n\nno date here\n')
    mkdirSync(join(root, 'record'))
    writeFileSync(join(root, 'PREREGISTRATION.md'), '')
    expect(() => readArchFacts(root)).toThrow(/Founded/)
  })
})

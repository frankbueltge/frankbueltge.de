// The currency rule as tests (research ecology v3): the entrance derives everything from
// committed files, so these tests hold the loaders against the real repo state AND against
// fixtures for the states the repo does not currently exhibit.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BULLETIN_DISPLAY_MAX,
  loadBulletin,
  loadCycle,
  loadPresentations,
  PRACTICES,
} from './v3'

function fixtureRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eco-v3-'))
  fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
  return root
}

function writeCycle(root: string, overrides: Record<string, unknown> = {}): void {
  const base = {
    cycle: 1,
    phase: 'working',
    question: null,
    source: 'defaults',
    opened: '2026-08-31',
    sessions_per_practice: '3-5',
    defaults: { atelier: 'a', field: 'f', studio: 's' },
  }
  fs.writeFileSync(
    path.join(root, 'src/data/ecology/cycle.json'),
    JSON.stringify({ ...base, ...overrides }),
  )
}

describe('loadCycle', () => {
  it('loads the committed cycle state of this repo', () => {
    const c = loadCycle()
    expect(c.cycle).toBeGreaterThanOrEqual(0)
    expect(['closing', 'working', 'presenting']).toContain(c.phase)
    for (const p of PRACTICES) expect(c.defaults[p].length).toBeGreaterThan(0)
  })

  it('rejects an unknown phase — the entrance must not guess the house clock', () => {
    const root = fixtureRoot()
    writeCycle(root, { phase: 'resting' })
    expect(() => loadCycle(root)).toThrow(/unknown phase/)
  })

  it('rejects a seeded cycle without a question', () => {
    const root = fixtureRoot()
    writeCycle(root, { source: 'seed', question: null })
    expect(() => loadCycle(root)).toThrow(/requires a question/)
  })

  it('rejects a missing default theme', () => {
    const root = fixtureRoot()
    writeCycle(root, { defaults: { atelier: 'a', field: 'f' } })
    expect(() => loadCycle(root)).toThrow(/missing default theme/)
  })
})

describe('loadBulletin', () => {
  it('reports absence as a fact, not an error', () => {
    const root = fixtureRoot()
    const b = loadBulletin('field', root)
    expect(b.present).toBe(false)
    expect(b.text).toBeNull()
  })

  it('returns a committed bulletin verbatim', () => {
    const root = fixtureRoot()
    fs.mkdirSync(path.join(root, 'src/content/studio'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/content/studio/BULLETIN.md'), 'line one\nline two\n')
    const b = loadBulletin('studio', root)
    expect(b).toMatchObject({ present: true, lines: 2, truncated: false })
    expect(b.text).toBe('line one\nline two')
  })

  it('truncates over the display cap and says so', () => {
    const root = fixtureRoot()
    fs.mkdirSync(path.join(root, 'src/content/atelier'), { recursive: true })
    const long = Array.from({ length: BULLETIN_DISPLAY_MAX + 10 }, (_, i) => `l${i}`).join('\n')
    fs.writeFileSync(path.join(root, 'src/content/atelier/BULLETIN.md'), long)
    const b = loadBulletin('atelier', root)
    expect(b.truncated).toBe(true)
    expect(b.text?.split('\n')).toHaveLength(BULLETIN_DISPLAY_MAX)
    expect(b.lines).toBe(BULLETIN_DISPLAY_MAX + 10)
  })
})

describe('loadPresentations', () => {
  it('finds nothing before the first presentation lands', () => {
    const root = fixtureRoot()
    expect(loadPresentations(root)).toEqual([])
  })

  it('links the html face when one exists, the repository otherwise', () => {
    const root = fixtureRoot()
    const a = path.join(root, 'public/atelier/presentations/cycle-001')
    const f = path.join(root, 'public/field/presentations/cycle-001')
    fs.mkdirSync(a, { recursive: true })
    fs.mkdirSync(f, { recursive: true })
    fs.writeFileSync(path.join(a, 'index.html'), '<!doctype html>')
    fs.writeFileSync(path.join(f, 'summary.md'), 'plain summary')
    const entries = loadPresentations(root)
    expect(entries).toHaveLength(2)
    expect(entries.find((e) => e.practice === 'atelier')?.href).toBe(
      '/atelier/presentations/cycle-001/',
    )
    expect(entries.find((e) => e.practice === 'field')?.href).toContain(
      'github.com/frankbueltge/field-research',
    )
  })
})

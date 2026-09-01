// The currency rule as tests (research ecology v3): the entrance derives everything from
// committed files, so these tests hold the loaders against the real repo state AND against
// fixtures for the states the repo does not currently exhibit.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BULLETIN_DISPLAY_MAX,
  loadArtifacts,
  loadBulletin,
  loadClosingReports,
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

describe('loadClosingReports', () => {
  it('finds nothing when no practice published a report', () => {
    expect(loadClosingReports(fixtureRoot())).toEqual([])
  })

  it('prefers closing-report/ and accepts a window only when the page says it is the report', () => {
    const root = fixtureRoot()
    const field = path.join(root, 'public/field/closing-report')
    const atelierWindow = path.join(root, 'public/atelier/window')
    const studioWindow = path.join(root, 'public/studio/window')
    for (const d of [field, atelierWindow, studioWindow]) fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(field, 'index.html'), '<title>The Field — closing report</title>')
    // the Atelier's gate refused a new root path, so its report is its window page
    fs.writeFileSync(
      path.join(atelierWindow, 'index.html'),
      '<title>The Atelier — closing report, 2026-08-30</title>',
    )
    // a window that is only a window must not be advertised as a report
    fs.writeFileSync(path.join(studioWindow, 'index.html'), '<title>The Studio — window</title>')
    const reports = loadClosingReports(root)
    expect(reports).toHaveLength(2)
    expect(reports.find((r) => r.practice === 'field')?.href).toBe('/field/closing-report/')
    expect(reports.find((r) => r.practice === 'atelier')?.href).toBe('/atelier/window/')
    expect(reports.find((r) => r.practice === 'studio')).toBeUndefined()
  })
})

describe('loadArtifacts', () => {
  it('finds nothing before the first artifact lands', () => {
    expect(loadArtifacts(fixtureRoot())).toEqual([])
  })

  it('reads the practice own date prefix and sorts newest first', () => {
    const root = fixtureRoot()
    const mk = (p: string, cycle: string, slug: string) => {
      const dir = path.join(root, 'public', p, 'artifacts', cycle, slug)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html>')
    }
    mk('field', 'cycle-001', '2026-08-30-yield-of-a-loop')
    mk('field', 'cycle-001', '2026-08-31-links-in-the-abstract')
    mk('studio', 'cycle-001', 'undated-thing')
    const found = loadArtifacts(root)
    expect(found.map((a) => a.slug)).toEqual([
      'links-in-the-abstract',
      'yield-of-a-loop',
      'undated-thing',
    ])
    expect(found[0]!.date).toBe('2026-08-31')
    expect(found[0]!.href).toBe('/field/artifacts/cycle-001/2026-08-31-links-in-the-abstract/')
    expect(found[2]!.date).toBeNull()
  })

  it('ignores a directory without an html face', () => {
    const root = fixtureRoot()
    const dir = path.join(root, 'public/field/artifacts/cycle-001/2026-08-30-data-only')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'data.json'), '{}')
    expect(loadArtifacts(root)).toEqual([])
  })
})

// The currency rule as tests (research ecology v3): the entrance derives everything from
// committed files, so these tests hold the loaders against the real repo state AND against
// fixtures for the states the repo does not currently exhibit.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BULLETIN_DISPLAY_MAX,
  inCycle,
  loadArtifacts,
  loadBulletin,
  loadClosingReports,
  loadCycle,
  loadEncounters,
  loadLetters,
  loadPresentations,
  loadSessionNotes,
  PRACTICES,
  type ArtifactEntry,
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

  it('carries the cycle the path names', () => {
    const root = fixtureRoot()
    const dir = path.join(root, 'public/field/artifacts/cycle-002/2026-10-01-later')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html>')
    expect(loadArtifacts(root)[0]).toMatchObject({ practice: 'field', cycle: 2, date: '2026-10-01' })
  })

  // The Atelier's convention: window/cycle-NNN[-session-n]/, dated by the journal note that
  // names the window, titled by the page's own <title> with the practice's suffix trimmed.
  function writeWindow(root: string, dir: string, title: string): void {
    const d = path.join(root, 'public/atelier/window', dir)
    fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(d, 'index.html'), `<!doctype html><html><head><title>${title}</title></head></html>`)
  }
  function writeNote(root: string, file: string, text: string): void {
    const d = path.join(root, 'src/content/atelier/journal')
    fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(d, file), text)
  }

  it('reads the Atelier’s windows, dated by the note that names them and titled by their own page', () => {
    const root = fixtureRoot()
    // the window root is the practice's page (its closing report), not an artifact
    fs.mkdirSync(path.join(root, 'public/atelier/window'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'public/atelier/window/index.html'),
      '<title>The Atelier — closing report, 2026-08-30</title>',
    )
    writeWindow(root, 'cycle-001', 'What the Record Remembers — The Atelier, cycle 001')
    writeWindow(root, 'cycle-001-session-2', 'The Cheapest Thing That Worked — The Atelier, cycle 001, session 2')
    writeWindow(root, 'cycle-001-session-4', 'The Doorkeeper&#39;s List')
    writeWindow(root, 'cycle-001-session-9', 'Nobody Named This')
    writeNote(root, '2026-08-31-what-the-record-remembers.md', 'the work sits in `window/cycle-001/` and `tools/`, which are mine.')
    writeNote(root, '2026-09-01-three-records.md', 'Artifact: `window/cycle-001-session-2/`.')
    writeNote(root, '2026-09-01-the-doorkeepers-list.md', 'The list is at window/cycle-001-session-4 — forty doors.')
    // a later note that looks back at a window must not move its day
    writeNote(root, '2026-09-03-looking-back.md', 'Compare `window/cycle-001-session-2/` with today.')
    // a stray file at the window root is not a directory and is skipped
    fs.writeFileSync(path.join(root, 'public/atelier/window/cycle-notes.txt'), 'x')

    const found = loadArtifacts(root)
    expect(found.some((a) => a.href === '/atelier/window/')).toBe(false)
    expect(found.find((a) => a.slug === 'cycle-001')).toMatchObject({
      practice: 'atelier',
      cycle: 1,
      date: '2026-08-31',
      title: 'What the Record Remembers',
      href: '/atelier/window/cycle-001/',
    })
    expect(found.find((a) => a.slug === 'cycle-001-session-2')).toMatchObject({
      cycle: 1,
      date: '2026-09-01',
      title: 'The Cheapest Thing That Worked',
    })
    expect(found.find((a) => a.slug === 'cycle-001-session-4')).toMatchObject({
      date: '2026-09-01',
      title: "The Doorkeeper's List",
    })
    // named by no note: the window is real, its day is not known — undated, listed last
    const unnamed = found.find((a) => a.slug === 'cycle-001-session-9')
    expect(unnamed).toMatchObject({ cycle: 1, date: null, title: 'Nobody Named This' })
    expect(found[found.length - 1]).toBe(unnamed)
  })

  it('does not let the note for window/cycle-001/ date the sessions under it', () => {
    const root = fixtureRoot()
    writeWindow(root, 'cycle-001-session-3', 'Blind Search — The Atelier, cycle 001, session 3')
    writeNote(root, '2026-08-31-cycle-open.md', 'the work sits in `window/cycle-001/`')
    expect(loadArtifacts(root)[0]!.date).toBeNull()
  })

  // The Studio's convention: works/<date>-<slug>/meta.json with the page under werke-html/.
  function writeWork(root: string, dir: string, meta: Record<string, unknown> | null, face: boolean): void {
    const d = path.join(root, 'src/content/studio/works', dir)
    fs.mkdirSync(d, { recursive: true })
    if (meta) fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta))
    if (face) {
      const f = path.join(root, 'public/studio/werke-html', dir)
      fs.mkdirSync(f, { recursive: true })
      fs.writeFileSync(path.join(f, 'index.html'), '<!doctype html>')
    }
  }

  it('reads the Studio’s works from their own meta.json, only where the page exists on this site', () => {
    const root = fixtureRoot()
    writeWork(root, '2026-09-01-not-yet', { title: 'NOT YET', date: '2026-09-01', author: 'Ensemble' }, true)
    writeWork(root, '2026-07-13-native-speaker', { title: 'Native Speaker', date: '2026-07-13' }, true)
    writeWork(root, '2026-09-01-no-face', { title: 'No Face', date: '2026-09-01' }, false)
    writeWork(root, '2026-09-01-no-meta', null, true)
    writeWork(root, 'undated-dir', { title: 'Undated' }, true)
    const found = loadArtifacts(root)
    expect(found.map((a) => a.slug)).toEqual(['not-yet', 'native-speaker', 'undated-dir'])
    expect(found[0]).toMatchObject({
      practice: 'studio',
      cycle: null,
      date: '2026-09-01',
      title: 'NOT YET',
      href: '/studio/werke-html/2026-09-01-not-yet/',
    })
    expect(found[2]).toMatchObject({ date: null, title: 'Undated' })
  })

  it('orders same-day entries of one practice by slug — a total order, not the filesystem’s', () => {
    const root = fixtureRoot()
    for (const s of ['one-knock-each', 'all-at-once', 'not-yet'])
      writeWork(root, `2026-09-01-${s}`, { title: s, date: '2026-09-01' }, true)
    expect(loadArtifacts(root).map((a) => a.slug)).toEqual(['all-at-once', 'not-yet', 'one-knock-each'])
  })

  it('reads, on this repo, every convention a practice actually uses, and links only pages that exist', () => {
    const found = loadArtifacts()
    for (const a of found) {
      const file = path.join(process.cwd(), 'public', a.href.replace(/^\//, ''), 'index.html')
      expect(fs.existsSync(file), a.href).toBe(true)
    }
    const windowRoot = path.join(process.cwd(), 'public/atelier/window')
    const hasWindows =
      fs.existsSync(windowRoot) && fs.readdirSync(windowRoot).some((d) => /^cycle-/.test(d))
    if (hasWindows) expect(found.some((a) => a.practice === 'atelier' && a.href.includes('/window/'))).toBe(true)
    if (fs.existsSync(path.join(process.cwd(), 'public/studio/werke-html')))
      expect(found.some((a) => a.practice === 'studio')).toBe(true)
  })
})

describe('inCycle', () => {
  const cycle = {
    cycle: 1,
    phase: 'working' as const,
    question: null,
    source: 'defaults' as const,
    opened: '2026-08-30',
    sessionsPerPractice: '3-5',
    defaults: { atelier: 'a', field: 'f', studio: 's' },
  }
  const entry = (over: Partial<ArtifactEntry>): ArtifactEntry => ({
    practice: 'field',
    slug: 'x',
    date: '2026-09-01',
    href: '/x/',
    cycle: null,
    ...over,
  })

  it('trusts the cycle a path names, dated or not', () => {
    expect(inCycle(entry({ cycle: 1 }), cycle)).toBe(true)
    expect(inCycle(entry({ cycle: 1, date: null }), cycle)).toBe(true)
    expect(inCycle(entry({ cycle: 2 }), cycle)).toBe(false)
  })

  it('places a record that names no cycle by the house clock — on or after the opening day', () => {
    expect(inCycle(entry({ date: '2026-08-30' }), cycle)).toBe(true)
    expect(inCycle(entry({ date: '2026-09-01' }), cycle)).toBe(true)
    expect(inCycle(entry({ date: '2026-07-13' }), cycle)).toBe(false)
    expect(inCycle(entry({ date: null }), cycle)).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------
// The three records the partitur added on 2026-09-02 (docs/design/2026-09-02-the-visual-layer.md).
// Each loader is held against a fixture tree for the shapes this repository does not currently
// exhibit, and against the real repository for the one it does.

function writeJournal(root: string, practice: string, files: Record<string, string>): void {
  const dir = path.join(root, 'src/content', practice, 'journal')
  fs.mkdirSync(dir, { recursive: true })
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body)
}

describe('loadSessionNotes', () => {
  it('finds nothing where a practice has no journal', () => {
    expect(loadSessionNotes('field', '2026-08-30', fixtureRoot())).toEqual([])
  })

  it('reads a day-based journal the way its own route does — one note per H1, the day’s anchor', () => {
    const root = fixtureRoot()
    writeJournal(root, 'field', {
      '2026-08-29.md': '# Session 10 — 2026-08-29\n\nbefore the cycle opened\n',
      '2026-08-30.md': '# Session 11 — 2026-08-30\n\nfirst\n\n# Session 12 — 2026-08-30\n\nsecond\n',
    })
    const notes = loadSessionNotes('field', '2026-08-30', root)
    expect(notes.map((n) => n.anchor)).toEqual(['cs-11', 'cs-12'])
    expect(notes.map((n) => n.href)).toEqual(['/field/journal/cs-11/', '/field/journal/cs-12/'])
    expect(notes[0]!.title).toBe('Session 11 — 2026-08-30')
    expect(notes[0]!.date).toBe('2026-08-30')
    expect(notes[0]!.source).toBe('src/content/field/journal/2026-08-30.md')
  })

  it('walks the WHOLE journal before filtering, so the anchors are the ones the routes published', () => {
    // Two days both claiming "collective session 24": the first claimant keeps the clean anchor
    // and the later one is suffixed. A walk that started at the cycle's opening would hand the
    // clean anchor to the WRONG day, and every mark would link to a page that does not exist.
    const root = fixtureRoot()
    writeJournal(root, 'studio', {
      '2026-08-01-session-24.md': '# Session 24 — 2026-08-01\n\nthe first claimant\n',
      '2026-08-31-session-24.md': '# Session 24 — 2026-08-31\n\nthe later one\n',
    })
    const notes = loadSessionNotes('studio', '2026-08-30', root)
    expect(notes).toHaveLength(1)
    // the suffix is the day FILE's own stem, which is what buildDayIndex hands out
    expect(notes[0]!.anchor).toBe('cs-24-2026-08-31-session-24')
  })

  it('reads the Atelier’s register the way ITS route does — s-numbers and note slugs', () => {
    const root = fixtureRoot()
    writeJournal(root, 'atelier', {
      '2026-08-29.md': '# An older night\n\nbefore\n',
      '2026-08-31-blind-search.md': '# Blind search — 2026-08-31\n\nthe reach-outside session\n',
    })
    const notes = loadSessionNotes('atelier', '2026-08-30', root)
    expect(notes).toHaveLength(1)
    expect(notes[0]!.href).toBe('/atelier/journal/note-blind-search/')
    expect(notes[0]!.title).toBe('Blind search — 2026-08-31')
  })

  it('strips frontmatter before splitting — otherwise the H1 is not the first line', () => {
    const root = fixtureRoot()
    writeJournal(root, 'atelier', {
      '2026-08-31-with-frontmatter.md':
        '---\ndate: 2026-08-31\nkind: journal\n---\n\n# The report checks out\n\nbody\n',
    })
    const notes = loadSessionNotes('atelier', '2026-08-30', root)
    expect(notes[0]!.title).toBe('The report checks out')
  })

  it('reads this repository’s running cycle, and every note points at a page this site builds', () => {
    const cycle = loadCycle()
    for (const practice of PRACTICES) {
      const notes = loadSessionNotes(practice, cycle.opened)
      expect(notes.length).toBeGreaterThan(0)
      for (const n of notes) {
        expect(n.date >= cycle.opened).toBe(true)
        expect(n.href.startsWith(`/${practice}/journal/`)).toBe(true)
        expect(fs.existsSync(path.join(process.cwd(), n.source))).toBe(true)
      }
    }
  })
})

describe('loadLetters', () => {
  const ledger = [
    { id: '2026-08-old', practice: 'studio', piece: 'An older packet', receiver: 'r', status: 'prepared', as_of: '2026-08-15' },
    { id: '2026-09-new', practice: 'plenum', piece: 'A packet lying open', receiver: 'r', status: 'prepared', as_of: '2026-08-31' },
    { practice: 'field', piece: 'no id', as_of: '2026-09-01' },
  ]

  function writeLedger(root: string): void {
    fs.mkdirSync(path.join(root, 'src/data/post'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/data/post/ledger.json'), JSON.stringify(ledger))
  }

  it('finds nothing where the post office keeps no ledger', () => {
    expect(loadLetters('2026-08-30', fixtureRoot())).toEqual([])
  })

  it('takes the letters of this cycle only, and skips an entry it cannot identify', () => {
    const root = fixtureRoot()
    writeLedger(root)
    const letters = loadLetters('2026-08-30', root)
    expect(letters.map((l) => l.id)).toEqual(['2026-09-new'])
    expect(letters[0]!.practice).toBe('plenum')
    expect(letters[0]!.href).toBe('/post/')
    expect(letters[0]!.source).toBe('src/data/post/ledger.json')
  })

  it('reads the committed ledger of this repository without throwing', () => {
    expect(() => loadLetters('2000-01-01')).not.toThrow()
    expect(loadLetters('2000-01-01').length).toBeGreaterThan(0)
  })
})

describe('loadEncounters', () => {
  function writeRegister(root: string, entries: unknown): void {
    fs.mkdirSync(path.join(root, 'src/data/begegnungen'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/data/begegnungen/register.json'), JSON.stringify(entries))
  }

  it('finds nothing where the register is absent', () => {
    expect(loadEncounters('2026-08-30', fixtureRoot())).toEqual([])
  })

  it('dates an encounter by the premiere the register observed, and leaves the unobserved out', () => {
    const root = fixtureRoot()
    writeRegister(root, [
      { encounter_id: 'enc-a', title: 'An older crossing', observed: { premiered_on: '2026-07-13' } },
      { encounter_id: 'enc-b', title: 'The measurement travels', observed: { premiered_on: '2026-08-31' } },
      { encounter_id: 'enc-c', title: 'Not premiered yet', observed: {} },
    ])
    const found = loadEncounters('2026-08-30', root)
    expect(found.map((e) => e.id)).toEqual(['enc-b'])
    expect(found[0]!.href).toBe('/encounters/register/')
  })

  it('reads the committed register of this repository without throwing', () => {
    expect(() => loadEncounters('2000-01-01')).not.toThrow()
    expect(loadEncounters('2000-01-01').length).toBeGreaterThan(0)
  })
})

describe('loadPresentations — the day a presentation names', () => {
  it('takes the last day its own summary names, and stays undated where it names none', () => {
    const root = fixtureRoot()
    const dated = path.join(root, 'public/field/presentations/cycle-001')
    const undated = path.join(root, 'public/studio/presentations/cycle-001')
    fs.mkdirSync(dated, { recursive: true })
    fs.mkdirSync(undated, { recursive: true })
    fs.writeFileSync(path.join(dated, 'index.html'), '<title>The handover — The Field, cycle 001</title>')
    fs.writeFileSync(
      path.join(dated, 'SUMMARY.md'),
      '# The handover\n\n*The Field, cycle 001. Five sessions, 2026-08-30 to 2026-09-01.*\n',
    )
    fs.writeFileSync(path.join(undated, 'index.html'), '<title>A work — The Studio, cycle 001</title>')
    fs.writeFileSync(path.join(undated, 'SUMMARY.md'), '# A work\n\nNo day named here.\n')
    const found = loadPresentations(root)
    expect(found.find((p) => p.practice === 'field')?.date).toBe('2026-09-01')
    expect(found.find((p) => p.practice === 'field')?.title).toBe('The handover')
    expect(found.find((p) => p.practice === 'studio')?.date).toBeNull()
  })
})

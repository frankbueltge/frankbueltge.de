import { describe, it, expect } from 'vitest'
import { checkSitePrPath, classifySitePr, parsePrMd } from './sitepr'

describe('checkSitePrPath', () => {
  it('erlaubt Code unter src/', () => {
    expect(checkSitePrPath('src/lib/atelier/sheet.ts')).toBeNull()
    expect(checkSitePrPath('src/lib/atelier/sheet.test.ts')).toBeNull()
    expect(checkSitePrPath('src/pages/atelier/karte.astro')).toBeNull()
    expect(checkSitePrPath('src/components/atelier/Insel.astro')).toBeNull()
    expect(checkSitePrPath('src/data/atelier/notiz.md')).toBeNull()
  })
  it('lehnt alles außerhalb von src/ ab (Workflows, Pipelines, Configs)', () => {
    expect(checkSitePrPath('.github/workflows/deploy-cf.yml')).toMatch(/versteckte/)
    expect(checkSitePrPath('github/workflows/evil.js')).toMatch(/außerhalb von src\//)
    expect(checkSitePrPath('package.json')).toMatch(/außerhalb von src\//)
    expect(checkSitePrPath('pipelines/protokoll/main.js')).toMatch(/außerhalb von src\//)
    expect(checkSitePrPath('functions/api/zentrale/index.ts')).toMatch(/außerhalb von src\//)
    expect(checkSitePrPath('astro.config.mjs')).toMatch(/außerhalb von src\//)
  })
  it('schützt das unantastbare Protokoll-Archiv', () => {
    expect(checkSitePrPath('src/content/protokoll/2026/2026-07-01.json')).toMatch(/unantastbar/)
  })
  it('lehnt Pfad-Traversal und absolute Pfade ab', () => {
    expect(checkSitePrPath('src/../package.json')).toMatch(/Traversal/)
    expect(checkSitePrPath('src/lib/../../.github/x.yml')).toMatch(/Traversal/)
    expect(checkSitePrPath('/etc/passwd')).toMatch(/absoluter Pfad/)
    expect(checkSitePrPath('src\\lib\\x.ts')).toMatch(/Backslash/)
    expect(checkSitePrPath('src//lib/x.ts')).toMatch(/Traversal/)
  })
  it('lehnt versteckte Dateien und fremde Dateitypen ab', () => {
    expect(checkSitePrPath('src/lib/.env')).toMatch(/versteckte/)
    expect(checkSitePrPath('src/lib/atelier/run.sh')).toMatch(/Dateityp/)
    expect(checkSitePrPath('src/lib/atelier/bild.exe')).toMatch(/Dateityp/)
  })
})

describe('parsePrMd', () => {
  it('liest Titel aus der ersten Überschrift, Rest wird Body', () => {
    expect(parsePrMd('# Insel im Rhizom\n\nWarum:\nweil.')).toEqual({
      title: 'Insel im Rhizom',
      body: 'Warum:\nweil.',
    })
  })
  it('ohne Überschrift: kein Titel, alles Body', () => {
    expect(parsePrMd('nur text')).toEqual({ title: null, body: 'nur text' })
  })
})

describe('classifySitePr', () => {
  const prMd = '# Insel\n\nBegründung.'
  it('akzeptiert einen sauberen Vorschlag und mappt die Pfade', () => {
    const r = classifySitePr('insel-swerve', prMd, ['src/lib/atelier/sheet.ts', 'src/lib/atelier/sheet.test.ts'])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.title).toBe('Insel')
      expect(r.body).toBe('Begründung.')
      expect(r.files).toEqual([
        { from: 'site-prs/insel-swerve/files/src/lib/atelier/sheet.ts', to: 'src/lib/atelier/sheet.ts' },
        { from: 'site-prs/insel-swerve/files/src/lib/atelier/sheet.test.ts', to: 'src/lib/atelier/sheet.test.ts' },
      ])
    }
  })
  it('fällt ohne Überschrift auf den Slug als Titel zurück', () => {
    const r = classifySitePr('insel', 'nur begründung', ['src/lib/atelier/sheet.ts'])
    expect(r.ok && r.title).toBe('insel')
  })
  it('all-or-nothing: EIN unerlaubter Pfad lehnt den ganzen Slug ab', () => {
    const r = classifySitePr('mix', prMd, ['src/lib/atelier/sheet.ts', 'package.json'])
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reasons).toHaveLength(1)
      expect(r.reasons[0]).toMatch(/package\.json/)
    }
  })
  it('lehnt ohne PR.md, ohne Dateien und mit ungültigem Slug ab', () => {
    expect(classifySitePr('x', null, ['src/a.ts']).ok).toBe(false)
    expect(classifySitePr('x', prMd, []).ok).toBe(false)
    expect(classifySitePr('Böser Slug', prMd, ['src/a.ts']).ok).toBe(false)
    expect(classifySitePr('-fuehrt', prMd, ['src/a.ts']).ok).toBe(false)
  })
  it('lehnt mehr als 50 Dateien ab', () => {
    const many = Array.from({ length: 51 }, (_, i) => `src/lib/atelier/f${i}.ts`)
    const r = classifySitePr('viel', prMd, many)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons[0]).toMatch(/mehr als 50/)
  })
})

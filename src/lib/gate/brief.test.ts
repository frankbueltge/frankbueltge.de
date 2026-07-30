// src/lib/gate/brief.test.ts
import { describe, it, expect } from 'vitest'
import { fehlerzeilen, betrifftEigeneDateien, befund, baueBrief, ohneAnsi } from './brief'

// Echter Auszug aus field-feedback/2026-07-30.md — genau der Brief, über den Ulysses und
// Studio sich beschwert haben: nur Warnungen aus Base.astro, der eigentliche Fehler fehlt.
const NUR_WARNUNGEN = `
src/layouts/Base.astro:122:24 - warning astro(4000): This script will be treated as if it has the \`is:inline\` directive.

Add the \`is:inline\` directive explicitly to silence this hint.

122     {workLd && <script type="application/ld+json" set:html={JSON.stringify(workLd)} />}
`

// Der Lauf vom 2026-07-30, der field wirklich rot gemacht hat.
const ECHTER_FEHLER = `
src/pages/index.astro:4:1 - warning ts(6133): 'x' is declared but its value is never read.

src/components/field/werke/2026-07-26-one-line-for-ten-thousand/index.astro:208:372 - error ts(2304): Cannot find name 'v'.

208     const rows = data.map(([k, v]) => k + v)
        ~~~~
Result (429 files):
- 1 error
`

describe('ohneAnsi', () => {
  it('entfernt Farbcodes, damit der Brief lesbar ist', () => {
    expect(ohneAnsi('\u001b[96msrc/x.astro\u001b[0m:\u001b[93m12\u001b[0m')).toBe('src/x.astro:12')
  })
})

describe('fehlerzeilen', () => {
  it('zitiert die Fehlerzeile samt Codeausschnitt', () => {
    const zeilen = fehlerzeilen(ECHTER_FEHLER)
    expect(zeilen.join('\n')).toContain("error ts(2304): Cannot find name 'v'.")
    expect(zeilen.join('\n')).toContain('const rows = data.map')
  })

  it('nimmt Warnungen und Hinweise NICHT auf — sie waren der ganze Defekt', () => {
    expect(fehlerzeilen(NUR_WARNUNGEN)).toEqual([])
    expect(fehlerzeilen(ECHTER_FEHLER).join('\n')).not.toContain('ts(6133)')
  })

  it('erkennt auch vitest-Fehlschläge', () => {
    const log = 'AssertionError: expected 45 to be 46 // Object.is equality\n  at foo.test.ts:12'
    expect(fehlerzeilen(log)[0]).toContain('AssertionError')
  })

  it('deckelt die Länge, damit ein kaputter Lauf keine Textwand schickt', () => {
    const viele = Array.from({ length: 200 }, (_, i) => `src/a.astro:${i}:1 - error ts(1): boom`).join('\n')
    expect(fehlerzeilen(viele).length).toBeLessThanOrEqual(40)
  })
})

describe('betrifftEigeneDateien', () => {
  it('erkennt Pfade des eigenen Namensraums', () => {
    expect(betrifftEigeneDateien(fehlerzeilen(ECHTER_FEHLER), 'field')).toBe(true)
  })

  it('fremde Pfade zählen nicht — auch nicht bei ähnlichem Namen', () => {
    expect(betrifftEigeneDateien(fehlerzeilen(ECHTER_FEHLER), 'studio')).toBe(false)
    expect(betrifftEigeneDateien(['src/layouts/Base.astro:1:1 - error ts(1): x'], 'field')).toBe(false)
  })
})

describe('befund', () => {
  it('eigene Datei kaputt → own', () => {
    expect(befund(ECHTER_FEHLER, 'field')).toBe('own')
  })

  it('dieselbe Lage aus Sicht einer anderen Praxis → foreign', () => {
    expect(befund(ECHTER_FEHLER, 'atelier')).toBe('foreign')
  })

  it('kein Log → unjudged (der Fall, der bisher „see workflow run“ hieß)', () => {
    expect(befund(null, 'atelier')).toBe('unjudged')
    expect(befund('   ', 'atelier')).toBe('unjudged')
  })

  it('Log ohne erkennbaren Fehler → foreign, nicht own: niemand wird auf Verdacht beschuldigt', () => {
    expect(befund(NUR_WARNUNGEN, 'field')).toBe('foreign')
  })
})

describe('baueBrief', () => {
  const runUrl = 'https://github.com/frankbueltge/frankbueltge.de/actions/runs/123'

  it('own: fordert zur Korrektur auf UND zitiert den Fehler', () => {
    const brief = baueBrief({ ns: 'field', log: ECHTER_FEHLER, runUrl, date: '2026-07-30' })
    expect(brief).toContain('# Build feedback 2026-07-30')
    expect(brief).toContain('the failing files are yours')
    expect(brief).toContain("Cannot find name 'v'.")
    expect(brief).toContain(runUrl)
  })

  it('foreign: sagt ausdrücklich, dass nichts zu korrigieren ist', () => {
    const brief = baueBrief({ ns: 'atelier', log: ECHTER_FEHLER, runUrl, date: '2026-07-30' })
    expect(brief).toContain('not on files in your namespace')
    expect(brief).toContain('Nothing on your side needs correcting')
    expect(brief).not.toContain('the failing files are yours')
  })

  it('unjudged: keine Fehlbeschuldigung, und der Lauf ist trotzdem verlinkt', () => {
    const brief = baueBrief({ ns: 'atelier', log: null, runUrl, date: '2026-07-30' })
    expect(brief).toContain('BEFORE your contribution was validated')
    expect(brief).toContain('nothing on your side to correct')
    expect(brief).toContain(runUrl)
    expect(brief).not.toContain('see workflow run')
  })

  it('der Lauf steht IMMER drin — das war Ulysses’ Mindestforderung', () => {
    for (const log of [ECHTER_FEHLER, NUR_WARNUNGEN, null]) {
      expect(baueBrief({ ns: 'field', log, runUrl, date: '2026-07-30' })).toContain(runUrl)
    }
  })
})

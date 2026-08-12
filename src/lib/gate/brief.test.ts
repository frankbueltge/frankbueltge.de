// src/lib/gate/brief.test.ts
import { describe, it, expect } from 'vitest'
import { fehlerzeilen, betrifftEigeneDateien, befund, baueBrief, ohneAnsi } from './brief'

// A real excerpt from field-feedback/2026-07-30.md — exactly the letter Ulysses and Studio
// complained about: only warnings from Base.astro, the actual error missing.
const NUR_WARNUNGEN = `
src/layouts/Base.astro:122:24 - warning astro(4000): This script will be treated as if it has the \`is:inline\` directive.

Add the \`is:inline\` directive explicitly to silence this hint.

122     {workLd && <script type="application/ld+json" set:html={JSON.stringify(workLd)} />}
`

// The 2026-07-30 run that actually turned field red.
const ECHTER_FEHLER = `
src/pages/index.astro:4:1 - warning ts(6133): 'x' is declared but its value is never read.

src/components/field/werke/2026-07-26-one-line-for-ten-thousand/index.astro:208:372 - error ts(2304): Cannot find name 'v'.

208     const rows = data.map(([k, v]) => k + v)
        ~~~~
Result (429 files):
- 1 error
`

// The failure that made "not on files in your namespace" wrong four times (field-research
// REQUESTS.md 2026-07-31, sessions 74/75): the file belongs to THIS repository, while the
// assertion judges the practice's register. Either attribution would be a guess.
const UPSTREAM_URSACHE_SITE_PFAD = `
 FAIL  src/lib/field/chronicle.test.ts > chronicle.curated.json > every served anchor resolves against the real synced journals
AssertionError: expected 82 to be 83 // Object.is equality
  at src/lib/field/chronicle.test.ts:51:31
`

// The 2026-08-02 atelier case, verbatim from atelier-feedback/2026-08-02.md: FOUR letters said
// "the failing files are yours" while both failing files were this repository's tests. The
// classifier matched \`src/content/atelier/\` inside the QUOTED SOURCE of dossier.test.ts — a
// context line, kept only to show the code — and read the excerpt as evidence of ownership.
// A quoted line is not a failing file.
const SITE_TEST_ZITIERT_PRAXIS_PFAD = `
 FAIL  src/lib/atelier/dossier.test.ts [ src/lib/atelier/dossier.test.ts ]
Error: EISDIR: illegal operation on a directory, read
 ❯ realInput src/lib/atelier/dossier.test.ts:49:19
     47|       const key = \`/src/content/atelier/projects/\${dir}/\${name}\`
`

describe('ohneAnsi', () => {
  it('strips colour codes so the letter stays readable', () => {
    expect(ohneAnsi('\u001b[96msrc/x.astro\u001b[0m:\u001b[93m12\u001b[0m')).toBe('src/x.astro:12')
  })
})

describe('fehlerzeilen', () => {
  it('quotes the error line together with its code excerpt', () => {
    const zeilen = fehlerzeilen(ECHTER_FEHLER)
    expect(zeilen.join('\n')).toContain("error ts(2304): Cannot find name 'v'.")
    expect(zeilen.join('\n')).toContain('const rows = data.map')
  })

  it('does NOT pick up warnings and hints — they were the whole defect', () => {
    expect(fehlerzeilen(NUR_WARNUNGEN)).toEqual([])
    expect(fehlerzeilen(ECHTER_FEHLER).join('\n')).not.toContain('ts(6133)')
  })

  it('recognises vitest failures too', () => {
    const log = 'AssertionError: expected 45 to be 46 // Object.is equality\n  at foo.test.ts:12'
    expect(fehlerzeilen(log)[0]).toContain('AssertionError')
  })

  it('caps the length so a broken run cannot send a wall of text', () => {
    const viele = Array.from({ length: 200 }, (_, i) => `src/a.astro:${i}:1 - error ts(1): boom`).join('\n')
    expect(fehlerzeilen(viele).length).toBeLessThanOrEqual(40)
  })
})

describe('betrifftEigeneDateien', () => {
  it('recognises paths of its own namespace', () => {
    expect(betrifftEigeneDateien(fehlerzeilen(ECHTER_FEHLER), 'field')).toBe(true)
  })

  it('other namespaces do not count — not even on a similar name', () => {
    expect(betrifftEigeneDateien(fehlerzeilen(ECHTER_FEHLER), 'studio')).toBe(false)
    expect(betrifftEigeneDateien(['src/layouts/Base.astro:1:1 - error ts(1): x'], 'field')).toBe(false)
  })

  it('a practice path inside a quoted code excerpt is not evidence of ownership', () => {
    expect(betrifftEigeneDateien(fehlerzeilen(SITE_TEST_ZITIERT_PRAXIS_PFAD), 'atelier')).toBe(false)
  })
})

describe('befund', () => {
  it('own file broken → own', () => {
    expect(befund(ECHTER_FEHLER, 'field')).toBe('own')
  })

  it('the same situation seen by another practice → unattributed, not "site territory"', () => {
    expect(befund(ECHTER_FEHLER, 'atelier')).toBe('unattributed')
  })

  it('no log → unjudged (the case that used to read "see workflow run")', () => {
    expect(befund(null, 'atelier')).toBe('unjudged')
    expect(befund('   ', 'atelier')).toBe('unjudged')
  })

  it('log without a recognisable error → unattributed: nobody is accused on suspicion, the site neither', () => {
    expect(befund(NUR_WARNUNGEN, 'field')).toBe('unattributed')
  })

  it('site path with an upstream cause → unattributed (July\u2019s four misattributions)', () => {
    expect(befund(UPSTREAM_URSACHE_SITE_PFAD, 'field')).toBe('unattributed')
  })

  it('site test quoting a practice path → unattributed (August’s four misattributions)', () => {
    expect(befund(SITE_TEST_ZITIERT_PRAXIS_PFAD, 'atelier')).toBe('unattributed')
  })
})

describe('baueBrief', () => {
  const runUrl = 'https://github.com/frankbueltge/frankbueltge.de/actions/runs/123'

  it('own: asks for a correction AND quotes the error', () => {
    const brief = baueBrief({ ns: 'field', log: ECHTER_FEHLER, runUrl, date: '2026-07-30' })
    expect(brief).toContain('# Build feedback 2026-07-30')
    expect(brief).toContain('the failing files are yours')
    expect(brief).toContain("Cannot find name 'v'.")
    expect(brief).toContain(runUrl)
  })

  it('unattributed: quotes the error and passes no verdict on ownership', () => {
    const brief = baueBrief({ ns: 'atelier', log: ECHTER_FEHLER, runUrl, date: '2026-07-30' })
    expect(brief).toContain('does not say whose defect it is')
    expect(brief).toContain("Cannot find name 'v'.")
    expect(brief).not.toContain('the failing files are yours')
  })

  it('unjudged: no false accusation, and the run is linked anyway', () => {
    const brief = baueBrief({ ns: 'atelier', log: null, runUrl, date: '2026-07-30' })
    expect(brief).toContain('BEFORE your contribution was validated')
    expect(brief).toContain('nothing on your side to correct')
    expect(brief).toContain(runUrl)
    expect(brief).not.toContain('see workflow run')
  })

  // The channel's most expensive sentence: the practice believed it, concluded the fault was
  // site-side, and the ecology went three days without deploying. It must never appear again.
  it('no letter ever claims "site-side fault" or "nothing on your side" again', () => {
    for (const ns of ['field', 'studio', 'atelier', 'plenum']) {
      for (const log of [ECHTER_FEHLER, NUR_WARNUNGEN, UPSTREAM_URSACHE_SITE_PFAD]) {
        const brief = baueBrief({ ns, log, runUrl, date: '2026-07-31' })
        expect(brief).not.toContain('site-side fault')
        expect(brief).not.toContain('Nothing on your side needs correcting')
        expect(brief).not.toContain('not on files in your namespace')
      }
    }
  })

  it("Meridian's case: this repo's test, red on their data — evidence yes, verdict no", () => {
    const brief = baueBrief({ ns: 'field', log: UPSTREAM_URSACHE_SITE_PFAD, runUrl, date: '2026-07-31' })
    expect(brief).toContain('expected 82 to be 83')
    expect(brief).toContain('read it and judge')
    expect(brief).not.toContain('the failing files are yours')
  })

  it("Ulysses' case: this repo's test quoting her paths — the excerpt is quoted, not convicted", () => {
    const brief = baueBrief({ ns: 'atelier', log: SITE_TEST_ZITIERT_PRAXIS_PFAD, runUrl, date: '2026-08-02' })
    expect(brief).toContain('EISDIR')
    expect(brief).not.toContain('the failing files are yours')
  })

  it('the run is ALWAYS in there — that was Ulysses\u2019 minimum demand', () => {
    for (const log of [ECHTER_FEHLER, NUR_WARNUNGEN, null]) {
      expect(baueBrief({ ns: 'field', log, runUrl, date: '2026-07-30' })).toContain(runUrl)
    }
  })
})

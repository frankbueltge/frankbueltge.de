import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import allowlist from './private-quote-allowlist.json'
import { SCANNED_ROOTS, SCANNED_ROOT_FILES, scanFile, scanRecord } from './private-quotes'

const cleared = new Set((allowlist.cleared as { quote: string }[]).map((entry) => entry.quote))

// Every sentence below is invented for the test. None of them is, or paraphrases, anything
// Frank wrote — a fixture that reproduced a real quotation would be the leak it tests for.

describe('the private-quote guard detects what an eye keeps missing', () => {
  it('flags a quotation attributed to Frank', () => {
    const found = scanFile('x.md', 'Decided (Frank, 2026-01-01): "this is his own sentence".')
    expect(found).toHaveLength(1)
    expect(found[0].quote).toBe('"this is his own sentence"')
  })

  it('flags the German quotation form the same way', () => {
    expect(scanFile('x.md', 'Frank, abends: „das ist sein eigener satz".')).toHaveLength(1)
  })

  it('does not mistake Frankreich or Frankrike for the man', () => {
    // France, in German and Swedish. The unbounded token produced twelve false findings in an
    // untouchable TED procurement archive, where a country name precedes a quoted notice title.
    expect(scanFile('x.json', '"country": "Frankreich", "title": "a quoted notice title"')).toHaveLength(0)
    expect(scanFile('x.json', '"land": "Frankrike", "titel": "en offentlig upphandling"')).toHaveLength(0)
    expect(scanFile('x.md', 'Frankfurt, and then "a sentence of some length here".')).toHaveLength(0)
  })

  it('still reads the German genitive as attribution', () => {
    expect(scanFile('x.md', 'Franks Anweisung: „das ist sein eigener satz".')).toHaveLength(1)
  })

  it('ignores the full name in both spellings — authorship and branding are not speech', () => {
    expect(scanFile('x.astro', '<Page title="Apparatus | Frank Bültge" />')).toHaveLength(0)
    expect(scanFile('x.md', '© 2026 Frank Bültge · "a federated research ecology"')).toHaveLength(0)
    // The legal page's address block, in the transliterated spelling: ten string literals the
    // single-quote form would otherwise have read as quotations.
    expect(scanFile('x.ts', "paragraphs: ['Frank Bueltge', 'c/o an invented street 12', 'Some Town'],")).toHaveLength(0)
  })

  it('ignores markup attributes', () => {
    expect(scanFile('x.astro', '// Frank, 2026-01-01\n<Base description="Page not found">')).toHaveLength(0)
  })

  it('flags the guillemet forms — the one that walked past the first version, and its German twin', () => {
    expect(scanFile('x.md', 'Frank, 2026-07-04: «das ist sein eigener satz».')).toHaveLength(1)
    expect(scanFile('x.md', 'Frank, 2026-07-04: »das ist sein eigener satz«.')).toHaveLength(1)
  })

  it('flags typographic closers, including the mismatched „…“ pair actually found in the repo', () => {
    expect(scanFile('x.ts', '// (Frank, 2026-07-31: „passiert gar nichts“)')).toHaveLength(1)
    expect(scanFile('x.md', 'Frank, morgens: “a quoted sentence”.')).toHaveLength(1)
  })

  it('flags the single-quote forms', () => {
    expect(scanFile('x.yml', "# every 2h (Frank: 'this is his own sentence'): nothing else")).toHaveLength(1)
    expect(scanFile('x.md', 'Frank, abends: ‚das ist sein eigener satz‘.')).toHaveLength(1)
    expect(scanFile('x.md', 'Frank, in the evening: ‘a quoted sentence of his’.')).toHaveLength(1)
  })

  it('does not read an apostrophe or a bare string literal as a quotation', () => {
    // Apostrophes after a letter or a backtick never open a quotation …
    expect(scanFile('x.md', "Frank's call and the `/page`'s heading, then the practice's own 'x'")).toHaveLength(0)
    // … and a single-quoted term or path beside a comment that names him is code, not speech.
    expect(scanFile('x.ts', "{ what: 'Frank’s approval until v6', ref: 'src/lib/some/file.ts' },")).toHaveLength(0)
    expect(scanFile('x.md', "tier: 'instrument' in the register (Frank's instruction)")).toHaveLength(0)
  })

  it('ignores a quotation too far from the name to read as attributed', () => {
    const far = `Frank decided this${' filler word'.repeat(20)} and elsewhere "an unrelated quote".`
    expect(scanFile('x.md', far)).toHaveLength(0)
  })

  it('ignores a bare term — a quoted fragment must be long enough to be speech', () => {
    expect(scanFile('x.md', 'Frank chose "abc".')).toHaveLength(0)
  })

  it('reports file, line, shape and readable context so a failure can be acted on', () => {
    const [finding] = scanFile('docs/x.md', 'line one\nFrank said "a full sentence here".')
    expect(finding).toMatchObject({ file: 'docs/x.md', line: 2, form: 'line' })
    expect(finding.context).toContain('Frank said')
  })
})

describe('the line break — two narrow shapes, closed on 2026-10-05', () => {
  it('follows a quotation that opens beside the name and closes on a continued line (a SPAN)', () => {
    const comment = '// Why (Frank, 2026-07-30): „das ist sein eigener satz, der hier\n// über zwei zeilen läuft".'
    const [finding] = scanFile('x.ts', comment)
    expect(finding).toMatchObject({ line: 1, form: 'span' })
    expect(finding.quote).toBe('„das ist sein eigener satz, der hier über zwei zeilen läuft"')
  })

  it('follows a span through docstrings, CSS comments and JSX comments alike', () => {
    expect(scanFile('x.py', 'Frank, 2026-07-28: „das ist sein eigener\nsatz, im docstring".')).toHaveLength(1)
    expect(scanFile('x.css', ' * Frank, 2026-08-01: "this is his own\n * sentence in a stylesheet."')).toHaveLength(1)
    expect(scanFile('x.astro', '{/* (Frank, 2026-08-02: "this is his own\n    sentence in markup") */}')).toHaveLength(1)
  })

  it('reads the NEXT LINE when the attribution line hands over', () => {
    const [finding] = scanFile('x.ts', '// Why (Frank, 2026-07-30):\n// „das ist sein eigener satz"')
    expect(finding).toMatchObject({ line: 2, form: 'next-line' })
  })

  it('still ignores a heading that merely stands under a mention of the name', () => {
    expect(scanFile('x.md', 'Approved by Frank on the morning of 2026-07-12.\n„A Work Title Of Some Length"')).toHaveLength(0)
    expect(scanFile('x.md', 'Frank, 2026-07-12.\n\n„das ist sein eigener satz"')).toHaveLength(0)
  })

  it('never crosses a blank line or runs past three continued lines', () => {
    expect(scanFile('x.md', 'Frank: "this is his own sentence\n\nthat a blank line ended"')).toHaveLength(0)
    const long = 'Frank: "one\ntwo\nthree\nfour\nfive closes here"'
    expect(scanFile('x.md', long)).toHaveLength(0)
  })

  it('demands three words across a line break — a wrapped label is a term', () => {
    expect(scanFile('x.ts', '/** (Frank, 2026-08-09): the hero was on „two\n *  houses" until then */')).toHaveLength(0)
  })

  it('does not take the mark that CLOSES a quotation from the line above for one that opens', () => {
    // The closing mark on line 2 follows the name; read alone, that line seems to open a
    // quotation that runs on to the next quoted title.
    const text = 'the closing note ("the practice waits until\nthe queue thins out or Frank signals") stands.\nNext: "A Work Title Here" moves on.'
    expect(scanFile('x.md', text)).toHaveLength(0)
  })

  it('takes a speech pronoun as the name only where the name is in reach', () => {
    const near = '// (Frank, 2026-07-30): the first version showed numbers,\n// and his objection landed: "this is his own sentence".'
    expect(scanFile('x.ts', near)).toHaveLength(1)
    const mersch = 'Everyone cites his objection: "a sentence from a published paper".'
    expect(scanFile('x.md', mersch)).toHaveLength(0)
  })

  it('does NOT see the parenthetical form — the gap is known, re-measured, not fixed', () => {
    // ("…", Frank, morning session). Documented in private-quotes.ts: reading backwards is
    // indistinguishable from naming a label — "Experiments" (Frank, 2026-07-31) — and the
    // re-measurement of 2026-10-05 found ten such findings and no speech among them. This test
    // exists so the gap is a stated property of the guard rather than a surprise to whoever
    // trusts it.
    expect(scanFile('x.md', 'Wordings approved ("ein erfundener satz", Frank, morgens).')).toHaveLength(0)
  })
})

describe('the scope — every place the 2026-10-05 pass found residues the guard could not see', () => {
  const root = mkdtempSync(join(tmpdir(), 'private-quotes-'))
  afterAll(() => rmSync(root, { recursive: true, force: true }))
  const plant = (path: string, text: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const line = 'Frank, 2026-01-01: "this is his own sentence".\n'

  it('reads the roots and file kinds the house writes, and nothing it only mirrors or archives', () => {
    for (const path of ['a.css', 'b.mjs', 'c.py', 'd.sh', 'e.txt', '_redirects', '_headers', 'f.yml', 'g.astro']) plant(path, line)
    // Not the house's prose: archive JSON, and the channel documents of the standing exception.
    for (const path of ['h.json', 'REQUESTS.md', 'REQUESTS-ARCHIVE.md']) plant(path, line)
    // A generated copy of a pipeline package.
    plant('build/lib/i.py', line)

    const files = scanRecord([root], []).map((finding) => finding.file.slice(root.length + 1))
    expect(files.sort()).toEqual(['_headers', '_redirects', 'a.css', 'b.mjs', 'c.py', 'd.sh', 'e.txt', 'f.yml', 'g.astro'])
  })

  it('walks the roots where the residues were found', () => {
    for (const where of ['pipelines', 'public', 'functions', '.claude', 'scripts', '.github']) {
      expect(SCANNED_ROOTS).toContain(where)
    }
    expect(SCANNED_ROOT_FILES).toContain('CLAUDE.md')
  })
})

// 30s instead of the 5s default, for both scanning tests: one pass over the whole record takes
// several seconds in isolation and more under full-suite parallel load (the roots were widened on
// 2026-10-05). A flaky timeout here would read as a privacy violation that is not there — and it
// blocks the practices' nightly publishing gates.
const SCAN_TIMEOUT = { timeout: 30_000 }

describe('the published record carries no verbatim quotation from Frank', () => {
  it('has none outside the allowlist', SCAN_TIMEOUT, () => {
    // file:line ONLY, never the text. On 2026-08-15 this failure printed the quotation, the
    // integrate workflow pasted the validation log verbatim into the engine repos' feedback
    // letters, and those letters were committed — so enforcing the rule manufactured two fresh
    // violations of it, in `plenum-feedback` and `atelier-feedback`. A guard that reproduces
    // what it forbids, into files that travel, is a leak with a test around it.
    const offending = scanRecord()
      .filter((finding) => !cleared.has(finding.quote))
      .map((finding) => `${finding.file}:${finding.line} (${finding.form}; text withheld — open the file)`)

    // Standing rule (Frank, 2026-08-15, wording private): his words are paraphrased, dated
    // and neutral, never quoted. If this fails, rewrite the passage as paraphrase — clearing
    // it in private-quote-allowlist.json is only for quotations that are not his speech.
    expect(offending).toEqual([])
  })

  it('keeps the allowlist honest — every cleared entry is one the scanner still meets', SCAN_TIMEOUT, () => {
    // An allowlist that outlives its findings quietly widens the hole it was cut for.
    const live = new Set(scanRecord().map((finding) => finding.quote))
    const stale = [...cleared].filter((quote) => !live.has(quote))
    expect(stale).toEqual([])
  })
})

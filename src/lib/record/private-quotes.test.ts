import { describe, expect, it } from 'vitest'
import allowlist from './private-quote-allowlist.json'
import { scanFile, scanRecord } from './private-quotes'

const cleared = new Set((allowlist.cleared as { quote: string }[]).map((entry) => entry.quote))

describe('the private-quote guard detects what an eye keeps missing', () => {
  it('flags a quotation attributed to Frank', () => {
    const found = scanFile('x.md', 'Decided (Frank, 2026-01-01): "this is his own sentence".')
    expect(found).toHaveLength(1)
    expect(found[0].quote).toBe('"this is his own sentence"')
  })

  it('flags the German quotation form the same way', () => {
    expect(scanFile('x.md', 'Frank, abends: „das ist sein eigener satz".')).toHaveLength(1)
  })

  it('ignores the full name — authorship and branding are not speech', () => {
    expect(scanFile('x.astro', '<Page title="Apparatus | Frank Bültge" />')).toHaveLength(0)
    expect(scanFile('x.md', '© 2026 Frank Bültge · "a federated research ecology"')).toHaveLength(0)
  })

  it('ignores markup attributes', () => {
    expect(scanFile('x.astro', '// Frank, 2026-01-01\n<Base description="Page not found">')).toHaveLength(0)
  })

  it('flags the guillemet form — the one that walked past the first version', () => {
    expect(scanFile('x.md', 'Frank, 2026-07-04: «das ist sein eigener satz».')).toHaveLength(1)
  })

  it('flags typographic closers, including the mismatched „…“ pair actually found in the repo', () => {
    expect(scanFile('x.ts', '// (Frank, 2026-07-31: „passiert gar nichts“)')).toHaveLength(1)
    expect(scanFile('x.md', 'Frank, morgens: “a quoted sentence”.')).toHaveLength(1)
  })

  it('is line-local, and that is a second stated limit', () => {
    // A quotation on the line AFTER the attribution is not seen. Making the window cross
    // newlines was measured on this repo: 124 further findings, of which the large majority
    // were work titles and section headings sitting under an unrelated mention of the name.
    // The gap is covered by reading, not by the guard — see the note in private-quotes.ts.
    expect(scanFile('x.ts', '// Why (Frank, 2026-07-30):\n// „das ist sein eigener satz"')).toHaveLength(0)
  })

  it('does NOT see the parenthetical form — the gap is known, not fixed', () => {
    // ("…", Frank, morning session). Documented in private-quotes.ts: reading backwards is
    // indistinguishable from naming a label — "Experiments" (Frank, 2026-07-31) — and the
    // attempt cost twenty-five false findings for one real one. This test exists so the gap
    // is a stated property of the guard rather than a surprise to whoever trusts it.
    expect(scanFile('x.md', 'Wordings approved ("die wortlaute sind frei", Frank, morgens).')).toHaveLength(0)
  })

  it('ignores a quotation too far from the name to read as attributed', () => {
    const far = `Frank decided this${' filler word'.repeat(20)} and elsewhere "an unrelated quote".`
    expect(scanFile('x.md', far)).toHaveLength(0)
  })

  it('ignores a bare term — a quoted fragment must be long enough to be speech', () => {
    expect(scanFile('x.md', 'Frank chose "abc".')).toHaveLength(0)
  })

  it('reports file, line and readable context so a failure can be acted on', () => {
    const [finding] = scanFile('docs/x.md', 'line one\nFrank said "a full sentence here".')
    expect(finding).toMatchObject({ file: 'docs/x.md', line: 2 })
    expect(finding.context).toContain('Frank said')
  })
})

// 15s instead of the 5s default, for both scanning tests: one pass over the whole record takes
// ~6s in isolation and more under full-suite parallel load. A flaky timeout here would read as a
// privacy violation that is not there — and it blocks the practices' nightly publishing gates.
const SCAN_TIMEOUT = { timeout: 15_000 }

describe('the published record carries no verbatim quotation from Frank', () => {
  it('has none outside the allowlist', SCAN_TIMEOUT, () => {
    const offending = scanRecord()
      .filter((finding) => !cleared.has(finding.quote))
      .map((finding) => `${finding.file}:${finding.line} — ${finding.context}`)

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

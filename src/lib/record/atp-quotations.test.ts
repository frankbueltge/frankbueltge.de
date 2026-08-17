import { describe, expect, it } from 'vitest'
import { MAX_QUOTED_WORDS, scanFile, scanRecord } from './atp-quotations'

const long = (n: number): string => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')

describe('the citation ceiling on borrowed material', () => {
  it('passes a citation of the length the practice actually writes', () => {
    const text =
      'The postulate determines the procedure: "One is obliged to follow when one is in search ' +
      'of the singularities of a matter, or rather of a material, and not out to discover a ' +
      'form" (ATP 372, via KsK §4.3).'
    expect(scanFile('x.md', text)).toEqual([])
  })

  it('flags a quotation past the ceiling standing next to an ATP citation', () => {
    const text = `Reading on: "${long(MAX_QUOTED_WORDS + 5)}" (ATP 411).`
    const [finding] = scanFile('reading/x.md', text)
    expect(finding).toMatchObject({ file: 'reading/x.md', words: MAX_QUOTED_WORDS + 5 })
  })

  it('leaves a long quotation alone when no ATP citation stands near it', () => {
    // The ceiling is about one borrowed book, not about long quotation as such: the practice
    // quotes its own record, its founder's offers and its foundation at any length it likes.
    expect(scanFile('x.md', `The dowry says: "${long(MAX_QUOTED_WORDS + 40)}".`)).toEqual([])
  })

  it('measures a blockquote run, which is how a page would arrive if one ever did', () => {
    const body = long(MAX_QUOTED_WORDS + 20)
      .split(' ')
      .reduce<string[]>((lines, w, i) => {
        const row = Math.floor(i / 10)
        lines[row] = (lines[row] ?? '') + ' ' + w
        return lines
      }, [])
      .map((l) => `>${l}`)
      .join('\n')
    const [finding] = scanFile('nights/x.md', `${body}\n\n— ATP 500\n`)
    expect(finding?.words).toBeGreaterThan(MAX_QUOTED_WORDS)
  })

  it('reports file, line and the quotation opening, so a failure can be acted on', () => {
    const text = `intro\n\nthen: "${long(MAX_QUOTED_WORDS + 3)}" (ATP 12)`
    const [finding] = scanFile('a.md', text)
    expect(finding.line).toBe(3)
    expect(finding.opening.startsWith('word0 word1')).toBe(true)
  })
})

describe('the mirrored practice record stays inside the ceiling', () => {
  it('carries no over-length ATP quotation', () => {
    // Floor rule 2 as amended (n-1 DOWRY, 2026-08-16): what leaves the private material
    // repository is citation, never text. If this fails, the passage is rewritten in the
    // practice's own words with the page cited — never cleared by raising the ceiling.
    expect(scanRecord().map((f) => `${f.file}:${f.line} — ${f.words} words — ${f.opening}`)).toEqual([])
  })
})

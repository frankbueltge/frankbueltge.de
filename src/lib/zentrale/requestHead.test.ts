import { describe, expect, it } from 'vitest'
import { fallbackSummary, parseRequestHead } from './requestHead'

describe('parseRequestHead', () => {
  it('parses the four-line head with blockquote markers and bold', () => {
    const body = [
      '> **tl;dr:** the build gate letter misattributed a fault for the third time',
      '> braucht: entscheidung (fix the sentence | drop the sentence)',
      '> frist: 2026-08-28, 23:59 CEST',
      '> kontext: follows the 2026-07-30 addendum · REQUESTS.md#build-gate',
      '',
      'Long prose follows …',
    ].join('\n')
    const head = parseRequestHead(body)
    expect(head.structured).toBe(true)
    expect(head.tlDr).toBe('the build gate letter misattributed a fault for the third time')
    expect(head.braucht).toBe('entscheidung')
    expect(head.optionen).toEqual(['fix the sentence', 'drop the sentence'])
    expect(head.frist).toContain('2026-08-28')
    expect(head.fristDate).toBe('2026-08-28')
    expect(head.kontext).toContain('addendum')
  })

  it('accepts English aliases and tldr without semicolon', () => {
    const head = parseRequestHead('tldr: short one\nneeds: decision (a | b)\ndeadline: none')
    expect(head.structured).toBe(true)
    expect(head.braucht).toBe('entscheidung')
    expect(head.optionen).toEqual(['a', 'b'])
    expect(head.fristDate).toBeNull()
  })

  it('maps fyi/none/nothing to nichts and keeps options empty for non-decisions', () => {
    for (const v of ['fyi', 'none', 'nothing', 'nichts']) {
      const head = parseRequestHead(`tl;dr: x\nbraucht: ${v}`)
      expect(head.braucht).toBe('nichts')
      expect(head.optionen).toEqual([])
    }
  })

  it('is unstructured without both tl;dr and braucht', () => {
    expect(parseRequestHead('braucht: antwort\nsome prose').structured).toBe(false)
    expect(parseRequestHead('tl;dr: only a summary line').structured).toBe(false)
    expect(parseRequestHead('plain old request text with no head at all').structured).toBe(false)
  })

  it('keeps only the first occurrence of each key and scans a bounded window', () => {
    const decoy = Array.from({ length: 40 }, () => 'filler line').join('\n')
    const head = parseRequestHead(`tl;dr: first\nbraucht: antwort\ntl;dr: second\n${decoy}\nfrist: 2026-09-01`)
    expect(head.tlDr).toBe('first')
    expect(head.fristDate).toBeNull() // frist line lies beyond the scan window
  })

  it('does not treat prose colons as head keys', () => {
    const head = parseRequestHead('Observation: the gate stayed green.\nbraucht: nichts\ntl;dr: fine')
    expect(head.structured).toBe(true)
    expect(head.tlDr).toBe('fine')
  })
})

describe('fallbackSummary', () => {
  it('returns the first two sentences, markdown stripped', () => {
    const body = '## Heading\n> **First** sentence here. Second one too. Third is dropped.'
    expect(fallbackSummary(body)).toBe('First sentence here. Second one too.')
  })

  it('truncates over-long summaries with an ellipsis', () => {
    const body = `${'word '.repeat(80)}.`
    const s = fallbackSummary(body)
    expect(s.length).toBeLessThanOrEqual(240)
    expect(s.endsWith('…')).toBe(true)
  })
})

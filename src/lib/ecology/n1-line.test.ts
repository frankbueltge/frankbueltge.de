// The house states exactly two facts about its third line, both read from the committed mirror.
// A wrong reading here would not crash — it would render a plausible title or date on /atelier —
// so the parser is asserted against the real mirror AND against broken ones.
import { describe, expect, it } from 'vitest'
import { readN1Facts } from './n1-line'

describe('readN1Facts — the third line, read and never typed', () => {
  it('reads the real mirror', () => {
    const facts = readN1Facts()
    expect(facts.founded).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(facts.title.length).toBeGreaterThan(0)
    // The Dowry's H1, with the article lowered for a status row. If the practice ever renames
    // its law, this assertion goes with it — the row follows the mirror, not this test.
    expect(facts.law.startsWith('the ') || facts.law[0] === facts.law[0].toLowerCase()).toBe(true)
  })

  it('fails loudly on a mirror it cannot parse, rather than defaulting', () => {
    expect(() => readN1Facts('no heading at all', '{"title":{"text":"n-1"}}')).toThrow(/no H1/)
    expect(() => readN1Facts('# The Dowry\n\nno date here', '{"title":{"text":"n-1"}}')).toThrow(/Founded/)
    expect(() => readN1Facts('# The Dowry\n\n*Founded 2026-08-15 by…*', '{}')).toThrow(/title/)
  })

  it('follows the practice’s own window declaration for the title', () => {
    // The working title is a placeholder the practice will replace (its Dowry says so). The day
    // it declares a name, the Atelier's status row must change with the mirror — no edit here.
    const facts = readN1Facts(
      '# The Dowry\n\n*Founded 2026-08-15 by the founder.*',
      '{"title":{"text":"the found name"}}',
    )
    expect(facts.title).toBe('the found name')
    expect(facts.founded).toBe('2026-08-15')
    expect(facts.law).toBe('the Dowry')
  })
})

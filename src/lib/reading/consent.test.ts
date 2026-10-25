import { describe, expect, it } from 'vitest'
import { CONSENT_LINES, CONSENT_VERSION, consentDigest } from './consent'
import { ROUNDS } from './rounds'

/** Every consent text a reading was ever given under, by version. Add a line when the text changes —
 *  never edit a line: readings on the record carry the version they were given under. */
const GIVEN: Record<string, string> = {
  '2026-10-26': 'c91818d3',
}

describe('the consent text', () => {
  it('changes its version whenever its words change', () => {
    expect(GIVEN[CONSENT_VERSION], `the text changed: give it a new CONSENT_VERSION and add it to GIVEN`).toBe(consentDigest())
  })

  it('is the text every current round asks for', () => {
    expect(ROUNDS.at(-1)!.consent_version).toBe(CONSENT_VERSION)
  })

  it('says what is kept, what is not, where it goes, why it cannot be taken back, and who', () => {
    expect(CONSENT_LINES.map((l) => l.label)).toEqual(['What is kept', 'What is not', 'Where it goes', 'Why it cannot be taken back', 'Who'])
    const all = CONSENT_LINES.map((l) => l.text).join(' ')
    for (const word of ['CC0', '24 hours', '16 or older', 'privacy policy']) expect(all).toContain(word)
  })
})

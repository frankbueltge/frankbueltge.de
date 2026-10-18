// The line's own opening for its room: shown as written within the limit the house offered, and
// otherwise not at all.
import { describe, expect, it } from 'vitest'
import { OPENING_MAX_WORDS, paragraphsOf, readOpening, wordsIn } from './opening'

describe('the line’s opening', () => {
  it('is absent until the line writes one, and an empty file is no opening', () => {
    expect(readOpening(undefined)).toEqual({ state: 'none' })
    expect(readOpening('\n  \n<!-- a note to itself -->\n')).toEqual({ state: 'none' })
  })

  it('is shown as written: its paragraphs, without comments, heading marks or hard wraps', () => {
    const text = '<!-- written by Session 136 -->\n# How a machine practises\n\nI am a line that\nworks at night.\n\nIt asks *how*.\n'
    expect(paragraphsOf(text)).toEqual(['How a machine practises', 'I am a line that works at night.', 'It asks *how*.'])
    expect(readOpening(text)).toEqual({
      state: 'shown',
      paragraphs: ['How a machine practises', 'I am a line that works at night.', 'It asks *how*.'],
      words: 15,
    })
  })

  it('counts words as a reader does', () => {
    expect(wordsIn('One, two — three **four** 5.')).toBe(5)
  })

  it('stands at the limit and is not shown past it, never cut', () => {
    const at = Array.from({ length: OPENING_MAX_WORDS }, () => 'word').join(' ')
    expect(readOpening(at).state).toBe('shown')
    expect(readOpening(`${at} more`)).toEqual({ state: 'over', words: OPENING_MAX_WORDS + 1 })
  })
})

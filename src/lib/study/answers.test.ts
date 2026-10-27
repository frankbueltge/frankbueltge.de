import { describe, expect, it } from 'vitest'
import { checkAnswers, describeAnswer, textOf, type Answers } from './answers'
import { ANSWERS, MANIFEST } from './fixtures'

const with_ = (patch: Partial<Answers>) => ({ ...ANSWERS, ...patch })

describe('checkAnswers', () => {
  it('accepts answers of every kind, and a question left out', () => {
    expect(checkAnswers(MANIFEST, ANSWERS)).toEqual({ ok: true, value: ANSWERS })
  })

  it('treats a missing question as left out', () => {
    const { rank: _rank, ...rest } = ANSWERS
    const r = checkAnswers(MANIFEST, rest)
    expect(r.ok && r.value.rank).toBe(null)
  })

  it('refuses an answer to a question the study does not ask', () => {
    expect(checkAnswers(MANIFEST, with_({ age: 34 } as Partial<Answers>))).toEqual({ ok: false, reason: 'answers', question: 'age' })
  })

  it('refuses nothing answered at all', () => {
    expect(checkAnswers(MANIFEST, {})).toEqual({ ok: false, reason: 'answers' })
  })

  it('holds every kind to its declaration', () => {
    const bad: [string, Partial<Answers>][] = [
      ['heard', { heard: 'a hum' }],
      ['words', { words: ['loss', 'calm', 'debt'] }],
      ['words', { words: ['loss', 'loss'] }],
      ['weight', { weight: 8 }],
      ['weight', { weight: 2.5 }],
      ['guess', { guess: 140 }],
      ['urgent', { urgent: [['food', 'food', 0, 10]] }],
      ['urgent', { urgent: [['food', 'water', 0, 10], ['water', 'food', 1, 10]] }],
      ['urgent', { urgent: [['food', 'water', 3 as 0, 10]] }],
      ['urgent', { urgent: [['food', 'water', 0, 10], ['food', 'health', 0, 10], ['water', 'health', 0, 10], ['shelter', 'food', 0, 10]] }],
      ['rank', { rank: ['first'] }],
      ['note', { note: 'x'.repeat(81) }],
    ]
    for (const [question, patch] of bad) expect(checkAnswers(MANIFEST, with_(patch)), question).toEqual({ ok: false, reason: 'answers', question })
  })

  it('trims written answers', () => {
    const r = checkAnswers(MANIFEST, with_({ note: '  quiet  ' }))
    expect(r.ok && r.value.note).toBe('quiet')
  })
})

describe('textOf and describeAnswer', () => {
  it('joins the free text for the one call to the gate, or gives none', () => {
    expect(textOf(MANIFEST, ANSWERS)).toBeNull()
    expect(textOf(MANIFEST, { ...ANSWERS, note: 'hollow' })).toBe('hollow')
  })

  it('shows every answer back in words before anything is sent', () => {
    const q = (id: string) => MANIFEST.questions.find((x) => x.id === id)!
    expect(describeAnswer(q('words'), ['loss', 'debt'])).toBe('loss; debt')
    expect(describeAnswer(q('guess'), 40)).toBe('40 %')
    expect(describeAnswer(q('urgent'), ANSWERS.urgent!)).toBe('3 pairs, 1 decided')
    expect(describeAnswer(q('rank'), ['second', 'first'])).toBe('Second movement › First movement')
    expect(describeAnswer(q('note'), null)).toBe('left out')
  })
})

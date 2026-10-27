import { describe, expect, it } from 'vitest'
import { hasText, isClosed, manifestProblems, type StudyManifest } from './manifest'
import { MANIFEST } from './fixtures'

const copy = (): StudyManifest => structuredClone(MANIFEST)

describe('manifestProblems', () => {
  it('accepts a manifest with one question of every kind', () => {
    expect(manifestProblems(MANIFEST)).toEqual([])
  })

  it('refuses what is not a study/1 object, and an unknown field', () => {
    expect(manifestProblems(null)).toEqual(['not a JSON object'])
    expect(manifestProblems({ ...copy(), $contract: 'study/0' })).toContain('$contract must be "study/1"')
    expect(manifestProblems({ ...copy(), email: 'ask for it' }).join(' ')).toContain('unknown field: email')
  })

  it('needs an id, a title, a research question, a purpose and a reading', () => {
    const m = copy() as unknown as Record<string, unknown>
    for (const k of ['id', 'title', 'question', 'purpose', 'reading']) delete m[k]
    const problems = manifestProblems(m).join(' | ')
    for (const word of ['id', 'title', 'question', 'purpose', 'reading']) expect(problems).toContain(word)
  })

  it('refuses a question kind that does not exist, a repeated id, and too many questions', () => {
    const odd = copy()
    ;(odd.questions[0] as unknown as { kind: string }).kind = 'email'
    expect(manifestProblems(odd).join(' ')).toContain('kind must be one of')
    const twice = copy()
    twice.questions[1]!.id = twice.questions[0]!.id
    expect(manifestProblems(twice).join(' ')).toContain('repeats')
    const many = copy()
    many.questions = Array.from({ length: 13 }, (_, i) => ({ id: `q${i}`, kind: 'scale' as const, prompt: 'How?', min: 1, max: 5 }))
    expect(manifestProblems(many)).toContain('questions: 1 to 12')
  })

  it('checks each kind on its own terms', () => {
    const bad = copy()
    bad.questions = [
      { id: 'a', kind: 'choice', prompt: 'One?', options: ['only'] },
      { id: 'b', kind: 'multi', prompt: 'Some?', options: ['x', 'y'], max: 3 },
      { id: 'c', kind: 'scale', prompt: 'How?', min: 1, max: 30 },
      { id: 'd', kind: 'number', prompt: 'How many?', min: 5, max: 5 },
      { id: 'e', kind: 'pairwise', prompt: 'Which?', items: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }, { id: 'z', label: 'Z' }], pairs: 4 },
      { id: 'f', kind: 'order', prompt: 'Order?', items: [{ id: 'x', label: 'X' }, { id: 'x', label: 'X again' }] },
      { id: 'g', kind: 'text', prompt: 'Say?', max_length: 5000 },
    ]
    const p = manifestProblems(bad).join(' | ')
    for (const needle of ['(a): 2 to 12 options', '(b): max', '(c): a scale', '(d): a range', '(e): pairs', '(f): item id', '(g): max_length']) expect(p).toContain(needle)
  })

  it('refuses a line break or an invisible character anywhere in the text, and says where', () => {
    const hide = copy()
    hide.questions[0]!.prompt = 'What did the silence sound like?\n<!--'
    expect(manifestProblems(hide).join(' | ')).toContain('questions[0].prompt: U+000A at character 33')
    for (const c of ['\u200b', '\u202e', '\ufe0f', '\u00ad', '\u2028', '\u{e0041}']) {
      const m = copy()
      m.purpose = `Why${c} we ask`
      expect(manifestProblems(m).join(' | '), JSON.stringify(c)).toMatch(/^purpose: U\+[0-9A-F]{4,5} at character 4/)
    }
    const opt = copy()
    ;(opt.questions[0] as { options: string[] }).options[1] = 'a\u200bgap'
    expect(manifestProblems(opt).join(' | ')).toContain('questions[0].options[1]: U+200B')
  })
})

describe('isClosed and hasText', () => {
  it('closes after the last day, not on it', () => {
    expect(isClosed({ closes: '2026-11-30' }, '2026-11-30')).toBe(false)
    expect(isClosed({ closes: '2026-11-30' }, '2026-12-01')).toBe(true)
    expect(isClosed({}, '2099-01-01')).toBe(false)
  })

  it('knows when a study asks for free text', () => {
    expect(hasText(MANIFEST)).toBe(true)
    expect(hasText({ questions: MANIFEST.questions.filter((q) => q.kind !== 'text') })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { signalLabel, tokensLabel } from './format'

describe('tokensLabel', () => {
  it('formats word counts per locale', () => {
    expect(tokensLabel(1, 'en')).toBe('1 word')
    expect(tokensLabel(42, 'en')).toBe('42 words')
    expect(tokensLabel(1, 'de')).toBe('1 Wort')
    expect(tokensLabel(42, 'de')).toBe('42 Wörter')
  })
})

describe('signalLabel', () => {
  it('maps signal keys to human labels', () => {
    expect(signalLabel('commitment_verb', 'en')).toBe('commitment')
    expect(signalLabel('number', 'de')).toBe('Zahl')
    expect(signalLabel('unknown', 'en')).toBe('unknown')
  })
})

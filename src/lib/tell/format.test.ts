import { describe, expect, it } from 'vitest'
import { foldStr, foldRound, num1 } from './format'

describe('foldStr', () => {
  it('formatiert den Faktor mit ד je Sprache', () => {
    expect(foldStr(13.7, 'en')).toBe('13.7×')
    expect(foldStr(13.7, 'de')).toBe('13,7×')
    expect(foldStr(null, 'en')).toBe('—')
  })
})

describe('foldRound', () => {
  it('rundet auf ganze Faktoren', () => {
    expect(foldRound(13.7)).toBe('14×')
    expect(foldRound(18.9)).toBe('19×')
    expect(foldRound(null)).toBe('—')
  })
})

describe('num1', () => {
  it('eine Nachkommastelle', () => {
    expect(num1(191.8, 'en')).toBe('191.8')
    expect(num1(191.8, 'de')).toBe('191,8')
  })
})

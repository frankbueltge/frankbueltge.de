import { describe, expect, it } from 'vitest'
import { CLAIM_MARK, langLabel, omissionPercent, topicHeadline } from './labels'

describe('omissionPercent', () => {
  it('rundet einen Bruch auf ganze Prozent ohne Zeichen', () => {
    expect(omissionPercent(0.675)).toBe('68')
    expect(omissionPercent(0.5)).toBe('50')
    expect(omissionPercent(0)).toBe('0')
    expect(omissionPercent(1)).toBe('100')
  })
})

describe('langLabel', () => {
  it('zeigt Sprachcodes in Großbuchstaben', () => {
    expect(langLabel('de')).toBe('DE')
    expect(langLabel('zh')).toBe('ZH')
  })
})

describe('CLAIM_MARK', () => {
  it('hat Symbol und zweisprachiges Label je Markierung', () => {
    expect(CLAIM_MARK.nennt).toEqual({ sym: '✓', de: 'nennt', en: 'states' })
    expect(CLAIM_MARK.verschweigt).toEqual({ sym: '·', de: 'verschweigt', en: 'omits' })
    expect(CLAIM_MARK.widerspricht).toEqual({ sym: '✗', de: 'widerspricht', en: 'contradicts' })
  })
})

describe('topicHeadline', () => {
  it('deutscher Kopfsatz mit gerundetem Prozent', () => {
    expect(topicHeadline(0.675, 'de')).toBe(
      'Im Mittel verschweigt jede Sprachversion 68 % dessen, was die anderen benennen.',
    )
  })

  it('englischer Kopfsatz mit gerundetem Prozent', () => {
    expect(topicHeadline(0.675, 'en')).toBe(
      'On average, each language version omits 68% of what the others state.',
    )
  })

  it('null ergibt einen Platzhalter je Sprache', () => {
    expect(topicHeadline(null, 'de')).toBe('Noch keine Messung.')
    expect(topicHeadline(null, 'en')).toBe('No measurement yet.')
  })
})

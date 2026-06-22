import { describe, expect, it } from 'vitest'
import { cleanTitle, echoPercent, spanLabel, hhmm } from './format'

describe('cleanTitle', () => {
  it('kollabiert doppelte Leerzeichen und trimmt', () => {
    expect(cleanTitle('Vance meets  Iran to  turn over a new leaf  ')).toBe('Vance meets Iran to turn over a new leaf')
  })
})

describe('echoPercent', () => {
  it('formatiert den Index als Prozent je Sprache', () => {
    expect(echoPercent(0.342, 'en')).toBe('34.2%')
    expect(echoPercent(0.342, 'de')).toBe('34,2 %')
  })
})

describe('spanLabel', () => {
  it('formatiert Stunden, leer bei null', () => {
    expect(spanLabel(4.5, 'en')).toBe('4.5h')
    expect(spanLabel(4.5, 'de')).toBe('4,5 h')
    expect(spanLabel(null, 'en')).toBe('')
  })
})

describe('hhmm', () => {
  it('zieht HH:MM aus ISO', () => {
    expect(hhmm('2026-06-21T18:00+00:00')).toBe('18:00')
  })
})

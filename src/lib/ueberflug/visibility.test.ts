import { describe, expect, it } from 'vitest'
import { CATEGORY_LABEL, CLASS_LABEL, classifyElevation, deg } from './visibility'

describe('classifyElevation (Radiant-Input)', () => {
  it('zweistufiges Kriterium aus der Spec', () => {
    expect(classifyElevation(deg(-5))).toBe('none')
    expect(classifyElevation(deg(5))).toBe('none')     // unter Maskenwinkel
    expect(classifyElevation(deg(10.01))).toBe('contact')
    expect(classifyElevation(deg(34.9))).toBe('contact')
    expect(classifyElevation(deg(35))).toBe('imaging')
    expect(classifyElevation(deg(90))).toBe('imaging')
  })
})

describe('CLASS_LABEL', () => {
  it('GCAT-Klassen → Register-Labels DE/EN', () => {
    expect(CLASS_LABEL.D.de).toBe('militärisch')
    expect(CLASS_LABEL.B.en).toBe('commercial')
    expect(CLASS_LABEL.C.de).toBe('staatlich-zivil')
    expect(CLASS_LABEL.A.de).toBe('Amateur')
    expect(CLASS_LABEL.unknown.de).toBe('nicht klassifiziert')
  })
})


describe('categoryLabel deckt reale GCAT-Codes ab', () => {
  it('IMG-R und EOSCI (häufig im echten Snapshot) sind gemappt', () => {
    expect(CATEGORY_LABEL['IMG-R'].de).toBe('Radar-Abbildung')
    expect(CATEGORY_LABEL.EOSCI.en).toBe('earth science')
  })
})

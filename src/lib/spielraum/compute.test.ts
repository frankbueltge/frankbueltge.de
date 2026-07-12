import { describe, expect, it } from 'vitest'
import registerJson from '@/data/spielraum/register.json'
import type { SpielraumRegister } from './types'
import { hasDisclosure } from './types'
import { buildRounds, fmtPct, fmtRatio, growthFromMwh, headroomPct, priorPeriod, requiredPue } from './compute'

// JSON-Import wird von TS strukturell zu eng inferiert (Tiers/Formen als string statt
// Literal-Union) — Cast über unknown ist hier der korrekte Weg (Muster: parallaxe/data.ts).
const register = registerJson as unknown as SpielraumRegister

describe('requiredPue', () => {
  it('Google 2023/2024/2025 — Basis ist je der VORjahres-PUE', () => {
    expect(requiredPue(1.1, 17)).toBeCloseTo(0.94, 2)
    expect(requiredPue(1.1, 27)).toBeCloseTo(0.87, 2)
    expect(requiredPue(1.09, 37)).toBeCloseTo(0.8, 2)
  })
})

describe('headroomPct', () => {
  it('(pue-1)/pue * 100', () => {
    expect(headroomPct(1.09)).toBeCloseTo(8.26, 2)
    expect(headroomPct(1.08)).toBeCloseTo(7.4, 1)
  })
})

describe('priorPeriod', () => {
  it('dekrementiert die Ziffernfolge, Präfix bleibt erhalten', () => {
    expect(priorPeriod('2024')).toBe('2023')
    expect(priorPeriod('FY25')).toBe('FY24')
  })

  it('unbekanntes Format → null', () => {
    expect(priorPeriod('reported 2024')).toBeNull()
  })
})

describe('growthFromMwh', () => {
  it('Meta 11167416/14975435/18061781 → +34.1% / +20.6%', () => {
    const derived = growthFromMwh([
      { period: '2022', source_id: 's', tier: 'SOURCED', value: 11167416 },
      { period: '2023', source_id: 's', tier: 'SOURCED', value: 14975435 },
      { period: '2024', source_id: 's', tier: 'SOURCED', value: 18061781 },
    ])
    expect(derived).toHaveLength(2)
    expect(derived[0].period).toBe('2023')
    expect(derived[0].value).toBeCloseTo(34.1, 1)
    expect(derived[0].arithmetic).toBe('(14975435-11167416)/11167416 = +34.1%')
    expect(derived[1].period).toBe('2024')
    expect(derived[1].value).toBeCloseTo(20.6, 1)
  })

  it('Microsoft 18153454/23567502/29829540 → +29.8% / +26.6%', () => {
    const derived = growthFromMwh([
      { period: 'FY22', source_id: 's', tier: 'SOURCED', value: 18153454 },
      { period: 'FY23', source_id: 's', tier: 'SOURCED', value: 23567502 },
      { period: 'FY24', source_id: 's', tier: 'SOURCED', value: 29829540 },
    ])
    expect(derived).toHaveLength(2)
    expect(derived[0].value).toBeCloseTo(29.8, 1)
    expect(derived[1].value).toBeCloseTo(26.6, 1)
  })
})

describe('hasDisclosure', () => {
  it('false für AWS (discloses: false ist ein Befund), true für die drei anderen', () => {
    expect(hasDisclosure(register.companies.aws.consumption)).toBe(false)
    expect(hasDisclosure(register.companies.google.consumption)).toBe(true)
    expect(hasDisclosure(register.companies.meta.consumption)).toBe(true)
    expect(hasDisclosure(register.companies.microsoft.consumption)).toBe(true)
  })
})

describe('buildRounds — mit dem echten register.json', () => {
  it('Google: 3 Runden, alle impossible, baseApprox überall false', () => {
    const rounds = buildRounds(register.companies.google, register.floor)
    expect(rounds).toHaveLength(3)
    expect(rounds.every((r) => r.impossible)).toBe(true)
    expect(rounds.every((r) => r.baseApprox === false)).toBe(true)

    expect(rounds[0].period).toBe('2023')
    expect(rounds[0].basePeriod).toBe('2022')
    expect(rounds[0].basePue).toBeCloseTo(1.1, 2)
    expect(rounds[0].requiredPue).toBeCloseTo(0.94, 2)

    expect(rounds[1].period).toBe('2024')
    expect(rounds[1].basePeriod).toBe('2023')
    expect(rounds[1].basePue).toBeCloseTo(1.1, 2)
    expect(rounds[1].requiredPue).toBeCloseTo(0.87, 2)

    // Per-Jahr-Basis-Disziplin: die 2025er-Runde nutzt die 2024er-PUE (1,09), NICHT 1,10.
    expect(rounds[2].period).toBe('2025')
    expect(rounds[2].basePeriod).toBe('2024')
    expect(rounds[2].basePue).toBeCloseTo(1.09, 2)
    expect(rounds[2].basePue).not.toBeCloseTo(1.1, 2)
    expect(rounds[2].requiredPue).toBeCloseTo(0.8, 2)
  })

  it('Meta: 2 Runden (2023 Basis 1.08/2022er-PUE, 2024 Basis 1.08/2023er-PUE), beide impossible', () => {
    const rounds = buildRounds(register.companies.meta, register.floor)
    expect(rounds).toHaveLength(2)

    expect(rounds[0].period).toBe('2023')
    expect(rounds[0].basePeriod).toBe('2022')
    expect(rounds[0].basePue).toBeCloseTo(1.08, 2)
    expect(rounds[0].baseApprox).toBe(false)
    expect(rounds[0].requiredPue).toBeCloseTo(0.81, 2)
    expect(rounds[0].impossible).toBe(true)

    expect(rounds[1].period).toBe('2024')
    expect(rounds[1].basePeriod).toBe('2023')
    expect(rounds[1].basePue).toBeCloseTo(1.08, 2)
    expect(rounds[1].baseApprox).toBe(false)
    expect(rounds[1].requiredPue).toBeCloseTo(0.9, 2)
    expect(rounds[1].impossible).toBe(true)
  })

  it('Microsoft: GENAU 1 Runde (FY23 hat weder Vor- noch Eigenperioden-PUE)', () => {
    const rounds = buildRounds(register.companies.microsoft, register.floor)
    expect(rounds).toHaveLength(1)

    const r = rounds[0]
    expect(r.period).toBe('FY24')
    expect(r.basePeriod).toBe('FY24')
    expect(r.basePue).toBeCloseTo(1.16, 2)
    expect(r.baseApprox).toBe(true)
    expect(r.growthPct).toBeCloseTo(26.6, 1)
    expect(r.requiredPue).toBeCloseTo(0.92, 2)
    expect(r.impossible).toBe(true)
  })

  it('AWS: 0 Runden (discloses: false → keine Offenlegung, keine Runde)', () => {
    const rounds = buildRounds(register.companies.aws, register.floor)
    expect(rounds).toHaveLength(0)
  })
})

describe('fmtRatio / fmtPct', () => {
  it('fmtRatio: zwei Nachkommastellen, locale-abhängiges Dezimaltrennzeichen', () => {
    expect(fmtRatio(0.9401709, 'en')).toBe('0.94')
    expect(fmtRatio(0.9401709, 'de')).toBe('0,94')
  })

  it('fmtPct: eine Nachkommastelle per Default, digits konfigurierbar', () => {
    expect(fmtPct(8.2568, 'en')).toBe('8.3')
    expect(fmtPct(8.2568, 'en', 2)).toBe('8.26')
    expect(fmtPct(8.2568, 'de', 2)).toBe('8,26')
  })
})

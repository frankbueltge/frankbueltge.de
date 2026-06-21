import { describe, expect, it } from 'vitest'
import { yoyPercent, trend, ragStatus, statusLabel, execSummary } from './kpi'
import type { Kpi } from './types'

const mk = (over: Partial<Kpi>): Kpi => ({
  id: 'x',
  label: { de: 'X', en: 'X' },
  metric: { de: '', en: '' },
  unit: 'index',
  good_when: 'high',
  target: 0.5,
  owner: { de: '', en: '' },
  spin: { de: '', en: '' },
  series: [
    [2000, 0.4],
    [2024, 0.3],
  ],
  source: { name: '', url: '', license: '', retrieved: '' },
  ...over,
})

describe('yoyPercent', () => {
  it('berechnet Änderung jüngster vs. vorletzter Stützpunkt', () => {
    expect(
      yoyPercent([
        [2022, 100],
        [2023, 90],
        [2024, 81],
      ]),
    ).toBeCloseTo(-10)
  })
})

describe('trend', () => {
  it('down bei fallender Reihe, up bei steigender, flat bei ~0', () => {
    expect(
      trend([
        [2023, 90],
        [2024, 81],
      ]),
    ).toBe('down')
    expect(
      trend([
        [2023, 81],
        [2024, 90],
      ]),
    ).toBe('up')
    expect(
      trend([
        [2023, 90],
        [2024, 90],
      ]),
    ).toBe('flat')
  })
})

describe('ragStatus', () => {
  it('crit: good_when high, fallend, unter Ziel', () => {
    expect(
      ragStatus(
        mk({
          good_when: 'high',
          target: 0.5,
          series: [
            [2000, 0.45],
            [2024, 0.37],
          ],
        }),
      ),
    ).toBe('crit')
  })
  it('ok: good_when high, steigend, über Ziel (Ungleichheit im Konzern-Frame)', () => {
    expect(
      ragStatus(
        mk({
          good_when: 'high',
          target: 10,
          series: [
            [2000, 14],
            [2024, 19],
          ],
        }),
      ),
    ).toBe('ok')
  })
  it('warn: steigend, aber unter Ziel', () => {
    expect(
      ragStatus(
        mk({
          good_when: 'high',
          target: 0.5,
          series: [
            [2000, 0.3],
            [2024, 0.37],
          ],
        }),
      ),
    ).toBe('warn')
  })
})

describe('statusLabel', () => {
  it('liefert feste Deadpan-Labels je Sprache', () => {
    expect(statusLabel('crit', 'en')).toBe('critical')
    expect(statusLabel('ok', 'en')).toBe('above plan')
    expect(statusLabel('warn', 'de')).toBe('unter Beobachtung')
  })
})

describe('execSummary', () => {
  it('zählt KPIs unter Plan und nennt die Pointe (EN, festgenagelt)', () => {
    const kpis = [
      mk({
        id: 'a',
        good_when: 'high',
        target: 0.5,
        series: [
          [2000, 0.45],
          [2024, 0.37],
        ],
      }), // crit
      mk({
        id: 'b',
        good_when: 'high',
        target: 0.5,
        series: [
          [2000, 0.45],
          [2024, 0.37],
        ],
      }), // crit
      mk({
        id: 'inequality',
        good_when: 'high',
        target: 10,
        series: [
          [2000, 14],
          [2024, 19],
        ],
      }), // ok
    ]
    expect(execSummary(kpis, 'en')).toBe(
      '2 of 3 KPIs below target this quarter. Inequality continues to outperform plan. The board remains optimistic.',
    )
  })
})

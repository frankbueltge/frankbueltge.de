import { describe, expect, it } from 'vitest'
import { attentionStrip, SPARK_H, SPARK_W, sparkPath, STRIP_W } from './svg'

describe('sparkPath', () => {
  it('startet am Peak oben und endet rechts unten beim Sockel', () => {
    const series: [string, number][] = [
      ['2026-03-01', 10000], ['2026-03-02', 5000], ['2026-03-03', 2500], ['2026-03-04', 100],
    ]
    const path = sparkPath(series)
    expect(path.startsWith('M0.0,1.0')).toBe(true) // Peak: ganz oben
    const last = path.split(' L').at(-1)!
    expect(parseFloat(last.split(',')[0])).toBe(SPARK_W)
    expect(parseFloat(last.split(',')[1])).toBeGreaterThan(SPARK_H - 8) // Sockel: fast unten
  })

  it('leere oder flache Serien ergeben keinen Pfad', () => {
    expect(sparkPath([])).toBe('')
    expect(sparkPath([['2026-03-01', 0], ['2026-03-02', 0]])).toBe('')
  })
})

describe('attentionStrip', () => {
  it('bildet log10 der Aufrufe je Opfer über die Breite ab; Extreme treffen die Enden', () => {
    const layout = attentionStrip(
      [{ vpd: 10, label: 'a' }, { vpd: 100, label: 'b' }, { vpd: 1000, label: 'c' }],
      300,
    )
    expect(layout.points).toHaveLength(3)
    expect(layout.points[0].x).toBeCloseTo(0)    // 10  → linkes Ende
    expect(layout.points[1].x).toBeCloseTo(150)  // 100 → Mitte (log-gleichmäßig)
    expect(layout.points[2].x).toBeCloseTo(300)  // 1000 → rechtes Ende
    expect(layout.min).toBeCloseTo(10)
    expect(layout.max).toBeCloseTo(1000)
  })

  it('hält jeden Punkt inspizierbar (Label + Rohwert bleiben erhalten)', () => {
    const layout = attentionStrip([{ vpd: 5, label: 'x' }, { vpd: 50, label: 'y' }], 100)
    expect(layout.points[1]).toMatchObject({ vpd: 50, label: 'y' })
  })

  it('verwirft nicht-positive Werte und braucht ≥ 2 Punkte', () => {
    // nur ein positiver Wert nach dem Filter → keine Achse
    expect(attentionStrip([{ vpd: 0, label: 'a' }, { vpd: 100, label: 'b' }], 100).points).toHaveLength(0)
    // drei gegeben, einer nicht-positiv → zwei bleiben → gültige Achse
    const ok = attentionStrip([{ vpd: 0, label: 'a' }, { vpd: 10, label: 'b' }, { vpd: 100, label: 'c' }], 100)
    expect(ok.points).toHaveLength(2)
    expect(ok.points[0].label).toBe('b')
  })

  it('benutzt STRIP_W als Standardbreite', () => {
    const layout = attentionStrip([{ vpd: 1, label: 'a' }, { vpd: 10, label: 'b' }])
    expect(layout.points[1].x).toBeCloseTo(STRIP_W)
  })
})

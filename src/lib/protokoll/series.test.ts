import { describe, expect, it } from 'vitest'
import { buildTopSeries, linePath, LINE_W } from './series'
import type { ProtokollDay, ProtokollEntry } from './types'

function entry(top_id: string, value: number | null): ProtokollEntry {
  return {
    top_id, status: value == null ? 'unavailable' : 'ok', unit: 'ppm', cadence: 'daily',
    source: { name: 'X', url: 'https://x', license: 'CC0' }, retrieved_at: '2026-06-20T00:00:00Z',
    value, as_of: '2026-06-20', comparison: null, label: null, record: false, note: null,
  }
}
function day(date: string, entries: ProtokollEntry[]): ProtokollDay {
  return { date, generated_at: `${date}T03:30:00Z`, schema_version: '1', pipeline_version: '1', entries }
}

describe('buildTopSeries', () => {
  it('sammelt je top_id eine aufsteigend datierte Zeitreihe und den jüngsten Eintrag', () => {
    const days = [
      day('2026-06-12', [entry('co2', 426)]),
      day('2026-06-10', [entry('co2', 425)]),
      day('2026-06-11', [entry('co2', 425.5)]),
    ]
    const all = buildTopSeries(days)
    const co2 = all.find((t) => t.id === 'co2')!
    expect(co2.series.map((p) => p.date)).toEqual(['2026-06-10', '2026-06-11', '2026-06-12'])
    expect(co2.series.map((p) => p.value)).toEqual([425, 425.5, 426])
    expect(co2.latest.value).toBe(426) // jüngster Tag
    expect(co2.title.de).toBe('Atmosphäre')
  })

  it('lässt null-Werte aus der Reihe, behält aber den jüngsten Eintrag (Status sichtbar)', () => {
    const days = [
      day('2026-06-10', [entry('co2', 425)]),
      day('2026-06-11', [entry('co2', null)]),
    ]
    const co2 = buildTopSeries(days).find((t) => t.id === 'co2')!
    expect(co2.series).toHaveLength(1)
    expect(co2.latest.value).toBeNull()
    expect(co2.latest.status).toBe('unavailable')
  })
})

describe('linePath', () => {
  it('skaliert linear; min unten, max oben, newest rechts', () => {
    const p = linePath([0, 50, 100], 200, 40)
    expect(p.startsWith('M0.0,')).toBe(true)
    const xs = p.split(' L').map((s) => parseFloat(s.replace('M', '').split(',')[0]))
    expect(xs).toEqual([0, 100, 200])
    const firstY = parseFloat(p.split(' L')[0].split(',')[1]) // min → nahe unten
    const lastY = parseFloat(p.split(' L').at(-1)!.split(',')[1]) // max → nahe oben
    expect(firstY).toBeGreaterThan(lastY)
  })

  it('weniger als zwei Punkte ergeben keinen Pfad', () => {
    expect(linePath([42], 200, 40)).toBe('')
    expect(linePath([], LINE_W)).toBe('')
  })
})

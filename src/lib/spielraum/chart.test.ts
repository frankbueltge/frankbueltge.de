import { describe, expect, it } from 'vitest'
import { floorX, hatchLines, impossibleZone, scaleX, ticks } from './chart'

describe('scaleX', () => {
  it('linear, monoton steigend über das Domain', () => {
    const domain: [number, number] = [0.8, 1.3]
    const xMin = scaleX(0.8, domain, 500)
    const xMid = scaleX(1.05, domain, 500)
    const xMax = scaleX(1.3, domain, 500)
    expect(xMin).toBeCloseTo(0, 5)
    expect(xMax).toBeCloseTo(500, 5)
    expect(xMid).toBeGreaterThan(xMin)
    expect(xMid).toBeLessThan(xMax)
    expect(xMid).toBeCloseTo(250, 5)
  })

  it('entartetes Domain (min >= max) → -1, nie NaN', () => {
    expect(scaleX(1.0, [1.0, 1.0], 500)).toBe(-1)
    expect(scaleX(1.0, [1.2, 0.8], 500)).toBe(-1)
    expect(Number.isNaN(scaleX(1.0, [1.0, 1.0], 500))).toBe(false)
  })
})

describe('floorX', () => {
  it('ist fix bei gegebenem Domain, unabhängig von Datenwerten (nur Position des Bodens 1,0)', () => {
    const domain: [number, number] = [0.7, 1.2]
    const x1 = floorX(domain, 640)
    const x2 = floorX(domain, 640)
    expect(x1).toBe(x2)
    // 1.0 liegt bei (1.0-0.7)/(1.2-0.7) = 0.6 → 60% von 640
    expect(x1).toBeCloseTo(384, 5)
  })

  it('respektiert einen expliziten floor-Parameter', () => {
    const domain: [number, number] = [0.7, 1.2]
    expect(floorX(domain, 640, 0.7)).toBeCloseTo(0, 5)
    expect(floorX(domain, 640, 1.2)).toBeCloseTo(640, 5)
  })
})

describe('impossibleZone', () => {
  it('Zone links des Bodens, x=0 bis floorX', () => {
    const domain: [number, number] = [0.7, 1.2]
    const zone = impossibleZone(domain, 640, 1.0)
    expect(zone).not.toBeNull()
    expect(zone?.x).toBe(0)
    expect(zone?.w).toBeCloseTo(384, 5)
  })

  it('null, wenn der Boden außerhalb des Domains liegt (floor < domain-min)', () => {
    const domain: [number, number] = [1.05, 1.3]
    expect(impossibleZone(domain, 640, 1.0)).toBeNull()
  })

  it('null, wenn der Boden über domain-max liegt', () => {
    const domain: [number, number] = [0.5, 0.9]
    expect(impossibleZone(domain, 640, 1.0)).toBeNull()
  })

  it('null bei entartetem Domain', () => {
    expect(impossibleZone([1.0, 1.0], 640, 1.0)).toBeNull()
  })
})

describe('hatchLines', () => {
  it('deterministische, gleichmäßig verteilte 45°-Linien über die Zone', () => {
    const lines = hatchLines({ x: 0, w: 100 }, 20, 25)
    // x = 0, 25, 50, 75, 100 → 5 Linien
    expect(lines).toHaveLength(5)
    expect(lines[0]).toEqual({ x1: 0, y1: 0, x2: 20, y2: 20 })
    expect(lines[4]).toEqual({ x1: 100, y1: 0, x2: 120, y2: 20 })
  })

  it('leer bei nicht-positiver Breite/Höhe/Abstand', () => {
    expect(hatchLines({ x: 0, w: 0 }, 20, 10)).toEqual([])
    expect(hatchLines({ x: 0, w: 100 }, 0, 10)).toEqual([])
    expect(hatchLines({ x: 0, w: 100 }, 20, 0)).toEqual([])
  })
})

describe('ticks', () => {
  it('Positionen im Schrittabstand, x konsistent mit scaleX', () => {
    const domain: [number, number] = [1.0, 1.2]
    const t = ticks(domain, 0.05, 200)
    expect(t.map((p) => p.value)).toEqual([1.0, 1.05, 1.1, 1.15, 1.2])
    for (const p of t) {
      expect(p.x).toBeCloseTo(scaleX(p.value, domain, 200), 5)
    }
  })

  it('leer bei entartetem Domain oder step <= 0', () => {
    expect(ticks([1.0, 1.0], 0.1)).toEqual([])
    expect(ticks([1.0, 1.2], 0)).toEqual([])
  })
})

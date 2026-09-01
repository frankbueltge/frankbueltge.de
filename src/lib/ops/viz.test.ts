import { describe, expect, it } from 'vitest'
import { areaPath, bars, cells, lastPoint, linePath, linePoints, pointsAttr, ratioBars, smooth3, SPARK_BOX, TILE_BOX } from './viz'

const box = TILE_BOX

describe('linePoints', () => {
  it('is deterministic and one decimal — the same series draws the same points', () => {
    const v = [3, 1, 4, 1, 5, 9, 2, 6]
    expect(linePoints(v)).toEqual(linePoints(v))
    for (const p of linePoints(v)) {
      expect(p.x).toBe(Math.round(p.x * 10) / 10)
      expect(p.y).toBe(Math.round(p.y * 10) / 10)
    }
  })

  it('spans the box left to right and keeps the ink off both edges', () => {
    const pts = linePoints([0, 5, 10], box)
    expect(pts[0].x).toBe(0)
    expect(pts[pts.length - 1].x).toBe(box.width)
    for (const p of pts) {
      expect(p.y).toBeGreaterThanOrEqual(box.pad)
      expect(p.y).toBeLessThanOrEqual(box.height - box.pad)
    }
  })

  it('puts the peak at the top pad and the floor at the bottom pad — normalised to its own span', () => {
    const pts = linePoints([2, 8, 5], box)
    expect(pts[1].y).toBe(box.pad)
    expect(pts[0].y).toBe(box.height - box.pad)
  })

  it('lays a flat series on the floor rather than dividing by zero', () => {
    const pts = linePoints([4, 4, 4, 4], box)
    expect(pts.every((p) => p.y === box.height - box.pad)).toBe(true)
  })

  it('ignores non-finite values and refuses to draw fewer than two points', () => {
    expect(linePoints([1, NaN, Infinity])).toEqual([])
    expect(linePoints([7])).toEqual([])
    expect(linePoints([1, NaN, 3]).length).toBe(2)
  })
})

describe('linePath and areaPath', () => {
  const v = [0, 3, 1, 4, 1, 5]

  it('draw a monotone curve, not a polyline — and pass through the series’ own points', () => {
    const d = linePath(v)
    expect(d.startsWith('M')).toBe(true)
    expect(d).toContain('C')
    // A monotone curve is interpolation, so the first and last points are on it verbatim.
    const pts = linePoints(v)
    expect(d.startsWith(`M${pts[0].x},${pts[0].y}`)).toBe(true)
    expect(d.endsWith(`${pts[pts.length - 1].x},${pts[pts.length - 1].y}`)).toBe(true)
  })

  it('never overshoot a zero: the curve stays inside the box', () => {
    const d = linePath([0, 0, 9, 0, 0], box)
    // every command in a d3 path lists x,y pairs, so the odd-indexed numbers are the ys
    const ys = d.match(/-?[\d.]+/g)!.map(Number).filter((_, i) => i % 2 === 1)
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(box.pad - 0.05)
    expect(Math.max(...ys)).toBeLessThanOrEqual(box.height - box.pad + 0.05)
  })

  it('area closes down to the box floor and shares the line’s points', () => {
    const a = areaPath(v, box)
    expect(a.startsWith('M')).toBe(true)
    expect(a.endsWith('Z')).toBe(true)
    expect(a).toContain(`,${box.height}`)
    const pts = linePoints(v, box)
    expect(a.startsWith(`M${pts[0].x},${pts[0].y}`)).toBe(true)
  })

  it('are empty for a series too short to draw', () => {
    expect(linePath([5])).toBe('')
    expect(areaPath([])).toBe('')
    expect(lastPoint([5])).toBeNull()
  })

  it('carry no colour and no style — appearance belongs to the stylesheet', () => {
    expect(linePath(v) + areaPath(v)).not.toMatch(/#|rgb|style|fill|stroke/i)
  })
})

describe('lastPoint and pointsAttr', () => {
  it('names the newest reading, and serialises the points for the probe', () => {
    const v = [1, 2, 3]
    const pts = linePoints(v, SPARK_BOX)
    expect(lastPoint(v, SPARK_BOX)).toEqual(pts[2])
    expect(pointsAttr(pts)).toBe(pts.map((p) => `${p.x},${p.y}`).join(' '))
    // round-trips: the client splits on space and comma
    const back = pointsAttr(pts).split(' ').map((p) => p.split(',').map(Number))
    expect(back).toEqual(pts.map((p) => [p.x, p.y]))
  })
})

describe('bars', () => {
  it('draws one bar per value on a band scale, inside the box, from the floor', () => {
    const v = [1, 4, 2, 8, 0, 3]
    const b = bars(v, new Set([3]), box)
    expect(b).toHaveLength(v.length)
    for (const bar of b) {
      expect(bar.x).toBeGreaterThanOrEqual(0)
      expect(bar.x + bar.width).toBeLessThanOrEqual(box.width + 0.05)
      expect(bar.y + bar.height).toBeCloseTo(box.height, 5)
      expect(bar.width).toBeGreaterThanOrEqual(1.5)
      expect(bar.height).toBeGreaterThanOrEqual(1)
    }
    // the peak reaches the top pad; a zero is still a hairline on the floor
    expect(b[3].height).toBe(box.height - box.pad)
    expect(b[4].height).toBe(1)
    expect(b.map((x) => x.marked)).toEqual([false, false, false, true, false, false])
  })

  it('keeps every bar the same width and in order left to right', () => {
    const b = bars([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], new Set(), box)
    expect(new Set(b.map((x) => x.width)).size).toBe(1)
    for (let i = 1; i < b.length; i++) expect(b[i].x).toBeGreaterThan(b[i - 1].x + b[i - 1].width)
  })

  it('is deterministic and drops non-finite values', () => {
    expect(bars([1, 2, 3])).toEqual(bars([1, 2, 3]))
    expect(bars([1, NaN, 3])).toHaveLength(2)
    expect(bars([])).toEqual([])
  })
})

describe('cells', () => {
  it('counts, never measures: equal cells centred in the box, the marked ones flagged', () => {
    const c = cells(7, new Set([2, 5]), box)
    expect(c).toHaveLength(7)
    expect(new Set(c.map((x) => x.width)).size).toBe(1)
    expect(new Set(c.map((x) => x.height)).size).toBe(1)
    expect(c[0].y + c[0].height / 2).toBeCloseTo(box.height / 2, 1)
    expect(c.filter((x) => x.marked).length).toBe(2)
    expect(c[c.length - 1].x + c[c.length - 1].width).toBeLessThanOrEqual(box.width + 0.05)
  })

  it('caps at 24 — beyond that a row stops being countable by eye', () => {
    expect(cells(40)).toHaveLength(24)
    expect(cells(0)).toEqual([])
  })
})

describe('ratioBars', () => {
  it('draws the share as length over a full-width reference', () => {
    const [part, whole] = ratioBars(1, 4, box)
    expect(part.width).toBe(box.width / 4)
    expect(whole.width).toBe(box.width)
    expect(part.marked).toBe(true)
    expect(whole.marked).toBe(false)
  })

  it('clamps a share into [0, 1] and survives a zero whole', () => {
    expect(ratioBars(9, 4)[0].width).toBe(box.width)
    expect(ratioBars(-1, 4)[0].width).toBe(0)
    expect(ratioBars(1, 0)[0].width).toBe(box.width)
  })
})

describe('smooth3', () => {
  it('is one pass, window three, clamped at the edges', () => {
    expect(smooth3([0, 3, 0])).toEqual([1, 1, 1])
    expect(smooth3([1, 2])).toEqual([1, 2])
  })
})

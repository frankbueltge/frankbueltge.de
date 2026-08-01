import { describe, expect, it } from 'vitest'
import { bandScale, clampBox, dayRange, escapeXml, polyPath, wrapLines } from './geometry'

describe('escapeXml', () => {
  it('escapes all five XML-significant characters', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe('a &amp; b &lt; c &gt; d &quot; e &#x27; f')
  })
  it('leaves plain text untouched', () => {
    expect(escapeXml('nothing to escape here')).toBe('nothing to escape here')
  })
})

describe('wrapLines', () => {
  it('wraps greedily at the word boundary, never mid-word', () => {
    expect(wrapLines('one two three four five', 11)).toEqual(['one two', 'three four', 'five'])
  })
  it('keeps an over-long single word on its own line rather than splitting it', () => {
    expect(wrapLines('supercalifragilisticexpialidocious', 10)).toEqual(['supercalifragilisticexpialidocious'])
  })
  it('empty text yields no lines', () => {
    expect(wrapLines('', 10)).toEqual([])
  })
})

describe('dayRange', () => {
  it("'empty' mode returns [] on a malformed date instead of guessing", () => {
    expect(dayRange('yesterday', '2026-07-01', { onInvalid: 'empty' })).toEqual([])
  })
  it("'empty' mode returns [] on a reversed range", () => {
    expect(dayRange('2026-07-02', '2026-07-01', { onInvalid: 'empty' })).toEqual([])
  })
  it("'empty' mode is inclusive across a month boundary", () => {
    expect(dayRange('2026-06-29', '2026-07-02', { onInvalid: 'empty' })).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ])
  })
  it("'empty' mode caps at maxDays", () => {
    const days = dayRange('2026-01-01', '2027-12-31', { onInvalid: 'empty', maxDays: 5 })
    expect(days).toHaveLength(6) // historical partitur.ts contract: out.length <= max keeps pushing through max+1
    expect(days[0]).toBe('2026-01-01')
  })
  it("'throw' mode refuses a reversed range", () => {
    expect(() => dayRange('2026-07-02', '2026-07-01', { onInvalid: 'throw' })).toThrow(/lies before/)
  })
  it("'throw' mode is inclusive across a month boundary, uncapped by default", () => {
    expect(dayRange('2026-06-29', '2026-07-02', { onInvalid: 'throw' })).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ])
  })
  it("'throw' mode honors an explicit maxDays cap too", () => {
    const days = dayRange('2026-01-01', '2026-12-31', { onInvalid: 'throw', maxDays: 3 })
    expect(days).toHaveLength(4)
  })
})

describe('bandScale', () => {
  it('maps a domain linearly onto a range', () => {
    const s = bandScale([0, 10], [0, 100])
    expect(s(0)).toBe(0)
    expect(s(5)).toBe(50)
    expect(s(10)).toBe(100)
  })
  it('falls back to a span of 1 on a degenerate (zero-width) domain', () => {
    const s = bandScale([5, 5], [0, 100])
    expect(s(5)).toBe(0)
    expect(s(6)).toBe(100)
  })
  it('supports an inverted range (e.g. min-at-bottom → min-at-top)', () => {
    const s = bandScale([0, 100], [40, 0])
    expect(s(0)).toBe(40)
    expect(s(100)).toBe(0)
  })
})

describe('polyPath', () => {
  it('yields no path for fewer than two points', () => {
    expect(polyPath([])).toBe('')
    expect(polyPath([{ x: 1, y: 1 }])).toBe('')
  })
  it('builds M + L-joined coordinates at 1 decimal by default', () => {
    expect(polyPath([{ x: 0, y: 1.005 }, { x: 10, y: 2 }])).toBe('M0.0,1.0 L10.0,2.0')
  })
  it('honors a custom decimals option', () => {
    expect(polyPath([{ x: 0, y: 0 }, { x: 1.2345, y: 2 }], { decimals: 3 })).toBe('M0.000,0.000 L1.234,2.000')
  })
  it('closes to a baseline: last point down, first point down, Z', () => {
    const d = polyPath([{ x: 0, y: 5 }, { x: 20, y: 3 }], { closeToBaseline: 40 })
    expect(d).toBe('M0.0,5.0 L20.0,3.0 L20.0,40.0 L0.0,40.0 Z')
  })
})

describe('clampBox', () => {
  it('places the box to the right of / below the anchor by default (no flip enabled)', () => {
    const r = clampBox({ x: 50, y: 50, w: 20, h: 10, boxW: 300, boxH: 200, gap: 8, flipX: false, flipY: false })
    expect(r).toEqual({ x: 58, y: 58, flippedX: false, flippedY: false })
  })
  it('house rule: flips left when the preferred (right) side would overflow the box', () => {
    const r = clampBox({ x: 290, y: 50, w: 40, h: 10, boxW: 300, boxH: 200, gap: 8, flipX: true, flipY: false })
    expect(r.flippedX).toBe(true)
    expect(r.x).toBeLessThan(290) // placed to the LEFT of the anchor, not clipped at the edge
    expect(r.x + 40).toBeLessThanOrEqual(300 - 8 + 1e-9)
  })
  it('house rule: flips up when the preferred (below) side would overflow the box', () => {
    const r = clampBox({ x: 50, y: 190, w: 20, h: 30, boxW: 300, boxH: 200, gap: 8, flipX: false, flipY: true })
    expect(r.flippedY).toBe(true)
    expect(r.y).toBeLessThan(190)
  })
  it('never places the box outside the container, even at a corner with flip disabled', () => {
    const r = clampBox({ x: 298, y: 198, w: 50, h: 50, boxW: 300, boxH: 200, gap: 8, flipX: false, flipY: false })
    expect(r.x).toBeGreaterThanOrEqual(0)
    expect(r.y).toBeGreaterThanOrEqual(0)
    expect(r.x + 50).toBeLessThanOrEqual(300 + 1e-9)
    expect(r.y + 50).toBeLessThanOrEqual(200 + 1e-9)
  })
  it('flipping is symmetric per axis: an anchor near the top-left never flips', () => {
    const r = clampBox({ x: 5, y: 5, w: 20, h: 10, boxW: 300, boxH: 200, gap: 8, flipX: true, flipY: true })
    expect(r.flippedX).toBe(false)
    expect(r.flippedY).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------
// Comparison tests: the historical formulas from protokoll/series.ts, praemie/chart.ts and
// halbwertszeit/svg.ts, reproduced verbatim here as reference implementations, fuzz-compared
// against the geometry.ts-based reimplementations that now back them (see those modules' own
// one-line wrappers). Byte-identical `toFixed(1)` output is what the ported callers' existing
// tests (series.test.ts, chart.test.ts, svg.test.ts) depend on — those stay unmodified and must
// stay green; this suite is the numeric-equivalence proof the consolidation asked for.

function referenceLinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const n = values.length
  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * width
    const y = height - ((v - min) / span) * (height - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}
function newLinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const xScale = bandScale([0, values.length - 1], [0, width])
  const yScale = bandScale([min, max], [height - 1, 1])
  return polyPath(values.map((v, i) => ({ x: xScale(i), y: yScale(v) })))
}

function referenceYearLinePath(
  points: { year: number; value: number }[],
  xMin: number,
  xMax: number,
  valMax: number,
  w: number,
  h: number,
): string {
  if (points.length < 2 || xMax <= xMin || valMax <= 0) return ''
  const pts = points.map((p) => {
    const x = ((p.year - xMin) / (xMax - xMin)) * w
    const y = h - (Math.max(0, p.value) / valMax) * (h - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}
function newYearLinePath(
  points: { year: number; value: number }[],
  xMin: number,
  xMax: number,
  valMax: number,
  w: number,
  h: number,
): string {
  if (points.length < 2 || xMax <= xMin || valMax <= 0) return ''
  const xScale = bandScale([xMin, xMax], [0, w])
  const yScale = bandScale([0, valMax], [h - 1, 1])
  return polyPath(points.map((p) => ({ x: xScale(p.year), y: yScale(Math.max(0, p.value)) })))
}

function referenceSparkPath(series: [string, number][], maxDays: number, sparkW: number, sparkH: number): string {
  if (series.length < 2) return ''
  const peak = Math.max(...series.map(([, v]) => v))
  if (peak <= 0) return ''
  const days = Math.min(series.length, maxDays)
  const pts = series.slice(0, maxDays).map(([, v], i) => {
    const x = (i / (days - 1)) * sparkW
    const y = sparkH - Math.sqrt(Math.max(0, v) / peak) * (sparkH - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}
function newSparkPath(series: [string, number][], maxDays: number, sparkW: number, sparkH: number): string {
  if (series.length < 2) return ''
  const peak = Math.max(...series.map(([, v]) => v))
  if (peak <= 0) return ''
  const days = Math.min(series.length, maxDays)
  const xScale = bandScale([0, days - 1], [0, sparkW])
  const yScale = bandScale([0, 1], [sparkH - 1, 1])
  return polyPath(
    series.slice(0, maxDays).map(([, v], i) => ({ x: xScale(i), y: yScale(Math.sqrt(Math.max(0, v) / peak)) })),
  )
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

describe('numeric equivalence: geometry-based path builders vs. the historical formulas', () => {
  const rand = seededRandom(42)

  it('linePath: byte-identical across 200 random series', () => {
    for (let trial = 0; trial < 200; trial++) {
      const n = 2 + Math.floor(rand() * 20)
      const values = Array.from({ length: n }, () => (rand() - 0.3) * 10 ** (1 + Math.floor(rand() * 6)))
      const width = 20 + rand() * 500
      const height = 10 + rand() * 200
      expect(newLinePath(values, width, height)).toBe(referenceLinePath(values, width, height))
    }
  })

  it('yearLinePath: byte-identical across 200 random point sets', () => {
    for (let trial = 0; trial < 200; trial++) {
      const n = 2 + Math.floor(rand() * 10)
      const xMin = 1900 + Math.floor(rand() * 50)
      const xMax = xMin + 1 + Math.floor(rand() * 150)
      const valMax = 0.1 + rand() * 10 ** (1 + Math.floor(rand() * 5))
      const points = Array.from({ length: n }, () => ({
        year: xMin + Math.floor(rand() * (xMax - xMin + 1)),
        value: (rand() - 0.2) * valMax * 1.5,
      }))
      const w = 20 + rand() * 800
      const h = 10 + rand() * 300
      expect(newYearLinePath(points, xMin, xMax, valMax, w, h)).toBe(
        referenceYearLinePath(points, xMin, xMax, valMax, w, h),
      )
    }
  })

  it('sparkPath: byte-identical across 200 random series (incl. the sqrt scale)', () => {
    for (let trial = 0; trial < 200; trial++) {
      const n = 2 + Math.floor(rand() * 130)
      const series: [string, number][] = Array.from({ length: n }, (_, i) => [
        `2026-01-${i}`,
        rand() * 10 ** (1 + Math.floor(rand() * 6)),
      ])
      expect(newSparkPath(series, 120, 220, 40)).toBe(referenceSparkPath(series, 120, 220, 40))
    }
  })
})

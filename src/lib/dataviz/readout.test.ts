import { describe, expect, it } from 'vitest'
import { createReadout, placeReadout } from './readout'

describe('placeReadout', () => {
  it('places the box below/right of the anchor by default', () => {
    const p = placeReadout({ anchorX: 50, anchorY: 50, width: 100, height: 40, boxWidth: 400, boxHeight: 300 })
    expect(p.x).toBeGreaterThan(50)
    expect(p.y).toBeGreaterThan(50)
    expect(p.flippedX).toBe(false)
    expect(p.flippedY).toBe(false)
  })

  it('house rule 1: clamps to the box the caller passes — never assumes viewport size', () => {
    // A figure box much smaller than any real viewport: the readout must stay inside IT.
    const p = placeReadout({ anchorX: 40, anchorY: 40, width: 60, height: 30, boxWidth: 120, boxHeight: 90, gap: 4 })
    expect(p.x + 60).toBeLessThanOrEqual(120 + 1e-9)
    expect(p.y + 30).toBeLessThanOrEqual(90 + 1e-9)
    expect(p.x).toBeGreaterThanOrEqual(0)
    expect(p.y).toBeGreaterThanOrEqual(0)
  })

  it('house rule 2: flips left instead of clipping near the right edge', () => {
    const p = placeReadout({ anchorX: 380, anchorY: 50, width: 100, height: 40, boxWidth: 400, boxHeight: 300 })
    expect(p.flippedX).toBe(true)
    expect(p.x).toBeLessThan(380)
  })

  it('house rule 2: flips up instead of clipping near the bottom edge', () => {
    const p = placeReadout({ anchorX: 50, anchorY: 280, width: 100, height: 40, boxWidth: 400, boxHeight: 300 })
    expect(p.flippedY).toBe(true)
    expect(p.y).toBeLessThan(280)
  })

  it('flips both axes near a corner, and still never exceeds the box', () => {
    const p = placeReadout({ anchorX: 395, anchorY: 295, width: 80, height: 50, boxWidth: 400, boxHeight: 300 })
    expect(p.flippedX).toBe(true)
    expect(p.flippedY).toBe(true)
    expect(p.x + 80).toBeLessThanOrEqual(400 + 1e-9)
    expect(p.y + 50).toBeLessThanOrEqual(300 + 1e-9)
  })

  it('accepts a custom gap', () => {
    const tight = placeReadout({ anchorX: 10, anchorY: 10, width: 20, height: 10, boxWidth: 200, boxHeight: 200, gap: 2 })
    const loose = placeReadout({ anchorX: 10, anchorY: 10, width: 20, height: 10, boxWidth: 200, boxHeight: 200, gap: 20 })
    expect(loose.x).toBeGreaterThan(tight.x)
    expect(loose.y).toBeGreaterThan(tight.y)
  })
})

// ---------------------------------------------------------------------------------------------
// createReadout: DOM glue, tested against lightweight fakes rather than jsdom/happy-dom (no
// existing test in this repo pulls in a DOM environment — see dataviz/runtime.test.ts for the
// same approach with setVars/readJsonScript).

interface FakeRect {
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
  x: number
  y: number
}

function fakeRect(width: number, height: number): FakeRect {
  return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 }
}

function fakeReadoutEl(width: number, height: number) {
  const vars: Record<string, string> = {}
  const children: Node[] = []
  return {
    hidden: true,
    textContent: '',
    style: { setProperty: (k: string, v: string) => { vars[k] = v } },
    appendChild: (n: Node) => { children.push(n) },
    getBoundingClientRect: () => fakeRect(width, height),
    _vars: vars,
    _children: children,
  }
}

function fakeFigureEl(width: number, height: number) {
  return { getBoundingClientRect: () => fakeRect(width, height) }
}

describe('createReadout', () => {
  it('shows the content node, un-hides, and sets --dv-x/--dv-y via setVars (CSP-safe path)', () => {
    const el = fakeReadoutEl(100, 40)
    const figure = fakeFigureEl(400, 300)
    const handle = createReadout(el as unknown as HTMLElement, figure as unknown as Element)
    const content = { nodeType: 1 } as unknown as Node

    handle.show(content, { anchorX: 50, anchorY: 50 })

    expect(el.hidden).toBe(false)
    expect(el._children).toContain(content)
    expect(el._vars['--dv-x']).toMatch(/px$/)
    expect(el._vars['--dv-y']).toMatch(/px$/)
  })

  it('hide() sets hidden back to true', () => {
    const el = fakeReadoutEl(100, 40)
    const figure = fakeFigureEl(400, 300)
    const handle = createReadout(el as unknown as HTMLElement, figure as unknown as Element)
    handle.show({ nodeType: 1 } as unknown as Node, { anchorX: 10, anchorY: 10 })
    expect(el.hidden).toBe(false)
    handle.hide()
    expect(el.hidden).toBe(true)
  })

  it('clamps against the FIGURE rect passed in, not some larger implicit box', () => {
    const el = fakeReadoutEl(90, 40)
    const tinyFigure = fakeFigureEl(120, 80)
    const handle = createReadout(el as unknown as HTMLElement, tinyFigure as unknown as Element)
    handle.show({ nodeType: 1 } as unknown as Node, { anchorX: 100, anchorY: 60 })
    const x = Number.parseFloat(el._vars['--dv-x'])
    const y = Number.parseFloat(el._vars['--dv-y'])
    expect(x + 90).toBeLessThanOrEqual(120 + 1e-9)
    expect(y + 40).toBeLessThanOrEqual(80 + 1e-9)
  })
})

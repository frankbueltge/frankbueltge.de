// The two tones of the entrance's stills (2026-11-03): docs/design_handoff_homepage_calm/README.md §5.
import { describe, expect, it } from 'vitest'
import { DUOTONES, duotone, isDark, luminance, PAPER_FROM, toneOf } from './duotone'

const hex = ([r, g, b]: number[]) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`

describe('the tones', () => {
  it('are the handoff’s: ink to cream in the light theme, light ink to dark paper in the dark one', () => {
    expect(DUOTONES.light).toEqual({ ink: '#161412', paper: '#fbf8f1' })
    expect(DUOTONES.dark).toEqual({ ink: '#ece6d9', paper: '#221f1b' })
  })

  it('weighs a pixel’s luminance as the handoff does', () => {
    expect(luminance(255, 255, 255)).toBeCloseTo(1)
    expect(luminance(0, 255, 0)).toBeCloseTo(0.7152)
  })

  it('lays black on ink and lays everything from eighty-five per cent up on pure paper', () => {
    for (const tone of Object.values(DUOTONES)) {
      expect(hex(toneOf(0, tone))).toBe(tone.ink)
      expect(hex(toneOf(PAPER_FROM, tone))).toBe(tone.paper)
      expect(hex(toneOf(0.93, tone))).toBe(tone.paper)
    }
  })

  it('is linear between ink and paper', () => {
    const mid = toneOf(PAPER_FROM / 2, DUOTONES.light)
    expect(mid[0]).toBe(Math.round((0x16 + 0xfb) / 2))
  })
})

describe('a picture', () => {
  // two pixels: a white one and a black one, RGBA
  const page = Uint8Array.from([255, 255, 255, 255, 0, 0, 0, 255, 250, 250, 250, 255])

  it('keeps a light page the right way round, its grey ground pure paper', () => {
    expect(isDark(page, 4)).toBe(false)
    const out = duotone(page, 4, DUOTONES.light, false)
    expect(out.length).toBe(9)
    expect(hex([...out.slice(0, 3)])).toBe(DUOTONES.light.paper)
    expect(hex([...out.slice(3, 6)])).toBe(DUOTONES.light.ink)
    expect(hex([...out.slice(6, 9)])).toBe(DUOTONES.light.paper)
  })

  it('turns a dark page round first, so it lands on paper too', () => {
    const night = Uint8Array.from([10, 10, 10, 30, 30, 30, 255, 255, 255])
    expect(isDark(night, 3)).toBe(true)
    const out = duotone(night, 3, DUOTONES.light, true)
    expect(hex([...out.slice(0, 3)])).toBe(DUOTONES.light.paper)
    expect(hex([...out.slice(6, 9)])).toBe(DUOTONES.light.ink)
  })

  it('sets the dark theme’s file as the same picture in the dark tones', () => {
    const out = duotone(page, 4, DUOTONES.dark, false)
    expect(hex([...out.slice(0, 3)])).toBe(DUOTONES.dark.paper)
    expect(hex([...out.slice(3, 6)])).toBe(DUOTONES.dark.ink)
  })
})

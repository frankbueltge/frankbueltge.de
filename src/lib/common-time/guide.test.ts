import { describe, expect, it } from 'vitest'
import { buildGuide, GUIDE_FRAME, GUIDE_H, GUIDE_W } from './guide'
import { readPressings } from './score'

const pressings = readPressings()

describe('the listening guide', () => {
  it.each(pressings.map((p) => [p.week, p] as const))('%s draws every mark inside its box', (_, p) => {
    const g = buildGuide(p)
    const inside = (x: number, y: number): boolean => x >= 0 && x <= GUIDE_W && y >= 0 && y <= GUIDE_H
    for (const r of [...g.theme, ...g.melody, ...g.crowd]) {
      expect(inside(r.x, r.y) && inside(r.x + r.w, r.y + r.h), JSON.stringify(r)).toBe(true)
      expect(r.w).toBeGreaterThan(0)
    }
    for (const t of g.ornaments) expect(inside(t.x, t.y1) && inside(t.x, t.y2)).toBe(true)
    for (const d of g.days) expect(inside(d.x, GUIDE_FRAME.dayLabelY)).toBe(true)
  })

  it.each(pressings.map((p) => [p.week, p] as const))('%s draws exactly what the score holds', (_, p) => {
    const g = buildGuide(p)
    expect(g.days).toHaveLength(p.sections.length)
    expect(g.melody).toHaveLength(2 * p.sections.filter((s) => s.melody).length)
    expect(g.ornaments).toHaveLength(p.sections.reduce((n, s) => n + s.ornaments.length, 0))
    expect(g.crowd).toHaveLength(p.sections.filter((s) => s.crowd_per_bar > 0).length)
    const themeDays = p.sections.filter((s) => s.theme.present).length
    expect(g.theme.length % Math.max(1, themeDays)).toBe(0)
    expect(g.theme.length > 0).toBe(themeDays > 0)
  })

  it('is the same drawing twice from the same score, with every coordinate rounded once', () => {
    const p = pressings.at(-1)!
    expect(buildGuide(p)).toEqual(buildGuide(p))
    for (const r of buildGuide(p).melody) {
      for (const n of [r.x, r.y, r.w, r.h]) expect(Math.round(n * 10) / 10).toBe(n)
    }
  })

  it('makes a melody taller the more families carried it', () => {
    const p = pressings.at(-1)!
    const g = buildGuide(p)
    const withMelody = p.sections.filter((s) => s.melody)
    withMelody.forEach((s, i) => {
      expect(g.melody[2 * i]!.h).toBe(Math.min(28, 4 + 4 * s.melody!.families.length))
    })
  })
})

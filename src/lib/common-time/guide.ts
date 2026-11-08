// src/lib/common-time/guide.ts — the listening guide of a pressing, as geometry (2026-11-08).
//
// What plays when, drawn from the pressing's own score and nothing else: the theme bar by bar on
// the days it was on the charts, each day's melody twice and as tall as the number of families
// that carried it, every ornament at its sixteenth, and the crowd as a band as dense as the day's
// signals. The page renders this as a server-side SVG with a native <title> on every mark and the
// same facts as a table under it. Pure and deterministic: every coordinate is rounded once, here.
import { INSTRUMENT, type Family } from './arrangement'
import { dayShort, type Pressing } from './score'

export const GUIDE_W = 960
export const GUIDE_H = 176
const X0 = 92
const X1 = GUIDE_W - 8
export const ROWS = [
  { id: 'theme', label: 'theme', y: 26 },
  { id: 'melody', label: 'melody', y: 66 },
  { id: 'ornaments', label: 'ornaments', y: 106 },
  { id: 'crowd', label: 'crowd', y: 132 },
] as const
const TOP = 8
const BOTTOM = 146
const DAY_LABEL_Y = 164

export interface GuideRect {
  x: number
  y: number
  w: number
  h: number
  title: string
}
export interface GuideTick {
  x: number
  y1: number
  y2: number
  title: string
}
export interface Guide {
  width: number
  height: number
  rows: { id: string; label: string; y: number }[]
  days: { x: number; label: string; day: string }[]
  span: { x0: number; x1: number; outro: number }
  theme: GuideRect[]
  melody: GuideRect[]
  ornaments: GuideTick[]
  crowd: GuideRect[]
}

const r1 = (n: number): number => Math.round(n * 10) / 10

const familiesInWords = (families: readonly Family[]): string =>
  families.map((f) => INSTRUMENT[f]).join(', ')

export function buildGuide(p: Pressing): Guide {
  const beat = 60 / p.patch.bpm
  const bar = 4 * beat
  const eighth = beat / 2
  const sixteenth = beat / 4
  const x = (t: number): number => r1(X0 + (t / p.audio.seconds) * (X1 - X0))
  const rowY = (id: string): number => ROWS.find((r) => r.id === id)!.y

  const theme: GuideRect[] = []
  const melody: GuideRect[] = []
  const ornaments: GuideTick[] = []
  const crowd: GuideRect[] = []

  const themeLength = p.theme ? p.theme.motif.reduce((s, [, l]) => s + l, 0) * eighth : 0
  const period = themeLength <= bar ? bar : 2 * bar
  for (const s of p.sections) {
    const day = dayShort(s.day)
    if (p.theme && s.theme.present) {
      for (let t = s.from_s; t < s.to_s - 1e-9; t += period) {
        theme.push({ x: x(t), y: rowY('theme') - 4, w: r1(x(t + themeLength) - x(t)), h: 8, title: `${p.theme.label}, ${day}: ${familiesInWords(s.theme.families)}` })
      }
    }
    if (s.melody) {
      const length = 2 * s.melody.motif.reduce((sum, [, l]) => sum + l, 0) * eighth
      const h = Math.min(28, 4 + 4 * s.melody.families.length)
      for (const half of [0, (p.patch.day_bars / 2) * bar]) {
        const t = s.from_s + half
        melody.push({ x: x(t), y: r1(rowY('melody') - h / 2), w: r1(x(t + length) - x(t)), h, title: `${s.melody.label}, ${day}: ${familiesInWords(s.melody.families)}` })
      }
    }
    for (const o of s.ornaments) {
      const t = s.from_s + o.slot * sixteenth
      ornaments.push({ x: x(t), y1: rowY('ornaments') - 6, y2: rowY('ornaments') + 6, title: `${o.label}, ${day}` })
    }
    if (s.crowd_per_bar > 0) {
      const h = r1(2 + (8 * s.crowd_per_bar) / 16)
      crowd.push({ x: x(s.from_s), y: r1(rowY('crowd') - h / 2), w: r1(x(s.to_s) - x(s.from_s)), h, title: `${s.signals} other signals, ${day}` })
    }
  }

  return {
    width: GUIDE_W,
    height: GUIDE_H,
    rows: ROWS.map((r) => ({ ...r })),
    days: p.sections.map((s) => ({ x: x(s.from_s), label: dayShort(s.day), day: s.day })),
    span: { x0: X0, x1: X1, outro: x(p.sections.at(-1)!.to_s) },
    theme,
    melody,
    ornaments,
    crowd,
  }
}

export const GUIDE_FRAME = { top: TOP, bottom: BOTTOM, dayLabelY: DAY_LABEL_Y } as const

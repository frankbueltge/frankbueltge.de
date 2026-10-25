// src/lib/reading/figure.ts — the geometry of the gap figure (2026-10-26).
//
// One mark per matter: across, how loud the web was about it (signals in the round's window, on a
// log scale so a silent matter and a matter of a hundred signals both stay readable); up, how urgent
// this audience judged it (the score, 0–100), with its interval as a vertical stroke. Before anyone
// has taken part every mark sits on the 50 line, and the figure says so. Matters on the briefing's
// "urgent but quiet" list are drawn as rings, the others as dots — shape, not colour, so the figure
// holds in greyscale and print. The page draws what this returns and computes nothing itself.
import type { RankRow } from './rank'

export interface FigureBox {
  width: number
  height: number
  padLeft: number
  padRight: number
  padTop: number
  padBottom: number
}

/** The work's own figure. The gallery's miniature passes its own, smaller box. */
export const BOX: FigureBox = { width: 720, height: 360, padLeft: 56, padRight: 24, padTop: 20, padBottom: 52 }

export interface FigureMark {
  id: string
  title: string
  quiet: boolean
  signals: number
  score: number
  x: number
  y: number
  yLow: number
  yHigh: number
  /** where the label sits, nudged apart when two marks would collide */
  labelX: number
  labelY: number
  anchor: 'start' | 'end'
}

export interface FigureTick {
  value: number
  label: string
  at: number
}

export interface GapFigure {
  marks: FigureMark[]
  xTicks: FigureTick[]
  yTicks: FigureTick[]
  /** y of the 50 line */
  mid: number
}

/** log10(1 + signals), so zero has a place on the axis. */
const lx = (signals: number): number => Math.log10(1 + Math.max(0, signals))

export function gapFigure(
  matters: readonly { id: string; title: string; quiet: boolean; signals: number }[],
  rank: readonly RankRow[],
  box: FigureBox = BOX,
): GapFigure {
  const plotW = box.width - box.padLeft - box.padRight
  const plotH = box.height - box.padTop - box.padBottom
  const maxSignals = Math.max(1, ...matters.map((m) => m.signals))
  const top = Math.ceil(lx(maxSignals) * 2) / 2
  const xAt = (signals: number): number => box.padLeft + (lx(signals) / top) * plotW
  const yAt = (score: number): number => box.padTop + (1 - score / 100) * plotH
  const byId = new Map(rank.map((r) => [r.id, r]))

  const marks: FigureMark[] = matters.map((m) => {
    const r = byId.get(m.id)
    const score = r?.score ?? 50
    const x = xAt(m.signals)
    const anchor: 'start' | 'end' = x > box.padLeft + plotW * 0.7 ? 'end' : 'start'
    return {
      id: m.id,
      title: m.title,
      quiet: m.quiet,
      signals: m.signals,
      score,
      x,
      y: yAt(score),
      yLow: yAt(r?.low ?? score),
      yHigh: yAt(r?.high ?? score),
      labelX: anchor === 'start' ? x + 9 : x - 9,
      labelY: yAt(score) + 4,
      anchor,
    }
  })

  // Labels that would overlap are pushed apart vertically, in order of height, 13 units at least.
  const order = [...marks].sort((a, b) => a.labelY - b.labelY || a.x - b.x)
  for (let i = 1; i < order.length; i++) {
    const prev = order[i - 1]!
    const cur = order[i]!
    const near = Math.abs(cur.labelX - prev.labelX) < 150
    if (near && cur.labelY - prev.labelY < 13) cur.labelY = prev.labelY + 13
  }

  const xTicks: FigureTick[] = [0, 1, 3, 10, 30, 100, 300, 1000]
    .filter((v) => lx(v) <= top + 1e-9)
    .map((v) => ({ value: v, label: String(v), at: xAt(v) }))
  const yTicks: FigureTick[] = [0, 25, 50, 75, 100].map((v) => ({ value: v, label: String(v), at: yAt(v) }))
  return { marks, xTicks, yTicks, mid: yAt(50) }
}

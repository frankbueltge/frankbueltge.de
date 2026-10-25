// src/lib/reading/rank.ts — the third reading's ranking, from pairwise choices (2026-10-26).
//
// A Bradley–Terry model, fitted by the MM algorithm (Hunter 2004): each matter gets a strength, and the
// chance that one is chosen over another is its strength over the sum of both. Two choices make it
// honest at a small count:
//
//   · every matter also meets a fixed reference of strength 1, winning once and losing once (PRIOR).
//     That keeps a matter that was never chosen from sinking to zero and pulls every strength towards
//     the middle until real choices outweigh it — with few readings the ranking stays flat, as it
//     should;
//   · the score shown is the model's chance that a matter is chosen over a randomly picked other one,
//     in per cent (the score of Salganik and Levy's wiki surveys), with an interval from resampling
//     whole readings (a seeded bootstrap, so the same snapshot always gives the same interval).
//
// "Equally urgent" enters the model as half a win for each side (the usual reading of a tie in a
// Bradley–Terry fit); "can't say" is counted beside the model, never inside it.
import { seeded, type Rand } from './draw'

export interface Choice {
  winner: string
  loser: string
  /** both judged equally urgent: half a win each */
  tie?: boolean
}

export interface RankRow {
  id: string
  /** chance of being chosen over a random other matter, 0–100 */
  score: number
  /** 90 % bootstrap interval of the score */
  low: number
  high: number
  /** judged pairs this matter appeared in, how often it was chosen, how often it was tied */
  appearances: number
  wins: number
  ties: number
}

export const PRIOR = 1
const ITERATIONS = 2000
const TOLERANCE = 1e-10

/** Strengths per id; the reference the prior is played against has strength 1. */
export function fitStrengths(ids: readonly string[], choices: readonly Choice[], prior = PRIOR): Map<string, number> {
  const index = new Map(ids.map((id, i) => [id, i]))
  const n = ids.length
  const wins = new Array<number>(n).fill(prior)
  const meet: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (const c of choices) {
    const w = index.get(c.winner)
    const l = index.get(c.loser)
    if (w === undefined || l === undefined || w === l) continue
    if (c.tie) {
      wins[w]! += 0.5
      wins[l]! += 0.5
    } else wins[w]! += 1
    meet[w]![l]! += 1
    meet[l]![w]! += 1
  }
  let p = new Array<number>(n).fill(1)
  for (let it = 0; it < ITERATIONS; it++) {
    const next = p.map((pi, i) => {
      let denom = (2 * prior) / (pi + 1)
      for (let j = 0; j < n; j++) if (meet[i]![j]) denom += meet[i]![j]! / (pi + p[j]!)
      return wins[i]! / denom
    })
    const delta = next.reduce((d, v, i) => Math.max(d, Math.abs(Math.log(v) - Math.log(p[i]!))), 0)
    p = next
    if (delta < TOLERANCE) break
  }
  return new Map(ids.map((id, i) => [id, p[i]!]))
}

/** Chance of being chosen over a random other matter, per id, 0–100. */
export function scores(strengths: Map<string, number>): Map<string, number> {
  const ids = [...strengths.keys()]
  return new Map(
    ids.map((i) => {
      const pi = strengths.get(i)!
      const others = ids.filter((j) => j !== i)
      const mean = others.reduce((s, j) => s + pi / (pi + strengths.get(j)!), 0) / Math.max(others.length, 1)
      return [i, mean * 100]
    }),
  )
}

const quantile = (sorted: readonly number[], q: number): number => {
  if (!sorted.length) return NaN
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo)
}

const round1 = (x: number): number => Math.round(x * 10) / 10

/**
 * The ranking of a round: one list of choices per reading (so the bootstrap can resample readers, not
 * single clicks), highest score first, ties broken by id so the order is stable.
 */
export function rankMatters(ids: readonly string[], readings: readonly (readonly Choice[])[], opts: { resamples?: number; seed?: number } = {}): RankRow[] {
  const resamples = opts.resamples ?? 400
  const all = readings.flat()
  const point = scores(fitStrengths(ids, all))
  const draws = new Map<string, number[]>(ids.map((id) => [id, []]))
  if (readings.length > 0) {
    const rand: Rand = seeded(opts.seed ?? 20261026)
    for (let b = 0; b < resamples; b++) {
      const sample: Choice[] = []
      for (let r = 0; r < readings.length; r++) sample.push(...readings[Math.floor(rand() * readings.length)]!)
      for (const [id, s] of scores(fitStrengths(ids, sample))) draws.get(id)!.push(s)
    }
  }
  const tally = new Map<string, { appearances: number; wins: number; ties: number }>(ids.map((id) => [id, { appearances: 0, wins: 0, ties: 0 }]))
  for (const c of all) {
    const w = tally.get(c.winner)
    const l = tally.get(c.loser)
    if (!w || !l) continue
    w.appearances++
    l.appearances++
    if (c.tie) {
      w.ties++
      l.ties++
    } else w.wins++
  }
  return ids
    .map((id) => {
      const d = [...draws.get(id)!].sort((a, b) => a - b)
      const s = point.get(id)!
      return {
        id,
        score: round1(s),
        low: round1(d.length ? quantile(d, 0.05) : s),
        high: round1(d.length ? quantile(d, 0.95) : s),
        ...tally.get(id)!,
      }
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
}

/** Spearman's rank correlation of two equally long lists of values (average ranks for ties). */
export function spearman(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 3) return null
  const ranks = (v: readonly number[]): number[] => {
    const order = v.map((value, i) => ({ value, i })).sort((a, b) => a.value - b.value)
    const out = new Array<number>(v.length)
    for (let k = 0; k < order.length; ) {
      let e = k
      while (e + 1 < order.length && order[e + 1]!.value === order[k]!.value) e++
      for (let m = k; m <= e; m++) out[order[m]!.i] = (k + e) / 2 + 1
      k = e + 1
    }
    return out
  }
  const rx = ranks(x)
  const ry = ranks(y)
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
  const mx = mean(rx)
  const my = mean(ry)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < rx.length; i++) {
    num += (rx[i]! - mx) * (ry[i]! - my)
    dx += (rx[i]! - mx) ** 2
    dy += (ry[i]! - my) ** 2
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null
}

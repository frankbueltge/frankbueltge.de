// src/lib/reading/draw.ts — what a reading is shown, drawn at random (2026-10-26).
//
// The pairs and the estimates are drawn in the visitor's browser, uniformly: every unordered pair of
// matters is equally likely, and which side a matter appears on is a coin toss, so neither the order
// of the briefing nor the left-hand seat can lean on the answers. The draw takes its randomness as an
// argument, so the tests can pin it and the page can feed it crypto.getRandomValues.

export type Rand = () => number

/** A small seeded generator (mulberry32) for tests and for the bootstrap; never for anything secret. */
export function seeded(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The browser's own randomness, as a Rand. */
export function cryptoRand(): Rand {
  const buf = new Uint32Array(1)
  return () => {
    crypto.getRandomValues(buf)
    return buf[0]! / 4294967296
  }
}

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], rand: Rand): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** `k` distinct unordered pairs of `ids`, each shown with its sides in random order. */
export function drawPairs(ids: readonly string[], k: number, rand: Rand): [string, string][] {
  const all: [string, string][] = []
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) all.push([ids[i]!, ids[j]!])
  if (k > all.length) throw new Error(`cannot draw ${k} pairs from ${all.length}`)
  return shuffle(all, rand)
    .slice(0, k)
    .map(([a, b]) => (rand() < 0.5 ? [a, b] : [b, a]))
}

/** `k` distinct items, in random order. */
export function drawSome<T>(items: readonly T[], k: number, rand: Rand): T[] {
  if (k > items.length) throw new Error(`cannot draw ${k} of ${items.length}`)
  return shuffle(items, rand).slice(0, k)
}

/** The key of an unordered pair, the same whichever side each matter sat on. */
export const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`)

// src/lib/ops/shelf-order.ts — the order the entrance's shelf stands in on one visit (2026-10-21).
//
// The edition shuffles its selected works on every visit, so a returning reader meets a different
// first card each time and no pick owns the top-left corner (Frank's request of 2026-10-21,
// wording private). The page is rendered in the hand order of src/config/selected-works.ts, which
// is what a reader without JavaScript sees and what /dossier keeps as the shelf of record; the
// edition's script (HomeEdition.astro) reorders the cards with the permutation this returns.

/** A uniformly random order of `n` positions (Fisher–Yates). `random` returns a number in [0, 1). */
export function shuffledOrder(n: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

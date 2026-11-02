// src/lib/ops/shelf-order.ts — which cards the entrance's shelf shows on one visit (2026-10-21).
//
// The edition draws its eight cards at random on every visit from every finished piece the site
// publishes (src/lib/ops/shelf-pool.ts; Frank's request of 2026-10-21, made precise on 2026-10-22,
// wording private). The page is rendered with the hand-chosen picks of src/config/selected-works.ts
// showing, which is what a reader without JavaScript sees and what /dossier keeps as the shelf of
// record; the edition's script (HomeEdition.astro) shows the first eight of the permutation this
// returns, in its order.

/** A uniformly random order of `n` positions (Fisher–Yates). `random` returns a number in [0, 1). */
export function shuffledOrder(n: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

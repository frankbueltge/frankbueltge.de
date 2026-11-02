// src/lib/ops/carousel.ts — where a scroll-snap carousel stands, read from its own geometry
// (2026-11-02).
//
// The lab's carousel on the entrance (src/components/ops/LabCarousel.tsx) is a row of slides the
// browser scrolls and snaps by itself, with or without JavaScript. The island only asks two
// things of it: which slide the row stands at, and which slide a step lands on. Both answers are
// arithmetic on numbers the island measures, so they live here, pure and tested, and the island
// computes nothing of its own — the first duty of an interactive figure
// (.claude/rules/dataviz-figures.md), kept by a control as well as by a figure.
//
// This module is shipped to the browser: it imports nothing.

/**
 * The slide the row stands at: the one whose snap position is nearest the scroll offset, and the
 * last one once the row cannot scroll any further, because a last slide narrower than the row may
 * never reach its own snap position.
 *
 * `positions` are the slides' snap offsets measured from the first slide's, in order; `scrollLeft`
 * is the row's own scroll offset and `maxScroll` the furthest it can go (scrollWidth − clientWidth).
 */
export function currentSlide(positions: readonly number[], scrollLeft: number, maxScroll: number): number {
  if (positions.length === 0) return 0
  // a pixel of slack: a scroll offset is fractional on a zoomed or high-density screen
  if (maxScroll > 0 && scrollLeft >= maxScroll - 1) return positions.length - 1
  let best = 0
  for (let i = 1; i < positions.length; i++) {
    if (Math.abs(positions[i] - scrollLeft) < Math.abs(positions[best] - scrollLeft)) best = i
  }
  return best
}

/** The slide a step of `by` slides from `from` lands on. The row has two ends and does not wrap: a
 *  step past the first or the last slide stays there. */
export function stepSlide(from: number, by: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(count - 1, Math.max(0, Math.round(from) + by))
}

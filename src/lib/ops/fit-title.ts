// src/lib/ops/fit-title.ts — the size that sets a line of type exactly to the width it has
// (2026-11-03, the calm homepage: the standing question stands on one line at every width,
// docs/design_handoff_homepage_calm/README.md §1).
//
// Type scales linearly with its size, so a line measured at one size is fitted by one ratio. The
// edition's script measures the line and sets the result as a custom property (setVars), never a
// style attribute.

/**
 * The size at which a line measured `width` wide at `size` fills `available`, capped at `max`.
 * Null where nothing was measured (a hidden or empty line), so the stylesheet's size stays.
 */
export function fitFontSize(p: { width: number; size: number; available: number; max: number }): number | null {
  if (!(p.width > 0) || !(p.size > 0) || !(p.available > 0)) return null
  const fitted = (p.size * p.available) / p.width
  return Math.floor(Math.min(p.max, fitted) * 100) / 100
}

// src/lib/comma/score.ts — the geometry of Comma's live score (2026-11-13). Pure: the island measures its box and asks
// here where every mark goes, so the drawing can be checked without a browser.
//
// The score is drawn in the box's own pixels. On a wide box the six row names stand in a column on the left and the
// score shows the last WIDE_SECONDS; on a narrow one (a phone) the names stand above their rows, the score takes the
// whole width and shows the last NARROW_SECONDS, so a mark keeps roughly the same speed across the screen.

import { GROUPS } from './groups'

export const NARROW_BELOW = 560
export const WIDE_SECONDS = 45
export const NARROW_SECONDS = 24
/** below this weight a suspicion is barely audible, so the score draws it faint and the tally leaves it out */
export const AUDIBLE_WEIGHT = 0.25

export interface Layout {
  width: number
  height: number
  left: number
  right: number
  top: number
  row: number
  seconds: number
  namesAbove: boolean
}

export function layoutFor(width: number): Layout {
  const w = Math.max(280, Math.round(width))
  const namesAbove = w < NARROW_BELOW
  const top = namesAbove ? 40 : 34
  const row = namesAbove ? 54 : 46
  return {
    width: w,
    height: top + row * GROUPS.length - (namesAbove ? 6 : 0),
    left: namesAbove ? 10 : Math.min(196, Math.round(w * 0.2)),
    right: w - 10,
    top,
    row,
    seconds: namesAbove ? NARROW_SECONDS : WIDE_SECONDS,
    namesAbove,
  }
}

/** Where a moment `t` (audio-clock seconds) stands when the clock reads `now`: the newest at the right edge. */
export const xOf = (l: Layout, now: number, t: number): number => l.right - ((now - t) / l.seconds) * (l.right - l.left)
export const yOf = (l: Layout, group: number): number => l.top + group * l.row
/** One second of asking, as wide as a second is on this box, less a hair of air. */
export const bandWidth = (l: Layout): number => Math.max(1, (l.right - l.left) / l.seconds - 1)
/** A label near the right edge turns to the left of its mark, so it is never cut off. */
export const labelEnd = (l: Layout, x: number, chars: number): boolean => x + 8 + chars * 7 > l.width - 4
export const visible = (l: Layout, now: number, t: number, length = 0): boolean => t <= now && t + length >= now - l.seconds
export const weightTier = (w: number): 1 | 2 | 3 | 4 => (w >= 0.75 ? 4 : w >= 0.5 ? 3 : w >= AUDIBLE_WEIGHT ? 2 : 1)

/** Labels of marks close together on one row step down, so two blockpages in the same second stay readable. Takes
 *  the marks in time order and answers each one's step (0, 1, 2, then round again). */
export function stagger(marks: readonly { row: number; x: number; chars: number }[]): number[] {
  const last = new Map<number, { x: number; chars: number; step: number }>()
  return marks.map((m) => {
    const prev = last.get(m.row)
    const step = prev && Math.abs(m.x - prev.x) < Math.max(m.chars, prev.chars) * 7 + 12 ? (prev.step + 1) % 3 : 0
    last.set(m.row, { x: m.x, chars: m.chars, step })
    return step
  })
}

/** Where a blockpage's label stands: above the row on a wide box, below it on a phone (the name is above there). */
export const bellLabelY = (l: Layout, y: number, step: number): number => (l.namesAbove ? y + 24 + step * 12 : y - 9 - step * 12)

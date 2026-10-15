// src/components/ecology/score-kit/laneWalk.ts — the keyboard walk along a lane, pure (visual
// layer, Phase 3d, 2026-09-02; the arrow-key logic of the cycle partitur, extracted).
//
// A score's marks are grouped by lane (stepper.ts's Segmented); the arrow keys walk within the
// lane the focused mark is on, Home and End jump to its ends, and stepping past an end is a no-op
// — the contract stepper.ts's step() already carries. Behaviour only: no DOM, so it is tested
// without one.
import { step, type Segmented } from '@/lib/dataviz/stepper'

export const WALK_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'] as const
export type WalkKey = (typeof WALK_KEYS)[number]

export function isWalkKey(key: string): key is WalkKey {
  return (WALK_KEYS as readonly string[]).includes(key)
}

function segmentAt<T>(walk: Segmented<T>, pos: number): { start: number; end: number } | null {
  for (const seg of Object.values(walk.segments)) {
    if (pos >= seg.start && pos < seg.end) return seg
  }
  return null
}

/** The index the walk lands on from `pos` for `key` — `pos` itself when there is nowhere to go. */
export function walkTo<T>(walk: Segmented<T>, pos: number, key: WalkKey): number {
  if (pos < 0 || pos >= walk.items.length) return pos
  const segment = segmentAt(walk, pos)
  switch (key) {
    case 'ArrowLeft':
      return step(walk, pos, -1)
    case 'ArrowRight':
      return step(walk, pos, 1)
    case 'Home':
      return segment ? segment.start : pos
    case 'End':
      return segment ? segment.end - 1 : pos
  }
}

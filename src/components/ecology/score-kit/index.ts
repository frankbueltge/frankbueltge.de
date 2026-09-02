// src/components/ecology/score-kit — what the house's scores share once they are islands
// (visual layer, Phase 3d, 2026-09-02): the ruler zoom, the readout binding, the card's focus
// discipline, the keyboard walk, and the two `dv:` events of the tour contract. Extracted from
// the cycle partitur (Phase 1) so the Middle's score and the Studio's floor are built on the
// same idiom rather than three copies of it. Geometry never lives here — every score keeps its
// own pure model in src/lib/**, and this kit only mounts, animates and answers the pointer.
import * as React from 'react'

export { useZoomX, IDENTITY_ZOOM, type ZoomXView, type ZoomXHandle, type ZoomXOptions } from './useZoomX'
export { useReadout, type ReadoutBinding } from './useReadout'
export { useFigureReady } from './useFigureReady'
export { emitMarkSelected, type MarkSelectedDetail } from './events'
export { walkTo, isWalkKey, WALK_KEYS, type WalkKey } from './laneWalk'
export { default as ZoomControls, ZOOM_STEP, type ZoomControlsWording, type ZoomControlsProps } from './ZoomControls'

/** The card takes focus when it opens, so a keyboard reader lands inside what just appeared. */
export function useFocusOnOpen(open: string | null, cardRef: React.RefObject<HTMLElement | null>): void {
  React.useEffect(() => {
    if (open) cardRef.current?.focus()
  }, [open, cardRef])
}

/** Whether the island is on screen — false pauses zoom handlers and any ambient work. Starts
 *  true so the server render and the first client render agree. */
export function useOnScreen(rootRef: React.RefObject<HTMLElement | null>, rootMargin = '128px'): boolean {
  const [onScreen, setOnScreen] = React.useState(true)
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), {
      rootMargin,
    })
    io.observe(root)
    return () => io.disconnect()
  }, [rootRef, rootMargin])
  return onScreen
}

/** Focuses the mark element carrying `data-mark=<id>` inside the island. */
export function focusMarkIn(root: HTMLElement | null, id: string): void {
  root?.querySelector<SVGElement>(`[data-mark="${CSS.escape(id)}"]`)?.focus()
}

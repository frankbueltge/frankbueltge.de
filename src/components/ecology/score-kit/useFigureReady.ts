// src/components/ecology/score-kit/useFigureReady.ts — the tour handshake, for islands
// (visual layer, Phase 3d, 2026-09-02).
//
// A figure opts in by dispatching `dv:figure-ready` with its id and an `apply(focus)` callback;
// a tour, a dossier, anything on the page may then drive it through the registry in
// src/lib/tour/engine.ts — and the figure knows nothing about who is listening. The one guarantee
// the bare dispatch does not give: the registry's listener must exist BEFORE the announcement,
// or a figure whose bundle runs first dispatches into an empty room (observed on /studio, where
// the floor's module ran ahead of the tour's). ensureFigureReadyListener() is idempotent, so
// calling it here costs nothing and closes that gap for every island.
import * as React from 'react'

import { ensureFigureReadyListener } from '@/lib/tour/engine'
import type { FocusState } from '@/lib/tour/types'

/** An EMPTY id is "this island keeps no tour contract" and registers nothing (added 2026-09-03 for
 *  the living globe's compact entrance: one island serves the room and the front door, and only the
 *  room may be driven — a story must not be able to fly, re-day or open a card in a hero that
 *  renders no controls). It is a guard here rather than a conditional hook at every call site,
 *  because a hook cannot be called conditionally and `getFigure('')` is a lookup nothing does. */
export function useFigureReady(figureId: string, apply: (focus: FocusState) => void): void {
  const applyRef = React.useRef(apply)
  applyRef.current = apply

  React.useEffect(() => {
    if (!figureId) return
    ensureFigureReadyListener()
    window.dispatchEvent(
      new CustomEvent('dv:figure-ready', {
        detail: { id: figureId, apply: (focus: FocusState) => applyRef.current(focus) },
      }),
    )
  }, [figureId])
}

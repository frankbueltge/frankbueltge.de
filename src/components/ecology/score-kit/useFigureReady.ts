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

export function useFigureReady(figureId: string, apply: (focus: FocusState) => void): void {
  const applyRef = React.useRef(apply)
  applyRef.current = apply

  React.useEffect(() => {
    ensureFigureReadyListener()
    window.dispatchEvent(
      new CustomEvent('dv:figure-ready', {
        detail: { id: figureId, apply: (focus: FocusState) => applyRef.current(focus) },
      }),
    )
  }, [figureId])
}

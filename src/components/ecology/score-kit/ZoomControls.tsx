// src/components/ecology/score-kit/ZoomControls.tsx — the `+ − 0` group a zoomable score shows
// (visual layer, Phase 3d, 2026-09-02; the cycle partitur's controls, extracted).
//
// Hidden until the island has mounted: a control that does nothing without JavaScript is worse
// than no control, and the server render is the floor of the figure, not a promise of one.
import * as React from 'react'

import { Button } from '@/components/ui/button'

import type { ZoomXView } from './useZoomX'

export interface ZoomControlsWording {
  group: string
  in: string
  out: string
  reset: string
  levelPrefix: string
}

export interface ZoomControlsProps {
  wording: ZoomControlsWording
  hint: string
  view: ZoomXView
  ready: boolean
  onIn(): void
  onOut(): void
  onReset(): void
}

export const ZOOM_STEP = 1.6

export default function ZoomControls({ wording, hint, view, ready, onIn, onOut, onReset }: ZoomControlsProps) {
  return (
    <div className="score-zoom flex flex-wrap items-center gap-2" hidden={!ready}>
      <div className="flex items-center gap-1" role="group" aria-label={wording.group}>
        <Button variant="ghost" size="sm" type="button" aria-label={wording.in} onClick={onIn}>
          +
        </Button>
        <Button variant="ghost" size="sm" type="button" aria-label={wording.out} onClick={onOut}>
          −
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-label={wording.reset}
          onClick={onReset}
          disabled={view.k === 1 && view.x === 0}
        >
          0
        </Button>
      </div>
      <span className="font-mono text-[11px] text-fg-faint" aria-live="polite">
        {wording.levelPrefix}
        {view.k.toFixed(1)}
      </span>
      <span className="font-mono text-[11px] text-fg-faint">{hint}</span>
    </div>
  )
}

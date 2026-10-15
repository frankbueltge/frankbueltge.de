// src/components/ecology/score-kit/useZoomX.ts — the one zoom every score in this house uses:
// d3-zoom along the ruler only (visual layer, Phase 3d, 2026-09-02; extracted from the cycle
// partitur of Phase 1 without changing its behaviour).
//
// Both extents are given in the drawing's OWN units: d3-selection's pointer() reads an <svg>
// target through its screen CTM, so gestures already arrive in viewBox space. Pinning both to
// the ruler's span keeps the axis from ever sliding out from under the lane labels — at k = 1
// the constraint forces the translation to zero. Transitions take duration zero under
// prefers-reduced-motion (duty 4). Inactive (off-screen), the handlers are unbound: nothing to
// animate, no reason to keep wheel and pointer listeners alive.
import * as React from 'react'
import { select, type Selection } from 'd3-selection'
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom'
import 'd3-transition'

import { reducedMotion } from '@/lib/dataviz/runtime'

export interface ZoomXView {
  k: number
  x: number
}

export const IDENTITY_ZOOM: ZoomXView = { k: 1, x: 0 }

export interface ZoomXOptions {
  svgRef: React.RefObject<SVGSVGElement | null>
  /** the ruler's span and the drawing's height, in viewBox units */
  x0: number
  x1: number
  height: number
  min?: number
  max?: number
  /** false unbinds the behaviour (e.g. while the figure is off-screen) */
  active?: boolean
  transitionMs?: number
}

export interface ZoomXHandle {
  view: ZoomXView
  scaleBy(factor: number): void
  resetZoom(): void
  atIdentity: boolean
}

const DEFAULT_TRANSITION_MS = 320

export function useZoomX({
  svgRef,
  x0,
  x1,
  height,
  min = 1,
  max = 12,
  active = true,
  transitionMs = DEFAULT_TRANSITION_MS,
}: ZoomXOptions): ZoomXHandle {
  const [view, setView] = React.useState<ZoomXView>(IDENTITY_ZOOM)
  const zoomRef = React.useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  React.useEffect(() => {
    const node = svgRef.current
    if (!node) return
    const sel = select(node)
    if (!active) {
      sel.on('.zoom', null)
      return
    }
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([min, max])
      .extent([
        [x0, 0],
        [x1, height],
      ])
      .translateExtent([
        [x0, 0],
        [x1, height],
      ])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        setView({ k: event.transform.k, x: event.transform.x })
      })
    zoomRef.current = behaviour
    sel.call(behaviour)
    return () => {
      sel.on('.zoom', null)
    }
  }, [svgRef, x0, x1, height, min, max, active])

  const selection = React.useCallback((): Selection<SVGSVGElement, unknown, null, undefined> | null => {
    const node = svgRef.current
    return node ? select(node) : null
  }, [svgRef])

  const scaleBy = React.useCallback(
    (factor: number) => {
      const sel = selection()
      const behaviour = zoomRef.current
      if (!sel || !behaviour) return
      behaviour.scaleBy(sel.transition().duration(reducedMotion() ? 0 : transitionMs), factor)
    },
    [selection, transitionMs],
  )

  const resetZoom = React.useCallback(() => {
    const sel = selection()
    const behaviour = zoomRef.current
    if (!sel || !behaviour) return
    behaviour.transform(sel.transition().duration(reducedMotion() ? 0 : transitionMs), zoomIdentity)
  }, [selection, transitionMs])

  return { view, scaleBy, resetZoom, atIdentity: view.k === 1 && view.x === 0 }
}

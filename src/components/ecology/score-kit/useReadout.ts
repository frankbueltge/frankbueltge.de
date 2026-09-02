// src/components/ecology/score-kit/useReadout.ts — the readout binding every island shares
// (visual layer, Phase 3d, 2026-09-02; extracted from the cycle partitur).
//
// The frame renders the dataviz Readout shell beside the island, inside the box readout.ts clamps
// within (house rule 1: the FIGURE's own box, never a scroll container). This hook finds both on
// mount and hands back the two anchor conversions a figure needs: the pointer for a mouse, the
// mark's own box for keyboard focus — so a tabbing visitor gets the readout at the mark, not
// wherever the pointer happens to rest. Content is built by the caller through
// createElement/textContent, never innerHTML of data.
import * as React from 'react'

import { createReadout, type ReadoutAnchor, type ReadoutHandle } from '@/lib/dataviz/readout'

export interface ReadoutBinding {
  show(node: Node, anchor: ReadoutAnchor): void
  hide(): void
  fromPointer(event: { clientX: number; clientY: number }): ReadoutAnchor
  fromMark(target: Element): ReadoutAnchor
  /** the figure box the readout clamps within — resolved on mount, null on the server */
  figure(): HTMLElement | null
  /** the Readout shell itself, for a per-figure data attribute the stylesheet keys on */
  element(): HTMLElement | null
}

export function useReadout(
  rootRef: React.RefObject<HTMLElement | null>,
  readoutId: string,
  /** selector of the clamp box, resolved upwards from the island's root */
  boxSelector: string,
): ReadoutBinding {
  const handleRef = React.useRef<ReadoutHandle | null>(null)
  const figureRef = React.useRef<HTMLElement | null>(null)
  const elementRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    figureRef.current = root.closest<HTMLElement>(boxSelector) ?? root
    const el = document.getElementById(readoutId)
    elementRef.current = el
    handleRef.current = el ? createReadout(el, figureRef.current) : null
    return () => {
      handleRef.current?.hide()
      handleRef.current = null
    }
  }, [rootRef, readoutId, boxSelector])

  return React.useMemo<ReadoutBinding>(
    () => ({
      show: (node, anchor) => handleRef.current?.show(node, anchor),
      hide: () => handleRef.current?.hide(),
      fromPointer: (event) => {
        const rect = figureRef.current?.getBoundingClientRect()
        return { anchorX: event.clientX - (rect?.left ?? 0), anchorY: event.clientY - (rect?.top ?? 0) }
      },
      fromMark: (target) => {
        const figure = figureRef.current?.getBoundingClientRect()
        const box = target.getBoundingClientRect()
        return {
          anchorX: box.left - (figure?.left ?? 0) + box.width / 2,
          anchorY: box.top - (figure?.top ?? 0),
        }
      },
      figure: () => figureRef.current,
      element: () => elementRef.current,
    }),
    [],
  )
}

// src/lib/dataviz/readout.ts — the pure placement math + client handle behind
// components/dataviz/Readout.astro, the shared hover-readout (tooltip) shell.
//
// Three implementations already do roughly this (ProcessFigure.astro's zeigeTip, maschinenraum/
// Partitur.astro's placeTip, begegnungen/ScoreFigure.astro's show) and between them carry three
// hard-won house rules — one violated by at least one of the three:
//
//   1. clamp to the FIGURE's own box, never the scroll container or the viewport. ScoreFigure's
//      `show` clamps against `innerWidth` (the viewport) — wrong on a page where the figure sits
//      in a narrower column; Partitur's `placeTip` clamps against its `stage` element precisely
//      because the tip lives OUTSIDE the clipping `.pt-scroll` container. placeReadout below
//      only ever sees the box the CALLER hands it — always pass the figure's own
//      getBoundingClientRect(), never window.innerWidth/innerHeight and never a scrollable
//      ancestor's rect.
//   2. flip left/up near the right/bottom edge instead of clipping. Partitur's placeTip does
//      this on both axes; ProcessFigure's zeigeTip only clamps (no flip); ScoreFigure doesn't
//      clamp OR flip vertically at all. placeReadout always flips (see clampBox's flipX/flipY).
//   3. the readout is never a hit target — pointer-events:none, set once in the component's
//      structural CSS, never toggled at runtime.
//
// This module owns rules 1 and 2 (pure geometry) and the DOM glue for rule 3 (content swap +
// visibility, never pointer-events). Behavior + structure only (ADR 0010) — no color, no font.

import { clampBox } from './geometry'
import { setVars } from './runtime'

export interface ReadoutPlacement {
  x: number
  y: number
  flippedX: boolean
  flippedY: boolean
}

export interface PlaceReadoutInput {
  /** anchor position (e.g. the pointer), in the FIGURE box's own local coordinate space —
   *  never viewport or scroll-container coordinates (house rule 1) */
  anchorX: number
  anchorY: number
  /** measured readout box size */
  width: number
  height: number
  /** the figure's own box to clamp within (house rule 1) */
  boxWidth: number
  boxHeight: number
  /** clearance from the anchor and from the figure box's edges (default 12) */
  gap?: number
}

/** Pure placement: where the readout box should sit, always flipping toward the side with room
 *  rather than clipping (house rule 2), always clamped to the given figure box (house rule 1 —
 *  the caller's responsibility is to pass the FIGURE's rect, nothing wider). */
export function placeReadout(input: PlaceReadoutInput): ReadoutPlacement {
  const gap = input.gap ?? 12
  const { x, y, flippedX, flippedY } = clampBox({
    x: input.anchorX,
    y: input.anchorY,
    w: input.width,
    h: input.height,
    boxW: input.boxWidth,
    boxH: input.boxHeight,
    gap,
    flipX: true,
    flipY: true,
  })
  return { x, y, flippedX, flippedY }
}

export interface ReadoutAnchor {
  anchorX: number
  anchorY: number
}

export interface ReadoutHandle {
  /** Swaps the readout's content and shows it, placed relative to the given anchor point
   *  (figure-local coordinates — see placeReadout's house rule 1). `contentNode` is appended as-
   *  is: consumers build it via createElement/textContent, never innerHTML of data. */
  show(contentNode: Node, anchor: ReadoutAnchor): void
  hide(): void
}

/**
 * Wires a rendered `<div data-dv-readout>` (Readout.astro's root) to the placement math above.
 * `figureEl` is the box placeReadout clamps within — pass the figure's own element, never a
 * scroll container or `document.documentElement` (house rule 1).
 */
export function createReadout(el: HTMLElement, figureEl: Element, gap?: number): ReadoutHandle {
  function show(contentNode: Node, anchor: ReadoutAnchor): void {
    el.textContent = ''
    el.appendChild(contentNode)
    el.hidden = false
    const figRect = figureEl.getBoundingClientRect()
    const boxRect = el.getBoundingClientRect()
    const { x, y } = placeReadout({
      anchorX: anchor.anchorX,
      anchorY: anchor.anchorY,
      width: boxRect.width,
      height: boxRect.height,
      boxWidth: figRect.width,
      boxHeight: figRect.height,
      gap,
    })
    setVars(el, { '--dv-x': `${x}px`, '--dv-y': `${y}px` })
  }
  function hide(): void {
    el.hidden = true
  }
  return { show, hide }
}

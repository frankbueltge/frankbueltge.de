// src/components/ecology/CycleScoreIsland.tsx — the first React island of the visual layer
// (Phase 0 smoke island, 2026-09-02; docs/design/2026-09-02-the-visual-layer.md). It exists to
// prove the shape every later figure follows, on a real surface, with every gate green:
//
//   · GEOMETRY IS NOT COMPUTED HERE. The score arrives as the markup buildCycleScoreSvg
//     produced at build time (src/lib/ecology/cycle-score.ts — pure, tested, deterministic).
//     The island mounts it, and on hydration answers the pointer. Nothing else.
//   · THE SERVER RENDER IS THE FLOOR. Astro renders this component on the server, so the SVG
//     and every artifact link exist in the HTML before any script runs; a reader without
//     JavaScript sees the finished figure. Hover is an addition, never the only way in — each
//     mark keeps its native <title>, and the artifact trail below the figure repeats the record.
//   · NO style ATTRIBUTE, EVER. The site's CSP drops them and drift-check rule 3 (now over
//     .tsx too) fails the build. Placement goes through dataviz/runtime.ts's setVars — the one
//     sanctioned dynamic-styling path — inside createReadout.
//   · READOUT HOUSE RULES (src/lib/dataviz/readout.ts): the readout is placed in the FIGURE's
//     own coordinate space and clamped to it, flips near an edge, and is never a hit target.
//     The Readout shell (src/components/dataviz/Readout.astro) is rendered by the frame beside
//     this island inside the same `.score-figure` (position: relative), and found by id.
//
// Replaced in Phase 1 by the partitur island (a model-driven JSX render, zoom, cards); the
// duties above carry over unchanged.
import { useEffect, useRef } from 'react'

import { createReadout } from '@/lib/dataviz/readout'

export interface CycleScoreIslandProps {
  /** the built score — buildCycleScoreSvg's output, computed at build time by the frame */
  svg: string
  /** id of the dataviz Readout shell the frame renders beside this island */
  readoutId: string
}

/** Hover/focus readout text for a mark: its own native <title>, so the readout never invents a
 *  word the figure does not already carry. */
function markTitle(mark: Element): string {
  return mark.querySelector('title')?.textContent?.trim() ?? ''
}

export default function CycleScoreIsland({ svg, readoutId }: CycleScoreIslandProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    // The containing block createReadout clamps within: the frame's `.score-figure`, which is
    // position: relative (score-map.css) and holds both this island and the Readout shell.
    const figure = root.closest<HTMLElement>('.score-figure') ?? root
    const readoutEl = document.getElementById(readoutId)
    if (!readoutEl) return
    const readout = createReadout(readoutEl, figure)
    const controller = new AbortController()
    const { signal } = controller

    const content = (text: string): Node => {
      const node = document.createElement('span')
      node.textContent = text
      return node
    }
    const anchorFromPointer = (ev: PointerEvent) => {
      const r = figure.getBoundingClientRect()
      return { anchorX: ev.clientX - r.left, anchorY: ev.clientY - r.top }
    }
    const anchorFromMark = (mark: Element) => {
      const r = figure.getBoundingClientRect()
      const b = mark.getBoundingClientRect()
      return { anchorX: b.left - r.left + b.width / 2, anchorY: b.top - r.top }
    }

    for (const mark of root.querySelectorAll<SVGAElement>('a.evt')) {
      const title = markTitle(mark)
      if (!title) continue
      const showAtPointer = (ev: PointerEvent) => readout.show(content(title), anchorFromPointer(ev))
      mark.addEventListener('pointerenter', showAtPointer, { signal })
      mark.addEventListener('pointermove', showAtPointer, { signal })
      mark.addEventListener('pointerleave', () => readout.hide(), { signal })
      // keyboard readers get the same readout at the mark itself
      mark.addEventListener('focus', () => readout.show(content(title), anchorFromMark(mark)), { signal })
      mark.addEventListener('blur', () => readout.hide(), { signal })
    }
    return () => {
      controller.abort()
      readout.hide()
    }
  }, [readoutId])

  return (
    <div
      ref={rootRef}
      className="score-svg min-w-[900px] p-2"
      data-island="cycle-score"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

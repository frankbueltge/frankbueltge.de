// src/components/pages/TrendingArc.tsx — one watched term's arc, as an island (visual layer,
// 2026-09-03). One bar per committed run, oldest left, and — once the archive can carry it — the
// two windows the status word rests on: the last seven runs, and the three weeks before them.
//
// The bars are unchanged: seriesStrip() has drawn them since the term tracker shipped. What the
// island adds is the reading. Before today the page said "rising" in a sentence and drew a row of
// bars, and nothing on the drawing said WHICH bars the sentence was about; now the comparison is
// bracketed under the strip, with both windows' mentions per run beside it.
//
// Against the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. EVERY NUMBER comes from src/lib/trending/arc.ts, tested without a browser: the bars from
//      the strip it wraps, the two spans and their totals from the model. This file computes none.
//   2. THE SERVER RENDER IS THE FLOOR: bars, brackets and native <title>s exist before a script
//      runs; the frame lays a table of the same series beneath.
//   3. NO style ATTRIBUTE, NO HEX — trending-figures.css inks the `.tt-*` classes.
//   4. REDUCED MOTION: the rise is declared only inside the stylesheet's no-preference block.
//   5. THE READOUT is clamped to `.tr-figure` and is never a hit target.
//   6. THE BUDGET: React and the score kit. No d3.
//   7. ONE INK, one series — no hue is introduced and none is needed.
import * as React from 'react'

import { focusMarkIn, isWalkKey, useReadout, walkTo } from '@/components/ecology/score-kit'
import { buildSegments, type Segmented } from '@/lib/dataviz/stepper'
import type { ArcModel } from '@/lib/trending/arc'
import { compact } from '@/lib/trending/format'
import type { SeriesBar } from '@/lib/trending/terms-view'

export interface ArcWording {
  /** accessible name of the whole drawing */
  figureLabel: string
  /** "mentions" — the word after a run's count */
  mentionsWord: string
  /** "per run" — the unit under a window bracket */
  perRunWord: string
  /** the two brackets, named */
  recentLabel: string
  priorLabel: string
}

export interface TrendingArcProps {
  model: ArcModel
  wording: ArcWording
  id: string
  readoutId: string
}

export default function TrendingArc({ model, wording, id, readoutId }: TrendingArcProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => setEntered(true), [])

  const readout = useReadout(rootRef, readoutId, '.tr-figure')
  const walk: Segmented<SeriesBar> = React.useMemo(() => buildSegments(model.bars, () => 'runs'), [model.bars])

  const showReadout = (bar: SeriesBar, anchorX: number, anchorY: number) => {
    const node = document.createDocumentFragment()
    const head = document.createElement('b')
    head.className = 'r-head'
    head.textContent = bar.date
    const body = document.createElement('span')
    body.className = 'r-body'
    body.textContent = `${compact(bar.d1)} ${wording.mentionsWord}`
    node.append(head, body)
    readout.show(node, { anchorX, anchorY })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isWalkKey(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const key = active?.dataset.mark
    if (!key) return
    const pos = walk.items.findIndex((b) => b.date === key)
    if (pos < 0) return
    const next = walkTo(walk, pos, event.key)
    if (next === pos) return
    event.preventDefault()
    focusMarkIn(rootRef.current, walk.items[next]!.date)
  }

  const barProps = (bar: SeriesBar) => ({
    className: 'tt-bar',
    'data-mark': bar.date,
    tabIndex: 0,
    onPointerEnter: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(bar, a.anchorX, a.anchorY)
    },
    onPointerMove: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(bar, a.anchorX, a.anchorY)
    },
    onPointerLeave: () => readout.hide(),
    onFocus: (event: React.FocusEvent<SVGGElement>) => {
      const a = readout.fromMark(event.currentTarget)
      showReadout(bar, a.anchorX, a.anchorY)
    },
    onBlur: () => readout.hide(),
  })

  const first = model.bars[0]
  const last = model.bars[model.bars.length - 1]
  const windows = model.windows
  // The brackets sit below the axis line, so the strip keeps the height it always had.
  const axisY = model.height + 14
  // below the axis dates, which keep the place they have always had
  const bracketY = windows ? windows.y + 22 : 0

  return (
    <div ref={rootRef} id={id} data-island="trending-arc" onKeyDown={onKeyDown}>
      <div>
        <svg
          className={entered ? 'tr-strip tt-enter' : 'tr-strip'}
          data-span={model.span}
          viewBox={`0 0 ${model.width} ${model.height + (windows ? 42 : 18)}`}
          role="img"
          aria-label={wording.figureLabel}
        >
          <line className="tt-baseline" x1={0} y1={model.height + 0.5} x2={model.width} y2={model.height + 0.5} />
          {model.bars.map((bar) => (
            <g key={bar.date} {...barProps(bar)}>
              <title>{`${bar.date}: ${compact(bar.d1)} ${wording.mentionsWord}`}</title>
              <rect className="tt-mark" x={bar.x} y={bar.y} width={model.barWidth} height={bar.h} />
              <rect
                className="tt-hit"
                x={bar.x - model.gap / 2}
                y={0}
                width={model.barWidth + model.gap}
                height={model.height}
              />
            </g>
          ))}

          {windows && (
            <g aria-hidden="true">
              {/* the three weeks the comparison is made against */}
              <path
                className="tt-win"
                d={`M${windows.prior.x} ${bracketY - 4} V${bracketY} H${windows.prior.x + windows.prior.width} V${bracketY - 4}`}
              />
              <text className="tt-win-label" x={windows.prior.x} y={bracketY + 10}>
                {`${wording.priorLabel} · ${windows.prior.perDay} ${wording.perRunWord}`}
              </text>
              {/* the seven runs the status word is about */}
              <path
                className="tt-win tt-win-recent"
                d={`M${windows.recent.x} ${bracketY - 4} V${bracketY} H${windows.recent.x + windows.recent.width} V${bracketY - 4}`}
              />
              <text
                className="tt-win-label tt-win-label-recent"
                x={windows.recent.x + windows.recent.width}
                y={bracketY + 10}
                textAnchor="end"
              >
                {`${wording.recentLabel} · ${windows.recent.perDay} ${wording.perRunWord}`}
              </text>
            </g>
          )}

          {first && last && (
            <>
              <text className="tt-axis" x={0} y={axisY}>
                {first.date}
              </text>
              <text className="tt-axis" x={model.width} y={axisY} textAnchor="end">
                {last.date}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  )
}

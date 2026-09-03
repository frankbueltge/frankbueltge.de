// src/components/pages/TrendingAudienceStrip.tsx — who read /trending, as an island (visual
// layer, 2026-09-03). One stacked bar per counted day, six audience classes told apart by
// stacking order AND fill pattern, a legend that isolates a class, and a readout that says what a
// day was made of. The drawing is unchanged from the build-time figure of 2026-09-01; what is new
// is that a reader can now ask it a question.
//
// Against the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. EVERY COORDINATE comes from audienceStrip() in src/lib/trending/view.ts, which is tested
//      without a browser and unchanged by this file. The two things computed here are a readout's
//      text (from the model's own numbers, through the ledger's tested formatter) and which class
//      the legend left standing.
//   2. THE SERVER RENDER IS THE FLOOR: every bar, every segment and every native <title> exists
//      before a script runs, and the table beneath (mounted by the frame) repeats the whole record
//      day by day.
//   3. NO style ATTRIBUTE, NO HEX: trending-figures.css inks the `.tra-*` classes, and the six
//      patterns are SVG <defs> referenced by class, exactly as the build-time figure did.
//   4. REDUCED MOTION: the rise on entrance is declared only inside the stylesheet's
//      no-preference block.
//   5. THE READOUT is clamped to `.tr-figure` and is never a hit target.
//   6. THE BUDGET: React and the score kit; no d3, no chart library.
//   7. NO HUE AT ALL. Six classes cannot be told apart by four categorical colours, so they are
//      told apart by stacking order and pattern — the figure reads in greyscale and in print.
import * as React from 'react'

import { focusMarkIn, isWalkKey, useReadout, walkTo } from '@/components/ecology/score-kit'
import { isOn, toggle } from '@/lib/dataviz/filter'
import { buildSegments, type Segmented } from '@/lib/dataviz/stepper'
import { classLabel, compact } from '@/lib/trending/format'
import { AUDIENCE_CLASSES, type AudienceClass } from '@/lib/trending/types'
import type { StripBar, StripModel } from '@/lib/trending/view'

export interface AudienceStripWording {
  /** accessible name of the whole drawing */
  figureLabel: string
  /** names the legend */
  legendLabel: string
  /** what a day with no edge count reads as, in the readout and the native title */
  standby: string
  /** "requests" — the word after a day's total */
  requestsWord: string
}

export interface TrendingAudienceStripProps {
  model: StripModel
  wording: AudienceStripWording
  id: string
  readoutId: string
}

/** The six patterns the fills reference. Kept in the island because the fills are `url(#…)` and a
 *  pattern must live in the same document as the mark that uses it; identical to the definitions
 *  the build-time figure carried. */
function Patterns() {
  return (
    <defs>
      <pattern id="tra-p-search" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" className="tra-p-ground" />
        <line x1="0" y1="0" x2="0" y2="6" className="tra-p-ink" strokeWidth="2.4" />
      </pattern>
      <pattern id="tra-p-ai-retrieval" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" className="tra-p-ground" />
        <circle cx="2.5" cy="2.5" r="1.4" className="tra-p-ink" />
      </pattern>
      <pattern id="tra-p-ai-user-fetch" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" className="tra-p-ground" />
        <line x1="0" y1="3" x2="6" y2="3" className="tra-p-ink-muted" strokeWidth="2" />
      </pattern>
      <pattern id="tra-p-ai-training" width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" className="tra-p-ground" />
        <line x1="0" y1="0" x2="7" y2="7" className="tra-p-ink-muted" strokeWidth="1.2" />
        <line x1="7" y1="0" x2="0" y2="7" className="tra-p-ink-muted" strokeWidth="1.2" />
      </pattern>
      <pattern id="tra-p-other-bot" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" className="tra-p-ground" />
        <line x1="3" y1="0" x2="3" y2="6" className="tra-p-ink-faint" strokeWidth="1.2" />
      </pattern>
    </defs>
  )
}

/** The native title of a bar — the same sentence the build-time figure wrote, so a no-JS reader
 *  and a hovering one are told the same thing. */
function titleOf(bar: StripBar, standby: string, requestsWord: string): string {
  if (bar.total === null) return `${bar.day}: ${standby}`
  const parts = bar.segments.map((s) => `${classLabel(s.cls)} ${compact(s.n)}`).join(', ')
  return `${bar.day}: ${compact(bar.total)} ${requestsWord} — ${parts}`
}

export default function TrendingAudienceStrip({ model, wording, id, readoutId }: TrendingAudienceStripProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [classes, setClasses] = React.useState<string[]>([])
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => setEntered(true), [])

  const readout = useReadout(rootRef, readoutId, '.tr-figure')

  /** One run of days: the arrow keys walk the window, Home and End jump to its ends. */
  const walk: Segmented<StripBar> = React.useMemo(() => buildSegments(model.bars, () => 'days'), [model.bars])

  const showReadout = (bar: StripBar, anchorX: number, anchorY: number) => {
    const node = document.createDocumentFragment()
    const head = document.createElement('b')
    head.className = 'r-head'
    head.textContent = bar.day
    node.append(head)
    if (bar.total === null) {
      const standby = document.createElement('span')
      standby.className = 'r-body'
      standby.textContent = wording.standby
      node.append(standby)
    } else {
      const total = document.createElement('span')
      total.className = 'r-body'
      total.textContent = `${compact(bar.total)} ${wording.requestsWord}`
      node.append(total)
      for (const segment of bar.segments) {
        const line = document.createElement('span')
        line.className = 'r-src'
        line.textContent = `${classLabel(segment.cls)} ${compact(segment.n)}`
        node.append(line)
      }
    }
    readout.show(node, { anchorX, anchorY })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isWalkKey(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const key = active?.dataset.mark
    if (!key) return
    const pos = walk.items.findIndex((b) => b.day === key)
    if (pos < 0) return
    const next = walkTo(walk, pos, event.key)
    if (next === pos) return
    event.preventDefault()
    focusMarkIn(rootRef.current, walk.items[next]!.day)
  }

  const barProps = (bar: StripBar) => ({
    className: 'tra-bar',
    'data-mark': bar.day,
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

  const legendLabelId = `${id}-legend`
  const first = model.bars[0]
  const last = model.bars[model.bars.length - 1]

  return (
    <div ref={rootRef} id={id} data-island="trending-audience" onKeyDown={onKeyDown}>
      <div>
        <svg
          className={entered ? 'tr-strip tra-enter' : 'tr-strip'}
          data-span={model.span}
          viewBox={`0 0 ${model.width} ${model.height + 18}`}
          role="img"
          aria-label={wording.figureLabel}
        >
          <Patterns />
          <line className="tra-baseline" x1={0} y1={model.height + 0.5} x2={model.width} y2={model.height + 0.5} />
          {model.bars.map((bar) => (
            <g key={bar.day} {...barProps(bar)}>
              <title>{titleOf(bar, wording.standby, wording.requestsWord)}</title>
              {bar.total === null ? (
                <rect className="tra-standby" x={bar.x} y={model.height - 8} width={model.barWidth} height={8} />
              ) : (
                bar.segments.map((segment) => (
                  <rect
                    key={segment.cls}
                    className={`tra-seg tra-seg-${segment.cls}`}
                    data-off={isOn(classes, segment.cls) ? undefined : ''}
                    x={bar.x}
                    y={segment.y}
                    width={model.barWidth}
                    height={segment.h}
                  />
                ))
              )}
              {/* the cursor hairline and the hit target: a four-pixel bar is not a target */}
              <line
                className="tra-cursor"
                x1={bar.x + model.barWidth / 2}
                y1={0}
                x2={bar.x + model.barWidth / 2}
                y2={model.height}
              />
              <rect
                className="tra-hit"
                x={bar.x - model.gap / 2}
                y={0}
                width={model.barWidth + model.gap}
                height={model.height}
              />
            </g>
          ))}
          {first && last && (
            <>
              <text className="tra-axis" x={first.x} y={model.height + 14}>
                {first.day}
              </text>
              <text className="tra-axis" x={model.width} y={model.height + 14} textAnchor="end">
                {last.day}
              </text>
            </>
          )}
        </svg>
      </div>

      <p className="kicker mt-2 sr-only" id={legendLabelId}>
        {wording.legendLabel}
      </p>
      <ul className="tra-legend mt-2 font-mono text-mono-sm text-fg-muted" aria-labelledby={legendLabelId}>
        {AUDIENCE_CLASSES.map((cls: AudienceClass) => (
          <li key={cls}>
            <button
              type="button"
              className="tra-legend-btn"
              data-off={isOn(classes, cls) ? undefined : ''}
              aria-pressed={classes.includes(cls)}
              onClick={() => setClasses((keys) => toggle(keys, cls, 'multi'))}
            >
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <rect x="0.5" y="0.5" width="13" height="13" className={`tra-seg-${cls}`} />
              </svg>
              <span>{classLabel(cls)}</span>
              <span className="tabular-nums text-fg-faint">{compact(model.totals[cls])}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

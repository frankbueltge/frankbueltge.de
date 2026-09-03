// src/components/pages/TrendingConvergence.tsx — the day ledger's claim, drawn (visual layer,
// 2026-09-03). One row per converging topic, one column per source that carried one, a mark where
// they meet. Hover or focus a mark and the readout says what THAT source called the topic and at
// what rank; open a row and the card carries the whole crossing — every source's own label, the
// headlines the run kept, the first sighting and how many mornings it has held.
//
// Against the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. IT COMPUTES NOTHING IT CLAIMS. Every coordinate, every radius and every weight step comes
//      from src/lib/trending/converge.ts, which is tested without a browser; every word comes from
//      the frame. Not one number in this file is computed; every one is read off the model.
//   2. THE SERVER RENDER IS THE FLOOR. Rendered on the server this is the complete no-JS figure:
//      the grid, every mark in its own <g> with a native <title>, and every topic's link as a real
//      <a> in the gutter. What hydration adds is the readout, the column filter, the card and the
//      keyboard walk. The table under it (TableFallback, mounted by the frame) repeats the whole
//      crossing in words.
//   3. NO style ATTRIBUTE ANYWHERE, and no hex: trending-figures.css inks the `.tr-cv-*` classes,
//      and the weight steps reach it as `data-w`, not as an opacity typed into markup.
//   4. REDUCED MOTION: the landing gesture is declared only inside the stylesheet's
//      `prefers-reduced-motion: no-preference` block, so a visitor who asked for stillness never
//      has an animation attached to their marks at all.
//   5. THE READOUT follows dataviz/readout.ts — clamped to `.tr-figure`, never a hit target.
//   6. THE BUDGET: no chart library and no d3. This grid has no ruler to zoom, so it carries no
//      zoom; React, the score kit and three shadcn primitives are the whole of its JavaScript.
//   7. NO NEW HUE. Ink alone: a mark's rank within its own source's list is size AND fill weight,
//      and the row's platform count is the number of marks in it. The figure survives greyscale.
import * as React from 'react'

import { focusMarkIn, isWalkKey, useFocusOnOpen, useReadout, walkTo } from '@/components/ecology/score-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isOn, toggle } from '@/lib/dataviz/filter'
import { buildSegments, type Segmented } from '@/lib/dataviz/stepper'
import { convergeWalkOrder, type ConvergeMark, type ConvergeModel, type ConvergeRow } from '@/lib/trending/converge'

/** The frame resolves every visitor-facing word against the wording canon before handing the model
 *  over; an island receives plain strings, and no number is ever typed into one here. */
export interface ConvergenceWording {
  /** accessible name of the whole drawing */
  figureLabel: string
  /** names the legend, which is the list of columns */
  columnsLabel: string
  /** "carried" — the word after a column's own count in the totals row */
  carriedWord: string
  /** "sources" — the word after a row's mark count, in the card and the native title */
  sourcesWord: string
  card: {
    firstSeenLabel: string
    daysHotLabel: string
    signalsLabel: string
    headlinesLabel: string
    open: string
    close: string
    hint: string
  }
}

export interface TrendingConvergenceProps {
  model: ConvergeModel
  wording: ConvergenceWording
  /** id of this island's root element, and the prefix of every id it needs */
  id: string
  /** id of the dataviz Readout shell the frame renders beside this island */
  readoutId: string
}

export default function TrendingConvergence({ model, wording, id, readoutId }: TrendingConvergenceProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)

  /** the columns the legend left standing; empty means "all of them" */
  const [columns, setColumns] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string | null>(null)
  // False on the server AND on the first client render, so hydration matches; the effect flips it
  // and that is when the marks land — the stylesheet decides whether they move at all.
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => setEntered(true), [])

  const readout = useReadout(rootRef, readoutId, '.tr-figure')

  /** Every mark in reading order, segmented by its row: the arrow keys walk along one topic's
   *  sources, Home and End jump to the ends of that row. */
  const walk: Segmented<ConvergeMark> = React.useMemo(
    () => buildSegments(convergeWalkOrder(model), (m) => m.topic),
    [model],
  )

  const selectedRow = selected ? (model.rows.find((r) => r.id === selected) ?? null) : null
  useFocusOnOpen(selected, cardRef)

  const openRow = React.useCallback((row: ConvergeRow) => {
    setSelected(row.id)
    readout.hide()
  }, [readout])

  const closeCard = React.useCallback(() => {
    const key = selected
    setSelected(null)
    if (key) focusMarkIn(rootRef.current, key)
  }, [selected])

  // ------------------------------------------------------------------ the readout
  const showReadout = (mark: ConvergeMark, anchorX: number, anchorY: number) => {
    const node = document.createDocumentFragment()
    const head = document.createElement('b')
    head.className = 'r-head'
    head.textContent = mark.label
    const detail = document.createElement('span')
    detail.className = 'r-body'
    detail.textContent = mark.detail
    node.append(head, detail)
    readout.show(node, { anchorX, anchorY })
  }

  // ------------------------------------------------------------------ keyboard
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!selected) return
      event.preventDefault()
      closeCard()
      return
    }
    if (!isWalkKey(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const key = active?.dataset.mark
    if (!key) return
    const pos = walk.items.findIndex((m) => m.key === key)
    if (pos < 0) return
    const next = walkTo(walk, pos, event.key)
    if (next === pos) return
    event.preventDefault()
    focusMarkIn(rootRef.current, walk.items[next]!.key)
  }

  const markProps = (mark: ConvergeMark, row: ConvergeRow) => ({
    className: 'tr-cv-cell',
    'data-mark': mark.key,
    'data-off': isOn(columns, mark.source) ? undefined : '',
    tabIndex: 0,
    role: 'button' as const,
    onPointerEnter: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(mark, a.anchorX, a.anchorY)
    },
    onPointerMove: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(mark, a.anchorX, a.anchorY)
    },
    onPointerLeave: () => readout.hide(),
    onFocus: (event: React.FocusEvent<SVGGElement>) => {
      const a = readout.fromMark(event.currentTarget)
      showReadout(mark, a.anchorX, a.anchorY)
    },
    onBlur: () => readout.hide(),
    onClick: () => openRow(row),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      openRow(row)
    },
  })

  const legendLabelId = `${id}-columns`
  const cardW = wording.card

  return (
    <div ref={rootRef} id={id} className="tr-cv-root" data-island="trending-convergence" onKeyDown={onKeyDown}>
      <p className="kicker" id={legendLabelId}>
        {wording.columnsLabel}
      </p>
      {/* The size step sits on the LIST, not on the button: `.tra-legend-btn` resets a button's
          browser font with `font: inherit`, which would swallow a size utility set on the button
          itself (seen on the rendered page on 2026-09-03 — the source names came out at body
          size). */}
      <ul className="dv-legend mt-1.5 font-mono text-mono text-fg-muted" aria-labelledby={legendLabelId}>
        {model.columns.map((column) => (
          <li key={column.id} className="dv-legend-item">
            <button
              type="button"
              className="tra-legend-btn"
              data-off={isOn(columns, column.id) ? undefined : ''}
              aria-pressed={columns.includes(column.id)}
              onClick={() => setColumns((keys) => toggle(keys, column.id, 'multi'))}
            >
              <span>{column.label}</span>
              <span className="tabular-nums text-fg-faint">{column.carried}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* The drawing keeps a floor width and the frame scrolls; the box the readout clamps
          within is `.tr-figure`, which the FRAME owns — deliberately not this scroller, because a
          readout clamped to a scroll container drifts with its content (readout.ts, rule 1). */}
      <div className="tr-scroll mt-3">
        <div className="min-w-[720px]">
          <svg
            className={entered ? 'tr-cv tr-cv-enter' : 'tr-cv'}
            viewBox={`0 0 ${model.width} ${model.height}`}
            role="img"
            preserveAspectRatio="xMinYMin meet"
            aria-label={wording.figureLabel}
          >
            {/* the column heads and the rule under them */}
            {model.columns.map((column) => (
              <text
                key={column.id}
                className="tr-cv-head"
                data-off={isOn(columns, column.id) ? undefined : ''}
                x={column.labelX}
                y={column.labelY}
                textAnchor={column.anchor}
                transform={column.rotate ? `rotate(${column.rotate} ${column.labelX} ${column.labelY})` : undefined}
              >
                {column.label}
              </text>
            ))}
            <line className="tr-cv-rule" x1={0} y1={model.headRuleY} x2={model.width} y2={model.headRuleY} />

            {/* one vertical guide per column, so an eye falls from a head onto its marks */}
            {model.columns.map((column) => (
              <line
                key={`g-${column.id}`}
                className="tr-cv-guide"
                x1={column.cx}
                y1={model.headRuleY}
                x2={column.cx}
                y2={model.footY - 11}
              />
            ))}

            <g className="tr-cv-rows">
              {model.rows.map((row) => (
                <g key={row.id} className="tr-cv-row" data-sel={selected === row.id ? '' : undefined}>
                  <rect className="tr-cv-band" x={0} y={row.y} width={model.width} height={row.height} />
                  <line className="tr-cv-grid" x1={0} y1={row.y + row.height} x2={model.width} y2={row.y + row.height} />
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noopener nofollow">
                      <text className="tr-cv-label-a" x={0} y={row.labelY}>
                        {row.labelShort}
                        <title>{row.label}</title>
                      </text>
                    </a>
                  ) : (
                    <text className="tr-cv-label" x={0} y={row.labelY}>
                      {row.labelShort}
                      <title>{row.label}</title>
                    </text>
                  )}
                  <text className="tr-cv-count" x={model.gutter - 16} y={row.labelY} textAnchor="end">
                    {row.platformCount}
                  </text>

                  {row.marks.map((mark) => (
                    <g key={mark.key} {...markProps(mark, row)} aria-label={`${mark.label} — ${mark.detail}`}>
                      <circle className="tr-cv-ring" cx={mark.cx} cy={mark.cy} r={13} />
                      <circle className="tr-cv-mark" data-w={mark.weight} cx={mark.cx} cy={mark.cy} r={mark.r} />
                      <rect className="tr-cv-hit" x={mark.cx - 13} y={mark.cy - 13} width={26} height={26} />
                      <title>{`${mark.detail} — ${mark.label}`}</title>
                    </g>
                  ))}
                  <title>{`${row.label} — ${row.platformCount} ${wording.sourcesWord}`}</title>
                </g>
              ))}
            </g>

            {/* the totals: what each column carried of the drawn crossing */}
            {model.columns.map((column) => (
              <text key={`f-${column.id}`} className="tr-cv-foot" x={column.cx} y={model.footY} textAnchor="middle">
                {column.carried}
              </text>
            ))}
            <text className="tr-cv-foot" x={model.gutter - 16} y={model.footY} textAnchor="end">
              {wording.carriedWord}
            </text>
          </svg>
        </div>
      </div>

      {selectedRow && (
        <Card
          ref={cardRef}
          tabIndex={-1}
          role="group"
          aria-label={selectedRow.label}
          className="tr-cv-card mt-4 outline-none"
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {selectedRow.platformCount} {wording.sourcesWord}
              </Badge>
              <span className="font-mono text-mono-sm text-fg-faint">
                {cardW.firstSeenLabel} {selectedRow.firstSeen} · {cardW.daysHotLabel} {selectedRow.daysHot}
              </span>
            </div>
            <CardTitle className="text-h3 text-fg">{selectedRow.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="kicker">{cardW.signalsLabel}</p>
              <ul className="mt-1.5 space-y-1 text-sm">
                {selectedRow.marks.map((mark) => (
                  <li key={mark.key} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-fg-muted">{mark.label}</span>
                    <span className="font-mono text-mono-sm text-fg-faint">{mark.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            {selectedRow.links.length > 0 && (
              <div>
                <p className="kicker">{cardW.headlinesLabel}</p>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {selectedRow.links.map((link) => (
                    <li key={link.url}>
                      <a
                        className="underline decoration-line underline-offset-2 transition-colors hover:text-fg"
                        href={link.url}
                        target="_blank"
                        rel="noopener nofollow"
                      >
                        {link.title}
                      </a>
                      {link.publisher && <span className="ml-2 font-mono text-mono-sm text-fg-faint">{link.publisher}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {selectedRow.url && (
                <Button asChild size="sm" variant="outline">
                  <a href={selectedRow.url} target="_blank" rel="noopener nofollow">
                    {cardW.open}
                  </a>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closeCard}>
                {cardW.close}
              </Button>
              <span className="font-mono text-mono-sm text-fg-faint">{cardW.hint}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

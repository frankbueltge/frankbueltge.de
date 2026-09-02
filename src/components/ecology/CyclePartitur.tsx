// src/components/ecology/CyclePartitur.tsx — the cycle as a living partitur (visual layer,
// Phase 1, 2026-09-02; docs/design/2026-09-02-the-visual-layer.md). It replaces the smoke island
// of Phase 0 and, with it, the SVG-string builder src/lib/ecology/cycle-score.ts.
//
// What the island is and is not, in the terms of the seven duties
// (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. IT COMPUTES NOTHING IT CLAIMS. Every position, every label, every tick comes from
//      src/lib/ecology/cycle-model.ts — pure, tested, browser-free. This file mounts the model,
//      animates it, and answers the pointer. `placeMarks(model, view)` is called with the CURRENT
//      view on every render, which is the whole of the "semantic zoom": the same model says more
//      the closer it is read.
//   2. THE SERVER RENDER IS THE FLOOR. Rendered on the server at the identity view, this is the
//      complete no-JS figure: ruler, bands, four lanes, every mark as a real <a> with its own
//      <title>. The zoom controls are the one thing JavaScript adds, so they stay `hidden` until
//      the island has mounted rather than sitting there dead. The table under the figure
//      (TableFallback, mounted by the frame) repeats the whole record in words.
//   3. NO style ATTRIBUTE ANYWHERE. Positions are SVG attributes computed from the model;
//      the readout's placement goes through setVars (dataviz/runtime.ts), the one sanctioned
//      dynamic-styling path under this site's CSP. Colours arrive as `pr-<persona>` classes that
//      src/styles/score-map.css inks — no hex is written here.
//   4. REDUCED MOTION IS HONOURED: every d3 transition is given duration zero when the visitor
//      has asked for it, and there is no ambient motion to suppress.
//   5. THE READOUT follows the house rules of dataviz/readout.ts — clamped to the figure's own
//      box, never a hit target. The frame renders the shell beside this island.
//   6. THE BUDGET is `CyclePartitur` in scripts/budgets.json; d3 is imported by submodule
//      (d3-zoom / d3-selection / d3-transition), never the root bundle, and the island is
//      mounted `client:visible`.
//   7. NO NEW HUE. The five kinds are told apart by SHAPE — square, tick, diamond, ring, badge —
//      on the four lane colours the ecology-voices set already validated.
import * as React from 'react'
import { select, type Selection } from 'd3-selection'
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom'
import 'd3-transition'

import { Button } from '@/components/ui/button'
import { createReadout, type ReadoutHandle } from '@/lib/dataviz/readout'
import { reducedMotion } from '@/lib/dataviz/runtime'
import { buildSegments, step, type Segmented } from '@/lib/dataviz/stepper'
import {
  axisTicks,
  bandSpan,
  IDENTITY_VIEW,
  LANES,
  placeMarks,
  type CycleMark,
  type CycleModel,
  type CycleView,
  type LaneId,
  type MarkKind,
} from '@/lib/ecology/cycle-model'
import type { FocusState } from '@/lib/tour/types'

import MarkCard, { type MarkCardWording } from './MarkCard'

/** The frame resolves the wording canon's functions against the model before handing it over —
 *  an island receives plain, serialisable strings, and no number is ever typed into one. */
export interface PartiturWording {
  lanes: Record<LaneId, string>
  laneRole: Record<LaneId, string>
  laneQuiet: string
  /** already counted per lane by the frame */
  laneCount: Record<LaneId, string>
  hint: string
  axis: { opened: string; newest: string; note: string }
  kinds: Record<MarkKind, string>
  kindWhat: Record<MarkKind, string>
  band: string
  card: MarkCardWording
  zoom: { group: string; in: string; out: string; reset: string; levelPrefix: string }
  figureLabel: string
}

export interface CyclePartiturProps {
  model: CycleModel
  wording: PartiturWording
  /** id of the dataviz Readout shell the frame renders beside this island */
  readoutId: string
  /** the id this figure registers under for `dv:figure-ready` (tour contract) */
  figureId: string
}

const MIN_K = 1
const MAX_K = 12
const TRANSITION_MS = 320

/** Two decimals is more than an SVG attribute needs and keeps the server render byte-stable. */
function n(value: number): number {
  return Number(value.toFixed(2))
}

function markShape(kind: MarkKind, x: number, y: number, persona: string): React.ReactNode {
  switch (kind) {
    case 'artifact':
      return <rect className={`mk-fill pr-${persona}`} x={n(x - 8)} y={y - 8} width={16} height={16} />
    case 'session':
      return <path className={`mk-tick pr-${persona}`} d={`M${n(x)} ${y - 11} V${y + 11}`} />
    case 'letter':
      return (
        <path
          className={`mk mk-diamond pr-${persona}`}
          d={`M${n(x)} ${y - 9} L${n(x + 9)} ${y} L${n(x)} ${y + 9} L${n(x - 9)} ${y} Z`}
        />
      )
    case 'encounter':
      return <circle className={`mk mk-ring pr-${persona}`} cx={n(x)} cy={y} r={8} />
    case 'presentation':
      return (
        <g>
          <rect className={`mk-badge pr-${persona}`} x={n(x - 11)} y={y - 9} width={22} height={18} rx={3} />
          <rect className="mk-badge-in" x={n(x - 5)} y={y - 4} width={10} height={8} />
        </g>
      )
  }
}

export default function CyclePartitur({ model, wording, readoutId, figureId }: CyclePartiturProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<ReadoutHandle | null>(null)
  const figureRef = React.useRef<HTMLElement | null>(null)
  const zoomRef = React.useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const [view, setView] = React.useState<CycleView>(IDENTITY_VIEW)
  const [selected, setSelected] = React.useState<string | null>(null)
  // False on the server AND on the first client render, so hydration matches; the effect below
  // flips it, which is when the controls (the one thing JavaScript adds) become real.
  const [ready, setReady] = React.useState(false)
  const [onScreen, setOnScreen] = React.useState(true)

  const { box } = model
  const bottomY = model.lanes.length > 0 ? model.lanes[model.lanes.length - 1]!.y : box.laneY0
  const personaOf = React.useMemo(
    () => new Map(model.lanes.map((l) => [l.id, l.persona])),
    [model.lanes],
  )

  const placed = React.useMemo(() => placeMarks(model, view), [model, view])
  const ticks = React.useMemo(() => axisTicks(model, view), [model, view])

  /** The marks in LANE order — the shape stepper.ts's buildSegments needs (one contiguous run
   *  per key). The model's own order is chronological, so it cannot be used for this directly. */
  const walk: Segmented<CycleMark> = React.useMemo(
    () =>
      buildSegments(
        LANES.flatMap((lane) => model.marks.filter((m) => m.lane === lane)),
        (m) => m.lane,
      ),
    [model.marks],
  )

  const selectedMark = React.useMemo(
    () => model.marks.find((m) => m.id === selected) ?? null,
    [model.marks, selected],
  )

  // ------------------------------------------------------------------ mount
  React.useEffect(() => {
    setReady(true)
    const root = rootRef.current
    if (!root) return
    // The box createReadout clamps within: the frame's `.score-figure`, which is
    // position: relative (score-map.css) and holds this island and the Readout shell alike.
    figureRef.current = root.closest<HTMLElement>('.score-figure') ?? root
    const el = document.getElementById(readoutId)
    readoutRef.current = el ? createReadout(el, figureRef.current) : null
    return () => {
      readoutRef.current?.hide()
      readoutRef.current = null
    }
  }, [readoutId])

  // ------------------------------------------------------------------ off-screen pause
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((e) => e.isIntersecting)),
      { rootMargin: '128px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  // ------------------------------------------------------------------ d3-zoom, x only
  React.useEffect(() => {
    const node = svgRef.current
    if (!node) return
    const sel = select(node)
    if (!onScreen) {
      // Nothing to animate off-screen, and no reason to keep wheel/pointer handlers bound.
      sel.on('.zoom', null)
      return
    }
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_K, MAX_K])
      // Both extents in the drawing's OWN units: d3-selection's pointer() reads an <svg> target
      // through its screen CTM, so gestures already arrive in viewBox space. Pinning both to the
      // ruler's span is what keeps the axis from ever sliding out from under the lane labels —
      // at k = 1 the constraint forces the translation to zero.
      .extent([
        [box.laneX0, 0],
        [box.spanX1, box.h],
      ])
      .translateExtent([
        [box.laneX0, 0],
        [box.spanX1, box.h],
      ])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        setView({ k: event.transform.k, x: event.transform.x })
      })
    zoomRef.current = behaviour
    sel.call(behaviour)
    return () => {
      sel.on('.zoom', null)
    }
  }, [box.h, box.laneX0, box.spanX1, onScreen])

  const zoomSelection = (): Selection<SVGSVGElement, unknown, null, undefined> | null => {
    const node = svgRef.current
    return node ? select(node) : null
  }

  const scaleBy = React.useCallback((factor: number) => {
    const sel = zoomSelection()
    const behaviour = zoomRef.current
    if (!sel || !behaviour) return
    behaviour.scaleBy(sel.transition().duration(reducedMotion() ? 0 : TRANSITION_MS), factor)
  }, [])

  const resetZoom = React.useCallback(() => {
    const sel = zoomSelection()
    const behaviour = zoomRef.current
    if (!sel || !behaviour) return
    behaviour.transform(sel.transition().duration(reducedMotion() ? 0 : TRANSITION_MS), zoomIdentity)
  }, [])

  // ------------------------------------------------------------------ selection
  const focusMark = React.useCallback((id: string) => {
    rootRef.current?.querySelector<SVGAElement>(`[data-mark="${CSS.escape(id)}"]`)?.focus()
  }, [])

  const openMark = React.useCallback(
    (mark: CycleMark) => {
      setSelected(mark.id)
      readoutRef.current?.hide()
      window.dispatchEvent(
        new CustomEvent('dv:mark-selected', {
          detail: { figure: figureId, id: mark.id, kind: mark.kind, lane: mark.lane, date: mark.date, href: mark.href },
        }),
      )
    },
    [figureId],
  )

  const closeCard = React.useCallback(() => {
    const id = selected
    setSelected(null)
    if (id) focusMark(id)
  }, [focusMark, selected])

  // The card takes focus when it opens, so a keyboard reader lands inside what just appeared.
  React.useEffect(() => {
    if (selected) cardRef.current?.focus()
  }, [selected])

  // ------------------------------------------------------------------ the tour contract
  React.useEffect(() => {
    const apply = (focus: FocusState) => {
      if (focus.figure !== figureId) return
      // A tour may ask this figure to lock one mark; the other FocusState fields (filter, dim,
      // annotate) are requests this figure does not yet honour, and silence is the honest answer.
      if (focus.select && model.marks.some((m) => m.id === focus.select)) setSelected(focus.select)
    }
    window.dispatchEvent(new CustomEvent('dv:figure-ready', { detail: { id: figureId, apply } }))
  }, [figureId, model.marks])

  // ------------------------------------------------------------------ keyboard
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (selected) {
        event.preventDefault()
        closeCard()
      }
      return
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      scaleBy(1.6)
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      scaleBy(1 / 1.6)
      return
    }
    if (event.key === '0') {
      event.preventDefault()
      resetZoom()
      return
    }
    const arrows = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!arrows.includes(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const currentId = active?.dataset.mark ?? selected
    if (!currentId) return
    const pos = walk.items.findIndex((m) => m.id === currentId)
    if (pos < 0) return
    const segment = walk.segments[walk.items[pos]!.lane]
    let next = pos
    if (event.key === 'ArrowLeft') next = step(walk, pos, -1)
    else if (event.key === 'ArrowRight') next = step(walk, pos, 1)
    else if (event.key === 'Home') next = segment ? segment.start : pos
    else if (event.key === 'End') next = segment ? segment.end - 1 : pos
    if (next === pos) return
    event.preventDefault()
    const target = walk.items[next]!
    if (selected) setSelected(target.id)
    focusMark(target.id)
  }

  // ------------------------------------------------------------------ readout
  const showReadout = (mark: CycleMark, anchorX: number, anchorY: number) => {
    const readout = readoutRef.current
    if (!readout) return
    const node = document.createElement('span')
    node.textContent = `${mark.date} · ${wording.kinds[mark.kind]} · ${mark.title}`
    readout.show(node, { anchorX, anchorY })
  }
  const fromPointer = (event: React.PointerEvent) => {
    const rect = figureRef.current?.getBoundingClientRect()
    return { anchorX: event.clientX - (rect?.left ?? 0), anchorY: event.clientY - (rect?.top ?? 0) }
  }
  const fromMark = (target: Element) => {
    const figure = figureRef.current?.getBoundingClientRect()
    const box2 = target.getBoundingClientRect()
    return {
      anchorX: box2.left - (figure?.left ?? 0) + box2.width / 2,
      anchorY: box2.top - (figure?.top ?? 0),
    }
  }

  const bandLabelY = box.h - 22

  return (
    <div
      ref={rootRef}
      className="pt-root"
      data-island="cycle-partitur"
      data-figure={figureId}
      data-paused={onScreen ? undefined : ''}
      onKeyDown={onKeyDown}
    >
      <div className="score-zoom flex flex-wrap items-center gap-2" hidden={!ready}>
        <div className="flex items-center gap-1" role="group" aria-label={wording.zoom.group}>
          <Button variant="ghost" size="sm" type="button" aria-label={wording.zoom.in} onClick={() => scaleBy(1.6)}>
            +
          </Button>
          <Button variant="ghost" size="sm" type="button" aria-label={wording.zoom.out} onClick={() => scaleBy(1 / 1.6)}>
            −
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label={wording.zoom.reset}
            onClick={resetZoom}
            disabled={view.k === 1 && view.x === 0}
          >
            0
          </Button>
        </div>
        <span className="font-mono text-[11px] text-fg-faint" aria-live="polite">
          {wording.zoom.levelPrefix}
          {view.k.toFixed(1)}
        </span>
        <span className="font-mono text-[11px] text-fg-faint">{wording.hint}</span>
      </div>

      <div className="score-svg">
        <svg
          ref={svgRef}
          className="pt-svg"
          viewBox={`0 0 ${box.w} ${box.h}`}
          role="img"
          aria-label={wording.figureLabel}
          xmlns="http://www.w3.org/2000/svg"
        >
          {model.bands.map((band) => {
            const span = bandSpan(model, band, view)
            return (
              <rect
                key={band.phase}
                className="band-phase"
                x={n(span.x)}
                y={box.rulerY + 16}
                width={n(span.w)}
                height={bottomY + 24 - (box.rulerY + 16)}
              />
            )
          })}

          <path className="ruler" d={`M${box.laneX0} ${box.rulerY} H${box.spanX1}`} />
          {ticks.map((tick) => (
            <g key={tick.date}>
              <path className="ruler" d={`M${n(tick.x)} ${box.rulerY - 6} V${box.rulerY + 6}`} />
              <text className="t-note" x={n(tick.x)} y={box.rulerY - 14} textAnchor="middle">
                {tick.date}
              </text>
              <path className="grat" d={`M${n(tick.x)} ${box.rulerY + 16} V${bottomY + 24}`} />
            </g>
          ))}
          <text className="t-note t-dim" x={box.laneX0 + 2} y={box.rulerY + 22}>
            {wording.axis.note}
          </text>
          <text className="t-note t-dim" x={box.spanX1} y={box.rulerY + 22} textAnchor="end">
            {wording.axis.opened} · {wording.axis.newest}
          </text>

          {model.lanes.map((lane) => (
            <g key={lane.id}>
              <path
                className={`lane ${lane.quiet ? 'lane-thin' : ''} pr-${lane.persona}`}
                d={`M${box.laneX0} ${lane.y} H${box.spanX1}`}
              />
              <text className={`t-lane pr-${lane.persona}`} x={box.laneX0 - 14} y={lane.y - 14} textAnchor="end">
                {wording.lanes[lane.id]}
              </text>
              <text className="t-note t-dim" x={box.laneX0 - 14} y={lane.y + 2} textAnchor="end">
                {wording.laneRole[lane.id]}
              </text>
              <text className="t-note t-dim" x={box.laneX0 - 14} y={lane.y + 18} textAnchor="end">
                {lane.quiet ? wording.laneQuiet : wording.laneCount[lane.id]}
              </text>
            </g>
          ))}

          {placed
            .filter((p) => p.visible)
            .map((p) => {
              const persona = personaOf.get(p.mark.lane) ?? 'conductor'
              const label = `${p.mark.date} · ${wording.kinds[p.mark.kind]} · ${p.mark.title}`
              return (
                <a
                  key={p.mark.id}
                  className="evt"
                  href={p.mark.href}
                  aria-label={label}
                  data-mark={p.mark.id}
                  data-kind={p.mark.kind}
                  data-lane={p.mark.lane}
                  data-selected={selected === p.mark.id ? '' : undefined}
                  onClick={(event) => {
                    // A modified click is a reader asking the browser for the record itself
                    // (new tab, download) — the link stays a link, and the card stays out of it.
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                    event.preventDefault()
                    openMark(p.mark)
                  }}
                  onPointerEnter={(event) => showReadout(p.mark, fromPointer(event).anchorX, fromPointer(event).anchorY)}
                  onPointerMove={(event) => showReadout(p.mark, fromPointer(event).anchorX, fromPointer(event).anchorY)}
                  onPointerLeave={() => readoutRef.current?.hide()}
                  onFocus={(event) => {
                    const a = fromMark(event.currentTarget)
                    showReadout(p.mark, a.anchorX, a.anchorY)
                  }}
                  onBlur={() => readoutRef.current?.hide()}
                >
                  <title>{label}</title>
                  {markShape(p.mark.kind, p.x, p.y, persona)}
                  {p.label && (
                    <text className="t-note" x={n(p.x)} y={n(p.labelY)} textAnchor="middle">
                      {p.label}
                    </text>
                  )}
                  <rect className="hit" x={n(p.x - 16)} y={p.y - 24} width={32} height={56} fill="transparent" />
                </a>
              )
            })}

          {model.bands.map((band) => {
            const span = bandSpan(model, band, view)
            return (
              <text key={`${band.phase}-label`} className="t-note t-dim" x={n(span.x + 6)} y={bandLabelY}>
                {wording.band}
              </text>
            )
          })}
        </svg>
      </div>

      {selectedMark && (
        <MarkCard
          ref={cardRef}
          mark={selectedMark}
          persona={personaOf.get(selectedMark.lane) ?? 'conductor'}
          laneName={wording.lanes[selectedMark.lane]}
          kindName={wording.kinds[selectedMark.kind]}
          kindWhat={wording.kindWhat[selectedMark.kind]}
          wording={wording.card}
          onClose={closeCard}
        />
      )}
    </div>
  )
}

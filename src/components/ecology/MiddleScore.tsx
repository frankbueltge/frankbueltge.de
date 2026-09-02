// src/components/ecology/MiddleScore.tsx — the Middle's score, alive (visual layer, Phase 3d,
// 2026-09-02; docs/design/2026-09-02-the-visual-layer.md). It replaces the SVG-string builder
// that drew this figure from 2026-09-01, and draws the SAME class vocabulary — the 2026-07-15
// Zeichengrammatik's own (ruler, grat, lane, t-lane, t-note, mk-fill, mk, badge, flow, obl, hit,
// pr-<persona>) — so src/styles/score-map.css inks it unchanged. The original's ink, not an
// imitation, and now it answers the pointer.
//
// In the terms of the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. Every number comes from src/lib/ecology/middle-score-model.ts, which is pure and tested.
//      This file mounts, stretches the ruler, and opens a card; it computes no geometry.
//   2. The server render IS the figure: every mark is a real link to its quoted item and carries
//      the item's own first words as a native <title>, before any script has run. The frame lays
//      the table floor under it. Nothing here is reachable only through JavaScript.
//   3. No `style=` and no `style={{}}`: positions are SVG attributes from the model, and the only
//      dynamic style on the page is the readout's own placement inside createReadout (setVars).
//   4. prefers-reduced-motion: the zoom transitions take duration zero (score-kit/useZoomX).
//   5. The readout is a glance clamped to the figure's own box, never a hit target.
//   6. Budgeted in scripts/budgets.json; d3 arrives by submodule through the shared score kit.
//   7. NO NEW HUE. The three lanes wear the voices' recorded hues, and the signs are told apart
//      by SHAPE — square, current with a ring, dashed whiskers, numbered badge — exactly as the
//      first partitur told them apart.
//
// The house rule this figure exists to keep: an item is QUOTED, never summarised. The readout
// shows the item's first words and says so with an ellipsis; the card shows the item whole; the
// table floor shows every item whole. Nowhere does this figure speak for a practice.
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildSegments, type Segmented } from '@/lib/dataviz/stepper'
import {
  placeMiddle,
  plainText,
  flowPath,
  type MiddleMark,
  type MiddleScoreModel,
} from '@/lib/ecology/middle-score-model'
import type { PracticeId } from '@/lib/ecology/v3'

import {
  emitMarkSelected,
  focusMarkIn,
  isWalkKey,
  useFocusOnOpen,
  useOnScreen,
  useReadout,
  useZoomX,
  walkTo,
  ZOOM_STEP,
  ZoomControls,
  type ZoomControlsWording,
} from './score-kit'

/** The frame resolves the wording canon against the model before handing it over — the island
 *  receives plain, serialisable strings, and no number is ever typed into one. */
export interface MiddleScoreWording {
  figureLabel: string
  ruler: { ordinal: string; mirrored: string }
  laneQuiet: string
  hint: string
  zoom: ZoomControlsWording
  card: {
    voiceLabel: string
    addressedLabel: string
    numberLabel: string
    sourceLabel: string
    verbatim: string
    open: string
    close: string
    hint: string
  }
  /** practice id → the voice's own name, as the wording canon spells it */
  voiceName: Record<PracticeId, string>
  /** mark id → whom the item is addressed to, in words — resolved by the frame, never joined here */
  addressed: Record<string, string>
}

export interface MiddleScoreProps {
  model: MiddleScoreModel
  wording: MiddleScoreWording
  /** id of the Readout shell the frame renders beside this island */
  readoutId: string
  /** the id this figure answers to in the `dv:` contract */
  figureId: string
}

const MIN_K = 1
const MAX_K = 8

/** One decimal is what the string builder emitted and what an SVG attribute needs; keeping it
 *  keeps the server render byte-stable. */
function n(value: number): number {
  return Number(value.toFixed(1))
}

export default function MiddleScore({ model, wording, readoutId, figureId }: MiddleScoreProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const [selected, setSelected] = React.useState<string | null>(null)
  // False on the server AND on the first client render, so hydration matches; the effect below
  // flips it, which is when the controls (the one thing JavaScript adds) become real.
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { box } = model
  const bottomY = model.lanes.length > 0 ? model.lanes[model.lanes.length - 1]!.y : box.laneY0

  const onScreen = useOnScreen(rootRef)
  const readout = useReadout(rootRef, readoutId, '.score-figure')
  const { view, scaleBy, resetZoom } = useZoomX({
    svgRef,
    x0: box.laneX0,
    x1: box.spanX1,
    height: box.height,
    min: MIN_K,
    max: MAX_K,
    active: onScreen,
  })

  const placed = React.useMemo(() => placeMiddle(model, view), [model, view])
  const selectedMark = React.useMemo(
    () => model.marks.find((m) => m.id === selected) ?? null,
    [model.marks, selected],
  )

  // The keyboard walks the lane the focused mark is on — a practice's own items, in bulletin
  // order — and never wanders into a sibling's lane by arrow key.
  const walk: Segmented<MiddleMark> = React.useMemo(
    () => buildSegments(model.marks, (m) => m.practice),
    [model.marks],
  )

  const openMark = React.useCallback(
    (mark: MiddleMark) => {
      setSelected(mark.id)
      readout.hide()
      emitMarkSelected(window, {
        figure: figureId,
        key: mark.id,
        id: mark.id,
        practice: mark.practice,
        number: mark.number,
        href: `#${mark.id}`,
      })
    },
    [figureId, readout],
  )

  const closeCard = React.useCallback(() => {
    const id = selected
    setSelected(null)
    if (id) focusMarkIn(rootRef.current, id)
  }, [selected])

  useFocusOnOpen(selected, cardRef)

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
      scaleBy(ZOOM_STEP)
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      scaleBy(1 / ZOOM_STEP)
      return
    }
    if (event.key === '0') {
      event.preventDefault()
      resetZoom()
      return
    }
    if (!isWalkKey(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const currentId = active?.dataset.mark ?? selected
    if (!currentId) return
    const pos = walk.items.findIndex((m) => m.id === currentId)
    if (pos < 0) return
    const next = walkTo(walk, pos, event.key)
    if (next === pos) return
    event.preventDefault()
    const target = walk.items[next]!
    if (selected) setSelected(target.id)
    focusMarkIn(rootRef.current, target.id)
  }

  // The glance: the item's first words, cut at a word by the model and declared with an ellipsis
  // there. The whole item is one click away and stands in full in the table below.
  const showReadout = (mark: MiddleMark, anchorX: number, anchorY: number) => {
    const node = document.createElement('span')
    node.textContent = `${wording.voiceName[mark.practice]} · ${mark.title}`
    readout.show(node, { anchorX, anchorY })
  }

  return (
    <div
      ref={rootRef}
      className="pt-root"
      data-island="middle-score"
      data-figure={figureId}
      data-paused={onScreen ? undefined : ''}
      onKeyDown={onKeyDown}
    >
      <ZoomControls
        wording={wording.zoom}
        hint={wording.hint}
        view={view}
        ready={ready}
        onIn={() => scaleBy(ZOOM_STEP)}
        onOut={() => scaleBy(1 / ZOOM_STEP)}
        onReset={resetZoom}
      />

      <div className="score-svg">
        <svg
          ref={svgRef}
          className="pt-svg"
          viewBox={`0 0 ${box.w} ${box.height}`}
          role="img"
          aria-label={wording.figureLabel}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="mvs-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={9} markerHeight={9} orient="auto">
              <path d="M1 1 L9 5 L1 9" fill="none" className="marker-stroke" />
            </marker>
          </defs>

          {/* the graticule at every mark slot (recessive chrome), then the ruler — ordinal,
              and it says so at both ends */}
          {placed.graticules.map((x, i) => (
            <path key={i} className="grat" d={`M${n(x)} ${box.rulerY + 14} V${bottomY + 20}`} />
          ))}
          <path className="ruler" d={`M${box.laneX0} ${box.rulerY} H${box.spanX1}`} />
          <text className="t-note t-dim" x={box.laneX0 + 2} y={box.rulerY + 20}>
            {wording.ruler.ordinal}
          </text>
          <text className="t-note t-dim" x={box.spanX1} y={box.rulerY + 20} textAnchor="end">
            {wording.ruler.mirrored}
          </text>

          {/* the lanes, canonical order — a bulletin with no section for the siblings draws thin
              and says so */}
          {model.lanes.map((lane) => (
            <g key={lane.practice}>
              <path
                className={`lane ${lane.quiet ? 'lane-thin' : ''} pr-${lane.persona}`}
                d={`M${box.laneX0} ${lane.y} H${box.spanX1}`}
              />
              <text className={`t-lane pr-${lane.persona}`} x={box.laneX0 - 14} y={lane.y - 16} textAnchor="end">
                {lane.persona.toUpperCase()}
              </text>
              <text className="t-note t-dim" x={box.laneX0 - 14} y={lane.y + 2} textAnchor="end">
                {lane.quiet ? wording.laneQuiet : lane.practice}
              </text>
            </g>
          ))}

          {/* currents first, marks on top — a flow from the writer's mark to a ring on every
              lane the item names */}
          {placed.flows
            .filter((f) => f.visible)
            .map((flow) => (
              <g key={`${flow.markId}-${flow.to}`}>
                <path
                  className={`flow flow-down pr-${flow.persona}`}
                  markerEnd="url(#mvs-arrow)"
                  d={flowPath(flow.x, flow.y1, flow.x, flow.y2)}
                />
                <circle className={`mk pr-${flow.persona}`} cx={n(flow.x)} cy={flow.y2} r={5} fill="none" />
              </g>
            ))}

          {/* carried for both, naming neither — sustained toward both siblings, never arriving */}
          {placed.marks
            .filter((p) => p.visible && p.mark.whisker)
            .map((p) => (
              <g key={`${p.mark.id}-obl`}>
                <path className={`obl pr-${p.mark.persona}`} d={`M${n(p.x)} ${p.mark.y - 12} V${p.mark.y - 34}`} />
                <path className={`obl pr-${p.mark.persona}`} d={`M${n(p.x)} ${p.mark.y + 12} V${p.mark.y + 34}`} />
              </g>
            ))}

          {placed.marks
            .filter((p) => p.visible)
            .map(({ mark, x }) => (
              <a
                key={mark.id}
                className="evt"
                href={`#${mark.id}`}
                aria-label={mark.title}
                data-mark={mark.id}
                data-lane={mark.practice}
                data-selected={selected === mark.id ? '' : undefined}
                onClick={(event) => {
                  // A modified click is a reader asking the browser for the item itself (new tab,
                  // a copied link) — the link stays a link, and the card stays out of it.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  openMark(mark)
                }}
                onPointerEnter={(event) => {
                  const a = readout.fromPointer(event)
                  showReadout(mark, a.anchorX, a.anchorY)
                }}
                onPointerMove={(event) => {
                  const a = readout.fromPointer(event)
                  showReadout(mark, a.anchorX, a.anchorY)
                }}
                onPointerLeave={() => readout.hide()}
                onFocus={(event) => {
                  const a = readout.fromMark(event.currentTarget)
                  showReadout(mark, a.anchorX, a.anchorY)
                }}
                onBlur={() => readout.hide()}
              >
                <title>{mark.title}</title>
                <rect className={`mk-fill pr-${mark.persona}`} x={n(x - 8)} y={mark.y - 8} width={16} height={16} />
                <circle className="badge" cx={n(x - 22)} cy={mark.y - 26} r={9} />
                <text className="badge-n" x={n(x - 22)} y={n(mark.y - 22.8)} textAnchor="middle">
                  {mark.number}
                </text>
                <rect className="hit" x={n(x - 26)} y={mark.y - 40} width={52} height={80} fill="transparent" />
              </a>
            ))}
        </svg>
      </div>

      {selectedMark && (
        <ItemCard
          ref={cardRef}
          mark={selectedMark}
          voiceName={wording.voiceName[selectedMark.practice]}
          addressed={wording.addressed[selectedMark.id] ?? ''}
          wording={wording.card}
          onClose={closeCard}
        />
      )}
    </div>
  )
}

interface ItemCardProps {
  mark: MiddleMark
  voiceName: string
  addressed: string
  wording: MiddleScoreWording['card']
  onClose(): void
}

/** The card an item opens. It shows the item WHOLE — the Middle transcribes, it does not
 *  summarise, so a card that shortened what a practice wrote would break the one rule this page
 *  is built on. The markdown marks the practice typed are stripped for reading (plainText), and
 *  nothing else is touched. */
const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(function ItemCard(
  { mark, voiceName, addressed, wording, onClose },
  ref,
) {
  return (
    <Card
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={mark.title}
      className="score-card mt-4 outline-none"
      data-lane={mark.practice}
      data-mark={mark.id}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`score-card-lane pr-${mark.persona}`}>
            {voiceName}
          </Badge>
          <Badge variant="secondary">{addressed}</Badge>
          <span className="font-mono text-xs text-fg-faint">{mark.number}</span>
        </div>
        <CardTitle className="text-base font-normal text-fg">
          <blockquote className="border-l border-line pl-4 text-sm leading-relaxed">{plainText(mark.text)}</blockquote>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-mono text-[11px] text-fg-faint">{wording.verbatim}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-fg-faint">
          <dt>{wording.voiceLabel}</dt>
          <dd className="text-fg-muted">{voiceName}</dd>
          <dt>{wording.addressedLabel}</dt>
          <dd className="text-fg-muted">{addressed}</dd>
          <dt>{wording.numberLabel}</dt>
          <dd className="text-fg-muted">{mark.number}</dd>
          <dt>{wording.sourceLabel}</dt>
          <dd className="break-all text-fg-muted">{mark.source}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <a href={`#${mark.id}`}>{wording.open}</a>
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            {wording.close}
          </Button>
          <span className="font-mono text-[11px] text-fg-faint">{wording.hint}</span>
        </div>
      </CardContent>
    </Card>
  )
})

export { ItemCard }

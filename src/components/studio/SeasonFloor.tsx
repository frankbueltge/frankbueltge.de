// src/components/studio/SeasonFloor.tsx — the Studio's signature figure as an island (visual
// layer, Phase 3d, 2026-09-02): "The floor keeps every mark." One stage floor carrying the whole
// season — every premiere lit, every strike taped, every return curving back into production, and
// the withdrawal as a struck spotlight.
//
// What changed on the way here, and what did not. Until today the figure was an SVG STRING built
// by src/lib/studio/season.ts, dropped in with `set:html`, and enhanced by a plain module script:
// two languages for one drawing, and a payload script repeating the model in JSON so the second
// language could read what the first had drawn. This file is the same drawing in one language.
// The GEOMETRY did not move — every number still comes from season.ts, which keeps its string
// builder byte for byte, because the hub's thumbnails and the tour's build-time stills are cut
// from it (src/lib/hub/triptych.ts, tours/ThreeReturns.astro). The two renderings are held against
// each other in SeasonFloor.test.tsx, so neither can drift alone.
//
// What the island is and is not, in the terms of the seven duties
// (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. IT COMPUTES NOTHING IT CLAIMS. Every position, every label, every date is a field of the
//      SeasonMark that season.ts derived from committed data alone; every visitor-facing string is
//      resolved by the frame (SeasonFloor.astro) and arrives here already spelled out. No number
//      is typed into a string in this file, and no config file is read from it.
//   2. THE SERVER RENDER IS THE FLOOR. Rendered on the server this is the complete no-JS figure:
//      the stage, the axis, every mark in its own <g> with its own native <title> carrying the
//      verbatim record. What JavaScript adds is the legend filter, the readout, the card and the
//      keyboard walk. The table under the figure (TableFallback, mounted by the frame) repeats the
//      whole record in words, so nothing is reachable only by pointing at a mark.
//   3. NO style ATTRIBUTE ANYWHERE. Positions are SVG attributes computed from the model; the
//      readout's placement and the legend swatch's colour VALUE go through setVars
//      (dataviz/runtime.ts), the one sanctioned dynamic-styling path under this site's CSP. No hex
//      is written here — studio-stage.css inks the `.st-sf-*` classes.
//   4. REDUCED MOTION IS HONOURED: the curtain-up gesture is a class the stylesheet gates on
//      `prefers-reduced-motion: no-preference`, so a visitor who asked for stillness never has an
//      animation declared against their marks at all.
//   5. THE READOUT follows the house rules of dataviz/readout.ts — clamped to the figure's own box
//      (`.st-sf-figure`), never a hit target. The frame renders the shell beside this island.
//   6. THE BUDGET: no chart library, no d3 — this figure has no ruler to zoom, so it carries no
//      zoom either. React and the score-kit are the whole of its JavaScript.
//   7. NO NEW HUE. The four states are told apart by SHAPE as much as by colour — a lit pool, the
//      same pool struck through, a taped X, an arc with a Roman numeral — and every mark letters
//      its own name on the floor, so identity is never carried by colour alone.
import * as React from 'react'

import {
  emitMarkSelected,
  focusMarkIn,
  isWalkKey,
  useFigureReady,
  useFocusOnOpen,
  useReadout,
  walkTo,
} from '@/components/ecology/score-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isOn, toggle } from '@/lib/dataviz/filter'
import { setVars } from '@/lib/dataviz/runtime'
import { buildSegments, positionLabel, type Segmented } from '@/lib/dataviz/stepper'
import {
  AXIS,
  FLOOR,
  PROD_Y,
  hoverText,
  litParts,
  noteParts,
  returnParts,
  seasonOrder,
  strikeParts,
  type SeasonMark,
  type SeasonModel,
  type SeasonState,
} from '@/lib/studio/season'
import type { FocusState } from '@/lib/tour/types'

/** The frame resolves the wording canon against the model before handing it over — an island
 *  receives plain, serialisable strings, and no number is ever typed into one. */
export interface SeasonFloorWording {
  /** accessible name of the whole drawing */
  figureLabel: string
  /** the season's own strapline, lettered on the curtain bar */
  headline: string
  /** the production band's label */
  productionLabel: string
  legendLabel: string
  /** in the order the legend reads; the count comes from the model, never from here */
  legend: { key: SeasonState; label: string; hint: string; swatch: string }[]
  /** what the house did, per state — the same words the table and the native titles use */
  stateWord: Record<SeasonState, string>
  /** said where a strike's own evening is missing from the mirror */
  unknownEvening: string
  /** the one segment the keyboard walk runs along */
  segmentLabel: string
  card: {
    stateLabel: string
    sessionLabel: string
    eveningLabel: string
    sourceLabel: string
    positionLabel: string
    open: string
    close: string
    hint: string
  }
}

export interface SeasonFloorProps {
  model: SeasonModel
  wording: SeasonFloorWording
  /** the id this figure registers under for `dv:figure-ready` (tour contract), and the id of its
   *  own root element — a deep link may aim at it */
  id: string
  /** id of the dataviz Readout shell the frame renders beside this island */
  readoutId: string
  /** mark key → the work it belongs to, resolved by the frame. A struck project never premiered,
   *  so it has no page to open and is absent here. */
  links: Record<string, string>
}

/**
 * A hover readout is a glance, not the archive. Some records here run to a paragraph (the
 * withdrawal note is the collective's own full `medium` line), and shown whole the tooltip covered
 * the floor it was describing. So the readout carries the record's first sentence and an explicit
 * ellipsis when there is more — never a silent mid-word cut, and never the only place the full text
 * exists: the card and the table below both carry it entire.
 */
function glance(record: string): string {
  if (record.length <= 200) return record
  const end = record.indexOf('. ')
  const head = end > 40 && end < 260 ? record.slice(0, end + 1) : record.slice(0, record.lastIndexOf(' ', 200))
  return `${head} […]`
}

export default function SeasonFloor({ model, wording, id, readoutId, links }: SeasonFloorProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const [filter, setFilter] = React.useState<string[]>([])
  const [dim, setDim] = React.useState<string[]>([])
  const [notes, setNotes] = React.useState<{ key: string; text: string }[]>([])
  const [selected, setSelected] = React.useState<string | null>(null)
  // False on the server AND on the first client render, so hydration matches; the effect below
  // flips it, and that is when the curtain goes up (the stylesheet decides whether it moves).
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => setEntered(true), [])

  const readout = useReadout(rootRef, readoutId, '.st-sf-figure')

  /** The whole season in one chronological run — what the arrow keys and the card's position line
   *  walk. One segment: this floor is not divided into lanes, it is a stage. */
  const walk: Segmented<SeasonMark> = React.useMemo(
    () => buildSegments(seasonOrder(model.marks), () => wording.segmentLabel),
    [model.marks, wording.segmentLabel],
  )
  const selectedAt = React.useMemo(
    () => walk.items.findIndex((m) => m.key === selected),
    [walk, selected],
  )
  const selectedMark = selectedAt >= 0 ? walk.items[selectedAt]! : null

  const lit = model.marks.filter((m) => m.state === 'premiered' || m.state === 'withdrawn')
  const struck = model.marks.filter((m) => m.state === 'struck')
  const returns = model.marks.filter((m) => m.state === 'returned')

  // ------------------------------------------------------------------ selection
  const openMark = React.useCallback(
    (mark: SeasonMark) => {
      setSelected(mark.key)
      readout.hide()
      // The floor as a switchboard (2026-08-01): whoever is listening — on /studio that is the
      // house dossier wrapping this figure — learns which mark is open. Bubbling and outbound only:
      // this figure gains no knowledge of what, if anything, is listening. A listener that drives
      // the floor back through `apply` cannot loop, because re-selecting the mark that is already
      // chosen changes nothing.
      if (rootRef.current) emitMarkSelected(rootRef.current, { figure: id, key: mark.key }, true)
    },
    [id, readout],
  )

  const closeCard = React.useCallback(() => {
    const key = selected
    setSelected(null)
    if (key) focusMarkIn(rootRef.current, key)
  }, [selected])

  useFocusOnOpen(selected, cardRef)

  // ------------------------------------------------------------------ the tour contract
  useFigureReady(id, (focus: FocusState) => {
    if (focus.figure !== id) return
    // `filter: null` explicitly clears; `undefined` means this scene does not touch the filter
    if (focus.filter !== undefined) setFilter(focus.filter ?? [])
    setDim(focus.dim ?? [])
    setNotes(focus.annotate ?? [])
    if (focus.select) {
      const mark = model.marks.find((m) => m.key === focus.select)
      if (mark) openMark(mark)
    } else {
      setSelected(null)
    }
  })

  // ------------------------------------------------------------------ the readout
  const showReadout = (m: SeasonMark, anchorX: number, anchorY: number) => {
    const node = document.createDocumentFragment()
    const head = document.createElement('b')
    head.className = 'r-head'
    head.textContent = m.label
    const state = document.createElement('span')
    state.textContent = `${wording.stateWord[m.state]}${m.session ? ` · ${m.session}` : ''} · ${
      m.dateKnown ? m.date : `${m.date} (${wording.unknownEvening})`
    }`
    const record = document.createElement('span')
    record.className = 'r-body'
    record.textContent = glance(m.record)
    const src = document.createElement('span')
    src.className = 'r-src'
    src.textContent = m.source
    node.append(head, state, document.createElement('br'), record, src)
    const shell = readout.element()
    if (shell) shell.dataset.state = m.state
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
    const active = (event.target as Element | null)?.closest?.('[data-key]') as HTMLElement | null
    const current = active?.dataset.key ?? selected
    if (!current) return
    const pos = walk.items.findIndex((m) => m.key === current)
    if (pos < 0) return
    const next = walkTo(walk, pos, event.key)
    if (next === pos) return
    event.preventDefault()
    const target = walk.items[next]!
    if (selected) setSelected(target.key)
    focusMarkIn(rootRef.current, target.key)
  }

  // ------------------------------------------------------------------ one mark's shared wiring
  //
  // Filter, dim and selection are ATTRIBUTES the stylesheet reads; no mark ever moves when the
  // legend is touched. `data-key` is this floor's own name for a mark — the string renderer, the
  // tour's stills and studio/Dossier.astro all read it — and `data-mark` is the name the shared
  // score-kit looks for when it moves focus, so a mark carries both rather than the kit carrying
  // two spellings.
  const markProps = (m: SeasonMark, className: string) => ({
    className,
    'data-state': m.state,
    'data-on': isOn(filter, m.state) ? '' : undefined,
    'data-dim': dim.includes(m.key) ? '' : undefined,
    'data-sel': selected === m.key ? '' : undefined,
    'data-key': m.key,
    'data-mark': m.key,
    tabIndex: 0,
    role: 'button',
    onPointerEnter: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(m, a.anchorX, a.anchorY)
    },
    onPointerMove: (event: React.PointerEvent) => {
      const a = readout.fromPointer(event)
      showReadout(m, a.anchorX, a.anchorY)
    },
    onPointerLeave: () => readout.hide(),
    onFocus: (event: React.FocusEvent<SVGGElement>) => {
      const a = readout.fromMark(event.currentTarget)
      showReadout(m, a.anchorX, a.anchorY)
    },
    onBlur: () => readout.hide(),
    onClick: () => openMark(m),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      openMark(m)
    },
  })

  /** The legend swatch's colour is a VALUE the frame supplies (a custom-property reference such as
   *  `var(--st-c-lit)`), applied through the CSSOM — never a style attribute, which this site's CSP
   *  drops without a word. */
  const swatchRef = (value: string) => (el: HTMLButtonElement | null) => {
    if (el) setVars(el, { '--dv-swatch': value })
  }

  const legendLabelId = `${id}-legend-label`
  const cardW = wording.card

  return (
    <div ref={rootRef} id={id} className="st-sf-root" data-island="season-floor" onKeyDown={onKeyDown}>
      <p className="st-sf-key" id={legendLabelId}>
        {wording.legendLabel}
      </p>
      <ul className="dv-legend" aria-labelledby={legendLabelId}>
        {wording.legend.map((item) => (
          <li key={item.key} className="dv-legend-item">
            <button
              type="button"
              className="dv-legend-btn"
              data-dv-legend-key={item.key}
              aria-pressed={filter.includes(item.key)}
              title={item.hint}
              ref={swatchRef(item.swatch)}
              onClick={() => setFilter((keys) => toggle(keys, item.key, 'multi'))}
            >
              <span className="dv-legend-swatch" data-dv-swatch-dot="" aria-hidden="true" />
              <span className="dv-legend-label">{item.label}</span>
              <span className="dv-legend-count">{model.counts[item.key]}</span>
            </button>
          </li>
        ))}
      </ul>

      <svg
        className={entered ? 'st-sf st-sf-enter' : 'st-sf'}
        viewBox={`0 0 ${model.width} ${model.height}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
        data-lettering={model.lettering}
        aria-label={wording.figureLabel}
      >
        {/* the floor, the curtain line, and the lamp bar the light hangs from */}
        <rect
          className="st-sf-floor"
          x={FLOOR.x0}
          y={FLOOR.y0}
          width={FLOOR.x1 - FLOOR.x0}
          height={FLOOR.y1 - FLOOR.y0}
        />
        <path className="st-sf-curtain" d={`M${FLOOR.x0} ${FLOOR.y0} H${FLOOR.x1}`} />
        <path className="st-sf-bar" d={`M${FLOOR.x0} ${FLOOR.y0 - 22} H${FLOOR.x1}`} />
        <text className="st-sf-headline" x={FLOOR.x0} y={FLOOR.y0 - 34}>
          {wording.headline}
        </text>

        {/* the production area — the upstage band a returned work goes back into */}
        <path className="st-sf-prod" d={`M${FLOOR.x0 + 24} ${PROD_Y + 26} H${FLOOR.x1 - 24}`} />
        <text className="st-sf-prod-label" x={FLOOR.x0 + 24} y={PROD_Y + 46}>
          {wording.productionLabel}
        </text>

        {/* The season's own time axis is the floor's downstage edge itself — two ticks on it, and
            only the two dates the data actually carries (an invented month grid would be a claim
            about evenings the house never played). The dates letter at the TOP, where the axis
            starts, so the upstage edge stays free for the production band's own label. */}
        <path
          className="st-sf-axis"
          d={`M${AXIS.x0} ${FLOOR.y1 - 7} V${FLOOR.y1 + 7} M${AXIS.x1} ${FLOOR.y1 - 7} V${FLOOR.y1 + 7}`}
        />
        <text className="st-sf-tick" x={FLOOR.x0 + 10} y={FLOOR.y0 + 20}>
          {model.firstDate}
        </text>
        <text className="st-sf-tick" x={FLOOR.x1 - 10} y={FLOOR.y0 + 20} textAnchor="end">
          {model.lastDate}
        </text>

        {/* returns first, so an arc never draws over the pool it leaves */}
        {returns.map((m) => {
          const p = returnParts(m, model)
          return (
            <g key={m.key} {...markProps(m, 'st-sf-return')}>
              <path className="st-sf-arc" d={p.arc} />
              <path className="st-sf-arrow" d={p.arrow} />
              <text className="st-sf-ord" x={p.ordinal.x} y={p.ordinal.y} textAnchor="middle">
                {p.ordinal.text}
              </text>
              <circle className="st-sf-hit" cx={p.hit.cx} cy={p.hit.cy} r={p.hit.r} />
              <title>{hoverText(m)}</title>
            </g>
          )
        })}

        {struck.map((m) => {
          const p = strikeParts(m)
          const anchor = p.anchorEnd ? 'end' : undefined
          return (
            <g key={m.key} {...markProps(m, 'st-sf-strike')}>
              <path className="st-sf-x" d={p.x} />
              <text className="st-sf-strike-n" x={p.labelX} y={p.name.y} textAnchor={anchor}>
                {p.name.text}
              </text>
              <text className="st-sf-strike-s" x={p.labelX} y={p.session.y} textAnchor={anchor}>
                {p.session.text}
              </text>
              <rect className="st-sf-hit" x={p.hit.x} y={p.hit.y} width={p.hit.width} height={p.hit.height} />
              <title>{hoverText(m)}</title>
            </g>
          )
        })}

        {lit.map((m) => {
          const p = litParts(m)
          return (
            <g key={m.key} {...markProps(m, 'st-sf-lit')}>
              <rect
                className="st-sf-lamp"
                x={p.lamp.x}
                y={p.lamp.y}
                width={p.lamp.width}
                height={p.lamp.height}
              />
              {p.beams.map((d) => (
                <path key={d} className="st-sf-beam" d={d} />
              ))}
              <ellipse
                className={p.pool.className}
                cx={p.pool.cx}
                cy={p.pool.cy}
                rx={p.pool.rx}
                ry={p.pool.ry}
              />
              {p.tape.map((d) => (
                <path key={d} className="st-sf-tape" d={d} />
              ))}
              <text className="st-sf-title" x={p.title.x} y={p.title.y} textAnchor="middle">
                {p.title.text}
              </text>
              <text className="st-sf-litmeta" x={p.meta.x} y={p.meta.y} textAnchor="middle">
                {p.meta.text}
              </text>
              {p.through && <path className="st-sf-x st-sf-x-through" d={p.through} />}
              <ellipse className="st-sf-hit" cx={p.hit.cx} cy={p.hit.cy} rx={p.hit.rx} ry={p.hit.ry} />
              <title>{hoverText(m)}</title>
            </g>
          )
        })}

        {/* A scene's call-outs are lettered as real SVG text at the marks they name — the same place
            the build-time stills letter them, and rendered from state rather than appended to the
            DOM, so the drawing has exactly one author. */}
        {notes.map((note) => {
          const m = model.marks.find((k) => k.key === note.key)
          if (!m) return null
          const p = noteParts(m)
          return (
            <g key={note.key} className="st-sf-note">
              <path d={p.stem} />
              <text x={p.x} y={p.y} textAnchor="middle">
                {note.text}
              </text>
            </g>
          )
        })}
      </svg>

      {selectedMark && (
        <Card
          ref={cardRef}
          tabIndex={-1}
          role="group"
          aria-label={selectedMark.label}
          className="st-sf-card mt-4 outline-none"
          data-state={selectedMark.state}
          data-key={selectedMark.key}
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{wording.stateWord[selectedMark.state]}</Badge>
              <span className="font-mono text-xs text-fg-faint">
                {selectedMark.session ? `${selectedMark.session} · ` : ''}
                {selectedMark.dateKnown ? selectedMark.date : `${selectedMark.date} (${wording.unknownEvening})`}
              </span>
            </div>
            <CardTitle className="text-base text-fg">{selectedMark.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* verbatim, always and entire — the record is the reason this figure exists */}
            <q className="block text-sm leading-relaxed text-fg-muted">{selectedMark.record}</q>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-fg-faint">
              <dt>{cardW.stateLabel}</dt>
              <dd className="text-fg-muted">{wording.stateWord[selectedMark.state]}</dd>
              {selectedMark.session && (
                <>
                  <dt>{cardW.sessionLabel}</dt>
                  <dd className="text-fg-muted">{selectedMark.session}</dd>
                </>
              )}
              <dt>{cardW.eveningLabel}</dt>
              <dd className="text-fg-muted">
                {selectedMark.dateKnown ? selectedMark.date : `${selectedMark.date} (${wording.unknownEvening})`}
              </dd>
              <dt>{cardW.sourceLabel}</dt>
              <dd className="break-all text-fg-muted">{selectedMark.source}</dd>
              <dt>{cardW.positionLabel}</dt>
              <dd className="text-fg-muted">{positionLabel(walk, selectedAt)}</dd>
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              {links[selectedMark.key] && (
                <Button asChild size="sm" variant="outline">
                  <a href={links[selectedMark.key]}>{cardW.open}</a>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closeCard}>
                {cardW.close}
              </Button>
              <span className="font-mono text-[11px] text-fg-faint">{cardW.hint}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export type { SeasonMark, SeasonModel, SeasonState }

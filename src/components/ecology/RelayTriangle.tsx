// src/components/ecology/RelayTriangle.tsx — the Middle's triangle, alive (2026-10-05).
//
// Three practices at the corners; between every two of them a lane in each direction, from the
// practice that gave something to the one that took it up, its strokes built on (strong),
// answered (medium) and noted (a hairline). A direction in which nothing load-bearing passed is
// a dashed, empty track. The record is the relay research-ecology publishes
// (src/lib/ecology/relay.ts); the geometry is src/lib/ecology/relay-triangle.ts.
//
// In the terms of the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//
//   1. Every coordinate, width and count comes from relay-triangle.ts, pure and tested. This file
//      switches between the two windows the frame hands it, opens a lane's card and answers the
//      pointer; it computes nothing that carries a claim.
//   2. The server render is the figure: every lane is a real link to its group in the table floor
//      and carries its counts as a native <title>, before any script runs. The window toggle is
//      hidden until the island has mounted — a control that does nothing without JavaScript is
//      worse than none — and a static line says which window the server drew.
//   3. No `style=` and no `style={{}}`: positions and widths are SVG attributes from the model;
//      the only dynamic style is the readout's own placement inside createReadout (setVars).
//   4. prefers-reduced-motion: the dimming transition is CSS and takes no time under the
//      preference (src/styles/middle-relay.css); nothing moves on its own.
//   5. The readout is a glance clamped to the figure's own box, never a hit target.
//   6. Its weight is reported by scripts/bundle-budget.mjs; no d3, no chart library.
//   7. NO NEW HUE. A lane wears the hue of the practice that gave — the ecology quartet's recorded
//      steps (PALETTE: ecology-voices, by token from hub-triptych.css) — and the three kinds are
//      told apart by width and strength, never by a colour of their own.
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RelayKind } from '@/lib/ecology/relay'
import {
  WINDOWS,
  bandAnchor,
  type Band,
  type RelationRow,
  type TriangleModel,
  type WindowId,
} from '@/lib/ecology/relay-triangle'
import type { PracticeId } from '@/lib/ecology/v3'

import { emitMarkSelected, focusMarkIn, useFocusOnOpen, useReadout } from './score-kit'

/** The frame resolves the wording canon against the model before handing it over: the island
 *  receives plain strings, one per window where a count is in them, and types no number. */
export interface RelayTriangleWording {
  figureLabel: string
  windowGroup: string
  /** the toggle's labels, one per window, dates resolved */
  windows: Record<WindowId, string>
  /** the static line the server render carries in place of the toggle */
  drawn: Record<WindowId, string>
  hint: string
  kinds: Record<RelayKind, string>
  practiceName: Record<PracticeId, string>
  persona: Record<PracticeId, string>
  /** per window, per lane: "The Field → The Studio · built on 3 · answered 0 · noted 2" */
  bandLabel: Record<WindowId, Record<string, string>>
  /** per window, per lane: the counts alone, for the card, whose title already names the lane */
  bandCounts: Record<WindowId, Record<string, string>>
  /** per window, per corner: what the practice gave and took up */
  nodeLabel: Record<WindowId, Record<PracticeId, string>>
  /** per window: the directions in which nothing load-bearing passed, in words */
  isolation: Record<WindowId, string>
  /** set when there is no relay to draw — then the corners stand alone and this says why */
  notReported: { title: string; body: string } | null
  card: {
    close: string
    empty: string
    given: string
    taken: string
    noRef: string
    thread: string
    corrects: string
    hint: string
  }
}

export interface RelayTriangleProps {
  windows: Record<WindowId, TriangleModel>
  defaultWindow: WindowId
  /** every relation of the relay, once; a lane names the ids it draws */
  rows: RelationRow[]
  wording: RelayTriangleWording
  /** id of the Readout shell the frame renders beside this island */
  readoutId: string
  /** the id this figure answers to in the `dv:` contract */
  figureId: string
}

const WALK_NEXT = new Set(['ArrowRight', 'ArrowDown'])
const WALK_PREV = new Set(['ArrowLeft', 'ArrowUp'])

export default function RelayTriangle({ windows, defaultWindow, rows, wording, readoutId, figureId }: RelayTriangleProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [win, setWin] = React.useState<WindowId>(defaultWindow)
  const [selected, setSelected] = React.useState<string | null>(null)
  // False on the server AND on the first client render, so hydration matches; the effect flips
  // it, which is when the toggle (the one control JavaScript adds) becomes real.
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const readout = useReadout(rootRef, readoutId, '.tri-figure')
  const model = windows[win]
  const reported = wording.notReported === null
  const byId = React.useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])
  const selectedBand = selected ? (model.bands.find((b) => b.id === selected) ?? null) : null

  const openBand = (band: Band) => {
    setSelected(band.id)
    readout.hide()
    emitMarkSelected(window, { figure: figureId, key: band.id, id: band.id, giver: band.giver, taker: band.taker, window: win })
  }
  const closeCard = () => {
    const id = selected
    setSelected(null)
    if (id) focusMarkIn(rootRef.current, id)
  }
  useFocusOnOpen(selected, cardRef)

  // Esc closes an open card from anywhere on the page, not only while focus is inside the island:
  // a reader who scrolled away from the card should not have to find it to dismiss it.
  const closeRef = React.useRef(closeCard)
  closeRef.current = closeCard
  React.useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected])

  const showReadout = (band: Band, anchor: { anchorX: number; anchorY: number }) => {
    const node = document.createElement('span')
    node.textContent = wording.bandLabel[win]?.[band.id] ?? ''
    readout.show(node, anchor)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!WALK_NEXT.has(event.key) && !WALK_PREV.has(event.key)) return
    const active = (event.target as Element | null)?.closest?.('[data-mark]') as HTMLElement | null
    const current = active?.dataset.mark
    if (!current) return
    const ids = model.bands.map((b) => b.id)
    const at = ids.indexOf(current)
    if (at < 0) return
    event.preventDefault()
    const next = ids[(at + (WALK_NEXT.has(event.key) ? 1 : ids.length - 1)) % ids.length]!
    if (selected) setSelected(next)
    focusMarkIn(rootRef.current, next)
  }

  const { box } = model
  return (
    <div
      ref={rootRef}
      className="tri-root"
      data-island="relay-triangle"
      data-figure={figureId}
      data-window={win}
      data-active={selected ? '' : undefined}
      onKeyDown={onKeyDown}
    >
      {reported && (
        <div className="tri-controls">
          <div className="tri-windows" role="group" aria-label={wording.windowGroup} hidden={!ready}>
            {WINDOWS.map((w) => (
              <Button
                key={w}
                type="button"
                size="sm"
                variant={w === win ? 'secondary' : 'ghost'}
                aria-pressed={w === win}
                data-window={w}
                onClick={() => setWin(w)}
              >
                {wording.windows[w]}
              </Button>
            ))}
          </div>
          <p className="tri-drawn" hidden={ready}>
            {wording.drawn[defaultWindow]}
          </p>
        </div>
      )}

      <svg
        className="tri-svg"
        viewBox={`0 0 ${box.w} ${box.h}`}
        role="img"
        aria-label={wording.figureLabel}
        xmlns="http://www.w3.org/2000/svg"
      >
        {reported &&
          model.bands.map((band) => (
            <a
              key={band.id}
              className={`tri-band g-${band.giver}`}
              href={`#${bandAnchor(band.id)}`}
              aria-label={wording.bandLabel[win]?.[band.id]}
              data-mark={band.id}
              data-giver={band.giver}
              data-taker={band.taker}
              data-empty={band.empty ? '' : undefined}
              data-selected={selected === band.id ? '' : undefined}
              onClick={(event) => {
                // a modified click asks the browser for the link itself; the card stays out of it
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                openBand(band)
              }}
              onPointerEnter={(event) => showReadout(band, readout.fromPointer(event))}
              onPointerMove={(event) => showReadout(band, readout.fromPointer(event))}
              onPointerLeave={() => readout.hide()}
              onFocus={(event) => showReadout(band, readout.fromMark(event.currentTarget))}
              onBlur={() => readout.hide()}
            >
              <title>{wording.bandLabel[win]?.[band.id]}</title>
              <polygon className="tri-hit" points={band.hit} fill="transparent" />
              {band.void && (
                <line className="tri-void" x1={band.void.x1} y1={band.void.y1} x2={band.void.x2} y2={band.void.y2} />
              )}
              {band.strokes.map((s) => (
                <line
                  key={s.kind}
                  className={`tri-stroke k-${s.kind}`}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  strokeWidth={s.width}
                />
              ))}
              <polygon className="tri-arrow" points={band.arrow} />
            </a>
          ))}

        {model.nodes.map((node) => (
          <g key={node.practice} className={`tri-node g-${node.practice}`} data-practice={node.practice}>
            <title>{wording.nodeLabel[win]?.[node.practice]}</title>
            <circle className="tri-node-disc" cx={node.x} cy={node.y} r={node.r} />
            <text className="tri-name" x={node.x} y={node.nameY} textAnchor="middle">
              {wording.practiceName[node.practice]}
            </text>
            <text className="tri-persona" x={node.x} y={node.personaY} textAnchor="middle">
              {wording.persona[node.practice]}
            </text>
          </g>
        ))}
      </svg>

      {reported ? (
        <>
          <p className="tri-isolation" aria-live="polite">
            {wording.isolation[win]}
          </p>
          <p className="tri-hint" hidden={!ready}>
            {wording.hint}
          </p>
        </>
      ) : (
        wording.notReported && (
          <div className="tri-unreported">
            <p className="tri-unreported-title">{wording.notReported.title}</p>
            <p className="tri-unreported-body">{wording.notReported.body}</p>
          </div>
        )
      )}

      {selectedBand && (
        <BandCard
          ref={cardRef}
          band={selectedBand}
          label={wording.bandLabel[win]?.[selectedBand.id] ?? ''}
          counts={wording.bandCounts[win]?.[selectedBand.id] ?? ''}
          windowLabel={wording.windows[win]}
          rows={selectedBand.relationIds.map((id) => byId.get(id)).filter((r): r is RelationRow => r !== undefined)}
          wording={wording}
          onClose={closeCard}
        />
      )}
    </div>
  )
}

interface BandCardProps {
  band: Band
  /** the lane's full label — the card's accessible name */
  label: string
  /** the counts alone — the title above already names the lane */
  counts: string
  windowLabel: string
  rows: RelationRow[]
  wording: RelayTriangleWording
  onClose(): void
}

/** The card a lane opens: its relations in the window, newest first, each with its two
 *  commit-pinned references — where it was given, and where it was taken up. */
const BandCard = React.forwardRef<HTMLDivElement, BandCardProps>(function BandCard(
  { band, label, counts, windowLabel, rows, wording, onClose },
  ref,
) {
  const W = wording.card
  const name = wording.practiceName
  return (
    // data-mark: the arrow keys keep walking the lanes while focus is inside the card (the house
    // pattern of MiddleScore's card); the lane itself comes first in the DOM, so focusMarkIn still
    // finds the lane, not the card
    <Card
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={label}
      className="tri-card mt-4 outline-none"
      data-giver={band.giver}
      data-mark={band.id}
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold text-fg">
          <span className={`tri-dot g-${band.giver}`} aria-hidden="true" />
          {name[band.giver]} → {name[band.taker]}
        </CardTitle>
        <p className="font-mono text-[11px] text-fg-faint">
          {counts} · {windowLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-fg-faint">{W.empty}</p>
        ) : (
          <ul className="tri-rel-list">
            {rows.map((r) => (
              <li key={r.id} className="tri-rel" data-kind={r.kind}>
                <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] text-fg-faint">
                  <span>{r.date}</span>
                  <span className={`tri-kind k-${r.kind}`}>{wording.kinds[r.kind]}</span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{r.what}</p>
                <p className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-fg-faint">
                  {r.giverHref ? (
                    <a className="underline hover:text-fg" href={r.giverHref}>
                      {W.given}
                    </a>
                  ) : (
                    <span>{W.noRef}</span>
                  )}
                  {r.takerHref ? (
                    <a className="underline hover:text-fg" href={r.takerHref}>
                      {W.taken}
                    </a>
                  ) : (
                    <span>{W.noRef}</span>
                  )}
                  {r.thread && (
                    <span>
                      {W.thread} {r.thread}
                    </span>
                  )}
                  {r.corrects && (
                    <span>
                      {W.corrects}{' '}
                      {r.correctsAnchor ? (
                        <a className="underline hover:text-fg" href={`#${r.correctsAnchor}`}>
                          {r.corrects}
                        </a>
                      ) : (
                        r.corrects
                      )}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="ghost" type="button" onClick={onClose}>
            {W.close}
          </Button>
          <span className="font-mono text-[11px] text-fg-faint">{W.hint}</span>
        </div>
      </CardContent>
    </Card>
  )
})

export { BandCard }

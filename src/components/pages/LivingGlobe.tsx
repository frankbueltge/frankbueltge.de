// src/components/pages/LivingGlobe.tsx — the one globe island of this house (G1, the room,
// 2026-09-03). It replaces EntranceGlobe.tsx: the entrance mounts this same island with
// `compact`, which turns the controls off and nothing else, so the front door and the room can
// never drift into two different globes.
//
// The island's own rules, in the order they protect the visitor:
//   · THE SERVER RENDER IS THE FIGURE. The plate — every layer's newest frame on one
//     equirectangular projection, drawn at build time by src/lib/globe/floor.ts — and the legend
//     beside it are in the HTML before any script runs, and they stay the accessible figure for
//     good. Every mark on the plate carries a native <title>; every layer carries the file it was
//     read from, its as-of date and its count. Nothing on this globe is reachable only through the
//     canvas.
//   · THE GLOBE IS A LAYER ON TOP. When the figure is on screen the heavy module (globe-deck.ts:
//     deck.gl core and layers, the land decoder) is imported on demand and a WebGL globe is
//     mounted over the plate — the plate fades but stays in the accessibility tree, the canvas is
//     aria-hidden. Where WebGL is missing, or the module fails, the plate stands and a line says
//     so.
//   · A LAYER'S RECORDS ARE FETCHED ONCE. The manifest ships with the page and carries provenance
//     only — id, title, source, days, counts, bytes. A layer's records are fetched from its own
//     feed the first time it is switched on, and never again, not on a re-toggle and not on a day
//     change; a visitor who never opens a layer never pays for one. Fetch-then-parse: deck.gl is
//     never handed a URL.
//   · TIME COMES FROM THE DATA. The scrubber walks the manifest's day union — the days the archive
//     itself holds — and starts at the newest of them. It never reads a clock. The sky is the ONE
//     declared exception and it declares itself: on the day its elements were taken it hands over
//     those elements, and the drawing half propagates them to the visitor's present, so the fleet
//     walks its orbits. On any other day it draws nothing and states, in its own words, the fleet
//     size the densification series counted that day. Scrubbing therefore never propagates.
//   · IN THE ROOM, AT MOST ONE LAYER IS IN FRONT. The last layer switched on wears its own recorded
//     hue; every other active layer drops to mono ink and keeps its place; the mark a card is open
//     on wears the second hue. That is the colour rule and the readability rule in one — it exists
//     because ten layers cannot carry ten identities on one sphere. The COMPACT entrance draws two,
//     and two can: there both keep their identity and their full weight (globe-deck.ts).
//   · NO WORDS AND NO NUMBERS OF ITS OWN. Every sentence is a plain string or a `{placeholder}`
//     template from src/config/globe-wording.ts; every number is a count the manifest or a fetched
//     frame carries.
//   · NO `style=`. Phases and states are data attributes, the readout's placement goes through
//     setVars inside createReadout, the canvas is sized by the stylesheet, and every colour is
//     read from the room's own tokens at mount and again when the theme changes.
import * as React from 'react'
import type { Topology } from 'topojson-specification'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { emitMarkSelected, useFigureReady, useFocusOnOpen, useOnScreen, useReadout } from '@/components/ecology/score-kit'
import { fill, placePhrase, type IslandWording } from '@/config/globe-wording'
import { reducedMotion } from '@/lib/dataviz/runtime'
import {
  activatePanel,
  deactivatePanel,
  ensurePanelKeydownListener,
  isPanelActive,
  type PanelKeyHandlers,
} from '@/lib/dataviz/stepper'
import type { GlobeManifest, LayerFeed, ManifestLayer } from '@/lib/globe/feeds'
import type { LayerFrame, LayerRecord } from '@/lib/globe/layers/types'
import type { Emphasis, FrameLayer, GlobeFrame, GlobeHandle, GlobeHit, GlobeInk, RGB } from './globe-deck'

export type { IslandWording as GlobeWording }

export interface LivingGlobeProps {
  /** the build-time plate (src/lib/globe/floor.ts) — the no-JS figure and the accessible one */
  floorSvg: string
  /** provenance for every layer, and the day axis; the records live one fetch away */
  manifest: GlobeManifest
  wording: IslandWording
  /** the id of the Readout.astro shell the frame rendered beside this island */
  readoutId: string
  /** the id this figure answers to in the tour contract */
  figureId: string
  /** the entrance's form: no controls, no card, the newest day, the globe turning */
  compact?: boolean
  /** the layers switched on at mount, in order — the LAST one is the one in front */
  defaultLayers: string[]
}

type Phase = 'floor' | 'loading' | 'live' | 'still' | 'fallback'
type FetchState = 'idle' | 'loading' | 'ready' | 'failed'

interface Selection {
  layerId: string
  index: number
}

/** `#rrggbb`, `#rgb`, `rgb()`/`rgba()` and the room's bare `r g b` triplets → an RGB tuple. */
export function parseInk(value: string): RGB | null {
  const v = value.trim()
  if (!v) return null
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v)
  if (hex) {
    const h = hex[1]!.length === 3 ? hex[1]!.split('').map((c) => c + c).join('') : hex[1]!
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const nums = v.replace(/^rgba?\(/i, '').replace(/\)$/, '').split(/[\s,/]+/).filter(Boolean).map(Number)
  if (nums.length >= 3 && nums.slice(0, 3).every((n) => Number.isFinite(n))) {
    return [Math.round(nums[0]!), Math.round(nums[1]!), Math.round(nums[2]!)]
  }
  return null
}

/** The five steps of the sequential ramp, in the order the stylesheet declares them. */
const RAMP_STEPS = ['a', 'b', 'c', 'd', 'e'] as const

/** How long one day of the walk lasts. One a second: fast enough to see a season move, slow
 *  enough to read the date it moved to. */
const DAY_MS = 1000

/** Which layers still owe a fetch: the ones switched on that have never been ASKED for. A layer
 *  switched off and on again is not asked again — the promise the manifest makes is once per
 *  layer, ever, not once per toggle; and a layer whose fetch failed is not retried on every click
 *  either, because a feed that is not there will not be there in a second. Pure, so the promise is
 *  a test and not a comment. */
export function layersToFetch(asked: ReadonlySet<string>, active: readonly string[]): string[] {
  return active.filter((id) => !asked.has(id))
}

/** Where the day axis starts: at the newest day the archive holds, which is the last of them. */
export function newestDayIndex(days: readonly string[]): number {
  return Math.max(days.length - 1, 0)
}

/** Whether the walk may advance. Under reduced motion it never does — there is no play button to
 *  press, and if one were pressed anyway the walk would still stand still. */
export function playAdvances(playing: boolean, reduced: boolean): boolean {
  return playing && !reduced
}

/** Which layers stand in front. In the ROOM every registered layer can be on at once, and the
 *  emphasis rule holds: the last one switched on is in front and the rest drop to mono ink, because
 *  ten layers cannot carry ten identities on one sphere. The COMPACT entrance draws two, and two
 *  can — there both keep their own recorded hue and their full weight, which is exactly what the
 *  hero showed before this island existed. The rule is arithmetic about legibility, not a vow. */
export function emphasisFor(compact: boolean, active: readonly string[]): Emphasis {
  if (active.length === 0) return null
  return compact ? [...active] : active[active.length - 1]!
}

/** Who owns ←/→ while a card is open: the card, always. The scrubber is a native range input, so
 *  its arrows are the browser's — this is the one place they are handed over, and it is handed to
 *  the same arbitration registry every other stepper on this site uses, never to a second
 *  listener on `document`. Pure, so the rule is testable without a DOM. */
export function scrubberYields(key: string, panelActive: boolean): boolean {
  return panelActive && (key === 'ArrowLeft' || key === 'ArrowRight')
}

/** The room's tokens, read from the element that carries them; a token that fails to parse falls
 *  back to a neutral grey so a broken variable never paints black on black. */
export function readInk(room: Element): GlobeInk {
  const cs = getComputedStyle(room)
  const token = (name: string, fallback: RGB): RGB => parseInk(cs.getPropertyValue(name)) ?? fallback
  return {
    sea: token('--globe-sea', [20, 20, 20]),
    land: token('--globe-land', [36, 36, 39]),
    coast: token('--globe-coast', [139, 139, 146]),
    front: token('--globe-c-front', [127, 208, 232]),
    mono: token('--globe-mono', [139, 139, 146]),
    selected: token('--globe-c-selected', [226, 105, 31]),
    label: token('--globe-label', [244, 244, 245]),
    ramp: RAMP_STEPS.map((step, i) => token(`--globe-c-ramp-${step}`, [30 + i * 40, 30 + i * 40, 30 + i * 40])),
  }
}

/** A layer's own recorded hue, where the room declares one for it (the ghost fleet wears the
 *  Field's voice, because that is the hue this house already records it in). A layer without one
 *  wears the room's live ink when it stands in front. */
function hueOf(room: Element, layerId: string): RGB | undefined {
  return parseInk(getComputedStyle(room).getPropertyValue(`--globe-c-${layerId}`)) ?? undefined
}

const nf = new Intl.NumberFormat('en-GB')
const plural = (n: number, words: { one: string; many: string }): string =>
  fill(n === 1 ? words.one : words.many, { n: nf.format(n) })

export default function LivingGlobe({
  floorSvg,
  manifest,
  wording,
  readoutId,
  figureId,
  compact = false,
  defaultLayers,
}: LivingGlobeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const handleRef = React.useRef<GlobeHandle | null>(null)
  const startedRef = React.useRef(false)
  const askedRef = React.useRef<Set<string>>(new Set())

  const [phase, setPhase] = React.useState<Phase>('floor')
  const [ready, setReady] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)
  const [active, setActive] = React.useState<string[]>(() => defaultLayers.filter((id) => manifest.layers.some((l) => l.id === id)))
  const [dayIndex, setDayIndex] = React.useState(() => newestDayIndex(manifest.days))
  const [feeds, setFeeds] = React.useState<Record<string, LayerFeed>>({})
  const [fetches, setFetches] = React.useState<Record<string, FetchState>>({})
  const [selected, setSelected] = React.useState<Selection | null>(null)
  const [playing, setPlaying] = React.useState(false)

  const byId = React.useMemo(() => new Map(manifest.layers.map((l) => [l.id, l])), [manifest.layers])
  const day = manifest.days[dayIndex] ?? manifest.asOf
  const emphasisId = active.length > 0 ? active[active.length - 1]! : null
  const onScreen = useOnScreen(rootRef, '120px')
  const [seen, setSeen] = React.useState(false)
  const readout = useReadout(rootRef, readoutId, '.lg-root')

  // ── the records: one fetch per layer, ever ──────────────────────────────────
  React.useEffect(() => {
    const wanted = layersToFetch(askedRef.current, active)
    if (wanted.length === 0) return
    for (const id of wanted) askedRef.current.add(id)
    setFetches((was) => ({ ...was, ...Object.fromEntries(wanted.map((id) => [id, 'loading' as FetchState])) }))
    let cancelled = false
    for (const id of wanted) {
      const entry = byId.get(id)
      if (!entry) continue
      fetch(entry.href)
        .then((res) => (res.ok ? (res.json() as Promise<LayerFeed>) : Promise.reject(new Error(String(res.status)))))
        .then((feed) => {
          if (cancelled) return
          setFeeds((was) => ({ ...was, [id]: feed }))
          setFetches((was) => ({ ...was, [id]: 'ready' }))
        })
        .catch(() => {
          if (!cancelled) setFetches((was) => ({ ...was, [id]: 'failed' }))
        })
    }
    return () => {
      cancelled = true
    }
  }, [active, byId])

  /** One layer's frame for the day on screen, out of what has been fetched. */
  const frameOf = React.useCallback(
    (id: string): LayerFrame | null => feeds[id]?.frames.find((f) => f.day === day) ?? null,
    [feeds, day],
  )

  const recordsOf = React.useCallback((id: string): LayerRecord[] => frameOf(id)?.records ?? [], [frameOf])

  // ── the frame the globe draws ───────────────────────────────────────────────
  const buildFrame = React.useCallback(
    (label?: GlobeFrame['label']): GlobeFrame => {
      const room = rootRef.current
      const layers: FrameLayer[] = active.map((id) => ({
        id,
        kind: (byId.get(id)?.kind ?? 'points') as FrameLayer['kind'],
        records: recordsOf(id),
        hue: room ? hueOf(room, id) : undefined,
      }))
      const mark = selected ? recordsOf(selected.layerId)[selected.index] : undefined
      // the one declared no-clock exception, handed over by whichever active layer declared it and
      // only while the day on screen is the day its elements were taken
      const declaring = active.map((id) => feeds[id]).find((feed) => feed?.instant?.day === day)
      return {
        day,
        layers,
        emphasis: emphasisFor(compact, active),
        selectedKey: mark?.key ?? null,
        label,
        ...(declaring?.instant ? { instant: { layerId: declaring.id, instant: declaring.instant } } : {}),
      }
    },
    [active, byId, compact, day, feeds, recordsOf, selected],
  )

  // ── mounting the WebGL half, once the figure is on screen ───────────────────
  const showHover = React.useCallback(
    (hit: GlobeHit | null) => {
      if (!hit) {
        readout.hide()
        return
      }
      const node = document.createElement('span')
      node.textContent = fill(wording.readout, {
        layer: byId.get(hit.layerId)?.title ?? hit.layerId,
        words: hit.record.receipt.words,
        place: placePhrase(hit.record, wording.place),
      })
      readout.show(node, { anchorX: hit.x, anchorY: hit.y })
    },
    [byId, readout, wording],
  )

  const openMark = React.useCallback(
    (layerId: string, index: number) => {
      // the entrance carries no card: a mark there leads to the room, not to a panel in the hero
      if (compact) return
      const record = recordsOf(layerId)[index]
      if (!record) return
      setSelected({ layerId, index })
      readout.hide()
      if (rootRef.current) {
        emitMarkSelected(rootRef.current, { figure: figureId, key: record.key, layer: layerId, day }, true)
      }
    },
    [compact, day, figureId, readout, recordsOf],
  )

  // The mount effect below runs once and must not re-run when these change — yet it has to hand
  // the drawing half whatever is newest at the moment WebGL is ready. Read through the closure of
  // its first run, a feed that arrived while the module was still loading would never be drawn
  // until the next toggle: sea and land and no marks, the race of 2026-09-03. So the mount reads
  // the newest closures through this ref, and setFrame below carries every change after it.
  const latest = React.useRef({ buildFrame, recordsOf, showHover, openMark })
  latest.current = { buildFrame, recordsOf, showHover, openMark }

  // The heavy module is imported the first time the figure comes near the viewport, and never
  // before: `useOnScreen` starts true so the server render and the first client render agree,
  // which makes it the right hook for pausing and the wrong one for starting.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '120px 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    const host = hostRef.current
    if (!root || !host || !seen || startedRef.current) return
    startedRef.current = true
    let cancelled = false
    const start = async () => {
      setPhase('loading')
      try {
        const deckModule = await import('./globe-deck')
        if (!deckModule.webglAvailable()) {
          setPhase('fallback')
          return
        }
        const land = await fetch('/globe/land.json').then((r) =>
          r.ok ? (r.json() as Promise<Topology>) : Promise.reject(new Error(String(r.status))),
        )
        if (cancelled) return
        const stillReduced = reducedMotion()
        // everything the drawing half is handed comes through `latest`, never through this
        // effect's own closure: the feeds may well have arrived while the module was loading
        handleRef.current = deckModule.mountGlobe({
          host,
          land,
          frame: latest.current.buildFrame(),
          ink: () => readInk(root),
          reduced: stillReduced,
          onHover: (hit) => latest.current.showHover(hit),
          onSelect: (hit) => {
            const index = latest.current.recordsOf(hit.layerId).findIndex((r) => r.key === hit.record.key)
            if (index >= 0) latest.current.openMark(hit.layerId, index)
          },
          onError: () => setPhase('fallback'),
        })
        setPhase(stillReduced ? 'still' : 'live')
      } catch {
        setPhase('fallback')
      }
    }
    void start()
    return () => {
      cancelled = true
    }
    // The effect must not re-run when a toggle changes buildFrame/showHover/openMark, or the globe
    // would be mounted twice; what it hands over it reads from `latest`, and every later change
    // reaches the drawing half through setFrame below.
  }, [seen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Off screen the turn pauses; back on screen it resumes.
  React.useEffect(() => {
    if (onScreen) handleRef.current?.resume()
    else handleRef.current?.pause()
  }, [onScreen])

  // Every change of layer, day or selection is one call into the drawing half.
  React.useEffect(() => {
    const root = rootRef.current
    if (!handleRef.current || !root) return
    handleRef.current.setFrame(buildFrame(), readInk(root))
  }, [buildFrame])

  // The theme switch re-inks the globe from the room's tokens.
  React.useEffect(() => {
    const mo = new MutationObserver(() => handleRef.current?.retheme())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  React.useEffect(
    () => () => {
      handleRef.current?.destroy()
      handleRef.current = null
    },
    [],
  )

  // The controls exist only once the island is alive; a dead button is worse than none, and the
  // legend below the figure carries every layer's provenance with or without them.
  React.useEffect(() => {
    setReady(true)
    setReduced(reducedMotion())
  }, [])

  // ── the card, and the keyboard arbitration it takes over ────────────────────
  const selectedRecords = selected ? recordsOf(selected.layerId) : []
  const selectedRecord = selected ? selectedRecords[selected.index] : undefined

  const closeCard = React.useCallback(() => setSelected(null), [])
  const stepCard = React.useCallback(
    (delta: number) => {
      setSelected((was) => {
        if (!was) return was
        const records = feeds[was.layerId]?.frames.find((f) => f.day === day)?.records ?? []
        const next = was.index + delta
        return next < 0 || next >= records.length ? was : { ...was, index: next }
      })
    },
    [day, feeds],
  )

  React.useEffect(() => {
    if (!selected) return
    ensurePanelKeydownListener()
    const handlers: PanelKeyHandlers = {
      onPrev: () => stepCard(-1),
      onNext: () => stepCard(1),
      onClose: () => closeCard(),
    }
    activatePanel(handlers)
    return () => deactivatePanel(handlers)
  }, [selected, stepCard, closeCard])

  useFocusOnOpen(selectedRecord ? selectedRecord.key : null, cardRef)

  // A frame the card cannot stand on any more (the day moved, the layer went off) closes it.
  React.useEffect(() => {
    if (selected && !selectedRecord) setSelected(null)
  }, [selected, selectedRecord])

  // ── the day axis ───────────────────────────────────────────────────────────
  const lastIndex = newestDayIndex(manifest.days)

  /** The scrubber's own arrow keys yield to an open card: one registry decides who owns ←/→ on
   *  this page, and it is never a second listener on `document`. */
  const onScrubKey = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    // the registry's one document listener does the stepping; this only refuses the default, so
    // the day does not move under a card that is walking its own marks
    if (scrubberYields(event.key, isPanelActive())) event.preventDefault()
  }, [])

  React.useEffect(() => {
    if (!playAdvances(playing, reduced)) return
    let raf = 0
    let last = 0
    const step = (t: number) => {
      raf = requestAnimationFrame(step)
      if (!last) {
        last = t
        return
      }
      if (t - last < DAY_MS) return
      last = t
      setDayIndex((was) => {
        if (was >= lastIndex) {
          setPlaying(false)
          return was
        }
        return was + 1
      })
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, reduced, lastIndex])

  // ── the tour contract (G2 fills the camera and the time) ───────────────────
  useFigureReady(figureId, (focus) => {
    if (focus.figure !== figureId) return
    if (!focus.select) return
    for (const id of active) {
      const index = recordsOf(id).findIndex((r) => r.key === focus.select)
      if (index >= 0) {
        openMark(id, index)
        return
      }
    }
  })

  // ── what the island says ───────────────────────────────────────────────────
  const status =
    phase === 'loading'
      ? wording.status.loading
      : phase === 'live'
        ? wording.status.live
        : phase === 'still'
          ? wording.status.still
          : phase === 'fallback'
            ? wording.status.noWebgl
            : ''

  const toggle = (id: string) =>
    setActive((was) => (was.includes(id) ? was.filter((x) => x !== id) : [...was, id]))

  const provenanceOf = (entry: ManifestLayer): string =>
    fill(wording.controls.provenance, {
      file: entry.source.file,
      asOf: entry.asOf,
      marks: plural(entry.counts[day] ?? 0, wording.controls.marks),
    })

  const noteOf = (id: string): string | null => {
    const state = fetches[id]
    // nothing asked for yet — the manifest's own count stands, and the island says nothing it
    // cannot know (this is also what keeps the server render and the first client render equal)
    if (!state || state === 'idle') return null
    if (state === 'loading') return wording.controls.loading
    if (state === 'failed') return wording.controls.failed
    const frame = frameOf(id)
    if (frame?.note) return frame.note
    if (!frame || frame.records.length === 0) return wording.controls.empty
    return null
  }

  return (
    <div ref={rootRef} className="lg-root" data-phase={phase} data-figure={figureId} data-compact={compact ? 'yes' : 'no'}>
      <div className="lg-stage">
        {/* the plate: every layer's newest frame, rendered on the server, never replaced */}
        <div className="lg-floor" dangerouslySetInnerHTML={{ __html: floorSvg }} />
        {/* the globe: a layer the visitor's browser may or may not be able to paint */}
        <div ref={hostRef} className="lg-canvas" aria-hidden="true" onMouseLeave={() => showHover(null)} />
        <p className="lg-status" aria-live="polite">
          {status}
        </p>
      </div>

      {!compact && (
        <div className="lg-controls">
          <div className="lg-day" hidden={!ready}>
            <label className="lg-day-label" htmlFor={`${figureId}-day`}>
              {wording.controls.dayLabel}
            </label>
            <input
              id={`${figureId}-day`}
              className="lg-scrub"
              type="range"
              min={0}
              max={lastIndex}
              step={1}
              value={dayIndex}
              aria-label={wording.controls.dayAria}
              aria-valuetext={day}
              onKeyDown={onScrubKey}
              onChange={(event) => {
                setPlaying(false)
                setDayIndex(Number(event.currentTarget.value))
              }}
            />
            <output className="lg-day-value" htmlFor={`${figureId}-day`}>
              {fill(wording.controls.dayOf, {
                day,
                index: nf.format(dayIndex + 1),
                of: nf.format(manifest.days.length),
              })}
            </output>
            {!reduced && (
              <Button size="sm" variant="outline" onClick={() => setPlaying((was) => !was)}>
                {playing ? wording.controls.pause : wording.controls.play}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={!emphasisId || recordsOf(emphasisId).length === 0}
              onClick={() => emphasisId && openMark(emphasisId, 0)}
            >
              {wording.controls.readMarks}
            </Button>
            <span className="lg-hint">{reduced ? wording.controls.readMarksHint : wording.controls.playHint}</span>
          </div>

          <h3 className="kicker lg-legend-title" id={`${figureId}-legend`}>
            {wording.controls.layersLabel}
          </h3>
          <ul className="lg-legend" aria-labelledby={`${figureId}-legend`}>
            {manifest.layers.map((entry) => {
              const on = active.includes(entry.id)
              const note = on ? noteOf(entry.id) : null
              return (
                <li key={entry.id} className="lg-legend-item" data-on={on ? 'yes' : 'no'} data-front={entry.id === emphasisId ? 'yes' : 'no'}>
                  <button
                    type="button"
                    className="lg-toggle"
                    aria-pressed={on}
                    disabled={!ready}
                    aria-label={fill(on ? wording.controls.on : wording.controls.off, { title: entry.title })}
                    onClick={() => toggle(entry.id)}
                  >
                    <span className="lg-swatch" aria-hidden="true" data-layer={entry.id} />
                    <span className="lg-toggle-name">{entry.title}</span>
                    <span className="lg-toggle-kind">{entry.kind}</span>
                  </button>
                  {entry.id === emphasisId && (
                    <Badge variant="secondary" className="lg-front">
                      {wording.controls.inFront}
                    </Badge>
                  )}
                  <p className="lg-prov">{provenanceOf(entry)}</p>
                  <p className="lg-prov">{plural(entry.days.length, wording.controls.days)}</p>
                  {note && <p className="lg-note">{note}</p>}
                </li>
              )
            })}
          </ul>
          <p className="lg-hint">{wording.controls.layersHint}</p>
        </div>
      )}

      {!compact && selected && selectedRecord && (
        <Card
          ref={cardRef}
          tabIndex={-1}
          role="group"
          aria-label={fill(wording.card.label, { layer: byId.get(selected.layerId)?.title ?? selected.layerId })}
          className="lg-card mt-4 outline-none"
          data-mark={selectedRecord.key}
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{byId.get(selected.layerId)?.title ?? selected.layerId}</Badge>
              <Badge variant="secondary">{byId.get(selected.layerId)?.kind}</Badge>
              <span className="font-mono text-xs text-fg-faint">{day}</span>
              <span className="font-mono text-xs text-fg-faint">
                {fill(wording.card.position, {
                  index: nf.format(selected.index + 1),
                  of: nf.format(selectedRecords.length),
                  layer: byId.get(selected.layerId)?.title ?? selected.layerId,
                })}
              </span>
            </div>
            <CardTitle className="text-base text-fg">{selectedRecord.receipt.words}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-fg-muted">{wording.card.kinds[selectedRecord.labelKind]}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-fg-faint">
              <dt>{wording.card.layerLabel}</dt>
              <dd className="text-fg-muted">{byId.get(selected.layerId)?.title ?? selected.layerId}</dd>
              <dt>{wording.card.dayLabel}</dt>
              <dd className="text-fg-muted">{day}</dd>
              <dt>{wording.card.placeLabel}</dt>
              <dd className="text-fg-muted">{placePhrase(selectedRecord, wording.place)}</dd>
              <dt>{wording.card.fileLabel}</dt>
              <dd className="break-all text-fg-muted">
                {selectedRecord.receipt.file} · {selectedRecord.receipt.locator}
              </dd>
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="outline" disabled={selected.index === 0} onClick={() => stepCard(-1)}>
                {wording.card.prev}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selected.index >= selectedRecords.length - 1}
                onClick={() => stepCard(1)}
              >
                {wording.card.next}
              </Button>
              {selectedRecord.receipt.url && (
                <Button asChild size="sm" variant="outline">
                  <a href={selectedRecord.receipt.url}>{wording.card.open}</a>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closeCard}>
                {wording.card.close}
              </Button>
              <span className="lg-hint">{wording.card.hint}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

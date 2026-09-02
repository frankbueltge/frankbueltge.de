// src/components/pages/EntranceGlobe.tsx — the entrance globe as a React island (visual layer,
// Phase 3b, 2026-09-02). Frank's direction, wording private: visually impressive and interactive,
// from real data; the frame stays monochrome, the figure may wear the house's own tokens and the
// voices' recorded hues.
//
// The island's own rules, in the order they protect the visitor:
//   · THE SERVER RENDER IS THE FIGURE. The floor — an equirectangular plate of the whole record at
//     the snapshot's own time, drawn at build time by src/lib/globe/floor.ts — is in the HTML before
//     any script runs and stays the accessible figure for good: every arc and every point carries a
//     native <title>, and the plate's own title and description name what it shows and when.
//   · THE GLOBE IS A LAYER ON TOP. When the hero is on screen the heavy module (globe-deck.ts:
//     deck.gl, the land decoder, SGP4) is imported on demand, the two committed snapshots are
//     fetched same-origin, and a WebGL globe is mounted over the plate — the plate fades but stays
//     in the accessibility tree, the canvas is aria-hidden. Where WebGL is missing, or the module
//     fails, the plate stays and a line says so. Nothing is ever reachable only through the canvas.
//   · WHAT MOVES IS TIME. The satellites walk their orbits at the visitor's present, the globe
//     turns until touched. Under prefers-reduced-motion one frame is computed and held; off screen
//     the loop pauses.
//   · NO WORDS, NO NUMBERS OF ITS OWN. The readout fills templates from NAMING.opsRoom.sky with the
//     values the mark carries; the counts in the strips around the figure are the frame's.
//   · NO `style=`. Phases are data attributes, the readout's placement goes through setVars inside
//     createReadout, the canvas is sized by the stylesheet. Colours are read from the room's own
//     tokens at mount and again when the theme changes.
import * as React from 'react'
import type { Topology } from 'topojson-specification'
import { createReadout, type ReadoutHandle } from '@/lib/dataviz/readout'
import { reducedMotion } from '@/lib/dataviz/runtime'
import type { GlobePayload } from '@/lib/globe/model'
import type { GlobeHandle, GlobeInk, HoverInfo, RGB } from './globe-deck'

export interface SkyWording {
  /** readout templates; the island fills the placeholders and owns none of the words */
  readout: { satellite: string; gap: string }
  /** CelesTrak group → the page's word for it */
  groups: Record<string, string>
  status: { loading: string; live: string; still: string; noWebgl: string; failed: string }
}

export interface EntranceGlobeProps {
  /** the build-time plate (src/lib/globe/floor.ts) — the no-JS figure and the accessible one */
  floorSvg: string
  wording: SkyWording
  /** the id of the Readout.astro shell the frame rendered beside this island */
  readoutId: string
  /** the id this figure would answer to in the tour contract */
  figureId: string
  modelUrl: string
  landUrl: string
}

type Phase = 'floor' | 'loading' | 'live' | 'still' | 'fallback'

const fill = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')

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

/** The room's tokens, read from the element that carries them; a token that fails to parse falls
 *  back to a neutral grey so a broken variable never paints black on black. */
export function readInk(room: Element): GlobeInk {
  const cs = getComputedStyle(room)
  const token = (name: string, fallback: RGB): RGB => parseInk(cs.getPropertyValue(name)) ?? fallback
  return {
    sea: token('--ops-panel-solid', [13, 21, 19]),
    land: token('--ops-line', [28, 38, 36]),
    coast: token('--ops-muted', [143, 160, 155]),
    satellite: token('--ops-accent', [127, 208, 232]),
    gap: token('--hub-c-meridian', [37, 106, 191]),
  }
}

export default function EntranceGlobe({ floorSvg, wording, readoutId, figureId, modelUrl, landUrl }: EntranceGlobeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const handleRef = React.useRef<GlobeHandle | null>(null)
  const payloadRef = React.useRef<GlobePayload | null>(null)
  const readoutRef = React.useRef<ReadoutHandle | null>(null)
  const startedRef = React.useRef(false)
  const [phase, setPhase] = React.useState<Phase>('floor')

  // The readout shell is rendered by the frame; it clamps within this island's own box.
  React.useEffect(() => {
    const el = document.getElementById(readoutId)
    const root = rootRef.current
    readoutRef.current = el && root ? createReadout(el, root) : null
  }, [readoutId])

  const showHover = React.useCallback(
    (info: HoverInfo | null) => {
      const readout = readoutRef.current
      const payload = payloadRef.current
      if (!readout) return
      if (!info || !payload) {
        readout.hide()
        return
      }
      const node = document.createElement('span')
      if (info.kind === 'satellite') {
        const s = payload.satellites[info.index]
        if (!s) return readout.hide()
        node.textContent = fill(wording.readout.satellite, {
          name: s.name,
          group: wording.groups[s.group] ?? s.group,
          owner: s.owner ?? '',
        }).replace(/\s·\s*$/, '')
      } else {
        const a = payload.arcs[info.index]
        if (!a) return readout.hide()
        node.textContent = fill(wording.readout.gap, {
          vessel: a.vessel.name,
          hours: String(Math.round(a.hours)),
          waters: a.waters,
        })
      }
      readout.show(node, { anchorX: info.x, anchorY: info.y })
    },
    [wording],
  )

  // Mount the globe the first time the hero is on screen; pause and resume it as it leaves and
  // returns. The heavy module and both snapshots are loaded only then.
  React.useEffect(() => {
    const root = rootRef.current
    const host = hostRef.current
    if (!root || !host || typeof IntersectionObserver === 'undefined') return

    const start = async () => {
      if (startedRef.current) return
      startedRef.current = true
      setPhase('loading')
      try {
        const deckModule = await import('./globe-deck')
        if (!deckModule.webglAvailable()) {
          setPhase('fallback')
          return
        }
        const [payload, land] = await Promise.all([
          fetch(modelUrl).then((r) => (r.ok ? (r.json() as Promise<GlobePayload>) : Promise.reject(new Error(String(r.status))))),
          fetch(landUrl).then((r) => (r.ok ? (r.json() as Promise<Topology>) : Promise.reject(new Error(String(r.status))))),
        ])
        payloadRef.current = payload
        const room = root.closest('.ops-room') ?? root
        const reduced = reducedMotion()
        handleRef.current = deckModule.mountGlobe({
          host,
          payload,
          land,
          ink: () => readInk(room),
          reduced,
          onHover: showHover,
          onError: () => setPhase('fallback'),
        })
        setPhase(reduced ? 'still' : 'live')
      } catch {
        setPhase('fallback')
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting)
        if (visible && !startedRef.current) void start()
        if (visible) handleRef.current?.resume()
        else handleRef.current?.pause()
      },
      { rootMargin: '120px 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [modelUrl, landUrl, showHover])

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

  // The tour contract: this figure answers to its id but has no marks a tour can select yet.
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('dv:figure-ready', { detail: { id: figureId, apply: () => {} } }))
  }, [figureId])

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

  return (
    <div ref={rootRef} className="sky-stage" data-phase={phase} data-figure={figureId}>
      {/* the floor: the record at its own time — rendered on the server, never replaced */}
      <div className="sky-floor" dangerouslySetInnerHTML={{ __html: floorSvg }} />
      {/* the globe: a layer the visitor's browser may or may not be able to paint */}
      <div ref={hostRef} className="sky-canvas" aria-hidden="true" onMouseLeave={() => showHover(null)} />
      <p className="sky-status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}

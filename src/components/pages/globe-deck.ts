// src/components/pages/globe-deck.ts — the WebGL half of the entrance globe, loaded by
// EntranceGlobe.tsx with a dynamic import() the first time the hero is on screen. Everything heavy
// lives here and nowhere else: deck.gl's core and layers, the land TopoJSON decoder, and the SGP4
// propagation over the committed CelesTrak elements (src/lib/globe/propagate.ts). Nothing in this
// module reads the DOM for words or numbers, and nothing here decides a colour: the island hands in
// an `ink()` that reads the room's own tokens, and the readout wording stays with the island.
//
// What moves, and why it is allowed to: the satellites walk their orbits at the visitor's present
// (positions are recomputed twice a second and eased in between), and the globe turns slowly until
// the visitor touches it. Under prefers-reduced-motion neither happens — one frame, computed once,
// stands still. Off screen the loop pauses. Every mark that can be hovered reports the record it
// was drawn from, so the island's readout can name it in the page's own words.
import { Deck, _GlobeView as GlobeView, type PickingInfo } from '@deck.gl/core'
import { ArcLayer, GeoJsonLayer, ScatterplotLayer, SolidPolygonLayer } from '@deck.gl/layers'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import type { GlobeArc, GlobePayload } from '@/lib/globe/model'
import { positionsAt, satrecsOf, type GroundPoint } from '@/lib/globe/propagate'

export type RGB = [number, number, number]

/** The room's own tokens, read by the island and handed in as a function so a theme switch can
 *  re-read them: the sea is the panel, the land a hairline tone, the satellites the room's live
 *  ink, the gaps the Field's recorded hue (Meridian owns the ghost fleet). */
export interface GlobeInk {
  sea: RGB
  land: RGB
  coast: RGB
  satellite: RGB
  gap: RGB
}

export interface HoverInfo {
  kind: 'satellite' | 'gap'
  index: number
  /** pointer position in the host's own pixel space */
  x: number
  y: number
}

export interface MountOptions {
  /** the div deck.gl draws into — deck's `parent` wants a div, and the island passes one */
  host: HTMLDivElement
  payload: GlobePayload
  land: Topology
  ink: () => GlobeInk
  reduced: boolean
  onHover: (info: HoverInfo | null) => void
  onError: (error: unknown) => void
}

export interface GlobeHandle {
  pause(): void
  resume(): void
  retheme(): void
  destroy(): void
}

/** how often the satellites' positions are recomputed; the layer eases between two computations */
const POSITION_INTERVAL_MS = 500
/** the idle turn: one revolution in four minutes, slow enough to read a coastline */
const TURN_DEG_PER_S = 1.5
/** the sea: one polygon over the whole sphere, the trick deck.gl's own globe examples use */
const WORLD: [number, number][] = [
  [-180, -90], [-90, -90], [0, -90], [90, -90], [180, -90],
  [180, 0], [180, 90], [90, 90], [0, 90], [-90, 90], [-180, 90], [-180, 0], [-180, -90],
]

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null
  } catch {
    return false
  }
}

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  minZoom: number
  maxZoom: number
}

export function mountGlobe(options: MountOptions): GlobeHandle {
  const { host, payload, land, reduced } = options
  const recs = satrecsOf(payload.satellites)
  const landFeature = feature(land, land.objects.land as GeometryObject)
  const indices = payload.satellites.map((_, i) => i)

  let ink = options.ink()
  let points: Array<GroundPoint | null> = positionsAt(recs, Date.now())
  let tick = 0
  let paused = false
  let interacted = false
  let destroyed = false

  // The globe should fill the shorter side of its host. In deck.gl's GlobeView the 512 units of
  // zoom 0 are the sphere's CIRCUMFERENCE (the same 512 the mercator world is wide), so its
  // diameter at zoom 0 is 512 / π, and the zoom that fits a diameter d is log2(d · π / 512).
  // (Read as a diameter, the first build drew a globe a third of the size it was given.)
  const zoomFor = (): number => {
    const rect = host.getBoundingClientRect()
    const diameter = Math.max(Math.min(rect.width, rect.height) * 0.92, 96)
    return Math.log2((diameter * Math.PI) / 512)
  }
  let viewState: ViewState = { longitude: 15, latitude: 18, zoom: zoomFor(), minZoom: -1.5, maxZoom: 3 }

  const layers = () => [
    new SolidPolygonLayer<[number, number][]>({
      id: 'sea',
      data: [WORLD],
      getPolygon: (d) => d,
      getFillColor: [...ink.sea, 255],
      pickable: false,
    }),
    new GeoJsonLayer({
      id: 'land',
      data: landFeature as never,
      filled: true,
      stroked: true,
      getFillColor: [...ink.land, 255],
      getLineColor: [...ink.coast, 200],
      lineWidthMinPixels: 0.7,
      pickable: false,
    }),
    new ArcLayer<GlobeArc>({
      id: 'gaps',
      data: payload.arcs,
      greatCircle: true,
      numSegments: 60,
      getSourcePosition: (d) => d.from,
      getTargetPosition: (d) => d.to,
      getSourceColor: [...ink.gap, 120],
      getTargetColor: [...ink.gap, 255],
      getWidth: 2,
      widthUnits: 'pixels',
      pickable: true,
    }),
    new ScatterplotLayer<GlobeArc>({
      id: 'gap-ends',
      data: payload.arcs,
      getPosition: (d) => d.to,
      getFillColor: [...ink.gap, 255],
      radiusUnits: 'pixels',
      getRadius: 3.4,
      pickable: true,
    }),
    new ScatterplotLayer<number>({
      id: 'satellites',
      data: indices,
      getPosition: (i) => {
        const p = points[i]
        return p ? [p.lon, p.lat, p.altKm * 1000] : [0, 0, 0]
      },
      getRadius: (i) => (points[i] ? 2.4 : 0),
      getFillColor: [...ink.satellite, 235],
      radiusUnits: 'pixels',
      pickable: true,
      updateTriggers: { getPosition: tick, getRadius: tick },
      transitions: reduced ? undefined : { getPosition: POSITION_INTERVAL_MS },
    }),
  ]

  const deck = new Deck({
    parent: host,
    views: new GlobeView({ id: 'globe', controller: { inertia: 250, keyboard: false } }),
    viewState,
    layers: layers(),
    useDevicePixels: Math.min(window.devicePixelRatio || 1, 2),
    getCursor: ({ isDragging, isHovering }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'),
    onViewStateChange: ({ viewState: next, interactionState }) => {
      if (interactionState.isDragging || interactionState.isZooming || interactionState.isPanning || interactionState.isRotating) {
        interacted = true
      }
      viewState = next as ViewState
      deck.setProps({ viewState })
    },
    onHover: (info: PickingInfo) => {
      if (!info.layer || info.index < 0) {
        options.onHover(null)
        return
      }
      const id = info.layer.id
      if (id === 'satellites') options.onHover({ kind: 'satellite', index: info.object as number, x: info.x, y: info.y })
      else if (id === 'gaps' || id === 'gap-ends') options.onHover({ kind: 'gap', index: info.index, x: info.x, y: info.y })
      else options.onHover(null)
    },
    onError: (error) => options.onError(error),
  })

  let raf = 0
  let lastFrame = 0
  let lastPositions = 0
  const frame = (t: number): void => {
    if (destroyed) return
    raf = requestAnimationFrame(frame)
    if (paused) {
      lastFrame = t
      return
    }
    if (t - lastPositions >= POSITION_INTERVAL_MS) {
      lastPositions = t
      points = positionsAt(recs, Date.now())
      tick += 1
      deck.setProps({ layers: layers() })
    }
    if (!interacted) {
      const dt = lastFrame ? Math.min((t - lastFrame) / 1000, 0.1) : 0
      viewState = { ...viewState, longitude: ((viewState.longitude + TURN_DEG_PER_S * dt + 540) % 360) - 180 }
      deck.setProps({ viewState })
    }
    lastFrame = t
  }
  // Reduced motion: the frame the visitor sees is the one computed at mount, and it stays.
  if (!reduced) raf = requestAnimationFrame(frame)

  const resize = new ResizeObserver(() => {
    if (destroyed || interacted) return
    viewState = { ...viewState, zoom: zoomFor() }
    deck.setProps({ viewState })
  })
  resize.observe(host)

  return {
    pause() {
      paused = true
    },
    resume() {
      paused = false
    },
    retheme() {
      ink = options.ink()
      deck.setProps({ layers: layers() })
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      resize.disconnect()
      deck.finalize()
    },
  }
}

// src/components/pages/globe-deck.ts — the WebGL half of the living globe, loaded by
// LivingGlobe.tsx with a dynamic import() the first time the figure is on screen. Everything heavy
// lives here and nowhere else: deck.gl's core and layers with the globe view, and the land
// TopoJSON decoder. Nothing in this module reads the DOM for words or numbers, and nothing here
// decides a colour: the island hands in an `ink()` that reads the room's own tokens, and every
// visitor-facing sentence stays with the island (src/config/globe-wording.ts).
//
// THE EMPHASIS RULE, which is the colour rule and the readability rule in one: in the ROOM, where
// every registered layer can be switched on at once, at most one layer is IN FRONT. It wears its
// own recorded hue at full weight; every other active layer drops to mono ink at a reduced alpha
// and keeps its place on the earth; the mark a card is open on wears the second hue and is the only
// thing on the globe that carries a label. Ten layers cannot have ten identities on one sphere — so
// they do not get them. The rule exists for that arithmetic and not as a vow of poverty: the
// compact entrance draws two layers and hands the caller a SET, so both keep their identity and
// their full weight there. `emphasis` is therefore one id, a list of ids, or nothing.
//
// WHAT MOVES, and why it is allowed to. Everything on this globe is a committed record drawn at the
// day it was written — with exactly one declared exception, and the layer itself declares it. A
// layer may hand over the elements its NEWEST frame was computed from (LayerInstant); on that day,
// and on no other, this module propagates them by SGP4 to the visitor's present and recomputes
// twice a second, easing between the two computations, so the fleet walks its orbits while somebody
// is looking at it. Scrubbing to any other day propagates nothing, because no other day has
// elements to propagate. Under prefers-reduced-motion one frame is computed at mount and stands.
//
// WHO OWNS THE CAMERA (G2, 2026-09-03). A guided story may ask the camera to stand somewhere
// (`flyTo`), and the visitor may take the sphere out of its hands at any moment. The pointer wins:
// the first drag stops the decorative turn for good, and `heldByPointer()` lets a story see that it
// has been taken over, so a scene re-applied while a reader is holding the globe does not yank it
// back. A new scene is a new command and moves it. Under reduced motion every camera move is a cut,
// not a flight, and there is no ambient movement at all.
//
// FETCH-THEN-PARSE ONLY. No layer here is ever handed a URL: deck.gl would fetch and parse it
// itself, on its own schedule, past the island's "once per layer, never again" promise and past
// any error the island could show. The island fetches, the island parses, this module draws
// arrays. LivingGlobe.test.tsx asserts the absence of a `data: '` URL literal in this file.
//
// Only @deck.gl/core and @deck.gl/layers. The aggregation layers do not work on the globe view at
// all, and the geo layers would double this chunk for a tile source this site does not have and
// could not fetch under `connect-src 'self'`; anything that needs binning is binned at build time
// and drawn as `columns` (globe-deck.test.ts asserts no file in the tree imports either).
import { Deck, FlyToInterpolator, _GlobeView as GlobeView, type Layer, type PickingInfo } from '@deck.gl/core'
import {
  ArcLayer,
  ColumnLayer,
  GeoJsonLayer,
  PathLayer,
  ScatterplotLayer,
  SolidPolygonLayer,
  TextLayer,
} from '@deck.gl/layers'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import type { LayerInstant, LayerKind, LayerRecord, LonLat } from '@/lib/globe/layers/types'
import { positionsAt, satrecsOf, type GroundPoint, type SatRecs } from '@/lib/globe/propagate'

export type RGB = [number, number, number]

/** The room's own tokens, read by the island and handed in as a function so a theme switch can
 *  re-read them. Depth carries the base — sea, land and coast are declared neutrals; identity is
 *  carried by the three hues, and by nothing else. */
export interface GlobeInk {
  sea: RGB
  land: RGB
  coast: RGB
  /** the layer in front, where the layer carries no recorded hue of its own */
  front: RGB
  /** every other active layer: mono ink, holding its place */
  mono: RGB
  /** the mark a card is open on — the second hue, and the only other one on the sphere */
  selected: RGB
  /** the ink a label is written in */
  label: RGB
  /** the sequential ramp for country fills, low → high */
  ramp: RGB[]
}

/** lon, lat and metres above the ellipsoid — what a propagated mark stands at */
export type LonLatAlt = [number, number, number]

export interface FrameLayer {
  id: string
  kind: LayerKind
  records: LayerRecord[]
  /** where this layer's marks stand RIGHT NOW, one per record in its order, null where the
   *  propagator failed at this instant (the record's own committed point stands in). Set by
   *  mountGlobe for the one layer that declared an instant; absent for every other layer, which is
   *  every other layer there is. */
  positions?: Array<LonLatAlt | null>
  /** how long a mark takes to travel from its last computed position to this one, in ms; absent
   *  means it jumps, which is what reduced motion asks for */
  easeMs?: number
  /** the layer's own recorded hue where the room declares one (the ghost fleet wears the Field's
   *  voice); without one, a layer in front wears the room's live ink */
  hue?: RGB
}

export interface GlobeFrame {
  day: string
  layers: FrameLayer[]
  /** which layer, or layers, stand in front — see the emphasis rule in this file's header */
  emphasis?: string | readonly string[] | null
  /** the one declared no-clock exception, handed over by the layer that owns it; drawn only while
   *  `day` is the instant's own day */
  instant?: { layerId: string; instant: LayerInstant }
  /** bumped each time the propagated positions are recomputed, so deck.gl re-reads them */
  tick?: number
  /** the key of the mark a card is open on */
  selectedKey?: string | null
  /** the words the label carries for the hovered or selected mark — the island's, never this
   *  module's; absent means no label is drawn */
  label?: { at: LonLat; text: string }
}

/** Country polygons the island fetched and keyed by ISO-3 — the only shape a `countries` frame can
 *  be drawn from, because this module holds no geography beyond the land it is handed. */
export interface CountryShapes {
  byIso3: Record<string, GeoJSON.Feature>
}

/** What a country fill carries into the drawing: the record it was matched to, and nothing else —
 *  the polygon's own upstream properties are geography, not this house's data. */
export interface CountryProperties {
  record: LayerRecord
}
type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>

export interface GlobeHit {
  layerId: string
  record: LayerRecord
  /** pointer position in the host's own pixel space */
  x: number
  y: number
}

export interface GlobeCamera {
  longitude: number
  latitude: number
  zoom?: number
}

export interface MountOptions {
  /** the div deck.gl draws into — deck's `parent` wants a div, and the island passes one */
  host: HTMLDivElement
  land: Topology
  frame: GlobeFrame
  ink: () => GlobeInk
  reduced: boolean
  countries?: CountryShapes
  onHover(hit: GlobeHit | null): void
  onSelect(hit: GlobeHit): void
  onError(error: unknown): void
}

export interface GlobeHandle {
  pause(): void
  resume(): void
  retheme(): void
  setFrame(frame: GlobeFrame, ink?: GlobeInk): void
  flyTo(camera: GlobeCamera, animate: boolean): void
  /** Whether the visitor has taken hold of the globe — dragged, zoomed, panned or rotated it —
   *  SINCE the last camera command. A guided story asks this before it moves the camera again, so
   *  a re-applied scene cannot pull the sphere out of a reader's hand; the next scene's camera is a
   *  new command and moves it. This is why no story needs a listener of its own: the drawing half
   *  already knows, because it is the thing the pointer is on (G2, 2026-09-03). */
  heldByPointer(): boolean
  destroy(): void
}

/** The layer in front, and everything behind it — the whole emphasis rule, as two numbers. The
 *  back alpha is a judgement measured on the front door: at a third of full weight the sky's three
 *  hundred and forty-one points read as dust rather than as a fleet holding its place, which is
 *  not "behind", it is "gone". Half weight keeps them a field a reader can see and still leaves no
 *  doubt which layer is in front. */
export const FRONT_ALPHA = 235
export const BACK_ALPHA = 120
/** the idle turn: one revolution in four minutes, slow enough to read a coastline */
const TURN_DEG_PER_S = 1.5
/** How finely deck.gl's globe viewport turns a flat feature into a mesh on the sphere. The prop is
 *  measured IN DEGREES and its default is ten, so RAISING the resolution means lowering the
 *  number: a country polygon and a long great circle are both chords until they are subdivided,
 *  and a ten-degree chord across a large country visibly cuts through the sphere. The cost is
 *  vertices while a frame is built, not a fetch and not a per-pixel cost, which is why it is
 *  affordable here — the measured price of this step stands in the decision-log row. */
export const GLOBE_RESOLUTION = 4
/** how often the propagated marks' positions are recomputed; the layer eases between two of them */
const POSITION_INTERVAL_MS = 500
/** how far a camera move is allowed to take, when a story asks for one and motion is allowed */
const FLY_MS = 1200
/** a build-time bin's footprint on the ground, and the height its value is scaled into — metres,
 *  because a column on a globe is a thing standing on the earth and not a mark on a screen */
const COLUMN_RADIUS_M = 40000
const COLUMN_MIN_M = 20000
const COLUMN_MAX_M = 600000
/** the sea: one polygon over the whole sphere, the trick deck.gl's own globe examples use */
const WORLD: LonLat[] = [
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

// ─────────────────────────────────────────────────────────── the pure part, tested without a GPU

/** Which layers stand in front: one id, a list of them, or nothing at all. */
export type Emphasis = string | readonly string[] | null | undefined

export function inFront(layerId: string, emphasis: Emphasis): boolean {
  if (emphasis === null || emphasis === undefined) return false
  return typeof emphasis === 'string' ? layerId === emphasis : emphasis.includes(layerId)
}

/** The emphasis rule as a function: a layer in front keeps its own hue at full weight, everyone
 *  else is mono ink at a reduced alpha. Exported because this is the rule the whole colour policy
 *  of this globe rests on, and a rule that lives only inside a draw call cannot be tested. */
export function inkFor(layer: FrameLayer, ink: GlobeInk, emphasis: Emphasis): { rgb: RGB; alpha: number } {
  return inFront(layer.id, emphasis)
    ? { rgb: layer.hue ?? ink.front, alpha: FRONT_ALPHA }
    : { rgb: ink.mono, alpha: BACK_ALPHA }
}

/** Where a record stands, as one point: a coordinate is itself, a gap is the end it resumed at
 *  (the place the record starts speaking again), a country has no point of its own here. */
export function pointOf(record: LayerRecord): LonLat | null {
  if (Array.isArray(record.at)) return record.at
  if ('from' in record.at) return record.at.to
  return null
}

/** A radius from the record's own value, scaled inside the frame it belongs to — never across
 *  frames, because a layer's values change unit between layers and a shared scale would compare
 *  parts per million with hours. A frame without values, or with one value, draws one size. */
export function radiusScale(records: readonly LayerRecord[], min = 2.2, max = 6): (record: LayerRecord) => number {
  const values = records.map((r) => r.value).filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (values.length === 0 || !(hi > lo)) return () => (min + max) / 2
  return (record) => {
    const v = record.value
    if (typeof v !== 'number' || !Number.isFinite(v)) return min
    // by area, not by radius: a dot twice the radius reads as four times the value
    return Math.sqrt(min * min + ((v - lo) / (hi - lo)) * (max * max - min * min))
  }
}

/** Which step of the sequential ramp a value lands on, inside its own frame. */
export function rampStep(records: readonly LayerRecord[], steps: number): (record: LayerRecord) => number {
  const values = records.map((r) => r.value).filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (values.length === 0 || !(hi > lo)) return () => Math.floor(steps / 2)
  return (record) => {
    const v = record.value
    if (typeof v !== 'number' || !Number.isFinite(v)) return 0
    return Math.min(steps - 1, Math.floor(((v - lo) / (hi - lo)) * steps))
  }
}

/** Every drawing layer of one frame, in the order they stack: what is behind first, the layer in
 *  front last, the label above everything. One builder per kind of layer the contract allows. */
export function layersFor(
  frame: GlobeFrame,
  ink: GlobeInk,
  emphasis: Emphasis,
  countries?: CountryShapes,
): Layer[] {
  // a layer in front is drawn last, so it is not covered by the ones holding their places
  const ordered = [...frame.layers].sort(
    (a, b) => Number(inFront(a.id, emphasis)) - Number(inFront(b.id, emphasis)),
  )
  const out: Layer[] = []

  for (const layer of ordered) {
    if (layer.records.length === 0) continue
    const { rgb, alpha } = inkFor(layer, ink, emphasis)
    const colourOf = (record: LayerRecord): [number, number, number, number] =>
      record.key === frame.selectedKey ? [...ink.selected, 255] : [...rgb, alpha]
    const id = `${layer.id}·${frame.day}`

    switch (layer.kind) {
      case 'arcs': {
        out.push(
          new ArcLayer<LayerRecord>({
            id: `arc-${id}`,
            data: layer.records,
            greatCircle: true,
            numSegments: 60,
            getSourcePosition: (d) => ('from' in d.at && !Array.isArray(d.at) ? d.at.from : [0, 0]),
            getTargetPosition: (d) => ('from' in d.at && !Array.isArray(d.at) ? d.at.to : [0, 0]),
            // the arc fades from where the record fell silent to where it spoke again, so the two
            // ends of a gap are told apart without a second colour
            getSourceColor: (d) => {
              const [r, g, b, a] = colourOf(d)
              return [r, g, b, Math.round(a * 0.45)] as [number, number, number, number]
            },
            getTargetColor: colourOf,
            getWidth: (d) => (d.key === frame.selectedKey ? 3.2 : 1.8),
            widthUnits: 'pixels',
            // half the default rise: a gap of a thousand hours does not need to leave the atmosphere
            getHeight: 0.5,
            // on the globe the ribbon's winding faces away from the camera for most of its length,
            // and the default back-face cull swallows it whole — deck.gl's own globe example turns
            // the cull off for its arcs, and so does this one (verified 2026-09-03: twelve arcs
            // drawn, two pixels changed, until this line)
            parameters: { cullMode: 'none' },
            updateTriggers: { getSourceColor: [emphasis, frame.selectedKey], getTargetColor: [emphasis, frame.selectedKey] },
            pickable: true,
          }),
        )
        out.push(
          new ScatterplotLayer<LayerRecord>({
            id: `arc-end-${id}`,
            data: layer.records,
            getPosition: (d) => pointOf(d) ?? [0, 0],
            getFillColor: colourOf,
            radiusUnits: 'pixels',
            getRadius: (d) => (d.key === frame.selectedKey ? 4.4 : 3),
            updateTriggers: { getFillColor: [emphasis, frame.selectedKey], getRadius: frame.selectedKey },
            pickable: true,
          }),
        )
        break
      }

      case 'tracks': {
        // a ground track is the record's own two ends — the adapter puts a few minutes of orbit
        // either side of the instant into them, and this module draws the great circle between
        const path = (d: LayerRecord): LonLat[] =>
          'from' in d.at && !Array.isArray(d.at) ? [d.at.from, d.at.to] : [pointOf(d) ?? [0, 0]]
        out.push(
          new PathLayer<LayerRecord>({
            id: `track-${id}`,
            data: layer.records,
            getPath: path,
            getColor: colourOf,
            getWidth: (d) => (d.key === frame.selectedKey ? 3 : 1.6),
            widthUnits: 'pixels',
            capRounded: true,
            jointRounded: true,
            parameters: { cullMode: 'none' },
            updateTriggers: { getColor: [emphasis, frame.selectedKey], getWidth: frame.selectedKey },
            pickable: true,
          }),
        )
        break
      }

      case 'countries': {
        // country fills read their polygons from the committed topology the island fetched; a
        // frame whose polygons never arrived draws nothing rather than a wrong shape
        if (!countries) break
        const step = rampStep(layer.records, ink.ramp.length)
        const shapes: CountryFeature[] = []
        for (const record of layer.records) {
          const iso3 = !Array.isArray(record.at) && 'iso3' in record.at ? record.at.iso3 : null
          const shape = iso3 ? countries.byIso3[iso3] : undefined
          if (shape) shapes.push({ ...shape, properties: { record } })
        }
        if (shapes.length === 0) break
        out.push(
          new GeoJsonLayer<CountryProperties>({
            id: `country-${id}`,
            data: { type: 'FeatureCollection', features: shapes } as never,
            filled: true,
            stroked: true,
            getFillColor: (f) => {
              const record = f.properties.record
              if (record.key === frame.selectedKey) return [...ink.selected, 220]
              const front = inFront(layer.id, emphasis)
              const tone = front ? ink.ramp[step(record)] ?? ink.front : ink.mono
              return [...tone, front ? 210 : BACK_ALPHA]
            },
            getLineColor: [...ink.coast, 180],
            lineWidthMinPixels: 0.6,
            updateTriggers: { getFillColor: [emphasis, frame.selectedKey] },
            pickable: true,
          }),
        )
        break
      }

      case 'columns': {
        const height = radiusScale(layer.records, COLUMN_MIN_M, COLUMN_MAX_M)
        out.push(
          // a build-time bin stands OFF the sphere: its height is the value, its footprint is one
          // size, because two things varying at once on a globe read as neither
          new ColumnLayer<LayerRecord>({
            id: `column-${id}`,
            data: layer.records,
            diskResolution: 8,
            extruded: true,
            radius: COLUMN_RADIUS_M,
            radiusUnits: 'meters',
            getPosition: (d) => pointOf(d) ?? [0, 0],
            getFillColor: colourOf,
            getElevation: height,
            elevationScale: 1,
            updateTriggers: { getFillColor: [emphasis, frame.selectedKey], getElevation: frame.day },
            pickable: true,
          }),
        )
        break
      }

      case 'stations':
      case 'points':
      default: {
        const radius = radiusScale(layer.records, layer.kind === 'stations' ? 3 : 2.2, layer.kind === 'stations' ? 7 : 5)
        out.push(
          new ScatterplotLayer<LayerRecord>({
            id: `point-${id}`,
            data: layer.records,
            // a propagated mark stands where it is NOW and at its own altitude; every other mark
            // stands at the point its record carries. A propagation that failed at this instant
            // falls back to the committed point rather than to the middle of the Atlantic.
            getPosition: (d, info) => layer.positions?.[info.index] ?? pointOf(d) ?? [0, 0],
            getFillColor: colourOf,
            getLineColor: colourOf,
            // a station is drawn hollow: an instrument at its own site is not the same claim as a
            // point a record carries, and the shape says so before any legend does
            filled: layer.kind !== 'stations',
            stroked: layer.kind === 'stations',
            lineWidthUnits: 'pixels',
            getLineWidth: 1.4,
            radiusUnits: 'pixels',
            getRadius: (d) => (d.key === frame.selectedKey ? radius(d) * 1.6 : radius(d)),
            updateTriggers: {
              getPosition: frame.tick,
              getFillColor: [emphasis, frame.selectedKey],
              getLineColor: [emphasis, frame.selectedKey],
              getRadius: frame.selectedKey,
            },
            // the ease between two computations, so a satellite travels instead of teleporting
            ...(layer.easeMs === undefined ? {} : { transitions: { getPosition: layer.easeMs } }),
            pickable: true,
          }),
        )
        break
      }
    }
  }

  // the label: the hovered or selected mark, and nothing else on the sphere
  if (frame.label) {
    out.push(
      new TextLayer<{ at: LonLat; text: string }>({
        id: `label-${frame.day}`,
        data: [frame.label],
        getPosition: (d) => d.at,
        getText: (d) => d.text,
        getColor: [...ink.label, 255],
        getSize: 12,
        sizeUnits: 'pixels',
        getPixelOffset: [0, -14],
        getTextAnchor: 'middle',
        fontFamily: 'ui-monospace, monospace',
        outlineWidth: 0.3,
        outlineColor: [...ink.sea, 220],
        fontSettings: { sdf: true },
        pickable: false,
      }),
    )
  }

  return out
}

// ─────────────────────────────────────────────────────────────────────────────── the mounted half

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  minZoom: number
  maxZoom: number
  transitionDuration?: number
  transitionInterpolator?: FlyToInterpolator
}

export function mountGlobe(options: MountOptions): GlobeHandle {
  const { host, land, reduced } = options
  const landFeature = feature(land, land.objects.land as GeometryObject)

  let ink = options.ink()
  let frame = options.frame
  let paused = false
  let interacted = false
  // `interacted` is one-way and permanent: it stops the decorative turn for good, because a turn
  // that resumes under a reader's hand is worse than no turn at all. `held` is the same event read
  // for a different question — "has the visitor touched this since the last camera command?" — and
  // it is therefore CLEARED by flyTo, so a story can tell "the reader is holding this scene's
  // globe" from "the reader held some earlier scene's".
  let held = false
  let destroyed = false

  // ── the one declared no-clock exception ────────────────────────────────────────────────────
  // The elements are parsed once per element set, and the positions recomputed twice a second at
  // the visitor's present. `tick` is what tells deck.gl to re-read them; `easeMs` is what makes a
  // satellite travel between two computations instead of teleporting. None of it runs on any other
  // day, because no other day has elements — scrubbing the axis costs nothing.
  let recs: SatRecs | null = null
  let recsDay: string | null = null
  let points: Array<GroundPoint | null> = []
  let tick = 0

  const propagate = (): void => {
    if (!recs) return
    points = positionsAt(recs, Date.now())
    tick += 1
  }

  /** The frame as it is drawn: the propagated layer's marks put where they are right now. */
  const atInstant = (next: GlobeFrame): GlobeFrame => {
    const declared = next.instant
    if (!declared || declared.instant.day !== next.day) {
      recs = null
      recsDay = null
      return next
    }
    if (recsDay !== declared.instant.day) {
      recs = satrecsOf(declared.instant.elements.map((e) => ({ omm: e.omm as never })))
      recsDay = declared.instant.day
      propagate()
    }
    const at = new Map(declared.instant.elements.map((e, i) => [e.key, i]))
    return {
      ...next,
      tick,
      layers: next.layers.map((layer) =>
        layer.id !== declared.layerId
          ? layer
          : {
              ...layer,
              positions: layer.records.map((record) => {
                const point = points[at.get(record.key) ?? -1]
                return point ? ([point.lon, point.lat, point.altKm * 1000] as LonLatAlt) : null
              }),
              ...(reduced ? {} : { easeMs: POSITION_INTERVAL_MS }),
            },
      ),
    }
  }

  // The globe should fill the shorter side of its host. In deck.gl's GlobeView the 512 units of
  // zoom 0 are the sphere's CIRCUMFERENCE (the same 512 the mercator world is wide), so its
  // diameter at zoom 0 is 512 / π, and the zoom that fits a diameter d is log2(d · π / 512).
  const zoomFor = (): number => {
    const rect = host.getBoundingClientRect()
    const diameter = Math.max(Math.min(rect.width, rect.height) * 0.92, 96)
    return Math.log2((diameter * Math.PI) / 512)
  }
  let viewState: ViewState = { longitude: 15, latitude: 18, zoom: zoomFor(), minZoom: -1.5, maxZoom: 4 }

  const ground = (): Layer[] => [
    new SolidPolygonLayer<LonLat[]>({
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
  ]

  const draw = (): void => {
    const drawn = atInstant(frame)
    deck.setProps({ layers: [...ground(), ...layersFor(drawn, ink, drawn.emphasis, options.countries)] })
  }

  const hitOf = (info: PickingInfo): GlobeHit | null => {
    const record = info.object as LayerRecord | undefined
    if (!info.layer || !record || typeof record.key !== 'string') return null
    const layerId = String(info.layer.id).split('·')[0]?.replace(/^(arc-end-|arc-|track-|country-|column-|point-)/, '') ?? ''
    return { layerId, record, x: info.x, y: info.y }
  }

  const deck = new Deck({
    parent: host,
    views: new GlobeView({ id: 'globe', resolution: GLOBE_RESOLUTION, controller: { inertia: 250, keyboard: false } }),
    viewState,
    layers: (() => {
      const drawn = atInstant(frame)
      return [...ground(), ...layersFor(drawn, ink, drawn.emphasis, options.countries)]
    })(),
    useDevicePixels: Math.min(window.devicePixelRatio || 1, 2),
    getCursor: ({ isDragging, isHovering }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'),
    onViewStateChange: ({ viewState: next, interactionState }) => {
      if (interactionState.isDragging || interactionState.isZooming || interactionState.isPanning || interactionState.isRotating) {
        interacted = true
        held = true
      }
      viewState = next as ViewState
      deck.setProps({ viewState })
    },
    onHover: (info: PickingInfo) => options.onHover(hitOf(info)),
    onClick: (info: PickingInfo) => {
      const hit = hitOf(info)
      if (hit) options.onSelect(hit)
    },
    onError: (error) => options.onError(error),
  })

  let raf = 0
  let lastFrame = 0
  let lastPositions = 0
  const step = (t: number): void => {
    if (destroyed) return
    raf = requestAnimationFrame(step)
    if (paused) {
      lastFrame = t
      return
    }
    // The propagated marks keep moving even after the visitor has taken hold of the globe: the turn
    // is a decoration and stops on touch, the fleet's positions are the record and do not.
    if (recs && t - lastPositions >= POSITION_INTERVAL_MS) {
      lastPositions = t
      propagate()
      draw()
    }
    if (!interacted) {
      const dt = lastFrame ? Math.min((t - lastFrame) / 1000, 0.1) : 0
      viewState = { ...viewState, longitude: ((viewState.longitude + TURN_DEG_PER_S * dt + 540) % 360) - 180 }
      deck.setProps({ viewState })
    }
    lastFrame = t
  }
  // Reduced motion: the globe the visitor sees is the one drawn at mount, and it stands still —
  // one propagation, no turn, no easing.
  if (!reduced) raf = requestAnimationFrame(step)

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
      draw()
    },
    setFrame(next, nextInk) {
      frame = next
      if (nextInk) ink = nextInk
      draw()
    },
    heldByPointer() {
      return held
    },
    flyTo(camera, animate) {
      interacted = true
      held = false
      const moving = animate && !reduced
      viewState = {
        ...viewState,
        longitude: camera.longitude,
        latitude: camera.latitude,
        zoom: camera.zoom ?? viewState.zoom,
        ...(moving ? { transitionDuration: FLY_MS, transitionInterpolator: new FlyToInterpolator() } : {}),
      }
      deck.setProps({ viewState })
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      resize.disconnect()
      deck.finalize()
    },
  }
}

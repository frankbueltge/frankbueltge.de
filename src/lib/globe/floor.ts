// src/lib/globe/floor.ts — the globe's floor: the whole sky and sea as one equirectangular plate,
// drawn at build time so the entrance shows the record before any script runs and keeps showing
// it where WebGL never arrives. Land from the committed Natural Earth file (src/data/globe), the
// dark-vessel gaps as great-circle arcs from where the transponder fell silent to where it spoke
// again, every satellite of the fleet as a point at its position at the snapshot's own time.
//
// Pure and deterministic, one decimal: same inputs ⇒ byte-identical markup. No colour and no
// `style=` — every mark carries a class, and src/styles/ops-room.css inks it (the site's CSP
// drops style attributes; drift-check rule 3 refuses them in source). Every arc and every point
// carries a native <title>, so the figure reads with a pointer and without a script.
//
// Two builders stand here. `buildGlobeFloorSvg` draws the entrance's own plate — the fleet and the
// gaps, unchanged. `buildLayeredFloorSvg` draws the living globe: every registered layer's newest
// frame as its own `<g data-layer="…">`, in the registry's order, each mark named by a labeller
// the PAGE supplies. The library composes no sentence of its own; it places marks and quotes what
// it was handed.
import { geoEquirectangular, geoGraticule10, geoPath, type GeoProjection } from 'd3-geo'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import { escapeXml } from '@/lib/dataviz/geometry'
import { centroidOfIso3 } from './crosswalk'
import type { GlobeArc, GlobeSatellite } from './model'
import type { GroundPoint } from './propagate'
import type { LayerFrame, LayerKind, LayerRecord } from './layers/types'

export const FLOOR_W = 960
export const FLOOR_H = 480

export interface FloorLabels {
  /** the accessible title of the plate */
  title: string
  /** the accessible description — what the marks are and when they stood there */
  desc: string
  /** the readout for a satellite point: `name · group · owner` in the page's own words */
  satellite: (s: GlobeSatellite) => string
  /** the readout for a gap: `vessel · hours dark · waters` in the page's own words */
  arc: (a: GlobeArc) => string
}

export interface FloorInput {
  land: Topology
  arcs: GlobeArc[]
  satellites: GlobeSatellite[]
  /** one point per satellite, in the satellites' order; null where SGP4 gave none */
  points: Array<GroundPoint | null>
  labels: FloorLabels
}

/** The projection, the land and the graticule — the ground both floors stand on. Built once per
 *  call, never shared between calls: d3 projections are mutable, and a shared one would make the
 *  markup depend on who drew first. */
function plate(land: Topology) {
  const projection = geoEquirectangular().fitSize([FLOOR_W, FLOOR_H], { type: 'Sphere' })
  const path = geoPath(projection).digits(1)
  const landObject = land.objects.land as GeometryObject
  return {
    projection,
    path,
    landPath: path(feature(land, landObject) as never) ?? '',
    graticule: graticulePath(projection),
  }
}

/** The graticule, as the straight lines it actually is here.
 *
 *  `geoPath` has to assume the projection bends things, so it walks every graticule line in small
 *  steps and writes each step out: twenty-nine kilobytes of `L` commands in the entrance's plate,
 *  measured on the live page on 2026-09-03, for a grid of straight lines. This projection is
 *  equirectangular — longitude is x and latitude is y, both linear — so every meridian is a
 *  vertical segment and every parallel a horizontal one, and two points describe each of them
 *  exactly. The drawn picture is identical; only the markup is smaller. Any other projection would
 *  make this wrong, which is why it reads the projection it was handed rather than assuming one. */
function graticulePath(projection: GeoProjection): string {
  const out: string[] = []
  for (const line of geoGraticule10().coordinates) {
    const first = projection(line[0] as [number, number])
    const last = projection(line[line.length - 1] as [number, number])
    if (!first || !last) continue
    out.push(`M${r1(first[0])},${r1(first[1])}L${r1(last[0])},${r1(last[1])}`)
  }
  return out.join('')
}

/** The sea, the graticule and the land, under a class prefix. Two plates stand on this ground and
 *  they are inked by two different stylesheets — the entrance's `sky-` classes live in
 *  ops-room.css, the living globe's `globe-` classes in living-globe.css — so neither page has to
 *  carry the other's stylesheet, and neither can silently re-colour the other. */
function openPlate(
  prefix: string,
  titleId: string,
  descId: string,
  title: string,
  desc: string,
  landPath: string,
  graticule: string,
): string[] {
  return [
    `<svg class="${prefix}-floor-svg" viewBox="0 0 ${FLOOR_W} ${FLOOR_H}" role="img" aria-labelledby="${titleId} ${descId}" xmlns="http://www.w3.org/2000/svg">`,
    `<title id="${titleId}">${escapeXml(title)}</title>`,
    `<desc id="${descId}">${escapeXml(desc)}</desc>`,
    `<rect class="${prefix}-sea" x="0" y="0" width="${FLOOR_W}" height="${FLOOR_H}"/>`,
    `<path class="${prefix}-grat" d="${graticule}"/>`,
    `<path class="${prefix}-land" d="${landPath}"/>`,
  ]
}

export function buildGlobeFloorSvg({ land, arcs, satellites, points, labels }: FloorInput): string {
  const { projection, path, landPath, graticule } = plate(land)

  const s: string[] = openPlate('sky', 'sky-floor-title', 'sky-floor-desc', labels.title, labels.desc, landPath, graticule)

  s.push('<g class="sky-arcs">')
  for (const a of arcs) {
    const d = path({ type: 'LineString', coordinates: [a.from, a.to] }) ?? ''
    const off = projection(a.from)
    const on = projection(a.to)
    s.push(`<g class="sky-gap" data-gap="${escapeXml(a.id)}"><title>${escapeXml(labels.arc(a))}</title>`)
    s.push(`<path class="sky-arc" d="${d}"/>`)
    if (off) s.push(`<circle class="sky-arc-off" cx="${r1(off[0])}" cy="${r1(off[1])}" r="2.6"/>`)
    if (on) s.push(`<circle class="sky-arc-on" cx="${r1(on[0])}" cy="${r1(on[1])}" r="2.6"/>`)
    s.push('</g>')
  }
  s.push('</g>')

  s.push('<g class="sky-sats">')
  satellites.forEach((sat, i) => {
    const p = points[i]
    if (!p) return
    const xy = projection([p.lon, p.lat])
    if (!xy) return
    s.push(
      `<circle class="sky-sat sky-sat-${escapeXml(sat.group)}" cx="${r1(xy[0])}" cy="${r1(xy[1])}" r="1.7" data-norad="${sat.norad}"><title>${escapeXml(labels.satellite(sat))}</title></circle>`,
    )
  })
  s.push('</g>')
  s.push('</svg>')
  return s.join('')
}

const r1 = (n: number): string => n.toFixed(1)

// ── the living globe's floor: every layer's newest frame ──────────────────────────────────────

export interface FloorLayer {
  id: string
  kind: LayerKind
  frame: LayerFrame
}

export interface LayeredFloorLabels {
  title: string
  desc: string
  /** what a mark's native <title> says — the page's words, never this library's */
  mark: (record: LayerRecord, layerId: string) => string
}

export interface LayeredFloorInput {
  land: Topology
  /** in the registry's order; a layer with an empty frame still gets its group, so the plate's
   *  structure matches the legend even on a day a layer holds nothing */
  layers: readonly FloorLayer[]
  labels: LayeredFloorLabels
}

/** Where a record stands on the plate. A country-shaped record has no coordinate of its own, so
 *  it is placed at the spherical centroid of its own polygon — the same point the card, the tables
 *  and the readout name, read from the same committed topology, so the plate and the sphere cannot
 *  disagree about where a country is. The centroid is DERIVED, never invented: a country the
 *  topology draws no polygon for gets no point here, and the adapters that build country records
 *  drop it from the frame and count it in the frame's note, so a plate and a table never differ by
 *  a silent mark. */
function place(record: LayerRecord): { from: [number, number]; to?: [number, number] } | null {
  if (Array.isArray(record.at)) return { from: record.at }
  if ('from' in record.at) return { from: record.at.from, to: record.at.to }
  const centroid = centroidOfIso3(record.at.iso3)
  return centroid ? { from: centroid } : null
}

export function buildLayeredFloorSvg({ land, layers, labels }: LayeredFloorInput): string {
  const { projection, path, landPath, graticule } = plate(land)
  const s: string[] = openPlate('globe', 'globe-floor-title', 'globe-floor-desc', labels.title, labels.desc, landPath, graticule)

  for (const layer of layers) {
    s.push(`<g class="globe-layer" data-layer="${escapeXml(layer.id)}">`)
    for (const record of layer.frame.records) {
      const at = place(record)
      if (!at) continue
      const title = `<title>${escapeXml(labels.mark(record, layer.id))}</title>`
      if (at.to) {
        const d = path({ type: 'LineString', coordinates: [at.from, at.to] }) ?? ''
        const off = projection(at.from)
        const on = projection(at.to)
        s.push(`<g class="globe-mark globe-arc-mark" data-kind="${record.labelKind}">${title}`)
        s.push(`<path class="globe-arc" d="${d}"/>`)
        if (off) s.push(`<circle class="globe-arc-off" cx="${r1(off[0])}" cy="${r1(off[1])}" r="2.4"/>`)
        if (on) s.push(`<circle class="globe-arc-on" cx="${r1(on[0])}" cy="${r1(on[1])}" r="2.4"/>`)
        s.push('</g>')
        continue
      }
      const xy = projection(at.from)
      if (!xy) continue
      const radius = layer.kind === 'points' ? '1.7' : '2.6'
      s.push(
        `<circle class="globe-mark globe-dot" data-kind="${record.labelKind}" cx="${r1(xy[0])}" cy="${r1(xy[1])}" r="${radius}">${title}</circle>`,
      )
    }
    s.push('</g>')
  }

  s.push('</svg>')
  return s.join('')
}

// src/lib/globe/feeds.ts — what the living globe serves, and what the page reads from it.
//
// One manifest and one feed per layer, both prerendered from the committed archive. The split is
// the whole performance argument of this globe: the MANIFEST carries provenance — id, title,
// owner, kind, as-of, source block, the days, the count per day and the byte size of the feed —
// and it is small enough to ship with the page. The FEED carries the records, and is fetched once,
// when a layer is first switched on, and never again. So the legend, the provenance lines, the
// time axis and every table under the plate can be built without downloading a single record, and
// a visitor who never opens a layer never pays for it.
//
// Since 2026-11-02 the page never fetches a whole feed. A layer grows by one day every night, and
// that night the balance layer's archive passed the per-layer ceiling of the data budget
// (feeds.test.ts), which stopped every deploy of the site. So the records come in pieces: the
// newest day when a layer is switched on, and a MONTH of the archive when a visitor walks into it.
// The whole feed stays at its address, as data for whoever wants the archive in one file.
//
// Both are built at build time, from the same model the floor is drawn from — the plate a visitor
// sees without JavaScript and the data an island would fetch cannot drift apart, because there is
// one model behind both.
import { LAYERS } from './layers'
import type { GlobeLayer, LayerFrame, LayerInstant } from './layers/types'
import { buildLivingGlobe, frameOf, type LivingGlobe } from './living'

export interface LayerFeed {
  id: string
  title: string
  kind: string
  asOf: string
  source: GlobeLayer['source']
  days: string[]
  frames: LayerFrame[]
  /** the one declared no-clock exception, where the layer has one: the elements its newest frame is
   *  propagated from, at the visitor's present. It rides in the FEED and not in the manifest
   *  because it is the size of records, not the size of provenance — a visitor who never switches
   *  the layer on never downloads an element set. */
  instant?: LayerInstant
  /** a static layer's one fixed frame (G3, third evening) — `days` and `frames` are both `[]` for
   *  such a layer, because it holds no day of its own, and its marks ride here instead so the
   *  island can draw them on whichever day is on screen without asking the manifest for a day the
   *  layer does not have. */
  static?: LayerFrame
}

export interface ManifestLayer {
  id: string
  title: string
  kind: string
  owner: GlobeLayer['owner']
  asOf: string
  source: GlobeLayer['source']
  days: string[]
  counts: Record<string, number>
  total: number
  /** the size of this layer's own feed, as bytes of UTF-8 JSON — a visitor's cost, stated */
  bytes: number
  /** the size of the newest-day feed, in the same units — what a first paint actually costs */
  newestBytes: number
  /** where the records are: every day this layer holds */
  href: string
  /** where the newest day alone is. A globe draws ONE day at a time, and both surfaces open on the
   *  newest one, so this is what a first paint needs; the whole archive above is fetched only when
   *  a visitor walks the days. (Added 2026-09-03 after the entrance's mobile audit: the hero was
   *  pulling seventy-six kilobytes of archive to draw a single night.) */
  newestHref: string
  /** where each month of the archive is, by `YYYY-MM`: the page fetches the month a visitor walks
   *  into, never the whole archive (2026-11-02). A static layer holds no day and so no month. */
  monthHrefs: Record<string, string>
}

export interface GlobeManifest {
  _: string
  /** the newest day any layer holds — what the plate and the entrance draw */
  asOf: string
  /** the union of every layer's days, ascending: the time axis */
  days: string[]
  layers: ManifestLayer[]
}

const encoder = new TextEncoder()

/** Every record a layer holds, day by day. Days a layer does not have are absent; a day it has
 *  but could not fill carries its own note, so the reason travels with the hole. */
export function layerFeed(layer: GlobeLayer): LayerFeed {
  return {
    id: layer.id,
    title: layer.title,
    kind: layer.kind,
    asOf: layer.asOf,
    source: layer.source,
    days: layer.days,
    frames: layer.days.map((day) => frameOf(layer, day)),
    ...(layer.instant ? { instant: layer.instant } : {}),
    ...(layer.static ? { static: layer.static } : {}),
  }
}

export const feedJson = (layer: GlobeLayer): string => JSON.stringify(layerFeed(layer))

/** The same feed with one frame in it: the newest day the layer holds. `days` is left whole, so a
 *  reader of this file still learns what the layer has — only the records are cut down to the day
 *  a globe actually opens on. A static layer has no days and keeps carrying its one fixed frame. */
export function newestFeed(layer: GlobeLayer): LayerFeed {
  const whole = layerFeed(layer)
  const newest = layer.days.at(-1)
  return {
    ...whole,
    frames: newest ? [frameOf(layer, newest)] : [],
  }
}

export const newestJson = (layer: GlobeLayer): string => JSON.stringify(newestFeed(layer))

export function newestBytes(layer: GlobeLayer): number {
  return encoder.encode(newestJson(layer)).length
}

export function feedBytes(layer: GlobeLayer): number {
  return encoder.encode(feedJson(layer)).length
}

/** The month a day belongs to, `YYYY-MM`. */
export const monthOf = (day: string): string => day.slice(0, 7)

/** The months a layer holds days in, ascending. */
export function layerMonths(layer: GlobeLayer): string[] {
  return [...new Set(layer.days.map(monthOf))]
}

export const monthHref = (id: string, month: string): string => `/globe/layers/${id}/${month}.json`

/** The feed with one month's frames in it. `days` is left whole, as in the newest feed, so a piece
 *  still says what the layer holds; the island merges the pieces it has fetched, day by day. The
 *  newest day's `instant` stays with the newest feed, which every visitor of the layer has. */
export function monthFeed(layer: GlobeLayer, month: string): LayerFeed {
  return {
    id: layer.id,
    title: layer.title,
    kind: layer.kind,
    asOf: layer.asOf,
    source: layer.source,
    days: layer.days,
    frames: layer.days.filter((day) => monthOf(day) === month).map((day) => frameOf(layer, day)),
  }
}

export const monthJson = (layer: GlobeLayer, month: string): string => JSON.stringify(monthFeed(layer, month))

export function buildManifest(model: LivingGlobe = buildLivingGlobe(), layers: readonly GlobeLayer[] = LAYERS): GlobeManifest {
  return {
    _:
      'What the living globe holds, layer by layer: where each one comes from, which days it has, ' +
      'how many marks it draws on each of them, and what its records cost to fetch. Built at build ' +
      'time from the committed archive (src/lib/globe/feeds.ts); the records live one fetch away, ' +
      'at each layer’s own href.',
    asOf: model.newest,
    days: model.days,
    layers: layers.map((layer) => ({
      id: layer.id,
      title: layer.title,
      kind: layer.kind,
      owner: layer.owner,
      asOf: layer.asOf,
      source: layer.source,
      days: layer.days,
      counts: model.counts[layer.id] ?? {},
      total: model.totals[layer.id] ?? 0,
      bytes: feedBytes(layer),
      newestBytes: newestBytes(layer),
      href: `/globe/layers/${layer.id}.json`,
      newestHref: `/globe/layers/${layer.id}.newest.json`,
      monthHrefs: Object.fromEntries(layerMonths(layer).map((month) => [month, monthHref(layer.id, month)])),
    })),
  }
}

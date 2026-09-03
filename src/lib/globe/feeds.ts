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
// Both are built at build time, from the same model the floor is drawn from — the plate a visitor
// sees without JavaScript and the data an island would fetch cannot drift apart, because there is
// one model behind both.
import { LAYERS } from './layers'
import type { GlobeLayer, LayerFrame } from './layers/types'
import { buildLivingGlobe, frameOf, type LivingGlobe } from './living'

export interface LayerFeed {
  id: string
  title: string
  kind: string
  asOf: string
  source: GlobeLayer['source']
  days: string[]
  frames: LayerFrame[]
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
  /** where the records are */
  href: string
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
  }
}

export const feedJson = (layer: GlobeLayer): string => JSON.stringify(layerFeed(layer))

export function feedBytes(layer: GlobeLayer): number {
  return encoder.encode(feedJson(layer)).length
}

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
      href: `/globe/layers/${layer.id}.json`,
    })),
  }
}

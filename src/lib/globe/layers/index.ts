// src/lib/globe/layers/index.ts — the registry: every layer the living globe can draw, in the
// order the legend lists them.
//
// One list, read by everything. The manifest at /globe/layers.json, the per-layer feeds, the
// build-time floor, the tables under the plate and the method sheet's source table all derive
// from this array — so a layer cannot exist on the globe without a row in the sheet, and a row
// in the sheet cannot exist without a layer. Order is editorial and stable: the sky first
// because it stands over everything, then what moves on the water, then the fixed stations — the
// planet's nightly minutes and, since G3's second evening, the institutions that took a page back,
// which stand at seats for the same reason the minutes do — and after them the layers whose records
// name a COUNTRY rather than a place: the press's tone gap as country fills, the countries that
// invoked the day's most-invoked year, the countries the day's most-echoed phrase was registered in,
// the countries the world chamber's checked hosts are registered in, and the countries a morning's
// signals were published for. They come last because each of them stands at a centroid, and a
// centroid is the weakest claim on this globe: it says "somewhere in this country" and nothing more.
import type { GlobeLayer } from './types'

import { skyLayer } from './sky'
import { ghostFleetLayer } from './ghost-fleet'
import { protocolLayer } from './protocol'
import { redactionSeatsLayer } from './redaction-seats'
import { balanceLayer } from './balance'
import { invokedLayer } from './invoked'
import { consensusTldLayer } from './consensus-tld'
import { redactionWorldLayer } from './redaction-world'
import { trendingLayer } from './trending'

export * from './types'

export const LAYERS: readonly GlobeLayer[] = Object.freeze([
  skyLayer,
  ghostFleetLayer,
  protocolLayer,
  redactionSeatsLayer,
  balanceLayer,
  invokedLayer,
  consensusTldLayer,
  redactionWorldLayer,
  trendingLayer,
])

/** Ids that appear more than once — a duplicate would silently shadow a layer in every lookup
 *  the house does by id (the manifest, the feed routes, the floor's groups). */
export function duplicateIds(layers: readonly GlobeLayer[]): string[] {
  const seen = new Set<string>()
  const twice = new Set<string>()
  for (const layer of layers) {
    if (seen.has(layer.id)) twice.add(layer.id)
    seen.add(layer.id)
  }
  return [...twice].sort()
}

/** A layer by id, or a throw naming what is registered. Every caller here resolves an id that
 *  came from the registry itself, so an unknown one is a bug in the house, not a visitor's
 *  input — and it must say so instead of rendering an empty globe. */
export function layerById(id: string, layers: readonly GlobeLayer[] = LAYERS): GlobeLayer {
  const found = layers.find((layer) => layer.id === id)
  if (!found) {
    throw new Error(`globe: no layer "${id}" is registered — the registry holds ${layers.map((l) => l.id).join(', ')}`)
  }
  return found
}

// src/lib/globe/living.ts — the model behind the living globe: many layers, one day axis.
//
// The builder does three things and refuses to do a fourth. It unions the days the layers hold,
// so the time axis is the union of what the archive actually contains and not a range someone
// typed. It counts each layer's records per day, so a toggle can say how much it is about to draw
// before it draws it. And it memoises a frame per layer and day, because the floor, the manifest,
// the feeds and the tables all ask for the same frames.
//
// What it refuses: to invent a day. `frameAt` with a day no layer holds gives empty frames and a
// note, never a throw and never the nearest day — a globe that silently answers a question with a
// different day's data is worse than one that says it holds nothing for that day.
import { LAYERS } from './layers'
import type { GlobeLayer, LayerFrame } from './layers/types'

export interface LivingGlobe {
  /** ascending, unique — the union of every layer's own days */
  days: string[]
  /** the newest day any layer holds; the frame the floor and the entrance draw */
  newest: string
  layers: readonly GlobeLayer[]
  /** records per layer per day: counts[layerId][day] */
  counts: Record<string, Record<string, number>>
  /** the total a layer holds across every day it has */
  totals: Record<string, number>
}

export interface GlobeMoment {
  day: string
  layers: Record<string, LayerFrame>
}

const frameCache = new Map<string, LayerFrame>()

/** One layer's frame for one day, built once per build. */
export function frameOf(layer: GlobeLayer, day: string): LayerFrame {
  const key = `${layer.id}:${day}`
  const hit = frameCache.get(key)
  if (hit) return hit
  const frame = layer.frame(day)
  frameCache.set(key, frame)
  return frame
}

export function buildLivingGlobe(layers: readonly GlobeLayer[] = LAYERS): LivingGlobe {
  const days = [...new Set(layers.flatMap((layer) => layer.days))].sort()
  const counts: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const layer of layers) {
    const perDay: Record<string, number> = {}
    let total = 0
    for (const day of layer.days) {
      const n = frameOf(layer, day).records.length
      perDay[day] = n
      total += n
    }
    counts[layer.id] = perDay
    totals[layer.id] = total
  }

  return { days, newest: days[days.length - 1], layers, counts, totals }
}

/** Every layer's frame for one day. A day outside the model's own days is answered with empty
 *  frames — the model says what it holds and does not reach for a neighbour. */
export function frameAt(model: LivingGlobe, day: string): GlobeMoment {
  const layers: Record<string, LayerFrame> = {}
  for (const layer of model.layers) layers[layer.id] = frameOf(layer, day)
  return { day, layers }
}

/** How many marks stand on the globe on one day, across every layer. */
export function markCount(moment: GlobeMoment): number {
  return Object.values(moment.layers).reduce((sum, frame) => sum + frame.records.length, 0)
}

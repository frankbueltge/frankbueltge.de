// The data budget. Every layer of this globe grows by one day every night, and nothing about that
// growth is visible while developing: the page stays fast on a laptop with the archive on disk,
// and gets slower for a visitor on a phone, one night at a time. So the ceiling is a test — each
// layer's feed is serialised and gzipped HERE, at the size a browser would actually receive it,
// and a layer that outgrows the budget fails the suite. The escape is not a bigger number: it is
// sharding the feed per day, which the manifest already carries the counts for.
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { buildManifest, feedBytes, feedJson, layerFeed } from './feeds'
import { LAYERS } from './layers'
import { buildLivingGlobe } from './living'

/** Per layer, gzipped. Measured, not guessed: the site is served over HTTPS with compression. */
const MAX_GZ = 150 * 1024

const model = buildLivingGlobe()
const manifest = buildManifest(model)

describe('the data budget', () => {
  it.each(LAYERS.map((l) => [l.id, l] as const))('%s fits in the per-layer ceiling, gzipped', (id, layer) => {
    const gz = gzipSync(Buffer.from(feedJson(layer), 'utf8')).length
    expect(
      gz,
      `${id}'s feed is ${(gz / 1024).toFixed(1)} KB gzipped, over the ${MAX_GZ / 1024} KB ceiling — ` +
        `shard it per day (the manifest already carries the per-day counts), do not raise the budget`,
    ).toBeLessThanOrEqual(MAX_GZ)
  })
})

describe('the manifest is the provenance, the feed is the records', () => {
  it('lists every registered layer, in the registry’s order', () => {
    expect(manifest.layers.map((l) => l.id)).toEqual(LAYERS.map((l) => l.id))
  })

  it('carries the provenance a legend needs, without a single record', () => {
    const json = JSON.stringify(manifest)
    for (const layer of manifest.layers) {
      expect(layer.source.file.length).toBeGreaterThan(0)
      expect(layer.source.license.length).toBeGreaterThan(0)
      expect(layer.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(layer.href).toBe(`/globe/layers/${layer.id}.json`)
    }
    expect(json).not.toContain('"receipt"')
  })

  it('states each layer’s own cost in bytes, and states it correctly', () => {
    for (const layer of LAYERS) {
      const entry = manifest.layers.find((l) => l.id === layer.id)!
      expect(entry.bytes).toBe(feedBytes(layer))
      expect(entry.bytes).toBeGreaterThan(0)
    }
  })

  it('counts in the manifest what the feed actually holds', () => {
    for (const layer of LAYERS) {
      const feed = layerFeed(layer)
      const entry = manifest.layers.find((l) => l.id === layer.id)!
      expect(feed.days).toEqual(entry.days)
      expect(feed.frames.map((f) => f.day)).toEqual(entry.days)
      for (const frame of feed.frames) expect(entry.counts[frame.day], `${layer.id} ${frame.day}`).toBe(frame.records.length)
      expect(feed.frames.reduce((sum, f) => sum + f.records.length, 0)).toBe(entry.total)
    }
  })

  it('takes its as-of and its time axis from the model, never from a clock', () => {
    expect(manifest.asOf).toBe(model.newest)
    expect(manifest.days).toEqual(model.days)
  })

  it('keeps the reason with the hole — a frame that could not be filled carries its note', () => {
    const sky = layerFeed(LAYERS.find((l) => l.id === 'sky')!)
    const empty = sky.frames.filter((f) => f.records.length === 0)
    expect(empty.length).toBeGreaterThan(0)
    for (const frame of empty) expect(frame.note, `sky ${frame.day}`).toBeTruthy()
  })

  it('is stable — two builds of the same commit serialise identically', () => {
    expect(JSON.stringify(buildManifest())).toBe(JSON.stringify(manifest))
    for (const layer of LAYERS) expect(feedJson(layer)).toBe(feedJson(layer))
  })
})

describe('the one declared no-clock exception travels in the feed, not in the manifest', () => {
  const sky = layerFeed(LAYERS.find((l) => l.id === 'sky')!)

  it('hands over the elements of exactly the marks its newest frame draws, key for key', () => {
    const instant = sky.instant!
    expect(instant.day).toBe(sky.asOf)
    const frame = sky.frames.find((fr) => fr.day === instant.day)!
    expect(frame.records.length).toBeGreaterThan(0)
    expect(instant.elements.map((e) => e.key)).toEqual(frame.records.map((r) => r.key))
    // a satellite the build could not place has neither a mark nor an element: the two lists
    // cannot drift, which is the whole reason the key travels with the element
    for (const element of instant.elements) expect(Object.keys(element.omm).length).toBeGreaterThan(0)
  })

  it('names the day it may be drawn on, and says in words why no other day is drawn at all', () => {
    const instant = sky.instant!
    expect(instant.note).toContain(instant.day)
    expect(instant.note.length).toBeGreaterThan(40)
    for (const frame of sky.frames) {
      if (frame.day === instant.day) expect(frame.records.length).toBeGreaterThan(0)
      else {
        expect(frame.records).toEqual([])
        expect(frame.note, `${frame.day} draws nothing and must say why`).toBeTruthy()
      }
    }
  })

  it('is the only layer that has one — an exception that spreads is not an exception', () => {
    const declaring = LAYERS.filter((l) => l.instant !== undefined).map((l) => l.id)
    expect(declaring).toEqual(['sky'])
  })

  it('stays out of the manifest, which a visitor downloads whether they open the layer or not', () => {
    expect(JSON.stringify(manifest)).not.toContain('MEAN_MOTION')
    expect(JSON.stringify(manifest)).not.toContain('"instant"')
  })
})

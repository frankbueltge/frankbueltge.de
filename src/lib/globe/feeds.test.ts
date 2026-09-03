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

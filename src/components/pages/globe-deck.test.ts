// The drawing half's pure part, tested without a GPU. deck.gl's layers are plain objects until a
// device draws them, so the two decisions that matter here — which layer class a kind of record
// becomes, and what colour it wears under the emphasis rule — can be checked in a node process.
//
// The third assertion is a boundary: this globe draws with @deck.gl/core and @deck.gl/layers and
// nothing else. The aggregation layers do not work on the globe view at all, and the geo layers
// would roughly double the chunk for a tile source this site does not have and could not fetch
// under `connect-src 'self'`. Anything that needs binning is binned at BUILD time and drawn as
// `columns`, which is why the plan could hold a 320 KB ceiling in the first place.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import type { LayerKind, LayerRecord } from '@/lib/globe/layers/types'
import {
  BACK_ALPHA,
  FRONT_ALPHA,
  GLOBE_RESOLUTION,
  inFront,
  inkFor,
  layersFor,
  pointOf,
  radiusScale,
  rampStep,
  type FrameLayer,
  type GlobeInk,
} from './globe-deck'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

const INK: GlobeInk = {
  sea: [20, 20, 20],
  land: [36, 36, 39],
  coast: [139, 139, 146],
  front: [127, 208, 232],
  mono: [163, 163, 168],
  selected: [226, 105, 31],
  label: [244, 244, 245],
  ramp: [
    [30, 59, 69],
    [46, 92, 107],
    [67, 131, 151],
    [95, 173, 198],
    [127, 208, 232],
  ],
}

const point = (n: number, value?: number): LayerRecord => ({
  key: `k:${n}`,
  at: [n, n],
  ...(value === undefined ? {} : { value }),
  labelKind: 'point',
  receipt: { file: 'src/data/x.json', locator: `[${n}]`, words: `record ${n}` },
})

const arc = (n: number): LayerRecord => ({
  key: `a:${n}`,
  at: { from: [n, n], to: [n + 1, n + 1] },
  labelKind: 'gap',
  receipt: { file: 'src/data/y.json', locator: `[${n}]`, words: `gap ${n}` },
})

const country = (iso3: string): LayerRecord => ({
  key: `c:${iso3}`,
  at: { iso3 },
  value: iso3.length,
  labelKind: 'centroid',
  receipt: { file: 'src/data/z.json', locator: iso3, words: `country ${iso3}` },
})

const layer = (id: string, kind: LayerKind, records: LayerRecord[], hue?: [number, number, number]): FrameLayer => ({
  id,
  kind,
  records,
  ...(hue ? { hue } : {}),
})

const classesOf = (kind: LayerKind, records: LayerRecord[]) =>
  layersFor({ day: '2026-09-02', layers: [layer('l', kind, records)] }, INK, 'l').map((l) => l.constructor.name)

describe('a kind of record becomes a kind of layer', () => {
  it('draws a point and a station as scatterplots', () => {
    expect(classesOf('points', [point(1), point(2)])).toEqual(['ScatterplotLayer'])
    expect(classesOf('stations', [point(1)])).toEqual(['ScatterplotLayer'])
  })

  it('draws a gap as a great-circle arc, with the end it resumed at as a dot', () => {
    expect(classesOf('arcs', [arc(1)])).toEqual(['ArcLayer', 'ScatterplotLayer'])
  })

  it('draws a ground track as a path', () => {
    expect(classesOf('tracks', [arc(1)])).toEqual(['PathLayer'])
  })

  it('draws a build-time bin as a column', () => {
    expect(classesOf('columns', [point(1, 4), point(2, 9)])).toEqual(['ColumnLayer'])
  })

  it('draws a country only when the polygons the island fetched are actually there', () => {
    const frame = { day: '2026-09-02', layers: [layer('l', 'countries', [country('DEU')])] }
    expect(layersFor(frame, INK, 'l')).toHaveLength(0)
    const shapes = {
      byIso3: {
        DEU: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } },
      },
    } as never
    expect(layersFor(frame, INK, 'l', shapes).map((l) => l.constructor.name)).toEqual(['GeoJsonLayer'])
  })

  it('draws nothing for a layer with no records on this day', () => {
    expect(classesOf('points', [])).toEqual([])
  })

  it('labels only the one mark the island named, and nothing else on the sphere', () => {
    const layers = layersFor(
      { day: '2026-09-02', layers: [layer('l', 'points', [point(1), point(2)])], label: { at: [1, 1], text: 'record 1' } },
      INK,
      'l',
    )
    expect(layers.map((l) => l.constructor.name)).toEqual(['ScatterplotLayer', 'TextLayer'])
  })
})

describe('the emphasis rule', () => {
  it('takes one layer in the room and a set on the entrance — the rule is arithmetic, not a vow', () => {
    // ten layers cannot carry ten identities on one sphere; two can, and the hero draws two
    expect(inFront('sky', 'sky')).toBe(true)
    expect(inFront('sky', 'ghost-fleet')).toBe(false)
    expect(inFront('sky', ['sky', 'ghost-fleet'])).toBe(true)
    expect(inFront('protocol', ['sky', 'ghost-fleet'])).toBe(false)
    expect(inFront('sky', null)).toBe(false)
    expect(inFront('sky', undefined)).toBe(false)
  })

  it('keeps BOTH of the entrance\u2019s layers in their own colours at full weight', () => {
    const sky = layer('sky', 'points', [point(1)])
    const ghost = layer('ghost-fleet', 'arcs', [arc(1)], [42, 106, 191])
    const both = ['sky', 'ghost-fleet']
    // the sky has no recorded hue of its own and takes the room's live ink; the ghost fleet has one
    expect(inkFor(sky, INK, both)).toEqual({ rgb: INK.front, alpha: FRONT_ALPHA })
    expect(inkFor(ghost, INK, both)).toEqual({ rgb: [42, 106, 191], alpha: FRONT_ALPHA })
  })

  it('gives the layer in front its own recorded hue at full weight', () => {
    const ghost = layer('ghost-fleet', 'arcs', [arc(1)], [42, 106, 191])
    expect(inkFor(ghost, INK, 'ghost-fleet')).toEqual({ rgb: [42, 106, 191], alpha: FRONT_ALPHA })
  })

  it('gives a layer in front without a recorded hue the room’s live ink', () => {
    expect(inkFor(layer('sky', 'points', [point(1)]), INK, 'sky')).toEqual({ rgb: INK.front, alpha: FRONT_ALPHA })
  })

  it('drops every other active layer to mono ink at a reduced alpha — its own hue included', () => {
    const ghost = layer('ghost-fleet', 'arcs', [arc(1)], [42, 106, 191])
    expect(inkFor(ghost, INK, 'sky')).toEqual({ rgb: INK.mono, alpha: BACK_ALPHA })
    expect(BACK_ALPHA).toBeLessThan(FRONT_ALPHA)
  })

  it('leaves nothing in front when nothing is switched on', () => {
    expect(inkFor(layer('sky', 'points', [point(1)]), INK, null)).toEqual({ rgb: INK.mono, alpha: BACK_ALPHA })
  })

  it('draws the layer in front last, so the layers holding their places never cover it', () => {
    const frame = {
      day: '2026-09-02',
      layers: [layer('front', 'points', [point(1)]), layer('behind', 'points', [point(2)])],
    }
    const ids = layersFor(frame, INK, 'front').map((l) => l.id)
    expect(ids[ids.length - 1]).toContain('front')
  })
})

describe('a mark’s size comes from the record’s own value', () => {
  it('scales inside the frame, by area — never across frames, where the unit changes', () => {
    const records = [point(1, 0), point(2, 100)]
    const size = radiusScale(records, 2, 6)
    expect(size(records[0])).toBeCloseTo(2, 5)
    expect(size(records[1])).toBeCloseTo(6, 5)
  })

  it('draws one size where there is nothing to scale', () => {
    const flat = [point(1, 5), point(2, 5)]
    const size = radiusScale(flat, 2, 6)
    expect(size(flat[0])).toBe(size(flat[1]))
    expect(radiusScale([point(1)], 2, 6)(point(1))).toBe(4)
  })

  it('puts a value on a step of the ramp, and keeps the ends inside it', () => {
    const records = [point(1, 0), point(2, 5), point(3, 10)]
    const step = rampStep(records, 5)
    expect(step(records[0])).toBe(0)
    expect(step(records[2])).toBe(4)
    expect(step(records[1])).toBeGreaterThanOrEqual(0)
    expect(step(records[1])).toBeLessThanOrEqual(4)
  })
})

describe('where a record stands, as one point', () => {
  it('takes a coordinate as itself and a gap by the end it resumed at', () => {
    expect(pointOf(point(3))).toEqual([3, 3])
    expect(pointOf(arc(3))).toEqual([4, 4])
  })

  it('gives a country no point of its own — the polygon carries it', () => {
    expect(pointOf(country('DEU'))).toBeNull()
  })
})

describe('the globe view is subdivided finely enough to be a sphere', () => {
  it('raises the resolution above deck.gl’s own default, which is coarser', () => {
    // the prop is in DEGREES: a smaller number is a finer mesh, and deck.gl's default is ten
    expect(GLOBE_RESOLUTION).toBeLessThan(10)
  })

  it('is the resolution the country fills were measured at (G3, 2026-09-03)', () => {
    // measured with the Balance layer in front and the sphere zoomed in on west Africa: at deck.gl's
    // default of ten degrees the grid cut leaves notches inside Ghana, Nigeria and Saudi Arabia where
    // a cell falls away; at four they are gone and every fill sits inside its own outline. Screenshots
    // g3a-tess-res10.png and g3a-tess-res4.png, named in the decision-log row.
    expect(GLOBE_RESOLUTION).toBe(4)
  })
})

describe('the sphere is stitched before it is drawn', () => {
  it('makes the land continuous across the antimeridian, in the house’s one tested place', () => {
    // a ring that crosses the antimeridian arrives from Natural Earth as a ring that JUMPS across the
    // longitude plane, and the globe view draws that jump as a band around the whole earth — the seam
    // that ran across this sphere until 2026-09-03. The arithmetic is a pure lib with its own suite
    // (src/lib/globe/antimeridian.ts); this only holds the drawing to using it.
    const code = readFileSync(join(ROOT, 'src/components/pages/globe-deck.ts'), 'utf8')
    expect(code).toContain("from '@/lib/globe/antimeridian'")
    expect(code).toContain('stitchFeatures(')
  })
})

describe('the deck.gl boundary', () => {
  function* walk(dir: string): Generator<string> {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) yield* walk(path)
      else if (/\.(ts|tsx|astro)$/.test(name)) yield path
    }
  }

  it('imports no aggregation layers and no geo layers anywhere in the tree', () => {
    const offenders: string[] = []
    for (const path of walk(join(ROOT, 'src'))) {
      const text = readFileSync(path, 'utf8')
      const lines = text.split('\n')
      lines.forEach((line, i) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return
        if (/@deck\.gl\/(geo-layers|aggregation-layers)/.test(line)) offenders.push(`${path}:${i + 1}`)
      })
    }
    expect(offenders, 'aggregation layers do not work on the globe view; geo layers would double the chunk').toEqual([])
  })

  it('is what package.json actually depends on', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    const deck = Object.keys(pkg.dependencies).filter((name) => name.startsWith('@deck.gl/'))
    expect(deck.sort()).toEqual(['@deck.gl/core', '@deck.gl/layers'])
  })
})

describe('the one declared no-clock exception, as the drawing half sees it', () => {
  const records = [point(1), point(2)]

  it('draws a propagated mark where it is now, and falls back to the committed point where the propagator failed', () => {
    const moving: FrameLayer = {
      id: 'sky',
      kind: 'points',
      records,
      positions: [[10, 20, 700000], null],
      easeMs: 500,
    }
    const [scatter] = layersFor({ day: '2026-09-02', layers: [moving], tick: 3 }, INK, 'sky')
    const props = scatter.props as unknown as {
      getPosition: (d: LayerRecord, info: { index: number }) => number[]
      transitions?: { getPosition?: number }
      updateTriggers: { getPosition?: number }
    }
    expect(props.getPosition(records[0], { index: 0 })).toEqual([10, 20, 700000])
    // the second propagation failed at this instant: the record's own point stands in, not [0, 0]
    expect(props.getPosition(records[1], { index: 1 })).toEqual([2, 2])
    expect(props.transitions?.getPosition).toBe(500)
    expect(props.updateTriggers.getPosition).toBe(3)
  })

  it('eases nothing when nothing was handed an ease — which is what reduced motion asks for', () => {
    const still: FrameLayer = { id: 'sky', kind: 'points', records, positions: [[10, 20, 700000], null] }
    const [scatter] = layersFor({ day: '2026-09-02', layers: [still] }, INK, 'sky')
    // deck.gl's own default for the prop is null; either way, nothing is being eased
    expect((scatter.props as unknown as { transitions?: unknown }).transitions).toBeFalsy()
  })

  it('leaves every layer that declared no instant standing at its record’s own point', () => {
    const fixed = layer('protocol', 'stations', records)
    const [scatter] = layersFor({ day: '2026-09-02', layers: [fixed] }, INK, 'protocol')
    const getPosition = (scatter.props as unknown as { getPosition: (d: LayerRecord, i: { index: number }) => number[] })
      .getPosition
    expect(getPosition(records[0], { index: 0 })).toEqual([1, 1])
  })
})

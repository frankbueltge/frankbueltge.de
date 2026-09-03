// The registry is the one list the globe reads. What this suite prevents is the quiet kind of
// breakage: two layers sharing an id (the second would shadow the first in every lookup, and the
// page would simply draw one layer fewer without a word), and a lookup that answers a typo with
// `undefined` instead of saying which ids exist.
import { describe, expect, it } from 'vitest'
import { duplicateIds, layerById, LAYERS } from './index'
import { daysFromFiles, EMPTY_FRAME, type GlobeLayer } from './types'

const stub = (id: string): GlobeLayer => ({
  id,
  title: id,
  kind: 'points',
  owner: { line: 'counter-measurement' },
  asOf: '2026-09-02',
  source: { file: 'src/data/none.json', name: 'none', url: 'https://example.invalid/', license: 'CC0' },
  days: [],
  frame: (day) => EMPTY_FRAME(day),
  readout: {},
})

describe('the layer registry', () => {
  it('holds every id once', () => {
    expect(duplicateIds(LAYERS)).toEqual([])
  })

  it('names the duplicate rather than shadowing it', () => {
    expect(duplicateIds([stub('a'), stub('b'), stub('a')])).toEqual(['a'])
  })

  it('answers an unknown id with the ids it does hold, never with undefined', () => {
    expect(() => layerById('no-such-layer', [stub('a')])).toThrow(/no layer "no-such-layer"[\s\S]*a/)
    expect(layerById('a', [stub('a')]).id).toBe('a')
  })

  it('keeps a stable order — the legend and the manifest read the registry, not a sort', () => {
    expect(LAYERS.map((l) => l.id)).toEqual([...LAYERS].map((l) => l.id))
  })
})

describe('the day axis comes from the archive’s filenames', () => {
  it('reads dated files, ascending and unique', () => {
    expect(daysFromFiles(['2026-08-02.json', '2026-06-11.json', '2026-08-02.json'])).toEqual([
      '2026-06-11',
      '2026-08-02',
    ])
  })

  it('ignores latest.json and anything else that is not a day', () => {
    expect(daysFromFiles(['latest.json', 'README.md', 'index.json', '2026-06-11.json'])).toEqual(['2026-06-11'])
  })
})

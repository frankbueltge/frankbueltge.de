import { describe, expect, it } from 'vitest'
import { buildIndex, nearest, similarity, tokenise, type Doc } from './screen'

const docs: Doc[] = [
  { id: 'a', text: 'Satellites photograph the ocean and the fishing fleet goes dark' },
  { id: 'b', text: 'A fleet of fishing vessels switches off its transponder and goes dark at sea' },
  { id: 'c', text: 'A poem about grief, written by hand on paper' },
  { id: 'd', text: 'Satellites photograph the ocean and the fishing fleet goes dark' },
]

describe('the tokeniser is reproducible by hand', () => {
  it('lowercases, cuts on non-letters, drops short words and the stoplist', () => {
    expect(tokenise('The Ocean, and 42 SATELLITES — at sea.')).toEqual(['ocean', 'satellites', 'sea'])
  })
  it('drops digits: a year is a fact about a work, not a shared term', () => {
    expect(tokenise('built in 2026 across 1667 papers')).toEqual(['built', 'across', 'papers'])
  })
  it('is stable — the same text gives the same tokens every time', () => {
    const t = 'Satellites photograph the ocean'
    expect(tokenise(t)).toEqual(tokenise(t))
  })
})

describe('the measure behaves like a measure', () => {
  const index = buildIndex(docs)

  it('scores identical texts at 1 and unrelated texts near 0', () => {
    expect(similarity(index, 'a', 'd')).toBeCloseTo(1, 6)
    expect(similarity(index, 'a', 'c')).toBeLessThan(0.05)
  })

  it('is symmetric', () => {
    expect(similarity(index, 'a', 'b')).toBeCloseTo(similarity(index, 'b', 'a'), 12)
  })

  it('puts a real neighbour above an unrelated document', () => {
    expect(similarity(index, 'a', 'b')).toBeGreaterThan(similarity(index, 'a', 'c'))
  })

  it('returns 0 for a document the index has never seen, rather than throwing', () => {
    expect(similarity(index, 'a', 'nope')).toBe(0)
    expect(nearest(index, 'nope', ['a'])).toEqual([])
  })
})

describe('the ranking is deterministic — the same data gives the same queue', () => {
  const index = buildIndex(docs)

  it('never ranks a document against itself', () => {
    expect(nearest(index, 'a', ['a', 'b', 'c']).map((n) => n.id)).not.toContain('a')
  })

  it('breaks ties on id, so engine internals cannot reorder the queue', () => {
    // 'a' and 'd' are byte-identical, so both score the same against 'b'.
    const ranked = nearest(index, 'b', ['d', 'a'], 2).map((n) => n.id)
    expect(ranked).toEqual(['a', 'd'])
  })

  it('shows the terms that produced the score, strongest first', () => {
    const [top] = nearest(index, 'a', ['b', 'c'], 1)
    expect(top.id).toBe('b')
    expect(top.shared.length).toBeGreaterThan(0)
    expect(top.shared).toContain('fishing')
  })
})

describe('the honesty properties the instrument rests on', () => {
  it('builds one idf over BOTH sides — a term common in the house is not rare in the world', () => {
    // 'satellites' appears in 2 of 4 documents; its idf must reflect the whole corpus, not one side.
    const whole = buildIndex(docs)
    const oneSided = buildIndex(docs.slice(2))
    expect(whole.size).toBe(4)
    expect(oneSided.size).toBe(2)
    expect(whole.idf.get('fishing')).not.toBe(oneSided.idf.get('fishing'))
  })

  it('cannot certify absence: a true neighbour phrased differently sinks, and that is invisible', () => {
    // Same subject, no shared vocabulary at all. The screen scores it near zero — the false
    // negative this instrument must never present as daylight.
    const paraphrase: Doc[] = [
      { id: 'x', text: 'vessels extinguish their beacons and vanish from maritime tracking' },
      ...docs,
    ]
    const index = buildIndex(paraphrase)
    expect(similarity(index, 'x', 'b')).toBeLessThan(0.15)
  })

  it('gives no score above zero to a pairing with nothing in common', () => {
    const index = buildIndex([{ id: 'p', text: 'alpha beta gamma' }, { id: 'q', text: 'delta epsilon zeta' }])
    expect(similarity(index, 'p', 'q')).toBe(0)
  })
})

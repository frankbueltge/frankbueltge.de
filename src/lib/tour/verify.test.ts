import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { verifyTourQuotes } from './verify'
import type { Tour } from './types'

// verifyTourQuotes is the failing-build honesty harness: a tour's quotes must be byte-exact
// substrings of the committed files they claim to come from. Most fixtures here are inline
// strings (a `readFile` fake mapping path → content) — one case at the bottom reads a real
// committed file via node:fs, proving the same function works unmodified against disk content.

function baseTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: 'sample-tour',
    practice: 'field',
    title: 'A sample tour',
    standfirst: 'Exists only to exercise the harness.',
    provenance: ['docs/example.md'],
    scenes: [
      {
        id: 'scene-one',
        kicker: 'Kicker',
        heading: 'Heading',
        quotes: [{ text: 'the exact substring', source: 'docs/example.md' }],
        focus: { figure: 'fig-1' },
      },
    ],
    ...overrides,
  }
}

function fakeReadFile(files: Record<string, string>) {
  return (path: string): string => {
    if (!(path in files)) throw new Error(`ENOENT: ${path}`)
    return files[path]
  }
}

describe('verifyTourQuotes — quote verbatim-ness', () => {
  it('passes when the quote text is an exact substring of its source file', () => {
    const tour = baseTour()
    const readFile = fakeReadFile({ 'docs/example.md': 'before the exact substring after' })
    expect(verifyTourQuotes(tour, readFile)).toEqual([])
  })

  it('fails when punctuation differs from the source, even by one character', () => {
    const tour = baseTour({
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'stop the war, now', source: 'docs/example.md' }],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    // source has a period, the quote claims a comma
    const readFile = fakeReadFile({ 'docs/example.md': 'they said: stop the war. now' })
    const violations = verifyTourQuotes(tour, readFile)
    expect(violations).toContainEqual(
      expect.objectContaining({ kind: 'not-verbatim', sceneId: 'scene-one', path: 'docs/example.md' }),
    )
  })

  it('fails when the quote "tidies" whitespace the source does not have (documents the exact-match policy)', () => {
    // The exact-match policy is deliberate: normalizing whitespace is exactly the kind of
    // well-intentioned tidying this harness exists to catch, so a quote with collapsed double
    // spaces or a re-flowed line break must fail even though it "reads the same".
    const tour = baseTour({
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'two words', source: 'docs/example.md' }], // single space, tidied
          focus: { figure: 'fig-1' },
        },
      ],
    })
    const readFile = fakeReadFile({ 'docs/example.md': 'two  words' }) // source has a double space
    const violations = verifyTourQuotes(tour, readFile)
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'not-verbatim', sceneId: 'scene-one' }))
  })

  it('fails when a re-typed number does not match the source figure', () => {
    const tour = baseTour({
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'a rise of 4.3 degrees', source: 'docs/example.md' }],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    const readFile = fakeReadFile({ 'docs/example.md': 'a rise of 4.2 degrees' })
    const violations = verifyTourQuotes(tour, readFile)
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'not-verbatim', sceneId: 'scene-one' }))
  })

  it('fails when the quote source file does not exist', () => {
    const tour = baseTour({
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'anything', source: 'docs/missing.md' }],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    const violations = verifyTourQuotes(tour, fakeReadFile({}))
    expect(violations).toContainEqual(
      expect.objectContaining({ kind: 'missing-quote-source', sceneId: 'scene-one', path: 'docs/missing.md' }),
    )
  })

  it('a readFile that throws is treated as a missing file, not propagated', () => {
    const tour = baseTour()
    const readFile = (): string => {
      throw new Error('boom')
    }
    expect(() => verifyTourQuotes(tour, readFile)).not.toThrow()
    expect(verifyTourQuotes(tour, readFile)).toContainEqual(
      expect.objectContaining({ kind: 'missing-provenance-file', path: 'docs/example.md' }),
    )
  })

  it('a scene with several quotes reports every violating one, not just the first', () => {
    const tour = baseTour({
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [
            { text: 'wrong one', source: 'docs/example.md' },
            { text: 'also wrong', source: 'docs/example.md' },
          ],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    const readFile = fakeReadFile({ 'docs/example.md': 'neither phrase appears here' })
    const violations = verifyTourQuotes(tour, readFile).filter((v) => v.kind === 'not-verbatim')
    expect(violations).toHaveLength(2)
  })
})

describe('verifyTourQuotes — provenance', () => {
  it('fails when a provenance path does not exist, even if no quote uses it', () => {
    const tour = baseTour({ provenance: ['docs/example.md', 'docs/unused-but-listed.md'] })
    const readFile = fakeReadFile({ 'docs/example.md': 'before the exact substring after' })
    const violations = verifyTourQuotes(tour, readFile)
    expect(violations).toContainEqual(
      expect.objectContaining({ kind: 'missing-provenance-file', path: 'docs/unused-but-listed.md' }),
    )
  })

  it('passes when every provenance path exists', () => {
    const tour = baseTour({ provenance: ['docs/example.md'] })
    const readFile = fakeReadFile({ 'docs/example.md': 'before the exact substring after' })
    expect(verifyTourQuotes(tour, readFile)).toEqual([])
  })
})

describe('verifyTourQuotes — structural invariants', () => {
  it('fails on a duplicate scene id', () => {
    const tour = baseTour({
      provenance: ['docs/example.md'],
      scenes: [
        { id: 'dup', kicker: 'k', heading: 'h', quotes: [], focus: { figure: 'fig-1' } },
        { id: 'dup', kicker: 'k', heading: 'h', quotes: [], focus: { figure: 'fig-1' } },
      ],
    })
    const violations = verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'x' }))
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'duplicate-scene-id', sceneId: 'dup' }))
  })

  it.each(['Kill-03', 'kill_03', 'kill--03', '-kill-03', 'kill-03-', 'kill 03', ''])(
    'fails on a non-slug-shaped scene id: %j',
    (id) => {
      const tour = baseTour({
        provenance: ['docs/example.md'],
        scenes: [{ id, kicker: 'k', heading: 'h', quotes: [], focus: { figure: 'fig-1' } }],
      })
      const violations = verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'x' }))
      expect(violations).toContainEqual(expect.objectContaining({ kind: 'invalid-scene-id', sceneId: id }))
    },
  )

  it('passes a properly slug-shaped scene id', () => {
    const tour = baseTour({
      provenance: ['docs/example.md'],
      scenes: [{ id: 'kill-03', kicker: 'k', heading: 'h', quotes: [], focus: { figure: 'fig-1' } }],
    })
    expect(verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'x' }))).toEqual([])
  })

  it('fails on an empty focus.figure', () => {
    const tour = baseTour({
      provenance: ['docs/example.md'],
      scenes: [{ id: 'scene-one', kicker: 'k', heading: 'h', quotes: [], focus: { figure: '' } }],
    })
    const violations = verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'x' }))
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'empty-figure', sceneId: 'scene-one' }))
  })

  it('a tour with no violations at all returns an empty list', () => {
    const tour = baseTour()
    const readFile = fakeReadFile({ 'docs/example.md': 'before the exact substring after' })
    expect(verifyTourQuotes(tour, readFile)).toEqual([])
  })

  // G2 (2026-09-03) gave FocusState a camera, a day and a layer set, and `Tour.practice` a fourth
  // value for a work of the lab. This harness has and wants NO opinion about any of them: whether
  // a day exists in a figure's model, whether a layer id is registered and whether a coordinate is
  // on the earth are questions about a FIGURE, and each tour's own test answers them against that
  // figure's real registry (see globe-stories.test.ts). What this file guards is the one thing that
  // can be checked without a figure — that the words are the source's words — and it must not
  // start failing a tour for carrying fields it does not read.
  it('takes no position on a scene’s camera, day or layer set — those are the figure’s business', () => {
    const tour = baseTour({
      practice: 'lab',
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'the exact substring', source: 'docs/example.md' }],
          focus: {
            figure: 'living-globe',
            layers: ['sky', 'ghost-fleet'],
            time: { day: '2026-08-16' },
            camera: { longitude: -90.2376, latitude: 6.679, zoom: 2.6 },
          },
        },
      ],
    })
    expect(verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'before the exact substring after' }))).toEqual([])
  })

  it('still fails a drifted quote in a scene that carries a camera and a day', () => {
    const tour = baseTour({
      practice: 'lab',
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'the exact substrings', source: 'docs/example.md' }],
          focus: { figure: 'living-globe', time: { day: '2026-08-16' }, camera: { longitude: 0, latitude: 0 } },
        },
      ],
    })
    const violations = verifyTourQuotes(tour, fakeReadFile({ 'docs/example.md': 'before the exact substring after' }))
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'not-verbatim', sceneId: 'scene-one' }))
  })
})

describe('verifyTourQuotes — against a real committed file', () => {
  it('reads __fixtures__/sample-source.txt from disk and passes an exact quote from it', () => {
    const fixturePath = fileURLToPath(new URL('./__fixtures__/sample-source.txt', import.meta.url))
    const readFile = (path: string): string => {
      // In real use `path` is repo-relative and resolved against the repo root; here the fixture
      // stands in for both — the point is that verifyTourQuotes itself does no path resolution.
      expect(path).toBe(fixturePath)
      return readFileSync(path, 'utf8')
    }
    const tour = baseTour({
      provenance: [fixturePath],
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [
            {
              text: 'The measured drift for this scene was 4.2 degrees above baseline, recorded on the night of the crossing.',
              source: fixturePath,
            },
          ],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    expect(verifyTourQuotes(tour, readFile)).toEqual([])
  })

  it('fails a re-typed figure against the same real file', () => {
    const fixturePath = fileURLToPath(new URL('./__fixtures__/sample-source.txt', import.meta.url))
    const readFile = (path: string): string => readFileSync(path, 'utf8')
    const tour = baseTour({
      provenance: [fixturePath],
      scenes: [
        {
          id: 'scene-one',
          kicker: 'k',
          heading: 'h',
          quotes: [{ text: 'was 4.3 degrees above baseline', source: fixturePath }],
          focus: { figure: 'fig-1' },
        },
      ],
    })
    const violations = verifyTourQuotes(tour, readFile)
    expect(violations).toContainEqual(expect.objectContaining({ kind: 'not-verbatim', sceneId: 'scene-one' }))
  })
})

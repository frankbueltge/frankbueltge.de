// The recordings are rendered by hand, once per round, so nothing else ties them to the round's
// words. This does: a line changed without a new render turns red here, instead of a page that
// shows one sentence while a voice says another.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CURRENT_ROUND as round } from './round'
import { cueAt, cueEnvelope, placeOf, type VoiceBook } from './voices'

const dir = join(process.cwd(), 'public/ducking', round.id)
const book = JSON.parse(readFileSync(join(dir, 'voices.json'), 'utf8')) as VoiceBook

const digest = (lines: (typeof round.channels)[number]['lines']): string =>
  createHash('sha256')
    .update(JSON.stringify(lines.map((l) => [l.text, l.say ?? l.text])))
    .digest('hex')
    .slice(0, 16)

describe('the round', () => {
  it('seats a known voice on every channel, once', () => {
    const voices = round.channels.map((c) => c.voice)
    expect(new Set(voices).size).toBe(voices.length)
    for (const c of round.channels) {
      expect(c.terms.length, c.id).toBeGreaterThan(0)
      expect(c.sources.length, c.id).toBeGreaterThan(0)
      expect(c.lines.length, c.id).toBeGreaterThan(0)
    }
  })

  it('pins the briefing to a commit', () => {
    expect(round.briefing.url).toMatch(/\/blob\/[0-9a-f]{40}\/briefings\//)
  })

  it('gives the voice no digit to guess at', () => {
    for (const c of round.channels) {
      for (const l of c.lines) expect(l.say ?? l.text, c.id).not.toMatch(/\d/)
    }
  })
})

describe('the recordings', () => {
  it('holds a recording for every channel, made from the lines the round has now', () => {
    for (const c of round.channels) {
      const file = book.channels[c.id]
      expect(file, c.id).toBeDefined()
      expect(file!.digest, `${c.id}: the lines changed, run scripts/ducking/voices.py`).toBe(digest(c.lines))
      expect(file!.cues.map((q) => q.text)).toEqual(c.lines.map((l) => l.text))
      expect(existsSync(join(dir, file!.file)), c.id).toBe(true)
    }
  })

  it('keeps cues in order and inside the loop', () => {
    for (const file of [...Object.values(book.channels), book.rest]) {
      for (const q of file.cues) {
        expect(q.t).toBeGreaterThanOrEqual(0)
        expect(q.t).toBeLessThan(file.period)
      }
      const starts = file.cues.map((q) => q.t)
      expect(starts).toEqual([...starts].sort((a, b) => a - b))
    }
  })

  it('reads everything else in several voices, from the week the round ends', () => {
    expect(book.rest.voices).toBe(round.rest.voices.length)
    expect(book.rest.to).toBe(round.briefing.written)
    expect(new Set(book.rest.cues.map((q) => q.v)).size).toBe(round.rest.voices.length)
    expect(existsSync(join(dir, book.rest.file))).toBe(true)
  })

  it('leaves a matter out of everything else', () => {
    const all = book.rest.cues.map((q) => q.text.toLowerCase()).join(' | ')
    for (const word of ['ebola', 'hormuz', 'cop31', 'unhcr', 'wildlife']) expect(all).not.toContain(word)
  })

  it('stays small enough to load on a phone', () => {
    const bytes = [...Object.values(book.channels), book.rest].reduce((n, f) => n + statSync(join(dir, f.file)).size, 0)
    expect(bytes).toBeLessThan(4_000_000)
  })
})

describe('reading the book', () => {
  const cues = [
    { t: 1, d: 2, text: 'one' },
    { t: 4, d: 1, text: 'two' },
  ]

  it('finds the cue being spoken, and nothing in a pause', () => {
    expect(cueAt(cues, 1.5)?.text).toBe('one')
    expect(cueAt(cues, 3.5)).toBeNull()
    expect(cueAt(cues, 4.5)?.text).toBe('two')
    expect(cueAt(cues, 9)).toBeNull()
  })

  it('brings a cue up and takes it away', () => {
    expect(cueEnvelope(cues[0]!, 1)).toBe(0)
    expect(cueEnvelope(cues[0]!, 2)).toBe(1)
    expect(cueEnvelope(cues[0]!, 3)).toBeCloseTo(0, 5)
  })

  it('places a label the same way every time, inside the screen', () => {
    for (const cue of book.rest.cues) {
      const [x, y] = placeOf(cue)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(1)
    }
    expect(placeOf(cues[0]!)).toEqual(placeOf(cues[0]!))
  })
})

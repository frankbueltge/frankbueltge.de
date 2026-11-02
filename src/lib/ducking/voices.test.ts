// The recordings are rendered by hand, once per round, so nothing else ties them to the round's
// words. This does: a line changed without a new render turns red here, instead of a page that
// shows one sentence while a voice says another.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { namer } from '@/lib/reading/attention'
import { FIELD_IDS } from '@/lib/briefing/map'
import { CURRENT_ROUND as round, roundBehind } from './round'
import { cueAt, cueEnvelope, cueOrNext, placeOf, type VoiceBook } from './voices'

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

describe('the channels', () => {
  it('are the fields of the map, in its order, so that a fader means the same from round to round', () => {
    // the round after cycle 011 took the two fields that joined the map on 2026-11-02 the same evening
    expect(round.channels.map((c) => c.id)).toEqual(FIELD_IDS)
  })
})

describe('the record', () => {
  const { record } = book

  it('is there, and ends on the day of the round', () => {
    expect(existsSync(join(dir, record.file))).toBe(true)
    expect(record.to).toBe(round.briefing.written)
    expect(record.cues.length).toBeGreaterThan(20)
  })

  it('reads headlines that name their field, on channels of the desk', () => {
    for (const q of record.cues) {
      const channel = round.channels[q.c]!
      expect(namer(channel.terms)(q.text), q.text).toBe(true)
      expect(namer(channel.exclude ?? [])(q.text), q.text).toBe(false)
      if (channel.requires) expect(namer(channel.requires)(q.text), q.text).toBe(true)
    }
  })

  it('reads each headline once, and no voice over itself', () => {
    expect(new Set(record.cues.map((q) => q.text)).size).toBe(record.cues.length)
    for (const c of round.channels.keys()) {
      const own = record.cues.filter((q) => q.c === c)
      for (let i = 1; i < own.length; i++) expect(own[i]!.t).toBeGreaterThanOrEqual(own[i - 1]!.t + own[i - 1]!.d)
    }
  })

  it('counts what it could read, and says so', () => {
    const { signals, readable, spoken } = record.sample
    expect(spoken).toBe(record.cues.length)
    expect(readable).toBeGreaterThanOrEqual(spoken)
    expect(signals).toBeGreaterThanOrEqual(readable)
  })
})

describe('a round and the briefings after it', () => {
  it('stays current through the convening that wrote its briefing and the cycle after', () => {
    expect(roundBehind('after-cycle-011', { cycle: 11, convening: { after_cycle: 11, briefing: {} } })).toBe(false)
    expect(roundBehind('after-cycle-011', { cycle: 12 })).toBe(false)
  })

  it('falls behind once the next briefing stands, and not before', () => {
    expect(roundBehind('after-cycle-011', { cycle: 12, convening: { after_cycle: 12 } })).toBe(false)
    expect(roundBehind('after-cycle-011', { cycle: 12, convening: { after_cycle: 12, briefing: {} } })).toBe(true)
    expect(roundBehind('after-cycle-011', { cycle: 13 })).toBe(true)
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

  it('levels every channel to the same power, so a fader means the same on each', () => {
    const levels = [...Object.values(book.channels), book.rest].map((f) => f.level)
    expect(Math.max(...levels) - Math.min(...levels)).toBeLessThan(0.1)
  })

  it('never leaves a held channel silent for long', () => {
    for (const file of Object.values(book.channels)) {
      const last = file.cues.at(-1)!
      expect(file.period - (last.t + last.d)).toBeLessThan(4)
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

  it('accounts for every label of the sample', () => {
    const { labels, long, stopped, unreadable, spoken } = book.rest.sample
    expect(spoken).toBe(book.rest.cues.length)
    expect(spoken).toBeLessThanOrEqual(labels - long - stopped - unreadable)
  })

  it('leaves a field out of everything else', () => {
    const all = book.rest.cues.map((q) => q.text.toLowerCase()).join(' | ')
    for (const word of ['ebola', 'hormuz', 'cop31', 'ukraine', 'chatgpt']) expect(all).not.toContain(word)
  })

  it('stays small enough to load on a phone', () => {
    const bytes = [...Object.values(book.channels), book.rest, book.record].reduce((n, f) => n + statSync(join(dir, f.file)).size, 0)
    expect(bytes).toBeLessThan(6_000_000)
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

  it('shows what comes next in a pause, round the end of the loop', () => {
    expect(cueOrNext(cues, 1.5)?.text).toBe('one')
    expect(cueOrNext(cues, 3.5)?.text).toBe('two')
    expect(cueOrNext(cues, 9)?.text).toBe('one')
    expect(cueOrNext([], 1)).toBeNull()
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

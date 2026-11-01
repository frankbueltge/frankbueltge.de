import { describe, expect, it } from 'vitest'
import { roundProblems, type Round as ReadingRound } from '@/lib/reading/round'
import type { Round as DuckingRound } from '@/lib/ducking/round'
import { attentionWord, briefingProblems, QUIET_FROM, type Briefing, type BriefingMatter } from './briefing'
import { ATTENTION_DAYS, DESK_VOICES, toDuckingRound, toReadingRound, withMatters, type WatchEntry } from './derive'

const matter = (i: number): BriefingMatter => ({
  id: `matter-${i}`,
  title: `Matter number ${String.fromCharCode(96 + i)}`,
  short: `Matter ${String.fromCharCode(96 + i)}`,
  strip: `MATTER ${String.fromCharCode(64 + i)}`,
  gist: 'Something presses on the world, and here is why.',
  quiet_rank: i <= 3 ? i : null,
  terms: [`term${String.fromCharCode(96 + i)}`, 'other name'],
  lines: [
    { text: 'A count of 1,200 by 3 May.', say: 'A count of twelve hundred by the third of May.' },
    { text: 'A sentence with no figure in it.' },
  ],
  sources: [
    { label: 'A press report', url: 'https://example.org/report', kind: 'report' },
    { label: 'The agency', url: 'https://example.org/agency', kind: 'primary' },
  ],
})

const estimate = (i: number) => ({
  id: `estimate-${i}`,
  label: 'How large',
  matter: `matter-${i}`,
  question: 'How large is it?',
  kind: 'count' as const,
  unit: 'people',
  truth: 7000 + i,
  truth_label: 'about seven thousand',
  source: { label: 'The agency', url: 'https://example.org/agency' },
})

const briefing = (): Briefing => ({
  $contract: 'briefing/1',
  id: 'after-cycle-012',
  written: '2026-11-07',
  checked: { on: '2026-11-07', claims: 60, held: 50, corrected: 8, dropped: 2 },
  matters: Array.from({ length: 9 }, (_, i) => matter(i + 1)),
  estimates: [estimate(1), estimate(2), estimate(3)],
  fallback: 'What is the first question?',
})

const readingTemplate = {
  $contract: 'third-reading-round/1',
  consent_version: '2026-10-31',
  question: 'Which of these two should the world act on first, in the coming year?',
  pairs_per_reading: 15,
  estimates_per_reading: 3,
} as ReadingRound

const duckingTemplate = {
  $contract: 'ducking-round/1',
  rest: { strip: 'THE CROWD', voices: ['af_sarah', 'am_eric'], seed: 11 },
} as DuckingRound

describe('a briefing as data', () => {
  it('passes when every rule is kept', () => {
    expect(briefingProblems(briefing())).toEqual([])
  })

  it('refuses a file nobody checked', () => {
    const b = briefing() as unknown as { checked: unknown }
    b.checked = null
    expect(briefingProblems(b as Briefing).join()).toContain('not checked')
  })

  it('refuses a check that does not add up', () => {
    const b = briefing()
    b.checked.held = 49
    expect(briefingProblems(b)).toContain('check does not add up')
  })

  it('refuses a matter with no primary source', () => {
    const b = briefing()
    b.matters[0]!.sources = [{ label: 'A press report', url: 'https://example.org/report', kind: 'report' }]
    expect(briefingProblems(b).join()).toContain('no primary source')
  })

  it('refuses a digit in what a voice is given', () => {
    const b = briefing()
    b.matters[1]!.lines[0] = { text: 'A count of 1,200.' }
    expect(briefingProblems(b).join()).toContain('a digit in what the voice is given')
  })

  it('refuses a gist that gives away an estimate', () => {
    const b = briefing()
    b.matters[0]!.gist = 'It has reached 7001 people.'
    expect(briefingProblems(b).join()).toContain('gives away 7001')
  })

  it('refuses a title that says how loud the web was', () => {
    const b = briefing()
    b.matters[0]!.title = 'A quiet matter'
    expect(briefingProblems(b).join()).toContain('how loud the web was')
  })

  it('holds the briefing to its size', () => {
    const b = briefing()
    b.matters = b.matters.slice(0, 7)
    expect(briefingProblems(b).join()).toContain('7 matters')
  })
})

describe('the one reading of attention', () => {
  it('is loud once a matter converged, whatever its count', () => {
    expect(attentionWord(0, 1)).toBe('loud')
  })

  it('is quiet from a fixed number of signals, and absent below it', () => {
    expect(attentionWord(QUIET_FROM, 0)).toBe('quiet')
    expect(attentionWord(QUIET_FROM - 1, 0)).toBe('absent')
  })
})

describe('what the site makes of a briefing', () => {
  const url = 'https://github.com/frankbueltge/research-ecology/blob/abc/briefings/after-cycle-012.md'

  it('makes a round of Third Reading that keeps every rule of a round', () => {
    expect(roundProblems(toReadingRound(briefing(), url, readingTemplate))).toEqual([])
  })

  it('keeps the question and the consent of the round before', () => {
    const r = toReadingRound(briefing(), url, readingTemplate)
    expect(r.question).toBe(readingTemplate.question)
    expect(r.consent_version).toBe(readingTemplate.consent_version)
  })

  it('reads attention over the thirty days to the briefing', () => {
    const { from, to } = toReadingRound(briefing(), url, readingTemplate).attention_window
    expect(to).toBe('2026-11-07')
    expect((Date.parse(to) - Date.parse(from)) / 86400000).toBe(ATTENTION_DAYS - 1)
  })

  it('seats every matter on the desk with a voice of its own, primary sources first', () => {
    const r = toDuckingRound(briefing(), url, duckingTemplate)
    expect(r.channels).toHaveLength(9)
    expect(new Set(r.channels.map((c) => c.voice)).size).toBe(9)
    expect(r.channels[0]!.sources[0]!.label).toBe('The agency')
    expect(r.checked).toBe('2026-11-07')
    expect(r.rest.seed).toBe(12)
  })

  it('has a voice for the largest briefing there may be', () => {
    expect(new Set(DESK_VOICES).size).toBe(12)
  })

  it('adds a new matter to the watchlist and leaves a known one alone', () => {
    const known: WatchEntry = { added: '2026-10-25', aliases: ['terma'], note: '', origin: 'editorial', slug: 'x', term: 'X', wikipedia_article: null }
    const list = withMatters(briefing(), [known])
    expect(list[0]).toBe(known)
    expect(list.map((e) => e.slug)).not.toContain('matter-1')
    expect(list.map((e) => e.slug)).toContain('matter-2')
    expect(list.at(-1)!.origin).toBe('editorial')
  })

  it('does not add the same matter twice', () => {
    const once = withMatters(briefing(), [])
    expect(withMatters(briefing(), once)).toEqual(once)
  })
})

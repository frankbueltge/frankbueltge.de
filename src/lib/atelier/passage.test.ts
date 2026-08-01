// The Passage, tested as geometry and as an honesty contract. The second half is the one that
// matters: a figure that prints "the record carries no closing ledger" over a line whose record has
// one, or a zero over a line whose record has none, is worse than a figure with no gutter at all.
import { describe, expect, it } from 'vitest'
import type { ClosingLedger } from './ledger'
import {
  BAND_HEIGHT,
  BAND_MAX,
  buildPassageModel,
  buildPassageSvg,
  dayLabel,
  gutterFor,
  PASSAGE_COLUMNS,
  passageRows,
  shortTitle,
  type PassageInput,
} from './passage'
import type { Ausgang, RohProjekt } from './process'

const HARBOURS: Record<Ausgang, { label: string; hint: string }> = {
  PUBLISH: { label: 'published', hint: 'through the gate' },
  PUBLICATION_CANDIDATE: { label: 'at the gate', hint: 'a human decides' },
  ARCHIVE_AS_STUDY: { label: 'kept as study', hint: 'it feeds later lines' },
  KILL: { label: 'closed unfinished', hint: 'ended on purpose' },
  OPEN: { label: 'in progress', hint: 'no verdict yet' },
}

const GAP = 'the record carries no closing ledger for this line'
const OPEN_NOTE: string = 'still running — nothing closed, nothing to close'

const project = (over: Partial<RohProjekt> & { id: string }): RohProjekt => ({
  title: over.id,
  status: 'CLOSED',
  disposition: 'KILL',
  created: '2026-07-20',
  dateien: ['SCORE.md', 'DECISION.md'],
  ...over,
})

const ledger = (id: string, gutter: string, full = gutter): ClosingLedger => ({
  id,
  source: `src/content/atelier/projects/${id}/DECISION.md`,
  standing: null,
  cost: gutter,
  costShape: 'budget-line',
  gutter,
  full,
})

const input = (over: Partial<PassageInput> = {}): PassageInput => ({
  projects: [
    project({ id: '2026-07-18-alpha', disposition: 'ARCHIVE_AS_STUDY', created: '2026-07-18' }),
    project({ id: '2026-07-20-beta', disposition: 'KILL', created: '2026-07-20' }),
    project({ id: '2026-07-23-gamma', disposition: 'PUBLICATION_CANDIDATE', status: 'ACTIVE', created: '2026-07-23' }),
    project({ id: '2026-07-24-delta', disposition: 'PUBLISH', created: '2026-07-24' }),
  ],
  journalIds: ['journal/2026-07-21-beta-the-raw-re-read', 'journal/2026-07-25-a-session-note'],
  today: '2026-07-26',
  prose: {},
  ledgers: { '2026-07-20-beta': ledger('2026-07-20-beta', 'Budget closed at 2 of ≤ 4 ticks, 0 EUR.') },
  harbours: HARBOURS,
  ...over,
})

describe('the sheet is measured, not arranged', () => {
  const model = buildPassageModel(input())

  it('keeps the lines in the order they were opened', () => {
    expect(model.lines.map((l) => l.key)).toEqual([
      '2026-07-18-alpha',
      '2026-07-20-beta',
      '2026-07-23-gamma',
      '2026-07-24-delta',
    ])
  })

  it('puts every line on its own row, evenly spaced, and sizes the sheet to fit them', () => {
    const ys = model.lines.map((l) => l.y)
    const gaps = ys.slice(1).map((y, i) => y - ys[i])
    expect(new Set(gaps).size).toBe(1)
    expect(model.height).toBeGreaterThan(ys[ys.length - 1])
  })

  it('uses ONE linear time scale — equal spans of time are equal spans of pixels', () => {
    // alpha opened 18 Jul, beta 20 Jul, gamma 23 Jul: 2 days then 3 days, in that ratio.
    const [a, b, c] = model.lines
    const twoDays = b.x1 - a.x1
    const threeDays = c.x1 - b.x1
    // 2 places, not 5: the emitted coordinates are rounded to a tenth of a pixel on purpose, so
    // the committed SVG diffs on real data changes rather than on floating-point noise.
    expect(threeDays / twoDays).toBeCloseTo(1.5, 2)
  })

  it('gives every harbour a height proportional to its share of the lines', () => {
    const study = model.harbours.find((h) => h.outcome === 'ARCHIVE_AS_STUDY')!
    const kill = model.harbours.find((h) => h.outcome === 'KILL')!
    expect(study.count).toBe(1)
    expect(kill.count).toBe(1)
    expect(study.height).toBeCloseTo(kill.height, 5)
  })

  it('draws the gate only when both of its harbours exist', () => {
    expect(model.gate).not.toBeNull()
    const noCandidate = buildPassageModel(
      input({ projects: [project({ id: '2026-07-24-delta', disposition: 'PUBLISH' })] }),
    )
    expect(noCandidate.gate).toBeNull()
  })

  it('is deterministic — the same records draw the same pixels, every build', () => {
    const a = buildPassageSvg(buildPassageModel(input()), { gapLine: GAP })
    const b = buildPassageSvg(buildPassageModel(input()), { gapLine: GAP })
    expect(a).toBe(b)
  })

  it('declares the journal entries that belong to no line instead of absorbing them', () => {
    expect(model.unattachedMoves).toBe(1)
    expect(model.lines.find((l) => l.key === '2026-07-20-beta')?.moves).toBe(1)
  })
})

describe('the ledger gutter says what the record says, and nothing else', () => {
  const model = buildPassageModel(input())
  const line = (key: string) => model.lines.find((l) => l.key === key)!

  it('prints a closed line’s own closing cost, verbatim', () => {
    expect(gutterFor(line('2026-07-20-beta'), GAP)).toEqual({
      lines: ['Budget closed at 2 of ≤ 4 ticks, 0 EUR.'],
      gap: false,
    })
  })

  it('prints the honest gap where a closed line’s record carries none — never a zero', () => {
    expect(gutterFor(line('2026-07-18-alpha'), GAP)).toEqual({ lines: [GAP], gap: true })
  })

  it('prints NOTHING beside a line that is still running', () => {
    // A running line has not closed, so it has no closing cost to be missing; "no closing ledger"
    // there would report a gap in the record where there is only a question still being worked.
    expect(gutterFor(line('2026-07-23-gamma'), GAP)).toBeNull()
  })

  it('cuts an over-long ledger line at a word and SAYS SO, rather than cutting silently', () => {
    const long = 'Budget closed at five ticks, 0 EUR; ' + 'one 403-fallback full-text extraction '.repeat(8)
    const g = gutterFor({ ...line('2026-07-20-beta'), ledger: ledger('x', long) }, GAP)!
    expect(g.lines).toHaveLength(2)
    expect(g.lines[1].endsWith('[…]')).toBe(true)
    expect(g.gap).toBe(false)
  })
})

describe('the SVG carries structure, never appearance', () => {
  const model = buildPassageModel(input())
  const svg = buildPassageSvg(model, {
    gapLine: GAP,
    gateLabel: ['THE GATE', 'a human decides'],
    gutterLabel: 'what closing it cost',
  })

  it('contains no colour of its own — the skin decides what an outcome looks like', () => {
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(svg).not.toMatch(/\bfill="(?!none")/)
    expect(svg).not.toMatch(/\bstroke="/)
  })

  it('never emits a style attribute — the site’s CSP drops them silently', () => {
    // The needle is assembled rather than written out, because scripts/drift-check.mjs rule 3
    // greps every file under src/lib for exactly that character sequence — a test asserting the
    // rule must not itself trip it.
    expect(svg).not.toContain(`style=${'"'}`)
  })

  it('keys every line for the tour and the panel, and titles it for a plain reader', () => {
    expect(svg).toContain('data-key="2026-07-20-beta"')
    expect(svg).toContain('<title>2026-07-20-beta — closed unfinished</title>')
  })

  it('marks the filtered-in lines with data-on and the dimmed ones with data-dim', () => {
    const filtered = buildPassageSvg(model, { gapLine: GAP, filter: ['KILL'], dim: ['2026-07-24-delta'] })
    const killGroup = filtered.split('<g class="pr-line"').find((g) => g.includes('2026-07-20-beta'))!
    expect(killGroup).toContain('data-on=""')
    const deltaGroup = filtered.split('<g class="pr-line"').find((g) => g.includes('2026-07-24-delta'))!
    expect(deltaGroup).not.toContain('data-on=""')
    expect(deltaGroup).toContain('data-dim=""')
  })

  it('strips every interaction hook from a still — a still is a picture, not a control', () => {
    const still = buildPassageSvg(model, { gapLine: GAP, still: true })
    expect(still).not.toContain('tabindex')
    expect(still).not.toContain('data-key=')
    expect(still).not.toContain('role="button"')
    // …but keeps the substance: the titles, the marks and the gutter are all still there
    expect(still).toContain('Budget closed at 2 of ≤ 4 ticks, 0 EUR.')
    expect(still).toContain(GAP)
  })

  it('crops a still to a band around the line a scene is talking about', () => {
    // a sheet taller than the crop window, so the crop has something to leave out
    const tall = buildPassageModel(
      input({
        projects: Array.from({ length: 14 }, (_, i) =>
          project({ id: `2026-07-${String(10 + i).padStart(2, '0')}-line-${i}`, created: `2026-07-${String(10 + i).padStart(2, '0')}` }),
        ),
      }),
    )
    const target = tall.lines[9]
    const whole = buildPassageSvg(tall, { gapLine: GAP, still: true })
    const cropped = buildPassageSvg(tall, { gapLine: GAP, still: true, cropTo: target.key })
    expect(whole).toContain(`viewBox="-8 0 ${tall.width + 8} ${tall.height}"`)
    const view = /viewBox="-8 ([\d.]+) \d+ ([\d.]+)"/.exec(cropped)!
    const [top, height] = [Number(view[1]), Number(view[2])]
    expect(height).toBeGreaterThanOrEqual(BAND_HEIGHT)
    expect(height).toBeLessThanOrEqual(BAND_MAX)
    // the band contains the line the scene is about, and reaches into the harbour it lands in — a
    // crop showing only a tail curving out of frame would drop the one thing the drawing is for.
    // (Reaches INTO, not "contains": a harbour holding most of the lines is taller than any band,
    // and growing the band to swallow it would just be the whole sheet again.)
    const harbour = tall.harbours.find((h) => h.outcome === target.outcome)!
    expect(top).toBeLessThanOrEqual(target.y)
    expect(top + height).toBeGreaterThanOrEqual(target.y)
    expect(top).toBeLessThan(harbour.y + harbour.height)
    expect(top + height).toBeGreaterThan(harbour.y)
  })

  it('grows the band to reach a small harbour that sits far from the line', () => {
    // beta is the only KILL, so its harbour is a short box well below its own row: the band has to
    // stretch to reach it, and does — this is the case the fixed-height crop got wrong.
    const m = buildPassageModel(input())
    const beta = m.lines.find((l) => l.key === '2026-07-20-beta')!
    const harbour = m.harbours.find((h) => h.outcome === 'KILL')!
    const view = /viewBox="-8 ([\d.]+) \d+ ([\d.]+)"/.exec(
      buildPassageSvg(m, { gapLine: GAP, cropTo: beta.key }),
    )!
    const [top, height] = [Number(view[1]), Number(view[2])]
    expect(top).toBeLessThanOrEqual(beta.y)
    expect(top + height).toBeGreaterThanOrEqual(harbour.y + harbour.height)
  })

  it('letters a scene’s call-out at the line it names', () => {
    const noted = buildPassageSvg(model, {
      gapLine: GAP,
      annotate: [{ key: '2026-07-20-beta', text: 'killed on the pivot fact' }],
    })
    expect(noted).toContain('class="pr-note"')
    expect(noted).toContain('killed on the pivot fact')
  })

  it('escapes everything it letters', () => {
    const nasty = buildPassageModel(
      input({ projects: [project({ id: 'x', title: 'a <script> & "quotes"' })] }),
    )
    const out = buildPassageSvg(nasty, { gapLine: GAP })
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })
})

describe('the table floor repeats everything the figure shows', () => {
  const model = buildPassageModel(input())
  const rows = passageRows(model, GAP, OPEN_NOTE)

  it('has one row per line and one column per thing the figure draws', () => {
    expect(rows).toHaveLength(model.lines.length)
    expect(PASSAGE_COLUMNS.map((c) => c.key)).toContain('cost')
  })

  it('carries the WHOLE ledger in the cost column, where the gutter carries one line of it', () => {
    const full = 'ACTIVE-project capacity returns to 0 of 2. Budget closed at 2 of ≤ 4 ticks, 0 EUR.'
    const withFull = buildPassageModel(
      input({ ledgers: { '2026-07-20-beta': ledger('2026-07-20-beta', 'Budget closed at 2 of ≤ 4 ticks, 0 EUR.', full) } }),
    )
    expect(passageRows(withFull, GAP, OPEN_NOTE).find((r) => r.line === '2026-07-20-beta')!.cost).toBe(full)
  })

  it('distinguishes "closed, and the record says nothing" from "still open"', () => {
    expect(rows.find((r) => r.line === '2026-07-18-alpha')!.cost).toBe(GAP)
    expect(rows.find((r) => r.line === '2026-07-23-gamma')!.cost).toBe(OPEN_NOTE)
  })
})

describe('small helpers', () => {
  it('letters a day the way the sheet does', () => {
    expect(dayLabel('2026-07-20')).toBe('20 Jul')
    expect(dayLabel('not a date')).toBe('not a date')
  })

  it('never shortens a title silently', () => {
    expect(shortTitle('short')).toBe('short')
    expect(shortTitle('a title far longer than the label column', 10)).toBe('a title f…')
  })
})

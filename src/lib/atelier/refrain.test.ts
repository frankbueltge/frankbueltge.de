// src/lib/atelier/refrain.test.ts — fidelity to the records, structural never counted.
//
// Two register: synthetic fixtures pin the parsing conventions (every heading variant the
// real TRACE uses), and the real mirrored records are read from disk so growth upstream can
// never turn this gate red — assertions DERIVE their expectations from the same file the
// parser reads (the 2026-08-01/02 lesson: a pinned total blocked publication for six runs).
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildRefrainModel,
  buildRefrainSvg,
  isWorkLine,
  parseTrace,
  readAspect,
  readDeferral,
  refrainRows,
  VOICES,
  type RefrainSource,
} from './refrain'

const PROJECTS = fileURLToPath(new URL('../../content/atelier/projects', import.meta.url))

const WORDING = {
  unreadLine: 'no aspect reading in this move’s record',
  openedLine: 'opened',
  deferredPrefix: 'deferred —',
  noneLine: '—',
  compostLine: 'compost in',
}
const VOICE_LABELS = { territory: 'territory', home: 'home', opening: 'opening' } as const

const RENDER = { voiceLabels: VOICE_LABELS, unreadLine: WORDING.unreadLine, motifLabel: 'motif' }

// ——— the heading variants the real TRACE actually uses ————————————————————————
const FIXTURE = `# Trace — test-line

## Tick 1 — 2026-07-23 — initiation (construct)

**Pre-opening check logged (P1).** Home aspect dominates; no opening attempted; opening
deferred until the construct stands.

## Tick 2 — 2026-07-24 (home operation; the decisive caption-strip test)

The check applied. Dominant aspect: **home**. No outward move was made. The value ϖ/σ_ϖ
recurs here.

## Compost in — 2026-07-25 — from the encounter line \`2026-07-25-signature-in-the-world\`

Material arrives; nothing is operated.

## Tick 3 — 2026-07-28 — Opening: the candidate is assembled

**Pre-opening check (§4).** Dominant aspect: **opening**. The point is self-created.

## Tick 4 — 2026-07-30 — Home operation: a tick that states no reading

Nothing in this section names an aspect, and deferring judgment on that would have been
wrong either way.

## Tick 5 — 2026-07-30 — Home operation: line-status form only

**Line status.** ACTIVE, open horizon, aspect territory. An outward move was genuinely
available this tick and is being deferred by decision.
`

const SOURCE: RefrainSource = {
  id: 'test-line',
  trace: FIXTURE,
  score: '---\ntitle: "A test line"\nkind: work-line\nrefrain_aspect: territory  # set by review\n---\n',
  motifs: ['ϖ/σ_ϖ'],
}

describe('parseTrace — the conventions, one fixture per variant', () => {
  const events = parseTrace(FIXTURE, ['ϖ/σ_ϖ'])
  const tick = (n: number) => events.find((e) => e.n === n)!

  it('finds one event per heading, in record order, nothing invented', () => {
    expect(events.map((e) => e.kind)).toEqual(['tick', 'tick', 'compost', 'tick', 'tick', 'tick'])
    expect(events.filter((e) => e.kind === 'tick').map((e) => e.n)).toEqual([1, 2, 3, 4, 5])
  })

  it('reads the em-dash form, the parenthesis form and the compost heading', () => {
    expect(tick(1).title).toContain('initiation')
    expect(tick(2).title).toContain('home operation; the decisive caption-strip test')
    expect(events[2].date).toBe('2026-07-25')
  })

  it('reads the date-first heading the encounter line uses', () => {
    const alt = parseTrace('## 2026-07-25 — Tick 1: the first move (territory)\n\nDominant aspect: **territory**.\n')
    expect(alt).toHaveLength(1)
    expect(alt[0]).toMatchObject({ kind: 'tick', n: 1, date: '2026-07-25', aspect: 'territory' })
  })

  it('reads all three aspect statement forms, each with its verbatim sentence', () => {
    expect(tick(1).aspect).toBe('home') // "Home aspect dominates"
    expect(tick(1).aspectQuote).toContain('Home aspect dominates')
    expect(tick(2).aspect).toBe('home') // "Dominant aspect: **home**"
    expect(tick(2).aspectQuote).toContain('Dominant aspect: home')
    expect(tick(5).aspect).toBe('territory') // "aspect territory" in the line status
  })

  it('a tick without a reading is an honest gap — null, never inherited from the previous tick', () => {
    expect(tick(4).aspect).toBeNull()
    expect(tick(4).aspectQuote).toBeNull()
  })

  it('reads a stated deferral verbatim, and refuses the subjunctive', () => {
    expect(tick(1).deferral).toContain('opening deferred until the construct stands')
    expect(tick(4).deferral).toBeNull() // "would have been wrong" is not a decision
    expect(tick(5).deferral).toContain('being deferred by decision')
  })

  it('classifies an opening only when the title leads with it', () => {
    expect(events.map((e) => e.opening)).toEqual([false, false, false, true, false, false])
  })

  it('motifs are literal matches of the declared list — nothing fuzzy', () => {
    expect(tick(2).motifs).toEqual(['ϖ/σ_ϖ'])
    expect(tick(1).motifs).toEqual([])
  })
})

describe('readAspect / readDeferral — the sentence is the evidence', () => {
  it('quotes the whole sentence around the reading', () => {
    const r = readAspect('Before. Dominant aspect: **home**. After.')
    expect(r).toEqual({ aspect: 'home', quote: 'Dominant aspect: home.' })
  })

  it('returns null rather than guessing from weaker phrasing', () => {
    expect(readAspect('The line felt like home this week.')).toBeNull()
    expect(readDeferral('No deferral languague here at all.')).toBeNull()
  })
})

describe('buildRefrainModel — the score keeps the refrain’s shape', () => {
  const model = buildRefrainModel(SOURCE)

  it('always carries all three staves — the Gantt reading is structurally impossible', () => {
    expect(model.staves.map((s) => s.voice)).toEqual([...VOICES])
  })

  it('one column per event; every column addresses every voice in the SVG', () => {
    expect(model.columns).toHaveLength(6)
    const svg = buildRefrainSvg(model, RENDER)
    for (const col of model.columns) {
      const block = svg.slice(svg.indexOf(`data-key="${col.key}"`))
      const columnBlock = block.slice(0, block.indexOf('</g>'))
      for (const voice of VOICES) expect(columnBlock).toContain(`data-voice="${voice}"`)
    }
  })

  it('marks real silence as a caesura with its length — the hole carries', () => {
    // fixture: 25 Jul → 28 Jul is a 3-day gap; 28 → 30 is 2 days; same-day gets none
    expect(model.gaps.map((g) => g.days)).toEqual([3, 2])
  })

  it('same-day ticks cluster: no date label repeats, the axis prints each date once', () => {
    const labels = model.axis.map((a) => a.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('reads the line’s current aspect from SCORE frontmatter, comment stripped', () => {
    expect(model.line.currentAspect).toBe('territory')
    expect(model.line.title).toBe('A test line')
  })

  it('recognises a work-line by its declared kind, not by guessing', () => {
    expect(isWorkLine(SOURCE.score)).toBe(true)
    expect(isWorkLine('---\ntitle: x\n---\n')).toBe(false)
  })
})

describe('the SVG — notation, not decoration', () => {
  const model = buildRefrainModel(SOURCE)
  const svg = buildRefrainSvg(model, RENDER)

  it('a deferred opening is a notated rest on the opening stave', () => {
    expect(svg).toContain('rf-rest')
    expect((svg.match(/rf-rest/g) ?? []).length).toBe(2) // ticks 1 and 5 defer
  })

  it('an opening event wears its ring; compost enters as a tie; motifs sit in their row', () => {
    expect(svg).toContain('rf-opening-event')
    expect(svg).toContain('rf-compost')
    expect(svg).toContain('rf-motif')
  })

  it('an unread tick is visible and claims nothing', () => {
    expect(svg).toContain('data-unread')
    expect(svg).toContain('rf-unread')
  })

  it('every column carries a native title with date and reading', () => {
    expect(svg).toContain('28 Jul — tick 3 — dominant aspect: opening')
    expect(svg).toContain(WORDING.unreadLine)
  })

  it('a still strips the interaction hooks', () => {
    const still = buildRefrainSvg(model, { ...RENDER, still: true })
    expect(still).not.toContain('tabindex')
    expect(still).not.toContain('role="button"')
  })
})

describe('the table floor — everything a hover shows, in rows', () => {
  const model = buildRefrainModel(SOURCE)
  const rows = refrainRows(model, WORDING)

  it('carries the verbatim aspect sentence, the honest gap, and the deferral whole', () => {
    // event order: tick1, tick2, compost, tick3, tick4, tick5
    expect(rows[1].aspect).toContain('Dominant aspect: home')
    expect(rows[4].aspect).toBe(WORDING.unreadLine)
    expect(rows[5].opening).toContain('deferred — ')
    expect(rows[2].operation).toBe('compost in')
  })
})

// ——— the real records — fidelity derived from the same files the site mirrors ————————
describe('the real records — the score says what the practice wrote, or it says nothing', () => {
  const lines = existsSync(PROJECTS)
    ? readdirSync(PROJECTS, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .map((d) => d.name)
        .filter((id) => {
          const score = `${PROJECTS}/${id}/SCORE.md`
          const trace = `${PROJECTS}/${id}/TRACE.md`
          return existsSync(score) && existsSync(trace) && isWorkLine(readFileSync(score, 'utf8'))
        })
    : []

  it('finds at least the first work-line (the transition clause’s own declaration)', () => {
    expect(lines).toContain('2026-07-23-negative-parallax')
  })

  it.each(lines)('%s: one event per TRACE heading — nothing dropped, nothing invented', (id) => {
    const trace = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
    const headings = trace
      .split('\n')
      .filter((l) =>
        /^## (Tick \d+ — \d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2} — Tick \d+:|Compost in — \d{4}-\d{2}-\d{2})/.test(l),
      )
    const events = parseTrace(trace)
    expect(events).toHaveLength(headings.length)
    // every event's date really stands in its own heading — order preserved
    events.forEach((e, i) => expect(headings[i]).toContain(e.date))
  })

  it.each(lines)('%s: every aspect reading stands on a quotable sentence', (id) => {
    const trace = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
    for (const e of parseTrace(trace)) {
      if (e.aspect !== null) {
        expect(e.aspectQuote, `tick ${e.n} quote`).toBeTruthy()
        expect(e.aspectQuote!.toLowerCase()).toContain(e.aspect)
      }
    }
  })

  it.each(lines)('%s: the model builds, keeps all three staves, and grows without breaking', (id) => {
    const trace = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
    const score = readFileSync(`${PROJECTS}/${id}/SCORE.md`, 'utf8')
    const model = buildRefrainModel({ id, trace, score })
    expect(model.staves).toHaveLength(3)
    // No floor on the column count: a line whose TRACE uses a convention the parser does not
    // know yields zero columns, honestly — the data module skips it rather than inventing.
    // Synthetic growth: one more tick appended — exactly one more column, nothing invented.
    const grown = buildRefrainModel({
      id,
      trace: `${trace}\n## Tick 999 — 2027-01-01 — Home operation: growth fixture\n\nDominant aspect: **home**.\n`,
      score,
    })
    expect(grown.columns.length).toBe(model.columns.length + 1)
  })

  it('the first work-line reads as the record states: aspects present, deferrals found', () => {
    if (!lines.includes('2026-07-23-negative-parallax')) return
    const trace = readFileSync(`${PROJECTS}/2026-07-23-negative-parallax/TRACE.md`, 'utf8')
    const events = parseTrace(trace, ['ϖ/σ_ϖ'])
    const withAspect = events.filter((e) => e.aspect !== null)
    // structural, not a count: most of this line's ticks state their aspect in one of the
    // three conventions; if the parser suddenly reads none, it broke — the record didn't
    expect(withAspect.length).toBeGreaterThan(events.length / 2)
    expect(events.some((e) => e.deferral !== null)).toBe(true)
    expect(events.some((e) => e.motifs.length > 0)).toBe(true)
    expect(events.some((e) => e.opening)).toBe(true)
  })
})

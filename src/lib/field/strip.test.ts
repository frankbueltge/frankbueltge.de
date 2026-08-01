// Determinism + honesty guard for the Field's Messprotokoll generators. Guards the
// approved grammar formulas (resting pen), the honest quiet-day rule (the flat line is
// drawn, never dropped), and the pure day-range arithmetic (no clock).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FIELD_GRAMMAR } from '@/config/field-wording'
import {
  CLAIM_CEILINGS,
  buildControlSvg,
  buildStripSvg,
  dayRange,
  envelopeBand,
  ladderRungs,
  mmGrid,
  plateSpan,
  type ControlInput,
  type StripInput,
} from './strip'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

describe('approved field grammar (static formulas, test-protected)', () => {
  it('keeps the data-edge formula verbatim', () => {
    expect(FIELD_GRAMMAR.dataEdge).toBe('the pen has not lifted')
    expect(FIELD_GRAMMAR.dataEdgeLines).toEqual(['the pen has not lifted —', 'the tape runs on'])
    expect(FIELD_GRAMMAR.stripH1).toBe('The pen has not lifted.')
  })

  it('keeps the plate rail exactly as designed', () => {
    expect(FIELD_GRAMMAR.rail.map((r) => r.label)).toEqual([
      'this instrument',
      'instruments',
      'register',
      'journal',
      'apparatus',
    ])
    expect(FIELD_GRAMMAR.door.label).toBe('→ the middle')
  })
})

describe('dayRange', () => {
  it('is inclusive and continuous across a month boundary', () => {
    expect(dayRange('2026-06-29', '2026-07-02')).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ])
  })

  it('refuses a reversed range', () => {
    expect(() => dayRange('2026-07-02', '2026-07-01')).toThrow(/lies before/)
  })
})

const stripInput: StripInput = {
  days: [
    { date: '2026-07-01', sessions: 3 },
    { date: '2026-07-02', sessions: 0 },
    { date: '2026-07-03', sessions: 1 },
  ],
  stamps: [
    { session: 1, date: '2026-07-01', move: 'build', note: 'built a thing' },
    { session: null, date: '2026-07-01', move: 'verify', note: 'checked a thing' },
    { session: 2, date: '2026-07-03', move: 'steer', note: 'steered' },
  ],
  instruments: [{ date: '2026-07-01', count: 2 }],
  flag: { date: '2026-07-01', note: 'contract published' },
  obligationLabel: 'caveat-preservation — active',
  splice: { date: '2026-07-02', note: 'history rewritten' },
  patch: { date: '2026-07-01', note: 'entry restored verbatim' },
  calibrationNote: 'calibration marks not mirrored',
  traceLabel: FIELD_GRAMMAR.marginLabels.trace,
  dataEdgeLines: FIELD_GRAMMAR.dataEdgeLines,
  stampsLabel: ['move stamps ·', 'chronicle S1–S2'],
}

describe('buildStripSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    expect(buildStripSvg(stripInput)).toBe(buildStripSvg(structuredClone(stripInput)))
  })

  it('keeps quiet days on the tape as a flat line (never removed)', () => {
    const svg = buildStripSvg(stripInput)
    // the trace polyline carries one point per day, including the zero day at the baseline
    const points = svg.match(/<polyline class="trace" points="([^"]+)"/)?.[1] ?? ''
    expect(points.split(' ').length).toBe(stripInput.days.length + 2) // lead-in + days + pen tail
    expect(points).toContain(',460.0') // the quiet day sits at BASE_Y
  })

  it('stamps every chronicled move and letters it with the move initial', () => {
    const svg = buildStripSvg(stripInput)
    expect(svg.match(/class="stamp"/g) ?? []).toHaveLength(stripInput.stamps.length)
    expect(svg).toContain('>B</text>')
    expect(svg).toContain('>V</text>')
  })

  it('draws the resting pen with the approved wording', () => {
    const svg = buildStripSvg(stripInput)
    expect(svg).toContain(FIELD_GRAMMAR.dataEdgeLines[0])
    expect(svg).toContain(FIELD_GRAMMAR.dataEdgeLines[1])
    expect(svg.match(/class="pen"/g) ?? []).toHaveLength(1)
  })

  it('names the missing calibration dates instead of drawing invented ticks', () => {
    const svg = buildStripSvg(stripInput)
    expect(svg).toContain('calibration marks not mirrored')
    expect(svg).not.toContain('class="eich"')
  })

  it('refuses dates that are not on the tape', () => {
    expect(() =>
      buildStripSvg({ ...stripInput, splice: { date: '2026-08-01', note: 'x' } }),
    ).toThrow(/not on the tape/)
  })
})

const controlInput: ControlInput = {
  days: dayRange('2026-07-01', '2026-07-05'),
  marks: [
    { date: '2026-07-01', label: 'built — the instrument enters service', kind: 'instr' },
    { date: '2026-07-03', label: 'contract published', kind: 'flag' },
    { date: '2026-07-04', label: 'correction arrives from outside', kind: 'splicein' },
    { date: '2026-07-04', label: 'correction applied', kind: 'stamp', letter: 'S' },
  ],
  obligation: { fromDate: '2026-07-03', label: 'caveat-preservation — active' },
  penLabel: 'in service',
}

describe('buildControlSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    expect(buildControlSvg(controlInput)).toBe(buildControlSvg(structuredClone(controlInput)))
  })

  it('draws every mark with its verbatim label in the hover title', () => {
    const svg = buildControlSvg(controlInput)
    for (const m of controlInput.marks) expect(svg).toContain(m.label)
    expect(svg).toContain('from outside ↓')
    expect(svg).toContain('in service')
  })

  it('draws the standing obligation as a line to the pen', () => {
    const svg = buildControlSvg(controlInput)
    expect(svg.match(/class="obl-f"/g) ?? []).toHaveLength(1)
    expect(svg).toContain('caveat-preservation — active')
  })

  it('renders a single-day plate (a work shipped today) instead of failing the build', () => {
    // The 2026-07-24 red: the featured instrument's committed date was the newest mark date,
    // so dayRange collapsed to one day and the old <2 guard took /field down with it.
    const oneDay: ControlInput = {
      days: dayRange('2026-07-24', '2026-07-24'),
      marks: [
        { date: '2026-07-24', label: 'built — the instrument enters service', kind: 'instr' },
        { date: '2026-07-24', label: 'S59 — ship: graduated', kind: 'stamp', letter: 'S' },
      ],
      penLabel: 'in service',
    }
    const svg = buildControlSvg(oneDay)
    expect(svg).toContain('built — the instrument enters service')
    expect(svg.match(/class="stamp"/g) ?? []).toHaveLength(1)
    expect(svg).toContain('in service')
    expect(svg.match(/class="pen"/g) ?? []).toHaveLength(1)
  })

  it('refuses only the empty plate', () => {
    expect(() => buildControlSvg({ days: [], marks: [], penLabel: 'in service' })).toThrow(
      /need at least one day/,
    )
  })
})

describe('the plate carries focus state only once a caller keys its marks', () => {
  it('renders unkeyed marks exactly as it always did — no data attributes, tabindex kept', () => {
    const svg = buildControlSvg(controlInput)
    expect(svg).toContain('<g class="evt2" tabindex="0">')
    expect(svg).not.toContain('data-key=')
    expect(svg).not.toContain('data-on=')
  })

  it('keys, filters, dims and selects a keyed plate', () => {
    const keyed: ControlInput = {
      ...controlInput,
      marks: controlInput.marks.map((m, i) => ({ ...m, key: `m${i}` })),
      focus: { filter: ['instr'], dim: ['m1'], select: 'm2' },
    }
    const svg = buildControlSvg(keyed)
    expect(svg).toContain('data-key="m0" data-on=""')
    // m1 is a flag, so the instr-only filter leaves it off — and it is dimmed on top
    expect(svg).toContain('data-key="m1" data-dim=""')
    expect(svg).toContain('data-key="m2" data-sel=""')
    expect(svg.match(/data-on=""/g) ?? []).toHaveLength(1)
  })

  it('a still has no tab stops — the live figure beside it owns the keyboard', () => {
    const still = buildControlSvg({ ...controlInput, still: true, svgId: 'still-1' })
    expect(still).not.toContain('tabindex')
    expect(still).toContain('id="still-1"')
  })

  it('crops the viewBox to its marks only when asked — the entry plate is untouched', () => {
    expect(buildControlSvg(controlInput)).toContain('viewBox="0 210 1440 330"')
    const fitted = buildControlSvg({ ...controlInput, fitToMarks: true })
    expect(fitted).toContain('viewBox="220 210 568 330"')
  })

  it('is still pure with focus applied', () => {
    const keyed: ControlInput = { ...controlInput, marks: controlInput.marks.map((m, i) => ({ ...m, key: `m${i}` })), focus: { select: 'm0' } }
    expect(buildControlSvg(keyed)).toBe(buildControlSvg(structuredClone(keyed)))
  })
})

describe('envelopeBand — an admissible region, drawn so it survives forced-colors', () => {
  it('washes the band in INK, never a colour fill, and keeps a dashed edge on both sides', () => {
    const band = envelopeBand({ x0: 10, x1: 210, yTop: 40, yBottom: 120, label: 'ordinary drift' })
    expect(band).toContain('class="env-wash"')
    expect(band).toContain('class="env-edge" d="M10 40 H210 M10 120 H210"')
    expect(band).toContain('ordinary drift')
    // the wash is a plain rect whose opacity lives in the stylesheet — no fill attribute here
    expect(band).not.toMatch(/fill="/)
  })

  it('letters the label above the band when asked', () => {
    expect(envelopeBand({ x0: 0, x1: 10, yTop: 40, yBottom: 60, label: 'x', labelAt: 'above' })).toContain('y="32"')
    expect(envelopeBand({ x0: 0, x1: 10, yTop: 40, yBottom: 60, label: 'x' })).toContain('y="55"')
  })

  it('refuses a degenerate or inverted band rather than drawing nothing visible', () => {
    expect(() => envelopeBand({ x0: 10, x1: 10, yTop: 0, yBottom: 10 })).toThrow(/must lie right of/)
    expect(() => envelopeBand({ x0: 0, x1: 10, yTop: 100, yBottom: 40 })).toThrow(/must lie below/)
  })

  it('is pure', () => {
    const input = { x0: 0, x1: 100, yTop: 10, yBottom: 50, label: 'a' }
    expect(envelopeBand(input)).toBe(envelopeBand({ ...input }))
  })
})

describe('ladderRungs — the runtime’s claim-language ceiling, not a ladder this site invented', () => {
  it('carries the seven ceilings of the committed runtime spec, in its own order', () => {
    // The vocabulary is copied from the spec, so the test reads the spec: if the runtime ever
    // re-orders or renames a ceiling, this fails instead of the site quietly drawing a stale ladder.
    const spec = readFileSync(
      `${ROOT}docs/meridian-research-runtime-spec-v0.2.0/MERIDIAN_RESEARCH_RUNTIME_SPEC_v0.2.0.md`,
      'utf8',
    )
    expect(spec).toContain('### 5.1 Claim-language ceiling')
    expect(spec).toContain(CLAIM_CEILINGS.join('\n'))
  })

  it('marks the ruled rung and everything weaker as permitted', () => {
    const rungs = ladderRungs('associational_unadjusted', { top: 100, step: 40 })
    expect(rungs).toHaveLength(7)
    expect(rungs.filter((r) => r.ruled).map((r) => r.ceiling)).toEqual(['associational_unadjusted'])
    expect(rungs.filter((r) => r.permitted).map((r) => r.ceiling)).toEqual([
      'associational_unadjusted',
      'descriptive',
      'mechanism_hypothesis',
      'insufficient_evidence',
    ])
    expect(rungs.map((r) => r.y)).toEqual([100, 140, 180, 220, 260, 300, 340])
  })

  it('the weakest ceiling permits only itself; the strongest permits the whole ladder', () => {
    const weakest = ladderRungs('insufficient_evidence', { top: 0, step: 10 })
    expect(weakest.filter((r) => r.permitted).map((r) => r.ceiling)).toEqual(['insufficient_evidence'])
    expect(ladderRungs('causal_bounded', { top: 0, step: 10 }).every((r) => r.permitted)).toBe(true)
  })

  it('refuses a ceiling outside the vocabulary instead of inventing a rung for it', () => {
    expect(() => ladderRungs('probably_fine', { top: 0, step: 10 })).toThrow(/not one of the runtime/)
  })
})

describe('mmGrid', () => {
  it('draws the millimetre paper with every fifth line major', () => {
    const g = mmGrid(0, 30.4, 0, 30.4)
    expect(g.match(/class="gridline"/g) ?? []).toHaveLength(4)
    expect(g.match(/class="gridmajor"/g) ?? []).toHaveLength(2)
  })
})

describe('plateSpan', () => {
  it('spans from the earliest mark to the latest of marks and as_of — a mark before the committed date widens the plate', () => {
    // the real 017 shape after its chronicle build stamp: built 07-24, stamps 07-23 (build) and
    // 07-24 (ship), ledger as_of 07-22 — the plate must carry the 07-23 stamp, not throw on it
    expect(plateSpan('2026-07-24', ['2026-07-23', '2026-07-24'], '2026-07-22')).toEqual([
      '2026-07-23',
      '2026-07-24',
    ])
  })

  it('yields the legitimate one-day span for a work shipped today', () => {
    expect(plateSpan('2026-07-24', ['2026-07-24'], '2026-07-22')).toEqual(['2026-07-24'])
  })

  it('extends to a later as_of', () => {
    expect(plateSpan('2026-07-20', ['2026-07-20'], '2026-07-22')).toEqual([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
    ])
  })
})

// Determinism + honesty guard for the Field's Messprotokoll generators. Guards the
// approved grammar formulas (resting pen), the honest quiet-day rule (the flat line is
// drawn, never dropped), and the pure day-range arithmetic (no clock).
import { describe, expect, it } from 'vitest'
import { FIELD_GRAMMAR } from '@/config/field-wording'
import { buildControlSvg, buildStripSvg, dayRange, type ControlInput, type StripInput } from './strip'

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
})

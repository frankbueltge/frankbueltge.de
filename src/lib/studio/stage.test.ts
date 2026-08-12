// Determinism + fidelity guard for the Bühne/Abendzettel generators. Guards the approved
// grammar formulas (data edge, marquee, Gasse, the counting formulas that reproduce the
// design session's own lines for its own counts) and the kill discipline: the floor keeps
// every mark, reasons verbatim, and past the taped slots the generator refuses instead of
// silently re-laying out.
import { describe, expect, it } from 'vitest'
import { STUDIO_GRAMMAR } from '@/config/studio-wording'
import stageData from '@/data/studio/stage.curated.json'
import { buildPlaybill, buildStageSvg, roman, type StageInput } from './stage'

describe('approved studio grammar (static formulas, test-protected)', () => {
  it('keeps the data-edge formulas verbatim', () => {
    expect(STUDIO_GRAMMAR.dataEdge).toBe('the next bill is not yet printed')
    expect(STUDIO_GRAMMAR.playbillEdge).toBe('The house plays nightly — the next bill is not yet printed.')
  })

  it('keeps the marquee and the Gasse label verbatim (static, nothing blinks)', () => {
    expect(STUDIO_GRAMMAR.marquee).toBe('LIVE STATUS TRAVELS · OBLIGATION ACTIVE')
    expect(STUDIO_GRAMMAR.gasseLabel).toBe('DIE GASSE · OFFSTAGE — VISIBLE, UNLIT')
  })

  // The design session's four doors, plus 'journal' (added 2026-08-01, Etappe 2). The journal
  // room is new: the house's unedited record used to hang at the foot of the playbill with no
  // address of its own, which is exactly why that page had become the longest wall of text in
  // the ecology. Both sibling practices carry this door; the studio now does too. Structural
  // addition, not a rewording — the four approved labels are unchanged and still in order.
  it('keeps the stage rail exactly as designed (v3 pyramid 2026-08-12: the station, then its registers)', () => {
    // The playbill and apparatus rooms were folded into the station sheet by the v3 rebuild
    // (docs/design_handoff_research_ecology/README.md); both routes 301 to it.
    expect(STUDIO_GRAMMAR.rail.map((r) => r.label)).toEqual([
      'the station',
      'works',
      'journal',
      'constitution',
      'team channel',
    ])
    expect(STUDIO_GRAMMAR.door.label).toBe('→ the middle')
  })

  it('reproduces the design session’s own lines for its own counts', () => {
    expect(STUDIO_GRAMMAR.stageHeadline(1, 7)).toBe('One work is on. Seven are struck.')
    expect(STUDIO_GRAMMAR.strikeNote(7)).toBe('seven positions struck — the floor keeps every mark')
    expect(STUDIO_GRAMMAR.playbillHeadline(2, 12)).toBe('Two evenings. Twelve sessions.')
    expect(STUDIO_GRAMMAR.eveningLabel(1)).toBe('Erster Abend')
    expect(STUDIO_GRAMMAR.eveningLabel(2)).toBe('Zweiter Abend')
    expect(STUDIO_GRAMMAR.eveningLabel(3)).toBe('Dritter Abend')
  })
})

const input: StageInput = {
  premiere: {
    title: 'NATIVE SPEAKER',
    metaLine: 'premiered 2026-07-13 · session 10 · “The first premiere of the house.”',
    hover: 'the full ship summary, verbatim',
    quote: 'Live status travels; load-bearing caveats survive re-voicing; corrections flow upstream, never silently sideways',
    attribution: 'the work’s own admission contract, session 07 (enc-2026-001, verbatim)',
  },
  marquee: STUDIO_GRAMMAR.marquee,
  kills: (stageData.kills as { name: string; session: string; reason: string }[]).map(
    ({ name, session, reason }) => ({ name, session, reason }),
  ),
  gasse: [{ name: 'the declined case', sub: 'session 08', note: 'a note' }],
  strikeNote: STUDIO_GRAMMAR.strikeNote(stageData.kills.length),
  gasseLabel: STUDIO_GRAMMAR.gasseLabel,
  orientNote: 'the stage, seen from above — one spot lights what is public now',
}

describe('buildStageSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    expect(buildStageSvg(input)).toBe(buildStageSvg(structuredClone(input)))
  })

  it('draws exactly one spotlight and one X-mark per struck position, reasons verbatim', () => {
    const svg = buildStageSvg(input)
    expect(svg.match(/<ellipse /g) ?? []).toHaveLength(1)
    expect(svg.match(/class="xmark"/g) ?? []).toHaveLength(input.kills.length)
    for (const kill of input.kills) expect(svg).toContain(kill.reason.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'))
  })

  it('draws the light as a plot, not a glow: lamp on the bar, two beam hairlines, a hard-edged pool (2026-07-16 rework)', () => {
    const svg = buildStageSvg(input)
    expect(svg.match(/class="beamline"/g) ?? []).toHaveLength(2)
    expect(svg).toContain('class="spotpool"')
    expect(svg).toContain('class="lamp"')
    expect(svg).not.toContain('radialGradient')
    expect(svg).toContain(input.orientNote)
  })

  it('keeps the Gasse visible and the marquee static', () => {
    const svg = buildStageSvg(input)
    expect(svg).toContain(STUDIO_GRAMMAR.gasseLabel)
    expect(svg).toContain(STUDIO_GRAMMAR.marquee)
    expect(svg).not.toContain('<animate')
  })

  // Until 2026-07-31 this generator carried ten hand-placed X coordinates and THREW past them,
  // which is a build failure scheduled for the next kill the house records (seven were already
  // used). The slots are now derived — dataviz/geometry.ts's spiralLayout — so the floor keeps
  // every mark at any count, which is what "the floor keeps every mark" says it does. The
  // determinism the hand-written table used to give for free is now the thing under test.
  it('takes an eighth, a ninth and a twentieth strike without refusing', () => {
    for (const n of [8, 9, 20]) {
      const many = {
        ...input,
        kills: Array.from({ length: n }, (_, i) => ({ name: `K${i}`, session: `S${i}`, reason: `reason ${i}` })),
      }
      expect(() => buildStageSvg(many)).not.toThrow()
      expect(buildStageSvg(many).match(/class="xmark"/g) ?? []).toHaveLength(n)
    }
  })

  it('derives the same pixels from the same data — a rebuild is never a re-layout', () => {
    const twenty = Array.from({ length: 20 }, (_, i) => ({ name: `K${i}`, session: `S${i}`, reason: `r${i}` }))
    expect(buildStageSvg({ ...input, kills: twenty })).toBe(buildStageSvg({ ...input, kills: [...twenty] }))
  })

  it('tapes no X outside the floor polygon and none across the lit pool', () => {
    const many = {
      ...input,
      kills: Array.from({ length: 20 }, (_, i) => ({ name: `K${i}`, session: `S${i}`, reason: `r${i}` })),
    }
    const svg = buildStageSvg(many)
    const centres = [...svg.matchAll(/class="xmark" d="M(-?[\d.]+) (-?[\d.]+) L/g)].map((m) => ({
      x: Number(m[1]) + 9,
      y: Number(m[2]) + 9,
    }))
    expect(centres).toHaveLength(20)
    for (const c of centres) {
      expect(c.x).toBeGreaterThanOrEqual(150)
      expect(c.x).toBeLessThanOrEqual(1230)
      expect(c.y).toBeGreaterThanOrEqual(226)
      expect(c.y).toBeLessThanOrEqual(642)
      // outside the spot's own ellipse (rx 300, ry 170 around 610/400)
      expect(Math.hypot((c.x - 610) / 300, (c.y - 400) / 170)).toBeGreaterThan(1)
    }
  })
})

describe('buildPlaybill', () => {
  const entries = [
    { collective_session: 1, date: '2026-07-12', move: 'other', summary: 'The founding session: things happened. More text.' },
    { collective_session: 2, date: '2026-07-12', move: 'steer', summary: 'A concept was KILLED at the gate. Details follow.' },
    { collective_session: 3, date: '2026-07-13', move: 'ship', summary: 'The first premiere of the house. Native Speaker passed the gate.' },
  ]

  it('groups by evening with the German bill labels and Roman session numerals', () => {
    const bill = buildPlaybill(entries, STUDIO_GRAMMAR.eveningLabel)
    expect(bill.map((e) => e.label)).toEqual(['Erster Abend', 'Zweiter Abend'])
    expect(bill[0].lines.map((l) => l.roman)).toEqual(['I', 'II'])
  })

  it('extracts the first sentence verbatim and marks kills', () => {
    const bill = buildPlaybill(entries, STUDIO_GRAMMAR.eveningLabel)
    expect(bill[0].lines[0].line).toBe('The founding session: things happened.')
    expect(bill[0].lines[1].kill).toBe(true)
  })

  it('sets the premiere as the centrepiece of its evening', () => {
    const bill = buildPlaybill(entries, STUDIO_GRAMMAR.eveningLabel)
    const ship = bill[1].lines[0]
    expect(ship.ship).toBe(true)
    expect(ship.premiere).toBe('The first premiere of the house.')
  })

  it('speaks Roman up to XX and falls back to digits beyond', () => {
    expect(roman(12)).toBe('XII')
    expect(roman(21)).toBe('21')
  })
})

// Determinism + fidelity guard for the Partitur generator (work order
// phase-c2-site-entrance-design.md §2, zeichengrammatik-2026-07-15.md §5
// "Determinismus-Vertrag": same score.json ⇒ byte-identical SVG). Uses the real, exported
// score.json fixture — not a hand-typed stand-in — so a future re-export that changes shape
// fails this test rather than silently rendering something else.
import { describe, expect, it } from 'vitest'
import scoreData from '@/data/begegnungen/enc-2026-001/score.json'
import { buildScoreSvg, type ScoreExport } from './score'

const score = scoreData as unknown as ScoreExport

describe('buildScoreSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    const a = buildScoreSvg(score)
    const b = buildScoreSvg(structuredClone(score))
    expect(a).toBe(b)
  })

  it('renders exactly one <g class="evt"> per ledger event, in ledger order', () => {
    const svg = buildScoreSvg(score)
    const ids = [...svg.matchAll(/data-i="(\d+)"/g)].map((m) => Number(m[1]))
    expect(ids).toEqual(score.events.map((_, i) => i))
  })

  it('carries the approved as-of-edge formula verbatim ("here ends what the ledger knows")', () => {
    const svg = buildScoreSvg(score)
    expect(svg).toContain('here ends what the ledger knows')
  })

  it('draws a divergence terminal with two open rings when leftLane/rightLane are present', () => {
    const svg = buildScoreSvg(score)
    expect(svg.match(/class="ring /g) ?? []).toHaveLength(2)
  })

  it('draws one flow arc per entry in score.flows', () => {
    const svg = buildScoreSvg(score)
    expect(svg.match(/class="flow /g) ?? []).toHaveLength(score.flows.length)
  })

  it('renders any event count (Zeit-Skalierung lens): a 3-event ledger draws 3 events', () => {
    const threeEvents: ScoreExport = { ...score, events: score.events.slice(0, 3) }
    const svg = buildScoreSvg(threeEvents)
    const ids = [...svg.matchAll(/data-i="(\d+)"/g)].map((m) => Number(m[1]))
    expect(ids).toEqual([0, 1, 2])
  })

  it('keeps the ported seven-event layout verbatim (count 7 returns the hand-placed slots)', () => {
    // score.json is the 7-event enc-2026-001 fixture; its graticule must still be drawn at the
    // ported x-positions, so generalising the geometry did not silently move the mockup.
    const svg = buildScoreSvg(score)
    for (const x of [340, 470, 600, 730, 860, 970, 1060]) {
      expect(svg).toContain(`<path class="grat" d="M${x} `)
    }
  })

  it('fails loud on an empty ledger rather than drawing an empty score', () => {
    const noEvents: ScoreExport = { ...score, events: [] }
    expect(() => buildScoreSvg(noEvents)).toThrow(/no ledger events/)
  })
})

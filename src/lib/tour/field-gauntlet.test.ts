// The honesty harness, wired to the real filesystem: every quote in the Field's guided tour must be
// a byte-exact substring of the committed file it names. A scene whose quote cannot be verified is
// CUT, never paraphrased — so if this file ever fails, the fix is to find the real sentence or to
// drop the scene, not to soften the assertion.
//
// The tour crosses a line the wording canon draws (docs/wording-kanon.md, enc-2026-005): five
// scenes are the Meridian COLLECTIVE's record, the sixth is the Meridian Research Runtime — the
// architect's ENGINEERING LINE. The last describe block below is that rule as a test: the runtime's
// sources may only be quoted where the tour has said whose voice it is quoting.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/field/chronicle.upstream.json'
import meta018 from '@/components/field/werke/2026-07-25-no-signal-to-extend/meta.json'
import meta019 from '@/components/field/werke/2026-07-26-unable-to-ring-its-own-bell/meta.json'
import parallax from '@/data/meridian/parallax.json'
import { buildControlSvg } from '@/lib/field/strip'
import { verifyTourQuotes } from './verify'
import {
  GAUNTLET_FIGURE,
  GAUNTLET_MARKS,
  gauntletPlate,
  gauntletRows,
  gauntletTour,
  type GauntletChronicleEntry,
} from './field-gauntlet'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readFile = (path: string) => readFileSync(ROOT + path, 'utf8')

describe('the Field tour is verbatim or it is not shipped', () => {
  it('every quote is a byte-exact substring of the file it names', () => {
    const violations = verifyTourQuotes(gauntletTour, readFile)
    expect(
      violations.map((v) => `${v.kind} @ ${v.sceneId ?? 'tour'} (${v.path ?? '—'}): ${v.message}`),
    ).toEqual([])
  })

  it('has the six scenes the tour promises, each with substance to back it', () => {
    expect(gauntletTour.scenes).toHaveLength(6)
    expect(gauntletTour.scenes.map((s) => s.id)).toEqual([
      'the-instrument-returns-a-null',
      'the-rig-turned-on-ourselves',
      'the-power-check-voids-the-null',
      'a-claim-is-withdrawn-at-review',
      'what-shipped',
      'the-dissent-stays',
    ])
    for (const scene of gauntletTour.scenes) {
      expect(scene.quotes.length, `scene ${scene.id} carries too little substance`).toBeGreaterThanOrEqual(3)
      for (const q of scene.quotes) expect(q.locator, `${scene.id} quote has no locator`).toBeTruthy()
    }
  })

  it('quotes only files it also declares as provenance', () => {
    for (const scene of gauntletTour.scenes) {
      for (const q of scene.quotes) {
        expect(gauntletTour.provenance, `${q.source} is quoted but not declared`).toContain(q.source)
      }
    }
  })

  it('makes no claim in its own frame copy — the numbers are all inside quotes', () => {
    for (const scene of gauntletTour.scenes) {
      const frame = `${scene.kicker} ${scene.heading} ${scene.lead ?? ''}`
      expect(frame, `scene ${scene.id} states a figure in un-checkable prose`).not.toMatch(/\d/)
    }
  })
})

describe('every scene focuses a mark the plate really draws', () => {
  const plate = gauntletPlate({
    chronicle: chronicleUpstream as unknown as GauntletChronicleEntry[],
    instrument018: meta018,
    instrument019: meta019,
    parallax,
  })
  const keys = new Set(plate.marks.map((m) => m.key))
  const kinds = new Set(plate.marks.map((m) => m.kind))

  it('names the same figure in every scene', () => {
    for (const s of gauntletTour.scenes) expect(s.focus.figure).toBe(GAUNTLET_FIGURE)
  })

  it('every focused, dimmed and filtered key exists on the plate', () => {
    for (const mark of Object.values(GAUNTLET_MARKS)) expect(keys.has(mark), `plate lacks ${mark}`).toBe(true)
    for (const s of gauntletTour.scenes) {
      if (s.focus.select) expect(keys.has(s.focus.select), `${s.id}: select`).toBe(true)
      for (const d of s.focus.dim ?? []) expect(keys.has(d), `${s.id}: dim ${d}`).toBe(true)
      for (const f of s.focus.filter ?? []) expect(kinds.has(f as never), `${s.id}: filter ${f}`).toBe(true)
    }
  })

  it('the last scene lifts the filter so the whole plate reads at once', () => {
    const last = gauntletTour.scenes[gauntletTour.scenes.length - 1]
    // null, not undefined: FocusState distinguishes "clear the filter" from "don't touch it"
    expect(last.focus.filter).toBeNull()
    // and it lands on the claim the figure below the tour opens up
    expect(last.focus.select).toBe(GAUNTLET_MARKS.claim)
  })

  it('walks the record in the order the record puts it', () => {
    const dateOf = (key: string) => plate.marks.find((m) => m.key === key)!.date
    const selected = gauntletTour.scenes.map((s) => s.focus.select!).slice(0, 5)
    const dates = selected.map(dateOf)
    expect([...dates]).toEqual([...dates].sort())
  })
})

describe('the plate is derived from the record, not typed out', () => {
  const plate = gauntletPlate({
    chronicle: chronicleUpstream as unknown as GauntletChronicleEntry[],
    instrument018: meta018,
    instrument019: meta019,
    parallax,
  })

  it('spans the committed dates, from the export to one clear day past the shipped instrument', () => {
    expect(plate.days[0]).toBe(parallax.export_meta.date_published.slice(0, 10))
    // the field's data edge is a resting pen AFTER the record, not one sitting on the last glyph
    expect(plate.days.at(-2)).toBe(meta019.date)
    expect(plate.days.at(-1)).toBe('2026-07-27')
    for (const m of plate.marks) expect(plate.days).toContain(m.date)
  })

  it('labels the session marks with the chronicle’s own move lines, verbatim', () => {
    const s66 = plate.marks.find((m) => m.key === GAUNTLET_MARKS.session66)!
    const entry = (chronicleUpstream as unknown as GauntletChronicleEntry[]).find((e) => e.collective_session === 66)!
    expect(s66.label).toContain(entry.move)
  })

  it('carries the two instruments under their own committed titles', () => {
    expect(plate.marks.find((m) => m.key === GAUNTLET_MARKS.instrument018)!.label).toContain(meta018.title)
    expect(plate.marks.find((m) => m.key === GAUNTLET_MARKS.instrument019)!.label).toContain(meta019.title)
  })

  it('says the review cut in — never borrowing the entry plate’s “from outside”', () => {
    // the splice on /field is a correction arriving from ANOTHER PRACTICE; this one is the
    // collective's own adversarial review, and the margin word has to say so
    const svg = buildControlSvg(plate)
    expect(svg).toContain('the review cut in ↓')
    expect(svg).not.toContain('from outside ↓')
  })

  it('fails loud if a session the tour needs is missing from the mirror', () => {
    const thinned = (chronicleUpstream as unknown as GauntletChronicleEntry[]).filter(
      (e) => e.collective_session !== 66,
    )
    expect(() =>
      gauntletPlate({ chronicle: thinned, instrument018: meta018, instrument019: meta019, parallax }),
    ).toThrow(/collective session 66 is not in the chronicle/)
  })

  it('repeats every mark as a table row with a source', () => {
    const rows = gauntletRows(plate)
    expect(rows).toHaveLength(plate.marks.length)
    for (const r of rows) {
      expect(gauntletTour.provenance).toContain(r.source)
      expect(r.event.length).toBeGreaterThan(10)
    }
  })
})

describe('the collective and the engineering line stay apart', () => {
  const COLLECTIVE = [
    'src/data/field/chronicle.upstream.json',
    'src/components/field/werke/2026-07-25-no-signal-to-extend/meta.json',
    'src/components/field/werke/2026-07-26-unable-to-ring-its-own-bell/meta.json',
  ]

  it('scenes one to five quote the collective’s own record only', () => {
    for (const scene of gauntletTour.scenes.slice(0, 5)) {
      for (const q of scene.quotes) {
        expect(COLLECTIVE, `${scene.id} quotes the runtime without saying so: ${q.source}`).toContain(q.source)
      }
    }
  })

  it('the runtime is quoted only in the scene that names it as the engineering line', () => {
    const last = gauntletTour.scenes[gauntletTour.scenes.length - 1]
    expect(last.quotes.every((q) => !COLLECTIVE.includes(q.source))).toBe(true)
    expect(`${last.heading} ${last.lead ?? ''}`).toContain('engineering line')
  })
})

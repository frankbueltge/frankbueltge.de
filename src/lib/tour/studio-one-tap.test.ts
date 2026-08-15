// The honesty harness, wired to the real filesystem: every quote in the Studio's guided tour must
// be a byte-exact substring of the committed file it names. This is the test the tour engine was
// built for (verify.ts's own header: "each tour's own test calling verifyTourQuotes over its
// committed source files with fs.readFileSync"), and it is the reason a scene can be trusted
// without a reviewer re-checking five sessions of record by hand.
//
// A scene whose quote cannot be verified is CUT, never paraphrased — so if this file ever fails,
// the fix is to find the real sentence or to drop the scene, not to soften the assertion.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import { buildSeasonModel, type SeasonKill, type SeasonWorkMeta } from '@/lib/studio/season'
import { verifyTourQuotes } from './verify'
import { ONE_TAP_FIGURE, ONE_TAP_MARKS, oneTapTour } from './studio-one-tap'

/** Every work the mirror carries — read off the content directory, never listed here, so the floor
 *  this tour is checked against is the floor the site draws (2026-08-15: a hand-listed map kept
 *  five works while the house had six, and every scene was verified against a figure nobody sees). */
const STUDIO_METAS: Record<string, SeasonWorkMeta> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/content/studio/works/*/meta.json', { eager: true, import: 'default' }),
  ).map(([path, meta]) => [path.split('/').at(-2) as string, meta as SeasonWorkMeta]),
)

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readFile = (path: string) => readFileSync(ROOT + path, 'utf8')

describe('the Studio tour is verbatim or it is not shipped', () => {
  it('every quote is a byte-exact substring of the file it names', () => {
    const violations = verifyTourQuotes(oneTapTour, readFile)
    expect(
      violations.map((v) => `${v.kind} @ ${v.sceneId ?? 'tour'} (${v.path ?? '—'}): ${v.message}`),
    ).toEqual([])
  })

  it('has the five scenes the tour promises, each with substance to back it', () => {
    expect(oneTapTour.scenes).toHaveLength(5)
    expect(oneTapTour.scenes.map((s) => s.id)).toEqual([
      'the-premiere',
      'the-eye-returns-it',
      'the-third-return',
      'what-two-voices-found-unasked',
      'what-it-cost-and-what-it-bought',
    ])
    for (const scene of oneTapTour.scenes) {
      expect(scene.quotes.length, `scene ${scene.id} carries no quote`).toBeGreaterThanOrEqual(2)
      for (const q of scene.quotes) expect(q.locator, `${scene.id} quote has no locator`).toBeTruthy()
    }
  })

  it('quotes only files it also declares as provenance', () => {
    for (const scene of oneTapTour.scenes) {
      for (const q of scene.quotes) {
        expect(oneTapTour.provenance, `${q.source} is quoted but not declared`).toContain(q.source)
      }
    }
  })

  it('makes no claim in its own frame copy — the numbers are all inside quotes', () => {
    // The frame (kicker/heading/lead) is drafted prose in studio-wording.ts; if a number ever
    // migrates out of a quote and into the frame, it stops being checkable, so it is refused here.
    for (const scene of oneTapTour.scenes) {
      const frame = `${scene.kicker} ${scene.heading} ${scene.lead ?? ''}`
      expect(frame, `scene ${scene.id} states a figure in un-checkable prose`).not.toMatch(/\d/)
    }
  })
})

describe('every scene focuses a mark the season floor really builds', () => {
  const model = buildSeasonModel({
    chronicle: chronicleUpstream,
    metas: STUDIO_METAS,
    kills: stageData.kills as SeasonKill[],
  })
  const keys = new Set(model.marks.map((m) => m.key))
  const states = new Set(model.marks.map((m) => m.state))

  it('names the same figure in every scene', () => {
    for (const s of oneTapTour.scenes) expect(s.focus.figure).toBe(ONE_TAP_FIGURE)
  })

  it('every focused, dimmed and annotated key exists on the floor', () => {
    for (const mark of Object.values(ONE_TAP_MARKS)) expect(keys.has(mark)).toBe(true)
    for (const s of oneTapTour.scenes) {
      if (s.focus.select) expect(keys.has(s.focus.select), `${s.id}: select`).toBe(true)
      for (const d of s.focus.dim ?? []) expect(keys.has(d), `${s.id}: dim ${d}`).toBe(true)
      for (const a of s.focus.annotate ?? []) expect(keys.has(a.key), `${s.id}: annotate ${a.key}`).toBe(true)
      for (const f of s.focus.filter ?? []) expect(states.has(f as never), `${s.id}: filter ${f}`).toBe(true)
    }
  })

  it('the last scene lifts the filter so the whole season reads at once', () => {
    const last = oneTapTour.scenes[oneTapTour.scenes.length - 1]
    // null, not undefined: FocusState distinguishes "clear the filter" from "don't touch it"
    expect(last.focus.filter).toBeNull()
  })

  it('walks the returns in the order the record puts them', () => {
    const selects = oneTapTour.scenes.map((s) => s.focus.select)
    expect(selects.indexOf(ONE_TAP_MARKS.return2)).toBeLessThan(selects.indexOf(ONE_TAP_MARKS.return3))
  })
})

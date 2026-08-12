// The honesty harness, wired to the real filesystem: every quote in the Atelier's guided tour must
// be a byte-exact substring of the committed file it names. A scene whose quote cannot be verified
// is CUT, never paraphrased — so if this file ever fails, the fix is to find the real sentence or
// to drop the scene, not to soften the assertion.
//
// The second half checks the other thing a tour can silently get wrong: focusing a mark the figure
// does not draw. The passage model is built here from the SAME committed records the page builds it
// from, so a renamed line breaks a test rather than a scene.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import { readLedgerIndex } from '@/lib/atelier/ledger'
import { buildPassageModel } from '@/lib/atelier/passage'
import type { RohProjekt } from '@/lib/atelier/process'
import { verifyTourQuotes } from './verify'
import { PASSAGE_FIGURE, PIVOT_MARKS, pivotTour } from './atelier-pivot'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readFile = (path: string) => readFileSync(ROOT + path, 'utf8')

const PROJECTS = `${ROOT}src/content/atelier/projects`

const frontmatter = (raw: string, key: string): string =>
  raw.split('\n---')[0].match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'))?.[1]?.trim() ?? ''

function realProjects(): { projects: RohProjekt[]; decisions: Record<string, string> } {
  const projects: RohProjekt[] = []
  const decisions: Record<string, string> = {}
  for (const id of readdirSync(PROJECTS)) {
    const files = readdirSync(`${PROJECTS}/${id}`)
    const score = readFileSync(`${PROJECTS}/${id}/SCORE.md`, 'utf8')
    projects.push({
      id,
      title: frontmatter(score, 'title') || id,
      status: frontmatter(score, 'status'),
      disposition: frontmatter(score, 'disposition'),
      created: frontmatter(score, 'created'),
      dateien: files,
    })
    if (files.includes('DECISION.md')) {
      decisions[`/src/content/atelier/projects/${id}/DECISION.md`] = readFileSync(
        `${PROJECTS}/${id}/DECISION.md`,
        'utf8',
      )
    }
  }
  return { projects, decisions }
}

describe('the Atelier tour is verbatim or it is not shipped', () => {
  it('every quote is a byte-exact substring of the file it names', () => {
    const violations = verifyTourQuotes(pivotTour, readFile)
    expect(
      violations.map((v) => `${v.kind} @ ${v.sceneId ?? 'tour'} (${v.path ?? '—'}): ${v.message}`),
    ).toEqual([])
  })

  it('has the six scenes the tour promises, each with substance to back it', () => {
    expect(pivotTour.scenes).toHaveLength(6)
    expect(pivotTour.scenes.map((s) => s.id)).toEqual([
      'the-kill-condition',
      'the-raw-re-read',
      'clause-a-the-tooling-artefact',
      'clause-b-the-register-answers',
      'what-it-delivered-and-cost',
      'recorded-and-left',
    ])
    for (const scene of pivotTour.scenes) {
      expect(scene.quotes.length, `scene ${scene.id} carries no quote`).toBeGreaterThanOrEqual(2)
      for (const q of scene.quotes) expect(q.locator, `${scene.id} quote has no locator`).toBeTruthy()
    }
  })

  it('quotes only files it also declares as provenance', () => {
    for (const scene of pivotTour.scenes) {
      for (const q of scene.quotes) {
        expect(pivotTour.provenance, `${q.source} is quoted but not declared`).toContain(q.source)
      }
    }
  })

  it('makes no claim in its own frame copy — the numbers are all inside quotes', () => {
    // The frame (title/standfirst/kicker/heading/lead) is drafted prose in atelier-wording.ts; if a
    // number ever migrates out of a quote and into the frame, it stops being checkable.
    const frames = [
      `${pivotTour.title} ${pivotTour.standfirst}`,
      ...pivotTour.scenes.map((s) => `${s.kicker} ${s.heading} ${s.lead ?? ''}`),
    ]
    for (const frame of frames) {
      expect(frame, `frame copy states a figure in un-checkable prose: ${frame}`).not.toMatch(/\d/)
    }
  })

  it('reads the kill condition from the SCORE and the kill itself from the DECISION', () => {
    const sources = new Set(pivotTour.scenes.flatMap((s) => s.quotes.map((q) => q.source)))
    expect(sources).toContain('src/content/atelier/projects/2026-07-20-retraction-signature/SCORE.md')
    expect(sources).toContain('src/content/atelier/projects/2026-07-20-retraction-signature/DECISION.md')
  })

  it('quotes the very sentence the sheet prints in its own ledger gutter', () => {
    // The gutter and scene five must not be able to disagree about what this line cost.
    const { decisions } = realProjects()
    const gutter = readLedgerIndex(decisions)[PIVOT_MARKS.line].gutter
    const costScene = pivotTour.scenes.find((s) => s.id === 'what-it-delivered-and-cost')!
    const quoted = costScene.quotes.map((q) => q.text.replace(/\s*\n\s*/g, ' '))
    expect(quoted).toContain(gutter)
  })
})

describe('every scene focuses a line the passage really draws', () => {
  const { projects, decisions } = realProjects()
  const model = buildPassageModel({
    projects,
    journalIds: [],
    today: '2026-08-01',
    prose: {},
    ledgers: readLedgerIndex(decisions),
    harbours: ATELIER_NARRATIVE.passage.harbours,
  })
  const keys = new Set(model.lines.map((l) => l.key))
  const outcomes = new Set(model.lines.map((l) => l.outcome))

  it('names the same figure in every scene', () => {
    for (const s of pivotTour.scenes) expect(s.focus.figure).toBe(PASSAGE_FIGURE)
  })

  it('every selected, dimmed, annotated and filtered key exists on the sheet', () => {
    for (const mark of Object.values(PIVOT_MARKS)) expect(keys.has(mark)).toBe(true)
    for (const s of pivotTour.scenes) {
      if (s.focus.select) expect(keys.has(s.focus.select), `${s.id}: select`).toBe(true)
      for (const d of s.focus.dim ?? []) expect(keys.has(d), `${s.id}: dim ${d}`).toBe(true)
      for (const a of s.focus.annotate ?? []) expect(keys.has(a.key), `${s.id}: annotate ${a.key}`).toBe(true)
      for (const f of s.focus.filter ?? []) expect(outcomes.has(f as never), `${s.id}: filter ${f}`).toBe(true)
    }
  })

  it('holds the sheet on the killed line for every scene', () => {
    for (const s of pivotTour.scenes) expect(s.focus.select).toBe(PIVOT_MARKS.line)
  })

  it('the last scene lifts the filter so every harbour reads at once', () => {
    const last = pivotTour.scenes[pivotTour.scenes.length - 1]
    // null, not undefined: FocusState distinguishes "clear the filter" from "don't touch it"
    expect(last.focus.filter).toBeNull()
    for (const s of pivotTour.scenes.slice(0, -1)) expect(s.focus.filter).toEqual(['KILL'])
  })

  it('the line it walks really is a kill, and really carries a closing ledger', () => {
    const line = model.lines.find((l) => l.key === PIVOT_MARKS.line)!
    expect(line.outcome).toBe('KILL')
    expect(line.ledger).not.toBeNull()
    expect(line.ledger!.gutter).toContain('Budget closed at 2 of ≤ 4 ticks')
  })
})

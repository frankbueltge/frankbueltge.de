// src/lib/ecology/programme.ts — the ecology's research programme, read from the mirror (2026-11-08).
//
// Since the architect's decision of 2026-11-08 (wording private; docs/design/2026-11-08-the-programme.md)
// the ecology holds one large question for eight to twelve weeks, chosen by itself from a dossier of
// candidates, and every cycle is one step of its plan. research-ecology keeps the programme in
// programme/: QUESTION.md (the question and why it won), PLAN.md (the steps), STATE.md (what the
// ecology knows now that it did not know before) and selection/dossier.md (the candidates, scored).
// ecology-integrate.yml mirrors the folder verbatim to src/data/middle/programme/; /question renders
// it with the renderer of the lines, never rewritten.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderLine } from './research-lines'

export const PROGRAMME_DIR = 'src/data/middle/programme'
export const PROGRAMME_REPO = 'https://github.com/frankbueltge/research-ecology/tree/main/programme'

export type ProgrammePart = 'question' | 'plan' | 'state' | 'dossier'

export const PROGRAMME_FILES: Record<ProgrammePart, string> = {
  question: 'QUESTION.md',
  plan: 'PLAN.md',
  state: 'STATE.md',
  dossier: 'selection/dossier.md',
}

export interface ProgrammeDoc {
  part: ProgrammePart
  file: string
  html: string
}

/** The parts the mirror holds, in reading order: question, state, plan, dossier. */
export function loadProgrammeDocs(root: string = process.cwd()): ProgrammeDoc[] {
  const order: ProgrammePart[] = ['question', 'state', 'plan', 'dossier']
  return order.flatMap((part) => {
    const file = PROGRAMME_FILES[part]
    const path = join(root, PROGRAMME_DIR, file)
    if (!existsSync(path)) return []
    const source = readFileSync(path, 'utf8')
    if (source.trim().length === 0) return []
    return [{ part, file, html: renderProgramme(source) }]
  })
}

/** Relative links inside the folder point to the files in research-ecology, not to this site. */
export function renderProgramme(source: string): string {
  const rewritten = source.replace(/\]\((?!https?:|#|mailto:)([^)\s]+\.md)\)/g, (_m, href: string) => {
    const clean = href.replace(/^\.\//, '')
    const base = clean.startsWith('../') ? 'https://github.com/frankbueltge/research-ecology/blob/main' : `${PROGRAMME_REPO.replace('/tree/', '/blob/')}`
    return `](${base}/${clean.replace(/^\.\.\//, '')})`
  })
  return renderLine(rewritten)
}

/** Which step of the programme a cycle is: the first step is the cycle the programme opened. */
export function stepOf(cycle: number, firstCycle: number | null | undefined): number | null {
  if (firstCycle == null || cycle < firstCycle) return null
  return cycle - firstCycle + 1
}

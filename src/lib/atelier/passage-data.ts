// src/lib/atelier/passage-data.ts — the one place The Passage's model is assembled from the
// committed records. Same shape as src/lib/studio/chronicle.ts's loadChronicle: the build-tool
// bindings (astro:content, import.meta.glob) live here, and everything they feed —
// src/lib/atelier/passage.ts, ledger.ts, lineText.ts — stays pure and unit-tested.
//
// It exists as a module rather than inside ProcessFigure.astro because TWO callers need the same
// model and must not be able to disagree: the live figure, and the guided tour, which renders a
// build-time still per scene from the very same builder (a second assembly would drift the moment
// either one changed).

import { getCollection } from 'astro:content'
import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import { readLedgerIndex } from './ledger'
import { absicht, urteil, zugTitel } from './lineText'
import { buildPassageModel, type PassageModel, type PassageProse } from './passage'
import type { RohProjekt } from './process'

const scoreRaw = import.meta.glob('/src/content/atelier/projects/*/SCORE.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>
const decisionRaw = import.meta.glob('/src/content/atelier/projects/*/DECISION.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>
const journalRaw = import.meta.glob('/src/content/atelier/journal/*.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>

const idOf = (path: string) => path.replace('/src/content/atelier/projects/', '').split('/')[0]

/** A loose collection schema means YAML parses `created:` into a Date OBJECT. `String(date)` would
 *  give "Sat Jul 18 2026 …" and NaN in every date calculation — the first build of this figure died
 *  on exactly that. */
function asIsoDay(v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  const s = String(v ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const parsed = Date.parse(s)
  return Number.isNaN(parsed) ? '' : new Date(parsed).toISOString().slice(0, 10)
}

export async function loadPassageModel(): Promise<PassageModel> {
  const all = await getCollection('atelier')

  const collected = new Map<string, { files: string[]; data: Record<string, unknown> }>()
  for (const entry of all) {
    if (!entry.id.startsWith('projects/')) continue
    const [, lineId, part] = entry.id.split('/')
    if (!lineId || !part) continue
    const found = collected.get(lineId) ?? { files: [], data: {} }
    found.files.push(`${part.toUpperCase()}.md`)
    if (part.toLowerCase() === 'score') found.data = (entry.data ?? {}) as Record<string, unknown>
    collected.set(lineId, found)
  }

  const projects: RohProjekt[] = [...collected.entries()].map(([lineId, v]) => ({
    id: lineId,
    title: String(v.data.title ?? lineId),
    status: String(v.data.status ?? ''),
    disposition: String(v.data.disposition ?? ''),
    created: asIsoDay(v.data.created),
    dateien: v.files,
  }))

  // The prose each line carries, quoted out of its own records — never summarised. The journal
  // headings read like the table of contents of the investigation, which makes them a better
  // progress indicator than any number.
  const prose: Record<string, PassageProse> = {}
  for (const project of projects) {
    const name = project.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
    const scorePath = Object.keys(scoreRaw).find((p) => idOf(p) === project.id)
    const decisionPath = Object.keys(decisionRaw).find((p) => idOf(p) === project.id)
    const workLine = (collected.get(project.id)?.data.work_line ?? {}) as Record<string, unknown>
    prose[project.id] = {
      about: scorePath ? absicht(scoreRaw[scorePath], workLine.work_intention) : null,
      verdict: decisionPath ? urteil(decisionRaw[decisionPath]) : null,
      moves: Object.entries(journalRaw)
        .map(([path, raw]) => {
          const file = path.split('/').pop() ?? ''
          const m = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(file)
          return m && m[2].startsWith(name) ? { date: m[1], title: zugTitel(raw, file) } : null
        })
        .filter((z): z is { date: string; title: string } => z !== null)
        .sort((a, b) => b.date.localeCompare(a.date)),
    }
  }

  return buildPassageModel({
    projects,
    journalIds: Object.keys(journalRaw).map((p) =>
      p.replace('/src/content/atelier/', '').replace(/\.md$/, ''),
    ),
    today: new Date().toISOString().slice(0, 10),
    prose,
    ledgers: readLedgerIndex(decisionRaw),
    harbours: ATELIER_NARRATIVE.passage.harbours,
  })
}

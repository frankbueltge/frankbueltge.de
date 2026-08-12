// src/lib/atelier/refrain-data.ts — the one place the refrain score's models are assembled
// from the committed records (pattern: passage-data.ts). The build-tool bindings live here;
// src/lib/atelier/refrain.ts stays pure and unit-tested.

import { buildRefrainModel, isWorkLine, lineStatus, type RefrainModel } from './refrain'

const scoreRaw = import.meta.glob('/src/content/atelier/projects/*/SCORE.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>
const traceRaw = import.meta.glob('/src/content/atelier/projects/*/TRACE.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>

const idOf = (path: string) => path.replace('/src/content/atelier/projects/', '').split('/')[0]

/** The declared leitmotifs per line — literal strings, matched verbatim (spec §3: curated,
 *  never inferred by fuzzy matching; a glyph the parser guessed would be an invention).
 *  A line not listed here simply renders no motif row. */
const DECLARED_MOTIFS: Record<string, string[]> = {
  // The first work-line's component of passage: the value read in units of its own claimed
  // precision — it recurs across astrometry, metrology and the line's own instruments.
  '2026-07-23-negative-parallax': ['ϖ/σ_ϖ', 'φ/σφ', 'parallax_over_error'],
}

/** Every RUNNING work-line that has a legible score: declared `kind: work-line` and
 *  `status: ACTIVE` in its SCORE frontmatter, AND at least one parseable TRACE event. The
 *  score is a present-tense figure — closed lines belong to the archive passage. A line
 *  whose TRACE the parser cannot read yields zero columns and is skipped rather than
 *  rendered empty — the honest gap is the dossier's job, not an empty sheet. Newest first. */
export function loadRefrainModels(): RefrainModel[] {
  const models: RefrainModel[] = []
  for (const [path, score] of Object.entries(scoreRaw)) {
    if (!isWorkLine(score) || lineStatus(score) !== 'ACTIVE') continue
    const id = idOf(path)
    const tracePath = Object.keys(traceRaw).find((p) => idOf(p) === id)
    if (!tracePath) continue
    const model = buildRefrainModel({
      id,
      trace: traceRaw[tracePath],
      score,
      motifs: DECLARED_MOTIFS[id] ?? [],
    })
    if (model.columns.length > 0) models.push(model)
  }
  return models.sort((a, b) => b.line.id.localeCompare(a.line.id))
}

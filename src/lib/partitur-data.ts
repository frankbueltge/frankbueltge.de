// src/lib/partitur-data.ts — the ecology's score, assembled from the committed records.
//
// The build-tool bindings live HERE and nowhere else (same split as dossier-data.ts and
// refrain-data.ts): src/lib/partitur.ts stays a pure module tested against fixtures, and this
// file is the only place that reads the mirrors.
//
// Why it exists at all: the score used to be assembled inline on /maschinenraum, and when the
// pyramid rewrite retired that route on 2026-08-12 the assembly went with the page. The figure
// survived in src/components/maschinenraum/Partitur.astro — four voices on one time axis, its own
// dark stage, its own validated palette — and could not be mounted anywhere, because nothing
// built a model for it any more. Recovered 2026-08-14 with the assembly lifted out of the retired
// page unchanged: same five sources, same order, no new claim.

import { buildScore, chronicleEvents, journalEvents, scoreOpenings, type ScoreModel } from '@/lib/partitur'
import { loadChronicle as loadFieldChronicle } from '@/lib/field/chronicle'
import { loadChronicle as loadStudioChronicle } from '@/lib/studio/chronicle'

/** Vite analyses these statically, so they are written out rather than generated. */
const atelierJournalsRaw = import.meta.glob('/src/content/atelier/journal/*.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>
const scoresRaw = import.meta.glob('/src/content/atelier/projects/*/SCORE.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>
const plenumJournalsRaw = import.meta.glob('/src/content/plenum/journal/*.md', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>

/**
 * The four voices on one axis: the Atelier's journal and the openings of its work-lines, the
 * Field's and the Studio's chronicles, the Plenum's journal.
 *
 * The nightly line is deliberately NOT a fifth voice. It is the Atelier under a second
 * constitution (wording-kanon, 2026-08-12) — a line inside a practice, and a voice of its own on
 * this stage would say the ecology has four practices, which is exactly the confusion the canon
 * settles. Its works reach the Atelier's own surfaces through the register.
 */
export function loadEcologyScore(): ScoreModel | null {
  return buildScore([
    ...journalEvents(atelierJournalsRaw, 'atelier'),
    ...scoreOpenings(scoresRaw),
    ...chronicleEvents(loadFieldChronicle(), 'field'),
    ...chronicleEvents(loadStudioChronicle(), 'studio'),
    ...journalEvents(plenumJournalsRaw, 'plenum'),
  ])
}

/** The score's own as-of: the last day of the axis, which the builder sets from the last landing
 *  it found. Never today's date and never the build's — a quiet week has to read as quiet. */
export function scoreLastLanded(model: ScoreModel | null): string | null {
  return model?.end || null
}

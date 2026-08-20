// src/lib/atelier/dossier-data.ts — the assembly layer for the dossier.
//
// Same split as passage-data.ts: the build-tool bindings live HERE and nowhere else, so
// dossier.ts stays a pure module that can be unit-tested against the real committed files
// through node:fs. One assembly, called once by the entrance, handed to the component — two
// assemblies of the same records would drift, and this practice's whole claim is that its
// surfaces and its record say the same thing.

import { buildDossiers, type Dossier } from './dossier'
import { wholeTrace } from './trace-record'

/** Every line's dossier, running lines first, newest activity leading.
 *
 *  The four option objects below are written out rather than shared through a constant: Vite's
 *  glob transform is a compile-time rewrite and needs its second argument to be an object
 *  literal at the call site, so a hoisted `const raw = {…}` fails the build outright. */
export function loadDossiers(movesShown = 4): Dossier[] {
  const scores = import.meta.glob('/src/content/atelier/projects/*/SCORE.md', {
    eager: true, query: '?raw', import: 'default',
  }) as Record<string, string>
  const traces = import.meta.glob('/src/content/atelier/projects/*/TRACE.md', {
    eager: true, query: '?raw', import: 'default',
  }) as Record<string, string>
  const decisions = import.meta.glob('/src/content/atelier/projects/*/DECISION.md', {
    eager: true, query: '?raw', import: 'default',
  }) as Record<string, string>
  const journal = import.meta.glob('/src/content/atelier/journal/*.md', {
    eager: true, query: '?raw', import: 'default',
  }) as Record<string, string>
  // Every file in every line's folder — the dossier lists what a line's record CONSISTS of, and
  // that list has to include the files nothing else on the site reads (pre-registrations, figure
  // notes, sketch notes). A record is not only the parts a page happens to quote.
  const files = Object.keys(import.meta.glob('/src/content/atelier/projects/*/*.md'))
  // What §8 rotated out of those live traces. The dossier COUNTS moves, so reading the live
  // file alone does not merely shorten a list — it states a false number: the running line
  // would show 5 moves against the 62 its record holds, and the count would drop again at
  // every rotation while the line was working hardest. Composed before it is counted.
  const rotated = import.meta.glob('/src/content/atelier/archive/trace/*.md', {
    eager: true, query: '?raw', import: 'default',
  }) as Record<string, string>
  const whole = Object.fromEntries(
    Object.entries(traces).map(([path, text]) => [
      path,
      wholeTrace(path.replace('/src/content/atelier/projects/', '').split('/')[0], text, rotated),
    ]),
  )

  return buildDossiers({ scores, traces: whole, decisions, journal, files }, movesShown)
}

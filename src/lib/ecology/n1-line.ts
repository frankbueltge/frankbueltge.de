// src/lib/ecology/n1-line.ts — the two facts the house states about its third line.
//
// n-1 is a practice founded 2026-08-15 on the Atelier's own working paper ("Cartography, not
// Tracing" — the practice's README names it "a work of the Ulysses practice"), and Frank placed
// it as the Atelier's third line the same day (decision-log 2026-08-15; wording private). It is
// deliberately NOT integrated the way the other two lines are:
//
//   · its record does not land in the works register — the repository mirrored at public/n-1/
//     IS the record, and the surface at /n-1 is the practice's own, never a house window
//     (n1-integrate.yml; the earlier house-derived view was removed on 2026-08-15);
//   · it has no "… Protocol vN" to read — by design. Its Dowry says so in as many words:
//     "this practice has no protocol document."
//
// So the house reads exactly two facts from the committed mirror, both for the Atelier's
// status panel and nothing else: what the line is currently called (the practice's own window
// declaration — the working title is a placeholder the practice will replace, and the house
// must follow it the night it does) and what its law is called (the Dowry's own H1). Read,
// never typed — the Aktualitätsregel that governs every other constitution row here.

import { readFileSync } from 'node:fs'

export interface N1Facts {
  /** what the line is called right now, from the practice's own window declaration */
  title: string
  /** the founding date the Dowry itself states */
  founded: string
  /** the practice's own name for its law, from the Dowry's H1 */
  law: string
  /** The name the practice has taken for ITSELF, if it has taken one — distinct from `title`,
   *  which is the repository's working title. Optional on purpose: a practice that has not
   *  named itself yet is a normal state, not a broken mirror, so this stays undefined instead
   *  of failing loud like the three facts above. */
  name?: string
}

const DOWRY_PATH = 'public/n-1/DOWRY.md'
const WINDOW_PATH = 'public/n-1/window.json'

/**
 * Fail-loud, like readConstitution: a mirror this module cannot parse is an integration fault,
 * not a reason for a quiet default. The overrides exist for the tests, which must be able to
 * hand in a broken mirror without breaking the checked-in one.
 */
export function readN1Facts(
  dowry: string = readFileSync(DOWRY_PATH, 'utf8'),
  windowJson: string = readFileSync(WINDOW_PATH, 'utf8'),
): N1Facts {
  const heading = /^#\s+(.+?)\s*$/m.exec(dowry)?.[1]
  if (!heading) throw new Error(`ecology/n1-line: ${DOWRY_PATH} carries no H1 — mirror broken`)

  const founded = /Founded\s+(\d{4}-\d{2}-\d{2})/.exec(dowry)?.[1]
  if (!founded) throw new Error(`ecology/n1-line: ${DOWRY_PATH} states no "Founded YYYY-MM-DD" — mirror broken or format changed`)

  const declared = (JSON.parse(windowJson) as {
    title?: { text?: string; name?: { text?: string } }
  }).title
  const title = declared?.text
  if (!title) throw new Error(`ecology/n1-line: ${WINDOW_PATH} declares no title — window contract broken or format changed`)
  const name = declared?.name?.text

  // "The Dowry" reads as a title; in a status row it reads as a word. The article drops its
  // capital the way lineShortLabel drops the article — presentation, not renaming.
  return { title, founded, law: heading.replace(/^The\b/, 'the'), name }
}

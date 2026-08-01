// src/lib/tour/atelier-pivot.ts — the Atelier's first guided tour: "Killed on the pivot fact — and
// the ledger closes at two ticks."
//
// The tour engine (components/dataviz/Tour.astro) renders it; verify.ts checks it. The division
// this module rests on is the same one the studio's tour established:
//
//   · the FRAME — title, standfirst, kickers, headings, leads, call-outs — is visitor-facing copy
//     and lives in src/config/atelier-wording.ts (ATELIER_NARRATIVE.tour). It carries no numbers
//     and makes no claims; it only says what the visitor is about to read.
//   · the SUBSTANCE is every `quote.text` below. Each one is a BYTE-EXACT substring of the
//     committed file its `source` names, and src/lib/tour/atelier-pivot.test.ts proves that with
//     real filesystem reads. A scene whose quote cannot be verified is CUT, never paraphrased.
//
// Why THIS line, out of twelve: it is the only one whose record shows the practice's method being
// turned on the practice's own instrument and winning. The score wrote its kill condition BEFORE
// gathering evidence, scheduled the check that could fire it, and the check fired — against the
// project's own central claim, which turned out to have been manufactured by the summarising tool
// the initiation trusted. That is what "errors catalogued checkably" means when it costs something.
//
// One quirk of quoting a hard-wrapped markdown record, worth stating rather than hiding: several
// quotes below carry the record's OWN line breaks (and, in scene four, its own list indentation)
// because verify.ts compares bytes and refuses tidied text. HTML collapses that whitespace when the
// scene renders, so the visitor reads a clean sentence — and the harness still reads the file's
// exact bytes. Re-flowing a quote to look nicer in this file would be indistinguishable from
// re-typing it from memory, which is the thing the whole harness exists to make impossible.

import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import type { FocusState, Tour } from './types'

const PROJECT = 'src/content/atelier/projects/2026-07-20-retraction-signature'
const SCORE = `${PROJECT}/SCORE.md`
const DECISION = `${PROJECT}/DECISION.md`
const TRACE = `${PROJECT}/TRACE.md`

/** the figure id this tour drives — the DOM id ProcessFigure.astro registers under */
export const PASSAGE_FIGURE = 'atelier-passage'

/** the line this tour walks, and the other line in its harbour. Exported so the page and the test
 *  name the same marks the passage model builds, rather than re-typing the ids by hand. */
export const PIVOT_MARKS = {
  line: '2026-07-20-retraction-signature',
  /** the other KILL on the sheet — an infrastructure fixture, dimmed so the eye lands right */
  otherKill: '2026-07-18-gate-rehearsal',
} as const

const w = ATELIER_NARRATIVE.tour

/** Scenes one to five hold the sheet on the killed line; the last one lets go. A function rather
 *  than a frozen object, because FocusState's arrays are mutable by contract (a figure may sort or
 *  splice what it is handed) and every scene must get its own. */
const held = (): Omit<FocusState, 'annotate'> => ({
  figure: PASSAGE_FIGURE,
  filter: ['KILL'],
  select: PIVOT_MARKS.line,
  dim: [PIVOT_MARKS.otherKill],
})

export const pivotTour: Tour = {
  id: 'atelier-killed-on-the-pivot',
  practice: 'atelier',
  title: w.title,
  standfirst: w.standfirst,
  provenance: [SCORE, DECISION, TRACE],
  scenes: [
    {
      id: 'the-kill-condition',
      ...w.scenes.condition,
      quotes: [
        {
          text:
            'The pivot fact (notice authorship = original authors in the machine register) proves to be\n' +
            "an artefact of my own tooling's reading of Crossref, AND no register-level attribution gap\n" +
            'survives verification. Kill with DECISION.md; the failed premise itself lands as a trace.',
          source: SCORE,
          locator: '§8 Failure and stopping — the kill condition, written at initiation',
        },
        {
          text:
            'Any of: the Crossref author field misread by my tooling (kill-grade — see §8); the\n' +
            'convention check dissolving the signature finding; the instrument check revealing the slot\n' +
            'exists and is standard; the verbatim check breaking the "editorial oversight" quote.',
          source: SCORE,
          locator: '§5 Resistance and correction — “What could defeat the premise?”',
        },
      ],
      focus: { ...held(), annotate: [{ key: PIVOT_MARKS.line, text: w.notes.condition }] },
    },
    {
      id: 'the-raw-re-read',
      ...w.scenes.method,
      quotes: [
        {
          text: 'Three checks, each able to defeat the premise, scheduled for the Expose tick:',
          source: SCORE,
          locator: '§5 Resistance and correction — the external resistance path',
        },
        {
          text: 'Both clauses now hold, verified\nthis tick against raw JSON (not the summarising fetch tool).',
          source: DECISION,
          locator: 'the decision — “The kill condition, met on both clauses”',
        },
      ],
      focus: { ...held(), annotate: [{ key: PIVOT_MARKS.line, text: w.notes.method }] },
    },
    {
      id: 'clause-a-the-tooling-artefact',
      ...w.scenes.clauseA,
      quotes: [
        {
          text:
            'this notice has no\n' +
            'author field, and the genre as sampled does not attach the original authors to the notice.',
          source: DECISION,
          locator: 'the decision — the convention check, thirty sibling notices sampled',
        },
        {
          text:
            'It was inserted by the summarising fetch tool the initiation used,\n' +
            "which conflated the retracted article's six authors with the notice.",
          source: DECISION,
          locator: 'the decision — clause (a), the pivot fact was a tooling artefact',
        },
        {
          text:
            'The initiation flagged\n' +
            'this exact risk as kill-grade and scheduled the raw re-read; the raw re-read killed it.',
          source: DECISION,
          locator: 'the decision — clause (a), closing sentence',
        },
      ],
      focus: { ...held(), annotate: [{ key: PIVOT_MARKS.line, text: w.notes.clauseA }] },
    },
    {
      id: 'clause-b-the-register-answers',
      ...w.scenes.clauseB,
      quotes: [
        {
          text:
            'The premise held that the\n' +
            'correction infrastructure offers no author-slot for the apparatus that erred, so a machine\n' +
            "reader receives attribution (authors' names) without exculpation. Verification refutes this\n" +
            'in three independent ways:',
          source: DECISION,
          locator: 'the decision — clause (b), the premise as the score stated it',
        },
        {
          // The record's own numbered-list indentation, kept: the sentence is split across a list
          // item's wrap, and verify.ts compares bytes, not intentions.
          text: 'The handling editor accepts\n   responsibility for the oversight.',
          source: DECISION,
          locator: 'the decision — clause (b), refutation 1: the notice’s own Crossref abstract',
        },
      ],
      focus: { ...held(), annotate: [{ key: PIVOT_MARKS.line, text: w.notes.clauseB }] },
    },
    {
      id: 'what-it-delivered-and-cost',
      ...w.scenes.cost,
      quotes: [
        {
          text:
            'The error was in the reading instrument, not in the world. That is\n' +
            'error located and corrected, not error exhibited.',
          source: DECISION,
          locator: 'the decision — “What this kill actually delivers”',
        },
        {
          text: 'Budget closed at 2 of ≤ 4 ticks (initiation +\nthis Expose), 0 EUR, 0 full-text extractions.',
          source: DECISION,
          locator: 'the decision — Standing; the same sentence the sheet prints in its gutter',
        },
        {
          text:
            'The kill-grade caveat the initiation set on\n' +
            'itself is the reason the spend stayed small: the project was built to test its own weakest\n' +
            'link first, and it failed that test.',
          source: DECISION,
          locator: 'the decision — Standing, closing sentence',
        },
      ],
      focus: { ...held(), annotate: [{ key: PIVOT_MARKS.line, text: w.notes.cost }] },
    },
    {
      id: 'recorded-and-left',
      ...w.scenes.scope,
      quotes: [
        {
          text:
            'That is a live tension between two\n' +
            'registers — but it concerns a dispute among named living parties, not an instrument, and\n' +
            "pursuing it would be exactly the scope-creep the score's affected-publics constraint (§1)\n" +
            'forbids. It is recorded and left.',
          source: DECISION,
          locator: 'the decision — the residual observation, deliberately not made a new project',
        },
        {
          text:
            '(a) every claim about any of these parties stays strictly\n' +
            'within the published record cited above, with no inference about motive or competence;',
          source: SCORE,
          locator: '§1 Source situation — the affected-publics constraint the scope rule comes from',
        },
      ],
      focus: {
        figure: PASSAGE_FIGURE,
        // the filter lifts: every harbour reads at once again, the killed line still held
        filter: null,
        select: PIVOT_MARKS.line,
        annotate: [{ key: PIVOT_MARKS.line, text: w.notes.scope }],
      },
    },
  ],
}

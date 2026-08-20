// src/lib/tour/studio-one-tap.ts — the Studio's first guided tour: "Premiered, returned three
// times, withdrawn — and the record keeps all four."
//
// The tour engine (components/dataviz/Tour.astro) renders it; verify.ts checks it. What makes this
// module worth reading is the DIVISION between frame and substance:
//
//   · the FRAME — title, standfirst, kickers, headings, leads — is visitor-facing copy and lives
//     in src/config/studio-wording.ts (STUDIO_NARRATIVE.tour). It carries no numbers and makes no
//     claims; it only says what the visitor is about to read.
//   · the SUBSTANCE is every `quote.text` below. Each one is a BYTE-EXACT substring of the
//     committed file its `source` names, and src/lib/tour/studio-one-tap.test.ts proves that with
//     real filesystem reads. No paraphrase, no tidied ellipsis, no re-typed number — a quote that
//     drifts from its source fails the build rather than merely reading oddly on review.
//
// Every quote here was located in the committed record and copied out of it; nothing in this file
// was typed from memory or from a brief. Two of the five scenes quote the work's OWN meta.json,
// because the two corrections the collective made to its own description are the substance of
// scene four, and they live there rather than in the chronicle.
//
// One scene = one focus state for the season floor (components/studio/SeasonFloor.astro). The last
// scene deliberately clears the filter (`filter: null`, which FocusState distinguishes from
// "this scene doesn't touch the filter") so the whole season reads at once again at the end.

import { STUDIO_NARRATIVE } from '@/config/studio-wording'
import type { Tour } from './types'

const CHRONICLE = 'src/data/studio/chronicle.upstream.json'
const META = 'src/content/studio/works/2026-07-23-one-tap/meta.json'

/** the figure id this tour drives — the DOM id SeasonFloor.astro registers under */
export const ONE_TAP_FIGURE = 'studio-season-floor'

/** the season-floor mark keys this tour focuses; exported so the page and the test name the same
 *  marks the model builds rather than re-deriving the strings by hand */
export const ONE_TAP_MARKS = {
  work: 'withdrawn:2026-07-23-one-tap',
  return1: 'returned:2026-07-23-one-tap:1',
  return2: 'returned:2026-07-23-one-tap:2',
  return3: 'returned:2026-07-23-one-tap:3',
} as const

const w = STUDIO_NARRATIVE.tour

export const oneTapTour: Tour = {
  id: 'studio-one-tap-three-returns',
  practice: 'studio',
  title: w.title,
  standfirst: w.standfirst,
  provenance: [
    CHRONICLE,
    'src/data/studio/chronicle.curated.json',
    META,
    'src/data/studio/stage.curated.json',
  ],
  scenes: [
    {
      id: 'the-premiere',
      ...w.scenes.premiere,
      quotes: [
        {
          text: 'One Tap premiered — the fourth work of the house, through the hardened gate the session-30 self-decision scheduled (played or unplayed).',
          source: CHRONICLE,
          locator: 'collective session 31, 2026-07-23 — summary',
        },
        {
          text: 'Three blocking voices on the strong tier, and the reserved live-motion minute test was actually run in a browser because stills cannot show the thrash',
          source: CHRONICLE,
          locator: 'collective session 31, 2026-07-23 — summary',
        },
      ],
      focus: {
        figure: ONE_TAP_FIGURE,
        // only the lit positions: the season's premieres, and this one among them
        filter: ['premiered', 'withdrawn'],
        select: ONE_TAP_MARKS.work,
        annotate: [{ key: ONE_TAP_MARKS.work, text: w.notes.premiere }],
      },
    },
    {
      id: 'the-eye-returns-it',
      ...w.scenes.returned,
      quotes: [
        {
          text: 'The human eye returned One Tap a second time.',
          source: CHRONICLE,
          locator: 'collective session 32, 2026-07-23 — summary',
        },
        // CUT 2026-08-16: this scene quoted the eye's own words out of the summary. The studio's
        // standing privacy rule of 2026-08-15 took verbatim quotation of the architect's messages
        // out of its record, so the sentence this scene named is no longer in the file it named.
        // A quote that cannot be verified is cut, never paraphrased — the two that remain are the
        // house's own sentences and are still byte-exact, and the return itself is unchanged.
        {
          text: 'Session 31 had bound the studio: if the eye still dissents, that verdict governs, the record and the gate are not above it.',
          source: CHRONICLE,
          locator: 'collective session 32, 2026-07-23 — the practice’s own binding',
        },
      ],
      focus: {
        figure: ONE_TAP_FIGURE,
        filter: ['withdrawn', 'returned'],
        select: ONE_TAP_MARKS.return2,
        dim: [ONE_TAP_MARKS.return3],
        annotate: [{ key: ONE_TAP_MARKS.return2, text: w.notes.returned }],
      },
    },
    {
      id: 'the-third-return',
      ...w.scenes.third,
      quotes: [
        {
          text: 'The human eye returned One Tap a third time',
          source: CHRONICLE,
          locator: 'collective session 43, 2026-07-25 — summary',
        },
        // CUT 2026-08-16, same reason as the second return's quote above.
        {
          text: 'and the studio kept the promise it had put in writing after the second return: no fourth restage, no self-certification, the answer said plainly.',
          source: CHRONICLE,
          locator: 'collective session 43, 2026-07-25 — summary',
        },
      ],
      focus: {
        figure: ONE_TAP_FIGURE,
        filter: ['withdrawn', 'returned'],
        select: ONE_TAP_MARKS.return3,
        annotate: [{ key: ONE_TAP_MARKS.return3, text: w.notes.third }],
      },
    },
    {
      id: 'what-two-voices-found-unasked',
      ...w.scenes.finding,
      quotes: [
        {
          text: 'the crossing-out described below NEVER RENDERED — a strike-through cannot cross an inline-block, so no figure was ever struck; the line fell on the five source names instead, which read as a cancellation of correctly cited real sources.',
          source: META,
          locator: 'the work’s own meta.json — correction (a), left standing as record',
        },
        {
          text: 'For two sessions the board, the work\'s README and its metadata asserted the opposite as verified fact, because the check inspected class names and a self-test comparing two string literals rather than the rendered pixel.',
          source: CHRONICLE,
          locator: 'collective session 43, 2026-07-25 — summary',
        },
        {
          text: 'The studio\'s record asserted the opposite of what the page rendered for two sessions, because it verified its code and not its pixels.',
          source: META,
          locator: 'the work’s own meta.json — correction (b)',
        },
      ],
      focus: {
        figure: ONE_TAP_FIGURE,
        filter: ['withdrawn'],
        select: ONE_TAP_MARKS.work,
        annotate: [{ key: ONE_TAP_MARKS.work, text: w.notes.finding }],
      },
    },
    {
      id: 'what-it-cost-and-what-it-bought',
      ...w.scenes.cost,
      quotes: [
        {
          text: 'WITHDRAWN 2026-07-25 (collective session 43): killed by the studio after the human eye rejected three successive stagings, each of which had passed the house\'s own gate.',
          source: META,
          locator: 'the work’s own meta.json — the withdrawal, machine-readable',
        },
        {
          text: 'New standing law, paid for in full: two rejections end a body, a gate pass ranked downward by the eye is evidence against the gate, what a stranger sees is settled in pixels and never in propositions, the first étude of every campaign is a still image judged with its captions covered, and the human eye moves earlier — to the sketch, where a dissent is cheap.',
          source: CHRONICLE,
          locator: 'collective session 43, 2026-07-25 — the standing law adopted',
        },
      ],
      focus: {
        figure: ONE_TAP_FIGURE,
        // the filter lifts: the season reads as a whole again, the struck spotlight among it
        filter: null,
        select: ONE_TAP_MARKS.work,
        annotate: [{ key: ONE_TAP_MARKS.work, text: w.notes.cost }],
      },
    },
  ],
}

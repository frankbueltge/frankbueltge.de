// src/lib/tour/field-gauntlet.ts — the Field's first guided tour: "The gauntlet took a claim off
// us." Six moves out of the collective's own record, in the order the record puts them.
//
// The division this module keeps, the same one studio-one-tap.ts keeps:
//   · the FRAME — title, standfirst, kickers, headings, leads — is visitor-facing copy and lives
//     in src/config/field-wording.ts (FIELD_NARRATIVE.tour). It carries no numbers and makes no
//     claims; it only says what the visitor is about to read.
//   · the SUBSTANCE is every `quote.text` below. Each one is a BYTE-EXACT substring of the
//     committed file its `source` names, proven by field-gauntlet.test.ts against the real
//     filesystem. A scene whose quote cannot be verified is CUT, never paraphrased — none had to
//     be: all six scenes' quotes were located in the committed record and copied out of it.
//
// WHOSE VOICE (docs/wording-kanon.md, enc-2026-005): scenes one to five are the MERIDIAN
// COLLECTIVE's own record — its journal, its instruments, its gauntlet. Scene six crosses to the
// MERIDIAN RESEARCH RUNTIME, the architect's ENGINEERING LINE, whose machine invariant keeps the
// disagreement on the record. The tour says which is which; it never lets the runtime speak as the
// collective, and it never credits the collective with the runtime's machinery.
//
// WHY THIS TOUR DRIVES THE KONTROLLBLATT and not the claim figure (a deliberate deviation from the
// studio's precedent, where one figure carried the whole tour): these six scenes are a RECORD OVER
// FIVE WALL-CLOCK DAYS, and the Kontrollblatt — pen line, instrument triangles, move stamps, caveat
// flag, splice — is the field's approved grammar for exactly that (field-aesthetik §4). The claim
// figure below the tour is the anatomy of ONE claim's review; it has no time axis, and forcing five
// days of chronicle onto it would have meant inventing marks it does not carry. The last scene is
// the hinge: it selects the plate's own claim mark, and the claim figure underneath opens it up.

import { dayRange, type ControlInput, type ControlMark } from '@/lib/field/strip'
import { FIELD_NARRATIVE } from '@/config/field-wording'
import type { Tour } from './types'

const CHRONICLE = 'src/data/field/chronicle.upstream.json'

/** the two instruments this tour walks, by their committed slugs — exported so the page reads the
 *  same two works out of the mirror that this module names as provenance, rather than a second,
 *  drifting pair of hand-typed slugs */
export const GAUNTLET_INSTRUMENTS = {
  i018: '2026-07-25-no-signal-to-extend',
  i019: '2026-07-26-unable-to-ring-its-own-bell',
} as const

const META_018 = `src/components/field/werke/${GAUNTLET_INSTRUMENTS.i018}/meta.json`
const META_019 = `src/components/field/werke/${GAUNTLET_INSTRUMENTS.i019}/meta.json`
const PARALLAX = 'src/data/meridian/parallax.json'
const V_FAIL = 'src/data/meridian/export/objects/urn_mrr_verification_01KY4RMN5CACRH52BEKZ54RXYH.json'
const V_PASS = 'src/data/meridian/export/objects/urn_mrr_verification_01KY4PZ13XBPPWVNB3H30MD02K.json'
const SPEC = 'docs/meridian-research-runtime-spec-v0.2.0/MERIDIAN_RESEARCH_RUNTIME_SPEC_v0.2.0.md'

/** the figure id this tour drives — the DOM id GauntletTour.astro registers its plate under */
export const GAUNTLET_FIGURE = 'field-gauntlet-plate'

/** the plate mark keys this tour focuses; exported so the component and the test name the same
 *  marks the builder makes rather than re-typing the strings */
export const GAUNTLET_MARKS = {
  claim: 'claim-contested',
  instrument018: 'instrument-018',
  session65: 'session-65',
  session66: 'session-66',
  powerCheck: 'power-check',
  withdrawn: 'claim-withdrawn',
  instrument019: 'instrument-019',
} as const

const w = FIELD_NARRATIVE.tour

export const gauntletTour: Tour = {
  id: 'field-gauntlet-took-a-claim',
  practice: 'field',
  title: w.title,
  standfirst: w.standfirst,
  provenance: [CHRONICLE, META_018, META_019, PARALLAX, V_FAIL, V_PASS, SPEC],
  scenes: [
    {
      id: 'the-instrument-returns-a-null',
      ...w.scenes.nullResult,
      quotes: [
        {
          text: 'across three half-year windows (2015H1-2026H1) on 338,151 arXiv abstracts (cs.CL, cs.CV, math.NT)',
          source: META_018,
          locator: 'the instrument’s own meta.json — what it was run over',
        },
        {
          text: 'firing the pre-registered kill condition: NO SIGNAL BEYOND ORDINARY DRIFT',
          source: META_018,
          locator: 'the instrument’s own meta.json — the verdict',
        },
        {
          text: "the verdict is 'no signal to extend on this battery', not that the published decline reversed",
          source: META_018,
          locator: 'the instrument’s own meta.json — the limit it states on itself',
        },
      ],
      focus: { figure: GAUNTLET_FIGURE, filter: ['instr'], select: GAUNTLET_MARKS.instrument018 },
    },
    {
      id: 'the-rig-turned-on-ourselves',
      ...w.scenes.turned,
      quotes: [
        {
          text: 'build — we turned our own measuring rig on our own writing, and the rig failed its own test',
          source: CHRONICLE,
          locator: 'collective session 66, 2026-07-26 — the move line',
        },
        {
          text: 'The rig reported no loss of variety in our writing beyond ordinary drift.',
          source: CHRONICLE,
          locator: 'collective session 66, 2026-07-26 — summary',
        },
        {
          text: 'So the honest result is not a clean bill of health for our prose',
          source: CHRONICLE,
          locator: 'collective session 66, 2026-07-26 — summary',
        },
      ],
      focus: {
        figure: GAUNTLET_FIGURE,
        filter: ['instr', 'stamp'],
        select: GAUNTLET_MARKS.session66,
        dim: [GAUNTLET_MARKS.instrument018],
      },
    },
    {
      id: 'the-power-check-voids-the-null',
      ...w.scenes.power,
      quotes: [
        {
          text: 'The pre-registered power check then voids that null: the battery fires at no injection level under either recipe, not even at p = 0.50',
          source: META_019,
          locator: 'the instrument’s own meta.json — the check it could not argue with',
        },
        {
          text: 'so the locked label is UNABLE-TO-RING-ITS-OWN-BELL and no null from the instrument may be reported as informative',
          source: META_019,
          locator: 'the instrument’s own meta.json — the label that voids the verdict',
        },
        {
          text: "it would have reported the same thing if we had deliberately flattened half of every entry with the corpus's own commonest words",
          source: CHRONICLE,
          locator: 'collective session 66, 2026-07-26 — summary',
        },
      ],
      focus: { figure: GAUNTLET_FIGURE, filter: ['flag'], select: GAUNTLET_MARKS.powerCheck },
    },
    {
      id: 'a-claim-is-withdrawn-at-review',
      ...w.scenes.withdrawn,
      quotes: [
        {
          text: 'A second reviewer, whose job is to try to break the central claim, found one',
          source: CHRONICLE,
          locator: 'collective session 67, 2026-07-26 — summary',
        },
        {
          text: 'withdraws its earlier claim that MTLD is simply insensitive at this scale',
          source: META_019,
          locator: 'the instrument’s own meta.json — the retraction, left standing in the work',
        },
        {
          text: 'That sentence is withdrawn in public, the full directional table is published in its place, and the record of the retraction sits in the work.',
          source: CHRONICLE,
          locator: 'collective session 67, 2026-07-26 — summary',
        },
      ],
      focus: { figure: GAUNTLET_FIGURE, filter: ['splicein'], select: GAUNTLET_MARKS.withdrawn },
    },
    {
      id: 'what-shipped',
      ...w.scenes.shipped,
      quotes: [
        {
          text: "shipped as instrument 019, an offer: a measured finding about a measuring instrument's non-portability, with the collective's own corpus as the site where it broke — and explicitly not a verdict on the collective's prose",
          source: CHRONICLE,
          locator: 'collective session 67, 2026-07-26 — the verdict',
        },
        {
          text: "The hostile critic's verdict is published beside the work rather than answered away: neither outcome of this design could have cost the collective anything about its own writing, which makes the self-examination safe by construction.",
          source: CHRONICLE,
          locator: 'collective session 67, 2026-07-26 — summary',
        },
        {
          text: 'Two labels travel together or not at all: the null and the power label that voids it.',
          source: CHRONICLE,
          locator: 'collective session 67, 2026-07-26 — the note attached to the verdict',
        },
      ],
      focus: {
        figure: GAUNTLET_FIGURE,
        filter: ['instr'],
        select: GAUNTLET_MARKS.instrument019,
        dim: [GAUNTLET_MARKS.instrument018],
      },
    },
    {
      id: 'the-dissent-stays',
      ...w.scenes.dissent,
      quotes: [
        {
          text: '**MRR-FR-077**: The system MUST preserve reviewer disagreement and adjudication rationale.',
          source: SPEC,
          locator: 'the runtime specification — the invariant, in the engineering line’s own words',
        },
        {
          text: "under MRR-FR-077 this record and the candidate-c blind verification (urn:mrr:verification:01KY4PZ13XBPPWVNB3H30MD02K, recommendation 'pass') stand as two independent, disagreeing records on the same claim — adjudication, if any, is a separate future governance act, deliberately not taken here.",
          source: V_FAIL,
          locator: 'the failing verification’s own rationale, in the committed export',
        },
        {
          text: 'the same responsible human (the owner) stands behind proposer, executor, and verifier instances; independence here is substantive (blind primary-source re-reading), not institutional.',
          source: V_PASS,
          locator: 'the passing verification’s declared conflict of interest — kept, not hidden',
        },
      ],
      // the filter LIFTS: the whole plate reads at once again, with the claim mark chosen — the
      // figure below opens exactly that claim up
      focus: { figure: GAUNTLET_FIGURE, filter: null, select: GAUNTLET_MARKS.claim },
    },
  ],
}

// ---------------------------------------------------------------- the plate the tour drives
//
// The gauntlet, on the field's own tape. Every mark is a committed date, and every label is built
// from the record's own words (a chronicle `move` line verbatim, a work's own committed title)
// rather than written for the occasion.

export interface GauntletChronicleEntry {
  collective_session: number | null
  date: string
  move: string
}

export interface GauntletWorkMeta {
  title: string
  date: string
}

export interface GauntletParallax {
  claim: { analysis: string; status: string; verification_count: number }
  dissent: { invariant: string; preserved: boolean }
  export_meta: { date_published: string }
}

export interface GauntletInput {
  chronicle: readonly GauntletChronicleEntry[]
  instrument018: GauntletWorkMeta
  instrument019: GauntletWorkMeta
  parallax: GauntletParallax
}

const p = FIELD_NARRATIVE.tour.plate

/** The chronicle entry for one session, or a loud failure — a plate that silently dropped a
 *  session would tell a shorter story than the record does. */
function session(chronicle: readonly GauntletChronicleEntry[], n: number): GauntletChronicleEntry {
  const entry = chronicle.find((e) => e.collective_session === n)
  if (!entry) throw new Error(`gauntletPlate: collective session ${n} is not in the chronicle mirror`)
  return entry
}

/** Builds the plate input for the tour's figure: pure, derived, and in wall-clock order. */
export function gauntletPlate(input: GauntletInput): ControlInput {
  const { chronicle, instrument018, instrument019, parallax } = input
  const s65 = session(chronicle, 65)
  const s66 = session(chronicle, 66)
  const s67 = session(chronicle, 67)
  const claimDate = parallax.export_meta.date_published.slice(0, 10)

  const marks: ControlMark[] = ([
    {
      key: GAUNTLET_MARKS.claim,
      date: claimDate,
      kind: 'flag',
      label:
        `${parallax.claim.analysis} — ${parallax.claim.status}, ${parallax.claim.verification_count} verifications, ` +
        `dissent ${parallax.dissent.preserved ? 'preserved' : 'not preserved'} (${parallax.dissent.invariant}); ` +
        p.claimNote,
    },
    {
      key: GAUNTLET_MARKS.instrument018,
      date: instrument018.date,
      kind: 'instr',
      label: `${instrument018.title} — ${p.instrumentNote}`,
    },
    {
      key: GAUNTLET_MARKS.session65,
      date: s65.date,
      kind: 'stamp',
      letter: 'G',
      label: `S${s65.collective_session} — ${s65.move}`,
    },
    {
      key: GAUNTLET_MARKS.session66,
      date: s66.date,
      kind: 'stamp',
      letter: 'B',
      label: `S${s66.collective_session} — ${s66.move}`,
    },
    {
      key: GAUNTLET_MARKS.powerCheck,
      date: s66.date,
      kind: 'flag',
      label: p.powerCheck,
    },
    {
      key: GAUNTLET_MARKS.withdrawn,
      date: s67.date,
      kind: 'splicein',
      label: `S${s67.collective_session} — ${p.withdrawn}`,
    },
    {
      key: GAUNTLET_MARKS.instrument019,
      date: instrument019.date,
      kind: 'instr',
      label: `${instrument019.title} — ${p.shippedNote}`,
    },
  ] satisfies ControlMark[]).sort((a, b) => a.date.localeCompare(b.date))

  // one day of clear tape past the last mark: the field's data edge is a RESTING PEN after the
  // record, not a pen sitting on top of the last glyph ("the pen has not lifted — the tape runs
  // on"). Derived from the marks, never from a clock.
  const dates = marks.map((m) => m.date)
  const last = dates[dates.length - 1]
  const dayAfter = new Date(Date.parse(`${last}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)
  return {
    days: dayRange(dates[0], dayAfter),
    marks,
    obligation: {
      fromDate: claimDate,
      label: `${parallax.dissent.invariant} — ${p.obligation}`,
    },
    penLabel: p.penLabel,
    spliceLabel: p.spliceLabel,
    label: p.altText,
    // a five-day plate at the full 1440-unit width used barely a third of its own box, and inside
    // the tour's half-width sticky column that was a week of record drawn at 260 pixels
    fitToMarks: true,
    // the busiest day of this week carries FOUR marks; the default rightward fan would have put
    // the last of them past the resting pen, so they fan out centred on their own day tick
    dayOffsets: [-52, -16, 20, 56],
  }
}

/** The plate's own record, uncompressed — one row per mark, so nothing on it is reachable only by
 *  hovering an SVG glyph. */
export function gauntletRows(plate: ControlInput): { date: string; event: string; source: string }[] {
  const sourceOf = (key: string | undefined): string =>
    key === GAUNTLET_MARKS.claim
      ? PARALLAX
      : key === GAUNTLET_MARKS.instrument018
        ? META_018
        : key === GAUNTLET_MARKS.instrument019 || key === GAUNTLET_MARKS.powerCheck
          ? META_019
          : CHRONICLE
  return plate.marks.map((m) => ({ date: m.date, event: m.label, source: sourceOf(m.key) }))
}

export const GAUNTLET_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'date', label: 'date', nowrap: true },
  { key: 'event', label: 'mark (from the record’s own words)' },
  { key: 'source', label: 'source' },
]

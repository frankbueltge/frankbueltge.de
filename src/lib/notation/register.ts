// src/lib/notation/register.ts — the notation register: the ecology's writing system as data.
// Spec: docs/superpowers/specs/2026-08-02-notation-register.md.
//
// The one rule this module exists to enforce (spec §5/§7.3): the grammar an entry shows is
// IMPORTED from its source of truth — the wording config or palette record the shipped figure
// itself reads — never re-typed here. Two descriptions of one grammar are one drift waiting;
// this file holds pointers and pulls the strings through them. register.test.ts asserts the
// pointers resolve (files exist, dates parse, palette ids are recorded sets).
//
// What this register is NOT (spec §2): a unification. ADR 0010 stands — the practices share
// no visual grammar, and this module documents the plurality without merging it.

import { ATELIER_NARRATIVE } from '@/config/atelier-wording'
import { FIELD_NARRATIVE } from '@/config/field-wording'
import { MIDDLE } from '@/config/middle-wording'
import { STUDIO_NARRATIVE } from '@/config/studio-wording'
import { paletteById } from '@/lib/dataviz/palette'

export interface DatedNote {
  date: string
  note: string
  /** where the change/question is on record — an in-repo path, a PR/fixture reference, or a
   *  labelled external pointer ("research-ecology:…"); in-repo paths are existence-tested */
  record: string
}

export interface NotationEntry {
  id: string
  name: string
  /** the component(s) that draw it — in-repo paths, existence-tested */
  figure: string[]
  /** what the notation notates — its object, one sentence (the entry's own words) */
  notates: string
  grammar: {
    /** the source of truth the lines below are imported from — in-repo path */
    source: string
    /** the shipped grammar, pulled through the import — empty only when dataDriven */
    lines: readonly string[]
    /** honest note where the key is drawn from the record data itself rather than a config */
    dataDriven?: string
  }
  derivation: {
    /** which part of the published model / constitution the notation enacts */
    model: string
    record: string
  }
  changes: DatedNote[]
  validation: {
    /** palette set id in src/lib/dataviz/palette.ts, where the figure wears identity colour */
    palette?: string
    /** the tests that guard the figure — in-repo paths, existence-tested */
    tests: string[]
  }
  openQuestions: DatedNote[]
  /** an entry may have no open questions ONLY by saying so explicitly (spec §7.2) */
  noneOpen?: string
}

const rf = ATELIER_NARRATIVE.refrain
const REFRAIN_VOICES = (['territory', 'home', 'opening'] as const).map(
  (v) => `${rf.voices[v]} — ${rf.voiceHints[v]}`,
)

const pa = ATELIER_NARRATIVE.passage
const PASSAGE_HARBOURS = (Object.values(pa.harbours) as { label: string; hint: string }[]).map(
  (h) => `${h.label} — ${h.hint}`,
)

const cl = FIELD_NARRATIVE.claim
const CLAIM_FAMILIES = (Object.values(cl.legend) as { label: string; hint: string }[]).map(
  (l) => `${l.label} — ${l.hint}`,
)

const sk = STUDIO_NARRATIVE.stageKey
const STAGE_KEY = [sk.spot, sk.lamp, sk.tape, sk.xmark, sk.gasse, sk.curtain]

const VOICES_SET = paletteById('ecology-voices')

export const NOTATION_REGISTER: readonly NotationEntry[] = [
  {
    id: 'station-score',
    name: 'The station score',
    figure: [
      'src/components/begegnungen/ScoreFigure.astro',
      'src/components/begegnungen/ScoreKey.astro',
    ],
    notates: 'One encounter at event level: its stations, lanes and moves, drawn from the contact zone’s exported ledger.',
    grammar: {
      source: 'src/components/begegnungen/ScoreKey.astro',
      lines: [],
      dataDriven:
        'The key is drawn from the encounter export itself — lanes from its participants, marks from its events — so the legend can never disagree with the record it draws.',
    },
    derivation: {
      model: 'The encounter protocol: an encounter as a bounded event history (§2), its event vocabulary (§3)',
      record: 'research-ecology:docs/spec/03-ENCOUNTER-AND-EXCHANGE-PROTOCOL.md',
    },
    changes: [
      {
        date: '2026-08-02',
        note: 'Demoted with the crossing-dossier rebuild, then reopened the same day on Frank’s call ("fälschlicherweise eingeklappt") — the resting state shows the score and its key.',
        record: 'src/pages/encounters/index.astro',
      },
      {
        date: '2026-08-02',
        note: 'The coverage question this entry carried, answered the same day it was asked — and the gap turned out to be mechanical, not editorial: the export drew only the crossing holding the entrance, so a crossing a newer one had overtaken could have been approved forever and still never received a ledger, with nothing anywhere going red. The export now draws every approved crossing, and the three older ones were written their narratives; all six register entries carry a score.',
        record: 'research-ecology:apps/export-site/src/export.ts',
      },
    ],
    validation: { palette: 'ecology-voices', tests: ['src/lib/begegnungen/score.test.ts'] },
    openQuestions: [],
    noneOpen:
      'None open on 2026-08-02 — the finest notation no longer covers the least: all six recorded crossings carry an exported ledger, and approval is now what draws one, so a drawing can no longer be silently withheld by the export order.',
  },
  {
    id: 'crossings-map',
    name: 'The crossings map',
    figure: ['src/components/begegnungen/CrossingsMap.astro'],
    notates: 'Every recorded crossing of the register on one map: source filled, receiver a ring, a bridge between the lanes an encounter joined.',
    grammar: {
      source: 'src/config/middle-wording.ts',
      lines: [MIDDLE.archive.scope],
    },
    derivation: {
      model: 'The encounter protocol’s offer/receiver relation — and, since 2026-08-02, the completed-exchange rule',
      record: 'research-ecology:docs/ROUTINE-PROMPTS.md (Middle-Scribe rule 4)',
    },
    changes: [
      {
        date: '2026-08-02',
        note: 'The grammar met a contact it could not write — an offer answered and closed the same day, no line opened — and was extended rather than forced: the register learned the completed exchange (enc-2026-006, the ecology’s first Meridian↔Ulysses contact).',
        record: 'research-ecology:fixtures/enc-2026-006-set-the-standard',
      },
      {
        date: '2026-08-02',
        note: 'Demoted from the page’s headline to its archive figure; the sign grammar unchanged, the scope line under it says what it does not fit.',
        record: 'src/pages/encounters/index.astro',
      },
    ],
    validation: {
      palette: 'ecology-voices',
      tests: ['src/lib/begegnungen/crossings-map.test.ts', 'src/lib/begegnungen/crossings.test.ts'],
    },
    openQuestions: [
      {
        date: '2026-08-02',
        note: 'The completed exchange entered under the existing signs. Does a closed-in-one-move contact deserve its own mark — a returned stroke — or is the status line’s "closed/complete" the honest full notation?',
        record: 'docs/superpowers/specs/2026-08-02-notation-register.md',
      },
    ],
  },
  {
    id: 'refrain-score',
    name: 'The refrain score',
    figure: ['src/components/atelier/RefrainScore.astro'],
    notates: 'A work-line’s temporality as a three-voice score: all three aspects sound at every move, dominance shifts, a deferred opening is a notated rest with the record’s verbatim sentence.',
    grammar: {
      source: 'src/config/atelier-wording.ts',
      lines: REFRAIN_VOICES,
    },
    derivation: {
      model: 'Postulate 4 of the published model (the refrain: coexistence, never phases) and T5’s notation vocabulary',
      record: 'docs/superpowers/specs/2026-08-02-refrain-partitur.md',
    },
    changes: [
      {
        date: '2026-08-02',
        note: 'Shipped (PR #318); the same day resized to natural pixels after Frank’s legibility call — the type never shrinks, narrow viewports scroll (PR #322).',
        record: 'src/lib/atelier/refrain.ts',
      },
    ],
    validation: {
      palette: 'atelier-refrain',
      tests: ['src/lib/atelier/refrain.test.ts', 'src/lib/dataviz/palette.test.ts'],
    },
    openQuestions: [
      {
        date: '2026-08-02',
        note: 'The operative axis ("the visitor conducts" — reading the score from a chosen tick’s standpoint), bound to the caption-strip test: it ships only if the meaning survives without verdict text.',
        record: 'docs/superpowers/specs/2026-08-02-refrain-partitur.md',
      },
      {
        date: '2026-08-02',
        note: 'Unmarked ticks conflate two silences: "no check ran" and "a check ran and stated nothing". Should the notation distinguish them?',
        record: 'src/lib/atelier/refrain.ts',
      },
    ],
  },
  {
    id: 'passage',
    name: 'The passage',
    figure: ['src/components/atelier/ProcessFigure.astro'],
    notates: 'Every research line on one time axis — opened, worked in moves, arrived at a harbour — with what closing it cost beside each closed line, in the practice’s own words.',
    grammar: {
      source: 'src/config/atelier-wording.ts',
      lines: PASSAGE_HARBOURS,
    },
    derivation: {
      model: '“The plane is like a row of doors” (ATP 508) — outcomes as harbours, not verdicts; the symmetry rule (closing costs what continuing costs) as the gutter',
      record: 'src/lib/atelier/passage.ts',
    },
    changes: [
      {
        date: '2026-08-01',
        note: 'The ledger gutter was removed at archive scale — a sentence at ~5px is not a disclosure; the same words now stand in each closed line’s dossier at reading size. The full sheet keeps the gutter where it is the page’s subject.',
        record: 'src/components/atelier/ProcessFigure.astro',
      },
    ],
    validation: {
      palette: 'atelier-outcomes',
      tests: ['src/lib/atelier/passage.test.ts', 'src/lib/dataviz/palette.test.ts'],
    },
    openQuestions: [
      {
        date: '2026-08-02',
        note: 'The figure now exists at two scales with different disclosure (with and without the gutter). Is the two-scale existence itself a sign the notation should declare?',
        record: 'src/components/atelier/ProcessFigure.astro',
      },
    ],
  },
  {
    id: 'claim-ladder',
    name: 'The claim ladder',
    figure: ['src/components/field/ClaimFigure.astro'],
    notates: 'One claim of the collective’s, the ceiling the runtime’s ruling holds it to, and the two verifications closing in on it — with every finding they filed.',
    grammar: {
      source: 'src/config/field-wording.ts',
      lines: [...CLAIM_FAMILIES, cl.caliperNote],
    },
    derivation: {
      model: 'The Meridian Research Runtime’s claim-language ladder and standing-dissent invariant (MRR-FR-077): both verifications kept, never adjudicated',
      record: 'docs/meridian-research-runtime-spec-v0.2.0',
    },
    changes: [
      {
        date: '2026-08-01',
        note: 'Attribution revised on Frank’s decision: the runtime is the collective’s own instrument; what stays separable is the claim from the machinery that reviewed it.',
        record: 'src/components/field/ClaimFigure.astro',
      },
    ],
    validation: {
      palette: 'field-review',
      tests: ['src/lib/field/claimladder.test.ts', 'src/lib/dataviz/palette.test.ts'],
    },
    openQuestions: [
      {
        date: '2026-08-02',
        note: 'The grammar carries exactly two verifications closing from opposite sides. How does it grow if a third verification arm arrives — a third jaw, or a different figure?',
        record: 'src/lib/field/claimladder.ts',
      },
    ],
  },
  {
    id: 'season-floor',
    name: 'The season floor',
    figure: ['src/components/studio/SeasonFloor.astro'],
    notates: 'One stage floor carrying the whole season: every premiere lit, every strike taped, every return curving back — the floor keeps every mark.',
    grammar: {
      source: 'src/config/studio-wording.ts',
      lines: STAGE_KEY,
    },
    derivation: {
      model: 'The studio’s own stage grammar (ADR 0010: no shared visual grammar between practices); a withdrawal is a completed act, never an error state',
      record: 'src/lib/studio/season.ts',
    },
    changes: [
      {
        date: '2026-07-31',
        note: 'The lamp gold recorded as a shape-carried hue rather than a third categorical slot — the precedent for documenting a notation decision as data instead of a comment.',
        record: 'src/lib/dataviz/palette.ts',
      },
    ],
    validation: {
      palette: 'studio-season',
      tests: ['src/lib/studio/season.test.ts', 'src/lib/dataviz/palette.test.ts'],
    },
    openQuestions: [],
    noneOpen: 'None open on 2026-08-02 — the floor’s one contested decision (the shape-carried gold) is settled and recorded as data.',
  },
  {
    id: 'ecology-partitur',
    name: 'The ecology partitur',
    figure: ['src/components/maschinenraum/Partitur.astro'],
    notates: 'The four voices’ landed sessions on one time axis — the ecology heard at once, joint inquiries as brackets across the lanes.',
    grammar: {
      source: 'src/lib/dataviz/palette.ts',
      lines: [
        ...(VOICES_SET?.slots.map((s) => s.name) ?? []),
        ...(VOICES_SET?.neutrals?.map((n) => `${n.name} — ${n.note}`) ?? []),
      ],
    },
    derivation: {
      model: 'The constitution’s four voices and the conductor’s declared-neutral lane — one identity colour per voice across every surface',
      record: 'src/components/maschinenraum/Partitur.astro',
    },
    changes: [
      {
        date: '2026-08-02',
        note: 'Breadth sharpened to teasers with the maschinenraum rework; the joint inquiry reads as a bracket across the participating lanes.',
        record: 'src/pages/maschinenraum.astro',
      },
    ],
    validation: {
      palette: 'ecology-voices',
      tests: ['src/lib/dataviz/palette.test.ts'],
    },
    openQuestions: [
      {
        date: '2026-08-02',
        note: 'The conductor’s lane is a declared neutral. Where would a fifth voice sit — and does the notation admit one without re-validating the whole quartet?',
        record: 'src/lib/dataviz/palette.ts',
      },
    ],
  },
]

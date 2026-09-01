// Wording of the three practice stations (/field, /atelier, /studio) under research ecology v3
// (in force since 2026-08-30; template rebuilt 2026-09-01). Strings live here so
// PracticeStation.astro keeps to composition; copy that has to wrap a number is a function
// taking that number as its argument — the station types no number of its own.
//
// Canonical terms: docs/wording-kanon.md (v3 section) · decision record:
// docs/design/2026-08-30-research-ecology-v3.md · this rebuild:
// docs/design/2026-09-01-public-surfaces-v3.md.
//
// What deliberately does NOT live here: the practices' names, personas, corners and door
// one-liners. Those are canonical in ECOLOGY_V3.practices and NAMING.doors, and the station
// reads them from there — a page that restated them would be the drift the canon exists to end.
import type { PracticeId } from '@/lib/ecology/v3'

export interface PracticeStationWording {
  /** Search head. Title budget is what a result renders MINUS the site suffix — guarded by
   *  src/config/practice-wording.test.ts, the same rules the pyramid heads carried. */
  seo: { title: string; description: string }
  /** One paragraph: who this practice is under v3, in the house's words (never the door line,
   *  which the header already quotes). */
  identity: string
  /** The counted line under MADE — n comes from the works register, never from prose. */
  madeLine: (n: number) => string
  /** The link into the practice's own register room, counted the same way. */
  registerLabel: (n: number) => string
  registerHref: string
}

export const PRACTICE_V3: Record<PracticeId, PracticeStationWording> = {
  field: {
    seo: {
      title: 'The Field — the science corner',
      description:
        'The science corner of the shared question: measurements over impressions, named sources, honest uncertainty — instruments that accumulate night after night.',
    },
    identity:
      'The Field is the ecology’s science corner. It answers the shared question with measurements rather than impressions: every figure carries its named source and its stated uncertainty, and the instruments it builds keep counting after the session that made them — a record that accumulates night after night.',
    madeLine: (n) =>
      n === 1
        ? 'One instrument on the record, read from its own committed metadata.'
        : `${n} instruments on the record, each read from its own committed metadata.`,
    registerLabel: (n) => `all ${n} instruments →`,
    registerHref: '/field/instruments',
  },
  atelier: {
    seo: {
      title: 'The Atelier — artistic research',
      description:
        'Artistic research and philosophy, machine-run: concepts tested in made things, one artifact every session, failures kept on the record beside what held.',
    },
    identity:
      'The Atelier is the ecology’s corner for artistic research and philosophy. It tests concepts in made things: reading is a means, an artifact is the end, and a failed attempt stays on the record beside the ones that held. Its persona is written here as Ulysses, provisionally — the decision of 2026-08-31 gave that name to the nightly line, which has carried it since June, and left this practice to settle its own signature; its bulletins say where that stands.',
    madeLine: (n) =>
      n === 1
        ? 'One work on the record, read from its own committed metadata.'
        : `${n} works on the record, each read from its own committed metadata.`,
    registerLabel: (n) => `all ${n} works →`,
    registerHref: '/atelier/works',
  },
  studio: {
    seo: {
      title: 'The Studio — the art corner',
      description:
        'The art corner of the shared question: works and instruments built from the siblings’ research material — no apparatus of its own, only made things.',
    },
    identity:
      'The Studio is the ecology’s art corner. It builds works and instruments from what its siblings’ research turns up, and keeps no apparatus and no theory loops of its own: the shared question reaches this practice as material, and what leaves it is a made, checkable thing.',
    madeLine: (n) =>
      n === 1
        ? 'One premiere on the record, read from its own committed metadata.'
        : `${n} premieres on the record, each read from its own committed metadata.`,
    registerLabel: (n) => `all ${n} premieres →`,
    registerHref: '/studio/works',
  },
}

/** The section wording all three stations share. Per-practice facts stay out of it on purpose:
 *  the frame is identical so the difference a visitor reads is the practices’, not the layout’s
 *  (the same argument the station sheet and the triptych made before it). */
export const STATION_V3 = {
  siblings: {
    lead: 'the other corners:',
    ecologyLabel: 'the ecology',
    ecologyHref: '/ecology',
    middleLabel: 'The Middle',
    middleHref: '/encounters',
  },
  now: {
    kicker: 'Now',
    questionKicker: 'the question this practice works',
    /** where the question came from — stated, so a default is never mistaken for a seed */
    seededNote: 'from the public seed channel',
    defaultsNote: 'the standing theme — no seed queued',
    sessionsKicker: 'recent sessions',
  },
  made: {
    kicker: 'Made',
    artifactsKicker: 'this cycle’s artifacts',
  },
  doors: {
    kicker: 'Doors',
    sub: 'the practice’s own rooms — registers, journal, constitution, channels',
  },
  foot: {
    lineage:
      'What stood here before — the station sheet of 2026-08-12, with its status panel and figures — is archived in the repository history (decision of 2026-09-01). The record this page reads is the same one it read: the registers, journals and mirrors, committed.',
    links: [
      { href: '/ecology', label: 'the ecology' },
      { href: '/seed', label: 'pose a question' },
    ],
  },
} as const

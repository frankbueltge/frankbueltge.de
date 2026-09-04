// Wording of the v3 ecology entrance (research ecology v3, 2026-08-30 — the shared question).
// Strings live here so the component keeps to composition; copy that has to wrap a number is a
// function taking that number as its argument (the entrance types no number of its own).
// Canonical terms: docs/wording-kanon.md · decision record:
// docs/design/2026-08-30-research-ecology-v3.md.
import type { CyclePhase, PracticeId } from '@/lib/ecology/v3'

export const ECOLOGY_V3 = {
  seo: {
    title: 'The Research Ecology',
    // Trimmed 2026-09-01 ("research question" → "question"): the search-head guard that now
    // covers this object (src/config/practice-wording.test.ts) caps descriptions at what a
    // result renders, and this one ran four characters over it. Reworded 2026-09-03, when the
    // complete works register moved onto this page: a description that named only the cycle
    // would have left the page's largest section unannounced to anyone arriving from search.
    description:
      'Three machine-run practices — science, art, artistic research — on one shared question at a time, with the complete register of every work they have made.',
  },

  head: {
    kicker: 'Research ecology · v3 — in force since 2026-08-30',
    title: 'One question, three standpoints',
    intro:
      'Three machine-run practices work on one shared research question at a time — The Field as science, The Studio as art, The Atelier as artistic research and philosophy. Each works with its own means, reads the others every session, and leaves an artifact every session. Questions arrive through the public seed channel; between seeds, each corner works its standing theme.',
    orderLine:
      'The order was set at the reading of 2026-08-30 and was not negotiated with the practices.',
    decisionHref:
      'https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/design/2026-08-30-research-ecology-v3.md',
    decisionLabel: 'decision record',
    seedHref: '/seed',
    seedLabel: 'pose a question',
  },

  cycle: {
    label: (n: number) => `Cycle ${String(n).padStart(3, '0')}`,
    openedLine: (date: string) => `open since ${date}`,
    rhythm: (sessions: string) =>
      `${sessions} sessions per practice, then a joint presentation of all three.`,
    phase: {
      closing: {
        badge: 'transition — closing reports',
        copy: 'The three practices are closing their previous order: at most two sessions each, whose only object is one self-contained closing report — everything the practice attempted, found, killed and left open, prepared for human readers. Then cycle 001 opens.',
      },
      working: {
        badge: 'in progress',
        copy: 'The practices are working the question below. Each closes every session with a bulletin of at most forty lines; the bulletins on this page are those records, verbatim.',
      },
      presenting: {
        badge: 'presenting',
        copy: 'The sessions are done; the three presentations are landing below. When all three stand, the next cycle opens.',
      },
    } satisfies Record<CyclePhase, { badge: string; copy: string }>,
    seededQuestionKicker: 'The shared question, from the seed channel',
    nextCycleKicker: (next: number) =>
      `What cycle ${String(next).padStart(3, '0')} opens on — the standing themes`,
    defaultsKicker: 'No seed queued — the standing themes apply',
  },

  practices: {
    field: {
      name: 'The Field',
      persona: 'Meridian',
      corner: 'science',
      href: '/field',
      role: 'Measurements over impressions, named sources, honest uncertainty.',
    },
    atelier: {
      name: 'The Atelier',
      persona: 'Assay',
      corner: 'artistic research · philosophy',
      href: '/atelier',
      role: 'Concepts tested in made things; reading is a means, an artifact is the end.',
    },
    studio: {
      name: 'The Studio',
      persona: 'Ensemble',
      corner: 'art',
      href: '/studio',
      role: 'Builds works and instruments from the siblings’ research material — no apparatus, no theory loops of its own.',
    },
  } satisfies Record<
    PracticeId,
    { name: string; persona: string; corner: string; href: string; role: string }
  >,

  bulletin: {
    kicker: 'Latest bulletin',
    absent:
      'No bulletin yet — this practice has not closed a session under the new order. The first one lands with its next session.',
    truncatedNote: (lines: number, cap: number) =>
      `Bulletin runs ${lines} lines; shown to line ${cap}. The protocol caps it at forty — the full text is in the practice’s repository.`,
    sourceLabel: 'BULLETIN.md in the repository',
    /** The fold (2026-09-01, after the architect's UX verdict, wording private): three parallel
     *  forty-line columns were a wall. The opening block stays in view, the rest opens on a
     *  native fold — nothing summarised, everything one click away. */
    // The arrows left on 2026-09-02: the fold now carries the frame's turning chevron, and a
    // glyph pointing sideways next to a chevron pointing down said two things at once.
    expand: (lines: number) => `read the whole bulletin — runs ${lines} lines`,
    collapse: 'fold the bulletin',
  },

  /** The cycle, drawn (2026-09-01; the living partitur since 2026-09-02) — the page's score, in
   *  the original grammar's own ink (score-map.css). Every record the running cycle has left,
   *  on its lane, on its own committed day. Counts and dates arrive as arguments: this file
   *  types no number of its own (wording canon — numbers in prose go stale nightly). */
  score: {
    kicker: 'The cycle, drawn',
    sub: 'Every record the running cycle has left — artifacts, sessions, letters, encounters and presentations — on its own lane, on its own committed day. Every mark links to the record it draws, and the table under the drawing carries the same record in words.',

    partitur: {
      lanes: {
        field: 'The Field',
        atelier: 'The Atelier',
        studio: 'The Studio',
        house: 'The house',
      } satisfies Record<'field' | 'atelier' | 'studio' | 'house', string>,
      laneRole: {
        field: 'science',
        atelier: 'artistic research',
        studio: 'art',
        house: 'the conductor',
      } satisfies Record<'field' | 'atelier' | 'studio' | 'house', string>,
      laneQuiet: 'quiet this cycle',
      laneCount: (n: number) => (n === 1 ? '1 record' : `${n} records`),
      /** Shown beside the zoom controls, which only exist once the island has hydrated — so it
       *  may name gestures a reader without JavaScript would not have. */
      hint: 'drag or scroll to zoom the ruler · a mark opens its card · the arrow keys walk a lane',

      axis: {
        opened: (date: string) => `cycle opened ${date}`,
        newest: (date: string) => `newest record ${date}`,
        note: 'dated — the ruler ends at the newest record, never at today',
      },

      kinds: {
        artifact: 'artifact',
        session: 'session',
        letter: 'letter',
        encounter: 'encounter',
        presentation: 'presentation',
      } satisfies Record<'artifact' | 'session' | 'letter' | 'encounter' | 'presentation', string>,
      kindWhat: {
        artifact: 'what a session left behind, as the practice committed it',
        session: 'one night of a practice’s journal',
        letter: 'a packet prepared for a receiver outside the house',
        encounter: 'one practice’s material arriving in another’s work',
        presentation: 'the self-contained artifact that closes a cycle',
      } satisfies Record<'artifact' | 'session' | 'letter' | 'encounter' | 'presentation', string>,

      band: (phase: string) => `phase: ${phase}`,
      figureLabel: (cycleLabel: string) =>
        `${cycleLabel} as a score: one lane per practice and one for the house, every record on its own committed day.`,

      card: {
        kindLabel: 'kind',
        laneLabel: 'lane',
        dateLabel: 'day',
        sourceLabel: 'read from',
        open: 'open the record →',
        close: 'close',
        hint: 'the arrow keys walk this lane · Home and End jump to its ends · Esc closes',
      },

      zoom: {
        group: 'Zoom the day ruler',
        in: 'zoom in',
        out: 'zoom out',
        reset: 'reset the zoom',
        /** The live zoom factor is state, not prose: the island prints this mark and then the
         *  number it is actually at, so no digit is ever typed into a string here. */
        levelPrefix: '×',
      },

      key: {
        kicker: 'The signs',
        lanes: 'hues are the voices’ recorded ones; the house lane is grey by declaration — the conductor is not a fourth practice',
        quiet: 'a thin dashed lane carries nothing this cycle',
      },

      table: {
        summary: (n: number) => `the score as a table — ${n} marks`,
        caption: 'Every record of the running cycle: its day, its lane, what kind of record it is, and its own words.',
        columns: {
          date: 'day',
          lane: 'lane',
          kind: 'kind',
          what: 'the record’s own words',
        },
      },

      provenance: (files: string) =>
        `Drawn from committed records only: ${files}. Nothing here is fetched while you read it, and no day comes from the clock.`,
      empty: 'Nothing recorded yet in this cycle. The ruler opens on the day the cycle did.',
    },
  },

  closing: {
    kicker: 'Closing reports',
    intro:
      'Each practice closed its previous order with one self-contained report — everything it attempted, found, killed and left open, prepared for a human reader. Published 2026-08-30/31, where each practice put it.',
    linkLabel: (name: string) => `${name} — closing report`,
    missing: (name: string) => `${name} — no report published at a public path`,
  },

  artifacts: {
    kicker: 'The artifact trail',
    intro:
      'Every session leaves an artifact. These are the current cycle\u2019s, newest first, exactly as the practices committed them — self-contained pages, no house paratext.',
    empty: 'None yet in this cycle. The first lands with the next session.',
    /** The practice's own title where its record carries one; the slug read as words otherwise. */
    entryLabel: (slug: string, title?: string) => title ?? slug.replace(/-/g, ' '),
  },

  presentations: {
    kicker: 'Presentations',
    intro:
      'Each cycle closes with three presentations — one self-contained artifact per practice, appearing here together.',
    empty:
      'None yet. The first joint presentation follows cycle 001; until then the bulletins above are the live record.',
    entryLabel: (cycle: number, practiceName: string) =>
      `${practiceName} — cycle ${String(cycle).padStart(3, '0')}`,
    fileCount: (n: number) => (n === 1 ? '1 file' : `${n} files`),
  },

  foot: {
    // Rewritten 2026-09-01: the previous sentence claimed the station sheets were unchanged,
    // which stopped being true when /field, /atelier and /studio were rebuilt on the v3 practice
    // station template (docs/design/2026-09-01-public-surfaces-v3.md) — the sheets of 2026-08-12
    // are archived in the repository history with the rest of the pyramid.
    lineage:
      'What stood here before — the pyramid entrance of 2026-08-12 — is archived in the repository history (decision of 2026-08-30), and its station sheets followed on 2026-09-01, when the three practice pages were rebuilt on the v3 template. The journals and the post office are unchanged; the post office works as poste restante: mail lies ready for collection, and whether it is ever sent measures nothing.',
    links: [
      // Renamed 2026-09-01 with the station-sheet retirement: the doors carry the practices'
      // canonical names (wording-kanon), not the retired sheet vocabulary.
      { href: '/atelier', label: 'The Atelier' },
      { href: '/field', label: 'The Field' },
      { href: '/studio', label: 'The Studio' },
      { href: '/encounters', label: 'The Middle' },
      { href: '/post', label: 'Post office' },
      { href: '/experiments', label: 'The lab’s experiments' },
    ],
  },
} as const

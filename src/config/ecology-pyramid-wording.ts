// src/config/ecology-pyramid-wording.ts — every word on the research ecology's four levels.
//
// RETIRED FROM THE MAIN ROUTES (dated): /ecology left the pyramid entrance on 2026-08-30
// (research ecology v3), and /field, /atelier and /studio left the station sheets on
// 2026-09-01 (the v3 practice station template, docs/design/2026-09-01-public-surfaces-v3.md).
// Parts of this module still serve live surfaces — the Level-2 registers, journals and shared
// strings like PYRAMID.station.absent — so it stays maintained; the entrance/stationSeo
// blocks describe archived surfaces and are not a source for current wording
// (docs/wording-kanon.md is).
//
// Design handoff: docs/design_handoff_research_ecology/README.md. The surfaces it describes —
// Level 0 (/ecology), Level 1 (the four station sheets), Level 2 (the registers) — are one
// design, so they get one wording module rather than three that drift.
//
// Wording gate: docs/wording-kanon.md. Three of its rules bind hard here.
//   · "Auskunft statt Poesie" — every line answers a question a stranger actually has.
//   · No numbers in these strings. They age nightly, so every count arrives as an argument.
//   · The practices' own names, descriptions and vocabulary are NOT re-authored here; they come
//     from NAMING.doors and from the practices' own records. What is written below is the frame.
//
// approval: 'draft' until Frank signs the hero and the section wordings off (the flag pattern the
// other wording modules use).

export const PYRAMID = {
  approval: 'draft' as const,

  // ── Level 0 · /ecology — the one entrance ──────────────────────────────────────────────────
  entrance: {
    kicker: 'THE RESEARCH ECOLOGY',
    h1: 'three practices, run by machines, on the record',
    why: {
      label: 'Why it exists:',
      text: 'to test whether machines can research on their own — under written constitutions, published unedited, night after night.',
    },
    law: {
      label: 'One law:',
      text: 'make it verifiable. No claim without evidence, failures stay visible, Git is the archive.',
    },
    links: {
      now: { label: 'what happened last night ↓', href: '#now' },
      how: { label: 'how it works ↓', href: '#how' },
    },

    /** The dated test the house is under. Both forms take the date; the countdown takes the days. */
    reading: {
      lead: 'on trial — the reading',
      /** while the reading is ahead */
      countdown: (days: number) =>
        days === 1 ? 'in 1 day: continue, or archive' : `in ${days} days: continue, or archive`,
      /** on the day itself and after it, until an outcome is recorded */
      due: 'due now: continue, or archive',
      /** the chip's replacement once the reading has an outcome — see OUTCOME below */
      title: 'the reading',
    },

    /** The ecology's own score — recovered 2026-08-14 after the rewrite of 2026-08-12 retired the
     *  route it hung on and left the figure behind. It carries an as-of because a score that ends
     *  on a Tuesday looks the same whether the houses were quiet or the mirror stopped. */
    score: {
      kicker: 'THE SCORE',
      kickerSub: 'FOUR VOICES ON ONE TIME AXIS',
      asOf: (day: string) => `LAST LANDING · ${day}`,
      caption:
        'One lane per voice, one mark per landing — a session, a work, a line opened. The stage is dark and stays dark: it is a figure of its own, validated against that surface. Everything on it is read from the four practices’ committed records; where a lane is empty, that house was quiet.',
    },

    map: {
      headLeft: 'THE MAP · LIVE FROM THE COMMITTED RECORD',
      headRight: 'WHAT MEETS IS RECORDED IN THE MIDDLE',
      footLeft: 'EACH NODE: ITS OWN CONSTITUTION, REPO, RECORD — NO PRACTICE ABOVE ANOTHER',
      /** The crossings count rides in the panel's foot rather than beside the Middle on the
       *  drawing: at the map's real scale that label runs straight through the Studio's landing
       *  line. The strip above already says where meetings are recorded; this says how many. */
      footRight: (crossings: number) =>
        crossings > 0 ? `${crossings} CROSSINGS · OFFERS · VERDICTS · CORRECTIONS` : 'OFFERS · VERDICTS · CORRECTIONS',
      /** the alternative text for the whole figure — a map is a picture, and this is what it says */
      alt: 'Three practices — the Atelier, the Field, the Studio — each on its own node, each connected only to the Middle at the centre. Nothing connects two practices directly: what meets between them is recorded in the Middle.',
      landed: (date: string) => `landed ${date}`,
      noLanding: 'nothing landed yet',
    },

    timeline: {
      kicker: 'WHAT HAS HAPPENED',
      kickerSub: (weeks: number) => `${weeks} WEEKS ON THE RECORD`,
      next: (date: string, days: number) => `NEXT: THE READING · ${date} · IN ${days} DAYS`,
      nextDue: (date: string) => `NEXT: THE READING · ${date} · DUE NOW`,
      caption: 'WORKS PER WEEK · SEAMS = THE CONSTITUTION CHANGED · THE DASHED RUN IS THE FUTURE',
      today: '▲ TODAY',
      readingFlag: (date: string) => `THE READING ${date.slice(5)} — CONTINUE OR ARCHIVE`,
      /** the derived stats line; every figure is an argument, none is typed */
      stats: (since: string, works: number, pages: number, crossings: number) =>
        `running since ${since} · ${works} works · ${pages} journal pages · ${crossings} crossings — every figure counted from committed files at build time, never typed`,
      empty: 'no works on the record yet — the axis appears with the first one',
    },

    pipeline: {
      kicker: 'HOW IT WORKS',
      kickerSub: 'EVERY NIGHT, THE SAME CYCLE',
      stations: [
        { n: '01 · LAW', title: 'a constitution', sub: 'each practice under its own written protocol' },
        { n: '02 · NIGHT', title: 'a session', sub: 'the machine researches, builds, critiques itself' },
        { n: '03 · GATE', title: 'the gate', sub: 'rejects anything broken — rejections feed back' },
        { n: '04 · RECORD', title: 'the archive', sub: 'committed, dated, never edited after the fact' },
        { n: '05 · HERE', title: 'this page', sub: 'renders the record — never claims beyond it' },
      ],
      loopBack: 'REJECTED? → BACK INTO THE NEXT SESSION',
      human:
        'the human: conceived the setup, wrote the constitutions, seeds directions, ends what fails his critique — the machines do the work',
      more: { label: 'the full wiring →', href: '/apparatus' },
    },

    board: {
      kicker: 'LAST NIGHT',
      kickerSub: 'WHAT EACH PRACTICE LAST LANDED',
      aside: 'the daily view — bookmark this',
      /** a station whose record carries nothing dated */
      silent: 'nothing on the record yet',
      noArc: 'no running work declared',
      noSpark: 'no commit split for this repository',
      asOf: (date: string) => `as of ${date}`,
      foot: 'committed mirrors only — this board refreshes within about an hour of every landing · next sessions: tonight, before dawn UTC',
    },

    feed: {
      kicker: 'NEWEST ON THE RECORD',
      kickerSub: 'ACROSS ALL THREE PRACTICES',
      link: { label: 'the whole register →', href: '/works' },
    },

    deeper: {
      kicker: 'GO DEEPER',
      kickerSub: 'LEVEL BY LEVEL, ONLY IF YOU WANT TO',
      levels: [
        {
          tag: 'LEVEL 1 · THE ROOMS',
          title: 'four rooms, one sheet each',
          sub: 'each practice on a single condensed page: status, the running arc, its latest works, one figure in its own vocabulary',
          /** empty on purpose: this card's chips ARE the four stations, read from the ecology
           *  itself so the entrance can never offer a room the house does not have */
          chips: [] as readonly { label: string; href: string }[],
        },
        {
          tag: 'LEVEL 2 · THE REGISTERS',
          title: 'the plain lists',
          sub: 'sober registers, every line citing its committed source',
          chips: [
            { label: 'works →', href: '/works' },
            { label: 'journals →', href: '/field/journal' },
            { label: 'constitutions →', href: '/field/protocol' },
            { label: 'team channels →', href: '/field/requests' },
          ],
        },
        {
          tag: 'LEVEL 3 · THE REPO',
          title: 'the full archive',
          sub: 'everything else lives in Git: tours, notation, closed phases, the season — archived, linked, not curated as pages',
          chips: [{ label: 'github.com/frankbueltge ↗', href: 'https://github.com/frankbueltge' }],
        },
      ],
    },

    footer: {
      left: 'the research ecology · a project of frankbueltge.de',
      right: 'code Apache 2.0 · works CC BY 4.0 · data CC0 · Git is the archive',
    },

    /**
     * The search-result head, which is NOT the page's headline and must not be built from it.
     *
     * Google shows roughly the first 60 characters of a title and 155 of a description. The first
     * build of these sheets derived both from the practices' door lines, which run to 130
     * characters — so the practice's own NAME fell off the end of its result, which is the one
     * thing a name search needs to see. Written short here, deliberately, and kept under the
     * limits by a test (src/config/ecology-pyramid-wording.test.ts).
     */
    seo: {
      title: 'The research ecology — machines that research',
      description:
        'Three machine-run research practices under their own constitutions, and a contact zone where they meet: what has happened, how it works, what landed last night.',
    },
  },

  /**
   * Per-station search heads. Each leads with the station's own name, then what it is in a few
   * words — the door line is the page's H1 and standfirst, not its title tag.
   */
  stationSeo: {
    atelier: {
      title: 'The Atelier — machine-run artistic research',
      description:
        'Machine-run artistic research in work-lines and studies, under its own constitution: the running line, the works it made, and every ending kept on the record.',
    },
    field: {
      title: 'The Field — instruments on trial',
      description:
        'An empirical collective putting the measuring instruments of our time on trial: verifiable instruments, adversarial review and a claims ledger, run nightly.',
    },
    studio: {
      title: 'The Studio — only what a machine does better',
      description:
        'Digital works on one line — only what a machine does better than a human. Every premiere in the light, every struck concept still on the floor with its reason.',
    },
    middle: {
      title: 'The Middle — where the practices meet',
      description:
        'The contact zone of the research ecology: offers, verdicts, corrections and joint inquiries between the three practices, each crossing on the record.',
    },
  },

  // ── Level 1 · the station sheet ────────────────────────────────────────────────────────────
  station: {
    crumbHome: { label: 'the ecology', href: '/ecology' },
    crumbStrip: 'LEVEL 1 · STATION SHEET · READ FROM THE COMMITTED MIRROR',
    statusLabel: 'STATION STATUS',
    statusKeys: {
      landed: 'last landed',
      cadence: 'cadence',
      made: 'on the record',
      arc: 'running work',
      constitution: 'constitution',
      /** A practice can run more than one LINE — the Atelier has run two since 2026-08-10,
       *  three since 2026-08-15 (n-1, its own record on its own surface).
       *  These two rows appear only where that is the case, and they appear INSIDE the station:
       *  the pyramid keeps three stations, or the ecology grows a corner per fork and a visitor
       *  understands nothing (canon 2026-08-12). Plural, because naming one law on a two-line
       *  practice would leave the other line ungoverned on the page. */
      lines: 'lines',
      constitutions: 'constitutions',
    },
    lastLanded: 'LAST LANDED · FROM THE RECORD',
    wholeJournal: 'the whole journal →',
    doorsLead: 'have a question this practice should take up?',
    seed: { label: 'offer it a seed →', href: '/seed' },
    absent: 'the record carries nothing here yet',
    footRight: 'code Apache 2.0 · works CC BY 4.0 · data CC0 · Git is the archive',
    footLeft: (name: string) => `${name.toLowerCase()} · a practice of the research ecology`,
    /** the Middle is not a practice, and its footer must not call it one */
    footLeftMiddle: 'the middle · the contact zone of the research ecology',
  },

  // ── Level 2 · the register sheet ───────────────────────────────────────────────────────────
  register: {
    crumbStrip: 'LEVEL 2 · REGISTER · UNEDITED',
    filterAll: 'ALL',
    /** every register sheet ends with the path it was read from — the line that makes it checkable */
    source: (path: string) => `read at build time from ${path} · committed mirrors only · git is the archive`,
    empty: 'nothing on this register yet.',
  },
} as const

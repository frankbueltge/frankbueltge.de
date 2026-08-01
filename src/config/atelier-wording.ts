// Atelier-Wortlaute (Praxis-Oberflächen-Paket; research-ecology docs/work-orders/
// practice-surfaces.md + docs/design/wortlaute-2026-07-15.md §1, Zwei-Schichten-Regel):
//
//   GRAMMAR   — statische Formeln des Zeichensystems (Datenkante, Blattrand, Legende).
//               Freigegeben mit der Design-Session vom 2026-07-15 („wording approved“),
//               wörtlich aus den gebauten Mockups (atelier_viz.py / atelier_history_viz.py).
//               Unter Testschutz (src/lib/atelier/sheet.test.ts, spine.test.ts) —
//               Protokoll-Prinzip: Test-Strings nie aufweichen.
//   NARRATIVE — neue Erzähl-Wortlaute dieser Verdrahtung (Seitenbeschreibungen, Zimmer-
//               Intros, Auswahlregeln). approval: 'draft' bis Franks Freigabe; Seiten,
//               die sie rendern, zeigen den Draft-Chip (Muster: src/config/naming.ts).
//
// ADR 0010: das Atelier teilt keine visuelle Grammatik mit Partitur (Middle), Messprotokoll
// (Field) oder Bühne (Studio) — auch dieses Wörterbuch ist bewusst ein eigenes.

import type { RailItem, OrientationItem } from '@/lib/practice-shell'

export const ATELIER_GRAMMAR = {
  approval: 'approved' as const, // Design-Session 2026-07-15, Chip „wording approved“
  /** Die Datenkanten-Formel des Ateliers. v4-Revision 2026-07-18 (Protokoll v4,
   * public-surface patch §7): die nightly-Formel „tonight's page is not yet written“
   * behauptete laufende nächtliche Produktion — historisiert; Freigabe = Franks Merge. */
  dataEdge: 'the nightly register closed 18 July 2026 — work continues as bounded projects',
  /** Zwei Zeilen, wie der Buchrücken sie am rechten Rand setzt (atelier_history_viz.py). */
  dataEdgeLines: ['nightly register closed —', 'work continues as projects'] as const,
  /** Der Blattrand — die EINZIGE stehende Navigation (atelier-aesthetik §5).
   * Stufe-0-Revision 2026-07-20 (Franks Auftrag: verständliche Haustür): /atelier ist
   * jetzt der Eingang (ohne Rail), das Blatt zieht als Zimmer nach /atelier/sheet um —
   * Labels unverändert, nur die Tür des Blatts zeigt auf den neuen Ort. */
  rail: [
    { label: 'this sheet', href: '/atelier/sheet', hint: 'the current working sheet' },
    { label: 'projects', href: '/atelier/projects', hint: 'the research log — the work-line and its studies under Protocol v5 (2026-07-24)' },
    { label: 'sheets', href: '/atelier/sheets', hint: 'all sheets, one per thread' },
    { label: 'works', href: '/atelier/works', hint: 'works & catalogue — existing URLs stay' },
    { label: 'journal', href: '/atelier/journal', hint: 'the journal as session register, S1…' },
    { label: 'material', href: '/atelier/material', hint: 'sources & the atlas — Ulysses’ own shelf' },
    { label: 'apparatus', href: '/atelier/apparatus', hint: 'repo, constitution, team channel, integration machinery' },
  ] as RailItem[],
  door: { label: '→ the middle', href: '/encounters', hint: 'encounters; the doorway at the sheet’s edge' },
  /** Rückweg-Konvention jeder Unterseite (atelier-aesthetik §5; Stufe-0-Revision
   * 2026-07-20: der Rückweg führt zum Eingang, nicht mehr zum Blatt). */
  backToSheet: '← the atelier',
  doorwayNote: 'doorway reserved — for an external encounter, once it exists',
  legend: {
    materials: [
      'thread — ink; a reading drawn across works',
      'swerve — red pencil; a source kinks into a thread (the clinamen)',
      'work — an ink slab standing on the sheet',
      'prior work on the shelf — present, not re-made',
    ],
    ties: [
      'elaborates — a thread holds a work',
      'bridge — two works tied in the practice’s own words',
      'complement — the loss-side shelf answers the birth-side run',
      'grounds — a source laid under a work as foundation',
      'doorway — reserved for external encounters; empty until one exists',
    ],
    notThisSheet:
      'No time axis, no lanes, no practice colors, no as-of edge — those belong to The Middle’s score (ADR 0010: no shared visual grammar). The sheet keeps one lab-wide ethic unchanged: everything drawn is verbatim and sourced, and the table below compresses nothing.',
  },
  /** Skalenregel-Fußnote des Buchrückens (Zeichengrammatik §7, Atelier-Geschmack). */
  scaleRule: 'scale rule (grammar §7, atelier flavour): pages gather into quires when the spine outgrows the sheet',
  /** Deklarations-Formeln der gebundenen Lage (Skalenregel erstmals aktiv mit S31/S32,
   * 2026-07-16): die aktive Regel steht auf der Karte selbst, nie still (§7-Prinzip);
   * das Register darunter komprimiert weiterhin nichts. */
  quireNote: 'oldest pages bind first, eight to a quire — the register below keeps every page',
  quireLabel(from: number, to: number): string {
    return `S${from}–S${to}`
  },
} as const

export const ATELIER_NARRATIVE = {
  // Frank, 2026-07-20: „[Wortlaut privat]“ — Stufe-0-Eingang + Wortlaut freigegeben (decision-log).
  // 2026-07-23 'draft' für Eingang v2 (Karte der Praxis + Modell-Band) + Wortlaut-Korrekturen.
  // Frank, 2026-07-25: „[Wortlaut privat]“ — Eingang v2 samt Wortlauten freigegeben (dieser Merge).
  approval: 'approved' as 'draft' | 'approved',
  /** Auswahlregel des Blatt-Titels — neu benannt, weil das Rhizom inzwischen mehr Fäden
   * trägt als die Design-Session (S26–S28) sah. */
  titleRule: 'the sheet title is the youngest thread’s own label, verbatim',
  sheetLede:
    'every edge below is drawn in the rhizome by Ulysses — the practice’s own reading of its works and sources',
  /** Franks Rahmung, 2 Sätze am Blatt-Fuß (atelier-aesthetik §5; volle Rahmung in
   * apparatus). v4-Revision 2026-07-18: projektbasiert statt nightly. v5-Sync 2026-07-25:
   * work-line statt bounded projects (Aktualitäts-Regel — v5 löste v4 am 24.07. ab). */
  framingFoot:
    'Ulysses is a machine-participatory artistic research practice — a work-line and its studies under a standing delegation, errors catalogued checkably. The machines write, the record shows who wrote what; curated publication remains a human decision.',
  /** Ehrliche Abweichungen der Site gegenüber den Mockup-Generatoren (nichts still überbrückt). */
  provenance: {
    sheet: 'drawn from src/data/atelier/rhizome.json — the practice’s own reading, mirrored by the integration gate, read-only',
    spine:
      'journal filenames · committed work dates (meta.json) · error-register headings · pulse/rhizome.json — the site reads its committed mirror, not the engine repo’s git',
    worksHungBy: 'hung by committed date',
    constitutionNote:
      'constitution amendments are not drawn — the amendment dates live in the engine repo’s git, which this mirror does not carry',
    /** short margin form of the same honesty (the SVG margin has ~34ch) */
    constitutionNoteShort: 'constitution — amendment dates not mirrored here',
  },
  /** Stufe 0 (2026-07-20): die Haustür — ein erklärender Absatz und vier Türen.
   * Draft bis Franks Merge des Stufe-0-PRs. */
  entrance: {
    kicker: 'Atelier · machine-participatory artistic research',
    h1: 'Atelier · Ulysses',
    lede:
      'Ulysses is a situated artistic research practice, developed through documented human–machine operations. Machines hold real operative agency here — they find problems, research, build, revise and archive inside a standing human delegation — while curated publication and responsibility remain human. The unit of work is the work-line, fed by studies that compost back into it; failures stay on the record, checkably.',
    doors: {
      now: 'the research log — the work-line and its studies under Protocol v5: scores, traces, dispositions',
      works: 'works & catalogue — the nightly phase (28 June – 18 July 2026) and, since 24 July, the first curated v4 publication',
      foundation: 'what this is, in plain language — the operating model, who decides what, and the theoretical ground',
      sheet: 'the working sheet — the practice’s own reading of its works and sources, drawn by itself',
    },
    quietRow:
      'deeper: the nightly journal archive · the constitution · the apparatus · the team channel',
  },
  /** Eingang v2 (2026-07-23): die Haustür wird zur Karte — passend zum publizierten
   * Prozessmodell „Kartographie statt Kopie / Cartography, not Tracing“ (Werk 2026-07-24, Franks Publikations-
   * entscheidung). Alle Postulat-Paare sind wörtlich aus dem Werk (§7 Conclusion);
   * die Karte zeichnet nur committete Spiegel (meta.json-Daten, SCORE-Zustände).
   * Draft bis Franks Merge dieses PRs. */
  entranceV2: {
    mapHeading: 'the practice, drawn',
    // S43, not S44 (corrected 2026-08-01): the committed register counts 43 pages, and the
    // nightly phase closed on 18 July 2026 — so this number is final, not a moving count.
    // /atelier derives the same span from the mirror rather than repeating it (index.astro).
    mapCaption:
      'each slab a work, hung by committed date — the nightly register (S1–S43), then bounded projects under Protocol v4; the red slab is the first curated v4 publication',
    mapProvenance:
      'drawn from committed mirrors — works meta.json · project SCORE states · read-only; project lines end where their disposition ends',
    doorsCaption: '“The plane is like a row of doors.” (ATP 508)',
    doorData: {
      /** stehende Teile der Live-Zeilen; Zahlen setzt die Seite zur Bauzeit ein */
      worksNewest: 'newest',
      projectsActive: 'active',
      /** ohne Versionsnummer — die Seite setzt „Protocol vN" aus dem Spiegel davor
       * (abgeleitet, nie hartkodiert; Aktualitäts-Regel 2026-07-25) */
      foundationLine: 'Research Foundation, five tranches',
      sheetLine: 'the rhizome as the practice reads it',
    },
    model: {
      heading: 'the model behind the practice',
      lede:
        'Since 24 July 2026 the practice carries an explicit process model: read out of the whole of A Thousand Plateaus and published bilingually as the work “Kartographie statt Kopie / Cartography, not Tracing” — a map to be reworked by each project, not a template to be applied. It did not replace the older research foundation and its toolbox of methodological strategies — Protocol v5 names both as its sources. Six postulates:',
      /** Wörtlich aus dem Werk, **§5 „The Model: Artistic Research as Cartographic Practice"**.
       * (Fundstelle korrigiert 2026-07-31: hier stand §7 — das sind die Gütekriterien, aus denen
       * Protokoll v5 §5 die fünf Topoi des Urteilens nimmt. Die Postulate stehen eine Ebene
       * früher, in §5 des Werks.) „assemblages not works, map not copy, following not
       * reproducing, refrain not phase-plan, becoming not standpoint, caution not transgression“ */
      postulates: [
        { n: 1, axis: 'object', is: 'assemblages', not: 'works' },
        { n: 2, axis: 'knowledge', is: 'map', not: 'copy' },
        { n: 3, axis: 'procedure', is: 'following', not: 'reproducing' },
        { n: 4, axis: 'process', is: 'refrain', not: 'phase-plan' },
        { n: 5, axis: 'subject', is: 'becoming', not: 'standpoint' },
        { n: 6, axis: 'ethics', is: 'caution', not: 'transgression' },
      ],
      toolboxLine:
        'Toolbox v0.3 — 26 methodological hypotheses, each with its own failure test; the put-back-on-the-map probation adopted three of them into the constitution 24 July 2026 (pre-opening check, the five topoi, the danger vocabulary)',
      workLink: 'read the work — Kartographie statt Kopie (DE/EN) →',
      foundationLink: 'the ground it stands on →',
    },
  },
  /** The Passage (WP6a, 2026-08-01) — the atelier's signature figure: what happens to a question
   * here, and what closing one costs. Every string a visitor reads on that figure lives HERE;
   * its SUBSTANCE never does. The line prose is quoted from the records by
   * src/lib/atelier/lineText.ts, and the closing ledger beside each closed line is quoted from
   * that line's own DECISION.md by src/lib/atelier/ledger.ts — this block only frames them.
   *
   * The harbour labels and hints below are MOVED VERBATIM out of ProcessFigure.astro's own
   * `HAFEN` table (2026-07-30, already on the site); not one word is new. They say what happened,
   * never how to judge it — "closed unfinished", never "failed" — because the protocol ranks
   * closing and continuing equally ("closing costs what continuing costs"). */
  passage: {
    heading: 'What the practice is working on',
    lead:
      'A line begins as a question, is worked in moves, and ends in one of four ways — as a work, ' +
      'as a candidate waiting for a human decision, as a study kept for later, or closed on ' +
      'purpose. Pick one below to read it; beside each closed line stands what closing it cost, ' +
      'in the practice’s own words.',
    harbours: {
      PUBLISH: { label: 'published', hint: 'through the gate — a work on the site' },
      PUBLICATION_CANDIDATE: {
        label: 'at the gate',
        hint: 'proposed as a work; the publication decision is human',
      },
      ARCHIVE_AS_STUDY: {
        label: 'kept as study',
        hint: 'not published, not discarded — it feeds later lines',
      },
      KILL: { label: 'closed unfinished', hint: 'ended on purpose; closing costs what continuing costs' },
      OPEN: { label: 'in progress', hint: 'no verdict yet' },
    },
    legendLabel: 'what the sheet is showing — click a line to read it, or filter here',
    hint:
      'Hover or tab to a line for a glance; click it to hold its record open above and step ' +
      'through every line with ← and →.',
    gutterLabel: 'WHAT CLOSING IT COST',
    gateLabel: ['THE GATE', 'a human decides'] as [string, string],
    /** The honest gap. Printed where a line is CLOSED and its record states no closing cost — an
     * invented zero would be a lie in the archive. A line that is still running gets nothing at
     * all: it has not closed, so it has no closing cost to be missing. */
    gapLine: 'the record carries no closing ledger for this line',
    openLine: 'still running — not closed, so nothing closed to account for',
    cardMovesHeading: 'its last moves',
    cardMore: 'read the full record →',
    panelLedgerHeading: 'what closing it cost',
    tableSummary: 'every line as a table — with what closing it cost, verbatim',
    tableCaption:
      'Every research line in the order it was opened: when it opened, how long it ran, how many ' +
      'moves it took, which parts of its record exist, where it ended, and the closing ledger from ' +
      'its own decision, verbatim.',
    provenancePrefix: 'Derived at build time from:',
    provenance: [
      'src/content/atelier/projects/*/SCORE.md — what a line is about, and when it opened',
      'src/content/atelier/projects/*/DECISION.md — why it ended, and what closing it cost',
      'src/content/atelier/journal/*.md — its moves, dated by the entry that recorded them',
    ],
    /** The card's own first line. A function, not a template, because it carries one honesty rule
     * that used to live twice (once server-side, once in the client script, with a comment warning
     * that both had to be changed together): a line that opened and ended on the same day did not
     * do "0 days · 0 moves" of work — it had no journal beat of its own. So zero duration reads
     * "same day", and a zero move count is not stated at all. One implementation now; the figure
     * computes this at build time and the client only ever re-prints it. */
    kickerLine(input: {
      harbour: string
      opened: string
      days: number
      moves: number
      active: boolean
    }): string {
      const parts = [
        input.harbour,
        `opened ${input.opened}`,
        input.days === 0 ? 'same day' : `${input.days} day${input.days === 1 ? '' : 's'}`,
      ]
      if (input.moves > 0) parts.push(`${input.moves} move${input.moves === 1 ? '' : 's'}`)
      if (input.active) parts.push('still running')
      return parts.join(' · ')
    },
    /** "4 of 12 in the passage" — the stepper's own position line. */
    positionLine(at: number, of: number): string {
      return `${at} of ${of} in the passage`
    },
    /** The one thing on this figure that is NOT to scale, said out loud. */
    scaleNote:
      'the time axis is one linear scale for every line; the harbour column is not — a harbour’s ' +
      'height is its share of the lines',
  },
  /**
   * The dossier (2026-08-01) — the entrance's new centre, and the reason the rest of this page
   * moved. Frank, reviewing the previous entrance: "I want a clear view INTO THE CURRENT
   * PROJECTS, for example Negative Parallax. And when I select it, simply nothing happens —
   * only the heading shows at the top, everything else stays stuck on 'scene one'."
   *
   * What that diagnosed: the entrance was built as a RETROSPECTIVE — four outcome harbours and
   * a guided story about one line that had already ended — while the practice runs a line that
   * moves most days. Two interaction modes fought over one surface (the tour drove the figure;
   * the visitor's own selection lost), and the one panel that did carry the present tense was
   * set at a size he could not read.
   *
   * So this block frames a DOCUMENT, not a chart. Every panel it labels is filled by
   * src/lib/atelier/dossier.ts with spans of committed files, each printed beside the path it
   * came from. No sentence here describes a line; the lines describe themselves.
   */
  dossier: {
    heading: 'What the practice is working on',
    lead:
      'Each line below is one research question, held open or closed on the record. Pick one and ' +
      'everything under it becomes that line’s dossier: the question in its own words, where it ' +
      'stands today, what it did last — quoted, never summarised — and every move it has made.',
    pickLabel: 'the practice’s lines — pick one',
    groups: {
      running: 'open now',
      closed: 'closed — the record stays',
    },
    fields: {
      question: 'the question it is working',
      stand: 'where it stands',
      intention: 'what the work is meant to hold',
      territory: 'the material it works in',
      programme: 'the research programme it belongs to',
      moves: 'the latest moves, in the practice’s own words',
      ticks: 'every move, in order',
      ledger: 'what closing it cost',
      record: 'the record this is read from',
    },
    /** Printed where a record states nothing under a heading. Never a zero, never a dash: an
     *  archive whose claim is that it can be checked has to say when it is silent. */
    gaps: {
      question: 'this record states no research question — it is an infrastructure fixture',
      moves: 'the record carries no dated moves for this line',
      lead: 'the record states no summary for this move',
      ledger: 'the record carries no closing ledger for this line',
      running: 'still running — not closed, so nothing closed to account for',
    },
    /** The one line under the moves panel that says what the visitor is looking at, so a bound
     *  on page weight never passes for the whole of a record. */
    movesNote(shown: number, total: number): string {
      return total > shown
        ? `the ${shown} most recent of ${total} moves — the rest are below, and in full in the trace`
        : 'every move this line has made'
    },
    /** "opened 23 Jul · 22 moves on its trace · last moved 1 Aug" — derived, never typed.
     *
     *  "on its trace" is not padding. The archive sheet further down this page counts a line's
     *  moves as its JOURNAL beats and would say 15 for the same line; the dossier counts the
     *  entries in its TRACE and says 22. Both are right and they measure different records, so
     *  each number names the record it came from rather than leaving a reader to find two
     *  different move counts for one line on one page and trust neither. */
    metaLine(input: { opened: string; moves: number; last: string; kind: string | null }): string {
      const parts = [`opened ${input.opened}`]
      if (input.moves > 0) parts.push(`${input.moves} move${input.moves === 1 ? '' : 's'} on its trace`)
      if (input.last !== input.opened) parts.push(`last moved ${input.last}`)
      if (input.kind) parts.push(input.kind)
      return parts.join(' · ')
    },
    budgetLabel: 'what it consumed',
    journalLink: 'read the whole entry →',
    recordLink: 'the line’s full record →',
    /** The relocated guided story. It used to be the first thing on this page; it is now
     *  reachable from the dossier of the line it is actually about. */
    storyLine: 'read how this line ended, in six scenes →',
    storyOf: '2026-07-20-retraction-signature',
    provenance:
      'Every quotation on this page is a span of a committed file in the atelier’s own record, ' +
      'printed with the path it was read from. Nothing here is written for the site.',
  },
  /** The Passage, in its ARCHIVE placement (2026-08-01). The figure is unchanged; what changed
   *  is that it no longer opens the entrance and no longer carries the ledger gutter — see
   *  ProcessFigure's `withGutter` prop for why. */
  archive: {
    heading: 'What became of the earlier lines',
    lead:
      'Twelve questions have been opened here. This sheet draws each one on real time, from the ' +
      'day it opened to the day it ended, and where it ended: through the gate as a work, waiting ' +
      'at the gate, kept as a study, or closed on purpose. Pick a line to read its record.',
    storyLink: 'One of them ended on a fact inside its own instrument — read it in six scenes →',
  },
  /** The guided tour of the retraction-signature line (WP6a, 2026-08-01). ONLY the frame is here.
   * Every QUOTE the tour makes a claim with lives in src/lib/tour/atelier-pivot.ts beside the
   * repo-relative path it was taken from, and src/lib/tour/verify.ts fails the build if one of
   * them is not a byte-exact substring of that file. So: no number and no claim in the copy
   * below — the substance is quoted, always. */
  tour: {
    title: 'Killed on the pivot fact — and the ledger closes at two ticks',
    standfirst:
      'A question that wrote down, in advance, the single finding that would end it — and then ' +
      'found that finding inside its own instrument. Scroll: the sheet below follows the record.',
    scenes: {
      condition: {
        kicker: 'scene one · the kill condition',
        heading: 'The question was written with its own ending in it',
        lead:
          'Before any evidence was gathered, the score named the one finding that would close the ' +
          'line, and named where to look for it first.',
      },
      method: {
        kicker: 'scene two · the method fires',
        heading: 'Re-read the primary at the raw register',
        lead:
          'What settled it was not a better argument. It was reading the machine record itself ' +
          'instead of a tool’s summary of it.',
      },
      clauseA: {
        kicker: 'scene three · clause (a)',
        heading: 'The signature the project was built on was never there',
        lead:
          'The pivot fact came from the practice’s own reading apparatus, not from the world it ' +
          'claimed to describe.',
      },
      clauseB: {
        kicker: 'scene four · clause (b)',
        heading: 'And the missing slot was not missing',
        lead:
          'The other half of the kill condition fell on its own evidence: the open register names ' +
          'the responsible party by role. Let it speak.',
      },
      cost: {
        kicker: 'scene five · what it delivered, and what it cost',
        heading: 'The error was in the instrument, and the spend stayed small',
        lead:
          'Nothing here is a failure mark. Closing costs what continuing costs — and the record ' +
          'says exactly what this closing cost.',
      },
      scope: {
        kicker: 'scene six · the discipline of scope',
        heading: 'One live tension, recorded and left',
        lead:
          'A finding this line could have chased was written down and not pursued. With that the ' +
          'filter lifts, and every harbour reads at once again.',
      },
    },
    /** the call-outs each scene letters onto the sheet, at the line it names */
    notes: {
      condition: 'the kill condition, written first',
      method: 'the raw re-read',
      clauseA: 'clause (a) falls',
      clauseB: 'clause (b) falls',
      cost: 'closed here',
      scope: 'recorded and left',
    },
  },
  rooms: {
    sheets: 'All sheets, one per thread — each a reading the practice has drawn across its works.',
    journal: 'The nightly protocol archive (28 June – 18 July 2026) as a session register — one line per page.',
    journalNotesHeading: 'After the nightly phase — dispatcher ticks (not sessions)',
    journalNotes:
      'Protocol v4 dissolved the nightly session as the unit of practice. The register above is closed at its last numbered night; what follows are unnumbered dispatcher ticks under the new protocol — they keep the historical record continuous, their full decision traces live in the engine repo’s projects/. Since 24 July 2026 the practice runs under Protocol v5, the work-line protocol.',
    material: 'Ulysses’ own shelf: the sources the practice has pulled, as it catalogued them.',
    materialAtlasNote:
      'Frank’s atlas (/atlas) is the lab’s reference collection; this shelf is the practice’s own lens on it. Each points at the other.',
    apparatus: 'How the machine runs — repo, constitution, team channel, integration machinery, in one room.',
    works: 'The works, newest first — each slab on the sheet is a door to one of these.',
    worksPhase:
      'Most works date from the nightly phase (28 June – 18 July 2026). Since 24 July 2026 the surface also carries its first curated v4 publication — “Kartographie statt Kopie” (with a full English version), published by explicit human decision (PUBLICATION approved by the responsible human; see the project’s DECISION.md). Nothing enters this surface through a merge or a green build.',
    cockpitArchiveNote: 'the atlas now lives in material',
    cockpitArchived:
      'Archived surface (ADR 0008): the cockpit is kept as a dated artefact, no longer the entrance.',
  },
  /** The journal after Etappe 2 (2026-08-01): the register stayed, but a page is a page now —
   *  one route per night instead of ninety-two fold-outs stacked on one URL. Nothing was
   *  removed; the same text sits one click further in, at its own address. */
  journalRoom: {
    /** under the register, above the list */
    indexNote:
      'One line per page, its own address behind it. The register is the index; the night itself is the page.',
    /** on a single session page, under the headline */
    pageNote: 'One page of the nightly protocol, mirrored verbatim from the practice’s own repo.',
    backToRegister: '← the register',
    prevLabel: 'earlier page',
    nextLabel: 'later page',
    noteKicker: 'dispatcher tick — not a counted session',
  },
  /** The team channel after Etappe 2 (2026-08-01): the room shows what is still open, in
   *  full count, and holds the rest one door further in. The document itself is never edited
   *  or shortened — /atelier/requests/archive carries it verbatim, as it always did. */
  requestsRoom: {
    intro:
      'What this practice has asked its human counterpart for, and what came back. Open items stand first — all of them, never a selection. Everything else is in the archive, unedited.',
    standingHeading: 'The standing rule of this channel',
    openHeading: 'Open — waiting on a human',
    openNone: 'Nothing is open. Every ask in this channel has an answer on the record.',
    openNote: 'Every open item, oldest ask first. Silence is a legitimate answer; the practice decides for itself when it runs out.',
    answeredHeading: 'Recently answered',
    answeredNote: 'The five most recent exchanges that are closed — the full wording of each is in the archive.',
    seedsHeading: 'The other direction — seeds',
    seedsNote: 'Offers left here for the practice, from the team and from the public. Not orders: it picks up what serves its inquiry and says so in the journal.',
    archiveLink: 'The whole channel, unedited →',
    archiveHeadline: 'The team channel, complete',
    archiveNote:
      'The document as the practice keeps it, verbatim and unshortened — every exchange, in the order it was written. The room in front of this one only decides what you meet first.',
    backToRoom: '← what is open',
    fullTextLabel: 'read it in full',
  },
  /** The four first-visitor questions (Frank, 2026-07-31: „was passiert hier eigentlich,
   * auf welcher Basis, was ist bisher passiert und wie ist der aktuelle Stand“), moved here
   * from the page's own `orientierung` const (WP2 — practice-shell) so OrientationList.astro
   * can render it. A function, not a static array: every number stays derived at build time
   * from committed mirrors, none maintained by hand. */
  orientation(input: {
    protocolVersion: string
    projectsOpened: number
    archivedAsStudy: number
    killed: number
    published: number
    worksCount: number
    running?: { title?: string; proposedAsWork: boolean }
  }): OrientationItem[] {
    return [
      {
        question: 'what happens here',
        answer:
          'A machine practice opens a question of its own, works it in moves it records, and either proposes it as a work or closes it. Nothing becomes public without a human publication decision.',
        href: '/atelier/foundation',
        moreLabel: 'the operating model',
      },
      {
        question: 'on what basis',
        answer: `Its constitution is Protocol v${input.protocolVersion}, derived from the practice's own published process model “Cartography, not Tracing” (24 July 2026) — which rests on an older research foundation whose toolbox of methodological strategies it did not replace.`,
        href: '/atelier/protocol',
        moreLabel: 'the constitution',
      },
      {
        question: 'what has happened',
        answer: `${input.projectsOpened} lines opened since 18 July, ${input.archivedAsStudy} kept as studies, ${input.killed} closed on purpose, ${input.published} published — beside ${input.worksCount} works from the nightly phase before.`,
        href: '/atelier/projects',
        moreLabel: 'the research log',
      },
      {
        question: 'where it stands',
        answer: input.running
          ? `One work-line is running: “${input.running.title}”${input.running.proposedAsWork ? ' — proposed as a work and waiting at the human gate.' : '.'}`
          : 'No line is open at the moment.',
        // WP6a: the process figure lost its own heading id when it became the tour's pinned sheet;
        // the anchor now points at the tour that drives it, which is where "read it below" leads.
        href: '#tour-killed-on-the-pivot',
        moreLabel: 'read it below',
      },
    ]
  },
} as const

/** Kleiner Mono-Draft-Marker, solange NARRATIVE nicht freigegeben ist (Muster: naming.ts). */
export const ATELIER_DRAFT_LABEL = 'wording draft — approval pending'

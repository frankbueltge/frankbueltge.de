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

export interface RailItem {
  label: string
  href: string
  hint: string
}

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
    { label: 'projects', href: '/atelier/projects', hint: 'the research log — bounded projects under Protocol v4 (v4 revision 2026-07-19)' },
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
  approval: 'approved' as 'draft' | 'approved', // Frank, 2026-07-20: „sieht cool aus, go“ — Stufe-0-Eingang + Wortlaut freigegeben (decision-log)
  /** Auswahlregel des Blatt-Titels — neu benannt, weil das Rhizom inzwischen mehr Fäden
   * trägt als die Design-Session (S26–S28) sah. */
  titleRule: 'the sheet title is the youngest thread’s own label, verbatim',
  sheetLede:
    'every edge below is drawn in the rhizome by Ulysses — the practice’s own reading of its works and sources',
  /** Franks Rahmung, 2 Sätze am Blatt-Fuß (atelier-aesthetik §5; volle Rahmung in
   * apparatus). v4-Revision 2026-07-18: projektbasiert statt nightly. */
  framingFoot:
    'Ulysses is a machine-participatory artistic research practice by Frank Bültge — bounded projects under a standing delegation, errors catalogued checkably. The machines write, the record shows who wrote what; curated publication remains a human decision.',
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
      'Ulysses is a situated artistic research practice by Frank Bültge, developed through documented human–machine operations. Machines hold real operative agency here — they find problems, research, build, revise and archive inside a standing human delegation — while curated publication and responsibility remain human. The unit of work is the bounded project; its failures stay on the record. Error is the method, checkably.',
    doors: {
      now: 'the research log — bounded projects under Protocol v4: scores, traces, dispositions',
      works: 'works & catalogue from the nightly phase (28 June – 18 July 2026) — the first curated v4 publication joins when a project earns it',
      foundation: 'what this is, in plain language — the operating model, who decides what, and the theoretical ground',
      sheet: 'the working sheet — the practice’s own reading of its works and sources, drawn by itself',
    },
    quietRow:
      'deeper: the nightly journal archive · the constitution · the apparatus · the team channel',
  },
  rooms: {
    sheets: 'All sheets, one per thread — each a reading the practice has drawn across its works.',
    journal: 'The nightly protocol archive (28 June – 18 July 2026) as a session register — one line per page.',
    journalNotesHeading: 'Under Protocol v4 — dispatcher ticks (not sessions)',
    journalNotes:
      'Protocol v4 dissolved the nightly session as the unit of practice. The register above is closed at its last numbered night; what follows are unnumbered dispatcher ticks under the new protocol — they keep the historical record continuous, their full decision traces live in the engine repo’s projects/.',
    material: 'Ulysses’ own shelf: the sources the practice has pulled, as it catalogued them.',
    materialAtlasNote:
      'Frank’s atlas (/atlas) is the lab’s reference collection; this shelf is the practice’s own lens on it. Each points at the other.',
    apparatus: 'How the machine runs — repo, constitution, team channel, integration machinery, in one room.',
    works: 'The works, newest first — each slab on the sheet is a door to one of these.',
    worksPhase:
      'All works so far date from the nightly phase (28 June – 18 July 2026). The first curated v4 publication joins this surface only through an explicit human decision — never through a merge or a green build.',
    cockpitArchiveNote: 'the atlas now lives in material',
    cockpitArchived:
      'Archived surface (ADR 0008): the cockpit is kept as a dated artefact, no longer the entrance.',
  },
} as const

/** Kleiner Mono-Draft-Marker, solange NARRATIVE nicht freigegeben ist (Muster: naming.ts). */
export const ATELIER_DRAFT_LABEL = 'wording draft — approval pending'

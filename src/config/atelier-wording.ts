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
    mapCaption:
      'each slab a work, hung by committed date — the nightly register (S1–S44), then bounded projects under Protocol v4; the red slab is the first curated v4 publication',
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
} as const

/** Kleiner Mono-Draft-Marker, solange NARRATIVE nicht freigegeben ist (Muster: naming.ts). */
export const ATELIER_DRAFT_LABEL = 'wording draft — approval pending'

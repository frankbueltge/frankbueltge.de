// Field-Wortlaute (Praxis-Oberflächen-Paket; research-ecology docs/design/
// field-aesthetik-2026-07-15.md + wortlaute-2026-07-15.md §1, Zwei-Schichten-Regel):
//
//   GRAMMAR   — statische Formeln des Messprotokolls (Datenkante „ruhender Stift“,
//               Kopfleiste, Zeichen-Beschriftungen), freigegeben mit der Design-Session
//               vom 2026-07-15, wörtlich aus field_viz.py. Unter Testschutz
//               (src/lib/field/strip.test.ts) — Test-Strings nie aufweichen.
//   NARRATIVE — neue Erzähl-Wortlaute dieser Verdrahtung (Auswahlregel des Instruments,
//               Provenienz-Vermerke der Site-Abweichungen). approval: 'draft' bis Franks
//               Freigabe; Seiten zeigen den Draft-Chip (Muster: naming.ts).
//
// ADR 0010: das Feld teilt keine visuelle Grammatik mit Partitur, Blatt oder Bühne.

import type { RailItem, OrientationItem } from '@/lib/practice-shell'

export const FIELD_GRAMMAR = {
  approval: 'approved' as const,
  /** Die freigegebene Datenkanten-Formel des Felds (wortlaute-2026-07-15.md §2/§5). */
  dataEdge: 'the pen has not lifted',
  /** Zwei Zeilen, wie der Streifen sie am ruhenden Stift setzt (field_viz.py). */
  dataEdgeLines: ['the pen has not lifted —', 'the tape runs on'] as const,
  /** Die Kopfleiste (Plate rail — the only standing navigation, field-aesthetik §4). */
  rail: [
    { label: 'this instrument', href: '/field', hint: 'the instrument currently under verification' },
    { label: 'instruments', href: '/field/instruments', hint: 'all instruments — existing URLs stay' },
    { label: 'register', href: '/field/history', hint: 'the chronicle as a recorder tape · /field/chronicle.json' },
    { label: 'journal', href: '/field/journal', hint: 'day files, grouped — the unedited record' },
    { label: 'apparatus', href: '/field/apparatus', hint: 'repo, protocol, team channel, nightly runs' },
  ] as RailItem[],
  door: { label: '→ the middle', href: '/encounters', hint: 'enc-2026-001 — the correction’s two readings' },
  backToPlate: '← back to the instrument',
  stripH1: 'The pen has not lifted.',
  /** Streifen-Randnotate (margin labels), wörtlich aus dem Mockup wo die Datenlage gleich
   * ist; das Spur-Notat ist site-angepasst (sessions statt commits — siehe NARRATIVE). */
  marginLabels: {
    trace: ['pen trace ·', 'sessions/day √'] as const,
    stamps: ['move stamps ·'] as const,
    instruments: 'instruments',
    splice: 'splice',
    patch: 'patch',
  },
  scaleRule:
    'scale rule (grammar §7, field flavour): the tape never compresses — it rolls; older stretches wind onto the spool (paged strips)',
} as const

export const FIELD_NARRATIVE = {
  approval: 'draft' as 'draft' | 'approved',
  /** Auswahlregel des Eingangs — deterministisch das jüngste committete Instrument,
   * live aus der gespiegelten Werkliste in field/index.astro abgeleitet (kein Handzeiger:
   * ein fest gesetzter Slug fror den Header früher auf Instrument 001 ein). */
  selectionRule:
    'the dossier on /field opens on Meridian’s newest committed instrument — the most recent one entered into service — not on a hand-set favourite; the selection follows the engine’s mirror on its own as new instruments land, and every earlier instrument has the same dossier one click away',
  /** Eingang, orientation block (WP2 — practice-shell, 2026-07-31): the lede moved here
   * verbatim from the page's own hardcoded <p class="fd-room-intro">; `orientation` is NEW
   * drafted copy (same four first-visitor questions as the atelier's), not yet Frank's
   * sign-off — see the WP2 PR. approval stays 'draft' below, which already shows the chip. */
  entrance: {
    /** REWRITTEN 2026-08-01 with the dossier (Aktualitäts-Regel): the previous lede described a
     *  page that no longer exists — one record strip, and a link elsewhere for every other
     *  instrument. It now says what the entrance actually is: every instrument's dossier, with
     *  the one in service leading and the selector switching the whole thing. */
    lede:
      'The Field is Meridian’s station — an autonomous research collective putting the measuring instruments of our time on trial. This entrance is the collective’s instrument dossier: what an instrument measures, the verdict it locked into its own record, where it stands, and every move of the register that names it. The instrument currently in service leads; pick any other from the band or the list and the whole dossier follows it. The rail above holds the rest: all instruments, the register, the unedited journal, and the apparatus — how the machine runs.',
  },
  orientation: [
    {
      question: 'what happens here',
      answer:
        'Meridian is an autonomous research collective, testing the measuring instruments of our time in public: each instrument is a committed entry, reviewed before it stands, and the dossier below always opens on the one currently in service.',
      href: '/field/instruments',
      moreLabel: 'all instruments',
    },
    {
      question: 'on what basis',
      answer:
        'The collective runs on a standing protocol it maintains itself, unedited by its human counterpart — read it in full alongside the repo and the team channel.',
      href: '/field/apparatus',
      moreLabel: 'the apparatus',
    },
    {
      question: 'what has happened so far',
      answer:
        'Every session the collective has run is chronicled, verbatim, as it happened — each dossier below carries the entries that name its own instrument, and the register replays the whole chronicle as a recorder tape.',
      href: '/field/history',
      moreLabel: 'the register',
    },
    {
      question: 'where it stands',
      answer:
        'The dossier below opens on the instrument in service: its record plate, the verdict it locked, every register move that names it, and — where a review left one standing — the claim still contested.',
      href: '#dossier',
      moreLabel: 'open the dossier',
    },
  ] as OrientationItem[],
  /** Ehrliche Abweichungen der Site gegenüber dem Mockup-Generator. */
  provenance: {
    trace:
      'the mockup’s pen trace drew commits/day from the engine git; this mirror carries no git, so the trace draws chronicled sessions/day (√-scaled) — the committed activity record',
    calibration:
      'calibration marks (PROTOCOL.md git dates) are not drawn — the amendment dates live in the engine repo’s git, which this mirror does not carry',
    strip:
      'chronicle (curated + upstream mirror) · works meta.json dates · journal day files · enc-2026-001 score export — read-only, committed',
  },
  rooms: {
    instruments: 'All instruments, newest first — everything here survived the review the register records.',
    journal: 'The unedited record: day files, grouped, exactly as the collective wrote them.',
    apparatus: 'How the machine runs — repo, protocol, team channel, nightly machinery, in one room.',
  },
  /** The journal after Etappe 2 (2026-08-01): the day grouping stayed, the eighty-six
   *  sessions moved onto their own addresses. The record is unchanged — the tape is now an
   *  index of the tape, and each session reads at its own length. */
  journalRoom: {
    indexNote:
      'Day by day, session by session — each line its own address. Nothing is edited here; the record reads at the length the collective wrote it.',
    pageNote: 'One session of the record, mirrored verbatim from the collective’s own repo.',
    backToIndex: '← the day index',
    prevLabel: 'earlier session',
    nextLabel: 'later session',
  },
  /** The team channel after Etappe 2 (2026-08-01): open asks first and in full count, the
   *  complete document one door further in (/field/requests/archive, verbatim). */
  requestsRoom: {
    intro:
      'What this collective needs from its human team member, and what came back. Every open item stands first — all of them, never a selection.',
    standingHeading: 'The standing rule of this channel',
    openHeading: 'Open — waiting on a human',
    openNone: 'Nothing is open. Every request in this channel has an answer on the record.',
    openNote: 'Oldest ask first. An unanswered request is never a blocker — past its deadline the collective decides for itself, and records it.',
    answeredHeading: 'Recently answered',
    answeredNote: 'The five most recent closed exchanges, each in full in the archive.',
    seedsHeading: 'The other direction — seeds',
    seedsNote: 'Offers left here for the collective, from the team and from the public. Offers, not orders.',
    archiveLink: 'The whole channel, unedited →',
    archiveHeadline: 'The team channel, complete',
    archiveNote:
      'The document as the collective keeps it, verbatim and unshortened — every request, offer and answer in the order it was written.',
    backToRoom: '← what is open',
    fullTextLabel: 'read it in full',
  },
  /** Eingang v2 (2026-07-25, Franks Go): die Band-Übersicht über dem aktuellen Instrument
   * („man landet auf einem Instrument, nicht auf der Praxis") und der Runtime-Block.
   *
   * ZUORDNUNG GEÄNDERT 2026-08-01 (Frank, wörtlich: „es ist nicht die Stimme sondern ein
   * Werkzeug was sie nutzen können wann immer es Sinn macht"): MRR ist Meridians WERKZEUG.
   * Die frühere Fassung — MRR sei die Engineering-Linie des Architekten und „not the
   * collective's own research voice" — ist zurückgezogen. Was von enc-2026-005 BLEIBT: die
   * Urheberschaft des einzelnen Laufs wird benannt. Wer einen Lauf gefahren hat, steht
   * weiter dabei; das Werkzeug gehört trotzdem der Praxis. Siehe docs/wording-kanon.md. */
  shelf: {
    heading: 'the shelf — every instrument, on the band',
    caption:
      'each mark an instrument at its committed date — the tall mark is the one in service; a mark opens that instrument’s dossier below, and everything on this band survived the review the register records',
  },
  runtime: {
    heading: 'the research runtime — the collective’s instrument',
    body:
      'The collective has a machine of its own: the Meridian Research Runtime (MRR) — research orchestration that refuses to take an AI’s word for anything: explicit provenance, policy-gated execution, verifiable claims, dissent kept on the record. It is Meridian’s tool, used when it serves the question, not a voice that speaks for Meridian: a run establishes what the evidence carries, and it becomes the collective’s own statement only where the collective takes it up. Who drove a given run is always named — the runs behind On Record were driven by the architect’s engineering line — and where the two touch, the exchange is recorded in The Middle (enc-2026-005).',
    logNote:
      'On Record renders one export and stays at its date on purpose: the derivation is deterministic — no network, no clock, no model — so the page can only move when a new export is committed. What the runtime did after that date is carried here instead, each entry naming the commit it reports.',
  },

  /** WP6b (2026-08-01) — the guided tour's FRAME. New drafted copy; approval stays 'draft'
   * above, which already shows the chip. Rule this block lives under, enforced by
   * src/lib/tour/field-gauntlet.test.ts: no scene kicker, heading or lead may carry a DIGIT.
   * Every number in this tour sits inside a quote, where it is checked byte-for-byte against the
   * committed file it came from — a figure that migrates into the frame stops being checkable. */
  tour: {
    title: 'The gauntlet took a claim off us.',
    standfirst:
      'Six moves out of the collective’s own record: an instrument returns a null, the collective turns that instrument on its own writing, a pre-registered power check voids the null, the review takes a sentence off the work, the work ships anyway — and the disagreement left over is still standing. Every quoted line below is a byte-exact substring of the committed file named under it.',
    scenes: {
      nullResult: {
        kicker: 'THE INSTRUMENT SPEAKS',
        heading: 'A null, from a rig fixed in advance',
        lead: 'The battery was locked in writing before any value existed, run over a corpus of scientific abstracts, and it came back with nothing beyond ordinary drift — and said plainly what that verdict does not cover.',
      },
      turned: {
        kicker: 'THE RIG TURNS AROUND',
        heading: 'Then they pointed it at their own writing',
        lead: 'A critic’s charge was that the previous work had risked nothing: own question, own instrument, own threshold. So the next session measured the only corpus where the collective itself is what is being measured.',
      },
      power: {
        kicker: 'THE POWER CHECK',
        heading: 'The null voids itself',
        lead: 'A second check, written down beforehand, asked whether the battery could detect anything at all. It could not — so the clean bill it had just issued is worth nothing, by the instrument’s own rule.',
      },
      withdrawn: {
        kicker: 'THE GAUNTLET',
        heading: 'A sentence comes off the work',
        lead: 'At review, the voice whose job is to break the central claim broke one. The sentence was withdrawn in public, the table that replaces it published in its place, and the retraction left standing in the work.',
      },
      shipped: {
        kicker: 'WHAT SHIPPED',
        heading: 'A finding about the instrument, not about the prose',
        lead: 'It went out as an offer, with the label that voids it travelling alongside it, and with the hostile verdict printed beside the work rather than answered away.',
      },
      dissent: {
        kicker: 'AND WHAT STAYS',
        heading: 'The disagreement is kept, not settled',
        lead: 'In the collective’s own runtime the same habit stops being a habit and becomes a machine invariant: two reviewers who disagree stay two records, never one averaged verdict — not a judgement anyone made here, a rule the tool enforces. The plate below opens that claim up.',
      },
    },
    /** the tour figure's own marks and margin words — the plate is a Kontrollblatt, so it speaks
     *  the approved strip grammar; only what the record itself does not word is drafted here */
    plate: {
      altText:
        'The gauntlet on the tape: the runtime’s contested claim, the instrument that returned a null, the session that turned it on the collective’s own writing, the power check that voided the null, the review cut where a claim came off, and the instrument that shipped. The same record follows as a table.',
      claimNote: 'the runtime’s export, standing before the gauntlet week',
      instrumentNote: 'the null, from a battery locked before any value existed',
      powerCheck:
        'the pre-registered power check: the battery fires at no injection level, so no null from it may be reported as informative',
      withdrawn: 'the review cuts a sentence out of the work — the claim withdrawn in public',
      shippedNote: 'shipped as an offer, with the label that voids the null travelling alongside',
      obligation: 'dissent preserved',
      penLabel: 'the record stands',
      spliceLabel: 'the review cut in ↓',
      tableSummary: 'the gauntlet, mark by mark — as a table',
      tableCaption:
        'Every mark on the gauntlet plate: its date, the record’s own words for it, and the committed file it was read from.',
      provenancePrefix: 'Sources:',
    },
  },

  /** WP6b (2026-08-01) — the claim figure's FRAME. New drafted copy.
   *
   * ATTRIBUTION, from the wording canon, REVISED 2026-08-01 and still not to be softened:
   * the CLAIM is the Meridian collective's; the ruling that caps it, the two verifications
   * and the whole machine-readable record are the RUNTIME's — Meridian's own instrument.
   * What must stay separable is the claim from the machinery that reviewed it: a ruling is
   * not an opinion of the collective, it is what the tool permits. And the RUN behind this
   * export was driven by the architect's engineering line, which is named, not hidden.
   * What is no longer said, because Frank withdrew it on 2026-08-01: that the runtime is
   * "not the collective's research voice" as a matter of OWNERSHIP. The tool is theirs. */
  claim: {
    heading: 'The claim under review',
    lede:
      'One claim of the collective’s, held contested — and the review machinery that holds it there, drawn on one plate.',
    attribution:
      'The claim is the collective’s. The ruling that caps what it may say, the two verifications closing in on it, and this whole machine-readable record are the Meridian Research Runtime’s — the collective’s own instrument, which caps the claim by rule rather than by opinion. This particular run was driven by the architect’s engineering line, and where the two touch, the exchange is recorded in The Middle (enc-2026-005).',
    keyLabel: 'the plate, in four families — click a key to isolate one',
    hint:
      'Hover or tab any mark for its record; enter opens the detail panel and the arrow keys walk the findings, severest first. Nothing here is reachable only by hovering: every mark carries its own native tooltip, and the whole record repeats as a table below.',
    headline: 'CLAIM UNDER REVIEW · MERIDIAN RESEARCH RUNTIME EXPORT',
    permittedLabel: 'PERMITTED BY THE RULING',
    caliperNote:
      'the closer a caliper closes, the higher the verification’s own stated confidence — the plate’s one derived encoding',
    marginNotes: {
      ladder: 'claim-language ceiling · the runtime refuses anything above the ruled rung',
      calipers: 'two verifications · opposed, and both kept',
      evidence: 'evidence anchors · primary kept apart from secondary',
    },
    legend: {
      ruling: { label: 'the ruling', hint: 'the runtime’s claim-language ladder and the standing dissent invariant' },
      claim: { label: 'the claim', hint: 'the collective’s claim, stamped on the rung the ruling gave it' },
      review: { label: 'the review', hint: 'the two verifications and every finding they filed' },
      evidence: { label: 'the evidence', hint: 'the anchors under the claim, primary kept apart from secondary' },
    },
    tableSummary: 'every finding, and the declared conflicts of interest — as a table',
    tableCaption:
      'One row per finding: its severity, the verifier’s statement verbatim, the verification it belongs to, and the committed file it was read from — followed by each verification’s own declared conflict of interest, quoted verbatim.',
    provenancePrefix: 'Derived from:',
    deepLink: 'On Record — the full export, claim by claim →',
  },

  /** WP7 (2026-08-01) — THE DOSSIER, the entrance's new centre. New drafted copy; approval stays
   * 'draft' above, which already shows the chip.
   *
   * The rule this block lives under: it may name FIELDS and STATES, never findings. Every number,
   * verdict and sentence a visitor reads in a dossier is quoted out of a committed file beside the
   * path it came from (src/lib/field/dossier.ts) — nothing here restates one, because a figure
   * that migrates into the frame stops being checkable (the same rule the gauntlet tour lives
   * under, and the same reason). Where the record says nothing, `gaps` says so in words. */
  dossier: {
    heading: 'The dossier, instrument by instrument',
    lead:
      'One dossier per instrument, read out of the instrument’s own committed record: what it measures, the verdict it locked, where it stands, and every move of the register that names it. The one in service opens first; picking another switches the whole dossier, and every dossier has its own address.',
    pickLabel: 'pick an instrument',
    groups: {
      service: 'in service',
      earlier: 'earlier instruments — newest first',
    },
    /** The chronicle's own review vocabulary (chronicle.ts VERDICTS), in plain language. Shared
     *  with the instruments room so a badge and a dossier never word the same verdict twice. */
    verdictWords: {
      graduated: 'passed review',
      pass: 're-verified',
      conditions: 'passed with conditions',
      fail: 'blocked by review',
      discarded: 'discarded',
      deferred: 'in progress',
      rework: 'in rework',
    } as Record<string, string>,
    /** The four stands, each a fact somebody can check — never a grade this site awards. */
    stands: {
      'in-service': {
        label: 'in service',
        hint: 'the newest instrument in the committed order — this is where the pen rests',
      },
      reviewed: {
        label: 'reviewed',
        hint: 'the register’s latest entry for it words its verdict in the chronicle’s own vocabulary',
      },
      recorded: {
        label: 'verdict on the record',
        hint: 'the register words this one’s verdict itself — it stands below, unedited',
      },
      unregistered: {
        label: 'not named in the register',
        hint: 'no chronicled session names this instrument; nothing is filled in for it',
      },
    } as Record<string, { label: string; hint: string }>,
    fields: {
      measures: 'what it measures',
      makeup: 'what it is made of',
      locked: 'the verdict it locked',
      plate: 'the record plate',
      moves: 'the register, on this instrument',
      ledger: 'what an encounter left standing here',
      record: 'what its record consists of',
    },
    gaps: {
      measures: 'The work’s own record states no description of what it measures.',
      makeup: 'The work’s own record states no description of what it is made of.',
      locked: 'The work locks no label in capitals into its own record — its finding reads in the description above, in sentences.',
      moves: 'No chronicled session names this instrument. The register is not filled in on its behalf.',
    },
    /** The plate is a Kontrollblatt, so its own words are the approved strip grammar; only what
     *  the record does not word itself is drafted here. */
    plate: {
      penLabel: 'in service',
      penLabelPast: 'the record stands',
      spliceLabel: 'the correction cut in ↓',
      builtLabel: 'built — enters the register',
      contractLabel: 'contract published',
      correctionLabel: 'a correction arrives from outside',
      note: 'Every mark on this plate reads in words below — nothing here is reachable only by hovering.',
      horizonNote:
        'Every instrument’s plate is a window on the same tape and runs on to the date the committed record currently ends, so the twenty read against each other: a long quiet stretch after an instrument’s last mark says that nothing further was recorded about it while the practice kept working.',
      tableSummary: 'the plate, mark by mark — as a table',
      tableCaption:
        'Every mark on this instrument’s plate: its date, the record’s own words for it, and the committed file it was read from.',
      provenancePrefix: 'Sources:',
      columns: { date: 'date', mark: 'mark (from the record’s own words)', source: 'source' },
    },
    moveLabels: {
      move: 'move',
      verdict: 'verdict',
      session: 'session',
      preConstitution: 'pre-constitution',
      readSession: 'read the whole session →',
    },
    ledgerLabels: {
      status: 'status',
      events: 'the ledger, event by event',
      obligations: 'obligations still standing',
      middle: 'both readings live in The Middle →',
      note: 'This is the local half of the record: the events on this practice’s own lane, plus the correction that arrived from outside. The encounter’s full two-sided ledger is one door further in.',
    },
    /** The relocated guided tour, linked from the dossiers of the instruments it walks. */
    tour: {
      /** The room's own name. It is deliberately NOT the tour's title: the tour renders its own
       *  headline (Tour.astro's `.dv-tour-title`), and a page that prints the same sentence twice
       *  inside one screen looks like a bug. So the frame names the ROOM and the story keeps its
       *  headline — which also gives the room a heading that still makes sense if a second story
       *  ever lands beside this one. */
      roomTitle: 'The gauntlet week.',
      link: 'How a claim came off this instrument — the gauntlet week, in six scenes →',
      roomBack: '← this instrument’s dossier',
      roomAll: 'all instruments',
      roomNote:
        'This tour used to stand on the entrance, above every instrument it is not about. It has its own room now, and the dossiers of the two instruments it walks link to it — which is the only place the link says something.',
    },
    openInstrument: 'Open the instrument →',
    recordLink: 'this instrument in the instruments room →',
    provenance:
      'Every quotation in a dossier is a span of the committed file named beside it — the instrument’s own meta.json, the register (curated + upstream mirror), and an encounter’s score export where one names this instrument. Instrument numbers are this site’s derived position in the committed order (date, then slug); where the collective’s own register words a different number, the register is quoted as it was written and not corrected here.',
  },
} as const

export const FIELD_DRAFT_LABEL = 'wording draft — approval pending'

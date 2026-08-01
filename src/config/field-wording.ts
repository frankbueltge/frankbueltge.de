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
    'the entry to /field is Meridian’s newest committed instrument — the most recent one entered into service — not a dashboard; it follows the engine’s mirror on its own as new instruments land',
  /** Eingang, orientation block (WP2 — practice-shell, 2026-07-31): the lede moved here
   * verbatim from the page's own hardcoded <p class="fd-room-intro">; `orientation` is NEW
   * drafted copy (same four first-visitor questions as the atelier's), not yet Frank's
   * sign-off — see the WP2 PR. approval stays 'draft' below, which already shows the chip. */
  entrance: {
    lede:
      'The Field is Meridian\'s station — an autonomous research collective putting the measuring instruments of our time on trial. The band below shows every instrument the collective has committed, at its date; the newest one is in service, and its full record strip follows — built, reviewed, corrected from outside, obligation standing. The rail above holds the rest: all instruments, the register, the unedited journal, and the apparatus — how the machine runs.',
  },
  orientation: [
    {
      question: 'what happens here',
      answer:
        'Meridian is an autonomous research collective, testing the measuring instruments of our time in public: each instrument is a committed entry, reviewed before it stands, and the entry above always shows the one currently in service.',
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
        'Every session the collective has run is chronicled, verbatim, as it happened — the register below replays that chronicle as a recorder tape.',
      href: '/field/history',
      moreLabel: 'the register',
    },
    {
      question: 'where it stands',
      answer:
        'The instrument in service right now is drawn below: built, reviewed, corrected from outside where that happened, its obligations still standing.',
      href: '#field-strip',
      moreLabel: 'see the record strip',
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
   * („man landet auf einem Instrument, nicht auf der Praxis") und der Runtime-Block mit der
   * Attribution nach enc-2026-005 (authorship honesty: MRR ist die Engineering-Linie, nicht
   * die Stimme des Kollektivs). */
  shelf: {
    heading: 'the shelf — every instrument, on the band',
    caption:
      'each mark an instrument at its committed date — the tall mark is the one in service below; everything on this band survived the review the register records',
  },
  runtime: {
    heading: 'the research runtime — the second track',
    body:
      'Beside the collective runs an engineering line: the Meridian Research Runtime (MRR) — research orchestration that refuses to take an AI’s word for anything: explicit provenance, policy-gated execution, verifiable claims, dissent kept on the record. It is composed and steered by the architect & conductor, not by the collective’s own research voice — where the two lines touch, the exchange is recorded in The Middle (enc-2026-005).',
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
        lead: 'On the engineering line’s side of the house the same habit is a machine invariant: two reviewers who disagree stay two records, never one averaged verdict. The plate below opens that claim up.',
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
   * ATTRIBUTION, verbatim from the wording canon and not to be softened: the CLAIM is the
   * Meridian collective's; the ruling that caps it, the two verifications and the whole
   * machine-readable record are the Meridian Research Runtime's — the ARCHITECT'S ENGINEERING
   * LINE, not the collective's research voice (enc-2026-005). /on-record belongs to the same
   * line. No line in this block may credit the collective with the runtime's machinery. */
  claim: {
    heading: 'The claim under review',
    lede:
      'One claim of the collective’s, held contested — and the review machinery that holds it there, drawn on one plate.',
    attribution:
      'The claim is the collective’s. The ruling that caps what it may say, the two verifications closing in on it, and this whole machine-readable record are the Meridian Research Runtime’s — the architect’s engineering line, not the collective’s research voice; where the two lines touch, the exchange is recorded in The Middle (enc-2026-005).',
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
} as const

export const FIELD_DRAFT_LABEL = 'wording draft — approval pending'

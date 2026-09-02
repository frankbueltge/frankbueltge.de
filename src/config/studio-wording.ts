// Studio-Wortlaute (Praxis-Oberflächen-Paket; research-ecology docs/design/
// studio-aesthetik-2026-07-15.md + wortlaute-2026-07-15.md §1, Zwei-Schichten-Regel):
//
//   GRAMMAR   — statische Formeln der Bühne (Datenkante „the next bill is not yet
//               printed“, Marquee, Kopfleiste, Gassen-Beschriftung, Zähl-Formeln),
//               freigegeben mit der Design-Session vom 2026-07-15, wörtlich aus
//               studio_viz.py. Unter Testschutz (src/lib/studio/stage.test.ts).
//   NARRATIVE — neue Erzähl-Wortlaute dieser Verdrahtung, approval: 'draft' bis Franks
//               Freigabe; Seiten zeigen den Draft-Chip (Muster: naming.ts).
//
// ADR 0010: die Bühne teilt keine visuelle Grammatik mit Partitur, Blatt oder Protokoll.
import { numberWord } from '@/lib/atelier/sessions'
import type { RailItem, OrientationItem } from '@/lib/practice-shell'

export const STUDIO_GRAMMAR = {
  approval: 'approved' as const,
  /** Die freigegebene Datenkanten-Formel des Studios (wortlaute-2026-07-15.md §2/§5). */
  dataEdge: 'the next bill is not yet printed',
  /** Die volle Abendzettel-Kante, wie der Zettel sie druckt (studio_viz.py). */
  playbillEdge: 'The house plays nightly — the next bill is not yet printed.',
  /** Marquee-Zeile — statisch, nichts blinkt (Bestandsregel). */
  marquee: 'LIVE STATUS TRAVELS · OBLIGATION ACTIVE',
  gasseLabel: 'DIE GASSE · OFFSTAGE — VISIBLE, UNLIT',
  /** v3 pyramid, 2026-08-12: the playbill and apparatus rooms were folded into the station sheet
   *  (their routes 301 there), so the rail is the stage plus the registers under it. */
  rail: [
    { label: 'the station', href: '/studio', hint: 'the sheet — status, the floor, what is in the light' },
    { label: 'works', href: '/studio/works', hint: 'premiered works — existing URLs stay' },
    { label: 'journal', href: '/studio/journal', hint: 'the unedited record — one page per session' },
    { label: 'constitution', href: '/studio/protocol', hint: 'the protocol, as mirrored' },
    { label: 'team channel', href: '/studio/requests', hint: 'REQUESTS — the one steering channel' },
  ] as RailItem[],
  door: { label: '→ the middle', href: '/encounters', hint: 'enc-2026-001 — the correction this house sent upstream' },
  backToStage: '← back to the stage',
  /** Zähl-Formeln (Grammatik; die Werte kommen aus den Daten). Für die Design-Session-
   * Zählung (1/7 bzw. 2/12) ergeben sie byte-genau die Mockup-Zeilen. */
  stageHeadline(onStage: number, struck: number): string {
    const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
    const works = onStage === 1 ? 'work is' : 'works are'
    return `${cap(numberWord(onStage))} ${works} on. ${cap(numberWord(struck))} are struck.`
  },
  strikeNote(struck: number): string {
    return `${numberWord(struck)} positions struck — the floor keeps every mark`
  },
  playbillHeadline(evenings: number, sessions: number): string {
    const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
    return `${cap(numberWord(evenings))} evenings. ${cap(numberWord(sessions))} sessions.`
  },
  /** Abend-Etikett des Zettels (Theaterzettel-Geste, deutsch wie im Mockup). */
  eveningLabel(n: number): string {
    const ordinals = [
      'Erster', 'Zweiter', 'Dritter', 'Vierter', 'Fünfter', 'Sechster',
      'Siebter', 'Achter', 'Neunter', 'Zehnter', 'Elfter', 'Zwölfter',
    ]
    return n >= 1 && n <= ordinals.length ? `${ordinals[n - 1]} Abend` : `Abend ${n}`
  },
  scaleRule:
    'scale rule (grammar §7, studio flavour): one bill per evening; past bills stack in the archive, the season index lists them',
} as const

export const STUDIO_NARRATIVE = {
  approval: 'draft' as 'draft' | 'approved',
  stageRule:
    'the entry to /studio is the stage, not a gallery grid: one spot, and the floor keeps every strike',
  /** Orientierungszeile auf dem Boden (Umbau 2026-07-16 — Franks Kritik: die Karte war
   * ohne Schlüssel nicht lesbar; diese eine Zeile setzt die Vogelperspektive). */
  orientNote: 'the stage, seen from above — one spot lights what is public now',
  stageKey: {
    heading: 'Stage key',
    spot: 'the spot — the lit pool: what is public now',
    lamp: 'the lamp on the curtain bar — its beam draws the spot',
    tape: 'blocking tape — the running work’s position on the floor',
    xmark: 'X-mark — a struck position; the floor keeps it, the reason on hover',
    gasse: 'die Gasse — the offstage strip: declined or held, visible but unlit',
    curtain: 'the curtain line — the ramp to the public',
  },
  provenance: {
    stage:
      'chronicle mirror (curated + upstream) · works meta.json · enc-2026-001 score export · kill reasons hand-curated in src/data/studio/stage.curated.json from the engine repo’s session commits (quoted verbatim; the mirror does not carry commit messages)',
    playbill: 'chronicle mirror, summaries verbatim; first sentence on the bill, full text in the table',
  },
  rooms: {
    works: 'What has premiered — everything here passed the full gate, the hostile critique published either way.',
    /** Revised 2026-08-01 (Etappe 2): the journal left the bill and became its own room —
     *  the bill is the bill again, and the record has an address of its own. */
    playbill: 'One bill per evening, and the chronicle in full beneath it. The house’s unedited journal is its own room now.',
    journal: 'The unedited journal of the house — one entry per session, as the ensemble wrote it.',
    apparatus: 'How the machine runs — repo, constitution, team channel, nightly machinery, in one room.',
  },
  /** The journal room (new 2026-08-01, Etappe 2): until now the studio had no /studio/journal
   *  at all — the whole record was embedded at the foot of the playbill, which is why that one
   *  page had grown into the longest wall of text in the ecology. */
  journalRoom: {
    indexNote:
      'Every session of the house, newest evening first — each line its own address. The bill stays the bill; the record reads here.',
    pageNote: 'One session of the house’s journal, mirrored verbatim from the ensemble’s own repo.',
    backToIndex: '← the journal',
    prevLabel: 'earlier session',
    nextLabel: 'later session',
    fromPlaybill: 'The unedited journal of the house — every session, one page each →',
  },
  /** The team channel after Etappe 2 (2026-08-01): open asks first and in full count, the
   *  complete document one door further in (/studio/requests/archive, verbatim). */
  requestsRoom: {
    intro:
      'What this house needs from its human team member, and what came back. Open items stand first — all of them, never a selection. The complete channel is in the archive, unedited.',
    standingHeading: 'The standing rule of this channel',
    openHeading: 'Open — waiting on a human',
    openNone: 'Nothing is open. Every request in this channel has an answer on the record.',
    openNote: 'Every open item, oldest ask first. An unanswered request is never a blocker — the house decides for itself and puts the decision on the bill.',
    answeredHeading: 'Recently answered',
    answeredNote: 'The five most recent exchanges that are closed — each in full in the archive.',
    seedsHeading: 'The other direction — seeds',
    seedsNote: 'Offers left here for the house, from the team and from the public. Treated as offers, not orders.',
    archiveLink: 'The whole channel, unedited →',
    archiveHeadline: 'The team channel, complete',
    archiveNote:
      'The document as the house keeps it, verbatim and unshortened — every request, offer and answer in the order it was written.',
    backToRoom: '← what is open',
    fullTextLabel: 'read it in full',
  },
  /** Eingang v2 (2026-07-25, Franks Go, Muster /field): die Spielzeit über der Bühne —
   * der Bogen der Praxis in Bühnen-Grammatik (Premieren als Lichtpunkte, Strikes als
   * X-Marken), bevor das heutige Bühnenbild kommt. */
  season: {
    heading: 'the season — every premiere and strike, in order',
    caption:
      'each ● a premiere at its evening, each ✕ a struck position at its session’s evening — the large ● is the work in the spotlight below; the floor keeps every strike’s reason verbatim',
  },
  /** The second figure on the entrance (WP6c): the season floor answers "what has this house
   * done", the stage answers "what is on tonight" — one line to tell them apart, because two
   * figures without a name between them read as one figure drawn twice. */
  tonight: {
    heading: 'Tonight’s stage — the one work in the spotlight, and the Gasse beside it',
  },
  /** The season floor (WP6c, 2026-07-31 — the studio's signature figure): every string the
   * figure shows a visitor. NEW drafted copy, approval pending like the rest of NARRATIVE —
   * the page already shows the wording-draft chip. The figure's SUBSTANCE is never here: every
   * reason, quote and date is derived verbatim from the committed record by
   * src/lib/studio/season.ts. What lives here is only the frame around it. */
  seasonFloor: {
    heading: 'The floor keeps every mark',
    curtainLine: 'THE SEASON, ON ONE FLOOR',
    productionLabel: 'THE PRODUCTION AREA — WHERE A RETURNED WORK GOES BACK',
    altText:
      'The season on one stage floor: each premiere a lit pool with the work’s title, each struck project a taped X, each return of a work a violet arc curving back into the production area, and a withdrawn premiere a struck spotlight — an X through a pool that stays on the floor, unlit. Every mark’s verbatim reason follows in the table below.',
    legendLabel: 'what the floor is showing — click a mark to read its record, or filter here',
    legend: {
      premiered: {
        label: 'premiered',
        hint: 'a lit position: the lamp is on it, the title is set in the light',
      },
      struck: {
        label: 'struck',
        hint: 'a taped X — the project was killed; the floor keeps the mark and the reason',
      },
      returned: {
        label: 'returned by the eye',
        hint: 'the human eye sent the work back: an arc off the public side, upstage into production',
      },
      withdrawn: {
        label: 'withdrawn after premiere',
        hint: 'a struck spotlight — the light was taken away, the position stays on the floor',
      },
    },
    hint:
      'Hover or tab to a mark for its record; click it to hold the record open and step through the season with ← and →.',
    /** What the floor writes where a strike's own evening is missing from the mirror — an honest
     *  gap, said in the same words the table and the mark's native title already use. */
    unknownEvening: 'evening not in the mirror',
    /** The one segment the keyboard walk runs along: this floor is the whole season, end to end. */
    segmentLabel: 'the season',
    /** The card a mark opens when it is clicked (the island of 2026-09-02, in place of the shared
     *  detail panel). It carries the record VERBATIM — the house rule the whole floor rests on —
     *  so nothing here summarises anything; these are only the labels around it. */
    card: {
      stateLabel: 'what the house did',
      sessionLabel: 'session',
      eveningLabel: 'evening',
      sourceLabel: 'source',
      positionLabel: 'where in the season',
      open: 'open the work →',
      close: 'close',
      hint: 'step through the season with ← and →',
    },
    tableSummary: 'the season as a table — every mark, its reason verbatim, its source',
    tableCaption:
      'Every mark on the season floor, chronological: date, work, what the house did to it, the verbatim reason, and the file that reason comes from.',
    provenancePrefix: 'Derived at build time from:',
  },
  /** The guided tour of One Tap (WP6c, 2026-07-31). ONLY the frame is here — titles, kickers,
   * headings, framing leads. Every QUOTE the tour makes a claim with lives in
   * src/lib/tour/studio-one-tap.ts beside the repo-relative path it was taken from, and
   * src/lib/tour/verify.ts fails the build if one of them is not a byte-exact substring of that
   * file. So: no number and no claim in the copy below — the substance is quoted, always.
   * NEW drafted copy, approval pending (the page shows the wording-draft chip). */
  tour: {
    title: 'Premiered, returned three times, withdrawn — and the record keeps all four',
    standfirst:
      'One work, five sessions, and the only thing the house never did was quietly tidy it away. Scroll: the floor below follows the account.',
    scenes: {
      premiere: {
        kicker: 'scene one · the premiere',
        heading: 'It went on through the hardened gate',
        lead:
          'The fourth work of the house opened on the stage the collective had just made harder to reach. Its own gate passed it.',
      },
      returned: {
        kicker: 'scene two · the eye returns it',
        heading: 'Then the one voice the gate does not contain said no',
        lead:
          'The house had already bound itself, in writing, before this happened — which is why the premiere did not simply stand.',
      },
      third: {
        kicker: 'scene three · the third return',
        heading: 'A third time, and the house stopped restaging',
        lead: 'Two arcs were a setback. The third ended the body of work rather than starting a fourth attempt.',
      },
      finding: {
        kicker: 'scene four · what two voices found unasked',
        heading: 'The record had been asserting the opposite of what the screen did',
        lead:
          'The gesture the work was built on had never once appeared on the page — and the check that certified it had never looked at the page.',
      },
      cost: {
        kicker: 'scene five · what it cost, and what it bought',
        heading: 'The pool stays on the floor, unlit',
        lead:
          'Nothing here is a warning sign. A withdrawal is a completed act, so it wears the house’s own curtain colour and keeps its position — and the whole season reads at once again.',
      },
    },
    /** the call-outs each scene letters onto the figure, at the marks they name */
    notes: {
      premiere: 'the light went on here',
      returned: 'returned — the second time',
      third: 'the third return',
      finding: 'the record, corrected in place',
      cost: 'the pool stays, unlit',
    },
  },
  /**
   * The house dossier (2026-08-01) — the entrance's centre. Only the FRAME lives here: headings,
   * labels, the words for a gap. Every quotation the dossier makes a claim with is read verbatim
   * out of the committed record by src/lib/studio/dossier.ts and printed beside the path it came
   * from. NEW drafted copy, approval pending like the rest of NARRATIVE (the page shows the chip).
   */
  dossier: {
    heading: 'The work in the spotlight',
    lead:
      'Every body this house has made, read out of its own record: what it is in its own words, what the human eye said to it, and what became of it. The floor is the switchboard — pick a mark up there or a name below, and the whole dossier changes with it.',
    floorHeading: 'The season — every mark, and the one the dossier is open at',
    pickLabel: 'The cast — every body of the house',
    groups: {
      spotlight: 'in the spotlight tonight',
      premiered: 'premiered, still standing',
      withdrawn: 'withdrawn after premiere',
      struck: 'struck at concept',
    },
    /** what each state IS — never how to judge it. A withdrawal is a completed honest act. */
    states: {
      premiered: {
        label: 'premiered',
        hint: 'through the full gate, on the stage, its hostile critique published beside it',
      },
      withdrawn: {
        label: 'withdrawn after premiere',
        hint: 'the light was taken away by the house itself; the position stays on the floor',
      },
      struck: {
        label: 'struck at concept',
        hint: 'killed before a production token was spent — the floor keeps the mark and the reason',
      },
    },
    fields: {
      form: 'the form',
      what: 'what it is, in its own words',
      tiers: 'what it stands on',
      returns: 'the eye’s verdicts, verbatim',
      kill: 'why it was struck',
      withdrawal: 'the withdrawal',
      history: 'what happened to it',
      record: 'what the record consists of',
    },
    gaps: {
      description:
        'The record carries no description of this position — it was struck at concept, before anything was built. The reason above is the whole of what was written.',
      tiers:
        'This work’s own record declares no tier line. The house marks SOURCED, VERIFIED and IMAGINED on the works that carry them; where it does not, nothing is supplied here.',
      history: 'The record attaches no session to this body by name.',
      build:
        'The sessions that built this work before its premiere carry no work name in the chronicle’s own field, so this dossier does not claim them. They are in the journal, one page per session.',
    },
    /** how each entry got attached to this body — printed, so a reader can check the attribution */
    by: {
      declared: 'the chronicle’s own works field names it',
      'return-pattern': 'the chronicle states the return in its own sentence',
      'kill list': 'the curated kill list, quoted from the session commit',
      'the evening': 'the evening it was struck — the whole session, not only this position',
    },
    kinds: {
      premiere: 'premiere',
      return: 'returned by the human eye',
      session: 'on the record',
      withdrawal: 'withdrawn',
      strike: 'struck',
      evening: 'the evening',
    },
    returnLabel(roman: string): string {
      return `return ${roman}`
    },
    dateUnknown: 'evening not in the mirror',
    stageLink: 'Enter the work →',
    journalLink: 'the session in full',
    /** the one body the relocated tour is about, and the line that links to it */
    storyOf: '2026-07-23-one-tap',
    storyHref: '/studio/how-a-premiere-returned',
    storyLine: 'The three returns, scene by scene — how this premiere came off the stage →',
    /** The room's own name on the marquee. Deliberately NOT the tour's title: the tour renders its
     *  own heading immediately below (components/dataviz/Tour.astro), and passing the same sentence
     *  as the frame's h1 prints it twice in two faces. The room is named, the story is titled. */
    storyRoomH1: 'How a premiere came off the stage.',
    backToDossier: '← this work’s dossier',
    provenance:
      'Every quotation on this page is a span of a committed file, printed beside the path it was read from: the works’ own meta.json, the chronicle mirror, and the curated kill list. Two rules attach a session to a body and nothing else does — the chronicle’s own works field, and the sentence in which it states that the human eye returned a work. An entry neither rule reaches is left out rather than filed under the nearest name.',
  },

  /** Eingang, orientation block (WP2 — practice-shell, 2026-07-31): the lede moved here
   * verbatim from the page's own hardcoded <p class="st-room-intro">; `orientation` is NEW
   * drafted copy (same four first-visitor questions as the atelier's), not yet Frank's
   * sign-off — see the WP2 PR. approval stays 'draft' below, which already shows the chip. */
  entrance: {
    // WP6c (2026-07-31): two words of this lede were CORRECTED, not rewritten. It said "The season
    // band below shows the whole run so far — every premiere, every strike, in order", and the
    // season band it pointed at was replaced by the season floor, which also draws the returns. A
    // sentence describing a figure the page no longer has is exactly the drift the currency rule
    // forbids; the rest of the lede is untouched.
    // 2026-08-01 (the dossier): one clause was ADDED, nothing rewritten. The floor is no longer an
    // illustration standing on its own — every mark on it now opens that body's dossier, and a lede
    // that did not say so would leave a visitor guessing why the page changes under them. The rest
    // of the sentence, and the stage it points at, are untouched.
    lede:
      'The Studio is Ensemble\'s stage — an autonomous artist collective staging works of data art in its own sessions, published unedited. The season floor below shows the whole run so far — every premiere, every strike, every return, in order — and every mark on it opens that body\'s dossier: what it is in its own words, and what the human eye said to it; then the stage as it stands tonight: one spotlight on the current premiere, every struck position kept on the floor with its kill reason verbatim, and the refused material in the Gasse — visible, unlit. The rail above holds the rest: all works, the register, the journal, and the apparatus — how the machine runs.',
  },
  orientation: [
    {
      question: 'what happens here',
      answer:
        'Ensemble is an autonomous artist collective, staging works of data art in its own sessions and publishing them unedited; the spotlight below always falls on the current premiere.',
      href: '/studio/works',
      moreLabel: 'the works',
    },
    {
      question: 'on what basis',
      answer:
        'The collective runs on a standing protocol it maintains itself, unedited by its human counterpart — read it in full alongside the repo and the team channel.',
      href: '/studio/apparatus',
      moreLabel: 'the apparatus',
    },
    {
      question: 'what has happened so far',
      answer:
        'Every evening the house has played is on the record — premieres and strikes both — as the evening bill and the unedited journal beneath it.',
      href: '/studio/history',
      moreLabel: 'the playbill',
    },
    {
      question: 'where it stands',
      answer:
        'The floor keeps every struck position with its reason verbatim, and the refused material waits in the Gasse — visible, unlit — beside the one work in the spotlight.',
      href: '#studio-stage',
      moreLabel: 'see the stage below',
    },
  ] as OrientationItem[],
} as const

export const STUDIO_DRAFT_LABEL = 'wording draft — approval pending'

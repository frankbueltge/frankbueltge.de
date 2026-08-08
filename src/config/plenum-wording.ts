// Plenum wordings — every visitor-facing string of the Plenum's rooms in one place.
//
// TWO-LAYER RULE (pattern: src/config/{naming,field-wording,studio-wording}.ts):
//
//   GRAMMAR — wordings that already existed on this site and are carried over VERBATIM. The
//     lede, the room labels and the "unedited" note below stood in PlenumPage.astro before this
//     file; moving them is not a rewrite, so they need no new approval.
//   NARRATIVE — copy NEW to the sitting dossier (2026-08-02). It carries `approval: 'draft'`,
//     and every page that renders it shows the draft chip until it is signed off.
//
// THE ONE THING THIS FILE MUST NEVER DO is describe the Plenum as a practice of this ecology.
// It is not one. It is the resident collective of data-snack.com — a main project in its own
// right, not an offshoot — and it appears here as a GUEST VOICE: it holds the fourth lane of the
// Partitur and it keeps its minutes in this repo, but it has no door on the hub and its snacks
// are cooked, served and published in its own house. The house-boundary block below says exactly
// that, and it reuses the hub's own approved description of data-snack.com rather than writing a
// second one that could drift away from it.

import { NAMING } from './naming'

/** The hub's own approved entry for the Plenum's house — imported, never retyped. */
const DATA_SNACK = NAMING.travel.items.find((i) => i.name === 'data-snack.com')!

export const PLENUM_GRAMMAR = {
  approval: 'approved' as const,
  /** the collective's own name for itself, taken in session 1 */
  title: 'Line Check',
  note: '(self-named, session 1)',
  eyebrow: 'Lab · autonomous editorial process',
  /** carried over verbatim from PlenumPage.astro (the entrance's lede since the room existed) */
  lede:
    'The weekly plenum of the data-snack cast — four canon characters and a chair, CHEF, who never pitches and never voices a post. Pitches in voice, a selection with stated reasons (the cross-vote was cut 2026-08-08 — four prompts on one model scoring each other staged a plurality that was prompt-deep), a verification gate for every claim and every voice; the output is social-post drafts and snack concepts that accumulate here. Every post requires human approval before publication. An experiment in autonomous, verifiable editorial process. Unedited. Git is the memory.',
  unedited: 'Written and maintained by the cast · unedited',
  repo: 'https://github.com/frankbueltge/data-snack-plenum',
} as const

export const PLENUM_NARRATIVE = {
  approval: 'draft' as 'draft' | 'approved',

  /** How the protagonist is chosen. Stated on the page because a dossier that opens on one
   *  sitting owes the reader the rule it opened on. */
  selectionRule:
    'the dossier opens on the newest mirrored sitting — the last time the table actually sat — not on a hand-picked one; it moves on its own as the collective lands its next minutes, and every earlier sitting has the same dossier one click away',

  entrance: {
    kicker: 'the sitting dossier',
    h1: 'Line Check — the sitting dossier',
    /** REWRITTEN with the dossier (2026-08-02): the entrance used to print every sitting's full
     *  minutes and every concept brief on one page — twenty-six thousand words of wall. It now
     *  reads one sitting at a time, and the wall moved to a room of its own, unshortened. */
    lede:
      'This is the guest room of the research ecology. The Plenum is not a practice of this house: it is the resident collective of data-snack.com, and it sits weekly to decide what that kitchen serves. What is mirrored here are its minutes — who chaired, who was at the table, what was tabled, what was gated, what was landed. The dossier below reads one sitting at a time, in the collective’s own words; pick any sitting from the list and the whole dossier follows it.',
  },

  orientation: [
    {
      question: 'what happens here',
      answer:
        'A cast of characters sits down each week and pitches in voice; the chair selects with stated reasons (until 2026-08-08 the table cross-voted — the record keeps those votes as they fell), and every claim and every voice passes an independent verification gate before anything leaves the table. Nothing they write is edited here.',
      href: '/plenum/protocol',
      moreLabel: 'the constitution',
    },
    {
      question: 'on what basis',
      answer:
        'A standing instruction the collective wrote and maintains itself, amended in its own minutes with a rationale each time — including the amendment that added the goods-inward inspection of this ecology’s output.',
      href: '/plenum/protocol',
      moreLabel: 'read it in full',
    },
    {
      question: 'what has happened so far',
      answer:
        'Every sitting is minuted the same evening it happens — the pitches and the selection as they fell (votes, in the sittings before 2026-08-08), the gate verdicts with their sources, and the sessions that went missing and were recovered. The complete record is unshortened.',
      href: '/plenum/record',
      moreLabel: 'the complete record',
    },
    {
      question: 'where it stands',
      answer:
        'The dossier below opens on the newest sitting: its table, what was tabled, what it settled, and whatever reached it from this ecology that week.',
      href: '#dossier',
      moreLabel: 'open the dossier',
    },
  ],

  /** THE HOUSE BOUNDARY. The honest form of "this page does not hold their work". */
  house: {
    heading: 'The work of this collective is not on this site',
    body:
      'The Plenum cooks for its own house. Its snacks, its feed and its published posts live at data-snack.com — a main project in its own right, with its own rules, not an offshoot of this ecology. What this repo mirrors is the paperwork: the minutes of each sitting, the constitution the collective runs on, the channel it uses to ask its human counterpart for things, and the concept briefs a sitting graduated. A brief here is a decision to cook something, not the dish.',
    houseLabel: DATA_SNACK.name,
    houseHref: DATA_SNACK.href,
    houseDescription: DATA_SNACK.description,
    laneNote:
      'The Plenum holds the fourth lane of the Partitur — the ecology’s shared score — as a guest voice. It has no door on the hub, because there is no practice of this house behind it.',
    laneHref: '/maschinenraum',
    laneLinkLabel: 'the ecology’s score',
  },

  dossier: {
    heading: 'The sitting dossier',
    lead:
      'One sitting, read out of its own minutes. Every block below is a span of the committed file named under it — nothing here is summarised, and where a sitting recorded nothing under a heading, this says so instead of filling the gap.',
    pickLabel: 'Pick a sitting',
    groups: {
      current: 'The newest sitting',
      earlier: 'Earlier sittings',
    },
    kinds: {
      minutes: 'minutes',
      /** short form for the selector, where the line has to sit beside a date */
      noteShort: 'protocol note',
      /** the record's own words for what this entry is, for the panel that carries it */
      note: 'not a sitting — the collective amending its own protocol, journalled with its rationale',
    },
    fields: {
      table: 'the table',
      agenda: 'what was tabled',
      decisions: 'what it settled',
      goodsInward: 'what reached it from this ecology',
      contents: 'everything else on the record that evening',
    },
    gaps: {
      table: 'This entry opens without a cast list.',
      agenda:
        'This sitting wrote no agenda section. What it did work through is listed under “everything else on the record” below, and the full minutes read in the complete record.',
      decisions:
        'This entry records no landing, vote or verdict of its own under a heading of its own — its contents are listed below.',
      goodsInward:
        'No goods-inward inspection in this sitting’s record. The standing item that reads this ecology’s output was added to the collective’s protocol on 2026-07-17; sittings before that date could not carry one.',
    },
    goodsInwardNote:
      'The collective calls this item “Wareneingang” — goods inward. It is its own standing inspection of what the practices of this ecology have shipped, written in its own words, and it is the only place in these minutes where contact with this house is recorded as such.',
    namesLabel: 'names in this sitting’s record',
    sharedSessionNote:
      'The collective’s own numbering is not unique — the recovery sitting explains why, in its own minutes.',
    wordsLabel: 'words',
    readWhole: 'read the whole sitting, unshortened',
    sourceLabel: 'read from',
    provenance:
      'Every quotation on this page is a span of a committed file in src/content/plenum/journal/, mirrored from the collective’s own repository and unedited. The dossier adds order and headings; it adds no words.',
  },

  record: {
    kicker: 'the complete record',
    h1: 'Every sitting, unshortened',
    lede:
      'The minutes of every sitting and every graduated concept brief, exactly as the collective wrote them. This is the page the entrance used to be; it kept every word and gave up the front door.',
    backLabel: '← the sitting dossier',
  },

  /** The team channel after the same treatment the three practices got (Etappe 2): open asks
   *  first and in full count, the complete document one door further in. */
  requestsRoom: {
    intro:
      'What this collective needs from its human counterpart, and what came back. Every open item stands first — all of them, never a selection.',
    standingHeading: 'The standing rule of this channel',
    openHeading: 'Open — waiting on a human',
    openNone: 'Nothing is open. Every request in this channel has an answer on the record.',
    openNote:
      'Newest ask first. An unanswered request is never a blocker here: past the collective’s own next sitting, silence counts as “decide yourselves”, and the self-decision goes in the minutes like any other move.',
    answeredHeading: 'Settled, and notes from the human side',
    answeredNote: 'The most recent closed exchanges, each in full in the archive.',
    /** The honest state of this channel on 2026-08-02: the collective's own "Answered / resolved"
     *  section reads "(none yet)". Saying so is the point — a room that prints five answers where
     *  none exist would be inventing the reassurance it is meant to make checkable. */
    answeredNone: 'Nothing has been settled on this channel yet — the collective’s own answered section reads “(none yet)”.',
    notesOnlyNote:
      'No request on this channel has been answered yet — the collective’s own “Answered / resolved” section reads “(none yet)”. What stands below came the other way: notes from the human side, which owe no reply.',
    seedsHeading: 'The other direction — seeds',
    seedsNote: 'Offers left here for the collective. Offers, not orders.',
    archiveLink: 'The whole channel, unedited →',
    archiveHeadline: 'The team channel, complete',
    archiveNote:
      'The document as the collective keeps it, verbatim and unshortened — every request, offer and answer in the order it was written.',
    backToRoom: '← what is open',
    fullTextLabel: 'read it in full',
  },
} as const

export const PLENUM_DRAFT_LABEL = 'wording draft — approval pending'

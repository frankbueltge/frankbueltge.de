// src/config/edition-wording.ts — every word of the entrance as an edition (2026-10-11).
//
// The entrance was an ops room from 2026-08-11 (NAMING.opsRoom); since 2026-10-11 it is laid
// out like the front page of a paper — design handoff docs/design_handoff_homepage_ecology/
// README.md §2 and §3, approval trail docs/decision-log.md. Its copy lives here rather than in
// naming.ts for the same reason the ecology's and the gallery's do: one surface, one file.
//
// The ops room's law is unchanged, and edition-wording.test.ts holds it: NOT ONE DIGIT IS
// TYPED. Where a number has to sit inside a sentence the sentence is a function and the number
// its argument; where the SCRIPT has to write the sentence — the reader's own last visit is
// not known at build time — it is a template with {placeholders} the script fills, so the
// script owns none of the words. Counts that carry the sentence's grammar are spelled out by
// `inWords` from the value they describe ("twelve two-hour blocks" is 24 ÷ the snapshot's own
// bin size), never written as a word someone has to remember to change.
//
// What is NOT here: the standing question (NAMING.focusKicker, NAMING.title), the name line
// (NAMING.eyebrow, in the top bar), the names and one-liners of every system (NAMING.doors,
// NAMING.overview), the tiles' sentences (NAMING.opsRoom.live.tiles) and the pulse's hover
// readout (NAMING.opsRoom.pulsePanel) — the edition reads those where they already stand.

import type { CyclePhase, CycleSource } from '@/lib/ecology/v3'

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** A small count as a word, house style ("seven nights"); anything past twelve stays a figure. */
export const inWords = (n: number): string => WORDS[n] ?? String(n)

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
const cycleLabel = (n: number): string => `cycle ${String(n).padStart(3, '0')}`

export const EDITION = {
  masthead: {
    /** the right end of the dateline: a template, because the clock is the script's */
    clock: 'now {clock}',
    /** what stands there before the script has run — a build-time clock would be a stopped one */
    clockIdle: 'UTC',
    /** the largest size, in px, the standing question is fitted to on its one line (the calm
     *  homepage, 2026-11-03: docs/design_handoff_homepage_calm/README.md §1) */
    titleMax: 150,
  },

  /** the side column beside the main one (the calm homepage, 2026-11-03), as a landmark */
  aside: {
    label: 'What is running',
  },

  pulse: {
    headLeft: (repos: number) => `Pulse · ${repos} repositories`,
    /** the same line where the frame is a phone's width */
    headLeftShort: (repos: number) => `Pulse · ${repos} repos`,
    headRight: (weekRange: string) => weekRange,
    headRightMore: ' · two lines/week',
    footLeft: (binHours: number) => `${binHours}-hour bins · tapered`,
    footLeftMore: ' · one line per half week, oldest at the top',
    footRight: (asOf: string) => `as of ${asOf}`,
  },

  /**
   * FROM THE LAB (2026-11-02): the band the entrance opens with since Frank's decision of that day
   * (wording private; paraphrased: the homepage leads with the lab's experiments). Since 2026-11-03
   * a lead work, large, over a carousel of a fixed selection; the order is
   * src/lib/ops/lab-carousel.ts, the island src/components/ops/LabCarousel.tsx. The island writes
   * no word of its own: the templates below carry {placeholders} it fills.
   */
  lab: {
    /** The work that leads the band, large, above the carousel (the calm homepage, 2026-11-03:
     *  docs/design_handoff_homepage_calm/README.md §3). */
    lead: ['ducking'],
    /** The carousel under the lead: exactly these, in this order (same README §3). /experiments
     *  keeps listing every other experiment. */
    picks: ['trending', 'third-reading', 'balance', 'consensus', 'tell', 'ueberflug', 'spielraum', 'redaction', 'invoked-past'],
    title: 'From the lab',
    sub: 'the lab’s own experiments, one at a time',
    all: { label: 'Every experiment, by research line →', href: '/experiments' },
    /** what a screen reader calls the band and each of its cards (aria-roledescription) */
    carousel: 'carousel',
    slide: 'slide',
    /** a card's name to a screen reader */
    position: '{n} of {total}',
    /** the counter between the two buttons */
    count: '{n} / {total}',
    prev: 'Previous experiment',
    next: 'Next experiment',
    /** said, politely, after a button or an arrow key has moved the row — never on a plain scroll */
    announce: '{title}, {n} of {total}',
    /** the last line of a card: what opening it leads to */
    open: 'open the {kind} →',
    /** the frame of a work whose page has no still yet, which shows the miniature /experiments
     *  draws from the work's own record instead */
    mini: 'no still yet · its record, drawn small',
    /** what a screen reader calls the lead card above the carousel */
    leadLabel: 'the lab’s lead experiment',
  },

  /**
   * THE SINCE BAR. Two sentences, and the script may have to write either: the default one is
   * rendered at build time from the same templates, so what a reader without JavaScript sees
   * is word for word what the script would have written for "since yesterday".
   */
  since: {
    yesterday: 'Since yesterday: {arrivals} across the house.',
    /** a quiet day: the newest record is the pulse's own stamp and nothing is dated after it */
    yesterdayNone: 'Since yesterday: nothing new across the house.',
    visit: 'Since your last visit, on {day}: {span}, {arrivals} across the house.',
    /** the reader was here after the newest record */
    visitNone: 'Since your last visit, on {day}: nothing new across the house.',
    /** the reader's last visit lies further back than the page counts arrivals for */
    visitBeyond: 'Your last visit was on {day}. In the {span} this page counts: {arrivals} across the house.',
    arrival: ['arrival', 'arrivals'] as const,
    day: ['day', 'days'] as const,
    remember: {
      off: '○ remember my visits',
      on: '● remembering your visits',
      /** the three notes beside the button: before, switched on today, and with a visit to count from */
      noteOff: 'one timestamp, stored only in this browser, nothing is sent',
      noteFresh: 'from your next visit on · stored only in this browser',
      noteOn: 'stored only in this browser · click to forget',
    },
    modes: { visit: 'since your last visit', yesterday: 'since yesterday' },
    /** what the timetable's footnote says is shaded, per mode */
    shade: { yesterday: 'the last day', visit: 'days since your last visit' },
    /** the heading over the list of arrivals, per mode */
    title: { yesterday: 'Since yesterday', visit: 'Since your last visit' },
  },

  /**
   * THE LEAD: the research ecology's running cycle. The kicker and the standfirst are functions
   * of the cycle's own state (src/data/ecology/cycle.json) and of how many of the three
   * practices have landed a piece since it opened — the handoff's mock typed "cycle 007 opened
   * today" and "each … committed one piece", which was true on the day it was drawn.
   */
  lead: {
    house: 'The research ecology',
    kicker: (p: { cycle: number; phase: CyclePhase; age: number }) => {
      const label = cycleLabel(p.cycle)
      if (p.phase === 'convening') return `${label} presented · the convening is open`
      if (p.phase === 'presenting') return `${label} · the presentations`
      if (p.phase === 'closing') return `${label} · closing`
      if (p.age <= 0) return `${label} opened today`
      if (p.age === 1) return `${label} opened yesterday`
      return `${label} · day ${p.age + 1}`
    },
    /** what stands as the headline while no shared question is set */
    noQuestion: 'No shared question: each practice works its own default theme.',
    /**
     * A convening whose tally stands (2026-11-02). Between the tally and the day the cycle clock
     * turns, the lead shows the question the practices chose and the day it opens, not the question
     * they just presented. Until then the front page kept saying they were still proposing and
     * ranking, while /ecology already showed the result. Same dates and same veto as /ecology.
     */
    chosenKicker: (p: { next: number; opens: string }) => `${cycleLabel(p.next)} opens ${p.opens}`,
    chosenStandfirst: (p: { after: number; next: number; opens: string; practices: number }): string =>
      `The ${inWords(p.practices)} machine-run practices proposed and ranked the next question in the convening ` +
      `after ${cycleLabel(p.after)}, and this one won the tally. It opens ${cycleLabel(p.next)} on ${p.opens} ` +
      'unless the architect objects.',
    /**
     * Two sentences under the question: where it came from, and where the work on it stands.
     * `pieces` is how many of the `practices` have landed something since the cycle opened;
     * `previous` is the cycle before, for the convening that chose this one.
     */
    standfirst: (p: {
      source: CycleSource
      phase: CyclePhase
      age: number
      pieces: number
      practices: number
      previous: number
    }): string => {
      const all = inWords(p.practices)
      const origin =
        p.source === 'convening'
          ? `The ${all} machine-run practices chose the question in the convening after ${cycleLabel(p.previous)}.`
          : p.source === 'seed'
            ? `The question came in as a seed through the public channel and was released to all ${all} machine-run practices.`
            : p.source === 'continuing'
              ? `The ${all} machine-run practices are on the continuing question, which stands between seeds and convenings.`
              : `No shared question is set, so each of the ${all} machine-run practices works its own default theme.`
      const state =
        p.phase === 'convening'
          ? `All ${all} have presented, and they are now proposing and ranking the next question.`
          : p.phase === 'presenting'
            ? 'The sessions are done, and each is closing the cycle with one self-contained presentation.'
            : p.phase === 'closing'
              ? 'The cycle is closing.'
              : p.pieces === 0
                ? 'Nothing has landed on it yet.'
                : p.age <= 0 && p.pieces === p.practices
                  ? 'Overnight each opened its first session on it and committed one piece.'
                  : p.pieces === p.practices
                    ? 'Each works it in its own discipline; the newest piece of each is below.'
                    : `${p.pieces === 1 ? 'One' : inWords(p.pieces).replace(/^./, (c) => c.toUpperCase())} of the ${all} ${p.pieces === 1 ? 'has' : 'have'} landed a piece on it so far.`
      return `${origin} ${state}`
    },
    /** under a brief: what kind of piece, and when — relative to the edition's own day */
    when: { today: 'today', yesterday: 'yesterday' },
    /** a practice with nothing on the running question yet: the absence is drawn */
    absent: 'nothing on this question yet',
    /**
     * The programme (2026-11-08; docs/design/2026-11-08-the-programme.md): once the ecology holds one
     * large question for weeks, the lead names that question, not the cycle's step.
     */
    programme: {
      selectingKicker: 'The ecology is choosing its question',
      selectingTitle: 'The ecology is choosing one large question to hold for eight to twelve weeks.',
      selectingStandfirst: (p: { next: string }): string =>
        'No more new subject every few days: the Middle has drawn candidates from the research and risk agendas of the world, the practices argue for and against them, and the highest score in the open wins. ' +
        `${cap(p.next)} opens as the first step of that question. The architect has a veto and does not choose.`,
      chosenKicker: (p: { opens: string }) => `Question chosen · the first step opens ${p.opens}`,
      chosenStandfirst: (p: { next: string; opens: string }): string =>
        `The ecology chose this question for the next eight to twelve weeks. ${cap(p.next)} opens on ${p.opens} as its first step, unless the architect objects.`,
      runningKicker: (p: { step: number; cycle: string }) => `The question · step ${inWords(p.step)}, ${p.cycle}`,
      runningStandfirst: (p: { step: string }): string => `This step asks: ${p.step}`,
      link: { label: 'The question, its plan and what is known →', href: '/question' },
    },
    links: [
      { label: 'Enter the ecology →', href: '/ecology' },
      { label: 'Every work and artifact →', href: '/ecology#register' },
    ],
  },

  timetable: {
    title: 'Timetable',
    sub: 'who worked when · UTC',
    /** the mark of a day on which nothing ran */
    none: '·',
    /** "04–24": the hour the first active block begins, the hour the last one ends */
    span: (from: number, to: number) => `${String(from).padStart(2, '0')}–${String(to).padStart(2, '0')}`,
    /** one cell, in a sentence — the readout under the table, and the cell's accessible name */
    readout: (p: { name: string; day: string; commits: number; active: number; perDay: number; blockHours: number; hours: string[] }) =>
      `${p.name} · ${p.day}: ${p.commits} commit${p.commits === 1 ? '' : 's'} in ${p.active} of ${p.perDay} ${inWords(p.blockHours)}-hour blocks` +
      (p.hours.length ? ` (${p.hours.join(' ')})` : ''),
    /** the footnote: the rule a cell follows. `{shade}` is filled per mode (since.shade). */
    foot: (p: { blockHours: number }) =>
      `Each cell gives the first and last ${inWords(p.blockHours)}-hour block of the day with commits; a dot means none. Shaded: {shade}. Only what has run is shown.`,
    /** the same footnote where a cell is a strip of bars */
    footStrip: (p: { perDay: number; blockHours: number }) =>
      `Each cell is one day in ${inWords(p.perDay)} ${inWords(p.blockHours)}-hour blocks; bar height by commits. Tap a cell for the numbers. Shaded: {shade}.`,
    /**
     * The row this site keeps for itself: the lab's nightly instruments and the catalogue
     * scouts commit to the site's own repository, so its commits are theirs. It is a row of the
     * timetable and a column of "house by house", and it has no door or card to read a name
     * from — hence this entry.
     */
    site: {
      id: 'site',
      repo: 'frankbueltge.de',
      name: 'Lab & catalogues',
      href: '/experiments',
      status: 'DAILY',
      relation: 'the lab’s readings, the catalogues, the site itself',
    },
  },

  overnight: {
    title: 'Overnight, house by house',
    sub: 'what each system delivered last',
    /** under a house: when its last piece landed, how much it committed, what it is */
    meta: (p: { day: string | null; commits: number; days: number; relation: string }) =>
      [p.day, `${p.commits} commit${p.commits === 1 ? '' : 's'} in ${inWords(p.days)} nights`, p.relation].filter(Boolean).join(' · '),
    /** a house whose record holds nothing dated: the absence is drawn */
    absent: 'nothing landed on the record yet',
  },

  readings: {
    title: 'Readings',
    /* Not "as reported this morning", as the handoff's mock has it: a reading is whatever its
       instrument last committed, and an instrument that has been silent for a week would make
       that phrase a lie the page cannot see. */
    sub: 'the live experiments, as each last reported',
    link: { label: 'lab →', href: '/experiments' },
  },

  arrivals: {
    link: { label: 'the longer log →', href: '/now#latest' },
    /** "SATURDAY, 10 OCTOBER · 19 ARRIVALS" */
    dayHead: (day: string, count: number) => `${day} · ${count} arrival${count === 1 ? '' : 's'}`,
    more: (n: number) => `and ${n} more in the longer log`,
    /** nothing is newer than the reference point */
    none: 'Nothing has arrived since then.',
    /** the reader's last visit lies before the oldest day listed here */
    earlier: 'Earlier days stand in the longer log.',
  },

  index: {
    catalogue: 'Catalogue',
    house: 'Other house ↗',
    label: 'Catalogues and other houses',
  },
} as const

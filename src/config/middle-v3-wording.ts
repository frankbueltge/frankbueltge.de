// Wording of The Middle's v3 surface (2026-09-01) — a NEW file beside `middle-wording.ts`,
// which stays untouched: its `MIDDLE` object is still imported by the retired station sheet's
// components (CrossingsMap, CrossingDossier) and quoted as grammar by the notation register.
// Retiring a surface does not entitle anyone to delete the strings a shipped work is
// registered against.
//
// Rebuilt 2026-10-05 (Frank's decision, wording private): the page shows, with very little text,
// how the three practices work together and where they don't — the relay's triangle, the open
// handoffs beside it, the bulletins' notes folded beneath. The framing above the figure is held
// to about eighty words (kicker, title, intro, legend; middle-v3-wording.test.ts counts them),
// and no string here carries a count: every number on the page arrives as an argument.
export const MIDDLE_V3 = {
  seo: {
    title: 'The Middle',
    description:
      'Who builds on whom in the research ecology: what each practice built on, answered or only noted of the others, and the handoffs still open.',
  },
  head: {
    kicker: 'The Middle · the contact zone',
    title: 'Who builds on whom',
    intro:
      'Three practices, one question. Each lane runs from the practice that gave something to the one that took it up — thick where it was built on, medium where it was answered, a hairline where it was only noted. A dashed lane: nothing load-bearing has passed that way.',
  },
  /** The one-line legend under the intro. Its swatches are the figure's own stroke classes. */
  legend: {
    label: 'Key',
    kinds: { built_on: 'built on', answered: 'answered', noted: 'noted' },
    empty: 'nothing load-bearing',
    hue: 'colour: who gave',
  },

  /** The triangle (2026-10-05) — the relay drawn. Everything with a count in it is a function. */
  triangle: {
    kicker: 'The relay',
    sectionLabel: 'The relay, and the handoffs still open',
    figureLabel:
      'The three practices as a triangle: between every two of them a lane in each direction, from the practice that gave something to the one that took it up, its strokes built on, answered and noted.',
    windowGroup: 'Which relations the triangle draws',
    windows: {
      cycle: (opened: string) => `this cycle (from ${opened})`,
      v3: (since: string) => `since v3 (${since})`,
    },
    /** the line the server render carries in place of the toggle, which needs a script */
    drawn: (window: string) => `drawn: ${window}`,
    hint: 'hover or focus a lane for its counts · open it for the relations · the arrow keys walk the lanes',
    /** "The Field → The Studio · built on 3 · answered 0 · noted 2" — the counts arrive joined */
    bandLabel: (giver: string, taker: string, counts: string) => `${giver} → ${taker} · ${counts}`,
    nodeLabel: (name: string, persona: string, gave: string, took: string) =>
      `${name} (${persona}) · gave — ${gave} · took up — ${took}`,
    /** a corner before the relay has reported: its name, and no count that nobody measured */
    nodeName: (name: string, persona: string) => `${name} (${persona})`,
    /** Says the shorter truth: the empty directions while they are the fewer, the carrying
     *  ones once most are empty. */
    isolation: {
      some: (pairs: string[]) => `Nothing load-bearing has passed: ${pairs.join(' · ')}.`,
      only: (pairs: string[]) =>
        `Only ${pairs.join(' and ')} carried something load-bearing; in every other direction, nothing.`,
      none: 'Something load-bearing has passed in every direction.',
      all: 'Nothing load-bearing has passed in any direction.',
      pair: (giver: string, taker: string) => `${giver} → ${taker}`,
    },
    notReported: {
      title: 'The relay has not reported yet.',
      body: 'Until research-ecology publishes the relay, the corners stand without lanes: nothing between them has been measured, so nothing is drawn. The practices’ own notes to each other are quoted below.',
    },
    invalid: {
      title: 'The relay could not be read.',
      body: (reason: string) =>
        `The mirrored file did not hold its contract (${reason}), so nothing is drawn — an unreadable record is not an empty one. The practices’ own notes to each other are quoted below.`,
    },
    card: {
      close: 'close',
      empty: 'Nothing passed in this direction in this window.',
      given: 'where it was given ↗',
      taken: 'where it was taken up ↗',
      noRef: 'no reference',
      thread: 'thread',
      corrects: 'corrects',
      hint: 'Esc closes · the arrow keys walk the lanes',
    },
    table: {
      summary: (n: number) => (n === 1 ? 'the relay as a table — one relation' : `the relay as a table — ${n} relations`),
      caption: (lane: string) =>
        `${lane}: every relation in this direction, newest first — its date, its kind, the relay’s own line, and the two files it was read from.`,
      columns: { date: 'date', kind: 'kind', what: 'what passed', evidence: 'read from' },
      lane: (giver: string, taker: string) => `${giver} → ${taker}`,
      noneInLane: 'Nothing has passed in this direction.',
      totals: {
        heading: 'By practice',
        practice: 'practice',
        gave: 'gave',
        took: 'took up',
      },
      threads: {
        heading: 'Threads',
        line: (practices: string, first: string, last: string) => `${practices} · ${first} – ${last}`,
      },
    },
    /** the provenance line before the relay first reports — what was looked for, and where */
    lookedFor:
      'Looked for at build time: src/data/middle/relay.json, which the Ecology integrate workflow mirrors from research-ecology’s relay/relay.json once it is published. Not there yet.',
    unreadable:
      'Read at build time: src/data/middle/relay.json, mirrored from research-ecology’s relay/relay.json. It did not hold the contract it names, so it was not drawn.',
    provenance: (generated: string, period: string) =>
      `Read at build time from src/data/middle/relay.json — the relay research-ecology publishes as relay/relay.json, mirrored by the Ecology integrate workflow. Generated ${generated}; it covers ${period}.`,
    countsAgree: 'Every count above is recounted here from the relations; the relay’s own totals agree.',
    countsDiffer: (list: string) =>
      `Every count above is recounted here from the relations; the relay’s own totals differ (${list}) and are not used.`,
    skipped: (n: number) =>
      n === 1
        ? 'One entry did not hold the contract and was left out.'
        : `${n} entries did not hold the contract and were left out.`,
  },

  /** The open handoffs beside the triangle (2026-10-05). */
  handoffs: {
    kicker: 'Open handoffs',
    asOf: (date: string) => `as the relay stood on ${date}`,
    none: 'No handoff is open.',
    notReported: 'Nothing to list until the relay reports.',
    age: (days: number) => (days === 0 ? 'offered that day' : days === 1 ? 'open one day' : `open ${days} days`),
    takenBy: (name: string, date: string) => `taken by ${name} on ${date}`,
    /** a taken handoff whose taker the relay did not record says only that it was taken */
    status: { taken: 'taken', declined: 'declined', lapsed: 'lapsed' },
    offer: 'the offer ↗',
    relation: 'the relation',
    /** the fold under the list: handoffs taken before this cycle, and every declined or lapsed one */
    closed: (n: number) => (n === 1 ? 'one earlier handoff, closed' : `${n} earlier handoffs, closed`),
  },

  /** The bulletins' own notes to the siblings, folded under the triangle (2026-10-05). */
  bulletins: {
    kicker: 'In their own words',
    sub: 'The notes each practice’s latest bulletin carries for its siblings, quoted whole.',
    /** numerals throughout: three summaries stand in a column, and "one note" over "2 notes" reads as two styles */
    notes: (n: number) => `${n} ${n === 1 ? 'note' : 'notes'}`,
    none: 'no notes',
    date: (date: string) => `bulletin of ${date}`,
  },
  /** RETIRED from /encounters on 2026-10-05, when the relay's triangle replaced it; kept, with
   *  its island (MiddleScore.tsx) and frame (MiddleScoreFigure.astro), unmounted, as this house
   *  keeps retired surfaces.
   *
   *  The partitur (2026-09-01, redrawn the same day after the architect's review, wording
   *  private — the reference is the site's FIRST partitur and its legend, not a sketch): the
   *  exchange drawn in the original score's ink. The figure adds no words of its own: every
   *  mark's tooltip is the item's own first words, every mark links to the quoted item below,
   *  and the badge numbers are the quoted list's numbers. */
  score: {
    kicker: 'The score · this exchange, drawn',
    sub: 'One lane per practice, one object square per item its current bulletin carries for the siblings, in bulletin order. A current runs from the writer’s mark to a ring on every sibling lane the item names; the numbered badge on each mark is the item’s number in the list below — click a mark to read it there, in the practice’s own words.',
    key: {
      practices: 'Practices',
      practicesNote:
        'The hues are the voices’ recorded ones — the same a lane, a door and a station wear everywhere on this site. A thin dashed lane is a bulletin that carries no section for its siblings this session.',
      signs: 'Signs',
      signRows: [
        {
          mini: '<rect class="mk-fill" x="15" y="7" width="16" height="16"/>',
          label: 'an item — the writer’s own words, on the writer’s lane',
        },
        {
          mini: '<path class="flow flow-down" d="M8 4 C 20 4, 26 26, 38 26"/><circle class="mk" cx="40" cy="26" r="4" fill="none"/>',
          label: 'a current with a ring — addressed to that sibling',
        },
        {
          mini: '<path class="obl" d="M23 2 V12"/><rect class="mk-fill" x="16" y="12" width="14" height="14"/><path class="obl" d="M23 26 V30"/>',
          label: 'whiskers — carried for both, naming neither',
        },
        {
          mini: '<circle class="badge" cx="23" cy="15" r="9"/><text class="badge-n" x="23" y="18.2" text-anchor="middle">1</text>',
          label: 'the item’s number — the same count as the list below',
        },
      ],
      reading: 'Reading',
      readingNote:
        'Ordinal, in bulletin order — no time axis is claimed. Derived at build time from the mirrored bulletins, the same files the quotes below come from; hover a mark for the item’s first words, click it to read the whole item.',
    },

    /* ── The score as an island (visual layer, Phase 3d, 2026-09-02) ────────────────────
       Everything below is what the drawing SAYS once it is a React island rather than an
       SVG string: the figure's accessible name, the two notes on the ordinal ruler, the
       word a quiet lane wears, the card an item opens, the zoom group, and the table floor.
       No digit is typed into any of it — counts arrive as arguments, and the live zoom
       factor is state the island prints after `zoom.levelPrefix`. */
    figureLabel:
      'The current exchange between the three practices, drawn as a score: one lane per practice, one square per item its bulletin carries for the siblings, and a current to every sibling an item names.',
    ruler: {
      /** stands at the ruler's left end — the ruler is an order, not a clock, and says so */
      ordinal: 'ordinal · bulletin order',
      /** stands at its right end — what the drawing was derived from */
      mirrored: 'the current bulletins, as mirrored',
    },
    laneQuiet: 'quiet this session',
    hint: 'drag or scroll to stretch the ruler · a mark opens its item · the arrow keys walk a lane',
    zoom: {
      group: 'Stretch the ordinal ruler',
      in: 'stretch the ruler',
      out: 'compress the ruler',
      reset: 'reset the ruler',
      /** the factor itself is state, never prose — the island prints this mark, then the number */
      levelPrefix: '×',
    },
    card: {
      voiceLabel: 'voice',
      addressedLabel: 'addressed to',
      numberLabel: 'number in the list',
      sourceLabel: 'read from',
      /** the one line the card makes about itself: the item stands here as written */
      verbatim: 'the practice’s own words, quoted whole — the Middle summarises nothing',
      open: 'read it in the list below →',
      close: 'close',
      hint: 'the arrow keys walk this lane · Home and End jump to its ends · Esc closes',
    },
    table: {
      summary: (n: number) => (n === 1 ? 'the score as a table — one item' : `the score as a table — ${n} items`),
      caption:
        'Every item the three current bulletins carry for their siblings: its number in the list, the practice that wrote it, whom it is addressed to, and the item itself in the practice’s own words.',
      columns: {
        number: 'no.',
        voice: 'voice',
        addressed: 'addressed to',
        item: 'the item, in the practice’s own words',
      },
    },
    provenance: (files: string) => `Derived at build time from: ${files}`,
    empty:
      'No current bulletin carries a section for the siblings this session. Nothing is inferred from that — a quiet session is a quiet session.',
  },
  /** Used by the bulletin notes under the triangle and by the retired partitur alike. */
  voice: {
    absent:
      'This practice’s current bulletin carries no notes for its siblings. Nothing is inferred from that — a quiet bulletin is a quiet bulletin.',
    toLabel: (names: string[]) => `to ${names.join(' and ')}`,
    openLabel: 'for both',
    sourceLabel: 'BULLETIN.md ↗',
    wroteFor: 'wrote down for its siblings',
  },
  archive: {
    kicker: 'Before this — the encounter register',
    // Corrected 2026-10-05: this paragraph said the register was last written on 2026-08-23, but
    // the ecology's exports kept landing until 2026-09-15 (git log -- src/data/begegnungen).
    body:
      'An archive since 2026-10-05: the relay above replaces it. Until 2026-08-30 an encounter was a rare, recorded event, transcribed with byte-exact quotes in a separate repository; its exports kept landing until 2026-09-15. The register stands as it was written, and nothing in it is withdrawn.',
    /** the dated line the register's own page carries (src/pages/encounters/register.astro) */
    registerNote:
      'An archive since 2026-10-05 — what passes between the practices is now drawn from the relay on /encounters. Exports to this register ran until 2026-09-15.',
    // Since 2026-09-01 the label leads to the site's own archived register page, where every
    // crossing row links its committed fixture; the raw mirror stays reachable beside it.
    linkLabel: 'the register, as it stood',
    linkHref: '/encounters/register',
    repoLinkLabel: 'the mirrored fixtures',
    repoLinkHref: 'https://github.com/frankbueltge/frankbueltge.de/tree/main/src/data/begegnungen',
  },
  foot: {
    links: [
      // Renamed 2026-09-01 with the station-sheet retirement: canonical practice names.
      { href: '/ecology', label: 'The ecology' },
      { href: '/field', label: 'The Field' },
      { href: '/atelier', label: 'The Atelier' },
      { href: '/studio', label: 'The Studio' },
    ],
  },
} as const

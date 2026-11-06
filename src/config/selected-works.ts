// The selected works (2026-10-17): the strongest finished pieces across the house, on one shelf.
//
// The entrance shows what is running — the cycle, the timetable, the night's arrivals — and a
// first-time visitor learns from it that much is happening here, never what has been made. The
// shelf answers that in one band near the top of the edition (HomeEdition.astro), and the dossier
// for curators and press shows the same shelf with each pick's reason (/dossier).
//
// HOW TO SWAP A PICK. Edit `picks` below; nothing else. A pick names where its piece's record lives
// (`work`), says in one sentence what the piece is to someone who has never been here, and gives
// the reason it stands on the shelf. Title, maker, date, address and still are read from the
// record (src/lib/ops/selected-works.ts), so they cannot drift from it. When the new pick's maker
// committed a still, run `npm run shelf:stills` once: it crops the maker's own picture to the
// shelf's frame (scripts/shelf-stills.ts), and src/lib/ops/selected-works.test.ts turns red until
// that file exists. The order here is the page's order without JavaScript and on /dossier. With
// JavaScript the edition draws eight at random on every visit from every finished piece the site
// publishes, these picks among them (src/lib/ops/shelf-pool.ts, since 2026-10-22).
//
// THE LAB'S PICKS STAND ABOVE THE SHELF ON THE EDITION (since 2026-11-02, Frank's decision, wording
// private: the homepage leads with the lab's experiments). There the lab's experiments have a
// carousel of their own, and the shelf under it holds the practices' pieces only
// (src/lib/ops/shelf-pool.ts, withoutLab). A lab experiment among the picks therefore shows on the
// edition in the carousel, and on /dossier as a pick with its reason, as before.
//
// A PICK THAT STOPS READING never takes the page down: the shelf leaves it out and the build says
// which and why. The test holds every pick strictly where a person changes the shelf (locally and
// in the pull request's CI); in the nightly integrate and deploy runs it only asks that five still
// stand, because a practice's own mirror must never be turned red by a shelf the house chose.
//
// WHAT A PICK MUST BE, the criteria the first eight were chosen by (Frank's brief of 2026-10-17,
// wording private, paraphrased): finished and published on this site under the publication rule
// (src/lib/engines/publication.mjs; the test checks every address); legible to an outsider in
// under a minute; a USP verdict where one exists (docs/audits/2026-08-09-usp-audit.md); alive, or
// honestly dated; visually strong.
//
// Three house rules hold here as on the rest of the entrance, and the test holds them:
//   · NO DIGIT IS TYPED. A sentence or a reason with a number in it goes stale the night the
//     record moves; a date or a count the card shows is read from the record.
//   · NO PICTURE IS MADE UP. A card shows its maker's own still; where the maker committed none,
//     a screenshot of the piece's own page as this site serves it (scripts/shelf-shots.ts, since
//     2026-10-23, Frank's request, wording private); only where neither exists, a plate that says
//     so. The shelf crops and scales a picture of the piece; it never draws one.
//   · NOTHING IS LINKED THAT THE SITE DOES NOT PUBLISH. A pick whose page leaves the site turns the
//     test red instead of leaving the shelf pointing at a redirect.

/** Where a pick's record lives. */
export type ShelfWork =
  /** a Studio work: src/content/studio/works/<slug>/meta.json and public/studio/werke-html/<slug>/ */
  | { kind: 'studio-work'; slug: string }
  /** a practice's cycle presentation: public/<practice>/presentations/cycle-NNN/ */
  | { kind: 'presentation'; practice: 'atelier' | 'field' | 'studio'; cycle: number }
  /** the Field's paper of a cycle, rendered at /field/papers/cycle-NNN/ */
  | { kind: 'field-paper'; cycle: number }
  /** a lab experiment or instrument: src/data/werke.ts */
  | { kind: 'experiment'; id: string }
  /** a page n-1 declared a work: public/n-1/surface/margin.json, matched by the address it gives
   *  (relative to n-1's front page), which is steadier than a title the practice may revise */
  | { kind: 'n-1-work'; href: string }
  /** an experiment of Machine Attention: src/data/attention/export.json */
  | { kind: 'attention-experiment'; id: string }
  /** a work of Ulysses, the nightly line (frankbueltge/error-as-method), made since its fork:
   *  src/data/nightly/works/<slug>/meta.json, its page at /error-as-method/<slug>/ */
  | { kind: 'nightly-work'; slug: string }

export interface ShelfPick {
  work: ShelfWork
  /** What the piece is, to someone who has never been here: one sentence, no digit. A lab
   *  experiment may leave it out and carry its register line (werke.ts `subtitle`); every other
   *  pick says it here. */
  sentence?: string
  /** Why it stands on the shelf: one line, no digit. /dossier prints it beside the card. */
  reason: string
  /** For a still taller than its frame: where the frame sits on it, from the top (0) to the
   *  bottom (1). Read by scripts/shelf-stills.ts only. */
  focus?: number
}

export const SELECTED_WORKS = {
  /** The edition's shelf since 2026-11-03 (the calm homepage, docs/design_handoff_homepage_calm/
   *  README.md §4): the practices' finished pieces, newest first, with chips and a random draw
   *  (src/lib/ops/ecology-shelf.ts). /dossier keeps the picks below as its shelf of record. */
  /** Renamed 2026-11-06 (Frank, wording private): the shelf holds the latest works of every
   *  practice, Ulysses' nightly works included, not of the ecology alone. */
  title: 'Latest works from the practices',
  sub: 'finished pieces from the machine-run practices',
  /** the controls of the edition's shelf; the script fills the templates */
  ecology: {
    filterLabel: 'Show the pieces of',
    filters: { all: 'All', atelier: 'The Atelier', field: 'The Field', studio: 'The Studio', 'nightly-line': 'Ulysses', 'n-1': 'n-1' },
    /** a chip: its house and how many pieces it holds */
    chip: '{label} {count}',
    modeLabel: 'Order',
    modes: { newest: 'Newest first', random: 'Random draw ↻' },
    /** the order as the status line says it */
    modeWords: { newest: 'newest first', random: 'random draw' },
    /** "6 of 87 · newest first" */
    status: '{shown} of {total} · {mode}',
    more: 'Show more',
  },
  /** what /dossier sets before each pick's reason */
  reasonLabel: 'why it is here',

  /** Pieces the edition shows on every visit, whatever the draw: the other cards are drawn at
   *  random from the pool around them (Frank's request of 2026-10-23, wording private). A pinned
   *  piece is read like any pick, from its record, and needs no words of its own here.
   *
   *  Empty since 2026-11-02: the one piece pinned here, Common Ground, now stands second in the
   *  lab's carousel at the top of the edition (EDITION.lab.lead), on every visit as before, and the
   *  shelf below the carousel holds no lab piece. The mechanism stays for a practice's piece. */
  pinned: [] as ShelfWork[],

  picks: [
    {
      work: { kind: 'studio-work', slug: '2026-10-14-under-warning' },
      sentence:
        'Every US tornado warning of sixteen years as a night map with sound: the people beneath each one light up while it stands, though the record keeps no one who was warned.',
      reason:
        'The clearest form the Studio has found for missing data: a whole country fills with people who were warned, and no record says who they were.',
      focus: 0,
    },
    {
      work: { kind: 'field-paper', cycle: 7 },
      sentence:
        'Five small pre-registered studies of three public records: where each decides that a catastrophe almost happened, by a reader, a keeper or a telescope, and never by what happened.',
      reason:
        'The ecology’s science, written as science: methods, confidence intervals, and the predictions that failed, stated in the abstract.',
    },
    {
      work: { kind: 'studio-work', slug: '2026-10-14-struck-off' },
      sentence:
        'Every asteroid a list in California has ever held as a possible impact, played back with sound: it writes down when it strikes a warning off, and almost never why.',
      reason: 'One public list read whole, from its first entry to this week, until its silence becomes audible.',
      focus: 0.115,
    },
    {
      work: { kind: 'presentation', practice: 'atelier', cycle: 7 },
      sentence:
        'A near miss is half of a sentence: the page cuts every row of three public records in two, asks the reader to join the halves, and says whose sentence they wrote.',
      reason:
        'Artistic research that hands its reader the instrument: the argument is made by the visitor’s own hand, against rows of real records.',
    },
    {
      work: { kind: 'n-1-work', href: 'projects/usgs-fixed-depth/' },
      sentence:
        'Every earthquake in the US Geological Survey’s catalogue has a depth, and for many nobody measured it: a map of the depths assigned where the data cannot say.',
      reason: 'A machine practice finding a hole in a record everybody uses, and drawing it as a map anyone can read.',
    },
    {
      // Ducking in, The Foreknown and Society out (Frank's choice of 2026-11-02, wording private)
      work: { kind: 'experiment', id: 'ducking' },
      reason:
        'The lab’s piece most woven into the house: the briefing’s fields, Common Ground’s counts and real headlines on one desk, and only a held fader keeps a matter audible.',
    },
    {
      work: { kind: 'experiment', id: 'balance' },
      reason: 'A living instrument no neighbour runs: each country’s press against the world’s, read and archived every day.',
    },
  ] satisfies ShelfPick[],

  /** the noun a card's meta line opens with */
  kinds: {
    work: 'work',
    presentation: 'presentation',
    paper: 'paper',
    experiment: 'experiment',
    instrument: 'instrument',
    study: 'study',
    project: 'project',
    archive: 'archive',
  },

  /** When a piece was made, in the words its kind needs. Every day arrives as an argument,
   *  already formatted (src/lib/ops/since.ts, dayMonthYear). */
  when: {
    made: (day: string) => day,
    started: (day: string) => `started ${day}`,
    daily: (day: string) => `read every day since ${day}`,
    span: (from: string, to: string) => `${from} – ${to}, retired`,
    /** a retirement whose day no record still states */
    retired: (from: string) => `since ${from}, retired`,
  },

  /** The plate a piece without a still gets, and the line on it. */
  plate: (noun: string) => `no still on the record — the ${noun} is a page of its own`,
  /** the alternative text of a still */
  stillAlt: (title: string) => `${title}, in its maker’s own screenshot`,
  /** the alternative text of a screenshot of the piece's own page, for a piece whose maker committed no still */
  shotAlt: (title: string) => `${title}, a screenshot of its page`,
}

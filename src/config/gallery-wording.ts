// The words of the experiments gallery (visual layer, Phase 3c, 2026-09-02 — Frank's decision,
// wording private: /experiments becomes an animated gallery whose cards carry a live miniature
// of each instrument's own figure).
//
// Two rules govern this file, both from the wording canon (docs/wording-kanon.md):
//
//   1. NO TYPED NUMBER. Every count and every reading is a FUNCTION of the record, never a
//      string with a digit in it. gallery-wording.test.ts holds the whole file to that: a digit
//      anywhere in a literal fails the suite. The readouts below therefore take their figures
//      already formatted from src/lib/experiments/thumbnails.ts, which reads them out of the
//      committed files.
//   2. ARTICLE-LESS TITLES. Nothing here re-titles an experiment; the titles come from
//      src/data/werke.ts, where they lost their definite article on 2026-08-22.
//
// What is NOT here: any description of an experiment. A card's sentence is the piece's own
// subtitle and its own description, read from the register — this file writes only the frame
// around them.

export const GALLERY = {
  /** the shelf's own head, unchanged in substance from the list this gallery replaces */
  head: {
    kicker: 'THE LAB',
  },

  /** the filter bar — the same three axes, the same words the list used */
  filter: {
    all: 'all',
    reset: 'reset',
    /** "<shown> / <total> shown" — both figures counted from the cards on the page */
    shown: 'shown',
    empty: 'No entry matches this selection.',
  },

  /** the stamps on a card */
  stamp: {
    live: 'live data',
    /** screen-reader prefix before the date stamp */
    opened: 'opened ',
  },

  /** the links out of a card */
  link: {
    open: 'open the experiment →',
    method: 'method sheet →',
    field: 'The field: every experiment against the projects that already exist →',
  },

  /** the miniature itself */
  thumb: {
    /** what a card's figure is, said once for assistive technology */
    role: 'A miniature of this experiment’s own figure, drawn at build time from the file its page reads.',
    /** prefix of a miniature's accessible name: "<title> — <what it draws>" */
    joiner: ' — ',
    /** shown in the readout above the reading: where the drawing was read from */
    from: 'read from ',
  },

  /**
   * What each miniature draws — one line per experiment, in the same voice the pages use.
   * These are labels of a DRAWING, not claims about a finding: they say what is on the axis,
   * never what the axis showed today. The reading of the day is the readout below.
   */
  draws: {
    globe: 'the land of the committed geography with the newest day’s marks on it — a segment per vessel gone dark, a dot per satellite overhead, a filled dot per seat a reading is published from',
    trending: 'the day’s converging topics by the platforms that carried each, over the sources that answered',
    society: 'the room’s agents and the connections between them',
    spielraum: 'each company’s latest reported efficiency against the physical floor',
    beifang: 'third-party requests per article page, with a hollow slot for every page that refused the reader',
    protokoll: 'the night’s entries, one tick each, marked where the reading worsened and hollow where a source fell silent',
    tell: 'the index of the marker words across the years of the corpus',
    redaction: 'one tick per watched page, marked where the page changed, hollow where the change could not be verified',
    'round-number': 'the leading-digit distribution against the expectation it is measured against',
    unexamined: 'every work of the register by how near its closest catalogued neighbour came, nearest first',
    pattern: 'the day’s strongest pair, both series over the days on file',
    praemie: 'the premium index over the years the record covers',
    parallaxe: 'what each tracked topic leaves out, one bar per topic',
    ueberflug: 'the counted fleet over every observation on file',
    consensus: 'the cascade: outlets carrying the day’s phrase as the hours pass',
    'invoked-past': 'how often each year of the past is invoked by the day’s press',
    balance: 'the countries whose own tone and the world’s tone are furthest apart',
    correction: 'each month’s revision, the distance between the first figure and the final one',
    'ghost-fleet': 'hours gone dark per vessel in the window',
  } as Record<string, string>,

  /**
   * The reading of the day, per experiment — composed from the record by
   * src/lib/experiments/thumbnails.ts, which hands in the already-formatted figures. Not one
   * digit is typed here, and none may be: the day these sentences carried a number of their
   * own, the card would start contradicting the file under it.
   */
  readouts: {
    globe: (marks: string, layers: string) => `${marks} marks from ${layers} layers on the newest day the archive holds`,
    trending: (topics: string, platforms: string) =>
      `${topics} converging on ${platforms} independent platforms or more`,
    society: (agents: string, links: string) => `${agents} agents, ${links} connections between them`,
    spielraum: (companies: string, best: string) =>
      `${companies} companies report a figure; the lowest of them claims ${best}`,
    beifang: (measured: string, blocked: string) =>
      `${measured} pages measured, ${blocked} refused the reader outright`,
    protokoll: (entries: string, worsened: string) => `${entries} readings on the night; ${worsened} worsened`,
    tell: (word: string, fold: string) => `“${word}” stands at ${fold} times its own baseline`,
    redaction: (watched: string, changed: string) => `${watched} pages watched, ${changed} changed`,
    'round-number': (name: string, verdict: string) => `${name}: ${verdict}`,
    /* the tallest bar and the ruler it is measured against — both already formatted by the
       derivation, per rule 1 of this file: no digit is typed here */
    unexamined: (top: string, ruler: string) => `nearest catalogued neighbour ${top}; related, inside this house, is ${ruler}`,
    pattern: (a: string, b: string, r: string) => `${a} against ${b}, correlation ${r}`,
    praemie: (base: string, change: string) => `since ${base} the premium has moved ${change}`,
    parallaxe: (topics: string, omission: string) => `${topics} topics tracked, mean omission ${omission}`,
    ueberflug: (fleet: string, observations: string) =>
      `${fleet} satellites counted across ${observations} observations`,
    consensus: (outlets: string, hours: string) => `${outlets} outlets in ${hours} hours`,
    'invoked-past': (year: string, times: string) =>
      `${year} is invoked ${times} times as often as the years around it`,
    balance: (country: string, gap: string) => `${country} rates itself ${gap} points above the world’s tone`,
    correction: (down: string, months: string) => `${down} of ${months} months were revised downward`,
    'ghost-fleet': (vessel: string, hours: string) => `${vessel} spent ${hours} hours dark`,
  },

  /** the three practices beside the lab: no instrument, so no reading — the record's own shape */
  beside: {
    draws: 'one tick per dated entry the practice’s own record holds',
    readout: (entries: string, what: string) => `${entries} ${what} on file`,
    nightly: 'journal entries',
    n1: 'nights',
    arch: 'session records',
  },
} as const

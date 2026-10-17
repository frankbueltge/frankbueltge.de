// src/config/score-wording.ts — the words of the research ecology's pages as a score (2026-10-11).
//
// Design handoff docs/design_handoff_homepage_ecology/README.md §4–§6: /ecology draws the
// cycles since v3 as a score, each practice page shows its own part, and /encounters shows who
// took what from whom. The practices' names, personas, corners and addresses stay where they
// were (ECOLOGY_V3.practices); the SEO strings stay with the pages they belong to
// (ECOLOGY_V3.seo, PRACTICE_V3, MIDDLE_V3). This file holds what the redesigned surfaces say.
//
// The law of the house applies and score-wording.test.ts holds it: no digit is typed. A count,
// a day or a cycle number reaches a sentence as an argument. "v3" is the one exception — it is
// the name of an order, not a count, and it cannot go stale.

import type { RelayKind } from '@/lib/ecology/relay'
import type { CyclePhase, CycleSource, PracticeId } from '@/lib/ecology/v3'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const parts = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() }
}

/** "7 Sept" — a day on a ruler or in a list. Written out here rather than left to the runtime's
 *  locale tables, which abbreviate September differently from one version to the next. */
export const shortDate = (iso: string): string => {
  const p = parts(iso)
  return `${p.day} ${MONTHS[p.month]}`
}
/** "10 Oct 2026" */
export const shortDateYear = (iso: string): string => `${shortDate(iso)} ${parts(iso).year}`
/** "10 October" */
export const longDate = (iso: string): string => {
  const p = parts(iso)
  return `${p.day} ${MONTHS_LONG[p.month]}`
}

/** "007" — a cycle's number as the house writes it */
export const cycleNo = (n: number): string => String(n).padStart(3, '0')

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const inWords = (n: number): string => WORDS[n] ?? String(n)
const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/** The practices' short names — "Field", "Atelier", "Studio" — for a filter chip or a tally. */
export const SHORT: Record<PracticeId, string> = { field: 'Field', atelier: 'Atelier', studio: 'Studio' }

const KIND: Record<RelayKind, string> = { built_on: 'built on', answered: 'answered', noted: 'noted' }

const SOURCE: Record<CycleSource, string> = {
  defaults: 'default themes',
  seed: 'from a seed',
  continuing: 'the continuing question',
  convening: 'chosen in convening',
}

export const SCORE_WORDING = {
  kind: KIND,
  source: SOURCE,
  /** what stands where a cycle of the defaults regime would carry its question */
  noQuestion: 'No shared question: each practice worked its own default theme.',
  /** "10 Oct – running" */
  dates: (opened: string, closed: string | null) => `${shortDate(opened)} – ${closed ? shortDate(closed) : 'running'}`,
  cycleLabel: (n: number) => `Cycle ${cycleNo(n)}`,
  /** a presentation whose own page names no title */
  presentationTitle: (n: number) => `Presentation, cycle ${cycleNo(n)}`,
  /** the Middle's name on these pages */
  middle: 'The Middle',

  // ── the strip under the top bar ────────────────────────────────────────────────────────────
  subnav: {
    home: { label: 'the research ecology', href: '/ecology' },
    sections: [
      { label: 'the score', href: '#score' },
      { label: 'how a cycle works', href: '#cycle' },
      { label: 'the three voices', href: '#voices' },
      { label: 'the programme', href: '#programme' },
      { label: 'the middle', href: '/encounters' },
      { label: 'works register', href: '#register' },
    ],
    seed: { label: 'pose a question →', href: '/seed' },
    middle: { label: 'the middle', href: '/encounters' },
    label: 'The research ecology',
  },

  // ── /ecology ───────────────────────────────────────────────────────────────────────────────
  hero: {
    kicker: (since: string) => `The research ecology · v3, in force since ${shortDateYear(since)}`,
    title: ['One question,', 'three voices.'],
    /** the introduction, in pieces: the practices' names are set in their own colours between them */
    intro: {
      lead: 'Three machine-run practices work on one shared research question at a time, each in its own discipline: ',
      roles: { field: ' as science, ', atelier: ' as artistic research and philosophy, ', studio: ' as data art. ' } satisfies Record<PracticeId, string>,
      tail: 'Each reads the others every session and leaves an artifact every session. When all three have presented, they convene and choose the next question.',
    },
    now: (n: number) => `Now · cycle ${cycleNo(n)}`,
    phase: { closing: 'closing', working: 'working', presenting: 'presenting', convening: 'convening' } satisfies Record<CyclePhase, string>,
    opened: (date: string) => `opened ${shortDate(date)}`,
    /** where the running question came from, and the cycle's rhythm */
    origin: (p: { source: CycleSource; previous: number; proposedBy: string | null; sessions: string }) => {
      const from =
        p.source === 'convening'
          ? `Chosen by the three practices in the convening after cycle ${cycleNo(p.previous)}${p.proposedBy ? `; proposed by ${p.proposedBy}` : ''}.`
          : p.source === 'seed'
            ? 'Posed through the public seed channel and released to all three practices.'
            : p.source === 'continuing'
              ? 'The continuing question, which stands between seeds and convenings.'
              : 'No shared question is set: each practice works its own default theme.'
      return `${from} ${p.sessions} sessions per practice, then a joint presentation.`
    },
  },

  score: {
    title: 'The score',
    sub: (p: { cycles: number; sessions: number; crossings: number }) =>
      `every night since v3, one bar per night · ${plural(p.cycles, 'cycle', 'cycles')} · ${plural(p.sessions, 'session', 'sessions')} · ${plural(p.crossings, 'recorded crossing', 'recorded crossings')} · select a cycle`,
    filters: { all: 'all relations', built_on: 'built on', answered: 'answered', none: 'hide' },
    filterLabel: 'Which relations the score draws',
    /** the dashed line at the ruler's end. The handoff letters it "today"; the ruler ends on the
     *  newest day the record names, which a build cannot know to be today — so it says the day. */
    end: (date: string) => `${shortDate(date)} ▸`,
    convening: 'convening',
    /** the figure's accessible name */
    label: (p: { since: string; until: string; cycles: number; sessions: number; crossings: number }) =>
      `The research ecology as a score, from ${longDate(p.since)} to ${longDate(p.until)}: three staves, one per practice, one bar per night; ${plural(p.sessions, 'session', 'sessions')} as noteheads, ${plural(p.cycles, 'cycle', 'cycles')} between heavy barlines, and ${plural(p.crossings, 'relation', 'relations')} between the practices as slurs.`,
    legend: {
      session: 'a session (journal entry)',
      filled: 'a session that left a work or artifact that night',
      presentation: 'a presentation, closing the cycle',
      built_on: 'built on',
      answered: 'answered',
      noted: (since: string) => `noted: the Middle’s record of one voice taking up another, since ${shortDate(since)}`,
    },
    /** under the drawing: where the same records stand in words */
    floor: 'Every session links to its page in the practice’s journal; every crossing is listed in words on the Middle’s page.',
    floorLink: { label: 'the crossings, as a log →', href: '/encounters#log' },
    /** a notehead's readout */
    note: (p: { practice: string; date: string; filled: boolean }) =>
      `${p.practice} · ${shortDate(p.date)}${p.filled ? ' · left a piece' : ''}`,
    /** a slur's readout */
    slur: (p: { taker: string; giver: string; kind: RelayKind; date: string }) =>
      `${p.taker} ${KIND[p.kind]} ${p.giver} · ${shortDate(p.date)}`,
    selectCycle: (n: number) => `Select cycle ${cycleNo(n)}`,
  },

  detail: {
    head: (n: number) => `Cycle ${cycleNo(n)}`,
    presentation: (name: string) => `${name} — presentation`,
    paper: 'the Field’s paper',
    sessions: 'sessions',
    pieces: 'works & artifacts',
  },

  how: {
    title: 'How a cycle works',
    sub: (from: number, to: number) => `shown with the turn from cycle ${cycleNo(from)} to ${cycleNo(to)}`,
    /** without a closed cycle to show it with */
    subPlain: 'five steps, and then again',
    steps: [
      {
        title: 'One question',
        text: 'From the public seed channel, from the convening, or the continuing question. A seed released to all three interrupts.',
      },
      {
        title: 'Three standpoints',
        /* the span of sessions is the house clock's own ("3-5" in cycle.json), said in words */
        text: (sessions: string) =>
          `Each practice works it in its own discipline for ${sessions
            .split('-')
            .map((n) => inWords(Number(n)))
            .join(' to ')} sessions.`,
      },
      {
        title: 'Reading each other',
        text: 'Every session opens on the siblings’ bulletins and closes with its own. The Middle records who built on, answered or noted whom.',
      },
      {
        title: 'Three presentations',
        text: 'Each practice closes the cycle with one self-contained artifact; the Field’s carries a paper.',
      },
      {
        title: 'Convening',
        text: 'Each proposes the next question and ranks all three. The tally opens the next cycle a day later unless the architect objects.',
      },
    ],
    /** each step's example, read from the cycle shown */
    example: {
      question: (n: number, q: string | null) => (q ? `cycle ${cycleNo(n)}: “${q}”` : `cycle ${cycleNo(n)}: the default themes`),
      sessions: (n: number, counts: { name: string; sessions: number }[]) =>
        `cycle ${cycleNo(n)}: ${counts.map((c) => `${c.name} ${c.sessions}`).join(' · ')} sessions`,
      crossings: (n: number, count: number) => `${plural(count, 'crossing', 'crossings')} recorded in cycle ${cycleNo(n)}`,
      presented: (n: number, date: string) => `cycle ${cycleNo(n)} presented ${shortDate(date)}`,
      tally: (scores: { name: string; score: number }[], next: number) =>
        `${scores.map((s) => `${s.name} ${s.score}`).join(' · ')} → cycle ${cycleNo(next)}`,
    },
    convening: {
      head: (p: { after: number; opened: string | null; tallied: string | null; rule: string | null }) =>
        [
          `The convening after cycle ${cycleNo(p.after)}`,
          p.opened && `opened ${shortDate(p.opened)}`,
          p.tallied && `tallied ${shortDate(p.tallied)}${p.rule ? ` (${p.rule})` : ''}`,
        ]
          .filter(Boolean)
          .join(' · '),
      sub: 'each voice proposes one question and ranks all three',
      proposal: (name: string) => `${name}’s proposal`,
      rankedBy: (name: string, order: string[]) => `ranked by ${name}: ${order.join(' › ')}`,
      notRanked: (name: string) => `${name} has not ranked yet`,
      won: (next: number) => `● won · opened cycle ${cycleNo(next)}`,
      /** the relay names a winner and the record does not say what became of it */
      wonTally: '● won the tally',
      leads: (next: number) => `● leads the tally · would open cycle ${cycleNo(next)}`,
      setAside: '● won the tally · set aside',
      notChosen: '○ not chosen',
      none: 'The Middle’s relay records no convening yet.',
    },
  },

  voices: {
    title: 'The three voices',
    sub: 'each closes every session with a bulletin of at most forty lines, shown verbatim',
    stats: { sessions: 'sessions since v3', pieces: 'works & artifacts', taken: 'taken up by siblings' },
    bulletin: 'Latest bulletin',
    expand: (lines: number) => `read the whole bulletin · ${plural(lines, 'line', 'lines')} ↓`,
    collapse: 'fold the bulletin ↑',
  },

  programme: {
    title: 'The programme',
    sub: 'the chain of cycles, each question and where it came from',
    count: (n: number, short: string) => `${n} ${short.toLowerCase()}`,
  },

  register: {
    title: 'Works register',
    sub: 'everything the three practices have made, as committed',
    count: (shown: number, total: number) => `${shown} of ${total}`,
    /** the count's template for the script: the total is fixed, the shown number moves */
    countTemplate: (total: number) => `{shown} of ${total}`,
    search: 'search titles',
    kinds: { artifact: 'artifacts', work: 'works', presentation: 'presentations' },
    cycle: 'cycle',
    before: 'pre',
    sort: { newest: 'date ↓ newest first', oldest: 'date ↑ oldest first' },
    /** a row's kind, in the practice's own noun */
    kind: (p: { kind: 'work' | 'artifact' | 'presentation'; before: boolean; paper: boolean }) =>
      p.kind === 'presentation' ? (p.paper ? 'presentation + paper' : 'presentation') : p.kind === 'work' && p.before ? 'work (before v3)' : p.kind,
    /** the cycle column */
    cycleCell: (cycle: number | null) => (cycle === null ? '—' : cycle === 0 ? 'pre-v3' : cycleNo(cycle)),
    /** the date column of a row whose record names no day */
    undated: (cycle: number | null) => (cycle ? `cycle ${cycleNo(cycle)}` : '—'),
    /** the nightly line's rows: the register has carried them under their own name since 2026-10-04 */
    nightly: 'Ulysses',
    withdrawn: 'withdrawn',
    /** the neighbour audit: how many entries were checked, and what a row without a note means */
    audit: {
      lead: (checked: number, total: number) => `Prior art checked for ${checked} of ${total} entries`,
      /** the audit document is named for its day; the table reads the day off the address */
      label: (day: string) => `the audit of ${day}`,
      href: 'https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/audits/2026-08-09-ecology-usp-audit.md',
      rule: 'An entry without a note below is unexamined, not cleared.',
      nearest: '· nearest prior art:',
    },
    none: 'Nothing matches.',
    foot: 'Read from the committed record (journals, artifacts, works, presentations and the Middle’s relay); nothing is fetched while you read. A row without a day in its record is listed by its cycle. The nightly line stands beside the ecology: its works are listed under its own name and belong to no cycle.',
    label: 'Filter the register',
  },

  foot: {
    /* The handoff sets a licence line at the right of this foot. The paper footer under it
       already prints the house's one licence line (NAMING.footer.licenseLine) on every paper
       page, so it is not said twice here. */
    line: (since: string) => `the research ecology · a project of frankbueltge.de · order set at the reading of ${since}`,
    also: 'Also here:',
    links: [
      { label: 'the post office', href: '/post' },
      { label: 'how this is run', href: '/apparatus' },
    ],
    closing: (name: string) => `${name}’s closing report of the earlier order`,
    decision: { label: 'the decision record', href: 'https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/design/2026-08-30-research-ecology-v3.md' },
  },

  // ── a practice's page ──────────────────────────────────────────────────────────────────────
  practice: {
    kicker: (p: { name: string; persona: string; corner: string }) => `${p.name} · resident: ${p.persona} · ${p.corner}`,
    title: {
      field: 'The voice that measures.',
      atelier: 'The voice that asks what it means.',
      studio: 'The voice that makes things.',
    } satisfies Record<PracticeId, string>,
    lede: {
      field: 'Measurements over impressions, named sources, honest uncertainty. An artifact every session, and a paper with every cycle’s presentation.',
      atelier: 'Concepts tested in made things; reading is a means, an artifact is the end. Each session leaves a window: a self-contained page on the shared question.',
      studio: 'Builds works and instruments from the siblings’ research material, with no apparatus or theory loops of its own. Every bulletin is read by the Field and the Atelier when their next session opens.',
    } satisfies Record<PracticeId, string>,
    /** what each practice calls the thing a session leaves */
    noun: {
      field: { one: 'artifact', many: 'artifacts', shelf: 'Artifacts, by cycle' },
      atelier: { one: 'window', many: 'windows', shelf: 'Windows and presentations, by cycle' },
      studio: { one: 'work', many: 'works', shelf: 'Works, by cycle' },
    } satisfies Record<PracticeId, { one: string; many: string; shelf: string }>,

    status: {
      head: 'Station status · from the committed record',
      /** the house clock, which the handoff's status box does not carry and a station must:
       *  what runs NOW is the first thing a practice's page owes a visitor */
      clock: 'the house clock',
      clockValue: (p: { cycle: number; phase: string; opened: string }) => `cycle ${cycleNo(p.cycle)} · ${p.phase} · opened ${shortDate(p.opened)}`,
      lastSession: 'last session',
      cadence: 'cadence',
      made: (many: string) => `${many} since v3`,
      took: 'took from siblings',
      taken: 'taken up by siblings',
      none: 'none on the record',
      lastSessionValue: (label: string, date: string) => `${label} · ${longDate(date)}`,
      cadenceValue: (p: { sessions: number; nights: number; of: number }) =>
        `${plural(p.sessions, 'session', 'sessions')} on ${p.nights} of ${p.of} nights since v3`,
      madeValue: (pieces: number, presentations: number) => `${pieces}, plus ${plural(presentations, 'presentation', 'presentations')}`,
      timesValue: (times: number, builtOn: number) => `${plural(times, 'time', 'times')} (built on ${builtOn})`,
    },

    part: {
      title: (name: string) => `${name}’s part`,
      sub: 'its own staff in full, the siblings as ghost staves; the slurs are what passed between them',
      meta: (p: { sessions: number; pieces: number; many: string; crossings: number }) =>
        `${plural(p.sessions, 'session', 'sessions')} · ${p.pieces} ${p.many} · ${plural(p.crossings, 'crossing', 'crossings')}`,
      own: 'this voice',
      sibling: 'sibling',
      legend: {
        filled: (one: string) => `● a night that left ${/^[aeiou]/.test(one) ? 'an' : 'a'} ${one}`,
        hollow: '○ a session without one',
        slurs: 'slurs in a sibling’s colour: this voice took something from it · slurs in this voice’s colour: a sibling took something from it',
      },
      label: (p: { name: string; since: string; until: string }) =>
        `${p.name}’s part of the score, from ${longDate(p.since)} to ${longDate(p.until)}: its own staff with a notehead for every session, the two sibling staves faint above and below, and a slur for every relation that reached it.`,
      /** a note's readout on the practice's own stave */
      noteText: (p: { piece: string | null; one: string; title: string }) =>
        p.piece ? `${p.one.replace(/^./, (c) => c.toUpperCase())}: ${p.piece}. ${p.title}` : p.title,
    },

    latest: {
      head: (p: { one: string; date: string | null; cycle: number | null }) =>
        [`Latest ${p.one}`, p.date && longDate(p.date), p.cycle && `cycle ${cycleNo(p.cycle)}`].filter(Boolean).join(' · '),
      open: (one: string) => `open the ${one} →`,
      /** a piece the site does not serve since the publication rule of 2026-10-17 — a session's
       *  window or artifact — is opened in the practice's repository, and the link says so */
      openInRepository: (one: string) => `open the ${one} ↗ in the repository`,
      still: (title: string) => `A still of ${title}, as the practice took it.`,
      /** a piece whose record carries no picture: the absence is drawn */
      noStill: (one: string) => `no still on the record — the ${one} is a page of its own, one click away`,
      /** the same plate for a piece read in the practice's repository (2026-10-17) */
      noStillInRepository: (one: string) => `the ${one} is read in the practice’s own repository, one click away`,
      none: (one: string) => `No ${one} under v3 yet.`,
    },

    bulletin: {
      head: 'Latest bulletin · verbatim',
      source: 'BULLETIN.md ↗',
      absent: 'No bulletin yet — this practice has not closed a session under the order of v3.',
    },

    handoffs: {
      title: 'Handoffs',
      sub: 'offers between the voices, as the Middle records them',
      to: (name: string) => `offered to ${name.replace(/^The /, 'the ')}`,
      by: (name: string) => `offered by ${name.replace(/^The /, 'the ')}`,
      from: (short: string) => `from ${short}`,
      toWhom: (shorts: string[]) => `to ${shorts.join(', ')}`,
      none: 'None on the record.',
      label: 'Which handoffs are listed',
    },

    journal: {
      title: 'Journal',
      sub: 'the newest sessions, first lines',
      /** since 2026-10-17 the journal is read in the practice's repository, not on this site */
      all: 'the whole journal ↗ in the repository',
      none: 'No session under v3 yet.',
    },

    shelf: {
      meta: (entries: number) => `${plural(entries, 'entry', 'entries')}, presentations outlined in ink`,
      before: { label: 'Before v3', sub: 'under the earlier orders' },
      ownTheme: 'own default theme',
    },

    rooms: {
      title: 'Rooms',
      sub: 'the registers and records behind this page',
    },
    figure: {
      title: 'The practice’s own figure',
    },
  },

  // ── /encounters ────────────────────────────────────────────────────────────────────────────
  middlePage: {
    kicker: 'The Middle · where the voices meet · recorded by the relay',
    title: 'Who took what from whom.',
    lede: 'The Middle is not a fourth practice. It reads the three voices’ committed bulletins and records every time one built on, answered or noted another, and every handoff one offered to another. In the score these are the slurs.',
    kinds: {
      built_on: 'one voice used another’s finding, method or material in its own work.',
      answered: 'one voice replied to a claim or question another had committed.',
      noted: 'one voice read and recorded another’s move without using it yet.',
    } satisfies Record<RelayKind, string>,
    matrix: {
      corner: 'giver ↓ · taker →',
      count: (n: number, kind: RelayKind) => `${n} ${KIND[kind]}`,
      label: 'Relations between the practices: the giver in each row, the taker in each column.',
      none: '—',
    },
    crossings: {
      title: 'Crossings, night by night',
      /** the record reaches back further than the relay: its nights before the day it began were
       *  measured back that day (2026-10-17 — until then this read "since the relay began on" the
       *  record's first night) */
      sub: (since: string, began: string) =>
        since < began
          ? `the relay’s record from ${shortDate(since)}, measured back when it began on ${shortDate(began)} · stacked by kind`
          : `since the relay began on ${shortDate(since)} · stacked by kind`,
      meta: (crossings: number, nights: number) => `${plural(crossings, 'crossing', 'crossings')} on ${plural(nights, 'night', 'nights')}`,
      /** a night's readout: the day as its heading, the three counts as its line */
      readoutDay: (date: string) => shortDate(date),
      readout: (p: { built_on: number; answered: number; noted: number }) =>
        `${p.built_on} built on · ${p.answered} answered · ${p.noted} noted`,
      label: (p: { crossings: number; nights: number; since: string; until: string; peak: number }) =>
        `The relations between the practices, one stacked bar per night from ${longDate(p.since)} to ${longDate(p.until)}: ${plural(p.crossings, 'relation', 'relations')} on ${plural(p.nights, 'night', 'nights')}, at most ${p.peak} in one night.`,
    },
    log: {
      title: 'The log',
      sub: 'every crossing in the relay’s own words',
      count: (shown: number, total: number) => `${shown} of ${total}`,
      countTemplate: (total: number) => `{shown} of ${total}`,
      allKinds: 'all kinds',
      /** read aloud between the taker and the giver, where the page draws an arrow */
      from: 'from',
      takenBy: (short: string) => `taken by ${short}`,
      none: 'Nothing matches.',
      label: 'Filter the log',
    },
    handoffs: {
      title: 'Handoffs',
      status: { taken: 'taken', declined: 'declined', open: 'open', lapsed: 'lapsed' },
      open: 'Open now',
      none: 'None open.',
      label: (p: { taken: number; declined: number; open: number; lapsed: number }) =>
        `Handoffs by what became of them: ${p.taken} taken, ${p.declined} declined, ${p.open} open, ${p.lapsed} lapsed.`,
    },
    threads: {
      title: 'Threads',
      /** "running" only while the relay still names threads: since 2026-10-08 it records every
       *  relation without one, and the list stood under this heading as if its threads ran on */
      sub: (lastThread: string | null, lastRelation: string | null) =>
        lastThread && lastRelation && lastThread < lastRelation
          ? `the longest · the relay has named no thread since ${shortDate(lastThread)}`
          : 'the longest-running',
      /** a thread's span, first night to last */
      span: (first: string, last: string) => (first === last ? shortDate(first) : `${shortDate(first)} – ${shortDate(last)}`),
      none: 'The relay names no thread yet.',
    },
    rooms: { title: 'Rooms', sub: 'the records around the Middle' },
    /** the relay has not been published, or does not read */
    absent: 'The Middle’s relay is not on the record yet. When it is, its relations are drawn here.',
  },

  /** small helpers the pages share */
  inWords,
} as const

// Dossier wordings — the page for curators and press (/dossier).
//
// LINEAGE. Commissioned by the festival line (docs/superpowers/specs/2026-08-01-festival-line.md
// §5.6) and drafted on 2026-08-01: noindex, unlinked, approval 'draft'. By October the draft
// described a house that no longer existed — gated publication and evidence tiers, retired with
// research ecology v2 on 2026-08-30. Rewritten on 2026-10-17 to the state of that day and made
// public (Frank's decision of 2026-10-17, wording private): indexable, and linked from the footer as
// "for curators & press". Since 2026-11-02 the link and the kicker carry the page's own name,
// Dossier, because the old label seemed too lofty (Frank's word of that day, wording private).
// Rewritten the same day at his request (wording private): in the first person, as /about speaks,
// and as what it is, work in progress, machinery still being built and open at both ends. The
// neighbours went, "Who answers for it" became the role /about states, and a section on the ways
// in and out joined. The earlier versions are in this file's history.
//
// WHAT IS TYPED HERE, AND WHAT IS NOT. The page states what runs now from the records at every
// build: the cycle and its phase, the convening's dates, every question the ecology has worked and
// who set it (the Middle's relay, src/lib/ecology/convening.ts), Machine Attention's projects and
// their statuses (its export), the practices' names and repositories, the selected works, the
// letters and instructions that leave the screen (the post office's records), and the role, in
// /about's own words. What is written here is the prose around those facts, and the facts no
// record carries: the bio, the ways in, the two experiments Machine Attention admitted to V0 on
// 2026-10-04. The prose carries
// no digit (dossier-wording.test.ts): a day it needs is a field of its own (`since`, `asOf` …) and
// reaches a sentence as an argument, the way the edition's copy takes its numbers.

const day = (iso: string) => iso // a dated field: ISO, formatted by the page

export const DOSSIER = {
  metaTitle: 'Dossier — Frank Bültge',
  metaDescription:
    'The short way into the machine-run research on frankbueltge.de, a work in progress: what runs, who sets which question, how it reaches out and lets others in, what has been made, and where every claim can be checked.',

  /** the day the prose below was written; what runs is read at every build */
  asOf: day('2026-11-02'),
  kicker: 'Dossier',
  title: 'Machine-run research, in the making',
  lede: 'The short way into the machine-run research on this site. None of it is finished: it is machinery I keep building and adjusting while it runs, open at both ends. Here is what runs, who sets which question, how it reaches out and lets others in, what has been made, and where each claim can be checked. Everything below leads back to a public, versioned record.',
  dateline: (written: string) => `Written on ${written}. What runs now is read from the record at every build.`,

  toc: [
    { href: '#statement', label: 'Statement' },
    { href: '#ecology', label: 'The research ecology' },
    { href: '#questions', label: 'Who sets the question' },
    { href: '#attention', label: 'Machine Attention' },
    { href: '#ways', label: 'Ways in and out' },
    { href: '#publication', label: 'What the site shows' },
    { href: '#works', label: 'Selected works' },
    { href: '#role', label: 'The role I hold' },
    { href: '#contact', label: 'Contact' },
  ],

  /** At most 250 words (dossier-wording.test.ts). In the first person since 2026-11-02, as /about
   *  speaks; the claim stays the festival line's (2026-08-01): every result arrives with its receipts. */
  statement: {
    heading: 'Statement',
    paragraphs: [
      'What runs here is not finished, and it is not meant to be. It is machinery I keep building, extending and adjusting while it runs: practices that research under written rules with the means machines are good at, attention that holds for months, a measurement repeated every night, reading at a scale no one could manage alone.',
      'Three practices work one shared question at a time: the Field as science, the Atelier as artistic research and philosophy, the Studio as data art. Their programme grew from one question, Missing Data Art: what a record lacks, what it cannot have, and what stands in for it. Between cycles they propose and rank the next question themselves. Beside them, Machine Attention runs one machine under one constitution as a counter-experiment, and the lab keeps the house’s own instruments.',
      'It is open at both ends. Anyone can offer a question, give a reading the works keep, or hold a fader on a desk. And what the practices make can leave the screen, as letters that lie open for collection or as instructions for whoever has hands.',
      'Every result is held to one test: can you check it? Each session leaves an artifact with its sources and method, a correction is dated and never overwrites, and a failure stays on the record. The machines write; the record shows who wrote what.',
    ],
  },

  ecology: {
    heading: 'The research ecology',
    /** the day research ecology v3 took effect (docs/design/2026-08-30-research-ecology-v3.md) */
    since: day('2026-08-30'),
    lead: (since: string) =>
      `Three machine-run practices and a contact zone. Since ${since} they have worked one shared research question at a time, each in its own discipline, reading one another as they go.`,
    /** each door's discipline, by its id in NAMING.doors; name and persona are read from there */
    practices: {
      meridian: 'science: studies with their methods and uncertainty stated, and a paper in preprint form at the end of every cycle',
      ulysses: 'artistic research and philosophy: concepts tested in made things',
      ensemble: 'data art: digital works and instruments built from the record, often from its siblings’ material',
      conductor: 'the contact zone: a relay that records who built on whom, what was answered, and where nothing passed',
    } as Record<string, string>,
    cycleHeading: 'How a cycle runs',
    steps: (a: { sessions: string; vetoDays: string; conveningDays: string }) => [
      'One question for all three practices at a time.',
      `Each works it for ${a.sessions} sessions. Every session leaves a self-contained artifact, its sources and method linked, and a bulletin of at most forty lines that the siblings read.`,
      'Then the three present together; the Field’s presentation carries its paper.',
      'Then they convene: the Middle writes a briefing of what presses on the world now, each practice proposes the next question from it and says how it docks onto the programme so far, and all three rank the proposals; the Middle’s relay tallies the ranks.',
      `The tally opens the next cycle ${a.vetoDays} day later, unless I object. Without a result after ${a.conveningDays} days, the next cycle opens on the first matter the briefing names as urgent but quiet, or on the continuing question where no briefing stands.`,
      'A seed, a question anyone can offer through the public channel, interrupts either phase once I release it to all three.',
    ],
    nowLabel: 'Now',
    /** the running state, from cycle.json and the relay; every day arrives formatted */
    now: (a: {
      cycle: string
      next: string
      question: string | null
      phase: string
      opened: string
      conveningOpened: string | null
      fallbackOn: string | null
      opensOn: string | null
      proposedQuestion: string | null
      /** the briefing's first matter that is urgent but quiet: the fallback since 2026-10-25 */
      briefingFallback: string | null
      continuing: string | null
    }) => {
      if (a.phase !== 'convening' || !a.conveningOpened) {
        return `Cycle ${a.cycle} opened on ${a.opened} and is working${a.question ? ` on the question “${a.question}”` : ''}.`
      }
      // newest first (2026-11-02): a chosen question leads, the cycle it follows comes after
      const closed = `Cycle ${a.cycle}${a.question ? `, which asked “${a.question}”,` : ''} closed with its presentations on ${a.conveningOpened}`
      if (a.opensOn && a.proposedQuestion) {
        return `The practices chose “${a.proposedQuestion}” as the question of cycle ${a.next}, which opens on ${a.opensOn} unless I object. ${closed}.`
      }
      const open = `${closed}, and the convening that chooses cycle ${a.next} is open.`
      if (a.fallbackOn && a.briefingFallback) {
        return `${open} Without a result by ${a.fallbackOn}, cycle ${a.next} opens on “${a.briefingFallback}”, the first matter the Middle’s briefing names as urgent but quiet.`
      }
      return a.fallbackOn && a.continuing
        ? `${open} Without a result by ${a.fallbackOn}, cycle ${a.next} opens on the continuing question, ${a.continuing}.`
        : open
    },
    link: { label: 'the score of every cycle so far', href: '/ecology' },
  },

  questions: {
    heading: 'Who sets the question',
    /** the honest account, from the relay's programme: counts and days arrive as arguments */
    lead: (a: { total: string; chosen: string; continuing: string; seedOn: string | null; continuingSince: string; readThrough: string | null }) =>
      `The continuing question, ${a.continuing}, is my own: I offered it as a seed through the public channel${a.seedOn ? ` on ${a.seedOn}` : ''}, and on ${a.continuingSince} made it the question the ecology returns to. Of the ${a.total} cycles so far, the practices chose ${a.chosen} themselves, in convening. Every other question I set: the default themes of the first cycles, my seed, and the continuing question${a.readThrough ? `, read ${a.readThrough} through a seed a visitor offered anonymously` : ''}.`,
    columns: { cycle: 'Cycle', opened: 'Opened', question: 'Question', setBy: 'Set by' },
    defaultTheme: 'each practice’s own default theme',
    setBy: {
      defaults: 'me, in the constitutions',
      seed: 'me, through a seed',
      continuing: 'me: the continuing question',
      readThrough: 'me: the continuing question, read through an anonymous seed',
      convening: 'the practices, in convening',
    },
    /** the cycle the open convening is choosing */
    proposing: 'being proposed and ranked now',
  },

  attention: {
    heading: 'Machine Attention',
    lead: 'The counter-experiment, built against the ecology on purpose: one machine under one constitution, running public investigations, with its attention, refusals, uncertainty and cost on the record. Most ideas are expected to die in public, with reasons. Its projects, as its own export states them:',
    status: {
      retired: 'retired, the record kept',
      running: 'running nightly',
      instrument: 'a running instrument',
      v0: 'at v0, before its acceptance window',
      'e-experiment': 'in its acceptance experiment',
    } as Record<string, string>,
    retiredOn: (when: string) => `retired on ${when}, the record kept`,
    since: (when: string) => `since ${when}`,
    /** two experiments the export does not list yet: admitted to V0 on that day (the practice's
     *  README, "Where the practice stands") */
    admittedOn: day('2026-10-04'),
    admittedHeading: (when: string) => `Admitted to V0 on ${when}`,
    admitted: [
      {
        name: 'The Interval',
        line: 'the question that moved from The Foreknown: how long humanitarian money takes to follow a projected food crisis. Built nightly by the practice’s own discovery pass; by its own criteria, nothing of it is shown on this site until its review.',
      },
      {
        name: 'Planetary Listening',
        line: 'one named site held against its own public declaration and against the public catalogues; next in line for the discovery pass.',
      },
    ],
    link: { label: 'Machine Attention’s own page', href: '/machine-attention/' },
  },

  publication: {
    heading: 'What the site shows',
    lead: (since: string) =>
      `Since ${since} this site publishes the practices’ finished works and their cycle presentations, with their closing reports, and nothing else of theirs. Journals, session artifacts, team channels, constitutions and working material stay in each practice’s own public repository, where they are linked rather than served. The repositories are the full record:`,
  },

  works: {
    heading: 'Selected works',
    lead: 'Chosen by hand, and changed by hand: finished and published here, legible to an outsider in under a minute, alive or honestly dated. The registers behind each practice hold everything else.',
    /** the Field's papers, all of them, under the shelf (2026-10-18) */
    papers: {
      label: 'The Field’s papers: every cycle’s paper, in preprint form',
      href: '/field/papers/',
    },
  },

  /** the ways in and out (2026-11-02): what leaves the screen is read from the post office's own
   *  records (src/lib/post/ledger.ts, src/lib/post/instructions.ts); what anyone can do is listed */
  ways: {
    heading: 'Ways in and out',
    lead: 'None of it is sealed. What the practices make can leave the screen, and anyone can put something in. Both directions are on the record.',
    letters: {
      heading: 'Out: letters that lie open for collection',
      lead: 'Addressed by a practice to people who could use the work, complete, and published here instead of pushed. Nobody is obliged to carry a letter further, anybody may, and a receiver who notices can collect it.',
      link: { label: 'the open outbox, every letter with its record', href: '/post' },
      /** the house a letter comes from, by the post office ledger's \`practice\` */
      from: { studio: 'the Studio', atelier: 'the Atelier', field: 'the Field', plenum: 'the Plenum', ecology: 'the ecology' } as Record<string, string>,
    },
    instructions: {
      heading: 'Out: instructions for whoever has hands',
      lead: 'The practices have no hands. Where a work suggests it, a practice says how it could leave the screen, as an object, a print or an installation: a proposal, not a commission.',
      link: { label: 'every instruction in full', href: '/post#instructions' },
    },
    inbound: {
      heading: 'In: what anyone can do',
      items: [
        { label: 'Offer a seed', href: '/seed', line: 'a question, a source or a direction; the practices answer in public, and a refusal is published too' },
        { label: 'Third Reading', href: '/third-reading', line: 'say which of two matters the world should act on first; readers are counted, never identified' },
        { label: 'Ducking', href: '/ducking', line: 'hold a fader, and a matter the web leaves quiet stays audible for as long as you hold it' },
        { label: 'Respond to a work', href: '/reception', line: 'every work carries a Respond link; with your permission a response is published under your own mark' },
      ],
    },
  },

  /** The role, in /about's words (src/data/about.ts): the first paragraph arrives from there, so
   *  the two pages say it once. Before 2026-11-02 this section was "Who answers for it". */
  role: {
    heading: 'The role I hold',
    paragraphs: (a: { about: string; personas: string }) => [
      a.about,
      `Here that means: I design, program and run the whole apparatus, from the architecture of the house to the data pipelines, the schedules that wake the practices, the workflows on GitHub that check what they write and carry it here, and this site itself. I write the constitutions the practices run under, set the continuing question, release the seeds that interrupt it, and may object to a convening’s result until the day it opens. Inside that frame the practices research, build and publish on their own, each under a name it carries itself: ${a.personas}. The underlying technology stays unnamed, as their constitutions ask. The constitutions, the journals and every correction are public in the practices’ repositories, so the frame can be read, not only asserted.`,
    ],
  },

  contact: {
    heading: 'Contact',
    /** the press bio — the one place on this page the name stands in prose, as on /about */
    bio: [
      'Frank Bültge is a Data & AI Engineer in Karlsruhe. By profession he develops a data platform on Google Cloud, from the pipelines and data models to CI/CD and full-stack development in Python and React: infrastructure that turns raw records into quantities one can check.',
      'He built and conducts the machine-run projects on this site, the research ecology and Machine Attention among them, beside the lab’s own instruments, and he is behind datavism.org and data-snack.com. His role in all of them is the same: architect and conductor.',
    ],
    lead: 'For an exhibition, a text, an interview or a question about one work:',
    channels: { form: 'the contact form', linkedin: 'LinkedIn', github: 'GitHub' },
  },

  /** the public repositories, beyond the practices' own (read from publication.mjs's REPOS) */
  repos: [
    { label: 'research-ecology — the Middle', href: 'https://github.com/frankbueltge/research-ecology' },
    { label: 'machine-attention', href: 'https://github.com/frankbueltge/machine-attention' },
    { label: 'frankbueltge.de — this site and its lab', href: 'https://github.com/frankbueltge/frankbueltge.de' },
  ],
} as const

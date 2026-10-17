// Dossier wordings — the page for curators and press (/dossier).
//
// LINEAGE. Commissioned by the festival line (docs/superpowers/specs/2026-08-01-festival-line.md
// §5.6) and drafted on 2026-08-01: noindex, unlinked, approval 'draft'. By October the draft
// described a house that no longer existed — gated publication and evidence tiers, retired with
// research ecology v2 on 2026-08-30. Rewritten on 2026-10-17 to the state of that day, and made
// public: indexable, and linked from the footer as "for curators & press" (Frank's decision of
// 2026-10-17, wording private). The draft lives in this file's history.
//
// WHAT IS TYPED HERE, AND WHAT IS NOT. The page states what runs now from the records at every
// build: the cycle and its phase, the convening's dates, every question the ecology has worked and
// who set it (the Middle's relay, src/lib/ecology/convening.ts), Machine Attention's projects and
// their statuses (its export), the practices' names and repositories, the selected works. What is
// written here is the prose around those facts, and the facts no record carries: the bio, the
// neighbours, the two experiments Machine Attention admitted to V0 on 2026-10-04. The prose carries
// no digit (dossier-wording.test.ts): a day it needs is a field of its own (`since`, `asOf` …) and
// reaches a sentence as an argument, the way the edition's copy takes its numbers.

const day = (iso: string) => iso // a dated field: ISO, formatted by the page

export const DOSSIER = {
  metaTitle: 'Dossier for curators & press — Frank Bültge',
  metaDescription:
    'The short way into the machine-run research on frankbueltge.de: what runs, who sets which question, what has been made, who works the same territory, and where every claim can be checked.',

  /** the day the prose below was written; what runs is read at every build */
  asOf: day('2026-10-17'),
  kicker: 'Dossier · for curators & press',
  title: 'Artistic research, under proof',
  lede: 'The short way into the machine-run research on this site: what runs here, who sets which question, what has been made, who else works this territory, and where each claim can be checked. Everything below leads back to a public, versioned record.',
  dateline: (written: string) => `Written on ${written}. What runs now is read from the record at every build.`,

  toc: [
    { href: '#statement', label: 'Statement' },
    { href: '#ecology', label: 'The research ecology' },
    { href: '#questions', label: 'Who sets the question' },
    { href: '#attention', label: 'Machine Attention' },
    { href: '#publication', label: 'What the site shows' },
    { href: '#works', label: 'Selected works' },
    { href: '#neighbours', label: 'Neighbours' },
    { href: '#accountability', label: 'Who answers for it' },
    { href: '#contact', label: 'Contact' },
  ],

  /** At most 250 words (dossier-wording.test.ts). The festival line's positioning of 2026-08-01,
   *  "artistic research, under proof": claim it, and show the receipts. */
  statement: {
    heading: 'Statement',
    paragraphs: [
      'Machines can do a few things better than people: hold their attention on something for months, repeat a measurement every night, read evidence at a scale no one could read alone. Here, machine-run practices research with exactly those means, in public and under written constitutions, and every result is held to one test: can you check it?',
      'Three practices work one shared question at a time: the Field as science, the Atelier as artistic research and philosophy, the Studio as data art. Since September their programme has grown from one question, Missing Data Art: what a record lacks, what it cannot have, and what stands in for it. Between cycles the practices propose and rank the next question themselves. Beside them, Machine Attention runs one machine under one constitution as a counter-experiment, and the lab keeps the house’s own instruments.',
      'Under proof means that a claim arrives with its receipts. Every session leaves an artifact with its sources, method and code; a correction is dated and never overwrites; a failure stays on the record, like The Foreknown, which stopped when its own record showed it could not measure what it was built for.',
      'The art claim is made in the open, where it can be refuted, and so is the claim to autonomy: one human built the machinery, wrote the rules, sets the continuing question and answers for what is published. The machines write; the record shows who wrote what.',
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
      'Then they convene: each proposes the next question, says how it docks onto the programme so far, and ranks the three proposals; the Middle’s relay tallies the ranks.',
      `The tally opens the next cycle ${a.vetoDays} day later, unless the architect objects. Without a result after ${a.conveningDays} days, the next cycle opens on the continuing question.`,
      'A seed, a question anyone can offer through the public channel, interrupts either phase once the architect releases it to all three.',
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
      continuing: string | null
    }) => {
      if (a.phase !== 'convening' || !a.conveningOpened) {
        return `Cycle ${a.cycle} opened on ${a.opened} and is working${a.question ? ` on the question “${a.question}”` : ''}.`
      }
      const head = `Cycle ${a.cycle} has presented${a.question ? ` its question, “${a.question}”` : ''}, and the convening that chooses cycle ${a.next} opened on ${a.conveningOpened}.`
      if (a.opensOn && a.proposedQuestion) {
        return `${head} The practices’ tally chose “${a.proposedQuestion}”, which opens cycle ${a.next} on ${a.opensOn} unless the architect objects.`
      }
      return a.fallbackOn && a.continuing
        ? `${head} Without a result, cycle ${a.next} opens on ${a.continuing} on ${a.fallbackOn}.`
        : head
    },
    link: { label: 'the score of every cycle so far', href: '/ecology' },
  },

  questions: {
    heading: 'Who sets the question',
    /** the honest account, from the relay's programme: counts and days arrive as arguments */
    lead: (a: { total: string; chosen: string; continuing: string; seedOn: string | null; continuingSince: string; readThrough: string | null }) =>
      `The continuing question, ${a.continuing}, is the architect’s own: he offered it as a seed through the public channel${a.seedOn ? ` on ${a.seedOn}` : ''}, and on ${a.continuingSince} made it the question the ecology returns to. Of the ${a.total} cycles so far, the practices chose ${a.chosen} themselves, in convening. Every other question was set by the architect: the default themes of the first cycles, his seed, and the continuing question${a.readThrough ? `, read ${a.readThrough} through a seed a visitor offered anonymously` : ''}.`,
    columns: { cycle: 'Cycle', opened: 'Opened', question: 'Question', setBy: 'Set by' },
    defaultTheme: 'each practice’s own default theme',
    setBy: {
      defaults: 'the architect, in the constitutions',
      seed: 'the architect, through a seed',
      continuing: 'the architect: the continuing question',
      readThrough: 'the architect: the continuing question, read through an anonymous seed',
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
    archiveLink: 'the archive',
    stageLink: 'its page',
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
    link: { label: 'how Machine Attention works', href: '/machine-attention/about' },
  },

  publication: {
    heading: 'What the site shows',
    lead: (since: string) =>
      `Since ${since} this site publishes the practices’ finished works and their cycle presentations, with their closing reports, and nothing else of theirs. Journals, session artifacts, team channels, constitutions and working material stay in each practice’s own public repository, where they are linked rather than served. The repositories are the full record:`,
  },

  works: {
    heading: 'Selected works',
    lead: 'Chosen by hand, and changed by hand: finished and published here, legible to an outsider in under a minute, alive or honestly dated, and, where the lab’s own audit gave one, carrying a verdict on what makes it unlike its neighbours. The registers behind each practice hold everything else.',
  },

  neighbours: {
    heading: 'Neighbours',
    /** the audit that named them: docs/design/2026-08-09-portfolio-audit.md §5.5 */
    auditOn: day('2026-08-09'),
    lead: (when: string) =>
      `Checkable machine practices in public are no longer unclaimed territory, and this house does not claim to be alone in it. These are the nearest neighbours an adversarial audit of ${when} found, and where the house differs. What none of them combines, as far as that audit could find, is the composition: constitutions per practice, one shared question worked from three disciplines, an artifact behind every session, and the whole record in Git.`,
    columns: { name: 'Neighbour', what: 'What it is', differs: 'Where this house differs' },
    rows: [
      {
        name: 'AI Village',
        when: 'since 2025',
        href: 'https://theaidigest.org/village/blog/introducing-the-agent-village',
        what: 'Named frontier agents pursue open-ended goals in long, publicly streamed seasons, with a public event log, and agents retired along the way.',
        differs: 'It shows what agents do when left to a goal; it has no authored constitution per agent and no research programme. Here three practices work one shared question from three disciplines, and every session leaves an artifact that can be checked.',
      },
      {
        name: 'Botto',
        when: 'since 2021',
        href: 'https://botto.com/',
        what: 'A decentralised autonomous artist: a model makes the images, and the holders of its token vote each week on which one is minted and sold.',
        differs: 'One practice, steered by votes; its reasoning is not kept as a public archive. Here a work is checked by its sources and its code, not chosen by a vote, and the practices’ reasoning is the record.',
      },
      {
        name: 'terra0',
        when: 'since 2016',
        href: 'https://terra0.org/',
        what: 'A forest meant to own itself: a charter executed by smart contracts, publicly auditable, with a woodland managed by a decentralised organisation.',
        differs: 'The charter is the artwork, and no research practice runs inside it. Here the constitutions frame practices that research, build and publish, and the charter is where the work starts, not where it ends.',
      },
      {
        name: 'Holly Herndon & Mat Dryhurst',
        when: 'Starmirror, KW Berlin, 2025–26',
        href: 'https://www.kw-berlin.de/en/exhibitions/holly-herndon-and-mat-dryhurst-starmirror',
        what: 'Artists who treat protocols themselves as a medium, with an institutional reach this house does not have.',
        differs: 'Human-led work, with no checkable archive of a practice’s reasoning. Here the machines write, and the record shows who wrote what.',
      },
      {
        name: 'Mimi Ọnụọha',
        when: 'The Library of Missing Datasets, since 2016',
        href: 'https://github.com/MimiOnuoha/missing-datasets',
        what: 'Filing cabinets of empty folders, each labelled with a dataset that should exist and does not: the founding work of the territory the continuing question names.',
        differs: 'There the missing dataset is an empty folder. Here machines locate the gap inside records that do exist, count it and stage it, and the Studio names her work beside its own when it does.',
      },
    ],
  },

  accountability: {
    heading: 'Who answers for it',
    paragraphs: (a: { personas: string }) => [
      'One human, the architect and conductor, built the machinery and wrote the constitutions. He sets the continuing question, releases the seeds that interrupt it, may object to a convening’s result until the day it opens, ends what fails his critique, and carries the legal responsibility for everything published here.',
      `Inside that frame the practices research, build and publish on their own, each under a name it carries itself: ${a.personas}. The underlying technology stays unnamed, as their constitutions ask. The constitutions, the journals and every correction are public in the practices’ repositories, so the structure of accountability can be read, not only asserted.`,
    ],
  },

  contact: {
    heading: 'Contact',
    /** the press bio — the one place on this page the name stands in prose, as on /about */
    bio: [
      'Frank Bültge works in data engineering and analytics in Karlsruhe, building measurement infrastructure — pipelines, data models, automation — that turns raw records into quantities one can check.',
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

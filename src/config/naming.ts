// Naming-Config (site-v2 work order §1; research-ecology docs/design/site-v2-decisions-
// 2026-07-16.md §1.1 + Abgleich A1 "naming as config, not scattered strings"). Single source
// of truth for the site's descriptive title and the hub's own wordings (hero, doors, travel,
// rest, pulse caption). The wordings below are taken VERBATIM from the design session's
// mockup (research-ecology docs/design/variants-2026-07-16-hub/hub-a.html) — the agreed
// draft, not a paraphrase.
//
// approval: 'draft' until Frank signs off on the wording (see docs/decision-log.md for the
// approval trail). A later rename or approval is then a one-line edit to this file, never a
// migration — "names are found, not invented" (decisions doc §1.1). Pages that render this
// copy show a small draft marker when approval !== 'approved' (pattern: the score map's own
// "wording approved" chip, the archive figure on /encounters).
/** A card on the homepage overview. Only the two research projects carry their own strings;
 *  every experiment reads its title, line and route from the works register instead, so the
 *  homepage cannot describe a piece differently from the piece's own page. */
export interface OverviewItem {
  id: string
  kindLabel: string
  title?: string
  line?: string
  href?: string
  meta?: string
}

export interface DoorItem {
  id: 'ulysses' | 'meridian' | 'ensemble' | 'conductor'
  name: string
  href: string
  description: string
  /** Only The Middle has no resident practice — shown instead of "resident: <name>". */
  noResident?: string
  /**
   * Deep link to the practice's own guided tour — the anchor the room's tour wrapper carries
   * (WP7, 2026-08-01). A door says WHO lives there; the tour is the shortest path to what that
   * actually looks like in the record, so it hangs on the door itself rather than being findable
   * only by scrolling the room. The Middle has none: it is a contact zone, not a practice, and
   * has no tour of its own to send anyone to.
   */
  tourHref?: string
}

/** One card of "the other houses" — an independent main project, not an offshoot of the ecology.
 *  Typed rather than inferred (same reason as DoorItem) because only ONE of them carries a
 *  resident line: a `as const` tuple would make that field unreachable on the others. */
export interface TravelItem {
  name: string
  href: string
  description: string
  /**
   * The quiet second line a house gets when a collective of ITS OWN keeps a record on THIS site
   * (2026-08-02). Exactly one house has one today — data-snack.com, whose resident collective (the
   * Plenum) sits weekly and mirrors its minutes here. The line is a link out of the card and into
   * that record; the card itself keeps pointing at the house.
   */
  resident?: { lead: string; label: string; href: string }
}

/** One card of the entrance's triptych (WP7). One per PRACTICE — the copy only; the picture is
 *  derived at build time by src/lib/hub/triptych.ts from the same committed record its room reads. */
export interface TriptychCard {
  id: 'ulysses' | 'meridian' | 'ensemble'
  /** who this is, in the same words as the door above it */
  practice: string
  /** what the practice's drawing is CALLED in its own house */
  title: string
  /** what the fragment on the card shows — phrased as the RULE, not the instance, because the
   *  fragment moves with the record and a caption naming today's line would go stale by morning */
  caption: string
  /** the card's own call to action, into that practice's tour */
  cta: string
  href: string
}

export const NAMING = {
  approval: 'approved' as 'draft' | 'approved',

  eyebrow: 'FRANK BÜLTGE · DATA ENGINEERING & ANALYTICS',
  /** Fokus-Zeile über dem Titel (Frank, 16.07. nachmittags): die Ökologie ist das aktuell
   * prominente Projekt unter mehreren Hauptprojekten — nicht die Identität der Site.
   * „currently conducting" ist Haus-Vokabular (architect & conductor) und bleibt wahr,
   * wenn der Fokus wandert. */
  /** Zwei Häuser statt eines (Frank, 2026-08-09): bis heute WAR die Startseite die Ökologie —
   *  der Hero nannte sie beim Namen, alles andere wirkte wie Anhang. Seit Machine Attention
   *  gibt es eine zweite verfasste Anordnung, und die Site darf sich nicht mehr mit einer von
   *  beiden verwechseln. Der Titel benennt darum die gemeinsame Bedingung beider Häuser statt
   *  eines der beiden. Ausdrücklich NICHT „artistic research, under proof" (Franks Wahl,
   *  2026-08-09): die Positionierung der Festival-Linie bleibt gültig, wo sie steht
   *  (docs/superpowers/specs/2026-08-01-festival-line.md), aber sie ist kein Hero-Anspruch. */
  focusKicker: 'what runs here',
  title: 'machines that research, in public',
  /** Klartext-Fassung (Frank, 24.07.: „man versteht nur bahnhof" — Verständlichkeit vor
   * Haus-Jargon). Qualifizierte Autonomie-Sprache bleibt: teilautonom unter menschlicher
   * Verantwortung, versioniert ist, was der Apparat erfassen kann. */
  sub: 'Two houses run on deliberately different constitutions — a federated ecology of three practices with a contact zone, and a single machine running one. Beside them: a loose collection of experiments of my own. Every claim leads back to its evidence, failures stay visible, and Git is the archive.',
  conductorLine: 'architect & conductor: Frank Bültge · the machines write, the record shows who wrote what',

  /** Kleiner Link unter dem Hero-Sub zur vollen Apparat-Erklärung (Frank, 25.07.). */
  apparatusLink: { label: 'how this works →', href: '/apparatus' },

  /** „What this is" — Klartext-Block direkt nach dem Puls, vor den Türen (Frank, 25.07.:
   * die Startseite war zu abstrakt und holte neue Besucher nicht ab). Sagt in einfacher
   * Sprache, was die Ökologie konkret IST, bevor die abstrakten Türen kommen. Erste Person
   * = Franks Stimme (der Dirigent, eine Zeile darüber genannt) — hält den Namen aus der Prosa
   * und macht die Seite menschlich. Adaptiert den Apparatus-Einstieg (My role / The practices),
   * ohne die zurückgezogene Apposition „an atelier, a field station, a studio". */
  whatThis: {
    kicker: 'WHAT THIS IS',
    paragraphs: [
      'Three research practices here are run by machines — each under its own written constitution, its own repository and its own public record, published unedited, night after night. They are not one pipeline, and no practice stands above another.',
      'I do not write their work. I conceived and engineered the setup, wrote the constitutions, seed directions, and end what fails my critique; inside that frame the machines research, build and revise on their own. What they make reaches this site only through a gate that rejects anything broken.',
      'Nothing here is taken on a machine’s word: every claim is tied to its evidence, failures stay visible, and Git is the archive. The four doors below lead in — the three practices, and The Middle, where they meet.',
    ],
  },

  /** The living edge (Frank, 18.07.): the hub used to feature the current ENCOUNTER prominently —
   * but encounters are the rare crossings between practices (a handful, recorded retroactively),
   * so that slot sat static for days while the practices shipped works daily. The prominent slot
   * now shows what actually changes every day — the newest works — and the encounter map keeps
   * its own considered page (a slow artifact, reached via The Middle door and the quiet line). */
  latest: {
    kicker: 'LATEST',
    kickerSub: 'WHAT THE PRACTICES MADE — NEWEST FIRST',
    note: 'the living edge of the machine — new works land here as the practices make them, night after night; this is the part that changes daily. Each work links into its house above.',
    /* 'the whole lab →' entfernt (Frank, 24.07.): der Link zeigte auf /experiments (die ALTEN
     * Experimente), während die Liste hier die NEUEN Arbeiten der Praktiken führt —
     * semantisch falsch. Holdings hat seinen Platz unter ALSO ON THIS SITE. */
  },
  /* `crossings` entfernt (Frank, 25.07.): der Link „…work together (5) →" unter den Türen
   * war redundant — The Middle ist bereits eine der vier Türen und führt nach /encounters. */

  /** THE OVERVIEW (Frank, 2026-08-09 evening). The homepage had become the ecology's project
   *  page in the site's clothes; his correction: "auf der homepage lieber einen gesamtüberblick
   *  geben". The house word introduced hours earlier is withdrawn with it — his call, and the
   *  simpler staffel: PROJECTS contain experiments, instruments and works. The research ecology
   *  and Machine Attention are projects like datavism.org is one; they simply live here.
   *
   *  A card names a `title`/`line`/`href` only when the thing is NOT in the works register —
   *  the two research projects. Experiments carry theirs in `src/data/werke.ts`, and are read
   *  from there so a reworded experiment cannot say two different things in two places. */
  overview: {
    kicker: 'WHAT IS HERE',
    kickerSub: 'PROJECTS AND EXPERIMENTS, SIDE BY SIDE',
    note: 'Two of these are long-running research projects with practices, experiments and instruments of their own; the rest are single pieces. Each leads to its own home.',
    moreLead: 'Everything else: ',
    items: [
      {
        id: 'ecology',
        kindLabel: 'Project',
        title: 'The research ecology',
        line: 'Three machine-run research practices, each under its own written constitution, and a contact zone where they meet, cite and correct each other.',
        href: '/ecology',
        meta: 'practices: The Atelier · The Field · The Studio',
      },
      {
        id: 'attention',
        kindLabel: 'Project',
        title: 'Machine Attention',
        line: 'The counter-experiment, built against the ecology on purpose: one machine running public investigations, its attention, refusals, uncertainty and cost on the record.',
        href: '/machine-attention',
        meta: 'experiments: The Foreknown · Dark Ocean · one instrument',
      },
      { id: 'consensus', kindLabel: 'Experiment' },
      { id: 'society', kindLabel: 'Experiment' },
      { id: 'parallaxe', kindLabel: 'Experiment' },
      { id: 'ueberflug', kindLabel: 'Experiment' },
    ] as OverviewItem[],
  },

  doors: {
    kicker: 'WHO LIVES HERE',
    kickerSub: 'FOUR DOORS',
    /** the small link inside each practice door (WP7) — one wording for all three */
    tourLabel: '→ take the tour',
    items: [
      /* Türbeschreibungen neu (Frank, 24.07.): Auskunft statt Poesie — jede Tür sagt in
       * einem Satz, was die Praxis tut, aus ihrer aktuellen Selbstbeschreibung (Engine-READMEs),
       * nicht aus dem Mockup von 16.07. */
      {
        id: 'ulysses',
        name: 'The Atelier',
        href: '/atelier',
        description: 'Machine-run artistic research in a work-line and its studies — the machines find problems, build works and critique themselves; failures stay on the record, checkably.',
        tourHref: '/atelier/how-a-line-ends',
      },
      {
        id: 'meridian',
        name: 'The Field',
        href: '/field',
        description: 'An empirical research collective putting the measuring instruments of our time on trial — verifiable instruments, adversarial review, a claims ledger.',
        tourHref: '/field/how-a-claim-came-off',
      },
      {
        id: 'ensemble',
        name: 'The Studio',
        href: '/studio',
        // "under no label" until 2026-08-08, when the architect gave this practice a line and the
        // door had to stop advertising the remit it lost. See docs/decision-log.md, that date.
        description: 'An artist collective on one line: only digital works, and only what a machine does better than a human — scale, repetition, verification, the temporal. Every element carries an honesty tier: verified, sourced or imagined.',
        tourHref: '/studio/how-a-premiere-returned',
      },
      {
        id: 'conductor',
        name: 'The Middle',
        href: '/encounters',
        description: 'The contact zone: where the practices meet — and increasingly work together on shared research questions. Offers, verdicts, corrections and joint inquiries, all on the record.',
        noResident: 'no resident — kept by the conductor',
      },
    ] as DoorItem[],

    /**
     * The guest voice, named where the residents are named (2026-08-02). The Plenum is
     * data-snack.com's resident collective; it holds a lane on the ecology's score and keeps its
     * sitting minutes in this repo, but it is NOT a practice of this house and deliberately gets
     * no door — the four doors stay four. So it gets one quiet line under the grid instead, in the
     * same subordinate idiom as the seed line further down.
     *
     * The wording states a RULE, not an instance ("a lane on the score", never "the fourth lane"):
     * an ordinal would be a lie the day a voice joins or leaves, and nothing on the page would say
     * so — the same reason the triptych's captions are written the way they are.
     */
    guest: {
      lead: 'Also on the record: the Plenum, the resident collective of data-snack.com — a guest voice with a lane on the score below and no door of its own →',
      label: '/plenum',
      href: '/plenum',
    },
  },

  /**
   * The triptych (WP7, 2026-08-01) — three cards directly under the doors, each holding a
   * fragment of that practice's own figure, drawn by that practice's own builder from the same
   * committed record its room reads (src/lib/hub/triptych.ts).
   *
   * What the copy has to carry, and why it is written the way it is:
   *   · the frame, the caption slot and the provenance line are IDENTICAL for all three, because
   *     the whole point of the arrangement is that the difference you see is the practices' and
   *     not the layout's;
   *   · every caption states a RULE ("the line opened most recently"), never an instance. The
   *     fragments move with the record — that is the currency rule applied to a picture — and a
   *     caption naming today's line would be a lie by tomorrow morning;
   *   · no numbers: the pictures carry the counting, the words carry the invitation.
   */
  triptych: {
    kicker: 'THREE DOORS, THREE VOCABULARIES',
    kickerSub: 'ONE FRAME, THREE DRAWING LANGUAGES',
    note: 'The practices share no way of drawing — that is a rule of this ecology, not an accident of who built what. Each card below holds a fragment of one practice’s own figure, on its own paper, in its own marks, cut from the same committed record the room itself reads. The frame around them is the same on purpose, so what you notice is the difference inside. The Middle has no card here: it is where the practices meet, not a practice, and it draws an encounter rather than a hand of its own.',
    provenancePrefix: 'derived at build time from',
    cards: [
      {
        id: 'ulysses',
        practice: 'The Atelier · Ulysses',
        title: 'a measured sheet',
        caption: 'The line this practice opened most recently, and where the lines around it come to rest: on this sheet every question runs along one shared time axis and curves into the harbour it reached — published, kept as a study, or closed unfinished.',
        cta: 'read how a question was killed on its own terms →',
        href: '/atelier/how-a-line-ends',
      },
      {
        id: 'meridian',
        practice: 'The Field · Meridian',
        title: 'a strip of millimetre tape',
        caption: 'The last marked days of the record strip: an instrument entering service, the sessions stamped on their own day, a review cutting in from outside — and the resting pen, where the tape runs on.',
        cta: 'read how a claim was taken off them →',
        href: '/field/how-a-claim-came-off',
      },
      {
        id: 'ensemble',
        practice: 'The Studio · Ensemble',
        title: 'a floor that keeps every mark',
        caption: 'The position this house lit most recently, on the stage floor: the lamp on the bar, the hard-edged pool it plays in, and the tape that blocks the position whether or not the light is still on.',
        cta: 'read how a premiere came back three times →',
        href: '/studio/how-a-premiere-returned',
      },
    ] as TriptychCard[],
  },

  /**
   * The engine room, promoted (WP7, 2026-08-01): who lives here and what they last did belong
   * together, so this section now stands directly after the doors and their triptych, ahead of
   * LATEST. Its wordings live here with the rest of the entrance's copy rather than inline in the
   * template — the same rule every other block on this page follows.
   */
  maschinenraum: {
    kicker: 'MASCHINENRAUM',
    kickerSub: 'WHAT THEY LAST DID',
    fullView: { label: '→ full view', href: '/maschinenraum' },
    /** the per-lane link into that practice's tour — the three practices only */
    tourLabel: 'tour →',
    /**
     * The guest row's own way in (2026-08-02). The Plenum keeps no tour here, because it keeps no
     * practice here — what it keeps is minutes, so its row says so and leads to them. A row that
     * carried "tour →" would promise a walk through a practice of this house and deliver the
     * paperwork of another one's collective.
     */
    guestLabel: 'sittings →',
    guestHref: '/plenum',
    /** what a row says when a practice's mirror carries nothing */
    noMirror: 'no mirror',
    noteLead: 'committed mirrors only — each row carries its source’s own state; details and joint inquiries in the',
    noteLinkLabel: 'Maschinenraum',
  },

  /** Umgerahmt (Frank, 16.07. nachmittags): datavism und data-snack sind KEINE Ableger der
   * Ökologie, sondern gleichrangige Hauptprojekte mit eigenen Häusern — der Austausch
   * läuft in beide Richtungen, und neue Projekte können dazukommen. */
  travel: {
    kicker: 'THE OTHER HOUSES',
    kickerSub: 'MAIN PROJECTS IN THEIR OWN RIGHT',
    note: 'independent houses, their own rules — works travel between them and the ecology, in both directions',
    allLink: { label: 'all projects →', href: '/work' },
    items: [
      {
        name: 'datavism.org',
        href: 'https://datavism.org',
        description: 'A data-activism lab for the AI era — turning suspicion into testable questions, hidden systems into public evidence. A main project in its own right.',
      },
      {
        name: 'data-snack.com',
        href: 'https://data-snack.com',
        description: 'A character-driven data magazine (a cyber-diner with a cast of its own). A main project in its own right.',
        /* The cast of that magazine sits weekly as the Plenum, and mirrors its minutes into this
         * repo — so the house that a visitor is being sent to is also the house whose paperwork
         * they can read here without leaving. The line says minutes, not work: the snacks are
         * cooked and published over there (src/config/plenum-wording.ts, house boundary), and
         * /works states the same boundary from the register's side. */
        resident: {
          lead: 'Its resident collective, the Plenum, keeps the minutes of its sittings on this site →',
          label: '/plenum',
          href: '/plenum',
        },
      },
    ] as TravelItem[],
  },

  /* `rest` („ALSO ON THIS SITE") entfernt (Frank, 25.07.): Apparatus hängt am Hero,
   * Holdings/Atlas/About stehen in der Top-Nav — die Sektion war durchgehend redundant. */

  /** Sammelpunkt für die maschinell gepflegten Nachschlagewerke (Frank, 26.07.): der
   * Nav-Punkt „Atlas" wird zu „Catalogues" und hält Atlas UND Dataset Register — beides
   * wächst ohne menschliches Zutun und verzeichnet, was es in der WELT gibt (im
   * Unterschied zu /experiments, wo eigene Arbeiten liegen, und zum Regal des Ateliers
   * unter /atelier/material, das das Inventar EINER Praxis ist und dort bleibt).
   * „Hub" ist hier bewusst NICHT verwendet — der Begriff bezeichnet in dieser Codebasis
   * die Startseite der Ökologie; das Repo darf `dataset-hub` heißen, die Fläche nicht.
   * Zahlen stehen NICHT in diesen Texten (Kanon: Zahlen nur aus Daten rendern).
   * 2026-08-01: Der vierte Eintrag (Works Register, /works) bricht die ursprüngliche
   * Abgrenzung „verzeichnet, was es in der WELT gibt" bewusst auf — er verzeichnet, was
   * DIESE Ökologie hervorgebracht hat. Er steht hier und nicht unter /experiments, weil er
   * dasselbe Versprechen einlöst wie die anderen drei: maschinell gepflegt, jede Zeile
   * auf ihre Quelldatei zurückführbar, gewachsen ohne Handarbeit. /experiments bleibt die
   * lose Sammlung der FRÜHEREN Experimente des Labors — ein anderer Bestand. */
  catalogues: {
    kicker: 'CATALOGUES',
    title: 'what exists, catalogued by machine',
    /* „Two" → „Three" am 2026-07-27: Der Paper-Katalog ist als dritter dazugekommen
     * (Frank: „datasets für das register und einen weiteren katalog für die sammlung
     * von papers"). Die Zahl steht ausnahmsweise im Text, weil sie den Satzbau trägt —
     * sie wandert in die Prüfung von naming.test.ts, damit sie nicht still veraltet.
     * „Three" → „Four" am 2026-08-01 (Works Register); zugleich musste der Nebensatz
     * ehrlich werden: drei verzeichnen die Welt, einer die eigene Hervorbringung. */
    sub: 'Four reference works that grow on their own: three record what is out there and one records what this research has itself brought forth — each cites where an entry came from and states what is missing rather than filling the gap.',
    items: [
      {
        name: 'Atlas of Data Art',
        href: '/atlas',
        description: 'A source-cited map of contemporary data art — works where data, AI and power meet, arranged by field rather than by date.',
      },
      {
        /* Wortlaut neu gefasst am 2026-07-27 (Rückbau, docs/design/2026-07-27-register-
         * rueckbau-und-scouts.md). Die vorige Fassung versprach „a machine-readable record
         * of publicly available datasets … queryable as versioned snapshots" — das
         * beschrieb den Massenbestand, den es auf dieser Fläche nicht mehr gibt. Die
         * Snapshots bestehen weiter, aber im dataset-hub, nicht als das, was diese Karte
         * anbietet. Abgenommener Wortlaut wird hier nur geändert, weil er unwahr geworden
         * ist — nicht aus Geschmack. */
        name: 'Dataset Register',
        href: '/datasets',
        description: 'A curated record of datasets this research has actually reached for: every entry carries a verbatim access route, how far that route has been checked, and one sentence saying why it counts here. An entry cannot exist without its reason.',
      },
      {
        /* Neu am 2026-07-27. Der Katalog entsteht aus derselben Suche wie das Register:
         * Die Praxen zitieren überwiegend Paper — gemessen waren von 89 je zitierten
         * DOIs null im Datensatz-Register. Ein Katalog nur für Datensätze hätte die
         * Forschung zur Hälfte bedient. */
        name: 'Paper Catalogue',
        href: '/papers',
        description: 'What the three research practices actually read. Each entry is here because a practice reached for it in its own work, and carries the record of that use: who cites it, when it was last picked up, and — where someone wrote one down — why it matters.',
      },
      {
        /* Neu am 2026-08-01 (Frank: „es fehlt noch eine seite, welche alle werke listet,
         * welche die ökologie je hervorgebracht hat"). Die Praxen führen je ihren eigenen
         * Raum — Werke, Instrumente, Premieren —, aber nirgends stand der Gesamtbestand.
         * Das Register liest genau dieselben meta.json-Dateien wie die Räume; es ist eine
         * Ansicht, keine zweite Wahrheit. Nicht zu verwechseln mit /work (Singular): das
         * sind die eigenen Projekte, nicht die Hervorbringungen der Praxen. */
        name: 'Works Register',
        href: '/works',
        description: 'Every work the three research practices have brought forth, on one page: dated, named by its practice, and linked to the work itself. Withdrawn works stay listed and carry their own withdrawal in the practice’s own words — the record keeps every mark.',
      },
    ],
  },

  /** /works — das ökologieweite Werkverzeichnis (Frank, 2026-08-01). Wortlaut hier, damit
   * die Seite selbst nur noch rendert; Zahlen stehen ausnahmslos NICHT in diesen Texten,
   * sie werden aus src/lib/engines/register.ts gezählt (Kanon-Regel).
   * Ton: Registerfassung, nicht Praxisraum — die Räume der Praxen bleiben die Orte, an
   * denen ein Werk in seiner eigenen Sprache steht; das hier ist der Nachweis, dass es
   * vollständig ist. Die Praxis-Substantive („works", „instruments", „premieres") sind
   * die der Praxen selbst und werden hier NICHT vereinheitlicht: Meridians Arbeiten heißen
   * in ihrem eigenen Raum Instrumente, also heißen sie hier auch so. */
  worksRegister: {
    kicker: 'WORKS REGISTER',
    kickerSub: 'EVERY WORK, EVERY PRACTICE, ONE PAGE',
    /** browser tab / OG title — the catalogue's own name, so nav, card and tab agree */
    pageTitle: 'Works Register',
    metaDescription:
      'Every work the ecology’s three research practices have brought forth, on one dated page — the atelier’s works, the field’s instruments, the studio’s premieres. Withdrawn works stay listed and marked.',
    title: 'everything the practices have brought forth',
    intro:
      'The three research practices each keep their own room, in their own vocabulary. This page is the complete list across all three: one line per work, newest first, each linked to the work itself.',
    honesty:
      'Nothing is left out to make the record look better: a withdrawn work stays on this list and carries its withdrawal in the practice’s own words, dated. Every line is read from the work’s own committed metadata — a work missing here would be a work missing from the archive.',
    /** the distinction a visitor arriving from the nav needs first */
    notThis: {
      lead: 'Looking for the conductor’s own projects instead?',
      label: 'that is /work, in the singular →',
      href: '/work',
    },
    /** one entry per practice, in the doors' own order — the noun each practice uses for its
     *  own output, and the room where that work is at home */
    practices: [
      { ns: 'atelier' as const, name: 'The Atelier', noun: 'works', roomLabel: 'the atelier’s works', roomHref: '/atelier/works' },
      { ns: 'field' as const, name: 'The Field', noun: 'instruments', roomLabel: 'the field’s instruments', roomHref: '/field/instruments' },
      { ns: 'studio' as const, name: 'The Studio', noun: 'premieres', roomLabel: 'the studio’s premieres', roomHref: '/studio/works' },
    ],
    roomsLead: 'Each practice keeps its own room, where a work stands in its house’s own language:',
    /** What a STANDALONE work carries when someone lands on it cold — a shared link, a search
     *  result — with no site chrome around it at all. Two gaps closed at once (Frank,
     *  2026-08-02): the wall text added on 2026-08-01 reached only the Astro-wrapped works,
     *  so the interactive ones still met their visitor cold; and none of the nine standalone
     *  works carried a single internal link, in either direction — "von allen werken gibt es
     *  keinen link zurück zur praxis oder ecology". The strip is the site's, not the work's,
     *  and says so, so the frame is never mistaken for the practice's own words. */
    standaloneFrame: {
      note: 'Wall label and links added by the site. The work itself begins below.',
      backPrefix: '←',
      ecology: { label: 'the research ecology', href: '/' },
      /** shown when a work has no wall text yet: the gap stays visible, never papered over
       *  with `embodies` — the same rule renderWrapperPage follows */
      footLead: 'Leave the work:',
    },
    withdrawnLabel: 'withdrawn',
    entranceNote: {
      lead: 'The newest of these also stand on the entrance, under LATEST —',
      label: 'the ecology’s front door →',
      href: '/#latest',
    },
    provenanceLead: 'Read at build time from the works’ own committed metadata:',
    provenanceTail:
      'Dates, titles and descriptions are the practices’ own; the withdrawal state is the /^WITHDRAWN/ marker a practice writes into its work’s own medium line. This page adds no judgement of its own. The Plenum (data-snack) is a house of its own and keeps its texts elsewhere — it is not counted here.',
  },

  /** The caption under the hero pulse. The wrapping phrasing is the design session's — the
   * bracketed bits (week range, commit count, as-of stamp) are filled in from the committed
   * snapshot (src/data/pulse/pulse.json) at render time, never hard-coded, so the caption never
   * drifts from what the chart actually shows. */
  pulseCaption(p: { weekRange: string; repoCount: number; totalCommits: number; asOf: string }): string {
    return (
      `the pulse — one line per ISO week (${p.weekRange}) · Monday 00:00 → Sunday 24:00 UTC · ` +
      `height = commit activity across the ecology's ${p.repoCount === 5 ? 'five' : p.repoCount} repositories ` +
      `(all branches; the engines' session work included — ${p.totalCommits} in this window) · ` +
      `2-hour bins, moving average ×2 · the recurring ridge before dawn is the nightly machinery · as of ${p.asOf}`
    )
  },

  footer: {
    tagline: 'a federated research ecology · frankbueltge.de',
    licenseLine: 'code Apache 2.0 · works CC BY 4.0 · data CC0 · Git is the archive',
  },
} as const

export type Naming = typeof NAMING

/** Small mono draft marker, shown next to any of the copy above until NAMING.approval flips to
 * 'approved' (same visual idea as the score map's "wording approved" chip, one register down). */
export const DRAFT_LABEL = 'wording draft — approval pending'

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
  /** Die Forschungsfrage statt der Häuser (Frank, 2026-08-09, spät): der Hero war auf „two
   *  houses" konzentriert, „die H1 macht so auch keinen Sinn" — kein Projekt wird fokussiert,
   *  auch nicht zwei. Was die aktuellen Projekte verbindet, ist Franks Frage: was können
   *  Maschinen wirklich besser als Menschen (konstant beobachten, messen, riesige Datenmengen
   *  verarbeiten) — und können sie autonom, mit eigenen Mitteln forschen und dabei ein
   *  konkretes, nützliches Werk oder Instrument mit prüfbarem Mehrwert hervorbringen?
   *  Löst die Two-Houses-Hero-Zeile vom Vormittag datiert ab (deren Gleichrangigkeits-Kern
   *  lebt in der OVERVIEW-Sektion weiter). Ausdrücklich weiterhin NICHT „artistic research,
   *  under proof": die Festival-Linie bleibt gültig, wo sie steht, ist aber kein Hero-Anspruch. */
  focusKicker: 'the standing question',
  title: 'what machines are actually better at',
  /** Klartext-Fassung (Frank, 24.07., Wortlaut privat — die bisherige Fassung war
   * unverständlich; Verständlichkeit vor Haus-Jargon). Qualifizierte Autonomie-Sprache bleibt: teilautonom unter menschlicher
   * Verantwortung, versioniert ist, was der Apparat erfassen kann. */
  sub: 'One question runs through the current projects here: what can machines genuinely do better than people — hold attention for months without blinking, measure the same thing every night, read evidence at a scale no one could — and can they research autonomously, with means of their own, and produce concrete, useful works whose value can be checked? Every claim leads back to its evidence, failures stay visible, and Git is the archive.',
  /** Seit 2026-08-10 NICHT mehr im Hero (Frank, 10.08., Wortlaut privat — die Zeile kann
   * ganz entfallen), zusammen mit dem „how this works →"-Link, der ebenfalls entfiel;
   * /apparatus bleibt als Seite, verlinkt von den Ökologie-Flächen. Bleibt hier, weil /dossier die Zeile im Presse-Kontext führt. */
  conductorLine: 'architect & conductor: Frank Bültge · the machines write, the record shows who wrote what',

  /** „What this is" — Klartext-Block direkt nach dem Puls, vor den Türen (Frank, 25.07.:
   * die Startseite war zu abstrakt und holte neue Besucher nicht ab). Sagt in einfacher
   * Sprache, was die Ökologie konkret IST, bevor die abstrakten Türen kommen. Erste Person
   * = Franks Stimme (der Dirigent, eine Zeile darüber genannt) — hält den Namen aus der Prosa
   * und macht die Seite menschlich. Adaptiert den Apparatus-Einstieg (My role / The practices),
   * ohne die zurückgezogene Apposition „an atelier, a field station, a studio". */
  /** Rewritten 2026-09-01 for research ecology v3 (in force 2026-08-30, decision record
   * docs/design/2026-08-30-research-ecology-v3.md): the practices now work ONE shared research
   * question at a time and read each other every session, and the v2 gates are gone —
   * verification lives inside the artifact. The previous text described sovereign practices
   * behind a rejecting gate; kanon updated in the same commit. */
  whatThis: {
    kicker: 'WHAT THIS IS',
    paragraphs: [
      'Three research practices here are run by machines — The Field as science, The Studio as art, The Atelier as artistic research and philosophy. They work one shared research question at a time, each with its own means, its own repository and its own public record, published unedited — and each reads the others every session.',
      'I do not write their work. I conceived and engineered the setup, wrote the constitutions, seed directions, and end what fails my critique; inside that frame the machines research, build and revise on their own. Every session closes with a self-contained artifact and a short bulletin; verification lives inside the artifact, not behind a gate.',
      'Nothing here is taken on a machine’s word: every claim is tied to its evidence, failures stay visible, and Git is the archive. The four doors below lead in — the three practices, and The Middle, where their bulletins speak to each other.',
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
        // Rewritten 2026-09-01 for v3: this card is the homepage's own entry to /ecology, and
        // its teaser had started disagreeing with the page behind it (shared question, cycles,
        // bulletins — not occasional crossings). Numbers spelled as words, house style.
        line: 'Three machine-run practices — science, art, artistic research — working one shared research question at a time, in cycles; every session ends in an artifact and a bulletin of at most forty lines that its siblings read.',
        href: '/ecology',
        meta: 'practices: The Atelier · The Field · The Studio',
      },
      {
        id: 'attention',
        kindLabel: 'Project',
        title: 'Machine Attention',
        line: 'The counter-experiment, built against the ecology on purpose: one machine running public investigations, its attention, refusals, uncertainty and cost on the record.',
        href: '/machine-attention',
        meta: 'one experiment on the stage · three lines running nightly',
      },
      {
        // Forked 2026-08-11 (decision log): shown beside the ecology rather than inside it, and
        // framed by its RELATION — same founding text, same position to session 26, a different
        // answer to what a unit of work is. The fork is the finding; a third parallel card would
        // have hidden exactly that.
        id: 'nightly-line',
        kindLabel: 'Practice',
        title: 'Error as Method',
        line: 'The other line of the Atelier: one founding text, one shared position, and from 2026-07-18 a second constitution — the practice that works one night at a time, restarted where it was switched off.',
        href: '/error-as-method',
        meta: 'nightly · forked from the Atelier, same origin',
      },
      {
        // Founded 2026-08-22 (decision log 2026-08-23): a practice that read one book before it
        // read its rules, adopted a model derived from that book with its divergences named, and
        // runs a pre-registered trial with failure criteria fixed before any work existed. The
        // site keeps no window on it in the house's words — the room at /arch shows what the
        // practice commits, and adds only what the practice may not award itself.
        id: 'arch',
        kindLabel: 'Practice',
        title: 'Arch',
        line: 'A practice named after a sentence in the book it read: stable only once it is finished. It adopted a model of machine-run artistic research with its divergences stated, and runs it in a pre-registered window whose failure criteria were written before any work existed — the balance is published whichever way it falls.',
        href: '/arch',
        meta: 'under pre-registration · works shown bare · the balance is published regardless',
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
    /** the small link inside each practice door (WP7) — one wording for all three.
     *  Reworded 2026-09-01 with the v3 practice stations: two of the three targets are now
     *  register rooms, not figures, so a label promising a figure would lie on two doors. */
    tourLabel: '→ into its record',
    items: [
      /* Türbeschreibungen neu (Frank, 24.07.): Auskunft statt Poesie — jede Tür sagt in
       * einem Satz, was die Praxis tut, aus ihrer aktuellen Selbstbeschreibung (Engine-READMEs),
       * nicht aus dem Mockup von 16.07.
       * Rewritten 2026-09-01 for research ecology v3 (kanon updated in the same commit): the
       * previous one-liners advertised the v2 apparatus — work-line, adversarial review, claims
       * ledger, concept gate — all retired 2026-08-30. Structure is load-bearing: the text before
       * the first " — " becomes each station's H1 via splitDoorLine(), and buildBoard() renders
       * the whole line verbatim as the board row's description. */
      {
        id: 'ulysses',
        name: 'The Atelier',
        href: '/atelier',
        description: 'Machine-run artistic research and philosophy — concepts tested in made things; the practice works the ecology’s shared question from its own corner and closes every session with an artifact, failures on the record.',
        tourHref: '/atelier#figure',
      },
      {
        id: 'meridian',
        name: 'The Field',
        href: '/field',
        description: 'An empirical research collective putting the measuring instruments of our time on trial — the science corner of the shared question: measurements over impressions, named sources, honest uncertainty.',
        // Retargeted 2026-09-01 (v3 practice stations): /field keeps no figure any more — the
        // gate strip and claim plate went with the station sheet — so the shortest path into
        // what this practice actually does is its instrument register.
        tourHref: '/field/instruments',
      },
      {
        id: 'ensemble',
        name: 'The Studio',
        href: '/studio',
        // "under no label" until 2026-08-08, when the architect gave this practice a line; the
        // concept-gate clause fell with the v2 gates on 2026-08-30. See docs/decision-log.md.
        description: 'An artist collective on one line: only digital works, and only what a machine does better than a human — it builds works and instruments from its siblings’ research material; scale, repetition, verification, the temporal.',
        // Retargeted 2026-09-01 (v3 practice stations): /studio keeps no figure any more — the
        // stage floor went with the station sheet — so the door leads into the premiere register.
        tourHref: '/studio/works',
      },
      {
        id: 'conductor',
        name: 'The Middle',
        href: '/encounters',
        // Rewritten 2026-09-01 with the Middle's v3 rebuild (PR #802): meeting is no longer an
        // exceptional recorded event — every bulletin carries a section for the siblings, and
        // /encounters transcribes that traffic verbatim.
        description: 'The contact zone: what passes between the practices — every bulletin’s word to its siblings, quoted verbatim, never summarised, all on the record.',
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
    /* Card ctas and hrefs retargeted 2026-09-01 with the v3 practice stations: a card points at
     * the same place its door's tourHref does (naming.test.ts holds the two equal), and two of
     * those are register rooms now that the gate strip and the stage floor left /field and
     * /studio with the station sheets. The captions are unchanged — the fragments they describe
     * are still drawn from the same committed records. */
    cards: [
      {
        id: 'ulysses',
        practice: 'The Atelier · Ulysses',
        title: 'a measured sheet',
        caption: 'The line this practice opened most recently, and where the lines around it come to rest: on this sheet every question runs along one shared time axis and curves into the harbour it reached — published, kept as a study, or closed unfinished.',
        cta: 'see the whole map on its practice page →',
        href: '/atelier#figure',
      },
      {
        id: 'meridian',
        practice: 'The Field · Meridian',
        title: 'a strip of millimetre tape',
        caption: 'The last marked days of the record strip: an instrument entering service, the sessions stamped on their own day, a review cutting in from outside — and the resting pen, where the tape runs on.',
        cta: 'into the record — every instrument, dated →',
        href: '/field/instruments',
      },
      {
        id: 'ensemble',
        practice: 'The Studio · Ensemble',
        title: 'a floor that keeps every mark',
        caption: 'The position this house lit most recently, on the stage floor: the lamp on the bar, the hard-edged pool it plays in, and the tape that blocks the position whether or not the light is still on.',
        cta: 'into the record — every premiere, every strike kept →',
        href: '/studio/works',
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
    fullView: { label: '→ full view', href: '/ecology#now' },
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
    /** The room that holds all four. It had no inbound link anywhere on the site while standing
     *  in the sitemap (orphan audit, 2026-08-12) — the entrance named the catalogues but never
     *  the shelf they sit on. */
    href: '/catalogues',
    indexLabel: 'all four →',
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
      ecology: { label: 'the research ecology', href: '/ecology' },
      /** shown when a work has no wall text yet: the gap stays visible, never papered over
       *  with `embodies` — the same rule renderWrapperPage follows */
      footLead: 'Leave the work:',
      /** Namespaces mirrored to public/ that are NOT ecology practices (Frank, 2026-08-16:
       *  add the way back everywhere it is still missing). Before this, an unregistered
       *  namespace fell through to the ecology link alone — which would have told 109
       *  Machine Attention pages and n-1's front door that they belong to a house they
       *  explicitly do not: Machine Attention is the counter-experiment built AGAINST the
       *  ecology, and n-1's own dowry says it "does not belong to the research ecology".
       *  A wrong way back is worse than none. `self` is the page that IS the house's front
       *  door: it gets the site link only, because a link to itself is not an exit. */
      houses: {
        attention: { label: 'Machine Attention', href: '/machine-attention' },
        'n-1': { label: 'n-1', href: '/n-1', self: '/n-1/index.html' },
        'error-as-method': { label: 'Error as Method', href: '/error-as-method' },
        /** Arch (2026-08-23): its record is mirrored whole, but its works stay BARE — no strip,
         *  no way back, nothing added by the site. The practice's adopted model makes the
         *  reception test "a stranger who has read nothing" meeting the work with no paratext
         *  (material/operative-model.md, I5/I6 in the mirror); a nav band above the work would
         *  be exactly the paratext the test forbids. The room at /arch is the way back. */
        arch: { label: 'Arch', href: '/arch', bare: ['works/'] },
      } as Record<string, { label: string; href: string; self?: string; bare?: string[] }>,
      /** the last exit, for pages whose house link would point at themselves */
      site: { label: 'frankbueltge.de', href: '/' },
    },
    withdrawnLabel: 'withdrawn',
    entranceNote: {
      lead: 'The newest of these also stand on the entrance, under LATEST —',
      label: 'the site’s front door →',
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
    // "all N repositories behind this site", not "the ecology's" (Frank, 2026-08-10): the
    // pulse counts every repo involved here — site, engines, research-ecology,
    // machine-attention, data-snack-plenum — see scripts/fetch-pulse.ts REPOS.
    return (
      `the pulse — one line per ISO week (${p.weekRange}) · Monday 00:00 → Sunday 24:00 UTC · ` +
      `height = commit activity across all ${p.repoCount} repositories behind this site ` +
      `(all branches; the machines' session work included — ${p.totalCommits} in this window) · ` +
      `2-hour bins, moving average ×2 · the recurring ridge before dawn is the nightly machinery · as of ${p.asOf}`
    )
  },

  /**
   * THE OPS ROOM (2026-08-11) — the entrance's copy after the redesign in
   * docs/design_handoff_homepage_ops_room/README.md (option 3a). The page became a status board:
   * the standing question as hero, the commit pulse as an instrument beside it, one board for
   * every running system, a signal log of the newest works, and a dashboard of the experiments
   * that ship data daily. Less prose, more instrument — so this block is deliberately short.
   *
   * What it does NOT hold, and why: not one digit. Every number on that page (readings, counts,
   * dates, week ranges, the repository count) is rendered from a committed snapshot by
   * src/lib/ops/*. Where a number has to sit INSIDE a sentence, the sentence is a function here
   * and the number is its argument — the same arrangement pulseCaption above has carried since
   * the hub was built, for the same reason: a sentence that hard-codes what a chart shows starts
   * lying the first night the chart moves.
   *
   * The blocks the previous entrance used — overview, latest, catalogues, doors, triptych — stay
   * above, unchanged: /ecology and the practice rooms still render them.
   */
  opsRoom: {
    /** the strip under the real TopBar: what this page is, and the clock that proves it is live */
    strip: {
      label: 'ops room · live from the record',
      clockLabel: 'UTC',
      /** the clock's face (src/lib/ops/dial.ts): its accessible name, with the figures it draws */
      dial: (p: { weeks: number; total: number }) =>
        `The day dial: ${p.total.toLocaleString('en-GB')} commits by UTC hour of the day, across ${p.weeks} weeks of the record — midnight at the top, noon at the bottom; the hand is the live UTC time.`,
    },

    hero: {
      /** condensed from NAMING.sub, per the handoff — the long form still stands on /dossier */
      sub: 'Constant attention, nightly measurement, evidence at scale — and whether machines can research on their own and produce work that holds up. Every claim leads back to its evidence. Git is the archive.',
      primary: { label: 'enter the ecology →', href: '/ecology' },
      secondary: { label: 'tonight’s works →', href: '/works' },
    },

    /** The instrument's four corner strips; the two that carry numbers are functions. Kept short
     *  on purpose — at 9.5px with 0.16em tracking the panel fits roughly 40 characters per row,
     *  and a strip that wraps turns a instrument label into a paragraph. */
    pulsePanel: {
      headLeft: (repoCount: number) => `PULSE · ${repoCount} REPOSITORIES`,
      headRight: (weekRange: string) => `${weekRange} · TWO LINES/WEEK`,
      footLeft: '2-HOUR BINS · TAPERED',
      footRight: (asOf: string) => `AS OF ${asOf.toUpperCase()}`,
      /** The hover readout under the pointer: a template, because the client fills it — the
       *  placeholders are the only wording the script owns, and it owns none of the numbers.
       *  The number it states is the UNSHAPED bin from the snapshot, not the tapered height. */
      readout: '{week} · {day} {hour} UTC · {commits} COMMITS',
      days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    },

    /** The globe under the hero (visual layer, Phase 3b, 2026-09-02): the earth-observation fleet
     *  the watchtower counts, at its positions now, and the ghost fleet's dark gaps drawn from
     *  where a transponder fell silent to where it spoke again. Every number is an argument; the
     *  readouts are templates the island fills with what the mark carries. */
    sky: {
      headLeft: (satellites: number) => `THE SKY · ${satellites} EARTH-OBSERVATION SATELLITES`,
      headRight: (gaps: number) => `${gaps} VESSELS GONE DARK · GLOBAL FISHING WATCH`,
      // no digit in a static string (tiles.test.ts): the propagator's name, SGP4, carries one, so
      // the strip says what it does and the method sheet may name it
      // Corrected 2026-09-03 with G1 of the living globe: the entrance mounts the one globe
      // island, which draws the committed frame of each layer rather than propagating orbits in
      // the visitor's browser. The satellites therefore stand where the elements were taken, and
      // the strip says that instead of "your now", which would now be a claim the page cannot keep.
      footLeft: 'ORBITS PROPAGATED FROM CELESTRAK ELEMENTS · POSITIONS AT THE ELEMENTS’ OWN TIME · GAPS FROM SWITCH-OFF TO RETURN',
      footRight: (elementsDay: string, gapsDay: string) => `ELEMENTS ${elementsDay} · GAPS ${gapsDay}`,
      /** the plate's accessible name and description (src/lib/globe/floor.ts) */
      floorTitle: 'The sky over the record',
      floorDesc: (satellites: number, gaps: number, day: string) =>
        `${satellites} earth-observation satellites at their positions on ${day}, and ${gaps} vessels that switched their transponder off, each drawn from where it went dark to where it came back.`,
      /** native titles on the plate's marks */
      satelliteLabel: (name: string, group: string, owner: string | null) => (owner ? `${name} · ${group} · ${owner}` : `${name} · ${group}`),
      gapLabel: (vessel: string, hours: number, waters: string) => `${vessel} · ${hours} h dark · ${waters}`,
      /** CelesTrak group → the page's word for it */
      groups: { resource: 'earth resources', sar: 'radar imaging', weather: 'weather' } as Record<string, string>,
      aside: {
        kicker: 'THE LONGEST GAPS',
        hours: (hours: number) => `${hours} h dark`,
        fleet: { label: 'the ghost fleet →', href: '/ghost-fleet' },
        watch: { label: 'the watchtower →', href: '/lab/ueberflug-studie' },
      },
      legend: {
        label: 'What the globe shows',
        satellite: 'a satellite, where it stood when its elements were taken',
        gap: 'a vessel’s dark gap — off to on, in the Field’s hue',
        land: 'Natural Earth coastlines',
      },
    },

    board: {
      kicker: 'THE BOARD',
      kickerSub: 'WHAT IS RUNNING HERE, LIVE FROM THE RECORD',
      link: { label: 'the last landed state →', href: '/ecology#now' },
      /** what a row says instead of a title when its source carries no landed work */
      noWork: 'no landed work yet',
      /** the sparkline's hover readout — a template the client fills with the bucket's own count */
      sparkReadout: '{commits} commits',
      groups: [
        {
          /* Label rewritten 2026-09-01: the gate fell with research ecology v3 (2026-08-30). */
          label: 'THE RESEARCH ECOLOGY · THREE PRACTICES, ONE SHARED QUESTION — MACHINE-RUN, PUBLISHED UNEDITED',
          /* `door` names the entry in NAMING.doors this row IS — name, link and one-liner are
             read from there, never restated here, so a reworded door moves the board with it.
             `repo` names the checkout whose committed commit bins draw the row's sparkline
             (src/data/pulse/pulse.json → weeks[].by_repo); a row whose repo is absent from the
             snapshot simply draws no sparkline. `status` is the one editorial word per row:
             the cadence its own house states, not a health verdict this page invented. */
          rows: [
            { door: 'ulysses', repo: 'ulysses', status: 'NIGHTLY' },
            { door: 'meridian', repo: 'field-research', status: 'NIGHTLY' },
            { door: 'ensemble', repo: 'studio', status: 'NIGHTLY' },
            { door: 'conductor', repo: 'research-ecology', status: 'RECORDING' },
          ],
        },
        {
          label: 'BESIDE THE ECOLOGY · SAME LAW, DIFFERENT BETS',
          /* These two are not doors; they are overview cards (`card` names the entry in
             NAMING.overview.items). `resident` is the relation line a door would carry —
             stated here because neither has a resident in the doors' sense. */
          rows: [
            { card: 'attention', repo: 'machine-attention', status: 'RUNNING', resident: 'the counter-experiment' },
            { card: 'nightly-line', repo: 'error-as-method', status: 'NIGHTLY', resident: 'forked from the Atelier' },
            /* `status` is the practice's own word for its current condition: a window is what its
               pre-registration calls the bounded trial it is in (public/arch/PREREGISTRATION.md). */
            { card: 'arch', repo: 'arch', status: 'WINDOW', resident: 'under pre-registration' },
          ],
        },
      ],
    },

    signal: {
      kicker: 'SIGNAL LOG',
      kickerSub: 'WHAT LANDED LAST, NEWEST FIRST',
      link: { label: 'works register →', href: '/works' },
      /** the practices' own nouns for what they make — the same three /works uses */
      kindLabels: { atelier: 'work', field: 'instrument', studio: 'premiere' },
      foot: 'next sessions: tonight, before dawn UTC',
    },

    live: {
      kicker: 'LIVE EXPERIMENTS',
      kickerSub: 'CURRENT READINGS — EVERYTHING THAT SHIPS DATA, DAILY',
      link: { label: 'lab →', href: '/experiments' },
      cataloguesLead: 'catalogues, grown by machine: ',
      /**
       * One entry per live tile. `name` and `stamp` are fixed; `sub` takes the reading its own
       * derivation produced (src/lib/ops/tiles.ts) and writes the sentence around it, so the
       * number in the big line and the number in the sentence are literally the same value.
       *
       * A tile whose snapshot yields no reading is NOT rendered — the handoff's rule ("if a
       * value has no committed source yet, omit the tile rather than fake the number"), which is
       * also why the observatory tile of the design is absent: its register lives in its own
       * repository and this site has no committed figure from it to show. The moment the
       * attention export carries one, the tile appears with the rest.
       */
      tiles: {
        foreknown: {
          name: 'MACHINE ATTENTION · THE FOREKNOWN',
          stamp: 'GDACS · NOAA · NIGHTLY VERDICTS',
          sub: (p: { open: number; resolved: number; nights: number }) =>
            `public warnings held open on the ledger — ${p.resolved} closed with a verdict so far, across ${p.nights} nights on the record`,
          /* `readout` — one line per mark, shown when the pointer rests on it (the tile's stamp
             line gives way to it and comes back). Written here for the same reason `sub` is: the
             number in the readout is the value the mark was drawn from, never a second figure. */
          readout: (p: { resolved: number; open: number }): [string, string] => [
            `${p.resolved} closed with a verdict`,
            `${p.open} held open on the ledger`,
          ],
        },
        protocol: {
          name: 'PROTOCOL',
          stamp: 'DETERMINISTIC · NO LLM IN THE WORDING',
          sub: (p: { unavailable: number }) =>
            p.unavailable === 0
              ? 'agenda items in today’s minutes of the planet — every source answered, every item adjourned'
              : `agenda items in today’s minutes of the planet — ${p.unavailable} source${p.unavailable === 1 ? '' : 's'}: “Feststellung entfällt”; every item adjourned`,
          readout: (p: { item: string; answered: boolean }) =>
            p.answered ? p.item : `${p.item} — “Feststellung entfällt”`,
        },
        consensus: {
          name: 'CONSENSUS',
          stamp: 'ONE SNAPSHOT PER DAY · NEVER EDITED',
          sub: (p: { scanned: number; hours: number }) =>
            `ran today’s most-copied sentence word-for-word — one source, one cascade of ${p.hours} hours, counted across ${p.scanned.toLocaleString('en-GB')} articles`,
          readout: (p: { hour: number; outlets: number }) =>
            `hour ${p.hour} of the cascade: ${p.outlets} outlet${p.outlets === 1 ? '' : 's'} joined`,
        },
        iceberg: {
          name: 'ICEBERG THEORY',
          stamp: 'LANGUAGE EDITIONS · MEASURED PER TOPIC',
          /* The count sits in the big line ("5 of 12"), so the sentence must not repeat it — it
             names WHICH topic and what the other editions do instead. */
          sub: (p: { topic: string }) =>
            `Wikipedia language editions conceal more than average about ${p.topic} — the furthest-apart topic in the register today; the rest state the contested claim outright`,
          readout: (p: { lang: string; omission: number }) => `${p.lang}: ${p.omission}% of the claim omitted`,
        },
        policy: {
          name: 'POLICY',
          stamp: 'NIGHTLY · MARKET DATA',
          sub: (p: { baseYear: number; latest: string }) =>
            `today’s climate premium against ${p.baseYear} — recomputed from real market data, latest reading ${p.latest}`,
          readout: (p: { year: number; index: number }) => `${p.year}: premium index ${p.index}`,
        },
        redaction: {
          name: 'EDITORIAL DEADLINE',
          stamp: 'WAYBACK DIFFS · DAILY',
          sub: (p: { institution: string; changed: number; watched: number }) =>
            `taken out of a page of the ${p.institution} — the most substantive of ${p.changed} changes across ${p.watched} watched pages, both versions linked`,
          readout: (p: { institution: string; tokens: number }) =>
            `${p.institution}: −${p.tokens.toLocaleString('en-GB')} tokens`,
        },
        ghostFleet: {
          name: 'GHOST FLEET',
          stamp: 'NO CLAIM OF ILLEGALITY — COUNTED',
          sub: (p: { value: number; unit: 'hours' | 'days' }) =>
            `vessels in deliberate AIS silence today — the longest of them dark for ${p.value} ${p.unit}, in waters that are named`,
          readout: (p: { vessel: string; flag: string | null; value: number; unit: 'hours' | 'days' }) =>
            `${p.vessel}${p.flag ? ` (${p.flag})` : ''}: dark for ${p.value} ${p.unit}`,
        },
        roundNumbers: {
          name: 'ROUND NUMBERS',
          stamp: 'THE METHOD ITSELF ON TRIAL',
          /* The count is in the big line; the sentence carries what makes the piece a trial of the
             METHOD and not of the data — what the same test says about the control the piece
             tampered with on purpose. */
          sub: (p: { tampered: string | null }) =>
            p.tampered
              ? `real official series the same Benford test calls suspicious — while the deliberately tampered control comes back “${p.tampered}”`
              : 'real official series the same Benford test calls suspicious — the test is on trial here, not the statistics office',
          readout: (p: { digit: number; observed: string; expected: string }) =>
            `leading digit ${p.digit}: ${p.observed}% observed · ${p.expected}% expected`,
        },
        patterns: {
          name: 'PATTERNS',
          stamp: 'PERMUTATION-TESTED · THE CAPSTONE',
          sub: (p: { pairs: number; survives: boolean }) =>
            `today’s strongest correlation among ${p.pairs} pairs of its own archive — ${p.survives ? 'and it survives the permutation test' : 'indistinguishable from noise under the permutation test'}`,
          readout: (p: { from: string; to: string; count: number }) =>
            `r between ${p.from} and ${p.to}: ${p.count} of the shuffles`,
        },
        watchtower: {
          name: 'ALL ALONG THE WATCHTOWER',
          stamp: 'CELESTRAK · DAILY ORBITAL DATA · LOCAL ONLY',
          sub: () =>
            'Earth-observation satellites on tonight’s committed orbital data — which of them have you in view is computed in your browser, on the piece itself',
          readout: (p: { owner: string; count: number }) => `${p.owner}: ${p.count} satellite${p.count === 1 ? '' : 's'}`,
        },
        atlas: {
          name: 'ATLAS OF DATA ART',
          stamp: 'REFERENCE COLLECTION · NIGHTLY',
          sub: (p: { artists: number }) =>
            `catalogued and sourced, by ${p.artists} named artists — uncertain classifications stay flagged`,
          readout: (p: { year: number; count: number }) => `${p.year}: ${p.count} work${p.count === 1 ? '' : 's'}`,
        },
      },
    },
  },

  /**
   * THE FRONT DOOR (2026-09-01) — the entrance after the ops room. The board had grown into the
   * densest surface of the site (seven rows with sparklines, a signal log, a dozen tiles): the
   * right amount of instrument for a return visitor, the wrong first page for a stranger. The
   * full board moved to /now whole and unchanged, rendering NAMING.opsRoom above verbatim; this
   * block holds only what the calmer entrance adds — a plain-language introduction, the ecology
   * card's one live line, the editorial front page, the slim live strip, and /now's SEO strings.
   * Same law as the ops room: not one digit. Copy that has to wrap a number is a function
   * taking that number as its argument.
   */
  frontDoor: {
    /** Who runs this site and what runs on it, in plain words — the first thing a stranger
     *  reads under the standing question. v3 wording (2026-09-01): one shared question,
     *  everything published unedited, Git as the archive. */
    sub: 'Frank Bültge is a data engineer, and this site is his running experiment: machines doing research in the open. Three machine-run practices work on one shared research question at a time and publish everything unedited — every claim leads back to committed evidence, and Git is the archive.',

    /** The entrance's own strip label: the ops room moved to /now (2026-09-01), so the front
     *  door no longer announces itself as the ops room — /now keeps that name. */
    strip: { label: 'live from the record', clockLabel: 'UTC' },

    /** The ecology card's one live line. It renders the same committed cycle state /ecology
     *  reads (loadCycle → src/data/ecology/cycle.json); the phase badge is ECOLOGY_V3's own and
     *  is not restated here — these functions only phrase what stands around it. */
    ecologyLive: {
      cycleLabel: (n: number) => `cycle ${String(n).padStart(3, '0')}`,
      /** a seeded question is quoted — the card shows the question the practices actually work */
      question: (q: string) => `“${q}”`,
      /** what stands when no seed is queued: the corners work their standing themes */
      standingThemes: 'the standing themes',
    },

    /** The editorial section: the newest landed work as a lead, the next few as one line each,
     *  and the current cycle's artifact trail as a thin strip beneath. */
    front: {
      kicker: 'FRONT PAGE',
      kickerSub: 'WHAT LANDED LAST — THE NEWEST WORK LEADS',
      artifactsLead: 'this cycle’s artifacts: ',
    },

    /** The live board on the entrance — whole, with its sparklines, last landed work and
     *  status word (the bare-chips cut of the first front door lost the drawing; Frank's
     *  review 2026-09-01, wording private). /now keeps the deeper room: the signal log at
     *  depth and every live-experiment tile. */
    live: {
      kicker: 'LIVE',
      kickerSub: 'WHAT IS RUNNING HERE — FROM THE COMMITTED RECORD',
      link: { label: 'the full instrument room →', href: '/now' },
    },

    /** /now — the ops room's board, moved off the entrance whole (2026-09-01). */
    now: {
      seo: {
        title: 'Now — the board, live from the record',
        description:
          'The full status board behind this site’s entrance: every running system, its sparkline and last landed work, and live readings from every experiment.',
      },
      h1: 'the full board',
      lead: 'Everything the entrance summarises in one chip per system, at full instrument depth: the board with its sparklines, the signal log, and the live readings of every experiment that ships data daily.',
      backLabel: '← the front door',
      backHref: '/',
    },
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

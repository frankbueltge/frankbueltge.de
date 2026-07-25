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
// "wording approved" chip, src/components/pages/BegegnungEntrance.astro).
export interface DoorItem {
  id: 'ulysses' | 'meridian' | 'ensemble' | 'conductor'
  name: string
  href: string
  description: string
  /** Only The Middle has no resident practice — shown instead of "resident: <name>". */
  noResident?: string
}

export const NAMING = {
  approval: 'approved' as 'draft' | 'approved',

  eyebrow: 'FRANK BÜLTGE · DATA ENGINEERING & ANALYTICS',
  /** Fokus-Zeile über dem Titel (Frank, 16.07. nachmittags): die Ökologie ist das aktuell
   * prominente Projekt unter mehreren Hauptprojekten — nicht die Identität der Site.
   * „currently conducting" ist Haus-Vokabular (architect & conductor) und bleibt wahr,
   * wenn der Fokus wandert. */
  focusKicker: 'currently conducting',
  title: 'a federated research ecology',
  /** Klartext-Fassung (Frank, 24.07.: „man versteht nur bahnhof" — Verständlichkeit vor
   * Haus-Jargon). Qualifizierte Autonomie-Sprache bleibt: teilautonom unter menschlicher
   * Verantwortung, versioniert ist, was der Apparat erfassen kann. */
  sub: 'Three machine-run research practices, each under its own constitution, and a contact zone where they meet and take up shared questions. Claims, transfers and revisions stay versioned; exclusions and unknowns stay visible — Git is the archive.',
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
    /* 'the whole lab →' entfernt (Frank, 24.07.): der Link zeigte auf /holdings (die ALTEN
     * Experimente), während die Liste hier die NEUEN Arbeiten der Praktiken führt —
     * semantisch falsch. Holdings hat seinen Platz unter ALSO ON THIS SITE. */
  },
  /* `crossings` entfernt (Frank, 25.07.): der Link „…work together (5) →" unter den Türen
   * war redundant — The Middle ist bereits eine der vier Türen und führt nach /encounters. */

  doors: {
    kicker: 'WHO LIVES HERE',
    kickerSub: 'FOUR DOORS',
    items: [
      /* Türbeschreibungen neu (Frank, 24.07.): Auskunft statt Poesie — jede Tür sagt in
       * einem Satz, was die Praxis tut, aus ihrer aktuellen Selbstbeschreibung (Engine-READMEs),
       * nicht aus dem Mockup von 16.07. */
      {
        id: 'ulysses',
        name: 'The Atelier',
        href: '/atelier',
        description: 'Machine-run artistic research in a work-line and its studies — the machines find problems, build works and critique themselves; failures stay on the record, checkably.',
      },
      {
        id: 'meridian',
        name: 'The Field',
        href: '/field',
        description: 'An empirical research collective putting the measuring instruments of our time on trial — verifiable instruments, adversarial review, a claims ledger.',
      },
      {
        id: 'ensemble',
        name: 'The Studio',
        href: '/studio',
        description: 'An artist collective under no label, staging works of data art in autonomous sessions — every element carries an honesty tier: verified, sourced or imagined.',
      },
      {
        id: 'conductor',
        name: 'The Middle',
        href: '/encounters',
        description: 'The contact zone: where the practices meet — and increasingly work together on shared research questions. Offers, verdicts, corrections and joint inquiries, all on the record.',
        noResident: 'no resident — kept by the conductor',
      },
    ] as DoorItem[],
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
      },
    ],
  },

  /* `rest` („ALSO ON THIS SITE") entfernt (Frank, 25.07.): Apparatus hängt am Hero,
   * Holdings/Atlas/About stehen in der Top-Nav — die Sektion war durchgehend redundant. */

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
    licenseLine: 'code PolyForm NC 1.0.0 · works CC BY-NC-SA 4.0 · Git is the archive',
  },
} as const

export type Naming = typeof NAMING

/** Small mono draft marker, shown next to any of the copy above until NAMING.approval flips to
 * 'approved' (same visual idea as the score map's "wording approved" chip, one register down). */
export const DRAFT_LABEL = 'wording draft — approval pending'

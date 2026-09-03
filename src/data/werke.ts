import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  /** meist sprachneutral (ein String); zweisprachig nur, wo der Name je Sprache abweicht (Beifang/Bycatch). */
  title: string | Record<Locale, string>
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant' | 'retired'
  href: string
  description: Record<Locale, string>
  /** Start/Launch des Experiments (ISO-Datum). Sortierschlüssel: newest first. */
  since: string
  /** true nur, wenn täglich Live-Daten fließen (für die `● live`-Markierung). */
  live?: boolean
  /** Sekundärer „Methodenblatt"-Link; null = keiner (z. B. Atelier hat sein Protokoll inline). */
  methodHref?: string | null
  /** 'studie' = aus der Experimente-Reihe genommen; läuft und archiviert aber weiter. */
  tier?: 'experiment' | 'studie' | 'project' | 'instrument'
  /** A work that reads the world AS IT RUNS. Nothing it shows is committed, it makes no archival
   *  claim, and it may go dark when a source does.
   *
   *  Frank's decision of 2026-09-04 (wording private, paraphrased): live and real-time
   *  experiments must be startable here, in this repo, without a second site and without asking
   *  first; citability and archiving are not the point, the work is. So an unarchived work is
   *  exempt from the three duties that were built for archived ones — the USP audit gate, the
   *  currency test against committed snapshots, and the method sheet — and owes exactly ONE
   *  thing instead, tested like the others were: it says on its own surface, in its own words,
   *  that it is live and that nothing here is archived. One duty replaces four. */
  unarchived?: boolean
  /** A work that was stopped, with the day and the reason.
   *
   *  Frank's decision of 2026-10-17 (wording private, paraphrased): instruments that measure
   *  nothing are retired the way Machine Attention retired The Foreknown and Dark Ocean on
   *  2026-10-04 — the nightly run stops, the archive stays where it is, the reason is committed,
   *  and the work's own page says RETIRED. For the three retired that day this lifts the rule of
   *  2026-08-09 (rework, never archive); it lifts it for nothing else.
   *
   *  `status` is 'retired' exactly when this is set, and a retired work is never `live`
   *  (werke.test.ts holds both). Its page carries src/components/experiments/RetiredNotice.astro,
   *  which reads `reason` verbatim, so the shelf, the page and the method sheet cannot give three
   *  different reasons. */
  retired?: {
    /** the day the nightly run stopped (ISO date) */
    on: string
    /** why, in the work's own voice: what the record showed, never a verdict on anyone */
    reason: string
    /** where the record stays — a directory of dated nightly files, or a single snapshot the
     *  pipeline rewrote every night, whose nights live in its git history */
    archive: { path: string; kind: 'dated' | 'history' }
  }
  /** Research line this experiment belongs to (Frank, 2026-08-22) — the shelf's categories.
   *  Mandatory for everything /experiments renders, absent for the practice doors and the
   *  other houses' entries; werke.test.ts holds both halves of that rule. */
  line?: ExperimentLineId
}

/** The four lines of the shelf (Frank, 2026-08-22 — chosen over a by-subject and a by-rank
 *  cut, because this one is the works' OWN claim: nine of the sixteen already say "from the
 *  counter-measurement line" in their own description, and the page showed none of it).
 *  Order here is the order on /experiments. */
export type ExperimentLineId = 'counter-measurement' | 'ledger' | 'memory' | 'watchers'

export interface ExperimentLine {
  id: ExperimentLineId
  /** kicker label — no leading article, like the titles since 2026-08-22 */
  label: string
  /** what the line asks. States a rule, never today's instance — the currency rule applied
   *  to a heading: a blurb naming the newest entry would be a lie by the next one. */
  blurb: Record<Locale, string>
}

/** English-only site since 2026-07-16; the Locale duality in this file is legacy, so both keys
 *  of every blurb carry the same sentence rather than a German string nobody renders. */
const bilingual = (s: string): Record<Locale, string> => ({ de: s, en: s })

export const EXPERIMENT_LINES: readonly ExperimentLine[] = [
  {
    id: 'counter-measurement',
    label: 'COUNTER-MEASUREMENT',
    blurb: bilingual(
      "Measure what power leaves in the dark, and make the measurement checkable — including when it turns on the method itself. The lab's named line, and the one Meridian carries into the ecology as a standing remit.",
    ),
  },
  {
    id: 'ledger',
    label: 'NIGHTLY LEDGER',
    blurb: bilingual(
      "Instruments that write one dated entry every night and never revise it: the minutes of the planet's session, and a premium on the present. The series is the finding, never a single night.",
    ),
  },
  {
    id: 'memory',
    label: 'REPRESENTATION & MEMORY',
    blurb: bilingual(
      "What a record states and what it leaves out — across Wikipedia's language editions, across the years the world's press invokes, and inside a mind assembled from parts that understand nothing.",
    ),
  },
  {
    id: 'watchers',
    label: 'SURVEILLANCE, COUNTED',
    blurb: bilingual(
      "Who is watching, counted from the watchers' own catalogues: trackers on the article pages of scholarly publishers, satellites with your location geometrically in view.",
    ),
  },
]

/** Verzeichnis der Experimente. Reihenfolge unten = redaktionelle Feinordnung bei Datums-
 *  Gleichstand; die öffentliche Sortierung ist chronologisch über `WERKE_CHRONO`. */
export const WERKE: Werk[] = [
  {
    id: 'spread',
    line: 'counter-measurement',
    title: 'Spread',
    subtitle: {
      de: 'One asset, several venues, the same instant — read live, never archived',
      en: 'One asset, several venues, the same instant — read live, never archived',
    },
    status: 'live',
    since: '2026-09-04',
    live: true,
    href: '/spread',
    unarchived: true,
    description: {
      // No digit (the currency doctrine, applied even though an unarchived work is exempt from
      // the test that enforces it): the time window the field shows, the multiplier a gap must
      // clear before the ledger logs it, and the number of venues read are all tunable constants,
      // and a sentence that typed one of them would start lying the day it changed.
      de: 'From the counter-measurement line, and the house’s first live, real-time work: an asset does not have one price, it has several, disagreeing by fractions of a second across venues nobody can watch all at once. This reads a handful of exchanges’ own public sockets at once, in the visitor’s own browser, and draws the gap between the highest and the lowest quoted price as it opens and closes — every trade a mark, every widening beyond the session’s own typical spread stamped into a ledger that accumulates while the visitor watches. Nothing here is committed, nothing is a signal, and a venue quoting a stablecoin rather than a dollar says so on the page rather than being folded silently into the same line.',
      en: 'From the counter-measurement line, and the house’s first live, real-time work: an asset does not have one price, it has several, disagreeing by fractions of a second across venues nobody can watch all at once. This reads a handful of exchanges’ own public sockets at once, in the visitor’s own browser, and draws the gap between the highest and the lowest quoted price as it opens and closes — every trade a mark, every widening beyond the session’s own typical spread stamped into a ledger that accumulates while the visitor watches. Nothing here is committed, nothing is a signal, and a venue quoting a stablecoin rather than a dollar says so on the page rather than being folded silently into the same line.',
    },
    methodHref: null,
    tier: 'experiment',
  },
  {
    id: 'globe',
    line: 'counter-measurement',
    title: 'Living Globe',
    subtitle: {
      de: 'Everything this house measures on the earth, on one globe, with the receipts',
      en: 'Everything this house measures on the earth, on one globe, with the receipts',
    },
    status: 'live',
    since: '2026-09-03',
    live: true,
    href: '/globe',
    description: {
      // One sentence-block in both keys, no digit in it (the currency doctrine): the number of
      // layers, of days and of marks all move nightly and live in the committed files, never here.
      de: "From the counter-measurement line. Every instrument in this house that touches a place — the satellites overhead, the vessels that switch their transponders off, the planet's nightly readings, the press counted country by country, the pages a government quietly removed — writes its own dated file every night, and each of them has until now been read alone. This puts them on one earth with one time axis: a layer per instrument, a day slider over the whole archive, and a card behind every single mark naming the committed file, the position inside it and the day it was written. The globe reads no clock. Its oldest day is the oldest day the archive holds and its newest is the newest record, so nothing on it can be more current than the file it came from. What it draws it can prove, and what it cannot place it says instead of moving: a country stands at the centroid of its own polygon and the card calls it a centroid, an institution's reading stands at the seat that publishes it and the card calls it a seat, and only a measurement actually taken at a site is called a station. Where the archive holds no record for a day, that layer draws nothing and states why, because the alternative — propagating today's data backwards into an empty day — is a fabrication with the look of a measurement.",
      en: "From the counter-measurement line. Every instrument in this house that touches a place — the satellites overhead, the vessels that switch their transponders off, the planet's nightly readings, the press counted country by country, the pages a government quietly removed — writes its own dated file every night, and each of them has until now been read alone. This puts them on one earth with one time axis: a layer per instrument, a day slider over the whole archive, and a card behind every single mark naming the committed file, the position inside it and the day it was written. The globe reads no clock. Its oldest day is the oldest day the archive holds and its newest is the newest record, so nothing on it can be more current than the file it came from. What it draws it can prove, and what it cannot place it says instead of moving: a country stands at the centroid of its own polygon and the card calls it a centroid, an institution's reading stands at the seat that publishes it and the card calls it a seat, and only a measurement actually taken at a site is called a station. Where the archive holds no record for a day, that layer draws nothing and states why, because the alternative — propagating today's data backwards into an empty day — is a fabrication with the look of a measurement.",
    },
    methodHref: '/werke/globe',
    tier: 'experiment',
  },
  {
    // Built 2026-09-04, free — the Atlas as inspiration, not as a quarry. Its fields 8 to 13
    // (perception, time, error, body, language, senses) hold 150 catalogued works and NOT ONE
    // that this house has ever built beside; every lab-renderable entry sits in the power fields
    // 1 to 7. This is the first work in that unoccupied half. Neighbour search before a line was
    // written: fifteen Atlas entries carry time or clock vocabulary, none is about timekeeping.
    id: 'sawtooth',
    line: 'memory',
    title: 'Sawtooth',
    subtitle: {
      de: 'The second came from the turning Earth, then from caesium. They have been drifting apart ever since.',
      en: 'The second came from the turning Earth, then from caesium. They have been drifting apart ever since.',
    },
    status: 'live',
    since: '2026-09-04',
    href: '/sawtooth',
    description: {
      de: "A second used to be a slice of the day; in 1967 it was redefined on caesium, and the two definitions stopped agreeing. The Earth runs long, so a leap second has been shoved into the civil clock twenty-seven times to hold them within nine tenths of a second of each other. This draws all of it from the daily earth-rotation record since 1962, committed: both lines on one scale, where the clock the world keeps stays flat while the uncorrected one falls thirty-five seconds away — the flatness is not the Earth behaving, it is the interventions, each marked. Then the same line alone, where the corrections become teeth, and where the teeth stop. Since about 2020 the Earth has been turning fast enough that the mean day runs SHORT for the first time in the record, and most of the short days ever measured fall in this decade. The next correction may therefore have to delete a second rather than add one, which no clock has ever done — postponed to around 2029 by meltwater slowing the planet back down, and made moot in 2035 when the leap second is retired outright. Either the saw cuts backwards once, or the line simply walks off the chart it has been pinned to for sixty-four years.",
      en: "A second used to be a slice of the day; in 1967 it was redefined on caesium, and the two definitions stopped agreeing. The Earth runs long, so a leap second has been shoved into the civil clock twenty-seven times to hold them within nine tenths of a second of each other. This draws all of it from the daily earth-rotation record since 1962, committed: both lines on one scale, where the clock the world keeps stays flat while the uncorrected one falls thirty-five seconds away — the flatness is not the Earth behaving, it is the interventions, each marked. Then the same line alone, where the corrections become teeth, and where the teeth stop. Since about 2020 the Earth has been turning fast enough that the mean day runs SHORT for the first time in the record, and most of the short days ever measured fall in this decade. The next correction may therefore have to delete a second rather than add one, which no clock has ever done — postponed to around 2029 by meltwater slowing the planet back down, and made moot in 2035 when the leap second is retired outright. Either the saw cuts backwards once, or the line simply walks off the chart it has been pinned to for sixty-four years.",
    },
    live: true,
  },
  {
    id: 'trending',
    line: 'ledger',
    title: 'Common Ground',
    subtitle: {
      de: 'What the web is searching, reading and posting about — cross-checked, every morning',
      en: 'What the web is searching, reading and posting about — cross-checked, every morning',
    },
    status: 'live',
    since: '2026-09-02',
    live: true,
    href: '/trending',
    description: {
      // One sentence-block in both keys, no digit in it (the currency doctrine): the number of
      // sources, of topics, of tracked terms and of readers all move nightly and live in the
      // dated files, never here.
      de: "From the nightly-ledger line. Every morning a machine reads what the web is searching, reading and posting about — Google's daily search trends, Wikipedia's most-read pages, Hacker News, Bluesky, Mastodon and the day's headlines — and keeps what converges: the topics surfacing on several independent platforms at once, matched by a disclosed rule rather than a model, archived as open data and served in the forms a machine reader can use — and beside the day's spikes it tracks the slow arcs, a watched list of terms whose mentions in forums, code, papers and the press are counted per platform, given a status by a published threshold, and shown with the receipts they were counted from. It counts its own readers too — which search engines and which AI agents fetched it, published daily, never a browser's identity.",
      en: "From the nightly-ledger line. Every morning a machine reads what the web is searching, reading and posting about — Google's daily search trends, Wikipedia's most-read pages, Hacker News, Bluesky, Mastodon and the day's headlines — and keeps what converges: the topics surfacing on several independent platforms at once, matched by a disclosed rule rather than a model, archived as open data and served in the forms a machine reader can use — and beside the day's spikes it tracks the slow arcs, a watched list of terms whose mentions in forums, code, papers and the press are counted per platform, given a status by a published threshold, and shown with the receipts they were counted from. It counts its own readers too — which search engines and which AI agents fetched it, published daily, never a browser's identity.",
    },
    methodHref: '/werke/trending',
    tier: 'experiment',
  },
  {
    id: 'attention',
    title: 'Machine Attention',
    subtitle: {
      de: 'A machine investigative practice: one machine, public investigations, every step on the record.',
      en: 'A machine investigative practice: one machine, public investigations, every step on the record.',
    },
    status: 'live',
    since: '2026-08-08',
    href: '/attention',
    description: {
      de: "One machine, run as an open investigative practice — the counter-experiment to the research ecology: one constitution against many. Its first project, The Foreknown, held the world's public warnings as a ledger of announced futures for fifty nights (2026-08-08 to 2026-10-03), every byte hashed the moment it was issued, and was retired on 2026-10-04 when its own record showed it could not measure the gap it was built for: most of what it held were local US weather warnings announced hours ahead, nearly every verdict said only that a warning ran out at its source, and the money and attention it measured belonged to whole countries, never to one warning. The record stays public at /attention as an archive. The question moves to the clock where response is measurable — slow-onset food crises, where projections come months before the money: The Interval, built nightly by the machine's own discovery pass. Autonomy is the research object: every step attributed — machine or human, model, cost — no aggregate score. Most ideas are expected to die in public, with reasons.",
      en: "One machine, run as an open investigative practice — the counter-experiment to the research ecology: one constitution against many. Its first project, The Foreknown, held the world's public warnings as a ledger of announced futures for fifty nights (2026-08-08 to 2026-10-03), every byte hashed the moment it was issued, and was retired on 2026-10-04 when its own record showed it could not measure the gap it was built for: most of what it held were local US weather warnings announced hours ahead, nearly every verdict said only that a warning ran out at its source, and the money and attention it measured belonged to whole countries, never to one warning. The record stays public at /attention as an archive. The question moves to the clock where response is measurable — slow-onset food crises, where projections come months before the money: The Interval, built nightly by the machine's own discovery pass. Autonomy is the research object: every step attributed — machine or human, model, cost — no aggregate score. Most ideas are expected to die in public, with reasons.",
    },
    live: true,
    methodHref: '/werke/attention',
    tier: 'project',
  },
  {
    id: 'admissions',
    title: 'Admissions',
    subtitle: {
      de: 'The record of the world’s wars keeps changing its own past.',
      en: 'The record of the world’s wars keeps changing its own past.',
    },
    status: 'live',
    since: '2026-08-27',
    href: '/admissions',
    description: {
      de: "An instrument, not a work. Two organisations keep the canonical lists of the world's wars and disasters, and both rewrite their own past: years gain a conflict long after the fact, entries are removed from them, death tolls move. This watch holds every released version at once and keeps the account — what was admitted to an earlier year, what was taken out of one, what changed size, and under which of the keeper's own headings each change is filed. The part a reader can check without trusting anyone: ask how many armed conflicts a given year held, and the answer is not fixed — while the places that republish these figures show no version history at all. It can only watch keepers who publish their own past versions, which is almost nobody, and it says so on its face.",
      en: "An instrument, not a work. Two organisations keep the canonical lists of the world's wars and disasters, and both rewrite their own past: years gain a conflict long after the fact, entries are removed from them, death tolls move. This watch holds every released version at once and keeps the account — what was admitted to an earlier year, what was taken out of one, what changed size, and under which of the keeper's own headings each change is filed. The part a reader can check without trusting anyone: ask how many armed conflicts a given year held, and the answer is not fixed — while the places that republish these figures show no version history at all. It can only watch keepers who publish their own past versions, which is almost nobody, and it says so on its face.",
    },
    live: true,
    tier: 'instrument',
  },
  {
    id: 'observatory',
    title: 'The State Before the Interface',
    subtitle: {
      de: 'An autonomous observatory of public AI procurement in Europe.',
      en: 'An autonomous observatory of public AI procurement in Europe.',
    },
    status: 'live',
    since: '2026-08-08',
    href: '/observatory',
    description: {
      de: "An instrument of the Machine Attention practice since 2026-08-08 — kept deliberately quiet, and none the less a project of it: every night it reads Europe's public procurement journal (TED), preserves every AI-related notice as hashed original bytes, and turns differences — records changed after publication, records that vanish, the same vendor winning across borders — into case candidates that face a six-criteria gate. Most candidates die, publicly and with reasons; a false alarm is a successful outcome. Autonomy itself is the research object: every step is attributed in a public protocol — machine or human, model, cost, correction. The public register the AI Act promised stays empty until December 2027; this observatory builds the before-picture now.",
      en: "An instrument of the Machine Attention practice since 2026-08-08 — kept deliberately quiet, and none the less a project of it: every night it reads Europe's public procurement journal (TED), preserves every AI-related notice as hashed original bytes, and turns differences — records changed after publication, records that vanish, the same vendor winning across borders — into case candidates that face a six-criteria gate. Most candidates die, publicly and with reasons; a false alarm is a successful outcome. Autonomy itself is the research object: every step is attributed in a public protocol — machine or human, model, cost, correction. The public register the AI Act promised stays empty until December 2027; this observatory builds the before-picture now.",
    },
    live: true,
    methodHref: '/werke/observatory',
    tier: 'instrument',
  },
  {
    id: 'society',
    line: 'memory',
    title: 'Society',
    subtitle: {
      de: 'A mind of mindless parts, running live in the browser',
      en: 'A mind of mindless parts, running live in the browser',
    },
    status: 'live',
    since: '2026-08-05',
    href: '/society',
    description: {
      // "twenty-five agents" retired 2026-08-22 (currency audit): the roster went 25 → 27 → 29
      // over 2026-08-05/06 (src/lib/society/agents.ts), and the page derives its counts while
      // this sentence had them typed. The shelf now names no number the page can contradict.
      de: "Minsky's Society of Mind (1986), forty years on, as a deterministic simulation in the browser: a roster of agents, none of them intelligent, builds block towers, quarrels over one hand and remembers by K-line — watched by a B-brain that sees only them, never the world. The visitor is a shadow in the block world, noticed but never understood, and any agent can be silenced: what the whole loses follows from the missing rule, scripted nowhere. Every agent is small enough to read whole, every citation checked against the print edition, and the piece's claims run as tests.",
      en: "Minsky's Society of Mind (1986), forty years on, as a deterministic simulation in the browser: a roster of agents, none of them intelligent, builds block towers, quarrels over one hand and remembers by K-line — watched by a B-brain that sees only them, never the world. The visitor is a shadow in the block world, noticed but never understood, and any agent can be silenced: what the whole loses follows from the missing rule, scripted nowhere. Every agent is small enough to read whole, every citation checked against the print edition, and the piece's claims run as tests.",
    },
    tier: 'experiment',
  },
  {
    id: 'on-record',
    title: 'On Record',
    subtitle: {
      de: 'Two independent verifications of one claim, kept in disagreement.',
      en: 'Two independent verifications of one claim, kept in disagreement.',
    },
    status: 'live',
    since: '2026-07-23',
    href: '/on-record',
    description: {
      de: 'A graph-fed view of one real research claim from the Meridian runtime and the two independent verifications that disagreed about it — a pass and a fail, side by side. The runtime refuses to average genuine disagreement into a false consensus, so the claim stays contested, on record. Every figure is derived by SPARQL query over a claim-rooted RO-Crate + W3C-PROV export committed to the repo — nothing on the page is authored prose about the work; it is the archive, rendered.',
      en: 'A graph-fed view of one real research claim from the Meridian runtime and the two independent verifications that disagreed about it — a pass and a fail, side by side. The runtime refuses to average genuine disagreement into a false consensus, so the claim stays contested, on record. Every figure is derived by SPARQL query over a claim-rooted RO-Crate + W3C-PROV export committed to the repo — nothing on the page is authored prose about the work; it is the archive, rendered.',
    },
    methodHref: '/werke/on-record',
    tier: 'experiment',
  },
  {
    id: 'spielraum',
    line: 'counter-measurement',
    title: { de: 'Spielraum', en: 'Headroom' },
    subtitle: {
      de: 'Rechenzentrums-Effizienz nahe am Anschlag, Verbrauch im Steigflug',
      en: 'Data-center efficiency near its floor, consumption climbing',
    },
    status: 'live',
    since: '2026-07-12',
    href: '/headroom',
    description: {
      // "grew 27% in a single year" was one disclosure behind as of 2026-08-22 (currency audit):
      // src/data/spielraum/register.json holds 17 (2023), 27 (2024) and 37 (2025). Rather than
      // typing 37 and waiting for the same defect, the sentence now states the register's own
      // caveat — at a 1.09 floor, any growth above 9% already crosses it — which every disclosed
      // year satisfies and each new one can only strengthen.
      de: "From the counter-measurement line. PUE — the data-center efficiency metric — has a physical floor of 1.0. Google's fleet sits at 1.09: under 9% of headroom remains, forever — and the electricity it discloses has grown by more than that in every year it has reported since 2023. Tracked year by year: what four hyperscalers disclose — and what they don't. AWS discloses no consumption at all.",
      en: "From the counter-measurement line. PUE — the data-center efficiency metric — has a physical floor of 1.0. Google's fleet sits at 1.09: under 9% of headroom remains, forever — and the electricity it discloses has grown by more than that in every year it has reported since 2023. Tracked year by year: what four hyperscalers disclose — and what they don't. AWS discloses no consumption at all.",
    },
    tier: 'experiment',
  },
  {
    id: 'beifang',
    line: 'watchers',
    title: { de: 'Beifang', en: 'Bycatch' },
    subtitle: { de: 'Science-Tracking, gemessen', en: 'Science tracking, measured' },
    status: 'live',
    since: '2026-07-02',
    href: '/bycatch',
    description: {
      // "from two vantage points" retired 2026-08-22 (currency audit): the reader vantage
      // delivered data once, on 2026-07-05, and in none of the seven weekly censuses since —
      // the page has said so all along ("last measured on 2026-07-05"), the shelf had not. In
      // its place the finding the census actually produces now: most publisher pages bot-wall
      // the audit (41 of 60 blocked on 2026-08-17), which the work treats as the result.
      de: 'A weekly tracker census of article pages from the five largest scholarly publishers — against ten diamond-OA journals as a control group, before any consent. Most publisher pages now bot-wall the audit; the refusal is the finding.',
      en: 'A weekly tracker census of article pages from the five largest scholarly publishers — against ten diamond-OA journals as a control group, before any consent. Most publisher pages now bot-wall the audit; the refusal is the finding.',
    },
  },
  {
    id: 'field',
    title: 'The Measuring Field',
    subtitle: {
      de: 'A machine collective researching where data, AI and power meet — it names itself',
      en: 'A machine collective researching where data, AI and power meet — it names itself',
    },
    status: 'live',
    since: '2026-07-01',
    live: true,
    href: '/field',
    description: {
      de: 'Meridian — an autonomous machine collective — holds recurring research sessions investigating the live field where data, AI and power meet, with no standing cast: a voice is convened only when a move needs it (Research Protocol v3, 2026-08-08). It builds verifiable instruments and publishes only what survives its own gauntlet. Unedited, public — measurement turned on itself.',
      en: 'Meridian — an autonomous machine collective — holds recurring research sessions investigating the live field where data, AI and power meet, with no standing cast: a voice is convened only when a move needs it (Research Protocol v3, 2026-08-08). It builds verifiable instruments and publishes only what survives its own gauntlet. Unedited, public — measurement turned on itself.',
    },
    methodHref: null,
  },
  {
    id: 'studio',
    title: 'Ensemble',
    subtitle: {
      de: "An autonomous artist collective composing from its own research and, where it chooses, Meridian's verified material",
      en: "An autonomous artist collective composing from its own research and, where it chooses, Meridian's verified material",
    },
    status: 'live',
    since: '2026-07-12',
    live: true,
    href: '/studio',
    description: {
      de: "Ensemble — ein autonomes Künstlerkollektiv auf einer Linie: nur digitale Werke, und nur, was eine Maschine besser kann als ein Mensch — Skalierung, Wiederholung, Verifikation, das Zeitliche. Es komponiert aus eigener Recherche, aus Begegnungen, und wo es das wählt, aus Material, das Meridian (Field) verifiziert hat. Jedes Element trägt sichtbar seine Stufe — Verified, Sourced oder Imagined. Unredigiert, öffentlich.",
      en: "Ensemble — an autonomous artist collective on one line: only digital works, and only what a machine does better than a human — scale, repetition, verification, the temporal. It composes from its own research, from encounters, and, where it so chooses, from material Meridian (Field) has verified. Every element carries its tier in the open — Verified, Sourced or Imagined. Unedited, public.",
    },
    methodHref: null,
  },
  {
    id: 'protokoll',
    line: 'ledger',
    title: 'Protocol',
    subtitle: {
      // "twelve open sources" was broken on 2026-06-27, when a thirteenth (Wikidata P1120) was
      // added — the count sat in the always-visible subtitle for eight weeks. No number here
      // now: the source count is the pipeline's business and it moves.
      de: 'Daily figures, each from its own open source',
      en: 'Daily figures, each from its own open source',
    },
    status: 'live',
    since: '2026-06-12',
    live: true,
    href: '/protocol',
    description: {
      // Same 2026-06-27 change broke the second claim too: agenda item 13 (Losses) deliberately
      // does NOT adjourn — src/lib/protokoll/render.ts gives it "Entered into the record.", and
      // render.test.ts pins that ("witnessed, not adjourned"). The register was asserting the
      // opposite of a rule the code holds under test.
      de: "Every night a pipeline writes the minutes of the planet's session — from open, citable sources only, deterministic, no LLM. Every agenda item but one ends the same way: Resolution: adjourned; the losses are entered into the record.",
      en: "Every night a pipeline writes the minutes of the planet's session — from open, citable sources only, deterministic, no LLM. Every agenda item but one ends the same way: Resolution: adjourned; the losses are entered into the record.",
    },
  },
  {
    id: 'tell',
    line: 'counter-measurement',
    title: 'Delve into the intricate realm',
    subtitle: {
      de: 'Die Fingerabdrücke der Maschine in der Wissenschaft',
      en: "The machine's fingerprints in science",
    },
    status: 'live',
    since: '2026-06-22',
    href: '/tell',
    description: {
      // The fold figures are peak-vs-baseline and stable in every snapshot, so they stay. Added
      // 2026-08-22 (currency audit) is the newest state of the series, which the entry had not
      // caught up with: src/data/tell/latest.json → index 3569.3 (2024) → 3055.7 (2025), the
      // first decline since the marker was tracked.
      de: 'From the “Counter-Measurement” line. Certain words — “delve”, “showcasing”, “intricate” — are tells of generative AI. Their share in peer-reviewed PubMed abstracts jumped after ChatGPT: at the 2024 peak, “delve” about 14× and “showcasing” 19× as often as before. In 2025 the index fell for the first time. An AI tool measuring AI’s footprint in science.',
      en: 'From the “Counter-Measurement” line. Certain words — “delve”, “showcasing”, “intricate” — are tells of generative AI. Their share in peer-reviewed PubMed abstracts jumped after ChatGPT: at the 2024 peak, “delve” about 14× and “showcasing” 19× as often as before. In 2025 the index fell for the first time. An AI tool measuring AI’s footprint in science.',
    },
  },
  {
    id: 'redaction',
    line: 'counter-measurement',
    title: 'Editorial Deadline',
    subtitle: {
      de: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
      en: 'What is quietly removed — from the official record, and from the record of the world’s press',
    },
    status: 'live',
    since: '2026-06-25',
    live: true,
    href: '/redaction',
    description: {
      // Two corrections on 2026-08-22 (currency audit): "~54k rewritten headlines a day" was the
      // launch day's figure and is the ceiling of the committed range (33.3k–53.7k, mean 47.7k),
      // so the sentence now states the order of magnitude it can keep. And chamber 1 does not
      // surface a removal every day — four of the eight days to 2026-08-22 found nothing at all,
      // which is a legitimate result and now what the entry promises.
      de: 'From the “Counter-Measurement” line, in two chambers. Chamber 1: each day a machine diffs the Wayback snapshots of a curated list of official pages and, on the days something was taken away, surfaces the most substantive removal — both versions linked, checkable in two clicks. Chamber 2 (since 2026-08-14): the same gesture at the scale of the world’s press — the tens of thousands of headlines GDELT’s recrawl finds rewritten each day, run through a versioned triviality filter to a bounded register of genuine reframings, plus a deletion rate measured against a nightly sample the house committed before the vanishing. No claim of intent, only the counted thing taken away — receipts held.',
      en: 'From the “Counter-Measurement” line, in two chambers. Chamber 1: each day a machine diffs the Wayback snapshots of a curated list of official pages and, on the days something was taken away, surfaces the most substantive removal — both versions linked, checkable in two clicks. Chamber 2 (since 2026-08-14): the same gesture at the scale of the world’s press — the tens of thousands of headlines GDELT’s recrawl finds rewritten each day, run through a versioned triviality filter to a bounded register of genuine reframings, plus a deletion rate measured against a nightly sample the house committed before the vanishing. No claim of intent, only the counted thing taken away — receipts held.',
    },
    // Instrument, not a festival-aspiring experiment (Frank, 2026-08-14, after the world
    // chamber shipped, wording private: make an instrument of it) — the gesture is an occupied 20-year
    // genre; the daylight is methodological. It keeps running nightly and feeds the
    // counter-measurement line; a thematic sharpening (de-naming) waits on evidence.
    tier: 'instrument',
  },
  {
    id: 'round-number',
    line: 'counter-measurement',
    title: 'Round Numbers',
    subtitle: {
      de: 'Ein Test, der angeblich gefälschte Zahlen erkennt — und wie oft er sich irrt',
      en: 'A test that claims to spot faked numbers — and how often it is wrong',
    },
    status: 'retired',
    since: '2026-06-25',
    href: '/round-number',
    description: {
      // "just as suspicious" quantified 2026-08-22 (currency audit): the same-n false-positive
      // rates in src/data/round-number/latest.json run 0.38–0.51, not 1.0 — and the effect is a
      // small-n effect (the n=6000 controls sit at 0.0), which is the actual finding.
      // Past tense since the retirement of 2026-10-17; the reason lives in `retired` below.
      de: 'From the “Counter-Measurement” line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece put the method itself on trial: each night it showed that the same test which calls a real official series “suspicious” calls provably-clean data of the same size suspicious about half the time. Retired on 2026-10-17.',
      en: 'From the “Counter-Measurement” line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece put the method itself on trial: each night it showed that the same test which calls a real official series “suspicious” calls provably-clean data of the same size suspicious about half the time. Retired on 2026-10-17.',
    },
    // Measured on the day of the decision: src/data/round-number/ holds 115 nightly files
    // (2026-06-25 to 2026-10-17), and the `series` block of 114 of them is byte-identical — every
    // file from 2026-06-26 on. The first differs only in the last floating-point digit of Benford's
    // expected shares (computed on another machine); its datasets were committed on 2026-06-25 and
    // never touched again. Only `pick` rotated, through the same five series, 23 nights each.
    retired: {
      on: '2026-10-17',
      reason:
        'It ran the same trial every night. Its series are committed once and never refreshed, so from its second night on every nightly file carries the identical result for the same three World Bank indicators and two synthetic controls; only the series in the dock rotated. A trial that cannot come out differently is not a measurement, and what it restated, that a fixed Benford threshold flags small clean samples, has been in the literature it cites for fifteen years.',
      archive: { path: 'src/data/round-number', kind: 'dated' },
    },
  },
  {
    id: 'pattern',
    line: 'counter-measurement',
    title: 'Patterns',
    subtitle: {
      de: 'Eine Maschine, die jeden Tag ein Muster fand — und nicht wusste, ob es etwas bedeutet',
      en: 'A machine that found a pattern every day — and could not tell if it meant anything',
    },
    status: 'retired',
    since: '2026-06-22',
    href: '/pattern',
    description: {
      // Corrected 2026-08-22 (currency audit), and this one was not a stale digit: the entry
      // claimed the permutation test PROVES the machine cannot tell signal from noise, while
      // src/data/pattern/latest.json has returned false_discovery_rate 0.0 in all 62 committed
      // snapshots — the test clears the pair, and PatternPage.astro accordingly renders the
      // opposite branch ("it might be real"). The register was asserting an outcome the
      // instrument has never produced. Whether a test that never fires still carries the work's
      // thesis was left to the architect (issue #724) and was answered on 2026-10-17: it does
      // not, and the piece was retired. Past tense since; the reason lives in `retired` below.
      de: 'Capstone of the “Counter-Measurement” line. Each night the machine mined its own Protocol archive for correlations, surfaced the strongest and put it through a permutation test — the scepticism this line applies to everyone else, turned on its own output. With enough series, a strong pair is always there; telling what it means was the job the test was given. Retired on 2026-10-17.',
      en: 'Capstone of the “Counter-Measurement” line. Each night the machine mined its own Protocol archive for correlations, surfaced the strongest and put it through a permutation test — the scepticism this line applies to everyone else, turned on its own output. With enough series, a strong pair is always there; telling what it means was the job the test was given. Retired on 2026-10-17.',
    },
    // Measured on the day of the decision, replaying the git history of the one snapshot it kept
    // (src/data/pattern/latest.json, 120 commits): 118 distinct nights, 2026-06-22 to 2026-10-17,
    // false_discovery_rate 0.0 in all 118; 86 of the 118 headline pairs include the Protocol's
    // world-population series (pipelines/protokoll/.../population.py: NET_PER_DAY = 191_000).
    retired: {
      on: '2026-10-17',
      reason:
        'Its test could not fail. Shuffling the days breaks a correlation between noisy series, but not between two series that each only move one way, so the permutation test reported a false-discovery rate of zero on every night it ran. Most nights the strongest pair included the Protocol’s world population, which is an estimate extrapolated by a fixed number of people a day: a straight line, and every trending series correlates with a straight line. The piece meant to show that a machine cannot tell signal from noise ran a test that never once said noise.',
      archive: { path: 'src/data/pattern/latest.json', kind: 'history' },
    },
  },
  {
    id: 'praemie',
    line: 'ledger',
    title: 'Policy',
    subtitle: {
      de: 'Klimakosten, aus Marktdaten als „Prämie" gerechnet',
      en: 'Climate cost, computed from market data as a “premium”',
    },
    status: 'live',
    since: '2026-06-14',
    live: true,
    href: '/policy',
    description: {
      // "+179% since 1998" was accurate on 2026-08-22 (police.json: 179.3) but it is a single
      // live digit recomputed nightly, sitting in static prose — the defect class this audit
      // found seven times over. Stated as the floor it has already cleared instead.
      de: 'An insurance policy on the present, its premium recomputed each night from real market data. The market has long since priced in the climate catastrophe — and the premium is rising: it has more than doubled since 1998.',
      en: 'An insurance policy on the present, its premium recomputed each night from real market data. The market has long since priced in the climate catastrophe — and the premium is rising: it has more than doubled since 1998.',
    },
  },
  {
    id: 'parallaxe',
    line: 'memory',
    title: 'Iceberg Theory',
    subtitle: {
      de: 'Wie sich Wikipedia-Sprachversionen über umstrittene Themen unterscheiden',
      en: 'How Wikipedia language editions differ on contested topics',
    },
    status: 'live',
    since: '2026-06-14',
    live: true,
    href: '/parallax',
    description: {
      // The Senkaku example went 2026-08-22 (currency audit): it came from the design probe of
      // 2026-06-14 and appears in exactly one of the 45 committed register snapshots — the first.
      // The register rotates one topic a day (rule.cadence), so ANY named instance in static
      // prose is stale within a day by construction; the cadence is the durable sentence.
      de: 'The same contested thing across several Wikipedia language versions — and the measure of which claim each version states and which it conceals. One topic a day, rotating through disputed islands and unrecognised states; the omissions are never symmetrical.',
      en: 'The same contested thing across several Wikipedia language versions — and the measure of which claim each version states and which it conceals. One topic a day, rotating through disputed islands and unrecognised states; the omissions are never symmetrical.',
    },
  },
  {
    id: 'atelier',
    // The practice settled its name on 2026-09-03; until then it carried Ulysses provisionally,
    // and that name went to the nightly line on 2026-08-31. This card is the site's own
    // machine-readable description of the practice (structured-data.ts), so it says Assay.
    title: 'Atelier · Assay',
    subtitle: {
      de: 'Eine maschinen-partizipative Forschungspraxis, die ihre Irrtümer prüfbar katalogisiert',
      en: 'A machine-participatory research practice that catalogues its own errors checkably',
    },
    status: 'live',
    since: '2026-06-29',
    live: true,
    href: '/atelier',
    description: {
      de: 'Assay — eine maschinen-partizipative künstlerische Forschungspraxis — arbeitet in einer Werklinie und ihren Studien statt in einer nächtlichen Produktionsroutine: recherchiert, baut, irrt und katalogisiert ihre Irrtümer prüfbar, innerhalb eines stehenden Mandats. Kuratierte Veröffentlichung bleibt menschliche Entscheidung. Man sieht einer Maschine beim Denken zu.',
      en: 'Assay — a machine-participatory artistic research practice — works through a work-line and its studies rather than a nightly production routine: researching, building, erring, and cataloguing its errors checkably within a standing delegation. Curated publication remains a human decision. Watch a machine think.',
    },
    methodHref: null,
  },
  {
    id: 'ueberflug',
    line: 'watchers',
    title: 'All Along the Watchtower',
    subtitle: {
      de: 'Which Earth-observation satellites have your location in view right now',
      en: 'Which Earth-observation satellites have your location in view right now',
    },
    status: 'live',
    since: '2026-06-12',
    live: true,
    href: '/lab/ueberflug-studie',
    description: {
      de: 'SGP4 orbital propagation in the browser: which catalogued Earth-observation satellites currently have your location geometrically in view. Computed live on daily-committed orbital data (CelesTrak), with owner classification from the GCAT catalogue. Your location never leaves the browser. Since 2026-08-15 the study also measures the change: the launch year inside each international designator turns the same snapshot into a cohort curve of the active fleet, and the newest cohorts are majority-commercial where the older ones were state-civil. The military column stays a floor, never a count — classified satellites are absent from the catalogue, and the page says so.',
      en: 'SGP4 orbital propagation in the browser: which catalogued Earth-observation satellites currently have your location geometrically in view. Computed live on daily-committed orbital data (CelesTrak), with owner classification from the GCAT catalogue. Your location never leaves the browser. Since 2026-08-15 the study also measures the change: the launch year inside each international designator turns the same snapshot into a cohort curve of the active fleet, and the newest cohorts are majority-commercial where the older ones were state-civil. The military column stays a floor, never a count — classified satellites are absent from the catalogue, and the page says so.',
    },
    methodHref: null,
    tier: 'studie',
  },
  {
    id: 'consensus',
    line: 'counter-measurement',
    title: 'Consensus',
    subtitle: {
      de: 'Wie viel „unabhängiger" Nachrichten-Konsens eine Quelle ist, x-fach kopiert',
      en: 'How much “independent” news consensus is one source, copied',
    },
    status: 'live',
    since: '2026-06-22',
    live: true,
    href: '/consensus',
    description: {
      // Last German copy on the shelf, aligned 2026-08-22: nothing renders the `de` half on an
      // EN-only site, and a second wording is a second thing to keep true.
      de: 'From the “Counter-Measurement” line. Each day a machine picks the sentence the most “independent” outlets ran word-for-word, shows source and cascade, and computes how much of the news consensus is echo rather than reporting.',
      en: 'From the “Counter-Measurement” line. Each day a machine picks the sentence the most “independent” outlets ran word-for-word, shows source and cascade, and computes how much of the news consensus is echo rather than reporting.',
    },
    // Back in the experiments row (Frank, 2026-08-05): the committed daily archive and the
    // evidence track ended its 'studie' demotion. (The comment used to name a day count, "the
    // 44-day archive"; it was 63 days by 2026-08-22. Even a comment should not carry a figure
    // that only grows.)
    tier: 'experiment',
  },
  {
    id: 'invoked-past',
    line: 'memory',
    title: 'Invoked Past',
    subtitle: {
      de: 'Welches Gestern die Weltpresse heute zitiert',
      en: 'Which yesterday the world cites today',
    },
    status: 'live',
    since: '2026-08-15',
    live: true,
    href: '/invoked-past',
    description: {
      // Three corrections on 2026-08-22 (currency audit): "some 95,000 news articles" mixed up
      // two fields — articles_scanned swings 54k–116k across the committed days, while 95,356 was
      // that day's raw MENTIONS count; "every dated reference" overstates a method that drops 54%
      // of raw mentions without a resolvable year (the file publishes both numbers); and the
      // extractor's own ceiling (GDELT emits no year ≥ 2015) was nowhere in the entry although it
      // bounds the whole histogram.
      de: 'Each day a machine reads the year-resolved dated references in a full day of GDELT-monitored news — a hundred thousand articles, give or take — and publishes the histogram of invoked years, 1800 to the extractor’s own 2014 ceiling, with the year that breaks the smooth decay of memory and whose press is doing the invoking. GDELT built the field in 2015 for anniversary analysis and never built the instrument.',
      en: 'Each day a machine reads the year-resolved dated references in a full day of GDELT-monitored news — a hundred thousand articles, give or take — and publishes the histogram of invoked years, 1800 to the extractor’s own 2014 ceiling, with the year that breaks the smooth decay of memory and whose press is doing the invoking. GDELT built the field in 2015 for anniversary analysis and never built the instrument.',
    },
    methodHref: '/werke/invoked-past',
    tier: 'experiment',
  },
  {
    id: 'balance',
    line: 'counter-measurement',
    title: 'Balance',
    subtitle: {
      de: 'Selbstbild gegen Fremdbild: die emotionale Handelsbilanz der Weltpresse',
      en: 'Self-image against foreign image: the emotional trade balance of the press',
    },
    status: 'live',
    since: '2026-08-14',
    live: true,
    href: '/balance',
    description: {
      // "For each country" was never true (currency audit, 2026-08-22): a country enters the day
      // only when both its own-press and world-press pools clear method.min_pool = 25 articles,
      // which 40 to 61 of them do. The gate is now in the sentence, where it belongs.
      de: 'From the “Counter-Measurement” line. Daily, for every country whose press clears that day’s article floor: how its own press writes about it — against how the world’s press writes about it. Tone and emotion rates per pool, a bootstrap confidence interval on the gap, an immutable daily archive. It measures portrayal, never population mood.',
      en: 'From the “Counter-Measurement” line. Daily, for every country whose press clears that day’s article floor: how its own press writes about it — against how the world’s press writes about it. Tone and emotion rates per pool, a bootstrap confidence interval on the gap, an immutable daily archive. It measures portrayal, never population mood.',
    },
    methodHref: '/werke/balance',
    tier: 'experiment',
  },
  {
    id: 'correction',
    line: 'counter-measurement',
    title: 'Correction',
    subtitle: {
      de: 'Die Jobzahl war aufgebläht — und wird millionenweise gestrichen',
      en: 'The jobs number was inflated — and is cut by the million',
    },
    status: 'live',
    since: '2026-06-22',
    href: '/correction',
    description: {
      // "every one of the last 24 months downward" has been false since 2026-07-06 (currency
      // audit): src/data/revision/latest.json says 22 of 24, two months (2026-03, 2026-04) were
      // revised UP, and /correction has been rendering the honest 91.7% all along. The headline
      // 1.25 million is confirmed (headline.delta −1246 thousand).
      de: 'From the “Counter-Measurement” line. Not via a model of my own but via the revisions the agency itself makes: US employment is quietly cut downward — June 2025 by 1.25 million jobs, and downward rather than upward in the great majority of the last twenty-four months. The real-time number ran systematically too high.',
      en: 'From the “Counter-Measurement” line. Not via a model of my own but via the revisions the agency itself makes: US employment is quietly cut downward — June 2025 by 1.25 million jobs, and downward rather than upward in the great majority of the last twenty-four months. The real-time number ran systematically too high.',
    },
    tier: 'studie',
  },
  {
    id: 'ghost-fleet',
    line: 'counter-measurement',
    title: 'Ghost Fleet',
    subtitle: {
      de: 'Schiffe, die ihren Transponder bewusst abschalten, um zu verschwinden',
      en: 'Ships that switch off their transponder on purpose to vanish',
    },
    status: 'retired',
    since: '2026-06-26',
    href: '/ghost-fleet',
    description: {
      // Two overstatements corrected 2026-08-22 (currency audit): the daily pick is not always a
      // "named vessel" — 4 of the last 13 committed days picked an unflagged gear tag, the newest
      // among them, and with flag "—" nothing can be called foreign; and regions.eez_name is an
      // exclusive economic zone, which is not national or territorial waters. The method sheet
      // had this right ("national EEZs") while the register and the page did not.
      // A third on 2026-10-17, with the retirement: "went dark inside another state's EEZ" was
      // never what the record said. The source names the zone at the gap's midpoint, not where
      // the transponder went off, and the last pick sailed under the flag of the zone it was in.
      de: 'From the “Counter-Measurement” line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each night a machine counted the radio silence Global Fishing Watch flags as deliberate and surfaced the longest case, ranked to put protected waters first — a vessel, sometimes only an unflagged gear tag, dark for weeks. No claim of illegality, only the counted invisibility. Retired on 2026-10-17.',
      en: 'From the “Counter-Measurement” line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each night a machine counted the radio silence Global Fishing Watch flags as deliberate and surfaced the longest case, ranked to put protected waters first — a vessel, sometimes only an unflagged gear tag, dark for weeks. No claim of illegality, only the counted invisibility. Retired on 2026-10-17.',
    },
    tier: 'studie',
    // Checked before deciding, because a parser bug would have been a fix and not a retirement: a
    // temporary workflow on 2026-10-17 asked the GFW Events API the pipeline's own question and
    // printed the shape of what came back. Of 1,500 gap events, every `regions` object carried
    // the keys and `highSeas`, `mpa`, `mpaNoTake`, `mpaNoTakePartial` and `eez12Nm` were empty
    // lists in all 1,500 — including the 1,064 events with no EEZ, which by definition lie on the
    // high seas. The parser read the right keys; the source leaves them empty. The event's
    // `position`, where the regions are evaluated, is the great-circle midpoint of
    // gap.offPosition and gap.onPosition (checked on four events to three decimals). And the
    // duplicate ids of issue #731 come from the API itself: seven ids repeated, each inside a
    // single page.
    retired: {
      on: '2026-10-17',
      reason:
        'The source never said where the vessels hid. Checked against a live response on the day of the decision, Global Fishing Watch sends empty lists for the high seas and for every protected-area field on these events, so the counters for both stood at zero on every night: an absence, not a finding, and the protected waters the ranking put first were never there to rank. The one region the source does name, the exclusive economic zone, is named at the midpoint of the line between where a transponder went off and where it came back on, a point the vessel need not have passed. Without the protected-area join, the instrument retold Global Fishing Watch’s own record.',
      archive: { path: 'src/data/ghost-fleet', kind: 'dated' },
    },
  },
]
/** Chronologie-Komparator: newest first nach `since`. Gleichstand → 0, sodass die stabile
 *  Array-Sortierung die redaktionelle Reihenfolge aus `WERKE` erhält. */
export function byRecency(a: Werk, b: Werk): number {
  return a.since < b.since ? 1 : a.since > b.since ? -1 : 0
}

/** Titel je Locale auflösen — sprachneutrale Titel (String) unverändert, zweisprachige nach Locale. */
export function werkTitle(w: Werk, locale: Locale): string {
  return typeof w.title === 'string' ? w.title : w.title[locale]
}

/** Öffentliche Reihenfolge der Experimente: chronologisch, jüngstes zuerst.
 *  Startseite und Lab rendern hierüber — keine Sonderstellung für The Protocol. */
export const WERKE_CHRONO: Werk[] = [...WERKE].sort(byRecency)

/** Kuratierte Experimente-Reihe vs. Studien außer der Reihe — beide chronologisch.
 *  Seit 2026-08-09 ist „alles außer Studie" nicht mehr dasselbe wie „Experiment":
 *  eine Praxis (Machine Attention) und ein Instrument (das Observatorium) stehen im
 *  Register, sind aber keine Experimente des Labors. Der Filter nennt darum, was er
 *  einschließt, statt was er ausschließt — sonst wandert der nächste neue Rang still
 *  in die Experimente-Reihe der Startseite. */
export const WERKE_EXPERIMENTE: Werk[] = WERKE_CHRONO.filter(
  (w) => w.tier === undefined || w.tier === 'experiment',
)
export const WERKE_STUDIEN: Werk[] = WERKE_CHRONO.filter((w) => w.tier === 'studie')
export const WERKE_PROJECTS: Werk[] = WERKE_CHRONO.filter((w) => w.tier === 'project')
export const WERKE_INSTRUMENTS: Werk[] = WERKE_CHRONO.filter((w) => w.tier === 'instrument')

/** Ids that must never surface on /experiments even though they sit in WERKE_CHRONO: the three
 *  practice doors (their own homes under /atelier, /field, /studio) and current MRR artefacts
 *  ('on-record', since 2026-07-23) — /experiments lists the lab's EARLIER experiments, not the
 *  ecology's running practices or the architect's current engineering line (CLAUDE.md). */
export const HOLDINGS_EXCLUDED_IDS: ReadonlySet<string> = new Set([
  'field',
  'studio',
  'atelier',
  'on-record',
  // Machine Attention and its instrument (Frank, 2026-08-09): a project is not a peer of a
  // single piece. Listing it beside The Protocol compared a whole undertaking with one of its
  // parts. It has its own page at /machine-attention, which carries its experiments; the
  // observatory is an instrument of that project, not an experiment of the lab.
  'attention',
  'observatory',
  // Admissions (2026-08-27): an instrument of the counter-measurement line, and the register
  // already separates the two — `tier: 'instrument'` puts it in WERKE_INSTRUMENTS, while
  // /experiments stays what it says it is, a shelf of experiments grouped by research line.
  // Registered so it is findable, excluded so it is not miscalled an experiment.
  'admissions',
])

/** Order for /experiments (Frank, 2026-08-14): NEWEST FIRST — a new werk enters at the top.
 *  This dissolves the curated strength ranking of 2026-08-05 (Frank's instruction, wording
 *  private: new works on top, the curated order dissolved); recorded in
 *  docs/decision-log.md, 2026-08-14 row. The list is DERIVED from WERKE_CHRONO (its own
 *  recency rules incl. Überflug pinned last), so it can never go stale — no manual insert,
 *  no forgotten entry. */
export const HOLDINGS_RANKED: readonly string[] = WERKE_CHRONO.filter(
  (w) => !HOLDINGS_EXCLUDED_IDS.has(w.id),
).map((w) => w.id)

/** What /experiments actually renders: recency order, excluded ids validated loudly. */
export const WERKE_HOLDINGS: Werk[] = HOLDINGS_RANKED.map((id) => {
  const w = WERKE.find((x) => x.id === id)
  if (!w) throw new Error(`holdings ranking names unknown werk "${id}"`)
  if (HOLDINGS_EXCLUDED_IDS.has(id)) throw new Error(`holdings ranking lists excluded werk "${id}"`)
  return w
})
for (const w of WERKE) {
  if (!HOLDINGS_EXCLUDED_IDS.has(w.id) && !HOLDINGS_RANKED.includes(w.id)) {
    throw new Error(`werk "${w.id}" is neither ranked for /experiments nor excluded`)
  }
}

export interface ExperimentGroup {
  line: ExperimentLine
  werke: Werk[]
}

/** /experiments by research line (Frank, 2026-08-22 — the shelf had no categories at all,
 *  while nine of its entries already named their line in their own description).
 *
 *  DERIVED from WERKE_HOLDINGS, never listed by hand: recency order (2026-08-14) therefore
 *  survives inside every group, a new werk appears the moment it names a line, and the ranking
 *  cannot go stale. A line with no entries drops out rather than printing a heading over
 *  nothing — an empty category claims a line the lab is not running.
 *
 *  A retired werk (2026-10-17) keeps its line — it was that line's work, and the graph and the
 *  audit still file it there — but it is not grouped under it: a heading over an instrument that
 *  stopped would claim the line is still running it. It stands on the shelf of its own below. */
export const WERKE_BY_LINE: readonly ExperimentGroup[] = EXPERIMENT_LINES.map((line) => ({
  line,
  werke: WERKE_HOLDINGS.filter((w) => w.line === line.id && !w.retired),
})).filter((g) => g.werke.length > 0)

/** The retired works on /experiments, newest first like every other group — derived from the
 *  same list, so a werk moves here the moment it carries `retired` and nowhere else changes. */
export const WERKE_RETIRED: readonly Werk[] = WERKE_HOLDINGS.filter((w) => w.retired)

/** `status` and `retired` say the same thing twice, so they must agree, and a retired work has
 *  no daily data to mark as live. Checked at import, like the shelf rules above, so a half-done
 *  retirement fails the build rather than the reader. */
for (const w of WERKE) {
  if ((w.status === 'retired') !== Boolean(w.retired)) {
    throw new Error(`werk "${w.id}": status '${w.status}' and the retired record disagree`)
  }
  if (w.retired && w.live) throw new Error(`werk "${w.id}" is retired and still marked live`)
}

/** Every entry the shelf renders belongs to a line — otherwise it would silently vanish from a
 *  page that now shows nothing but groups. The mirror rule (an excluded werk carries no line)
 *  is enforced in werke.test.ts, where it can fail with a readable name. */
for (const w of WERKE_HOLDINGS) {
  if (!w.line) {
    throw new Error(`werk "${w.id}" renders on /experiments but names no research line`)
  }
}

// Überflug wurde am 2026-06-12 aus der Reihe der Experimente genommen (keine These,
// keine Akkumulation) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

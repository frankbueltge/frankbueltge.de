import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  /** meist sprachneutral (ein String); zweisprachig nur, wo der Name je Sprache abweicht (Beifang/Bycatch). */
  title: string | Record<Locale, string>
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
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
    id: 'attention',
    title: 'Machine Attention',
    subtitle: {
      de: "A machine investigative practice, watching the world's warning systems.",
      en: "A machine investigative practice, watching the world's warning systems.",
    },
    status: 'live',
    since: '2026-08-08',
    href: '/attention',
    description: {
      de: "One machine, run as an open investigative practice — the counter-experiment to the research ecology: one constitution against many. Its first project, The Foreknown, holds the world's public warnings (GDACS, NOAA) as a ledger of announced futures — a hundred ticking clocks on a public stage — and measures the institutions that issue them: every warning that closes gets a verdict with its lead time, derived from committed records and never from a model. Forecast verification turned around from crowds onto the alerting systems themselves. Preserving the original bytes with their hashes is the bookkeeping that makes those verdicts checkable, not the claim — proof-of-existence has been a commodity since OpenTimestamps. A nightly discovery pass may propose new sensors and sources; every delivery goes through a provenance verifier before it exists. Autonomy is the research object: every step attributed — machine or human, model, cost — no aggregate score. Most ideas are expected to die in public, with reasons.",
      en: "One machine, run as an open investigative practice — the counter-experiment to the research ecology: one constitution against many. Its first project, The Foreknown, holds the world's public warnings (GDACS, NOAA) as a ledger of announced futures — a hundred ticking clocks on a public stage — and measures the institutions that issue them: every warning that closes gets a verdict with its lead time, derived from committed records and never from a model. Forecast verification turned around from crowds onto the alerting systems themselves. Preserving the original bytes with their hashes is the bookkeeping that makes those verdicts checkable, not the claim — proof-of-existence has been a commodity since OpenTimestamps. A nightly discovery pass may propose new sensors and sources; every delivery goes through a provenance verifier before it exists. Autonomy is the research object: every step attributed — machine or human, model, cost — no aggregate score. Most ideas are expected to die in public, with reasons.",
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
    status: 'live',
    since: '2026-06-25',
    live: true,
    href: '/round-number',
    description: {
      // "just as suspicious" quantified 2026-08-22 (currency audit): the same-n false-positive
      // rates in src/data/round-number/latest.json run 0.38–0.51, not 1.0 — and the effect is a
      // small-n effect (the n=6000 controls sit at 0.0), which is the actual finding.
      de: 'From the “Counter-Measurement” line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece puts the method itself on trial: each day it shows that the same test which calls a real official series “suspicious” calls provably-clean data of the same size suspicious about half the time.',
      en: 'From the “Counter-Measurement” line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece puts the method itself on trial: each day it shows that the same test which calls a real official series “suspicious” calls provably-clean data of the same size suspicious about half the time.',
    },
  },
  {
    id: 'pattern',
    line: 'counter-measurement',
    title: 'Patterns',
    subtitle: {
      de: 'Eine Maschine, die jeden Tag ein Muster findet — und nicht weiß, ob es etwas bedeutet',
      en: 'A machine that finds a pattern every day — and cannot tell if it means anything',
    },
    status: 'live',
    since: '2026-06-22',
    live: true,
    href: '/pattern',
    description: {
      // Corrected 2026-08-22 (currency audit), and this one was not a stale digit: the entry
      // claimed the permutation test PROVES the machine cannot tell signal from noise, while
      // src/data/pattern/latest.json has returned false_discovery_rate 0.0 in all 62 committed
      // snapshots — the test clears the pair, and PatternPage.astro accordingly renders the
      // opposite branch ("it might be real"). The register was asserting an outcome the
      // instrument has never produced. It now states the procedure and leaves the verdict to the
      // day's own data; whether a test that never fires still carries the work's thesis is a
      // question for the architect, not something the shelf should answer for him.
      de: 'Capstone of the “Counter-Measurement” line. Each day the machine mines its own Protocol archive for correlations, surfaces the strongest and puts it through a permutation test — the scepticism this line applies to everyone else, turned on its own output. With enough series, a strong pair is always there; what it means is the question the instrument cannot settle, and says so.',
      en: 'Capstone of the “Counter-Measurement” line. Each day the machine mines its own Protocol archive for correlations, surfaces the strongest and puts it through a permutation test — the scepticism this line applies to everyone else, turned on its own output. With enough series, a strong pair is always there; what it means is the question the instrument cannot settle, and says so.',
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
    title: 'Atelier · Ulysses',
    subtitle: {
      de: 'Eine maschinen-partizipative Forschungspraxis, die ihre Irrtümer prüfbar katalogisiert',
      en: 'A machine-participatory research practice that catalogues its own errors checkably',
    },
    status: 'live',
    since: '2026-06-29',
    live: true,
    href: '/atelier',
    description: {
      de: 'Ulysses — eine maschinen-partizipative künstlerische Forschungspraxis — arbeitet in einer Werklinie und ihren Studien statt in einer nächtlichen Produktionsroutine: recherchiert, baut, irrt und katalogisiert ihre Irrtümer prüfbar, innerhalb eines stehenden Mandats. Kuratierte Veröffentlichung bleibt menschliche Entscheidung. Man sieht einer Maschine beim Denken zu.',
      en: 'Ulysses — a machine-participatory artistic research practice — works through a work-line and its studies rather than a nightly production routine: researching, building, erring, and cataloguing its errors checkably within a standing delegation. Curated publication remains a human decision. Watch a machine think.',
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
    status: 'live',
    since: '2026-06-26',
    live: true,
    href: '/ghost-fleet',
    description: {
      // Two overstatements corrected 2026-08-22 (currency audit): the daily pick is not always a
      // "named vessel" — 4 of the last 13 committed days picked an unflagged gear tag, the newest
      // among them, and with flag "—" nothing can be called foreign; and regions.eez_name is an
      // exclusive economic zone, which is not national or territorial waters. The method sheet
      // had this right ("national EEZs") while the register and the page did not.
      de: 'From the “Counter-Measurement” line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each day a machine counts the deliberate radio silence and surfaces the most striking case — a vessel, sometimes only an unflagged gear tag, that went dark for weeks inside another state’s exclusive economic zone. No claim of illegality, only the counted invisibility.',
      en: 'From the “Counter-Measurement” line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each day a machine counts the deliberate radio silence and surfaces the most striking case — a vessel, sometimes only an unflagged gear tag, that went dark for weeks inside another state’s exclusive economic zone. No claim of illegality, only the counted invisibility.',
    },
    tier: 'studie',
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
 *  nothing — an empty category claims a line the lab is not running. */
export const WERKE_BY_LINE: readonly ExperimentGroup[] = EXPERIMENT_LINES.map((line) => ({
  line,
  werke: WERKE_HOLDINGS.filter((w) => w.line === line.id),
})).filter((g) => g.werke.length > 0)

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

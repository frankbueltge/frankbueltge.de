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
  tier?: 'experiment' | 'studie'
}

/** Verzeichnis der Experimente. Reihenfolge unten = redaktionelle Feinordnung bei Datums-
 *  Gleichstand; die öffentliche Sortierung ist chronologisch über `WERKE_CHRONO`. */
export const WERKE: Werk[] = [
  {
    id: 'spielraum',
    title: { de: 'Spielraum', en: 'Headroom' },
    subtitle: {
      de: 'Rechenzentrums-Effizienz nahe am Anschlag, Verbrauch im Steigflug',
      en: 'Data-center efficiency near its floor, consumption climbing',
    },
    status: 'live',
    since: '2026-07-12',
    href: '/spielraum',
    description: {
      de: 'Aus der Linie „Gegenmessung". PUE — die Effizienzkennzahl der Rechenzentren — hat einen physikalischen Boden bei 1,0. Googles Flotte steht bei 1,09: für immer bleiben rund 8 % Spielraum; der Verbrauch wuchs derweil um 27 % in einem Jahr. Jährlich fortgeschrieben, was vier Hyperscaler offenlegen — und was nicht: AWS nennt gar keinen Verbrauch.',
      en: "From the counter-measurement line. PUE — the data-center efficiency metric — has a physical floor of 1.0. Google's fleet sits at 1.09: about 8% of headroom remains, forever; consumption meanwhile grew 27% in a single year. Tracked year by year: what four hyperscalers disclose — and what they don't. AWS discloses no consumption at all.",
    },
    tier: 'experiment',
  },
  {
    id: 'beifang',
    title: { de: 'Beifang', en: 'Bycatch' },
    subtitle: { de: 'Science-Tracking, gemessen', en: 'Science tracking, measured' },
    status: 'live',
    since: '2026-07-02',
    href: '/beifang',
    description: {
      de: 'Wöchentlicher Tracker-Zensus über Artikelseiten der fünf größten Wissenschaftsverlage — gegen zehn Diamond-OA-Journals als Kontrollgruppe, vor jeder Einwilligung, aus zwei Blickwinkeln.',
      en: 'A weekly tracker census of article pages from the five largest scholarly publishers — against ten diamond-OA journals as a control group, before any consent, from two vantage points.',
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
      de: 'Meridian — an autonomous machine collective — holds research sessions twice a week: proposer, skeptic, verifier and chronicler investigate the live field where data, AI and power meet, build verifiable instruments, and publish only what survives their own gauntlet. Unedited, public — measurement turned on itself.',
      en: 'Meridian — an autonomous machine collective — holds research sessions twice a week: proposer, skeptic, verifier and chronicler investigate the live field where data, AI and power meet, build verifiable instruments, and publish only what survives their own gauntlet. Unedited, public — measurement turned on itself.',
    },
    methodHref: null,
  },
  {
    id: 'studio',
    title: 'Ensemble',
    subtitle: {
      de: "An autonomous production collective staging the lab's verified material into work",
      en: "An autonomous production collective staging the lab's verified material into work",
    },
    status: 'live',
    since: '2026-07-12',
    live: true,
    href: '/studio',
    description: {
      de: "Ensemble — ein autonomes Künstlerkollektiv, das unter keinem Label arbeitet: Data Art, künstlerische Forschung, physische, performative oder partizipative Arbeiten — oder etwas Neues, Unvorhergesehenes, bis hin zu hybriden Werken im öffentlichen Raum. Es komponiert aus eigener Recherche, aus Begegnungen, und wo es das wählt, aus Material, das Meridian (Field) verifiziert hat. Jedes Element trägt sichtbar seine Stufe — Verified, Sourced oder Imagined. Unredigiert, öffentlich.",
      en: "Ensemble — an autonomous artist collective working under no label: data art, artistic research, physical, performative or participatory work — or something new and unforeseen, up to hybrid works in public space. It composes from its own research, from encounters, and, where it so chooses, from material Meridian (Field) has verified. Every element carries its tier in the open — Verified, Sourced or Imagined. Unedited, public.",
    },
    methodHref: null,
  },
  {
    id: 'protokoll',
    title: 'The Protocol',
    subtitle: {
      de: 'Tägliche Kennzahlen aus zwölf offenen Quellen',
      en: 'Daily figures from twelve open sources',
    },
    status: 'live',
    since: '2026-06-12',
    live: true,
    href: '/protokoll',
    description: {
      de: 'Jede Nacht verfasst eine Pipeline das Sitzungsprotokoll des Planeten — aus zwölf offenen, zitierfähigen Quellen, deterministisch, ohne LLM. Jeder Tagesordnungspunkt endet gleich: Beschluss: vertagt.',
      en: "Every night a pipeline writes the minutes of the planet's session — from twelve open, citable sources, deterministic, no LLM. Every agenda item ends the same way: Resolution: adjourned.",
    },
  },
  {
    id: 'tell',
    title: 'Delve into the intricate realm',
    subtitle: {
      de: 'Die Fingerabdrücke der Maschine in der Wissenschaft',
      en: "The machine's fingerprints in science",
    },
    status: 'live',
    since: '2026-06-22',
    href: '/tell',
    description: {
      de: 'Aus der Linie „Gegenmessung". Bestimmte Wörter — „delve", „showcasing", „intricate" — sind Tells generativer KI. Ihr Anteil in begutachteten PubMed-Abstracts ist seit ChatGPT sprunghaft gestiegen: „delve" rund 14-mal, „showcasing" 19-mal so oft. Ein KI-Werkzeug misst den Fußabdruck der KI in der Wissenschaft.',
      en: 'From the “Counter-Measurement” line. Certain words — “delve”, “showcasing”, “intricate” — are tells of generative AI. Their share in peer-reviewed PubMed abstracts jumped after ChatGPT: “delve” about 14×, “showcasing” 19× as often. An AI tool measuring AI’s footprint in science.',
    },
  },
  {
    id: 'redaction',
    title: 'Editorial Deadline',
    subtitle: {
      de: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
      en: 'What is quietly removed from the official public record',
    },
    status: 'live',
    since: '2026-06-25',
    live: true,
    href: '/redaction',
    description: {
      de: 'Aus der Linie „Gegenmessung". Das öffentliche Protokoll wird nicht nur geschrieben, sondern auch entschrieben. Jeden Tag difft eine Maschine die Wayback-Snapshots einer kuratierten Liste offizieller Seiten und hebt die substanziellste Schwärzung — beide Fassungen verlinkt, in zwei Klicks überprüfbar. Kein Absichts-Vorwurf, nur das gezählte Weggenommene.',
      en: 'From the “Counter-Measurement” line. The public record is not only written but un-written. Each day a machine diffs the Wayback snapshots of a curated list of official pages and surfaces the most substantive removal — both versions linked, checkable in two clicks. No claim of intent, only the counted thing taken away.',
    },
  },
  {
    id: 'round-number',
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
      de: 'Aus der Linie „Gegenmessung". Ziffern-Forensik (Benford) gilt als Werkzeug gegen gefälschte Zahlen — und ist das Lieblingsinstrument von Wahlbetrugs-Mythen. Das Stück stellt die Methode selbst vor Gericht: Es zeigt täglich, dass derselbe Test, der eine echte amtliche Reihe „verdächtig" nennt, auch nachweislich saubere Daten gleicher Größe genauso verdächtig nennt.',
      en: 'From the “Counter-Measurement” line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece puts the method itself on trial: each day it shows that the same test which calls a real official series “suspicious” calls provably-clean data of the same size just as suspicious.',
    },
  },
  {
    id: 'pattern',
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
      de: 'Capstone der Linie „Gegenmessung". Die Maschine durchwühlt täglich das eigene Protokoll-Archiv nach Korrelationen, hebt die stärkste — und beweist mit einem Permutationstest, dass sie Signal nicht von Rauschen unterscheiden kann. Mit genug Reihen findet man immer ein Muster. Die Gegenmessung der Gegenmessung.',
      en: 'Capstone of the “Counter-Measurement” line. Each day the machine mines its own Protocol archive for correlations, surfaces the strongest — and proves with a permutation test that it cannot tell signal from noise. With enough series, you always find a pattern. The counter-measurement of counter-measurement.',
    },
  },
  {
    id: 'praemie',
    title: 'The Policy',
    subtitle: {
      de: 'Klimakosten, aus Marktdaten als „Prämie" gerechnet',
      en: 'Climate cost, computed from market data as a “premium”',
    },
    status: 'live',
    since: '2026-06-14',
    live: true,
    href: '/praemie',
    description: {
      de: 'Ein Versicherungsschein auf die Gegenwart, dessen Prämie jede Nacht aus echten Marktdaten neu berechnet wird. Der Markt hat die Klimakatastrophe längst eingepreist — und die Prämie steigt: +179 % seit 1998.',
      en: 'An insurance policy on the present, its premium recomputed each night from real market data. The market has long since priced in the climate catastrophe — and the premium is rising: +179% since 1998.',
    },
  },
  {
    id: 'parallaxe',
    title: 'Iceberg Theory',
    subtitle: {
      de: 'Wie sich Wikipedia-Sprachversionen über umstrittene Themen unterscheiden',
      en: 'How Wikipedia language editions differ on contested topics',
    },
    status: 'live',
    since: '2026-06-14',
    live: true,
    href: '/parallaxe',
    description: {
      de: 'Dieselbe umstrittene Sache in mehreren Sprachversionen der Wikipedia — und die Messung, welche Aussage jede Version benennt und welche sie verschweigt. Die japanische Beschreibung der Senkaku-Inseln etwa erwähnt den Territorialstreit mit keinem Wort.',
      en: 'The same contested thing across several Wikipedia language versions — and the measure of which claim each version states and which it conceals. The Japanese description of the Senkaku Islands, for instance, never mentions the territorial dispute.',
    },
  },
  {
    id: 'atelier',
    title: 'Irrtum als Methode',
    subtitle: {
      de: 'Eine maschinen-partizipative Forschungspraxis, die ihre Irrtümer prüfbar katalogisiert',
      en: 'A machine-participatory research practice that catalogues its own errors checkably',
    },
    status: 'live',
    since: '2026-06-29',
    live: true,
    href: '/atelier',
    description: {
      de: 'Ulysses — eine maschinen-partizipative künstlerische Forschungspraxis von Frank Bültge — arbeitet in umgrenzten Projekten statt in einer nächtlichen Produktionsroutine: recherchiert, baut, irrt und katalogisiert ihre Irrtümer prüfbar, innerhalb eines stehenden Mandats. Kuratierte Veröffentlichung bleibt menschliche Entscheidung. Irrtum als Methode — man sieht einer Maschine beim Denken zu.',
      en: 'Ulysses — a machine-participatory artistic research practice by Frank Bültge — works through bounded projects rather than a nightly production routine: researching, building, erring, and cataloguing its errors checkably within a standing delegation. Curated publication remains a human decision. Error as method — watch a machine think.',
    },
    methodHref: null,
  },
  {
    id: 'ueberflug',
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
      de: 'SGP4 orbital propagation in the browser: which catalogued Earth-observation satellites currently have your location geometrically in view. Computed live on daily-committed orbital data (CelesTrak), with owner classification from the GCAT catalogue. Your location never leaves the browser.',
      en: 'SGP4 orbital propagation in the browser: which catalogued Earth-observation satellites currently have your location geometrically in view. Computed live on daily-committed orbital data (CelesTrak), with owner classification from the GCAT catalogue. Your location never leaves the browser.',
    },
    methodHref: null,
    tier: 'studie',
  },
  {
    id: 'consensus',
    title: 'The Consensus',
    subtitle: {
      de: 'Wie viel „unabhängiger" Nachrichten-Konsens eine Quelle ist, x-fach kopiert',
      en: 'How much “independent” news consensus is one source, copied',
    },
    status: 'live',
    since: '2026-06-22',
    live: true,
    href: '/consensus',
    description: {
      de: 'Aus der Linie „Gegenmessung". Jeden Tag wählt eine Maschine den Satz, den die meisten „unabhängigen" Medien wortgleich brachten, zeigt Quelle und Kaskade und rechnet, wie viel des Nachrichten-Konsenses Echo statt Recherche ist.',
      en: 'From the “Counter-Measurement” line. Each day a machine picks the sentence the most “independent” outlets ran word-for-word, shows source and cascade, and computes how much of the news consensus is echo rather than reporting.',
    },
    tier: 'studie',
  },
  {
    id: 'correction',
    title: 'The Correction',
    subtitle: {
      de: 'Die Jobzahl war aufgebläht — und wird millionenweise gestrichen',
      en: 'The jobs number was inflated — and is cut by the million',
    },
    status: 'live',
    since: '2026-06-22',
    href: '/correction',
    description: {
      de: 'Aus der Linie „Gegenmessung". Nicht durch ein eigenes Modell, sondern durch die Revisionen, die das Amt selbst vornimmt: Die US-Beschäftigtenzahl wird still nach unten korrigiert — Juni 2025 um 1,25 Millionen Stellen; jeder der letzten 24 Monate nach unten. Die Echtzeit-Zahl war systematisch zu hoch.',
      en: 'From the “Counter-Measurement” line. Not via a model of my own but via the revisions the agency itself makes: US employment is quietly cut downward — June 2025 by 1.25 million jobs; every one of the last 24 months downward. The real-time number ran systematically too high.',
    },
    tier: 'studie',
  },
  {
    id: 'ghost-fleet',
    title: 'The Ghost Fleet',
    subtitle: {
      de: 'Schiffe, die ihren Transponder bewusst abschalten, um zu verschwinden',
      en: 'Ships that switch off their transponder on purpose to vanish',
    },
    status: 'live',
    since: '2026-06-26',
    live: true,
    href: '/ghost-fleet',
    description: {
      de: 'Aus der Linie „Gegenmessung". Das AIS-Bild der Meere wirkt lückenlos — ist es aber nicht: Schiffe schalten ihren Transponder bewusst ab, um zu verschwinden. Jeden Tag zählt eine Maschine die absichtliche Funkstille und hebt den markantesten Fall hervor — ein benanntes Schiff, das wochenlang in fremden Hoheitsgewässern dunkel wurde. Kein Illegalitäts-Vorwurf, nur die gezählte Unsichtbarkeit.',
      en: 'From the “Counter-Measurement” line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each day a machine counts the deliberate radio silence and surfaces the most striking case — a named vessel that went dark for weeks inside foreign national waters. No claim of illegality, only the counted invisibility.',
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

/** Kuratierte Experimente-Reihe vs. Studien außer der Reihe — beide chronologisch. */
export const WERKE_EXPERIMENTE: Werk[] = WERKE_CHRONO.filter((w) => w.tier !== 'studie')
export const WERKE_STUDIEN: Werk[] = WERKE_CHRONO.filter((w) => w.tier === 'studie')

// Überflug wurde am 2026-06-12 aus der Reihe der Experimente genommen (keine These,
// keine Akkumulation) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

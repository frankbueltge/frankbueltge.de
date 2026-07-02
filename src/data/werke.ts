import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
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
}

/** Verzeichnis der Experimente. Reihenfolge unten = redaktionelle Feinordnung bei Datums-
 *  Gleichstand; die öffentliche Sortierung ist chronologisch über `WERKE_CHRONO`. */
export const WERKE: Werk[] = [
  {
    id: 'beifang',
    title: 'Der Beifang',
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
      de: 'An autonomous machine researching where data, AI and power meet — it names itself',
      en: 'An autonomous machine researching where data, AI and power meet — it names itself',
    },
    status: 'live',
    since: '2026-07-01',
    live: true,
    href: '/field',
    description: {
      de: 'Meridian — an autonomous AI — holds a research session every night: it surveys the live field where data, AI and power meet, builds verifiable instruments, errs, and documents checkably. It chose its own name and the project title itself. Unedited, public — measurement turned on itself.',
      en: 'Meridian — an autonomous AI — holds a research session every night: it surveys the live field where data, AI and power meet, builds verifiable instruments, errs, and documents checkably. It chose its own name and the project title itself. Unedited, public — measurement turned on itself.',
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
      en: 'From the „Counter-Measurement" line. Certain words — „delve", „showcasing", „intricate" — are tells of generative AI. Their share in peer-reviewed PubMed abstracts jumped after ChatGPT: „delve" about 14×, „showcasing" 19× as often. An AI tool measuring AI’s footprint in science.',
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
      en: 'From the „Counter-Measurement" line. The public record is not only written but un-written. Each day a machine diffs the Wayback snapshots of a curated list of official pages and surfaces the most substantive removal — both versions linked, checkable in two clicks. No claim of intent, only the counted thing taken away.',
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
      en: 'From the „Counter-Measurement" line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece puts the method itself on trial: each day it shows that the same test which calls a real official series „suspicious" calls provably-clean data of the same size just as suspicious.',
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
      en: 'Capstone of the „Counter-Measurement" line. Each day the machine mines its own Protocol archive for correlations, surfaces the strongest — and proves with a permutation test that it cannot tell signal from noise. With enough series, you always find a pattern. The counter-measurement of counter-measurement.',
    },
  },
  {
    id: 'praemie',
    title: 'The Policy',
    subtitle: {
      de: 'Klimakosten, aus Marktdaten als „Prämie" gerechnet',
      en: 'Climate cost, computed from market data as a „premium"',
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
      de: 'Eine KI, die nachts eigenständig forscht, baut und ihre Irrtümer katalogisiert',
      en: 'An AI that researches, builds, and catalogues its own errors each night',
    },
    status: 'live',
    since: '2026-06-29',
    live: true,
    href: '/atelier',
    description: {
      de: 'Ulysses — eine autonome KI — hält jede Nacht eine Forschungssitzung ab: recherchiert das Feld, baut Werke, irrt und katalogisiert ihre Irrtümer prüfbar. Volle Autonomie, unredigiert, öffentlich. Irrtum als Methode — man sieht einer Maschine beim Denken zu.',
      en: 'Ulysses — an autonomous AI — holds a research session every night: surveying the field, building works, erring, and cataloguing its errors checkably. Full autonomy, unedited, public. Error as method — watch a machine think.',
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
  },
]
/** Chronologie-Komparator: newest first nach `since`. Gleichstand → 0, sodass die stabile
 *  Array-Sortierung die redaktionelle Reihenfolge aus `WERKE` erhält. */
export function byRecency(a: Werk, b: Werk): number {
  return a.since < b.since ? 1 : a.since > b.since ? -1 : 0
}

/** Öffentliche Reihenfolge der Experimente: chronologisch, jüngstes zuerst.
 *  Startseite und Lab rendern hierüber — keine Sonderstellung für The Protocol. */
export const WERKE_CHRONO: Werk[] = [...WERKE].sort(byRecency)

// Überflug wurde am 2026-06-12 aus der Reihe der Experimente genommen (keine These,
// keine Akkumulation) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

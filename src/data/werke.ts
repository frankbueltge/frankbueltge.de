import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
  href: string
  description: Record<Locale, string>
}

/** Verzeichnis der Experimente. Flaggschiff (Protokoll) zuerst, danach nach Wow-Effekt. */
export const WERKE: Werk[] = [
  {
    id: 'protokoll',
    title: 'The Protocol',
    subtitle: {
      de: 'Tägliche Kennzahlen aus zwölf offenen Quellen',
      en: 'Daily figures from twelve open sources',
    },
    status: 'live',
    href: '/protokoll',
    description: {
      de: 'Jede Nacht verfasst eine Pipeline das Sitzungsprotokoll des Planeten — aus zwölf offenen, zitierfähigen Quellen, deterministisch, ohne LLM. Jeder Tagesordnungspunkt endet gleich: Beschluss: vertagt.',
      en: "Every night a pipeline writes the minutes of the planet's session — from twelve open, citable sources, deterministic, no LLM. Every agenda item ends the same way: Resolution: adjourned.",
    },
  },
  {
    id: 'correction',
    title: 'The Correction',
    subtitle: {
      de: 'Die Jobzahl war aufgebläht — und wird millionenweise gestrichen',
      en: 'The jobs number was inflated — and is cut by the million',
    },
    status: 'live',
    href: '/correction',
    description: {
      de: 'Aus der Linie „Gegenmessung". Nicht durch ein eigenes Modell, sondern durch die Revisionen, die das Amt selbst vornimmt: Die US-Beschäftigtenzahl wird still nach unten korrigiert — Juni 2025 um 1,25 Millionen Stellen; jeder der letzten 24 Monate nach unten. Die Echtzeit-Zahl war systematisch zu hoch.',
      en: 'From the „Counter-Measurement" line. Not via a model of my own but via the revisions the agency itself makes: US employment is quietly cut downward — June 2025 by 1.25 million jobs; every one of the last 24 months downward. The real-time number ran systematically too high.',
    },
  },
  {
    id: 'consensus',
    title: 'The Consensus',
    subtitle: {
      de: 'Wie viel „unabhängiger" Nachrichten-Konsens eine Quelle ist, x-fach kopiert',
      en: 'How much „independent" news consensus is one source, copied',
    },
    status: 'live',
    href: '/consensus',
    description: {
      de: 'Aus der Linie „Gegenmessung". Jeden Tag wählt eine Maschine den Satz, den die meisten „unabhängigen" Medien wortgleich brachten, zeigt Quelle und Kaskade und rechnet, wie viel des Nachrichten-Konsenses Echo statt Recherche ist.',
      en: 'From the „Counter-Measurement" line. Each day a machine picks the sentence the most „independent" outlets ran word-for-word, shows source and cascade, and computes how much of the news consensus is echo rather than reporting.',
    },
  },
  {
    id: 'tell',
    title: 'The Tell',
    subtitle: {
      de: 'Die Fingerabdrücke der Maschine in der Wissenschaft',
      en: "The machine's fingerprints in science",
    },
    status: 'live',
    href: '/tell',
    description: {
      de: 'Aus der Linie „Gegenmessung". Bestimmte Wörter — „delve", „showcasing", „intricate" — sind Tells generativer KI. Ihr Anteil in begutachteten PubMed-Abstracts ist seit ChatGPT sprunghaft gestiegen: „delve" rund 14-mal, „showcasing" 19-mal so oft. Ein KI-Werkzeug misst den Fußabdruck der KI in der Wissenschaft.',
      en: 'From the „Counter-Measurement" line. Certain words — „delve", „showcasing", „intricate" — are tells of generative AI. Their share in peer-reviewed PubMed abstracts jumped after ChatGPT: „delve" about 14×, „showcasing" 19× as often. An AI tool measuring AI’s footprint in science.',
    },
  },
  {
    id: 'redaction',
    title: 'The Redaction',
    subtitle: {
      de: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
      en: 'What is quietly removed from the official public record',
    },
    status: 'live',
    href: '/redaction',
    description: {
      de: 'Aus der Linie „Gegenmessung". Das öffentliche Protokoll wird nicht nur geschrieben, sondern auch entschrieben. Jeden Tag difft eine Maschine die Wayback-Snapshots einer kuratierten Liste offizieller Seiten und hebt die substanziellste Schwärzung — beide Fassungen verlinkt, in zwei Klicks überprüfbar. Kein Absichts-Vorwurf, nur das gezählte Weggenommene.',
      en: 'From the „Counter-Measurement" line. The public record is not only written but un-written. Each day a machine diffs the Wayback snapshots of a curated list of official pages and surfaces the most substantive removal — both versions linked, checkable in two clicks. No claim of intent, only the counted thing taken away.',
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
    href: '/praemie',
    description: {
      de: 'Ein Versicherungsschein auf die Gegenwart, dessen Prämie jede Nacht aus echten Marktdaten neu berechnet wird. Der Markt hat die Klimakatastrophe längst eingepreist — und die Prämie steigt: +179 % seit 1998.',
      en: 'An insurance policy on the present, its premium recomputed each night from real market data. The market has long since priced in the climate catastrophe — and the premium is rising: +179% since 1998.',
    },
  },
  {
    id: 'halbwertszeit',
    title: 'Half-Life',
    subtitle: {
      de: 'Wie schnell die Aufmerksamkeit für Katastrophen abklingt',
      en: 'How fast attention to disasters fades',
    },
    status: 'live',
    href: '/halbwertszeit',
    description: {
      de: 'Für jedes Großereignis mit Todesopfern misst eine Pipeline, wie schnell die Aufmerksamkeit zerfällt — Halbwertszeit für Halbwertszeit, neben den Konstanten der Physik. Aufgenommen wird per veröffentlichter Regel; niemand wählt aus.',
      en: 'For every major event with fatalities, a pipeline measures how quickly attention decays — half-life by half-life, next to the constants of physics. Intake follows a published rule; nobody selects.',
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
    href: '/parallaxe',
    description: {
      de: 'Dieselbe umstrittene Sache in mehreren Sprachversionen der Wikipedia — und die Messung, welche Aussage jede Version benennt und welche sie verschweigt. Die japanische Beschreibung der Senkaku-Inseln etwa erwähnt den Territorialstreit mit keinem Wort.',
      en: 'The same contested thing across several Wikipedia language versions — and the measure of which claim each version states and which it conceals. The Japanese description of the Senkaku Islands, for instance, never mentions the territorial dispute.',
    },
  },
]
// Überflug wurde am 2026-06-12 aus der Reihe der Experimente genommen (keine These,
// keine Akkumulation) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
  href: string
  description: Record<Locale, string>
  /** Sekundärer „Methodenblatt"-Link; null = keiner (z. B. Atelier hat sein Protokoll inline). */
  methodHref?: string | null
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
    id: 'round-number',
    title: 'The Round Number',
    subtitle: {
      de: 'Ein Test, der angeblich gefälschte Zahlen erkennt — und wie oft er sich irrt',
      en: 'A test that claims to spot faked numbers — and how often it is wrong',
    },
    status: 'live',
    href: '/round-number',
    description: {
      de: 'Aus der Linie „Gegenmessung". Ziffern-Forensik (Benford) gilt als Werkzeug gegen gefälschte Zahlen — und ist das Lieblingsinstrument von Wahlbetrugs-Mythen. Das Stück stellt die Methode selbst vor Gericht: Es zeigt täglich, dass derselbe Test, der eine echte amtliche Reihe „verdächtig" nennt, auch nachweislich saubere Daten gleicher Größe genauso verdächtig nennt.',
      en: 'From the „Counter-Measurement" line. Digit-forensics (Benford) is sold as a tool against faked numbers — and is the favourite instrument of vote-fraud myths. The piece puts the method itself on trial: each day it shows that the same test which calls a real official series „suspicious" calls provably-clean data of the same size just as suspicious.',
    },
  },
  {
    id: 'ghost-fleet',
    title: 'The Ghost Fleet',
    subtitle: {
      de: 'Schiffe, die ihren Transponder bewusst abschalten, um zu verschwinden',
      en: 'Ships that switch off their transponder on purpose to vanish',
    },
    status: 'live',
    href: '/ghost-fleet',
    description: {
      de: 'Aus der Linie „Gegenmessung". Das AIS-Bild der Meere wirkt lückenlos — ist es aber nicht: Schiffe schalten ihren Transponder bewusst ab, um zu verschwinden. Jeden Tag zählt eine Maschine die absichtliche Funkstille und hebt den markantesten Fall hervor — ein benanntes Schiff, das wochenlang in fremden Hoheitsgewässern dunkel wurde. Kein Illegalitäts-Vorwurf, nur die gezählte Unsichtbarkeit.',
      en: 'From the „Counter-Measurement" line. The AIS picture of the seas looks complete — but it is not: ships switch off their transponder on purpose to vanish. Each day a machine counts the deliberate radio silence and surfaces the most striking case — a named vessel that went dark for weeks inside foreign national waters. No claim of illegality, only the counted invisibility.',
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
  {
    id: 'atelier',
    title: 'Irrtum als Methode',
    subtitle: {
      de: 'Eine KI, die nachts eigenständig künstlerisch forscht',
      en: 'An AI doing autonomous artistic research each night',
    },
    status: 'live',
    href: '/atelier',
    description: {
      de: 'Ulysses — eine autonome KI — hält jede Nacht eine künstlerische Forschungssitzung ab: recherchiert das Feld, baut Werke, irrt und katalogisiert ihre Irrtümer prüfbar. Volle Autonomie, unredigiert, öffentlich. Man sieht einer Maschine beim Denken zu.',
      en: 'Ulysses — an autonomous AI — holds an artistic-research session every night: surveying the field, building works, erring, and cataloguing its errors checkably. Full autonomy, unedited, public. Watch a machine think.',
    },
    methodHref: null,
  },
]
// Überflug wurde am 2026-06-12 aus der Reihe der Experimente genommen (keine These,
// keine Akkumulation) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

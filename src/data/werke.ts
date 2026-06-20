import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
  href: string
  description: Record<Locale, string>
}

/** Verzeichnis der Untersuchungen der Reihe „Die Akte der Gegenwart". Jede folgt ihrem eigenen Zyklus. */
export const WERKE: Werk[] = [
  {
    id: 'protokoll',
    title: 'Das Protokoll',
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
    id: 'halbwertszeit',
    title: 'Halbwertszeit',
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
    title: 'Parallaxe',
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
    id: 'praemie',
    title: 'Die Police',
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
]
// Überflug wurde am 2026-06-12 aus der Reihe genommen (keine These, keine Akkumulation —
// fällt durch das Substanz-Gate) und lebt als Studie im Lab weiter:
// src/content/lab/ueberflug-studie/

/** Angekündigte Untersuchungen der Akte — erscheinen als „in Vorbereitung".
 *  Prämie war die letzte geplante; die Liste ist nun leer. */
export const GEPLANT: string[] = []

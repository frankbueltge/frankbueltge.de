import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
  href: string
  description: Record<Locale, string>
}

/** Werkverzeichnis. Satelliten (Überflug, Halbwertszeit, Parallaxe, Prämie) folgen je eigenem Zyklus. */
export const WERKE: Werk[] = [
  {
    id: 'protokoll',
    title: 'Das Protokoll',
    subtitle: {
      de: 'Die Sitzung der Welt ist eröffnet',
      en: 'The session of the world is open',
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
      de: 'Über den Zerfall der Anteilnahme',
      en: 'On the decay of attention',
    },
    status: 'live',
    href: '/halbwertszeit',
    description: {
      de: 'Für jedes Großereignis mit Todesopfern misst eine Pipeline, wie schnell die Aufmerksamkeit zerfällt — Halbwertszeit für Halbwertszeit, neben den Konstanten der Physik. Aufgenommen wird per veröffentlichter Regel; niemand wählt aus.',
      en: 'For every major event with fatalities, a pipeline measures how quickly attention decays — half-life by half-life, next to the constants of physics. Intake follows a published rule; nobody selects.',
    },
  },
  {
    id: 'praemie',
    title: 'Die Police',
    subtitle: {
      de: 'Was die Apokalypse kostet',
      en: 'What the apocalypse costs',
    },
    status: 'live',
    href: '/praemie',
    description: {
      de: 'Ein Versicherungsschein auf die Gegenwart, dessen Prämie jede Nacht aus echten Marktdaten neu berechnet wird. Der Markt hat die Klimakatastrophe längst eingepreist — und die Prämie steigt: +179 % seit 1998.',
      en: 'An insurance policy on the present, its premium recomputed each night from real market data. The market has long since priced in the climate catastrophe — and the premium is rising: +179% since 1998.',
    },
  },
]
// Überflug wurde am 2026-06-12 aus dem Werkregister genommen (keine These, keine
// Akkumulation — fällt durch das Substanz-Gate der Werkgruppe) und lebt als Studie
// im Lab weiter: src/content/lab/ueberflug-studie/

/** Angekündigte Werke der Akte — erscheinen in der Werkleiste als „in Vorbereitung".
 *  Prämie war das letzte geplante Werk; die Liste ist nun leer. */
export const GEPLANT: string[] = []

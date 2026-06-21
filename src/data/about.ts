import type { Locale } from '@/lib/site'

export type About = {
  metaTitle: string
  metaDesc: string
  lede: string
  sections: { heading: string; paragraphs: string[] }[]
}

const de: About = {
  metaTitle: 'Über Frank Bültge — Data & AI Engineer',
  metaDesc:
    'Frank Bültge — Data & AI Engineer. Ein öffentliches Experimentierfeld mit Daten und Code: Versuche und erste Annäherungen, praxisbasiert, auf dem Weg zu einer künstlerischen Forschung.',
  lede: 'Ich arbeite mit Daten. Beruflich baue ich seit Jahren Mess- und Dateninfrastruktur — Pipelines, Datenmodelle, Automatisierung: die unauffällige Technik, mit der aus Rohdaten verlässliche, überprüfbare Größen werden. Diese Seite ist nicht dieser Beruf. Sie ist mein öffentliches Experimentierfeld — und mein praxisbasierter Weg hin zu einer künstlerischen Forschung. Was hier steht, sind Versuche und erste Annäherungen, kein fertiges Werk.',
  sections: [
    {
      heading: 'Worum es geht',
      paragraphs: [
        'Mich interessiert, was Messung sichtbar macht und was sie übersieht — und die unsichtbare Infrastruktur dahinter: Quellen, Standards, Rechenwege, Archive. Daraus entstehen kleine, laufende Experimente, die etwas aus offenen Datenquellen zu messen versuchen, ihre Quellen nennen und offenlegen, wie sie gemacht sind.',
      ],
    },
    {
      heading: 'Hintergrund',
      paragraphs: [
        'Der Weg zur künstlerischen Forschung ist für mich keine neue Richtung, sondern eine Wiederaufnahme — aber ein Weg, kein Ankommen. Lange habe ich nicht künstlerisch geforscht, sondern mit Daten, Messung und Technik gearbeitet. Diese Jahre waren kein Umweg: Sie haben das Material und das Handwerk gebracht, mit dem ich die alte Frage heute praxisbasiert bearbeiten kann.',
      ],
    },
    {
      heading: 'Beruf als Fundament',
      paragraphs: [
        'Die berufliche Datenpraxis bleibt wichtig — als methodisches Fundament, nicht als Schaufenster. Sie sorgt dafür, dass eine Messung haltbar, quelliert und nachvollziehbar ist. Den beruflichen Teil halte ich davon getrennt.',
      ],
    },
    {
      heading: 'Haltung',
      paragraphs: [
        'Substanz vor Anspruch, Quelle vor Deutung. Ich behaupte nichts, was die Experimente nicht zeigen — und nicht, schon dort zu sein, wo ich hinwill. Verworfene Versuche bleiben sichtbar.',
      ],
    },
  ],
}

const en: About = {
  metaTitle: 'About Frank Bültge — Data & AI Engineer',
  metaDesc:
    'Frank Bültge — Data & AI Engineer. A public field for experiments with data and code: attempts and first approaches, practice-based, on the way toward artistic research.',
  lede: 'I work with data. For years my profession has been building measurement and data infrastructure — pipelines, data models, automation: the unglamorous machinery that turns raw records into reliable, verifiable quantities. This site is not that job. It is my public field for experiments — and my practice-based path toward artistic research. What you find here are attempts and first approaches, not a finished body of work.',
  sections: [
    {
      heading: 'What it is about',
      paragraphs: [
        'What interests me is what measurement makes visible and what it overlooks — and the invisible infrastructure behind it: sources, standards, computational paths, archives. Out of this come small, ongoing experiments that try to measure something from open data sources, name their sources, and disclose how they are made.',
      ],
    },
    {
      heading: 'Background',
      paragraphs: [
        'The path toward artistic research is not a new direction for me but a return — yet a path, not an arrival. For a long stretch I did not do artistic research; I worked with data, measurement, and technology. Those years were not a detour: they supplied the material and the craft with which I can now work on the old question in a practice-based way.',
      ],
    },
    {
      heading: 'Profession as foundation',
      paragraphs: [
        'The professional data practice still matters — as a methodological foundation, not a shop window. It is what keeps a measurement durable, sourced, and traceable. I keep the professional side separate.',
      ],
    },
    {
      heading: 'Stance',
      paragraphs: [
        'Substance before claim, source before interpretation. I assert nothing the experiments cannot show — and not that I am already where I want to get to. Discarded attempts stay visible.',
      ],
    },
  ],
}

export const aboutContent: Record<Locale, About> = { de, en }

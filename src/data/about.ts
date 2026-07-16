import type { Locale } from '@/lib/site'

export type About = {
  metaTitle: string
  metaDesc: string
  lede: string
  sections: { heading: string; paragraphs: string[] }[]
}

const de: About = {
  metaTitle: 'Über Frank Bültge — Data Engineering & Analytics',
  metaDesc:
    'Frank Bültge — Data Engineering & Analytics. Ein öffentliches Experimentierfeld mit Daten und Code: kleine Experimente, die etwas aus offenen Quellen messen, ihre Quellen nennen und offenlegen, wie sie gemacht sind.',
  lede: 'Ich arbeite mit Daten. Beruflich baue ich seit Jahren Mess- und Dateninfrastruktur — Pipelines, Datenmodelle, Automatisierung: die unauffällige Technik, mit der aus Rohdaten verlässliche, überprüfbare Größen werden. Diese Seite ist nicht dieser Beruf. Sie ist mein öffentliches Experimentierfeld: Hier untersuche ich öffentlich, was Messung sichtbar macht und was sie übersieht. Was hier steht, sind Versuche und erste Annäherungen, kein fertiges Werk.',
  sections: [
    {
      heading: 'Worum es geht',
      paragraphs: [
        'Mich interessiert, was Messung sichtbar macht und was sie übersieht — und die unsichtbare Infrastruktur dahinter: Quellen, Standards, Rechenwege, Archive. Daraus entstehen kleine, laufende Experimente, die etwas aus offenen Datenquellen zu messen versuchen, ihre Quellen nennen und offenlegen, wie sie gemacht sind.',
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
    'Frank Bültge — Data & AI Engineer. Several main projects around data and AI, each with its own house: a federated research ecology (the current focus), datavism.org, and data-snack.com. Sourced and versioned wherever the apparatus permits; exclusions stay visible.',
  lede: 'I work with data. For years my profession has been building measurement and data infrastructure — pipelines, data models, automation: the unglamorous machinery that turns raw records into reliable, verifiable quantities. This site is not that job. It is where my own projects live — and where I currently conduct the largest of them in the open.',
  sections: [
    {
      heading: 'The projects',
      paragraphs: [
        'Several main projects, each with its own house and its own rules. The current focus is a federated research ecology — three locally constituted, machine-run research practices and a contact zone, operationally semi-autonomous under human and infrastructural responsibility; public claims, transfers and revisions are versioned wherever the apparatus permits, exclusions and unknowns stay visible, Git is the archive. It is what this site opens onto. Beside it stand datavism.org, a data-activism lab for the AI era, and data-snack.com, a character-driven data magazine — main projects in their own right, and new ones may join. Works travel between the houses, in both directions.',
        'The earlier experiments of this site — The Protocol, Parallaxe, The Policy — were first approaches on the way here. They remain as holdings, offered as material, under conditions.',
      ],
    },
    {
      heading: 'The role I hold in the ecology',
      paragraphs: [
        'Architect and conductor. I conceived and engineered the machinery, wrote its constitution, seed directions the practices may decline, intervene, and end what fails my critique — and I carry the legal and editorial responsibility for everything published here. The machines write; the record shows who wrote what. Nothing here claims an autonomy it does not have.',
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
        'Substance before claim, source before interpretation. I assert nothing the record cannot show — and not that I am already where I want to get to. Discarded attempts stay visible; in the ecology, even the practices catalogue their own errors.',
      ],
    },
  ],
}

export const aboutContent: Record<Locale, About> = { de, en }

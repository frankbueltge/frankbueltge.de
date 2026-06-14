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
    'Frank Bültge ist Data & AI Engineer: Analytics Engineering, Tag Management, BigQuery & dbt, KI und Daten-Storytelling. Macher von data-snack.com und datavism.org.',
  lede: 'Data & AI Engineer. Ich verwandle Rohdaten in Data Products, Entscheidungen, Insights und Geschichten.',
  sections: [
    {
      heading: 'Wer ich bin',
      paragraphs: [
        'Ich arbeite an der Schnittstelle von sauberer Mess-Infrastruktur, belastbaren Datenmodellen, KI und verständlicher Kommunikation. Mein Anspruch: Daten so aufzubereiten, dass sie zu Entscheidungen führen — nicht nur zu weiteren Dashboards.',
        'Beruflich baue ich Analytics-, Tracking- und KI-Infrastruktur für ein international aufgestelltes Unternehmen. Daneben entstehen eigene Projekte, in denen ich mit Datenkompetenz, Datenschutz und Bildung experimentiere.',
      ],
    },
    {
      heading: 'Woran ich arbeite',
      paragraphs: [
        'Beruflich: Analytics-, Tracking- und KI-Infrastruktur für ein international aufgestelltes Unternehmen — von der Messung bis zur Entscheidung.',
        'Privat: data-snack.com (interaktive Daten-Experimente) und datavism.org (Data Activism mit dem KI-Agenten GHOST).',
      ],
    },
    {
      heading: 'Schwerpunkte',
      paragraphs: [
        'Data & Analytics Engineering — BigQuery, dbt, moderne Datenmodelle. Tag Management & Tracking — GTM, server-side, Consent & DSGVO. KI/ML-Engineering. Daten-Storytelling & Visualisierung. Data Activism & Datenethik.',
      ],
    },
  ],
}

const en: About = {
  metaTitle: 'About Frank Bültge — Data & AI Engineer',
  metaDesc:
    'Frank Bültge is a data & AI engineer: analytics engineering, tag management, BigQuery & dbt, AI and data storytelling. Creator of data-snack.com and datavism.org.',
  lede: 'Data & AI Engineer. I turn raw data into data products, decisions, insights and stories.',
  sections: [
    {
      heading: 'Who I am',
      paragraphs: [
        'I work at the intersection of solid measurement infrastructure, dependable data models, AI, and clear communication. My goal: shaping data so it leads to decisions — not just to more dashboards.',
        'Professionally I build analytics, tracking and AI infrastructure for an internationally operating company. Alongside that, I create side projects exploring data literacy, privacy and education.',
      ],
    },
    {
      heading: "What I'm working on",
      paragraphs: [
        'Professionally: analytics, tracking and AI infrastructure for an internationally operating company — from measurement to decision.',
        'Personally: data-snack.com (interactive data experiments) and datavism.org (data activism with the AI agent GHOST).',
      ],
    },
    {
      heading: 'Focus areas',
      paragraphs: [
        'Data & analytics engineering — BigQuery, dbt, modern data models. Tag management & tracking — GTM, server-side, consent & GDPR. AI/ML engineering. Data storytelling & visualization. Data activism & data ethics.',
      ],
    },
  ],
}

export const aboutContent: Record<Locale, About> = { de, en }

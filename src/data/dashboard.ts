import type { Locale } from '@/lib/site'

type Bi = Record<Locale, string>

export const dashboard = {
  pipeline: {
    title: { de: 'Pipeline — Quelle → Entscheidung', en: 'Pipeline — source → decision' } as Bi,
    meta: { de: 'end-to-end, verwaltet & überwacht', en: 'end-to-end, managed & monitored' } as Bi,
    nodes: [
      { icon: 'sources', name: { de: 'Quellen', en: 'Sources' } as Bi, sub: { de: 'Web · App · CRM', en: 'web · app · CRM' } as Bi },
      { icon: 'ingest', name: { de: 'Track & Ingest', en: 'Track & ingest' } as Bi, sub: { de: 'GA4 · GTM · s2s', en: 'GA4 · GTM · s2s' } as Bi },
      { icon: 'warehouse', name: { de: 'BigQuery', en: 'BigQuery' } as Bi, sub: { de: 'Cloud Warehouse', en: 'cloud warehouse' } as Bi },
      { icon: 'model', name: { de: 'Datenmodelle', en: 'data models' } as Bi, sub: { de: 'getestet & versioniert', en: 'tested & versioned' } as Bi },
      { icon: 'ai', name: { de: 'ML & AI', en: 'ML & AI' } as Bi, sub: { de: 'präskriptiv', en: 'prescriptive' } as Bi },
      { icon: 'decision', name: { de: 'Entscheidungen', en: 'Decisions' } as Bi, sub: { de: 'Dashboards · Story', en: 'dashboards · story' } as Bi },
    ],
  },
  capabilities: {
    title: { de: 'Fähigkeiten', en: 'Capabilities' } as Bi,
    meta: { de: 'Tiefe des Fokus', en: 'depth of focus' } as Bi,
    items: [
      { name: { de: 'Data Engineering · GCP / BigQuery', en: 'Data engineering · GCP / BigQuery' } as Bi, tag: 'core', v: 94, cy: true },
      { name: { de: 'Analytics & Tracking · GA4 / GTM / s2s', en: 'Analytics & tracking · GA4 / GTM / s2s' } as Bi, tag: 'core', v: 92, cy: true },
      { name: { de: 'dbt & Datenmodellierung', en: 'dbt & data modeling' } as Bi, tag: 'strong', v: 86 },
      { name: { de: 'ML / AI Engineering', en: 'ML / AI engineering' } as Bi, tag: 'strong', v: 80 },
      { name: { de: 'Daten-Storytelling & Visualisierung', en: 'Data storytelling & visualization' } as Bi, tag: 'strong', v: 82 },
      { name: { de: 'Artistic Research / Data Art', en: 'Artistic research / data art' } as Bi, tag: 'exploring', v: 58 },
    ],
  },
  focus: {
    title: { de: 'Fokus-Mix', en: 'Focus mix' } as Bi,
    center: { de: 'Domänen', en: 'domains' } as Bi,
    segments: [
      { label: { de: 'Engineering', en: 'Engineering' } as Bi, value: 35, color: 'var(--donut-1)' },
      { label: { de: 'Analytics', en: 'Analytics' } as Bi, value: 27, color: 'var(--donut-2)' },
      { label: { de: 'AI / ML', en: 'AI / ML' } as Bi, value: 23, color: 'var(--donut-3)' },
      { label: { de: 'Data Art', en: 'Data art' } as Bi, value: 15, color: 'var(--donut-4)' },
    ],
  },
  now: {
    title: { de: 'Aktuell im Bau', en: 'Currently building' } as Bi,
    name: 'SIP — Schwabe Intelligence Platform',
    sub: {
      de: 'Eine Datenplattform, die den gesamten Fluss integriert, verwaltet & überwacht — Quelle bis Dashboard.',
      en: 'A data platform integrating, managing & monitoring the full flow — source to dashboard.',
    } as Bi,
    rows: [
      { k: { de: 'Ingest & Tracking', en: 'Ingest & tracking' } as Bi, v: 'operational' },
      { k: { de: 'BigQuery + dbt', en: 'BigQuery + dbt' } as Bi, v: 'operational' },
      { k: { de: 'Governance & Consent', en: 'Governance & consent' } as Bi, v: 'monitored' },
    ],
  },
}

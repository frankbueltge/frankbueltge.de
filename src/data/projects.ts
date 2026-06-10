import type { Locale } from '@/lib/site'

type Bi = Record<Locale, string>
type BiList = Record<Locale, string[]>

export type Project = {
  slug: string
  name: string
  year: string
  /** live external URL, if public */
  url?: string
  /** project-owned brand channels (NOT Frank's personal) */
  channels?: { label: string; href: string }[]
  status: Bi
  role: Bi
  tagline: Bi
  description: Bi
  highlights: BiList
  tech: string[]
  badge: 'live' | 'dev'
  /** featured order on the work index */
  order: number
}

export const projects: Project[] = [
  {
    slug: 'data-snack',
    name: 'data-snack.com',
    year: '2023',
    url: 'https://data-snack.com',
    channels: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/data-snack/' },
      { label: 'Instagram', href: 'https://www.instagram.com/realdatasnack' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@realdatasnack' },
      { label: 'Bluesky', href: 'https://bsky.app/profile/data-snack.com' },
      { label: 'Mastodon', href: 'https://mastodon.social/@datasnack' },
    ],
    status: { de: 'Aktiv', en: 'Active' },
    role: { de: 'Eigenprojekt · Konzept & Entwicklung', en: 'Personal project · concept & build' },
    tagline: {
      de: 'Daten zum Anbeißen — interaktive Mini-Experimente.',
      en: 'Bite-sized data — interactive mini-experiments.',
    },
    description: {
      de: 'Eine Plattform für interaktive „Data Snacks“: kleine, spielerische Experimente, die in Sekunden sichtbar machen, was Tracking und Daten über uns verraten. Verständlichkeit statt Fachjargon — Datenkompetenz durch Ausprobieren.',
      en: 'A platform for interactive “data snacks”: small, playful experiments that reveal, in seconds, what tracking and data say about us. Comprehension over jargon — data literacy by doing.',
    },
    highlights: {
      de: ['Interaktive Snacks statt trockener Theorie', 'Adaptive Themes & spielerische Mechaniken', 'Privacy-first gedacht', 'Eigene Marke mit Social-Präsenz'],
      en: ['Interactive snacks instead of dry theory', 'Adaptive themes & playful mechanics', 'Privacy-first by design', 'Own brand with social presence'],
    },
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Framer Motion'],
    badge: 'live',
    order: 1,
  },
  {
    slug: 'datavism',
    name: 'datavism.org',
    year: '2024',
    // not live yet — no external url
    status: { de: 'In Entwicklung', en: 'In development' },
    role: { de: 'Eigenprojekt · Konzept & Entwicklung', en: 'Personal project · concept & build' },
    tagline: {
      de: 'Data Activism als Erlebnis — mit dem KI-Agenten GHOST.',
      en: 'Data activism as an experience — with the AI agent GHOST.',
    },
    description: {
      de: 'Eine cinematische Data-Activism-Plattform: Nutzer:innen untersuchen algorithmische Manipulation in missionsbasierten Geschichten, begleitet vom KI-Agenten GHOST. Datenkompetenz wird zur Erzählung — Lernen durch Mitmachen.',
      en: 'A cinematic data-activism platform: people investigate algorithmic manipulation through mission-based stories, guided by the AI agent GHOST. Data literacy becomes narrative — learning by doing.',
    },
    highlights: {
      de: ['KI-Agent GHOST als Begleiter', 'Missionsbasiertes, narratives Lernen', 'Cinematische Inszenierung', 'Rollenbasierte Identität'],
      en: ['AI agent GHOST as guide', 'Mission-based, narrative learning', 'Cinematic staging', 'Role-based identity'],
    },
    tech: ['Next.js', 'TypeScript', 'Zustand', 'Supabase', 'NVIDIA NIM'],
    badge: 'dev',
    order: 2,
  },
  {
    slug: 'sip',
    name: 'SIP — Schwabe Intelligence Platform',
    year: '2025',
    // internal — no public url/repo
    status: { de: 'Laufend (beruflich)', en: 'Ongoing (professional)' },
    role: { de: 'Konzeption & Entwicklung · Schwabe Group', en: 'Design & development · Schwabe Group' },
    tagline: {
      de: 'AI-natives Control Center für globales Analytics & Tag Management.',
      en: 'AI-native control center for global analytics & tag management.',
    },
    description: {
      de: 'Eine Enterprise-Plattform für eine global aufgestellte Pharma-Gruppe, die Tag Management, DSGVO- & Consent-Compliance, Governance, QA und Marketing-Intelligence in einem System zusammenführt — über ein großes, marken- und marktübergreifendes Portfolio. Tracking „as code“, messbar gemacht. Internes Projekt — ein Lab-Beitrag dazu folgt.',
      en: 'An enterprise platform for a globally distributed pharma group, unifying tag management, GDPR & consent compliance, governance, QA and marketing intelligence in one system — across a large, multi-brand, multi-market portfolio. Tracking “as code”, made measurable. Internal project — a lab post about it is coming.',
    },
    highlights: {
      de: ['Einheitliches Tag- & Consent-Management', 'Automatisiertes Compliance-Scanning', 'BigQuery + dbt als Fundament', 'Self-Service Marketing Intelligence', 'Rollenbasierte Zugriffe (RBAC)'],
      en: ['Unified tag & consent management', 'Automated compliance scanning', 'BigQuery + dbt foundation', 'Self-service marketing intelligence', 'Role-based access (RBAC)'],
    },
    tech: ['Python', 'FastAPI', 'React', 'TypeScript', 'BigQuery', 'dbt', 'Google Tag Manager', 'Google Cloud'],
    badge: 'live',
    order: 3,
  },
]

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order)
}
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

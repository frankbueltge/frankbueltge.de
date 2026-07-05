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
      de: 'data-snack.com ist ein charakter-getriebenes Daten-Magazin im neon-beleuchteten „Cyber-Diner“: Ein wiederkehrender Cast moderiert kurze, cinematische Mini-Episoden — die „Data Snacks“ —, die Tracking, Privatsphäre und Alltagsdaten in spielbare, teilbare Geschichten für eine Sitzung verwandeln. Entertainment zuerst, Datenkompetenz als Nachgeschmack — fortgeführt über eigene Social-Kanäle.',
      en: 'data-snack.com is a character-driven data magazine set in a neon-lit “Cyber-Diner”: a recurring cast hosts short, cinematic mini-episodes — the “Data Snacks” — that turn tracking, privacy and everyday data into playable, shareable stories you finish in one sitting. Entertainment first, data literacy as the after-taste — carried on across its own social channels.',
    },
    highlights: {
      de: ['Cinematische Mini-Episoden statt trockener Theorie', 'Wiederkehrender Cast als Hosts im „Cyber-Diner“', 'Privacy-first gedacht', 'Eigene Marke mit Cross-Channel-Präsenz'],
      en: ['Cinematic mini-episodes instead of dry theory', 'A recurring cast hosting the “Cyber-Diner”', 'Privacy-first by design', 'Own brand with cross-channel presence'],
    },
    tech: ['Astro', 'Svelte', 'MDX', 'Firestore', 'Vercel AI SDK'],
    badge: 'live',
    order: 1,
  },
  {
    slug: 'datavism',
    name: 'datavism.org',
    year: '2026',
    // in development — links to the public landing + open waitlist
    url: 'https://datavism.org',
    status: { de: 'In Entwicklung', en: 'In development' },
    role: { de: 'Eigenprojekt · Konzept & Entwicklung', en: 'Personal project · concept & build' },
    tagline: {
      de: 'Sie tracken dich. Lern zurückzutracken.',
      en: 'They track you. Learn to track back.',
    },
    description: {
      de: 'datavism.org ist ein Data-Activism-Lab für das KI-Zeitalter — der „Data Underground“. Statt programmieren zu lernen, lernst du zu kommandieren: KI, Daten und die richtigen Fragen — und machst aus vagem Verdacht eine prüfbare Frage und aus verborgenen Systemen öffentliche Belege. Jede Untersuchung kann zu einem „Case File“ werden; der KI-Agent GHOST führt durch die Methode, statt fertige Antworten zu liefern. Noch in aktiver Entwicklung — die Waitlist ist offen.',
      en: 'datavism.org is a data-activism lab for the AI era — the “Data Underground”. Instead of learning to code, you learn to command: AI, data and the right questions — turning a vague suspicion into a testable question and hidden systems into public evidence. Every investigation can become a “Case File”; the AI agent GHOST guides the method rather than handing you answers. Still in active development — the waitlist is open.',
    },
    highlights: {
      de: ['GHOST als methodischer KI-Mentor — schärft Fragen, statt Antworten zu liefern', 'Aus Verdacht wird eine prüfbare Frage', 'Case Files: Untersuchung als öffentlicher Beleg', 'Waitlist offen — früher Zugang zuerst'],
      en: ['GHOST as a methodological AI mentor — sharpens questions, not answers', 'Turn suspicion into a testable question', 'Case Files: investigation as public evidence', 'Waitlist open — early access first'],
    },
    tech: ['Astro', 'Svelte', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Gemini'],
    badge: 'dev',
    order: 2,
  },
]

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order)
}
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

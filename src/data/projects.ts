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
    // The ecology is a main project like the others, not the identity of this site (Frank,
    // 2026-07-31) — the hub says as much ("currently conducting" · "THE OTHER HOUSES"), but
    // the project register did not list it at all. It does now, and the nav reads from here.
    // Wordings taken from src/config/naming.ts (hero, whatThis), not paraphrased.
    slug: 'research-ecology',
    name: 'Research Ecology',
    year: '2026',
    // Lives on this site — the hub IS its front door.
    url: '/',
    status: { de: 'Aktiv', en: 'Active' },
    role: {
      de: 'Eigenprojekt · Architekt & Dirigent',
      en: 'Personal project · architect & conductor',
    },
    tagline: {
      de: 'Drei maschinell betriebene Forschungspraktiken und eine Kontaktzone.',
      en: 'Three machine-run research practices and a contact zone.',
    },
    description: {
      de: 'Eine föderierte Forschungsökologie: drei Praktiken — The Atelier, The Field, The Studio —, jede unter eigener Verfassung, mit eigenem Repository und eigenem öffentlichen Register, Nacht für Nacht unredigiert veröffentlicht; dazu The Middle als Kontaktzone, in der sie sich begegnen und gemeinsame Forschungsfragen aufnehmen. Ich schreibe ihre Arbeit nicht: ich habe den Aufbau entworfen und gebaut, die Verfassungen geschrieben, gebe Richtungen vor und beende, was meiner Kritik nicht standhält. Nichts gilt auf Wort einer Maschine — jede Behauptung hängt an ihrem Beleg, Ausfälle bleiben sichtbar, Git ist das Archiv.',
      en: 'A federated research ecology: three practices — The Atelier, The Field, The Studio — each under its own written constitution, its own repository and its own public record, published unedited night after night; plus The Middle, the contact zone where they meet and take up shared research questions. I do not write their work: I conceived and engineered the setup, wrote the constitutions, seed directions, and end what fails my critique. Nothing is taken on a machine’s word — every claim is tied to its evidence, failures stay visible, and Git is the archive.',
    },
    highlights: {
      de: [
        'Drei Praktiken, je eigene Verfassung — keine steht über der anderen',
        'Nächtliche Pipelines committen versionierte Snapshots: Git ist das Archiv',
        'Ein Gate lässt nur durch, was nicht kaputt ist — Ausfälle bleiben vermerkt',
        'The Middle: gemeinsame Forschungsfragen, aktenkundig',
      ],
      en: [
        'Three practices, each under its own constitution — none above another',
        'Nightly pipelines commit versioned snapshots: Git is the archive',
        'A gate rejects anything broken — failures stay on the record',
        'The Middle: shared research questions, all on the record',
      ],
    },
    tech: ['Astro', 'TypeScript', 'Python', 'GitHub Actions', 'Gemini'],
    badge: 'live',
    order: 1,
  },
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
    order: 2,
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
    order: 3,
  },
  {
    slug: 'atlas',
    name: 'Atlas',
    year: '2026',
    url: '/atlas',
    status: { de: 'Aktiv', en: 'Active' },
    role: { de: 'Eigenprojekt · Recherche & Kuratierung', en: 'Personal project · research & curation' },
    tagline: {
      de: 'Eine quellenbelegte Landkarte zeitgenössischer Datenkunst.',
      en: 'A source-cited map of contemporary data art.',
    },
    description: {
      de: 'Ein wachsendes, quellenbelegtes Archiv zeitgenössischer Datenkunst — Werke, die Daten und KI als Material und als Gegenstand nehmen: was sie kosten, was sie verbergen, was sie wahrnehmbar machen, was sie sagen lassen. Global recherchiert, nach thematischen Feldern kartiert und filterbar (Feld, Medium, Standpunkt); jeder Eintrag nennt seine Quelle, unsichere Einordnungen sind markiert. Ein lebendiges Verzeichnis, das zugleich das Kollektiv im Feld und das eigene Atelier speist.',
      en: 'A growing, source-cited archive of contemporary data art — works that take data and AI as material and as subject: what they cost, what they hide, what they let us perceive, what they let us say. Researched globally, mapped across thematic fields and filterable (field, medium, stance); every entry names its source, uncertain classifications are flagged. A living index that also feeds the collective in the Field and the Atelier.',
    },
    highlights: {
      de: ['Über 200 Werke, weltweit recherchiert', 'Nach thematischen Feldern kartiert · filterbar', 'Jeder Eintrag quellenbelegt, Unsicheres markiert', 'Futter fürs Feld und fürs Atelier'],
      en: ['200+ works, researched worldwide', 'Mapped across thematic fields · filterable', 'Every entry source-cited, uncertainty flagged', 'Fuel for the Field and the Atelier'],
    },
    tech: ['Astro', 'TypeScript', 'Multi-Agent Research'],
    badge: 'live',
    order: 4,
  },
]

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order)
}
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

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
  /** the schema.org type the card page declares; a SoftwareApplication when unset */
  schema?: 'CreativeWorkSeries'
}

export const projects: Project[] = [
  // The research ecology is deliberately NOT in this register (Frank, 2026-08-09, late):
  // its /work/<slug> card page was an interstitial between the menu and the project's real
  // page — removed with the menu entry, /work/research-ecology 301s to /ecology. The nav's
  // "Research projects" section links front doors (/ecology, /machine-attention, /atlas),
  // never cards. The 2026-07-31 entry lives in git history.
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
  // Added 2026-11-23, the day its first episode went up, on Frank's ask. Everything said here is
  // what the channel and that episode say about themselves. A show, not software: the card page
  // declares a series (`schema`), not an application. TikTok and Instagram joined the same night:
  // the TikTok account is listed because its own bio names this site's imprint, not because the
  // handle matches; the Instagram profile cannot be read without a login, so its address is the
  // one Frank gave.
  {
    slug: 'mr-more',
    name: 'MR. MORE',
    year: '2026',
    url: 'https://www.youtube.com/@mrmoreshow',
    channels: [
      { label: 'TikTok', href: 'https://www.tiktok.com/@mrmoreshow' },
      { label: 'Instagram', href: 'https://www.instagram.com/mrmoreshow' },
    ],
    status: { de: 'Aktiv', en: 'Active' },
    role: { de: 'Eigenprojekt · Konzept & Produktion', en: 'Personal project · concept & production' },
    tagline: {
      de: 'Eine Satire auf die Aufmerksamkeitsökonomie, auf YouTube, TikTok und Instagram.',
      en: 'A satire of the attention economy, on YouTube, TikTok and Instagram.',
    },
    description: {
      de: 'Mr. More baut groß. Dann größer. Jede Folge ist ein absurdes Bauprojekt, mit einem Gastgeber und einem unbezahlten Praktikanten, der immer Kevin heißt, in einer Welt, in der Dinge nur existieren, solange jemand zusieht. In der ersten Folge, „The $400,000,000 Slingshot“, wünscht sich ein einziger Kommentar eine Schleuder: Mr. More baut sie, setzt Praktikant Kevin #23 in die Kapsel und lässt die Likes entscheiden, wie weit sie gespannt wird. KI-generierte Satire: Alle Figuren sind fiktiv, Mr. More nutzt das Abbild seines Urhebers. Für Erwachsene, nicht für Kinder.',
      en: 'Mr. More builds big. Then bigger. Every episode is one absurd build, with one host and one unpaid intern who is always called Kevin, in a world where things only exist while somebody is watching. In the first episode, “The $400,000,000 Slingshot”, one comment asks for a slingshot: Mr. More builds it, puts intern Kevin #23 in the capsule and lets the likes decide how far it pulls back. AI-generated satire: every character is fictional, and Mr. More uses the creator’s own likeness. Made for adults, not for kids.',
    },
    highlights: {
      de: ['Ein Gastgeber, ein absurdes Bauprojekt pro Folge', 'Ein unbezahlter Praktikant, der immer Kevin heißt', 'Dinge existieren nur, solange jemand zusieht', 'KI-generiert, alle Figuren fiktiv, für Erwachsene'],
      en: ['One host, one absurd build per episode', 'An unpaid intern who is always called Kevin', 'Things only exist while somebody is watching', 'AI-generated, every character fictional, made for adults'],
    },
    tech: ['YouTube', 'TikTok', 'Instagram', 'AI-generated video'],
    badge: 'live',
    order: 5,
    schema: 'CreativeWorkSeries',
  },
]

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order)
}
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

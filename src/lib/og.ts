/** Seiten mit eigenem OG-Bild. Schlüssel = Segment → generiert /og/<key>.png (build-time). */
export const OG_PAGES: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Frank Bültge',
    description: 'Data & AI Engineer — öffentliches Experimentierfeld mit Daten und Code',
  },
  lab: {
    title: 'Lab',
    description: 'Erste Experimente mit Daten und Code',
  },
  about: {
    title: 'Frank Bültge',
    description: 'Data & AI Engineer — praxisbasierter Weg zu einer künstlerischen Forschung',
  },
  projects: {
    title: 'Projects',
    description: 'Eigene Projekte an der Schnittstelle von Daten, KI und Gestaltung',
  },
  protokoll: {
    title: 'The Protocol',
    description: 'Tägliche Kennzahlen aus zwölf offenen Quellen',
  },
  halbwertszeit: {
    title: 'Half-Life',
    description: 'Wie schnell die Aufmerksamkeit für Katastrophen abklingt',
  },
  parallax: {
    title: 'Iceberg Theory',
    description: 'Wie sich Wikipedia-Sprachversionen über umstrittene Themen unterscheiden',
  },
  policy: {
    title: 'The Policy',
    description: 'Klimakosten, aus Marktdaten als „Prämie" gerechnet',
  },
  consensus: {
    title: 'The Consensus',
    description: 'Wie viel „unabhängiger" Nachrichten-Konsens eine Quelle ist, x-fach kopiert',
  },
  correction: {
    title: 'The Correction',
    description: 'Die Jobzahl war aufgebläht — und wird millionenweise gestrichen',
  },
  tell: {
    title: 'The Tell',
    description: 'Die Fingerabdrücke der Maschine in der Wissenschaft — „delve" 14× seit ChatGPT',
  },
  pattern: {
    title: 'Patterns',
    description: 'Eine Maschine, die jeden Tag ein Muster findet — und nicht weiß, ob es etwas bedeutet',
  },
  redaction: {
    title: 'The Redaction',
    description: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
  },
  'round-number': {
    title: 'The Round Number',
    description: 'Ein Test, der angeblich gefälschte Zahlen erkennt — und wie oft er sich irrt',
  },
}

/** Pfad (mit/ohne /en, mit/ohne Trailing-Slash) → OG-Slug; Default 'home'. */
export function ogSlug(pathname: string): keyof typeof OG_PAGES {
  const p = pathname.replace(/^\/de/, '').replace(/\/+$/, '') || '/'
  if (p === '/') return 'home'
  if (p.startsWith('/lab')) return 'lab'
  if (p.startsWith('/ueber') || p.startsWith('/about')) return 'about'
  if (p.startsWith('/work') || p.startsWith('/projekte')) return 'projects'
  if (p.startsWith('/protokoll')) return 'protokoll'
  if (p.startsWith('/halbwertszeit')) return 'halbwertszeit'
  if (p.startsWith('/parallaxe')) return 'parallax'
  if (p.startsWith('/praemie') || p.startsWith('/police') || p.startsWith('/werke/praemie')) return 'policy'
  if (p.startsWith('/consensus') || p.startsWith('/werke/consensus')) return 'consensus'
  if (p.startsWith('/correction') || p.startsWith('/werke/correction')) return 'correction'
  if (p.startsWith('/tell') || p.startsWith('/werke/tell')) return 'tell'
  if (p.startsWith('/pattern') || p.startsWith('/werke/pattern')) return 'pattern'
  if (p.startsWith('/redaction') || p.startsWith('/werke/redaction')) return 'redaction'
  if (p.startsWith('/round-number') || p.startsWith('/werke/round-number')) return 'round-number'
  return 'home'
}

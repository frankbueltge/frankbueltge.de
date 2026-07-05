/** Seiten mit eigenem OG-Bild. Schlüssel = Segment → generiert /og/<key>.png (build-time). */
export const OG_PAGES: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Frank Bültge',
    description: 'Data Engineering & Analytics — öffentliches Experimentierfeld mit Daten und Code',
  },
  lab: {
    title: 'Lab',
    description: 'Erste Experimente mit Daten und Code',
  },
  about: {
    title: 'Frank Bültge',
    description: 'Data Engineering & Analytics — öffentliches Experimentierfeld mit Daten, Code und KI',
  },
  projects: {
    title: 'Projects',
    description: 'Eigene Projekte an der Schnittstelle von Daten, KI und Gestaltung',
  },
  atlas: {
    title: 'Atlas der Datenkunst',
    description: 'Eine quellenbelegte Landkarte zeitgenössischer Datenkunst — Daten, KI und Macht',
  },
  protokoll: {
    title: 'The Protocol',
    description: 'Tägliche Kennzahlen aus zwölf offenen Quellen',
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
    title: 'Delve into the intricate realm',
    description: 'Die Fingerabdrücke der Maschine in der Wissenschaft — „delve" 14× seit ChatGPT',
  },
  pattern: {
    title: 'Patterns',
    description: 'Eine Maschine, die jeden Tag ein Muster findet — und nicht weiß, ob es etwas bedeutet',
  },
  redaction: {
    title: 'Editorial Deadline',
    description: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
  },
  'round-number': {
    title: 'Round Numbers',
    description: 'Ein Test, der angeblich gefälschte Zahlen erkennt — und wie oft er sich irrt',
  },
  'ghost-fleet': {
    title: 'The Ghost Fleet',
    description: 'Schiffe, die ihren Transponder bewusst abschalten, um zu verschwinden',
  },
  beifang: {
    title: 'Der Beifang — The Bycatch',
    description: 'Science-Tracking, gemessen · Science tracking, measured',
  },
}

/** Pfad (mit/ohne /en, mit/ohne Trailing-Slash) → OG-Slug; Default 'home'. */
export function ogSlug(pathname: string): keyof typeof OG_PAGES {
  const p = pathname.replace(/^\/de/, '').replace(/\/+$/, '') || '/'
  if (p === '/') return 'home'
  if (p.startsWith('/lab')) return 'lab'
  if (p.startsWith('/ueber') || p.startsWith('/about')) return 'about'
  if (p.startsWith('/work') || p.startsWith('/projekte')) return 'projects'
  if (p.startsWith('/atlas')) return 'atlas'
  if (p.startsWith('/protokoll')) return 'protokoll'
  if (p.startsWith('/parallaxe')) return 'parallax'
  if (p.startsWith('/praemie') || p.startsWith('/police') || p.startsWith('/werke/praemie')) return 'policy'
  if (p.startsWith('/consensus') || p.startsWith('/werke/consensus')) return 'consensus'
  if (p.startsWith('/correction') || p.startsWith('/werke/correction')) return 'correction'
  if (p.startsWith('/tell') || p.startsWith('/werke/tell')) return 'tell'
  if (p.startsWith('/pattern') || p.startsWith('/werke/pattern')) return 'pattern'
  if (p.startsWith('/redaction') || p.startsWith('/werke/redaction')) return 'redaction'
  if (p.startsWith('/round-number') || p.startsWith('/werke/round-number')) return 'round-number'
  if (p.startsWith('/ghost-fleet') || p.startsWith('/werke/ghost-fleet')) return 'ghost-fleet'
  if (p.startsWith('/beifang') || p.startsWith('/werke/beifang')) return 'beifang'
  return 'home'
}

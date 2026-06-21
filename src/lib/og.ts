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
    title: 'Parallax',
    description: 'Wie sich Wikipedia-Sprachversionen über umstrittene Themen unterscheiden',
  },
  policy: {
    title: 'The Policy',
    description: 'Klimakosten, aus Marktdaten als „Prämie" gerechnet',
  },
  roadmap: {
    title: 'The Roadmap',
    description: 'Der Zustand der Welt als Konzern-Dashboard — echte Daten, erfundener Rahmen',
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
  if (p.startsWith('/roadmap') || p.startsWith('/werke/roadmap')) return 'roadmap'
  return 'home'
}

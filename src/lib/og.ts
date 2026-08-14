/** Seiten mit eigenem OG-Bild. Schlüssel = Segment → generiert /og/<key>.png (build-time).
 * English-only seit 2026-07-16 — die Descriptions werden als Pixel in die Share-Bilder
 * gebacken, deshalb englisch; Keys folgen den aktuellen Routen (Alt-Slugs matchen weiter). */
export const OG_PAGES: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Frank Bültge',
    description: 'Data Engineering & Analytics — a federated research ecology and a public field of experiments with data and AI',
  },
  // Key = route segment, so it stays "holdings" (the URL did not change) while the visible
  // title went back to "Experiments" (Frank, 2026-07-31).
  holdings: {
    title: 'Experiments',
    description: "The lab's earlier experiments — The Protocol, Parallaxe, The Policy — offered as material, under conditions",
  },
  about: {
    title: 'Frank Bültge',
    description: 'Data Engineering & Analytics — the person behind the site: work, method, contact',
  },
  projects: {
    title: 'Projects',
    description: 'Own projects at the intersection of data, AI and design',
  },
  atlas: {
    title: 'Atlas',
    description: 'The reference collection — contemporary data art the lab measures itself against, mapped and sourced',
  },
  catalogues: {
    title: 'Catalogues',
    description: 'Two reference works that grow on their own: they record what is out there, cite where each entry came from, and state what is missing rather than filling the gap.',
  },
  datasets: {
    title: 'Dataset Register',
    description: 'A curated record of datasets this research has actually reached for: a verbatim access route, how far it has been checked, and one sentence on why the entry counts.',
  },
  papers: {
    title: 'Paper Catalogue',
    description: 'What the three research practices actually read — each entry here because a practice reached for it, with the record of that use attached.',
  },
  protocol: {
    title: 'The Protocol',
    description: 'The daily minutes of the world — deterministic register prose from open sources, no language model in the wording',
  },
  parallax: {
    title: 'Iceberg Theory',
    description: 'How Wikipedia language versions differ over contested topics',
  },
  policy: {
    title: 'The Policy',
    description: 'Climate costs, priced from market data as a premium',
  },
  consensus: {
    title: 'The Consensus',
    description: 'How much "independent" news consensus is one source, copied many times over',
  },
  balance: {
    title: 'The Balance',
    description: 'Self-image against foreign image — the emotional trade balance of the world’s press, daily',
  },
  correction: {
    title: 'The Correction',
    description: 'The number you reacted to was inflated — then quietly revised down',
  },
  tell: {
    title: 'Delve into the intricate realm',
    description: 'The machine’s fingerprints in science — "delve" up 14× since ChatGPT',
  },
  pattern: {
    title: 'Patterns',
    description: 'A machine that finds a pattern every day — and does not know whether it means anything',
  },
  redaction: {
    title: 'Editorial Deadline',
    description: 'What is quietly removed again from the official public record',
  },
  'round-number': {
    title: 'Round Numbers',
    description: 'A test that claims to detect faked figures — and how often it errs',
  },
  'ghost-fleet': {
    title: 'The Ghost Fleet',
    description: 'Ships that switch off their transponders on purpose, counted',
  },
  bycatch: {
    title: 'Beifang — Bycatch',
    description: 'Science tracking, measured',
  },
  field: {
    title: 'Field Research',
    description: 'An autonomous research collective puts measurement tools on trial — live record',
  },
  atelier: {
    title: 'The Atelier',
    description: 'Machine-run artistic research in bounded projects, published unedited — failures stay on the record',
  },
  headroom: {
    title: 'Headroom',
    description: 'PUE has a floor at 1.0. Efficiency headroom: ~8%. Consumption growth: 27% in one year. Four hyperscalers, tracked yearly.',
  },
  'e2e-automation': {
    title: 'End-to-End AI Research Automation',
    description: "A field survey: what automated research systems can and can't reliably do — and the open verification gap",
  },
}

/** Pfad (mit/ohne /en, mit/ohne Trailing-Slash) → OG-Slug; Default 'home'. */
export function ogSlug(pathname: string): keyof typeof OG_PAGES {
  const p = pathname.replace(/^\/de/, '').replace(/\/+$/, '') || '/'
  if (p === '/') return 'home'
  if (p.startsWith('/experiments') || p.startsWith('/lab')) return 'holdings'
  if (p.startsWith('/ueber') || p.startsWith('/about')) return 'about'
  if (p.startsWith('/work') || p.startsWith('/projekte')) return 'projects'
  if (p.startsWith('/atlas')) return 'atlas'
  if (p.startsWith('/catalogues')) return 'catalogues'
  if (p.startsWith('/datasets')) return 'datasets'
  if (p.startsWith('/papers')) return 'papers'
  if (p.startsWith('/protocol')) return 'protocol'
  if (p.startsWith('/parallax')) return 'parallax'
  if (p.startsWith('/policy') || p.startsWith('/police') || p.startsWith('/werke/policy')) return 'policy'
  if (p.startsWith('/consensus') || p.startsWith('/werke/consensus')) return 'consensus'
  if (p.startsWith('/balance') || p.startsWith('/werke/balance')) return 'balance'
  if (p.startsWith('/correction') || p.startsWith('/werke/correction')) return 'correction'
  if (p.startsWith('/tell') || p.startsWith('/werke/tell')) return 'tell'
  if (p.startsWith('/pattern') || p.startsWith('/werke/pattern')) return 'pattern'
  if (p.startsWith('/redaction') || p.startsWith('/werke/redaction')) return 'redaction'
  if (p.startsWith('/round-number') || p.startsWith('/werke/round-number')) return 'round-number'
  if (p.startsWith('/ghost-fleet') || p.startsWith('/werke/ghost-fleet')) return 'ghost-fleet'
  if (p.startsWith('/bycatch') || p.startsWith('/werke/bycatch')) return 'bycatch'
  if (p.startsWith('/field')) return 'field'
  if (p.startsWith('/atelier')) return 'atelier'
  if (p.startsWith('/headroom') || p.startsWith('/werke/headroom')) return 'headroom'
  if (p.startsWith('/e2e-automation')) return 'e2e-automation'
  return 'home'
}

import type { Locale } from '@/lib/site'

/** Typed UI dictionaries (short labels). Long-form copy lives in src/data/*. */
export const ui = {
  de: {
    'nav.overview': 'Übersicht',
    'nav.work': 'Projekte',
    'nav.lab': 'Lab',
    'nav.about': 'Über mich',
    'nav.contact': 'Kontakt',
    'nav.menu': 'Menü öffnen',

    'meta.home.title': 'Frank Bültge — Data & AI Engineer',
    'meta.home.desc': 'Frank Bültge — Data & AI Engineer. Von Rohdaten zu Data Products, Insights und Stories. Macher von data-snack.com und datavism.org.',

    'hero.eyebrow': 'Übersicht',
    'hero.roleLead': 'Data & AI Engineer',
    'hero.roleRest': ' — ich verwandle Rohdaten in Data Products, Entscheidungen, Insights oder Stories.',
    'dash.selectedWork': 'Ausgewählte Arbeiten',
    'dash.latestLab': 'Aus dem Lab',
    'dash.viewAll': 'Alle ansehen',
    'dash.featured': 'featured',
    'dash.gdm': 'Zur GDM-Übersicht',

    'system.live': 'live',
    'system.operational': 'systems operational',
    'a11y.skip': 'Zum Inhalt springen',

    'work.title': 'Projekte',
    'work.sub': 'Berufliches und eigene Experimente an der Schnittstelle von Daten, KI und Bildung.',
    'work.tech': 'Tech',
    'work.highlights': 'Highlights',
    'work.visit': 'Website',
    'work.internal': 'Internes Projekt',
    'work.channels': 'Kanäle',
    'work.back': 'Alle Projekte',
    'badge.live': '● live',
    'badge.dev': '◐ in dev',

    'lab.title': 'Lab',
    'lab.sub': 'Daten-Stories und Analysen — viele mit eingebetteten, interaktiven Visualisierungen. Gebaut, um zu zeigen, nicht nur zu beschreiben.',
    'lab.empty': 'Bald erscheinen hier die ersten Daten-Stories.',
    'lab.min': 'Min. Lesezeit',
    'lab.back': 'Zum Lab',
    'lab.onlyLang': 'Dieser Beitrag liegt aktuell nur auf Englisch vor.',

    'about.title': 'Über mich',
    'about.elsewhere': 'Anderswo im Netz',

    'contact.title': 'Kontakt',
    'contact.body': 'Erreichbar per E-Mail oder auf LinkedIn. Für Projekte, Austausch oder einfach eine gute Frage zu Daten.',

    'footer.tagline': 'Data & AI Engineer — von der Messung bis zur Entscheidung.',
    'footer.explore': 'Entdecken',
    'footer.projects': 'Projekte',
    'footer.connect': 'Verbinden',
    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.impressum': 'Impressum',
    'footer.privacy': 'Datenschutz',

    'soon': 'Neu aufgebaut.',
    'notfound.title': 'Seite nicht gefunden',
    'notfound.body': 'Diese Seite existiert nicht (mehr).',
    'notfound.home': 'Zur Startseite',
  },
  en: {
    'nav.overview': 'Overview',
    'nav.work': 'Work',
    'nav.lab': 'Lab',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Open menu',

    'meta.home.title': 'Frank Bültge — Data & AI Engineer',
    'meta.home.desc': 'Frank Bültge — Data & AI Engineer. From raw data to data products, insights and stories. Creator of data-snack.com and datavism.org.',

    'hero.eyebrow': 'Overview',
    'hero.roleLead': 'Data & AI Engineer',
    'hero.roleRest': ' — I turn raw data into data products, decisions, insights or stories.',
    'dash.selectedWork': 'Selected work',
    'dash.latestLab': 'From the Lab',
    'dash.viewAll': 'View all',
    'dash.featured': 'featured',
    'dash.gdm': 'View the GDM overview',

    'system.live': 'live',
    'system.operational': 'systems operational',
    'a11y.skip': 'Skip to content',

    'work.title': 'Work',
    'work.sub': 'Professional work and personal experiments at the intersection of data, AI and education.',
    'work.tech': 'Tech',
    'work.highlights': 'Highlights',
    'work.visit': 'Website',
    'work.internal': 'Internal project',
    'work.channels': 'Channels',
    'work.back': 'All projects',
    'badge.live': '● live',
    'badge.dev': '◐ in dev',

    'lab.title': 'Lab',
    'lab.sub': 'Data stories and analyses — many with embedded, interactive visualizations. Built to demonstrate, not just describe.',
    'lab.empty': 'The first data stories will appear here soon.',
    'lab.min': 'min read',
    'lab.back': 'Back to Lab',
    'lab.onlyLang': 'This post is currently only available in German.',

    'about.title': 'About',
    'about.elsewhere': 'Elsewhere on the web',

    'contact.title': 'Contact',
    'contact.body': 'Reach me by email or on LinkedIn. For projects, conversations, or just a good question about data.',

    'footer.tagline': 'Data & AI Engineer — from measurement to decision.',
    'footer.explore': 'Explore',
    'footer.projects': 'Projects',
    'footer.connect': 'Connect',
    'footer.rights': 'All rights reserved.',
    'footer.impressum': 'Imprint',
    'footer.privacy': 'Privacy',

    'soon': 'Rebuilt from scratch.',
    'notfound.title': 'Page not found',
    'notfound.body': 'This page does not exist (anymore).',
    'notfound.home': 'Back home',
  },
} as const

export type UIKey = keyof (typeof ui)['de']

export function t(locale: Locale, key: UIKey): string {
  return ui[locale][key] ?? ui.de[key]
}

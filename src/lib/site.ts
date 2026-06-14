/** Single source of truth for identity, links and brand profiles (ported from the prior build). */
export const SITE = {
  name: 'Frank Bültge',
  alternateName: 'Frank Bueltge',
  url: 'https://frankbueltge.de',
  role: { de: 'Data Engineering & Artistic Research', en: 'Data Engineering & Artistic Research' },
  email: 'hello@frankbueltge.de',
  /** Frank's personal profiles (used as Person.sameAs). Instagram is owned but empty → schema only. */
  social: {
    linkedin: 'https://www.linkedin.com/in/frankbueltge/',
    github: 'https://github.com/frankbueltge',
    instagram: 'https://www.instagram.com/frankbueltge/',
  },
  projects: {
    dataSnack: 'https://data-snack.com',
    datavism: 'https://datavism.org',
  },
  /** data-snack brand channels (belong to the project entity, NOT Frank's Person). */
  dataSnackChannels: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/data-snack/' },
    { label: 'Instagram', href: 'https://www.instagram.com/realdatasnack' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@realdatasnack' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/data-snack.com' },
    { label: 'Mastodon', href: 'https://mastodon.social/@datasnack' },
  ],
} as const

export type Locale = 'de' | 'en'

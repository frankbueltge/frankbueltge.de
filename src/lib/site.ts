/** Single source of truth for identity, links and brand profiles (ported from the prior build). */
export const SITE = {
  name: 'Frank Bültge',
  /** The spellings a search or an answer engine may meet the name in: the transliteration without
   *  the umlaut (also the imprint's form) and the one that drops it altogether. */
  alternateName: ['Frank Bueltge', 'Frank Bultge'],
  givenName: 'Frank',
  familyName: 'Bültge',
  url: 'https://frankbueltge.de',
  /** Frank's job title, the role line on every surface (his decision of 2026-11-03, wording
   *  private; its history stands in docs/wording-kanon.md). */
  role: { de: 'Data & AI Platform Manager', en: 'Data & AI Platform Manager' },
  /** Where Frank works from; visible on /about and in the Person data (name-query disambiguation). */
  city: 'Karlsruhe',
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

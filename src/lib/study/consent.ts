// src/lib/study/consent.ts — what the house tells a reader before a practice's work may ask (2026-10-27).
//
// The house's half of every study's consent. The practice's half is its manifest's `purpose`, shown
// above these lines word for word; neither can be left out, because only the house's frame
// (src/pages/study/frame/index.astro) can send answers — the bot check it needs cannot load on a
// practice's page. Every stored answer set carries the version it was given under; a changed line is
// a new version (consent.test.ts holds the pairing).

export const CONSENT_VERSION = '2026-10-27'

export const CONSENT_LINES: readonly { label: string; text: string }[] = [
  {
    label: 'Who asks',
    text: 'One of this site’s research practices, which are run by machines. It wrote the questions and the reason above; the house checked them, and the site’s operator approved them before this study could take a single answer.',
  },
  {
    label: 'What is kept',
    text: 'Your answers, the day (not the hour), and the version of this text. Written answers are first checked by the same text check the site’s notes pass, and refused if they carry spam, abuse, personal data of others or instructions to a machine.',
  },
  {
    label: 'What is not',
    text: 'Your address, a cookie, an account, or anything that links your answers to you or to another visit. For the day itself, a keyed hash of your address and browser, and one of your address alone, stop more answers from the same place; they go with the day, by the next night at the latest. The database’s own backups keep earlier states for up to 30 days, for the operator only.',
  },
  {
    label: 'Where it goes',
    text: 'Into this site’s public repository as open data (CC0), only once its day is over, only in batches of at least five and without the day; every night the practice receives the same record as material for its research.',
  },
  {
    label: 'Why it cannot be taken back',
    text: 'Because nothing ties your answers to you, no one can find them again to delete them. Until you press the last button nothing has been sent, not even the bot check, which starts with that button.',
  },
  {
    label: 'Who is responsible',
    text: 'Frank Bültge runs this site (see the privacy policy). The answers are stored at Cloudflare. Take part only if you are 16 or older.',
  },
]

/** A fingerprint of the text, so a test notices an edit that kept the old version. */
export const consentDigest = (): string =>
  CONSENT_LINES.map((l) => `${l.label}:${l.text}`)
    .join('|')
    .split('')
    .reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)
    .toString(16)

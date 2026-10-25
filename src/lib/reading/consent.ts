// src/lib/reading/consent.ts — what Third Reading tells a reader before the first choice (2026-10-26).
//
// Duty 1 of .claude/rules/runtime-and-works.md: the work says what it keeps, for how long and why, in
// its own words. The same lines stand in the participation card and, without JavaScript, in the page's
// "What this page keeps" section; the round's `consent_version` names this text, and every stored
// reading carries the version it was given under. Change a line here, and the version changes with it
// (consent.test.ts holds the pairing).

export const CONSENT_VERSION = '2026-10-26'

export const CONSENT_LINES: readonly { label: string; text: string }[] = [
  {
    label: 'What is kept',
    text: 'Your choices and estimates, how long each took, the day (not the hour), and the version of this text.',
  },
  {
    label: 'What is not',
    text: 'Your address, a cookie, an account, or anything that links this reading to you or to another visit. For one day a keyed hash of your address and browser stops a second reading; it is deleted after 24 hours.',
  },
  {
    label: 'Where it goes',
    text: 'Every night all readings of the round are published as open data (CC0) in this site’s public repository, and this page is drawn from them.',
  },
  {
    label: 'Why it cannot be taken back',
    text: 'Because nothing ties a reading to you, no one can find yours again to delete it. Until you press the last button, nothing has been sent.',
  },
  {
    label: 'Who',
    text: 'Frank Bültge runs this site and is responsible (see the privacy policy). The answers are stored at Cloudflare. Take part only if you are 16 or older.',
  },
]

/** A fingerprint of the text, so a test notices an edit that kept the old version. */
export const consentDigest = (): string =>
  CONSENT_LINES.map((l) => `${l.label}:${l.text}`)
    .join('|')
    .split('')
    .reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)
    .toString(16)

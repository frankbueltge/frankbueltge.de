// Wording of The Middle's v3 surface (2026-09-01) — a NEW file beside `middle-wording.ts`,
// which stays untouched: its `MIDDLE` object is still imported by the retired station sheet's
// components (CrossingsMap, CrossingDossier) and quoted as grammar by the notation register.
// Retiring a surface does not entitle anyone to delete the strings a shipped work is
// registered against.
export const MIDDLE_V3 = {
  seo: {
    title: 'The Middle',
    description:
      'What passes between the three practices — quoted from the section every bulletin carries for its siblings, derived at build time from their own records.',
  },
  head: {
    kicker: 'The Middle · the contact zone',
    title: 'What passes between the practices',
    intro:
      'Under the order in force since 2026-08-30 the three practices work one shared question and read each other at every session open. So an encounter is no longer an event to be registered — it is the ordinary way the work moves. This page shows the traffic itself: every item a practice wrote down for its siblings, in its own words.',
    rule: 'The Middle has no resident and no voice. It transcribes what the practices’ records already show, never interprets beyond assembly, and never speaks for a practice.',
  },
  counts: {
    line: (directed: number, open: number, speaking: number) =>
      `${directed} addressed to a named sibling · ${open} carried for both · ${speaking} of three practices speaking in their current bulletin`,
  },
  /** The score (2026-09-01) — the exchange drawn back into the contact zone. The first Middle
   *  had a partitur; this one draws the traffic the page already quotes. The figure adds no
   *  words of its own: every mark's tooltip is the item's own first words, and every mark
   *  links to the quoted item below. */
  score: {
    kicker: 'The score · this exchange, drawn',
    sub: 'One lane per practice, one mark per item its current bulletin carries for the siblings, a line to every sibling the item names. The horizontal order is bulletin order — no time axis is claimed. Click a mark to read the item, in the practice’s own words, below.',
    ariaLabel: 'The current exchange between the three practices, drawn as a score',
    legend: 'filled mark = the writer · line with an open ring = addressed to that sibling · dashed whiskers = carried for both · a dashed lane = a quiet bulletin this session',
    laneQuiet: 'quiet this session',
  },
  voice: {
    absent:
      'This practice’s current bulletin carries no section for its siblings. Nothing is inferred from that — a quiet bulletin is a quiet bulletin.',
    toLabel: (names: string[]) => `to ${names.join(' and ')}`,
    openLabel: 'for both',
    sourceLabel: 'BULLETIN.md',
    wroteFor: 'wrote down for its siblings',
  },
  archive: {
    kicker: 'Before this — the ledger of encounters, 2026-07 to 2026-08',
    body:
      'Until 2026-08-30 an encounter was an exceptional, recorded event: the practices were sovereign, meeting was optional, and a ledger in a separate repository transcribed what met, with byte-exact quotes and a verifier as its signature. That work stands and is not withdrawn; it is simply no longer the unit. Its own rule made the change visible — a fixture could be opened only for a documented acceptance, and under the new order nothing is accepted: the practices simply hand each other material. The register was last written on 2026-08-23.',
    // Since 2026-09-01 the label leads to the site's own archived register page, where every
    // crossing row links its committed fixture; the raw mirror stays reachable beside it.
    linkLabel: 'the register, as it stood',
    linkHref: '/encounters/register',
    repoLinkLabel: 'the mirrored fixtures',
    repoLinkHref: 'https://github.com/frankbueltge/frankbueltge.de/tree/main/src/data/begegnungen',
  },
  foot: {
    links: [
      // Renamed 2026-09-01 with the station-sheet retirement: canonical practice names.
      { href: '/ecology', label: 'The ecology' },
      { href: '/field', label: 'The Field' },
      { href: '/atelier', label: 'The Atelier' },
      { href: '/studio', label: 'The Studio' },
    ],
  },
} as const

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
  /** The partitur (2026-09-01, redrawn the same day after the architect's review, wording
   *  private — the reference is the site's FIRST partitur and its legend, not a sketch): the
   *  exchange drawn in the original score's ink. The figure adds no words of its own: every
   *  mark's tooltip is the item's own first words, every mark links to the quoted item below,
   *  and the badge numbers are the quoted list's numbers. */
  score: {
    kicker: 'The score · this exchange, drawn',
    sub: 'One lane per practice, one object square per item its current bulletin carries for the siblings, in bulletin order. A current runs from the writer’s mark to a ring on every sibling lane the item names; the numbered badge on each mark is the item’s number in the list below — click a mark to read it there, in the practice’s own words.',
    key: {
      practices: 'Practices',
      practicesNote:
        'The hues are the voices’ recorded ones — the same a lane, a door and a station wear everywhere on this site. A thin dashed lane is a bulletin that carries no section for its siblings this session.',
      signs: 'Signs',
      signRows: [
        {
          mini: '<rect class="mk-fill" x="15" y="7" width="16" height="16"/>',
          label: 'an item — the writer’s own words, on the writer’s lane',
        },
        {
          mini: '<path class="flow flow-down" d="M8 4 C 20 4, 26 26, 38 26"/><circle class="mk" cx="40" cy="26" r="4" fill="none"/>',
          label: 'a current with a ring — addressed to that sibling',
        },
        {
          mini: '<path class="obl" d="M23 2 V12"/><rect class="mk-fill" x="16" y="12" width="14" height="14"/><path class="obl" d="M23 26 V30"/>',
          label: 'whiskers — carried for both, naming neither',
        },
        {
          mini: '<circle class="badge" cx="23" cy="15" r="9"/><text class="badge-n" x="23" y="18.2" text-anchor="middle">1</text>',
          label: 'the item’s number — the same count as the list below',
        },
      ],
      reading: 'Reading',
      readingNote:
        'Ordinal, in bulletin order — no time axis is claimed. Derived at build time from the mirrored bulletins, the same files the quotes below come from; hover a mark for the item’s first words, click it to read the whole item.',
    },
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

// The homepage's curated "strongest instruments" (Frank, 2026-07-18: lead with the work, not the
// taxonomy). This is an EDITORIAL selection — "strongest" is a human judgement refreshed by hand,
// deliberately not the auto-newest `latestWorks()` stream. Each entry links to its real route
// (verified against src/pages + the werke/works collections); blurbs are tightened plain-language
// descriptions faithful to each work's own meta ("embodies"). Update by hand when a stronger piece
// lands. `label` is the making practice, or "The Lab" for a Gegenmessung instrument.
export interface FeaturedWork {
  title: string
  label: string
  date: string
  href: string
  blurb: string
}

/** The single spotlighted instrument at the top of the section. */
export const FEATURED: FeaturedWork = {
  title: 'No Way of Knowing',
  label: 'Studio',
  date: '17 Jul 2026',
  href: '/studio',
  blurb:
    "A two-faced console on military AI targeting. It shows the state's certainty when it acts, or its verbatim “we have no way of knowing” when it harms — never both at once. To read the second sentence, you have to destroy the first.",
}

/** The curated list below the spotlight, newest-ish first but ordered by force, not date. */
export const INSTRUMENTS: FeaturedWork[] = [
  {
    title: 'The Wrong Sphere',
    label: 'Atelier',
    date: '16 Jul 2026',
    href: '/atelier/werke/2026-07-16-the-wrong-sphere',
    blurb:
      'A real error-correcting code, pushed one bit past its limit — the point where it stops failing and starts to lie, confidently, every time.',
  },
  {
    title: 'The Wider Envelope',
    label: 'Atelier',
    date: '17 Jul 2026',
    href: '/atelier/werke/2026-07-17-the-wider-envelope',
    blurb:
      "The 64-bit number that didn't fit a 16-bit slot, replayed live: the exact conversion that destroyed Ariane 5 — safe in one flight envelope, fatal in the other.",
  },
  {
    title: 'Bycatch',
    label: 'The Lab',
    date: '02 Jul 2026',
    href: '/beifang',
    blurb:
      'Measures which academic publishers leak your identity to ad-tech — caught from a real reader’s browser, where a bot gets waved through clean.',
  },
  {
    title: 'Native Speaker',
    label: 'Studio',
    date: '13 Jul 2026',
    href: '/studio',
    blurb:
      'A border gate that scores your own typed English with a reconstructed AI-text detector, then opens the real lawsuits about who it flags as “machine.”',
  },
  {
    title: 'The Fairness Trap',
    label: 'Field',
    date: '01 Jul 2026',
    href: '/field/werke/2026-07-01-fairness-trap',
    blurb:
      'The COMPAS sentencing-algorithm fight, restaged as paired matrices so you can see both sides were mathematically right at the same time.',
  },
  {
    title: 'The Consensus',
    label: 'The Lab',
    date: '22 Jun 2026',
    href: '/consensus',
    blurb:
      "How much of “the news” is the same six words copied verbatim across outlets, rather than anyone reporting.",
  },
  {
    title: 'The Third Pile',
    label: 'Atelier',
    date: '15 Jul 2026',
    href: '/atelier/werke/2026-07-15-the-third-pile',
    blurb:
      'The project audits its own output and finds, uncomfortably, that the talking-about-itself has grown larger than the work.',
  },
]

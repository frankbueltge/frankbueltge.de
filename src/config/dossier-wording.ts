// Dossier wordings — the curator-facing entry (/dossier), commissioned by the festival line
// (docs/superpowers/specs/2026-08-01-festival-line.md §5.6): one page that answers, in ten
// minutes, what an external curator, juror or researcher needs — what this is, how it proves
// itself, what it has made, who is accountable.
//
// Two-layer rule (pattern: src/config/naming.ts, atelier-wording.ts): everything the hub has
// already approved is IMPORTED from naming.ts, never retyped. Only the sentences new to this
// page live here — and they carry approval: 'draft' until Frank signs them off; the page
// renders the draft chip and stays noindex while draft. No counts in prose (they go stale
// nightly); numbers render from data or not at all.

export const DOSSIER = {
  approval: 'draft' as 'draft' | 'approved',

  metaTitle: 'Dossier — a federated research ecology | Frank Bültge',
  metaDescription:
    'The curator-facing dossier of the research ecology: what it is, how its claims stay checkable, what it has made, and who is accountable.',

  kicker: 'DOSSIER',
  lede:
    'This page is the short way in for curators, jurors and researchers. Everything it states is the compressed form of a public, versioned record — every claim on this page can be walked back to a commit.',

  /** The one-sentence working thesis. Wording follows the festival line
   * (2026-08-01-festival-line.md §1); site-wide adoption waits on the wording gate. */
  thesis:
    'Verifiability as an aesthetic principle: machine research practices whose authorship, failures and dissent can be checked in a public archive — not asserted.',

  sections: {
    practices: {
      heading: 'The practices',
      lead: 'Three machine-run practices and a contact zone. Their one-line descriptions below are the site’s own approved wordings; each door leads to the practice’s public surface, each repository holds its full record.',
    },
    proof: {
      heading: 'How it proves itself',
      lead: 'The apparatus is the argument: gated publication, evidence tiers, preserved dissent, corrections that never overwrite. The receipts are public repositories, not claims about them.',
      items: [
        {
          label: 'gated publication',
          text: 'Nothing reaches this site on a machine’s word — a build gate rejects what is broken, and publication decisions are human and recorded.',
        },
        {
          label: 'honesty tiers',
          text: 'Every element of a studio work is labelled verified, sourced or imagined; blurring the tiers is, in the collective’s own constitution, its cardinal sin.',
        },
        {
          label: 'preserved dissent',
          text: 'When two practices disagree over a classification, the dissent is kept on record and enforced as an invariant — deliberately not adjudicated into one verdict.',
        },
        {
          label: 'failures on the record',
          text: 'Killed works, withdrawn claims, source outages and misfired instruments stay visible and dated; a missing finding is recorded as missing, never bridged.',
        },
      ],
    },
    records: {
      heading: 'Selected records',
      lead: 'A short shelf, chosen for what each shows about the whole; the registers behind the doors hold everything else.',
      items: [
        {
          title: 'NO PART',
          note: 'A print-and-instruction work on the US Supreme Court’s order list — the studio adds no glyph of its own; its own critic’s verdict, published on the reception page, holds it to the world: it still has to touch the world twice.',
          href: '/studio',
        },
        {
          title: 'Coverage Is Not Custody',
          note: 'A field instrument measuring how little of a celebrated counter-forensics work’s social-media evidence base is content-bearing in public archives — evidence infrastructure examined at the seam nobody audits.',
          href: '/field',
        },
        {
          title: 'Model Collapse — a joint inquiry',
          note: 'One question, three practices, three evidentiary regimes, answered in parallel with the disagreement preserved — the register of shared questions holds the record.',
          href: '/encounters/register',
        },
        {
          title: 'The self-consuming loop, built',
          note: 'The atelier’s reproducible model-collapse experiments — seeded, committed, runnable — from the phase that grounds its research programme: error as a relation between a value and its own claimed precision.',
          href: '/atelier',
        },
      ],
    },
    authorship: {
      heading: 'Authorship & accountability',
      lead: 'The machines write; the record shows who wrote what. One human — the architect & conductor — engineered the setup, wrote the constitutions, seeds directions, ends what fails his critique, and carries legal responsibility; the practices research, build, revise and — since 2026-08-10, their own signed act — publish on their own inside that frame, through a gate that rejects anything broken. Persona-named commits, termination powers and each practice’s own signed publication act are all part of the public record: the accountability structure is itself inspectable.',
    },
    contact: {
      heading: 'Talk back',
      lead: 'The ecology delivers outward through a post office and takes material in through public seeds — both with public ledgers.',
      items: [
        { label: 'post office', href: '/post' },
        { label: 'offer a seed', href: '/seed' },
        { label: 'how the machine runs', href: '/apparatus' },
      ],
    },
  },

  repos: [
    { label: 'field-research — Meridian', href: 'https://github.com/frankbueltge/field-research' },
    { label: 'studio — Ensemble', href: 'https://github.com/frankbueltge/studio' },
    { label: 'ulysses — The Atelier', href: 'https://github.com/frankbueltge/ulysses' },
    { label: 'research-ecology — The Middle', href: 'https://github.com/frankbueltge/research-ecology' },
    { label: 'frankbueltge.de — this site', href: 'https://github.com/frankbueltge/frankbueltge.de' },
  ],
} as const

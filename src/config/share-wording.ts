// src/config/share-wording.ts — the words the site adds to a practice's own page when it is shared
// (2026-10-18).
//
// The practices' finished works and presentations are served bare, as the practices built them
// (src/lib/engines/publication.mjs). Until this day a link to one, sent to a curator, showed no
// picture and often no description, and the page itself offered no way back to the site. The build
// now finishes each published page on dist/ (src/lib/engines/share-dist.ts): the preview tags a
// link needs, a preview image (the maker's own still, else a card on the paper ground), and, where
// the house's work frame does not already stand, one line back to the site.
//
// Every word the site adds on those pages is here. The titles and descriptions are the pages' own
// wherever a page has one; these are only the frame around them and the fallback where it has none.
import { NAMING } from './naming'

type Ns = 'atelier' | 'field' | 'studio' | 'plenum' | 'error-as-method' | 'n-1' | 'attention'

const door = (id: string) => NAMING.doors.items.find((d) => d.id === id) as { name: string; persona?: string } | undefined
const named = (id: string, fallback: string) => {
  const d = door(id)
  return d ? (d.persona ? `${d.name} · ${d.persona}` : d.name) : fallback
}
const house = (ns: string, fallback: string) => NAMING.worksRegister.standaloneFrame.houses[ns]?.label ?? fallback

export const SHARE = {
  /** the practice a card and a back strip name, in the doors' own words */
  practice: {
    atelier: { label: 'The Atelier', href: '/atelier', kicker: named('ulysses', 'The Atelier · Assay') },
    field: { label: 'The Field', href: '/field', kicker: named('meridian', 'The Field · Meridian') },
    studio: { label: 'The Studio', href: '/studio', kicker: named('ensemble', 'The Studio · Ensemble') },
    plenum: { label: 'The Plenum', href: '/encounters', kicker: 'The Plenum' },
    'error-as-method': { label: house('error-as-method', 'Error as Method'), href: '/error-as-method', kicker: `${house('error-as-method', 'Error as Method')} · the nightly line` },
    'n-1': { label: house('n-1', 'n-1'), href: '/n-1', kicker: `${house('n-1', 'n-1')} · Remainder` },
    attention: { label: house('attention', 'Machine Attention'), href: '/machine-attention', kicker: house('attention', 'Machine Attention') },
  } satisfies Record<Ns, { label: string; href: string; kicker: string }>,

  /** what a page is, on its card */
  kind: {
    work: 'work',
    presentation: (cycle: string | null) => (cycle ? `presentation · cycle ${cycle}` : 'presentation'),
    report: 'closing report',
    front: 'front page',
    record: 'the record',
    paper: (cycle: string) => `paper · preprint · cycle ${cycle}`,
  },

  /** the description where a page offers none of its own (no meta description, no wall text, no
   *  opening paragraph a sentence can be read from) */
  fallback: (kind: string, practice: string) => `A ${kind} by ${practice}, published at frankbueltge.de.`,

  /** the line back to the site, on a published page that carries no work frame */
  back: {
    site: { label: 'frankbueltge.de', href: '/' },
    prefix: '←',
    /** the strip says that it is the site's, as the work frame does (work-frame.ts) */
    note: 'link added by the site',
    aria: 'Back to the site',
  },

  /** the card on the paper ground, where a page has no still of its maker's own */
  card: {
    domain: 'frankbueltge.de',
    /** the alt text of a generated card: it shows the title and the practice, nothing else */
    alt: (title: string, practice: string) => `${title} — ${practice}`,
    /** the alt text of a maker's own still */
    stillAlt: (title: string, practice: string) => `A still of ${title}, by ${practice}`,
  },

  /** the Field's papers, as one index (/field/papers/) */
  papers: {
    title: 'Papers',
    seoTitle: 'Papers — the Field (Meridian) | Frank Bültge',
    seoDescription: (since: string) =>
      `Every paper the Field (Meridian) has written, one per research cycle since cycle ${since}, in preprint form as the practice wrote it.`,
    kicker: 'The Field · Meridian',
    /** the index's preview card, under its title */
    cardLine: 'every cycle’s paper, in preprint form',
    lead: (since: string) =>
      `Since cycle ${since} the Field presents each cycle’s work as a paper, with a page that accompanies it. Each paper is the practice’s own text, rendered here from its repository as mirrored. Preprints: not peer reviewed.`,
    cycle: (cycle: string) => `cycle ${cycle}`,
    abstract: 'From the abstract:',
    read: 'read the paper',
    presentation: 'the presentation',
    raw: 'paper.md',
    pdf: 'PDF',
    none: 'No paper yet: the first one lands with the Field’s next presentation.',
    repository: 'all of the Field’s presentations, in its repository',
    /** on each paper's page: the way to the index */
    all: 'all papers',
    /** the persona Google Scholar and Zotero name as the author: the name the papers are written under */
    citationAuthor: 'Meridian',
  },
} as const

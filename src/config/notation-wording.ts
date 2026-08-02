// src/config/notation-wording.ts — visitor-facing copy of the notation register
// (spec: docs/superpowers/specs/2026-08-02-notation-register.md).
//
// APPROVAL: 'draft' until Frank signs the sentences off — the page renders the chip.
// The room's NAME is a working name (/notation) and goes through the wording gate
// (src/config/naming.ts, docs/wording-kanon.md) like every hub string.
//
// The rule this file lives under: it names FIELDS and the register's own discipline. The
// grammars a visitor reads on the page are imported from each notation's source of truth
// (src/lib/notation/register.ts) — nothing here restates one.

export const NOTATION = {
  approval: 'draft' as 'draft' | 'approved',
  metaTitle: 'The notation register — the ecology’s writing system | Frank Bültge',
  metaDescription:
    'Every notation the research ecology draws with: its grammar, quoted from the shipped source; its derivation from the published model; its dated changes; its open questions.',
  kicker: 'Research ecology · notation register',
  draftChip: 'wording: draft — awaiting approval',
  approvedChip: 'wording approved',
  h1: 'The notation register',
  lede:
    'This ecology is developing a language for artistic research — a grammar, and therefore a ' +
    'notation. Seven notations are in use; this register keeps each one under proof: what it ' +
    'notates, its sign grammar quoted from the shipped source (never re-typed), where it derives ' +
    'from the published model, when its grammar changed and why, what guards it, and — the ' +
    'research core — the cases it cannot yet write, dated. The practices share no visual grammar ' +
    'by decision (ADR 0010); this page documents the plurality, it does not merge it.',
  discipline:
    'The discipline, in one case: on 2026-08-02 the crossings map met a contact its grammar could ' +
    'not write — an offer answered and closed the same day, with no line opened. The rule was ' +
    'extended in the open, dated, with the case as its first instance (enc-2026-006). A grammar ' +
    'limit found in practice becomes an entry here, always.',
  fields: {
    notates: 'what it notates',
    grammar: 'the sign grammar, quoted from',
    dataDriven: 'the key is data-driven',
    derivation: 'derives from',
    record: 'record',
    changes: 'dated changes',
    validation: 'what guards it',
    palette: 'palette record',
    tests: 'tests',
    openQuestions: 'open grammar questions',
    noneOpen: 'no open questions',
    figure: 'drawn by',
  },
  provenance:
    'Assembled at build time from the shipped sources themselves: the wording configs each figure ' +
    'reads, the palette records in src/lib/dataviz/palette.ts, and the specs under ' +
    'docs/superpowers/specs/. Every pointer on this page is existence-tested ' +
    '(src/lib/notation/register.test.ts); a grammar shown here cannot drift from the figure that ' +
    'draws it, because it is the same string.',
  closing:
    'The register observes; it changes nothing. Where a practice develops notation in its own ' +
    'records, this page quotes and links — it never invents an entry for a practice.',
} as const

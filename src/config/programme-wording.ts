// The wording of /question (2026-11-08; docs/design/2026-11-08-the-programme.md).
export const PROGRAMME = {
  seoTitle: 'The question | Frank Bültge',
  seoDescription:
    'The one large question the research ecology has chosen for itself and holds for eight to twelve weeks: why it was chosen, the plan of its steps, and what the three practices know about it now.',
  kicker: 'The research ecology',
  status: {
    selecting: 'The ecology is choosing its question',
    chosen: 'Question chosen · the architect’s veto day',
    running: 'The question it is working on',
  } as Record<string, string>,
  selectingTitle: 'The ecology is choosing one large question to hold for eight to twelve weeks.',
  lead:
    'Until November 2026 the three practices chose a new subject every few days, and the choice drifted to the smallest question all three could measure. Now the ecology chooses one large, open question itself, from a dossier of candidates drawn from the research and risk agendas of the world and scored in the open for weight, openness, what this house can add and how many steps it carries. It holds that question for eight to twelve weeks. Every cycle is one step of its plan, and the three practices work it each in their own world: the Field brings the evidence, the Atelier the concepts and the critique, the Studio a place a visitor enters. The architect has a veto and does not set the question.',
  setBy: (on: string, setAside: string, setAsideSum: number, sum: number) =>
    `Set by the architect on ${on}, once and as an exception to that rule. The ecology had chosen ${setAside} (final sum ${setAsideSum}); the architect set this question instead (final sum ${sum}). The scores stay as the second reader set them, and the plan for the question set aside stays on record.`,
  step: (n: number) => `Step ${n}`,
  stepNow: 'This cycle’s step',
  parts: {
    question: 'Why this question',
    state: 'What the ecology knows now',
    plan: 'The plan',
    dossier: 'The candidates · listed by field, not ranked · Sum is the writer’s score, Final sum the second reader’s',
  } as Record<string, string>,
  none: 'The Middle has not written the dossier yet. It runs several times a day; the candidates appear here once it has.',
  /** Where to watch the question being worked (link audit, 2026-11-14): the page named the three
   *  practices and their parts in the lead but linked none of them, nor the works of the step. */
  follow: {
    title: 'Follow the work',
    links: [
      { href: '/ecology', label: 'This step’s works, in progress', note: 'what the three practices are making now' },
      { href: '/field', label: 'The Field', note: 'the evidence' },
      { href: '/atelier', label: 'The Atelier', note: 'the concepts and the critique' },
      { href: '/studio', label: 'The Studio', note: 'the form, a place a visitor enters' },
      { href: '/lines', label: 'Research lines', note: 'the earlier questions, resting while the programme runs' },
      { href: '/trending', label: 'Common Ground', note: 'the morning ledger the Middle reads the world from' },
      { href: '/papers', label: 'Paper Catalogue', note: 'what the practices read for it' },
    ],
  },
  source: 'The files in research-ecology ↗',
  foot: 'The Middle’s files, mirrored from research-ecology and rendered as written. Every figure in them links its source.',
}

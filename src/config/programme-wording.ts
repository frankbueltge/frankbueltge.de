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
    'Until November 2026 the three practices chose a new subject every few days, and the choice drifted to the smallest question all three could measure. Now the ecology chooses one large, open question itself, from a dossier of candidates drawn from the research and risk agendas of the world and scored in the open for weight, openness, what this house can add and how many steps it carries. It holds that question for eight to twelve weeks. Every cycle is one step of its plan: the Field brings the evidence, the Atelier the concepts and the critique, the Studio a form for what the Field found. The architect has a veto and does not set the question.',
  step: (n: number) => `Step ${n}`,
  stepNow: 'This cycle’s step',
  parts: {
    question: 'Why this question',
    state: 'What the ecology knows now',
    plan: 'The plan',
    dossier: 'The candidates',
  } as Record<string, string>,
  none: 'The Middle has not written the dossier yet. It runs several times a day; the candidates appear here once it has.',
  source: 'The files in research-ecology ↗',
  foot: 'The Middle’s files, mirrored from research-ecology and rendered as written. Every figure in them links its source.',
}

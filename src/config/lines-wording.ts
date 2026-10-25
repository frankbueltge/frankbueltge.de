// The wording of /lines and /lines/<slug>/ (2026-10-25; docs/design/2026-10-25-the-lines.md).
export const LINES = {
  seoTitle: 'Research lines | Frank Bültge',
  seoDescription:
    'The questions the research ecology keeps working on across cycles: what each line has found, what is still open, and where it docks onto research outside this house.',
  kicker: 'The research ecology',
  title: 'Research lines',
  lead:
    'A cycle asks one question and ends. A line is a question that outlives cycles: what the three practices have already found on it, what is still open, the works and instruments it stands on, and the institutions and research it is in conversation with. The Middle keeps them; every proposal for a next cycle names the line it carries forward, and every new work names what it builds on.',
  none: 'No line is published yet.',
  status: { active: 'active', resting: 'resting', closed: 'closed', unknown: 'status not stated' } as Record<string, string>,
  open: (n: number) => (n === 1 ? '1 open question' : `${n} open questions`),
  read: 'Read the line',
  all: 'All lines',
  rules: 'How lines are kept',
  source: 'The file in research-ecology ↗',
  foot:
    'The Middle’s file, mirrored from research-ecology and rendered as written. Every figure in it is copied from the work it links.',
}

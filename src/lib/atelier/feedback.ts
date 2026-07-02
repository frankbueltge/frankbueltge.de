// src/lib/atelier/feedback.ts
// Rejections inside a GREEN build were invisible to the engines — this renders the feedback
// file the workflow pushes into the engine repo so the next session can react.
import type { IntegrateReport } from './integrate'

export function rejectionFeedback(report: IntegrateReport, ns: string, date: string): string | null {
  if (report.rejected.length === 0) return null
  const lines = report.rejected.map((r) => `- \`works/${r.slug}\` — ${r.reason}`)
  return [
    `# Integration feedback ${date}`,
    '',
    `The site build was green, but ${report.rejected.length} work(s) did not pass the ${ns} integration gate and are NOT on the site:`,
    '',
    ...lines,
    '',
    'Rules: only allowlisted files (work.astro/index.html, meta.json, data.json, .css/.svg/.ts/.js) are copied — anything else is ignored, not fatal. External URLs are welcome as citation links but must not be loaded (no external script/img/fetch/import/Worker).',
    'Fix the work in `works/<slug>/` and commit again — the next integration picks it up automatically.',
    '',
  ].join('\n')
}

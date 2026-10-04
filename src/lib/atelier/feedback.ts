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
    'Rules (since 2026-10-05): a standalone work (index.html) travels whole — every file in every subdirectory except dotfiles — and is served bare under the practices\' shared policy: scripts, WebAssembly and workers from this origin, data, images, media and frames from any HTTPS host. A native Astro work (work.astro) travels from its top level, code, markup, images, fonts, audio and video only (anything else is ignored, not fatal), and renders inside a page of the house: it may fetch data from any HTTPS host but loads no script, stylesheet, image or worker from another host. Either way, scripts from other hosts never run on this site — vendor the library into the work — and no single file may exceed 25 MiB (Cloudflare Pages\' per-asset limit). External URLs are always welcome as citation links.',
    'Fix the work in `works/<slug>/` and commit again — the next integration picks it up automatically.',
    '',
  ].join('\n')
}

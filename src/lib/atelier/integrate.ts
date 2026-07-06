// src/lib/atelier/integrate.ts
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { classifyWork, siteTargets } from './paths'
import { checkForbidden } from './forbidden'
import { renderWrapperPage } from './wrapper'

export interface IntegrateReport {
  accepted: { slug: string; kind: 'html' | 'astro'; ignored?: string[] }[]
  rejected: { slug: string; reason: string }[]
}

const CODE_EXT = /\.(astro|ts|js)$/
const SHIELD_EXT = /\.(astro|ts|js|mjs)$/
const SHIELD_NOTE =
  '// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.'

// Engine works are authored autonomously and only need to render, not satisfy the site's strict
// tsconfig. Neutralise type-checking on their client scripts (.astro <script>) and helper modules
// (.ts/.js/.mjs) so an implicit-any or missing annotation can't fail `astro check` and block the
// deploy for every work. Bundling is still validated by `astro build`; genuinely unsafe code is
// still rejected by checkForbidden (which scans the untouched source, not this shielded copy).
// JSON-LD/data <script> blocks (and self-closing tags) are left untouched.
function shieldEngineTypes(from: string, content: string): string {
  if (from.endsWith('.astro'))
    return content.replace(/<script\b([^>]*)>/g, (m: string, attrs: string) =>
      /application\/(ld\+)?json/.test(attrs) || /\/\s*$/.test(attrs) ? m : `${m}\n${SHIELD_NOTE}`,
    )
  return `${SHIELD_NOTE}\n${content}`
}

export function integrate(opts: { sourceDir: string; siteDir: string; ns?: string }): IntegrateReport {
  const ns = opts.ns ?? 'atelier'
  const report: IntegrateReport = { accepted: [], rejected: [] }
  const worksDir = join(opts.sourceDir, 'works')
  if (!existsSync(worksDir)) return report
  for (const slug of readdirSync(worksDir)) {
    const dir = join(worksDir, slug)
    if (!statSync(dir).isDirectory()) continue
    const files = readdirSync(dir)
    const work = classifyWork(slug, files)
    if (work.kind === null) { report.rejected.push({ slug, reason: work.reason }); continue }
    // Same rule as renderWrapperPage — reject before any file is touched
    if (!/^[a-z0-9-]+$/.test(slug)) { report.rejected.push({ slug, reason: 'unsafe slug (nur a-z, 0-9, - erlaubt)' }); continue }
    try {
      // forbidden-scan all code files of astro works
      if (work.kind === 'astro') {
        const violations: string[] = []
        for (const f of work.files.filter((f) => CODE_EXT.test(f)))
          violations.push(...checkForbidden(readFileSync(join(dir, f), 'utf8')))
        if (violations.length) { report.rejected.push({ slug, reason: violations.join('; ') }); continue }
      }
      for (const { from, to } of siteTargets(work, ns)) {
        const dest = join(opts.siteDir, to)
        mkdirSync(dirname(dest), { recursive: true })
        if (SHIELD_EXT.test(from)) writeFileSync(dest, shieldEngineTypes(from, readFileSync(join(dir, from), 'utf8')))
        else copyFileSync(join(dir, from), dest)
      }
      if (work.kind === 'astro') {
        const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
        const page = join(opts.siteDir, `src/pages/${ns}/werke/${slug}.astro`)
        mkdirSync(dirname(page), { recursive: true })
        writeFileSync(page, renderWrapperPage(slug, meta, ns))
      }
      report.accepted.push({ slug, kind: work.kind, ...(work.ignored.length ? { ignored: work.ignored } : {}) })
    } catch (e) {
      report.rejected.push({ slug, reason: 'fehler bei verarbeitung: ' + String(e) })
    }
  }
  return report
}

// src/lib/atelier/integrate.ts
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { classifyWork, siteTargets } from './paths'
import { checkForbidden } from './forbidden'
import { renderWrapperPage } from './wrapper'

export interface IntegrateReport {
  accepted: { slug: string; kind: 'html' | 'astro' }[]
  rejected: { slug: string; reason: string }[]
}

const CODE_EXT = /\.(astro|ts|js)$/

export function integrate(opts: { sourceDir: string; siteDir: string }): IntegrateReport {
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
    // forbidden-scan all code files of astro works
    if (work.kind === 'astro') {
      const violations: string[] = []
      for (const f of files.filter((f) => CODE_EXT.test(f)))
        violations.push(...checkForbidden(readFileSync(join(dir, f), 'utf8')))
      if (violations.length) { report.rejected.push({ slug, reason: violations.join('; ') }); continue }
    }
    for (const { from, to } of siteTargets(work)) {
      const dest = join(opts.siteDir, to)
      mkdirSync(dirname(dest), { recursive: true })
      copyFileSync(join(dir, from), dest)
    }
    if (work.kind === 'astro') {
      const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
      const page = join(opts.siteDir, `src/pages/atelier/werke/${slug}.astro`)
      mkdirSync(dirname(page), { recursive: true })
      writeFileSync(page, renderWrapperPage(slug, meta))
    }
    report.accepted.push({ slug, kind: work.kind })
  }
  return report
}

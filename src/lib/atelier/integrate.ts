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

// One work directory → site targets. Shared by the historical works/ pass and the
// v4 published-projects pass; the technical gate (classify, slug, forbidden-scan,
// shielding) is identical for both.
function importWorkDir(dir: string, slug: string, ns: string, siteDir: string, report: IntegrateReport): void {
  const files = readdirSync(dir)
  const work = classifyWork(slug, files)
  if (work.kind === null) { report.rejected.push({ slug, reason: work.reason }); return }
  // Same rule as renderWrapperPage — reject before any file is touched
  if (!/^[a-z0-9-]+$/.test(slug)) { report.rejected.push({ slug, reason: 'unsafe slug (nur a-z, 0-9, - erlaubt)' }); return }
  try {
    // forbidden-scan all code files of astro works
    if (work.kind === 'astro') {
      const violations: string[] = []
      for (const f of work.files.filter((f) => CODE_EXT.test(f)))
        violations.push(...checkForbidden(readFileSync(join(dir, f), 'utf8')))
      if (violations.length) { report.rejected.push({ slug, reason: violations.join('; ') }); return }
    }
    for (const { from, to } of siteTargets(work, ns)) {
      const dest = join(siteDir, to)
      mkdirSync(dirname(dest), { recursive: true })
      if (SHIELD_EXT.test(from)) writeFileSync(dest, shieldEngineTypes(from, readFileSync(join(dir, from), 'utf8')))
      else copyFileSync(join(dir, from), dest)
    }
    if (work.kind === 'astro') {
      const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
      const page = join(siteDir, `src/pages/${ns}/werke/${slug}.astro`)
      mkdirSync(dirname(page), { recursive: true })
      writeFileSync(page, renderWrapperPage(slug, meta, ns))
    }
    report.accepted.push({ slug, kind: work.kind, ...(work.ignored.length ? { ignored: work.ignored } : {}) })
  } catch (e) {
    report.rejected.push({ slug, reason: 'fehler bei verarbeitung: ' + String(e) })
  }
}

// Publication gate for Protocol-v4 projects (migration patch M-08): a project under
// projects/<id>/ reaches the curated works surface ONLY through a valid, human-approved
// PUBLICATION.json. Returns the reason for refusal, or null when the manifest is valid.
// The site never infers publication from presence, merge, build or project status.
function publicationRefusal(pub: unknown, id: string, projectDir: string): string | null {
  if (typeof pub !== 'object' || pub === null) return 'manifest is not an object'
  const p = pub as Record<string, unknown>
  if (p.project_id !== id) return 'project_id does not match the project directory'
  if (p.status !== 'PUBLISHED_WORK') return `status must be PUBLISHED_WORK (got ${JSON.stringify(p.status ?? null)})`
  if (typeof p.approved_by !== 'string' || !p.approved_by.trim()) return 'approved_by (human approver) is required'
  if (typeof p.approved_at !== 'string' || !p.approved_at.trim()) return 'approved_at is required'
  for (const key of ['work_path', 'exposition_path', 'apparatus_path'] as const) {
    const v = p[key]
    if (typeof v !== 'string' || !v.trim()) return `${key} is required`
    const rel = v.replace(/^\.\//, '')
    if (rel.split('/').some((seg) => seg === '..' || seg === '')) return `${key} must stay inside the project directory`
    if (!existsSync(join(projectDir, rel))) return `${key} does not resolve`
  }
  return null
}

export function integrate(opts: { sourceDir: string; siteDir: string; ns?: string }): IntegrateReport {
  const ns = opts.ns ?? 'atelier'
  const report: IntegrateReport = { accepted: [], rejected: [] }

  // Historical and curated works/ (v1–v3 record; protected against autonomous writes
  // engine-side since Protocol v4).
  const worksDir = join(opts.sourceDir, 'works')
  if (existsSync(worksDir)) {
    for (const slug of readdirSync(worksDir)) {
      const dir = join(worksDir, slug)
      if (!statSync(dir).isDirectory()) continue
      importWorkDir(dir, slug, ns, opts.siteDir, report)
    }
  }

  // Protocol-v4 projects: active projects, studies, killed lines and candidates are
  // research records and stay invisible here — only PUBLISH (a valid PUBLICATION.json,
  // which only the responsible human may create) projects a work onto the site.
  const projectsDir = join(opts.sourceDir, 'projects')
  if (existsSync(projectsDir)) {
    for (const id of readdirSync(projectsDir)) {
      if (id.startsWith('_')) continue
      const dir = join(projectsDir, id)
      if (!statSync(dir).isDirectory()) continue
      const manifest = join(dir, 'PUBLICATION.json')
      if (!existsSync(manifest)) continue // unpublished project states are not works — no rejection, by design
      try {
        const pub = JSON.parse(readFileSync(manifest, 'utf8'))
        const refusal = publicationRefusal(pub, id, dir)
        if (refusal) { report.rejected.push({ slug: id, reason: `PUBLICATION.json: ${refusal}` }); continue }
        const workDir = join(dir, String((pub as Record<string, unknown>).work_path).replace(/^\.\//, ''))
        if (!statSync(workDir).isDirectory()) { report.rejected.push({ slug: id, reason: 'PUBLICATION.json: work_path is not a directory' }); continue }
        importWorkDir(workDir, id, ns, opts.siteDir, report)
      } catch (e) {
        report.rejected.push({ slug: id, reason: 'PUBLICATION.json: fehler bei verarbeitung: ' + String(e) })
      }
    }
  }

  return report
}

// src/lib/study/registry.ts — which studies exist, and which of them the architect has approved (2026-10-27).
//
// A study exists where a published work of the Atelier, the Field or the Studio carries a `study.json`
// beside its `index.html`: in `werke-html/<slug>/`, or in the open cycle's folders while a cycle is in
// its working phase (src/lib/engines/publication.mjs). The same layout stands in the mirrors under
// public/ and in the built site under dist/, so one walk serves the build step, the approval workflow
// and the /studies page.
//
// A study takes answers only when src/data/studies/approved.json holds an approval for exactly its
// file: the same id, the same work, and the SHA-256 of the manifest's bytes. A practice that changes
// its manifest changes the hash, and the study waits for a new approval; the approval workflow opens a
// pull request for it, and Frank's merge is the approval (his decision of 2026-10-27, wording private).
//
// Node only: it reads the file system. The Functions read what the build wrote, dist/study/studies.json.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { openCycleFolders } from '../engines/publication.mjs'
import { readOpenCycle } from '../engines/publication-prune.mjs'
import { manifestProblems, type StudyManifest } from './manifest'

export const STUDY_PRACTICES = ['atelier', 'field', 'studio'] as const
export type StudyPractice = (typeof STUDY_PRACTICES)[number]

export const APPROVALS_FILE = 'src/data/studies/approved.json'
export const REGISTRY_FILE = 'study/studies.json'
export const APPROVALS_CONTRACT = 'study-approvals/1'

const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/

export interface Approval {
  id: string
  /** the work, as the reception names it: `<practice>:<slug>` */
  work: string
  sha256: string
  /** the day the architect merged it */
  approved: string
}

export interface ApprovalsFile {
  $contract: typeof APPROVALS_CONTRACT
  approvals: Approval[]
}

export type StudyState = 'approved' | 'closed' | 'changed' | 'proposed' | 'invalid'

export interface FoundStudy {
  practice: StudyPractice
  /** `<practice>:<slug>` */
  work: string
  slug: string
  /** the work's page */
  href: string
  /** the manifest, relative to the base it was found under */
  file: string
  sha256: string
  manifest: StudyManifest | null
  problems: string[]
}

export interface ResolvedStudy extends FoundStudy {
  state: StudyState
  approval: Approval | null
}

const dirs = (p: string): string[] => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [])
const isFile = (p: string): boolean => existsSync(p) && statSync(p).isFile()

export const sha256 = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex')

/** The work folders a study may stand in, relative to `base` (public/ or dist/). */
export function studyFolders(root: string): { practice: StudyPractice; parent: string }[] {
  const out: { practice: StudyPractice; parent: string }[] = STUDY_PRACTICES.map((p) => ({ practice: p, parent: `${p}/werke-html` }))
  for (const folder of openCycleFolders(readOpenCycle(root))) {
    const practice = folder.split('/')[0] as StudyPractice
    if ((STUDY_PRACTICES as readonly string[]).includes(practice)) out.push({ practice, parent: folder })
  }
  return out
}

/** Every `study.json` beside a published work's index.html under `base`. */
export function findStudies(base: string, root: string): FoundStudy[] {
  const out: FoundStudy[] = []
  for (const { practice, parent } of studyFolders(root)) {
    for (const slug of dirs(join(base, parent))) {
      if (!SLUG.test(slug)) continue
      const file = `${parent}/${slug}/study.json`
      if (!isFile(join(base, file)) || !isFile(join(base, parent, slug, 'index.html'))) continue
      const bytes = readFileSync(join(base, file))
      let manifest: StudyManifest | null = null
      let problems: string[]
      try {
        const parsed = JSON.parse(bytes.toString('utf8'))
        problems = manifestProblems(parsed)
        if (!problems.length) manifest = parsed as StudyManifest
      } catch {
        problems = ['not valid JSON']
      }
      out.push({ practice, work: `${practice}:${slug}`, slug, href: `/${parent}/${slug}/`, file, sha256: sha256(bytes), manifest, problems })
    }
  }
  return out
}

export function readApprovals(root: string): Approval[] {
  const p = join(root, APPROVALS_FILE)
  if (!isFile(p)) return []
  const f = JSON.parse(readFileSync(p, 'utf8')) as ApprovalsFile
  if (f.$contract !== APPROVALS_CONTRACT || !Array.isArray(f.approvals)) throw new Error(`${APPROVALS_FILE}: not a ${APPROVALS_CONTRACT} file`)
  return f.approvals
}

/** Each found study with its state. A study id used by two works stops both. */
export function resolveStudies(found: readonly FoundStudy[], approvals: readonly Approval[], today: string): ResolvedStudy[] {
  const byId = new Map<string, number>()
  for (const s of found) if (s.manifest) byId.set(s.manifest.id, (byId.get(s.manifest.id) ?? 0) + 1)
  return found.map((s) => {
    if (!s.manifest) return { ...s, state: 'invalid' as const, approval: null }
    if ((byId.get(s.manifest.id) ?? 0) > 1) return { ...s, problems: [`id ${s.manifest.id} is used by more than one work`], state: 'invalid' as const, approval: null }
    const approval = approvals.find((a) => a.id === s.manifest!.id && a.work === s.work) ?? null
    if (!approval) return { ...s, state: 'proposed' as const, approval: null }
    if (approval.sha256 !== s.sha256) return { ...s, state: 'changed' as const, approval }
    if (s.manifest.closes !== undefined && today > s.manifest.closes) return { ...s, state: 'closed' as const, approval }
    return { ...s, state: 'approved' as const, approval }
  })
}

/** What the endpoint may know: every approval, with its state today, and the manifest of each
 *  approved one. Only `approved` takes answers; the record of every listed study can be read. */
export interface RegistryEntry {
  id: string
  work: string
  href: string | null
  state: 'approved' | 'closed' | 'changed' | 'gone'
  sha256: string
  approved: string
  manifest: StudyManifest | null
}

export function registryOf(resolved: readonly ResolvedStudy[], approvals: readonly Approval[]): { schema: 1; known: RegistryEntry[] } {
  const known = approvals.map((a): RegistryEntry => {
    const s = resolved.find((r) => r.manifest?.id === a.id && r.work === a.work)
    const state = !s ? 'gone' : s.state === 'approved' || s.state === 'closed' ? s.state : 'changed'
    return {
      id: a.id,
      work: a.work,
      href: s?.href ?? null,
      state,
      sha256: a.sha256,
      approved: a.approved,
      manifest: state === 'approved' || state === 'closed' ? s!.manifest : null,
    }
  })
  return { schema: 1, known: known.sort((x, y) => x.id.localeCompare(y.id)) }
}

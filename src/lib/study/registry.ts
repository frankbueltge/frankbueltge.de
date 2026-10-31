// src/lib/study/registry.ts — which studies exist, and what the house's check made of each (2026-10-27;
// the check replaced the architect's approval on 2026-10-28).
//
// A study exists where a published work of the Atelier, the Field or the Studio carries a `study.json`
// beside its `index.html`: in `werke-html/<slug>/`, or in the open cycle's folders while a cycle is in
// its working phase (src/lib/engines/publication.mjs). Since 2026-10-29 the nightly line's works may
// ask too (Frank's decision, wording private): a work's own face in `error-as-method/works-html/<slug>/`,
// or a work that is only a stage, in `error-as-method/<slug>/`. The same layout stands in the mirrors under
// public/ and in the built site under dist/, so one walk serves the build step, the check workflow and
// the /studies page.
//
// A study takes answers only when src/data/studies/checks.json holds a passing check for exactly its
// file: the same id, the same work, and the SHA-256 of the manifest's bytes (src/lib/study/check.ts). A
// practice that changes its manifest changes the hash, and the study waits until the check has read
// the new version. No person approves a study (Frank's decision of 2026-10-28, wording private); the
// architect, or a session that finds a study breaking the rules, can stop one in
// src/data/studies/stopped.json, whatever its file.
//
// A study's id begins with the practice whose work asks (`studio-…`), so no practice can take, or
// stop, another's study by using its id. Within a practice an id names one work: two works with the
// same id both wait until one gives it up. One work found in two places — the open cycle's folder and,
// once published, werke-html — is one work, and the published place is the one that asks.
//
// Node only: it reads the file system. The Functions read what the build wrote, dist/study/studies.json.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { openCycleFolders } from '../engines/publication.mjs'
import { readOpenCycle } from '../engines/publication-prune.mjs'
import { CHECK_REASONS, type CheckReason } from './check'
import { isClosed, LIMITS, manifestProblems, STUDY_ID, type StudyManifest } from './manifest'

export const STUDY_PRACTICES = ['atelier', 'field', 'studio', 'error-as-method'] as const
export type StudyPractice = (typeof STUDY_PRACTICES)[number]

export const CHECKS_FILE = 'src/data/studies/checks.json'
export const STOPS_FILE = 'src/data/studies/stopped.json'
export const REGISTRY_FILE = 'study/studies.json'
export const CHECKS_CONTRACT = 'study-checks/1'
export const STOPS_CONTRACT = 'study-stops/1'

const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/
const WORK = /^(atelier|field|studio|error-as-method):[a-z0-9][a-z0-9-]{0,119}$/
const OWN_ID = /^(atelier|field|studio|error-as-method)-/

/** Where each practice's published works stand, the published place first. The nightly line serves
 *  a text work's own face under `works-html/`, and a work that is only a stage at its own route. */
const WORK_FOLDERS: Record<StudyPractice, readonly string[]> = {
  atelier: ['atelier/werke-html'],
  field: ['field/werke-html'],
  studio: ['studio/werke-html'],
  'error-as-method': ['error-as-method/works-html', 'error-as-method'],
}
/** Folders inside a practice's tree that hold works rather than being one. */
const CONTAINERS = new Set(['error-as-method/works-html'])
const SHA256 = /^[0-9a-f]{64}$/
const DIGEST = /^[0-9a-f]{12}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/

/** One reading of one version of a study's file by the house's check (./check.ts). */
export interface Check {
  id: string
  /** the work, as the reception names it: `<practice>:<slug>` */
  work: string
  sha256: string
  /** the UTC day of the check */
  checked: string
  model: string
  /** the first 12 hex digits of the SHA-256 of the prompt it ran under */
  prompt: string
  verdict: 'pass' | 'block'
  /** a refusal's reason */
  reason?: CheckReason
  /** the question a refusal concerns, 0 for the study's own text, null when the check named none */
  question?: number | null
}

export interface ChecksFile {
  $contract: typeof CHECKS_CONTRACT
  checks: Check[]
}

/** A study that takes no answers, whatever its file, until the stop is removed. It names the study's
 *  id and its work, and holds for either: a practice that renames its study does not lift the stop. */
export interface Stop {
  id: string
  /** the work, `<practice>:<slug>` */
  work: string
  /** the day it was stopped */
  stopped: string
  /** what was found, in a sentence */
  why: string
}

export interface StopsFile {
  $contract: typeof STOPS_CONTRACT
  stopped: Stop[]
}

export type StudyState = 'open' | 'closed' | 'stopped' | 'unchecked' | 'refused' | 'invalid'

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
  /** the check of exactly this file, if there is one */
  check: Check | null
  stop: Stop | null
}

const dirs = (p: string): string[] => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [])
const isFile = (p: string): boolean => existsSync(p) && statSync(p).isFile()

export const sha256 = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex')

/** The work folders a study may stand in, relative to `base` (public/ or dist/). */
export function studyFolders(root: string): { practice: StudyPractice; parent: string }[] {
  const out: { practice: StudyPractice; parent: string }[] = STUDY_PRACTICES.flatMap((p) => WORK_FOLDERS[p].map((parent) => ({ practice: p, parent })))
  for (const folder of openCycleFolders(readOpenCycle(root))) {
    const practice = folder.split('/')[0] as StudyPractice
    if ((STUDY_PRACTICES as readonly string[]).includes(practice)) out.push({ practice, parent: folder })
  }
  return out
}

/** A file that stands beside a published work. */
export interface WorkFile {
  practice: StudyPractice
  /** `<practice>:<slug>` */
  work: string
  slug: string
  /** the work's page */
  href: string
  /** relative to the base it was found under */
  file: string
}

/** Every file called `name` beside a published work's index.html under `base`. werke-html is walked
 *  first, so a work that also still stands in the open cycle's folder is found once, where it is
 *  published. */
export function filesBesideWorks(base: string, root: string, name: string): WorkFile[] {
  const out: WorkFile[] = []
  const seen = new Set<string>()
  for (const { practice, parent } of studyFolders(root)) {
    for (const slug of dirs(join(base, parent))) {
      if (!SLUG.test(slug) || seen.has(`${practice}:${slug}`) || CONTAINERS.has(`${parent}/${slug}`)) continue
      const file = `${parent}/${slug}/${name}`
      if (!isFile(join(base, file)) || !isFile(join(base, parent, slug, 'index.html'))) continue
      seen.add(`${practice}:${slug}`)
      out.push({ practice, work: `${practice}:${slug}`, slug, href: `/${parent}/${slug}/`, file })
    }
  }
  return out
}

/** Where a file beside a work stands in the practice's own repository: `works/<slug>/` (every work of
 *  the nightly line, whether a face or a stage), or the open cycle's folder `artifacts/cycle-NNN/<slug>/`. */
export const ownPath = (f: Pick<WorkFile, 'practice' | 'slug' | 'file'>): string =>
  f.practice === 'error-as-method' || f.file.includes('/werke-html/')
    ? `works/${f.slug}/${f.file.slice(f.file.lastIndexOf('/') + 1)}`
    : f.file.slice(f.practice.length + 1)

/** Every `study.json` beside a published work's index.html under `base`. */
export function findStudies(base: string, root: string): FoundStudy[] {
  return filesBesideWorks(base, root, 'study.json').map((f) => {
    const bytes = readFileSync(join(base, f.file))
    let manifest: StudyManifest | null = null
    let problems: string[]
    if (bytes.length > LIMITS.bytes) problems = [`the file is ${bytes.length} bytes; at most ${LIMITS.bytes}`]
    else {
      try {
        const parsed = JSON.parse(bytes.toString('utf8'))
        problems = manifestProblems(parsed)
        if (!problems.length) manifest = parsed as StudyManifest
      } catch {
        problems = ['not valid JSON']
      }
    }
    return { ...f, sha256: sha256(bytes), manifest, problems }
  })
}

const readJson = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'))

/** The committed checks, refused whole if one is malformed or a file is checked twice: the registry is
 *  then not written, and the endpoints stand by rather than guess which verdict holds. */
export function readChecks(root: string): Check[] {
  const p = join(root, CHECKS_FILE)
  if (!isFile(p)) return []
  const f = readJson(p) as ChecksFile
  if (f?.$contract !== CHECKS_CONTRACT || !Array.isArray(f.checks)) throw new Error(`${CHECKS_FILE}: not a ${CHECKS_CONTRACT} file`)
  const seen = new Set<string>()
  for (const c of f.checks) {
    const head =
      c && typeof c.id === 'string' && STUDY_ID.test(c.id) && typeof c.work === 'string' && WORK.test(c.work) && c.id.startsWith(`${c.work.split(':')[0]}-`) &&
      typeof c.sha256 === 'string' && SHA256.test(c.sha256) && typeof c.checked === 'string' && DAY.test(c.checked) &&
      typeof c.model === 'string' && c.model.length > 0 && c.model.length <= 80 && typeof c.prompt === 'string' && DIGEST.test(c.prompt)
    const verdict =
      c?.verdict === 'pass'
        ? c.reason === undefined && c.question === undefined
        : c?.verdict === 'block' && (CHECK_REASONS as readonly string[]).includes(c.reason ?? '') &&
          (c.question === undefined || c.question === null || (Number.isInteger(c.question) && c.question >= 0))
    if (!head || !verdict) throw new Error(`${CHECKS_FILE}: a malformed check (${JSON.stringify(c?.id ?? null)})`)
    const key = `${c.id} ${c.work} ${c.sha256}`
    if (seen.has(key)) throw new Error(`${CHECKS_FILE}: the same file of ${c.id} is checked twice`)
    seen.add(key)
  }
  return f.checks
}

/** The committed stops, refused whole if one is malformed or a study is stopped twice. */
export function readStops(root: string): Stop[] {
  const p = join(root, STOPS_FILE)
  if (!isFile(p)) return []
  const f = readJson(p) as StopsFile
  if (f?.$contract !== STOPS_CONTRACT || !Array.isArray(f.stopped)) throw new Error(`${STOPS_FILE}: not a ${STOPS_CONTRACT} file`)
  const ids = new Set<string>()
  for (const x of f.stopped) {
    const ok =
      x && typeof x.id === 'string' && STUDY_ID.test(x.id) && OWN_ID.test(x.id) && typeof x.work === 'string' && WORK.test(x.work) &&
      x.id.startsWith(`${x.work.split(':')[0]}-`) && typeof x.stopped === 'string' && DAY.test(x.stopped) &&
      typeof x.why === 'string' && x.why.trim().length > 0 && x.why.length <= 500
    if (!ok) throw new Error(`${STOPS_FILE}: a malformed stop (${JSON.stringify(x?.id ?? null)})`)
    if (ids.has(x.id)) throw new Error(`${STOPS_FILE}: the study ${x.id} is stopped twice`)
    ids.add(x.id)
  }
  return f.stopped
}

/** Each study that ever passed the check, with the last version that passed: the ones that may have
 *  answers, so their record stays readable after their work has gone. */
export function answerable(checks: readonly Check[]): Check[] {
  const last = new Map<string, Check>()
  for (const c of checks) if (c.verdict === 'pass') last.set(c.id, c)
  return [...last.values()].sort((x, y) => x.id.localeCompare(y.id))
}

const ownPrefix = (s: FoundStudy): boolean => Boolean(s.manifest?.id.startsWith(`${s.practice}-`))

/** Each found study with its state. An id must begin with its practice; one used by two works of
 *  that practice stops both. A stop outranks every verdict, and a refusal outranks the calendar. */
export function resolveStudies(found: readonly FoundStudy[], checks: readonly Check[], stops: readonly Stop[], today: string): ResolvedStudy[] {
  const byId = new Map<string, number>()
  for (const s of found) if (s.manifest && ownPrefix(s)) byId.set(s.manifest.id, (byId.get(s.manifest.id) ?? 0) + 1)
  return found.map((s): ResolvedStudy => {
    if (!s.manifest) return { ...s, state: 'invalid', check: null, stop: null }
    if (!ownPrefix(s)) return { ...s, problems: [`id: begin it with "${s.practice}-", the practice whose work asks`], state: 'invalid', check: null, stop: null }
    if ((byId.get(s.manifest.id) ?? 0) > 1) return { ...s, problems: [`id ${s.manifest.id} is used by more than one of your works`], state: 'invalid', check: null, stop: null }
    const id = s.manifest.id
    const check = checks.find((c) => c.id === id && c.work === s.work && c.sha256 === s.sha256) ?? null
    const stop = stops.find((x) => x.id === id || x.work === s.work) ?? null
    if (stop) return { ...s, state: 'stopped', check, stop }
    if (check?.verdict === 'block') return { ...s, state: 'refused', check, stop }
    if (isClosed(s.manifest, today)) return { ...s, state: 'closed', check, stop }
    return { ...s, state: check ? 'open' : 'unchecked', check, stop }
  })
}

/** What the endpoints and the frame may know: every readable study with its state today, the manifest
 *  of each open one (and of a closed one that had passed), and every study that once passed and no
 *  longer stands beside its work. Only `open` takes answers; the record of every listed study can be
 *  read. */
export interface RegistryEntry {
  id: string
  work: string
  href: string | null
  state: Exclude<StudyState, 'invalid'> | 'gone'
  /** the SHA-256 of the file that stands now, or, once gone, of the last one that passed */
  sha256: string
  manifest: StudyManifest | null
}

/** Whether the house may repeat a study's own words, in the frame or on /studies: only once the check
 *  has passed exactly this file, and only while the study is open or closed — never for one that waits,
 *  was refused or was stopped. */
export const wordsShown = (s: ResolvedStudy): boolean => s.check?.verdict === 'pass' && (s.state === 'open' || s.state === 'closed')

export function registryOf(resolved: readonly ResolvedStudy[], checks: readonly Check[]): { schema: 1; known: RegistryEntry[] } {
  const known: RegistryEntry[] = []
  for (const s of resolved) {
    if (s.state === 'invalid' || !s.manifest) continue
    known.push({ id: s.manifest.id, work: s.work, href: s.href, state: s.state, sha256: s.sha256, manifest: wordsShown(s) ? s.manifest : null })
  }
  for (const c of answerable(checks)) {
    if (known.some((k) => k.id === c.id)) continue
    known.push({ id: c.id, work: c.work, href: null, state: 'gone', sha256: c.sha256, manifest: null })
  }
  return { schema: 1, known: known.sort((x, y) => x.id.localeCompare(y.id)) }
}

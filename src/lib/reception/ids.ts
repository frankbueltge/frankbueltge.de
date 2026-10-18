// src/lib/reception/ids.ts — which works can be rated, and how a rating names its work (2026-10-17).
//
// Frank's decision of 2026-10-17 (wording private, paraphrased): every work the site publishes can be
// rated from 1 to 5, with an optional note; the architect's notes go live without approval, visitors'
// notes after the automatic spam protection /seed already uses; every night the practices receive
// what came in. The design is docs/design/2026-10-17-the-reception.md.
//
// A work is named `<practice>:<slug>`. The list of ratable ids is not typed anywhere: it is derived
// at build time from what the build actually published (src/lib/reception/dist.ts writes
// dist/reception/works.json after the publication rule has pruned dist/), and the endpoint refuses
// every id that list does not carry. A work that leaves the site stops being ratable with the next
// deploy; its committed ratings stay in the snapshot.

/** The houses whose works can be rated. Arch is not among them, on purpose: its works are served
 *  bare because its own model forbids paratext on them (naming.ts, `houses.arch.bare`), its room
 *  already carries the one reception question the practice designed, and it no longer runs. */
export const RECEPTION_PRACTICES = ['lab', 'field', 'atelier', 'studio', 'error-as-method', 'n-1', 'attention'] as const
export type ReceptionPractice = (typeof RECEPTION_PRACTICES)[number]

/** What a ratable thing is, for the record page and the practices' files. */
export type ReceptionKind = 'experiment' | 'work' | 'presentation' | 'report' | 'archive'

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/
export const WORK_ID_RE = new RegExp(`^(${RECEPTION_PRACTICES.join('|')}):([a-z0-9][a-z0-9-]{0,119})$`)

export function isWorkId(value: unknown): value is string {
  return typeof value === 'string' && WORK_ID_RE.test(value)
}

export function workId(practice: ReceptionPractice, slug: string): string {
  const id = `${practice}:${slug}`
  if (!WORK_ID_RE.test(id)) throw new Error(`not a reception id: ${id}`)
  return id
}

export function practiceOfId(id: string): ReceptionPractice | null {
  const m = WORK_ID_RE.exec(id)
  return m ? (m[1] as ReceptionPractice) : null
}

/** How the record and the practices' files name each house. */
export const PRACTICE_LABEL: Record<ReceptionPractice, string> = {
  lab: 'The lab',
  field: 'The Field (Meridian)',
  atelier: 'The Atelier (Assay)',
  studio: 'The Studio (Ensemble)',
  'error-as-method': 'Error as Method (the nightly line)',
  'n-1': 'n-1',
  attention: 'Machine Attention',
}

/**
 * Where each practice receives its file, and with which secret the nightly workflow writes it. The
 * three ecology practices are written with the same tokens and into the same folders as the refusal
 * letters of their integrate workflows. The nightly line and n-1 had no token that writes into their
 * repositories (their integrates only read), so both share RECEPTION_BOT_TOKEN; n-1 keeps no
 * feedback folder, so its file stands at the repository's root. The lab and Machine Attention are not
 * practices that open sessions: their ratings stand on /reception and in the snapshot only.
 */
export const DELIVERY: Partial<Record<ReceptionPractice, { repo: string; path: string; secret: string }>> = {
  atelier: { repo: 'frankbueltge/ulysses', path: 'atelier-feedback/reception.md', secret: 'ATELIER_BOT_TOKEN' },
  field: { repo: 'frankbueltge/field-research', path: 'field-feedback/reception.md', secret: 'FIELD_BOT_TOKEN' },
  studio: { repo: 'frankbueltge/studio', path: 'studio-feedback/reception.md', secret: 'STUDIO_BOT_TOKEN' },
  'error-as-method': { repo: 'frankbueltge/error-as-method', path: 'feedback/reception.md', secret: 'RECEPTION_BOT_TOKEN' },
  'n-1': { repo: 'frankbueltge/n-1', path: 'reception.md', secret: 'RECEPTION_BOT_TOKEN' },
}

/** One ratable work, as the build lists it in dist/reception/works.json. */
export interface RatableWork {
  id: string
  practice: ReceptionPractice
  kind: ReceptionKind
  title: string
  /** the page a visitor rates it on; the first one found where a work has two */
  href: string
}

/** The form's address for one work. */
export const formHref = (id: string): string => `/reception/rate?work=${encodeURIComponent(id)}`

/** A page address without its trailing slash or index.html, so `/consensus/`, `/consensus` and
 *  `/consensus/index.html` name one page. */
export function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '')
  return p === '' ? '/' : p
}

/** The parts of the registry the Astro pages need, handed in so this module stays pure. */
export interface PageSources {
  /** the lab's experiments: werke.ts entries with a research line */
  experiments: readonly { id: string; href: string; title: string }[]
  /** native Astro works of the practices: `<ns>/<slug>` → title */
  astroWorks: ReadonlyMap<string, string>
  /** the nightly line's works that have a text page: slug → title */
  nightlyTexts: ReadonlyMap<string, string>
}

/**
 * The work a page the site renders itself presents, or null. Read by the reception block in
 * Page.astro, which renders nothing where this returns null.
 */
export function workForPage(pathname: string, src: PageSources): Omit<RatableWork, 'href'> | null {
  const path = normalizePath(pathname)
  const astro = /^\/(field|atelier|studio)\/werke\/([a-z0-9-]+)$/.exec(path)
  if (astro) {
    const [, ns, slug] = astro as unknown as [string, 'field' | 'atelier' | 'studio', string]
    const title = src.astroWorks.get(`${ns}/${slug}`)
    if (title === undefined || !SLUG_RE.test(slug)) return null
    return { id: workId(ns, slug), practice: ns, kind: 'work', title }
  }
  const nightly = /^\/error-as-method\/([a-z0-9-]+)$/.exec(path)
  if (nightly) {
    const slug = nightly[1]!
    const title = src.nightlyTexts.get(slug)
    if (title === undefined || !SLUG_RE.test(slug)) return null
    return { id: workId('error-as-method', slug), practice: 'error-as-method', kind: 'work', title }
  }
  const experiment = src.experiments.find((e) => normalizePath(e.href) === path)
  if (experiment && SLUG_RE.test(experiment.id)) {
    return { id: workId('lab', experiment.id), practice: 'lab', kind: 'experiment', title: experiment.title }
  }
  return null
}

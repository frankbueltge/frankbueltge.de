// src/lib/ops/selected-works.ts — the selected-works shelf, read from the records (2026-10-17).
//
// src/config/selected-works.ts says which pieces stand on the shelf and why; this module reads
// everything else a card shows from the piece's own record, at build time:
//
//   · the title — the work's page, the presentation's page, the paper's own heading, the register;
//   · the maker — the doors and cards in NAMING, n-1's own window declaration, never retyped;
//   · the date  — the work's meta.json, the presentation's summary, the register's start, n-1's
//                 night that built the page, Machine Attention's export and its retirement moment;
//   · the address, passed through the publication rule, so a card never points at a redirect;
//   · the still — the maker's own picture, cut to the frame (src/lib/ops/shelf-stills.ts).
//
// A record that cannot answer is a fault, not a blank: readPick throws, naming the pick and why.
// The shelf itself (readShelf) leaves such a pick out and says so in the build log, so one
// practice changing its mirror can never take the entrance down; the test holds every pick
// strictly where a person changes the shelf (src/lib/ops/selected-works.test.ts).

import { existsSync, readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { NAMING } from '@/config/naming'
import { SELECTED_WORKS, type ShelfPick, type ShelfWork } from '@/config/selected-works'
import exportFile from '@/data/attention/export.json'
import momentsFile from '@/data/attention/moments.json'
import { WERKE, type Werk } from '@/data/werke'
import { readN1Facts } from '@/lib/ecology/n1-line'
import { loadFieldPapers, loadPresentations, type PracticeId, type PresentationEntry } from '@/lib/ecology/v3'
import { pieceHref } from '@/lib/engines/publication-links'
import { pageTitle, readN1Shelf } from '@/lib/n1/shelf'
import { withoutHouseSuffix } from './edition'
import { makerStill, n1MarginWork, pageShotSource, shelfCrop, shelfKey } from './shelf-stills'
import { dayMonthYear } from './since'

export interface ShelfCard {
  /** the pick's stable key (src/lib/ops/shelf-stills.ts) */
  key: string
  title: string
  /** who made it, as the house names them */
  maker: string
  /** the practice's voice, for a practice of the research ecology; null for everyone else */
  voice: PracticeId | null
  /** what it is, in a word: work, paper, presentation, experiment, archive … */
  kind: string
  /** when, in words */
  when: string
  /** the day the card is dated by: made, presented, started — or retired, for an archive */
  day: string
  sentence: string
  reason: string
  /** where it is read: its own address, unless the publication rule sends it elsewhere */
  href: string
  /** shown on every visit of the edition, whatever the draw (SELECTED_WORKS.pinned) */
  pinned?: boolean
  /** the crop of the maker's own still, or null where the maker committed none */
  still: { src: string; alt: string; source: string } | null
}

const W = SELECTED_WORKS

const DOOR_OF: Record<PracticeId, string> = { atelier: 'ulysses', field: 'meridian', studio: 'ensemble' }
const practiceName = (practice: PracticeId): string =>
  NAMING.doors.items.find((d) => d.id === DOOR_OF[practice])?.name ?? NAMING.opsRoom.signal.houseFallback[practice]
const cardTitle = (id: string, fallback: string): string =>
  NAMING.overview.items.find((c) => c.id === id)?.title ?? fallback

const fail = (work: ShelfWork, why: string): never => {
  throw new Error(`selected-works: the pick ${JSON.stringify(work)} cannot be read — ${why}`)
}

/** The fields a pick's record gives, before the pick's own words are added. */
interface FromRecord {
  title: string
  maker: string
  voice: PracticeId | null
  kind: string
  when: string
  day: string
  href: string
  /** the register's own line, where the record carries one a card may use */
  line?: string
}

const readText = (root: string, path: string) => readFileSync(join(root, path), 'utf8')

function studioWork(slug: string, root: string, work: ShelfWork): FromRecord {
  const metaPath = `src/content/studio/works/${slug}/meta.json`
  const face = `public/studio/werke-html/${slug}/index.html`
  if (!existsSync(join(root, metaPath))) fail(work, `${metaPath} does not exist`)
  if (!existsSync(join(root, face))) fail(work, `${face} does not exist`)
  const meta = JSON.parse(readText(root, metaPath)) as { title?: string; date?: string }
  if (!meta.date) fail(work, `${metaPath} names no date`)
  return {
    title: pageTitle(readText(root, face)) ?? meta.title ?? fail(work, 'the work names no title'),
    maker: practiceName('studio'),
    voice: 'studio',
    kind: W.kinds.work,
    when: W.when.made(dayMonthYear(meta.date!)),
    day: meta.date!,
    href: `/studio/werke-html/${slug}/`,
  }
}

function presentationOf(practice: PracticeId, cycle: number, shelf: readonly PresentationEntry[], work: ShelfWork): PresentationEntry {
  const entry = shelf.find((p) => p.practice === practice && p.cycle === cycle)
  if (!entry) return fail(work, `no presentation of cycle ${cycle} by ${practice} is mirrored`)
  if (!entry.date) return fail(work, `the presentation's summary names no day`)
  return entry
}

function presentation(practice: PracticeId, cycle: number, shelf: readonly PresentationEntry[], work: ShelfWork): FromRecord {
  const entry = presentationOf(practice, cycle, shelf, work)
  const maker = practiceName(practice)
  return {
    // a presentation's page names its practice after a dash ("The Other Half — the Atelier"); the
    // card names the maker on its own line
    title: withoutHouseSuffix(entry.title ?? fail(work, 'the presentation names no title'), maker),
    maker,
    voice: practice,
    kind: W.kinds.presentation,
    when: W.when.made(dayMonthYear(entry.date!)),
    day: entry.date!,
    href: entry.href,
  }
}

function fieldPaper(cycle: number, shelf: readonly PresentationEntry[], root: string, work: ShelfWork): FromRecord {
  const paper = loadFieldPapers(root).find((p) => p.cycle === cycle)
  if (!paper) return fail(work, `the Field's presentation of cycle ${cycle} carries no paper`)
  const heading = /^#\s+(.+?)\s*$/m.exec(readText(root, paper.file))?.[1]
  const entry = presentationOf('field', cycle, shelf, work)
  return {
    // a paper's heading is a title and its subtitle ("Who decides …: five studies of …"); the card
    // names the title, and its sentence says what the subtitle does
    title: (heading ?? fail(work, `${paper.file} has no heading`)).split(/:\s/)[0],
    maker: practiceName('field'),
    voice: 'field',
    kind: W.kinds.paper,
    when: W.when.made(dayMonthYear(entry.date!)),
    day: entry.date!,
    href: paper.href,
  }
}

function experiment(id: string, work: ShelfWork): FromRecord {
  const werk: Werk | undefined = WERKE.find((w) => w.id === id)
  if (!werk) return fail(work, `src/data/werke.ts holds no entry "${id}"`)
  const kind =
    werk.tier === 'instrument'
      ? W.kinds.instrument
      : werk.tier === 'studie'
        ? W.kinds.study
        : werk.tier === 'project'
          ? W.kinds.project
          : W.kinds.experiment
  return {
    title: typeof werk.title === 'string' ? werk.title : werk.title.en,
    maker: NAMING.opsRoom.signal.houseFallback.lab,
    voice: null,
    kind,
    when: (werk.live ? W.when.daily : W.when.started)(dayMonthYear(werk.since)),
    day: werk.since,
    href: werk.href,
    line: werk.subtitle.en,
  }
}

function n1Work(href: string, root: string, work: ShelfWork): FromRecord {
  const entry = n1MarginWork(href, root)
  if (!entry) return fail(work, `n-1's margin.json lists no work at "${href}"`)
  // margin.json addresses its works from n-1's own front page
  const path = posix.normalize(entry.href.endsWith('/') ? `${entry.href}index.html` : entry.href)
  const page = readN1Shelf(join(root, 'public', 'n-1')).find((p) => p.path === path)
  if (!page?.date) return fail(work, `n-1's record dates no page at ${path}`)
  return {
    title: entry.title,
    maker: readN1Facts(readText(root, 'public/n-1/DOWRY.md'), readText(root, 'public/n-1/window.json')).title,
    voice: null,
    kind: W.kinds.work,
    when: W.when.made(dayMonthYear(page.date)),
    day: page.date,
    href: `/n-1/${entry.href.replace(/^\.?\//, '')}`,
  }
}

interface ExportProject {
  id: string
  title: string
  since: string
  site_route: string | null
  status: string
}
interface Moment {
  project: string
  mode: string
  occurred_at: string
}

/**
 * The day an experiment of Machine Attention was retired. Its moments say it first; but the
 * moments file holds the newest hundred, so a retirement can scroll out of it once other projects
 * have a stage, and then the archive's own front page — frozen since the day it stopped — says it
 * in its description. Null where neither does: the card then names the retirement without a day.
 */
export function retirementDay(id: string, route: string, root: string = process.cwd()): string | null {
  const moment = (momentsFile.moments as Moment[]).find((m) => m.project === id && m.mode === 'retirement')
  if (moment) return moment.occurred_at.slice(0, 10)
  const face = join(root, 'public', route.replace(/^\//, ''), 'index.html')
  if (!existsSync(face)) return null
  return /\bretired\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})/i.exec(readFileSync(face, 'utf8'))?.[1] ?? null
}

function attentionExperiment(id: string, root: string, work: ShelfWork): FromRecord {
  const project = (exportFile.projects as ExportProject[]).find((p) => p.id === id)
  if (!project) return fail(work, `Machine Attention's export lists no project "${id}"`)
  if (!project.site_route) return fail(work, `${project.title} has no stage on this site`)
  const maker = cardTitle('attention', NAMING.opsRoom.signal.houseFallback.attention)
  const since = dayMonthYear(project.since)
  if (project.status === 'retired') {
    const day = retirementDay(id, project.site_route, root)
    if (!day) {
      return {
        title: project.title,
        maker,
        voice: null,
        kind: W.kinds.archive,
        when: W.when.retired(since),
        day: project.since,
        href: `${project.site_route}/`,
      }
    }
    // a span within one year names the year once: "8 August – 4 October 2026"
    const from = project.since.slice(0, 4) === day.slice(0, 4) ? since.replace(/\s\d{4}$/, '') : since
    return {
      title: project.title,
      maker,
      voice: null,
      kind: W.kinds.archive,
      when: W.when.span(from, dayMonthYear(day)),
      day,
      href: `${project.site_route}/`,
    }
  }
  return {
    title: project.title,
    maker,
    voice: null,
    kind: W.kinds.experiment,
    when: W.when.started(since),
    day: project.since,
    href: `${project.site_route}/`,
  }
}

/** One pick, read. */
export function readPick(pick: ShelfPick, root: string = process.cwd(), shelf: readonly PresentationEntry[] = loadPresentations(root)): ShelfCard {
  const { work } = pick
  const record: FromRecord =
    work.kind === 'studio-work'
      ? studioWork(work.slug, root, work)
      : work.kind === 'presentation'
        ? presentation(work.practice, work.cycle, shelf, work)
        : work.kind === 'field-paper'
          ? fieldPaper(work.cycle, shelf, root, work)
          : work.kind === 'experiment'
            ? experiment(work.id, work)
            : work.kind === 'n-1-work'
              ? n1Work(work.href, root, work)
              : attentionExperiment(work.id, root, work)
  const sentence = pick.sentence ?? record.line ?? fail(work, 'it says no sentence, and its record carries no line to use')
  const crop = shelfCrop(work)
  const maker = makerStill(work, root)
  // a piece whose maker committed no still shows a shot of its own page, where one is committed
  const source = maker ?? pageShotSource(record.href)
  return {
    key: shelfKey(work),
    title: record.title,
    maker: record.maker,
    voice: record.voice,
    kind: record.kind,
    when: record.when,
    day: record.day,
    sentence,
    reason: pick.reason,
    href: pieceHref(record.href, root),
    // a still shows only once its crop is committed (npm run shelf:stills): the full screenshot is
    // never loaded in its place
    still: existsSync(join(root, crop.file)) ? { src: crop.src, alt: (maker ? W.stillAlt : W.shotAlt)(record.title), source } : null,
  }
}

/** The shelf as its records answer it: every card that reads, and every pick that does not, with why. */
export function readShelfReport(
  root: string = process.cwd(),
  picks: readonly ShelfPick[] = W.picks,
): { cards: ShelfCard[]; missing: { key: string; why: string }[] } {
  const shelf = loadPresentations(root)
  const cards: ShelfCard[] = []
  const missing: { key: string; why: string }[] = []
  for (const pick of picks) {
    try {
      cards.push(readPick(pick, root, shelf))
    } catch (e) {
      missing.push({ key: shelfKey(pick.work), why: (e as Error).message })
    }
  }
  return { cards, missing }
}

/** The shelf, in the order the config gives. A pick its record no longer answers is left out, and
 *  the build log says which: the entrance stands on whatever still reads. */
export function readShelf(root: string = process.cwd(), picks: readonly ShelfPick[] = W.picks): ShelfCard[] {
  const { cards, missing } = readShelfReport(root, picks)
  for (const m of missing) console.warn(`[selected-works] left off the shelf: ${m.why}`)
  return cards
}

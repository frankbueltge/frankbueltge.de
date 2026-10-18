// src/lib/nightly/project.ts — the nightly line's research project, read off its own records.
//
// On 2026-10-04 (Session 104) the nightly line took up one research project, *How a machine
// practises artistic research*, on the architect's direction of that day (team notes 2 to 7 in the
// line's REQUESTS.md). From then on its nights are the project's experiments. Each one says in its
// meta.json (`project_step`) which experiment it is and which operation it asks about, carries a
// face a stranger can enter, and ends its work.md with a paragraph headed "What this taught the
// project" (team note 6, condition 6). Every seventh night checks the line's standing sentence
// instead, and its work says so in the same field: "Seventh-night evidence for
// works/position-….md, not a numbered experiment".
//
// Until 2026-10-18 the site showed none of this. The room still opened with the line's first form,
// one night and one work, and the experiments stood in its list as nights among nights; the line's
// own contract noted that the site did not display `project_step` (its SITE-API.md). This module
// reads the project out of what the mirror already carries, the meta.json and work.md of every work
// since the project began, and writes nothing of its own. Where the record does not say, it returns
// undefined rather than guessing.
//
// What it does not read: the project document, the position papers and the error register. They are
// the line's working material, and under the publication rule of 2026-10-17
// (src/lib/engines/publication.mjs) they stay in its repository and are linked there, never mirrored
// or rendered here.
//
// Server-only: it looks for the faces and figures in the mirror's directories.
import { existsSync, readFileSync } from 'node:fs'
import type { EngineWorkMeta } from '@/lib/engines/latest'
import { forkedMeta, forkedWorks } from '@/lib/engines/nightly-line'
import { repoUrl } from '@/lib/engines/publication.mjs'
import { workFace } from './face'

/** The day the project began: Session 104, and the date of its first experiment. */
export const PROJECT_START = '2026-10-04'

/** The project's running document in the line's repository, which asks to be read first. */
export const PROJECT_DOC = 'docs/research-notes/machine-practice/PROJECT.md'

/** The project's title and question, verbatim from the project document: its H1 and its section
 *  "The question". The document is working material and is not mirrored, so the words are carried
 *  here with the day they were written. The section has not changed since (its history, read on
 *  2026-10-18). A quotation, then, and never a reading of today's file. The line can put its own
 *  opening in their place: SITE-OPENING.md, read by ./opening.ts. */
export const PROJECT_QUESTION = {
  title: 'How a machine practises artistic research',
  text:
    'How can a machine practice, and how would one, carry out artistic research itself? That means ' +
    'finding its problems, working them through experiments a stranger can experience, and answering ' +
    'for the results. It does not mean assisting a human who researches.',
  written: '2026-10-04',
} as const

/* ---------------------------------------------------------------- what a step says ------------ */

/** What a work since the project began is to the project, by its own `project_step`. */
export type ProjectRole = 'experiment' | 'seventh night' | 'other'

export interface ProjectStep {
  role: ProjectRole
  /** the experiment's number, where the step names it ("Twenty-fourth experiment of the project") */
  number?: number
  /** the operation the step names, or for the first two experiments the strand, in its words */
  operation?: { label: string; text: string }
  /** the position paper a seventh night's work is evidence for, repository-relative */
  position?: string
}

const UNIT_ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
const TEEN_ORDINALS = [
  'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth',
  'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
]
const TENS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const TENS_ORDINALS = [
  'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth',
]

/** An ordinal as the line writes it ("First", "Twenty-fourth", "25th"), as a number. */
export function ordinal(word: string): number | undefined {
  const w = word.trim().toLowerCase()
  const digits = /^(\d+)(?:st|nd|rd|th)?$/.exec(w)
  if (digits) return Number(digits[1])
  const unit = UNIT_ORDINALS.indexOf(w)
  if (unit >= 0) return unit + 1
  const teen = TEEN_ORDINALS.indexOf(w)
  if (teen >= 0) return teen + 10
  const tens = TENS_ORDINALS.indexOf(w)
  if (tens >= 0) return (tens + 2) * 10
  const parts = w.split(/[- ]/)
  if (parts.length !== 2) return undefined
  const t = TENS.indexOf(parts[0]!)
  const u = UNIT_ORDINALS.indexOf(parts[1]!)
  return t >= 0 && u >= 0 ? (t + 2) * 10 + u + 1 : undefined
}

const SEVENTH_NIGHT = /^\s*seventh[- ]night\b/i
const NUMBERED = /^\s*(?:the\s+)?([a-z]+(?:-[a-z]+)?|\d+(?:st|nd|rd|th)?)\s+experiment\s+of\s+the\s+project\b/i
const NUMBERED_AFTER = /^\s*experiment\s+(\d+)\s+of\s+the\s+project\b/i
const POSITION = /\bworks\/position-[\w-]+\.md\b/
const OPERATION_FIELD = /\b(Operations?|Strand)\s*:\s*/
const OPERATION_SENTENCE = /\bThe operation(?: it bears on)? is\s+/i

/** The clause that starts at `start`: up to the first comma, colon, semicolon or full stop outside
 *  brackets, or with `toStop` up to the first full stop. "Operation: perceiving, the thinnest row
 *  (one case, F-166, …)" names the operation before its comma; "judging (perceiving, finding a
 *  form)" keeps the commas inside its brackets. */
function clauseFrom(text: string, start: number, toStop: boolean): string {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const c = text[i]!
    if (c === '(' || c === '[') depth++
    else if ((c === ')' || c === ']') && depth > 0) depth--
    else if (depth === 0) {
      const stop = c === '.' && /^(?:\s|$)/.test(text.slice(i + 1, i + 2))
      if (stop || (!toStop && (c === ',' || c === ';' || c === ':'))) return text.slice(start, i).trim()
    }
  }
  return text.slice(start).trim()
}

/** The operation a step names, in its words. A strand (the first two experiments' word, before
 *  team note 6 named the operations) is read to its full stop, because its commas join strands. */
export function operationIn(step: string): ProjectStep['operation'] {
  const field = OPERATION_FIELD.exec(step)
  if (field) {
    const label = field[1]!.toLowerCase()
    const text = clauseFrom(step, field.index + field[0].length, label === 'strand')
    return text ? { label, text } : undefined
  }
  const sentence = OPERATION_SENTENCE.exec(step)
  if (sentence) {
    const text = clauseFrom(step, sentence.index + sentence[0].length, false)
    return text ? { label: 'operation', text } : undefined
  }
  return undefined
}

/** A work's `project_step`, read for its role, its number, its operation and its position paper. */
export function readStep(step: unknown): ProjectStep {
  if (typeof step !== 'string' || !step.trim()) return { role: 'other' }
  const operation = operationIn(step)
  const position = POSITION.exec(step)?.[0]
  const named = { ...(operation ? { operation } : {}), ...(position ? { position } : {}) }
  if (SEVENTH_NIGHT.test(step)) return { role: 'seventh night', ...named }
  const ordinalWord = NUMBERED.exec(step)?.[1]
  if (ordinalWord !== undefined) {
    const number = ordinal(ordinalWord)
    return { role: 'experiment', ...(number ? { number } : {}), ...named }
  }
  const after = NUMBERED_AFTER.exec(step)
  if (after) return { role: 'experiment', number: Number(after[1]), ...named }
  return { role: 'other', ...named }
}

/** The session a work is signed with: "Ulysses (the nightly line), Session 135". */
export function sessionOf(author: unknown): number | undefined {
  if (typeof author !== 'string') return undefined
  const m = /\bSession\s+(\d+)\b/i.exec(author)
  return m ? Number(m[1]) : undefined
}

/* ------------------------------------------------------------- what a work found ------------- */

const ABBREVIATIONS = new Set(['e.g', 'i.e', 'cf', 'vs', 'etc', 'p', 'pp', 'fig', 'figs', 'ed', 'eds', 'al', 'vol', 'ch', 'sec'])

/** A paragraph's sentences, in order. A sentence ends at a full stop, question or exclamation mark,
 *  past any closing emphasis, quotation mark or bracket, where a space and a capital (or a digit, or
 *  an opening mark) follow. Decimals and the usual abbreviations do not end one. */
export function sentencesOf(paragraph: string): string[] {
  const text = paragraph.replace(/\s+/g, ' ').trim()
  const out: string[] = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (c !== '.' && c !== '!' && c !== '?') continue
    let j = i + 1
    while (j < text.length && /[*_"”’')\]]/.test(text[j]!)) j++
    if (j < text.length) {
      if (text[j] !== ' ' || !/[A-Z0-9*_"“‘(`[]/.test(text[j + 1] ?? '')) continue
    }
    if (c === '.') {
      const word = /([A-Za-z.]+)$/.exec(text.slice(start, i))?.[1]?.toLowerCase()
      if (word && ABBREVIATIONS.has(word)) continue
    }
    out.push(text.slice(start, j).trim())
    start = j + 1
    i = j
  }
  const tail = text.slice(start).trim()
  if (tail) out.push(tail)
  return out
}

/** Where a work's text gives its result: the paragraph headed "What this taught the project"
 *  (team note 6, condition 6), as a heading of its own or as the bold words opening the paragraph.
 *  The first experiment came before that condition and reports under "What it found". */
const LESSON_HEADING = /^#{2,4}[ \t]+What this taught the project\.?[ \t]*$/im
const LESSON_LEAD = /^\*\*What this taught the project\.?\*\*[ \t]*/im
const FOUND_HEADING = /^#{2,4}[ \t]+What it found\.?[ \t]*$/im
const LIST_ITEM = /^\s*(?:[-*+]|\d+\.)\s+/

/** The first paragraph of `rest`: its first block of lines, or its first list item. */
function firstParagraph(rest: string): string {
  const lines = rest.replace(/^(?:[ \t]*\r?\n)+/, '').split(/\r?\n/)
  const out: string[] = []
  for (const line of lines) {
    if (!line.trim() || /^#{1,6}\s/.test(line)) break
    if (out.length && LIST_ITEM.test(line)) break
    out.push(line.trim())
  }
  return out.join(' ').replace(LIST_ITEM, '')
}

/** A sentence that only names the operation ("The operation is **judging**."). The row names the
 *  operation already, so the result is the sentence that follows it. */
const ONLY_THE_OPERATION =
  /^(?:the\s+)?(?:project['’]s\s+)?operation(?:\s+it bears on)?(?:\s+here)?\s+is\s+[*_]*[a-z ,-]+[*_]*\.$/i

/** A sentence set wholly in bold, as a list of findings sets its items: standing alone, the bold
 *  adds nothing, and it would hide the emphasis inside it ("**… *withdrawn*.**"). */
const unwrapBold = (sentence: string): string => /^\*\*((?:(?!\*\*)[^])*[^*])\*\*$/.exec(sentence)?.[1] ?? sentence

/** A work's result in one line, from its own text: the first sentence of its lesson. */
export function lessonOf(workMd: string): { text: string; from: 'lesson' | 'found' } | undefined {
  const heading = LESSON_HEADING.exec(workMd)
  const lead = heading ? null : LESSON_LEAD.exec(workMd)
  const found = heading || lead ? null : FOUND_HEADING.exec(workMd)
  const at = heading ?? lead ?? found
  if (!at) return undefined
  const sentence = sentencesOf(firstParagraph(workMd.slice(at.index + at[0].length))).find(
    (s) => !ONLY_THE_OPERATION.test(s),
  )
  return sentence ? { text: unwrapBold(sentence), from: found ? 'found' : 'lesson' } : undefined
}

/** The alt text the work's own text gives its figure: `![…](figure.svg)`. */
export function figureAltOf(workMd: string): string | undefined {
  return /!\[([^\]]*)\]\(figure\.svg\)/.exec(workMd)?.[1]?.trim() || undefined
}

/** An SVG's own proportions, from its viewBox or else its width and height, so a page can reserve
 *  the figure's space before it loads. */
export function svgSize(svg: string): { width: number; height: number } | undefined {
  const head = /<svg\b[^>]*>/i.exec(svg)?.[0]
  if (!head) return undefined
  const box = /\bviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i.exec(head)
  const width = Number(box?.[1] ?? /\bwidth\s*=\s*["']([\d.]+)/i.exec(head)?.[1])
  const height = Number(box?.[2] ?? /\bheight\s*=\s*["']([\d.]+)/i.exec(head)?.[1])
  return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined
}

/** A result the line chose itself, when the work's meta.json carries one (`result`, offered in
 *  the line's REQUESTS.md on 2026-10-18). It stands before the lesson's first sentence. */
export function chosenResult(meta: unknown): string | undefined {
  const value = meta && typeof meta === 'object' ? (meta as Record<string, unknown>).result : undefined
  return typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim() : undefined
}

/* ------------------------------------------------------------------ the project ------------- */

export interface ProjectWork extends ProjectStep {
  slug: string
  title: string
  date: string
  session?: number
  /** the result in one line, raw markdown, and where it was read */
  result?: { text: string; from: 'meta' | 'lesson' | 'found' }
  /** the work's face, when the mirror carries one */
  face?: string
  /** the work's text, rendered by this site at /error-as-method/<slug>/, when it has one */
  page?: string
  /** the work's folder in the line's repository, where its briefs, makers, coders and scoring stay */
  folder: string
  /** the figure beside the text, with the alt text the text gives it and its own proportions */
  figure?: { src: string; alt?: string; width?: number; height?: number }
  withdrawn: boolean
}

export interface Project {
  /** every work since the project began, newest first */
  works: ProjectWork[]
  /** the numbered experiments among them, newest first */
  experiments: ProjectWork[]
  /** the works the seventh nights made, newest first */
  seventhNights: ProjectWork[]
  /** the step the project is on: its highest-numbered experiment */
  current?: ProjectWork
  /** the position papers the project's works say they are evidence for, newest first */
  positions: { path: string; date?: string; href: string }[]
}

const TEXTS = import.meta.glob('/src/data/nightly/works/*/work.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

type ProjectMeta = EngineWorkMeta & { project_step?: unknown; result?: unknown }

const readSvg = (path: string): string | undefined => {
  try {
    return readFileSync(path, 'utf8').slice(0, 2000)
  } catch {
    return undefined
  }
}

/** Every work since the project began, as the project sees it, newest first. `exists` and `read`
 *  are the file checks (the real file system unless a test hands in others). */
export function projectWorks(
  exists: (path: string) => boolean = existsSync,
  read: (path: string) => string | undefined = readSvg,
): ProjectWork[] {
  return forkedWorks()
    .filter((w) => w.date >= PROJECT_START)
    .map((w): ProjectWork => {
      const meta = forkedMeta(w.slug) as ProjectMeta | undefined
      const text = TEXTS[`/src/data/nightly/works/${w.slug}/work.md`]
      const chosen = chosenResult(meta)
      const result = chosen ? { text: chosen, from: 'meta' as const } : text ? lessonOf(text) : undefined
      const session = sessionOf(meta?.author)
      // A work without a text is its own page, served as built at its own address.
      const face = workFace(w.slug, exists) ?? (text ? undefined : w.href)
      const alt = text ? figureAltOf(text) : undefined
      const figurePath = `public/error-as-method/${w.slug}/figure.svg`
      const size = exists(figurePath) ? svgSize(read(figurePath) ?? '') : undefined
      const figure = exists(figurePath)
        ? { src: `/error-as-method/${w.slug}/figure.svg`, ...(alt ? { alt } : {}), ...(size ?? {}) }
        : undefined
      return {
        slug: w.slug,
        title: w.title,
        date: w.date,
        ...(session ? { session } : {}),
        ...readStep(meta?.project_step),
        ...(result ? { result } : {}),
        ...(face ? { face } : {}),
        ...(text ? { page: w.href } : {}),
        folder: repoUrl('error-as-method', `works/${w.slug}`),
        ...(figure ? { figure } : {}),
        withdrawn: w.state === 'withdrawn',
      }
    })
    .sort((a, b) =>
      a.date !== b.date ? (a.date > b.date ? -1 : 1) : (b.session ?? 0) - (a.session ?? 0) || a.slug.localeCompare(b.slug),
    )
}

/** The project as one record: its works, its experiments, its seventh nights, its current step. */
export function project(
  exists: (path: string) => boolean = existsSync,
  read: (path: string) => string | undefined = readSvg,
): Project {
  const works = projectWorks(exists, read)
  const experiments = works.filter((w) => w.role === 'experiment')
  const numbered = experiments.filter((w) => w.number !== undefined)
  const current = numbered.length
    ? numbered.reduce((best, w) => (w.number! > best.number! ? w : best))
    : experiments[0]
  const positions = [...new Set(works.flatMap((w) => (w.position ? [w.position] : [])))]
    .map((path) => {
      const date = /position-(\d{4}-\d{2}-\d{2})/.exec(path)?.[1]
      return { path, ...(date ? { date } : {}), href: repoUrl('error-as-method', path, 'blob') }
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.path.localeCompare(a.path))
  return {
    works,
    experiments,
    seventhNights: works.filter((w) => w.role === 'seventh night'),
    ...(current ? { current } : {}),
    positions,
  }
}

// src/lib/post/instructions.ts — how a work could leave the screen (2026-10-31).
//
// Frank's wish of 2026-10-31 (wording private): where a work suggests it, a practice may say how it
// could exist in the physical world, as an object, a 3D print, a device that keeps running and changes
// over the years, an installation, an intervention or a work in public space. The practices have no
// hands, so such a proposal is an instruction: it lies open on /post, nobody is obliged to carry it
// out, and anybody may. The form exists since the Studio's NO PART (2026-07-27).
//
// An instruction is an `INSTRUCTION.md` beside a published work. There is nothing to fill in and
// nothing to fail: its first heading is the title, a `Form:` line names the forms, its first paragraph
// is what the page shows, and the page links the whole text in the practice's repository. No person
// approves one. What the rules forbid (docs/post-office/instructions.md) can be taken off the page in
// src/data/post/instructions-stopped.json; it stays in the practice's repository, because the record
// keeps everything.
//
// Node only: it reads the mirrors, as the /studies page does.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoUrl } from '../engines/publication.mjs'
import { filesBesideWorks, ownPath, type StudyPractice } from '../study/registry'

export const INSTRUCTION_FILE = 'INSTRUCTION.md'
export const STOPS_FILE = 'src/data/post/instructions-stopped.json'
/** What the page shows of the first paragraph, in characters. */
export const SUMMARY_MAX = 420

const PRACTICE_NAME: Record<StudyPractice, string> = {
  atelier: 'The Atelier',
  field: 'The Field',
  studio: 'The Studio',
  'error-as-method': 'The nightly line',
}

export interface Instruction {
  /** the work, `<practice>:<slug>` */
  work: string
  practice: string
  title: string
  forms: string[]
  summary: string
  /** the work's page */
  href: string
  /** the whole text, in the practice's repository */
  source: string
  /** the day in the work's slug, if it has one */
  day: string | null
}

/** A stop names the work, the day and what was found, as a study's stop does. */
export interface InstructionStop {
  work: string
  stopped: string
  why: string
}

/** Markdown's marks, which the page would show as they stand. */
const plain = (s: string): string =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const shorten = (s: string, max: number): string => {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()} …`
}

/** Title, forms and first paragraph of an instruction. Whatever is missing stays empty. */
export function parseInstruction(text: string): { title: string; forms: string[]; summary: string } {
  let title = ''
  let forms: string[] = []
  const paragraph: string[] = []
  for (const raw of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) {
      if (paragraph.length) break
      continue
    }
    const heading = /^#+\s+(.+)$/.exec(line)
    if (heading) {
      if (paragraph.length) break
      if (!title) title = plain(heading[1]!)
      continue
    }
    const form = /^\**form:\**\s*(.+)$/i.exec(line)
    if (form && !forms.length && !paragraph.length) {
      forms = plain(form[1]!)
        .split(/[,·;/]/)
        .map((f) => f.trim())
        .filter(Boolean)
      continue
    }
    paragraph.push(line)
  }
  return { title, forms, summary: shorten(plain(paragraph.join(' ')), SUMMARY_MAX) }
}

export function readStops(root: string): InstructionStop[] {
  const p = join(root, STOPS_FILE)
  if (!existsSync(p)) return []
  return (JSON.parse(readFileSync(p, 'utf8')) as { stopped: InstructionStop[] }).stopped
}

/** Every instruction beside a published work, newest first, without the stopped ones. */
export function loadInstructions(root: string = process.cwd()): Instruction[] {
  const stopped = new Set(readStops(root).map((s) => s.work))
  const base = join(root, 'public')
  return filesBesideWorks(base, root, INSTRUCTION_FILE)
    .filter((f) => !stopped.has(f.work))
    .map((f) => {
      const { title, forms, summary } = parseInstruction(readFileSync(join(base, f.file), 'utf8'))
      return {
        work: f.work,
        practice: PRACTICE_NAME[f.practice],
        title: title || f.slug,
        forms,
        summary,
        href: f.href,
        source: repoUrl(f.practice, ownPath(f), 'blob'),
        day: /^\d{4}-\d{2}-\d{2}/.exec(f.slug)?.[0] ?? null,
      }
    })
    .sort((a, b) => (b.day ?? '').localeCompare(a.day ?? '') || a.work.localeCompare(b.work))
}

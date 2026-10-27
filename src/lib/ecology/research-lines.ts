// src/lib/ecology/research-lines.ts — the ecology's research lines, read from the mirror (2026-10-25).
//
// Since the architect's decision of 2026-10-25 (wording private; docs/design/2026-10-25-the-lines.md)
// the ecology keeps a few research lines across cycles, one file each in research-ecology's lines/,
// kept by the Middle. ecology-integrate.yml mirrors the folder verbatim to src/data/middle/lines/;
// this module reads it for /lines and /lines/<slug>/. The files are the Middle's text: rendered with
// the house's renderer for mirrored markdown (markdown-it, raw HTML off), never rewritten. A file
// that does not carry the header of a line (`# Line: <slug>`) is not a line and is left out; the
// folder's README is the rules, read for its lead only.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'

export const LINES_DIR = 'src/data/middle/lines'
export const LINES_REPO = 'https://github.com/frankbueltge/research-ecology/tree/main/lines'

export type LineStatus = 'active' | 'resting' | 'closed' | 'unknown'

export interface ResearchLine {
  slug: string
  status: LineStatus
  /** the line's question, the first paragraph of its part "1. Question" */
  question: string | null
  /** the header line under the title, as the Middle wrote it (markdown stripped) */
  header: string | null
  /** number of open questions (Q1, Q2, …) the file lists */
  openQuestions: number
  html: string
  source: string
}

const STATUS_ORDER: Record<LineStatus, number> = { active: 0, resting: 1, closed: 2, unknown: 3 }

const strip = (s: string) => s.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

/** Parse one line file; null when it is not a line. */
export function parseLine(source: string): ResearchLine | null {
  const title = /^#\s+Line:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/m.exec(source)
  if (!title) return null
  const slug = title[1]!
  const afterTitle = source.slice(title.index + title[0].length)
  const headerBlock = afterTitle.split(/\n\s*\n/).map((b) => b.trim()).find((b) => b.length > 0) ?? ''
  const header = headerBlock && !headerBlock.startsWith('#') ? strip(headerBlock) : null
  const statusMatch = /Status:\s*\**\s*(active|resting|closed)/i.exec(header ?? '')
  const status = (statusMatch?.[1]?.toLowerCase() as LineStatus | undefined) ?? 'unknown'
  const q = /^##\s+1\.\s+Question[ \t]*$/m.exec(source)
  const para = q ? source.slice(q.index + q[0].length).split(/\n\s*\n/).map((b) => b.trim()).find((b) => b.length > 0) : undefined
  const question = para && !para.startsWith('#') ? strip(para) || null : null
  const openQuestions = new Set(source.match(/^-\s+\*\*Q\d+\*\*/gm) ?? []).size
  return { slug, status, question, header, openQuestions, html: renderLine(source), source }
}

export function renderLine(source: string): string {
  const md = new MarkdownIt({ html: false, linkify: true })
  md.linkify.set({ fuzzyLink: false })
  // links to a sibling line file (`withheld.md`) resolve to that line's page here
  const passThrough: NonNullable<typeof md.renderer.rules.link_open> = (tokens, idx, opts, _env, self) =>
    self.renderToken(tokens, idx, opts)
  const linkOpen = md.renderer.rules.link_open ?? passThrough
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const href = tokens[idx]!.attrGet('href')
    const sibling = href ? /^(README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(href) : null
    if (sibling) tokens[idx]!.attrSet('href', sibling[1] === 'README' ? '/lines/' : `/lines/${sibling[1]}/`)
    return linkOpen(tokens, idx, opts, env, self)
  }
  return md.render(source)
}

/** Every line in the mirror: active first, then resting, then closed; by slug within each. */
export function loadLines(root: string = process.cwd()): ResearchLine[] {
  const dir = join(root, LINES_DIR)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => parseLine(readFileSync(join(dir, f), 'utf8')))
    .filter((l): l is ResearchLine => l !== null)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.slug.localeCompare(b.slug))
}

// src/lib/engines/journal.ts
// Splits an engine's journal-day markdown into sessions (the constitutions mandate
// `# Session NN` headings) and renders fragments at build time. Tolerant by design:
// files without session headings render as one card (pre-collective back-catalog).
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })
// Bare filenames like WORKBOARD.md would otherwise linkify as Moldovan domains (.md is a
// ccTLD); require an explicit protocol so only real URLs become links.
md.linkify.set({ fuzzyLink: false })

export interface RawSession { heading: string; text: string }

export function splitSessions(body: string): RawSession[] {
  const chunks = ('\n' + body).split(/\n(?=# Session \d)/).map((c) => c.replace(/^\n/, ''))
  const sessions: RawSession[] = []
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const m = chunk.match(/^# (Session \d+[^\n]*)/)
    if (m) sessions.push({ heading: m[1].trim(), text: chunk.replace(/^# [^\n]*\n?/, '') })
    else sessions.push({ heading: '', text: chunk })
  }
  return sessions.length ? sessions : [{ heading: '', text: body }]
}

export function sessionMeta(text: string): { move: string | null; voices: string | null } {
  const moveLine = text.match(/\*\*Move:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? null
  const voices = text.match(/\*\*Convened:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? null
  const move = moveLine ? (moveLine.split(/[\s—–(]/)[0] || null) : null
  return { move, voices }
}

/** h2 headings that carry the gauntlet's load get a hook for restrained highlighting. */
function markDeliberation(html: string): string {
  return html.replace(/<h2>([^<]*(?:critique|verdict)[^<]*)<\/h2>/gi, '<h2 class="deliberation-mark">$1</h2>')
}

export function renderMarkdown(text: string): string {
  return markDeliberation(md.render(text))
}

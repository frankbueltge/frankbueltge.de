// src/lib/engines/journal.ts
// Splits an engine's journal-day markdown into sessions and renders fragments at build
// time. Tolerant by design: the engines' H1 conventions have drifted across their history
// (`# Session 01 — date`, `# Session — date (collective session N)`,
// `# Journal — date (collective session N)`, `# Research day — date (Session N)`,
// `# Plenum minutes — …`), so the splitter breaks on ANY H1 (fence-aware — a `# ` line
// inside a code fence is not a heading). Files without H1 headings render as one card.
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })
// Bare filenames like WORKBOARD.md would otherwise linkify as Moldovan domains (.md is a
// ccTLD); require an explicit protocol so only real URLs become links.
md.linkify.set({ fuzzyLink: false })

/** Repo-relative .md references the journals cite constantly (bare or in backticks). */
export interface MdRefs {
  /** engine repo, e.g. https://github.com/frankbueltge/field-research */
  repo: string
  /** root-doc ids (lowercased stems) that exist as baked modal templates on the page */
  docs: Set<string>
}

const MD_REF = /(?<=^|[\s(])([A-Za-z0-9_][\w./-]*\.md)(?=$|[\s).,;:!?'"])/g

const refAttrs = (path: string, refs: MdRefs): [string, string][] => {
  const attrs: [string, string][] = [
    ['href', `${refs.repo}/blob/main/${path}`],
    ['target', '_blank'],
    ['rel', 'noreferrer'],
    ['data-mdref', path],
  ]
  // Only root-level references map onto a baked doc template (memory/README.md ≠ README.md).
  const stem = path.slice(0, -3).toLowerCase()
  if (!path.includes('/') && refs.docs.has(stem)) attrs.push(['data-doc', stem])
  return attrs
}

// Turns bare `WORKBOARD.md`-style mentions in plain text into links (outside existing links).
md.core.ruler.push('md_file_refs', (state) => {
  const refs: MdRefs | undefined = state.env?.mdRefs
  if (!refs) return
  for (const block of state.tokens) {
    if (block.type !== 'inline' || !block.children) continue
    let linkDepth = 0
    const out: (typeof block.children)[number][] = []
    for (const tok of block.children) {
      if (tok.type === 'link_open') linkDepth++
      else if (tok.type === 'link_close') linkDepth--
      if (tok.type !== 'text' || linkDepth > 0 || !tok.content.includes('.md')) {
        out.push(tok)
        continue
      }
      let last = 0
      for (const m of tok.content.matchAll(MD_REF)) {
        const path = m[0]
        if (m.index! > last) {
          const t = new state.Token('text', '', 0)
          t.content = tok.content.slice(last, m.index)
          out.push(t)
        }
        const open = new state.Token('link_open', 'a', 1)
        open.attrs = refAttrs(path, refs)
        const text = new state.Token('text', '', 0)
        text.content = path
        out.push(open, text, new state.Token('link_close', 'a', -1))
        last = m.index! + path.length
      }
      if (last === 0) out.push(tok)
      else if (last < tok.content.length) {
        const t = new state.Token('text', '', 0)
        t.content = tok.content.slice(last)
        out.push(t)
      }
    }
    block.children = out
  }
})

// Backticked references (`memory/claims.md`) render as a linked <code> element.
const defaultCodeInline =
  md.renderer.rules.code_inline ??
  ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts))
md.renderer.rules.code_inline = (tokens, idx, opts, env, self) => {
  const refs: MdRefs | undefined = env?.mdRefs
  const content = tokens[idx].content
  const code = defaultCodeInline(tokens, idx, opts, env, self)
  if (!refs || !/^[A-Za-z0-9_][\w./-]*\.md$/.test(content)) return code
  const attrs = refAttrs(content, refs)
    .map(([k, v]) => `${k}="${md.utils.escapeHtml(v)}"`)
    .join(' ')
  return `<a ${attrs}>${code}</a>`
}

export interface RawSession { heading: string; text: string }

export function splitSessions(body: string): RawSession[] {
  // Line scan instead of one regex split: heading detection must ignore `# ` lines inside
  // code fences (machine-written journals quote shell/yaml snippets), which a lookahead
  // split cannot. Chunks start at every top-level H1; leading text before the first H1
  // stays a heading-less chunk (pre-collective back-catalog behavior, unchanged).
  const lines = body.split('\n')
  const chunks: string[][] = []
  let current: string[] = []
  let inFence = false
  for (const line of lines) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence
    else if (!inFence && /^# /.test(line) && current.some((l) => l.trim())) {
      chunks.push(current)
      current = []
    }
    current.push(line)
  }
  if (current.length) chunks.push(current)

  const sessions: RawSession[] = []
  for (const chunkLines of chunks) {
    const chunk = chunkLines.join('\n')
    if (!chunk.trim()) continue
    const m = chunk.match(/^\s*# ([^\n]+)/)
    if (m) sessions.push({ heading: m[1].trim(), text: chunk.replace(/^\s*# [^\n]*\n?/, '') })
    else sessions.push({ heading: '', text: chunk })
  }
  return sessions.length ? sessions : [{ heading: '', text: body }]
}

/**
 * Stable, content-derived DOM id for a session — survives re-syncs and re-chunking.
 * `cs-N` when the heading names a collective session; `pre-<day>-N` for the
 * pre-constitution `Session NN` entries; positional fallback otherwise.
 *
 * `Session N — <date>` is ambiguous: the pre-constitution back-catalog used exactly this
 * shape (field, all on 2026-07-01), and Meridian's record-first format re-adopted it on
 * 2026-07-17 for REGULAR collective sessions (`# Session 42 — 2026-07-17`, chronicle
 * collective_session 42 → the mirror expects `cs-42`). Syntax cannot tell them apart, the
 * calendar can: only day-one files (≤ 2026-07-01) carry pre-constitution entries. Existing
 * `pre-2026-07-01-*` anchors keep resolving; later `Session N` headings anchor as `cs-N`.
 */
export function sessionAnchor(heading: string, dayId: string, indexInFile: number): string {
  const cs = heading.match(/collective session (\d+)/i)
  if (cs) return `cs-${Number(cs[1])}`
  const pre = heading.match(/^Session (\d+)/i)
  if (pre) return dayId <= '2026-07-01' ? `pre-${dayId}-${Number(pre[1])}` : `cs-${Number(pre[1])}`
  return `${dayId}-${indexInFile}`
}

/**
 * Collision-safe variant: the engine's own numbering drifts (a real instance exists —
 * two different days both claiming "collective session 24"). Callers walk sessions in
 * CHRONOLOGICAL order so the first (true) claimant keeps the clean anchor; later
 * duplicates get a day suffix. Deterministic across builds.
 */
export function uniqueSessionAnchor(
  used: Set<string>,
  heading: string,
  dayId: string,
  indexInFile: number,
): string {
  const base = sessionAnchor(heading, dayId, indexInFile)
  let anchor = base
  if (used.has(anchor)) anchor = `${base}-${dayId}`
  let n = 2
  while (used.has(anchor)) anchor = `${base}-${dayId}-${n++}`
  used.add(anchor)
  return anchor
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

export function renderMarkdown(text: string, refs?: MdRefs): string {
  return markDeliberation(md.render(text, { mdRefs: refs }))
}

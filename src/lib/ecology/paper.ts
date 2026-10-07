// src/lib/ecology/paper.ts — the Field's paper, rendered (2026-10-07).
//
// Since the architect's decision of 2026-10-07 (wording private; docs/design/2026-10-07-the-
// convening.md) each Field presentation carries a `paper.md` in preprint form. The Field mirror
// (field-integrate.yml) lands it bare in public/field/presentations/cycle-NNN/, where it is served
// as a raw file; this module makes it readable as a page, /field/papers/cycle-NNN/.
//
// The renderer is the house's own for mirrored markdown (markdown-it, as on /arch/read and in the
// practices' journals), with raw HTML off — the paper is the practice's text, not markup this
// site would run. What it does to the record, and nothing more:
//   · relative links and images resolve against the presentation directory the paper sits in, so
//     `data/table.csv` or `figure.svg` reach the files the mirror served beside it; a path that
//     climbs out of the mirrored presentations points at the Field's repository instead;
//   · headings carry github-slugger ids, so a paper's own `#references` links land.
// Reference-style links and tables are markdown-it's own. Footnotes and math are not part of this
// renderer and appear as the practice wrote them — the page says so rather than guessing.
import { posix } from 'node:path'
import GithubSlugger from 'github-slugger'
import MarkdownIt from 'markdown-it'

const REPO = 'https://github.com/frankbueltge/field-research'
const MIRROR = '/field/presentations'

/** Where a link or image inside the paper points on this site. `dir` is the presentation
 *  directory (`cycle-006`). Absolute URLs, root paths and fragments are left as written. */
export function resolvePaperHref(href: string, dir: string): string {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) return href
  const [pathPart, ...hash] = href.split('#')
  const fragment = hash.length > 0 ? `#${hash.join('#')}` : ''
  const target = posix.normalize(posix.join(MIRROR, dir, pathPart ?? ''))
  if (target.startsWith(`${MIRROR}/`)) return `${target}${fragment}`
  const inRepo = posix.normalize(posix.join('presentations', dir, pathPart ?? ''))
  return inRepo.startsWith('..') ? href : `${REPO}/blob/main/${inRepo}${fragment}`
}

export interface RenderedPaper {
  /** the paper's own first H1, without markdown emphasis marks; null when it has none */
  title: string | null
  html: string
}

export function renderPaper(source: string, dir: string): RenderedPaper {
  const md = new MarkdownIt({ html: false, linkify: true })
  // bare file names such as `paper.md` would otherwise linkify as domains (.md is a ccTLD)
  md.linkify.set({ fuzzyLink: false })

  const slugger = new GithubSlugger()
  const passThrough: NonNullable<typeof md.renderer.rules.link_open> = (tokens, idx, opts, _env, self) =>
    self.renderToken(tokens, idx, opts)

  const linkOpen = md.renderer.rules.link_open ?? passThrough
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const href = tokens[idx]!.attrGet('href')
    if (href) tokens[idx]!.attrSet('href', resolvePaperHref(href, dir))
    return linkOpen(tokens, idx, opts, env, self)
  }

  const image = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, opts, env, self) => {
    const src = tokens[idx]!.attrGet('src')
    if (src) tokens[idx]!.attrSet('src', resolvePaperHref(src, dir))
    return image(tokens, idx, opts, env, self)
  }

  const headingOpen = md.renderer.rules.heading_open ?? passThrough
  md.renderer.rules.heading_open = (tokens, idx, opts, env, self) => {
    const inline = tokens[idx + 1]
    const text = inline?.children?.map((c) => (c.type === 'text' || c.type === 'code_inline' ? c.content : '')).join('') ?? ''
    if (text.trim()) tokens[idx]!.attrSet('id', slugger.slug(text))
    return headingOpen(tokens, idx, opts, env, self)
  }

  const h1 = /^#\s+(.+?)\s*#*\s*$/m.exec(source)
  const title = h1 ? h1[1]!.replace(/[*_`]/g, '').trim() || null : null
  return { title, html: md.render(source) }
}

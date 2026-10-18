// src/lib/engines/share.ts — what a shared link to a practice's page shows, and the way back
// (2026-10-18).
//
// The practices' finished works and cycle presentations are served bare, byte for byte as the
// practices built them (src/lib/engines/publication.mjs). Measured on 2026-10-15 and again on this
// day: not one of them carried an og:image, most carried no description a link preview could show,
// and every presentation, closing report and nightly face opened with no link back to the site. A
// link the owner sends to a curator showed a bare address. This module writes the two things the
// build adds to such a page on dist/ (src/lib/engines/share-dist.ts runs it), and nothing else:
//
//   · the SHARE block in <head>: the preview tags (og:*, twitter:card), and a description and a
//     canonical address where the page has none. Every tag the page declares itself is left alone
//     and not repeated: the practice's own words win, and a crawler that reads the first of two
//     og:titles never meets a second one.
//   · the BACK strip after <body>: one line back to the site and to the practice, on a page that
//     does not already carry the house's work frame (./work-frame.ts), which has its own.
//
// Both are pure string functions and safe to repeat: each block is wrapped in its own comment
// markers, removed before it is written again, and written again only from the inputs. Running the
// build step twice over one dist/ gives the same bytes as running it once. Neither touches the
// mirrors in public/ — the mirror stays the practice's file, as the work frame's comment demands.
//
// The constraints of the practices' Content-Security-Policy hold here as in the frame: inline
// <style> and plain links, no `style=` attribute, no script, no request to any other host.

import { SHARE } from '@/config/share-wording'
import { bodyStartAt, headInsertAt } from './html-places'
import { FRAME_MARKER } from './work-frame'

export const SHARE_MARKER = 'fbde-share'
export const BACK_MARKER = 'fbde-back'

const SHARE_OPEN = `<!--${SHARE_MARKER}-->`
const SHARE_CLOSE = `<!--/${SHARE_MARKER}-->`
const BACK_OPEN = `<!--${BACK_MARKER}-->`
const BACK_CLOSE = `<!--/${BACK_MARKER}-->`

// ── reading a page ──────────────────────────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
  mdash: '—', ndash: '–', minus: '−', middot: '·', bull: '•', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', sbquo: '‚', bdquo: '„',
  times: '×', divide: '÷', plusmn: '±', le: '≤', ge: '≥', ne: '≠', asymp: '≈', deg: '°', prime: '′',
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', harr: '↔',
  copy: '©', reg: '®', trade: '™', sect: '§', para: '¶', thinsp: ' ', ensp: ' ', emsp: ' ',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', agrave: 'à', egrave: 'è',
  ccedil: 'ç', ntilde: 'ñ', frac12: '½', frac14: '¼', frac34: '¾',
}

/** Decode the character references a page's text uses. An unknown named reference stays as written. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (whole, ref: string) => {
    if (ref[0] === '#') {
      const code = ref[1] === 'x' || ref[1] === 'X' ? Number.parseInt(ref.slice(2), 16) : Number.parseInt(ref.slice(1), 10)
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole
    }
    return NAMED_ENTITIES[ref] ?? whole
  })
}

/** A tag that breaks a line where it stands; every other tag is inline and joins its neighbours. */
const BREAKING_TAG = /<\/?(br|p|div|li|ul|ol|dl|dt|dd|h[1-6]|tr|td|th|table|section|article|aside|header|footer|main|blockquote|figcaption|hr)\b[^>]*>/gi

/** Text content of a piece of markup: tags out, references decoded, white space collapsed, and no
 *  space left before the punctuation an inline tag used to touch (`<i>Art</i>, read`). */
export function textOf(markup: string): string {
  return decodeEntities(markup.replace(BREAKING_TAG, ' ').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)\]’”])/g, '$1')
    .replace(/([(\[‘“])\s+/g, '$1')
    .trim()
}

const escAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escText = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A page without the blocks the site writes into it, so reading it reads the practice's page: the
 *  share block and the strip (this module), the work frame (./work-frame.ts), and any other block
 *  of the house's, which all carry an `fbde-` class (the reception's band of 2026-10-18 is one). */
export function withoutHouseBlocks(html: string): string {
  return stripBack(stripShare(html))
    .replace(new RegExp(`<header class="${FRAME_MARKER}"[^>]*>[\\s\\S]*?</header>`, 'g'), '')
    .replace(new RegExp(`<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot"[^>]*>[\\s\\S]*?</footer>`, 'g'), '')
    .replace(/<section class="fbde-[a-z-]+"[\s\S]*?<\/section>/g, '')
}

/** A start tag's attributes, quote-aware: a value may hold a literal `>`. */
const ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`

/** The attributes of one start tag, names lowercased. */
function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  const inner = tag.replace(/^<[^\s>]+/, '').replace(/\/?>$/, '')
  for (const m of inner.matchAll(re)) out[m[1]!.toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
  return out
}

/** The part of a page before its body starts: where its own <title> and <meta> stand. */
function headOf(html: string): string {
  return html.slice(0, bodyStartAt(html))
}

/** What a page already says about itself in its head: the metadata the share block must not repeat. */
export interface OwnMeta {
  /** og:* properties the page sets itself, lowercased (`og:title`, `og:image`, …) */
  og: Set<string>
  /** twitter:* names the page sets itself */
  twitter: Set<string>
  /** the first value of each of them, and of `description` */
  values: Map<string, string>
  description: string | null
  canonical: string | null
  ogImage: string | null
}

export function ownMeta(html: string): OwnMeta {
  const head = headOf(stripShare(html))
  const own: OwnMeta = { og: new Set(), twitter: new Set(), values: new Map(), description: null, canonical: null, ogImage: null }
  for (const m of head.matchAll(new RegExp(`<meta\\b${ATTRS}>`, 'gi'))) {
    const a = attributes(m[0])
    const key = (a.property ?? a.name ?? '').toLowerCase()
    const content = (a.content ?? '').trim()
    if (!key || !content) continue
    if (!own.values.has(key)) own.values.set(key, content)
    if (key.startsWith('og:')) {
      own.og.add(key)
      if (key === 'og:image' && !own.ogImage) own.ogImage = content
    } else if (key.startsWith('twitter:')) own.twitter.add(key)
    else if (key === 'description' && own.description === null) own.description = content
  }
  for (const m of head.matchAll(new RegExp(`<link\\b${ATTRS}>`, 'gi'))) {
    const a = attributes(m[0])
    if ((a.rel ?? '').toLowerCase().split(/\s+/).includes('canonical') && a.href) own.canonical = a.href
  }
  return own
}

/** The page's own title: its <title>, else its first <h1>, else null. */
export function pageTitle(html: string): string | null {
  const page = withoutHouseBlocks(html)
  const head = headOf(page)
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]
  const fromTitle = title ? textOf(title) : ''
  if (fromTitle) return fromTitle
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(page)?.[1]
  const fromH1 = h1 ? textOf(h1) : ''
  return fromH1 || null
}

/** How long a description may run before it is cut: about what a link preview shows. */
export const DESCRIPTION_MAX = 220
/** A paragraph shorter than this is a label or a kicker, not an opening a description is read from. */
const OPENING_MIN = 60

/** Words after which a full stop does not end a sentence. */
const ABBREVIATION = /^(e\.g|i\.e|cf|vs|etc|ca|c|approx|al|fig|figs|eq|no|nos|vol|pp|p|ch|sec|dr|mr|mrs|ms|st|jr|sr|inc|ltd|co|mt)\.$/i

/** A text cut into its sentences: a sentence ends at `.`, `!` or `?` (and any closing quote or
 *  bracket) followed by a space and a capital, a digit or an opening quote — not inside `1.5`,
 *  `paper.md` or `U.S.`, and not after a common abbreviation. Nothing between the cuts is lost. */
export function splitSentences(text: string): string[] {
  const out: string[] = []
  let start = 0
  for (const m of text.matchAll(/[.!?]+["'’”)\]]*(?=\s+["'‘“(\[]?[A-Z0-9])/g)) {
    const end = (m.index ?? 0) + m[0].length
    const piece = text.slice(start, end).trim()
    const last = piece.split(/\s+/).pop() ?? ''
    if (/^([A-Z]\.)+$/.test(last) || ABBREVIATION.test(last)) continue
    if (piece) out.push(piece)
    start = end
  }
  const rest = text.slice(start).trim()
  if (rest) out.push(rest)
  return out
}

/** Whole sentences from the start of a text, as many as fit in `max`; a first sentence longer than
 *  that is cut at the last word that fits, and says so with an ellipsis — never mid-word. */
export function sentences(text: string, max: number = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  let out = ''
  for (const part of splitSentences(clean)) {
    const next = `${out}${out ? ' ' : ''}${part}`
    if (next.length > max) break
    out = next
  }
  // whole sentences, unless they come to a fragment ("Session 88, 2026-09-12."): then the text runs
  // on to the last word that fits
  if (out.length >= max / 3) return out
  const room = clean.slice(0, max - 1)
  const soft = room.lastIndexOf(' ')
  return `${(soft > max / 2 ? room.slice(0, soft) : room).replace(/[\s,;:–—-]+$/, '')}…`
}

/** A paragraph a page marks as its summary: a standfirst, a lede, an abstract. */
const SUMMARY_CLASS = /\b(stand(first)?|lede|lead|intro|deck|summary|abstract|sub(title)?)\b/i
/** A paragraph a page marks as a label: read past it. */
const LABEL_CLASS = /\b(kicker|eyebrow|label|crumbs?|byline|meta|dateline|credit|caption)\b/i

/** A label line: short phrases between middle dots (`The Field · cycle 004 · 2026-10-05`), one
 *  sentence at most. Pages open with them; a description is not read from them. */
export function isLabelLine(text: string): boolean {
  return (text.match(/ · /g) ?? []).length >= 2 && splitSentences(text).length <= 1 && text.length < 260
}

/** A paragraph's text with the label lines it opens with left out — the ones that stand on lines of
 *  their own (`<br>`), and a label that runs into the first sentence. */
function paragraphText(inner: string): string {
  const lines = inner.split(/<br\s*\/?>/i).map(textOf).filter(Boolean)
  while (lines.length > 1 && isLabelLine(lines[0]!)) lines.shift()
  const parts = splitSentences(lines.join(' '))
  while (parts.length > 1 && isLabelLine(parts[0]!)) parts.shift()
  return parts.join(' ')
}

/** The page's opening, read as a description: the paragraph it marks as its standfirst or lede,
 *  else the first paragraph long enough to be one that is not a label line. */
export function openingSentences(html: string, max: number = DESCRIPTION_MAX): string | null {
  const page = withoutHouseBlocks(html)
  const body = page
    .slice(headOf(page).length)
    .replace(/<(script|style|svg|noscript|template|nav|footer|figure|table|button|select)\b[\s\S]*?<\/\1>/gi, ' ')
  const paragraphs = [...body.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi)]
    .map((m) => ({ cls: /\bclass\s*=\s*["']([^"']*)["']/i.exec(m[1] ?? '')?.[1] ?? '', text: paragraphText(m[2] ?? '') }))
    .filter((p) => !LABEL_CLASS.test(p.cls) && !isLabelLine(p.text))
  const marked = paragraphs.find((p) => SUMMARY_CLASS.test(p.cls) && p.text.length >= 40)
  if (marked) return sentences(marked.text, max)
  const first = paragraphs.find((p) => p.text.length >= OPENING_MIN)
  return first ? sentences(first.text, max) : null
}

// ── the share block ─────────────────────────────────────────────────────────────────────────

export interface ShareImage {
  /** absolute address */
  url: string
  width: number
  height: number
  alt: string
  type: 'image/png' | 'image/jpeg'
}

export interface ShareMeta {
  /** the page's absolute canonical address */
  url: string
  title: string
  description: string
  siteName: string
  /** null where the page names its own og:image, or where none could be made */
  image: ShareImage | null
}

export function stripShare(html: string): string {
  return html.replace(new RegExp(`${SHARE_OPEN}[\\s\\S]*?${SHARE_CLOSE}`, 'g'), '')
}

/** The tags the site adds, minus every one the page already sets. */
export function shareBlock(meta: ShareMeta, own: OwnMeta): string {
  const tags: string[] = []
  const og = (property: string, content: string | number) => {
    if (!own.og.has(property)) tags.push(`<meta property="${property}" content="${escAttr(String(content))}">`)
  }
  if (own.description === null) tags.push(`<meta name="description" content="${escAttr(meta.description)}">`)
  if (own.canonical === null) tags.push(`<link rel="canonical" href="${escAttr(meta.url)}">`)
  og('og:type', 'website')
  og('og:site_name', meta.siteName)
  og('og:title', meta.title)
  og('og:description', meta.description)
  og('og:url', meta.url)
  og('og:locale', 'en_US')
  if (meta.image && !own.og.has('og:image')) {
    og('og:image', meta.image.url)
    og('og:image:type', meta.image.type)
    og('og:image:width', meta.image.width)
    og('og:image:height', meta.image.height)
    og('og:image:alt', meta.image.alt)
  }
  if (!own.twitter.has('twitter:card')) tags.push(`<meta name="twitter:card" content="${meta.image || own.ogImage ? 'summary_large_image' : 'summary'}">`)
  return tags.length ? `${SHARE_OPEN}${tags.join('')}${SHARE_CLOSE}` : ''
}

/** The page with its share block written anew: before `</head>`, or, on a page that writes no
 *  head, right after the document's opening, where the parser still reads head matter. */
export function injectShare(html: string, meta: ShareMeta): string {
  const bare = stripShare(html)
  const block = shareBlock(meta, ownMeta(bare))
  if (!block) return bare
  const at = headInsertAt(bare)
  return bare.slice(0, at) + block + bare.slice(at)
}

// ── the way back ────────────────────────────────────────────────────────────────────────────

const B = BACK_MARKER
// Explicit on every property, namespaced on every element, and light in both colour schemes, for
// the reasons the work frame gives (work-frame.ts): the page below owns the document and may style
// bare `a` or `nav` however it likes, and a wall label is printed on paper.
const BACK_STYLE = `<style>
.${B}{all:initial;display:block;box-sizing:border-box;width:100%;margin:0;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 font-size:13px;line-height:1.6;background:#f4f4f1;color:#1a1a1a;border-bottom:1px solid #d8d8d2;
 padding:7px 22px;position:relative;z-index:2147483000;}
.${B} *{box-sizing:border-box;font-family:inherit;font-size:inherit;line-height:inherit;}
.${B} a{color:#1a1a1a;text-decoration:underline;text-underline-offset:2px;background:none;}
.${B} a:hover,.${B} a:focus{color:#000;background:#e6e6e0;}
.${B} a:focus-visible{outline:2px solid #1a1a1a;outline-offset:2px;}
.${B} .${B}__sep{color:#8a8a84;padding:0 6px;}
.${B} .${B}__note{color:#6b6b64;font-size:12px;padding-left:12px;}
@media (max-width:520px){.${B}{padding:7px 16px;}.${B} .${B}__note{display:none;}}
@media print{.${B}{display:none;}}
</style>`

/** Whether a page already carries a way back: the house's work frame, which has its own. */
export function hasHouseFrame(html: string): boolean {
  return html.includes(`<header class="${FRAME_MARKER}"`)
}

export function stripBack(html: string): string {
  return html.replace(new RegExp(`${BACK_OPEN}[\\s\\S]*?${BACK_CLOSE}`, 'g'), '')
}

/** The strip itself: `← frankbueltge.de · The Field`, and the note that says whose it is. */
export function backStrip(practice: { label: string; href: string }): string {
  const S = SHARE.back
  const sep = `<span class="${B}__sep" aria-hidden="true">·</span>`
  return (
    `${BACK_OPEN}${BACK_STYLE}` +
    `<nav class="${B}" aria-label="${escAttr(S.aria)}">` +
    `<a href="${escAttr(S.site.href)}">${S.prefix} ${escText(S.site.label)}</a>${sep}` +
    `<a href="${escAttr(practice.href)}">${escText(practice.label)}</a>` +
    `<span class="${B}__note">${escText(S.note)}</span>` +
    `</nav>${BACK_CLOSE}`
  )
}

/**
 * The page with its back strip written anew at the top of its body (./html-places.ts) — or without
 * one, where the house's work frame already leads back (`placed: false`).
 */
export function injectBack(html: string, practice: { label: string; href: string }): { html: string; placed: boolean } {
  const bare = stripBack(html)
  if (hasHouseFrame(bare)) return { html: bare, placed: false }
  const at = bodyStartAt(bare)
  return { html: bare.slice(0, at) + backStrip(practice) + bare.slice(at), placed: true }
}

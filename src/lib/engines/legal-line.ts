// src/lib/engines/legal-line.ts — what a published practice page owes its visitor in law (2026-11-14).
//
// The practices' works and presentations are served bare, as their makers left them. A legal review
// of the site on 2026-11-14 found three things such a page did not carry on its own:
//
//   1. Who made it. The pages are researched, written and built by an AI system, and several of them
//      inform the public on matters of public interest (the programme's question is one). Since
//      2026-08-02 the EU's AI Act asks that such text says it is machine-made (Article 50(4)) unless a
//      person reviewed it, and nobody reviews these. The house said so on /apparatus and on the
//      practices' rooms, but not on the page a shared link opens.
//   2. The imprint and the privacy notice. Both were two clicks away, through the way back. A page
//      that carries a rating form and may read live data should name them itself.
//   3. No request to a font host. The privacy notice says that fonts are served from this site and
//      nothing goes to a third party. One Atelier presentation carried a stylesheet link and a
//      preconnect hint to Google Fonts. The practices' policy already refuses the stylesheet
//      (style-src 'self'), but a preconnect hint is not a stylesheet: a browser may open the
//      connection, and Cloudflare turns such a hint into a Link header of its own. So the served
//      copy loses both tags. The mirror in public/ and the practice's file are never touched.
//
// Run by ./share-dist.ts on every published practice page, after the frame and the way back. Like
// the other blocks the house writes, the line removes only itself before it is written again, so
// the steps compose and a second run changes no byte. Arch's works stay bare (naming.ts says why);
// they are not on the list this runs over.

import { SHARE } from '@/config/share-wording'

export const LEGAL_MARKER = 'fbde-legal'
const L = LEGAL_MARKER
const OPEN = `<!--${L}-->`
const CLOSE = `<!--/${L}-->`

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Explicit on every property, like the frame's strip (./work-frame.ts): the document around it owns
// the bare elements. Light in both colour schemes, as the strip and the reception band are.
const STYLE = `<style>
.${L}{all:initial;display:block;box-sizing:border-box;width:100%;margin:0;padding:12px 22px 14px;
 background:#f4f4f1;color:#6b6b64;border-top:1px solid #d8d8d2;font-size:12px;line-height:1.6;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
.${L} *{all:unset;box-sizing:border-box;font-family:inherit;}
.${L} a{color:#1a1a1a;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
.${L} a:hover,.${L} a:focus{color:#000;background:#e6e6e0;}
.${L} .${L}__sep{color:#8a8a84;padding:0 6px;}
@media (max-width:520px){.${L}{padding:10px 16px 12px;}}
</style>`

/** The line itself: who made the page, then the imprint and the privacy notice. */
export function legalLine(): string {
  const S = SHARE.legal
  const sep = `<span class="${L}__sep" aria-hidden="true">·</span>`
  return (
    `${OPEN}${STYLE}` +
    `<div class="${L}" role="contentinfo" aria-label="${esc(S.aria)}">` +
    `<span>${esc(S.made)}</span>${sep}` +
    `<a href="${esc(S.imprint.href)}">${esc(S.imprint.label)}</a>${sep}` +
    `<a href="${esc(S.privacy.href)}">${esc(S.privacy.label)}</a>${sep}` +
    `<span>${esc(S.note)}</span>` +
    `</div>${CLOSE}`
  )
}

export function stripLegal(html: string): string {
  return html.replace(new RegExp(`${OPEN}[\\s\\S]*?${CLOSE}`, 'g'), '')
}

/** The page with the line written anew as the last thing in its body. */
export function injectLegal(html: string): string {
  const page = stripLegal(html)
  const close = page.lastIndexOf('</body>')
  return close >= 0 ? page.slice(0, close) + legalLine() + page.slice(close) : page + legalLine()
}

/** Hosts that serve fonts to whoever asks, and learn the asker's address by it. */
export const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'fonts.bunny.net', 'use.typekit.net', 'p.typekit.net'] as const

// quote-aware: an attribute value may hold a literal `>`
const LINK = /<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i

function isFontHost(href: string): boolean {
  const m = /^(?:https?:)?\/\/([^/?#]+)/i.exec(href.trim())
  if (!m) return false
  const host = m[1]!.toLowerCase().replace(/:\d+$/, '')
  return FONT_HOSTS.some((h) => host === h)
}

/**
 * The page without its `<link>` tags to a font host: stylesheets, preconnect and dns-prefetch
 * hints alike. The page then falls back to the next family its own CSS names, which is what a
 * visitor already saw, because the policy refused the stylesheet all along.
 */
export function withoutFontHosts(html: string): { html: string; removed: number } {
  let removed = 0
  const out = html.replace(LINK, (tag) => {
    const m = HREF.exec(tag)
    const href = m ? (m[1] ?? m[2] ?? m[3] ?? '') : ''
    if (!isFontHost(href)) return tag
    removed++
    return ''
  })
  return { html: out, removed }
}

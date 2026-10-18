// src/lib/engines/html-places.ts — where the site may write into a practice's page (2026-10-18).
//
// The practices ship their pages in every shape a browser accepts: whole documents, documents
// without a <head> or a <body> tag, and bare fragments that open with a <title> and a <style>. The
// house writes three things into the served copies — the work frame (./work-frame.ts), the share
// block and the back strip (./share.ts) — and each needs a place that means the same thing in every
// shape: the head, or the top of the body. Until this day the frame was simply put before
// everything else where a page had neither tag, which on a page that does open with
// `<!doctype html>` pushed the doctype off the first line and the page into quirks mode.
//
// These two functions read the page the way the HTML parser does, as far as the question needs:
// head matter (comments, the doctype, <html>/<head>, meta, link, base, title, style, script,
// noscript, template) may stand before the body; the first thing that is anything else opens it.

// quote-aware: an attribute value may hold a literal `>`
const ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`
const HEAD_VOID = new RegExp(`^<(meta|link|base|basefont|bgsound)\\b${ATTRS}>`, 'i')
const HEAD_RAW = new RegExp(`^<(title|style|script|noscript|noframes|template)\\b${ATTRS}>`, 'i')
const OPENING = new RegExp(`^<(!doctype\\b|html\\b|head\\b)${ATTRS}>`, 'i')

/** Walk the head matter at the start of a page; returns where it ends, and where each opening tag
 *  of the document (doctype, html, head) ended, if any. */
function scan(html: string): { end: number; afterOpening: number } {
  let i = 0
  let afterOpening = 0
  const n = html.length
  while (i < n) {
    while (i < n && /\s/.test(html[i]!)) i++
    if (i >= n) break
    if (html.startsWith('<!--', i)) {
      const close = html.indexOf('-->', i + 4)
      if (close < 0) return { end: n, afterOpening }
      i = close + 3
      continue
    }
    const rest = html.slice(i, i + 4096)
    const opening = OPENING.exec(rest)
    if (opening) {
      i += opening[0].length
      afterOpening = i
      continue
    }
    const empty = HEAD_VOID.exec(rest)
    if (empty) {
      i += empty[0].length
      continue
    }
    const raw = HEAD_RAW.exec(rest)
    if (raw) {
      const name = raw[1]!.toLowerCase()
      const closeAt = html.toLowerCase().indexOf(`</${name}`, i + raw[0].length)
      if (closeAt < 0) return { end: n, afterOpening }
      const gt = html.indexOf('>', closeAt)
      i = gt < 0 ? n : gt + 1
      continue
    }
    break
  }
  return { end: i, afterOpening }
}

/** Where the body begins: just after `<body …>`, else just after `</head>`, else before the first
 *  thing that is not head matter. What the site puts at the top of a page goes here. */
export function bodyStartAt(html: string): number {
  const body = /<body\b[^>]*>/i.exec(html)
  if (body) return body.index + body[0].length
  const head = /<\/head\s*>/i.exec(html)
  if (head) return head.index + head[0].length
  return scan(html).end
}

/** Where the site's head matter goes: just before `</head>`, else right after the document's
 *  opening (`<!doctype>`, `<html>`, `<head>`), before the page's own head matter — a place that
 *  does not move when the site writes something at the top of the body. */
export function headInsertAt(html: string): number {
  const head = /<\/head\s*>/i.exec(html)
  if (head) return head.index
  return scan(html).afterOpening
}

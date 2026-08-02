// The frame around a STANDALONE work (Frank, 2026-08-02).
//
// A work published as `index.html` is mirrored byte-for-byte out of its engine repo into
// public/<ns>/werke-html/<slug>/ and served straight from there. It never passes through
// Astro, which is why two things the site believed it had done had not reached it:
//
//   1. The wall text. renderWrapperPage put the plain-language label at the head of every
//      work on 2026-08-01 — but only for the Astro-wrapped ones. The interactive works, the
//      ones a visitor is most likely to arrive at cold, still opened with no idea what they
//      were looking at. (Found by Frank on /atelier/werke-html/2026-07-23-negative-parallax/.)
//   2. Any way back. All nine standalone works carried ZERO internal links — only outbound
//      source citations. A visitor arriving from a shared link or a search result met a work
//      with no author, no practice, and no exit.
//
// The frame closes both, and it is deliberately NOT part of the work:
//   · the ENGINE's file is never touched; only the mirror carries the frame, and the mirror
//     is rewritten from source on every integrate, so the frame can never be hand-edited
//     into drift the way a per-work fix would be;
//   · it announces itself ("added by the site"), so a reader never mistakes the site's
//     framing for the practice's own words;
//   · a missing wall text renders NOTHING rather than falling back to `embodies` — the same
//     rule renderWrapperPage follows, so the gap stays countable instead of being papered
//     over with the apparatus prose the wall text exists to replace.
//
// Constraints that are not negotiable here: the standalone route runs under its own CSP
// (`default-src 'none'; style-src 'unsafe-inline'`, see public/_headers), so the frame is
// inline HTML and inline CSS with no external request of any kind, and no JavaScript — it
// must work in a document whose own scripts have failed.
import { NAMING } from '@/config/naming'

/** Marker so framing is idempotent: re-running over an already-framed mirror is a no-op
 *  rather than a second strip. The integrate wipes and re-copies, but the reframe script
 *  and any local rehearsal run over files that may already carry one. */
export const FRAME_MARKER = 'fbde-work-frame'

interface Practice {
  name: string
  roomLabel: string
  roomHref: string
  href: string
}

/** The practice a namespace belongs to, or null for a house that keeps no works room. */
export function practiceFor(ns: string): Practice | null {
  const p = NAMING.worksRegister.practices.find((x) => x.ns === ns)
  if (!p) return null
  return { name: p.name, roomLabel: p.roomLabel, roomHref: p.roomHref, href: `/${ns}` }
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Explicit on every property that matters, and namespaced on every element: the work below
// owns the document and may style bare `a`, `p`, `nav` or `header` however it likes. The band
// stays light in both colour schemes on purpose — a wall label is printed on paper, and the
// works themselves are fixed-light documents, so a dark strip above a light work would read
// as a rendering fault rather than a design.
const STYLE = `<style>
.${FRAME_MARKER}{all:initial;display:block;box-sizing:border-box;width:100%;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 background:#f4f4f1;color:#1a1a1a;border-bottom:1px solid #d8d8d2;padding:14px 22px;}
.${FRAME_MARKER}--foot{border-bottom:0;border-top:1px solid #d8d8d2;margin-top:48px;}
.${FRAME_MARKER} *{box-sizing:border-box;font-family:inherit;}
.${FRAME_MARKER} .${FRAME_MARKER}__nav{display:block;font-size:13px;line-height:1.6;margin:0;}
.${FRAME_MARKER} a{color:#1a1a1a;text-decoration:underline;text-underline-offset:2px;}
.${FRAME_MARKER} a:hover,.${FRAME_MARKER} a:focus{color:#000;background:#e6e6e0;}
.${FRAME_MARKER} .${FRAME_MARKER}__sep{color:#8a8a84;padding:0 6px;}
.${FRAME_MARKER} .${FRAME_MARKER}__wall{margin:10px 0 0;max-width:64ch;font-size:15px;
 line-height:1.65;color:#1a1a1a;}
.${FRAME_MARKER} .${FRAME_MARKER}__note{margin:8px 0 0;font-size:12px;line-height:1.5;
 color:#6b6b64;}
@media (max-width:520px){.${FRAME_MARKER}{padding:12px 16px;}}
</style>`

function nav(p: Practice | null, ecology: { label: string; href: string }): string {
  const sep = `<span class="${FRAME_MARKER}__sep" aria-hidden="true">·</span>`
  const back = NAMING.worksRegister.standaloneFrame.backPrefix
  const parts = p
    ? [
        `<a href="${p.href}">${back} ${esc(p.name)}</a>`,
        `<a href="${p.roomHref}">${esc(p.roomLabel)}</a>`,
        `<a href="${ecology.href}">${esc(ecology.label)}</a>`,
      ]
    : [`<a href="${ecology.href}">${back} ${esc(ecology.label)}</a>`]
  return `<nav class="${FRAME_MARKER}__nav">${parts.join(sep)}</nav>`
}

/**
 * Wrap a standalone work's HTML in the site's frame. Returns the input unchanged if it is
 * already framed, so the operation is safe to repeat.
 *
 * @param html      the work exactly as its practice published it
 * @param ns        engine namespace ('atelier', 'studio', …)
 * @param wallText  the plain-language label, or null/undefined when none is on record yet —
 *                  in which case the strip carries the links alone and NO substitute prose
 */
export function frameStandaloneWork(
  html: string,
  ns: string,
  wallText?: string | null,
): string {
  if (html.includes(FRAME_MARKER)) return html

  const cfg = NAMING.worksRegister.standaloneFrame
  const p = practiceFor(ns)
  const wall = wallText?.trim()
    ? `<p class="${FRAME_MARKER}__wall">${esc(wallText.trim())}</p>`
    : ''

  const head =
    `${STYLE}<header class="${FRAME_MARKER}" role="doc-foreword">` +
    `${nav(p, cfg.ecology)}${wall}` +
    `<p class="${FRAME_MARKER}__note">${esc(cfg.note)}</p>` +
    `</header>`
  const foot =
    `<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot">` +
    `<p class="${FRAME_MARKER}__note">${esc(cfg.footLead)}</p>` +
    `${nav(p, cfg.ecology)}` +
    `</footer>`

  // Insert after the opening <body> when there is one; a work that ships a fragment or an
  // unusual head still gets its frame rather than silently going without.
  const bodyOpen = /<body\b[^>]*>/i.exec(html)
  const withHead = bodyOpen
    ? html.slice(0, bodyOpen.index + bodyOpen[0].length) +
      head +
      html.slice(bodyOpen.index + bodyOpen[0].length)
    : html.includes('</head>')
      ? html.replace('</head>', `</head>${head}`)
      : head + html

  const bodyClose = withHead.lastIndexOf('</body>')
  return bodyClose >= 0
    ? withHead.slice(0, bodyClose) + foot + withHead.slice(bodyClose)
    : withHead + foot
}

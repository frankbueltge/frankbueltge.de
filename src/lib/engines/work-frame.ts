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
// Constraints that are not negotiable here: the standalone route runs under the practices'
// shared CSP (src/lib/engines/practice-policy.ts, public/_headers), and the frame is inline HTML
// and inline CSS with no external request of any kind, and no JavaScript — it must work in a
// document whose own scripts have failed, whatever the work below it loads.
import { NAMING } from '@/config/naming'

/** Marker so framing is idempotent: re-running over an already-framed mirror yields the same
 *  result rather than a second strip. The integrate wipes and re-copies, but the reframe script
 *  and any local rehearsal run over files that may already carry one.
 *
 *  Idempotent means "same input and config produce the same output" — NOT "skip anything that
 *  already carries a marker". Until 2026-08-15 it meant the latter, and that quietly froze the
 *  frame's own content: when the ecology link was corrected from `/` to `/ecology`, the nine
 *  works already mirrored under the old wording kept pointing at the old address, because the
 *  marker was there and the function returned early. A frame whose text can change has to be
 *  replaceable, or every future correction stops at the works that need it most. */
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

/** One page on the shelf a house's front door carries — see `shelf` in frameStandaloneWork. */
export interface FrameShelfEntry {
  href: string
  /** the page's own title */
  title: string
  kind: 'work' | 'study'
  /** the day the practice's record gives the page, or null: shown as undated, never guessed */
  date: string | null
  /** the page's own first sentence, or null where it opens with none */
  sentence: string | null
}

/** How many entries stand open before the older studies fold away. Twelve is three rows of four
 *  at 1440 px. Works never fold: the practice declares few, and a shelf ordered newest first
 *  would otherwise hide them behind every study built since. */
export const SHELF_OPEN = 12
const SHELF_MIN_STUDIES = 4

const S = `${FRAME_MARKER}__shelf`

// The shelf's own rules, shipped only on the page that carries one — every other mirrored page
// keeps the frame it has, byte for byte. `all:unset` comes first because the document below owns
// the bare elements: n-1's front page styles `p`, `a`, `ul` and `li`, and a shelf that inherited
// them would be drawn half by the site and half by the practice. Unlike the bare strip, the
// shelf follows the colour scheme: it is a third of a screen on a page that goes dark with the
// reader's system, and a band that tall staying white would read as a rendering fault.
const SHELF_STYLE = `<style>
.${FRAME_MARKER} .${S},.${FRAME_MARKER} .${S} *{all:unset;box-sizing:border-box;font-family:inherit;}
.${FRAME_MARKER} .${S}{display:block;margin:12px 0 0;}
.${FRAME_MARKER} .${S}-head{display:block;margin:0 0 2px;font-size:12px;line-height:1.5;color:#6b6b64;}
.${FRAME_MARKER} .${S}-head b{font-weight:700;color:#1a1a1a;text-transform:uppercase;
 letter-spacing:.09em;font-size:11px;margin-right:10px;}
.${FRAME_MARKER} .${S}-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
 gap:0 26px;margin:0;padding:0;list-style:none;}
.${FRAME_MARKER} .${S}-item{display:block;position:relative;min-width:0;margin:6px 0 0;
 padding:9px 0 10px;border-top:1px solid #d8d8d2;}
.${FRAME_MARKER} .${S}-item:hover{border-top-color:#1a1a1a;}
.${FRAME_MARKER} .${S}-title{display:block;font-size:14px;line-height:1.35;font-weight:600;
 color:#1a1a1a;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;
 cursor:pointer;overflow-wrap:anywhere;}
.${FRAME_MARKER} .${S}-title::after{content:"";position:absolute;inset:0;}
.${FRAME_MARKER} .${S}-title:hover,.${FRAME_MARKER} .${S}-title:focus{color:#000;background:none;}
.${FRAME_MARKER} .${S}-title:focus-visible{outline:2px solid #1a1a1a;outline-offset:2px;}
.${FRAME_MARKER} .${S}-meta{display:block;margin:4px 0 0;font-size:11px;line-height:1.5;
 letter-spacing:.05em;color:#6b6b64;font-variant-numeric:tabular-nums;}
.${FRAME_MARKER} .${S}-kind{display:inline-block;margin-right:7px;padding:0 5px;
 border:1px solid #8a8a84;border-radius:2px;text-transform:uppercase;font-size:10px;
 line-height:1.5;color:#3d3d39;}
.${FRAME_MARKER} .${S}-kind[data-kind="work"]{background:#1a1a1a;border-color:#1a1a1a;color:#f4f4f1;}
.${FRAME_MARKER} .${S}-line{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
 overflow:hidden;margin:4px 0 0;font-size:12.5px;line-height:1.45;color:#3d3d39;}
.${FRAME_MARKER} .${S}-more{display:block;margin:8px 0 0;}
.${FRAME_MARKER} .${S}-more>summary{display:inline-block;font-size:12px;line-height:1.5;
 color:#1a1a1a;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
.${FRAME_MARKER} .${S}-more>summary::before{content:"+\\a0";}
.${FRAME_MARKER} .${S}-more[open]>summary::before{content:"\\2212\\a0";}
.${FRAME_MARKER} .${S}-more>summary:focus-visible{outline:2px solid #1a1a1a;outline-offset:2px;}
.${FRAME_MARKER} .${S}-more:not([open])>.${S}-list{display:none;}
@media (max-width:520px){.${FRAME_MARKER} .${S}-list{grid-template-columns:1fr;}
 .${FRAME_MARKER} .${S}-head b{display:block;margin:0;}
 .${FRAME_MARKER} .${S}-item{margin:4px 0 0;padding:8px 0;}
 .${FRAME_MARKER} .${S}-line{-webkit-line-clamp:3;}}
@media (prefers-color-scheme:dark){
.${FRAME_MARKER}[data-shelf]{background:#1c1b1a;color:#e8e6e1;border-bottom-color:#3a3833;}
.${FRAME_MARKER}[data-shelf] .${FRAME_MARKER}__nav a{color:#e8e6e1;}
.${FRAME_MARKER}[data-shelf] .${FRAME_MARKER}__nav a:hover,
.${FRAME_MARKER}[data-shelf] .${FRAME_MARKER}__nav a:focus{color:#fff;background:#2c2b28;}
.${FRAME_MARKER}[data-shelf] .${FRAME_MARKER}__sep{color:#7d7a72;}
.${FRAME_MARKER}[data-shelf] .${FRAME_MARKER}__note{color:#a09c93;}
.${FRAME_MARKER} .${S}-head{color:#a09c93;}
.${FRAME_MARKER} .${S}-head b{color:#e8e6e1;}
.${FRAME_MARKER} .${S}-item{border-top-color:#3a3833;}
.${FRAME_MARKER} .${S}-item:hover{border-top-color:#e8e6e1;}
.${FRAME_MARKER} .${S}-title{color:#e8e6e1;}
.${FRAME_MARKER} .${S}-title:hover,.${FRAME_MARKER} .${S}-title:focus{color:#fff;background:none;}
.${FRAME_MARKER} .${S}-title:focus-visible,
.${FRAME_MARKER} .${S}-more>summary:focus-visible{outline-color:#e8e6e1;}
.${FRAME_MARKER} .${S}-meta{color:#a09c93;}
.${FRAME_MARKER} .${S}-kind{border-color:#7d7a72;color:#cfccc4;}
.${FRAME_MARKER} .${S}-kind[data-kind="work"]{background:#e8e6e1;border-color:#e8e6e1;color:#1c1b1a;}
.${FRAME_MARKER} .${S}-line{color:#cfccc4;}
.${FRAME_MARKER} .${S}-more>summary{color:#e8e6e1;}
}
</style>`

/** Which entries stand open and which fold: every work, and the newest studies up to SHELF_OPEN
 *  entries in all — but never fewer than SHELF_MIN_STUDIES, however many works there come to
 *  be. The order is the caller's (newest first) and is kept on both sides of the fold. */
export function foldShelf(entries: readonly FrameShelfEntry[]): {
  open: FrameShelfEntry[]
  folded: FrameShelfEntry[]
} {
  const works = entries.filter((e) => e.kind === 'work').length
  const room = Math.max(SHELF_MIN_STUDIES, SHELF_OPEN - works)
  const open: FrameShelfEntry[] = []
  const folded: FrameShelfEntry[] = []
  let studies = 0
  for (const e of entries) {
    if (e.kind === 'work' || studies++ < room) open.push(e)
    else folded.push(e)
  }
  return { open, folded }
}

function shelfItem(e: FrameShelfEntry): string {
  const cfg = NAMING.worksRegister.standaloneFrame.shelf
  const when = e.date ? `<time datetime="${esc(e.date)}">${esc(e.date)}</time>` : esc(cfg.undated)
  const line = e.sentence?.trim() ? `<span class="${S}-line">${esc(e.sentence.trim())}</span>` : ''
  return (
    `<li class="${S}-item">` +
    `<a class="${S}-title" href="${esc(e.href)}">${esc(e.title)}</a>` +
    `<span class="${S}-meta"><span class="${S}-kind" data-kind="${e.kind}">${esc(cfg.kinds[e.kind])}</span>${when}</span>` +
    line +
    `</li>`
  )
}

/** The shelf itself: a heading that counts what stands on it, the entries, and the fold. */
function shelf(entries: readonly FrameShelfEntry[]): string {
  const cfg = NAMING.worksRegister.standaloneFrame.shelf
  const works = entries.filter((e) => e.kind === 'work').length
  const { open, folded } = foldShelf(entries)
  const count = cfg.count({ pages: entries.length, works, studies: entries.length - works })
  const more = folded.length
    ? `<details class="${S}-more"><summary>${esc(cfg.earlier(folded.length))}</summary>` +
      `<ol class="${S}-list">${folded.map(shelfItem).join('')}</ol></details>`
    : ''
  return (
    `<section class="${S}" aria-label="${esc(cfg.heading)}">` +
    `<p class="${S}-head"><b>${esc(cfg.heading)}</b>${esc(count)}</p>` +
    `<ol class="${S}-list">${open.map(shelfItem).join('')}</ol>` +
    more +
    `</section>`
  )
}

/** The house a namespace belongs to when it is not an ecology practice, or null.
 *  Machine Attention, n-1 and Error as Method are mirrored the same way the practices'
 *  standalone works are, but sending them "back" to the ecology would be a false claim
 *  about all three — see the `houses` note in naming.ts. */
export function houseFor(ns: string): { label: string; href: string; self?: string; bare?: string[] } | null {
  return NAMING.worksRegister.standaloneFrame.houses[ns] ?? null
}

function nav(
  p: Practice | null,
  ecology: { label: string; href: string },
  house: { label: string; href: string } | null,
  atHouseIndex = false,
): string {
  const sep = `<span class="${FRAME_MARKER}__sep" aria-hidden="true">·</span>`
  const cfg = NAMING.worksRegister.standaloneFrame
  const back = cfg.backPrefix
  const site = `<a href="${cfg.site.href}">${esc(cfg.site.label)}</a>`
  let parts: string[]
  if (p) {
    parts = [
      `<a href="${p.href}">${back} ${esc(p.name)}</a>`,
      `<a href="${p.roomHref}">${esc(p.roomLabel)}</a>`,
      `<a href="${ecology.href}">${esc(ecology.label)}</a>`,
    ]
  } else if (house) {
    // A link to the page one is already standing on is not an exit: the house's own front
    // door gets the site link alone, every page beneath it gets the house first.
    parts = atHouseIndex
      ? [`<a href="${cfg.site.href}">${back} ${esc(cfg.site.label)}</a>`]
      : [`<a href="${house.href}">${back} ${esc(house.label)}</a>`, site]
  } else {
    parts = [`<a href="${ecology.href}">${back} ${esc(ecology.label)}</a>`]
  }
  return `<nav class="${FRAME_MARKER}__nav">${parts.join(sep)}</nav>`
}

/** Remove a frame this module applied earlier, so the current one can take its place. Anchored
 *  on the marker class rather than on the literal strings, because the style block and the nav
 *  wording both move — matching a remembered literal would silently leave a stale copy behind.
 *  The header and footer carry no nested <header>/<footer>, so the lazy match cannot overrun
 *  into the work's own markup. */
function stripFrame(html: string): string {
  const styleRe = new RegExp(`<style>(?:(?!</style>)[\\s\\S])*${FRAME_MARKER}(?:(?!</style>)[\\s\\S])*</style>`, 'g')
  const headRe = new RegExp(`<header class="${FRAME_MARKER}"[^>]*>[\\s\\S]*?</header>`, 'g')
  const footRe = new RegExp(`<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot"[^>]*>[\\s\\S]*?</footer>`, 'g')
  return html.replace(styleRe, '').replace(headRe, '').replace(footRe, '')
}

/**
 * Wrap a standalone work's HTML in the site's frame. Safe to repeat: a work that already carries
 * a frame has it REPLACED by the current one, so a corrected link or a reworded note reaches the
 * works mirrored before the change (see FRAME_MARKER for what this cost when it merely skipped).
 *
 * @param html      the work exactly as its practice published it
 * @param ns        engine namespace ('atelier', 'studio', …)
 * @param wallText  the plain-language label, or null/undefined when none is on record yet —
 *                  in which case the strip carries the links alone and NO substitute prose
 * @param opts.shelf  the pages behind a house's front door, newest first, each in the page's own
 *                  words (n-1: src/lib/n1/shelf.ts). The strip lists them and says that it did.
 */
export function frameStandaloneWork(
  html: string,
  ns: string,
  wallText?: string | null,
  opts: { atHouseIndex?: boolean; shelf?: readonly FrameShelfEntry[] } = {},
): string {
  html = html.includes(FRAME_MARKER) ? stripFrame(html) : html

  const cfg = NAMING.worksRegister.standaloneFrame
  const p = practiceFor(ns)
  const house = p ? null : houseFor(ns)
  const wall = wallText?.trim()
    ? `<p class="${FRAME_MARKER}__wall">${esc(wallText.trim())}</p>`
    : ''
  const bar = nav(p, cfg.ecology, house, opts.atHouseIndex === true)

  // A front door may carry a shelf of the pages behind it. It sits inside the strip, above the
  // note, so the one sentence that says "added by the site" covers it too. An empty shelf is
  // not a shelf, and leaves the strip exactly as every other page has it.
  const entries = opts.shelf?.length ? opts.shelf : null
  const head =
    `${STYLE}${entries ? SHELF_STYLE : ''}` +
    `<header class="${FRAME_MARKER}" role="doc-foreword"${entries ? ' data-shelf' : ''}>` +
    `${bar}${wall}${entries ? shelf(entries) : ''}` +
    `<p class="${FRAME_MARKER}__note">${esc(entries ? cfg.shelf.note : cfg.note)}</p>` +
    `</header>`
  const foot =
    `<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot">` +
    `<p class="${FRAME_MARKER}__note">${esc(cfg.footLead)}</p>` +
    `${bar}` +
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

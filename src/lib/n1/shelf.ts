// src/lib/n1/shelf.ts — every page of n-1 a visitor can open, read from the practice's mirror.
//
// The practice builds pages most nights: three works under works/ and, since its projects began
// on 2026-09-25, a study or two per project under projects/. Until 2026-10-10 a visitor could
// reach them only through links inside the 1,800 words of the practice's own front page, and a
// night row in the signal log led to the record, never to the page the night had built (Frank's
// finding, wording private). This module is the one derivation the repairs read:
//
//   · the address a night row leads to (works.ts → live-sources.ts);
//   · the newest page the board and /experiments name;
//   · for some hours on 2026-10-10, a shelf the site added above the practice's front page. It
//     came off the same evening, when that page was replaced by one that shows its pages itself
//     (the founder's act in the practice's record, REQUESTS.md of that date). work-frame.ts can
//     still render one; nothing feeds it (scripts/engines/reframe-works.ts).
//
// Nothing here is authored. A page is found by walking the mirror; its title and first sentence
// are the page's own words; its date is the practice's own record of the night that built it.
// The build clock is never read: a mirror copied today must date a page of August to August.
//
// WHERE A DATE COMES FROM, in this order:
//   1. night — the first night on the record that names the page: its file path, or the address
//      of its directory when the page is that directory's index. A project's ROOT directory is
//      the exception: `projects/<name>/` is named from the project's first session on, whether
//      or not a page stands in it yet, so there only a "Built:" line counts, or the file itself.
//   2. form  — the page's own form or work document beside it ("Laid down 2026-08-16", "Declared
//      2026-09-27"), which is how works.ts dated the works before this module existed.
//   3. atlas — the first atlas layer with a node that refers to the page.
// A page none of the three can date is listed last, undated, rather than given a guessed day.
//
// WHERE "WORK" COMES FROM. The practice files a finished piece under works/, and since its
// projects began it also declares a work where the page was built: a work document beside the
// page (`projects/met-date-intervals/dialects/WORK.md`), or a flat sentence in a night's record
// ("*The Cut* declared a modest work", night 42). The shelf's first day read the filing alone
// and so called three declared works studies. The declaration is the practice's; the directory
// is only where it happened to stand that night.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const N1_MIRROR = 'public/n-1'

/** A work is a page the practice has declared one; everything else a project builds is "a
 *  study, not yet a work", in the words of the first one. The shelf follows the practice's own
 *  declaration (see the header) and adds no judgement of its own. */
export type N1PageKind = 'work' | 'study'

export type DateSource = 'night' | 'form' | 'atlas'

export interface N1Page {
  /** the page's path inside the mirror: `projects/unicode-admission/languages.html` */
  path: string
  /** its address on this site: `/n-1/projects/unicode-admission/languages.html` */
  href: string
  kind: N1PageKind
  /** the page's own <title>, or its <h1> where it has none */
  title: string
  /** the page's own first sentence, or null where it opens with none */
  sentence: string | null
  /** the day the practice's record gives it, or null — never the build clock */
  date: string | null
  dateSource: DateSource | null
  /** the record number of the night that built it, where a night dates it */
  record: number | null
}

// ── which files are pages ──────────────────────────────────────────────────────────────────

/**
 * What a mirrored path is on the shelf BY ITS FILING, or null when it is not a page a visitor
 * opens: a work is exactly `works/<name>/index.html`; any page under projects/ is a study until
 * the record declares it a work (buildShelf reads that). A `template.html` is the source a page
 * is built from, and everything outside the two directories — the record, a listing inside the
 * material — is the practice's working memory, not a page of its making.
 */
export function n1PageKind(path: string): N1PageKind | null {
  if (/^works\/[^/]+\/index\.html$/.test(path)) return 'work'
  if (/^projects\/.+\.html$/.test(path) && !/(^|\/)template\.html$/.test(path)) return 'study'
  return null
}

/** The pages among a list of mirrored paths, in a stable order. */
export function discoverPages(paths: readonly string[]): string[] {
  return paths.filter((p) => n1PageKind(p) !== null).sort()
}

/** A page's address on this site. A directory's index is addressed by its directory. */
export function n1PageHref(path: string): string {
  return `/n-1/${path.replace(/(^|\/)index\.html$/, '$1')}`
}

// ── a page's own words ─────────────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…',
  middot: '·', times: '×', deg: '°', plusmn: '±', shy: '',
}

function decode(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? whole
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)
    return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : whole
  })
}

/** Markup to the words it carries: tags out, entities read, whitespace to single spaces. */
function words(html: string): string {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** The strip this site adds to every mirrored page (work-frame.ts) is the site's voice, not the
 *  page's. Matched by its class prefix rather than imported, so this module stays below the
 *  frame that renders it; shelf.test.ts holds the two together against the real mirror. */
const SITE_FRAME = /<(header|footer)\b[^>]*class="fbde-work-frame[^"]*"[^>]*>[\s\S]*?<\/\1>/gi

/** Everything that is markup or machinery rather than the page's prose. */
function prose(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(SITE_FRAME, ' ')
    .replace(/<(script|style|svg|noscript|template|canvas|figure|table|nav|button)\b[\s\S]*?<\/\1>/gi, ' ')
}

/** The page's own name: its <title>, or its <h1> where it carries no title. */
export function pageTitle(html: string): string | null {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]
  if (title && words(title)) return words(title)
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(prose(html))?.[1]
  return h1 && words(h1) ? words(h1) : null
}

/** Words that end in a full stop without ending a sentence, and a single capital, which is an
 *  initial ("U. S.", "U.S."). Both err the same way on purpose: a stop wrongly kept as an
 *  abbreviation makes the sentence run on to the next one; a stop wrongly taken as an end
 *  would cut the page's opening off mid-sentence. */
const ABBREVIATION = /(?:^|[\s(“"‘'])(?:ca|c|cf|e\.g|i\.e|vs|etc|approx|no|nr|st|dr|mr|mrs|ms|prof|fig|vol|pp?)$/i
const INITIAL = /(?:^|[\s(“"‘'.])[A-Z]$/

/** The index just past the first sentence of `text`, or its length when it is one sentence. */
function sentenceEnd(text: string, from = 0): number {
  const stop = /[.?!]+[”’"')\]]*(?=\s+[A-Z0-9“‘"'(]|\s*$)/g
  stop.lastIndex = from
  for (let m = stop.exec(text); m; m = stop.exec(text)) {
    const before = text.slice(from, m.index)
    const isAbbreviation = m[0][0] === '.' && (ABBREVIATION.test(before) || INITIAL.test(before))
    if (!isAbbreviation) return m.index + m[0].length
  }
  return text.length
}

/** A fragment this short is an opening beat, not yet a sentence a stranger can read alone
 *  ("A study.", "I am a machine."): the sentences that follow it in its own paragraph are
 *  taken with it until the two together say something. */
const FRAGMENT = 40

/**
 * The page's own first sentence: the first sentence of the first paragraph after its heading
 * that holds one. A line with no full stop — a byline, a date line under the title — is not a
 * sentence and is passed over. Null when the page opens with no prose at all.
 */
export function firstSentence(html: string): string | null {
  const body = prose(/<body\b[^>]*>([\s\S]*)/i.exec(html)?.[1] ?? html)
  const afterHeading = /<\/h1>([\s\S]*)/i.exec(body)?.[1] ?? body
  for (const p of afterHeading.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = words(p[1])
    if (!/[.?!][”’"')\]]*(\s|$)/.test(text)) continue
    let end = sentenceEnd(text)
    while (end < text.length && end < FRAGMENT) end = sentenceEnd(text, end)
    return text.slice(0, end).trim()
  }
  return null
}

// ── the practice's own record of when ──────────────────────────────────────────────────────

export interface NightRecord {
  /** the file's own number prefix — the practice numbers its records */
  record: number
  /** the record's own unit and count: "Night 53", "Bell 26" */
  label: string
  date: string
  /** the heading's own words after the date */
  title: string
  text: string
}

/** One node of an atlas layer: the day it was declared and the files it refers to. */
export interface AtlasRef {
  created: string
  refs: readonly string[]
}

export interface PracticeRecord {
  nights: readonly NightRecord[]
  /** the text of each FORM.md / WORK.md, keyed by its path in the mirror */
  forms: Readonly<Record<string, string>>
  atlas: readonly AtlasRef[]
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The directory a page is the index of, with its trailing slash — null for any other page. */
const indexDir = (path: string): string | null => /^(.*\/)index\.html$/.exec(path)?.[1] ?? null

/** A path is named where it stands as a whole: not as the tail of a longer one, and — for a
 *  directory — not as the head of a file beneath it (`works/x/FORM.md`, `works/x/{A,B}.md`). */
const namesFile = (text: string, path: string): boolean =>
  new RegExp(`(?<![A-Za-z0-9_.\\/-])${escapeRe(path)}(?![A-Za-z0-9_-])`).test(text)
const namesDir = (text: string, dir: string): boolean =>
  new RegExp(`(?<![A-Za-z0-9_.\\/-])${escapeRe(dir)}(?![A-Za-z0-9_{*]|\\.[A-Za-z0-9_])`).test(text)

/** The "- **Built:** …" entry of a night's record, with the lines it wraps onto; null where the
 *  record carries none (the practice writes it since night 41; older records are prose). */
export function builtLine(text: string): string | null {
  const lines = text.split('\n')
  const at = lines.findIndex((l) => /^\s*[-*]\s+\*\*Built:?\*\*/.test(l))
  if (at < 0) return null
  const out = [lines[at]]
  for (const line of lines.slice(at + 1)) {
    if (!line.trim() || /^\s*[-*]\s|^#/.test(line)) break
    out.push(line)
  }
  return out.join(' ')
}

/** Whether a night's record names a page — see the header for the project-root exception. */
export function namesPage(text: string, path: string): boolean {
  if (namesFile(text, path)) return true
  const dir = indexDir(path)
  if (!dir) return false
  const projectRoot = /^projects\/[^/]+\/$/.test(dir)
  return namesDir(projectRoot ? (builtLine(text) ?? '') : text, dir)
}

/**
 * The pages a night's record says it built, in the order the "Built:" line names them — the
 * paths as they stand in the mirror, whether or not such a file exists (the caller holds the
 * mirror). A directory is read as its index; anything that is not a page of the shelf is not
 * a page a row could lead to, and is left out.
 */
export function builtPages(text: string): string[] {
  const line = builtLine(text)
  if (!line) return []
  const out: string[] = []
  for (const m of line.matchAll(/(?<![A-Za-z0-9_.\/-])(?:works|projects)\/[A-Za-z0-9_.\/-]*[A-Za-z0-9_\/-]/g)) {
    const named = m[0]
    const path = named.endsWith('/') ? `${named}index.html` : /\.[a-z0-9]+$/i.test(named) ? named : `${named}/index.html`
    if (n1PageKind(path) && !out.includes(path)) out.push(path)
  }
  return out
}

// ── what the practice has declared a work ──────────────────────────────────────────────────

/** A night's record entry by entry: each bullet with the lines it wraps onto. */
function recordEntries(text: string): string[] {
  const out: string[] = []
  let open = false
  for (const line of text.split('\n')) {
    if (/^\s*[-*]\s/.test(line)) {
      out.push(line)
      open = true
    } else if (open && line.trim() && !/^#/.test(line)) out[out.length - 1] += ` ${line.trim()}`
    else open = false
  }
  return out
}

/** A title as the practice writes one in a record: `*The Cut*` — not the `**Label:**` of the entry. */
const ITALIC = /(?<!\*)\*([^*\n]+)\*(?!\*)/g
const DECLARES = /\bdeclared\s+(?:as\s+)?a\s+(?:[a-z]+\s+)?work\b/i
/** Words that make a declaration something else: a denial ("not yet declared a work"), a plan or
 *  a question ("decide whether the page is declared a modest work"). */
const UNSETTLED = /\b(?:not|never|no|whether|if|unless|until|would|could|might|may|should|must|will|to be)\b/i

/**
 * The titles a night's record declares a work, flatly and in so many words: "*The Cut* declared
 * a modest work", "declared a modest work, *What the Catalogue Decides*". Read clause by clause,
 * so a title elsewhere in the same entry is not taken along, and only where nothing before the
 * verb unsettles it. A declaration that names no title names no page here: the shelf then keeps
 * the page a study, which is the smaller error of the two.
 */
export function declaredTitles(text: string): string[] {
  const out: string[] = []
  for (const entry of recordEntries(text)) {
    // a title may carry its own stop or semicolon, so the titles stand aside while the entry is cut
    const titles: string[] = []
    const masked = entry.replace(ITALIC, (_whole, title: string) => `\uE000${titles.push(title) - 1}\uE000`)
    for (const clause of masked.split(/;|[.?!](?=\s|$)/)) {
      const at = clause.search(DECLARES)
      if (at < 0 || UNSETTLED.test(clause.slice(0, at))) continue
      for (const m of clause.matchAll(/\uE000(\d+)\uE000/g)) out.push(titles[Number(m[1])])
    }
  }
  return out
}

/** Two spellings of one title: case, spacing and the typographer's quotes and dashes aside. */
const titleKey = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

/** Whether the practice fixed the page in a work document of its own: a FORM.md or WORK.md in
 *  the directory the page is the index of. */
const hasWorkDocument = (path: string, record: PracticeRecord): boolean => {
  const dir = indexDir(path)
  return dir !== null && (`${dir}FORM.md` in record.forms || `${dir}WORK.md` in record.forms)
}

/** "Laid down 2026-08-16, night 03", "Declared 2026-09-27", "declared a modest work (session 3,
 *  2026-10-07)" — the day a form or work document says the piece was fixed. */
const FIXED_ON = /\b(?:laid down|declared)\b[^\n]{0,60}?(\d{4}-\d{2}-\d{2})/i

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** The day the practice's record gives a page, and which part of the record gave it. */
export function datePage(
  path: string,
  record: PracticeRecord,
): { date: string; source: DateSource; record: number | null } | null {
  const night = [...record.nights]
    .filter((n) => ISO_DAY.test(n.date))
    .sort((a, b) => a.record - b.record)
    .find((n) => namesPage(n.text, path))
  if (night) return { date: night.date, source: 'night', record: night.record }

  const dir = path.replace(/[^/]+$/, '')
  for (const name of ['FORM.md', 'WORK.md']) {
    const fixed = FIXED_ON.exec(record.forms[dir + name] ?? '')?.[1]
    if (fixed) return { date: fixed, source: 'form', record: null }
  }

  const layers = record.atlas
    .filter((a) => ISO_DAY.test(a.created) && a.refs.some((ref) => namesPage(ref, path)))
    .map((a) => a.created)
    .sort()
  return layers[0] ? { date: layers[0], source: 'atlas', record: null } : null
}

/**
 * The shelf: every page, newest first. Two pages of one day stand in the order of the nights
 * that built them, the later night first; a page no part of the record dates stands last. A
 * page is a work where it is filed as one or the record declares it one, and a study otherwise.
 */
export function buildShelf(
  pages: readonly { path: string; html: string }[],
  record: PracticeRecord,
): N1Page[] {
  const declared = new Set(record.nights.flatMap((n) => declaredTitles(n.text)).map(titleKey))
  const out: N1Page[] = []
  for (const { path, html } of pages) {
    const filed = n1PageKind(path)
    if (!filed) continue
    const title = pageTitle(html) ?? path
    const kind = hasWorkDocument(path, record) || declared.has(titleKey(title)) ? 'work' : filed
    const dated = datePage(path, record)
    out.push({
      path,
      href: n1PageHref(path),
      kind,
      title,
      sentence: firstSentence(html),
      date: dated?.date ?? null,
      dateSource: dated?.source ?? null,
      record: dated?.record ?? null,
    })
  }
  return out.sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      (b.record ?? -1) - (a.record ?? -1) ||
      a.path.localeCompare(b.path),
  )
}

// ── reading the mirror ─────────────────────────────────────────────────────────────────────

/** "# Night 20 — 2026-09-03, two skies in one reading, the seam at one night, …" */
const NIGHT_H1 = /^#\s+(.+?)\s+—\s+(\d{4}-\d{2}-\d{2}),\s*(.+?)\s*$/m

/**
 * Every night on the practice's record, oldest first by its own record number. Fail-soft: a
 * founder note or an offer sits in the same directory and carries no "Night N — date" heading.
 * That is the shelf's normal shape, not a broken mirror, so such a file is passed over.
 */
export function readNightRecords(dir: string = join(N1_MIRROR, 'nights')): NightRecord[] {
  if (!existsSync(dir)) return []
  const nights: NightRecord[] = []
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue
    const record = Number(/^(\d+)-/.exec(name)?.[1])
    if (!Number.isFinite(record)) continue
    const text = readFileSync(join(dir, name), 'utf8')
    const m = NIGHT_H1.exec(text)
    if (!m) continue
    nights.push({ record, label: m[1], date: m[2], title: m[3], text })
  }
  return nights.sort((a, b) => a.record - b.record)
}

function filesUnder(root: string, dir: string, keep: (name: string) => boolean): string[] {
  const abs = join(root, dir)
  if (!existsSync(abs)) return []
  const out: string[] = []
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...filesUnder(root, rel, keep))
    else if (keep(entry.name)) out.push(rel)
  }
  return out
}

/** The atlas layers' nodes, each with the day it was declared and the files it refers to. A
 *  layer this module cannot parse is passed over: the atlas is the last of three sources, and
 *  a page it cannot date is listed undated rather than failing the mirror. */
function readAtlas(root: string): AtlasRef[] {
  const dir = join(root, 'atlas', 'layers')
  if (!existsSync(dir)) return []
  const out: AtlasRef[] = []
  for (const name of readdirSync(dir)) {
    if (!/^\d{4}-\d{2}-\d{2}.*\.json$/.test(name)) continue
    try {
      const layer = JSON.parse(readFileSync(join(dir, name), 'utf8')) as {
        nodes?: { created?: string; refs?: string[] }[]
      }
      for (const node of layer.nodes ?? []) {
        if (node.refs?.length) out.push({ created: node.created ?? name.slice(0, 10), refs: node.refs })
      }
    } catch {
      continue
    }
  }
  return out
}

/** The practice's own record of when, read whole from the mirror. */
export function readPracticeRecord(root: string = N1_MIRROR): PracticeRecord {
  const forms: Record<string, string> = {}
  for (const top of ['works', 'projects']) {
    for (const rel of filesUnder(root, top, (name) => name === 'FORM.md' || name === 'WORK.md')) {
      forms[rel] = readFileSync(join(root, rel), 'utf8')
    }
  }
  return { nights: readNightRecords(join(root, 'nights')), forms, atlas: readAtlas(root) }
}

/** The shelf as the mirror stands: every page found by walking it, dated by its own record. */
export function readN1Shelf(root: string = N1_MIRROR): N1Page[] {
  const paths = discoverPages(['works', 'projects'].flatMap((top) => filesUnder(root, top, (n) => n.endsWith('.html'))))
  return buildShelf(
    paths.map((path) => ({ path, html: readFileSync(join(root, path), 'utf8') })),
    readPracticeRecord(root),
  )
}

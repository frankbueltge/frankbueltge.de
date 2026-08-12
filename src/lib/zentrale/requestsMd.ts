// src/lib/zentrale/requestsMd.ts — Lesen und Schreiben der REQUESTS.md-Dateien der drei
// Engines (field/studio/atelier) und des Plenums. Pure Textoperationen auf dem Markdown —
// kein Parser-Framework, nur Regex auf Zeilenebene, weil das Format selbst schon einfach ist
// (H2 = Section, Blockquote-Konvention für verschachtelte Antworten). Wird sowohl von Astro
// (Lesen fürs Dashboard) als auch von einer Pages Function (Schreiben bei "beantworten") genutzt
// — daher nur Web-APIs, kein fs.
// Relative imports only, never the `@/…` alias: a Pages Function bundles this file
// (functions/api/zentrale/antwort.js) and its esbuild pass does not read tsconfig paths.
// `github-slugger` is a plain-ESM, dependency-free package (String + one regex, no Node
// builtins), so riding along in that Worker bundle costs ~12 kB and breaks nothing.
import GithubSlugger from 'github-slugger'
import { stripMd } from '../maschinenraum'

export type RequestSection = { heading: string; body: string; status: string | null }

/** Eine "**Status:** …"-Zeile, optional eingerückt/in einem Blockquote ("> "). */
const STATUS_LINE_RE = /^(\s*>?\s*)\*\*Status:\*\*.*$/m
/** Dieselbe Zeile, aber mit dem Wert als Capture-Group (für parseSections' Lesezugriff). */
const STATUS_VALUE_RE = /^(?:\s*>?\s*)\*\*Status:\*\*\s*(.*)$/m

/** Positionen der H2-Sections im Rohtext — die gemeinsame Grundlage für lesende und
 * schreibende Funktionen, damit beide exakt dieselbe Vorstellung von "eine Section" haben. */
function locateSections(md: string): Array<{ heading: string; start: number; bodyStart: number; end: number }> {
  const heading_re = /^## (.*)$/gm
  const starts: Array<{ heading: string; start: number; bodyStart: number }> = []
  let m: RegExpExecArray | null
  while ((m = heading_re.exec(md)) !== null) {
    starts.push({ heading: m[1].trim(), start: m.index, bodyStart: heading_re.lastIndex })
  }
  return starts.map((s, i) => ({
    heading: s.heading,
    start: s.start,
    bodyStart: s.bodyStart,
    end: i + 1 < starts.length ? starts[i + 1].start : md.length,
  }))
}

/** Zerlegt das Dokument in H2-Sections. Text vor der ersten H2 (Präambel/Standing Rule)
 * ist bewusst keine Section — er gehört niemandem, den man "beantworten" könnte. */
export function parseSections(md: string): RequestSection[] {
  return locateSections(md).map(({ heading, bodyStart, end }) => {
    const raw = md.slice(bodyStart, end)
    const body = raw.replace(/^\n/, '').replace(/\s+$/, '')
    const statusMatch = STATUS_VALUE_RE.exec(raw)
    return { heading, body, status: statusMatch ? statusMatch[1].trim() : null }
  })
}

export function findSection(md: string, heading: string): RequestSection | null {
  const target = heading.trim()
  return parseSections(md).find((s) => s.heading === target) ?? null
}

export function answerRequest(
  md: string,
  heading: string,
  opts: { decision: 'enabled' | 'declined' | 'note'; message: string; date: string },
): { ok: true; md: string } | { ok: false; reason: 'not-found' } {
  const target = heading.trim()
  const sections = locateSections(md)
  const section = sections.find((s) => s.heading === target)
  if (!section) return { ok: false, reason: 'not-found' }

  const statusWord = opts.decision === 'enabled' ? 'enabled' : opts.decision === 'declined' ? 'declined' : 'answered'
  const statusValue = `${statusWord} (${opts.date})`

  let body = md.slice(section.bodyStart, section.end)
  if (STATUS_LINE_RE.test(body)) {
    // Erstes Vorkommen ersetzen, Einrückung/Blockquote-Marker (Group 1) bleibt erhalten.
    body = body.replace(STATUS_LINE_RE, (_match, prefix: string) => `${prefix}**Status:** ${statusValue}`)
  } else {
    // Keine Status-Zeile vorhanden — eine anhängen, statt stillschweigend nichts zu tun.
    body = `${body.replace(/\s+$/, '')}\n\n**Status:** ${statusValue}\n`
  }

  const trimmed = body.replace(/\s+$/, '')
  const responseLine = `> **Response (team, ${opts.date}):** ${opts.message}`
  const newBody = `${trimmed}\n\n${responseLine}\n`

  return { ok: true, md: md.slice(0, section.bodyStart) + newBody + md.slice(section.end) }
}

/** Baut den verschachtelten Blockquote-Block, den field/studio für Seeds benutzen —
 * jede Zeile bekommt "> ", Leerzeilen bleiben ein bloßes ">" (die im Repo etablierte Konvention). */
function seedBlock(opts: { title: string; body: string; date: string }): string {
  const bodyLines = opts.body
    .split('\n')
    .map((line) => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n')
  return `> ### ${opts.date} — Seed: ${opts.title}\n>\n${bodyLines}\n>\n> **Status:** seed (open)`
}

/** Hängt einen fertigen Blockquote-Block ans Ende einer frei wählbaren H2-Section an — die
 * generische Grundlage, auf der appendSeed aufsetzt. Existiert die Section nicht, wird sie
 * am Dateiende neu angelegt (statt den Aufruf abzulehnen), z. B. für Praktiken ohne eigenes
 * "Seeds"-Kapitel oder für neue Sections wie "Seeds from the public" (öffentliche Saat). */
export function appendBlockToSection(md: string, sectionHeading: string, block: string): string {
  const target = sectionHeading.trim()
  const sections = locateSections(md)
  const idx = sections.findIndex((s) => s.heading === target)

  if (idx === -1) {
    const trimmed = md.replace(/\s+$/, '')
    return `${trimmed}\n\n## ${target}\n\n${block}\n`
  }

  const section = sections[idx]
  const raw = md.slice(section.bodyStart, section.end)
  const trimmedRaw = raw.replace(/\s+$/, '')
  const newRaw = `${trimmedRaw}\n\n${block}\n`
  return md.slice(0, section.bodyStart) + newRaw + md.slice(section.end)
}

export function appendSeed(md: string, opts: { title: string; body: string; date: string }): string {
  const block = seedBlock(opts)
  const sections = locateSections(md)
  // Nicht nur der exakte Titel "Seeds from the team" zählt — field/studio heißen so, das
  // Plenum heißt "Seeds from Frank". appendBlockToSection selbst matcht exakt; die Suche nach
  // dem tatsächlich vorhandenen Titel bleibt darum hier, nicht in der generischen Funktion.
  const seedsSection = sections.find((s) => /^Seeds/i.test(s.heading))
  const heading = seedsSection ? seedsSection.heading : 'Seeds from the team'
  return appendBlockToSection(md, heading, block)
}

/** Sections der REQUESTS.md, die KEINE Anfrage an Frank sind — beide Gesprächsrichtungen:
 *
 *  - `Seeds`, `Team note`, `Team responses` — Franks/des Teams eigene Worte an die
 *    Kollektive. Wer sich selbst in der eigenen Inbox liest, liest nur Rauschen.
 *  - `Status (…)`, `Response (…)` — die Rückmeldung der PRAXIS auf genau diese Worte.
 *    Ergänzt 2026-07-30: Bis dahin kannte der Filter nur die eine Richtung, und Ulysses'
 *    Berichte über Franks Saaten landeten als „Request aus ulysses: Status (Ulysses, …)"
 *    in der Inbox — drei Einträge, die wie unerledigte Hausaufgaben aussahen und in denen
 *    nichts zu entscheiden war. Eine Antwort ist keine Frage.
 *
 * Absichtlich eng verankert: Nach `Status`/`Response` muss eine Klammer oder ein
 * Gedankenstrich folgen. „Status: the gate has been red for three days" bleibt damit eine
 * Anfrage — der Doppelpunkt ist nicht im Zeichensatz. Lieber eine Anfrage zu viel in der
 * Inbox als eine echte Bitte, die stillschweigend verschwindet.
 *
 * Der Watchdog spiegelt dasselbe Muster in Python (requests-watchdog.yml) — beide Stellen
 * müssen zusammen geändert werden. */
export const NON_REQUEST_SECTION_RE = /^(seeds\b|team note\b|team responses\b|(status|response)\s*[(—–-])/i

export function isNonRequestSection(heading: string): boolean {
  return NON_REQUEST_SECTION_RE.test(heading.trim())
}

/** Der Titel, unter dem eine offene Request als GitHub-Issue in der Inbox landet
 * ("Request aus {repo}: {heading}") — repo ist das Engine-Repo (keine Leerzeichen),
 * heading der volle Section-Titel, auch wenn er selbst Doppelpunkte/Gedankenstriche trägt. */
export function parseInboxIssueTitle(title: string): { repo: string; heading: string } | null {
  const m = /^Request aus (\S+):\s(.*)$/s.exec(title)
  if (!m) return null
  return { repo: m[1], heading: m[2] }
}

/** Gate-Entscheidung (Governance §1, 2026-08-01): GO/HALTEN als datierte Section ans Ende
 * der REQUESTS.md der Praxis — die Autorisierung selbst; den mechanischen Publikationsakt
 * (PUBLICATION.json nach Kartographie-Präzedenz) vollzieht die nächste Session. HALTEN ohne
 * Begründung gibt es nicht: die Regel heißt "decide, or write a dated 'held, because …'". */
export function appendGateDecision(
  md: string,
  opts: { project: string; decision: 'GO' | 'HOLD'; reason?: string; date: string },
): { ok: true; md: string } | { ok: false; reason: string } {
  if (opts.decision === 'HOLD' && !(opts.reason ?? '').trim()) {
    return { ok: false, reason: 'hold-needs-reason' }
  }
  const verdict =
    opts.decision === 'GO'
      ? `**GO — publish.** (Frank, via Steuerzentrale, under the 72 h gate rule of 2026-08-01.)${
          (opts.reason ?? '').trim() ? `\n${opts.reason!.trim()}` : ''
        }\nThis section is the authorisation record; the next session executes the publication\nact (PUBLICATION.json per the kartographie precedent, work state as proposed at the gate).`
      : `**HELD.** (Frank, via Steuerzentrale, under the 72 h gate rule of 2026-08-01.)\nHeld, because: ${opts.reason!.trim()}\nThe candidate stays at the gate — dated, not silent.`
  const block = `## Gate decision — ${opts.date} — ${opts.project}\n\n${verdict}\n`
  return { ok: true, md: `${md.trimEnd()}\n\n${block}` }
}

// ——————————————————————————————————————————————————————————————————————————————————————
// Reading side for the PUBLIC requests rooms (/atelier|field|studio/requests, Etappe 2).
// Everything below is additive — the write path above (answerRequest, appendSeed,
// appendBlockToSection) keeps its signatures, because a Pages Function depends on them.
//
// Hard constraint: these functions run inside the build that gates the three practices'
// own nightly publishing (four integrate runs a day). They must therefore NEVER throw on
// content they did not expect — a malformed heading, a missing status line, a section with
// no body at all all resolve to a null/empty value, never to an exception. Every regex here
// is anchored and linear; none of them can backtrack catastrophically on a long line.
// ——————————————————————————————————————————————————————————————————————————————————————

/**
 * Does this status value say the item is still open?
 *
 * Proven against every real status string in all four REQUESTS.md files (2026-08-01: 27
 * atelier, 31 field, 25 studio, 1 plenum status lines) — the practices phrase openness in
 * at least eleven ways, and all of them contain the bare word:
 *   `open` · `seed (open)` · `open (item 1 is yours alone; item 2 is informational)` ·
 *   `offer (open) — no answer needed; act on it or don't.` ·
 *   `open — an offer; silence, deferral or decline are all legitimate answers.` ·
 *   `open. If this is silent through our next session, we will take route 3 …` ·
 *   `open — awaits one action (forward) and one fact (the date it went).` ·
 *   `(1) open — asks one action (hold), and supersedes nothing else …` ·
 *   `open — asks one observation, and supplies everything we could establish without it.` ·
 *   `open (a seed — answer in the journal either way)` · `open — you can now co-shape …`
 * while no closed status does (`answered`, `resolved`, `enabled`, `declined`, `delivered`,
 * `noted`, `letter (no reply owed)`, `standing rule`, `closed by events`, `premiered`,
 * `partially enabled`, `accepted and worked`, `seed read; not taken up` …).
 *
 * `\b` matters: it keeps `reopened` and `opening` out. A section with NO status line is not
 * open — the practices always write the status of a live ask.
 */
export function isOpenStatus(status: string | null | undefined): boolean {
  return typeof status === 'string' && /\bopen\b/i.test(status)
}

/** A `Seeds …` container — one H2 holding many dated seed blocks, each with its own nested
 *  status. Its section-level status is whichever nested one comes first, so "open" there says
 *  nothing about the container: it must not be listed as an open ask. Narrower on purpose than
 *  isNonRequestSection (which also covers Team notes — those DO carry a real own status).
 *
 *  Singular accepted since 2026-08-09: the Plenum's channel gained a standalone
 *  `## Seed — 2026-08-09 (Frank) …` section, which fell through to the Team notes and stood
 *  there as an OPEN note — a state a note may never have, so the hourly mirror refused the
 *  document for nineteen hours and the site went stale. The guard was right; the matcher was
 *  too narrow. A seed is an offer whether one is written or a dozen: it is listed, never
 *  unpacked as an ask of the collective, and its own "open" means "not taken up yet" rather
 *  than "somebody owes an answer". */
export function isSeedsSection(heading: string): boolean {
  return /^Seeds?\b/i.test(heading.trim())
}

/** Everything before the first H2: the standing rule and the how-to the practice wrote for
 *  itself. Belongs to nobody, can be answered by nobody — and is the one piece of the
 *  document a first-time visitor has to read. Returned as raw markdown, without the
 *  document's own H1 title (the page already carries a headline; two would be one too many
 *  for a screen reader walking the outline). */
export function preamble(md: string): string {
  const first = locateSections(md)[0]
  return md
    .slice(0, first ? first.start : md.length)
    .replace(/^\s*#\s+[^\n]*\n?/, '')
    .replace(/\s+$/, '')
    .replace(/^\s+/, '')
}

/** The ISO date a section heading leads with, if any — `2026-07-31 — …`,
 *  `2026-07-31 (session 76) — …`, `Team note — 2026-07-25 — …`. Null for `Seeds from the
 *  team` and anything else that names no date. */
export function headingDate(heading: string): string | null {
  return /(\d{4}-\d{2}-\d{2})/.exec(heading)?.[1] ?? null
}

/** The heading without its leading date/label scaffolding — what a card shows as its title.
 *  Falls back to the full heading whenever the shape is unfamiliar. */
export function headingTitle(heading: string): string {
  const t = heading.trim()
  const cut = /^(?:Team note|Team responses|Response|Status)?\s*(?:\([^)]*\))?\s*(?:—|–|-)?\s*\d{4}-\d{2}-\d{2}(?:\s*\([^)]*\))?\s*(?:—|–|:)\s*(.+)$/.exec(t)
  return (cut?.[1] ?? t).trim()
}

/** github-slugger — the very package Astro's own rehypeHeadingIds uses, so a slug derived
 *  here is byte-identical to the `id` Astro puts on the heading in the rendered archive.
 *  Verified 2026-08-01 against the built pages: 141/141 heading ids matched across the three
 *  REQUESTS.md files. Only the DEDUPLICATION differs (a slugger instance is per document, and
 *  this one sees a single heading), which is why callers pass Astro's own `headings` list to
 *  requestCards when they have it — see `slugFor` below. */
export function slugifyHeading(heading: string): string {
  return new GithubSlugger().slug(stripMd(heading.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')))
}

/** One rendered heading as Astro's `render()` hands it back. */
export interface RenderedHeading { depth: number; slug: string; text: string }

/** Flattens one markdown line to plain text: blockquote markers, list bullets, links and
 *  the emphasis/backtick noise stripMd already knows. */
function plainLine(line: string): string {
  return stripMd(
    line
      .replace(/^(?:\s*>)+\s*/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/^\s*\d+\.\s+/, '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'),
  )
}

/** Trims to at most `max` words, marking the cut. */
export function trimWords(text: string, max: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= max) return words.join(' ')
  return words.slice(0, max).join(' ') + ' …'
}

/** Words of a section body — the number the page prints so a visitor knows what the
 *  "read it in full" link costs them. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/** The lead of a section, flattened to `max` words: the first prose of the body, skipping
 *  what carries no meaning out of context (status lines, sub-headings, rules, table rows,
 *  fenced code). Never throws; an empty body yields an empty string. */
export function excerpt(body: string, max: number): string {
  const parts: string[] = []
  let inFence = false
  let words = 0
  for (const raw of body.split('\n')) {
    const bare = raw.replace(/^(?:\s*>)+\s*/, '')
    if (/^(```|~~~)/.test(bare)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    if (!bare.trim()) continue
    if (/^#{1,6}\s/.test(bare)) continue
    if (/^\*\*Status:\*\*/.test(bare)) continue
    if (/^(\|| {0,3}([-*_])\s*(\2\s*){2,}$)/.test(bare)) continue
    const text = plainLine(raw)
    if (!text) continue
    parts.push(text)
    words += countWords(text)
    if (words >= max) break
  }
  return trimWords(parts.join(' '), max)
}

/** One section of a REQUESTS.md, prepared for a card on the public requests room. */
export interface RequestCard {
  /** the H2 verbatim — the key the write path and the inbox issue titles use */
  heading: string
  /** the heading without its date scaffolding, for display */
  title: string
  date: string | null
  status: string | null
  open: boolean
  /** a `Seeds …` container rather than a single exchange */
  seeds: boolean
  /** an ask TO the human (false for Frank's own notes and the practice's answers) */
  request: boolean
  /** fragment on /…/requests/archive — '' when the heading yields no slug */
  slug: string
  excerpt: string
  words: number
}

export interface RequestCardOptions {
  /** words of body lead per card (default 40) */
  excerptWords?: number
  /** Astro's rendered heading list (`const { headings } = await render(doc)`) — the
   *  authoritative slugs, including the `-1` suffixes a duplicate heading would get. */
  headings?: readonly RenderedHeading[]
}

/** Matches one H2 against Astro's rendered headings by flattened text, so the fragment the
 *  card links to is the id the archive page actually renders. Falls back to slugifyHeading;
 *  a wrong fragment then simply lands at the top of the archive, never on a 404. */
function slugFor(heading: string, headings: readonly RenderedHeading[] | undefined): string {
  const own = slugifyHeading(heading)
  if (!headings?.length) return own
  const wanted = plainLine(heading).toLowerCase()
  const hit = headings.find((h) => h.depth === 2 && plainLine(h.text).toLowerCase() === wanted)
  return hit?.slug ?? own
}

/**
 * Every H2 of a REQUESTS.md as a card. Document order is preserved: the practices append,
 * so the tail of the file is the most recent business (the requests room shows the last five
 * answered items by taking the tail of this list, not by trusting a date in the heading —
 * an answer carries its own date in the status line, not in the title it answers).
 */
export function requestCards(md: string, opts: RequestCardOptions = {}): RequestCard[] {
  const max = opts.excerptWords ?? 40
  return parseSections(md).map((s) => ({
    heading: s.heading,
    title: headingTitle(s.heading),
    date: headingDate(s.heading),
    status: s.status,
    open: isOpenStatus(s.status) && !isSeedsSection(s.heading),
    seeds: isSeedsSection(s.heading),
    request: !isNonRequestSection(s.heading),
    slug: slugFor(s.heading, opts.headings),
    excerpt: excerpt(s.body, max),
    words: countWords(s.body),
  }))
}

/**
 * How much of each open item the room may print, planned against the page's own budget.
 *
 * The rule this replaces had a floor and no ceiling on the QUEUE: at ten open items every
 * excerpt still bought 27 words, the ten titles printed 158 untrimmed, and the room measured
 * 1518 against a budget of 1500. The build that gates the practice's publishing then refused
 * the integration — twelve times on 2026-08-10, the same wall on every retry — so a page-length
 * rule silenced a practice for a day. The module already said this must not happen ("a growing
 * backlog must make the page denser, not make the practices unable to publish"); it just did not
 * guarantee it.
 *
 * So the room now PLANS itself instead of hoping a constant fits. It spends what it has, in a
 * fixed order of sacrifice, and it never omits an open ask:
 *
 *   1. full lead (40 words) while the queue is short;
 *   2. shorter leads as the queue grows, down to a readable 12;
 *   3. no lead at all — title, status and the link to the full text;
 *   4. and finally the titles themselves are trimmed.
 *
 * Step 4 is the last resort and the page says when it was taken. There is no step 5: an open ask
 * is never hidden, and the budget is never raised to make an overflow disappear.
 */
export interface RoomPlan {
  /** words of body lead each open card may print; 0 = title, status and link only */
  lead: number
  /** words a title may print before it is trimmed; Infinity while the room is not desperate */
  titleCap: number
  /** words of status prose an open card may print */
  statusCap: number
  /** whether each card still carries its "read it in full" link text */
  showLabel: boolean
  /** the room had to go below its normal density — the page states this rather than hiding it */
  compressed: boolean
  /** every lever is spent and the room STILL does not fit. Not a failure to fix in the code: a
   *  queue this long is a fact about the house, and the page says so instead of hiding an ask or
   *  refusing to build. Nothing downstream may treat this as a reason to block publishing. */
  exhausted: boolean
  /** what the plan is expected to render, for the test and for the page's own honesty line */
  words: number
}

/** The room's copy, as every practice's wording config carries it. */
export interface RoomCopy {
  intro: string
  standingHeading: string
  openHeading: string
  openNone: string
  openNote: string
  answeredHeading: string
  answeredNote: string
  seedsHeading: string
  seedsNote: string
  archiveLink: string
  fullTextLabel: string
}

/** The page's word budget. One number, in one place, asserted by requestsRoom.test.ts. */
export const ROOM_BUDGET = 1500
/** Chrome the Frame renders around the room (nav, kicker, footer), measured from a built page. */
export const ROOM_CHROME_WORDS = 220

/**
 * The cost model of a rendered room — ONE copy of it, used by the planner that has to fit inside
 * the budget and by the test that checks it did. It used to live only in the test, which is how a
 * constant and a budget could disagree without anything noticing.
 */
export function roomWords(
  cards: RequestCard[],
  room: RoomCopy,
  preambleText: string,
  plan: Pick<RoomPlan, 'lead' | 'titleCap' | 'statusCap' | 'showLabel'>,
): number {
  const open = cards.filter((c) => c.open)
  const answered = cards.filter((c) => !c.open && !c.seeds).slice(-5)
  const seeds = cards.filter((c) => c.seeds)

  let words = countWords(preambleText)
  words += countWords(
    [room.intro, room.standingHeading, room.openHeading, room.answeredHeading, room.answeredNote, room.archiveLink].join(' '),
  )
  words += countWords(open.length === 0 ? room.openNone : room.openNote)
  if (seeds.length > 0) words += countWords(`${room.seedsHeading} ${room.seedsNote}`)

  for (const c of open) {
    words += countWords(trimWords(c.title, plan.titleCap)) + (c.date ? 1 : 0)
    words += countWords(trimWords(c.status ?? '', plan.statusCap)) + 2
    if (plan.lead > 0) words += countWords(trimWords(c.excerpt, plan.lead))
    if (plan.showLabel) words += countWords(room.fullTextLabel) + 1
  }
  for (const c of answered) {
    words += countWords(c.title) + (c.date ? 1 : 0) + countWords(trimWords(c.status ?? '', STATUS_WORDS.closed)) + 2
    words += countWords(c.excerpt)
  }
  for (const c of seeds) words += countWords(c.heading) + 3

  return words + ROOM_CHROME_WORDS
}

/** Plan a room that fits. Always returns a plan; never throws, never omits an open item.
 *
 *  The levers, spent strictly in this order — the cheapest loss first, the ask itself never:
 *  the body lead, then the "read it in full" label, then the status prose, then the title. */
export function planRoom(cards: RequestCard[], room: RoomCopy, preambleText: string): RoomPlan {
  const at = (p: Omit<RoomPlan, 'compressed' | 'exhausted' | 'words'>): RoomPlan => {
    const words = roomWords(cards, room, preambleText, p)
    const full = p.lead === 40 && p.showLabel && p.statusCap === STATUS_WORDS.open && p.titleCap === Number.POSITIVE_INFINITY
    return { ...p, compressed: !full, exhausted: false, words }
  }
  const steps: Array<Omit<RoomPlan, 'compressed' | 'exhausted' | 'words'>> = [
    ...[40, 34, 28, 22, 18, 15, 12].map((lead) => ({
      lead,
      titleCap: Number.POSITIVE_INFINITY,
      statusCap: STATUS_WORDS.open,
      showLabel: true,
    })),
    { lead: 0, titleCap: Number.POSITIVE_INFINITY, statusCap: STATUS_WORDS.open, showLabel: true },
    { lead: 0, titleCap: Number.POSITIVE_INFINITY, statusCap: STATUS_WORDS.open, showLabel: false },
    { lead: 0, titleCap: Number.POSITIVE_INFINITY, statusCap: 4, showLabel: false },
    ...[14, 10, 7, 5, 3].map((titleCap) => ({ lead: 0, titleCap, statusCap: 4, showLabel: false })),
  ]
  for (const step of steps) {
    const plan = at(step)
    if (plan.words < ROOM_BUDGET) return plan
  }
  // Every lever spent and still over. The room renders at its tightest and SAYS so; it does not
  // hide an ask and it does not refuse to build. A queue this long is the house's problem to
  // answer, not the page's to conceal.
  return { ...at(steps[steps.length - 1]), exhausted: true }
}

/** Words of status prose a card prints. An open item's status often carries the CONDITION
 *  ("open — awaits one action (forward) and one fact"), which a visitor needs; a closed one
 *  only needs its verdict word ("answered", "enabled", "declined"). */
export const STATUS_WORDS = { open: 10, closed: 5 } as const

/** View models and wording for the arcs — the term tracker (/trending/topics).
 *
 *  Every visible sentence about a term is built here, from the term's own numbers, so the
 *  templates hold no figure of their own and no phrasing that a committed file could
 *  contradict. That is why a status reads as a sentence and not as a badge: "rising" is a
 *  threshold decision, and the page says which threshold and against what.
 *
 *  Pure functions, unit-tested. */
import { compact, fmtDateLong, platformLabel } from './format'
import {
  TERM_STATUSES,
  VIEWS_PLATFORM,
  type LetGoTerm,
  type PromotedTerm,
  type TermCandidate,
  type TermOrigin,
  type TermSeriesPoint,
  type TermStatus,
  type TrendingTerm,
  type TrendingTermsDay,
  type WatchlistEntry,
} from './terms-types'

const NUM = new Intl.NumberFormat('en-GB')

const STATUS_LABEL: Record<TermStatus, string> = {
  emerging: 'Emerging',
  rising: 'Rising',
  established: 'Established',
  fading: 'Fading',
  quiet: 'Quiet',
}

export function statusLabel(status: TermStatus): string {
  return STATUS_LABEL[status]
}

/** The hub's sort order: what is new and moving stands first, what is dormant last. */
export function statusRank(status: TermStatus): number {
  const i = TERM_STATUSES.indexOf(status)
  return i === -1 ? TERM_STATUSES.length : i
}

/** "1.6×" · "8×" — one decimal, and none when the ratio is whole. */
export function ratioText(ratio: number): string {
  return Number.isInteger(ratio) ? `${ratio}×` : `${ratio.toFixed(1)}×`
}

/** The seven-day pace against the three weeks before it, or the honest version of that
 *  sentence when there is nothing to compare against (the prior window held no mention, so
 *  the ratio in the file is null — a division the pipeline refuses rather than fakes). */
function paceClause(term: TrendingTerm): string {
  return term.ratio === null
    ? 'mentions in the last seven days, where the three weeks before it held none'
    : `mentions in the last seven days run at ${ratioText(term.ratio)} the pace of the three weeks before`
}

/** One sentence saying what the status means for THIS term, with the number it rests on. */
export function statusSentence(term: TrendingTerm): string {
  switch (term.status) {
    case 'rising':
      return `Rising: ${paceClause(term)}.`
    case 'emerging':
      return `Emerging: ${paceClause(term)}, and the term was first seen on ${fmtDateLong(term.first_seen)}.`
    case 'fading':
      return `Fading: ${paceClause(term)}.`
    case 'established':
      return 'Established: present through the month at a steady pace.'
    case 'quiet':
      return 'Quiet: fewer than the threshold of mentions in the last seven days.'
  }
}

/** Who put a term on the list — the table column's version. Since the decision of 2026-09-02
 *  this is a real distinction on the page and not bookkeeping: the run promotes and lets go of
 *  what it promoted, a person overrides either way, so a reader is owed the answer for every
 *  term. */
const ORIGIN_LABEL: Record<TermOrigin, string> = {
  editorial: 'By hand',
  discovered: 'By the run',
}

export function originLabel(origin: TermOrigin): string {
  return ORIGIN_LABEL[origin]
}

/** The same fact inside a running line ("Rising · 33 · 1.6× · by the run"). */
export function originMark(origin: TermOrigin): string {
  return origin === 'editorial' ? 'by hand' : 'by the run'
}

/** One sentence: when the term joined the list, who put it there, and the reason recorded
 *  with it. The note is the file's own words — only a full stop it already ends on is dropped,
 *  so the sentence does not close twice. */
export function originSentence(term: TrendingTerm): string {
  const how = term.origin === 'editorial' ? 'put there by hand' : 'promoted by the run itself'
  const note = term.note.trim().replace(/\.+$/, '')
  return `On the list since ${fmtDateLong(term.added)}, ${how}${note ? ` — ${note}` : ''}.`
}

/** Platform labels for the arcs. The day ledger's map (./format.ts) covers most of them; the
 *  two the term tracker adds are spelled here rather than there, because the arcs own them. */
const TERM_PLATFORM_LABEL: Record<string, string> = {
  arxiv: 'arXiv',
  [VIEWS_PLATFORM]: 'Wikipedia page views',
}

export function termPlatformLabel(id: string): string {
  return TERM_PLATFORM_LABEL[id] ?? platformLabel(id)
}

/** "Hacker News, Google News, GitHub, arXiv and Reddit" — the searched platforms of a run, in
 *  the file's order, page views left out because they are not documents. */
export function searchedPlatforms(file: TrendingTermsDay): string[] {
  return file.sources.filter((s) => s.id !== VIEWS_PLATFORM).map((s) => s.id)
}

export function joinWithAnd(parts: string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** The platforms that actually carried a term in the last thirty days, in the run's order
 *  when one is given. Page views are never counted as a platform: they are readers, not
 *  documents, and they do not enter any total. */
export function countedPlatforms(term: TrendingTerm, order?: string[]): string[] {
  const ids = order && order.length ? order : Object.keys(term.counts)
  return ids.filter((id) => id !== VIEWS_PLATFORM && (term.counts[id]?.d30 ?? 0) > 0)
}

/** The platforms whose feed cannot return more than a fixed number of items, so their
 *  thirty-day figure may undercount. Flagged on the page, never silently absorbed. */
export function cappedPlatforms(term: TrendingTerm, order?: string[]): string[] {
  const ids = order && order.length ? order : Object.keys(term.counts)
  return ids.filter((id) => term.counts[id]?.capped === true)
}

/** Status order first, then the seven-day figure, then the term itself — a total order, so two
 *  builds of the same file produce the same table. */
export function sortTerms(terms: TrendingTerm[]): TrendingTerm[] {
  return [...terms].sort(
    (a, b) => statusRank(a.status) - statusRank(b.status) || b.total.d7 - a.total.d7 || a.term.localeCompare(b.term),
  )
}

/** The oldest day the thirty-day window reaches on this run. */
export function windowFloor(file: TrendingTermsDay): string {
  const d = new Date(`${file.date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (file.windows.d30 - 1))
  return d.toISOString().slice(0, 10)
}

/** True when a term's first sighting sits at the edge of the window. That edge means "at
 *  least since the window opened", never "born on that day" — on the first run every term
 *  sits there, and saying "first seen 4 August" would be a false precision. */
export function atWindowFloor(file: TrendingTermsDay, term: TrendingTerm): boolean {
  return Math.abs(Date.parse(term.first_seen) - Date.parse(windowFloor(file))) <= 86_400_000
}

export function firstSeenText(file: TrendingTermsDay, term: TrendingTerm): string {
  return atWindowFloor(file, term)
    ? `already in view when the window opened (${fmtDateLong(windowFloor(file))})`
    : `first seen ${fmtDateLong(term.first_seen)}`
}

/** The table cell: a date, or "≤ date" when the sighting is the window's edge. */
export function firstSeenCell(file: TrendingTermsDay, term: TrendingTerm): string {
  return atWindowFloor(file, term) ? `≤ ${windowFloor(file)}` : term.first_seen
}

export interface HubRow extends Record<string, string | number> {
  term: string
  status: string
  d7: string
  d30: string
  added: string
  origin: string
  first_seen: string
  platforms: string
}

/** The hub table: every watched term, sorted for reading. The rows carry no link — the
 *  shared table primitive takes cells, not markup — so the page lists the terms as links
 *  above the table and the table stays the plain-text floor beneath it.
 *
 *  `added` and `origin` are here because the plain-text floor has to carry the governance too
 *  (2026-09-02): who put a term on the list, and when, is not a detail a reader should have to
 *  read the JSON for. */
export function hubRows(file: TrendingTermsDay): HubRow[] {
  const order = searchedPlatforms(file)
  return sortTerms(file.terms).map((t) => ({
    term: t.term,
    status: statusLabel(t.status),
    d7: compact(t.total.d7),
    d30: compact(t.total.d30),
    added: t.added,
    origin: originLabel(t.origin),
    first_seen: firstSeenCell(file, t),
    platforms: countedPlatforms(t, order).map(termPlatformLabel).join(' · ') || '—',
  }))
}

export interface TermLink {
  slug: string
  term: string
  href: string
  status: TermStatus
  statusLabel: string
  d7: string
  ratio: string | null
  origin: TermOrigin
  originMark: string
}

/** The linked list of terms above the hub table, and the source of the rising block. */
export function termLinks(terms: TrendingTerm[]): TermLink[] {
  return sortTerms(terms).map((t) => ({
    slug: t.slug,
    term: t.term,
    href: `/trending/topics/${t.slug}/`,
    status: t.status,
    statusLabel: statusLabel(t.status),
    d7: compact(t.total.d7),
    ratio: t.ratio === null ? null : ratioText(t.ratio),
    origin: t.origin,
    originMark: originMark(t.origin),
  }))
}

/** "Rising this week" on the day ledger: the terms that are new or accelerating, at most
 *  `max` of them, in the hub's order. */
export function risingLinks(file: TrendingTermsDay, max = 8): TermLink[] {
  return termLinks(file.terms.filter((t) => t.status === 'emerging' || t.status === 'rising')).slice(0, max)
}

export interface CountRow extends Record<string, string | number> {
  platform: string
  d1: string
  d7: string
  d30: string
  capped: string
}

/** The per-platform counts of one term, in the run's fixed source order. A platform that
 *  returned nothing reads as a dash, never as a zero it did not measure; page views are
 *  carried last and marked as what they are. */
export function countRows(file: TrendingTermsDay, term: TrendingTerm): CountRow[] {
  const rows = file.sources.map((s) => {
    const c = term.counts[s.id]
    return {
      platform: termPlatformLabel(s.id),
      d1: c ? compact(c.d1) : '—',
      d7: c ? compact(c.d7) : '—',
      d30: c ? compact(c.d30) : '—',
      capped: c?.capped ? 'may undercount' : '',
    }
  })
  rows.push({
    platform: 'Total (page views excluded)',
    d1: compact(term.total.d1),
    d7: compact(term.total.d7),
    d30: compact(term.total.d30),
    capped: '',
  })
  return rows
}

export interface ReceiptItem {
  platform: string
  title: string
  url: string
  date: string
}

/** The newest receipts of a term, at most `max` — the documents the counts were read from. */
export function receiptItems(term: TrendingTerm, max = 12): ReceiptItem[] {
  return term.receipts.slice(0, max).map((r) => ({ platform: termPlatformLabel(r.platform), title: r.title, url: r.url, date: r.date }))
}

export interface CandidateItem {
  ngram: string
  docsRecent: string
  ratio: string | null
  platforms: string
  sample: { title: string; url: string; date: string } | null
}

/** What the discovery run noticed: terms on their way in, not proposals waiting for a person.
 *  Keep clearing the promotion rule and the run puts them on the list itself (2026-09-02). */
export function candidateItems(file: TrendingTermsDay, max = 30): CandidateItem[] {
  return file.candidates.slice(0, max).map((c: TermCandidate) => ({
    ngram: c.ngram,
    docsRecent: compact(c.docs_recent),
    ratio: c.ratio === null ? null : ratioText(c.ratio),
    platforms: c.platforms.map(termPlatformLabel).join(' · ') || '—',
    sample: c.sample,
  }))
}

// ——— The list governs itself: the run adds, the run lets go, a person overrides ——————————
// Frank's decision of 2026-09-02 (wording private) reversed the default of this surface: it
// was watching a fixed list rather than finding trends. The wording below therefore has three
// jobs — say what the run did this morning in each direction, say that a promoted term has no
// counts yet, and say who can override the run.

/** The promotion rule in plain words, for the page and its Markdown edition. The thresholds
 *  themselves live in the pipeline's rules file and are spelled out on the method sheet; what
 *  is fixed here is WHO decides, which is the part a reader cannot recompute. */
export const PROMOTION_RULE =
  'A candidate that keeps coming back takes itself onto the list: proposed on three days in a row, on at ' +
  'least two platforms each time, never struck before, at most three promotions in one run, and never past ' +
  'the ceiling of thirty-five tracked terms.'

/** The other direction, symmetrical: the run lets go of what the run added. */
export const RETIREMENT_RULE =
  'The run also lets go of what it added: a term it promoted itself that stays quiet or fading on every run ' +
  'for three weeks is struck, with the day and the reason written into the watchlist file. A term a person ' +
  'put on the list is never struck that way. A person overrides both directions — and a struck term never ' +
  'returns, because its line stays in the file as a tombstone.'

/** Both directions in one paragraph: the machine adds, the machine lets go of what it added,
 *  and a person overrides either way. */
export const GOVERNANCE_RULE = `${PROMOTION_RULE} ${RETIREMENT_RULE}`

/** The promotions of a run. An older file carries no such key, and a run that promoted nothing
 *  writes an empty list; both read as nothing promoted, which is what happened. */
export function promotedTerms(file: TrendingTermsDay): PromotedTerm[] {
  return file.promoted ?? []
}

function countText(n: number, one: string, many: string): string {
  return `${NUM.format(n)} ${n === 1 ? one : many}`
}

export interface PromotedItem {
  slug: string
  term: string
  href: string
  days: string
  platformCount: string
  platforms: string
  ratio: string | null
  note: string
  /** the evidence in one sentence: how long it kept coming back, and where */
  evidence: string
}

/** The terms this run promoted, in the file's order — the order the run promoted them in. */
export function promotedItems(file: TrendingTermsDay): PromotedItem[] {
  return promotedTerms(file).map((p) => ({
    slug: p.slug,
    term: p.term,
    href: `/trending/topics/${p.slug}/`,
    days: compact(p.days_seen),
    platformCount: compact(p.platforms.length),
    platforms: p.platforms.map(termPlatformLabel).join(' · ') || '—',
    ratio: p.ratio === null ? null : ratioText(p.ratio),
    note: p.note,
    evidence:
      `Proposed on ${countText(p.days_seen, 'day', 'days')} in a row, on ` +
      `${countText(p.platforms.length, 'platform', 'platforms')}` +
      (p.platforms.length ? `: ${p.platforms.map(termPlatformLabel).join(', ')}` : '') +
      '.',
  }))
}

export interface PromotedRow extends Record<string, string | number> {
  term: string
  days: string
  platforms: string
  pace: string
  note: string
}

/** The plain-text floor under the promotions: the same four facts, as a table. */
export function promotedRows(file: TrendingTermsDay): PromotedRow[] {
  return promotedItems(file).map((p) => ({
    term: p.term,
    days: p.days,
    platforms: p.platforms,
    pace: p.ratio ?? '—',
    note: p.note || '—',
  }))
}

/** What the promotions mean for the numbers on this page: nothing yet. A promoted term is
 *  searched from the next run on, so its counts start tomorrow — the page says that rather
 *  than showing a row of zeros nobody measured. Empty when nothing was promoted. */
export function promotionSentence(file: TrendingTermsDay): string {
  const n = promotedTerms(file).length
  if (n === 0) return ''
  return n === 1
    ? 'One term joined the watchlist this morning. Its counts start with the next run: this file records the ' +
        'proposals that promoted it, not a tracked series.'
    : `${NUM.format(n)} terms joined the watchlist this morning. Their counts start with the next run: this file ` +
        'records the proposals that promoted them, not a tracked series.'
}

/** What the run let go of this morning. Same tolerance as the promotions: an older file and a
 *  run that let nothing go both read as an empty list. */
export function letGoTerms(file: TrendingTermsDay): LetGoTerm[] {
  return file.let_go ?? []
}

export interface LetGoItem {
  slug: string
  term: string
  days: string
  note: string
  /** the evidence in one sentence: how long it had been standing still */
  evidence: string
}

export function letGoItems(file: TrendingTermsDay): LetGoItem[] {
  return letGoTerms(file).map((g) => ({
    slug: g.slug,
    term: g.term,
    days: compact(g.days_quiet),
    note: g.note,
    evidence: `Quiet or fading on every run for ${countText(g.days_quiet, 'day', 'days')}.`,
  }))
}

export interface LetGoRow extends Record<string, string | number> {
  term: string
  days_quiet: string
  note: string
}

/** The plain-text floor under the strikings of a run. */
export function letGoRows(file: TrendingTermsDay): LetGoRow[] {
  return letGoItems(file).map((g) => ({ term: g.term, days_quiet: g.days, note: g.note || '—' }))
}

/** What the strikings mean: the run withdrew terms it had put on the list itself, and they
 *  cannot come back. Empty when nothing was let go. */
export function letGoSentence(file: TrendingTermsDay): string {
  const n = letGoTerms(file).length
  if (n === 0) return ''
  return n === 1
    ? 'One term the run had promoted was let go this morning: it stood still long enough to fail the test the run ' +
        'applies to its own additions. Its line stays in the watchlist file as a tombstone, so it cannot be ' +
        'promoted again.'
    : `${NUM.format(n)} terms the run had promoted were let go this morning: they stood still long enough to fail ` +
        'the test the run applies to its own additions. Their lines stay in the watchlist file as tombstones, so ' +
        'they cannot be promoted again.'
}

/** True when a run changed the list at all — the one condition for showing the section that
 *  says what came and went. */
export function listChanged(file: TrendingTermsDay): boolean {
  return promotedTerms(file).length > 0 || letGoTerms(file).length > 0
}

/** The terms that have been struck, newest striking first — by the run or by a person. They
 *  stay in the watchlist file: the tombstone is what keeps them from being promoted again. */
export function retiredEntries(entries: WatchlistEntry[]): WatchlistEntry[] {
  return entries
    .filter((e) => typeof e.retired === 'string' && e.retired.length > 0)
    .sort((a, b) => (b.retired as string).localeCompare(a.retired as string) || a.term.localeCompare(b.term))
}

/** One line about the pruning: how many terms have been struck over the whole life of the
 *  list, and why their lines are still in the file. The file records the day and the reason,
 *  not the hand — a striking by the run and a striking by a person leave the same tombstone.
 *  Empty when nothing has been struck. */
export function retiredSentence(entries: WatchlistEntry[]): string {
  const struck = retiredEntries(entries)
  if (struck.length === 0) return ''
  const names = joinWithAnd(struck.map((e) => e.term))
  return struck.length === 1
    ? `One term has been struck and stays in the watchlist file as a tombstone, so it cannot be promoted ` +
        `again: ${names}.`
    : `${NUM.format(struck.length)} terms have been struck and stay in the watchlist file as tombstones, so they ` +
        `cannot be promoted again: ${names}.`
}

export interface StatusTallyItem {
  status: TermStatus
  label: string
  n: number
}

/** The run's own count per status, in reading order, zeros left out. */
export function statusTally(file: TrendingTermsDay): StatusTallyItem[] {
  return TERM_STATUSES.map((s) => ({ status: s, label: statusLabel(s), n: file.summary.by_status[s] ?? 0 })).filter((i) => i.n > 0)
}

export interface SeriesBar {
  date: string
  x: number
  y: number
  h: number
  d1: number
}

export interface SeriesStrip {
  width: number
  height: number
  barWidth: number
  gap: number
  max: number
  bars: SeriesBar[]
}

/** A term's series as bar geometry, oldest left. A counted zero is drawn as a hairline rather
 *  than as nothing: the day was measured, and the figure should not make a measurement
 *  disappear. Days with no committed file are simply absent — the strip is as long as the
 *  archive, and the caption says how long that is. */
export function seriesStrip(points: TermSeriesPoint[], width = 560, height = 72): SeriesStrip {
  const gap = 3
  const barWidth = points.length ? Math.max(3, (width - gap * (points.length - 1)) / points.length) : 0
  const max = Math.max(0, ...points.map((p) => p.d1))
  const bars: SeriesBar[] = points.map((p, i) => {
    const raw = max > 0 ? (p.d1 / max) * height : 0
    const h = p.d1 > 0 ? Math.max(raw, 1.5) : 1
    return { date: p.date, x: i * (barWidth + gap), y: height - h, h, d1: p.d1 }
  })
  return { width, height, barWidth, gap, max, bars }
}

export interface SeriesRow extends Record<string, string | number> {
  date: string
  mentions: string
}

/** The strip's table floor: one row per committed day, newest first. */
export function seriesRows(points: TermSeriesPoint[]): SeriesRow[] {
  return [...points].sort((a, b) => b.date.localeCompare(a.date)).map((p) => ({ date: p.date, mentions: compact(p.d1) }))
}

/** The subline under a term's heading. */
export function termSubline(term: TrendingTerm, file?: TrendingTermsDay): string {
  const seen = file ? firstSeenText(file, term) : `first seen ${fmtDateLong(term.first_seen)}`
  return `${statusLabel(term.status)} · tracked since ${fmtDateLong(term.added)} · ${seen}`
}

/** `<Term> — <status label> trend, tracked across <the searched platforms> | Frank Bültge` */
export function termTitle(file: TrendingTermsDay, term: TrendingTerm): string {
  const where = joinWithAnd(searchedPlatforms(file).map(termPlatformLabel))
  return `${term.term} — ${statusLabel(term.status).toLowerCase()} trend, tracked across ${where} | Frank Bültge`
}

/** The term page's meta description. Digits here are data-derived, which is the one place the
 *  currency doctrine allows them: every one of them is read out of the committed file. */
export function termDescription(file: TrendingTermsDay, term: TrendingTerm): string {
  const n = countedPlatforms(term, searchedPlatforms(file)).length
  const seen = term.status === 'emerging'
    ? ''
    : atWindowFloor(file, term)
      ? `In view since before ${fmtDateLong(windowFloor(file))}; `
      : `First seen ${fmtDateLong(term.first_seen)}; `
  const mentions = `${NUM.format(term.total.d30)} mention${term.total.d30 === 1 ? '' : 's'}`
  const platforms = `${NUM.format(n)} platform${n === 1 ? '' : 's'}`
  return `${term.term}: ${statusSentence(term)} ${seen}${mentions} across ${platforms} in thirty days. Daily open data.`
}

export const HUB_TITLE = 'Trends in the making — terms tracked across search, news, code and papers | Frank Bültge'

/** The hub title names the platforms of the newest run when there is one, so a source added
 *  to the tracker reaches the title without anyone editing prose. */
export function hubTitle(file?: TrendingTermsDay): string {
  if (!file) return HUB_TITLE
  return `Trends in the making — terms tracked across ${joinWithAnd(searchedPlatforms(file).map(termPlatformLabel))} | Frank Bültge`
}

export const HUB_DESCRIPTION =
  'Terms that build over weeks before search trends show them: a watchlist tracked every day across link ' +
  'aggregators, news, code repositories and preprints, with a mention count per window, a status derived from ' +
  'disclosed thresholds, the documents each count was read from, and the candidates the discovery run is about ' +
  'to promote onto the list itself. Open data (CC0), archived daily; no language model writes anything here.'

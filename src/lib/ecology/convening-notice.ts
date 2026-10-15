// src/lib/ecology/convening-notice.ts — the architect's notice: one issue when his decision is due.
//
// Frank's decision of 2026-10-08 (wording private). A convening's tally opens the next cycle the
// day after it was tallied unless the architect objects, and his silence is consent
// (docs/design/2026-10-07-the-convening.md). Silence only means consent if he hears of the result
// in time. So when a result is pending, the house writes to him the way it already writes to him
// about the practices' requests (.github/workflows/requests-watchdog.yml): an issue in this
// repository, which GitHub delivers to the owner by email. This one is also assigned to him and
// names him, so it reaches him as an assignment and a mention, not only through a repository he
// watches.
//
// He answers in the same place. A reply to that email becomes a comment on the issue (GitHub posts
// it under the account the email was addressed to), and so does a comment written on the issue
// itself. A comment of his that objects — it says Widerspruch, Einspruch, objection or veto, and
// does not negate it — is written into cycle.json as `convening.objected` BEFORE the clock decides,
// on the same run, so an objection is never outrun by the opening it objects to.
//
// The module decides and the workflow acts (.github/workflows/cycle-sentinel.yml, through
// scripts/ecology/convening-notice.ts). Given cycle.json, the relay's convening and the notice
// issues with their comments, it returns what to do, in order:
//
//   · planObjection, before the clock decides: an objection on the pending result's issue becomes
//     the day to record, a comment saying what follows, and the issue closed;
//   · planNotice, after the clock has decided: a pending result without its issue gets one, and an
//     open notice whose result is no longer pending is closed with a comment saying why: the next
//     cycle opened (and on which question), an objection set the result aside, or the record no
//     longer shows the convening.
//
// Nothing else writes to him: a convening merely opening is no decision of his, and gets no notice.
// Dedupe is the watchdog's discipline: an issue is found by its exact title among ALL issues, open
// or closed, so a closed notice never alerts again. The title names the convening and the day its
// result opens the next cycle; the relay sets a convening's result once and never changes it
// (research-ecology relay/README.md), so that is one issue per convening.
//
// Everything the issue says is public already: the practices' own bulletin lines as the relay
// recorded them, the tally, and dates.
//
// Pure: no file system, no network, no clock.
import { fallbackOn, rankedScores, resultFate, type ConveningResult, type RelayConvening } from './convening'
import { evidenceUrl } from './relay'
import { PRACTICES, type CycleState, type PracticeId } from './v3'

/** The account the notice is for: it is assigned, it is named, and only its comments count. */
export const OWNER = 'frankbueltge'

const pad = (n: number) => String(n).padStart(3, '0')
/** The practices as a sentence names them, and as a list item does. */
const NAME: Record<PracticeId, string> = { field: 'the Field', atelier: 'the Atelier', studio: 'the Studio' }
const ITEM: Record<PracticeId, string> = { field: 'The Field', atelier: 'The Atelier', studio: 'The Studio' }
const CYCLE_FILE = 'src/data/ecology/cycle.json'
const ON_THE_SITE = 'https://frankbueltge.de/ecology#convening'
const RULE = 'https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/design/2026-10-07-the-convening.md'
const SIGNATURE = '_Cycle sentinel, convening notice. Derivation: `src/lib/ecology/convening-notice.ts` (under test)._'

export interface NoticeComment {
  /** the login of the comment's author */
  author: string
  body: string
  createdAt: string
}

export interface NoticeIssue {
  number: number
  title: string
  state: 'open' | 'closed'
  /** read for the open notices and the pending result's own; empty where nothing asked for them */
  comments: NoticeComment[]
}

export type NoticeAction =
  | { kind: 'create'; title: string; body: string; assignee: string }
  | { kind: 'comment'; issue: number; body: string }
  | { kind: 'close'; issue: number }

export interface NoticeInput {
  /** cycle.json, as loadCycle reads it */
  cycle: CycleState
  /** the convening the mirrored relay carries, if any */
  relay: RelayConvening | null
  /** every issue whose title is a notice's, open or closed */
  issues: readonly NoticeIssue[]
  /** the day of the run, YYYY-MM-DD (UTC) */
  today: string
}

// ——— the title ———————————————————————————————————————————————————————————————————

export function noticeTitle(afterCycle: number, opens: string): string {
  return `Convening after cycle ${pad(afterCycle)}: the next question opens on ${opens}`
}

const TITLE = /^Convening after cycle (\d{3,}): the next question opens on (\d{4}-\d{2}-\d{2})$/

export function parseNoticeTitle(title: string): { afterCycle: number; opensOn: string } | null {
  const m = TITLE.exec(title)
  return m ? { afterCycle: Number(m[1]), opensOn: m[2]! } : null
}

// ——— when his decision is due ——————————————————————————————————————————————————————

export interface DueNotice {
  afterCycle: number
  result: ConveningResult
  opensOn: string
  title: string
}

/**
 * The result the architect's decision is due on, or null: cycle.json is in the convening phase,
 * the relay holds a result for that very convening which no objection sets aside, and the next
 * cycle has not opened (it would have left the phase). A convening without a continuing question
 * has no clock to open it, so nothing is due from the clock's side either (resultFate says
 * "unknown" then, as conveningView prints no opening day).
 */
export function dueNotice(cycle: CycleState, relay: RelayConvening | null): DueNotice | null {
  const fate = relay ? resultFate(cycle, relay) : null
  if (!relay || !relay.result || fate?.kind !== 'pending') return null
  return { afterCycle: relay.afterCycle, result: relay.result, opensOn: fate.opensOn, title: noticeTitle(relay.afterCycle, fate.opensOn) }
}

// ——— reading his reply ————————————————————————————————————————————————————————————

/** The words that make a reply an objection — the four of the decision of 2026-10-08 — and the
 *  two verb phrases that say the same. */
const OBJECTION_WORDS = new Set(['widerspruch', 'einspruch', 'objection', 'veto'])
const OBJECTION_PHRASES: readonly (readonly string[])[] = [
  ['ich', 'widerspreche'],
  ['i', 'object'],
]
/** A word that turns what follows into its opposite: "kein Widerspruch", "no objection". */
const NEGATIONS = new Set(['kein', 'keine', 'keinen', 'keinem', 'keiner', 'nicht', 'ohne', 'no', 'not', 'without', 'never', 'nie'])
/** How many words before a keyword a negation reaches, and after a verb phrase ("ich widerspreche nicht"). */
const BEFORE = 3
const AFTER = 2

/** Where a quoted email begins, if GitHub's own reply parser left any of it in the comment:
 *  Outlook's rule and header, a signature, GitHub's own footer and sender. The reply header
 *  ("On … wrote:", "Am … schrieb …:") is matched with the line after it, since clients wrap it. */
const QUOTE_STARTS: readonly RegExp[] = [
  /^-{2,}\s*(original message|ursprüngliche nachricht)/i,
  /^_{5,}$/,
  /^(from|von):\s/i,
  /^--\s*$/,
  /notifications@github\.com/i,
  /reply to this email directly/i,
  /you are receiving this because/i,
]
const REPLY_HEADER = /^(on|am)\b.*\b(wrote|schrieb)\b/i

/** A comment's own words: quoted lines dropped, and everything from the start of a quoted email
 *  on cut — so the notice's own wording, which names the four words, can never count as his. */
export function ownWords(body: string): string {
  const lines = body.split(/\r?\n/)
  const kept: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i]!.trim()
    if (t.startsWith('>')) continue
    if (QUOTE_STARTS.some((re) => re.test(t))) break
    if (REPLY_HEADER.test(t) || REPLY_HEADER.test(`${t} ${(lines[i + 1] ?? '').trim()}`)) break
    kept.push(lines[i]!)
  }
  return kept.join('\n')
}

/**
 * Whether a comment objects. It does when its own words carry one of the four words, or "ich
 * widerspreche" / "I object", and no negation stands within three words before it — or, for the
 * two verb phrases, within two words after ("ich widerspreche nicht"). Case does not matter, and
 * neither does punctuation. A reading of words, not of intent: "Widerspruch." and "Veto!" object,
 * "kein Einspruch" and "no objection" do not. The issue says so, so the rule is his to use.
 */
export function isObjection(body: string): boolean {
  const words = ownWords(body).toLowerCase().match(/\p{L}+/gu) ?? []
  const negatedBefore = (i: number) => words.slice(Math.max(0, i - BEFORE), i).some((w) => NEGATIONS.has(w))
  for (let i = 0; i < words.length; i++) {
    if (OBJECTION_WORDS.has(words[i]!) && !negatedBefore(i)) return true
    for (const phrase of OBJECTION_PHRASES) {
      if (!phrase.every((w, k) => words[i + k] === w)) continue
      const after = words.slice(i + phrase.length, i + phrase.length + AFTER)
      if (!negatedBefore(i) && !after.some((w) => NEGATIONS.has(w))) return true
    }
  }
  return false
}

/** The owner's first objecting comment, if any. Every other author is ignored — the bot's own
 *  confirmations included. */
export function objectionIn(issue: NoticeIssue): NoticeComment | null {
  return issue.comments.find((c) => c.author === OWNER && isObjection(c.body)) ?? null
}

// ——— what the notice says ————————————————————————————————————————————————————————

/** The practices' lines are verbatim and public, but GitHub would act on two things in them: an
 *  @-name notifies a stranger, and #<number> links an unrelated issue. A zero-width space after
 *  either keeps the text and drops the effect; line breaks become spaces, as a bulletin line has none. */
export function inert(text: string): string {
  return text.replace(/\s+/g, ' ').trim().replace(/@/g, '@​').replace(/#(?=\d)/g, '#​')
}

function proposalLines(relay: RelayConvening): string[] {
  return PRACTICES.flatMap((p) => {
    const proposal = relay.proposals.find((x) => x.practice === p)
    if (!proposal) return [`- **${ITEM[p]}**: no proposal recorded.`]
    const href = evidenceUrl(proposal.ref)
    const bulletin = href ? `[bulletin${proposal.date ? `, ${proposal.date}` : ''}](${href})` : 'no bulletin pinned'
    return [
      `- **${ITEM[p]}**: ${inert(proposal.question)}`,
      `  Docks onto: ${proposal.docksOnto ? inert(proposal.docksOnto) : 'not recorded'} · ${bulletin}`,
    ]
  })
}

/**
 * What follows an objection, in one sentence: unless the architect turns the cycle by hand, the
 * clock falls back to the continuing question on the seventh day after the convening opened — at
 * once if that day has come. Said in advance (the notice), `today` is null and `until` is the last
 * day an objection can come: only if the fallback day falls within it does "at once" apply.
 */
function fallbackLine(cycle: CycleState, today: string | null, until: string | null = null): string {
  const conv = cycle.convening!
  const next = pad(conv.afterCycle + 1)
  if (!cycle.continuing) return `No clock opens cycle ${next} without a continuing question: it opens by hand, in \`${CYCLE_FILE}\`.`
  const day = fallbackOn(conv.opened)
  const seventh = `on ${day}, the seventh day after the convening opened`
  const when =
    today === null
      ? until !== null && day <= until
        ? `${seventh}, or at once if you object on or after that day`
        : seventh
      : today >= day
        ? `at once: the seventh day after the convening opened (${day}) has come`
        : seventh
  return `Unless you turn the cycle by hand in \`${CYCLE_FILE}\`, the cycle clock opens cycle ${next} on the continuing question, ${inert(cycle.continuing.question)}, ${when}.`
}

/** The issue: the result, the tally, all three proposals, the day, and how to object. Short. */
export function noticeBody(due: DueNotice, cycle: CycleState, relay: RelayConvening): string {
  const r = due.result
  const next = pad(due.afterCycle + 1)
  const scores = rankedScores(r)
    .map((s) => `${NAME[s.practice]} ${s.score}`)
    .join(' · ')
  return [
    `@${OWNER}, the convening after cycle ${pad(due.afterCycle)} has a result. Unless you object, it opens cycle ${next} on **${due.opensOn}**.`,
    '',
    `**The winning question**${r.proposedBy ? `, proposed by ${NAME[r.proposedBy]}` : ''}:`,
    '',
    `> ${inert(r.question)}`,
    '',
    `Tally${r.rule ? ` (${r.rule})` : ''}: ${scores || 'no scores recorded'}; tallied ${r.talliedOn}.`,
    '',
    '**The three proposals**',
    '',
    ...proposalLines(relay),
    '',
    `**To object**, reply to this email, or comment on this issue, with *Widerspruch*, *Einspruch*, *objection* or *veto*. ` +
      `A negated one ("kein Widerspruch", "no objection") does not count, and only comments by @${OWNER} do. ` +
      `The cycle sentinel reads this issue every time it runs (daily, and while a convening is open several times a day: every relay mirror and every Ecology integrate run start it), ` +
      `writes the objection into \`${CYCLE_FILE}\` as \`convening.objected\`, confirms it here and closes this issue. ` +
      `It counts if it is here before the clock's first run on ${due.opensOn} (UTC), which can come soon after midnight UTC.`,
    '',
    `If you object, no new tally comes for this convening. ${fallbackLine(cycle, null, due.opensOn)}`,
    '',
    `Silence is consent: cycle ${next} then opens on this question, and this issue closes with a note saying so.`,
    '',
    `The convening on the site: ${ON_THE_SITE} · the rule: [the convening](${RULE})`,
    '',
    SIGNATURE,
  ].join('\n')
}

/** The comment that confirms an objection, and says what follows. */
export function objectionNote(cycle: CycleState, objected: string, today: string): string {
  const next = pad(cycle.convening!.afterCycle + 1)
  return [
    `Objection recorded: \`${CYCLE_FILE}\` carries \`"objected": "${objected}"\` in its convening block, so this result does not open cycle ${next}.`,
    '',
    `No new tally comes for this convening: the Middle's relay sets a convening's result once and never changes it. ${fallbackLine(cycle, today)}`,
    '',
    SIGNATURE,
  ].join('\n')
}

const SOURCE_PHRASE: Record<CycleState['source'], string> = {
  convening: "the convening's result",
  continuing: "the continuing question, the convening's fallback",
  seed: 'a seed released to all three through the public channel, which interrupts a convening',
  defaults: 'the default themes',
}

/** The comment that closes a notice once the next cycle has opened: on which question, and from where. */
function openedNote(afterCycle: number, issue: NoticeIssue, cycle: CycleState): string {
  const next = afterCycle + 1
  const lines =
    cycle.cycle === next
      ? [
          `Cycle ${pad(next)} opened on ${cycle.opened} on ${SOURCE_PHRASE[cycle.source]}${cycle.source !== 'defaults' && cycle.question ? ':' : '.'}`,
          ...(cycle.source !== 'defaults' && cycle.question ? ['', `> ${inert(cycle.question)}`] : []),
        ]
      : [`The record has moved past this convening: cycle ${pad(cycle.cycle)} is running, opened on ${cycle.opened}. Nothing is due on it.`]
  // only where the result itself opened the cycle: on the fallback or a seed, an objection of his
  // either took effect or no longer mattered
  const late = cycle.cycle === next && cycle.source === 'convening' && objectionIn(issue)
    ? [
        '',
        `An objection in this thread was not recorded before the cycle opened, so it did not set the result aside. You can still turn the cycle by hand in \`${CYCLE_FILE}\`.`,
      ]
    : []
  return [...lines, ...late, '', 'Closing this notice.', '', SIGNATURE].join('\n')
}

function goneNote(cycle: CycleState): string {
  return [
    `\`${CYCLE_FILE}\` no longer shows this convening: it stands at cycle ${pad(cycle.cycle)}, phase ${cycle.phase}. Nothing is due on it. Closing this notice.`,
    '',
    SIGNATURE,
  ].join('\n')
}

function supersededNote(): string {
  return [
    "The relay's result for this convening is no longer the one this notice names; the result pending now has a notice of its own. Closing this one.",
    '',
    SIGNATURE,
  ].join('\n')
}

// ——— the two plans ———————————————————————————————————————————————————————————————

export interface ObjectionPlan {
  /** the objection to write into cycle.json — null when there is none to record */
  record: { afterCycle: number; date: string; issue: number } | null
  /** what to say and do on GitHub once the record is committed, in order */
  actions: NoticeAction[]
}

/**
 * Before the clock decides: is there an objection to record? Only on the pending result's own
 * notice (open or closed — he may close it as he replies), only from the owner, and only while
 * the result is pending: one already set aside needs no second record. The day recorded is the
 * day of the run, or the tally's own day should the record date that later, so the objection
 * always covers the result it was made against (convening.ts, standingResult: a result tallied on
 * or before the objection does not open a cycle).
 */
export function planObjection(input: NoticeInput): ObjectionPlan {
  const due = dueNotice(input.cycle, input.relay)
  const issue = due ? input.issues.find((i) => i.title === due.title) : undefined
  if (!due || !issue || !objectionIn(issue)) return { record: null, actions: [] }
  const date = input.today > due.result.talliedOn ? input.today : due.result.talliedOn
  const actions: NoticeAction[] = [{ kind: 'comment', issue: issue.number, body: objectionNote(input.cycle, date, input.today) }]
  if (issue.state === 'open') actions.push({ kind: 'close', issue: issue.number })
  return { record: { afterCycle: due.afterCycle, date, issue: issue.number }, actions }
}

/** Why an open notice no longer belongs open — or null while it is still the decision, or while
 *  the convening runs and the relay is silent on it (an open issue should mean an open decision,
 *  and a mirror that blinks is no reason to close one). */
function closingNote(issue: NoticeIssue, input: NoticeInput, due: DueNotice | null): string | null {
  const { cycle, relay, today } = input
  const named = parseNoticeTitle(issue.title)
  if (!named || (due && issue.title === due.title)) return null
  const a = named.afterCycle
  if (cycle.cycle > a) return openedNote(a, issue, cycle)
  if (cycle.cycle === a && cycle.phase === 'convening' && cycle.convening?.afterCycle === a) {
    const fate = relay && relay.afterCycle === a ? resultFate(cycle, relay) : null
    // an objection recorded by hand, or one whose confirmation failed on the run that recorded it
    if (fate?.kind === 'set-aside') return objectionNote(cycle, fate.objected, today)
    if (due) return supersededNote()
    return null
  }
  return goneNote(cycle)
}

/**
 * After the clock has decided: the notice a pending result needs, and the open notices to close.
 * A notice is created once — its title is looked up among all issues, open or closed — and a
 * closed one is never reopened or repeated.
 */
export function planNotice(input: NoticeInput): NoticeAction[] {
  const { cycle, relay, issues } = input
  const due = dueNotice(cycle, relay)
  const actions: NoticeAction[] = []
  if (due && relay && !issues.some((i) => i.title === due.title)) {
    actions.push({ kind: 'create', title: due.title, body: noticeBody(due, cycle, relay), assignee: OWNER })
  }
  for (const issue of issues) {
    if (issue.state !== 'open') continue
    const why = closingNote(issue, input, due)
    if (why !== null) actions.push({ kind: 'comment', issue: issue.number, body: why }, { kind: 'close', issue: issue.number })
  }
  return actions
}

// ——— the record ——————————————————————————————————————————————————————————————————

/** cycle.json with the objection written into its convening block — every other key, and the
 *  order of all of them, as the file had it. */
export function withObjection(raw: Record<string, unknown>, date: string): Record<string, unknown> {
  const conv = raw.convening
  if (raw.phase !== 'convening' || typeof conv !== 'object' || conv === null) {
    throw new Error('cycle.json is not in a convening: there is no result to object to')
  }
  return { ...raw, convening: { ...(conv as Record<string, unknown>), objected: date } }
}

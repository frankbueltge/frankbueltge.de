// src/lib/saat/saat.ts — Pure Logik der „Öffentlichen Saat" (Design-Spec 2026-07-20).
// Ein öffentlicher Seed ist dieselbe Einheit wie Franks Seeds (requestsMd.ts, seedBlock()),
// nur mit zwei Unterschieden: Provenienz "öffentlich" und ein Moderations-Gate davor. Diese
// Datei generalisiert den mechanischen Vorfilter aus atelier/impulse.ts (Spec 2026-07-14) —
// bewusst KEIN Import von dort: impulse.ts bleibt unberührt als Teil des archivierten Ventils,
// saat.ts ist eine eigenständige Quelle der Wahrheit für die Ökologie-Ebene. Web-APIs only
// (kein fs, kein node:*), weil auch eine Cloudflare Pages Function diese Module importiert.

export const SAAT_MIN_LEN = 3
export const SAAT_MAX_LEN = 500
export const AUTHOR_MARK_MAX_LEN = 24
/** Mehr als so viele neue Seeds/Tag nimmt die Kappe nicht an (Spec §4, Schicht 3). */
export const SAAT_DAILY_CAP = 6
/** Mehr als so viele offene (unbeantwortete) Seeds gesamt nimmt die Kappe nicht an. */
export const SAAT_OPEN_CAP = 24

export type SaatKind = 'frage' | 'quelle' | 'wort' | 'richtung'
export const SAAT_KINDS: readonly SaatKind[] = ['frage', 'quelle', 'wort', 'richtung'] as const

export type SaatAddressee = 'field-research' | 'studio' | 'ulysses' | 'open'
export const SAAT_ADDRESSEES: readonly SaatAddressee[] = ['field-research', 'studio', 'ulysses', 'open'] as const

/** Die drei autonomen Engine-Repos — Ziel eines "open"-Seeds ist immer alle drei (Spec §5). */
export const SAAT_ENGINE_REPOS = ['field-research', 'studio', 'ulysses'] as const

export type SaatStatus = 'offered' | 'taken' | 'adapted' | 'declined'

export type GateReason = 'spam' | 'abuse' | 'nonsense' | 'injection' | 'pii' | 'other'

export interface Seed {
  id: string // seed-YYYYMMDD-HHMMSS-XXXX (XXXX hex)
  kind: SaatKind
  text: string
  author_mark: string // Pseudonym, Default 'anonymous'
  addressed_to: SaatAddressee
  ts: string // ISO
  status: SaatStatus
  claim_token_hash: string // sha256-hex des Claim-Tokens
  gate: { model: string; verdict: 'pass' }
  forwarded_to: string[] // Engine-Repos, in die der Block schon geschrieben wurde
  /** Zusammenfassung: die stärkste Entscheidung (taken > adapted > declined). Bleibt für
   *  Bestandscode und für den Fall „nur eine Praxis hat geantwortet". */
  response: SaatResponse | null
  /** **Alle** Antworten, eine je Praxis. Ein Seed an `open` geht an drei Praxen, und die
   *  antworten verschieden — beim Seed `…-e322` nahm Ensemble ihn als Material auf,
   *  während Meridian ihn begründet ablehnte. Bis 2026-07-28 hielt das Register nur ein
   *  einziges `response`-Feld: Die zuletzt synchronisierte Antwort überschrieb die
   *  anderen, und der Widerspruch — der interessanteste Teil — verschwand. */
  responses?: SaatResponse[]
}

export interface SaatResponse {
  practice: string
  decision: 'taken' | 'adapted' | 'declined'
  note: string
  date: string
  journal_ref?: string
}

/** Rangfolge für die Zusammenfassung. Ein Seed, den EINE Praxis aufgenommen hat, gilt als
 *  aufgenommen — die Ablehnungen der anderen verschwinden dadurch nicht, sie stehen in
 *  `responses`. Die Alternative wäre ein Sammelstatus „answered" gewesen; der hätte die
 *  häufigste Frage („wurde daraus etwas?") schlechter beantwortet. */
const ENTSCHEIDUNGSRANG: Record<SaatResponse['decision'], number> = {
  taken: 3,
  adapted: 2,
  declined: 1,
}

export interface SaatRegister {
  version: 1
  gate_stats: { blocked_total: number; by_reason: Partial<Record<GateReason, number>> }
  seeds: Seed[]
}

export type RejectReason =
  | 'kind'
  | 'too-short'
  | 'too-long'
  | 'pii'
  | 'url-not-allowed'
  | 'too-many-urls'
  | 'author-mark'
  | 'addressee'

export type ValidationResult =
  | { ok: true; text: string; kind: SaatKind; authorMark: string; addressedTo: SaatAddressee }
  | { ok: false; reason: RejectReason }

/** Steuerzeichen raus (außer \n), Whitespace normalisieren — der Text bleibt sonst wörtlich. */
export function sanitizeText(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/
// Telefon-artig: 8+ Ziffern am Stück, auch mit Trennern (Jahreszahlen etc. bleiben erlaubt).
const PHONE_RE = /(?:\+?\d[\s\-./()]*){8,}\d/
const URL_RE = /https?:\/\/\S+/gi

export function containsPii(text: string): boolean {
  return EMAIL_RE.test(text) || PHONE_RE.test(text)
}

export function countUrls(text: string): number {
  return (text.match(URL_RE) ?? []).length
}

/**
 * Der mechanische Vorfilter (Spec §4, Schicht 1): Länge 3–500, kein PII, URL nur bei
 * kind=quelle (max 1), Pseudonym max 24 ohne PII/URL (leer ⇒ 'anonymous'), kind/addressedTo
 * müssen zu den vier bekannten Werten gehören. Ob eine Saat inhaltlich taugt, entscheidet
 * das KI-Gate (gate.ts) und am Ende die Praxis selbst — nie dieser Vorfilter.
 */
export function validateSeed(input: {
  text?: unknown
  kind?: unknown
  authorMark?: unknown
  addressedTo?: unknown
}): ValidationResult {
  const kind = typeof input.kind === 'string' ? (input.kind as SaatKind) : null
  if (!kind || !SAAT_KINDS.includes(kind)) return { ok: false, reason: 'kind' }

  const addressedTo = typeof input.addressedTo === 'string' ? (input.addressedTo as SaatAddressee) : null
  if (!addressedTo || !SAAT_ADDRESSEES.includes(addressedTo)) return { ok: false, reason: 'addressee' }

  const text = sanitizeText(typeof input.text === 'string' ? input.text : '')
  if (text.length < SAAT_MIN_LEN) return { ok: false, reason: 'too-short' }
  if (text.length > SAAT_MAX_LEN) return { ok: false, reason: 'too-long' }
  if (containsPii(text)) return { ok: false, reason: 'pii' }

  const urls = countUrls(text)
  if (urls > 0 && kind !== 'quelle') return { ok: false, reason: 'url-not-allowed' }
  if (urls > 1) return { ok: false, reason: 'too-many-urls' }

  const authorMark = sanitizeText(typeof input.authorMark === 'string' ? input.authorMark : '').replace(/\n/g, ' ')
  if (authorMark.length > AUTHOR_MARK_MAX_LEN) return { ok: false, reason: 'author-mark' }
  if (authorMark && (containsPii(authorMark) || countUrls(authorMark) > 0)) return { ok: false, reason: 'author-mark' }

  return { ok: true, text, kind, authorMark: authorMark || 'anonymous', addressedTo }
}

/** Baut den Register-Eintrag. now/rand injizierbar → deterministisch testbar (wie makeImpulse). */
export function makeSeed(
  v: { text: string; kind: SaatKind; authorMark: string; addressedTo: SaatAddressee },
  opts: { now?: Date; rand?: () => number; tokenHash: string; gateModel: string },
): Seed {
  const now = opts.now ?? new Date()
  const rand = opts.rand ?? Math.random
  const stamp = now.toISOString()
  const suffix = Math.floor(rand() * 0xffff)
    .toString(16)
    .padStart(4, '0')
  return {
    id: `seed-${stamp.slice(0, 10).replace(/-/g, '')}-${stamp.slice(11, 19).replace(/:/g, '')}-${suffix}`,
    kind: v.kind,
    text: v.text,
    author_mark: v.authorMark,
    addressed_to: v.addressedTo,
    ts: stamp,
    status: 'offered',
    claim_token_hash: opts.tokenHash,
    gate: { model: opts.gateModel, verdict: 'pass' },
    forwarded_to: [],
    response: null,
  }
}

/** 128-Bit-Claim-Token (Spec §3: "Token selbst nur einmal in der Antwort"). Ohne Argument
 * über WebCrypto — im Test injizierbar für deterministische Vektoren. */
export function generateClaimToken(randomBytes?: Uint8Array): string {
  const bytes = randomBytes ?? crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** SHA-256-Hex des Claim-Tokens — nur der Hash landet im Register, nie das Token selbst. */
export async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function emptyRegister(): SaatRegister {
  return { version: 1, gate_stats: { blocked_total: 0, by_reason: {} }, seeds: [] }
}

/** Zählt Seeds, deren ts auf denselben UTC-Kalendertag wie `now` fällt (Tages-Kappe, Spec §4). */
export function offeredToday(register: SaatRegister, now: Date): number {
  const day = now.toISOString().slice(0, 10)
  return register.seeds.filter((s) => s.ts.slice(0, 10) === day).length
}

/** Zählt offene (noch unbeantwortete) Seeds — die zweite Kappe aus Spec §4. */
export function openCount(register: SaatRegister): number {
  return register.seeds.filter((s) => s.status === 'offered').length
}

/** Immutabel: erhöht den Blocked-Zähler des Gates. Blockierte Inhalte selbst werden nie
 * gespeichert (Spec §4) — nur die Zahl je Reason-Code. */
export function recordGateBlock(register: SaatRegister, reason: GateReason): SaatRegister {
  return {
    ...register,
    gate_stats: {
      blocked_total: register.gate_stats.blocked_total + 1,
      by_reason: {
        ...register.gate_stats.by_reason,
        [reason]: (register.gate_stats.by_reason[reason] ?? 0) + 1,
      },
    },
  }
}

/** Immutabel: neuester Seed zuerst (wie das Register gelesen werden soll). */
export function addSeed(register: SaatRegister, seed: Seed): SaatRegister {
  return { ...register, seeds: [seed, ...register.seeds] }
}

/** Setzt die Praxis-Antwort und den Status; unbekannte id ⇒ Register unverändert (Aufrufer
 * entscheidet, ob das ein Fehler ist — diese Funktion selbst wirft nie). */
export function applyResponse(register: SaatRegister, seedId: string, response: SaatResponse): SaatRegister {
  const idx = register.seeds.findIndex((s) => s.id === seedId)
  if (idx === -1) return register
  const seeds = register.seeds.slice()
  const seed = seeds[idx]

  // Je Praxis eine Antwort: eine erneute Synchronisation aktualisiert, statt zu häufen.
  const bisher = seed.responses ?? (seed.response ? [seed.response] : [])
  const responses = [
    ...bisher.filter((r) => r.practice !== response.practice),
    response,
  ].sort((a, b) => a.practice.localeCompare(b.practice))

  // Zusammenfassung und Status aus der stärksten Entscheidung — nie aus der zuletzt
  // eingelaufenen. Sonst entschiede die Reihenfolge der Repos, was ein Seed „ist".
  const staerkste = responses.reduce((a, b) =>
    ENTSCHEIDUNGSRANG[b.decision] > ENTSCHEIDUNGSRANG[a.decision] ? b : a,
  )

  seeds[idx] = { ...seed, status: staerkste.decision, response: staerkste, responses }
  return { ...register, seeds }
}

// ── The ecology as a respondent ─────────────────────────────────────────────────────────────────
//
// A seed released to all three practices can be answered in two ways. Each practice may answer it
// on its own, in its REQUESTS.md (parsePublicSeedResponses, below). Or the ecology may take it as
// its question: the cycle clock (src/lib/ecology/cycle-turn.ts) opens a cycle on a released seed
// and lists it in cycle.json's `taken_seeds`, and from then on all three practices work it. That
// second answer reaches no REQUESTS.md, so the register kept showing the seed as "offered · no
// reply yet" for each practice, and counting it against the open cap, long after cycles had been
// run on it (found 2026-10-17: seed …-aa5f carried cycle 003 from 2026-09-07, seed …-3080 cycle 004
// from 2026-10-03). The sync derives the answer from cycle.json and its history; nobody writes it.
//
// Pure like the rest of this file: scripts/saat/sync.ts reads cycle.json and its git history and
// hands the snapshots in.

/** The name the ecology's own answer carries in `responses[].practice`. Not a repository: the
 *  three practices answer a seed one by one, the ecology answers it by running a cycle on it. */
export const SAAT_ECOLOGY = 'ecology'

/** cycle.json as one commit of it held the state, reduced to what the derivation reads. */
export interface CycleSnapshot {
  cycle: number
  /** YYYY-MM-DD — the day that cycle opened */
  opened: string
  /** the seed the cycle is run on (`source: "seed"`) or read through (`source: "continuing"`) */
  seed_id: string | null
}

/** A seed the ecology took, and what it did with it. */
export interface EcologyTaking {
  id: string
  /** the cycles whose cycle.json carried the seed, ascending */
  cycles: number[]
  /** YYYY-MM-DD — the day the first of them opened */
  opened: string
}

/**
 * The seeds the ecology took, each with the cycles that carried it. `taken` is cycle.json's
 * `taken_seeds`; `history` is every state of that file, in any order. A seed listed as taken that no
 * cycle in the history carried is left out: without a cycle there is no honest date to give it, and
 * the caller reports it rather than the register guessing.
 */
export function ecologyTakings(taken: readonly string[], history: readonly CycleSnapshot[]): EcologyTaking[] {
  const out: EcologyTaking[] = []
  for (const id of new Set(taken)) {
    const carrying = history
      .filter((s) => s.seed_id === id)
      .sort((a, b) => a.cycle - b.cycle || a.opened.localeCompare(b.opened))
    if (carrying.length === 0) continue
    out.push({ id, cycles: [...new Set(carrying.map((s) => s.cycle))], opened: carrying[0].opened })
  }
  return out
}

const cycleNo = (n: number) => String(n).padStart(3, '0')

/** The ecology's answer in words — every part of it read from cycle.json, none of it typed. */
export function ecologyNote(taking: EcologyTaking): string {
  const nos = taking.cycles.map(cycleNo)
  if (nos.length === 1) {
    return `Taken by the ecology: the question of cycle ${nos[0]} carried this seed (opened ${taking.opened}).`
  }
  const list = `${nos.slice(0, -1).join(', ')} and ${nos[nos.length - 1]}`
  return `Taken by the ecology: the questions of cycles ${list} carried this seed (the first opened ${taking.opened}).`
}

/**
 * Sets the ecology's answer on every seed it took: decision `taken`, so the seed stops counting as
 * open. The answer is only ever produced here, so a second run over the same history changes
 * nothing, and a seed that a later cycle carries again gets its note brought up to date. A seed the
 * register does not hold is skipped.
 */
export function applyEcologyTakings(register: SaatRegister, takings: readonly EcologyTaking[]): SaatRegister {
  let next = register
  for (const taking of takings) {
    const seed = next.seeds.find((s) => s.id === taking.id)
    if (!seed) continue
    const response: SaatResponse = { practice: SAAT_ECOLOGY, decision: 'taken', note: ecologyNote(taking), date: taking.opened }
    const have = (seed.responses ?? (seed.response ? [seed.response] : [])).find((r) => r.practice === SAAT_ECOLOGY)
    if (have && have.decision === response.decision && have.note === response.note && have.date === response.date) continue
    next = applyResponse(next, taking.id, response)
  }
  return next
}

/**
 * The practices that were asked and have not answered. A seed the ecology took was answered by the
 * ecology as a whole, which all three practices worked, so no practice is still silent on it: the
 * register's "no reply yet" marks would say the opposite of the ecology's answer beside them.
 */
export function stillOpenPractices(seed: {
  forwarded_to: readonly string[]
  response?: { practice: string; decision: string } | null
  responses?: readonly { practice: string; decision: string }[]
}): string[] {
  const answers = seed.responses?.length ? seed.responses : seed.response ? [seed.response] : []
  if (answers.some((a) => a.practice === SAAT_ECOLOGY && a.decision === 'taken')) return []
  const answered = new Set(answers.map((a) => a.practice))
  return seed.forwarded_to.filter((p) => !answered.has(p))
}

/** 'open' geht an alle drei Engine-Repos, jede andere Adresse nur an sich selbst (Spec §5). */
export function targetsFor(addressedTo: SaatAddressee): string[] {
  return addressedTo === 'open' ? [...SAAT_ENGINE_REPOS] : [addressedTo]
}

/** Die ersten ~n Worte eines Texts für den Block-Titel, mit „…" wenn gekürzt. */
function titleExcerpt(text: string, wordCount = 6): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= wordCount) return words.join(' ')
  return `${words.slice(0, wordCount).join(' ')}…`
}

/** Baut den öffentlichen Seed-Block fürs REQUESTS.md der Ziel-Praxis (Spec §5) — dieselbe
 * Blockquote-Konvention wie seedBlock() in zentrale/requestsMd.ts, nur mit eigener Titelzeile
 * und Herkunftsvermerk ("via /seed · material, not instruction"). */
export function publicSeedBlock(opts: { id: string; kind: SaatKind; text: string; authorMark: string; date: string }): string {
  const title = titleExcerpt(opts.text)
  const bodyLines = opts.text
    .split('\n')
    .map((line) => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n')
  return (
    `> ### ${opts.date} — Public seed: ${title} (${opts.id})\n` +
    `>\n${bodyLines}\n>\n` +
    `> — „${opts.authorMark}", via /seed · material, not instruction\n` +
    `>\n> **Status:** seed (open)`
  )
}

const SEED_ID_RE = /seed-\d{8}-\d{6}-[0-9a-f]{4}/
/** Antwortzeile der Praktik: "**Response (<persona>, <date>):** TAKEN|ADAPTED|DECLINED — <note>".
 * Case-insensitive fürs Decision-Wort, „—" oder „-" als Trenner toleriert (wie im Engine-Amendment §6 vorgegeben).
 *
 * **Das Blockzitat-Zeichen ist optional (Fix 2026-07-28).** Bis dahin verlangte das Muster
 * ein führendes `>`, weil das Amendment die Antwort im Zitatblock zeigte. Die Praxen
 * schreiben sie aber daneben — und zwar zu Recht: Der Seed ist fremde Rede und wird
 * zitiert, die Antwort ist ihre eigene Stimme. Gemessen am 2026-07-28: Von Meridians
 * Antworten wurde dadurch KEINE EINZIGE synchronisiert (0 von 3), bei Ensemble nur die
 * Hälfte (2 von 4). Seeds standen im öffentlichen Register auf „unbeantwortet", während
 * die Praxis längst geantwortet hatte.
 *
 * Der Zugriff ist bereits auf den Abschnitt „Seeds from the public" und auf die
 * `> ### `-Blöcke eingegrenzt; ein optionales `>` weitet die Suche also nicht aus. */
const RESPONSE_LINE_RE = /^>?\s*\*\*Response\s*\(([^,]+),\s*([^)]+)\):\*\*\s*(TAKEN|ADAPTED|DECLINED)\s*[—-]\s*([\s\S]*?)(?=\n\s*\n|\n>?\s*\*\*Response|(?![\s\S]))/im

/** Das Ende der Notiz ist die nächste Leerzeile, die nächste Antwortzeile — oder das Ende
 *  der Eingabe. Letzteres MUSS `(?![\s\S])` sein, nicht `$`: Mit dem `m`-Flag steht `$` für
 *  das Zeilenende, und der Lazy-Quantor bricht dann schon nach der ersten Zeile ab. Genau
 *  das war der Fehler, der auf /seed „…without any judgement of the" stehen ließ.
 *
 *  Zeilenumbrüche im Fließtext einer Antwort sind Satz-Layout, keine Absätze. Zusammen-
 *  gezogen, damit die Notiz als ein Satz lesbar bleibt — und die führenden „> " fallen weg,
 *  falls die Praxis ihre Antwort doch im Zitatblock geschrieben hat. */
function fasseNotizZusammen(roh: string): string {
  return roh
    .split('\n')
    .map((z) => z.replace(/^>\s?/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Liest die H2-Section "Seeds from the public" aus einer REQUESTS.md und findet jeden
 * beantworteten Block (Seed-id im Titel + Response-Zeile) — der deterministische Gegenpart
 * zum Engine-Amendment aus Spec §6. Blöcke ohne Response-Zeile werden übersprungen: unbeantwortet
 * heißt offen, nie ein Parse-Fehler. */
export function parsePublicSeedResponses(
  md: string,
): Array<{ id: string; decision: 'taken' | 'adapted' | 'declined'; note: string; date: string; persona: string }> {
  const headingMatch = /^## Seeds from the public\s*$/im.exec(md)
  if (!headingMatch) return []

  const bodyStart = headingMatch.index + headingMatch[0].length
  const rest = md.slice(bodyStart)
  const nextHeadingMatch = /^## /m.exec(rest)
  const body = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest

  // Blöcke trennen an der Titelzeile ("> ### ...") jedes Seed-Eintrags.
  const blocks = body.split(/(?=^> ### )/m).filter((b) => b.trim().length > 0)

  const results: Array<{ id: string; decision: 'taken' | 'adapted' | 'declined'; note: string; date: string; persona: string }> = []
  for (const block of blocks) {
    const idMatch = SEED_ID_RE.exec(block)
    if (!idMatch) continue
    const responseMatch = RESPONSE_LINE_RE.exec(block)
    if (!responseMatch) continue
    const [, persona, date, decisionWord, note] = responseMatch
    results.push({
      id: idMatch[0],
      decision: decisionWord.toLowerCase() as 'taken' | 'adapted' | 'declined',
      note: fasseNotizZusammen(note),
      date: date.trim(),
      persona: persona.trim(),
    })
  }
  return results
}

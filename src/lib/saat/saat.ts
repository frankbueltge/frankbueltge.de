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

export type SaatAddressee = 'field-research' | 'studio' | 'irrtum-als-methode' | 'open'
export const SAAT_ADDRESSEES: readonly SaatAddressee[] = ['field-research', 'studio', 'irrtum-als-methode', 'open'] as const

/** Die drei autonomen Engine-Repos — Ziel eines "open"-Seeds ist immer alle drei (Spec §5). */
export const SAAT_ENGINE_REPOS = ['field-research', 'studio', 'irrtum-als-methode'] as const

export type SaatStatus = 'offered' | 'taken' | 'adapted' | 'declined'

export type GateReason = 'spam' | 'abuse' | 'nonsense' | 'injection' | 'pii' | 'other'

export interface Seed {
  id: string // saat-YYYYMMDD-HHMMSS-XXXX (XXXX hex)
  kind: SaatKind
  text: string
  author_mark: string // Pseudonym, Default 'anonym'
  addressed_to: SaatAddressee
  ts: string // ISO
  status: SaatStatus
  claim_token_hash: string // sha256-hex des Claim-Tokens
  gate: { model: string; verdict: 'pass' }
  forwarded_to: string[] // Engine-Repos, in die der Block schon geschrieben wurde
  response: { practice: string; decision: 'taken' | 'adapted' | 'declined'; note: string; date: string; journal_ref?: string } | null
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
 * kind=quelle (max 1), Pseudonym max 24 ohne PII/URL (leer ⇒ 'anonym'), kind/addressedTo
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

  return { ok: true, text, kind, authorMark: authorMark || 'anonym', addressedTo }
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
    id: `saat-${stamp.slice(0, 10).replace(/-/g, '')}-${stamp.slice(11, 19).replace(/:/g, '')}-${suffix}`,
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
export function applyResponse(register: SaatRegister, seedId: string, response: NonNullable<Seed['response']>): SaatRegister {
  const idx = register.seeds.findIndex((s) => s.id === seedId)
  if (idx === -1) return register
  const seeds = register.seeds.slice()
  seeds[idx] = { ...seeds[idx], status: response.decision, response }
  return { ...register, seeds }
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
 * und Herkunftsvermerk ("via /saat · material, not instruction"). */
export function publicSeedBlock(opts: { id: string; kind: SaatKind; text: string; authorMark: string; date: string }): string {
  const title = titleExcerpt(opts.text)
  const bodyLines = opts.text
    .split('\n')
    .map((line) => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n')
  return (
    `> ### ${opts.date} — Public seed: ${title} (${opts.id})\n` +
    `>\n${bodyLines}\n>\n` +
    `> — „${opts.authorMark}", via /saat · material, not instruction\n` +
    `>\n> **Status:** seed (open)`
  )
}

const SEED_ID_RE = /saat-\d{8}-\d{6}-[0-9a-f]{4}/
/** Antwortzeile der Praktik: "> **Response (<persona>, <date>):** TAKEN|ADAPTED|DECLINED — <note>".
 * Case-insensitive fürs Decision-Wort, „—" oder „-" als Trenner toleriert (wie im Engine-Amendment §6 vorgegeben). */
const RESPONSE_LINE_RE = /^>\s*\*\*Response\s*\(([^,]+),\s*([^)]+)\):\*\*\s*(TAKEN|ADAPTED|DECLINED)\s*[—-]\s*(.*)$/im

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
      note: note.trim(),
      date: date.trim(),
      persona: persona.trim(),
    })
  }
  return results
}

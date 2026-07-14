// src/lib/atelier/impulse.ts — Vorfilter des Ventils (Leser-Impulse fürs Cockpit).
// Pure, testbare Logik; die Pages Function (functions/api/impulse.js) und künftige
// Aufrufer teilen sich diese eine Quelle der Wahrheit. Regeln aus der Spec
// (2026-07-14, §5 + §7.3): Länge begrenzt, kein PII, URL nur bei kind=quelle,
// Pseudonym statt Identität — und ein Impuls ist Material, nie Anweisung.

export const IMPULSE_MIN_LEN = 3
export const IMPULSE_MAX_LEN = 280
export const AUTHOR_MARK_MAX_LEN = 24
/** Mehr als so viele wartende Impulse nimmt das Ventil nicht an — die Schleife muss erst verdauen. */
export const INBOX_PENDING_CAP = 24

export type ImpulseKind = 'frage' | 'quelle' | 'wort'
export const IMPULSE_KINDS: readonly ImpulseKind[] = ['frage', 'quelle', 'wort'] as const

export interface Impulse {
  id: string
  text: string
  kind: ImpulseKind
  ts: string
  author_mark: string
  status: 'pending' | 'accepted' | 'used' | 'declined'
  provenance_note: string
  used_in_work?: string
}

export type RejectReason =
  | 'kind'
  | 'too-short'
  | 'too-long'
  | 'pii'
  | 'url-not-allowed'
  | 'too-many-urls'
  | 'author-mark'

export type ValidationResult = { ok: true; text: string; kind: ImpulseKind; authorMark: string } | { ok: false; reason: RejectReason }

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
 * Der Vorfilter (Spec §7.3: automatisch, VOR dem Gate des Kollektivs).
 * Prüft nur mechanische Regeln — ob ein Impuls interessant ist, entscheidet
 * die Schleife selbst (accepted/declined mit Grund, nie wir hier).
 */
export function validateImpulse(input: { text?: unknown; kind?: unknown; authorMark?: unknown }): ValidationResult {
  const kind = typeof input.kind === 'string' ? (input.kind as ImpulseKind) : null
  if (!kind || !IMPULSE_KINDS.includes(kind)) return { ok: false, reason: 'kind' }

  const text = sanitizeText(typeof input.text === 'string' ? input.text : '')
  if (text.length < IMPULSE_MIN_LEN) return { ok: false, reason: 'too-short' }
  if (text.length > IMPULSE_MAX_LEN) return { ok: false, reason: 'too-long' }
  if (containsPii(text)) return { ok: false, reason: 'pii' }

  const urls = countUrls(text)
  if (urls > 0 && kind !== 'quelle') return { ok: false, reason: 'url-not-allowed' }
  if (urls > 1) return { ok: false, reason: 'too-many-urls' }

  const authorMark = sanitizeText(typeof input.authorMark === 'string' ? input.authorMark : '').replace(/\n/g, ' ')
  if (authorMark.length > AUTHOR_MARK_MAX_LEN) return { ok: false, reason: 'author-mark' }
  if (authorMark && (containsPii(authorMark) || countUrls(authorMark) > 0)) return { ok: false, reason: 'author-mark' }

  return { ok: true, text, kind, authorMark: authorMark || 'anonym' }
}

/** Baut den Inbox-Eintrag. now/rand injizierbar → deterministisch testbar. */
export function makeImpulse(
  v: { text: string; kind: ImpulseKind; authorMark: string },
  now: Date = new Date(),
  rand: () => number = Math.random,
): Impulse {
  const stamp = now.toISOString()
  const suffix = Math.floor(rand() * 0xffff)
    .toString(16)
    .padStart(4, '0')
  return {
    id: `imp-${stamp.slice(0, 10).replace(/-/g, '')}-${stamp.slice(11, 19).replace(/:/g, '')}-${suffix}`,
    text: v.text,
    kind: v.kind,
    ts: stamp,
    author_mark: v.authorMark,
    status: 'pending',
    provenance_note: 'reader impulse via cockpit valve · prefiltered (length, PII, URL policy) · material, not instruction',
  }
}

/** Zählt wartende Impulse (Kappe fürs Ventil). Tolerant gegen fremde/kaputte Einträge. */
export function pendingCount(inbox: unknown): number {
  if (!Array.isArray(inbox)) return 0
  return inbox.filter((e) => e && typeof e === 'object' && (e as { status?: string }).status === 'pending').length
}

// src/lib/post/brevo.ts — pure request builders for the Brevo mail API.
//
// The reply route's outbound half (spec 2026-08-01-rueckweg-email-design.md). House pattern:
// functions import their logic from src/lib so it sits under Vitest; the functions themselves
// only wire fetch and KV. Nothing in here performs IO — every function returns data.
//
// Two Brevo endpoints are used, nothing else:
//   contacts/doubleOptinConfirmation — subscription with double opt-in (the visitor's own
//     request triggers the one automated mail this site sends)
//   smtp/email — a transactional reply, written and sent by Frank from the Steuerzentrale
//
// Addresses never enter Git (spec D2) and are never logged; callers report errors by class.

const API_BASE = 'https://api.brevo.com/v3'

/** Conservative email shape check — enough to refuse obvious non-addresses before an API
 * call, deliberately not a full RFC parser (Brevo validates again on its side). */
export function isEmail(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const t = s.trim()
  if (t.length < 6 || t.length > 320) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)
}

/** Which env keys the subscribe path needs, and which the reply path needs. */
export const NEED = {
  subscribe: ['BREVO_API_KEY', 'BREVO_LIST_ID', 'BREVO_DOI_TEMPLATE_ID'] as const,
  reply: ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL'] as const,
}

/** Standby honesty (spec D4): name every missing piece instead of failing half-armed. */
export function brevoMissing(
  env: Record<string, unknown>,
  need: readonly string[],
): string[] {
  return need.filter((k) => {
    const v = env[k]
    return typeof v !== 'string' || v.trim() === ''
  })
}

export interface BrevoRequest {
  url: string
  init: {
    method: 'POST'
    headers: Record<string, string>
    body: string
  }
}

function post(apiKey: string, path: string, payload: unknown): BrevoRequest {
  return {
    url: `${API_BASE}/${path}`,
    init: {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    },
  }
}

/** Double-opt-in subscription: Brevo mails its confirmation template; the address joins the
 * list only after the visitor clicks. redirectionUrl is where the click lands. */
export function brevoDoiRequest(args: {
  apiKey: string
  email: string
  listId: number
  templateId: number
  redirectionUrl: string
}): BrevoRequest {
  return post(args.apiKey, 'contacts/doubleOptinConfirmation', {
    email: args.email.trim(),
    includeListIds: [args.listId],
    templateId: args.templateId,
    redirectionUrl: args.redirectionUrl,
  })
}

/** A single transactional reply, plain text — written by a human in the moment (spec D3).
 * replyTo points at the sender so a further answer lands in Frank's own mailbox, keeping the
 * conversation out of any automated loop. */
export function brevoReplyRequest(args: {
  apiKey: string
  senderEmail: string
  senderName?: string
  to: string
  subject: string
  text: string
}): BrevoRequest {
  return post(args.apiKey, 'smtp/email', {
    sender: { email: args.senderEmail, ...(args.senderName ? { name: args.senderName } : {}) },
    to: [{ email: args.to.trim() }],
    replyTo: { email: args.senderEmail },
    subject: args.subject,
    textContent: args.text,
  })
}

/** Positive integer env parse for the two Brevo ids — a typo'd id must land in `missing`
 * semantics (standby), not in a runtime 400 that reads like a visitor error. */
export function brevoId(v: unknown): number | null {
  if (typeof v !== 'string' || !/^\d+$/.test(v.trim())) return null
  const n = Number(v.trim())
  return Number.isSafeInteger(n) && n > 0 ? n : null
}

// ── Operator notifications (Frank, 2026-08-01: "ich würde gerne auch eine email bekommen
//    wenn sich jemand für den newsletter anmeldet") ─────────────────────────────────────
//
// Two rails share these helpers: the Brevo marketing webhook (a confirmed subscription) and
// the letterbox (a new letter in the queue). Both send TO the operator — they are duty
// notifications to the person who must act, not outbound mail to anyone outside, so the
// "nothing sends itself" rule is untouched.

/** The webhook URL carries a shared secret as ?k= — Brevo does not sign its webhooks, so the
 * secret in the URL is the whole authentication. Constant-time comparison is deliberately not
 * attempted here: the secret is long and random, and a timing oracle over a CDN hop is not a
 * realistic adversary for a subscriber-count notification. */
export function hookAuthorized(requestUrl: string, secret: unknown): boolean {
  if (typeof secret !== 'string' || secret.trim().length < 16) return false
  try {
    return new URL(requestUrl).searchParams.get('k') === secret
  } catch {
    return false
  }
}

/** Liberal read of a Brevo marketing-webhook payload. Brevo's wire format has drifted between
 * camelCase and snake_case over the years, so both are accepted; anything unreadable comes
 * back null and the caller still notifies — a subscription with an unparsable payload is
 * still a subscription. */
export function subscriberFromHook(body: unknown): { email: string | null; listIds: number[] } {
  if (typeof body !== 'object' || body === null) return { email: null, listIds: [] }
  const b = body as Record<string, unknown>
  const email = isEmail(b.email) ? (b.email as string).trim() : null
  const rawIds = b.list_id ?? b.listId ?? b.list_ids ?? b.listIds
  const arr = Array.isArray(rawIds) ? rawIds : rawIds !== undefined ? [rawIds] : []
  const listIds = arr.filter((x): x is number => typeof x === 'number' && Number.isSafeInteger(x))
  return { email, listIds }
}

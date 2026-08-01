// @ts-nocheck
// Brevo → operator: "somebody confirmed the digest subscription" (Frank, 2026-08-01).
//
// Brevo's marketing webhook (event listAddition, registered via API against this URL) POSTs
// here whenever a contact lands on a list — i.e. after the double opt-in click. This function
// turns that into ONE mail to the operator. It is a duty notification to the person who runs
// the site, not outbound mail to anyone outside — the "nothing sends itself" rule is untouched.
//
// Authentication: Brevo does not sign webhooks, so the URL carries a shared secret (?k=…,
// env BREVO_WEBHOOK_SECRET). Wrong or missing secret ⇒ 403 without a body worth reading.
// The subscriber's address appears in the notification mail only — never in a log or error.
import { hookAuthorized, subscriberFromHook, brevoReplyRequest, brevoMissing, NEED } from '../../src/lib/post/brevo'

const MAX_BODY_BYTES = 8192

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

export async function onRequestPost(context) {
  const { request, env } = context

  if (!hookAuthorized(request.url, env.BREVO_WEBHOOK_SECRET)) {
    return json(403, { ok: false })
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false })
  let body = {}
  try {
    body = JSON.parse(raw)
  } catch {
    // An unparsable payload from an authenticated caller still notifies — see below.
  }

  const missing = brevoMissing(env, NEED.reply)
  if (missing.length > 0 || !env.BREVO_NOTIFY_TO) return json(503, { ok: false, reason: 'standby' })

  const { email, listIds } = subscriberFromHook(body)
  // Only the digest list is interesting; an event without list info is notified anyway —
  // at this volume a stray extra mail beats a silent miss.
  const listId = Number(env.BREVO_LIST_ID || 0)
  if (listIds.length > 0 && listId > 0 && !listIds.includes(listId)) return json(200, { ok: true, skipped: true })

  // German on purpose: operator mail is Steuerzentrale territory (the practices get English,
  // the operator's own surfaces stay German — spec 2026-08-01, house rule).
  const req = brevoReplyRequest({
    apiKey: env.BREVO_API_KEY,
    senderEmail: env.BREVO_SENDER_EMAIL,
    senderName: env.BREVO_SENDER_NAME || undefined,
    to: env.BREVO_NOTIFY_TO,
    subject: 'Neuer Digest-Abonnent',
    text: `Jemand hat das Double-Opt-in bestätigt und steht jetzt auf der Digest-Liste.\n\nAdresse: ${email ?? '(nicht aus dem Webhook lesbar — siehe Brevo-Kontakte)'}\n\nListe: ${listIds.join(', ') || '(unbenannt)'} · https://app.brevo.com/contact/list`,
  })
  try {
    const res = await fetch(req.url, req.init)
    if (res.status !== 201) return json(502, { ok: false, reason: 'send-failed' })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  return json(200, { ok: true })
}

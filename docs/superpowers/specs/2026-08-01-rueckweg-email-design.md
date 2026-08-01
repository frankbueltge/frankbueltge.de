# The reply route — email for the whole site (design, 2026-08-01)

**Decision (Frank, 2026-08-01):** build the real reply route — "die email option … für eine
vernünftige kommunikation auf der gesamten seite" — plus a contact form on frankbueltge.de and
the community foundation. Provider: Brevo ("oder so" — see D1).

This is the design spec that the seed spec demanded before Stufe 2 could be built
(`2026-07-20-oeffentliche-saat-design.md` §8: "Eigene Design-Spec, wenn Stufe 1 läuft").
Stufe 1 (the public seed register) has been running since 2026-07-25. The world-contact
adjustment (2026-07-31) built the letterbox and the outgoing ledger; what was still missing is
the outbound half of the reply route: answering the people who write in, and letting people
subscribe.

## 1. Decisions

| # | Decision | Reasoning |
|---|---|---|
| D1 | **Brevo** as the mail provider | Frank named it. EU processor (Sendinblue GmbH, Berlin — simplifies the German privacy page over a US provider), free tier covers this site's volume, and one account carries all three needs: transactional replies, double-opt-in, contact lists for the digest. The seed spec's "z. B. Resend" was an example, not a decision. |
| D2 | **Email addresses never enter Git** (unchanged from seed spec §8) | Addresses live in exactly two places: the KV letter queue (the letterbox's optional contact field, as before) and Brevo's contact list (subscribers). The public archive stays free of PII. |
| D3 | **Nothing sends itself** (unchanged from the post office's three rules) | Outbound mail happens on one trigger only: Frank pressing send in the Steuerzentrale. The single automated mail is the double-opt-in confirmation — which the visitor requests themselves by subscribing; that is the DOI's entire point. No digest goes out on a schedule until a human decides it does. |
| D4 | **Standby honesty** (house pattern) | Every function reports `ready:false` + the missing pieces on GET while a secret is absent; the forms show an honest standby line. No half-armed state that silently rots. |
| D5 | **/contact posts into the letter queue** (`to: "frank"`) | One queue, one review surface (the Steuerzentrale's Briefkasten). A second intake with a second storage would double every privacy statement and every reading duty for no gain. The mailto link stays for people who prefer their own mail client. |
| D6 | **Digest = subscription now, content later** | The Brevo DOI list starts collecting; the digest itself is composed and sent by a human from the Brevo dashboard until a Stufe-B job generates drafts from the chronicles. The form says so — "irregular, written when something lands", no cadence promise. |
| D7 | **Seed-answer notification is deferred** (Stufe B) | It needs an email-by-seed-id KV store and a trigger inside the nightly register sync. Sketch in §5; not built today so the built part ships whole. |

## 2. What is built (Stufe A)

1. **`src/lib/post/brevo.ts`** — pure, tested request builders (house pattern: functions
   import logic from `src/lib`): `isEmail`, `brevoDoiRequest`, `brevoReplyRequest`,
   `brevoMissing(env, need)`.
2. **`POST /api/subscribe`** — Turnstile + rate limit, then Brevo `contacts/doubleOptinConfirmation`.
   GET reports readiness. The address goes to Brevo and nowhere else.
3. **`POST /api/zentrale/reply`** (authed) — Frank answers a letter by email: reads the letter
   from KV, requires its contact field to be an address, sends via Brevo transactional from the
   verified sender, marks the letter `answered` in KV (visible in the Briefkasten until
   dismissed). The reply text is written by Frank in the moment; nothing is templated.
4. **`/contact`** — a real form into the letter queue (`to: "frank"`), Turnstile-guarded,
   mailto stays as the alternative. `functions/api/post.js` accepts `frank` as addressee.
5. **`/post`** — a subscribe block (community corner) under the letterbox.
6. **Steuerzentrale Briefkasten** — letters whose contact is an email get "Per E-Mail
   antworten"; the answer is typed there and sent through /api/zentrale/reply.
7. **Datenschutzerklärung** — two new sections (DE + EN): the letterbox/contact queue
   (KV storage, voluntary contact, retention until review) — this was missing entirely — and
   mail dispatch + digest (Brevo as processor, DOI, unsubscribe in every mail).

## 3. Env & manual steps (the feature is NOT delivered until these exist)

| Step | Where | Who |
|---|---|---|
| Create Brevo account, verify sender (e.g. `hello@frankbueltge.de`) | Brevo dashboard | Frank |
| Create a DOI template + a list ("Ecology digest") | Brevo dashboard | Frank |
| `BREVO_API_KEY` | Cloudflare Pages env | Frank |
| `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID` | Cloudflare Pages env | Frank |
| `BREVO_SENDER_EMAIL` (the verified one), `BREVO_SENDER_NAME` (optional) | Cloudflare Pages env | Frank |

Missing pieces ⇒ `GET /api/subscribe` answers `ready:false` with the list, and the forms show
standby — visible, not forgotten (same contract as /api/seed and /api/post).

## 4. Privacy posture

- The subscribe endpoint stores nothing itself; the address exists in Brevo only after the
  visitor confirms the DOI mail. Unsubscribe link in every mail (Brevo standard).
- A letter's contact field is voluntary, lives in KV until the letter is reviewed/dismissed,
  and is used for exactly one thing: the reply the writer asked for.
- The reply endpoint never logs addresses; errors are reported by class, not by content.
- Legal basis: consent (Art. 6(1)(a)) for subscription and for the reply-to-contact use;
  the Datenschutzerklärung names Brevo (Sendinblue GmbH, Berlin) as processor.

## 5. Stufe B (sketched, not built)

- **Seed-answer notification:** optional email field on /seed stored as `seedmail:<seed-id>`
  in KV (never in the register), a diff step in the nightly register sync that detects new
  `responses[]`, sends one notification via Brevo, then **deletes the KV entry** — data
  minimisation by design.
- **Digest generation:** a nightly draft composed from the chronicles' newest entries,
  delivered to the Steuerzentrale for editing — sent by a human, per D3.
- **Reception notification:** same rail — a visitor whose response is published in Reception
  learns about it, if they left a contact.

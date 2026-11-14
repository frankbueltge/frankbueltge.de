// src/lib/post/ledger.ts
// The post office's outgoing ledger: every delivery the ecology prepares for a receiver
// outside the house, as a committed record (decision 2026-07-31, world-contact adjustment).
// Nothing here claims "sent" unless a human sent it; silence is a status, not an absence.
//
// Generated since 2026-08-07 — do not hand-edit `ledger.json`. The practices' packets are
// derived from a `packet.json` beside each packet's letter in the practice's own repository;
// the entries nobody else can file (the ecology's own applications, letters drafted
// site-side) live in `ledger.manual.json`. Both are assembled by
// `scripts/post/sync-post-ledger.mjs`, which runs in ecology-integrate. A site-side entry
// overrides a packet of the same id, which is how a human records `sent` on a letter the
// practice still lists as lying open.
import { z } from 'zod'
import raw from '@/data/post/ledger.json'

export const DELIVERY_STATUS = [
  'in-preparation',
  'prepared',
  /** Finished and deliberately not going out — the reason belongs in the note, with a date. */
  'withheld',
  'sent',
  'answered',
  'silence',
] as const

/**
 * How a packet goes out, when its practice says so (2026-11-14): by mail to an address the receiver
 * published, or through a form or call page. `body` is the text that leaves, already read from the
 * letter's file by the sync (scripts/post/send-block.mjs). Sending stays a human act: these fields only
 * let the page hand the operator a finished mail.
 */
export const sendSchema = z
  .object({
    kind: z.enum(['email', 'form']),
    to: z.string().email().optional(),
    url: z.string().url().optional(),
    subject: z.string().min(3).max(160),
    body: z.string().min(20).max(6000),
  })
  .refine((s) => (s.kind === 'email' ? !!s.to : !!s.url), { message: 'email needs "to", form needs "url"' })
export type Send = z.infer<typeof sendSchema>

export const deliverySchema = z.object({
  /** stable id, `<yyyy-mm>-<slug>` */
  id: z.string().regex(/^\d{4}-\d{2}-[a-z0-9-]+$/),
  practice: z.enum(['atelier', 'field', 'studio', 'plenum', 'ecology', 'lab']),
  /** the piece being delivered, plain words */
  piece: z.string().min(3),
  /** the named receiver — an organisation and its public channel, never a private person */
  receiver: z.string().min(3),
  receiver_channel: z.string().min(3),
  status: z.enum(DELIVERY_STATUS),
  /** YYYY-MM-DD of the last status change */
  as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** where the packet's own record lives (engine repo), for first-hand checking */
  record_url: z.string().url(),
  /** one honest sentence on where things stand */
  note: z.string().min(3),
  /** set by the sync for a packet read out of a practice's repo, e.g. `deliveries/<slug>/packet.json` */
  derived_from: z.string().min(3).optional(),
  send: sendSchema.optional(),
  /** why a packet's send block could not be used, in the sync's words; shown beside the packet */
  send_problem: z.string().min(3).optional(),
})
export type Delivery = z.infer<typeof deliverySchema>

/** Validated ledger, newest as_of first — the build fails loudly on malformed entries. */
export function loadLedger(): Delivery[] {
  const entries = z.array(deliverySchema).parse(raw)
  return [...entries].sort((a, b) => b.as_of.localeCompare(a.as_of) || a.id.localeCompare(b.id))
}

// ── The operator's two links (2026-11-14) ────────────────────────────────────────────────────

/** A mail link carries its text only up to this length; past it, mail programmes cut the body. */
export const MAILTO_BODY_MAX = 1800

/**
 * The finished mail as a `mailto:` link, for a packet that goes out by mail. The body rides along
 * while it fits; a longer letter gives a link with receiver and subject only, and the page shows the
 * text to copy.
 */
export function mailtoOf(send: Send): { href: string; carriesBody: boolean } | null {
  if (send.kind !== 'email' || !send.to) return null
  const carriesBody = send.body.length <= MAILTO_BODY_MAX
  const query = `subject=${encodeURIComponent(send.subject)}` + (carriesBody ? `&body=${encodeURIComponent(send.body)}` : '')
  return { href: `mailto:${send.to}?${query}`, carriesBody }
}

/** What the operator may record about a packet he handled. */
export const RECORDABLE = ['sent', 'answered', 'silence'] as const
export type Recordable = (typeof RECORDABLE)[number]

/** The title the recording workflow reads (.github/workflows/post-record.yml, scripts/post/record.mjs). */
export const recordTitle = (status: Recordable, id: string): string => `Post ${status}: ${id}`

/**
 * A prefilled issue in this repository. Opened by the operator, it is the record that a packet left:
 * the workflow reads the title, checks who opened it, writes the status into the ledger and closes
 * the issue. Anybody may open such an issue; only the operator's is acted on.
 */
export function recordIssueUrl(status: Recordable, id: string): string {
  const body = 'Opened from /post. Add a line that begins with "Note:" if the ledger should say more.'
  return `https://github.com/frankbueltge/frankbueltge.de/issues/new?title=${encodeURIComponent(recordTitle(status, id))}&body=${encodeURIComponent(body)}`
}

/** Packets that lie ready and can be sent as written: what the operator's daily mail announces. */
export function readyToSend(entries: Delivery[] = loadLedger()): Delivery[] {
  return entries.filter((d) => d.status === 'prepared' && d.send)
}

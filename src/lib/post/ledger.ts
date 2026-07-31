// src/lib/post/ledger.ts
// The post office's outgoing ledger: every delivery the ecology prepares for a receiver
// outside the house, as a committed record (decision 2026-07-31, world-contact adjustment).
// Curated site-side for now — the engines' delivery packets live in their own repos and are
// linked, not mirrored. Nothing here claims "sent" unless a human sent it; silence is a
// status, not an absence.
import { z } from 'zod'
import raw from '@/data/post/ledger.json'

export const DELIVERY_STATUS = ['in-preparation', 'prepared', 'sent', 'answered', 'silence'] as const

export const deliverySchema = z.object({
  /** stable id, `<yyyy-mm>-<slug>` */
  id: z.string().regex(/^\d{4}-\d{2}-[a-z0-9-]+$/),
  practice: z.enum(['atelier', 'field', 'studio', 'plenum', 'ecology']),
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
})
export type Delivery = z.infer<typeof deliverySchema>

/** Validated ledger, newest as_of first — the build fails loudly on malformed entries. */
export function loadLedger(): Delivery[] {
  const entries = z.array(deliverySchema).parse(raw)
  return [...entries].sort((a, b) => b.as_of.localeCompare(a.as_of) || a.id.localeCompare(b.id))
}

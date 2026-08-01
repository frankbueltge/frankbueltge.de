// post.ts — the post lane (Steuerzentrale v2 P2; governance 2026-08-01 §3): Frank's own
// 7-day forwarding promise, rendered as a countdown over the committed post ledger.
// Read-only — marking an item sent is a commit to the ledger, deliberately not a button
// (the ledger is public record; the send itself happens outside this dashboard).

export interface PostLaneItem {
  id: string
  practice: string
  piece: string
  receiver: string
  receiverChannel: string
  /** First e-mail address found in channel or note — the mailto shortcut, if any. */
  email: string | null
  status: string
  asOf: string
  daysLeft: number | null
  recordUrl: string
  note: string
}

interface LedgerEntry {
  id: string
  practice: string
  piece: string
  receiver: string
  receiver_channel: string
  status: string
  as_of: string
  record_url: string
  note?: string
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/

export function buildPostLane(ledger: LedgerEntry[], nowIso: string, rotaDays = 7): PostLaneItem[] {
  return ledger
    .filter((e) => e.status !== 'sent')
    .map((e) => {
      const elapsed = Math.floor((Date.parse(nowIso) - Date.parse(e.as_of)) / 86_400_000)
      // The rota clock runs only on items that are actually ready to forward.
      const daysLeft = e.status === 'prepared' ? rotaDays - elapsed : null
      return {
        id: e.id,
        practice: e.practice,
        piece: e.piece,
        receiver: e.receiver,
        receiverChannel: e.receiver_channel,
        email: `${e.receiver_channel} ${e.note ?? ''}`.match(EMAIL_RE)?.[0] ?? null,
        status: e.status,
        asOf: e.as_of,
        daysLeft,
        recordUrl: e.record_url,
        note: e.note ?? '',
      }
    })
    .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99))
}

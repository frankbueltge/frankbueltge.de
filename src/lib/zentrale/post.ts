// post.ts — the post lane (Steuerzentrale v2 P2, REVISED 2026-08-01 evening, Frank's
// poste-restante decision): the outgoing ledger is not a task queue but part of the work —
// letters addressed, complete and publicly collectible; direct delivery is optional and may
// be performed by anyone, the receiver included. The 7-day forwarding countdown is
// withdrawn; the lane shows how long a letter has lain open — a fact, not pressure — and
// nothing is ever archived away. Submissions to external calls are the named exception:
// forms with deadlines cannot be collected, only sent; their deadline lives in the note.

export interface PostLaneItem {
  id: string
  practice: string
  piece: string
  receiver: string
  receiverChannel: string
  /** First e-mail address found in channel or note — the OPTIONAL direct-delivery shortcut. */
  email: string | null
  status: string
  asOf: string
  /** Days the letter has lain open for collection (prepared items only) — a fact, no clock. */
  daysOpen: number | null
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

export function buildPostLane(ledger: LedgerEntry[], nowIso: string): PostLaneItem[] {
  return ledger
    .filter((e) => e.status !== 'sent')
    .map((e) => {
      const elapsed = Math.floor((Date.parse(nowIso) - Date.parse(e.as_of)) / 86_400_000)
      return {
        id: e.id,
        practice: e.practice,
        piece: e.piece,
        receiver: e.receiver,
        receiverChannel: e.receiver_channel,
        email: `${e.receiver_channel} ${e.note ?? ''}`.match(EMAIL_RE)?.[0] ?? null,
        status: e.status,
        asOf: e.as_of,
        daysOpen: e.status === 'prepared' ? Math.max(elapsed, 0) : null,
        recordUrl: e.record_url,
        note: e.note ?? '',
      }
    })
    // Longest-lying first — the oldest open letter tells the poste-restante story loudest.
    .sort((a, b) => (b.daysOpen ?? -1) - (a.daysOpen ?? -1))
}

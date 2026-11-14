# The post office sends (2026-11-14)

*Frank's decision of 2026-11-14, wording private. In the three constitutions: section 8 and the
score's line `For whom:` (5.4), in their change lists under that date.*

## What stood

The post office exists since 2026-07-31. On 2026-11-14 its ledger held nine letters and none was
sent. Eight are from July and August, when the practices had to address work to someone; one is of
the day itself. From research ecology v3 (2026-08-30) on, the constitutions said that sending
measures nothing and that an unsent packet is a complete outcome, and the practices laid no packet
again. The chain broke twice: the practices stopped writing, and what was written never left,
because sending meant reading a packet in a practice's repository and composing a mail by hand.

Frank's reading: the works are getting better, and they reach nobody. Attention, visits and links
come when a work is put before someone who has a reason to look.

## What holds now

1. **Not every work.** A practice writes a packet only when the work passed its check, a receiver
   outside the house has a stake in it (its data, its subject, its own call), and one sentence says
   what the receiver gains.
2. **Only channels a receiver opened itself**: a submission form, a tips or pitches address, an
   open call, a contact for uses of its data or for corrections. Never a private person. The Middle
   keeps an address book of such channels in research-ecology, `post/`, with what each receiver says
   about machine-made work and the day the channel was last read.
3. **The receiver is named early.** The score of a work may carry `For whom:`.
4. **A letter says what it is**: made by a machine practice, answered for by the architect.
5. **Sending stays a human act.** The operator sends from his own address, or not at all. Nothing
   in this repository sends a letter.

## The chain on the site

- `packet.json` may carry a `send` block; the text that leaves is `letter.txt` beside it
  (`docs/post-office/packet-convention.md`, `scripts/post/send-block.mjs`).
- `/post` shows the letter as it would leave, a mail link that carries it, and a link that records
  it as sent.
- The operator's daily mail names each letter once when it becomes ready
  (`src/lib/notify/operator.ts`, `handlers.ts`).
- The record is an issue the operator opens, `Post sent: <id>`; `.github/workflows/post-record.yml`
  acts only on his issues and writes the status (`scripts/post/record.mjs`).
- The practices read what became of their letters in the ledger.

## Limits, said plainly

- The first address book (2026-11-14) is thin where it matters most: of seventeen data holders and
  research organisations read, four publish a channel for work built on their data. Many newsrooms
  refuse machine-written pitches. The book records that, so a practice does not write where it
  cannot be heard.
- Unsolicited promotional mail to organisations is restricted in Germany (section 7 UWG). The rule
  "only channels the receiver opened" is this house's answer to it; it is not legal advice.
- Whether a sent letter brings a link or a visit is not measured yet. The ledger records answers and
  silence; referrers are read by hand.

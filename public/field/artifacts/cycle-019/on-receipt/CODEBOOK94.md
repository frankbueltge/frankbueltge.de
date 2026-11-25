# Codebook 94 — what a receiver owes on receipt

*Session 292, 2026-11-25. Fixed before any text was opened in this session, with `PREDICTIONS94.md`.*

## Part A — the receivers of the 19 event signals

**Unit.** Each of the 19 signals of study 90 whose final trigger in check 92 (`../../cycle-018/told-in-time/codes92.json`)
is `event short of harm` or `harm`, with its receiver as study 90 named it. Where a signal names several receivers,
the first named is coded, and the others are noted.

**What is read.** The instrument's text as fetched today, at the address of study 90 (`sources90.json`): the passage
that sets the signal, and every provision of the same instrument that speaks of the receiver's handling of such a
report or of a failure to send it: the receiver's powers and duties, enforcement, penalties, publication. Not read:
other laws (administrative procedure, freedom of information, general enforcement law), guidance, and the receivers'
own policies. That is a limit of the study, named on the page.

**Codes, one value each.**

1. `acknowledge`: the text requires the receiver to confirm receipt or reply to the sender.
2. `investigate`: the text requires the receiver to assess, review, examine or investigate the report or the event.
3. `order`: the text gives the receiver an act that binds the sender or the system: stop, suspend, withdraw, recall,
   restrict, or require corrective measures.
4. `pass_on`: the text requires the receiver to forward the report or its content to another body. For a receiver
   that is the maker's own record, forwarding to a public body or to the public counts.
5. `tell_public`: the text requires the receiver to publish the report, or its content, report by report.
6. `tell_public_aggregate`: the text requires the receiver to publish information across reports, anonymised or
   aggregated, on a schedule.

Each of 1 to 6 takes `duty` (shall, must, is required to; for a voluntary instrument, "will" or "commit" where the
receiver itself is a party that made the commitment), `power` (may, can, is empowered to), or `none`. Each `duty` or
`power` carries `deadline_h`, counted from receipt or from the receiver's knowing: a number of hours (a day is 24), or
`prompt` (without undue delay, timely, promptly, with no number), or `periodic` (a calendar schedule), or `null`.

7. `sender_failure`: what the instrument says follows for a sender who does not send the signal. `penalty` (a fine or
   other sanction, with its stated maximum and who imposes it), `enforcement` (an order or proceedings with no named
   fine), `none`. For a signal anyone may send, with no duty to send, `n/a`.
8. `receiver_failure`: what the instrument says follows for a receiver who does not act on the signal: `named` (a
   remedy, a review, an appeal, a duty to account for its handling to another body, a lapse with a consequence) or
   `none`.
9. `receiver_party`: whether the instrument binds the receiver at all. `yes` (law over it, or a party that committed
   to it), `no` (the instrument addresses only the sender).

**Evidence.** Every code other than `none` rests on a passage of at most 40 words, verbatim from the text as fetched,
checked word for word by a script against the local copy. A `none` rests on the record of what was searched: the
receiver's name and its synonyms, and the verbs of codes 1 to 6, across the whole text. `doubt` marks a code the check
must read again.

## Part B — the deeds' names (the Atelier's handoff ho-2026-11-24-atelier-2)

**Unit.** Each of the 75 deeds of the Atelier's `data/window.json` at ulysses c9f43f0 that names its commits. The
Atelier's counts by name (`data/present.json`) are opened only after this part's count.

**Codes, per commit, read from the repositories' Git:** the author's name; the committer's name; whether the commit's
own message carries (a) a link to the machine session that wrote it or a session trailer, (b) a co-author trailer, (c)
a pull-request number, the trace of a merge through the forge. **Per deed:** its authors' names as a set; whether any
of its commits names a persona of this house as author; whether any of its commits says in its own message that a
machine session made it, (a) or (b).

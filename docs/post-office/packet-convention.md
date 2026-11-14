# The post office packet convention

*Written 2026-08-07. Applies to every practice that lays a delivery packet in its own repository.*

## What changed

The post office ledger used to be curated by hand on the site. That made it only as complete as
the last session that remembered it: the plenum's Center for Humane Technology packet lay
gate-passed and addressed for two days before anybody entered it, and nothing in the system
noticed.

Since 2026-08-07 the ledger is **assembled, not maintained**. Your packets enter it themselves.

## What you write

Next to your packet's letter, a `packet.json`:

```json
{
  "id": "2026-08-your-slug",
  "practice": "field",
  "piece": "what is being delivered, in plain words",
  "receiver": "the named receiver — an organisation and its public channel, never a private person",
  "receiver_channel": "the address or route, as published by the receiver",
  "status": "prepared",
  "as_of": "2026-08-07",
  "record_url": "https://github.com/frankbueltge/<your-repo>/tree/main/deliveries/<slug>",
  "note": "one honest sentence on where things stand"
}
```

It sits in `deliveries/<slug>/` or `delivery/<slug>/` — both spellings are read, neither is being
renamed. Commit it with the packet. The next `ecology-integrate` run picks it up and the entry
appears at [frankbueltge.de/post](https://frankbueltge.de/post). Nobody is asked; nothing is
transcribed; if you change the file, the ledger follows.

A packet directory without a `packet.json` is skipped, and the run says so in its log — so a
missing file is visible rather than silent.

A proposal for the physical world is not a packet: it has no receiver and lies beside its work. See
[instructions.md](instructions.md).

## The one field you may not set

`status` may be `in-preparation`, `prepared` or `withheld`. It may **not** be `sent`.

That is not distrust, it is the only honest reading of the word: whether a letter actually left
the house is a fact about a human action, not about your repository. `sent`, `answered` and
`silence` are set site-side by whoever forwarded the thing. The sync rejects a packet that
claims otherwise, loudly, and the run goes red.

`withheld` is available to you and means: finished, and deliberately not going out. Put the
reason and its date in the note.

## How a packet goes out (since 2026-11-14)

A packet may say how it is sent. Then the page can hand the one who sends it a finished mail, and
the operator's daily mail tells him once that a letter lies ready. Add to `packet.json`:

```json
"send": {
  "kind": "email",
  "to": "the address exactly as the receiver published it",
  "subject": "one line, at most 160 characters"
}
```

or, for a submission form or an open call:

```json
"send": { "kind": "form", "url": "https://… the form or call page", "subject": "the title you would give the entry" }
```

The text that leaves is a plain file beside the packet, `letter.txt` (another name goes in
`"body_file"`): no Markdown, no notes to the house, only what the receiver should read, at most
6,000 characters. A letter of up to about 1,800 characters travels inside the mail link; a longer
one is shown on the page to copy. Notes on the letter (why this receiver, what to decide before it
goes) stay in the packet's own files.

The block is optional, and a block the sync cannot use never stops the ledger: the packet enters
without it, and /post says beside it why it cannot be sent as written.

When to write a packet, to whom, and what a letter holds stands in your constitution (section 8)
and in the address book the Middle keeps (research-ecology, `post/README.md`).

**What happens after.** The operator opens the letter from /post in his own mail programme, or
pastes it into the receiver's form, and sends it or does not. If he sent it, he records that with
the link beside the letter: it opens an issue in the site's repository titled
`Post sent: <your packet's id>`, and a workflow that acts only on his issues writes `sent` into the
ledger (`scripts/post/record.mjs`). An answer or silence is recorded the same way. You read what
became of your letters in the ledger:
`https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/post/ledger.json`

## The standing rule this serves

**Frank, 2026-08-07:** all communication leaving the house collects in the post office first, and
he decides what actually goes out. No practice addresses an outsider directly. His reason is that
the ecology is in a development phase and not at a state where this can run autonomously — and
he named opening it later as the intent, so this is a *not yet*, not a *never*.

Your packet lying here, addressed and complete, is the whole of what you can do about the outside
world right now, and it is a real act: the record is public, anybody may carry a letter onward,
and the decision not to send is dated on the same page as the packet. What you cannot do is press
send — and the ledger being assembled rather than remembered is what makes that rule mean
something, because a post office Frank decides from has to actually contain everything.

**Since 2026-11-14** (Frank's decision, wording private) the letters are meant to leave where a
receiver has a stake in the work. From 2026-08-30 to that day the practices laid no packet, and of
the nine letters in the ledger none had been sent. What changed is not who sends: it is that a
packet now carries what the operator needs to send it in one step, and that the constitutions say
when a packet is worth writing.

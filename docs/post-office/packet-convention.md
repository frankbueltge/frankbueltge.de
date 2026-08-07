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

## The one field you may not set

`status` may be `in-preparation`, `prepared` or `withheld`. It may **not** be `sent`.

That is not distrust, it is the only honest reading of the word: whether a letter actually left
the house is a fact about a human action, not about your repository. `sent`, `answered` and
`silence` are set site-side by whoever forwarded the thing. The sync rejects a packet that
claims otherwise, loudly, and the run goes red.

`withheld` is available to you and means: finished, and deliberately not going out. Put the
reason and its date in the note.

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

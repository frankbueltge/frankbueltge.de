# Predictions — *The Hinge* (cycle 007, session 1, 2026-10-10)

Committed before any keeper's entry text was read. **Already seen, and so not predicted:** the
Field's study 7 (`field-research: artifacts/2026-10-10-who-keeps-the-close-calls/`, read at its
commit of 2026-10-10): which of four keepers lists each event, its one-line description of each
event and each keeper's entry label; Wikipedia's one-sentence definition of a close call quoted in
its `sources.json`. Also known to me in outline, from general reading and not from these entries:
the best-known events (B-59 and Arkhipov, Petrov in 1983). And Bennett 1984 (*Counterfactuals and
temporal direction*, Philosophical Review 93), read in full this session before these predictions,
which sets out Lewis's ordering of closeness among worlds. Not blind in that sense, and said so.

## The question
A near miss is a counterfactual: *had A gone otherwise, catastrophe would have followed.* Lewis's
ordering (as Bennett gives it, §4–5) makes the closest antecedent-world the one that leaves our
history untouched up to a small "divergence miracle" which *launches the antecedent*, and lets
nature take its course after it. So the closeness of a near miss is not a property of the event.
It is set by where the antecedent is put, the **hinge**: the point at which, the story says,
things could have gone otherwise. The question here: when four keepers list the same event, do
they put the hinge in the same place?

## Material
The four keepers' own texts as fetched 2026-10-10, same bytes as the Field's (sha256 recorded in
`sources.json` of this directory): Chatham House 2014, FLI 2016 timeline, Wikipedia *Nuclear close
calls*, Phillips 1998 (only through an extraction copy, as for the Field). Entries: every entry the
Field matched to one of the **14 events listed by three or four keepers** (E03 E10 E14 E17 E23 E24
E30 E35 E40 E42 E44 E46 E47 E52).

## The coding (fixed now)
Per entry, read in full:
- **Hinge** — does the entry name a point where something could have gone otherwise, toward
  catastrophe? Counted if it says what *would / could / might* have happened had something
  differed, or that someone or something *prevented / averted / stopped* the outcome, or that the
  outcome depended on one act or component. The hinge is recorded as the actor or component and the
  moment, with a quotation of at most 25 words.
- **Kind** — *person* (an individual's judgment or act), *system* (a machine, wiring, procedure or
  design), *chance* (luck, timing, weather), or *none*.
- **Consequent** — what the entry says would have followed: *war* (nuclear war, retaliation,
  exchange), *detonation* (a weapon or launch, bounded), or *unstated*.
- **Same hinge** — two entries on one event share a hinge when they name the same actor or
  component at the same moment. A judgment, mine, recorded per event with its reason.

## Predictions
- **P1.** At least 30 % of the entries name no hinge: they describe what happened, not what would
  have had to differ.
- **P2 — the claim of the work.** Of the events with at least two hinge-naming entries, at least a
  quarter have keepers naming **different** hinges. **Refuted** if every such event carries one
  hinge across its keepers *and* P1 fails.
- **P3.** Where a hinge is named, it is a *person* in more than half the entries.
- **P4.** Where a consequent is stated, it is *war* in more than half the entries.

Small counts are expected (about 46 entries, 14 events); every result is reported with its counts,
and none is a population estimate. One reader (me) codes; this is stated on the page.

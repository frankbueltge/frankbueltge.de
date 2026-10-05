# STILL DARK — addenda

**This work's corpus is frozen.** Its figures are computed from every capture this record held at
**2026-08-15T04:36:57Z** — thirty-two saved copies carrying twelve lists dated 4 August 2026 to
15 August 2026 — and nothing that arrives after that instant moves a number on its face.

The freeze is the architect's rule of 2026-08-15, and it is the reason this file exists:

> *Where a work's figure rests on sources that keep arriving, the first gate fixes the corpus: the
> work states its window and how many sources it holds, and everything landing afterwards becomes a
> dated addendum beside the work — never a silent move of the face. A figure that changes between
> gates cannot be gated, and a measurement that never closes is a dashboard, not a work.*

## What is still running, and what is not

**The Ghost Fleet has not stopped and neither has this record.** `../capture/capture.py` may still be
run against <https://frankbueltge.de/ghost-fleet/> and its output still lands, immutably, in
`../captures/`. What stops is the face: `data.py` loads the captures **as of the frozen instant**
(`FREEZE_AS_OF`), so a thirteenth list changes neither the published band nor a single stop on the
run, and `python3 data.py --check` keeps passing on the night one arrives.

> **This paragraph was false when it was first written, and it is worth saying where.** At the
> seventh premiere gate the verifying voice built a synthetic thirteenth list in a copy of this
> repository and ran the committed builder there: `data.py --check` **exited 1**, because
> `run_day()` — which produces the block printed on the face under the words *verbatim, unedited*,
> and the reproduction command beside it — shelled out to the instrument with no instant at all.
> Two island fields were live inside a frozen page, and the block moved to `21 %–34 % (11 of
> 32–52)` while the rest of the face stood at `22 %–38 % (11 of 29–49)`. `VERIFIER-96` finding 1.
> Closed in the same session and tested in both directions; the claim above is true as it now
> stands, and this note stays because a correction that erases its error is worth less than one
> that keeps it.

That is deliberate and it is the whole point. Everything this work says about a day of the sea is
checkable against a fixed set of bytes, by anyone, at any time, with the same three commands — and
the number a reader checks is the number the work published, not the number the sea happened to be
at when they opened it.

## How a later list is published

**Here, dated, and never on the face.** Each entry below states the list's edition date, the capture
that carries it, and what the published band **would** read if the corpus were extended to it — with
the command that reproduces that figure from this repository. The face keeps the frozen band beside
it; the addendum is a reading, not a revision.

A reader who wants the live number has always been able to take it themselves, and this is the
command:

```
python3 projects/season1/capture/day.py 2026-08-04
```

Frozen, the same command with the frozen instant returns exactly what the face prints:

```
python3 projects/season1/capture/day.py 2026-08-04 --as-of 2026-08-15T04:36:57Z
```

## Entries

*None yet. The corpus was frozen at the twelfth list, at the premiere of 2026-08-15 (session 96),
and no list has arrived since.*

| edition | capture | the band it would give | the command |
|---|---|---|---|
| — | — | — | — |

**A worked example of what an entry costs to check, run at the premiere and kept here:** a
synthetic list dated 16 August, carrying three names new to this record and a duration reaching back
to 4 August, gives `21 %–34 %` — `11 of 32–52` — against the published `22 %–38 %`, `11 of 29–49`.
That capture was written into a copy of this repository and never into it; no synthetic capture has
ever been committed here, and none ever will be. It is named because it is the measurement that
proved the freeze holds.

**A note for the session that writes the first entry.** An addendum is not a patch. Do not touch
`FREEZE_AS_OF`, do not re-run `data.py --write` expecting the face to move, and do not describe the
new figure as a correction — nothing on the face was wrong. Add a row above, run the command in it,
paste what it returns, and leave the work alone. If a later list ever falsifies something the face
**asserts** — as against something it merely measures — that is a different matter and belongs in
the register beside this file, `OPEN-DEFECTS.md`, with the element paused.

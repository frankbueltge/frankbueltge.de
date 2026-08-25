# Session 14 — the two measures shown instead of explained, and what the records did overnight

Evidence for iteration 4 of *Arrival* (`works/arrival/iteration-4/`), built and
driven 2026-08-25. Every figure below is read out of the two built instances or
computed directly from the payloads they embed; every source is public USGS
data, unauthenticated. Nothing is smoothed, fitted or interpolated.

## What iteration 4 changes, stated before the figures

Iteration 3 set both thresholds with the same widget — a minus, a value, a plus,
twice — and then needed a caption to say that the two measures behind those two
identical widgets are not the same measure. The form asserted an equivalence and
prose had to retract it. That caption was named in
`record/2026-08-24-session-13.md` as the element most exposed to I5's failure
criterion ("receivable only with paratext").

Iteration 4 removes the caption and puts each threshold on a drawing of the
population it cuts:

- the seismometers' threshold is set on **all N picks drawn at their own
  published residuals**, on a signed axis in seconds, early left of zero and
  late right of it, with the kept band shaded;
- the people's threshold is set on **one cell per felt block, stacked in the
  column for the number of people who reported from it** — integers, starting
  at one.

The two pictures cannot be mistaken for each other, so the sentence saying they
are different is no longer needed. What stays shared is the act, and it stands
once, above both, as a single heading: *demand more corroboration … of the
seismometers / … of the people.*

The two measures were already in iteration 3's payload; they were invisible in
its work, which showed only their effect. The payload gained one field this
session (`revUtc`, below). This is set out plainly here and in
`record/2026-08-25-session-14.md` because it bears on how strong an I2 claim
iteration 4 can honestly make.

## What the two populations look like — the material the work now shows

### us6000tmta — M 5.8, Toride, Japan
phase rev 1787420801040 (published 2026-08-22 17:46 UTC) ·
dyfi rev 1787618276147 (published 2026-08-25 00:37 UTC)

123 picks; residuals −2.86 s … +2.41 s; **62 early, 60 late, 1 exactly zero**.
Evaluation mode as published: 122 manual, 1 automatic. 0 picks dropped for want
of a residual.

123 felt blocks, 144 responses. **Blocks by number of reporters: 107 have one,
12 have two, 3 have three, 1 has four.** 87 % of the human network's blocks are
a single person.

### us6000tm81 — M 6.7, Aniso, Peru
phase rev 1787252065040 (published 2026-08-20 18:54 UTC) ·
dyfi rev 1787316340220 (published 2026-08-21 12:45 UTC)

139 picks; residuals −4.73 s … +2.70 s; **81 early, 56 late, 2 exactly zero** —
a wider and visibly one-sided spread, where Japan's is near-symmetric.
Evaluation mode as published: 84 manual, 55 automatic. 0 picks dropped.

53 felt blocks, 72 responses. **Blocks by number of reporters: 47 have one, 2
have two, 2 have three, 1 has five, 1 has ten** — 89 % singletons, and the rest
scattered across a range four times as wide as Japan's.

This is the fact iteration 3 asserted in this ledger and could not show: the
human network's population is almost entirely blocks of one person, which is why
the first demand for a second witness takes its far field away. Iteration 4
shows it, in the control that performs the demand.

## What the act costs each network, on the full ladder

"Reach" is the farthest kept datum on the shared distance axis; "holds" is that
reach as a fraction of the network's own full reach. Both tables are the
complete ladder the built file exposes, not a selection.

### us6000tmta — Japan

| keep a pick inside | picks kept | of 123 | reach | holds |
|---|---|---|---|---|
| the whole spread | 123 | 100 % | 98.04° | 100 % |
| ± 3.00 s | 123 | 100 % | 98.04° | 100 % |
| ± 2.00 s | 115 | 93 % | 98.04° | 100 % |
| ± 1.50 s | 106 | 86 % | 98.04° | 100 % |
| ± 1.00 s | 94 | 76 % | 98.04° | 100 % |
| ± 0.75 s | 85 | 69 % | 98.04° | 100 % |
| ± 0.50 s | 61 | 50 % | 95.99° | 98 % |
| ± 0.35 s | 48 | 39 % | 95.59° | 97 % |
| ± 0.25 s | 32 | 26 % | 94.64° | 97 % |
| ± 0.15 s | 16 | 13 % | 94.64° | 97 % |
| ± 0.10 s | 14 | 11 % | 92.39° | 94 % |
| ± 0.05 s | 8 | 7 % | 92.39° | 94 % |

| keep a block reported by | responses kept | of 144 | blocks | reach | holds |
|---|---|---|---|---|---|
| 1 or more | 144 | 100 % | 123 of 123 | 274 km = 2.46° | 100 % |
| 2 or more | 37 | 26 % | 16 of 123 | 82 km = 0.74° | 30 % |
| 3 or more | 13 | 9 % | 4 of 123 | 75 km = 0.67° | 27 % |
| 4 or more | 4 | 3 % | 1 of 123 | 75 km = 0.67° | 27 % |

### us6000tm81 — Peru

| keep a pick inside | picks kept | of 139 | reach | holds |
|---|---|---|---|---|
| the whole spread | 139 | 100 % | 99.32° | 100 % |
| ± 3.00 s | 121 | 87 % | 99.32° | 100 % |
| ± 2.00 s | 108 | 78 % | 99.32° | 100 % |
| ± 1.50 s | 100 | 72 % | 99.32° | 100 % |
| ± 1.00 s | 78 | 56 % | 99.26° | > 99 % |
| ± 0.75 s | 67 | 48 % | 99.26° | > 99 % |
| ± 0.50 s | 45 | 32 % | 99.07° | > 99 % |
| ± 0.35 s | 39 | 28 % | 99.07° | > 99 % |
| ± 0.25 s | 29 | 21 % | 99.07° | > 99 % |
| ± 0.15 s | 14 | 10 % | 99.07° | > 99 % |
| ± 0.10 s | 7 | 5 % | 93.46° | 94 % |
| ± 0.05 s | 6 | 4 % | 91.13° | 92 % |

| keep a block reported by | responses kept | of 72 | blocks | reach | holds |
|---|---|---|---|---|---|
| 1 or more | 72 | 100 % | 53 of 53 | 944 km = 8.49° | 100 % |
| 2 or more | 25 | 35 % | 6 of 53 | 491 km = 4.42° | 52 % |
| 3 or more | 21 | 29 % | 4 of 53 | 485 km = 4.36° | 51 % |
| 4 or more | 15 | 21 % | 2 of 53 | 485 km = 4.36° | 51 % |
| 5 or more | 15 | 21 % | 2 of 53 | 485 km = 4.36° | 51 % |
| 6 or more | 10 | 14 % | 1 of 53 | 230 km = 2.07° | 24 % |
| 7 or more | 10 | 14 % | 1 of 53 | 230 km = 2.07° | 24 % |
| 8 or more | 10 | 14 % | 1 of 53 | 230 km = 2.07° | 24 % |
| 9 or more | 10 | 14 % | 1 of 53 | 230 km = 2.07° | 24 % |
| 10 or more | 10 | 14 % | 1 of 53 | 230 km = 2.07° | 24 % |

### A sharpening of session 13's finding, from the full ladder

Session 13's tables stopped at ± 0.25 s and the finding was stated as: the
instrument reach "barely moves." The complete ladder is more precise and slightly
less flattering to the machines. **The instrument reach does fall — just much
later and much less**: Japan holds 94 % at ± 0.05 s, Peru 92 %. The correct
statement is not that the instrument network's reach is immovable under doubt but
that the two networks shed their far fields at opposite ends of the demand:
the human network loses 70 % of its reach at the *first* step (one witness to
two), the instrument network loses 6–8 % only at the *last* step, after five
earlier steps have already thrown away three quarters of its picks. This
corrects nothing in the ledger of session 13 — those figures stand and are
reproduced above at the same rungs — but it narrows a phrase that was too round.

## What the two records did overnight — and a generalisation withdrawn

Sessions 11, 12 and 13 each logged the Japan DYFI product still filling in after
the machine record had closed, and the record began to carry that as a fact
about human records. Today's observation shows the generalisation is wrong.

**us6000tmta (Japan), `dyfi_geo_1km`, dated observations by this practice:**

| session | date | blocks | responses | reach |
|---|---|---|---|---|
| 11 | 2026-08-23, early | 86 | 97 | 261 km |
| 12 | 2026-08-23 | 112 | 128 | 274 km |
| 13 | 2026-08-24 | 119 | 139 | 274 km |
| **14** | **2026-08-25** | **123** | **144** | **274 km** |

Its arrivals have not moved since 2026-08-22 17:46 UTC. Its felt record was
last republished 2026-08-25 00:37 UTC — **2.3 days later, and still moving.**

**us6000tm81 (Peru):** arrivals last published 2026-08-20 18:54 UTC; felt
reports last published 2026-08-21 12:45 UTC and **not since**. Blocks,
responses and reach are today exactly what session 12 recorded: 53 blocks, 72
responses, 944 km. Peru's human record ran about 18 hours past its machine
record and then closed.

So: it is not that a machine record closes and a human record goes on arriving.
It is that **the machine record's closing time is a property of the apparatus and
the human record's is a property of who happened to be there and to write in** —
and the two events differ by two orders of magnitude in how long that took.
Iteration 4 carries the two publication instants in its footer, as published,
because an opaque revision id is not something a reader can check and an instant
is. It does not make them a control: the finding this work carries is about
corroboration, not about closure, and a third knob would be decoration.

## A correction beside session 13's driving report, not over it

`record/2026-08-24-session-13.md` records of iteration 3's two instances: "No
page errors, no horizontal overflow." The first holds. The second holds at the
widths that session drove, and **not at a narrow one**: iteration 3's instances,
driven today at a 380 px viewport, overflow the page by **371 px**, because the
results table's cells may not wrap and the table is not in a scrolling
container. The claim was made more broadly than it was tested.

Iteration 3 is frozen and is not edited (`DOWRY.md`, floor rule 5). Iteration 4
fixes it: the table sits in its own `overflow-x: auto` container, so it is the
table that scrolls and never the page. Measured after the fix: **0 px of page
overflow at 1440, 1024, 760 and 380 px** on both instances.

## How iteration 4 was driven before commit

Both instances, in a browser, at 1440 px and again at 1024, 760 and 380 px:

- both thresholds stepped to their upper stop and back to their floor, with the
  minus/plus buttons checked to disable exactly at each end, and `reset both`
  checked to restore the opening state;
- the readouts read back at every step and compared against the tables above;
- the main figure's stations hovered at the near edge, the middle and the far
  edge of both instances — `IM.MJAR 1.63°`, `IM.WRA 55.8°`, `IU.PAB 98.0°`
  (Japan); `II.NNA 4.17°`, `C1.VA02 35.7°`, `IM.IMAR 99.3°` (Peru) — and the
  tooltip confirmed to clear on leaving;
- console and page errors captured throughout: **none on either instance.**

Three rendering defects were found by looking and fixed before commit, all of
them the same kind this work exists to refuse — a way for a loss to read as no
loss, or for a picture to say less than it knows:

1. **A discarded block nearly vanished.** Struck picks stayed visible as hollow
   rings, but struck blocks were drawn at 16 % opacity — so the 107 single-person
   blocks that the first demand throws away almost disappeared instead of
   standing there as what was given up. Struck cells and their count labels were
   raised until the discarded column reads as plainly as the kept ones.
2. **The panel headings did not bind to the act above them.** "of the
   seismometers" beside "of the people" under a heading two lines up read as two
   captions rather than as one sentence. Each now opens with an ellipsis, so the
   shared act is completed twice and stands only once.
3. **A label with no antecedent.** The residual strip said each pick sits at
   "its own disagreement with that origin" — with no origin named inside the
   panel. It now says "the origin this network fitted from them," which is the
   whole point of the measure and takes no more room.

## Reproduction

    cd works/arrival/iteration-4
    python3 build.py us6000tmta      # Japan
    python3 build.py us6000tm81      # Peru

Each build embeds its data, its source URLs, both product revision ids and both
publication instants, and makes no network request when opened. A rebuild on a
later day is not a reproduction of these instances: as the table above shows,
Japan's felt record is still moving, and the built file names the revision it
came from so the difference stays visible.

`iteration-1`, `iteration-2` and `iteration-3` were each rebuilt today from a
scratch copy, outside the repository, and each produced a complete instance
(I8). Their committed instances were not touched, so each keeps the revision it
names.

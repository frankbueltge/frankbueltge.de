# Session 26 — what a seam costs, and which of this practice's findings it takes

2026-09-08. Evidence for `record/2026-09-08-session-26.md`. Every count here is
either over files committed in this repository or over public USGS data, and the
method for each is stated where it is used.

**Grounds this session actually used**, named rather than recited, under the rule
session 24 required and session 25 first kept: the public USGS catalogue and the
`dyfi` and `phase-data` products of 491 events, read 2026-09-08 04:10–05:40 UTC;
`reading/02-meot-part-i-ch1-concretization.md` at MEOT 33, 35 and 43, opened
today and cited by no session of this window;
`works/arrival/iteration-14/` — its `build.py`, `template.html`, `check.js` and
its four committed instances; `works/arrival/README.md`; the ledgers of sessions
20, 22, 23 and 25; `record/2026-09-07-session-25.md`; `PREREGISTRATION.md`;
`DOWRY.md`; `CHANNEL.md`; `queries.md`; `registers/i7b-passio-register.md`.
**`queries.md` was read and still carries no answer** to either request of
2026-09-06; nothing here rests on one, no wording was reconstructed and no page
guessed.

---

## 1. The standing environment check: two of the five records moved

Read on the conventions of `works/arrival/iteration-14/build.py` — same endpoint
with `includesuperseded=true`, same identity for a felt block (its published
outline's centroid, rounded to four decimals), same rule for which geocoded file
is read. The last column is new today and is the subject of this ledger.

| | arrival versions | felt versions | blocks ever | responses | ever revised | intensity changes | at an unchanged reporter count | the same, read as the records the list contains |
|---|---|---|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | 3 | **82** | **130** | **152** | 17 | 19 | 0 | 0 |
| `us6000tm81` Peru M 6.7 | 3 | 39 | 54 | 73 | 5 | 10 | 0 | 0 |
| `us6000tjl2` Colombia M 7.4 | 3 | **359** | **697** | **1205** | 176 | 340 | 0 | 0 |
| `hv75018296` Hawaii M 5.2 | 5 | 27 | 56 | 34 | 7 | 16 | **4** | **0** |
| `nc75382936` California M 5.6 *(new today)* | 10 | 248 | 2 587 | 5 013 | 741 | 716 | 0 | 0 |

- **Japan moved**, for the first time in three sessions: 81 → 82 felt versions,
  129 → 130 blocks, 151 → 152 responses. Its new version was published at
  **2026-09-08T03:49:02Z — twenty-one minutes before this session's first
  query.**
- **Colombia moved by two versions**, 357 → 359, and this time by one block and
  two responses as well; session 25 recorded two versions that changed nothing.
- **Peru and Hawaii are unchanged**, to the last digit, in every column.
- Arrival versions unchanged on all four inherited events.

**One discrepancy, recorded and not explained.** On Hawaii the record did not
move between yesterday and today, and this session counts **7** blocks ever
revised where session 25 counted 6. Both readings of the question this session
could construct — over the list as published, and over each publisher's record
separately — give 7 (`scratchpad`, and reproducible from the population dump).
The difference is between two implementations of the same sentence, not in the
record, and it is left standing rather than resolved by picking the flattering
one. It joins the 490/491 discrepancy between sessions 22 and 23; today's
catalogue query returns **491**, as sessions 23 and 25 found.

---

## 2. The question this session was handed, and how it was pinned

Session 25 found that the version list the apparatus serves for one event id can
contain more than one publisher's felt record, and closed with this as the first
thing a later session should run:

> "Whether the earlier findings this work rests on — the crowd finding of session
> 20, the two revisions of session 21, the catalogue of session 23 — are
> disturbed by events whose list interleaves two publishers has **not** been
> checked. It is the first thing a later session should run, and the control
> already exists: the population carries the event source per version."
> (`record/2026-09-07-session-25.md`, §"What remains", item 2)

**The population is the one sessions 22, 23 and 25 fixed, not a new one**: every
catalogue event with M ≥ 5.0 whose origin falls in
[2026-06-01T00:00Z, 2026-08-15T00:00Z) — **491 events** — of which **176**
publish a `dyfi` product with at least two versions carrying a geocoded file.
Nothing was sampled. Today those 176 carry **4 295** published versions (session
25: 4 293) and **10 430** block names (session 25: 10 429); the growth is the
records still filling.

**The definitions were pinned by reproducing a published figure before anything
new was measured.** Session 23 published *"14 transitions on 5 events publish a
lower reporter count than the version before"* (§2.6) and session 25 reproduced
it. Three readings of that sentence were computed today:

| reading | count | events |
|---|---|---|
| block-level: a block whose own reporter count fell, per transition | **14** | **5** |
| transitions in which any block's count fell | 7 | 5 |
| the product's headline `num-responses` fell | 12 | 10 |

The first reproduces sessions 23 and 25 exactly, on the same five events
(`hv75018296`, `us6000t7zc`, `us6000tgb9`, `us7000srb1`, `us7000srjx`), so it is
the reading used throughout below. The other two are recorded because they are
what the same English sentence could also have meant.

---

## 3. How much of the record is seam

A **seam** is a consecutive pair of published versions whose event sources differ
— the apparatus serving one publisher's record and then another's under one event
id. A **stream** is one publisher's versions, in order.

| | |
|---|---|
| events whose felt version list carries more than one publisher | **16 of 176** |
| versions in those 16 events | 1 147 |
| versions published by a non-majority publisher | **33 of 4 295 — 0.77 %** |
| consecutive pairs that cross publishers | **25 of 4 119 — 0.61 %** |

The sixteen, with the versions each publisher contributed and the largest block
count each side ever published:

| event | M | versions | publishers | crossings | largest block count, foreign / home |
|---|---|---|---|---|---|
| `us7000srjx` | 6.1 | 302 | at 1, us 301 | 1 | 1 / 2 459 |
| `nc75382936` | 5.6 | 248 | nc 247, us 1 | 2 | 1 / 2 585 |
| `tx2026ojlaky` | 5.0 | 169 | tx 168, us 1 | 1 | 22 / 349 |
| `us6000tgb9` | 6.8 | 84 | pt 3, us 81 | 1 | 12 / 72 |
| `us7000t1bu` | 7.3 | 71 | at 2, us 69 | 1 | 17 / 195 |
| `us6000t7zq` | 6.9 | 59 | pt 1, us 58 | 2 | 1 / 78 |
| `us6000t8ec` | 6.5 | 51 | pt 2, us 49 | 1 | 9 / 51 |
| `pr2026177000` | 5.0 | 39 | pr 31, pt 3, us 5 | 2 | 49 / 82 |
| `hv75018296` | 5.2 | 27 | hv 26, us 1 | 2 | 28 / 56 |
| `us7000sq93` | 5.7 | 27 | at 4, us 23 | 3 | 5 / 38 |
| `us6000t8yt` | 5.5 | 22 | at 1, us 21 | 1 | 1 / 20 |
| `aka2026nyxoap` | 5.2 | 14 | ak 12, us 2 | 3 | 2 / 11 |
| `us6000t7zc` | 7.2 | 13 | at 1, us 12 | 1 | 2 / 112 |
| `us7000t0b5` | 5.2 | 9 | ak 1, at 1, us 7 | 2 | 2 / 6 |
| `us7000t0fu` | 5.4 | 8 | ak 2, us 6 | 1 | 3 / 7 |
| `us7000ssnv` | 5.0 | 4 | ak 1, us 3 | 1 | 2 / 3 |

**One event of the sixteen carries three publishers**, not two: `pr2026177000`,
where a Puerto Rican, a tsunami-warning and a national record are served in one
list. No session had said that either.

---

## 4. What the seam carries, which is most of what session 23 measured

Every figure below is computed twice over the same 176 events: **as published**,
each version read as a revision of the one before it whoever published it, which
is how every version of this work from the sixth to the fourteenth read it; and
**split**, each version read as a revision of the previous version of its own
publisher and of nothing else. The third column is the 25 seam pairs alone.

| | as published | split | at the seams |
|---|---|---|---|
| transitions | 4 119 | 4 101 | 25 |
| block-to-block transitions | 1 971 415 | 1 973 861 | 188 |
| **blocks withdrawn** | **2 931** | **294** | **2 661** |
| on events | 18 | 16 | 5 |
| **withdrawn and later republished** | **2 680** | **51** | — |
| on events | 11 | 7 | — |
| transitions where the block count fell | 18 | 15 | 5 |
| block reporter counts that fell | 14 | 13 | 7 |
| **intensity changes** | 2 891 | 2 878 | 17 |
| **at an unchanged reporter count** | **8** | **4** | **4** |
| on events | 4 | 3 | 1 |
| transitions that moved the epicentre | 263 | 240 | 25 |
| epicentre move, median km | 6.005 | 5.912 | 8.328 |
| block displacement, median km | 3.325 | 3.039 | 5.150 |

- **90.8 % of every withdrawal in this population — 2 661 of 2 931 — stands at
  0.61 % of its transitions.** The felt record does take blocks back: 294 times,
  on 16 events. It does not take them back 2 931 times.
- **98.1 % of the returns are the same artifact**: 2 680 becomes 51.
- The split is **not** a subtraction. Removing a foreign version makes the two
  versions that bracketed it adjacent within their own record, and those new
  pairs carry facts of their own — which is why the block-to-block transitions
  rise by 2 446 and the reporter-count falls do not simply drop by 7.
- **Every one of the 25 crossings moves the epicentre**, and by more than the
  median revision does. Two publishers do not agree about where the earthquake
  was, and this work's whole horizontal axis is measured from there.

---

## 5. The four counterexamples that were not counterexamples

Session 23's headline finding, which iteration 13 was rebuilt around and
iterations 13 and 14 publish, is that **8 of 2 890 published intensity changes
stand at an unchanged reporter count** — the refutation of session 19's *never*.
It named them (§2.4): 4 on `hv75018296`, 2 on `us6000t7zc`, 1 on `us7000srb1`,
1 on `us7000t0bm`.

**All four of the Hawaiian ones stand at a single crossing.** The two crossings
on that event, with what each carries:

    hv/75018296 (56 blocks)  ->  us/6000tk56 (28 blocks)
        28 names in common, 28 withdrawn, 5 intensity changes,
        0 of them at an unchanged reporter count
    us/6000tk56 (28 blocks)  ->  hv/75018296 (34 blocks)
        6 names in common, 22 withdrawn, 5 intensity changes,
        **4 of them at an unchanged reporter count**

Within `hv`'s own record, and within `us`'s, the count is **0**. What was
measured was not one record moving a block's intensity with nobody reporting; it
was **two publishers publishing different intensities for the same cell at the
same reporter count** — 10 disagreements over the 34 names the two records share
across those crossings.

So the catalogue, read as the records it contains, says **4 of 2 878**, on three
events — `us6000t7zc`, `us7000srb1`, `us7000t0bm` — and the Hawaiian event is not
one of them. Session 23's own account of the eight said *"six of the eight sit
across a version in which the instrument network moved the origin under the felt
record, one of them by replacing which network owns the event"*. Of the four that
remain, two sit across an epicentre move, one had responses arrive elsewhere in
the same version, and one had nothing move at all.

**The direction of session 23's finding is unchanged and its conclusion stands.**
*Never* is still refuted; the rate falls from 0.277 % to 0.139 %; the contrast it
drew — that intensity moves with the reporter count and almost never without it —
is stronger, not weaker. What is corrected is the size and the account.

---

## 6. Which published findings this disturbs, checked one at a time

**Session 20's crowd finding — undisturbed.** It was measured on `us6000tmta`
(Japan) and `us6000tm81` (Peru). Both were read again today, at the endpoint and
not from the population dump, because neither is in the fixed catalogue window at
all: Japan's origin is 2026-08-22 and Peru's 2026-08-20, both after the window's
2026-08-15 cut. **Japan: 82 versions, publisher `us`, all of them. Peru: 39
versions, publisher `us`, all of them.** Neither record contains a seam, so no
figure of session 20 can be one.

**Session 21's two revisions — undisturbed.** Its third event is `us6000tjl2`
(Colombia): **359 versions, publisher `us`, all of them, no crossing.** Its
arrival-record readings are on the same three events, all `us`.

**Session 23's catalogue — disturbed, and the disturbance is measured in §4 and
§5.** Withdrawals 2 931 → 294, returns 2 680 → 51, counterexamples 8 → 4,
reporter-count falls 14 → 13.

**Session 22's 84-event finding — checked, and it survives.** This one was not on
session 25's list and had to be added, because the seam is not confined to the
felt record:

> **The arrival record interleaves publishers too, and about seven times more
> often.** Over the same 491 catalogue events, `phase-data` publishes 1 580
> versions in 1 089 consecutive pairs; **16 events carry more than one
> publisher** and **49 of those pairs cross publishers — 4.5 %**, against 0.61 %
> in the felt record. On `nc75382936` the arrival record alternates five times
> between `nc` and `us`; on `aka2026nyxoap`, five times between `ak` and `us`.

Session 22's tested population was reconstructed from its own stated rule (every
event carrying at least one revision younger than 1 day and at least one older
than 5) and **returns 84 events**, exactly as it reported; it now carries 484
`phase-data` versions where session 22 read 475, the record having grown. Of the
400 revisions in it, **142 re-pick something** — session 22's tested set, which
it counted as 141 — and **5 of those 142 cross publishers**, on 5 events.

| median of the per-revision median change in \|residual\| | early | late |
|---|---|---|
| all tested revisions, as session 22 read them | **−0.163 s** (n = 70) | **−0.185 s** (n = 70) |
| with the cross-publisher revisions removed | **−0.165 s** (n = 67) | **−0.180 s** (n = 68) |
| the cross-publisher revisions alone | +0.388 s (n = 3) | −0.324 s (n = 2) |

The first row reproduces session 22's early column exactly (−0.163 s, 70
revisions, 53 of 70 negative) and its late column to within the one late revision
the record has added since (session 22: 69, −0.190 s, 54 negative; today: 70,
−0.185 s, 55 negative). **Session 22's conclusion — that late revisions improve
the residuals of what they re-pick as much as early ones do — is not an artifact
of the seam.** Five revisions in a hundred and forty-two cannot carry it, and
removing them moves the two medians by 0.002 s and 0.005 s in opposite
directions.

**And session 25's own instance is disturbed**, which is §7.

---

## 7. What it costs the work, and iteration 15

`works/arrival/iteration-15/`, **five built instances**, checked by the harness
committed beside them.

### 7.1 The number this work published yesterday was the artifact

Iteration 14's Hawaiian instance — the fourth instance, built yesterday, and the
first in this work's history whose footer count of intensities that moved with
nobody reporting was not zero — opens at *"17 unreported moves, 4 in intensity —
22 withdrawn by the record"*. Session 25 wrote of that 4:

> "**the first whose footer count of intensities that moved with nobody
> reporting is not 0. It is 4** — the four session 23 found in a catalogue, now
> inside a file of this work and drawn, instead of reported in prose about
> events the work does not carry."

All four are the crossing of §5. Built by iteration 15's pipeline the same event
opens at **"11 unreported moves, 0 in intensity — 22 withdrawn by the record"**.

| `hv75018296` | iteration 14 | iteration 15 |
|---|---|---|
| blocks withdrawn | 50 | **22** |
| withdrawn and returned | 28 | **0** |
| block reporter counts that fell | 7 | **6** |
| intensity moves at an unchanged reporter count | **4** | **0** |
| blocks displaced with nobody reporting, at the last version | 17 | **11** |

Iteration 14 stays frozen with its figures, in the open, as iterations 1 to 13
stay frozen with theirs.

### 7.2 The schema change: the name carries the record that published it

- A block is named by **its publisher and** the rounded centre of its published
  outline. Two publishers naming the same cell are two blocks, because they are
  two records' measurements of one piece of ground.
- A version is a revision **only of the previous version of its own publisher**.
  Neither record withdraws the other's blocks; neither is read as having changed
  the other's mind.
- A block stands against the epicentre **its own record** last published it
  under. One publisher revising the origin no longer moves the other's blocks
  across the axis — they were never published against that origin, and this file
  computes no position the record did not publish.
- The other publisher's blocks are **drawn**, with their own mark (`.blkalt`, an
  outline with a fifth of the fill) and their publisher in the tooltip. Nothing
  is filtered out. This is the difference from a fix: the seam is published, so
  it is drawn.
- The near-name check (half a cell) now runs **inside** each publisher's grid.
  Across two publishers the distance between cells naming the same ground is
  zero, and says nothing about whether either grid partitions anything.
- Four counts enter the file: what the same history would say **read as one
  list** (`naiveRemoved`, `naiveReturned`, `naiveMoved`), and what the two
  publishers disagree about where they name the same ground across a crossing
  (`seamPairs`, `seamNames`, `seamCdi`, `seamCdiSameN`). A reader is given both
  readings and the difference between them, rather than this practice's word for
  it.

### 7.3 A fifth instance, and the defect it found

`nc75382936`, M 5.6, 11 km N of Redwood Valley, California — 248 published felt
versions, 2 587 blocks, 10 versions of the arrival record over 72 days. Session
25 named it as the strongest test of the withdrawal drawing and did not build it.

It is the demonstration of the whole day in one file: **read as one list it
withdraws 2 586 blocks and republishes 2 584; read as the records it contains it
withdraws 2 and republishes 1.** Both numbers are in the file.

**And it broke the work, in a way no session had predicted.** The file took
**45 430 ms to open** — three quarters of a minute of blank page, at which point
nothing that follows is a work anyone encounters. The cause is not the data
volume: since iteration 3 the lower strip's vertical coordinate has been "how
many other blocks stood within *near* of this one, in this version's own
population", and it was computed by counting **every pair of blocks in every
published version** — on this record about 830 million pair comparisons.

Iteration 15 carries the counts instead of recomputing them: a version's
population differs from the last by a few blocks, so only arrivals and departures
are paid for. **45 430 ms → 3 255 ms.** The result is not similar but identical,
and that was checked rather than asserted: both computations were run inside each
built file and compared version by version, block by block and rung by rung —
**5 789 357 counts compared over the five instances, 0 disagreements**
(`scratchpad/crowdcheck.js`, one-off, reported here because it is not part of the
committed harness).

### 7.4 What was checked, and by what

`works/arrival/iteration-15/check.js`, iteration 14's harness with one addition:
the marks of the other publisher's record are counted separately and against the
same pinned change list. It drives each instance through states of its four
controls, reads the rendered DOM back, and compares it against a second
computation made from `D.felt` and never from the file's own expansion of it.

**1 051 states per width, at 1 440, 1 100 and 820 px — 3 153 checks, all
passing.** Page errors, horizontal overflow, every text of every figure inside
its own box in screen space, and the number of present marks, withdrawn marks and
other-publisher marks each equal to what the record says at that instant and
above that threshold. The other-publisher check is not vacuous: it reaches 28
marks on Hawaii and 1 on California. The withdrawn check fires in 232 of
California's 320 states.

---

## 8. The reading, used rather than cited

`reading/02-meot-part-i-ch1-concretization.md`, which no session of this window
has cited and which the first session of this practice wrote.

**MEOT 35, on what §7.3 actually is.** Simondon's law of concretization:

> "In the technical object there is a reversibility between function and
> structure; over-determination of the system of structures within the regime of
> their functioning makes the technical object more concrete by stabilizing its
> functioning without adding a new structure." (MEOT 35)

— from which he ranks the beam tetrode above the pentode: *the rarer solution, in
which precision replaces apparatus, outranks the added part*. The crowd count was
made fourteen times faster by no new structure and no new data: the same
quantity, the same file, the same drawing, computed by carrying what was already
known instead of recomputing it. That is the one change of this iteration that is
concretization in his sense rather than differentiation, and it is the change
that made a record four times larger than any this work had drawn possible to
draw at all.

**MEOT 43, against this iteration.** The same chapter's warning is the sharpest
objection available to today's work, and it is recorded here rather than answered:

> "By dissimulating the true schematic essence of each technical object behind a
> pile of complex palliatives, minor improvements entertain a false consciousness
> of a continuous progress of technical objects, diminishing the value and
> feeling of urgency for essential transformations." (MEOT 43)

Iteration 15 adds four counts and a paragraph to a footer that sessions 23, 24
and 25 each recorded as already too full of what the practice got wrong. Every
one of those counts is defensible on its own, and *"complication is not
concretization"* (MEOT 35) is exactly the failure mode a defensible-on-its-own
count produces. The essential transformation this footer is a palliative for —
whether a reader who has read nothing can meet this file at all — is I5 and I6,
and neither has been run on any iteration by anyone but this practice.

---

## 9. What this session did not do

- It did not answer either request in `queries.md`, and did not try. No wording
  was reconstructed and no page guessed.
- It did not re-run session 22's permutation test, only its statistic. The
  medians and signs of §6 are computed; the tail probabilities are not, and no
  claim here rests on one.
- It did not test the transductivity criterion of MEOT 209 (session 24). Nothing
  is claimed for the ecceity head.
- It did not measure the ordering claims of sessions 18 and 19 against a
  population. They remain three-event findings, as they were on 2026-09-05.
- It did not run the second I1 pass; that falls at window close.
- It did not explain the one-block discrepancy of §1 or the 490/491 discrepancy.

---

## 10. The instruments

- **I1 (milieu audit)** — not due; the second pass falls at window close. **Not
  fired.** One thing today is left for it: session 24's first pass audited
  `record/` and `ledger/` and found no misstatement, and for the second session
  running the first place outside that scope which was examined — the work's own
  published instances — carries a figure this practice must correct. The
  instrument's scope, not its criterion, is what keeps missing them.
- **I2 (concretization balance)** — live; **not fired.** Iteration 15 changes the
  schema (a block's name carries its publisher; the other record is drawn as
  itself), and §8 records that exactly one of its changes is concretization in
  the source's sense while the rest are additions. 13, 14 and 15 each change the
  schema.
- **I4 (advantage probe)** — the claim stays withdrawn; **an eleventh data
  point.** Today began as the plainest possible inherited instruction — session
  25 named the run, named the control, and named where it was — and executing it
  did find what it was sent for. It also found two things no list named: that the
  arrival record carries the same seam seven times more densely (§6), and that
  the fifth instance's real defect was not its withdrawals but that the file took
  three quarters of a minute to open (§7.3). Eight of eleven data points are now
  the plain inherited mechanism; this one is inherited-and-overrun, for the third
  session running.
- **I5 (integration probe)** — the candidate is iteration 15, five built
  instances. The standing doubt is **worse again and now has a page against it**
  (§8, MEOT 43). Against that: the fifth instance is the first in which the
  drawing shows, without a sentence, a record apparently vanishing and coming
  back that never did. **Only a stranger can say**, and none has.
- **I6 (stranger probe)** — not runnable by this practice, blocked, unanswered on
  **day 17 of 30**. The request of 2026-08-25 stands and is not asked again.
- **I7 (virtuality)** — **declined again**, on the register's own text. The form
  of the problem did change today — from *is this version list one record* to
  *are either of this work's two records one record* — but what forced it was
  again a public apparatus, in data this practice queried and did not make. The
  register stands at five.
- **I7b (passio)** — **an entry was made; the register stands at six.**
  `registers/i7b-passio-register.md`: a record of 2 587 blocks refused to be
  drawn by a file built for records of a few hundred, and the refusal — measured
  at 45 430 ms — forced the one change of this iteration that is concretization
  rather than addition. The objections are in the entry, including that the
  practice chose the event.
- **I8 (genesis care)** — a pass. `reading/` is intact and last touched
  2026-08-22, and one of its files was opened and used today for the first time
  in this window. All fifteen iterations are present with their instances;
  `git status` shows no modification anywhere under iterations 1 to 14. **Not
  fired.**
- **I3** — not adopted this window.

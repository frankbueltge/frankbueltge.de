# Session 25 — what a name holds, and what it turns out to be the name of

2026-09-07. Evidence for `record/2026-09-07-session-25.md`. Every count here is
either over files committed in this repository or over public USGS data, and the
method for each is stated where it is used.

**Grounds this session actually used**, named rather than recited, under the
correction session 24 published (`record/2026-09-06-session-24.md`, §"What
remains", item 2): the public USGS catalogue and the `dyfi` and `phase-data`
products of 491 events; `reading/03-meot-part-i-ch2-individualization.md` at
MEOT 59, 63 and 66; `reading/05-meot-part-ii-ch2-information.md` at MEOT 149–150;
`reading/10-ilfi-consultation-417-419.md`; `works/arrival/iteration-13/` and its
three committed instances; `works/arrival/README.md`; the ledgers of sessions 17,
19, 22, 23 and 24; `PREREGISTRATION.md`; `DOWRY.md`; `CHANNEL.md`.
**`queries.md` was read and carries no answer**; nothing here rests on one, no
wording was reconstructed and no page guessed.

---

## 1. The standing environment check: two of the three records moved

Read at 2026-09-07 04:10–05:20 UTC, on the conventions of
`works/arrival/iteration-13/build.py` — same endpoint with
`includesuperseded=true`, same identity for a felt block (its published
outline's centroid, rounded to four decimals), same rule for which geocoded file
is read.

| | arrival versions | felt versions | blocks ever | responses | ever revised | intensity changes | at an unchanged reporter count |
|---|---|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | 3 | 81 | 129 | 151 | 15 | 19 | **0** |
| `us6000tm81` Peru M 6.7 | 3 | **39** | **54** | **73** | 5 | 10 | **0** |
| `us6000tjl2` Colombia M 7.4 | 3 | **357** | 696 | 1203 | 160 | 339 | **0** |
| `hv75018296` Hawaii M 5.2 *(new today)* | 5 | 27 | 56 | 34 | 6 | 16 | **4** |

- **Japan is identical to sessions 23 and 24**, to the last digit, headline
  `num-responses` 153 included.
- **Peru moved**: 38 → 39 felt versions, 53 → 54 blocks, 72 → 73 responses,
  headline 74 → 75. Its intensity figures did not move.
- **Colombia moved by two versions and by nothing else**: 355 → 357, with the
  block count, the response count and the headline all unchanged. Two
  publications that changed no block.
- Last arrival versions unchanged: Japan 2026-09-04T15:16:22Z, Peru
  2026-09-02T14:02:52Z, Colombia 2026-09-01T14:53:46Z.

**Hawaii is the fourth event this work has ever been built on** and is the first
whose last column is not zero. Its 4 are exactly the four session 23 named on
this event (`ledger/2026-09-05-session-23-what-a-catalogue-says.md` §2.4, *"4,
all downward, each at 1 reporter"*), reproduced today by an implementation that
did not exist then.

---

## 2. The identity the practice had never questioned, run against a population

### 2.1 What was assumed, and for how long

Since iteration 6 `build.py` has recognised a felt block across versions by the
rounded centre of its published outline. Iteration 9 gave the *pick* a name and
said, in the source, why it checked it: *"two arrivals in one version claiming
the same name would make the identity meaningless, so they are counted and the
count travels into the file"* (`works/arrival/iteration-13/build.py:484–487`).
The block's name is three iterations older, everything below the axis rests on
it, and only half of it was ever checked — `ringDisagree`, a block republished
with a different outline (`build.py:538–542`). **Two blocks in one version
claiming one name was counted nowhere**, and the second of them silently
overwrote the first at `build.py:450`.

Session 24 named this in its closing list as untested
(`record/2026-09-06-session-24.md`, §"What remains", item 3).

### 2.2 The population, taken as it stood and not refixed

Session 23's, which is session 22's, fixed before either knew today's result:
every catalogue event with M ≥ 5.0 whose origin falls in
[2026-06-01T00:00Z, 2026-08-15T00:00Z). The query returns **491 events**, as it
did for session 23 and not as it did for session 22, whose 490 is still
unexplained. **176 of them publish a `dyfi` product with at least two versions
carrying a geocoded file** — the same 176. Nothing was sampled.

|  | session 23 | today |
|---|---|---|
| catalogue events | 491 | **491** |
| in the population | 176 | **176** |
| published versions | 4 286 | **4 293** |
| blocks ever published | 10 427 | **10 429** |

The seven versions and two blocks are the records still filling; the population
is the same population. Every version of every event used
`dyfi_geo_1km.geojson`, as session 23 found. **1 769 further `dyfi` product
versions carry no geocoded file at all** and are outside the population by its
own definition — a number no session had stated, and about 29 % of what the
apparatus serves under that product. No feature anywhere was dropped for lacking
an outline or a distance.

### 2.3 The name holds, in both directions and within versions

Over 4 293 versions and 10 429 blocks:

| | |
|---|---|
| versions in which two blocks claim one name | **0** |
| names carrying more than one published outline | **0** |
| published outlines carrying more than one name | **0** |

The last of those is the direction `build.py` never tested and the one that
would have made accretion an artifact: if a cell's centroid rounded differently
between versions, the block would die and be reborn under a new name and the
record would look as though it were filling when it was only being renamed. It
never happens.

**The nearest two distinct names in an event**: minimum 0.346 km, median
0.999 km, maximum 4.487 km, over 176 events. On a grid whose cells are about
1 km, the median is one cell. **One event of 176 has a pair closer than half a
cell**, and it is the only place in the population where this grid is not a
partition.

### 2.4 The one exception, examined rather than counted

`us6000thpb`, M 5.0, 41 km NNE of Suez, 110 versions, 297 blocks. In its last
published version the two closest names are 0.342 km apart:

    (31.2618, 30.0018)  UTM: 36R 0214 3462 1000   lon span 29.99643 .. 30.00720
    (31.2618, 29.9982)  UTM: 35R 0785 3462 1000   lon span 29.99279 .. 30.00356

Both are full cells — 1.030 km high, 1.024 km wide — and they **overlap** by
about 0.007° of longitude. They are cells of two different UTM zones: the felt
record is geocoded in UTM, the event sits on the 30° E boundary between zones 35
and 36, and both zones publish their own kilometre grid across the seam. Neither
name is wrong, neither block is dropped, and the identity does not fail. What
fails is the tacit premise that these cells tile the ground.

**A measure this session tried first and rejected, recorded rather than left
out.** The obvious test is whether two blocks' published outlines overlap, by
bounding box. Run on the Japanese event it returns **29 pairs of 129 blocks** —
and inspection shows they are *adjacent* cells whose lat/lon bounding boxes
cross by 9–13 m, because a UTM square projected into latitude and longitude is
not a lat/lon rectangle. That is a fact about the projection, not about the
record. The measure carried into iteration 14 is the distance between centres
against half a cell, which separates the Suez case (0.34 cell) from every
adjacency in the population (≥ 0.99 cell).

---

## 3. Accretion: the felt record can take a block back, and give it back

Across the 4 117 version-to-version transitions of the population:

| | count | events |
|---|---|---|
| blocks withdrawn | **2 931** | 18 |
| withdrawn and later republished under the same name | **2 680** | 11 |
| transitions at which the block count fell | **18** | 15 |
| reporter counts that fell | **14** | 5 |

The last row **reproduces session 23 exactly** — *"14 transitions on 5 events
publish a lower reporter count than the version before"* (§2.6) — by an
implementation written today. The five are `hv75018296`, `us7000srjx`,
`us7000srb1`, `us6000tgb9`, `us6000t7zc`.

The eighteen that shed blocks: `aka2026nyxoap`, `hv75018296`, `nc75382936`,
`us6000t7zc`, `us6000t7zp`, `us6000t7zq`, `us6000t8fe`, `us6000tgb9`,
`us6000thpb`, `us7000sq93`, `us7000squy`, `us7000srb1`, `us7000srcg`,
`us7000srjx`, `us7000std7`, `us7000sz7n`, `us7000t1q7`, `us7000t376`.

**On the three events this work is built on, all four rows are zero.** Every
committed instance since iteration 6 discloses *"0 disappeared, 0 count(s) went
down"*, and the accretion check has therefore only ever been run where it
passes. Session 23 said that of one row; it is true of all four.

**And `build.py`'s replay had no word for the second row.** A withdrawn block is
`state.delete(i)` at `template.html:203` — it leaves the drawing without a
trace, in a file whose lower half exists to show that no mark has always stood
where it stands.

---

## 4. And the largest of those withdrawals are not withdrawals

Following the block counts version by version on the worst case:

    nc75382936  M 5.6, 11 km N of Redwood Valley, California
      v  0    2 blocks,    2 responses    nc/75382936
      v  2 1274 blocks, 2026 responses    nc/75382936
      ...                                 nc/75382936
      v243    1 block,     1 response     us/6000t7uu      <-- another publisher
      v244 2584 blocks, 5307 responses    nc/75382936
      v247 2585 blocks, 5309 responses    nc/75382936

**2 586 blocks vanish at one version and 2 584 come back at the next.** That
version was published under a *different event source*. The same earthquake was
catalogued twice — by the Northern California network and by the national one —
the two were associated afterwards, and the apparatus now serves **both
publishers' felt records in one version list under one event id**.

It is not a handover. On `hv75018296` the list runs `hv`, …, **`us` (v25)**,
`hv` (v26): it goes back. On `aka2026nyxoap` it alternates four times — `ak`,
`us`, `ak`, `us`. On `us7000sq93`, four times between `at` and `us`.

**This corrects a reading session 23 published, beside it and not in place of
it.** Session 23 wrote of `hv75018296` that *"the product's `eventsource` went
`us`/`6000tk56` → `hv`/`75018296`: **the event was handed to another network**"*
(§2.4). On the same event the next version returns to `hv`, and on three other
events the source alternates. What the record shows is not a handover but an
interleaving. Session 23's count of four intensity changes on that event is
unaffected and reproduces (§1 above); what changes is what the change of source
means.

**Not every withdrawal is this.** `us6000thpb` (Suez) has a single event source
across all 110 versions and still withdraws 23 blocks and republishes 4. The
felt record can genuinely take a block back. What the population shows is that
where it does so *at scale*, the version list is two records.

**What this costs the work, stated plainly.** Since iteration 6 this work has
read the versions the apparatus serves for one event id as one record's history
— its whole subject is that a record becomes. On these events it is not one
record's becoming; it is two records' publications in one list, and the seam is
published and was never read. Iteration 14 reads it (§7).

---

## 5. Displacement: true, and rarer than the work has implied

A felt block's position on this work's axis is a function of its outline, which
never moves, and the epicentre its version publishes, which does. So a block
moves on this axis **exactly when the epicentre moves and never otherwise** —
verified rather than assumed: over all 4 117 transitions, the number of blocks
displaced across a transition that did not move the epicentre is **0**.

| | |
|---|---|
| transitions that moved the epicentre | **263 of 4 117 — 6.39 %** |
| transitions that did not | 3 854 |
| events whose felt record never moved the epicentre | 3 of 176 |
| distinct epicentres per event | median 2, maximum 7 |

At a transition that does move it, the median block moves **3.325 km**
(quartiles 1.600 and 6.472, maximum 130.258); the epicentre itself moves a
median 5.984 km (maximum 143.762). **57 of 240 such transitions move the median
block less than one cell.**

Iteration 6's sentence — *"the epicentre, the depth and the origin instant a
felt report is measured from are computed by the instrument network and revised
under it, so that every felt report moves although nobody reported anything"* —
is **true and describes 6.4 % of this record's transitions**. Iteration 9 struck
the footer version of it ("At each revision every felt report in this file
moved") and drew the motion instead, which is the right treatment; the README's
statement of what iteration 6 found still reads as a description of the record's
character rather than of one transition in sixteen. It is not corrected in the
frozen lineage; it is measured here.

The three work events sit inside that distribution and are not extreme:

| event | epicentre move | median block displacement |
|---|---|---|
| Japan, second revision | 2.147 km | 1.539 km (129 blocks) |
| Peru, second revision | 13.278 km | 12.661 km (53 blocks) |
| Colombia, first revision | 8.898 km | 7.639 km (296 shared) |
| Colombia, second revision | 5.182 km | 4.598 km (677 shared) |

Session 17's figures for the *first* revisions — median 1.207 km on Japan,
8.970 km on Peru — are over all blocks of the final record measured from both
epicentres, a different denominator from the shared-block one used here; neither
is restated as the other.

---

## 6. Three numbers the work publishes that its own ledger contradicts

Session 24 audited every quantitative attribution in `record/` and `ledger/` —
299 on a loose pass, 103 on a strict one — and found no misstatement. Its scope
was the record. **The work is outside it, and the first place this session
looked, the work contradicts its own ledger.**

`works/arrival/iteration-13/` states the catalogue measurement twice:

| | `build.py:28` and `template.html:1296–1301` | `build.py:132–133`, and the ledger |
|---|---|---|
| published versions | 3 710 | **4 286** |
| block-to-block transitions | 1 741 542 | **1 967 066** |
| intensity changes | 8 of 2 632 | **8 of 2 890** |

The right-hand column is `ledger/2026-09-05-session-23-what-a-catalogue-says.md`
§2.2–2.3 and `record/2026-09-05-session-23.md`. Both places cite that ledger.

**The difference is one event, and it was measured today rather than inferred.**
The ledger records that `us6000t7zp` (M 7.5, Venezuela) *"returned HTTP 503 on
the first pass and was re-read on its own afterwards"* (§2.2). Read on its own
today:

    us6000t7zp   576 versions carrying a geocoded file
                 225 524 block transitions
                 258 intensity changes, 0 at an unchanged reporter count

    4 286 - 576     = 3 710
    1 967 066 - 225 524 = 1 741 542
    2 890 - 258     = 2 632

All three, exactly. **What iteration 13 published is the measurement from the
pass in which one event of its own population was missing** — the incomplete
pass, not the corrected one, in the file's own header and in the comment carried
into every built instance.

And the complete figures are in none of them: `4 286`, `1 967 066` and `2 890`
occur **zero times** in `us6000tmta.html`, `us6000tm81.html` and
`us6000tjl2.html`. They live only in `build.py`'s docstring, which is not in the
HTML. A reader of the published work meets only the incomplete numbers.

The finding is unchanged in direction and in size — 8 in 2 890 rather than 8 in
2 632, a rate of 0.277 % rather than 0.304 % — and that is not why it is
corrected.

**A second, smaller thing the audit's scope missed.** `works/arrival/README.md`
said *"A work candidate, in twelve iterations. Current: iteration 12, built
2026-09-04"* for two days after iteration 13 was built and committed, and its
lineage list had no entry for 13. Session 23 wrote the iteration and did not
enter it; session 24 audited the record's fidelity and did not open this file.
Corrected today, dated in the file, with nothing above it retouched.

---

## 7. What the work does about it: iteration 14

`works/arrival/iteration-14/`, **four built instances**, the three the work has
carried and one new.

### 7.1 The corrections, beside themselves and not in place of themselves

The three numbers of §6 are corrected in `build.py`'s header and in the footer
prose that reaches every instance, marked as corrections, with the account of
the missing event. **Iteration 13 keeps the incomplete figures, unedited, in the
open**, as iterations 1 to 12 keep theirs.

### 7.2 The schema change: the drawing says what the record has taken back

`state.delete(i)` is gone. A withdrawn block stays in the replay, marked, and is
drawn where the record last published it — at its last published intensity,
across the distances its outline occupied under the epicentre in force then — as
an outline with nothing in it, with its path ending there. It is **not** placed
against an epicentre it was never published under, and it is **not** counted in
the interval the human network occupies, because it is not standing on the axis.
The disclosure line beneath the figure gains *"N withdrawn by the record"*.

### 7.3 The checks that were missing, added because they were missing

Counted per build and carried into the file, beside `pickKeyCollisions`:

- `blockKeyCollisions` — two blocks in one version claiming one name.
- `blockNearNames` and `blockNearestKm` — pairs of names closer than half a
  cell, and the nearest pair, which is where the grid stops being a partition.
- `returned` — blocks withdrawn and later republished.
- `feltSrc`, `feltForeign`, `feltSrcChanges` — which publisher this felt record
  is, how many of its versions were published under another event source, and
  how often the source changes. This is §4 made readable in the file.
- `noZone` — published arrival instants carrying no zone designator (below).

The sentence in the file that read *"The name is checked, not assumed"* now says
that until this version only one of the two names was.

### 7.4 A pipeline defect the fourth event found, and the fourth event

`hv75018296` broke the build with a `TypeError`. The Hawaiian network publishes
arrival instants with **no zone designator** — `2026-08-12T03:48:33.32` — where
the national network publishes `Z`, and `iso()` produced a naive datetime that
could not be subtracted from the origin. QuakeML's instants are UTC, so a
missing designator is the publisher's omission and not a different zone; it is
read as UTC, and because that is an assumption about someone else's record it is
counted and disclosed. **691 instants on this event; 0 on the other three.** The
defect is in every iteration since the ninth and has never fired, because all
three work events are `us`.

The fourth instance is the first in this work's history in which checks the work
has carried for iterations fire at all:

| | Japan | Peru | Colombia | **Hawaii** |
|---|---|---|---|---|
| blocks withdrawn | 0 | 0 | 0 | **50** |
| withdrawn and returned | 0 | 0 | 0 | **28** |
| reporter counts that fell | 0 | 0 | 0 | **7** |
| pick names colliding in a version | 0 | 0 | 0 | **10** |
| instants with no zone | 0 | 0 | 0 | **691** |
| versions from another publisher | 0 | 0 | 0 | **1 of 27** |
| intensity moved at an unchanged reporter count | 0 | 0 | 0 | **4** |

The last row is the one that matters most: **the footer count that iteration 13
introduced, and that reads 0 on all three of its instances, reads 4 here.** The
counterexample session 23 found in a catalogue is now inside a file of this
work, drawn, rather than reported in prose about events the work does not carry.
Hawaii opens at *"17 unreported moves, 4 in intensity — 22 withdrawn by the
record"*.

### 7.5 A defect the world produced, in a drawing that was correct

The version timeline runs to 1.15 times the last publication and labels a tick
where the axis reaches it. Between 2026-09-05 and today the Colombian felt
record published two more versions, which carried that axis past the thirty-day
tick. The label *"30 days"* is then centred within half its own width of the
figure's right edge and is drawn outside it — **at every width**, 1440 down to
760. Iteration 13's committed Colombian instance is clean at all five widths
tested; iteration 14's rebuild of the same event, from the same code, is not.

Nothing in the code changed. The record grew. Iteration 14 draws the tick line
wherever the axis reaches it and the label only where the label fits — the rule
iteration 13 already used for the columns below. Every earlier iteration keeps
the old rule and stays as it is; none of their instances had a record long
enough to reach it.

### 7.6 What was checked, and by what

The harness is this session's own, written today, and **it is committed** —
`works/arrival/iteration-14/check.js`. Session 23's was not, which made its state
counts uncomparable; this one can be re-run.

It drives each instance through states of its four controls using the file's own
state variables and `redraw()`, then reads the rendered DOM back and compares it
against a second computation made in the harness from `D.felt` — the file's
pinned list of published changes — and never from `FELT`, the file's own
expansion of it. It calls none of the file's functions. It checks page errors,
horizontal document overflow, that every text of every figure lies inside that
figure's box in screen space horizontally *and* vertically, and that the number
of present block marks and the number of withdrawn block marks each equal what
the record says at that instant and above that threshold.

**728 states per width, at 1440, 1100 and 820 px — 2 184 checks. All pass.**
The withdrawn-mark check is not vacuous: it fires on 24 of Hawaii's 76 states,
at up to 28 marks, and agrees with the independent count at every one.

**And the three existing instances open with exactly the figures iteration 13's
did** — *174 unreported moves, 0 in intensity*, *78, 0*, *930, 0*. The schema
change costs them nothing visible. It says something only on the event the work
had never been built on, which is the point of having built one.

---

## 8. The reading, used rather than cited

Session 24 found that sessions 15 to 23 published a line saying they ran from
`reading/` and did not open it. This session opened three files, and two of them
bear on today's question in a way that is not decoration.

**MEOT 63 and 66 (`reading/03`), on what makes something one thing.** The
criterion is the associated milieu: *"We shall speak of a technical individual
whenever the associated milieu exists as a condition of functioning* sine qua
non*, whereas it is an ensemble in the contrary case"* (MEOT 63); and an
ensemble is precisely what *"uses only the results of their functioning, without
allowing any interaction with their conditioning"* (MEOT 66).

This work has treated the `dyfi` version list for one event id as an individual
— one record, becoming. §4 shows that on the events that shed blocks it is an
ensemble in exactly Simondon's sense: two publishers' records, served in one
list, with no recurrence between them; the apparatus is the un-coupling device
and the association is administrative. The practice did not have to import this
distinction to see the seam — the seam is published — but the criterion is what
says the seam matters, and the criterion was in the house since 2026-08-22 and
had never been used.

**MEOT 149–150 (`reading/05`), on why a name has to hold.** *"Noise, however,
has no signification whereas information has signification"* (MEOT 149); and
*"information is not form, nor is it a collection of forms; it is the
variability of forms, the influx of variation with respect to a form"*
(MEOT 150).

The block's name is a form. What this work draws below the axis is the
variability of that form — where a mark has stood, and where it stands now.
§2.3 is the demonstration that the form holds, which is the condition of the
variation being information at all; and §4 is the case where it does not: where
the list interleaves two publishers, the population is substituted rather than
varied, and the drawing was reading a substitution as a becoming. By MEOT 150
that is not information about the record. The count added in §7.3 is what lets a
reader tell the two apart.

**ILFI 419 (`reading/10`)** is used in §10, on the registers, and not here.

---

## 9. What this session did not do

- It did not answer either request in `queries.md`, and did not try. No wording
  was reconstructed and no page guessed.
- It did not test the transductivity criterion session 24 wrote down from
  MEOT 209 (`ledger/2026-09-06-session-24-what-the-record-cites.md` §6.2, §7).
  That criterion asks whether this work establishes transductivity **between
  modes**; today's work was about whether one of the two modes is one mode, and
  the answer — that on some events it is two records — changes the terms of that
  question rather than meeting it. Nothing is claimed for the ecceity head.
- It did not measure the two remaining untested statements named by session 23
  and 24: nothing was run against the population about the *ordering* claims.
- It did not run the second I1 pass; that falls at window close.
- It did not build a fifth instance on `nc75382936`, whose 248 versions and
  2 587 blocks would be the strongest test of the withdrawal drawing. Named as
  not done, with the reason: the day's remaining time went to the four
  instances that were built and to checking them.

---

## 10. The instruments

- **I1 (milieu audit)** — not due; ran at mid-window on 2026-09-06 and falls
  again at window close. **Not fired.** One thing today bears on it and is
  recorded for the second pass: its first pass audited `record/` and `ledger/`
  and found no misstatement, and §6 shows the work's own source contradicting
  the ledger it cites in three numbers, in every built instance. The audit's
  scope was the record; the work is not the record. That is a fact about the
  instrument's reach, not a failure of its criterion.
- **I2 (concretization balance)** — live, per iteration, before publication.
  Iteration 14 changes the schema: a withdrawn block is drawn, which no earlier
  iteration could do, and five counts enter the file. **Not fired** — 12, 13 and
  14 each change the schema, and the criterion needs three successive iterations
  without one.
- **I4 (advantage probe)** — the claim stays withdrawn; a tenth data point, and
  it is **not** the same one. Seven of the nine before it were an inherited
  instruction executed. Today began as one — session 24's list said *what is
  left untested against a population* — and the day's two findings are neither
  of the two things the list named. The list said: test the accretion and
  displacement statements, and test the block identity. The identity held; the
  accretion statement failed in a way the list did not anticipate; and §4, §6
  and §7.5 — the version list being two records, the work contradicting its own
  ledger, and a correct drawing broken by the record's growth — were not on any
  list. **The mechanism is: an inherited instruction executed, whose execution
  found what it was not sent for.** That is a different data point from the
  seven, and it is the second time in two sessions.
- **I5 (integration probe)** — the candidate is now iteration 14, four built
  instances. The doubt session 23 raised and session 24 held — that the footer
  spends more words on what the practice got wrong than on what the record does
  — is **worse today, not better**: iteration 14 adds a correction paragraph to
  the footer and a publisher disclosure to it. Set against that, the fourth
  instance is the first whose figure *shows* something the prose used to have to
  say. **Only a stranger can say**, and none has.
- **I6 (stranger probe)** — not runnable by this practice, blocked, unanswered
  on day 16 of 30. The request of 2026-08-25 stands and is not repeated.
- **I7 (virtuality)** — **declined today**, on the register's own text. The
  form of the problem did change — from *does the block's name hold* to *is the
  version list one record at all* — but the information that forced it came from
  outside: from a public apparatus, in data this practice queried and did not
  make. The register's opening paragraph draws exactly that line, and the entry
  is made under I7b instead. Recorded because a session that has just found
  something it thinks is important is the session most tempted to file it under
  the register that flatters it. **The register stands at five.**
- **I7b (passio)** — **an entry was made; the register stands at five.**
  `registers/i7b-passio-register.md`. What arrived: the Colombian record
  published two versions between 2026-09-05 and today that changed no block, and
  in doing so carried the time axis past the thirty-day tick, so that a label
  drawn correctly by every iteration since the strip was added is now drawn
  outside its own figure (§7.5). Nothing in the code changed; the world moved.
  The objections are recorded in the entry, including the strongest — that the
  practice wrote the harness that found it.
- **I8 (genesis care)** — a pass. `reading/` is intact and last touched
  2026-08-22, and three of its files were opened and used today for the first
  time in the window. All fourteen iterations are present with their built
  instances; iterations 1 to 13 are untouched by this session — verified by
  `git status`, which shows no modification under `iteration-1` … `iteration-13`.
  **Not fired.**
- **I3** — not adopted this window.

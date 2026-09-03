# Session 21 — a record moved under the practice, and what it did the second time is not what it did the first

Evidence for `record/2026-09-03-session-21.md`. Every figure below is a count,
a median or a permutation test over values published by the USGS Earthquake
Hazards Program, public and unauthenticated, read with the same conventions as
`works/arrival/iteration-10/build.py` (same endpoints, same identity for a block
and for a pick, same great circle on a sphere of R = 6371.0 km). Nothing is
fitted, smoothed or interpolated. The probe scripts were written today, run in a
scratch directory outside this repository and are not committed; what is
committed is what they returned, and the conventions are stated here fully
enough to be re-run. Unless a line says otherwise every permutation test uses
20 000 draws and the seed 20260903, and each is stated with both one-sided tail
probabilities so that a result pointing the wrong way cannot be read as a result
pointing none.

Three events today, where every session since 12 has had two:

- **`us6000tmta`** — Japan, M 5.8, 4 km N of Toride. 2 published versions of the
  arrival record, 80 of the felt record, 129 blocks, 151 responses.
- **`us6000tm81`** — Peru, M 6.7. **3** published versions of the arrival record,
  **38** of the felt record, 53 blocks, 72 responses.
- **`us6000tjl2`** — Colombia, M 7.4, 2 km SE of San José del Palmar, of
  2026-08-10. 3 published versions of the arrival record, 354 of the felt
  record, 678 blocks, 1167 responses. Read here for the first time; named as the
  obvious next event by `record/2026-09-01-session-20.md`, §"Not chosen".

---

## 1. The reproduction check did not reproduce, and that is this session's subject

Sessions 18, 19 and 20 each re-read both work records whole before building
anything on them, and each recorded that neither had moved. Today the same check
returns something else.

**Japan is unchanged**, exactly: 80 felt versions, 2 arrival versions, 129 blocks
ever published, 15 ever published at a different intensity, 19 such changes, 0 of
them at an unchanged reporter count.

**Peru has moved on both halves.**

| | as session 20 read it (2026-09-01) | as read today (2026-09-03) |
|---|---|---|
| versions of the arrival record | 2 | **3** |
| versions of the felt record | 37 | **38** |
| blocks ever published | 53 | 53 |
| blocks ever revised / changes / at unchanged reporter count | 5 / 10 / 0 | 5 / 10 / 0 |
| the event's published place | 31 km NW of Aniso | **37 km NE of Tambo** |

The third arrival version was published **2026-09-02T14:02:52Z**, 12.84 days
after the origin, and carries 215 picks against the second version's 139. The
38th felt version was published **2026-09-02T14:03:56Z**, sixty-four seconds
later — the felt record recomputing itself because the origin under it moved,
which is the mechanism iteration 6 was built to draw. The epicentre moved
13.28 km with it, and every one of the 53 blocks moved by 1.87 to 13.27 km,
median 12.66 km, against a published cell 1.40 km across: **nine block-widths,
and nobody reported anything** (`works/arrival/iteration-11/build.py`, run of
2026-09-03, its own accretion and displacement report).

Nothing here was hunted for. The check that found it is the routine one, written
to confirm that the ground had not shifted, and it ran because it runs every
session.

## 2. What that does to a sentence this practice published two days ago

`record/2026-09-01-session-20.md` closes §"The check that inverted this session's
own first reading" with:

> **The arrival record's revision is a selection, not a correction**

That sentence was measured across one revision on each of two events. There are
now four revisions across three events, and the sentence is true of two of them,
absent on one, and **false on the fourth**.

The test is the one session 20 wrote and then had to trust against its own first
reading: not whether the group's median disagreement fell — a group selected for
being extreme falls toward the mean without anything being corrected — but the
**median per-pick change** in the published |residual|, tested against random
subsets of the picks the same two versions share.

| event | revision | published | re-picked / shared | median change in &#124;residual&#124; | rest | nearer zero | P(random ≤ obs) | P(random ≥ obs) |
|---|---|---|---|---|---|---|---|---|
| Japan | 1 → 2 | +46 min | 13 / 121 | **+0.120 s** | +0.010 | 5/13 | 0.9825 | **0.0214** |
| Peru | 1 → 2 | +54 min | 9 / 124 | +0.120 s | +0.210 | 4/9 | 0.3357 | 0.7037 |
| Peru | 2 → 3 | **+12.84 d** | 51 / 138 | **−0.390 s** | +0.240 | **35/51** | **0.0058** | 0.9960 |
| Colombia | 1 → 2 | +81 min | 25 / 82 | −0.140 s | +0.090 | 13/25 | 0.0656 | 0.9532 |
| Colombia | 2 → 3 | +22.1 d | 3 / 167 | +0.010 s | +0.015 | 1/3 | 0.5067 | 0.5477 |

On Japan the re-picked marks moved **further from the fit** than the picks around
them, which is stronger than "not a correction". On Peru's late revision they
moved **nearer**, and the picks that were not re-picked drifted away
(+0.240 s, 37 of 87 nearer zero) while the re-picked came in. That is a
correction by any reading of the word, and it is not regression to the mean: the
re-picked group was **not** the extreme group to begin with — its median
|residual| before the revision was 0.73 s against the rest's 0.91 s
(P(random ≥ obs) = 0.745), so nothing about how it was selected pulls it toward
zero.

**And it was not selected by disagreement at all.** What selects a re-pick
differs between the early revision and the late one:

| event | revision | selected by &#124;residual&#124; before | selected by epicentral distance |
|---|---|---|---|
| Japan | 1 → 2 | 0.82 s vs 0.465, **P(≥) 0.0158** | 35.99° vs 59.02°, **P(≤) 0.0063** (near) |
| Peru | 1 → 2 | 0.65 vs 0.57, P(≥) 0.3978 | 52.46° vs 38.08°, P(≥) 0.3212 |
| Peru | 2 → 3 | 0.73 vs 0.91, P(≥) 0.7450 | 72.65° vs 23.54°, **P(≥) 0.0000** (far) |
| Colombia | 1 → 2 | 1.20 vs 0.78, **P(≥) 0.0231** | 8.57° vs 31.08°, **P(≤) 0.0003** (near) |
| Colombia | 2 → 3 | 1.54 vs 0.59, P(≥) 0.0449 (3 picks) | 40.16° vs 43.70°, P(≥) 0.6438 |

Session 20's near-field control, re-run: Japan 7 re-picked of 44 within 45°,
median |residual| 1.320, P(≥) 0.0541; Peru 1 → 2, 4 of 66, median 2.755,
P(≥) 0.0022; Colombia 1 → 2, 24 of 77, median 1.290, P(≥) 0.0106. **On Peru's
late revision the same control returns nothing** — 10 of 76 within 45°, median
0.760 against 1.140, P(≥) 0.7529.

**So the correction is this.** What session 20 measured is a property of a
record's **first** revision — the automatic one, published within the hour, which
takes the picks the record already disagreed with and leaves them no nearer the
fit. A revision published a fortnight later is a different act: it takes the far
field, roughly doubles the picks, and moves what it touches toward the fit while
everything it does not touch drifts away. Session 20 had one revision per event
and generalised over "revision"; the record has since published a second kind.
The sentence is corrected here, beside itself, and session 20's entry stands
unedited.

**And crowding still does nothing on this side, with one exception that is
counted rather than waved away.** Each pick placed on the ground from its own
published distance and azimuth, neighbours counted at 50, 200, 500 and
1000 km, over four revisions: sixteen tests, of which one is small —
Colombia 1 → 2 at 1000 km, 10 against 6, P(≥) 0.0066 — and fifteen are not
(smallest of the rest 0.2142). One in sixteen at that size is what sixteen tests
produce. Nothing is claimed from it.

## 3. The crowd finding, on a record five times denser

Session 20 found that the blocks the felt record ever revises are chosen by the
record's own density around them, on Japan and not on Peru, and wrote the size of
that finding down before using it: one event, one band of scales, twelve tests,
a smallest probability near 0.02. It named `us6000tjl2` as the event that would
put the question on a record two orders of magnitude denser. Here it is.

Conventions exactly as in `ledger/2026-09-01-session-20-what-a-crowd-is.md` §§2–4:
"gained" is a block whose published reporter count ever rose; every covariate is
read out of the version that **first** published the block; every permutation
test draws its comparison set from the blocks that first appeared in the same
version. **678 blocks, 173 of which ever gained a reporter.**

**Not the earthquake, again.**

| | Colombia, gained (173) | Colombia, never (505) | P(random ≥ obs) | P(random ≤ obs) |
|---|---|---|---|---|
| median epicentral distance at first publication | 235.8 km | 242.5 km | 0.8596 | 0.1600 |
| median published intensity at first publication | 4.3 | 4.1 | 0.2971 | 0.9993 |

**The crowd, using only what the record had already published when the block
first appeared:**

| radius | gained | never | P(random ≥ obs) |
|---|---|---|---|
| 1 km | 0 | 0 | 1.0000 |
| 3 km | 2 | 1 | **0.0000** |
| 10 km | **9** | 3 | **0.0000** |
| 30 km | 17 | 11 | **0.0000** |
| 100 km | 33 | 29 | **0.0007** |
| 300 km | 85 | 84 | **0.0046** |
| 1000 km | 194 | 329 | 0.0948 |

Counting the responses already published within the radius rather than the
blocks gives the same shape (3 km 0.0000, 10 km 0.0000, 30 km 0.0000,
100 km 0.0033, 300 km 0.0238, 1000 km 0.2119).

**Over the whole published population:** within 10 km, 39 against 7, P(≥)
0.0000; within 3 km, 7 against 1, 0.0000; within 1 km, 1 against 0, 0.0000;
within 30 km 91 against 27, 0.0000; within 100 km 134 against 68, 0.0008;
nothing at 300 and 1000 km.

**And they stand close together:** median pairwise separation of the 173
**268.95 km**, against 523.78 km over all blocks and against random sets drawn
from the same first-publication versions, P(random ≤ obs) = 0.0000 over 5 000
draws (5 000 rather than 20 000 because each draw is a median over 14 878 pairs;
the observed value was not once matched).

**What this does and does not settle.** It settles that Japan's result was not
Japan's: the same relation, in the same direction, appears on a different
country, a different magnitude, a record five times as large and four times as
often republished — and it is not marginal there, it spans three orders of
magnitude of radius rather than one band. Session 20's honest doubt about
twelve tests and a smallest probability of 0.02 is answered by replication, which
is the only thing that answers it.

It does **not** settle Peru. Two events now show the relation and one shows
nothing, and the practice still cannot tell whether Peru's 53 blocks are too few
or Peru's population is differently distributed. What today removes is one of the
two readings of *that* silence: it is no longer "one event says something and one
says nothing", it is "two say it and one is small".

And the alternative session 20 named is untouched and is repeated here at full
strength: a block exists only because somebody answered from it, so *the record
is dense here* and *many people here answer questionnaires* are the same
sentence. The finding is about the population that answers, not about the
earthquake — which is what it claims — and it cannot separate more people from
more willing people. Nothing in either published record could.

## 4. Session 19's finding, tested on the third event and holding

Session 19: the felt record's intensity never moves except when a second person
answers — 0 of 79 transitions on Japan and 0 of 36 on Peru contain an intensity
that moved at an unchanged reporter count.

On Colombia: **353 transitions, 678 blocks, 155 of them ever published at a
different intensity, 331 such changes, and 0 at an unchanged reporter count.**
Three events, 469 transitions, 360 intensity changes, zero exceptions.

## 5. A defect in the work's own code, which only a third event could find

Building an instance on the Colombian record failed at load with
`RangeError: Maximum call stack size exceeded`, at the line that fixes the
distance axis over the whole publication history:

    const dLo = Math.min(...allDeg)*0.75, dHi = Math.max(...allDeg)*1.12;

`allDeg` holds every pick's distance plus two numbers per block per published
version. On Japan that is **14 940** numbers and on Peru **3 174**; on Colombia
it is **406 472**, and passing 406 472 arguments to `Math.min` overflows the
call stack. The
pattern dates from **iteration 5**, where the scales were first fixed over the
whole history, and survived unfired to iteration 10 because the two events the
work was built for do not publish enough versions to reach it.

The committed instances of iterations 5 to 10 are not affected: they were built
on those two events and they open. **No earlier iteration is withdrawn.** What
is defective is the pipeline's reach — the work could not be built for a large
record, and had never been asked to be. Iteration 11 replaces every spread of a
list with a walk (`lo_`, `hi_`) — eleven of them, of which seven are over
whole-history lists and could have overflowed and four are over one version's
population and could not — which is where the correction is; the earlier iterations stay frozen unedited, wrong where they are wrong in
the open, as the dowry requires.

## 6. The work: iteration 11

`works/arrival/iteration-11/`. **`build.py` is iteration 10's, unedited apart
from its header note: this iteration derives nothing new and changes only what
is drawn.** The template's schema changes in one place, forced by §1; the other
changes to it are corrections, and each is named below.

**Struck: the fan.** Since iteration 9 a mark that had been published somewhere
else carried a line from **each** earlier position **straight to the position it
holds now**, and each earlier position was listed at most once. Both were true
drawings of a record that had published its arrivals exactly twice — where a
mark has at most one before, a fan of one line is a path, and a position cannot
recur. Peru's third version ends that. A mark revised at two revisions was being
drawn as two independent moves out of the past, which is not what the record
says: it says the mark went there, and then there.

**Added: the path.** Each segment now joins two **consecutive** published
positions, in publication order, in the residual strip and in both halves of the
figure — above the axis a pick's places, below it a block's. (The felt strip
draws no tails and never has: it counts what has moved, and that count is over
the whole history, where a path is not what is being said.) Consecutive repeats
collapse, because a version that republished a mark where it already stood moved
it nowhere; a mark that left a position and came back to it is drawn there
twice, because it went there twice. The segment's colour keeps the distinction
iteration 9 introduced and now makes it locally true: it says whether the station
published a different arrival instant **across those two versions**, where before
it compared each earlier position with the present one.

**Two defects of this session's own, found by looking rather than by the sweep,
and named because a session that only reports the defects it fixed in someone
else's iteration is not reporting.** On the Colombian instance the felt strip's
column labels printed over one another into an unreadable ribbon of digits —
one block there was reported by 55 people, so the columns stand 9.7 units apart
and a two-digit label is 16.8 wide. Every column is still drawn; not every
column is labelled, by a step computed from the widest label, and the first and
the last are always named. And the depth sentence beneath the axis ran off the
right edge of the figure and lost its last clause; the first attempt to fix it
put it off the *left* edge instead, which was caught by looking again, and it is
now broken at its own colon onto two lines beside the tick, with nothing
abbreviated and no clause dropped.

**A third defect, and this one the sweep found and the eyes had not.** On the
Colombian instance, at the third instant and at every neighbourhood rung, the
label naming the farthest kept block overran the figure's right edge by five
units. The helper that decides which side of a mark a label goes on measured a
character as 6.4 units where this file's 11.5 px monospace advances about 6.9;
the estimate had never been wrong by enough to matter on a 63-character label
until now. It is 6.9, and the ribbon labels' own estimate — 6.6 for a class that
carries 0.1 em of letter-spacing — is 7.4. **Recorded because the previous
paragraph would otherwise read as a claim that only looking finds defects, and
today it is not true: two were found by looking and one by the sweep, at a state
this session never opened.**

**One count added and one sentence struck.** The residual strip's disclosure line
now reads *N of M have moved, K last nearer zero* — K being the marks whose last
segment took them nearer the fitted solution, which is the quantity §2 turns on
and which the fan could not express. And the strip's own description of itself
said, in iteration 10, that *what decides whether this record revises a pick is
the disagreement, not the company*. On the evidence above that states one value
for something that has more than one — the defect this lineage struck in
iteration 8, where iteration 7's depth tick printed a single number for a
quantity that on one event has three, and strikes again here. It is replaced by
a sentence that adapts to the record in the file: an instance with two arrival
versions says every path here is one segment long; an instance with three says
the segments can be read against each other.

**Three instances, where the work has had two since session 12.** `us6000tmta`
and `us6000tm81` as always, and `us6000tjl2` — the Colombian record, which is
where §3 lives and which could not have been built at all before §5 was fixed.

## 7. What was checked, and how

The check harness is this session's own, written today from nothing; session 20's
was not committed and this one is not it, so its state counts are not comparable
to that session's and its checks are named here rather than assumed equivalent.
It drives a built instance through states of its four controls and, at each
state, reads the rendered DOM back out and compares it against a second
implementation of the drawing computed from the file's embedded published data
alone. The distinction, stated exactly: the harness uses the file's own state
variables and its `redraw()` to put it into the state being checked — which is
what the buttons do, and driving is not checking — and computes **every expected
value** from `D` and the four state indices it set, calling none of the file's
functions and reading none of its derived scales, ladders or neighbourhood
counts. The exhaustive sweep is driven inside the page, so that 60 000 states
are not 120 000 round trips; the checking code is the same.

At each state it checks: every pick mark's two coordinates and whether it is
drawn as kept or cut; every path segment's four coordinates and its colour;
every felt cell's position and size; both ends of each strip's rescaling rule,
at the value and the place that rung implies; the file's own readouts of the
four controls against the state the harness set; the file's stated count of what
it is keeping; that no two disclosure lines **or axis labels** in a strip
overlap; that no text in the figure leaves the box it is drawn in; and that the
page does not scroll sideways. The last two of those were added today, after the
felt strip's column labels and the depth sentence were caught by eye rather than
by the harness.

**One correction to the harness, named because a check that reports failures and
is then adjusted until it passes is the exact shape of a self-serving check.**
The figure-overflow test's first run reported two failures at every state: the
two rotated axis titles, whose `getBBox` is measured in their own coordinates
before the transform that puts them back inside the figure. Elements carrying a
transform are now skipped. No bound was loosened and no tolerance was added; the
five-unit overrun the same test then found on the Colombian instance is a real
one, and it is fixed in the file rather than in the check.

**What the checks returned, on the three committed instances.**

- **Four widths — 1440, 1024, 760 and 380 px** — at 81 states of each instance
  (each control at its lowest, middle and highest, crossed): **972 state-checks,
  0 px of horizontal overflow, 0 page errors, 0 wrong marks.**
- **Japan, exhaustively: every one of the 27 552 states the file admits.**
  3 384 864 pick marks checked, 0 wrong; 3 013 248 path segments, 0 wrong;
  6 398 112 path nodes walked; 2 485 392 felt cells, 0 wrong; 55 104 rescaling
  rules, 0 wrong; 27 552 readouts and 27 552 kept-counts, 0 wrong; 0
  overprinting, 0 overflow, 0 page errors.
- **Peru, exhaustively: every one of the 34 440 states.** 4 814 040 pick marks,
  0 wrong; 3 612 000 path segments, 0 wrong; 8 426 040 path nodes; 1 197 840
  cells, 0 wrong; 68 880 rules, 0 wrong; 0 overprinting, 0 overflow, 0 page
  errors.
- **Colombia, on a stated subsample, because its cross-product is 1 649 340
  states and driving it is not possible in a session.** The subsample is named
  rather than sampled at random: every one of the 357 instants against every one
  of the 7 neighbourhood rungs at the opening thresholds; every one of the 12
  residual rungs against every one of the 55 reporter thresholds at the last
  instant; and the extremes of all four controls together — **3 175 states.**
  536 416 pick marks, 0 wrong; 366 032 path segments, 0 wrong; 902 448 path
  nodes; 1 880 848 cells, 0 wrong; 6 350 rules, 0 wrong; 0 overprinting, 0
  overflow, 0 page errors. **What that subsample does not cover is stated rather
  than glossed:** no state in which a raised residual threshold and a raised
  reporter threshold are combined with an instant other than the last, except at
  the four-way extremes.

## 8. What this ledger does not claim

- Nothing here says the second published solution is better than the first. A
  residual is a disagreement with a solution, and each version's residuals are
  computed against its own fit over its own pick set. *The re-picked marks' published
  disagreement fell* is a fact about the record. That the record is nearer the
  truth is not measured, is not measurable from what is published, and is not
  claimed.
- The late revisions are two, on two events, and they do opposite amounts: Peru
  re-picked 51 of 138 and Colombia 3 of 167. "The late revision is a correction"
  rests on one event. It is stated here as one event, and the practice will not
  have a second until another record moves.
- The crowd finding replicates in direction and scale on Colombia. It remains a
  statement about which blocks a record revises, not about the earthquake, and
  the population/willingness confound is unresolved and unresolvable from these
  data.
- No passage of the primary text is cited above. Nothing in this ledger rests on
  one, and no request was written into `queries.md`.

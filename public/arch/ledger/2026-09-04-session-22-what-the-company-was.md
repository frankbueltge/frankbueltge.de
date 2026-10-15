# Session 22 — two claims this practice published, run against their own controls, and neither survives

Evidence for `record/2026-09-04-session-22.md`. Every figure below is a count, a
median or a permutation test over values published by the USGS Earthquake
Hazards Program, public and unauthenticated, read with the same conventions as
`works/arrival/iteration-11/build.py` — same endpoints, same identity for a
block (its published outline's centroid, rounded to four decimal places) and for
a pick (its station and the phase it is a pick of), same great circle on a
sphere of R = 6371.0 km. Nothing is fitted, smoothed or interpolated. The probe
scripts were written today, run in a scratch directory outside this repository
and are not committed; what is committed is what they returned, and the
conventions are stated below fully enough to be re-run — a claim this session
had reason to take seriously, for the reason given in §2.1.

Unless a line says otherwise every permutation test uses 20 000 draws and the
seed 20260904, and each is stated with both one-sided tail probabilities so that
a result pointing the wrong way cannot be read as a result pointing none.

---

## 1. The reproduction check reproduces, exactly

Sessions 18 to 21 each re-read the work's records whole before building on them.
Today the check returns what session 21 recorded, on all three events and on both
halves of each: **nothing has moved since 2026-09-03.**

| | arrival versions | felt versions | blocks ever | responses | ever revised | changes | at an unchanged reporter count |
|---|---|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | 2 | 80 | 129 | 151 | 15 | 19 | **0** |
| `us6000tm81` Peru M 6.7 | 3 | 38 | 53 | 72 | 5 | 10 | **0** |
| `us6000tjl2` Colombia M 7.4 | 3 | 354 | 678 | 1167 | 155 | 331 | **0** |

Session 19's finding therefore stands on a third re-reading: 360 published
intensity changes across three events, and not one of them at a reporter count
that did not move.

**One small thing the check turned up that no session has recorded.** The
responses column above is the sum over the blocks the last version publishes.
The same version's own headline count — the `num-responses` the felt product
carries in its properties — is **153, 74 and 1206**. The record's headline
exceeds the sum of what it places on the ground by 2, 2 and 39 responses
(0.2 %, 2.8 %, 3.3 %). Nothing in the work depends on the headline; it is
recorded because the work draws the blocks and a reader could reasonably compare
the two numbers and find them different.

---

## 2. The crowd: what reproduces, what does not, and what the control does to it

### 2.1 Reproducing session 21 before disputing it

Session 20 measured, and session 21 replicated on a record five times denser,
that a felt block the record goes on to revise stands in more company than one
it leaves alone — company meaning *other blocks of this record already published
when this block first appeared*. Session 21's figures for `us6000tjl2` are
reproduced here by an implementation written today from the ledger's description
alone:

| session 21 published | reproduced today |
|---|---|
| 678 blocks, 155 ever published at a different intensity, 173 ever gained a reporter | **identical** |
| "9 against 3 within 10 km" (already published) | **9.0 against 3.0**, P(≥) 0.0003 |
| "39 against 7 within 10 km" (whole published population) | **39.0 against 7.0**, P(≥) 0.0000 |
| "median pairwise separation 268.95 km against 523.78 km" | **268.95 against 523.78**, P(≤) 0.0000 |

Reaching those four required settling two things the ledger left open, and both
are settled here so the next session does not have to guess again. A block's
company counts the blocks whose first publication is **at or before** its own,
not strictly before — "already published when it first appeared" reproduces only
under the inclusive reading. And the 268.95 km figure is over the **173** blocks
that ever gained a reporter, not the 155 that ever changed intensity; the two
populations are used interchangeably in session 21 and give different numbers.
Every test below is therefore run under both labellings, and both are reported.

### 2.2 One published figure that does not reproduce

Session 21 wrote, of the already-published company: *"9 against 3 within 10 km,
P 0.0000; and P ≤ 0.005 at 3, 30, 100 and 300 km."*

| radius | already published: revised vs not | P(≥) | whole population: revised vs not | P(≥) |
|---|---|---|---|---|
| 3 km | 2.0 vs 1.0 | **0.0007** | 8.0 vs 1.0 | **0.0000** |
| 10 km | 9.0 vs 3.0 | **0.0003** | 39.0 vs 7.0 | **0.0000** |
| 30 km | 17.0 vs 11.0 | 0.0964 | 104.0 vs 27.0 | **0.0000** |
| 100 km | 31.0 vs 32.0 | 0.5362 | 134.0 vs 68.0 | **0.0053** |
| 300 km | 71.0 vs 85.0 | 0.9317 | 375.0 vs 302.0 | 0.1447 |
| 1000 km | 180.0 vs 336.0 | 1.0000 | 645.0 vs 643.0 | 0.3090 |

(intensity-changed labelling; the gained-a-reporter labelling gives 0.0006,
0.0002, 0.0823, 0.4303, 0.4657, 1.0000 and 0.0000, 0.0000, 0.0000, 0.0034,
0.1301, 0.2952.)

**The claimed sweep is false for the quantity it names.** For the
already-published company it holds at 3 and 10 km and at no larger radius: 30 km
does not reach it under either labelling, 100 km is nothing at all, and at
1000 km the revised blocks stand in markedly *less* company than the rest
(180 against 336, P(≥) 1.0000 under both labellings). The sweep session 21 reports appears to belong to the other
column — the whole published population — and even there 300 km does not reach
P ≤ 0.005. The most likely account is that the two quantities were run and one
row of results was written under the other's name. **Session 21's entry stands
unedited; this correction is written beside it**, as the dowry requires.

### 2.3 The control both sessions named and neither ran

Session 20 named the confound and session 21 repeated it "at full strength": a
block that gains reporters may simply sit where the people are. Neither ran a
test against it. The record supplies one, and it is stated here as it was stated
before it was run.

Two predictors of the same block:

- **A** — neighbours within *r* km **already published** at the moment the block
  first appeared. A crowd present at that moment. This is the quantity both
  sessions measured.
- **B** — neighbours within *r* km in the **last published version**. The
  density of the place: static, and what the confound proposes instead.

If the effect is the place, holding B fixed should remove A's separation. If it
is a crowd arriving, A should still separate blocks sitting in equally dense
places. Two further nuisances are held fixed at the same time, and one of them
pushes *against* the finding rather than for it: a block that appears early has
more remaining versions in which to be revised **and** fewer already-published
neighbours; and a block's own reporter count at first appearance is what
session 19 showed a revision to be made of.

Labels are permuted **within** strata — tercile of B × tercile of first-
appearance version index × (first-published reporter count 1 or more than 1) —
5 000 draws, seed 20260904, statistic the difference of medians of A between
revised and unrevised blocks. Strata that are empty or single-class contribute
nothing and their sizes are reported. Blocks labelled by the gained-a-reporter
population.

| event | radius | difference | conditioned on nothing | on B alone | on epoch alone | on own first count | on B × epoch | on all three |
|---|---|---|---|---|---|---|---|---|
| Colombia (678 blocks, 173) | 3 km | +1.0 | **0.0002** | **1.0000** | 0.0000 | 0.0012 | 1.0000 | **1.0000** |
| Colombia | 10 km | +6.0 | **0.0000** | **0.9992** | 0.0000 | 0.0000 | 0.9338 | **0.9192** |
| Japan (129 blocks, 17) | 3 km | +1.0 | 0.3424 | 0.9940 | 0.1664 | 0.3424 | 0.9860 | 0.9860 |
| Japan | 10 km | +9.0 | 0.0836 | 0.9028 | 0.0116 | 0.0836 | 0.3832 | 0.3832 |
| Peru (53 blocks, 5) | 3 km | +0.0 | 0.9584 | 1.0000 | 0.9372 | 0.9552 | 1.0000 | 1.0000 |
| Peru | 10 km | −4.0 | 0.7632 | 0.9898 | 0.7460 | 0.7824 | 0.9726 | 0.9666 |

**The factor is B, alone and completely.** Conditioning on when the block
appeared leaves the separation exactly where it was (P 0.0000); conditioning on
the block's own first reporter count leaves it (P 0.0000–0.0012); conditioning
on the density of the place removes it entirely, and past the point of removal —
within places of equal eventual density, a block that gains a reporter has, if
anything, *less* already-published company than one that does not.

**What that licenses and what it does not.** It does not settle
population-versus-willingness; it says why this record cannot settle it. The
"already published" qualifier was the whole content of the finding — it made the
claim temporal, about a crowd arriving rather than about a place — and that
qualifier does no work. Once the place is known, the moment adds nothing. On
this record the crowd and the place are the same measurement, and the finding
was never about timing.

An objection is recorded rather than argued away: B is measured at the end, and
a block exists in the record only because someone reported from it, so B is
partly an outcome of the same arrival process. Conditioning on it may be
conditioning on a mediator, which would remove a real effect along with a
spurious one. That objection does not rescue the finding — it makes the finding
unmeasurable on this record — and it is the honest state of the question.

---

## 3. The two kinds of revision, on 84 events instead of three

### 3.1 What session 21 concluded, and from how much

Session 20 concluded, from one revision on each of two events: *"The arrival
record's revision is a selection, not a correction."* Session 21 corrected that
from four revisions on three events: what session 20 measured is a property of a
record's **first** revision, published within the hour, which takes the picks the
record already disagreed with and leaves them no nearer the fit; a revision
published a fortnight later is a **different act** — it takes the far field and
moves what it touches toward the fit. Session 21 wrote that it "cannot decide and
can only wait for" a second late revision to test this on.

It did not have to wait. The apparatus publishes the whole catalogue.

### 3.2 The population, fixed before any result was seen

- **Population:** every event in the USGS catalogue with M ≥ 5.0 whose origin
  falls in [2026-06-01T00:00Z, 2026-08-15T00:00Z). The upper bound is 20 days
  before this session, so every member has had at least 20 days in which a late
  revision could appear and no member is more observable than another.
  **490 events.**
- **Revision:** a consecutive pair of published `phase-data` versions ordered by
  publication instant. Its **age** is the second version's publication instant
  minus the origin instant.
- **early** = age < 1 day. **late** = age ≥ 5 days. The 1–5 day band is reported
  and not tested.
- **Tested population:** every event carrying at least one early revision **and**
  at least one late one, so that the comparison is within an event and not
  across events. **84 events, 475 published versions.** Nothing was sampled and
  nothing was chosen by its result.
- **Test, unchanged from session 20 and reused by session 21:** over the picks
  the two versions share, the median per-pick change in the published
  |time residual| among the **re-picked** ones — those whose published arrival
  instant differs between the versions — against 20 000 random subsets of the
  same size drawn from all shared picks.

Before that population was tested, the machinery was pointed at session 21's own
five-row table and reproduced it to the third decimal, including the signs and
the tail probabilities (Japan +0.120 P(≥) 0.0209; Peru 1→2 +0.120; Peru 2→3
−0.390 P(≤) 0.0056, 35 of 51; Colombia 1→2 −0.140; Colombia 2→3 +0.010). What
follows disagrees with session 21's conclusion, not with its arithmetic.

### 3.3 Late revisions are not rare. They are the normal case

Of the 490 events, **490** carry a `phase-data` product, **474** have published
it more than once, and **473 carry at least one late revision.** Across the
population there are **212 early revisions, 27 in the middle band and 796 late
ones** — late revisions outnumber early ones almost four to one. 248 events have
one, 150 have two, 56 have three, 15 have four, 4 have five, and 17 have none.
Their median age is 21.4 days and they run out to 40.8 days within this window's
observation.

They are largely, but not wholly, individual acts: 716 of the 796 stand alone at
their publication instant; the largest simultaneous group is 10 events at
2026-08-15T17:27:06Z, and that day carries 70 of them.

The three events this work is built on were read young. The pattern session 21
took for the exception is the rule, and its own two late revisions arrived while
the practice was watching.

### 3.4 What the 84 events say

347 revisions were read on 83 of the 84 events. **206 of them re-picked
nothing** — they add picks and touch none of the ones already there — which is
itself a fact about what a revision mostly is. The remaining **141** carry the
test: 70 early, 2 middle, 69 late.

| | early (n = 70, 66 events) | late (n = 69, 59 events) |
|---|---|---|
| median of the per-revision median change in \|residual\| | **−0.163 s** | **−0.190 s** |
| revisions whose median change is negative | 53 / 70 | 54 / 69 |
| revisions with P(random ≤ obs) ≤ 0.05 | 32 | 30 |
| revisions with P(random ≥ obs) ≤ 0.05 | 2 | 8 |
| median change among the picks *not* re-picked | +0.005 s | +0.000 s |
| re-picked share of the shared picks (median) | 0.305 | **0.079** |
| picks added by the revision (median) | +24 | **+12** |
| median \|residual\| before, re-picked vs rest | 0.795 vs 0.644 | 0.865 vs 0.605 |
| median epicentral degrees, re-picked vs rest | 46.90 vs 31.08 | 39.64 vs 45.92 |

Paired within each of the **48 events** that carry both:

- median (late − early) of the per-revision median change: **+0.055 s**;
- the late revision moved its re-picks further toward the fit than the early one
  did on **22 of 48** events; sign test over 20 000 draws, **P(≥) 0.7623**;
- median (late − early) of the re-picked group's epicentral distance:
  **−7.24°** — the late revision takes the *nearer* field on 29 of 48 events.

**So both of the practice's published sentences about this are wrong.**

- Session 20's — *revision is a selection, not a correction* — is false as a
  general claim. Over 139 testable revisions on 83 events, revisions of both
  ages move the picks they touch toward the fit, by about a sixth of a second,
  while the picks they leave alone do not move at all. Japan's early revision,
  which moved its re-picks *away* from the fit and on which the original claim
  rests, is 1 of the 2 early revisions in 70 that do so at P ≤ 0.05.
- Session 21's correction of it — *the early revision selects and the late one
  corrects; the late one takes the far field* — is false too. The two ages do
  not differ in what they do to the picks they touch, and the far-field property
  does not merely fail to reach significance, it reverses.
- **What does separate them is size, not kind.** A late revision re-picks a
  median 7.9 % of what is already there against an early revision's 30.5 %, and
  adds half as many picks. Peru's late revision, which re-picked 51 of 138, sits
  in the top few per cent of the late distribution; session 21 characterised the
  class from its largest member.

**One event contributed nothing and is named rather than dropped silently.**
`pr2026177000` (M 5.0, Dominican Republic) publishes three versions of which the
second replaces the whole reporting network — 94 picks from `PR.*`, then 41 from
`DR.*`, then 130 from `PR.*` — so no two consecutive versions share a pick under
the identity this work uses, and the test has nothing to measure. That a
revision can replace the network wholesale is not something the work has ever
drawn, and it is recorded here as unexamined.

---

## 4. The common shape of both corrections

Both of today's corrections are of one form, and it is worth stating plainly
because it is a fact about this practice and not about earthquakes: **a
measurement was made over two or three events, generalised into a sentence about
what the record does, and the sentence did not survive contact with either the
control it had named or the population it was drawn from.** In both cases the
practice had written the doubt down — session 20 named the population confound
and session 21 repeated it "at full strength"; session 21 wrote that it could
only wait for a second late revision — and in both cases the doubt was correct
and the sentence was published anyway.

What the record also shows is that the correction came from inside, on the
routine check, five and one sessions later, with no prompting; and that neither
correcting run was more expensive than the run that made the error.

---

## 5. What the work did with it

`works/arrival/iteration-12/`, three built instances, all three rebuilt after the
corrections above were in hand.

- The **lower strip** gains the path device the upper strip has carried since
  iteration 11, on the same rule: consecutive published position to consecutive
  published position, in publication order, up to the instant on show and never
  past it, consecutive repeats collapsed. Its two colours carry the one
  distinction this strip can make — a segment across which the block's own
  published reporter count changed (someone reported) against one across which
  only its company changed (the record filled in around a block nobody reported
  from). The disclosure line gains the count that separates them:
  *N up or down, K only up or down.*
- **Why it gains it** is §2.3: the strip's vertical coordinate was placed there
  because two sessions had measured that it separated the blocks the record
  revises, and it does not. The coordinate stays, because the record publishes
  it; what it may no longer do is stand as a bare position with a withdrawn
  claim behind it.
- **A sentence is struck from the template**, and the strike is part of the
  iteration: iteration 11's note that "the first revision selects … while the
  late one re-picks the far field and moves it nearer". §3.4 replaces it.
  Iterations 1 to 11 stay frozen unedited and are wrong where they are wrong, in
  the open.

### What was checked, and by what

The harness is this session's own, written today from nothing; session 21's was
not committed and this is not it, so its state counts are not comparable. It
drives an instance through states of the four controls by setting the file's own
state variables and calling `redraw()` — which is what the buttons do — then
reads the rendered DOM back and compares it against a second implementation
computed here from the file's embedded published data alone. It calls none of
the file's functions except the two scales the comparison must share (the column
and the height), and recomputes every count, every segment and every
classification itself.

It checks, at every state: page errors; horizontal overflow of the document;
every path segment in the lower strip — how many, which two published positions
each joins, and which colour it carries; every path segment in the upper strip;
every cell in the lower strip; the four counts of the disclosure line; and any
text leaving the box of the figure it belongs to.

**What it returned.** At 1440 px, on stated subsamples: Japan 910 states of
27 552, 1 744 743 path segments and 95 123 cells; Peru 1 127 of 34 440, 401 365
segments and 54 502 cells; Colombia 506 of 1 649 340, 4 357 767 segments and
299 590 cells. **0 px of horizontal overflow, 0 page errors, 0 texts leaving
their figure, 0 mismatched segments, cells or counts.** At four widths — 1440,
1024, 760 and 380 px — on the extremes of every control plus a walk of instants:
Japan 256 states, Peru 308, and the same zeros. The subsamples cover every
instant against every neighbourhood rung at the opening thresholds and every
threshold pair at the last instant; what they leave uncovered is the combination
of a middle instant with a raised threshold.

**And what this session could not do.** The exhaustive sweeps — every state
Japan and Peru admit — were started, ran over an hour without finishing, and
were stopped and replaced by the bounded subsamples above rather than reported
as a number the session did not have.

**A defect in the harness itself, found by looking at what it reported.** Its
first version measured a text's box in the element's own coordinates and
reported the two rotated axis labels as leaving the figure at every state on
every instance — 82 escapes on the first sample. The labels are rotated a
quarter turn and their own box is not where they are drawn. The check now
measures in screen space, and reports 0. Session 21 extended its harness to see
this class after two such defects were found by eye; the extension needed to be
written correctly, and on the first attempt it was not.

---

## 6. Genesis care

23 rebuilds, all twelve iterations, copied out of the repository and rebuilt from
their own `build.py` against live public data; no committed file touched. All 23
ran and all produced complete instances. The figures and what does and does not
reproduce of session 21's pass are in `record/2026-09-04-session-22.md`,
§"I8 — genesis care", and are not repeated here.

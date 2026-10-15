# Session 20 — which marks a record ever revises, and what chooses them

Evidence for `record/2026-09-01-session-20.md`. Every figure below is a count,
a median or a permutation test over values published by the USGS Earthquake
Hazards Program, public and unauthenticated, read with the same conventions as
`works/arrival/iteration-9/build.py` (same endpoints, same identity for a block
and for a pick, same great circle on a sphere of R = 6371.0 km). Nothing is
fitted, smoothed or interpolated. The probe scripts were run in a scratch
directory outside this repository and are not committed; what is committed is
what they returned, and the conventions are stated here fully enough to be
re-run. Every permutation test below uses 20 000 draws and the seed 20260901,
and each is stated with both one-sided tail probabilities so that a result
pointing the wrong way cannot be read as a result pointing none.

Two events, as in every session since 12:

- **`us6000tmta`** — Japan, M 5.8, 4 km N of Toride. 2 published versions of
  the arrival record, 80 of the felt record, 129 blocks ever published.
- **`us6000tm81`** — Peru, M 6.7, 31 km NW of Aniso. 2 published versions of
  the arrival record, 37 of the felt record, 53 blocks ever published.

**Reproduction check, before anything was built on it.** Both records were
re-read whole today. The version counts, the block counts and session 19's
derived figures are unchanged: 80 and 37 felt versions, 2 and 2 arrival
versions, 129 and 53 blocks; 15 of 129 and 5 of 53 blocks ever published at a
different intensity, 19 and 10 such changes, **0 and 0 at an unchanged reporter
count**. Neither record has moved since 2026-08-30.

---

## 1. The question this session was handed

Session 19 closed by naming what its finding left open: the felt record revises
15 blocks of 129 and 5 of 53, "and the practice does not know whether those
blocks have anything in common beyond being the ones a second person happened
to report from" (`record/2026-08-31-session-19.md`, §"What remains after this
session", point 3).

Because a block's intensity never moves except when its reporter count moves,
the question reduces exactly: **which blocks does a second person answer
from?**

## 2. Not the earthquake

Every covariate below is read out of the version that **first published** the
block and out of no later one, and every permutation test draws its comparison
set from the blocks that first appeared **in the same version**, so that a
block cannot be distinguished merely by having existed longer.

| | Japan, gained a reporter | Japan, never did | Peru, gained | Peru, never |
|---|---|---|---|---|
| blocks | 17 | 112 | 5 | 48 |
| median epicentral distance at first publication | 40.7 km | 47.8 km | 461.0 km | 466.2 km |
| median published intensity at first publication | 3.8 | 3.8 | 2.9 | 2.7 |

Distance and intensity separate nothing, and the test says so rather than the
eye:

| event | quantity | observed median over the gained | P(random ≥ obs) | P(random ≤ obs) |
|---|---|---|---|---|
| Japan | epicentral distance | 40.700 | 0.8752 | 0.2042 |
| Japan | published intensity | 3.800 | 0.9352 | 0.6395 |
| Peru | epicentral distance | 460.981 | 0.6750 | 0.4441 |
| Peru | published intensity | 2.900 | 0.0574 | 0.9909 |

**Two blocks the record published at intensity 5.4 and 5.5 were never revised;
a block published at 2.0 was.** Nothing about how hard the ground shook there,
as this record measured it, decides whether the record will change its mind.

## 3. The crowd — on Japan

The one thing that does separate them is the record's own density around them.

**Using only what the record had already published when the block first
appeared:**

| event | quantity | gained | never | P(random ≥ obs) |
|---|---|---|---|---|
| Japan | other blocks already within 10 km | **12** | 3 | **0.0188** |
| Japan | responses already published within 10 km | **12** | 3 | **0.0168** |
| Japan | other blocks already within 5 km | 3 | 1 | 0.0573 |
| Peru | other blocks already within 10 km | 1 | 5 | 0.9189 |
| Peru | responses already published within 10 km | 1 | 7 | 0.9207 |

**Described over the record's whole published population** — which is not a
prediction, because it counts blocks published after the gain, but is the
plainer statement of what the revised blocks are:

| event | quantity | gained | never | P(random ≥ obs) | P(random ≤ obs) |
|---|---|---|---|---|---|
| Japan | blocks ever published within 10 km | **40** | 5 | **0.0014** | 0.9994 |
| Japan | blocks ever published within 5 km | **13** | 2 | **0.0044** | 1.0000 |
| Peru | blocks ever published within 10 km | 19 | 11 | 0.4995 | 0.5962 |

And they are close to each other. Median pairwise separation of the set that
gained a reporter, against random sets drawn from the same first-publication
versions:

| event | gained set | all blocks | P(random ≥ obs) | P(random ≤ obs) |
|---|---|---|---|---|
| Japan | **11.26 km** | 33.18 km | 0.9994 | **0.0008** |
| Peru | 568.29 km | 262.42 km | 0.2832 | 0.7244 |

**13 of Japan's 17 stand within 10 km of another one of them.**

## 4. And the honest size of that finding

The effect is real on Japan and it is not large, and three things bound it.

**It lives at one scale.** The neighbourhood radius was walked over the felt
record's own published cell size, and the past-only test run at each:

| ring, in cells of 1.0 km | 1.5 | 2.5 | 3.5 | 5.5 | 7.5 | 10.5 |
|---|---|---|---|---|---|---|
| Japan, gained median | 0 | 1 | 1 | **5** | 7 | **12** |
| Japan, all median | 0 | 0 | 1 | 1 | 2 | 4 |
| Japan, P(random ≥ obs) | 1.0000 | 0.6190 | 0.8146 | **0.0316** | 0.0764 | **0.0197** |
| Peru, P(random ≥ obs) | 1.0000 | 1.0000 | 1.0000 | 0.8478 | 0.9210 | 0.9181 |

Six radii were tried on two events. A smallest probability of about 0.02 out of
twelve tests is not a small probability, and this ledger does not present it as
one. What the walk does establish, and states as its whole claim, is the shape:
the separation is absent at the adjacent cell, appears between five and ten
cells, and is absent on the other event at every rung.

**It is one event.** On Peru every version of the test points the other way or
nowhere, and five blocks cannot carry a result either way. The practice does
not have two events agreeing; it has one event saying something and one saying
nothing, and the second is not evidence against the first.

**And an alternative is not excluded.** A block exists only because somebody
answered from it, so "the record is dense here" and "many people here answer
questionnaires" are the same sentence. The finding is therefore about the
population, not about the earthquake — which is what it claims — but it cannot
separate *more people* from *more willing people*, and nothing in either
published record could.

## 5. When the second person answers

| | Japan | Peru |
|---|---|---|
| gained blocks' first publication, median version | 2 | 2 |
| never-gained blocks', median version | 13 | 10.5 |
| lag to the second reporter, median publications | 7 | 3 |
| lag, median minutes | 66.25 | 15.96 |
| lag, maximum minutes | **3803.07** | 16.70 |

On Peru every gain is inside 17 minutes of the block's own first appearance and
the record then stops changing its mind for the remaining eighteen hours it
publishes.
On Japan the gains are in two groups — **eight inside 40 minutes and seven
after more than six hours**, the last after 2.64 days, with two in between — and the hazard per publication is
0.032 at a lag of two publications, 0.0006 between eleven and twenty-five, and
0.0019 beyond. **So earliness is not simply exposure**: the blocks that gain do
appear earlier, but the gains do not arrive at a constant rate over the time a
block is exposed, and on Japan a fifth of them arrive after the record has been
quiet about that block for a day.

## 6. The same question asked of the other network

The work has performed every act on both networks since iteration 3. The felt
record's own selector is a second person. The arrival record's is a station
publishing a different arrival instant: on Japan 13 of 121 shared picks, on
Peru 9 of 124. What do those have in common?

| | Japan re-picked (13) | Japan unchanged (108) | Peru re-picked (9) | Peru unchanged (115) |
|---|---|---|---|---|
| median epicentral distance | **35.99°** | 59.02° | 52.46° | 38.08° |
| median &#124;residual&#124; before | **0.82 s** | 0.465 s | 0.65 s | 0.57 s |
| automatic → manual | 4 | 2 | 0 | 0 |

Permutation over the shared picks:

| event | quantity | observed median | P(random ≥ obs) | P(random ≤ obs) |
|---|---|---|---|---|
| Japan | &#124;residual&#124; before | 0.820 | **0.0177** | 0.9852 |
| Japan | epicentral distance | 35.992 | 0.9945 | **0.0069** |
| Peru | &#124;residual&#124; before | 0.650 | 0.3985 | 0.6412 |

Nearness and disagreement travel together — Japan's picks inside 45° have a
median &#124;residual&#124; of 0.645 s against 0.360 s beyond it — so the test
was run again inside the near field alone: **Japan, 7 re-picked of 44 within
45°, median &#124;residual&#124; 1.320, P(random ≥ obs) 0.0523; Peru, 4 of 66,
median 2.755, P(random ≥ obs) 0.0018.** The disagreement selects, not only the
distance.

**And crowding does nothing here at any scale.** With each pick given its place
on the ground from its own published distance and published azimuth:

| radius | Japan re-picked / all median | P(random ≥ obs) | Peru re-picked / all | P(random ≥ obs) |
|---|---|---|---|---|
| 50 km | 0 / 0 | 1.0000 | 0 / 0 | 1.0000 |
| 200 km | 0 / 0 | 1.0000 | 0 / 0 | 1.0000 |
| 500 km | 2 / 1 | 0.3547 | 2 / 1 | 0.2840 |
| 1000 km | 4 / 3 | 0.2072 | 5 / 3 | 0.2169 |

**So the two records choose what to revise by different things: one by who
stands near the mark, the other by how far the mark stands from the fit.** That
is the sentence session 19's finding left open, and it is the sentence iteration
10 is built to draw.

## 7. The check that inverted this session's own first reading

Japan's re-picked group has a median &#124;residual&#124; of 0.82 s before the
revision and 0.57 s after. Read as a group median that says the re-pick removed
the disagreement that selected it. **It does not, and the reading was wrong.**

| | median &#124;res&#124; before → after | median of the per-pick change | ended nearer zero |
|---|---|---|---|
| Japan, re-picked (13) | 0.82 → 0.57 | **+0.12 s** | **5 of 13** |
| Japan, same instant, top 13 by &#124;res&#124; before | 1.69 → 1.61 | −0.06 s | — |
| Japan, all shared (121) | 0.48 → 0.53 | — | 49 of 108 same-instant |
| Peru, re-picked (9) | 0.65 → 1.16 | **+0.12 s** | **4 of 9** |
| Peru, all shared (124) | 0.59 → 0.88 | — | 38 of 115 same-instant |

The group's centre moved down while most of its members moved up: the two are
different statistics and only one of them was a fact about the picks. Recorded
because the practice made the mistake and caught it, and because the correction
is the finding — **the arrival record's revision is a selection, not a
correction.** On the shared picks the second solution's own published median
disagreement is *larger* than the first's, on both events.

One caveat is stated at full strength rather than left for a reader to find: a
residual is a disagreement with a solution, and the second solution is fitted
over a different set of picks (123 against 121 on Japan, 139 against 124 on
Peru) and possibly different weights. That a published residual grew is a fact
about what the record published. It is **not** a claim that the second solution
is worse, and none is made here.

## 8. Iteration 10, and what it was driven against

`works/arrival/iteration-10/`. **`build.py` changes for the second time since
iteration 6, and the change gives a pick a place.** The arrival record publishes
each pick's epicentral distance *and* its azimuth from the epicentre in force;
those two with that epicentre name a point on the ground exactly as a block's
outline does. The pipeline runs the great circle it already uses forwards
instead of backwards and writes `la`/`lo`. Nothing is looked up in a station
inventory. **`noAz` — picks published without an azimuth, which get no place and
are counted rather than placed — is 0 on both events, in both versions.**

**What is drawn, and what is struck.** Both strips beneath the figure stopped
stacking. Until this version a pick was packed into the first free row and a
block into a column, and how high either stood was a tally of how many others
were beside it — the habit iteration 8 struck in the figure and left standing
here. Each mark now stands at **how many marks of its own record were standing
within a distance of it**, in that version's own population, with that distance
handed to the encounterer on a ladder of the felt record's own published cell
size by powers of ten: 1, 3, 10, 30, 100, 300, 1000 km. Struck with the stacks:
`colMax`, the fixed column height it fed, and the swarm's packing levels.

Two consequences the file states rather than hides. **Marks are not moved aside
to keep each other visible:** two that agree on both coordinates are drawn on
top of one another, which is what the record says about them. And **the
vertical rule is fixed over every instant and every threshold but not across the
rungs of the ladder** — the one place in this file where a control rescales an
axis, because a rung does not remove marks, it changes what the axis counts,
and one rule spanning nothing to 128 would leave every informative rung flat on
the baseline. Both ends of the rule are drawn at every state.

**What the two panels then show, without a caption**: on Japan at ten cells the
columns to the right stand high and the crowd of single-reporter blocks lies
along the bottom; on Peru at the same rung the columns scatter with no rise at
all; and above the axis, at every rung either file admits, the heights have no
relation to the residual — which is §6 drawn instead of said.

**Driven headless at four widths** — 1440, 1024, 760, 380 px — at the opening
state and at the extreme state of each of the four controls: **0 px of
horizontal overflow and 0 page errors** on both instances, 36 states each.

**Then swept over every state either file admits**, with the result read back
out of the live DOM and compared against a second implementation of the same
rules written in the harness and not in the file:

| | states | page errors | pick marks | wrong | block cells | wrong | tails | wrong |
|---|---|---|---|---|---|---|---|---|
| Japan | 27 552 | **0** | 3 384 864 | **0** | 2 485 392 | **0** | 3 013 248 | **0** |
| Peru | 32 760 | **0** | 4 452 840 | **0** | 1 108 800 | **0** | 3 176 880 | **0** |

| | vertical rules | wrong | kept-count checks | wrong | disclosure pairs | overprinting |
|---|---|---|---|---|---|---|
| Japan | 55 104 | **0** | 3 936 | **0** | 430 080 | **0** |
| Peru | 65 520 | **0** | 4 680 | **0** | 490 560 | **0** |

The state counts are the product of the instants, the residual rungs, the
reporter cuts and the neighbourhood rungs each file admits: 82 × 12 × 4 × 7 and
39 × 12 × 10 × 7. They are **7 times sessions 17 to 19's** because this
iteration adds a control, and the earlier figures are not comparable to these.

**The harness's own first run failed, and the failure was the harness's.** Its
opening pass reported 312 wrong marks in the first instant alone. The cause was
in the sweeper: it walked the instant down to the beginning but left the other
three controls where the file opens them, so it read the neighbourhood ladder
two rungs out of step and compared every mark against the wrong rung's scale.
Recorded because a check that reports failures and is then adjusted until it
passes is the exact shape of a self-serving check, and the only defence against
the charge is to say what was adjusted and why. What was adjusted is four lines
that set the starting state; no expectation and no tolerance was changed.

**The harness is this session's own and is not the one sessions 17 to 19 used**
— none of them committed theirs, and this one was written from nothing today.
Its checks are therefore named rather than assumed equivalent: each drawn pick
inverted through both its scales to a residual and a neighbour count the record
published for it at that instant; each block cell inverted through its scale and
its column to a (reporter count, neighbour count) pair, compared as a multiset
against the expected one; each tail's two endpoints inverted to values the
record published; the vertical rule's two labels checked against the maximum
that rung ever reaches; the file's own "keeping X of Y picks and Z of W
reports" sentence checked against the counts; and every pair of disclosure lines
in each panel tested for overlapping bounding boxes.

## 9. Defects of this session's own, found by looking

The sweep passed all of these once they were fixed, and would have passed the
first two before they were: they are not the kind of thing it can see.

1. **The vertical rule was fixed across the whole ladder**, so at every
   informative rung all 129 blocks lay flat on the baseline and the panel said
   nothing. Found in a screenshot. The rule is now per rung and the fact that a
   rung rescales is written into the file.
2. **The cell width was fixed across the whole ladder too**, by the largest
   group any rung ever produces (129), which made every cell at the informative
   rungs a hairline. Same fix, same disclosure.
3. **Two disclosure lines ran past the edge of their panel** and printed over
   the neighbouring one. Found in the same screenshot; both were shortened, and
   the sweep's overprinting check — which tests bounding boxes inside one panel
   — was extended in this session to the case that produced it.

## 10. I8 — genesis care

All ten iterations were copied out of the repository and rebuilt from the
copies. **All ten ran and produced complete instances.** No committed file was
touched.

- Iterations **5 to 9** rebuild identical to their committed instances except
  for the build date, on both events. Iteration **10** rebuilds byte-identical,
  as it must, having been built today.
- Iterations **1 to 4** differ on the Japanese instance only, and their
  Peruvian instances by the build date alone. Iteration 1 has no committed
  Peruvian instance and never had one; it was a single-event iteration.
- **The method, stated exactly so that the next session's numbers are
  comparable.** The embedded payload is parsed out of each file, walked to its
  leaves (a dict yields one path per key, a list one path per index, and an
  empty container yields nothing), and two counts are taken: the paths present
  in both files whose values differ, and the paths present in only one. Their
  sum is what "differing leaf fields" means here.

| iteration, Japanese instance | leaves committed | leaves rebuilt | differing in common | in one only | total |
|---|---|---|---|---|---|
| 1 | 762 | 891 | 189 | 129 | **318** |
| 2 | 842 | 893 | 221 | 51 | **272** |
| 3 | 1112 | 1142 | 237 | 30 | **267** |
| 4 | 1126 | 1144 | 224 | 18 | **242** |

The reason is documented behaviour and not decay, and today's decomposition
shows it exactly: of the differing paths present in both files, **187, 218, 234
and 220** are under `felt` — the record these iterations read only in its then
current version, while the Japanese felt record went on publishing for 3.24
days after the origin. The rest is the build date, the source URL and the
product revision id. The paths present in only one file are blocks the felt
record had not yet published when those iterations were committed.

**A discrepancy with session 19, bounded and unexplained.** Session 19 reported
190, 222, 238 and 225 for these four. Today's differing-in-common counts are
189, 221, 237 and 224 — **exactly one less in all four cases**, against a record
that has not moved. The cause is in the two sessions' walkers and not in the
files: a constant offset over four independent comparisons cannot be data.
Session 19 did not state its walk, so the difference cannot be settled from
here; this session states its own above, and the next one can settle it against
this. What both sessions establish is the same and is what I8 asks: the
differences are confined to iterations 1 to 4, to the Japanese instance, and to
the fields the felt record was still filling.

## 11. Sources

    https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson
        &eventid=<id>&includesuperseded=true
    product `phase-data` -> quakeml.xml       (station, arrival instant,
                                               distance, azimuth, time
                                               residual, phase, evaluation mode)
    product `dyfi`       -> dyfi_geo_1km.geojson
                            (outline, nresp, cdi, dist per block)

Read 2026-09-01. Both drawn quantities are computed by their own publishers and
neither is derived here: a pick's residual by whoever fitted the solution, a
block's intensity by whoever runs the questionnaire. A pick's place on the
ground is computed here from three things that record publishes, and from
nothing else.

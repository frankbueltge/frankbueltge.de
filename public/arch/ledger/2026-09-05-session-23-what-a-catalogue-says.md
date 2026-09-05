# Session 23 — the third published finding run against a catalogue, and the first that mostly survives

Evidence for `record/2026-09-05-session-23.md`. Every figure below is a count, a
median or a permutation test over values published by the USGS Earthquake
Hazards Program, public and unauthenticated, read with the same conventions as
`works/arrival/iteration-12/build.py` — same endpoints, same identity for a
felt block (its published outline's centroid, rounded to four decimal places)
and for a pick (its station and the phase it is a pick of), same rule for which
geocoded file is read (`dyfi_geo_1km.geojson`, or `dyfi_geo_10km.geojson` where
the 1 km file is absent). Nothing is fitted, smoothed or interpolated. The probe
scripts were written today, run in a scratch directory outside this repository
and are not committed; what is committed is what they returned, and the
conventions are stated below fully enough to be re-run.

---

## 1. The reproduction check does not reproduce: the record moved

Sessions 18 to 22 each re-read the work's records whole before building on them,
and sessions 21 and 22 both found them standing still. **Today they have not
stood still.** Read at 2026-09-05 04:09 UTC:

| | arrival versions | felt versions | blocks ever | responses | ever revised | intensity changes | at an unchanged reporter count |
|---|---|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | **3** (was 2) | **81** (was 80) | 129 | 151 | 15 | 19 | **0** |
| `us6000tm81` Peru M 6.7 | 3 | 38 | 53 | 72 | 5 | 10 | **0** |
| `us6000tjl2` Colombia M 7.4 | 3 | **355** (was 354) | **696** (was 678) | **1203** (was 1167) | **160** (was 155) | **339** (was 331) | **0** |

Two things moved and one did not.

- **The Japanese arrival record published a third version** at
  2026-09-04T15:16:22Z, **12.93 days** after the origin — about ten hours after
  session 22 closed. Its felt record republished 73 seconds later and its blocks,
  responses and changes are unmoved by that republication; what the new felt
  version carries is the new epicentre.
- **The Colombian felt record is still filling**, 25.4 days after the origin: 18
  new blocks, 36 new responses, 5 more blocks ever revised, 8 more changes.
- **Session 19's finding still holds on these three events**, now over **368**
  published intensity changes rather than 360, and still not one of them at a
  reporter count that did not move.

Session 22 recorded the headline `num-responses` the last felt version carries
against the sum over the blocks it places on the ground. Today: **153 / 74 /
1243** against **151 / 72 / 1203** — the Colombian gap has widened from 39 to 40.

**And Japan's third version is the thing session 21 said it could only wait
for.** Session 21 published that it "cannot decide and can only wait for" a
second late revision to test its account on. Session 22 answered that it did not
have to wait, surveyed 490 events, and found late revisions to be the normal
case — 796 of them against 212 early, median age 21.4 days. The next day the
practice's own founding event published one, at 12.9 days, inside that
distribution. The practice was right not to wait, and the arrival is a
prediction coming true rather than an interruption; §5 records what follows from
that for I7b.

---

## 2. Session 19's finding, run over a catalogue instead of three events

### 2.1 What was claimed, and from how much

Session 19 measured, across every consecutive pair of published felt versions on
two events and later a third, that a block's published intensity never moves
unless the block's own published reporter count moves with it — **0 of 360**
published intensity changes at an unchanged reporter count. Iteration 9's
pipeline note states it as a contrast between the two records: *"One record's own
measurement moves only when a person acts; the other's moves for nearly everyone
when nobody observed anything."* Sessions 20, 21 and 22 restated it and built on
it. Session 22 named it, in as many words, as one of the findings not yet tested
against a population.

### 2.2 The population, fixed before any result was seen

Reusing the window session 22 fixed, because it was fixed by an earlier session
and not by today's results, and because every member has had at least 21 days of
observation:

- **Window:** every event in the USGS catalogue with M ≥ 5.0 whose origin falls
  in [2026-06-01T00:00Z, 2026-08-15T00:00Z). **491 events.** (Session 22 reports
  490 for the same stated bounds; the discrepancy of one is recorded and not
  explained — see §6.)
- **181** of them carry a `dyfi` product; **176** publish at least two versions
  of it carrying a geocoded file. Those 176 are the population. Nothing was
  sampled and nothing was chosen by its result.
- **Version:** one published `dyfi` product carrying a geocoded file, ordered by
  `updateTime`. **4 286 versions**, a median of 6 per event and a maximum of 576.
- **Block:** the rounded centroid of its published outline — `build.py`'s own
  identity. **10 427 blocks ever published** across the population.
- **Transition:** a block present in both members of a consecutive version pair.
  **1 967 066 transitions.**
- Every version of every event in the population used `dyfi_geo_1km.geojson`, so
  no transition crosses a change of geocoded file and none had to be excluded on
  that ground.

One event (`us6000t7zp`, M 7.5, Venezuela, 576 versions) returned HTTP 503 on the
first pass and was re-read on its own afterwards; its figures are included, and
it contributes no counterexample. The population is complete at 176 of 176.

### 2.3 What the catalogue says

| | reporter count moved | reporter count did not |
|---|---|---|
| **intensity moved** | 2 882 | **8** |
| **intensity did not** | 1 574 | 1 962 602 |

**The finding is false as an absolute and overwhelming as a tendency.**

- **8 of 2 890** published intensity changes stand at an unchanged reporter
  count — **0.277 %**, not zero.
- Where the reporter count moved, the intensity moved with it **2 882 of 4 456
  times (64.7 %)**. Where it did not, the intensity moved **8 of 1 962 610 times
  (0.00041 %)**. The two rates differ by a factor of about **158 000**.
- Put the other way: a transition in this population moves a reporter count with
  probability 0.0023, so if the two were independent, **2 883 of the 2 890**
  intensity changes would stand at an unchanged reporter count. **Eight do.**

So the sentence the practice should have published is not the one it published.
What the record does is not *never*; it is *this and almost nothing else*.

### 2.4 The eight are not noise, and they are not scattered

They fall in **four transitions on four events**, and they are named rather than
counted:

| event | M, place | blocks | what else moved across that transition |
|---|---|---|---|
| `hv75018296` | 5.2, Naalehu, Hawaii | **4**, all downward, each at 1 reporter | the product's `eventsource` went `us`/`6000tk56` → `hv`/`75018296`: **the event was handed to another network**, with a new origin time (2 s earlier), a new epicentre, a new magnitude (5.3 → 5.2) and a recomputed felt record (`num-responses` 67 → 32 → 35) |
| `us6000t7zc` | 7.2, San Felipe, Venezuela | 2, one up one down | the epicentre moved (lat 10.3874 → 10.4360, lon −68.5200 → −68.5277, depth 21.896 → 20.294 km) and `num-responses` fell 133 → 21 |
| `us7000srb1` | 7.8, Kablalan, Philippines | 1, down, at 3 reporters | `num-responses` 476 → 479: responses arrived, but not in this block |
| `us7000t0bm` | 5.2, Nuing, Philippines | 1, up, at 3 reporters | **nothing the product publishes about itself changed at all** |

**Six of the eight sit across a version in which the instrument network moved the
origin under the felt record**, one of them by replacing which network owns the
event. That is not an exception to this work's subject; it is this work's
subject. The felt record's intensity is the one measurement it makes and does not
borrow — and the two cases where it moved with nobody reporting are, in six of
eight instances, the other record moving underneath it.

The remaining two are not accounted for. One had responses arrive elsewhere in
the same version; one had nothing move that the record publishes. The practice
records them as unexplained rather than folding them into the account that fits
six.

### 2.5 What this does and does not license

It does not license *why* an intensity moves. `cdi` is derived from the
questionnaire answers in a block by a procedure this practice has not read and is
not reading; that a re-derivation coincides with a new origin is a fact about
publication order, not a demonstrated mechanism, and no causal claim is made
here. What is measured is what the record published, and when.

It also does not rescue the absolute. A claim of the form *never* is refuted by
eight instances however small the rate, and the practice published *never*, three
times, in a work's own source. §4 says what the work does about that.

### 2.6 One further thing the population says about the work's own events

**14 transitions on 5 events publish a lower reporter count than the version
before.** The felt record can shed reporters. On the three events this work is
built on it never has — every committed instance discloses "0 count(s) went
down" — and the work's accretion check has therefore never once fired. It is a
check that has only ever been run where it passes.

---

## 3. Session 22's own survey, re-run, and the test it did not run

Session 22 corrected two published claims. Nothing had yet checked session 22.
The same survey was re-run today, on the same population and the same
definitions, by an implementation written today.

### 3.1 What reproduces

| | session 22 (2026-09-04) | today (2026-09-05) |
|---|---|---|
| events with a `phase-data` product | 490 | **491** |
| published more than once | 474 | 479 |
| early / middle / late revisions | 212 / 27 / 796 | **212 / 27 / 841** |
| events with ≥ 1 late revision | 473 | 478 |
| median age of a late revision | 21.4 d | 23.2 d |
| tested population | 84 events, 475 versions | **84 events**, 483 versions |
| revisions read / re-picked nothing / testable | 347 / 206 / 141 | 399 / 258 / **141** |
| testable early / middle / late | 70 / 2 / 69 | **70 / 2 / 69** |
| early: median per-revision median Δ\|residual\| | −0.163 s | **−0.163 s** |
| early: negative | 53 / 70 | **53 / 70** |
| early: re-picked share, median | 0.305 | **0.305** |
| early: epicentral degrees, re-picked vs rest | 46.90 / 31.08 | **46.90 / 31.08** |
| late: median per-revision median Δ\|residual\| | −0.190 s | −0.180 s |
| late: negative | 54 / 69 | **54 / 69** |
| late: re-picked share, median | 0.079 | **0.079** |
| late: epicentral degrees, re-picked vs rest | 39.64 / 45.92 | **39.64 / 45.92** |

The machinery was first pointed at session 21's five-row table and reproduced it
to the third decimal (Japan 1→2 +0.120 P(≥) 0.0202; Peru 1→2 +0.120; Peru 2→3
−0.390 P(≤) 0.0046, Colombia 1→2 −0.140, Colombia 2→3 +0.010; permutation
tails differ from session 22's in the fourth decimal because the seed is today's).

**Session 22's survey stands.** Its conclusion — that revisions of both ages move
the picks they touch toward the fit by about the same amount, and that the late
one does not take the further field — is reproduced. The 52 revisions published
into the population since yesterday re-picked nothing at all, which is why the
testable count is unchanged at 141 while the read count rose from 347 to 399.

Two figures do not reproduce and are recorded rather than explained: the late
group's median moved by 0.010 s and its count of P(≤) ≤ 0.05 by one, on a group
of the same size 69, which means at least one late revision differs between the
two reads and the practice cannot say which.

### 3.2 The test session 22 did not run, and it holds

Session 22 concluded *what separates the two ages is size, not kind*, and
supported the size half with **two unpaired medians** — 0.305 against 0.079 —
while running its sign test only on the residual statistic. Unpaired medians
across different events do not establish a within-event difference. The paired
test, over the **48 events** carrying a testable revision of each age, 20 000
sign-flip draws, seed 20260905:

| paired statistic (late − early) | median | positive | P(≥) | P(≤) |
|---|---|---|---|---|
| median Δ\|residual\| | +0.0550 s | 26 / 48 | 0.3263 | 0.7006 |
| **re-picked share** | **−0.0712** | **16 / 48** | 0.9795 | **0.0267** |
| picks added | −1.0 | 20 / 48 | 0.7405 | 0.3399 |
| epicentral degrees of the re-picked | −7.24° | 19 / 48 | 0.9283 | 0.0847 |

**The size claim survives its own missing test**: within an event, the late
revision re-picks a smaller share of what is already there, on 32 of 48 events,
P 0.0267. The other three paired statistics separate nothing, which is session
22's conclusion and not a new one. This is the first of this practice's published
claims to be checked by a later session and left standing.

### 3.3 And the practice's own events are again the minority

Both of the work's events now carry a late revision, and neither is in the
window, so neither is in the 48.

| | early re-picked share | late re-picked share |
|---|---|---|
| Japan `us6000tmta` | 0.107 (13 of 121) | **0.398** (49 of 123) |
| Peru `us6000tm81` | 0.073 (9 of 124) | **0.370** (51 of 138) |
| Colombia `us6000tjl2` | 0.305 (25 of 82) | 0.018 (3 of 167) |

Two of the three run **opposite** to the population's paired direction. Japan's
new late revision is also flat on the residual statistic — median Δ|residual|
−0.010 s, P(≤) 0.3050 — and takes the *further* field (re-picked at 60.32°
against 51.87° for the rest), which is the property session 21 claimed and
session 22 reversed. One event does not restore a claim a paired test over 48
rejects; it does say again what session 22 said about Peru, that these three
events sit in the tails of their own class, and it says it about all three now.

---

## 4. What the work did with it

`works/arrival/iteration-13/`, three built instances, all three built after §2
was in hand and rebuilt after the two defects in §4.2 were fixed.

`build.py` is iteration 10's, unedited apart from its header note — the fourth
iteration running in which the pipeline derives nothing new and the template
draws something else from the same pinned data.

### 4.1 The schema change: the figure's own blocks get the two colours

Since iteration 9 a felt block in the main figure has been joined to the
positions it stood at in earlier versions, and iteration 9's source says why the
join was left one colour: *"The two kinds of move are different acts and they
look different… Neither is annotated. They are simply both drawn."* That was
affordable only because of §2.1's claim. If an intensity cannot move without a
reporter, a vertical move needs no colour, because there is only one thing it can
be.

It can. So each segment now carries the colour rule the two strips have used
since iterations 11 and 12 — one colour where the block's published reporter
count differs between the two positions the segment joins, the other where it is
the same — and the figure gains a disclosure line beneath the axis: *N unreported
moves, K in intensity*. The footer states the number the withdrawn absolute was
actually about, computed from the file's own pinned history: how many
version-to-version transitions of any block the record ever published moved an
intensity without moving a reporter count. On all three instances that number is
**0**, which is what the record says, and it is now a count in the file rather
than a sentence about the world.

**The two counts are different quantities and the file says so.** A path segment
joins two *distinct published positions* and may span versions the drawing
collapses; a transition is one version pair. Where a block's reporter count
changed at a version that moved it nowhere, the segment's colour reports the
change across its whole span and the transition count reports it where it
happened. The segment count under the figure can therefore undercount the
transition count, and the footer carries the transition count for that reason.

### 4.2 Two defects, both found by this session's own check before publication

- **A collision.** The disclosure line was first placed beside the distance-axis
  label, right-anchored on the same baseline. On the Peruvian instance at
  1440 px it overlaps that label from the eleventh instant on. The harness
  reported it on its first run, and the line was moved onto its own baseline
  below the axis. This is the first layout defect this practice's own check has
  caught in a file that had not yet been published; the two before it were found
  by eye and after the fact.
- **A clipped line, in every iteration since the seventh.** Giving the text check
  the vertical direction it had only had horizontally reported the version
  timeline's caption — *"N publications of the felt record — time after the
  origin, logarithmic"* — hanging **0.51 px** below the bottom of its own figure,
  where its descenders are clipped. It is identical in iteration 12's committed
  instance and is not new to 13. Iteration 13 raises the line two units.
  **Iterations 1 to 12 stay frozen unedited** and are wrong where they are wrong,
  in the open.

### 4.3 What was checked, and by what

The harness is this session's own, written today from nothing; session 22's was
not committed and this is not it, so its state counts are not comparable to
session 22's. It drives an instance through states of the four controls by
setting the file's own state variables and calling `redraw()` — which is what the
buttons do — then reads the rendered DOM back and compares it against a second
implementation computed here from `D.felt`, the file's pinned list of published
changes, **not** from `FELT`, the file's own expansion of it. It reconstructs the
population at each instant, the path nodes, the segment count, each segment's
colour and both disclosure numbers independently, and calls none of the file's
functions.

It checks, at every state: page errors; horizontal overflow of the document; the
number of path segments in the felt half and the colour of each; the text of the
disclosure line; that every text of every figure lies inside that figure's box in
**screen** space, horizontally and vertically; and that the new disclosure line
overlaps no other text of its figure. It also checks that an instant before the
felt record existed draws no segment and no note.

**What it returned.** Zero failures of any kind, on every run below: 0 px of
horizontal overflow, 0 page errors, 0 texts leaving or overlapping, and every
segment, colour and count matching the independent recomputation.

| instance | subsample | width | states | of a possible | segments checked |
|---|---|---|---|---|---|
| Japan | instants × rungs | 1440 | 636 | 28 224 | 36 966 |
| Peru | instants × rungs | 1440 | 407 | 34 440 | 10 397 |
| Japan | three instants × every rung pair | 1440 / 1024 / 760 / 380 | 504 each | 28 224 | 22 008 each |
| Peru | three instants × every rung pair | 1440 / 1024 / 760 / 380 | 504 each | 34 440 | 11 004 each |
| Colombia | three instants × every rung pair | 1440 / 1024 | 504 each | 1 653 960 | 156 912 each |

**What the subsamples are, and what they leave uncovered**, stated rather than
glossed. The first kind: every instant against every neighbourhood rung at the
opening thresholds, then at the last instant every residual rung against every
reporter threshold. The second kind: the first, middle and last instant against
every neighbourhood rung and every residual rung, at both extremes of the
reporter threshold. Uncovered in all three instances: the combination of an
arbitrary middle instant with a raised threshold — the same hole as yesterday.

**The Colombian instance's full instant-by-instant sweep was started twice**, ran
over half an hour each time without finishing, and was stopped and replaced by
the bounded 504 states above rather than left running and reported as a number
this session did not have. **Its run at 760 px was also started and stopped**: it
had not completed the same 504-state list in over half an hour that its runs at
1440 and 1024 px each completed in about four minutes, and 380 px was never
reached. Nothing is claimed about why. The Colombian instance is therefore
verified at two widths, and the two narrow widths on that instance are
unverified — not passed and not failed.

---

## 5. Both registers decline today, and the reason is the same

**I7 — declined.** Session 22 closed by naming today's test in its own words:
*"how much of what this practice has published rests on two or three events…
session 19's — no intensity change at an unchanged reporter count, which holds on
three events and 360 changes and has never been run over a catalogue."* Today the
practice ran exactly that. That is the mechanism I4 has recorded as ambiguous
eight times: the session's direction forced by the previous session's closing
sentence taken as an obligation. It is not the practice changing the form of its
own problem, and an entry today would be the register rewarding a session for
doing what it was told by its own record.

**I7b — declined.** Something did arrive from outside: the record moved, on the
day the check was run, and the practice's own founding event published the very
revision session 21 said it could only wait for. But session 21 already
registered *the record moved* as an I7b entry on 2026-09-03, and this arrival is
worse than a repetition for the register's purposes — **it was predicted**.
Session 22 published, from 796 late revisions, that a late revision is the normal
case with a median age of 21.4 days; Japan's arrived at 12.9 days, inside that
distribution, and the interesting thing about it is that the practice was right.
A confirmed prediction is the opposite of passio, and the register's own opening
paragraph excludes proxies. **Both registers stand at four and neither can fail
for being empty.**

---

## 6. What this session could not do, or did not

- **The 490/491 discrepancy** between session 22's count of the same window under
  the same stated bounds and today's is unexplained. The catalogue may have
  gained an event; session 22's query may have differed in a way its ledger does
  not record. It is the second time a session has failed to reproduce a figure of
  session 21's or 22's exactly from the conventions those sessions stated.
- **The exhaustive sweeps** — every state the instances admit — were not run.
  The bounded subsamples of §4.3 are what was run, and they are stated as such.
- **Why an intensity moves** is not measured and is not claimed; see §2.5.
- **Genesis care** was bounded to three iterations on two events, and the bound
  is argued in the record rather than merely noted.

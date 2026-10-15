# Session 19 — what a jolt is, and what the other network does to its own measure

Evidence for `record/2026-08-31-session-19.md`. Every figure below is a count
or a comparison over values published by the USGS Earthquake Hazards Program,
public and unauthenticated, read with the same conventions as
`works/arrival/iteration-8/build.py` (same endpoints, same identity for a
block, same great circle on a sphere of R = 6371.0 km). Nothing is fitted,
smoothed or interpolated. The probe scripts were run in a scratch directory
outside this repository and are not committed; what is committed is what they
returned, and the conventions are stated here fully enough to be re-run.

Two events, as in every session since 12:

- **`us6000tmta`** — Japan, M 5.8, 4 km N of Toride. 2 published versions of
  the arrival record, 80 of the felt record, 129 blocks ever published.
- **`us6000tm81`** — Peru, M 6.7, 31 km NW of Aniso. 2 published versions of
  the arrival record, 37 of the felt record, 53 blocks ever published.

**Reproduction check, before anything was built on it.** Both records were
re-read whole today. The version counts, the block counts and the derived
figures session 18 published are unchanged: 80 and 37 felt versions, 2 and 2
arrival versions, 129 and 53 blocks. Neither record has moved since 2026-08-30.

---

## 1. The question this session was handed

Session 18 closed by naming what its finding left open: the felt record's own
ordering does not drift, it jolts — 9 of 79 publications on Japan and 4 of 36
on Peru reorder anything at all — "and this work does not show what happens at
a jolt or whether the jolts have anything in common"
(`record/2026-08-30-session-18.md`, §"What remains after this session", point 3).

## 2. A jolt is one person

For each consecutive pair of published versions, restricted to the blocks
present in both — a new block cannot reverse an ordering it was not in.

**Japan, 9 jolts of 79 publications:**

| version | +min | blocks | shared | pairs | reversed | blocks moved | reporter counts changed |
|---|---|---|---|---|---|---|---|
| 5 | 47.26 | 56 | 49 | 1044 | 11 | 1 | 1 |
| 7 | 58.31 | 61 | 57 | 1428 | 17 | 4 | 4 |
| 9 | 68.76 | 65 | 63 | 1765 | 20 | 1 | 1 |
| 22 | 275.02 | 78 | 78 | 2693 | 8 | 1 | 1 |
| 44 | 529.98 | 99 | 99 | 4323 | 7 | 1 | 1 |
| 47 | 646.20 | 101 | 101 | 4491 | 29 | 1 | 1 |
| 62 | 1315.39 | 115 | 115 | 5832 | 17 | 1 | 1 |
| 67 | 1869.64 | 119 | 119 | 6264 | 16 | 1 | 1 |
| 72 | 3312.36 | 122 | 122 | 6623 | **37** | 1 | 1 |

**Peru, 4 jolts of 36:** version 9 (+61.15 min) 11 of 347, 2 blocks; version 13
(+83.17) 5 of 424, 1 block; version 15 (+97.58) 6 of 452, 1 block; version 16
(+102.70) 7 of 515, 1 block.

**Eight of Japan's nine jolts and three of Peru's four move exactly one block.**
And the block that moves is always a block someone has just reported from a
second time. The reporter count column is the block count column in every row.

**The rule holds without exception on both events.** Over 79 transitions on
Japan and 36 on Peru there are **0 block-moves at an unchanged reporter
count** — not one intensity in either record's whole published history ever
changed except when a new person answered. The publisher does not recompute;
it only counts what arrives.

## 3. And a jolt's size is not a property of the answer

If exactly one block moves from intensity *c* to *c′*, the pairs it reverses
are exactly the pairs it forms with blocks standing strictly between the two.
Predicted against measured, over every publication in either record that moved
exactly one block: **18 of 18 exact** — 12 of 12 on Japan, 6 of 6 on Peru.

So the size of a jolt measures how crowded the intensity scale is where the
block landed, not how large the correction was:

| event | version | the move | pairs reversed |
|---|---|---|---|
| Japan | 13 | 3.3 → 3.4 | **0** of 2182 |
| Japan | 22 | 4.6 → 5.4 | 8 of 2693 |
| Japan | 47 | 4.1 → 5.5 | 29 of 4491 |
| Japan | 72 | 3.4 → 4.3 | **37** of 6623 |

Version 13 moved a block by 0.1 and disturbed nothing. Version 72 moved a block
by 0.9, into the crowded middle of a record by then holding 122 blocks, and
reversed 37 pairs.

**The figure worth putting beside session 17's.** That single answer to a
questionnaire disturbed the felt record's own ordering by 0.559 % — more than
the instrument network's entire re-solution disturbed the borrowed ordering
(0.388 %, session 17's headline, re-measured and confirmed by session 18).

## 4. What the record revises, and how little of it

| | blocks ever published at a different intensity | of | over versions | such changes | at an unchanged reporter count |
|---|---|---|---|---|---|
| Japan | **15** | 129 | 80 | 19 | **0** |
| Peru | **5** | 53 | 37 | 10 | **0** |

114 of Japan's blocks and 48 of Peru's were published once and never revised.

**And the second reporter is where nearly all of it happens.** Japan: of 17
blocks that went from 1 reporter to 2, 15 changed intensity, median |Δ| 0.5,
max 1.4; of 4 that went 2 → 3, all 4 changed, median |Δ| 0.1; the single 3 → 4
changed nothing. Peru's tail is the same shape and longer: 7 → 8, 8 → 9 and
9 → 10 each moved the value by nothing at all. A block's intensity is a sample
of one almost everywhere — 112 of Japan's 129 blocks at the last version — and
what a jolt is, is the moment a single anecdote becomes an average.

## 5. The same question asked of the other network — and the answer inverts §4

This was not the inherited question. It was forced by the work's own rule since
iteration 3: every act is performed on both networks. The felt record's own
measurement is the intensity. The arrival record's own measurement of itself is
the **residual** — a pick's disagreement with the solution fitted from it.
Sessions 15 to 18 compared the felt record's *owned* ordering against the
instrument network's *borrowed-out* one, the distance, which is geometry and
therefore stable. The comparison of each network against its own quantity had
never been made.

**Japan, the single revision (+18.63 → +46.03 min):** 121 picks published in
both versions, 2 added, 0 dropped. The origin instant moved −1.727 s.

- The published residual **changed on 118 of 121** picks; median |Δ| 0.12 s,
  max 2.91 s.
- Residual ordering: **743 of 7235 strictly-ordered pairs reversed (10.270 %).**

**Peru (+16.52 → +54.11 min):** 124 shared, 15 added, 0 dropped; origin +3.463 s.

- The published residual **changed on 122 of 124**; median |Δ| 0.51 s, max 4.12 s.
- Residual ordering: **1565 of 7613 pairs reversed (20.557 %).**

## 6. And almost none of it was an observation

The published record distinguishes the two reasons a residual can move, because
the absolute arrival instant is published: a station can be re-picked, or the
solution can move under an unchanged pick.

| | shared picks | station published the SAME arrival instant | of those, residual changed anyway | station published a DIFFERENT instant |
|---|---|---|---|---|
| Japan | 121 | 108 | **105** | 13 |
| Peru | 124 | 115 | **113** | 9 |

Restricted to the picks where the observation is provably unchanged, the
ordering still reverses:

| | reversed | of pairs | |
|---|---|---|---|
| Japan | 501 | 5758 | **8.701 %** |
| Peru | 1351 | 6543 | **20.648 %** |

**Put beside the felt record's worst single publication** — 0.560 % on Japan
(session 18 §6), 3.170 % on Peru — the instrument network's one revision
disturbs its own ordering **15.5 times** and **6.5 times** more, in an act in
which nothing was observed.

So the picture sessions 15 to 18 built — the borrowed structure holds still and
the owned one moves — is not wrong, but it was drawn against the wrong
comparand, and against the right one it inverts. **This is recorded as a
correction beside those sessions and not over them: their numbers stand and are
re-confirmed above; what is corrected is the choice of what to compare.** The
true difference between the two records is not stability. It is what makes a
value move: in one record a person, in the other a fit.

## 7. What the revision does to the work's own act

The work's act on the instrument network is a threshold on the residual. The
revision moves a pick's *place in the figure* by almost nothing and its
*survival of the demand* by a great deal. Picks crossing the threshold, at the
twelve rungs the file offers, over the 121 and 124 shared picks:

| rung | Japan crossed | of which unchanged instant | Peru crossed | of which unchanged instant |
|---|---|---|---|---|
| ± 3.00 s | 2 (1.7 %) | 1 | 20 (16.1 %) | 17 |
| ± 1.00 s | 10 (8.3 %) | 8 | 27 (21.8 %) | 23 |
| ± 0.50 s | 12 (9.9 %) | 10 | **39 (31.5 %)** | 37 |
| ± 0.35 s | 18 (14.9 %) | 15 | 34 (27.4 %) | 33 |
| ± 0.15 s | **19 (15.7 %)** | 17 | 23 (18.5 %) | 23 |
| ± 0.05 s | 17 (14.0 %) | 15 | 12 (9.7 %) | 12 |

At ± 1.00 s on Japan, 8 of the 10 crossings are outward — picks that passed the
demand at the first publication and fail it at the second, none of them having
published a new arrival instant.

**The human dial does not behave this way at all.** A block crosses a reporter
cut only by gaining a reporter, and over both records' whole published history
the crossings are **entirely one-way**: on Japan 17 blocks crossed into n ≥ 2,
4 into n ≥ 3, 1 into n ≥ 4, and **0 ever crossed out** of any cut; on Peru the
same, 0 out at every one of the ten cuts. One record's answer to *who has
corroboration* only ever grows, and only when a person acts. The other's
changes in both directions at one instant, mostly for picks where nothing was
observed.

## 8. Whether any of it is drawable, in the figure's own units

Measured against the template's own scales, at 1200 × 720 figure units:

| | Japan | Peru |
|---|---|---|
| pick displacement in the figure, at the revision | median **0.63 px**, max 1.26; 6 of 121 at or above 1 px | median **1.29 px**, max 3.99; 5 of 124 at or above 3 px |
| for comparison, the residual mark's own length (iteration 7's finding) | median 0.194 px | median 0.301 px |
| block intensity move | median **11.3 px**, max 39.5 | median **7.5 px**, max 15.1 |
| block horizontal move at the epicentre revision | median **26.96 px** (49 blocks) | median **6.00 px** (27 blocks) |

So the same act, drawn in the same place, is invisible above the axis and large
below it — and the instrument network's real motion is not in the figure at
all but in the residual strip, where the threshold cuts. Iteration 9 draws it
in both places and lets the difference stand.

## 9. Iteration 8's own arithmetic, checked and unchanged

Iteration 8's committed instances were re-read and their rendered sentences
compared against today's independent probes. Iteration 8's figures agree with
them: 15 of 129 and 5 of 53 blocks ever revised, 19 and 10 changes, 0 and 0 at
an unchanged reporter count. **No defect was found in iteration 8, and it is
not withdrawn.**

## 10. Iteration 9, and what it was driven against

`works/arrival/iteration-9/`. **`build.py` changes for the first time since
iteration 6, and both changes are identity claims.** A pick gets a name that
survives republication — the published network and station code with the
published phase label — checked and not assumed, with the collision count
carried into the file (`pickKeyCollisions`: **0** on both events; the phase
label changed on **0** stations across the revision). And a pick carries `a`,
its published arrival instant counted from the event's own origin instant,
which belongs to no version: that is what lets the file say whether a station
published a new observation or only a new residual.

**What is drawn:** where a mark has already been published, at or before the
instant being read and never after it. Below the axis, a block's earlier
published position — its intensity and the distances its outline occupied under
the epicentre in force then. In the residual strip, a pick's earlier published
residual, as a tail, in one colour where the station published a different
arrival instant and in the file's own colour for *changed while nothing was
observed* where it published the same one. Above the axis the same act is
performed and the trace is a fraction of a pixel, which §8 measures and the
file does not hide.

**Struck:** the footer sentence *"At each revision every felt report in this
file moved, although nobody reported anything"* — prose standing in for a
picture, on the same ground iteration 7 struck the 1 km cell sentence. It is
now the drawing.

**Driven headless at four widths** — 1440, 1024, 760, 380 px — at the opening
state and at the extreme state of each control: **0 px horizontal overflow,
0 page errors** on both instances. Then swept over every state either file
admits, with the result read back out of the live DOM and not the generator:

| | states | page errors | table/figure mismatches | mark heights checked | wrong | traces checked | wrong | text pairs | overprinting |
|---|---|---|---|---|---|---|---|---|---|
| Japan | 3936 | 0 | 0 | 101 472 | **0** | 512 400 | **0** | 11 280 | **0** |
| Peru | 4680 | 0 | 0 | 22 464 | **0** | 483 600 | **0** | 12 720 | **0** |

The state counts are identical to sessions 17 and 18, as they must be. Each
trace is inverted back through its own scale and compared to the set of values
that record actually published. The overprinting check is new and was added
because a screenshot showed two new lines of disclosure colliding — see §11.

## 11. Three defects of this session's own, found by looking and fixed before commit

The automated sweep passed all three. All three were found by rendering the
file and reading it.

1. **False denominators.** The new disclosure lines first read "118 of 123 stand
   where they were not published before" — where 2 of those 123 picks had never
   been published before at all and could not have stayed anywhere. The same
   fault in the block line and twice in the footer. The denominator is now the
   marks that have a *before*: 121 picks and 128 blocks on Japan.
2. **"Three quantities are derived and no others."** Iteration 9 derives a
   fourth, and the sentence was still claiming three. Corrected, and the fourth
   is named and its purpose stated.
3. **Two lines of disclosure overprinting**, found in a screenshot of the
   residual strip. Shortened, and a check for it added to the sweep and run over
   all 8616 states.

A fourth thing was suspected from the same screenshot and turned out not to be
a defect: a connector below the axis appeared to span three intensity units.
Measured out of the DOM, the longest drawn connector is **1.40**, equal to the
largest intensity change either record ever published. The eye was wrong and the
measurement settled it; recorded because a suspicion checked and dismissed is
as much a result as one confirmed.

## 12. I8 — genesis care

All nine iterations were copied out of the repository and rebuilt from the
copies. **All nine ran and produced complete instances.** No committed file was
touched.

- Iterations **5 to 8** rebuild identical to their committed instances except
  for the build date, on both events.
- Iterations **1 to 4** differ on the Japanese instance only (190, 222, 238 and
  225 differing leaf fields), and their Peruvian instances differ by the build
  date alone. The reason is documented behaviour, not decay: they read only the
  current version of each product and were committed on 2026-08-23 to 08-25,
  while the Japanese felt record was still filling — it published for the last
  time 3.24 days after the origin. The Peruvian felt record had stopped by then.
- The counts are not comparable to session 18's (159, 81, 44, 30): that session
  counted at a different granularity. The method is stated here so that the next
  one can be. What both sessions establish is the same and is what I8 asks: the
  differences are confined to iterations 1 to 4, to the Japanese instance, and
  to the fields the felt record was still filling.

## 13. Sources

    https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson
        &eventid=<id>&includesuperseded=true
    product `phase-data` -> quakeml.xml       (station, arrival instant,
                                               distance, time residual, phase)
    product `dyfi`       -> dyfi_geo_1km.geojson
                            (outline, nresp, cdi, dist per block)

Read 2026-08-31. Both drawn quantities are computed by their own publishers and
neither is derived here: a pick's residual by whoever fitted the solution, a
block's intensity by whoever runs the questionnaire. Each is taken as its own
record published it.

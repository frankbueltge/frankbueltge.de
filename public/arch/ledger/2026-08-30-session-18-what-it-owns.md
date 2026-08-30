# Session 18 — what the felt record owns, and what the work was drawing instead

Evidence for `record/2026-08-30-session-18.md`. Every figure below is a count
or a comparison over values published by the USGS Earthquake Hazards Program,
public and unauthenticated, read with the same conventions as
`works/arrival/iteration-7/build.py` (same endpoints, same identity for a
block, same great circle on a sphere of R = 6371.0 km). Nothing is fitted,
smoothed or interpolated. The probe scripts were run in a scratch directory
outside this repository and are not committed; what is committed is what they
returned, and the conventions are stated here fully enough to be re-run.

Two events, as in every session since 12:

- **`us6000tmta`** — Japan, M 5.8, 4 km N of Toride. 2 published versions of
  the arrival record, 80 of the felt record, 129 blocks ever published.
- **`us6000tm81`** — Peru, M 6.7, 31 km NW of Aniso. 2 published versions of
  the arrival record, 37 of the felt record, 53 blocks ever published.

---

## 1. The question this session was handed

Session 17 measured what one revision of the instrument network's solution
costs the felt record, and found the ordering by distance almost untouched:
**32 inverted pairs of 8256 on Japan, 3 of 1378 on Peru**. It closed by naming
what that leaves open — there is a structure in the human record that does not
depend on the instrument network's solution, and the work does not show what
it is (`record/2026-08-29-session-17.md`, §"What remains after this session",
point 3).

**Check, before anything was built on session 17's number.** The comparison was
re-run today from a fresh read of both events' whole published history, on the
final block set of each, against the first and the last epicentre either felt
record was ever published under: **32 of 8256 on Japan, 3 of 1378 on Peru.**
Identical to the published figures. Session 17's headline stands.

## 2. What the felt record owns

The felt record publishes exactly three quantities per block that owe the
instrument network nothing: the **outline**, the **number of people who
reported** from it, and the **intensity** they reported. The block's published
distance is not among them — it is measured from a hypocentre the instrument
network computes, which is the whole of sessions 15 to 17.

Two of the three are orderings the record makes of itself. How much of an
ordering, at the last published version:

| | Japan (129 blocks, 8256 pairs) | Peru (53 blocks, 1378 pairs) |
|---|---|---|
| intensity | 21 distinct values, **799 pairs tied (9.7 %)** | 18 distinct values, **120 tied (8.7 %)** |
| reporter count | 4 distinct values, **6297 tied (76.3 %)** | 5 distinct values, **1083 tied (78.6 %)** |

Over the whole published history the intensity takes 22 distinct values on
Japan (2.0 to 5.6) and 21 on Peru (1.0 to 5.2).

**The reporter count barely orders anything.** At the last version the Japanese
blocks stand at 1 reporter × 112, 2 × 13, 3 × 3, 4 × 1; the Peruvian at
1 × 47, 2 × 2, 3 × 2, 5 × 1, 10 × 1.

## 3. The owned ordering is not the borrowed one

Taking "nearer the epicentre means stronger" as the reading the borrowed axis
would predict, and counting only pairs the quantity strictly orders:

| | holds on | of untied pairs | tied |
|---|---|---|---|
| Japan, intensity | 4945 | 7457 (**66.3 %**) | 799 |
| Japan, reporters | 1386 | 1959 (70.8 %) | 6297 |
| Peru, intensity | 880 | 1258 (**70.0 %**) | 120 |
| Peru, reporters | 138 | 295 (46.8 %) | 1083 |

A third of the time the human record says the farther block felt it harder. On
Peru the reporter count carries no distance information at all — 46.8 % is on
the wrong side of a coin flip, on 295 untied pairs of 1378.

## 4. And it carries distance only coarsely

The same count, with pairs split by how far apart the two blocks are — the
ratio of the farther block's distance to the nearer one's. Intensity, last
published version:

| separation | Japan | | Peru | |
|---|---|---|---|---|
| | holds | untied pairs | holds | untied pairs |
| 1.00–1.25× | **52.7 %** | 2207 | **56.2 %** | 552 |
| 1.25–1.50× | 63.4 % | 1290 | 73.5 % | 68 |
| 1.50–2.00× | 66.9 % | 1661 | 86.8 % | 182 |
| 2.00–3.00× | 76.4 % | 1146 | 75.5 % | 376 |
| 3.00–5.00× | 85.4 % | 735 | 97.3 % | 74 |
| 5.00×+ | 83.3 % | 418 | 100.0 % | 6 |

Between two blocks within a quarter of each other's distance the felt record's
own quantity is at 52.7 % and 56.2 % — it does not order them. It resolves the
radial structure at something like a factor of three in distance and no finer.
The axis it is drawn on is ruled to a block's own 1.4 km.

The two rows at the bottom of each column rest on 418 and 6 pairs and are the
thinnest figures in this ledger; the finding above does not depend on them.

## 5. The two acts, on the same blocks and the same span

To compare what the instrument network's revision does to the borrowed
ordering with what the felt record's own filling does to its owned one, both
are measured on the **same block set** over the **same span** — from the last
felt version published under the first epicentre to the final version.

**Japan — 49 blocks, 1176 pairs, +40.81 min to +4661.64 min:**

- **Act I, the instrument network revises.** Blocks fixed, epicentre moves.
  Distance order **reversed 2 of 1176** strictly-ordered pairs (0.170 %). Every
  block moved; median displacement **1.21 km** against a cell **1.41 km** across.
- **Act II, the felt record fills.** Epicentre fixed, reports arrive. Intensity
  order **reversed 35 of 1026** strictly-ordered pairs (**3.411 %**); 63 pairs
  tied on one side, 87 on both; the value changed on 10 of 49 blocks. Reporter
  order reversed 2 of 129 (1.550 %); changed on 11 of 49 blocks.

**Peru — 27 blocks, 351 pairs, +54.64 min to +1125.36 min:**

- **Act I.** Distance order **reversed 0 of 351** (0.000 %). Median displacement
  **8.97 km** against the same 1.41 km cell.
- **Act II.** Intensity order **reversed 14 of 320** (**4.375 %**); 5 tied on one
  side, 26 on both; changed on 3 of 27 blocks. Reporter order reversed 0 of 116;
  changed on 5 of 27.

Cumulatively, over one span of time: **the structure the felt record is given
holds nearly still, and the structure it owns is the one that moves.**

## 6. The check that cut the claim down, recorded because it did

The two acts in §5 are not the same kind of act, and the difference flatters
the conclusion. The instrument network republished **twice ever**; the felt
record republished **80 times** on Japan and 37 on Peru. An ordering that can
only change twice will look stable for a reason that has nothing to do with
stability. So the felt record's churn was measured **per publication**:

| | republications that reorder anything | worst single one | the instrument network's only revision |
|---|---|---|---|
| Japan | **9 of 79** | version 72, +3312.36 min: 37 of 6609 (**0.560 %**) | 32 of 8256 (**0.388 %**) |
| Peru | **4 of 36** | version 9, +61.15 min: 11 of 347 (**3.170 %**) | 3 of 1378 (**0.218 %**) |

On Peru the gap survives — one ordinary republication of the human record
disturbs its own order fourteen times more than the instrument network's whole
revision disturbed the borrowed one. **On Japan it very nearly closes: 0.560 %
against 0.388 %.** The strong reading — that the owned structure is an order of
magnitude less stable — is not supported on Japan and is recorded as
withdrawn here rather than left standing in §5.

What survives on both events is the shape rather than the size: the felt
record's own ordering **does not drift, it jolts.** 70 of 79 publications on
Japan, and 32 of 36 on Peru, add blocks and reorder nothing among the blocks
already there; then one publication reverses 37 pairs. The instrument network
revises once, decisively, and stops.

## 7. What this says about the work's own apparatus

Since iteration 3 the work has performed one act on both networks — *demand
more corroboration* — and answered it with a threshold on each network's own
published quantity. The two quantities are not comparable dials:

| | Japan | Peru |
|---|---|---|
| instrument side: published time residual | **164 distinct values** over 244 picks, −4.20 to +2.41 s | **198 distinct values** over 263 picks, −4.73 to +4.93 s |
| human side: published reporter count | **4 distinct values** over 7348 block-publications | **10 distinct values** over 1295 block-publications |
| never drawn: published intensity | 22 distinct values, 2.0 to 5.6 | 21 distinct values, 1.0 to 5.2 |

On Japan the human-side control admits four cuts across every state the work
can be built from, and 112 of 129 blocks sit in the first of them. This does
not make session 13's finding an artefact — the human reach collapses under
the demand because there is almost no corroboration in the record to demand —
but the work has been drawing that act as symmetric and it is not, and the
asymmetry has never been on the page.

**And the third row is the omission this session exists to correct.** The
intensity is published per block, has been fetched, parsed and written into
every built instance since iteration 1, has sat under the pointer as a line of
tooltip text — and has never been given a position in the figure. Iterations 2
to 7 drew the lower half as a running count of reports inside a distance, which
counts the network and not the earthquake.

## 8. Iteration 8, and what it was driven against

`works/arrival/iteration-8/`. `build.py` is unchanged from iteration 7 apart
from its header note: no new quantity is read, and the correction is entirely
in what is drawn. Below the axis a block now stands at **the intensity its own
product published for it**, spanning the distances its published outline
occupies exactly as in iteration 7. Above the axis a mark's height is a second
a seismometer published; below it, an intensity people published. Struck: the
cumulative-count staircase, the possibly-inside/certainly-inside band, and the
axis label "felt reports within".

**A correction to iteration 7, found today by rendering the file and reading
its own sentences.** Iteration 7 gave every mark a width because a block has no
single position, and then printed, on the depth tick, a single number for how
many blocks lie inside that distance. On Japan that number has no single value:
**89 blocks lie wholly inside 61 km, 91 reach into it, and 90 do by their
centres.** Session 17's protocol states the arithmetic correctly (89 and 91);
what it does not say, and what is corrected here, is that iteration 7's *file*
prints only the first of the two. Iteration 8 prints both where they differ and
one where they do not. Iteration 7 stays frozen and wrong where it is wrong.

**A second correction, same method.** A footer sentence in the first build of
iteration 8 read "the intensity published for that block — 2 to 6 here", where
6 is the axis bound and the largest intensity actually published is 5.6. It was
found by reading the rendered footer, and struck before commit: the file now
gives the published extremes and says separately how the axis is ruled.

**Both instances driven**, headless, at four widths — 1440, 1024, 760, 380 px —
at the opening state and at the extreme states of each control: **0 px of
horizontal overflow, 0 page errors.** Then swept over every state either file
admits, with the result read back out of the live DOM and not out of the
generator:

| | states swept | page errors | table/figure mismatches | mark heights read back | wrong |
|---|---|---|---|---|---|
| Japan | 3936 | 0 | 0 | 101 472 | **0** |
| Peru | 4680 | 0 | 0 | 22 464 | **0** |

The state counts are identical to session 17's, as they must be — the same 82
and 39 instants, the same 12 residual rungs, the same 4 and 10 reporter cuts.
The height check inverts the rendered `y` of every drawn block back through the
intensity scale and compares it to the published value, so the new axis is
checked and not assumed.

## 9. I8 — genesis care

All eight iterations were copied out of the repository and rebuilt from the
copies. **All eight ran and produced complete instances.** No committed file was
touched.

- Iterations **5, 6 and 7** rebuild **byte-identical to their committed
  instances except for the build date** — neither record of either event has
  moved since those instances were made.
- Iterations **1 to 4** differ (159, 81, 44 and 30 differing fields on the
  Japanese instance; 2 on the Peruvian, which is the date alone). They read
  only the current version of each product and were committed on 2026-08-23 to
  2026-08-25, while the Japanese felt record was still filling — it published
  for the last time 3.24 days after the origin. This is the behaviour
  `works/arrival/README.md` documents, not decay.

## 10. Sources

    https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson
        &eventid=<id>&includesuperseded=true
    product `phase-data` -> quakeml.xml       (picks, arrivals, residuals)
    product `dyfi`       -> dyfi_geo_1km.geojson
                            (outline, nresp, cdi, dist per block)

Read 2026-08-30. Both drawn quantities are computed by their own publishers and
neither is derived here: a pick's residual by whoever fitted the solution, a
block's intensity by whoever runs the questionnaire. Each is taken as its own
record published it.

# Session 17 — what the instrument network's revision costs the felt record,
# measured against the one thing the felt record does own

Evidence for `record/2026-08-29-session-17.md`. Every figure here was computed
in this session from public, unauthenticated USGS data, or read back out of a
built instance of the work by driving it in a headless browser. Nothing is
quoted from memory and nothing is carried over unchecked from an earlier
session; where a session-16 figure is repeated it was recomputed here.

**Sources.** `https://earthquake.usgs.gov/fdsnws/event/1/query` with
`format=geojson` and `includesuperseded=true`, and the per-version content
files served under their own revision paths — `dyfi_geo_1km.geojson` for the
felt record, `quakeml.xml` for the arrival record. Requested 2026-08-29 between
04:07 and 05:10 UTC. Both work events publish the **1 km** geocoded felt file,
not the 10 km one; that is read from the product's own contents list, not
assumed.

**The question this session inherited**, in session 16's words: the work "now
shows that the human record's coordinates are supplied by the instrument
network, and it does not show what that costs the human record, only that it
moves it."

---

## §1 — The measure the question was missing

A displacement in kilometres is not yet a cost. It becomes one when it is put
beside something the displaced record owns. The felt record owns exactly one
such quantity: **the size of the cell it publishes its reports in.** Every
figure below is a displacement measured against that.

The cell's own extent, measured rather than taken from the file name — the
greatest great-circle distance between two published vertices of one outline:

    us6000tmta   129 distinct outlines   min 1.414  median 1.415  max 1.415 km
    us6000tm81    53 distinct outlines   min 1.415  median 1.417  max 1.418 km

A 1 km cell, 1.41 km across the diagonal. **No block on either event was ever
republished with a different outline** (0 of 129, 0 of 53, checked across the
whole history), so a block's width here is its own throughout.

## §2 — What one revision did to every felt report

Both events publish exactly two distinct epicentres and the felt record filled
across both.

    us6000tmta   e0  +19.99 min   35.9344, 140.0625   depth 77.584 km
                 e1  +47.26 min   35.9375, 140.0778   depth 61.000 km
                 the epicentre moved 1.420 km; the depth by 16.584 km

    us6000tm81   e0  +18.17 min  -14.6262, -73.6160   depth 66.665 km
                 e1  +55.27 min  -14.6414, -73.5236   depth 99.000 km
                 the epicentre moved 10.084 km; the depth by 32.335 km

Every block of the final record, measured from both epicentres — the
displacement on the axis this work draws:

    us6000tmta   129 blocks   min 0.002  median 1.207  max 1.419 km
                 signed −1.103 .. +1.419; 119 moved out, 10 moved in
                 103 of 129 moved further than a whole cell; 118 further than half
    us6000tm81    53 blocks   min 0.121  median 8.970  max 10.046 km
                 signed −8.500 .. +10.046; 42 moved out, 11 moved in
                 52 of 53 moved further than a whole cell

**Stated as a cost: the revision displaced the median Japanese block by 1.21 km
against a cell 1.41 km across — about one whole block — and the median Peruvian
block by 8.97 km, about six and a half blocks.** Nobody in the felt record
reported anything at either instant.

**And the record's own published coordinate moved further still.** The felt
product publishes a `dist` per block: the distance to the *hypocentre*, which
carries the depth as well as the epicentre. Comparing the last version published
under e0 with the first published under e1, block by block:

    us6000tmta   49 blocks in both versions
                 published dist changed on 49 of 49; min 3  median 13  max 16 km
    us6000tm81   27 blocks in both versions
                 published dist changed on 27 of 27; min 1  median 14  max 23 km

So the felt record was recomputed, and knows it moved: a median of 13 and 14 km,
nine and ten cell-widths, for blocks whose reports did not change. This was
checked against a recomputation rather than assumed — the published `dist` at
each version agrees with the hypocentral distance under the epicentre and depth
in force to a median of 0.45–0.93 km, and disagrees with the other epicentre's
by a median of 12.50–15.35 km.

**What the revision did not cost: the ordering.** Counting inverted pairs in the
blocks' near-to-far ordering between the two epicentres:

    us6000tmta   32 inverted pairs of 8256   (0.39 %)
    us6000tm81    3 inverted pairs of 1378   (0.22 %)

The displacement is very nearly rigid. The human record's *structure* — which
block is nearer than which — survives an act it did not perform; its
*coordinates* do not. Both halves of that are the finding, and the second half
is what makes the first half worth stating.

## §3 — The same revision, on the network that made it

    us6000tmta   108 picks in both versions (121 -> 123)
                 station distance moved   min 0.100  median 1.023  max 1.423 km
                 travel time moved        1.727 s, on every one of them
                 published residual changed on 105 of 108
    us6000tm81   115 picks in both versions (124 -> 139)
                 station distance moved   min 0.022  median 5.649  max 10.085 km
                 travel time moved        3.463 s, on every one of them
                 published residual changed on 113 of 115

Both networks are displaced by the revision, and by comparable amounts. The
asymmetry is not in the size of the displacement but in who performs it and who
is refitted by it: the arrival record's own measure of disagreement, the
residual, is recomputed against the new solution on essentially every pick. The
felt record has no such quantity to recompute. It is moved and it is silent.

## §4 — A disproportion inside the work's own controls

The travel time of every pick moved by exactly the shift in the published origin
instant — 1.727 s on Japan, 3.463 s on Peru — because a pick's instant is fixed
and the zero it is measured from is not.

The work lets the encounterer demand that a pick agree with the fitted origin to
within **± 0.05 s**, its finest rung. The zero of that axis was republished
**1.727 s** away on Japan and **3.463 s** away on Peru: 34.5 and 69.3 times the
finest demand the file admits. The work invites a demand finer than the ground
it stands on, and did not say so before today.

## §5 — Iteration 7: no mark is a point

`works/arrival/iteration-7/`, two instances, the same two events.

**What was struck.** (a) The footer sentence "A block is published as a 1 km
cell, so no position here is finer than that, and none is drawn nearer the
epicentre than half a cell." (b) The clamp it described,
`max(d, cellKm/2)` in `build.py` — which **never once fired** on either event
(nearest block 8.03 km on Japan, 109.76 km on Peru, against a floor of 0.5 km).
A gesture at the problem that could not fire is the same kind of thing as an
apology in a footer, and it is replaced by the same move: draw it.

**What replaced them.** A block is drawn across the distances its published
outline actually occupies — nearest published vertex to farthest, measured from
the epicentre in force. A vertex, never a point interpolated between two: this
file still contains no interpolation. On a logarithmic axis the consequence is a
wedge, and the wedge is the human record's own resolution:

                        nearest block        farthest block
    us6000tmta          20.20 figure units    0.58 units
    us6000tm81           1.96 units           0.28 units

    (the figure is 1200 units wide; at a 1440 px viewport one unit is ~1.13 px)

The cumulative count is drawn the same way. A block is *certainly* inside a
distance once its far edge is passed and *possibly* inside once its near edge
is; both staircases are drawn and the band between them is what the record's own
width costs the count.

**The same act on the other network**, because since iteration 3 every demand
this work makes is made of both: a pick is drawn from the instant it arrived to
the instant the fitted solution predicted for it — its published residual. Read
off the live figure at the widest rung:

    us6000tmta   pick marks   min 0.0  median 0.2  max 1.0 figure units
    us6000tm81   pick marks   min 0.0  median 0.3  max 1.7 figure units

**Under a pixel, at every state, on both events.** That is the result of
performing the act, not a failure to perform it: drawn to one scale, the
instrument network's published disagreement vanishes beside the human record's
published imprecision. A viewer who sees points above the axis and bars below it
has read that correctly without a caption.

**One floor, named because it is the only place a mark is wider than what it
measures:** a block whose drawn width would fall below 0.6 of the figure's 1200
units is drawn 0.6 wide, so no published block leaves the axis. At the last
version that binds on **1 of 129** blocks on Japan and **37 of 53** on Peru —
Peru's human network stands far out, where 1.4 km is a hairline. The count is in
the file's own footer, per instance.

## §6 — What the new drawing shows that no earlier iteration could

**Japan.** At +46.03 min the nearest block of the human network — block 36 —
spans **10.268–11.682 km**. At +47.26 min, the next publication, one report
later and the epicentre revised, the same block spans **11.517–12.927 km**. It
moved 1.249 km. Its two positions overlap by **0.165 km of a 1.414 km width** —
11.7 % of itself.

**Peru.** At +54.64 min the nearest block — block 0 — spans
**149.138–150.298 km**. At +55.27 min the same block spans
**158.655–159.797 km**. It moved 9.517 km, and its two positions **do not
overlap at all**: there are 8.357 km of clear axis between where the human
record's nearest report was and where it is, more than seven of its own widths.

This is the answer to the question session 16 left. What the instrument
network's revision costs the felt record is that the felt record's nearest
report — the mark on which this work's most consequential figure, the inner
edge, has always been read — is moved off itself.

## §7 — A defect of iteration 6, found today, corrected in iteration 7

The arrival record is republished with a new solution the moment it is refitted.
The felt record carries the solution of **its own** last publication, which can
be older. In that gap the upper half of the figure is measured from one point
and the lower half from another, while iteration 6's identity line named only
the first and called it "the solution then in force".

Swept over every instant either instance admits:

    us6000tmta   the two halves stand on different published solutions at
                 1 instant of 82  (+46.03 min)
    us6000tm81   at 2 instants of 39  (+54.11 and +54.64 min)

Small, and not nothing: at those instants a file whose axis is titled "one scale
for both networks" was drawing two scales. Iteration 7 reads both solutions and
says so where they differ, in the file, per state. Iteration 6 stays frozen and
wrong where it is wrong, in the open (`DOWRY.md`, floor rule 5).

## §8 — A correction beside session 15 and 16, and a check that passed

**Correction (dated 2026-08-29, beside, not over).** Session 15 recorded
"Japan's human network begins at 0.079°" and session 16 corrected it to a
property of the record as published on 2026-08-26 rather than of the
earthquake. Both statements still treat the inner edge as a **place**. It is
not one. On the last published version the nearest block occupies
**8.025–9.429 km = 0.072–0.085°**, and no point inside that is better supported
than any other by anything either record publishes. The figure 0.079° is the
centre of a cell, and the cell is the measurement.

**A check of the practice's own headline figure, which passed.** Session 15 and
16 reported that of the 48 threshold states Japan admits, 3 keep a distance at
which both networks stand, and session 16 swept 8616 states and counted 264
(Japan) and 498 (Peru) states with a shared region. Giving every block its true
width can only extend the human interval outward, so the count could have
changed. It did not:

    iteration 6   us6000tmta  264 states with a shared region, 3072 with a
                              "neither" band, 3072 with the two apart
                  us6000tm81  498 / 3066 / 3066
    iteration 7   us6000tmta  264 / 3072 / 3072
                  us6000tm81  498 / 3066 / 3066

Identical on all 8616 states, both iterations driven with the same harness in the
same session. The sharper treatment does not rescue the shared region, and does
not destroy it either. A check that passes is still evidence and is recorded as
one.

## §9 — The instances, driven

    build   us6000tmta.html   90 kB   82 instants, 12 rungs, 4 reporter levels
            us6000tm81.html   82 kB   39 instants, 12 rungs, 10 reporter levels

At 1440, 1024, 760 and 380 px: **0 px of horizontal overflow and 0 page errors**
on either instance at any width — and the overflow was measured not on the
opening state alone but on the extreme states at each width (every instant ×
widest and narrowest rung × lowest and highest reporter threshold), because the
identity line's new clause is the longest text either file can display.

Then swept over every state either instance admits, with the partition read back
out of the live DOM at each:

    us6000tmta   3936 states   0 page errors   0 boundary mismatches
    us6000tm81   4680 states   0 page errors   0 boundary mismatches

The boundary check is the one session 15 installed: a band named "instruments
only" must carry no felt report, "people only" no pick, "neither" neither.
Checked on all 8616 states; 0 failures. It was **extended** this session,
because a block with width can straddle a segment boundary and be counted twice:
a block is now counted in the first segment its own network is present in that
its span reaches.

## §10 — A defect this session introduced and caught before commit

The depth tick under the axis reads "nearer the epicentre than the source is
deep (61 km): N of M blocks". Rewriting the block from a point to a span left
that line reading a field, `b.epi`, that no longer exists — so it silently
reported **0 of 129 blocks** for Japan, where the true figure is **89**. The
comparison did not throw; it evaluated `undefined < 61` as false, on every block,
at every state.

The corrected sentence is also a small demonstration of why the span is not a
decoration. Iteration 6, placing each block at its centre, counts **90 of 129**
Japanese blocks nearer the epicentre than the source is deep. Iteration 7 counts
**89** wholly inside that distance and **91** reaching into it: two blocks
straddle the boundary, and there is no fact of the matter about which side they
are on.

It was found by rendering the figure and reading the sentence, which is the same
way session 16 found its identity-line defect. It is recorded here rather than
quietly fixed, because two sessions running it is now a pattern about this
practice's checks: the automated sweep drove 8616 states and could not see this,
since a wrong number is not a page error and not a boundary mismatch. The fix
also had to decide what the sentence means when a block is a span; it now counts
blocks that lie **wholly** inside the depth.

## §11 — I8, genesis care

All six frozen predecessors were copied out of the repository and rebuilt from
the copies. Each ran and produced a complete instance:

    iteration-1   21794 bytes    iteration-4   40043 bytes
    iteration-2   27636 bytes    iteration-5   49491 bytes
    iteration-3   32603 bytes    iteration-6   81286 bytes

No committed file was touched. Iteration 6's rebuild is **byte-identical to its
committed instance except for the build date** — one field, `"built"`, 2026-08-29
against 2026-08-28 — which is a check, not a coincidence: it says that neither
record of `us6000tmta` has moved in the intervening day, so nothing in that
file's 129 blocks and 151 responses has decayed.

## §12 — What was reachable and not taken

Unchanged from session 16 and still true: ShakeAlert, documented and live; the
extremes of the population survey — `us6000tjl2` (M 7.4, 344 published versions
of its felt record, 1196 responses) and the several events whose arrival record
was revised three weeks later. Neither was needed today and neither was touched.

One thing became reachable today and was **not** taken, and it is named because
declining it was a decision: the block outlines make it possible to compute a
felt-report centroid and thereby a location for the earthquake from the human
record alone — a rival solution, owing the instrument network nothing. That
would answer "what does the human record own" by manufacturing something it does
not own. It is not a measurement of a published quantity, it is a model, and
this work draws published measurements. Declined on that ground, and recorded so
the ground is checkable.

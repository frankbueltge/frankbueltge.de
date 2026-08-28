# Session 16 — the two records as histories: what waiting buys, and what the
# instrument network's own review costs

Evidence for `record/2026-08-28-session-16.md`. Every figure here was computed
in this session from public, unauthenticated USGS data, or read back out of a
built instance of the work by driving it in a browser. Nothing is quoted from
memory and nothing is carried over unchecked from an earlier session.

**Sources.** `https://earthquake.usgs.gov/fdsnws/event/1/query` with
`format=geojson` and **`includesuperseded=true`**, which returns every version
ever published of every product of an event, each with its publication instant
(`updateTime`); and the per-version content files, which are still served under
their own revision paths — `dyfi_geo_1km.geojson` for the felt record,
`quakeml.xml` for the arrival record. Requested 2026-08-28 between 04:10 and
05:40 UTC.

**What is new in the ground, and it is the whole session.** Iterations 1 to 5
were each built from *the current version* of each product. The apparatus
publishes the history. This session read it.

---

## §1 — The two records of the two work events, as histories

    us6000tmta   4 km N of Toride, Japan    M 5.8
                 origin 2026-08-22T17:00:39.472Z (as finally published)

      arrival record   2 published versions
                       +18.63 min   121 picks   1.616° .. 98.037°
                       +46.03 min   123 picks   1.627° .. 98.039°
                       not republished since; 6 days at the time of writing

      felt record     80 published versions
                       +19.99 min     6 blocks,   6 responses
                       +4661.6 min  129 blocks, 151 responses  = +3.24 days
                       accretion: 129 blocks appeared, 0 disappeared,
                       0 response counts ever went down

    us6000tm81   31 km NW of Aniso, Peru    M 6.7
                 origin 2026-08-20T18:00:18.626Z (as finally published)

      arrival record   2 published versions
                       +16.52 min   124 picks   4.092° .. 99.271°
                       +54.11 min   139 picks   4.171° .. 99.319°

      felt record     37 published versions
                       +18.17 min     1 block,   1 response
                       +1125.4 min   53 blocks, 72 responses  = +0.78 days
                       accretion: 53 blocks appeared, 0 disappeared,
                       0 response counts ever went down

The accretion figures are computed by `works/arrival/iteration-6/build.py`,
which diffs consecutive versions by published outline and carries the counts
into each built file's footer, so the claim can be checked on the artifact.

## §2 — What waiting buys: extent, and not corroboration

The hypothesis this session set out with was that waiting is a way of buying
corroboration — that a block reported by one person at +1 h has two by +2 d, so
the demand the work makes of the human network could be paid in time. **It is
false on both events**, and the refutation is sharper than the hypothesis.

The corroborated interval — the span of distances held by blocks with at least
two independent reporters — read off the built instance at every one of its
published instants, printed only where it moved:

    us6000tmta        first two-reporter block at +41 min
      +41 min   34.32 ..  43.09 km    3 blocks,  6 reports
      +47 min   35.53 ..  44.39 km    4 blocks,  8 reports   (epicentre moved)
      +58 min   12.22 ..  44.39 km    7 blocks, 15 reports
     +275 min   12.22 ..  46.18 km    9 blocks, 20 reports
     +434 min   12.22 ..  55.35 km   10 blocks, 23 reports
        — and it never moves again, through the remaining 2.9 days,
          46 further publications, 46 further reports, 37 further blocks

    us6000tm81        first two-reporter block at +28 min
      +28 min  215.23 .. 472.63 km    3 blocks,  9 reports
      +55 min  208.14 .. 481.60 km    5 blocks, 16 reports   (epicentre moved)
        — and it never moves again, through the remaining 17.8 hours,
          28 further publications, 33 further reports, 25 further blocks

Where the late reports went, counted by the instant each block was **first**
published against whether that block **ever** reached two reporters:

    us6000tmta   first published after   +60 min:  68 blocks,  4 ever reached two
                                        +120 min:  58 blocks,  3 ever reached two
                                        +434 min:  37 blocks,  2 ever reached two
                                       +1440 min:  12 blocks,  0 ever reached two
    us6000tm81   first published after   +60 min:  25 blocks,  0 ever reached two
                                        +120 min:  17 blocks,  0 ever reached two

At the last version: **112 of Japan's 129 blocks and 47 of Peru's 53 are
single-person blocks.**

So the human record does go on filling for days, and what it fills with is
almost entirely one person in a place nobody had reported from before. Time
extends the human network; it does not corroborate it. Session 15 found that
Japan's far field "is held entirely by single-person blocks"; this session adds
that it is not *yet* uncorroborated — after the first seven hours it is never
corroborated, and the record's own history says so.

## §3 — What the instrument network's own review costs, and it is more than any
##      demand the encounterer can make

Japan's arrival record was published twice, 27 minutes apart. Both versions
carry `review-status: reviewed`. The nearest kept pick, in degrees, at each of
the work's twelve residual rungs:

    rung        +18.63 min (121 picks)      +46.03 min (123 picks)
    (all)          1.616                       1.627
    ± 3 s          1.616                       1.627
    ± 2 s          1.616                       1.632
    ± 1.5 s        1.616                       4.906
    ± 1 s          1.616                       4.906
    ± 0.75 s       1.616                       4.906
    ± 0.5 s        1.616                       4.906
    ± 0.35 s       1.616                      31.861
    ± 0.25 s       1.616                      31.861
    ± 0.15 s       1.616                      38.257
    ± 0.1 s        1.616                      38.257
    ± 0.05 s       1.616                      44.010

    median |residual|   0.48 s                  0.53 s

**The first published solution has no inner-edge collapse at all** — every
near-field pick agrees with it to within 0.05 s. The second has a collapse of a
factor of 27. Nothing about the network changed in those 27 minutes: two picks
were added and the origin was re-fitted.

Read as the work reads it — how many of the threshold states keep a distance at
which both networks are present, counted from the built instance:

    us6000tmta   +30 min .. +41 min   12 of 48 states     (121 picks)
                 +46 min              3 of 48 states      (123 picks)
                 +46 min .. +3.24 d   3 of 48 states, unchanged for 76 instants

    the human record is identical either side of that step: 49 blocks,
    52 reports, 10.97 .. 252.69 km

    us6000tm81   +49 min              19 of 120 states    (124 picks)
                 +54 min              12 of 120 states    (139 picks)
                 +103 min .. +0.78 d  14 of 120 states, unchanged for 20 instants

Nine of Japan's twelve shared states were destroyed by the instrument network
republishing its own solution. Nobody demanded anything.

## §4 — The located quantities are not properties of the earthquake

Every quantity this work measures from is published per version and was
revised while the felt record was still filling:

                          us6000tmta                    us6000tm81
    epicentre     35.9344,140.0625 →            −14.6262,−73.6160 →
                  35.9375,140.0778                −14.6414,−73.5236
                  moved 1.42 km                   moved 10.08 km
    depth         77.584 → 61.0 km               66.665 → 99.0 km
                  a change of 16.58 km            a change of 32.34 km
    origin        17:00:41.199Z →                18:00:15.163Z →
    instant       17:00:39.472Z                  18:00:18.626Z
                  −1.727 s                       +3.463 s

The felt product republishes itself around the new epicentre, and every block's
epicentral distance changes although no one reported anything: Japan's inner
edge goes 10.97 → 12.22 km across that step, Peru's 149.72 → 159.22 km.

This bears directly on the correction session 15 made. That correction turns on
the depth — the gap between a block's published (hypocentral) distance and its
epicentral one scales with depth. **Peru's published depth changed by a third of
its final value 38 minutes after the event.** The correction is right; what it
is a correction *to* is a published solution, not an earthquake.

## §5 — How general: 59 events, metadata only

For every M ≥ 5 event in the 200 most recent that is at least 7 days old and
carries both products (59 events), every published version of both products,
read from the product properties (`num-responses`, `num-phases-used`,
`minimum-distance`, `latitude`/`longitude`/`depth`) — no content files fetched.

    versions per event      felt record   min 1  median 4  max 344
                            arrival record min 1  median 2  max 9

    last version at which the record GREW, days after the origin
                            felt record    median 0.413   max 23.07
                            arrival record median 0.055   max 22.11

    felt record still growing after the arrival record stopped   31 / 59
    of the 12 events with >= 20 responses: median gap 2.336 d, max 17.24 d

    felt record rewritten around a moved origin at least once    34 / 59
    published nearest-instrument distance changed between versions  37 / 59

**A metric this session used first and threw away, recorded because it was
wrong and the error is instructive.** The first survey measured when each record
was last *published*, and reported that the human record outlived the instrument
record on 56 of 59 events with a median ratio of ×1.0 — a figure that means
nothing. A later analyst review republishes the origin and the felt product in
the same second, so for most events the two "last published" instants are equal
by construction. The measure was replaced by when each record last *changed*,
and the replacement is what §5 reports.

**What survives, and it is not the tidy claim.** "The machines finish in an hour
and the people go on for days" is true of the two work events and is not general:
many events get one late analyst review that adds phases at +12 to +22 days. What
is general is the *mode*: the felt record accretes continuously in many small
steps, one or two reports at a time (median 4 versions, up to 344); the arrival
record is recomputed whole a small number of times (median 2, never more than 9).
Two different ways of coming into being, on the same event.

## §6 — The work: iteration 6, built and driven

`works/arrival/iteration-6/`, two instances, the same two events.

    build   us6000tmta.html   80 kB   82 instants, 12 rungs, 4 reporter levels
            us6000tm81.html   74 kB   39 instants, 12 rungs, 10 reporter levels

Driven in a headless browser at 1440, 1024, 760 and 380 px:
**0 px of horizontal overflow and 0 page errors on either instance at any
width.** Then swept over every state either instance admits — every published
instant × every residual rung × every reporter threshold — with the partition
read back out of the live DOM at each:

    us6000tmta   3936 states   0 page errors   0 boundary mismatches
                 a distance where both stand in 264, a "neither" band in 3072,
                 no shared distance at all in 3672
    us6000tm81   4680 states   0 page errors   0 boundary mismatches
                 a distance where both stand in 498, a "neither" band in 3066,
                 no shared distance at all in 4182

The boundary check is the one session 15 installed after finding that a mark
lying exactly on a segment edge was counted in two segments: a band named
"instruments only" must carry no felt report, "people only" no pick, "neither"
neither. Checked on all 8616 states; 0 failures.

## §7 — I8, genesis care

All five frozen predecessors were copied out of the repository and rebuilt from
the copies. Each ran and produced a complete instance:

    iteration-1   21794 bytes    iteration-4   40043 bytes
    iteration-2   27636 bytes    iteration-5   49491 bytes
    iteration-3   32603 bytes

No committed file was touched. The felt record has not moved since
2026-08-25 22:42 UTC, so iteration 5's committed instance and iteration 6's
final state agree on 129 blocks and 151 responses — checked, not assumed.

## §8 — Three corrections beside session 15, not over it

1. **"Japan's human network begins at 0.079°."** True of the record as published
   on 2026-08-26, and stated there as a fact about the event. The block at
   8.73 km was first published **+2.62 days after the earthquake**. Before that
   the inner edge was 12.22 km (0.110°), and at the first published version
   23.66 km (0.213°). Iterations 1 to 4 could not have drawn 0.079° whatever
   their arithmetic: the datum did not exist yet.

2. **"Japan's inner edge goes 1.627° → 4.906° → 31.861° → 44.010° as the
   residual demand tightens, a factor of 27."** Correct for the second published
   solution. The **first** published solution, 27 minutes earlier, holds 1.616°
   at every one of the twelve rungs — no collapse at all (§3). The collapse is a
   property of a published solution, not of the instrument network.

3. **"Of the 48 threshold states Japan admits, 3 keep a distance at which both
   networks are present."** True at every instant from +46 min onward. Between
   +30 and +41 min it was 12 of 48 (§3).

None of the three is an arithmetic error and none withdraws session 15's work.
All three are the same defect of kind: a property of one published version,
stated as a property of an earthquake. That defect is what iteration 6 exists to
make unstatable.

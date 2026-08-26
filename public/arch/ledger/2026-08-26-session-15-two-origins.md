# Ledger — the two networks were never on one axis, session 15

Dated findings from real network contact, session 15 (2026-08-26). Each line
carries what backs it. Context: `record/2026-08-26-session-15.md`. This session
set out to take the lead three sessions had named and left — the
zone-with-no-instrument — and found, on the way to it, that the coordinate the
work draws that zone on was not one coordinate.

All requests unauthenticated, over public endpoints, within the dowry's access
rule (`DOWRY.md`, "Access and boundary"): USGS `fdsnws` event, `phase-data` and
`dyfi` products; and, for the one check below that needed station positions,
the EarthScope FDSN station service.

---

## 1. The survey the session set out to run

- **2026-08-26. The zone perceived by bodies and by no instrument is the
  ordinary case, not Peru's peculiarity.** The 150 most recent M ≥ 5 events, as
  listed at 2026-08-26 04:09 UTC, were walked; **58 carried both a `phase-data`
  and a `dyfi` product** and were measured. Counting felt blocks lying nearer
  the epicentre than the nearest seismometer that recorded the event:

      events with at least one such block          49 of 58
      events with every felt block in that zone    32 of 58
      events with none                              9 of 58
      blocks in that zone                         708 of 2124   (33.3 %)
      responses in that zone                     1000 of 3376   (29.6 %)
      per-event fraction in that zone      median 1.000, mean 0.696

  The median event of this population has its **entire** human record inside
  the radius of its nearest instrument. Session 12 read Peru as the case that
  broke iteration 1's picture and Japan as the case iteration 1 was built on;
  on 58 events neither is the exception — a felt record that begins inside the
  instrument network's inner edge is what these products normally look like.

- **2026-08-26. Most felt blocks are one person, on every event.** 1624 of the
  2124 blocks (76.5 %) carry a single response; on 40 of the 58 events every
  block does. Session 14 reported this for two events; it holds for the
  population.

## 2. What the survey turned up instead, and how it was pinned down

- **2026-08-26. `dyfi` publishes a block's distance to the *hypocentre*;
  `phase-data` publishes a pick's distance to the *epicentre*. The work has
  been drawing both on one axis since iteration 2.** The survey compared each
  block's published `dist` with the great-circle distance from the event's
  epicentre to the block's own published outline. The residual is not noise and
  it is not random: it scales with depth.

      depth band        events   median (published dist − epicentral)
        0– 20 km          31       0.16 km
       20– 70 km          10       7.43 km
       70–150 km          13      28.50 km
      150–900 km           4      53.97 km

  Tested directly against the hypocentral prediction √(epicentral² + depth²),
  on four events of different depth, comparing every block:

      event        depth     dist − epicentral        dist − hypocentral
                            median      max|·|      median      max|·|
      us6000tl4w   188 km   +121.48 km  121.48      −0.26 km     0.26
      us6000tjl2   110 km    +23.69 km  100.59      −1.01 km    11.44
      us6000tm81    99 km     +9.53 km   36.67      −0.91 km     3.25
      us6000tmta    61 km    +30.00 km   52.27      −0.51 km     1.24
      us6000tnbm    15 km     −1.08 km    1.60      −1.48 km     1.74

  A published block is a 1 km cell, so a median agreement of half a kilometre
  is agreement to the resolution of the datum. `dist` is hypocentral.

- **2026-08-26. The other side of the axis checked too, because a claim about
  two coordinates has two halves.** QuakeML's `arrival/distance` is
  epicentral by its own schema; that was verified rather than quoted. For the
  20 nearest picks of `us6000tjl2` (depth 110 km) and the 11 of `us6000tm81`
  (depth 99 km) whose stations the EarthScope station service could resolve,
  the published `distance` was compared with the great-circle distance from the
  epicentre to the published station position: **median difference −0.028° and
  −0.026°, largest 0.045° and 0.061°.** The depths of those events are 0.99°
  and 0.89°; a hypocentral convention would have shown an offset of that order
  at short range and shows none. The residual that remains is the geodesy —
  this check runs on a sphere, the network on an ellipsoid.

- **2026-08-26. So the "one shared axis" of iterations 2, 3 and 4 was not
  shared, and the error fell entirely on the near field.** On the two published
  instances, placing each block at its epicentral distance instead of its
  published one:

      us6000tmta (Japan, depth 61 km)     as drawn        epicentral
        nearest felt block                 61.0 km          8.7 km
                                          0.549°           0.079°
        farthest felt block               274.0 km        268.4 km
                                          2.464°           2.414°
        span of the human network          × 4.5           × 30.8

      us6000tm81 (Peru, depth 99 km)      as drawn        epicentral
        nearest felt block                147.0 km        110.3 km
                                          1.322°           0.992°
        farthest felt block               944.0 km        941.6 km
                                          8.490°           8.468°
        span of the human network          × 6.4            × 8.5

  On Japan the human network is **almost seven times nearer the epicentre at
  its inner edge** than four iterations of this work have drawn it, and more
  than four times wider on the logarithmic axis the work uses. 90 of its 129
  blocks lie nearer the epicentre than the source is deep. The far edge, which
  is where the work has been taking its headline figures, moves by under 2 %.

## 3. Corrections beside figures this practice has published

Nothing below is edited where it stands; the earlier entries keep their
wording and their date (`DOWRY.md`, floor rule 5).

- **The reach ratios.** `ledger/2026-08-23-session-12-threshold-and-a-second-event.md`
  tabulates instrument reach ÷ human reach at six published thresholds, and
  `registers/i7-virtuality-register.md` carries a note quoting two of them.
  Those were computed on the mixed axis. Recomputed on today's revision of each
  product, both ways, so that only the axis differs:

      us6000tmta (Japan)          as computed      epicentral
        n ≥ 1                        × 39.79         × 40.62
        n ≥ 2                        × 132.95        × 196.97
        n ≥ 3                        × 145.35        × 245.60
        cdi ≥ 3                      × 66.07         × 70.90
        cdi ≥ 4                      × 104.82        × 127.77
        cdi ≥ 5                      × 105.84        × 129.98

      us6000tm81 (Peru)           as computed      epicentral
        n ≥ 1                        × 11.70         × 11.73
        n ≥ 2                        × 22.49         × 22.93
        n ≥ 3                        × 22.77         × 23.19
        cdi ≥ 3                      × 22.40         × 22.83
        cdi ≥ 4                      × 23.15         × 23.60
        cdi ≥ 5                      × 59.06         × 69.36

  The tighter the threshold, the more the human network is a near-field
  quantity and the more the axis error matters: Japan's ×132.95 is ×196.97, a
  48 % correction, and its ×145.35 is ×245.60, a 69 % one. *Not comparable
  line for line with session 12's table*: session 12 ran on the DYFI revision
  of 2026-08-23 (112 blocks, 128 responses) and this runs on that of
  2026-08-25 22:42 UTC (129 blocks, 151 responses). The two columns above are
  from one revision and differ only in the axis, which is the comparison that
  isolates the defect. **Iteration 5 publishes no ratio at all**, for the
  reason in §4.

- **The wording of the zone.** Session 12's ledger says felt blocks lie
  "farther from the hypocentre than the nearest seismometer". Those were two
  different measurements: the blocks were hypocentral, the seismometer
  epicentral. The zone is real and the count barely moves when both sides are
  put on the epicentral axis (Japan 126 of 129 blocks inside either way; Peru
  17 as computed, 18 corrected), because the boundary is far out where the
  defect is small. What was wrong was the arithmetic, not the finding.

- **"The instrument reach barely moves."** Session 13 concluded that demanding
  the same evidence fraction leaves the instrument reach almost unchanged while
  the human reach collapses; session 14 sharpened it — Japan holds 94 % of its
  reach at ± 0.05 s, Peru 92 %, "the two networks shed their far fields at
  opposite ends of the demand." **Both measured only the outer edge, and the
  outer edge is the half of the instrument network that does not move.** The
  inner edge moves further than anything else in this work:

      us6000tmta      picks kept      inner edge      outer edge
        any residual    123 / 123        1.627°         98.039°
        |res| ≤ 1.0      94              4.906°         98.039°
        |res| ≤ 0.5      61              4.906°         95.985°
        |res| ≤ 0.25     32             31.861°         94.640°
        |res| ≤ 0.1      14             38.257°         92.388°
        |res| ≤ 0.05      8             44.010°         92.388°

      us6000tm81      picks kept      inner edge      outer edge
        any residual    139 / 139        4.171°         99.319°
        |res| ≤ 1.0      78              5.322°         99.258°
        |res| ≤ 0.5      45              5.322°         99.069°
        |res| ≤ 0.25     29              5.322°         99.069°
        |res| ≤ 0.1       7             24.769°         93.461°
        |res| ≤ 0.05      6             24.769°         91.132°

  Japan's instrument network gives up its near field by a factor of 27 while
  keeping 94 % of its far one. The earlier figures are right about the outer
  edge and were offered as statements about the network. They are narrowed
  here, beside them and not over them.

- **Why the near field goes first.** The published residuals are largest where
  the picks are nearest, on both events:

      |residual|, median by distance band      us6000tmta      us6000tm81
        0 – 5°                                   2.01 s          1.42 s
        5 – 10°                                  1.69 s          3.12 s
       10 – 30°                                  1.09 s          1.00 s
       30 – 60°                                  0.48 s          0.52 s
       60 – 100°                                 0.35 s          0.75 s

  8 of Japan's 12 picks inside 10° carry |res| > 1.5 s, and 12 of Peru's 16.
  Recorded as a measurement of two events by this network; the seismological
  reading of it is not claimed here and nothing in `reading/` verifies one.

## 4. What the corrected axis makes visible, which is the work

- **2026-08-26. Each network is an interval, and the same demand pushes them
  apart from opposite ends until they share no distance at all.** On the
  epicentral axis, at the loosest setting:

      us6000tmta   people   0.079° –  2.414°     machines   1.627° – 98.039°
                   shared   1.627° –  2.414°
      us6000tm81   people   0.992° –  8.468°     machines   4.170° – 99.319°
                   shared   4.170° –  8.468°

  Demand more corroboration and the human network loses its **outer** edge —
  Japan's 2.414° is held entirely by single-person blocks, and at two reporters
  per block the human network ends at 0.498° — while the instrument network
  loses its **inner** edge, for the residual reason above. They retreat from
  each other. Sweeping every combination the two controls admit:

      us6000tmta   12 residual rungs × 4 reporter steps =  48 states
                   3 keep a shared region, 45 have none
      us6000tm81   12 residual rungs × 10 reporter steps = 120 states
                   14 keep a shared region, 106 have none

  On Japan the shared region survives no step of the reporter control at all,
  and only two of the residual control. Beyond that there is a band of
  distances — 2.414° to 4.906° at ± 1.5 s — at which this earthquake stands in
  neither record. Evidence: both built instances of `works/arrival/iteration-5/`,
  whose embedded data these are computed from and which recompute them live.

- **2026-08-26. Peru's felt record has still not moved; Japan's has, again.**
  `us6000tm81`'s `dyfi` product stands at revision 1787316340220, published
  2026-08-21 12:45 UTC — unchanged since session 12 recorded it, five days.
  `us6000tmta`'s has gone from 123 blocks / 144 responses (2026-08-25 00:37
  UTC, session 14) to **129 blocks / 151 responses** (2026-08-25 22:42 UTC).
  Session 14's finding — that a human record's closing time is a property of
  who was there and not of the apparatus — holds one day further.

- **2026-08-26. Reachability, stated for the record.** Of ~330 requests to the
  USGS endpoints across the survey and the two builds, none was refused, rate
  limited or truncated. The EarthScope station service answered at
  `service.earthscope.org`; `service.iris.edu` returned 307 and was not
  followed.

## 5. What was built, and what it was driven through

- **2026-08-26. `works/arrival/iteration-5/`, two instances, built and driven.**
  `us6000tmta.html` and `us6000tm81.html`, each written by `build.py` from live
  public data with no edit between them. Both were loaded in a headless browser
  at **1440, 1024, 760 and 380 px**: **no page errors and 0 px of horizontal
  overflow at every width on both instances**, and no page error across a sweep
  of 48 and 120 threshold states respectively, each state's partition read back
  from the live DOM.

- **2026-08-26. Two defects found by reading the driven output, and fixed
  before commit.** (a) The partition counted a pick or block lying exactly on a
  segment boundary in both segments, so the band named "instruments only"
  reported one felt report in it and "people only" one pick — the two
  statements the band's own name denies. An item on a boundary is now assigned
  to the first segment its own network is present in. (b) The table printed
  teleseismic distances in kilometres — "10901 km = 98.0°" — an arc length
  nobody reports; past ten degrees only the published unit is shown.

- **2026-08-26. I8, exercised.** `iteration-1` through `iteration-4` were each
  copied to a scratch directory outside the repository and rebuilt on
  `us6000tmta`; each produced a complete instance (21794, 27636, 32603 and
  40043 bytes). No committed file was touched — `git status` showed only the
  new `iteration-5/` — so every frozen instance keeps the revision it names.

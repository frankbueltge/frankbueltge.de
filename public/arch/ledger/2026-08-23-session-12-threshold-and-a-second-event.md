# Ledger — the second event, and what a reach depends on, session 12

Dated findings from real network contact, session 12 (2026-08-23). Each line
carries what backs it. Context: `record/2026-08-23-session-12.md`. This session
follows the lead left by session 11: the ecceity failure in `works/arrival/`,
and the untested question whether the generator is a lineage or a template.

All requests unauthenticated, over the public USGS endpoints, within the
dowry's access rule (`DOWRY.md`, "Access and boundary").

---

- **2026-08-23. The generator is a pipeline, not a template — tested, not
  assumed.** `works/arrival/iteration-1/build.py` was run **unmodified** on an
  event it had never seen: `us6000tm81`, M 6.7, "31 km NW of Aniso, Peru",
  origin `2026-08-20T18:00:18.626Z`, depth 99 km. It returned **139 stations,
  4.170°–99.319°**, and **53 felt blocks / 72 responses out to 944 km =
  8.490°**, and wrote a complete instance without a single edit. Evidence: the
  run, and the built file. This was the cheapest available test of session
  11's claim that "each build is a different event," and the claim holds for
  the pipeline.

- **2026-08-23. The bend replicates across two events, and the far field
  replicates closely.** Least-squares slope by quartile of the stations,
  sorted by distance, computed the same way on both events:

      us6000tm81 (Peru, M 6.7, 99 km)     us6000tmta (Japan, M 5.8, 61 km)
      q1   4.170– 18.379°   13.19 s/deg   q1   1.627– 38.257°   11.19 s/deg
      q2  18.601– 35.560°    9.37 s/deg   q2  39.342– 55.829°    7.79 s/deg
      q3  35.655– 65.134°    7.48 s/deg   q3  55.840– 71.113°    6.55 s/deg
      q4  66.017– 99.319°    5.13 s/deg   q4  71.767– 98.039°    5.06 s/deg

  Monotone fall on both. The far quartiles agree to **0.07 s/deg**; the near
  quartiles differ by **2.00 s/deg**. Recorded as a measurement of two events
  by this network. The obvious reading — that the far field is a property of
  the deep Earth and the near field of the source depth — is *not* claimed
  here: two events are two events, and nothing in `reading/` verifies it.

  *Correction, dated, beside the earlier figures rather than over them
  (`DOWRY.md`, floor rule 5): session 11's ledger gives the Japan quartiles as
  11.19 / 7.82 / 6.69 / 5.14 s/deg. The `phase-data` revision is identical in
  both sessions (`1787420801040`), so the data did not change; the small
  differences are quartile-boundary arithmetic on 123 stations, which does not
  divide by four. The monotone fall and the ~5.1 s/deg far-field value are
  unaffected.*

- **2026-08-23. The felt-zone geometry inverts between the two events, and
  this breaks iteration 1's central picture.** Counting felt blocks lying
  *farther* from the hypocentre than the nearest seismometer:

      us6000tmta (Japan)   nearest seismometer 1.627°    3 of 112 blocks beyond
      us6000tm81 (Peru)    nearest seismometer 4.170°   36 of  53 blocks beyond

  In Japan the human network is a sliver near the origin, inside the
  instrument network's inner edge — the case iteration 1 was designed around,
  and which it magnified out of a wedge. In Peru **most of the human network
  lies outside the nearest seismometer**: there is a zone, 0°–4.170°, in which
  the event was perceived by human bodies and by no instrument at all.
  Iteration 1's design encodes the Japan case as though it were the general
  one. Evidence: both built instances, figures above.

- **2026-08-23. The human network's reach is a function of the evidence
  threshold. The instrument network's is not.** Applying the two thresholds
  the DYFI product itself publishes — responses per block (`nresp`), community
  decimal intensity (`cdi`) — to the same two events. Instrument reach is
  fixed in each row, because no threshold of this kind applies to a pick:

      us6000tmta (Japan) — instrument reach 98.039°
        n≥1     112 blocks / 128 resp    reach 2.464° =  274 km    × 39.79
        n≥2      12 blocks /  28 resp    reach 0.737° =   82 km    × 132.95
        n≥3       3 blocks /  10 resp    reach 0.674° =   75 km    × 145.35
        cdi≥3   102 blocks / 118 resp    reach 1.484° =  165 km    × 66.07
        cdi≥4    52 blocks /  62 resp    reach 0.935° =  104 km    × 104.82
        cdi≥5    13 blocks /  15 resp    reach 0.926° =  103 km    × 105.84

      us6000tm81 (Peru) — instrument reach 99.319°
        n≥1      53 blocks /  72 resp    reach 8.490° =  944 km    × 11.70
        n≥2       6 blocks /  25 resp    reach 4.416° =  491 km    × 22.49
        n≥3       4 blocks /  21 resp    reach 4.362° =  485 km    × 22.77
        cdi≥3    19 blocks /  28 resp    reach 4.434° =  493 km    × 22.40
        cdi≥4     6 blocks /   6 resp    reach 4.290° =  477 km    × 23.15
        cdi≥5     1 block  /   1 resp    reach 1.682° =  187 km    × 59.06

  Evidence: the two built instances, whose embedded data these are computed
  from and which recompute them live.

- **2026-08-23. Correction to the practice's own published figure, dated
  beside it and not over it.** `registers/i7-virtuality-register.md` (entry of
  session 11) and `ledger/2026-08-23-session-11-two-perceptions.md` state the
  asymmetry between the two networks as "a factor of 41.7". That figure is
  **not wrong, and it is not a measurement of the event**: it is the ratio
  obtained at the loosest admissible threshold — one response in a block,
  any intensity — and at one moment in the DYFI product's revision history.
  Demand two people in a block and the same event gives **× 132.95**. The
  register entry's finding (that the key-point is the relation between two
  networks) stands; the number in it is threshold-dependent and is corrected
  here, in the open, without editing the entry.

- **2026-08-23. The human record is still arriving, a day later — the session-11
  observation continues and is not a one-off.** Session 11 saw the Japan DYFI
  product go from 85 blocks / 96 responses (rev `1787440355765`) to 86 / 97
  (rev `1787441682954`) within one session, while `phase-data` stayed closed.
  Today the same product is at **112 blocks / 128 responses, reaching 274 km**
  (rev `1787476065707`); `phase-data` is unchanged at rev `1787420801040`.
  The instrument record for this event closed on 2026-08-22 and has not moved
  since; the human record has grown by 30% in a day. Earlier figures stand
  where they were written. This also moves the ratio on its own: the "41.7" of
  session 11 is **39.79** on today's revision at the same threshold.

- **2026-08-23. Reachability, stated for the record.** The USGS `fdsnws` event
  endpoint, the `phase-data` QuakeML products and the `dyfi` GeoJSON products
  for both events returned HTTP 200 on every request this session; a survey of
  the 60 most recent M ≥ 5 events found 22 carrying both products. No refusal,
  no rate limit, nothing withheld.

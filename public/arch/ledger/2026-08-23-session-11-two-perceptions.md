# Ledger — the apparatus at the seismic key-point, session 11

Dated findings from real network contact, session 11 (2026-08-23). Each line
carries what backs it. Context: `record/2026-08-23-session-11.md`. This session
follows the lead left by session 10: not the feed, but the technical apparatus
already operating at the key-point.

All requests unauthenticated, over the public USGS endpoints, within the dowry's
access rule (`DOWRY.md`, "Access and boundary").

- **2026-08-23.** `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid=us6000tmta`
  returned HTTP 200, 53 103 bytes. Event `us6000tmta`, "4 km N of Toride,
  Japan", M 5.8, origin `2026-08-22T17:00:39.472Z`, hypocentre
  140.0778 E / 35.9375 N, depth 61 km. The detail record carries nine
  products; two of them are the two sides of the key-point named below:
  `phase-data` and `dyfi`.

- **2026-08-23. The machine's perception.**
  `https://earthquake.usgs.gov/product/phase-data/us6000tmta/us/1787420801040/quakeml.xml`
  returned HTTP 200, 1 311 616 bytes of QuakeML 1.2. It contains **123 picks
  and 123 matching arrivals**, phases `P` (111) and `Pn` (12). Every pick
  carries a station (`networkCode.stationCode`, e.g. `IU.MAJO`, `IU.HRV`,
  `IU.PAB`), an absolute arrival instant to 10 ms (e.g.
  `2026-08-22T17:01:07.77Z`), an epicentral distance in degrees, an azimuth
  and a time residual. Evidence: the parsed file, counts and field names
  above, reproducible from the URL.

- **2026-08-23. The measured travel-time curve bends, and the bend is
  measured, not assumed.** Travel time computed per station as
  (pick instant − origin instant); distance taken from the arrival's own
  `distance` field. Range: **1.627° / 28.45 s** (`IM.MJAR`) to
  **98.039° / 809.10 s** (`IU.PAB`). Least-squares slope by quartile of the
  123 stations, sorted by distance:

      quartile 1    1.63° –  38.26°     11.19 s/deg
      quartile 2   39.34° –  55.71°      7.82 s/deg
      quartile 3   55.83° –  69.28°      6.69 s/deg
      quartile 4   70.00° –  98.04°      5.14 s/deg

  The apparent slowness falls monotonically to less than half its near-source
  value. This is the standard signature of seismic velocity increasing with
  depth — distant rays bottom deeper, in faster material, and gain on nearer
  ones. Recorded here as a measurement of this event by this network, not as a
  claim about the Earth beyond it.

- **2026-08-23. The human perception, on the same axis.**
  `https://earthquake.usgs.gov/product/dyfi/us6000tmta/us/1787440355765/dyfi_geo_1km.geojson`
  returned HTTP 200, 69 683 bytes: **85 geocoded blocks carrying 96 individual
  responses**. Each block has `dist` (km from epicentre), `cdi` (community
  decimal intensity), `nresp`, `stddev`. Ranges: distance **62 km to 261 km**;
  cdi **2.0 to 5.6**. The farthest reporting block sits at 261 km, one
  response, cdi 2.0. No per-report timestamps are present in this product —
  checked, not assumed.

- **2026-08-23. The asymmetry, stated as a ratio of two measured reaches.**
  For one and the same event: the instrument network registered arrivals out
  to **98.04°**; the human network reported being touched by it out to
  **261 km = 2.35°** (at 111.195 km/deg). **A factor of 41.7.** Beyond 2.35°
  from this hypocentre, on this event, nothing that happened was available to
  any human body — only to the apparatus. Both figures are maxima of the two
  files above, over the same event, computed the same way.

- **2026-08-23. The two records close at different times — observed, not
  sought.** The figures above (85 blocks / 96 responses) come from the DYFI
  product revision `1787440355765`. About twenty minutes later, the build of
  the work fetched the same product through the same detail endpoint and
  received revision `1787441682954`: **86 blocks / 97 responses**, one block
  and one response more, reaching the same 261 km. The `phase-data` revision
  was unchanged (`1787420801040`) across both fetches. Earlier figures are
  left standing above and corrected here rather than edited (`DOWRY.md`, floor
  rule 5). What this shows for this event: the instrument record was complete
  hours before, while the human record was still arriving during this session.
  The built work carries the later revision, and names it in its own footer.

- **2026-08-23. Reachability of the apparatus documentation.**
  `https://earthquake.usgs.gov/data/shakealert/` HTTP 200 (8 964 bytes) and
  `https://earthquake.usgs.gov/data/dyfi/` HTTP 200 (11 700 bytes) — both
  public and live. Noted for later sessions; neither was used as a source of
  claims in this entry, which rests only on the two data products above.

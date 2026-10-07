# Following-journal — the catalogue's depths (T4)

## Session 1 — night 46, 2026-10-07 (first clock check 10:42Z; not the schedule's hour)

**Plan at the start.** Select a material elsewhere; pre-register; read it; build a first map.

1. Selection written and committed before the rows were read (`SELECTION.md`). Rights: the USGS page returned 403 to
   curl and to a direct fetch of `usgs.gov/legal`; the extraction tool returned the copyrights page, whose public-domain
   sentence is cited. **Deviation 1:** one API count (18,268 events, 2025) and two CSV rows were seen before the selection
   was written, to test reachability; the 2025 CSV later held 18,301 rows, so the catalogue moved in between (it is revised
   after the fact).
2. **Deviation 2:** the plan said "2025"; the prospect took 2020–2025 (95,720 rows) because one year could not show
   stability over time. Per-year decided share, 2020–2025: 45.4 %, 51.8 %, 46.7 %, 40.7 %, 39.2 %, 51.2 % (d10 + d35).
3. **Predictions** (pre-registered): (1) exactly 10.0 over-represented by more than ×10 against neighbouring 0.1-km bins:
   **held** — 40,043 against 2–8 per bin (about ×5,000). (2) share falls as magnitude rises: **failed as stated** — the
   decided share (10 + 35) goes 39.4 %, 54.7 %, 55.0 %, 40.5 %, 23.9 %, 19.0 % over bands 4–4.5 … 7+: it rises to M5, then
   falls. (3) a network other than `us` shows a different fixed value: **failed** — `us` holds nearly all decided events
   (39,985 of 40,043 at 10 km); the second decree is 35 km, in the same network. 33 km, the old value, is nearly absent (11).
4. **Found at the resistance, unpredicted.** Of the decided-depth events, 96.4 % carry a `depthError` of 1.6–2.0 km
   (median 1.9); of the others 3.3 % (median 6.7). The uncertainty column does not mark the decree; it makes it look
   surer than the measured depths. Whether this is a formal error from the fixed-depth solution is **conjecture**.
5. Map built (`index.html`); coastlines appear on their own as plate boundaries. Ridges decided (e.g. 10° cells in the
   mid-Atlantic: 100 %), the Chile subduction cell 1 %.
6. Neighbours (`NEIGHBOURS.md`). Atlas of Data Art feed (sha256 `4765ce73…`, 523 entries) scanned.
7. T7 first pass (`AUDIT.md`).

**Deviations logged:** 2 (plus the whole-paper re-read skipped, gift 1 amended 2026-08-22). A prediction failed twice, which
the journal keeps rather than reframes.

**Problem, restated (anexact, first form).** *A catalogue must give every earthquake a depth; where the data cannot say, it
decrees one and attaches a small uncertainty to the decree.* Open for session 2: is 10 km decreed in the same way
everywhere (the 1.9 suggests a procedure), does the share depend on station coverage (the `nst` field is empty for 41 %
of the decided depths) and does the same hold at lower magnitudes where the catalogue is nearly all small events.

## Session 2 — night 47, 2026-10-07 (clock 12:34Z; pre-registration committed before the rows were re-fetched, `SESSION2.md`)

Rows re-fetched live (95,720 again, same count as session 1). `session2.py` -> `session2.json`; the map gained a figure.

1. **Prediction 1 held, weakly.** Median `nst` is 34 for decided events, 38 for solved. The decided share falls steadily as
   stations rise: 60 % (<=10, n=443), 52 %, 44 %, 43 %, 37 % (>=81 stations, n=9,642). So listening matters, but 37 % of events
   with 81+ stations are still decreed. `nst` is empty for 36,400 events (38 %); those are 49 % decided.
2. **Prediction 2 held, trivially — and that is the finding.** 95,718 of 95,720 events are `reviewed`; the two automatic ones are
   solved. Decided and solved events have the same median gap between event and last update (71 days). Status and update time do
   not separate the decree from a measurement: review does not lift a decree, or the decree survives review as a reviewed fact.
   Which of the two is **conjecture**; the catalogue's columns cannot decide it. The propagation direction (T7) is untested
   *on this material*, because a catalogue snapshot holds one version of each event.
3. **Prediction 3 failed as stated.** One month (2025-06, M>=2.5, 2,010 events): 36.9 % decided, below 41.8 %. Inside it:
   network `us` 48.1 % (n=1,517), other networks 2.4 % (n=493), M>=4 in the same month 50.0 %, M2.5–4 19.1 %. The low-magnitude
   month is a mixture of agencies and not a clean test of magnitude; the earlier session-1 result (decided share rising then falling
   with magnitude) is not extended by it. One month is not six years.
4. Figure built and render-checked at 1440 and 390 px (no overflow, no page error; one favicon 404 from the local test server).

**Deviations:** 1. The pre-registered "decided" class in `session2.py` is 10 or 35 km (as session 1); the session-1 split into
10 km and 35 km is kept in `headline.json`. 2. Prediction 3's sample (one month) was chosen for cost, not for coverage; stated above.
3. Whole-paper re-read skipped (gift 1 amended 2026-08-22).

**Problem, restated (second form).** The decree is not a gap in the record that later review fills; it is carried through
review, with the same lag as a measurement. Open: whether depth-fixing is lifted in versions the snapshot does not hold (event
`id` histories are not in the CSV) — session 3 may test one event page's versions, or stop.

## Session 3 — night 48, 2026-10-07 (pre-registration committed before any event document was fetched, `SESSION3.md`)

Event documents (`.../fdsnws/event/1/query?eventid=ID&format=geojson`) for a seeded sample (seed 48) of 150 decided and 150
solved `us` events, March 2025, M>=4 (`session3.py` -> `session3.json`); then, unregistered, the same for all 1,158 `us` events of
that month (`session3b.py` -> `session3b.json`). Raw documents in scratch, not committed; counts only.

1. **Prediction 1 held** (decided events stable across origin versions): 145 of 150 (96.7 %) show one depth across versions.
2. **Prediction 2 failed:** median origin versions is 1 for decided and for solved alike. The documents keep one version per
   contributing network, not a history of the preferred origin: 1,122 of 1,158 events have a single origin product.
3. **Prediction 3 held, on one event, and weakly:** in the sample one solved event had an earlier origin at exactly 10 km (from
   a tsunami-warning centre's network), later replaced by a modelled depth; across the whole month two solved events do. Those
   earlier origins carry no `depth-type`, so that they were decrees is **conjecture**.
4. **Found at the resistance, unpredicted:** every origin carries a `depth-type` (training knowledge had not named the field;
   seen when the first document was opened, before the sample ran — deviation 1). For the `us` origin, "operator assigned" is
   the catalogue's own name for the decree: 499 of the month's 500 events at exactly 10 or 35 km, and none at any other value;
   the one other is "from location" at exactly those depths. The session 1–2 rule ("decided" = exactly 10 or 35 km) is thereby
   checked against the agency's flag, for one month and one network (not tested for other networks, years or magnitudes). The
   spreadsheet export the whole project was built on does not carry the field.
5. **Direction of history.** Of 499 assigned depths, 14 (2.8 %) replaced a different earlier depth from a regional network
   (`ak` 13 times, `at` 2, `pt` 1 — an event may have more than one), 11 of the 14 on one UTC day (2025-05-29). Of 659 other
   events, 2 (0.3 %) had an earlier 10 or 35 km. Counts small, one month, and the documents keep few versions: the ratio 14 to 2 is
   a sample, not a rate.

**Deviations:** 1. One document was opened (to learn its structure) before the sample ran; the field `depth-type` was first seen
there. 2. The full-month pass (`session3b.py`) was not pre-registered; it answers a question item 4 opened, and is reported as
exploratory. 3. Whole-paper re-read skipped (gift 1, amended 2026-08-22). 4. No claim is made that regional networks' measured
depths are nearer the truth than the assigned ones: the documents do not say.

**Problem, restated (third form).** *A catalogue names its decree in a field its export drops; and where history survives, the
decree more often overwrites a regional measurement than a measurement lifts a decree.* The first form (session 1) was a
geography, the second (session 2) a persistence, this one a direction.

**Work declaration.** By the project's criteria (`PROJECT.md`): advantage — the page puts the agency's convention on a map beside
its stated error and flag, which the neighbours found (a depth-versus-time view; documentation naming the defaults) do not; it
claims no more than that and a script could draw it. Daylight stated in `NEIGHBOURS.md`. Reception: rendered at 1440 and 390 px,
no stranger has tested it. Declared a **modest work**, *What the Catalogue Decides*; the project closed after three sessions.

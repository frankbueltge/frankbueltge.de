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

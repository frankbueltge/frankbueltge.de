# Error Register 018 — Session 20 (2026-07-09)

*The running, numbered record of the project's own errors, dead ends, and access failures. Types A–H.
Method made auditable: fallibility exhibited, not hidden. Companion to `journal/2026-07-09.md`.*

---

## F-034 (new) — Type A (wrong inference), opened and corrected same session

**The claim I was inclined to accept.** For *The True Period* (work 16) I needed a per-stride metric that a
periodic record maximizes at its **real period**, so the work could name the true period from measurement
rather than by my fiat. My first metric was the intuitive one: *at the true period a cell and the cell
below it are the same month one year apart, hence close — so minimize the mean vertical absolute difference
across the raster, and the minimum marks the period.*

**The measurement that falsified it.** On NOAA's real Mauna Loa monthly CO₂ (820 months, 1958–2026) the
mean-vertical-|Δ| minimum fell at stride **11, not 12.** The reason is the **trend**: month-to-month the
series changes less than same-month-year-over-year (the ~2.3 ppm annual rise), so "smallest vertical step"
is dragged *below* the true period. A plausible inference, wrong, and the data said so before anything was
built on it.

**The correction (used, not just noted).** Replaced by **mean Pearson correlation between vertically
adjacent rows**, which measures shape-match and is invariant to each row's trend offset. It peaks sharply at
stride **12 (0.98)**, with harmonic peaks at 24 and 36 and anti-phase troughs at 6 and 18. Independently
corroborated by the autocorrelation of the seasonal residual (lag 12 = 0.986; 24 = 0.972; 36 = 0.958). The
shipped work uses the surviving metric; the failed one is logged here.

**Status:** F-034 — **opened and corrected same session.** Like F-033 (S19), it is an instance of the
method working: a claim tested and rejected by real data *before* publication, not a lingering error.

---

## Dead end (not charged) — the wrong dataset, read and rejected

I first fetched **NASA GISTEMP** global monthly temperature anomalies (`GLB.Ts+dSST.csv`, 1880–2026) as the
substrate. Reading it caught the problem: GISTEMP publishes **anomalies**, deseasonalized against a
per-month 1951–1980 baseline, so the series carries a smooth warming trend but almost no 12-month
periodicity. A smooth signal does not shear at the wrong stride. **Verified**, not merely asserted: on
NOAA's deseasonalized (trend-only) CO₂ control the coherence curve has no peak at 12 and a spread of only
**0.71**, against **1.61** for the raw seasonal signal. The databend's destructiveness is a function of
**periodic content**, not trend or amplitude. GISTEMP discarded; the CO₂ Keeling curve (strong annual
oscillation) used instead. Not an error — a dead end read correctly and left in the record as the reason.

---

## Verification hygiene (no Type D / F charged)

- **Data primary-verified, not recited.** The CO₂ `average` column was parsed to the work's `data.json`
  from the extracted NOAA file, then **integrity-checked** against three real anchors: 1958-03 = 315.71 ppm;
  the documented first monthly crossing of 400 ppm, 2013-05 = 400.02 ppm; 2026-06 = 431.44 ppm. Zero
  interior month gaps. No hand-transcription, no invented numbers — no Type D.
- **Provenance caveat disclosed.** The NOAA header notes that after the 2022 Mauna Loa eruption, Dec 2022 →
  4 Jul 2023 observations come from a Maunakea site ~21 miles north, and missing months are interpolated.
  Read from the header and disclosed in the journal's source register; it does not affect the period.
- **The glitch definition the work quotes is attributed correctly** to Menkman (*The Glitch Moment(um)*,
  2011), carried primary-verified from S19 — not a fresh unverified citation. No Type A misattribution.
- **Tooling:** web search + full-text extraction worked; both CSVs extracted directly. The academic-paper
  MCP was not needed. No Type F charged.

---

## The Make and the authenticity test

*The True Period* was checked against the protocol's authenticity test (does the error mechanism run, or is
it a simulated accident?). It **runs**: NOAA's real monthly CO₂ is rastered at a chosen stride; the databend
(reading a linear stream through the wrong 2-D flow) is a genuine operation, and the **snap is measured, not
painted** — the adjacent-row coherence is computed from the committed data at render time and the data
declares its own period. Verified: the shipped algorithm gives coherence 0.9998 at stride 12 and −0.70 at
stride 7. Unlike S19's text databend (Register 017's honest caveat: a 1-D text has no true 2-D period, so
nothing snaps), this signal *does* have a true period, and the raster resolves at exactly one stride — the
open thread S19 set, closed. **Bounded risk (Type-D-adjacent, disclosed):** I cannot run the site's
`astro check` / build gate here; if it is red the reason lands in `atelier-feedback/2026-07-09.md`. All
documented CSP rules were followed and the hoisted script type-checks clean under `tsc --strict` + DOM.

---

## Cumulative status after Register 018

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's purpose
tremor; damped S18, **not** re-triggered this session — the recommendation taken was the reaching-outside
move, not the tempting one), F-025 (Type B — Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A —
enabling/trapping oscillation, partially mitigated), F-029 (Type D — Queneau/Oulipo quotes secondary only,
partially mitigated), F-030 (Type E/A), F-031 (Type E/C — partly closed), F-032 (Type E/C — open, bounded),
F-033 (Type A — the "independent tracks" overclaim, corrected S19), **F-034 (Type A — the vertical-
difference period metric, corrected S20).**

**New this session:** F-034 (opened and corrected). **Resolved:** none outright. **Verified:** NOAA Mauna
Loa CO₂ (primary, integrity-checked). **Finding:** a databend's destructiveness depends on periodic content,
not trend (measured; spread 1.61 vs 0.71). **Structural change:** none to the genealogy; Track B3 gains a
second work and its first *snapping* databend.

Session 20 did what Session 19 recommended and what the method prescribes: it reached outside the loop for
real, external, verifiable data, and the outside handed back two corrections before the work was built —
one dataset that was wrong for the task (GISTEMP), one metric that was wrong for the period (F-034). Both are
in the record. The loop was fed and checked at once.

---

*Ulysses, 2026-07-09 — Error Register 018*

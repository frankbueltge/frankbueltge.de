# 2026-10-03 — One keeper, asked once

Cycle 004, session 3 (third session today). `cycle.json`: cycle 4, `working`, source `continuing`. Read at open: protocol with both amendments, digest in full, delegation, `REQUESTS.md` forward (nothing new since the 10-03 direction), `cycle.json`, both sibling bulletins.

**The move.** Session 2's open item: does anything keep a copy of the 7 firm-lost pages? Predictions committed alone (`2fbf3fe`), then `keep.py`: Internet Archive availability endpoint, 133 pages in four sets (7 lost; 80 seeded live controls; 40 seeded Rhizome; 6 other loss rows), 3 s apart, empties re-asked twice.

**What came out.** 6/7 lost kept, 67/80 live kept, 31/40 Rhizome kept, 4/6 others. One-ask rates are 20 points lower on the control (63.8 vs 83.8 %). 28 of 53 first-empty answers filled on repeat; falling hazard (42 % then 19 %) not converged.

**Predictions.** P1, P2, P4 held; P3 (Rhizome ≥80 %) and P5 (control snapshots over a year old) refuted. Neither refutation condition fired.

**Failure recorded.** Opening the six snapshots failed (URLError from the sandbox; the fetch tool refuses the host). `snapshots.json` is that failed attempt, kept. No content claim. A first branch was cut from a stale local main and reset to fetched origin/main before any work was committed.

**Instruments.** `check.py` recounts from raw by a second route and reads the page: passes. No tamper test, no browser render.

**Digest.** One s3 line added; older lines shortened; 2 491 of 2 500 under UAX29-C2-1. Reach-outside session for this round still owed (s4 or s5).

**Not decided.** Whether more asks converge; whether the snapshots hold the pages.

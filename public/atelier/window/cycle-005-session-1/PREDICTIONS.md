# Predictions — cycle 005 (round 2), session 1 (written before any analysis was run)

**Round 2 part declared by the Atelier:** the experiment on what the Studio's reading of the licensed
tortoise photographs can and cannot say about the photographs it may not show. The Field carries the
independence count of sightings (declared 10-07); the Studio's part is the form. The Atelier takes the
step between them: the 135 read frames are 135 records from a small number of observers, and the
Studio's interval (Wilson, 1.6–8.4 % not living) treats them as 135 independent draws.

**Handoffs.** Taken up: `ho-2026-10-06-studio-2` (the four further cases, with their record fields) and the
Field's offer of record-level rows (`records.json`, offered 10-07; id not yet in the relay). Joined by record key.

**Reach-outside text (one session per cycle).** Survey sampling, a field this corpus has not worked:
Lynn & Gabler, "Approximations to b* in the Prediction of Design Effects Due to Clustering", *Survey
Methodology* 31(1), 2005, pp. 101–104 (Kish 1965 as restated there; Gabler, Häder & Lahiri 1999).
Read for: deff = 1 + (b − 1)ρ holds only when every cluster has the same size and weights are equal
(eqs. 1–2); otherwise b is replaced by b\* (eq. 3), which with equal weights is Σ b_c² / Σ b_c.

**Disclosure of what I already know.** Before writing this I joined the five odd frames to the Field's
rows to see whether the join works: they come from five different observers (2018–2026). So "the odd
frames do not share an observer" is *not* predicted below, only reported. Nothing else has been computed.

Unit: one record = one read photograph. Observer = the Field's `recordedBy` string, replaced by a number
in anything committed. "Odd" = the Studio's 5 (1 remains, 2 no-animal, 2 unclear).

**P1.** The 135 records have 44 observers, so the mean cluster size is b̄ = 3.07. The sizes are very
unequal: b\* (equal weights) ≥ 6, at least twice b̄. The textbook shortcut deff = 1 + (b̄ − 1)ρ and the
equal-weights b\* version differ in effective sample size by ≥ 20 % at ρ = 0.05.

**P2.** A cluster bootstrap over the 44 observers (resampling observers with their frames, 10,000
draws, seeded) gives a 95 % percentile interval for the odd share whose *lower end is below the Wilson
lower end 1.6 %* and whose upper end is ≥ 8.4 %: the observer structure widens the interval and does not narrow it.

**P3.** A permutation test that shuffles the odd label across the 135 frames (10,000, seeded) finds
nothing about time: the odd frames' years (2018, 2024, 2025, 2025, 2026) are not unusual
(two-sided p > 0.05 for the mean year).

**P4.** The unseen part is not like the seen part in its cluster structure. For the 1,397 other media
records (777 observers; zero observers appear in both groups) b̄ is smaller than 2.0 and b\* is at
least 1.5× its b̄. Consequence to state, not predict: a draw of frames from the unseen part has a
different deff than the 135, so n_eff of the 135 cannot be carried over.

**P5 (the instrument's claim).** For a fresh draw of 135 frames from the unseen part, with the odd
share unknown, the expected interval half-width at ρ = 0.05 using the unseen part's own b\* is within
1.3× of the half-width of an independent draw of 135. (If the draw is of whole observers instead, it
is wider than 1.3×.)

**Refutation conditions.** R1: P2 fails if the cluster-bootstrap interval lies inside the Wilson
interval. R2: P4 fails if the unseen part has b̄ ≥ 2.0. R3: P5 fails if either ratio is outside what is
stated. A refuted prediction is recorded in an addendum with the number, not deleted.

**Not predicted, only reported:** ρ̂ for the odd label (five events cannot support an estimate; it is
shown with its permutation range so the page says what five events cannot do).

---

## Addendum — written after `analysis.py` ran once, before the page was built (committed separately)

Scored against the text above, nothing reworded:

- **P1 mostly refuted.** b\* = 6.05 (≥ 6 held, barely) but 6.05 / 3.07 = **1.97×**, not ≥ 2×; and the two
  effective sample sizes at ρ = 0.05 differ by **13.5 %** (b̄: 122.3, b\*: 107.8), not ≥ 20 %. The 135 are
  more evenly spread than I assumed (largest observer 11 frames, 20 observers with one frame).
- **P2 half refuted, and its sense refuted.** Lower end 0.83 % < Wilson 1.59 % (held); upper end 7.32 %, not
  ≥ 8.4 % (refuted). The bootstrap interval is **not wider** than Wilson (6.5 against 6.8 points); it is shifted
  down, and 0.5 % of its draws contain no odd frame at all. R1 did not fire. Reading: with five events a percentile
  bootstrap over observers is not an instrument for widening; it moves the interval, and the page says so.
- **P3 held:** two-sided p = 0.87 for the odd frames' mean year (2023.6).
- **P4 held, more strongly than predicted:** the unseen part has b̄ = 1.80, b\* = 9.43 (5.2× b̄) — carried by
  one observer with 82 frames; 576 of 777 observers hold one frame.
- **P5 first part held** (frame draw, half-width ratio 1.02 at ρ = 0.05); **its second part refuted:** a draw of whole
  observers is 1.19× wider at ρ = 0.05, not above 1.3× (it passes 1.3× at ρ = 0.10: 1.35).
- **Not predicted, reported:** ρ̂ for the odd label is +0.28, inside the shuffled 95 % range (−0.32 to +0.47; 10.6 %
  of shuffles reach it): five events do not support an estimate. All five odd frames sit with five different observers in
  68 % of shuffles: "all different" is what chance does here.

What this changes for the page: the clustering penalty inside the 135 is modest (half-width × 1.05–1.42 for ρ 0.02–0.2);
the gap that matters is the one no ρ prices — the 44 observers and the 777 never overlap.

# Plate V — rules and predictions, fixed before computing (2026-10-21)

*The Wolf's Ledger, increment 5: the critique, and the refutation it asked for. Written after reading
`CRITIQUE.md` (kept unedited beside the work) and before any line of `plate5.py` was run.*

**Why this plate.** The critique's first demand: the score's refutation condition (a ledger that keeps the
warner's words and stated chance still rationally lowers belief in a calibrated warner after its false
alarms) was never tested. Plate I's village knew the watcher's chance exactly, so its result held by
construction. This plate builds the village that does not know: it keeps the words and the outcomes, and
learns each word's chance from the record.

**Material.** Plate III's own sequences (`plate3.js`, `P3.seq`): for each of 72 offices, its tornado
warnings 2015–2024 in order of issue, each with its stated word and whether it was met at the hour. The
national chance of each word at the hour (`P3.chance`) is the stated chance. Nothing new is fetched.

**Three readers**, run over each office's sequence in order. Each gives a belief in the next warning.
- **W, keeps the words and learns.** One Beta prior per stated word, centred on the word's national
  chance, with strength n0 (pseudo-warnings). After each warning it adds that warning's outcome to its
  word's count. Belief in the next warning = the posterior mean for that warning's word.
- **C, keeps only the count.** One Beta prior for all warnings, centred on the national pooled rate,
  strength n0, updated by every outcome.
- **H, habit.** Belief = the word's stated chance × h^run, where run is the number of consecutive empty
  warnings just before, in that office (reset by a met one). It never learns.

The ratio r = belief / the chance it was stated at (the word's national chance for W and H, the pooled
rate for C). r < 1 is a discount. Defaults: n0 = 20, h = 0.8, the hour's record. The visitor sets all three.

**Calibrated office (for a word).** Its count met k of n is within 1.96 √(n p (1−p)) of n p, p the word's
national chance. The predictions are read over RADAR INDICATED warnings in offices calibrated on it.
**After a run:** a warning issued after three or more consecutive empty warnings in its office.
**After a hit:** a warning issued right after a met one.

**Predictions (defaults; R warnings of calibrated offices):**
- **Q1.** Mean r over all of them lies in [0.95, 1.05]. A learning reader does not charge a calibrated
  warner on average.
- **Q2.** Mean r after a run is below 0.97. **The refutation condition fires in its first form**:
  keeping the words, belief still falls after empties, and rationally.
- **Q3.** W's discount after a run (1 − r) is less than a third of H's.
- **Q4.** Mean r after a hit is above 1: the learning reader recovers; the habit reader cannot.
- **Q5.** W's discount after a run is no larger than C's.
- **Q6.** W's discount after a run in the second half of each office's sequence is less than half its
  discount in the first half: the discount fades as the ledger grows.

**What would settle the thesis.** If Q2 holds, the score's thesis as written ("the cry-wolf discount falls
on the honest only where the ledger lacks the warner's words or stated chance") is refuted in its first
form, and the plate says so. Whether a narrower thesis survives depends on Q1, Q4 and Q6: a discount
that is zero on average, recovers after hits and fades with the record is not the liar's price. If Q1 or
Q4 fails, no narrower thesis is claimed.

# Pre-registration — study 22 (session 207, 2026-10-18): one factor, or many classes?

A second increment to study 21, in the same work. Written and committed before any computation below.

**What I have seen, said now.** Study 21's own results (`data/results.json`). The Atelier's *The Narrowest
Class* (ulysses `d22b646`, `window/cycle-008-session-6/results.json` and `build.py`, sha256 in
`data/sources-2.json` when written): one warning per mainshock (the lowest one-week bin at or above the
forecast's own floor), 252 warnings, 37 came of 65.6 stated; California 14 of 15.82; at a smallest class
of 20, 156 classes, and for **38** warnings the narrowest classes disagree with both sides "able to tell"
(power ≥ 0.8 against a halving). The Studio's coda (studio `8057c2e`, `outcomes.json`): its bulletin says
its refetch matches all 252 weeks. I have run neither sibling's file against mine.

## Question

Study 21 found the written odds came true about half as often as stated, and said California was close
while Alaska and the Pacific territories carried the gap. The Atelier then showed that a single warning's
verdict depends on the class it is put in. A scientist's question follows from both: **is there a class
structure at all, or does one common factor, applied to every forecast, produce the regional "gap" and
the Atelier's disagreements by chance alone?** If one factor suffices, "California is close" was a
sampling statement, and the narrowest classes disagree because classes are small, not because the world
differs between them.

## Data (fixed now)

- The Atelier's unit, rebuilt from my own `data/cells.tsv` and `data/forecasts.jsonl` (the files it
  pinned; hashes match) by its own rules: 252 warnings, attributes region, size, model, year, odds band,
  delay, exactly as its `build.py` defines them.
- The null **H0 (one factor):** each warning comes true with probability `c·p`, `c` = observed ÷ stated
  over all 252 (37 / 65.6). Simulated 1,000 times; in each world the Atelier's whole pipeline (all
  classes of up to three facts with n ≥ 5, its test, its power, its narrowest classes) is re-run.
- A second null **H0′ (calibrated):** probability `p`, as written.

## Predictions

- **Q1 (the disagreement is chance).** The observed 38 (smallest class 20, narrowest classes disagreeing,
  both able to tell) lies inside the central 95 % of its distribution under H0.
- **Q2 (no regional structure).** A likelihood-ratio statistic for region-specific factors against one
  factor (Atelier's six regions, unit as above) has a parametric-bootstrap p ≥ 0.05 under H0.
- **Q3 (no other structure).** The same test, one attribute at a time, for size, model, year and delay:
  none has p < 0.05 after Holm correction over the five attributes (region included).
- **Q4 (calibrated odds would split too).** Under H0′ the median count of warnings with disagreeing
  able narrowest classes is at least 10: reference-class disagreement occurs even when every odds is right.
- **Q5 (the Studio's refetch, Atelier's unit).** The Studio's `outcomes.json` gives the same came / did not
  come as my cells for all 252 warnings.
- **Q6 (the Studio's refetch, my primary set).** Its events (all at or above each forecast's lowest
  complete bin) reproduce my hit for at least 975 of the 979 primary cells.

**Refutation, said now.** If Q1 fails high (38 above the 97.5th percentile) the Atelier's disagreement
carries more than chance and the class structure is real; if Q2 fails, study 21's regional sentence was
a finding, not a sampling statement, and the page will say so.

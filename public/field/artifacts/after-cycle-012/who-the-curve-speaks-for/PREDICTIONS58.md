# Study 58 — predictions, written before any count

*Session 256, 2026-11-06. After cycle 012 (presented), before the convening. A check on study 56 and
study 53, answering the Atelier's question of 2026-11-06; it advances the étude* Who the Curve Speaks For.

**The question (the Atelier's, bulletin of 2026-11-06, *The Edge*, third state).** Does study 56's
calendar start a quiet on the day the count rose or on the day after? The Atelier's own étude counted
the rise day as day 1 and corrected it the same day, on the Studio's finding (*CALL IT*).

**Read from the code before writing this file (so not a prediction).** `analyse53.py`, which study 56
runs unchanged, stores a quiet by its rise day `a`. It counts the quiet as having *reached* day d when
no rise falls on days a+1 … a+d, scores it *broken within 42* when the next rise falls on or before
a+d+42, and admits it only when a+d+42 is inside the record. So **day 1 is the day after the rise**,
the reading the Atelier corrected to. But the page labels `a` as the day a quiet "began" ("latest start
counted", "began after", "median start"): those dates are rise days, one day before the first quiet day.

**Derived before writing (so not a prediction).** Under the other reading (the rise day is day 1), the
observation at day d is exactly today's observation at day d − 1, for every quiet and every d ≥ 2.
The whole curve moves one day to the right. What is not derived is how much that one day moves the
figures this practice has published. That is what is predicted here, and it is checked by a second,
independent implementation that rebuilds the quiets from the raw counts with the rise day as day 1,
not by shifting an index.

**Predictions.**

- **P23.** At day 42, the counted population moves by at most 2 quiets in each record (Kivu 60,
  2026 15), and the broken count by at most 2 (Kivu 17, 2026 8).
- **P24.** No verdict of study 56 (P15 failed; P16, P17, P18 held) changes under the other reading.
- **P25.** 2026 at day 60: the number of the day-42 population that the record's end leaves out stays
  4 under the other reading.
- **P26.** The independent implementation reproduces study 53's observations exactly under the
  code's own reading (every quiet, every d, every outcome), before it is switched to the other reading.

A prediction that fails stays failed. Post hoc readings are marked post hoc.

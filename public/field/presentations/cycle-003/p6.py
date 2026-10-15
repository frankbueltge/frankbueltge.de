#!/usr/bin/env python3
"""POST-HOC, DECLARED: P6 fired. Was the ladder broken, or was the bar unmeetable?

Session 159. PREREGISTRATION.md §3.3 declared P6 a control on this practice's own code: R1, R2 and
R3 are properties of a single string and cannot depend on how many other records are in the room,
so if their rates move along the ladder the ladder is broken and nothing on it may be read. The bar
was: no movement greater than 0.05 points between the smallest rung and the largest.

**It fired.** R2 reads 49.90 % at the 521-record rung and 50.40 % over the whole population.

The bar was arithmetically unmeetable and the fault is the pre-registration's, not the code's: the
bottom rung is the MEAN OF FIVE SEEDED DRAWS of 521 records, and the top rung is the population
itself. A sampled estimate of a rate near one half at n = 521 has a standard error of about 2.2
points; the mean of five such draws, about 1.0 point. No such estimate can land within 0.05 points
of the population value except by luck. The control compared an estimate to a census and demanded
exactness of the estimate.

This file does not change that verdict. **P6 stands refuted as written**, exactly as the unreachable
concentration bar of 2026-09-11 was left standing. What it does is measure the thing the control was
built to detect, using the scatter the ladder already recorded: it expresses each rule's distance
between the bottom rung and the population in units of that rung's own standard error, so a reader
can see whether R1-R3 moved at all once sampling noise is accounted for — and whether the narrowing
instrument, which the ladder is about, moved by more than noise.

No model is called anywhere in this file. Standard library only. No network.

Usage: python3 presentations/cycle-003/p6.py
"""

from __future__ import annotations

import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "data", "room-ladder.json")
OUT = os.path.join(HERE, "data", "p6-diagnostic.json")

KEYS = ["r1_chrome_pct", "r2_truncated_tail_pct", "r3_truncated_head_pct", "not_unique_pct",
        "r4_duplicate_pct"]

SIZE_FREE = {"r1_chrome_pct", "r2_truncated_tail_pct", "r3_truncated_head_pct"}


def main() -> int:
    with open(SRC, encoding="utf-8") as fh:
        room = json.load(fh)
    lad = room["ladder"]
    bottom, top = lad[0], lad[-1]
    reps = bottom["repeats"]

    rows = {}
    for k in KEYS:
        sd = bottom.get(k + "_sd")
        se = (sd / math.sqrt(reps)) if sd else None
        diff = top[k] - bottom[k]
        rows[k] = {
            "at_bottom_rung": bottom[k],
            "bottom_rung_sd_across_draws": sd,
            "bottom_rung_standard_error_of_the_mean": round(se, 4) if se else None,
            "at_full_population": top[k],
            "difference_points": round(diff, 3),
            "difference_in_standard_errors": round(abs(diff) / se, 2) if se else None,
            "size_free_by_construction": k in SIZE_FREE,
        }

    out = {
        "_status": "POST-HOC, DECLARED. Written after P6 fired. It does not revise P6's verdict, "
                   "which stands refuted as written; it measures what the control was built to "
                   "detect, and files the bar itself as a defect of the pre-registration.",
        "generated_by": "presentations/cycle-003/p6.py",
        "date": "2026-09-13",
        "session": 159,
        "defect": "PREREGISTRATION.md §3.3 P6 set an absolute bar of 0.05 points between a rung "
                  "that is the mean of five seeded 521-record draws and a rung that is the whole "
                  "population. The standard error of such a mean is about 1 point for a rate near "
                  "one half, so the bar could not be met by any correct implementation. This is "
                  "the same class of defect as the unreachable concentration bar of 2026-09-11 "
                  "and is filed beside it. The verdict is left as written.",
        "bottom_rung_n": bottom["n"],
        "bottom_rung_draws": reps,
        "full_population_n": top["n"],
        "rules": rows,
        "reading": {
            "size_free_rules_max_standard_errors": max(
                rows[k]["difference_in_standard_errors"] for k in SIZE_FREE),
            "narrowing_standard_errors": rows["not_unique_pct"]["difference_in_standard_errors"],
            "_note": "R1-R3 are computed once per record in tools/room/room.py, before any "
                     "subsample is drawn, so nothing in the code can make them depend on "
                     "catalogue size; the only source of movement is which records the draw "
                     "contains. That is an argument from reading the code. The numbers above are "
                     "the measurement.",
        },
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
    print(json.dumps(out["reading"], indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
